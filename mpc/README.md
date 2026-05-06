# Phase-2 MPC Ceremony Plan

The current project uses a local single-contributor Groth16 setup for testnet.

Before mainnet, the proving key must be generated through a multi-party contribution ceremony.

Minimum pilot requirement:

- 3 independent contributors
- Each contributor runs `snarkjs zkey contribute`
- Each contribution hash is recorded
- Final zkey is verified
- Final verification key is exported
- Final Solidity verifier is regenerated
- The resulting verifier is redeployed

Ceremony steps:

1. Generate initial zkey from circuit and ptau
2. Contributor 1 contributes entropy
3. Contributor 2 contributes entropy
4. Contributor 3 contributes entropy
5. Verify final zkey
6. Export verification key
7. Export Solidity verifier
8. Document contribution hashes
9. Store final zkey securely
10. Publish verification key and verifier contract

Mainnet deployment must not use the local dev zkey.
