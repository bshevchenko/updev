// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { LSP8IdentifiableDigitalAsset } from "@lukso/lsp8-contracts/contracts/LSP8IdentifiableDigitalAsset.sol";
import { _LSP8_TOKENID_FORMAT_UNIQUE_ID } from "@lukso/lsp-smart-contracts/contracts/LSP8IdentifiableDigitalAsset/LSP8Constants.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

import "./upConstants.sol";
import "./BytesUtils.sol";

bytes32 constant _LSP4_WHITELIST_KEY = 0x57484954454c4953540000000000000000000000000000000000000000000000;
bytes32 constant _LSP4_METADATA_KEY = 0x4d45544144415441000000000000000000000000000000000000000000000000;
bytes32 constant _LSP4_PARENT_KEY = 0x504152454e540000000000000000000000000000000000000000000000000000;

contract upDevGroupNFT is LSP8IdentifiableDigitalAsset {
	using BytesUtils for bytes;

	bool force;
	uint private nonce = 0;

	error NotAllowed();

	constructor(
		bool _force
	)
		LSP8IdentifiableDigitalAsset(
			"upDev Group NFT",
			"group",
			msg.sender,
			1, // NFT
			_LSP8_TOKENID_FORMAT_UNIQUE_ID
		)
	{
		force = _force;
	}

	function isAdmin(
		address sender,
		bytes32 tokenId
	) public view returns (bool) {
		// TODO extra admins besides of just token owner
		return tokenOwnerOf(tokenId) == sender;
	}

	modifier onlyAdmin(bytes32 tokenId) {
		if (tokenId != bytes32(0) && !isAdmin(msg.sender, tokenId)) {
			revert NotAllowed();
		}
		_;
	}

	function mint(
		bytes calldata metadata,
		bytes calldata whitelist, // merkle root
		bytes32 parentTokenId // optional
	) public onlyAdmin(parentTokenId) {
		nonce++;
		bytes32 tokenId = keccak256(abi.encodePacked(msg.sender, nonce));
		_mint(msg.sender, tokenId, force, "0x");
		_setDataForTokenId(tokenId, _LSP4_METADATA_KEY, metadata);
		_setDataForTokenId(tokenId, _LSP4_WHITELIST_KEY, whitelist);
		_setDataForTokenId(
			tokenId,
			_LSP4_PARENT_KEY,
			abi.encodePacked(parentTokenId)
		);
	}

	function mintBatch(
		bytes[] calldata metadata,
		bytes[] calldata whitelist,
		bytes32[] calldata parentTokenIds
	) public {
		for (uint i = 0; i < metadata.length; i++) {
			if (
				parentTokenIds[i] != bytes32(0) &&
				!isAdmin(msg.sender, parentTokenIds[i])
			) {
				revert NotAllowed();
			}
			nonce++;
			bytes32 tokenId = keccak256(abi.encodePacked(msg.sender, nonce));
			_mint(msg.sender, tokenId, force, "0x");
			_setDataForTokenId(tokenId, _LSP4_METADATA_KEY, metadata[i]);
			_setDataForTokenId(tokenId, _LSP4_WHITELIST_KEY, whitelist[i]);
			_setDataForTokenId(
				tokenId,
				_LSP4_PARENT_KEY,
				abi.encodePacked(parentTokenIds[i])
			);
		}
	}

	function setMetadata(
		bytes32 tokenId,
		bytes calldata data
	) public onlyAdmin(tokenId) {
		_setDataForTokenId(tokenId, _LSP4_METADATA_KEY, data);
	}

	function setWhitelist(
		bytes32 tokenId,
		bytes calldata whitelist
	) public onlyAdmin(tokenId) {
		_setDataForTokenId(tokenId, _LSP4_WHITELIST_KEY, whitelist);
	}

	function setArchive(bytes32 tokenId, bool on) public onlyAdmin(tokenId) {
		_setDataForTokenId(tokenId, _LSP4_ARCHIVE_KEY, on ? TRUE : FALSE);
	}

	// TODO setArchiveBatch?

	function isWhitelisted(
		bytes32 tokenId,
		address up,
		bytes32[] calldata merkleProof
	) public view returns (bool) {
		if (!_exists(tokenId)) {
			return false;
		}
		bytes memory merkleRoot = getDataForTokenId(
			tokenId,
			_LSP4_WHITELIST_KEY
		);
		if (merkleRoot.length == 0) {
			// whitelist disabled
			return true;
		}
		bytes32 leaf = keccak256(abi.encodePacked(up));
		return MerkleProof.verify(merkleProof, merkleRoot.toBytes32(0), leaf);
	}
}
