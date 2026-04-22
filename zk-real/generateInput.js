const circomlib = require("circomlibjs");

(async () => {
    const poseidon = await circomlib.buildPoseidon();
    const eddsa    = await circomlib.buildEddsa();

    const F = poseidon.F;

    // =========================================================
    //  INPUTS (demo values — match the legacy test case)
    // =========================================================
    const rawScore         = 80;
    const pymeWallet       = 999;
    const modelVersion     = 1;
    const timestamp        = 1000;
    const expiration       = 2000;
    const commitmentSecret = 111;

    const threshold         = 50;
    const currentTime       = 1500;
    const verifierChallenge = 42;

    // =========================================================
    //  HASHES
    //  Keep the "raw" Poseidon outputs (field elements) around
    //  because EdDSA's signPoseidon needs them in field form.
    //  For the input.json we convert to BigInt via F.toObject.
    // =========================================================
    const pymeIdentityCommitmentRaw = poseidon([pymeWallet, commitmentSecret]);
    const pymeIdentityCommitment    = F.toObject(pymeIdentityCommitmentRaw);

    const scoreCommitmentRaw = poseidon([
        rawScore,
        pymeWallet,
        modelVersion,
        timestamp,
        expiration,
        commitmentSecret,
    ]);
    const scoreCommitment = F.toObject(scoreCommitmentRaw);

    const nullifierRaw = poseidon([pymeWallet, verifierChallenge, commitmentSecret]);
    const nullifier    = F.toObject(nullifierRaw);

    // =========================================================
    //  ISSUER KEYPAIR (32-byte private key)
    // =========================================================
    const prvKey = Buffer.from(
        "0001020304050607080900010203040506070809000102030405060708090001",
        "hex"
    );

    const pubKey = eddsa.prv2pub(prvKey);

    // =========================================================
    //  SIGNATURE
    //  IMPORTANT: sign the RAW field element, not the BigInt.
    // =========================================================
    const signature = eddsa.signPoseidon(prvKey, scoreCommitmentRaw);

    const R8 = signature.R8;
    const S  = signature.S;

    // =========================================================
    //  OUTPUT
    //  Every field must be a decimal string (circom input format).
    //  pubKey coordinates and R8 coordinates are Uint8Array internally —
    //  they MUST go through F.toObject before .toString().
    // =========================================================
    const input = {
        threshold,
        scoreCommitment:        scoreCommitment.toString(),
        pymeIdentityCommitment: pymeIdentityCommitment.toString(),
        issuerPublicKey: [
            F.toObject(pubKey[0]).toString(),
            F.toObject(pubKey[1]).toString(),
        ],
        currentTime,
        verifierChallenge,
        nullifier: nullifier.toString(),

        rawScore,
        pymeWallet,
        modelVersion,
        timestamp,
        expiration,
        commitmentSecret,

        R8: [
            F.toObject(R8[0]).toString(),
            F.toObject(R8[1]).toString(),
        ],
        S: S.toString(),
    };

    console.log(JSON.stringify(input, null, 2));
})();