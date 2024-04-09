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

	event Response(
		bytes32 indexed requestId,
		address indexed up,
		bool indexed isOwned,
		string source,
		string id,
		string ipfs,
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
			"twitter",
			"const twitter = await Functions.makeHttpRequest({"
			"  url: 'https://api.twitter.com/2/users/me?user.fields=created_at,description,location,most_recent_tweet_id,pinned_tweet_id,profile_image_url,protected,public_metrics,url,verified,verified_type,withheld',"
			"  method: 'GET',"
			"  headers: {"
			"    'Authorization': `Bearer ${secrets.token}`"
			"  }"
			"});"
			"if (twitter.error) {"
			"  throw Error('Twitter fail');"
			"}"
			"const ipfs = await Functions.makeHttpRequest({"
			"  url: 'https://gateway.pinata.cloud/ipfs/' + args[0],"
			"  method: 'GET'"
			"});"
			"if (ipfs.error) {"
			"  throw Error('IPFS fail');"
			"}"
			"if (twitter.data.data.username !== args[1] || ipfs.data.username !== args[1]) {"
			"  throw Error('Username fail ' + twitter.data.data.username + ' ' + ipfs.data.username + ' ' + args[1]);"
			"}"
			// TODO throw error if twitter.data.data != ipfs.data. allow some % of divergence in ?.data.public_metrics
			"return Functions.encodeUint256(1);"
		);
		// TODO refactor other sources
		// addSource(
		// 	"github",
		// 	"const apiResponse = await Functions.makeHttpRequest({"
		// 	"  url: 'https://api.github.com/graphql',"
		// 	"  method: 'POST',"
		// 	"  headers: {"
		// 	"    'Authorization': `Bearer ${secrets.apiKey}`"
		// 	"  },"
		// 	"  data: {"
		// 	"    query: `{"
		// 	"      user(login: \"${args[1]}\") {"
		// 	"        createdAt"
		// 	"        socialAccounts(last: 5) { nodes { url } }"
		// 	"        followers { totalCount }"
		// 	"        contributionsCollection { contributionCalendar { totalContributions } }"
		// 	"      }"
		// 	"    }`"
		// 	"  },"
		// 	"});"
		// 	"if (apiResponse.error) {"
		// 	"  throw Error('Request failed');"
		// 	"}"
		// 	"if (apiResponse.data.errors) {"
		// 	"  throw Error(JSON.stringify(apiResponse.data.errors));"
		// 	"}"
		// 	"const { user } = apiResponse.data.data;"
		// 	"if (!user.socialAccounts.nodes.some(r => r.url.toLowerCase().includes(args[0].toLowerCase()))) {"
		// 	"  throw Error('URL Not Found');"
		// 	"}"
		// 	"const created = Math.floor((new Date(user.createdAt)).getTime() / 86400000);"
		// 	"const uint32 = (v) => v.toString(16).padStart(64, '0');"
		// 	"const hex = uint32(created) + uint32(user.followers.totalCount) + uint32(user.contributionsCollection.contributionCalendar.totalContributions);"
		// 	"return Uint8Array.from(hex.match(/.{1,2}/g).map(b => parseInt(b, 16)));",
		// 	false
		// );
		// addSource(
		// 	"buidlguidl",
		// 	"const apiResponse = await Functions.makeHttpRequest({"
		// 	"  url: 'https://buidlguidl-v3.appspot.com/builders/' + args[1],"
		// 	"});"
		// 	"if (apiResponse.error) {"
		// 	"  throw Error('Request failed');"
		// 	"}"
		// 	"const { data } = apiResponse;"
		// 	"if (!data['status'] || !data.status.text.toLowerCase().includes(args[0].toLowerCase())) {"
		// 	"  throw Error('Not Owned');"
		// 	"}"
		// 	"const created = Math.floor(data.creationTimestamp / 86400000);"
		// 	"const roles = { builder: 1 };"
		// 	"const functions = { cadets: 1 };"
		// 	"const uint32 = v => v.toString(16).padStart(64, '0');"
		// 	"const hex = uint32(created) + uint32(data.builds.length) + uint32(roles[data.role] || 0) + uint32(functions[data.function] || 0);"
		// 	"return Uint8Array.from(hex.match(/.{1,2}/g).map(b => parseInt(b, 16)));",
		// 	true
		// );
		// TODO addSource buidlbox
		// TODO addSource twitter
	}

	function setCollection(address payable _collection) public onlyOwner {
		collection = upDevAccountOwnership(_collection);
	}

	function addSource(
		string memory name,
		string memory code
	) public onlyOwner {
		if (source[name].id != 0) {
			revert SourceNameBusy();
		}
		source[name] = Source({
			id: uint16(availableSources.length),
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
		upRequests[msg.sender].push(requestId);
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
			request[requestId].ipfs,
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
}
