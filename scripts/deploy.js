const fs = require("fs");
const path = require("path");
const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with:", deployer.address);

  const deploymentsDir = path.join(__dirname, "..", "deployments");
  const outputFile = path.join(deploymentsDir, "cardona.json");

  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  const output = {
    network: "cardona",
    deployer: deployer.address,
    timestamp: new Date().toISOString()
  };

  const ScoreProofVerifier = await hre.ethers.getContractFactory("ScoreProofVerifier");
  const verifier = await ScoreProofVerifier.deploy();
  await verifier.waitForDeployment();
  output.ScoreProofVerifier = await verifier.getAddress();
  console.log("ScoreProofVerifier:", output.ScoreProofVerifier);

  const ScoreRegistry = await hre.ethers.getContractFactory("ScoreRegistry");
  const registry = await ScoreRegistry.deploy(output.ScoreProofVerifier, deployer.address);
  await registry.waitForDeployment();
  output.ScoreRegistry = await registry.getAddress();
  console.log("ScoreRegistry:", output.ScoreRegistry);

  const WenalyzeSBT = await hre.ethers.getContractFactory("WenalyzeSBT");
  const sbt = await WenalyzeSBT.deploy(deployer.address);
  await sbt.waitForDeployment();
  output.WenalyzeSBT = await sbt.getAddress();
  console.log("WenalyzeSBT:", output.WenalyzeSBT);

  fs.writeFileSync(outputFile, JSON.stringify(output, null, 2));
  console.log("Saved deployment file:", outputFile);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});