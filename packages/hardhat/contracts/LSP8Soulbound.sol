// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { LSP8IdentifiableDigitalAssetCore } from "@lukso/lsp8-contracts/contracts/LSP8IdentifiableDigitalAssetCore.sol";
import { LSP8IdentifiableDigitalAsset } from "@lukso/lsp8-contracts/contracts/LSP8IdentifiableDigitalAsset.sol";

abstract contract LSP8Soulbound is LSP8IdentifiableDigitalAsset {
	error Soulbound();

	constructor(
        string memory name_,
        string memory symbol_,
        address newOwner_,
        uint256 lsp4TokenType_,
        uint256 lsp8TokenIdFormat_
    )
        LSP8IdentifiableDigitalAsset(
            name_,
            symbol_,
            newOwner_,
            lsp4TokenType_,
            lsp8TokenIdFormat_
        )
    {}

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
			LSP8IdentifiableDigitalAssetCore
		)
	{
		revert Soulbound();
	}

	function setDataForTokenId(
        bytes32,
        bytes32,
        bytes memory
    ) public virtual override {
        revert Soulbound();
    }

	function setDataBatchForTokenIds(
        bytes32[] memory,
        bytes32[] memory,
        bytes[] memory
    ) public virtual override onlyOwner {
        revert Soulbound();
    }
}
