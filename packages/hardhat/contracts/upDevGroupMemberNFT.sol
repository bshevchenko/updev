// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { _LSP8_TOKENID_FORMAT_HASH } from "@lukso/lsp-smart-contracts/contracts/LSP8IdentifiableDigitalAsset/LSP8Constants.sol";

import { LSP8Soulbound } from "./LSP8Soulbound.sol";
import { upDevGroupNFT } from "./upDevGroupNFT.sol";

import "./upConstants.sol";
import "./BytesUtils.sol";

bytes32 constant _LSP4_GROUP_TOKEN_ID_KEY = 0x47524f55505f544f4b454e5f4944000000000000000000000000000000000000;
bytes32 constant _LSP4_BAN_KEY = 0x4152434849564500000000000000000000000000000000000000000000000000;

contract upDevGroupMemberNFT is LSP8Soulbound {
	using BytesUtils for bytes;

	upDevGroupNFT public group;

	bool force;

	error GroupRequired();
	error NotAllowed();

	constructor(
		address payable groupNFT,
		bool _force
	)
		LSP8Soulbound(
			"upDev Group Member NFT",
			"groupMember",
			msg.sender,
			1, // NFT
			_LSP8_TOKENID_FORMAT_HASH
		)
	{
		group = upDevGroupNFT(groupNFT);
		force = _force;
	}

	function mint(bytes32 groupTokenId, bytes32[] calldata merkleProof) public {
		if (!group.isWhitelisted(groupTokenId, msg.sender, merkleProof)) {
			revert NotAllowed();
		}
		bytes32 tokenId = keccak256(abi.encodePacked(groupTokenId, msg.sender));
		_mint(msg.sender, tokenId, force, "0x");
		_setDataForTokenId(
			tokenId,
			_LSP4_GROUP_TOKEN_ID_KEY,
			abi.encodePacked(groupTokenId)
		);
	}

	function mintBatch(bytes32[] calldata groupTokenIds) public {
		bytes32[] memory tmp;
		for (uint i = 0; i < groupTokenIds.length; i++) {
			bytes32 groupTokenId = groupTokenIds[i];
			if (!group.isWhitelisted(groupTokenId, msg.sender, tmp)) {
				revert NotAllowed();
			}
			bytes32 tokenId = keccak256(
				abi.encodePacked(groupTokenId, msg.sender)
			);
			_mint(msg.sender, tokenId, force, "0x");
			_setDataForTokenId(
				tokenId,
				_LSP4_GROUP_TOKEN_ID_KEY,
				abi.encodePacked(groupTokenId)
			);
		}
	}

	function setArchive(bytes32 tokenId, bool on) public {
		if (tokenOwnerOf(tokenId) != msg.sender) {
			revert NotAllowed();
		}
		_setDataForTokenId(tokenId, _LSP4_ARCHIVE_KEY, on ? TRUE : FALSE);
	}

	function setBan(bytes32 tokenId, bool on) public {
		if (
			group.tokenOwnerOf( // TODO token admin
					getDataForTokenId(tokenId, _LSP4_GROUP_TOKEN_ID_KEY)
						.toBytes32(0)
				) != msg.sender
		) {
			revert NotAllowed();
		}
		_setDataForTokenId(tokenId, _LSP4_BAN_KEY, on ? TRUE : FALSE);
	}

	// TODO archiveBatch
	// TODO banBatch
}
