// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract MockVerifier {
    bool public result;

    constructor(bool initialResult) {
        result = initialResult;
    }

    function setResult(bool newResult) external {
        result = newResult;
    }

    function verifyProof(
        uint[2] calldata,
        uint[2][2] calldata,
        uint[2] calldata,
        uint[8] calldata
    ) external view returns (bool) {
        return result;
    }
}