// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { ERC725Y } from "@erc725/smart-contracts/contracts/ERC725Y.sol";
import { LSP6Utils } from "@lukso/lsp-smart-contracts/contracts/LSP6KeyManager/LSP6Utils.sol";
import { _PERMISSION_SIGN } from "@lukso/lsp-smart-contracts/contracts/LSP6KeyManager/LSP6Constants.sol";

interface ILSP6KeyManager {
	/**
	 * @dev Get The address of the contract linked to this Key Manager.
	 * @return The address of the linked contract
	 */
	function target() external view returns (address);
}

contract upRegistry {
	using LSP6Utils for *;

	struct Profile {
		address up;
		address keyManager;
		address upLukso;
		address eoa;
	}

	mapping(address => Profile) public up;
	mapping(address => address) public _upByEOA;
	address[] public _ups;

	error InvalidKeyManager();
	error NoPermissions();

	function upByEOA(address eoa) external returns (Profile memory) {
		return up[_upByEOA[eoa]];
	}

	function setUp(address _up, address _km, address _upLukso) public {
		if (ILSP6KeyManager(_km).target() != _up) {
			revert InvalidKeyManager();
		}
		if (!ERC725Y(_up).getPermissionsFor(msg.sender).hasPermission(_PERMISSION_SIGN)) {
			revert NoPermissions();
		}

		up[_up] = Profile({
			up: _up,
			keyManager: _km,
			upLukso: _upLukso,
			eoa: msg.sender
		});
		_upByEOA[msg.sender] = _up;
		_ups.push(_up);
	}

	function ups() external view returns (Profile[] memory) {
		uint256 upsCount = _ups.length;
		Profile[] memory profiles = new Profile[](upsCount);
		for (uint256 i = 0; i < upsCount; i++) {
			profiles[i] = up[_ups[i]];
		}
		return profiles;
	}
}
