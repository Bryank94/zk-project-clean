declare module "snarkjs" {
  export const groth16: {
    fullProve: (
      input: unknown,
      wasmFile: string,
      zkeyFileName: string
    ) => Promise<{ proof: any; publicSignals: any }>;
  };
}
