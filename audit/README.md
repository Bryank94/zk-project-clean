# Security Review

Automated tools executed:

- Hardhat tests
- Solidity compilation
- zk proof verification
- Replay protection testing
- npm dependency audit
- API build with DTO validation enabled
- Subgraph codegen and build
- Monitoring watcher smoke test

Slither status:

- Slither was requested for automated Solidity analysis.
- It could not be installed in the current WSL environment because `pip3` is not installed and `sudo apt install python3-pip -y` requires an interactive password.
- Run Slither manually before mainnet deployment once WSL has `python3-pip` available.

Recommended Slither command:

```bash
cd /mnt/c/Users/Usuario/OneDrive/Escritorio/zk-project
slither .
```

npm audit status:

- API: 0 vulnerabilities reported.
- Root project: no critical vulnerabilities, but high/moderate/low dependency advisories remain in development tooling dependencies.
- SDK: no critical vulnerabilities, but high dependency advisories remain through `snarkjs` transitive dependencies.
- Subgraph: no critical vulnerabilities, but dependency advisories remain in Graph tooling dependencies.

Current status:

- No critical vulnerabilities identified during the automated checks completed in this environment.
- The API no longer requires a custodial backend private key for proof verification transactions.
- Project still requires Slither execution, dependency remediation review, and an external audit before mainnet deployment.
