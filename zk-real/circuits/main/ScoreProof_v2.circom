pragma circom 2.1.6;

include "circomlib/circuits/comparators.circom";
include "circomlib/circuits/eddsaposeidon.circom";
include "circomlib/circuits/poseidon.circom";
include "circomlib/circuits/bitify.circom";

/*
 * ScoreProof_v2
 * -------------
 * Versión alineada con el pipeline actual:
 * - usa commitmentSecret (no salt)
 * - mantiene 8 public inputs
 * - mantiene 9 private inputs expandido
 */

template ScoreProof() {

    // =========================================================
    // PUBLIC INPUTS
    // =========================================================
    signal input threshold;
    signal input scoreCommitment;
    signal input pymeIdentityCommitment;
    signal input issuerPublicKey[2];
    signal input currentTime;
    signal input verifierChallenge;
    signal input nullifier;

    // =========================================================
    // PRIVATE INPUTS
    // =========================================================
    signal input rawScore;
    signal input pymeWallet;
    signal input modelVersion;
    signal input timestamp;
    signal input expiration;
    signal input commitmentSecret;
    signal input R8[2];
    signal input S;

    // ---------------------------------------------------------
    // (1) Identity commitment
    // pymeIdentityCommitment == Poseidon(pymeWallet, commitmentSecret)
    // ---------------------------------------------------------
    component identityHash = Poseidon(2);
    identityHash.inputs[0] <== pymeWallet;
    identityHash.inputs[1] <== commitmentSecret;
    identityHash.out === pymeIdentityCommitment;

    // ---------------------------------------------------------
    // (2) Score commitment
    // scoreCommitment == Poseidon(rawScore, pymeWallet, modelVersion,
    //                             timestamp, expiration, commitmentSecret)
    // ---------------------------------------------------------
    component msgHash = Poseidon(6);
    msgHash.inputs[0] <== rawScore;
    msgHash.inputs[1] <== pymeWallet;
    msgHash.inputs[2] <== modelVersion;
    msgHash.inputs[3] <== timestamp;
    msgHash.inputs[4] <== expiration;
    msgHash.inputs[5] <== commitmentSecret;
    msgHash.out === scoreCommitment;

    // ---------------------------------------------------------
    // (3) EdDSA signature verification
    // ---------------------------------------------------------
    component sigVerifier = EdDSAPoseidonVerifier();
    sigVerifier.enabled <== 1;
    sigVerifier.Ax  <== issuerPublicKey[0];
    sigVerifier.Ay  <== issuerPublicKey[1];
    sigVerifier.R8x <== R8[0];
    sigVerifier.R8y <== R8[1];
    sigVerifier.S   <== S;
    sigVerifier.M   <== scoreCommitment;

    // ---------------------------------------------------------
    // (4) Threshold check
    // rawScore >= threshold
    // Plus 32-bit range check
    // ---------------------------------------------------------
    component rawScoreBits = Num2Bits(32);
    rawScoreBits.in <== rawScore;

    component gteThreshold = GreaterEqThan(32);
    gteThreshold.in[0] <== rawScore;
    gteThreshold.in[1] <== threshold;
    gteThreshold.out === 1;

    // ---------------------------------------------------------
    // (5) Expiration check
    // expiration > currentTime
    // ---------------------------------------------------------
    component expirationCheck = GreaterThan(64);
    expirationCheck.in[0] <== expiration;
    expirationCheck.in[1] <== currentTime;
    expirationCheck.out === 1;

    // ---------------------------------------------------------
    // (6) Nullifier binding
    // nullifier == Poseidon(pymeWallet, verifierChallenge, commitmentSecret)
    // ---------------------------------------------------------
    component nullifierHash = Poseidon(3);
    nullifierHash.inputs[0] <== pymeWallet;
    nullifierHash.inputs[1] <== verifierChallenge;
    nullifierHash.inputs[2] <== commitmentSecret;
    nullifierHash.out === nullifier;
}

component main { public [
    threshold,
    scoreCommitment,
    pymeIdentityCommitment,
    issuerPublicKey,
    currentTime,
    verifierChallenge,
    nullifier
] } = ScoreProof();