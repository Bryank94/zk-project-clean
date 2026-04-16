const circomlibjs = require("circomlibjs");

async function main() {
  const eddsa = await circomlibjs.buildEddsa();
  const poseidon = await circomlibjs.buildPoseidon();
  const babyJub = await circomlibjs.buildBabyjub();
  const F = babyJub.F;

  const prvKey = Buffer.from("1".toString().padStart(64, "0"), "hex");
  const pubKey = eddsa.prv2pub(prvKey);

  const rawScore = 80;
  const pymeWallet = 999;
  const commitmentSecret = 111;
  const modelVersion = 1;
  const timestamp = 1000;
  const expiration = 2000;

  // Mensaje que firma el emisor
  const inputs = [rawScore, pymeWallet, modelVersion, timestamp, expiration, commitmentSecret];
  const msg = poseidon(inputs);
  const signature = eddsa.signPoseidon(prvKey, msg);

  // Identity commitment del prover
  const identityCommitment = poseidon([BigInt(pymeWallet), BigInt(commitmentSecret)]);

  console.log("issuerPublicKey:", [
    F.toObject(pubKey[0]).toString(),
    F.toObject(pubKey[1]).toString()
  ]);
  console.log("R8:", [
    F.toObject(signature.R8[0]).toString(),
    F.toObject(signature.R8[1]).toString()
  ]);
  console.log("S:", signature.S.toString());
  console.log("scoreCommitment:", poseidon.F.toString(msg));
  console.log("pymeIdentityCommitment:", poseidon.F.toString(identityCommitment));
}

main().catch(console.error);