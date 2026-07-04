import { describe, expect, it } from 'vitest';
import { propagateGossip } from './gossip.ts';
import type { GossipEdge } from './gossip.ts';
import { makeState } from './testing/fixtures.ts';

describe('propagateGossip', () => {
  it('spreads known facts along an edge with certainty when chance is omitted', () => {
    const state = makeState([{ tag: 'lie-caught', knownBy: ['priya'] }]);
    const next = propagateGossip(state, [{ from: 'priya', to: 'barb' }]);
    expect(next.knownBy.barb).toContain(0);
    expect(next.knownBy.priya).toEqual([0]);
  });

  it('never propagates facts with the private: tag prefix', () => {
    const state = makeState([
      { tag: 'private:shard-dianne', knownBy: ['dianne'] },
      { tag: 'kindness', knownBy: ['dianne'] },
    ]);
    const next = propagateGossip(state, [{ from: 'dianne', to: 'wade', chance: 1 }]);
    expect(next.knownBy.wade).toContain(1);
    expect(next.knownBy.wade).not.toContain(0);
  });

  it('respects the edge tag filter', () => {
    const state = makeState([
      { tag: 'kindness', knownBy: ['sam'] },
      { tag: 'lie-caught', knownBy: ['sam'] },
    ]);
    const next = propagateGossip(state, [
      { from: 'sam', to: 'tam', tags: ['lie-caught'] },
    ]);
    expect(next.knownBy.tam).toEqual([1]);
  });

  it('is deterministic: same state and edges give identical results', () => {
    const state = makeState(
      Array.from({ length: 5 }, (_, i) => ({
        tag: `rumor-${i}`,
        knownBy: ['barb'] as const,
      })),
      1234,
    );
    const edges: readonly GossipEdge[] = [
      { from: 'barb', to: 'dianne', chance: 0.5 },
      { from: 'barb', to: 'tam', chance: 0.5 },
    ];
    const a = propagateGossip(state, edges);
    const b = propagateGossip(state, edges);
    expect(a).toEqual(b);
  });

  it('advances rngState when probabilistic edges roll', () => {
    const state = makeState([{ tag: 'rumor', knownBy: ['wade'] }]);
    const next = propagateGossip(state, [{ from: 'wade', to: 'priya', chance: 0.5 }]);
    expect(next.rngState).not.toBe(state.rngState);
  });

  it('chance 0 spreads nothing but still advances the rng deterministically', () => {
    const state = makeState([{ tag: 'rumor', knownBy: ['wade'] }]);
    const next = propagateGossip(state, [{ from: 'wade', to: 'priya', chance: 0 }]);
    expect(next.knownBy.priya).toEqual([]);
    expect(next.rngState).not.toBe(state.rngState);
  });

  it('is one hop per pass: chained edges do not relay in a single pass', () => {
    const state = makeState([{ tag: 'rumor', knownBy: ['dianne'] }]);
    const next = propagateGossip(state, [
      { from: 'dianne', to: 'barb' },
      { from: 'barb', to: 'tam' },
    ]);
    expect(next.knownBy.barb).toContain(0);
    expect(next.knownBy.tam).not.toContain(0);
    // A second pass carries it the next hop.
    const later = propagateGossip(next, [{ from: 'barb', to: 'tam' }]);
    expect(later.knownBy.tam).toContain(0);
  });

  it('does not duplicate facts the target already knows', () => {
    const state = makeState([{ tag: 'kindness', knownBy: ['priya', 'barb'] }]);
    const next = propagateGossip(state, [{ from: 'priya', to: 'barb' }]);
    expect(next.knownBy.barb).toEqual([0]);
  });

  it('returns the same reference when nothing changes', () => {
    const state = makeState([{ tag: 'private:secret', knownBy: ['barb'] }]);
    const next = propagateGossip(state, [{ from: 'barb', to: 'sam' }]);
    expect(next).toBe(state);
  });

  it('never mutates the input state', () => {
    const state = makeState([{ tag: 'rumor', knownBy: ['dianne'] }]);
    const snapshot = JSON.stringify(state);
    propagateGossip(state, [
      { from: 'dianne', to: 'barb' },
      { from: 'dianne', to: 'sam', chance: 0.5 },
    ]);
    expect(JSON.stringify(state)).toBe(snapshot);
  });
});
