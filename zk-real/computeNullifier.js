const circomlibjs = require("circomlibjs");

async function main() {
  const poseidon = await circomlibjs.buildPoseidon();

  // Usa los mismos valores que tienes en input.json
  const pymeWallet = 999;
  const challenge = 42;
  const commitmentSecret = 111;

  const nullifier = poseidon([
    pymeWallet,
    challenge,
    commitmentSecret
  ]);

  console.log("nullifier:", poseidon.F.toString(nullifier));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});