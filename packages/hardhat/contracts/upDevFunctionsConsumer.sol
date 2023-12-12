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
		bytes data;
		bool isFinished;
		bool isOwned;
		bool isClaimed;
	}

	event Response(
		bytes32 indexed requestId,
		address indexed up,
		bool indexed isOwned,
		string source,
		string id,
		bytes data
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
			"const apiResponse = await Functions.makeHttpRequest({"
			"  url: 'https://api.github.com/graphql',"
			"  method: 'POST',"
			"  headers: {"
			"    'Authorization': `Bearer ${secrets.apiKey}`"
			"  },"
			"  data: {"
			"    query: `{"
			"      user(login: \"${args[1]}\") {"
			"        createdAt"
			"        socialAccounts(last: 5) { nodes { url } }"
			"        followers { totalCount }"
			"        contributionsCollection { contributionCalendar { totalContributions } }"
			"      }"
			"    }`"
			"  },"
			"});"
			"if (apiResponse.error) {"
			"  throw Error('Request failed');"
			"}"
			"if (apiResponse.data.errors) {"
			"  throw Error(JSON.stringify(apiResponse.data.errors));"
			"}"
			"const { user } = apiResponse.data.data;"
			"if (!user.socialAccounts.nodes.some(r => r.url.toLowerCase().includes(args[0].toLowerCase()))) {"
			"  throw Error('URL Not Found');"
			"}"
			"const days = Math.floor(((new Date()) - (new Date(user.createdAt))) / (1000 * 60 * 60 * 24));"
			"const uint32 = (v) => v.toString(16).padStart(64, '0');"
			"const hex = uint32(days) + uint32(user.followers.totalCount) + uint32(user.contributionsCollection.contributionCalendar.totalContributions);"
			"return Uint8Array.from(hex.match(/.{1,2}/g).map(b => parseInt(b, 16)));",
			false
		);
		addSource(
			"buidlguidl",
			"const apiResponse = await Functions.makeHttpRequest({"
			"  url: 'https://buidlguidl-v3.appspot.com/builders/' + args[1],"
			"});"
			"if (apiResponse.error) {"
			"  throw Error('Request failed');"
			"}"
			"const { data } = apiResponse;"
			"if (!data['status'] || !data.status.text.toLowerCase().includes(args[0].toLowerCase())) {"
			"  throw Error('Not Owned');"
			"}"
			"const days = Math.floor(((new Date()) - (new Date(data.creationTimestamp))) / (1000 * 60 * 60 * 24));"
			"const roles = { builder: 1 };"
			"const functions = { cadets: 1 };"
			"const uint32 = v => v.toString(16).padStart(64, '0');"
			"const hex = uint32(days) + uint32(data.builds.length) + uint32(roles[data.role] || 0) + uint32(functions[data.function] || 0);"
			"return Uint8Array.from(hex.match(/.{1,2}/g).map(b => parseInt(b, 16)));",
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
			tokenId: keccak256(abi.encodePacked(sourceName, id)),
			data: "0x",
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
		if (err.length == 0) {
			request[requestId].isOwned = true;
			request[requestId].data = response;
			token[request[requestId].tokenId] = requestId;
		} else {
			request[requestId].data = err;
		}
		emit Response(
			requestId,
			request[requestId].up,
			request[requestId].isOwned,
			request[requestId].source,
			request[requestId].id,
			request[requestId].data
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
			request[id].data,
			request[id].source,
			request[id].id
		);
		request[id].isClaimed = true;
	}

	/**
	 * HELPERS
	 */
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
