// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { ERC725Y } from "@erc725/smart-contracts/contracts/ERC725Y.sol";
import { LSP6Utils } from "@lukso/lsp-smart-contracts/contracts/LSP6KeyManager/LSP6Utils.sol";
import { _PERMISSION_SIGN } from "@lukso/lsp-smart-contracts/contracts/LSP6KeyManager/LSP6Constants.sol";

contract upRegistry {
	using LSP6Utils for *;

	mapping(address controller => address up) public up;
	mapping(address up => address controller) public controller;
	address[] public _ups;

	error AlreadySetUp();
	error NoPermissions();

	event SetUp(address indexed up, address indexed controller);

	function setUP(address _up, address _controller) public {
		if (!ERC725Y(_up).getPermissionsFor(_controller).hasPermission(_PERMISSION_SIGN)) {
			revert NoPermissions();
		}
		up[_controller] = _up;
		controller[_up] = _controller;

		_ups.push(_up);

		emit SetUp(_up, _controller);
	}

	function ups() view public returns (address[] memory) {
		address[] memory u = new address[](_ups.length);
		for (uint i = 0; i < _ups.length; i++) {
			u[i] = _ups[i];
		}
		return u;
	}
}
