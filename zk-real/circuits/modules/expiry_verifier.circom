pragma circom 2.0.0;

include "circomlib/circuits/comparators.circom";

template ExpiryVerifier(n) {
    signal input expiration;
    signal input currentTime;
    signal output valid;

    component gt = GreaterThan(n);

    gt.in[0] <== expiration;
    gt.in[1] <== currentTime;

    valid <== gt.out;
}