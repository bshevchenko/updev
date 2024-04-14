// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { FunctionsClient } from "@chainlink/contracts/src/v0.8/functions/dev/v1_0_0/FunctionsClient.sol";
import { ConfirmedOwner } from "@chainlink/contracts/src/v0.8/shared/access/ConfirmedOwner.sol";
import { FunctionsRequest } from "@chainlink/contracts/src/v0.8/functions/dev/v1_0_0/libraries/FunctionsRequest.sol";

import { upDevAccountNFT } from "./upDevAccountNFT.sol";

/**
 * @title upDevFunctionsConsumer // TODO merge into upDevAccountNFT?
 */
contract upDevFunctionsConsumer is FunctionsClient, ConfirmedOwner {
	using FunctionsRequest for FunctionsRequest.Request;

	struct Request {
		address sender;
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

	mapping(string name => string code) public source;
	mapping(bytes32 id => Request) public request;
	mapping(bytes32 id => bytes32 requestId) public token;

	mapping(address sender => bytes32[] ids) public requests; // TODO replace with events indexer?
	mapping(address sender => uint256 num) public pendingNum;

	string[] public sources;
	upDevAccountNFT nft;

	address router;
	bytes32 donID;
	bool force;
	uint32 gasLimit;

	// Custom error type
	error SourceNameBusy();
	error AlreadyClaimed();

	/**
	 * @notice Initializes the contract
	 * @param _router Chainlink router address
	 * @param _donID Chainlink DON ID
	 * @param _nft upDevAccountNFT contract address
	 * @param _force When set to false, the to address MUST be a contract that supports the LSP1 UniversalReceiver standard.
	 * @param _gasLimit callback gas limit
	 */
	constructor(
		address _router,
		bytes32 _donID,
		address payable _nft,
		bool _force,
		uint32 _gasLimit
	) FunctionsClient(_router) ConfirmedOwner(msg.sender) {
		router = _router;
		donID = _donID;
		nft = upDevAccountNFT(_nft);
		force = _force;
		gasLimit = _gasLimit;
	}

	function addSource(
		string memory name,
		string memory code
	) public onlyOwner {
		if (bytes(source[name]).length != 0) {
			revert SourceNameBusy();
		}
		source[name] = code;
		sources.push(name);
	}

	function getSources() external view returns (string[] memory) {
		string[] memory names = new string[](sources.length);
		for (uint32 i = 0; i < sources.length; i++) {
			names[i] = sources[i];
		}
		return names;
	}

	function getRequests(
		uint256 offset,
		uint256 limit,
		address sender
	) external view returns (Request[] memory) {
		uint256 total = requests[sender].length;
		if (offset >= total) {
			return new Request[](0);
		}
		uint256 num = total - offset;
		if (num > limit) {
			num = limit;
		}
		Request[] memory result = new Request[](num);
		for (uint256 i = 0; i < num; i++) {
			result[i] = request[requests[sender][offset + i]];
		}
		return result;
	}

	function getPendingRequests(
		address sender
	) external view returns (Request[] memory) {
		uint256 _pendingNum = pendingNum[sender];
		Request[] memory result = new Request[](pendingNum[sender]);
		uint256 j = 0;
		for (uint256 i = requests[sender].length - 1; i >= 0; i--) {
			if (request[requests[sender][i]].isClaimed) {
				continue;
			}
			result[i] = request[requests[sender][i]];
			j++;
			if (j == _pendingNum) {
				break;
			}
		}
		return result;
	}

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
			sender: msg.sender,
			source: _source,
			id: id,
			tokenId: keccak256(abi.encodePacked(_source, id)),
			ipfs: ipfs,
			data: "0x",
			isFinished: false,
			isOwned: false,
			isClaimed: false
		});
		requests[msg.sender].push(requestId);
		pendingNum[msg.sender]++;
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

	function claimToken(bytes32 tokenId) external {
		bytes32 id = token[tokenId];
		if (request[id].isClaimed) {
			revert AlreadyClaimed();
		}
		nft.mint(
			request[id].sender,
			id,
			force,
			request[id].data,
			request[id].source,
			request[id].id,
			request[id].ipfs
		);
		pendingNum[request[id].sender]--;
		request[id].isClaimed = true;
	}
}
