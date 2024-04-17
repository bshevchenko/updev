// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { LSP8Mintable } from "@lukso/lsp8-contracts/contracts/presets/LSP8Mintable.sol";
import { _LSP8_TOKENID_FORMAT_UNIQUE_ID } from "@lukso/lsp-smart-contracts/contracts/LSP8IdentifiableDigitalAsset/LSP8Constants.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

import "./upConstants.sol";
import "./BytesUtils.sol";

bytes32 constant _LSP4_WHITELIST_KEY = 0x57484954454c4953540000000000000000000000000000000000000000000000;
bytes32 constant _LSP4_WHITELIST_IPFS_KEY = 0x57484954454c4953545f49504653000000000000000000000000000000000000;
bytes32 constant _LSP4_METADATA_KEY = 0x4d45544144415441000000000000000000000000000000000000000000000000;

contract upDevCommunityNFT is LSP8Mintable {
	using BytesUtils for bytes;

	bool force;

	error NotAllowed();

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
		bytes calldata metadata,
		bytes calldata whitelist, // merkle root
		bytes calldata whitelistIPFS // optional
	) public {
		bytes32 tokenId = keccak256(
			abi.encodePacked(msg.sender, block.timestamp)
		);
		_mint(msg.sender, tokenId, force, "0x");
		setDataForTokenId(tokenId, _LSP4_METADATA_KEY, metadata);
		setDataForTokenId(tokenId, _LSP4_WHITELIST_KEY, whitelist);
		setDataForTokenId(tokenId, _LSP4_WHITELIST_IPFS_KEY, whitelistIPFS);
	}

	modifier onlyAdmin(bytes32 tokenId) {
		// TODO extra admins besides of just token owner
		if (tokenOwnerOf(tokenId) != msg.sender) {
			revert NotAllowed();
		}
		_;
	}

	function setMetadata(
		bytes32 tokenId,
		bytes calldata data
	) public onlyAdmin(tokenId) {
		setDataForTokenId(tokenId, _LSP4_METADATA_KEY, data);
	}

	function setWhitelist(
		bytes32 tokenId,
		bytes calldata whitelist,
		bytes calldata whitelistIPFS
	) public onlyAdmin(tokenId) {
		setDataForTokenId(tokenId, _LSP4_WHITELIST_KEY, whitelist);
		setDataForTokenId(tokenId, _LSP4_WHITELIST_IPFS_KEY, whitelistIPFS);
	}

	function setArchive(bytes32 tokenId, bool on) public onlyAdmin(tokenId) {
		setDataForTokenId(tokenId, _LSP4_ARCHIVE_KEY, on ? TRUE : FALSE);
	}

	function isWhitelisted(
		bytes32 tokenId,
		bytes32 accountTokenId,
		bytes32[] calldata merkleProof
	) public view returns (bool) {
		bytes memory merkleRoot = getDataForTokenId(
			tokenId,
			_LSP4_WHITELIST_KEY
		);
		if (merkleRoot.length == 0) {
			// whitelist disabled
			return true;
		}
		bytes32 leaf = keccak256(abi.encodePacked(accountTokenId));
		return
			MerkleProof.verify(
				merkleProof,
				merkleRoot.toBytes32(0),
				leaf
			);
	}
}
