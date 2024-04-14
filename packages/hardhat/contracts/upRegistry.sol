// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { ERC725Y } from "@erc725/smart-contracts/contracts/ERC725Y.sol";
import { LSP6Utils } from "@lukso/lsp-smart-contracts/contracts/LSP6KeyManager/LSP6Utils.sol";
import { _PERMISSION_SIGN } from "@lukso/lsp-smart-contracts/contracts/LSP6KeyManager/LSP6Constants.sol";

contract upRegistry {
	using LSP6Utils for *;

	mapping(address => address) public up; // EOA => UP
	mapping(address => address) public eoa; // UP => EOA
	address[] public _ups;

	error InvalidKeyManager();
	error NoPermissions();

	function setUP(address _up) public {
		if (!ERC725Y(_up).getPermissionsFor(msg.sender).hasPermission(_PERMISSION_SIGN)) {
			revert NoPermissions();
		}
		up[msg.sender] = _up;
		eoa[_up] = msg.sender;
	}
}
