// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { LSP8Mintable } from "@lukso/lsp8-contracts/contracts/presets/LSP8Mintable.sol";
import { _LSP8_TOKENID_FORMAT_ADDRESS } from "@lukso/lsp-smart-contracts/contracts/LSP8IdentifiableDigitalAsset/LSP8Constants.sol";

import { LSP8Soulbound } from "./LSP8Soulbound.sol";

contract upDevGroupNFT is LSP8Soulbound {
	bool force;

	mapping(address => uint256) public nonce;

	error Failed();

	constructor(
		bool _force
	)
		LSP8Mintable(
			"upDev EOA NFT",
			"eoa",
			msg.sender,
			1, // NFT
			_LSP8_TOKENID_FORMAT_ADDRESS
		)
	{
		force = _force;
	}

	function getMessageToSign(address up) public view returns (bytes32) {
		uint256 _nonce = nonce[up];
		return
			keccak256(
				abi.encodePacked(
					up,
					address(this),
					_nonce,
					"I prove that I own this address" // TODO
				)
			);
	}

	function mint(
		address eoa,
		uint8 v,
		bytes32 r,
		bytes32 s,
		bytes memory data
	) public {
		bytes32 message = getMessageToSign(msg.sender);
		bytes32 ethSignedMessageHash = keccak256(
			abi.encodePacked("\x19Ethereum Signed Message:\n32", message)
		);
		address recovered = ecrecover(ethSignedMessageHash, v, r, s);

		if (recovered != eoa) {
			revert Failed();
		}

        bytes32 tokenId = bytes32(uint256(uint160(eoa)));
        
		if (_exists(tokenId)) {
			if (_tokenOwners[tokenId] != msg.sender) {
				_transfer(
					_tokenOwners[tokenId],
					msg.sender,
					tokenId,
					force,
					data
				);
			}
			return;
		}

		_mint(msg.sender, tokenId, force, data);
	}
}
