pragma circom 2.0.0;

include "circomlib/circuits/poseidon.circom";

template CommitmentVerifier() {

    // =========================
    // PUBLIC INPUTS
    // =========================

    signal input scoreCommitment;
    signal input pymeIdentityCommitment;

    // =========================
    // PRIVATE INPUTS (WITNESS)
    // =========================

    signal input rawScore;
    signal input pymeWallet;
    signal input modelVersion;
    signal input timestamp;
    signal input expiration;
    signal input salt;

    // =========================
    // INTERNAL SIGNALS
    // =========================

    signal issuerMessage;
    signal computedIdentityCommitment;

    // =========================
    // 1. RECONSTRUCT issuerMessage
    // =========================

    component msgHash = Poseidon(6);

    msgHash.inputs[0] <== rawScore;
    msgHash.inputs[1] <== pymeWallet;
    msgHash.inputs[2] <== modelVersion;
    msgHash.inputs[3] <== timestamp;
    msgHash.inputs[4] <== expiration;
    msgHash.inputs[5] <== salt;

    issuerMessage <== msgHash.out;

    // =========================
    // 2. CHECK AGAINST PUBLIC COMMITMENT
    // =========================

    issuerMessage === scoreCommitment;

    // =========================
    // 3. IDENTITY BINDING
    // =========================

    component identityHash = Poseidon(2);

    identityHash.inputs[0] <== pymeWallet;
    identityHash.inputs[1] <== salt;

    computedIdentityCommitment <== identityHash.out;

    computedIdentityCommitment === pymeIdentityCommitment;
}

component main = CommitmentVerifier();