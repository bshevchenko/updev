// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// modules
import { LSP8Mintable } from "@lukso/lsp-smart-contracts/contracts/LSP8IdentifiableDigitalAsset/presets/LSP8Mintable.sol";
import { LSP8IdentifiableDigitalAssetCore } from "@lukso/lsp-smart-contracts/contracts/LSP8IdentifiableDigitalAsset/LSP8IdentifiableDigitalAssetCore.sol";
import { ILSP8IdentifiableDigitalAsset } from "@lukso/lsp-smart-contracts/contracts/LSP8IdentifiableDigitalAsset/ILSP8IdentifiableDigitalAsset.sol";

// constants
import { _LSP8_TOKENID_FORMAT_STRING, _LSP8_TOKEN_METADATA_BASE_URI } from "@lukso/lsp-smart-contracts/contracts/LSP8IdentifiableDigitalAsset/LSP8Constants.sol";

uint256 constant NFT = 1;

// custom LSP4 keys
bytes32 constant _LSP4_ABI_DATA_KEY = 0x5f4c5350345f4142495f444154415f4b45590000000000000000000000000000;
bytes32 constant _LSP4_TIMESTAMP_KEY = 0x5f4c5350345f54494d455354414d505f4b455900000000000000000000000000;
bytes32 constant _LSP4_SOURCE_KEY = 0x5f4c5350345f534f555243455f4b455900000000000000000000000000000000;
bytes32 constant _LSP4_ID_KEY = 0x5f4c5350345f49445f4b45590000000000000000000000000000000000000000;

contract upDevAccountNFT is LSP8Mintable {
	constructor()
		LSP8Mintable(
			"upDev Account NFT",
			"account",
			msg.sender,
			NFT,
			_LSP8_TOKENID_FORMAT_STRING
		)
	{
		//
	}

	function mint(
		address to,
		bytes32 tokenId,
		bool force,
		bytes memory data,
		string memory source,
		string memory id,
		string memory ipfs
	) public onlyOwner {
		setDataForTokenId(
			tokenId,
			_LSP8_TOKEN_METADATA_BASE_URI,
			bytes(string.concat("ipfs://", ipfs))
		);
		setDataForTokenId(tokenId, _LSP4_ABI_DATA_KEY, data);
		setDataForTokenId(
			tokenId,
			_LSP4_TIMESTAMP_KEY,
			abi.encode(block.timestamp)
		);

		if (_tokenOwners[tokenId] != address(0)) {
			if (_tokenOwners[tokenId] != to) {
				_transfer(_tokenOwners[tokenId], to, tokenId, force, data);
			}
			return;
		}

		setDataForTokenId(tokenId, _LSP4_SOURCE_KEY, bytes(source));
		setDataForTokenId(tokenId, _LSP4_ID_KEY, bytes(id));

		_mint(to, tokenId, force, data);
	}

	/**
	 * SOULBOUND
	 */
	error Soulbound();

	function transfer(
		address,
		address,
		bytes32,
		bool,
		bytes memory
	)
		public
		pure
		override(
			ILSP8IdentifiableDigitalAsset,
			LSP8IdentifiableDigitalAssetCore
		)
	{
		revert Soulbound();
	}

	function transferBatch(
		address[] memory,
		address[] memory,
		bytes32[] memory,
		bool[] memory,
		bytes[] memory
	)
		public
		pure
		override(
			ILSP8IdentifiableDigitalAsset,
			LSP8IdentifiableDigitalAssetCore
		)
	{
		revert Soulbound();
	}
}
