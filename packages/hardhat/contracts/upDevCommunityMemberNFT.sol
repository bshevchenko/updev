// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { LSP8Mintable } from "@lukso/lsp8-contracts/contracts/presets/LSP8Mintable.sol";
import { _LSP8_TOKENID_FORMAT_HASH } from "@lukso/lsp-smart-contracts/contracts/LSP8IdentifiableDigitalAsset/LSP8Constants.sol";

import { LSP8Soulbound } from "./LSP8Soulbound.sol";
import { upDevCommunityNFT } from "./upDevCommunityNFT.sol";

// custom LSP4 keys
bytes32 constant _LSP4_COMMUNITY_TOKEN_ID_KEY = 0x434f4d4d554e4954595f544f4b454e5f49440000000000000000000000000000;
bytes32 constant _LSP4_ACCOUNT_TOKEN_ID_KEY = 0x4143434f554e545f544f4b454e5f494400000000000000000000000000000000;

contract upDevCommunityMemberNFT is LSP8Soulbound {

	upDevCommunityNFT community;
	bool force;

	error NotAllowed();

	constructor(
		address payable communityNFT,
		bool _force
	)
		LSP8Mintable(
			"upDev Community Member NFT",
			"communityMember",
			msg.sender,
			1, // NFT
			_LSP8_TOKENID_FORMAT_HASH
		)
	{
		community = upDevCommunityNFT(communityNFT);
		force = _force;
	}

	function mint(bytes32 communityTokenId, bytes32 accountTokenId) public {
		if (!community.isWhitelisted(communityTokenId, accountTokenId)) {
			revert NotAllowed();
		}
		bytes32 tokenId = keccak256(abi.encodePacked(communityTokenId, msg.sender));
		_mint(
			msg.sender,
			tokenId,
			force,
			"0x" // TODO keep empty?
		);
		setDataForTokenId(tokenId, _LSP4_COMMUNITY_TOKEN_ID_KEY, abi.encodePacked(communityTokenId));
		setDataForTokenId(tokenId, _LSP4_ACCOUNT_TOKEN_ID_KEY, abi.encodePacked(accountTokenId));

		// TODO emit events. check other contracts for necessary indexer events too
	}

	// TODO function burn(tokenId) communityAdminOrCommunityMember. burn or disable?
	// TODO if community admin removes a member, then member can still be in a whitelist to mint new token...
	// TODO ...avoid that by introducing ban rather than burn?
}
