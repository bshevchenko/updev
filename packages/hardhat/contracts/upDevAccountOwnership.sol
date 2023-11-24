// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// modules
import { LSP8Mintable } from "@lukso/lsp-smart-contracts/contracts/LSP8IdentifiableDigitalAsset/presets/LSP8Mintable.sol";
import { LSP8IdentifiableDigitalAssetCore } from "@lukso/lsp-smart-contracts/contracts/LSP8IdentifiableDigitalAsset/LSP8IdentifiableDigitalAssetCore.sol";
import { ILSP8IdentifiableDigitalAsset } from "@lukso/lsp-smart-contracts/contracts/LSP8IdentifiableDigitalAsset/ILSP8IdentifiableDigitalAsset.sol";

// constants
import {
    _LSP8_TOKENID_TYPE_NUMBER
} from "@lukso/lsp-smart-contracts/contracts/LSP8IdentifiableDigitalAsset/LSP8Constants.sol";

bytes32 constant _LSP4_TOKEN_TYPE_DATA_KEY = 0xe0261fa95db2eb3b5439bd033cda66d56b96f92f243a8228fd87550ed7bdfdb3;

enum TokenType {
    TOKEN,
    NFT,
    COLLECTION
}

contract upDevAccountOwnership is LSP8Mintable {
    constructor(
        string memory nftCollectionName,
        string memory nftCollectionSymbol,
        address contractOwner
    )
        LSP8Mintable(
            nftCollectionName,        // NFT collection name
            nftCollectionSymbol,      // NFT collection symbol
            contractOwner,            // owner of the NFT contract (the address that controls it, sets metadata, can transfer the ownership of the contract)
            _LSP8_TOKENID_TYPE_NUMBER // type of NFT/ tokenIds
        )
    {
        // set token type
        _setData(_LSP4_TOKEN_TYPE_DATA_KEY, abi.encode(TokenType.COLLECTION));
    }

    error Soulbound();

    function mint(
        address to,
        bytes32 tokenId,
        bool force,
        bytes memory data
    ) public override onlyOwner { // TODO just transfer ownership of this contract to the Consumer after deploy?
        _mint(to, tokenId, force, data);
    }

    function transfer( // TODO test
        address from,
        address to,
        bytes32 tokenId,
        bool force,
        bytes memory data
    ) public override(ILSP8IdentifiableDigitalAsset, LSP8IdentifiableDigitalAssetCore) {
        revert Soulbound();
    }

    function transferBatch( // TODO test
        address[] memory from,
        address[] memory to,
        bytes32[] memory tokenId,
        bool[] memory force,
        bytes[] memory data
    ) public override(ILSP8IdentifiableDigitalAsset, LSP8IdentifiableDigitalAssetCore) {
        revert Soulbound();
    }

    // TODO transfer ownership of NFT if account owner address has changed
}