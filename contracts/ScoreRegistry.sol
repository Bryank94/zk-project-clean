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

    constructor(address verifierAddress, address admin) {
        verifier = IVerifier(verifierAddress);
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
    }

    function verifyScore(
        uint[2] calldata a,
        uint[2][2] calldata b,
        uint[2] calldata c,
        uint[8] calldata input
    ) external whenNotPaused returns (bool) {
        bool ok = verifier.verifyProof(a, b, c, input);
        require(ok, "Invalid proof");
        return true;
    }
}