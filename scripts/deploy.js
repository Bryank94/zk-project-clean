async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying with:", deployer.address);

  const Verifier = await ethers.getContractFactory("ScoreProofVerifier");

  const verifier = await Verifier.deploy();

  await verifier.waitForDeployment();

  console.log("Verifier deployed to:", await verifier.getAddress());
}

main();
