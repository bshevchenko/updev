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

    struct Name {
        string source;
        string id;
        string ipfs;
    }

    struct Token {
        bytes32 id;
        Name name;
        bytes data;
        uint timestamp;
    }

    mapping (bytes32 => Name) public name; // token id => Name TODO get name from upDevFunctionsConsumer contract?
    mapping (bytes32 => uint) public timestamp; // token id => mint/update Unix timestamp in seconds

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
        _setData(_LSP4_TOKEN_TYPE_DATA_KEY, abi.encode(TokenType.COLLECTION));
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
        _setData(tokenId, data);
        timestamp[tokenId] = block.timestamp;
        if (_tokenOwners[tokenId] != address(0)) {
            if (_tokenOwners[tokenId] == to) {
                return;
            }
            _transfer(_tokenOwners[tokenId], to, tokenId, force, data);
            return;
        }
        _mint(to, tokenId, force, data);
        name[tokenId] = Name({
            source: source,
            id: id,
            ipfs: ipfs
        });
    }

    function getTokensByAddress(address up) external view returns (Token[] memory) {
        bytes32[] memory ids = tokenIdsOf(up);
        bytes[] memory data = getDataBatch(ids);
        Token[] memory tokens = new Token[](ids.length);
        for (uint256 i = 0; i < ids.length; i++) {
            tokens[i] = Token({
                id: ids[i],
                name: name[ids[i]],
                data: data[i],
                timestamp: timestamp[ids[i]]
            });
        }
        return tokens;
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
    ) public pure override(ILSP8IdentifiableDigitalAsset, LSP8IdentifiableDigitalAssetCore) {
        revert Soulbound();
    }

    function transferBatch(
        address[] memory,
        address[] memory,
        bytes32[] memory,
        bool[] memory,
        bytes[] memory
    ) public pure override(ILSP8IdentifiableDigitalAsset, LSP8IdentifiableDigitalAssetCore) {
        revert Soulbound();
    }
}