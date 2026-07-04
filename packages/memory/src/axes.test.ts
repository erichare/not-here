import { describe, expect, it } from 'vitest';
import { CHARACTERS } from '@not-here/engine';
import {
  AXES,
  AXIS_BASELINE,
  DEFAULT_AXIS_WEIGHTS,
  axisValue,
  tagMatches,
} from './axes.ts';
import type { AxisWeightRule } from './axes.ts';
import { makeState } from './testing/fixtures.ts';

describe('tagMatches', () => {
  it('matches exact tags', () => {
    expect(tagMatches('kindness', 'kindness')).toBe(true);
    expect(tagMatches('kindness', 'kindness-extra')).toBe(false);
  });

  it('matches prefix patterns ending in *', () => {
    expect(tagMatches('helped-*', 'helped-sam')).toBe(true);
    expect(tagMatches('helped-*', 'helped-dianne')).toBe(true);
    expect(tagMatches('helped-*', 'harmed-sam')).toBe(false);
  });
});

describe('axisValue', () => {
  it('returns the baseline for every axis when no facts are known', () => {
    const state = makeState([]);
    for (const who of CHARACTERS) {
      for (const axis of AXES) {
        expect(axisValue(state, who, axis)).toBe(AXIS_BASELINE);
      }
    }
  });

  it('only counts facts the character actually knows', () => {
    const state = makeState([{ tag: 'kindness', knownBy: ['dianne'] }]);
    expect(axisValue(state, 'dianne', 'warmth')).toBe(AXIS_BASELINE + 1);
    expect(axisValue(state, 'wade', 'warmth')).toBe(AXIS_BASELINE);
  });

  it('adds warmth for helped-* wildcard facts', () => {
    const state = makeState([
      { tag: 'helped-sam', knownBy: ['priya'] },
      { tag: 'helped-barb', knownBy: ['priya'] },
    ]);
    expect(axisValue(state, 'priya', 'warmth')).toBe(AXIS_BASELINE + 2);
  });

  it('subtracts trust heavily for lie-caught and contradiction', () => {
    const state = makeState([
      { tag: 'lie-caught', knownBy: ['priya'] },
      { tag: 'contradiction', knownBy: ['priya'] },
    ]);
    expect(axisValue(state, 'priya', 'trust')).toBe(0); // 5 - 3 - 3, clamped
    expect(axisValue(state, 'priya', 'fear')).toBe(AXIS_BASELINE + 1);
  });

  it('adds trust for defended-sam only for tam and sam', () => {
    const state = makeState([
      { tag: 'defended-sam', knownBy: ['tam', 'sam', 'dianne'] },
    ]);
    expect(axisValue(state, 'tam', 'trust')).toBe(AXIS_BASELINE + 2);
    expect(axisValue(state, 'sam', 'trust')).toBe(AXIS_BASELINE + 2);
    expect(axisValue(state, 'dianne', 'trust')).toBe(AXIS_BASELINE);
  });

  it('applies the ECHO paradox: memory-taken cools warmth, raises trust and fear — for the character it is about', () => {
    const state = makeState([
      { tag: 'memory-taken', about: 'barb', knownBy: ['barb', 'priya'] },
    ]);
    expect(axisValue(state, 'barb', 'warmth')).toBe(AXIS_BASELINE - 2);
    expect(axisValue(state, 'barb', 'trust')).toBe(AXIS_BASELINE + 1);
    expect(axisValue(state, 'barb', 'fear')).toBe(AXIS_BASELINE + 1);
    // Priya knows the fact but it is not about her — aboutKnowerOnly rules skip.
    expect(axisValue(state, 'priya', 'warmth')).toBe(AXIS_BASELINE);
    expect(axisValue(state, 'priya', 'trust')).toBe(AXIS_BASELINE);
  });

  it('clamps to the 0..10 range', () => {
    const lies = Array.from({ length: 6 }, () => ({
      tag: 'lie-caught',
      knownBy: ['sam'] as const,
    }));
    const kind = Array.from({ length: 12 }, () => ({
      tag: 'kindness',
      knownBy: ['sam'] as const,
    }));
    expect(axisValue(makeState(lies), 'sam', 'trust')).toBe(0);
    expect(axisValue(makeState(kind), 'sam', 'warmth')).toBe(10);
  });

  it('accepts a writer-extended weight table', () => {
    const extended: readonly AxisWeightRule[] = [
      ...DEFAULT_AXIS_WEIGHTS,
      { tag: 'shared-tea', axis: 'warmth', delta: 3 },
    ];
    const state = makeState([{ tag: 'shared-tea', knownBy: ['dianne'] }]);
    expect(axisValue(state, 'dianne', 'warmth', extended)).toBe(AXIS_BASELINE + 3);
    expect(axisValue(state, 'dianne', 'warmth')).toBe(AXIS_BASELINE);
  });

  it('never mutates the input state', () => {
    const state = makeState([{ tag: 'kindness', knownBy: ['dianne'] }]);
    const snapshot = JSON.stringify(state);
    axisValue(state, 'dianne', 'warmth');
    expect(JSON.stringify(state)).toBe(snapshot);
  });
});
