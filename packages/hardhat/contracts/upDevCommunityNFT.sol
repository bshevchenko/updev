// TODO
// Alice is a [Community NFT].owner that resides in a Telegram channel. Alice:
// 1. Allows upDev to access her Telegram channels.
// 2. Picks her community channel & N participants of it.
// 3. Whitelists Telegram AccountNFT tokenIds generated from picked participants (keccak256(abi.encodePacked("telegram", id))
// 4. Shares with invited people the link /community/[communityTokenId]/claimMembership/[provider] which shows either:
//   A. message "Sign Up & Mint Your [provider] Account first"
//   B. button "Claim cryptoOKO Member NFT" if user has whitelisted [Account NFT]

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { LSP8Mintable } from "@lukso/lsp8-contracts/contracts/presets/LSP8Mintable.sol";
import { _LSP8_TOKENID_FORMAT_UNIQUE_ID } from "@lukso/lsp-smart-contracts/contracts/LSP8IdentifiableDigitalAsset/LSP8Constants.sol";

bytes32 constant _LSP4_WHITELIST_KEY = 0x57484954454c4953540000000000000000000000000000000000000000000000;

// bytes constant TRUE = "0x1"; TODO
// bytes constant FALSE = "0x0";

contract upDevCommunityNFT is LSP8Mintable {
	bool force;

	constructor(
		bool _force
	)
		LSP8Mintable(
			"upDev Community NFT",
			"community",
			msg.sender,
			1, // NFT
			_LSP8_TOKENID_FORMAT_UNIQUE_ID
		)
	{
		force = _force;
	}

	function mint(
		bytes memory data, // TODO what is data? IPFS hash? allow NFT admins to update it
        bool whitelist
	) public {
		bytes32 tokenId = keccak256(
			abi.encodePacked(msg.sender, block.timestamp)
		);
		// setDataForTokenId(tokenId, _LSP4_WHITELIST_KEY, whitelist ? TRUE : FALSE);
		_mint(
			msg.sender,
			tokenId,
			force,
			data // TODO keep?
		);
	}

    // TODO function disableWhitelist(communityTokenId) ???

	// TODO merkle-tree with whitelist (of accountTokenIds) stored on IPFS? whitelist is optional
	function isWhitelisted(
		bytes32 tokenId,
		bytes32 accountTokenId
	) public view returns (bool) {
        // if (getDataForTokenId(tokenId, _LSP4_WHITELIST_KEY) == TRUE) {} // TODO
        // TODO is whitelist enabled for tokenId?
		return true; // TODO
	}

	// TODO modifier onlyCommunityAdmin
	// TODO function setAdmin() onlyCommunityOwner
	// TODO function getAdmins() view

	// TODO function burn(bytes32 tokenId) onlyCommunityOwner. burn or disable?

	// TODO isWhitelisted(bytes32 tokenId, bytes32 accountTokenId) return bool

	// TODO blacklist, isBlacklisted? blacklist by account NFTs and/or by UP addresses?
}
