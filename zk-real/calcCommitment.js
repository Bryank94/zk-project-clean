const circomlibjs = require("circomlibjs");

async function main() {
  const poseidon = await circomlibjs.buildPoseidon();

  const inputs = [
    80,    // rawScore
    999,   // pymeWallet
    1,     // modelVersion
    1000,  // timestamp
    2000,  // expiration
    111    // commitmentSecret
  ];

  const hash = poseidon(inputs);
  const hashString = poseidon.F.toString(hash);

  console.log("scoreCommitment =", hashString);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});