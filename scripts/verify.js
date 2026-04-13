const hre = require("hardhat");

async function main() {
  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

  const Verifier = await hre.ethers.getContractFactory("Groth16Verifier");
  const verifier = await Verifier.attach(contractAddress);

  const a = [
    "0x0deae75b86e418df7a99e1ec329b259b01c2aa392ab73276829a6c6bde13809f",
    "0x07a90b1b4020d36b10502d161ca104ebdf654d5bd8d80c8f8b2b094d427f179d"
  ];

  const b = [
    [
      "0x2f0eedd2096ba1130d2ee4bb7544846b3b661754ce92b8ab090c70f6f9d7d4ef",
      "0x105462a8e11302ea4c98ee40d6e734a74064f5d182ca6f49c7d8357a10af0f19"
    ],
    [
      "0x10b6d951a173830440c8f31ea5d052f9a68b4dd0692d4bd27ebf1520997064e4",
      "0x09561e84d5e2fc2c5c07e8ef75612e680b6b0c196a9ef517b2da94478d8ead3f"
    ]
  ];

  const c = [
    "0x22fa063206108c87107d1c51849e7ee76422d4448294082cadd06653898cda55",
    "0x16d144dc5d2a3195c80d24fd98bdef5919fd2f70b96e0050bc794c5c3a6cbf42"
  ];

  const input = [
    "0x00000000000000000000000000000000000000000000000000000000000002ee"
  ];

  const result = await verifier.verifyProof(a, b, c, input);

  console.log("✅ Resultado on-chain:", result);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});