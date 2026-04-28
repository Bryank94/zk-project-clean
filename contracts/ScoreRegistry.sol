// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

interface IVerifier {
    function verifyProof(
        uint[2] calldata a,
        uint[2][2] calldata b,
        uint[2] calldata c,
        uint[8] calldata input
    ) external view returns (bool);
}

contract ScoreRegistry is AccessControl, Pausable {
    bytes32 public constant ORACLE_ROLE = keccak256("ORACLE_ROLE");

    IVerifier public verifier;

    mapping(bytes32 => bool) public usedNullifiers;

    event ScoreVerified(
        address indexed user,
        uint256 threshold,
        bytes32 indexed nullifier,
        bytes32 oracleKeyHash
    );

    error InvalidProof();
    error NullifierAlreadyUsed();

    constructor(address verifierAddress, address admin) {
        require(verifierAddress != address(0), "Invalid verifier");
        require(admin != address(0), "Invalid admin");

        verifier = IVerifier(verifierAddress);
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
    }

    function verifyScore(
        uint[2] calldata a,
        uint[2][2] calldata b,
        uint[2] calldata c,
        uint[8] calldata input
    ) external whenNotPaused {
        bytes32 nullifier = bytes32(input[7]);
        bytes32 oracleKeyHash = bytes32(input[4]);

        if (usedNullifiers[nullifier]) {
            revert NullifierAlreadyUsed();
        }

        bool ok = verifier.verifyProof(a, b, c, input);

        if (!ok) {
            revert InvalidProof();
        }

        usedNullifiers[nullifier] = true;

        emit ScoreVerified(
            msg.sender,
            input[0],
            nullifier,
            oracleKeyHash
        );
    }

    function pause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _pause();
    }

    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }
}