const circomlib = require("circomlibjs");
const fs = require("fs");

async function main() {
  console.log("🚀 Verificando firma");

  const eddsa = await circomlib.buildEddsa();
  const poseidon = await circomlib.buildPoseidon();

  const data = JSON.parse(fs.readFileSync("debug_case.json"));

  // reconstruir mensaje EXACTO
  const msg = poseidon([
    data.rawScore,
    data.pymeWallet,
    data.modelVersion,
    data.timestamp,
    data.expiration,
    data.commitmentSecret
  ]);

  const msgBig = poseidon.F.toObject(msg);

  // 👉 IMPORTANTE: sin unpack
  const pubKey = [
    BigInt(data.issuerPublicKey[0]),
    BigInt(data.issuerPublicKey[1])
  ];

  const signature = {
    R8: [
      BigInt(data.R8[0]),
      BigInt(data.R8[1])
    ],
    S: BigInt(data.S)
  };

  const valid = eddsa.verifyPoseidon(msgBig, signature, pubKey);

  console.log("Firma válida:", valid);
}

main().catch(err => {
  console.error("❌ ERROR:", err);
});