const circomlibjs = require("circomlibjs");

async function main() {
  const poseidon = await circomlibjs.buildPoseidon();
  const eddsa = await circomlibjs.buildEddsa();

  // =========================
  // Valores base
  // =========================
  const threshold = 50;
  const currentTime = 1500;
  const challenge = 42;

  const rawScore = 80;
  const pymeWallet = 999;
  const commitmentSecret = 111;
  const modelVersion = 1;
  const timestamp = 1000;
  const expiration = 2000;

  // =========================
  // Clave privada fija
  // =========================
  const prvKey = Buffer.from(
    "1".toString().padStart(64, "0"),
    "hex"
  );

  // =========================
  // Identity commitment
  // =========================
  const identityCommitment = poseidon([
    rawScore,
    commitmentSecret
  ]);

  // =========================
  // Mensaje firmado
  // =========================
  const issuerMessage = poseidon([
    rawScore,
    pymeWallet,
    modelVersion,
    timestamp,
    expiration,
    commitmentSecret
  ]);

  // =========================
  // Firma
  // =========================
  const signature = eddsa.signPoseidon(prvKey, issuerMessage);
  const pubKey = eddsa.prv2pub(prvKey);

  // =========================
  // Nullifier
  // =========================
  const nullifier = poseidon([
    pymeWallet,
    commitmentSecret,
    challenge
  ]);

  const output = {
    threshold,

    pymeIdentityCommitment: identityCommitment.toString(),

    issuerPublicKey: [
      pubKey[0].toString(),
      pubKey[1].toString()
    ],

    scoreCommitment: issuerMessage.toString(),

    currentTime,
    challenge,

    rawScore,
    pymeWallet,
    commitmentSecret,
    modelVersion,
    timestamp,
    expiration,

    R8: [
      signature.R8[0].toString(),
      signature.R8[1].toString()
    ],

    S: signature.S.toString(),

    expectedNullifier: nullifier.toString()
  };

  console.log(JSON.stringify(output, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
// TODO: replace with new circuit
