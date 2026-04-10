pragma circom 2.0.0;

include "../node_modules/circomlib/circuits/comparators.circom";

template RangeAndAgeCheck() {
    // Inputs privados
    signal input score;
    signal input age;

    // Inputs públicos
    signal input min;
    signal input max;

    // Comparación score >= min
    component gteScore = GreaterEqThan(32);
    gteScore.in[0] <== score;
    gteScore.in[1] <== min;

    // Comparación score <= max
    component lteScore = LessEqThan(32);
    lteScore.in[0] <== score;
    lteScore.in[1] <== max;

    // Comparación age >= 18
    component gteAge = GreaterEqThan(32);
    gteAge.in[0] <== age;
    gteAge.in[1] <== 18;

    // Multiplicación en pasos (válido en Circom)
    signal temp;
    temp <== gteScore.out * lteScore.out;

    // Constraint final (SIN output)
    temp * gteAge.out === 1;
}

// SOLO públicos: min y max
component main {public [min, max]} = RangeAndAgeCheck();