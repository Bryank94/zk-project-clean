# Monitoring Plan

Production monitoring will track:

- ScoreVerified events
- Credential minting events
- Failed transactions
- Contract pauses
- Admin role changes
- Abnormal nullifier reuse attempts
- RPC errors
- Gas spikes

Recommended tools:

- Tenderly alerts
- OpenZeppelin Defender
- Polygon explorer monitoring
- Custom indexer or subgraph

Initial alert rules:

1. Alert if ScoreRegistry is paused
2. Alert if admin role changes
3. Alert on repeated reverted transactions
4. Alert if verifier contract changes
5. Alert on unexpected mint/revoke activity
