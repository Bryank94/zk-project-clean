// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/AccessControl.sol";

contract WenalyzeSBT is AccessControl {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    struct SBTData {
        uint256 threshold;
        bytes32 nullifier;
        bytes32 oracleKeyHash;
        bool active;
    }

    mapping(address => SBTData) public sbtData;

    constructor(address admin) {
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
    }

    function mint(
        address to,
        uint256 threshold,
        bytes32 nullifier,
        bytes32 oracleKeyHash
    ) external onlyRole(MINTER_ROLE) {
        sbtData[to] = SBTData({
            threshold: threshold,
            nullifier: nullifier,
            oracleKeyHash: oracleKeyHash,
            active: true
        });
    }

    function revoke(address user) external onlyRole(MINTER_ROLE) {
        sbtData[user].active = false;
    }
}