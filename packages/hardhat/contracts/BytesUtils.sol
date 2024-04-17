// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

library BytesUtils {
    function toBytes32(
        bytes memory source,
        uint256 offset
    ) internal pure returns (bytes32 result) {
        require(
            source.length >= offset + 32,
            "Not enough bytes to convert to bytes32."
        );
        assembly {
            result := mload(add(add(source, 0x20), offset))
        }
    }
}
