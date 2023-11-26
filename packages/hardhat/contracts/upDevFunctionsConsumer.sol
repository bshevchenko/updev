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
		bool isOwned;
		bool isFinished;
	}

	upDevAccountOwnership public collection;

	mapping(string => Source) public source;
	mapping(bytes32 requiestId => Request) public requests;

	string[] public availableSources;

	// Custom error type
	error SourceNameBusy();

	// Event to log responses
	event Response(
		bytes32 indexed requestId,
		bool isOwned,
		bytes response,
		bytes err
	);

	// State variables to store the last request ID, response, and error TODO remove?
	bytes32 public s_lastRequestId;
	bytes public s_lastResponse;
	bytes public s_lastError;

	// Router address - Hardcoded for Mumbai
	// Check to get the router address for your supported network https://docs.chain.link/chainlink-functions/supported-networks
	address router = 0x6E2dc0F9DB014aE19888F539E59285D2Ea04244C;

	// Callback gas limit TODO
	uint32 gasLimit = 300000;

	// donID - Hardcoded for Mumbai
	// Check to get the donID for your supported network https://docs.chain.link/chainlink-functions/supported-networks
	bytes32 donID =
		0x66756e2d706f6c79676f6e2d6d756d6261692d31000000000000000000000000;

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
		// TODO addSource buidlbox
		// TODO addSource twitter
		// TODO addSoure buidlguidl, isAddressId = true
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
	) external onlyOwner returns (bytes32 requestId) {
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

		// Send the request and store the request ID
		s_lastRequestId = _sendRequest(
			req.encodeCBOR(),
			subscriptionId,
			gasLimit,
			donID
		);
		requests[s_lastRequestId] = Request({
			up: up,
			id: id,
			source: sourceName,
			isOwned: false,
			isFinished: false
		});
		return s_lastRequestId;
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
		// Update the contract's state variables with the response and any errors
		s_lastResponse = response;
		s_lastError = err;

		bool isOwned = isTrue(response);

		requests[requestId].isOwned = isOwned;
		requests[requestId].isFinished = true;

		collection.mint(
			requests[requestId].up,
            source[requests[requestId].source].isAddressId ?
                generateTokenId(source[requests[requestId].source].id, stringToAddress(requests[requestId].id)) :
                generateTokenId(source[requests[requestId].source].id, requests[requestId].id),
			true,
			"0x"
		);

		// Emit an event to log the response
		emit Response(requestId, isOwned, s_lastResponse, s_lastError);
	}

	/**
	 * HELPERS
	 */
	function stringToAddress(
		string memory _addressString
	) public pure returns (address) {
		// Parse the string as bytes
		bytes memory _addressBytes = bytes(_addressString);

		// Check that the length is 40 (hexadecimal representation of an Ethereum address)
		require(_addressBytes.length == 40, "Invalid address string length");

		// Parse the bytes into a 20-byte address
		address _parsedAddress = address(
			uint160(uint256(keccak256(_addressBytes)))
		);

		return _parsedAddress;
	}

	function generateTokenId(
		uint16 sourceId,
		string memory id
	) public pure returns (bytes32) {
		// TODO bytes32 is not enough for id + address
		// Convert uint16 to bytes
		bytes memory sourceIdBytes = abi.encodePacked(sourceId);

		// Convert string to bytes
		bytes memory idBytes = bytes(id);

		// Concatenate sourceIdBytes and idBytes
		bytes memory concatenatedBytes = new bytes(
			sourceIdBytes.length + idBytes.length
		);
		for (uint i = 0; i < sourceIdBytes.length; i++) {
			concatenatedBytes[i] = sourceIdBytes[i];
		}
		for (uint i = 0; i < idBytes.length; i++) {
			concatenatedBytes[sourceIdBytes.length + i] = idBytes[i];
		}

		// Hash the concatenated bytes
		bytes32 tokenId = keccak256(concatenatedBytes);

		return tokenId;
	}

	function generateTokenId(
		uint16 sourceId,
		address id
	) public pure returns (bytes32) {
		// Convert uint16 to bytes
		bytes memory sourceIdBytes = abi.encodePacked(sourceId);

		// Convert address to bytes
		bytes memory idBytes = abi.encodePacked(id);

		// Concatenate sourceIdBytes and idBytes
		bytes memory concatenatedBytes = new bytes(
			sourceIdBytes.length + idBytes.length
		);
		for (uint i = 0; i < sourceIdBytes.length; i++) {
			concatenatedBytes[i] = sourceIdBytes[i];
		}
		for (uint i = 0; i < idBytes.length; i++) {
			concatenatedBytes[sourceIdBytes.length + i] = idBytes[i];
		}

		// Hash the concatenated bytes
		bytes32 tokenId = keccak256(concatenatedBytes);

		return tokenId;
	}

	function toAsciiString(address x) public pure returns (string memory) {
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

	function isTrue(bytes memory input) public pure returns (bool) {
		// Define the target byte pattern
		bytes32 targetPattern = 0x0000000000000000000000000000000000000000000000000000000000000001;

		// Convert the target pattern to bytes
		bytes memory targetBytes = abi.encodePacked(targetPattern);

		// Check if the input bytes are equal to the target pattern
		return
			input.length == targetBytes.length &&
			keccak256(input) == keccak256(targetBytes);
	}
}
