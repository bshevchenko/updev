// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { FunctionsClient } from "@chainlink/contracts/src/v0.8/functions/dev/v1_0_0/FunctionsClient.sol";
import { FunctionsRequest } from "@chainlink/contracts/src/v0.8/functions/dev/v1_0_0/libraries/FunctionsRequest.sol";
import { _LSP8_TOKENID_FORMAT_HASH, _LSP8_TOKEN_METADATA_BASE_URI } from "@lukso/lsp-smart-contracts/contracts/LSP8IdentifiableDigitalAsset/LSP8Constants.sol";

import { LSP8Soulbound } from "./LSP8Soulbound.sol";

bytes32 constant _LSP4_DATA_KEY = 0x4441544100000000000000000000000000000000000000000000000000000000;
bytes32 constant _LSP4_TIMESTAMP_KEY = 0x54494d455354414d500000000000000000000000000000000000000000000000;
bytes32 constant _LSP4_PROVIDER_KEY = 0x50524f5649444552000000000000000000000000000000000000000000000000;
bytes32 constant _LSP4_VERSION_KEY = 0x56455253494f4e00000000000000000000000000000000000000000000000000;
bytes32 constant _LSP4_ID_KEY = 0x4944000000000000000000000000000000000000000000000000000000000000;

contract upDevAccountNFT is LSP8Soulbound, FunctionsClient {
	using FunctionsRequest for FunctionsRequest.Request;

	struct Request {
		address up;
		string provider;
		string version;
		string id;
		bytes32 tokenId;
		bool isFulfilled;
		bool isOK;
		bool isClaimed;
		bytes data; // = isOK ? ABI data : err
	}

	event NewSource(string name, string version);
	event Requested(
		bytes32 indexed requestId,
		address indexed up,
		bytes32 indexed tokenId,
		string provider,
		string version,
		string id
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
		bytes32 indexed tokenId,
		bytes data
	);

	mapping(string name => mapping(string version => string code)) public sources;
	mapping(bytes32 requestId => Request) public requests;
	mapping(bytes32 tokenId => bytes32 requestId) public requestIds;

	mapping(address up => string stringUP) public stringUPs;
	mapping(address up => bool) public isStringUPSet;

	address router;
	bytes32 donID;
	bool force;
	uint32 gasLimit;
	uint64 subId;

	error NotAllowed();
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
		uint32 _gasLimit,
		uint64 _subId
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
		subId = _subId;
	}

	function setSubId(uint64 _subId) public onlyOwner {
		subId = _subId;
	}

	function addSource(
		string memory name,
		string memory version,
		string memory code
	) public onlyOwner {
		if (bytes(sources[name][version]).length != 0) {
			revert SourceNameBusy();
		}
		sources[name][version] = code;
		emit NewSource(name, version);
	}

	function sendRequest(
		address up,
		bytes memory encryptedSecretsUrls,
		string calldata provider,
		string calldata version,
		string calldata id
	) external returns (bytes32 reqId) {
		FunctionsRequest.Request memory req;
		req.initializeRequestForInlineJavaScript(
			sources[provider][version]
		);
		if (encryptedSecretsUrls.length > 0) {
			req.addSecretsReference(encryptedSecretsUrls);
		}
		string[] memory args = new string[](2);
		args[0] = id;
		args[1] = getStringUP(up);
		req.setArgs(args);

		bytes32 tokenId = keccak256(abi.encodePacked(provider, id));

		reqId = _sendRequest(
			req.encodeCBOR(),
			subId,
			gasLimit,
			donID
		);
		requests[reqId] = Request({
			up: up,
			provider: provider,
			version: version,
			id: id,
			tokenId: tokenId,
			data: "0x",
			isFulfilled: false,
			isOK: false,
			isClaimed: false
		});

		emit Requested(
			reqId,
			up,
			tokenId,
			provider,
			version,
			id
		);
	}

	/**
	 * @notice Callback function for fulfilling a request
	 * @param reqId The ID of the request to fulfill
	 * @param response The HTTP response data
	 * @param err Any errors from the Functions request
	 */
	function fulfillRequest(
		bytes32 reqId,
		bytes memory response,
		bytes memory err
	) internal override {
		Request storage req = requests[reqId];
		req.isFulfilled = true;
		if (err.length == 0) {
			req.isOK = true;
			req.data = response;
			requestIds[req.tokenId] = reqId;
		} else {
			req.data = err;
		}
		emit Fulfilled(
			reqId,
			req.up,
			req.tokenId,
			req.isOK
		);
	}

	function claim(bytes32 tokenId) public {
		bytes32 reqId = requestIds[tokenId];
		Request storage req = requests[reqId];

		if (req.isClaimed) {
			revert AlreadyClaimed();
		}
		req.isClaimed = true;

		_setDataForTokenId(
			tokenId,
			_LSP4_VERSION_KEY,
			bytes(req.version)
		);
		_setDataForTokenId(tokenId, _LSP4_DATA_KEY, req.data);
		_setDataForTokenId(
			tokenId,
			_LSP4_TIMESTAMP_KEY,
			abi.encode(block.timestamp)
		);

		emit Claimed(reqId, req.up, tokenId, req.data);

		if (_exists(tokenId)) {
			address owner = _tokenOwners[tokenId];
			if (owner != req.up) {
				_transfer(
					owner,
					req.up,
					tokenId,
					force,
					req.data
				);
			}
			return;
		}

		_setDataForTokenId(
			tokenId,
			_LSP4_PROVIDER_KEY,
			bytes(req.provider)
		);
		_setDataForTokenId(tokenId, _LSP4_ID_KEY, bytes(req.id));

		_mint(req.up, tokenId, force, req.data);
	}

	function getStringUP(address up) internal returns (string memory) {
		if (isStringUPSet[up]) {
			return stringUPs[up];
		}
		stringUPs[up] = toAsciiString(up);
		isStringUPSet[up] = true;
		return stringUPs[up];
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
