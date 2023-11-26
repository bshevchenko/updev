// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract upRegistry {

	struct Profile {
		address up;
		address keyManager;
		address upLukso;
	}

	mapping (address => Profile) public up;
	Profile[] public _ups;

	function setUp(address _up, address _km, address _upLukso) public {
		Profile memory p = Profile({
			up: _up,
			keyManager: _km,
			upLukso: _upLukso
		});
		up[msg.sender] = p;
		_ups.push(p);
	}

	function ups() public view returns (Profile[] memory) {
		return _ups;
	}
}
