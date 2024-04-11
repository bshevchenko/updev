// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { FunctionsClient } from "@chainlink/contracts/src/v0.8/functions/dev/v1_0_0/FunctionsClient.sol";
import { ConfirmedOwner } from "@chainlink/contracts/src/v0.8/shared/access/ConfirmedOwner.sol";
import { FunctionsRequest } from "@chainlink/contracts/src/v0.8/functions/dev/v1_0_0/libraries/FunctionsRequest.sol";

interface IUpDevAccountOwnership {
    function mint(
        address to,
        bytes32 tokenId,
        bool force,
        bytes memory data,
        string memory source,
        string memory id,
        string memory ipfs
    ) external;
}

/**
 * Request testnet LINK and ETH here: https://faucets.chain.link/
 * Find information on LINK Token Contracts and get the latest ETH and LINK faucets here: https://docs.chain.link/resources/link-token-contracts/
 */

/**
 * @title upDevFunctionsConsumer
 * @dev This contract uses hardcoded values and should not be used in production.
 */
contract upDevFunctionsConsumer is FunctionsClient, ConfirmedOwner {
	using FunctionsRequest for FunctionsRequest.Request;

	struct Source {
		uint16 id;
		string name;
		string code;
	}

	struct Request {
		address up;
		string source;
		string id;
		string ipfs;
		bytes32 tokenId;
		bytes data;
		bool isFinished;
		bool isOwned;
		bool isClaimed;
	}

	event Response(bytes32 indexed requestId, Request request);

	mapping(string => Source) public source;
	mapping(bytes32 requiestId => Request) public request;
	mapping(address up => bytes32[] requests) public upRequests;
	mapping(bytes32 tokenId => bytes32 requestId) public token;

	// TODO array or mapping to get not claimed tokens

	string[] public availableSources;
	IUpDevAccountOwnership public collection;

	// Router address - Hardcoded for Mumbai
	// Check to get the router address for your supported network https://docs.chain.link/chainlink-functions/supported-networks
	address router = 0x6E2dc0F9DB014aE19888F539E59285D2Ea04244C;

	// Callback gas limit TODO
	uint32 gasLimit = 300000;

	// donID - Hardcoded for Mumbai
	// Check to get the donID for your supported network https://docs.chain.link/chainlink-functions/supported-networks
	bytes32 donID =
		0x66756e2d706f6c79676f6e2d6d756d6261692d31000000000000000000000000;

	// Custom error type
	error SourceNameBusy();
	error AlreadyClaimed();

	/**
	 * @notice Initializes the contract with the Chainlink router address and sets the contract owner
	 */
	constructor(
		address payable _collection
	) FunctionsClient(router) ConfirmedOwner(msg.sender) {
		setCollection(_collection);
	}

	function setCollection(address payable _collection) public onlyOwner {
		collection = IUpDevAccountOwnership(_collection);
	}

	// TODO disable/remove sources?
	function addSource(
		string memory name, // TODO if name of new source is the same
		string memory code
	) public onlyOwner {
		if (source[name].id != 0) {
			revert SourceNameBusy();
		}
		source[name] = Source({
			id: uint16(availableSources.length) + 1,
			name: name,
			code: code
		});
		availableSources.push(name);
	}

	function getAvailableSources() external view returns (Source[] memory) {
		Source[] memory sources = new Source[](availableSources.length);
		for (uint256 i = 0; i < availableSources.length; i++) {
			sources[i] = source[availableSources[i]];
		}
		return sources;
	}

	function getUPRequests(
		address up
	) external view returns (Request[] memory) {
		uint256 numRequests = upRequests[up].length;
		Request[] memory result = new Request[](numRequests);
		for (uint256 i = 0; i < numRequests; i++) {
			result[i] = request[upRequests[up][i]];
		}
		return result;
	}

	/**
	 * @notice Sends an HTTP request
	 * @return requestId The ID of the request
	 */
	function sendRequest(
		uint64 subscriptionId,
		bytes memory encryptedSecretsUrls,
		uint8 donHostedSecretsSlotID,
		uint64 donHostedSecretsVersion,
		string calldata sourceName,
		string calldata ipfs,
		string calldata id
	) external returns (bytes32 requestId) {
		FunctionsRequest.Request memory req;
		req.initializeRequestForInlineJavaScript(source[sourceName].code);
		if (encryptedSecretsUrls.length > 0)
			req.addSecretsReference(encryptedSecretsUrls);
		else if (donHostedSecretsVersion > 0) {
			req.addDONHostedSecrets(
				donHostedSecretsSlotID,
				donHostedSecretsVersion
			);
		}
		string[] memory args = new string[](2);
		args[0] = ipfs;
		args[1] = id;
		req.setArgs(args);

		requestId = _sendRequest(
			req.encodeCBOR(),
			subscriptionId,
			gasLimit,
			donID
		);
		request[requestId] = Request({
			up: msg.sender,
			source: sourceName,
			id: id,
			tokenId: keccak256(abi.encodePacked(sourceName, id)),
			ipfs: ipfs,
			data: "0x",
			isFinished: false,
			isOwned: false,
			isClaimed: false
		});
		upRequests[msg.sender].push(requestId); // TODO ???
	}

	/**
	 * @notice Callback function for fulfilling a request
	 * @param id The ID of the request to fulfill
	 * @param response The HTTP response data
	 * @param err Any errors from the Functions request
	 */
	function fulfillRequest(
		bytes32 id,
		bytes memory response,
		bytes memory err
	) internal override {
		request[id].isFinished = true;
		if (err.length == 0) {
			request[id].isOwned = true;
			request[id].data = response;
			token[request[id].tokenId] = id;
		} else {
			request[id].data = err;
		}
		emit Response(id, request[id]);
	}

	// TODO automatically claim tokens for users from our oracle
	function claimToken(bytes32 tokenId) external {
		bytes32 id = token[tokenId];
		if (request[id].isClaimed) {
			revert AlreadyClaimed();
		}
		collection.mint(
			request[id].up,
			id,
			true,
			request[id].data,
			request[id].source,
			request[id].id,
			request[id].ipfs
		);
		request[id].isClaimed = true;
	}
}
