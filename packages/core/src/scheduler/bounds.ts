import { assertValidDurations, assertValidShardCount } from './validate';

/**
 * Ideal average load: total work spread perfectly across all shards.
 * No schedule can finish faster than this.
 *
 * Note: with strictly integer durations, Math.ceil(total / shardCount)
 * would be a slightly tighter valid bound. We keep the continuous version
 * so the solver stays correct for fractional durations too (aggregated
 * Playwright timings are not guaranteed to be integers).
 */
export function avgBound(durations: readonly number[], shardCount: number): number {
  assertValidShardCount(shardCount);
  assertValidDurations(durations);
  const total = durations.reduce((acc, duration) => acc + duration, 0);
  return total / shardCount;
}

/**
 * The longest single task. A shard must run it from start to finish,
 * so no schedule can ever beat it, no matter how many shards exist.
 */
export function pmaxBound(durations: readonly number[]): number {
  assertValidDurations(durations);
  let max = 0;
  for (const duration of durations) {
    if (duration > max) max = duration;
  }
  return max;
}

/**
 * Best known lower bound for the makespan:
 * the max of the average bound and the longest-task bound.
 * Used by branch and bound to prune nodes and to report the gap.
 */
export function lowerBound(durations: readonly number[], shardCount: number): number {
  return Math.max(avgBound(durations, shardCount), pmaxBound(durations));
}
