pragma circom 2.0.0;

include "circomlib/circuits/poseidon.circom";

template NullifierVerifier() {
    signal input pymeWallet;
    signal input verifierChallenge;
    signal input commitmentSecret;

    signal output nullifier;

    component poseidon = Poseidon(3);

    poseidon.inputs[0] <== pymeWallet;
    poseidon.inputs[1] <== verifierChallenge;
    poseidon.inputs[2] <== commitmentSecret;

    nullifier <== poseidon.out;
}