import { ethers } from "ethers";
import * as dotenv from "dotenv";
import { CreateVerificationDto } from "../verifications/dto/create-verification.dto";

dotenv.config();

const abi = [
  "function verifyScore(uint256[2],uint256[2][2],uint256[2],uint256[8]) external"
];

const scoreRegistryInterface = new ethers.Interface(abi);

function requireEnv(name: string): string {
  const value = process.env[name];

  if (!value || value.startsWith("TU_")) {
    throw new Error(`${name} must be configured with a real value`);
  }

  return value;
}

function getProvider() {
  return new ethers.JsonRpcProvider(requireEnv("AMOY_RPC_URL"));
}

export async function buildVerifyScoreTransaction(body: CreateVerificationDto) {
  const provider = getProvider();
  const network = await provider.getNetwork();
  const to = requireEnv("SCORE_REGISTRY_ADDRESS");

  return {
    to,
    chainId: Number(network.chainId),
    data: scoreRegistryInterface.encodeFunctionData("verifyScore", [
      body.pA,
      body.pB,
      body.pC,
      body.publicSignals,
    ]),
    value: "0x0",
  };
}
