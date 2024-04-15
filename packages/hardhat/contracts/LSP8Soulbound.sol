// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { LSP8Mintable } from "@lukso/lsp8-contracts/contracts/presets/LSP8Mintable.sol";
import { LSP8IdentifiableDigitalAssetCore } from "@lukso/lsp8-contracts/contracts/LSP8IdentifiableDigitalAssetCore.sol";
import { ILSP8IdentifiableDigitalAsset } from "@lukso/lsp8-contracts/contracts/ILSP8IdentifiableDigitalAsset.sol";

abstract contract LSP8Soulbound is LSP8Mintable {

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
