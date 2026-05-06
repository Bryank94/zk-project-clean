require("dotenv").config();
const { ethers } = require("ethers");

const provider = new ethers.JsonRpcProvider(
    process.env.AMOY_RPC_URL
);

const contractAddress =
    "0x71cc8ff9AaA8D7a2074059F285D907808A0307a6";

const abi = [
    "event ScoreVerified(address indexed user,uint256 threshold,bytes32 indexed nullifier,bytes32 oracleKeyHash)"
];

const contract = new ethers.Contract(
    contractAddress,
    abi,
    provider
);

console.log("Monitoring ScoreVerified events...");

contract.on("ScoreVerified",
    (user, threshold, nullifier) => {

    console.log("=== EVENT DETECTED ===");

    console.log({
        user,
        threshold: threshold.toString(),
        nullifier
    });
});
