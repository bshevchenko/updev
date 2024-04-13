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
 * @title upDevFunctionsConsumer
 */
contract upDevFunctionsConsumer is FunctionsClient, ConfirmedOwner {
	using FunctionsRequest for FunctionsRequest.Request;

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

	mapping(string => string) public source; // name => code
	mapping(bytes32 requiestId => Request) public request;
	mapping(address up => bytes32[] requests) public upRequests;
	mapping(bytes32 tokenId => bytes32 requestId) public token;

	string[] public availableSources;
	IUpDevAccountOwnership public collection;

	address router;
	bytes32 donID;

	uint32 gasLimit = 300000; // TODO increase callback gasLimit to avoid claimToken flow
	// TODO array or mapping to get not claimed tokens (if we won't avoid claimToken flow)

	// Custom error type
	error SourceNameBusy();
	error AlreadyClaimed();

	/**
	 * @notice Initializes the contract with the Chainlink router address and sets the contract owner
	 */
	constructor(
		address _router,
		bytes32 _donID,
		address _collection
	) FunctionsClient(_router) ConfirmedOwner(msg.sender) {
		router = _router;
		donID = _donID;
		collection = IUpDevAccountOwnership(_collection); // TODO do we need to reset collection?
	}

	function addSource(
		string memory name,
		string memory code
	) public onlyOwner {
		if (bytes(source[name]).length != 0) {
			revert SourceNameBusy();
		}
		source[name] = code;
		availableSources.push(name);
	}

	function getAvailableSources() external view returns (string[] memory) {
		string[] memory names = new string[](availableSources.length);
		for (uint32 i = 0; i < availableSources.length; i++) {
			names[i] = availableSources[i];
		}
		return names;
	}

	function getUPRequests( // TODO remove? currently used only for claim flow. other cases could be addressed by an events indexer
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
		string calldata _source,
		string calldata ipfs,
		string calldata id
	) external returns (bytes32 requestId) {
		FunctionsRequest.Request memory req;
		req.initializeRequestForInlineJavaScript(source[_source]);
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
			source: _source,
			id: id,
			tokenId: keccak256(abi.encodePacked(_source, id)),
			ipfs: ipfs,
			data: "0x",
			isFinished: false,
			isOwned: false,
			isClaimed: false
		});
		upRequests[msg.sender].push(requestId); // TODO change to emit event?
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

	// TODO automatically claim tokens for users from our oracle if avoiding of claim flow is not
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
