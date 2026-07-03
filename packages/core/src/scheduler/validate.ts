/** Shared input validation for every scheduler entry point. */

export function assertValidShardCount(shardCount: number): void {
  if (!Number.isInteger(shardCount) || shardCount < 1) {
    throw new RangeError(`shardCount must be an integer >= 1, got ${shardCount}`);
  }
}

export function assertValidDurations(durations: readonly number[]): void {
  for (const duration of durations) {
    if (!Number.isFinite(duration) || duration < 0) {
      throw new RangeError(`durations must be finite numbers >= 0, got ${duration}`);
    }
  }
}
