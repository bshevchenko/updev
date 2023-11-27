// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface ILSP6KeyManager {
    /**
     * @dev Get The address of the contract linked to this Key Manager.
     * @return The address of the linked contract
     */
    function target() external view returns (address);
}

interface ERC725Y {
	function getPermissionsFor(address) external view returns (bytes32);
}

contract upRegistry {

	struct Profile {
		address up;
		address keyManager;
		address upLukso;
	}

	mapping (address => Profile) public upByEOA; // TODO no duplicate
	mapping (address => Profile) public up;
	Profile[] public _ups;

	error InvalidKeyManager();
	error NoPermissionsSet();

	function target(address km) public view returns (address) {
		return ILSP6KeyManager(km).target();
	}

	function permissions(address _up) public view returns (bytes32) {
		return ERC725Y(_up).getPermissionsFor(msg.sender);
	}

	function setUp(address _up, address _km, address _upLukso) public {

		if (ILSP6KeyManager(_km).target() != _up) {
			revert InvalidKeyManager();
		}

		// bytes32 permissions = ERC725Y(_up).getPermissionsFor(msg.sender); TODO reverts, prob wrong version
		// if (permissions == bytes32(0)) revert NoPermissionsSet();

		Profile memory p = Profile({
			up: _up,
			keyManager: _km,
			upLukso: _upLukso
		});
		upByEOA[msg.sender] = p;
		up[_up] = p;
		_ups.push(p);
	}

	function ups() public view returns (Profile[] memory) {
		return _ups;
	}
}
