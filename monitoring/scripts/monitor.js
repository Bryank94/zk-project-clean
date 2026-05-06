require("dotenv").config();

const fs = require("fs");
const path = require("path");
const { ethers } = require("ethers");

const contractAddress =
  process.env.SCORE_REGISTRY_ADDRESS ||
  "0x71cc8ff9AaA8D7a2074059F285D907808A0307a6";

const abi = [
  "event ScoreVerified(address indexed user,uint256 threshold,bytes32 indexed nullifier,bytes32 oracleKeyHash)",
];

const logsDir = path.join(process.cwd(), "logs");
const logFile = path.join(logsDir, "score-verified-events.log");
const retryMs = Number(process.env.MONITOR_RETRY_MS || 5000);
let contract;
let provider;
let retryTimer;

function requireEnv(name) {
  const value = process.env[name];

  if (!value || value.startsWith("TU_")) {
    throw new Error(`${name} must be configured with a real value`);
  }

  return value;
}

function writeLog(message, payload) {
  fs.mkdirSync(logsDir, { recursive: true });

  const entry = {
    timestamp: new Date().toISOString(),
    message,
    ...(payload ? { payload } : {}),
  };

  const line = JSON.stringify(entry);
  console.log(line);
  fs.appendFileSync(logFile, `${line}\n`);
}

function scheduleReconnect(error) {
  writeLog("monitor_reconnect_scheduled", {
    error: error instanceof Error ? error.message : String(error),
    retryMs,
  });

  if (contract) {
    contract.removeAllListeners("ScoreVerified");
  }

  clearTimeout(retryTimer);
  retryTimer = setTimeout(start, retryMs);
}

function start() {
  try {
    provider = new ethers.JsonRpcProvider(requireEnv("AMOY_RPC_URL"));
    contract = new ethers.Contract(contractAddress, abi, provider);

    writeLog("monitor_started", { contractAddress });

    contract.on("ScoreVerified", (user, threshold, nullifier, oracleKeyHash, event) => {
      writeLog("score_verified", {
        user,
        threshold: threshold.toString(),
        nullifier,
        oracleKeyHash,
        txHash: event.log.transactionHash,
        blockNumber: event.log.blockNumber,
      });
    });

    provider.on("error", scheduleReconnect);
  } catch (error) {
    scheduleReconnect(error);
  }
}

process.on("SIGINT", () => {
  writeLog("monitor_stopped");

  if (contract) {
    contract.removeAllListeners("ScoreVerified");
  }

  clearTimeout(retryTimer);
  process.exit(0);
});

start();
