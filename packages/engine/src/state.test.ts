import { describe, expect, it } from 'vitest';
import {
  SAVE_SCHEMA_VERSION,
  clampMeter,
  clampStat,
  initialState,
  nextRandom,
} from './state.ts';

describe('initialState', () => {
  it('produces the documented starting shape', () => {
    const state = initialState(42, 'opening');
    expect(state).toEqual({
      day: 1,
      slot: 'night',
      sceneId: 'opening',
      stats: { flesh: 3, name: 2, echo: 2, undertow: 1 },
      chord: 0,
      staticMeter: 10,
      facts: [],
      knownBy: { dianne: [], wade: [], priya: [], sam: [], barb: [], tam: [] },
      flags: {},
      rngState: 42,
      choiceLog: [],
      v: SAVE_SCHEMA_VERSION,
    });
  });

  it('is deterministic: same inputs produce deep-equal states', () => {
    expect(initialState(123, 'a')).toEqual(initialState(123, 'a'));
  });

  it('returns a fresh object each call (no shared references)', () => {
    const a = initialState(7, 's');
    const b = initialState(7, 's');
    expect(a).not.toBe(b);
    expect(a.stats).not.toBe(b.stats);
    expect(a.knownBy).not.toBe(b.knownBy);
  });

  it('coerces the seed to an unsigned 32-bit integer', () => {
    expect(initialState(-1, 's').rngState).toBe(0xffffffff);
    expect(initialState(2 ** 32 + 5, 's').rngState).toBe(5);
  });
});

describe('nextRandom', () => {
  it('is pure: same input state always yields the same pair', () => {
    const first = nextRandom(42);
    const second = nextRandom(42);
    expect(first).toEqual(second);
  });

  it('returns a value in [0, 1)', () => {
    let rng = 987654321;
    for (let i = 0; i < 100; i += 1) {
      const [value, next] = nextRandom(rng);
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
      rng = next;
    }
  });

  it('produces a reproducible sequence from the same seed', () => {
    const run = (seed: number, steps: number): number[] => {
      const values: number[] = [];
      let rng = seed;
      for (let i = 0; i < steps; i += 1) {
        const [value, next] = nextRandom(rng);
        values.push(value);
        rng = next;
      }
      return values;
    };
    expect(run(2024, 20)).toEqual(run(2024, 20));
  });

  it('advances the state (state changes between steps)', () => {
    const [, next] = nextRandom(42);
    expect(next).not.toBe(42);
    const [, nextNext] = nextRandom(next);
    expect(nextNext).not.toBe(next);
  });

  it('different seeds produce different sequences', () => {
    const [a] = nextRandom(1);
    const [b] = nextRandom(2);
    expect(a).not.toBe(b);
  });
});

describe('clampStat', () => {
  it('clamps below 0 to 0', () => {
    expect(clampStat(-1)).toBe(0);
    expect(clampStat(-100)).toBe(0);
  });

  it('clamps above 10 to 10', () => {
    expect(clampStat(11)).toBe(10);
    expect(clampStat(999)).toBe(10);
  });

  it('passes through values inside [0, 10]', () => {
    expect(clampStat(0)).toBe(0);
    expect(clampStat(5)).toBe(5);
    expect(clampStat(10)).toBe(10);
  });
});

describe('clampMeter', () => {
  it('clamps below 0 to 0', () => {
    expect(clampMeter(-5)).toBe(0);
  });

  it('clamps above 100 to 100', () => {
    expect(clampMeter(101)).toBe(100);
    expect(clampMeter(10000)).toBe(100);
  });

  it('passes through values inside [0, 100]', () => {
    expect(clampMeter(0)).toBe(0);
    expect(clampMeter(50)).toBe(50);
    expect(clampMeter(100)).toBe(100);
  });
});
