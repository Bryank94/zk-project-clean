pragma circom 2.0.0;

include "circomlib/circuits/comparators.circom";

template ThresholdProof(n) {
    signal input score;
    signal input threshold;
    signal output valid;

    component gte = GreaterEqThan(n);

    gte.in[0] <== score;
    gte.in[1] <== threshold;

    valid <== gte.out;
}