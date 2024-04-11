// TODO mints token if user verifies ownership over some EOA

// TODO think through UI/UX

// contract upDevEOAOwnership is LSP8Mintable {
//     mapping(address => uint256) public nonces;

//     // Function to generate a message that the user should sign
//     function getMessageToSign(address user) public view returns (bytes32) {
//         uint256 nonce = nonces[user];  // Get current nonce for user
//         return keccak256(abi.encodePacked(user, address(this), nonce, "I prove that I own this address"));
//     }

//     // Function to verify the signature
//     function verify(address user, uint8 v, bytes32 r, bytes32 s) public returns (bool) {
//         bytes32 message = getMessageToSign(user);
//         bytes32 ethSignedMessageHash = keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", message));
//         address recovered = ecrecover(ethSignedMessageHash, v, r, s);

//         if (recovered == user) {
//             nonces[user]++;  // Increment nonce for the user after successful verification

//             // TODO mint token here

//             return true;
//         }

//         return false;
//     }
// }
