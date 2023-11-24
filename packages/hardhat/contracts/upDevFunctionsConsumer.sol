// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {FunctionsClient} from "@chainlink/contracts/src/v0.8/functions/dev/v1_0_0/FunctionsClient.sol";
import {ConfirmedOwner} from "@chainlink/contracts/src/v0.8/shared/access/ConfirmedOwner.sol";
import {FunctionsRequest} from "@chainlink/contracts/src/v0.8/functions/dev/v1_0_0/libraries/FunctionsRequest.sol";

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

    // State variables to store the last request ID, response, and error
    bytes32 public s_lastRequestId;
    bytes public s_lastResponse;
    bytes public s_lastError;

    // Custom error type
    error SourceNameBusy();
    error UnexpectedRequestID(bytes32 requestId);

    // Event to log responses
    event Response(
        bytes32 indexed requestId,
        bool isOwned,
        bytes response,
        bytes err
    );

    struct Request {
        address up;
        string source;
        string id;
        bool isOwned;
        bool isFinished;
    }

    mapping (bytes32 requiestId => Request) public requests;

    // Router address - Hardcoded for Mumbai
    // Check to get the router address for your supported network https://docs.chain.link/chainlink-functions/supported-networks
    address router = 0x6E2dc0F9DB014aE19888F539E59285D2Ea04244C;

    mapping (string => string) public source; // TODO bytes32 => string ???
    string[] public availableSources;

    // Callback gas limit TODO
    uint32 gasLimit = 300000;

    // donID - Hardcoded for Mumbai
    // Check to get the donID for your supported network https://docs.chain.link/chainlink-functions/supported-networks
    bytes32 donID =
        0x66756e2d706f6c79676f6e2d6d756d6261692d31000000000000000000000000;

    /**
     * @notice Initializes the contract with the Chainlink router address and sets the contract owner
     */
    constructor() FunctionsClient(router) ConfirmedOwner(msg.sender) {
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
            "return Functions.encodeUint256(urlFound ? 1 : 0);"
        );
        // TODO addSource buidlbox
        // TODO addSource twitter
        // TODO addSoure buidlguidl
    }

    function addSource(string memory name, string memory _source) public onlyOwner { // TODO
        if (bytes(source[name]).length != 0) {
            revert SourceNameBusy();
        }
        source[name] = _source;
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
        req.initializeRequestForInlineJavaScript(
            source[sourceName]
        );
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

    // TODO mint NFTS on fulfill

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
        if (s_lastRequestId != requestId) { // TODO ???
            revert UnexpectedRequestID(requestId); // Check if request IDs match
        }
        // Update the contract's state variables with the response and any errors
        s_lastResponse = response;
        s_lastError = err;

        bool isOwned = isTrue(response);

        requests[requestId].isOwned = isOwned;
        requests[requestId].isFinished = true;

        // Emit an event to log the response
        emit Response(requestId, isOwned, s_lastResponse, s_lastError);
    }

    /**
     * HELPERS
     */
    function toAsciiString(address x) public pure returns (string memory) {
        bytes memory s = new bytes(40);
        for (uint i = 0; i < 20; i++) {
            bytes1 b = bytes1(uint8(uint(uint160(x)) / (2**(8*(19 - i)))));
            bytes1 hi = bytes1(uint8(b) / 16);
            bytes1 lo = bytes1(uint8(b) - 16 * uint8(hi));
            s[2*i] = char(hi);
            s[2*i+1] = char(lo);
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
        return input.length == targetBytes.length && keccak256(input) == keccak256(targetBytes);
    }
}
