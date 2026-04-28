const fs = require("fs");
const path = require("path");
const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  const networkName = hre.network.name;

  console.log("Deploying with:", deployer.address);
  console.log("Network:", networkName);

  const deploymentsDir = path.join(__dirname, "..", "deployments");
  const outputFile = path.join(deploymentsDir, `${networkName}.json`);

  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  const output = {
    network: networkName,
    deployer: deployer.address,
    timestamp: new Date().toISOString()
  };

  try {
    // 🔥 Deploy Verifier
    const ScoreProofVerifier = await hre.ethers.getContractFactory("ScoreProofVerifier");
    const verifier = await ScoreProofVerifier.deploy();
    await verifier.waitForDeployment();

    const verifierAddress = await verifier.getAddress();
    if (!verifierAddress) throw new Error("Verifier deployment failed");

    output.ScoreProofVerifier = verifierAddress;
    console.log("ScoreProofVerifier:", verifierAddress);

    // 🔥 Deploy Registry
    const ScoreRegistry = await hre.ethers.getContractFactory("ScoreRegistry");
    const registry = await ScoreRegistry.deploy(verifierAddress, deployer.address);
    await registry.waitForDeployment();

    const registryAddress = await registry.getAddress();
    if (!registryAddress) throw new Error("Registry deployment failed");

    output.ScoreRegistry = registryAddress;
    console.log("ScoreRegistry:", registryAddress);

    // 🔥 Deploy SBT
    const WenalyzeSBT = await hre.ethers.getContractFactory("WenalyzeSBT");
    const sbt = await WenalyzeSBT.deploy(deployer.address);
    await sbt.waitForDeployment();

    const sbtAddress = await sbt.getAddress();
    if (!sbtAddress) throw new Error("SBT deployment failed");

    output.WenalyzeSBT = sbtAddress;
    console.log("WenalyzeSBT:", sbtAddress);

    // 💾 Guardar JSON SOLO si todo salió bien
    fs.writeFileSync(outputFile, JSON.stringify(output, null, 2));
    console.log("Saved deployment file:", outputFile);

  } catch (err) {
    console.error("❌ DEPLOY FAILED:");
    console.error(err);
    process.exit(1); // 🔥 corta ejecución si algo falla
  }
}

main();