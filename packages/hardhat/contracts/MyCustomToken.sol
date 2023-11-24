// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.20;

import "@lukso/lsp-smart-contracts/contracts/LSP7DigitalAsset/presets/LSP7Mintable.sol";
import "@lukso/lsp-smart-contracts/contracts/LSP7DigitalAsset/extensions/LSP7Burnable.sol";

// https://docs.lukso.tech/learn/smart-contract-developers/create-lsp7-token/
contract CustomToken is LSP7Mintable, LSP7Burnable {
  // parameters for LSP7Mintable constructor are:
  // token name,
  // token symbol,
  // token owner,
  // boolean isNonDivisible
  // for more informations, check https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-7-DigitalAsset.md
  constructor() LSP7Mintable("My Custom Token", "MCT", msg.sender, false) {
    mint(msg.sender, 20000 * 10**decimals(), true, '0x' );
  }
}