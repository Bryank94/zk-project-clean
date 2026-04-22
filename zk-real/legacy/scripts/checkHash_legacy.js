const circomlib = require("circomlibjs");
const fs = require("fs");

async function main() {
  console.log("🚀 Script iniciado");

  const poseidon = await circomlib.buildPoseidon();

  const data = JSON.parse(fs.readFileSync("debug_case.json"));

  const hash = poseidon([
    data.rawScore,
    data.pymeWallet,
    data.modelVersion,
    data.timestamp,
    data.expiration,
    data.commitmentSecret
  ]);

  const hashStr = poseidon.F.toString(hash);

  console.log("Computed hash:", hashStr);
  console.log("Expected:", data.scoreCommitment);
}

main().catch(err => {
  console.error("❌ ERROR:", err);
});