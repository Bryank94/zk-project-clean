import { ethers } from "ethers";
import * as dotenv from "dotenv";

dotenv.config();

const abi = [
  "function verifyScore(uint256[2],uint256[2][2],uint256[2],uint256[8]) external"
];

function requireEnv(name: string): string {
  const value = process.env[name];

  if (!value || value.startsWith("TU_")) {
    throw new Error(`${name} must be configured with a real value`);
  }

  return value;
}

function getScoreRegistryContract() {
  const provider = new ethers.JsonRpcProvider(requireEnv("AMOY_RPC_URL"));
  const wallet = new ethers.Wallet(requireEnv("PRIVATE_KEY"), provider);

  return new ethers.Contract(
    requireEnv("SCORE_REGISTRY_ADDRESS"),
    abi,
    wallet
  );
}

export const scoreRegistry = {
  verifyScore(
    pA: [string, string],
    pB: [[string, string], [string, string]],
    pC: [string, string],
    publicSignals: string[]
  ) {
    return getScoreRegistryContract().verifyScore(pA, pB, pC, publicSignals);
  },
};
