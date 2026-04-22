#!/usr/bin/env bash

set -euo pipefail

# ---------------------------------------------------------------------
# CONFIG (CORREGIDO)
# ---------------------------------------------------------------------
NAME="ScoreProof_v2"
HERE="$(cd "$(dirname "$0")" && pwd)"
CIRCUIT_DIR="${HERE}/circuits/main"
BUILD_DIR="${HERE}/build"
NODE_MODULES="${HERE}/../node_modules"

PTAU_URL="https://hermez.s3-eu-west-1.amazonaws.com/powersOfTau28_hez_final_14.ptau"
PTAU_FILE="${BUILD_DIR}/pot14_final.ptau"

mkdir -p "${BUILD_DIR}"

# ---------------------------------------------------------------------
# 0. SANITY CHECK
# ---------------------------------------------------------------------
if [ ! -f "${CIRCUIT_DIR}/${NAME}.circom" ]; then
  echo "[err] ${CIRCUIT_DIR}/${NAME}.circom not found." >&2
  exit 1
fi

# ---------------------------------------------------------------------
# 1. PHASE-1 PTAU
# ---------------------------------------------------------------------
echo "==> [1/5] Phase-1 ptau"
if [ ! -f "${PTAU_FILE}" ]; then
  curl -L -o "${PTAU_FILE}" "${PTAU_URL}"
fi

# ---------------------------------------------------------------------
# 2. COMPILE
# ---------------------------------------------------------------------
echo "==> [2/5] circom compile"
circom "${CIRCUIT_DIR}/${NAME}.circom" \
  --r1cs --wasm --sym \
  -o "${BUILD_DIR}" \
  -l "${NODE_MODULES}"

# ---------------------------------------------------------------------
# 3. INFO
# ---------------------------------------------------------------------
echo "==> [3/5] r1cs info"
snarkjs r1cs info "${BUILD_DIR}/${NAME}.r1cs"

# ---------------------------------------------------------------------
# 4. SETUP
# ---------------------------------------------------------------------
echo "==> [4/5] groth16 setup"
snarkjs groth16 setup \
  "${BUILD_DIR}/${NAME}.r1cs" \
  "${PTAU_FILE}" \
  "${BUILD_DIR}/${NAME}_0000.zkey"

snarkjs zkey contribute \
  "${BUILD_DIR}/${NAME}_0000.zkey" \
  "${BUILD_DIR}/${NAME}_final.zkey" \
  --name="local-dev" \
  -v -e="$(openssl rand -hex 32)"

# ---------------------------------------------------------------------
# 5. EXPORT VERIFIER
# ---------------------------------------------------------------------
echo "==> [5/5] export verifier"
snarkjs zkey export verificationkey \
  "${BUILD_DIR}/${NAME}_final.zkey" \
  "${BUILD_DIR}/verification_key.json"

snarkjs zkey export solidityverifier \
  "${BUILD_DIR}/${NAME}_final.zkey" \
  "${HERE}/../contracts/ScoreProofVerifier.sol"

# Renombrar contrato
sed -i.bak 's/contract Groth16Verifier/contract ScoreProofVerifier/' \
  "${HERE}/../contracts/ScoreProofVerifier.sol"
rm -f "${HERE}/../contracts/ScoreProofVerifier.sol.bak"

# ---------------------------------------------------------------------
# DONE
# ---------------------------------------------------------------------
echo
echo "✅ BUILD COMPLETADO"
echo
echo "Artifacts:"
echo "  r1cs             ${BUILD_DIR}/${NAME}.r1cs"
echo "  wasm             ${BUILD_DIR}/${NAME}_js/${NAME}.wasm"
echo "  proving key      ${BUILD_DIR}/${NAME}_final.zkey"
echo "  verification key ${BUILD_DIR}/verification_key.json"
echo "  verifier.sol     ../contracts/ScoreProofVerifier.sol"