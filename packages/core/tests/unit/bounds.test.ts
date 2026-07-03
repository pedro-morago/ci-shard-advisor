import { describe, expect, it } from 'vitest';
import { avgBound, lowerBound, pmaxBound } from '../../src/scheduler/bounds';
import { lpt } from '../../src/scheduler/lpt';
import { mulberry32, randomInt } from '../helpers/random';

describe('bounds', () => {
  it('avgBound spreads total work across shards', () => {
    expect(avgBound([10, 10, 5], 2)).toBe(12.5);
    expect(avgBound([10, 10, 5], 1)).toBe(25);
  });

  it('pmaxBound returns the longest single task', () => {
    expect(pmaxBound([10, 10, 5])).toBe(10);
    expect(pmaxBound([])).toBe(0);
  });

  it('lowerBound is the max of both bounds', () => {
    expect(lowerBound([10, 10, 5], 2)).toBe(12.5);
    expect(lowerBound([100, 1, 1], 3)).toBe(100);
  });

  it('rejects invalid shard counts', () => {
    expect(() => avgBound([1], 0)).toThrow(RangeError);
    expect(() => lowerBound([1], -2)).toThrow(RangeError);
  });

  it('rejects negative or non-finite durations', () => {
    expect(() => pmaxBound([-1])).toThrow(RangeError);
    expect(() => avgBound([Number.NaN], 2)).toThrow(RangeError);
  });

  it('never exceeds the LPT makespan on 200 random instances', () => {
    const random = mulberry32(7);
    for (let i = 0; i < 200; i++) {
      const taskCount = randomInt(random, 1, 15);
      const shardCount = randomInt(random, 1, 6);
      const durations = Array.from({ length: taskCount }, () => randomInt(random, 1, 500));
      const bound = lowerBound(durations, shardCount);
      const { makespan } = lpt(durations, shardCount);
      expect(bound).toBeLessThanOrEqual(makespan);
    }
  });
});
