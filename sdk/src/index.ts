import * as snarkjs from "snarkjs";

export type ProofInput = Record<string, string | number | string[] | number[]>;

export async function generateScoreProof(
  input: ProofInput,
  wasmPath: string,
  zkeyPath: string
) {
  const { proof, publicSignals } = await snarkjs.groth16.fullProve(
    input,
    wasmPath,
    zkeyPath
  );

  return {
    proof,
    publicSignals,
  };
}

export function formatProofForSolidity(proof: any) {
  return {
    a: proof.pi_a.slice(0, 2),
    b: [
      [proof.pi_b[0][1], proof.pi_b[0][0]],
      [proof.pi_b[1][1], proof.pi_b[1][0]],
    ],
    c: proof.pi_c.slice(0, 2),
  };
}
