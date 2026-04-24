const fs = require("fs");
const path = require("path");

function main() {
  const deploymentPath = path.join(__dirname, "..", "deployments", "cardona.json");
  const buildDir = path.join(__dirname, "..", "zk-real", "build");

  if (!fs.existsSync(deploymentPath)) {
    throw new Error("No existe deployments/cardona.json");
  }

  const deployment = JSON.parse(fs.readFileSync(deploymentPath, "utf8"));

  const requiredFiles = [
    "verification_key.json"
  ];

  for (const file of requiredFiles) {
    const fullPath = path.join(buildDir, file);
    if (!fs.existsSync(fullPath)) {
      throw new Error(`Falta artefacto requerido: ${fullPath}`);
    }
  }

  console.log("Deployment file:", deploymentPath);
  console.log("Verifier:", deployment.ScoreProofVerifier);
  console.log("Registry:", deployment.ScoreRegistry);
  console.log("WenalyzeSBT:", deployment.WenalyzeSBT);
  console.log("Artifacts OK in:", buildDir);
}

try {
  main();
} catch (err) {
  console.error(err.message);
  process.exit(1);
}