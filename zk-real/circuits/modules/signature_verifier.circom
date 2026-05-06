pragma circom 2.0.0;

include "circomlib/circuits/eddsaposeidon.circom";

template SignatureVerifier() {
    signal input scoreCommitment;
    signal input issuerPublicKey[2];
    signal input R8[2];
    signal input S;

    component sigVerifier = EdDSAPoseidonVerifier();

    sigVerifier.enabled <== 1;

    sigVerifier.Ax <== issuerPublicKey[0];
    sigVerifier.Ay <== issuerPublicKey[1];

    sigVerifier.R8x <== R8[0];
    sigVerifier.R8y <== R8[1];

    sigVerifier.S <== S;
    sigVerifier.M <== scoreCommitment;
}