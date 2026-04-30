pragma circom 2.0.0;

include "../modules/threshold_proof.circom";
include "../modules/expiry_verifier.circom";
include "../modules/nullifier_verifier.circom";

template MainThreshold(n) {
    signal input rawScore;
    signal input threshold;
    signal input expiration;
    signal input currentTime;
    signal input pymeWallet;
    signal input verifierChallenge;
    signal input commitmentSecret;

    signal output isValid;
    signal output nullifier;

    component t = ThresholdProof(n);
    t.score <== rawScore;
    t.threshold <== threshold;

    component e = ExpiryVerifier(n);
    e.expiration <== expiration;
    e.currentTime <== currentTime;

    component nver = NullifierVerifier();
    nver.pymeWallet <== pymeWallet;
    nver.verifierChallenge <== verifierChallenge;
    nver.commitmentSecret <== commitmentSecret;

    nullifier <== nver.nullifier;

    isValid <== t.valid * e.valid;
}

component main = MainThreshold(64);