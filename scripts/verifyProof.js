const { ethers } = require("hardhat");
const fs = require("fs");

async function main() {

    // Dirección de tu contrato (la que te salió)
    const verifierAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

    const Verifier = await ethers.getContractFactory("Groth16Verifier");
    const verifier = Verifier.attach(verifierAddress);

    // Leer archivos generados por snarkjs
    const proof = JSON.parse(fs.readFileSync("zk-real/build/proof.json"));
    const publicSignals = JSON.parse(fs.readFileSync("zk-real/build/public.json"));

    // Formatear proof para Solidity
    const a = proof.pi_a.slice(0, 2);
    const b = [
        [proof.pi_b[0][1], proof.pi_b[0][0]],
        [proof.pi_b[1][1], proof.pi_b[1][0]],
    ];
    const c = proof.pi_c.slice(0, 2);

    // Llamar al contrato
    const result = await verifier.verifyProof(a, b, c, publicSignals);

    console.log("Resultado verificación:", result);
}

main();