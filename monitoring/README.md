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

## Event Watcher

Run the minimal event watcher from the project root:

```bash
node monitoring/scripts/monitor.js
```

Required environment variables:

- `AMOY_RPC_URL`
- `SCORE_REGISTRY_ADDRESS` optional; defaults to the Amoy ScoreRegistry deployment
- `MONITOR_RETRY_MS` optional; defaults to `5000`

The watcher writes structured JSON lines to:

```text
logs/score-verified-events.log
```
