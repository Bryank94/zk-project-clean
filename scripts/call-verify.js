const hre = require("hardhat");

async function main() {
  // ⚠️ PON AQUÍ TU DIRECCIÓN REAL DE ScoreRegistry
  const contractAddress = "0x578d766A7DB96F605F0CA2897635060b4675FB14";

  const registry = await hre.ethers.getContractAt("ScoreRegistry", contractAddress);

  const a = [
    "0x133c677f1ce93162afde93fe0722190356ad045636f611b85d13e2f61b1dac39",
    "0x20c22626e86ea2a964a8ea0c09338c7eb82eb5e22b7d11502431019230ffea14"
  ];

  const b = [
    [
      "0x13d334dd223ed94f5d3f043dd62c0ff719a755283796308d2228eb6cbe2fa848",
      "0x269ec194c838ffd39fadf51b72e4d089945857132eb045cff47576bac9dc9535"
    ],
    [
      "0x0c9ef6ec59821360fc6619139e03b196aca8b4f7d6752b57d4c92f4cae6faf6b",
      "0x272d37b2ef2de310a71750d63c10989fdd148069cffa81d46a9d4c38672fa01f"
    ]
  ];

  const c = [
    "0x02df10c9b3d1e1fa4421cdb11c9a01f19b7ac9f0a260508dbb9138624c5dea81",
    "0x1924f1b09d3811508c787c8f9160143cf776886233536a1e88735bcf327d233e"
  ];

  const input = [
    "0x0000000000000000000000000000000000000000000000000000000000000032",
    "0x040b01232a6f9a7789ecbc88a428e5cb6c43720979675dbf1eeb63af7cf99230",
    "0x0e07a1a5749ddc614aa4acbc3212c57824af30c528c4ee08887ad8615634d355",
    "0x1d5ac1f31407018b7d413a4f52c8f74463b30e6ac2238220ad8b254de4eaa3a2",
    "0x1e1de8a908826c3f9ac2e0ceee929ecd0caf3b99b3ef24523aaab796a6f733c4",
    "0x00000000000000000000000000000000000000000000000000000000000005dc",
    "0x000000000000000000000000000000000000000000000000000000000000002a",
    "0x14e9ac767bc214b027817a40346811c837084a7d81c47ac7e2314d75abe50b6f"
  ];

  console.log("Enviando proof...");

  const tx = await registry.verifyScore(a, b, c, input);
  await tx.wait();

  console.log("✅ Proof verificada ON-CHAIN");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});