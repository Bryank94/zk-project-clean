/**
 * oracle-sdk.js
 * -------------
 * Issuer-side SDK that the oracle (Wenalyze AI engine) runs to sign a
 * credit-score attestation, plus the holder-side helpers that the PYME
 * uses to build a circuit input from that attestation.
 *
 * Replaces:
 *   - zk-real/legacy/scripts/signMessage_legacy.js
 *   - zk-real/legacy/scripts/buildInput_legacy.js      (BUGGY — do not restore)
 *   - zk-real/legacy/scripts/calcCommitment_legacy.js
 *   - zk-real/legacy/scripts/computeNullifier_legacy.js
 *   - zk-real/legacy/scripts/signMessage_legacy.js
 *   - zk-real/legacy/scripts/checkHash_legacy.js
 *   - zk-real/legacy/scripts/checkSignature_legacy.js
 *
 * Every Poseidon / EdDSA call here mirrors EXACTLY the constraints in
 * circuits/ScoreProof_v2.circom. If either side is changed, both must be
 * updated in lockstep or every proof will fail to verify.
 *
 * Bugs fixed vs legacy:
 *   1. pymeIdentityCommitment now uses (pymeWallet, salt) — the legacy
 *      buildInput used (rawScore, salt) which would not match the circuit.
 *   2. Nullifier argument order is (pymeWallet, verifierChallenge, salt) —
 *      the legacy buildInput had (pymeWallet, salt, challenge) which would
 *      have produced a different hash and failed the (newly-activated)
 *      circuit constraint.
 *   3. Field renamed commitmentSecret -> salt to match the Fase-2 spec.
 */

const circomlibjs = require("circomlibjs");

/**
 * Run by the oracle (Wenalyze) to issue a signed score attestation.
 *
 * @param {object} p
 * @param {number|bigint} p.rawScore
 * @param {number|bigint} p.pymeWallet        // the PYME's wallet as a field element
 * @param {number|bigint} p.modelVersion
 * @param {number|bigint} p.timestamp         // unix seconds of issuance
 * @param {number|bigint} p.expiration        // unix seconds, must be in the future
 * @param {number|bigint} p.salt              // 32-byte randomness, kept secret by the PYME
 * @param {Buffer}        p.issuerPrivateKey  // 32-byte EdDSA private key of the oracle
 *
 * @returns {Promise<object>} An attestation bundle containing public handles
 *          (scoreCommitment, pymeIdentityCommitment, issuerPublicKey),
 *          signature (R8, S) and the private fields the holder will later
 *          need to generate a ZK proof.
 */
async function issueAttestation(p) {
    const eddsa    = await circomlibjs.buildEddsa();
    const poseidon = await circomlibjs.buildPoseidon();
    const F        = poseidon.F;

    const pubKey = eddsa.prv2pub(p.issuerPrivateKey);

    // scoreCommitment / issuerMessage — the thing the oracle signs
    const msg = poseidon([
        p.rawScore,
        p.pymeWallet,
        p.modelVersion,
        p.timestamp,
        p.expiration,
        p.salt
    ]);

    const sig = eddsa.signPoseidon(p.issuerPrivateKey, msg);

    // Identity commitment — binds the credential to the PYME wallet
    // without revealing it (the salt hides the wallet on-chain).
    const identity = poseidon([p.pymeWallet, p.salt]);

    return {
        // --- Public handles (oracle or PYME may publish these) ---
        scoreCommitment:        F.toString(msg),
        pymeIdentityCommitment: F.toString(identity),
        issuerPublicKey: [
            F.toObject(pubKey[0]).toString(),
            F.toObject(pubKey[1]).toString()
        ],

        // --- Signature (stays with the holder; never on-chain in clear) ---
        R8: [
            F.toObject(sig.R8[0]).toString(),
            F.toObject(sig.R8[1]).toString()
        ],
        S: sig.S.toString(),

        // --- Private fields echoed back so the holder can build the witness ---
        rawScore:     String(p.rawScore),
        pymeWallet:   String(p.pymeWallet),
        modelVersion: String(p.modelVersion),
        timestamp:    String(p.timestamp),
        expiration:   String(p.expiration),
        salt:         String(p.salt)
    };
}

/**
 * Compute the nullifier that the holder will expose publicly when
 * presenting a proof for a given verifier session.
 *
 * MUST match ScoreProof_v2.circom: Poseidon(pymeWallet, verifierChallenge, salt).
 */
async function computeNullifier(pymeWallet, verifierChallenge, salt) {
    const poseidon = await circomlibjs.buildPoseidon();
    const n = poseidon([BigInt(pymeWallet), BigInt(verifierChallenge), BigInt(salt)]);
    return poseidon.F.toString(n);
}

/**
 * Assemble a full circuit input.json from an attestation bundle and the
 * parameters of a verifier session (threshold, challenge, currentTime).
 */
async function buildCircuitInput(attestation, session) {
    const nullifier = await computeNullifier(
        attestation.pymeWallet,
        session.verifierChallenge,
        attestation.salt
    );

    return {
        // --- public ---
        threshold:              String(session.threshold),
        scoreCommitment:        attestation.scoreCommitment,
        pymeIdentityCommitment: attestation.pymeIdentityCommitment,
        issuerPublicKey:        attestation.issuerPublicKey,
        currentTime:            String(session.currentTime),
        verifierChallenge:      String(session.verifierChallenge),
        nullifier:              nullifier,

        // --- private (witness) ---
        rawScore:     attestation.rawScore,
        pymeWallet:   attestation.pymeWallet,
        modelVersion: attestation.modelVersion,
        timestamp:    attestation.timestamp,
        expiration:   attestation.expiration,
        salt:         attestation.salt,
        R8:           attestation.R8,
        S:            attestation.S
    };
}

module.exports = { issueAttestation, computeNullifier, buildCircuitInput };

/* --------------------------------------------------------------
 * CLI demo — reproduces the legacy test case so we have a
 * regression check against the old proof.
 *
 *   node oracle-sdk.js > build/input.json
 *
 * then:
 *
 *   node build/circuit_js/generate_witness.js \
 *        build/circuit_js/ScoreProof_v2.wasm build/input.json build/witness.wtns
 *   snarkjs groth16 prove build/ScoreProof_v2_final.zkey \
 *        build/witness.wtns build/proof.json build/public.json
 *   snarkjs groth16 verify build/verification_key.json \
 *        build/public.json build/proof.json
 * -------------------------------------------------------------- */
if (require.main === module) {
    (async () => {
        // Demo issuer key — REPLACE in production with a real Wenalyze key
        // held in an HSM or equivalent. This value (1) is publicly known.
        const issuerPrivateKey = Buffer.from("1".padStart(64, "0"), "hex");

        const attestation = await issueAttestation({
            rawScore:     80,
            pymeWallet:   999,
            modelVersion: 1,
            timestamp:    1000,
            expiration:   2000,
            salt:         111,
            issuerPrivateKey
        });

        const input = await buildCircuitInput(attestation, {
            threshold:         50,
            verifierChallenge: 42,
            currentTime:       1500
        });

        console.log(JSON.stringify(input, null, 2));
    })().catch(err => { console.error(err); process.exit(1); });
}
