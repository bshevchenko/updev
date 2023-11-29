// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { FunctionsClient } from "@chainlink/contracts/src/v0.8/functions/dev/v1_0_0/FunctionsClient.sol";
import { ConfirmedOwner } from "@chainlink/contracts/src/v0.8/shared/access/ConfirmedOwner.sol";
import { FunctionsRequest } from "@chainlink/contracts/src/v0.8/functions/dev/v1_0_0/libraries/FunctionsRequest.sol";

import { upDevAccountOwnership } from "./upDevAccountOwnership.sol";

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
		bool isAddressId;
	}

	struct Request {
		address up;
		string source;
		string id;
		bytes32 tokenId;
		bytes tokenData;
		bool isFinished;
		bool isOwned;
		bool isClaimed;
	}

	event Response(
		bytes32 indexed requestId,
		address indexed up,
		bool indexed isOwned,
		string source,
		string id
	);

	mapping(string => Source) public source;
	mapping(bytes32 requiestId => Request) public request;
	mapping(address up => bytes32[] requests) public upRequests;
	mapping(bytes32 tokenId => bytes32 requestId) public token;

	// TODO array or mapping to get not claimed tokens

	string[] public availableSources;
	upDevAccountOwnership public collection;

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
		addSource(
			"github",
			"const upAddress = args[0].toLowerCase();"
			"const username = args[1];"
			"const apiResponse = await Functions.makeHttpRequest({"
			"  url: `https://api.github.com/users/${username}/social_accounts`,"
			"  headers: secrets.apiKey ? {"
			"    'Authorization': `Bearer ${secrets.apiKey}`"
			"  } : {},"
			"});"
			"if (apiResponse.error) {"
			"  throw Error('Request failed');"
			"}"
			"const { data } = apiResponse;"
			"const urlFound = data.some(row => row.url.toLowerCase().includes(upAddress));"
			"return Functions.encodeUint256(urlFound ? 1 : 0);",
			false
		);
		addSource(
			"buidlguidl",
			"const upAddress = args[0].toLowerCase();"
			"const id = args[1];"
			"const apiResponse = await Functions.makeHttpRequest({"
			"  url: `https://buidlguidl-v3.appspot.com/builders/${id}`,"
			"});"
			"if (apiResponse.error) {"
			"  throw Error('Request failed');"
			"}"
			"const { data } = apiResponse;"
			"return Functions.encodeUint256(data['status'] && data.status.text.toLowerCase().includes(upAddress) ? 1 : 0);",
			true
		);
		// TODO addSource buidlbox
		// TODO addSource twitter
	}

	function setCollection(address payable _collection) public onlyOwner {
		collection = upDevAccountOwnership(_collection);
	}

	function addSource(
		string memory name,
		string memory code,
		bool isAddressId
	) public onlyOwner {
		if (source[name].id != 0) {
			revert SourceNameBusy();
		}
		source[name] = Source({
			id: uint16(availableSources.length),
			name: name,
			code: code,
			isAddressId: isAddressId
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

	function getUPRequests(address up) external view returns (Request[] memory) {
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
		address up,
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
		args[0] = toAsciiString(up);
		args[1] = id;
		req.setArgs(args);

		requestId = _sendRequest(
			req.encodeCBOR(),
			subscriptionId,
			gasLimit,
			donID
		);
		request[requestId] = Request({
			up: up,
			source: sourceName,
			id: id,
			tokenId: keccak256(abi.encodePacked(sourceName, id)), // TODO encode on claim?
			tokenData: abi.encode(sourceName, id),
			isFinished: false,
			isOwned: false,
			isClaimed: false
		});
		upRequests[up].push(requestId);
	}

	/**
	 * @notice Callback function for fulfilling a request
	 * @param requestId The ID of the request to fulfill
	 * @param response The HTTP response data
	 * @param err Any errors from the Functions request
	 */
	function fulfillRequest(
		bytes32 requestId,
		bytes memory response,
		bytes memory err
	) internal override {
		request[requestId].isFinished = true;
		if (isTrue(response)) {
			request[requestId].isOwned = true;
			token[request[requestId].tokenId] = requestId;
		}
		emit Response(
			requestId,
			request[requestId].up,
			request[requestId].isOwned,
			request[requestId].source,
			request[requestId].id
		);
	}

	function claimToken(bytes32 tokenId) external {
		bytes32 id = token[tokenId];
		if (request[id].isClaimed) {
			revert AlreadyClaimed();
		}
		collection.mint(
			request[id].up,
			request[id].tokenId,
			false,
			request[id].tokenData
		);
		request[id].isClaimed = true;
	}

	/**
	 * HELPERS
	 */
	bytes32 targetPattern =
		0x0000000000000000000000000000000000000000000000000000000000000001;
	bytes targetBytes = abi.encodePacked(targetPattern);

	function isTrue(bytes memory input) internal view returns (bool) {
		return
			input.length == targetBytes.length &&
			keccak256(input) == keccak256(targetBytes);
	}

	function toAsciiString(address x) internal pure returns (string memory) {
		bytes memory s = new bytes(40);
		for (uint i = 0; i < 20; i++) {
			bytes1 b = bytes1(uint8(uint(uint160(x)) / (2 ** (8 * (19 - i)))));
			bytes1 hi = bytes1(uint8(b) / 16);
			bytes1 lo = bytes1(uint8(b) - 16 * uint8(hi));
			s[2 * i] = char(hi);
			s[2 * i + 1] = char(lo);
		}
		return string(s);
	}

	function char(bytes1 b) internal pure returns (bytes1 c) {
		if (uint8(b) < 10) return bytes1(uint8(b) + 0x30);
		else return bytes1(uint8(b) + 0x57);
	}
}
