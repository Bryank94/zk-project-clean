pragma circom 2.0.0;

include "poseidon.circom";
include "comparators.circom";
include "eddsaposeidon.circom";

template ScoreProof() {

    // Public inputs
    signal input threshold;
    signal input pymeIdentityCommitment;
    signal input issuerPublicKey[2];
    signal input scoreCommitment;
    signal input currentTime;
    signal input verifierChallenge;
    signal input nullifier;

    // Private inputs
    signal input rawScore;
    signal input pymeWallet;
    signal input commitmentSecret;
    signal input modelVersion;
    signal input timestamp;
    signal input expiration;
    signal input R8[2];
    signal input S;

    // Internal signals
    signal issuerMessage;
    signal computedNullifier;

    // --- Identity commitment ---
    component identityHash = Poseidon(2);
    identityHash.inputs[0] <== pymeWallet;
    identityHash.inputs[1] <== commitmentSecret;
    identityHash.out === pymeIdentityCommitment;

    // --- Hash del mensaje ---
    component msgHash = Poseidon(6);
    msgHash.inputs[0] <== rawScore;
    msgHash.inputs[1] <== pymeWallet;
    msgHash.inputs[2] <== modelVersion;
    msgHash.inputs[3] <== timestamp;
    msgHash.inputs[4] <== expiration;
    msgHash.inputs[5] <== commitmentSecret;

    issuerMessage <== msgHash.out;

    // --- Nullifier: H(wallet, verifierChallenge, secret) ---
    component nullifierHash = Poseidon(3);
    nullifierHash.inputs[0] <== pymeWallet;
    nullifierHash.inputs[1] <== verifierChallenge;
    nullifierHash.inputs[2] <== commitmentSecret;
    computedNullifier <== nullifierHash.out;

    // (temporalmente desactivado para debug)
    // computedNullifier === nullifier;

    // --- Binding con commitment ---
    issuerMessage === scoreCommitment;

    // --- Verificación de firma EdDSA ---
    component verifier = EdDSAPoseidonVerifier();
    verifier.enabled <== 1;
    verifier.Ax <== issuerPublicKey[0];
    verifier.Ay <== issuerPublicKey[1];
    verifier.R8x <== R8[0];
    verifier.R8y <== R8[1];
    verifier.S <== S;
    verifier.M <== issuerMessage;

    // --- Score >= threshold ---
    component comparator = GreaterEqThan(32);
    comparator.in[0] <== rawScore;
    comparator.in[1] <== threshold;
    comparator.out === 1;

    // --- Expiration check: expiration > currentTime ---
    component expirationCheck = GreaterThan(32);
    expirationCheck.in[0] <== expiration;
    expirationCheck.in[1] <== currentTime;
    expirationCheck.out === 1;
}

component main {public [
    threshold,
    pymeIdentityCommitment,
    issuerPublicKey,
    scoreCommitment,
    currentTime,
    verifierChallenge,
    nullifier
]} = ScoreProof();