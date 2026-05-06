import { ScoreVerified as ScoreVerifiedEvent } from "../generated/ScoreRegistry/ScoreRegistry";
import { ScoreVerified } from "../generated/schema";

export function handleScoreVerified(event: ScoreVerifiedEvent): void {
  let entity = new ScoreVerified(
    event.transaction.hash.toHex() + "-" + event.logIndex.toString()
  );

  entity.user = event.params.user;
  entity.threshold = event.params.threshold;
  entity.nullifier = event.params.nullifier;
  entity.oracleKeyHash = event.params.oracleKeyHash;

  entity.save();
}
