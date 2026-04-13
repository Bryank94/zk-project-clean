const { ethers } = require("hardhat");
const fs = require("fs");

async function main() {

    const addr = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512"; // tu contrato

    const verifier = await ethers.getContractAt("Groth16Verifier", addr);

    const proof = JSON.parse(fs.readFileSync("zk-real/build/proof.json"));
    const pub = JSON.parse(fs.readFileSync("zk-real/build/public.json"));

    const a = [
        proof.pi_a[0],
        proof.pi_a[1]
    ];

    const b = [
        [proof.pi_b[0][1], proof.pi_b[0][0]],
        [proof.pi_b[1][1], proof.pi_b[1][0]]
    ];

    const c = [
        proof.pi_c[0],
        proof.pi_c[1]
    ];

    const ok = await verifier.verifyProof(a, b, c, pub);

    console.log("RESULT:", ok);
}

main();