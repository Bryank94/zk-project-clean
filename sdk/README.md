# @esencia/zk-sdk

Client-side SDK for generating Wenalyze zero-knowledge proofs.

## Install

```bash
npm install @esencia/zk-sdk
```

## Usage

```ts
import { generateScoreProof, formatProofForSolidity } from "@esencia/zk-sdk";

const { proof, publicSignals } = await generateScoreProof(
  input,
  "/circuits/ScoreProof_v2.wasm",
  "/circuits/ScoreProof_v2_final.zkey"
);

const solidityProof = formatProofForSolidity(proof);
```
