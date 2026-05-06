pragma circom 2.0.0;

include "circomlib/circuits/poseidon.circom";

template CommitmentVerifier() {
    signal input scoreCommitment;
    signal input pymeIdentityCommitment;

    signal input rawScore;
    signal input pymeWallet;
    signal input modelVersion;
    signal input timestamp;
    signal input expiration;
    signal input commitmentSecret;

    component hashScore = Poseidon(6);
    hashScore.inputs[0] <== rawScore;
    hashScore.inputs[1] <== pymeWallet;
    hashScore.inputs[2] <== modelVersion;
    hashScore.inputs[3] <== timestamp;
    hashScore.inputs[4] <== expiration;
    hashScore.inputs[5] <== commitmentSecret;

    component hashIdentity = Poseidon(2);
    hashIdentity.inputs[0] <== pymeWallet;
    hashIdentity.inputs[1] <== commitmentSecret;

    hashScore.out === scoreCommitment;
    hashIdentity.out === pymeIdentityCommitment;
}