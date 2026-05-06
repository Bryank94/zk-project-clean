pragma circom 2.1.6;

include "../modules/commitment_verifier.circom";
include "../modules/signature_verifier.circom";
include "../modules/threshold_proof.circom";
include "../modules/expiry_verifier.circom";
include "../modules/nullifier_verifier.circom";

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

    // =========================================================
    // MODULES
    // =========================================================

    // Commitment verification
    component commitmentCheck = CommitmentVerifier();
    commitmentCheck.scoreCommitment <== scoreCommitment;
    commitmentCheck.pymeIdentityCommitment <== pymeIdentityCommitment;
    commitmentCheck.rawScore <== rawScore;
    commitmentCheck.pymeWallet <== pymeWallet;
    commitmentCheck.modelVersion <== modelVersion;
    commitmentCheck.timestamp <== timestamp;
    commitmentCheck.expiration <== expiration;
    commitmentCheck.commitmentSecret <== commitmentSecret;

    // Signature verification
    component sigCheck = SignatureVerifier();
    sigCheck.scoreCommitment <== scoreCommitment;
    sigCheck.issuerPublicKey <== issuerPublicKey;
    sigCheck.R8 <== R8;
    sigCheck.S <== S;

    // Threshold proof
    component thresholdCheck = ThresholdProof(32);
    thresholdCheck.score <== rawScore;
    thresholdCheck.threshold <== threshold;

    // Expiry check
    component expiryCheck = ExpiryVerifier(64);
    expiryCheck.expiration <== expiration;
    expiryCheck.currentTime <== currentTime;

    // Nullifier binding
    component nullifierCheck = NullifierVerifier();
    nullifierCheck.pymeWallet <== pymeWallet;
    nullifierCheck.verifierChallenge <== verifierChallenge;
    nullifierCheck.commitmentSecret <== commitmentSecret;

    // =========================================================
    // FINAL CONSTRAINTS
    // =========================================================
    thresholdCheck.valid === 1;
    expiryCheck.valid === 1;
    nullifierCheck.nullifier === nullifier;
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