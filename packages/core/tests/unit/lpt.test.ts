import { describe, expect, it } from 'vitest';
import { lpt } from '../../src/scheduler/lpt';
import { lowerBound } from '../../src/scheduler/bounds';
import { mulberry32, randomInt } from '../helpers/random';

describe('lpt', () => {
  it('puts everything on a single shard when shardCount is 1', () => {
    const result = lpt([10, 20, 5], 1);
    expect(result.makespan).toBe(35);
    expect(result.assignment[0]).toHaveLength(3);
  });

  it('reaches pmax when there are at least as many shards as tasks', () => {
    const result = lpt([10, 20, 5], 5);
    expect(result.makespan).toBe(20);
  });

  it('solves the classic [10, 10, 5] with 2 shards optimally', () => {
    expect(lpt([10, 10, 5], 2).makespan).toBe(15);
  });

  it('assigns every task exactly once (no loss, no duplication)', () => {
    const durations = [7, 3, 9, 1, 4, 4, 8];
    const { assignment } = lpt(durations, 3);
    const seen = assignment.flat().sort((a, b) => a - b);
    expect(seen).toEqual([0, 1, 2, 3, 4, 5, 6]);
  });

  it('reports loads consistent with the assignment', () => {
    const durations = [6, 2, 8, 3];
    const { assignment, loads, makespan } = lpt(durations, 2);
    assignment.forEach((tasks, shard) => {
      const sum = tasks.reduce((acc, index) => acc + durations[index], 0);
      expect(loads[shard]).toBe(sum);
    });
    expect(makespan).toBe(Math.max(...loads));
  });

  it('handles an empty task list', () => {
    const result = lpt([], 3);
    expect(result.makespan).toBe(0);
    expect(result.assignment).toEqual([[], [], []]);
  });

  it('rejects invalid shard counts', () => {
    expect(() => lpt([1], 0)).toThrow(RangeError);
    expect(() => lpt([1], -1)).toThrow(RangeError);
    expect(() => lpt([1], 2.5)).toThrow(RangeError);
  });

  it('rejects negative or non-finite durations', () => {
    expect(() => lpt([-5], 2)).toThrow(RangeError);
    expect(() => lpt([Number.NaN], 2)).toThrow(RangeError);
    expect(() => lpt([Number.POSITIVE_INFINITY], 2)).toThrow(RangeError);
  });

  it('never beats the lower bound on 100 random instances', () => {
    const random = mulberry32(42);
    for (let i = 0; i < 100; i++) {
      const taskCount = randomInt(random, 1, 12);
      const shardCount = randomInt(random, 1, 5);
      const durations = Array.from({ length: taskCount }, () => randomInt(random, 1, 300));
      const { makespan } = lpt(durations, shardCount);
      expect(makespan).toBeGreaterThanOrEqual(lowerBound(durations, shardCount));
    }
  });
});
