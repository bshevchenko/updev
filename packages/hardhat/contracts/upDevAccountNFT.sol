// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { FunctionsClient } from "@chainlink/contracts/src/v0.8/functions/dev/v1_0_0/FunctionsClient.sol";
import { FunctionsRequest } from "@chainlink/contracts/src/v0.8/functions/dev/v1_0_0/libraries/FunctionsRequest.sol";
import { _LSP8_TOKENID_FORMAT_HASH, _LSP8_TOKEN_METADATA_BASE_URI } from "@lukso/lsp-smart-contracts/contracts/LSP8IdentifiableDigitalAsset/LSP8Constants.sol";

import { LSP8Soulbound } from "./LSP8Soulbound.sol";

// custom LSP4 keys
bytes32 constant _LSP4_ABI_DATA_KEY = 0x4142495f44415441000000000000000000000000000000000000000000000000;
bytes32 constant _LSP4_TIMESTAMP_KEY = 0x54494d455354414d500000000000000000000000000000000000000000000000;
bytes32 constant _LSP4_PROVIDER_KEY = 0x50524f5649444552000000000000000000000000000000000000000000000000;
bytes32 constant _LSP4_VERSION_KEY = 0x56455253494f4e00000000000000000000000000000000000000000000000000;
bytes32 constant _LSP4_ID_KEY = 0x4944000000000000000000000000000000000000000000000000000000000000;

contract upDevAccountNFT is LSP8Soulbound, FunctionsClient {
	using FunctionsRequest for FunctionsRequest.Request;

	struct Request {
		address up;
		string provider; // TODO bytes vs string?
		string version;
		string id;
		string ipfs;
		bytes32 tokenId;
		bool isFulfilled;
		bool isOK;
		bool isClaimed;
		bytes data; // = isOK ? ABI data : err
	}

	event NewSource(string indexed name);
	event Requested(
		bytes32 indexed requestId,
		address indexed up,
		bytes32 indexed tokenId,
		string provider,
		string version,
		string id,
		string ipfs
	);
	event Fulfilled(
		bytes32 indexed requestId,
		address indexed up,
		bytes32 indexed tokenId,
		bool isOK
	);
	event Claimed(
		bytes32 indexed requestId,
		address indexed up,
		bytes32 indexed tokenId
	);

	mapping(string name => string code) public source;
	mapping(bytes32 id => Request) public request;
	mapping(bytes32 tokenId => bytes32 requestId) public requestId;

	mapping(address up => bytes32[] ids) public requests; // TODO just use indexer instead?
	mapping(address up => uint256 num) public pendingNum;

	string[] public sources;

	address router;
	bytes32 donID;
	bool force;
	uint32 gasLimit;

	error SourceNameBusy();
	error AlreadyClaimed();

	/**
	 * @notice Initializes the contract
	 * @param _router Chainlink router address
	 * @param _donID Chainlink DON ID
	 * @param _force When set to false, the to address MUST be a contract that supports the LSP1 UniversalReceiver standard.
	 * @param _gasLimit callback gas limit
	 */
	constructor(
		address _router,
		bytes32 _donID,
		bool _force,
		uint32 _gasLimit
	)
		FunctionsClient(_router)
		LSP8Soulbound(
			"upDev Account NFT",
			"account",
			msg.sender,
			1, // NFT
			_LSP8_TOKENID_FORMAT_HASH
		)
	{
		router = _router;
		donID = _donID;
		force = _force;
		gasLimit = _gasLimit;
	}

	function addSource(
		string memory name, // f.e. github@1.0
		string memory code
	) public onlyOwner {
		if (bytes(source[name]).length != 0) {
			revert SourceNameBusy();
		}
		source[name] = code;
		sources.push(name);
		emit NewSource(name);
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
		address up
	) external view returns (Request[] memory) {
		uint256 total = requests[up].length;
		if (offset >= total) {
			return new Request[](0);
		}
		uint256 num = total - offset;
		if (num > limit) {
			num = limit;
		}
		Request[] memory result = new Request[](num);
		for (uint256 i = 0; i < num; i++) {
			result[i] = request[requests[up][offset + i]];
		}
		return result;
	}

	function getPendingRequests(
		address up
	) external view returns (Request[] memory) {
		uint256 _pendingNum = pendingNum[up];
		Request[] memory result = new Request[](pendingNum[up]);
		uint256 j = 0;
		for (uint256 i = requests[up].length - 1; i >= 0; i--) {
			if (request[requests[up][i]].isClaimed) {
				continue;
			}
			result[i] = request[requests[up][i]];
			j++;
			if (j == _pendingNum) {
				break;
			}
		}
		return result;
	}

	function sendRequest(
		uint64 subscriptionId,
		uint64 donHostedSecretsVersion,
		string calldata provider,
		string calldata version,
		string calldata id,
		string calldata ipfs // hash
	) external returns (bytes32 _requestId) {
		FunctionsRequest.Request memory req;
		req.initializeRequestForInlineJavaScript(
			source[string.concat(provider, "@", version)]
		);
		if (donHostedSecretsVersion > 0) {
			req.addDONHostedSecrets(
				0, // TODO keep slot id hardcoded?
				donHostedSecretsVersion
			);
		}
		string[] memory args = new string[](2);
		args[0] = ipfs;
		args[1] = id;
		req.setArgs(args);

		bytes32 tokenId = keccak256(abi.encodePacked(provider, id));

		_requestId = _sendRequest(
			req.encodeCBOR(),
			subscriptionId,
			gasLimit,
			donID
		);
		request[_requestId] = Request({
			up: msg.sender,
			provider: provider,
			version: version,
			id: id,
			tokenId: tokenId,
			ipfs: ipfs,
			data: "0x",
			isFulfilled: false,
			isOK: false,
			isClaimed: false
		});
		requests[msg.sender].push(_requestId);
		pendingNum[msg.sender]++;

		emit Requested(
			_requestId,
			msg.sender,
			tokenId,
			provider,
			version,
			id,
			ipfs
		);
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
		request[id].isFulfilled = true;
		if (err.length == 0) {
			request[id].isOK = true;
			request[id].data = response;
			requestId[request[id].tokenId] = id;
		} else {
			request[id].data = err;
		}
		emit Fulfilled(
			id,
			request[id].up,
			request[id].tokenId,
			request[id].isOK
		);
	}

	function claim(bytes32 tokenId) public {
		bytes32 id = requestId[tokenId];

		pendingNum[request[id].up]--;

		if (request[id].isClaimed) {
			revert AlreadyClaimed();
		}

		request[id].isClaimed = true;

		emit Claimed(id, request[id].up, tokenId);

		setDataForTokenId(
			tokenId,
			_LSP8_TOKEN_METADATA_BASE_URI,
			bytes(string.concat("ipfs://", request[id].ipfs))
		);
		setDataForTokenId(tokenId, _LSP4_ABI_DATA_KEY, request[id].data);
		setDataForTokenId(
			tokenId,
			_LSP4_TIMESTAMP_KEY,
			abi.encode(block.timestamp)
		);

		if (_exists(tokenId)) {
			if (_tokenOwners[tokenId] != request[id].up) {
				_transfer(
					_tokenOwners[tokenId],
					request[id].up,
					tokenId,
					force,
					request[id].data
				);
			}
			return;
		}

		setDataForTokenId(
			tokenId,
			_LSP4_PROVIDER_KEY,
			bytes(request[id].provider)
		);
		setDataForTokenId(
			tokenId,
			_LSP4_VERSION_KEY,
			bytes(request[id].version)
		);
		setDataForTokenId(tokenId, _LSP4_ID_KEY, bytes(request[id].id));

		_mint(request[id].up, tokenId, force, request[id].data);
	}
}
