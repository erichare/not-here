/**
 * Gossip propagation — knowledge moves between characters off-screen.
 *
 * One pass = one hop: edges are evaluated against a snapshot of who knew what
 * BEFORE the pass, so a fact never travels two edges in a single pass (call
 * propagateGossip once per scene transition; multi-hop spread happens over
 * story time, not instantaneously).
 *
 * Facts whose tag starts with 'private:' NEVER propagate — secrets stay
 * mechanically representable.
 *
 * Deterministic: probabilistic edges draw from the engine's seeded RNG
 * (state.rngState) and the returned state carries the advanced rngState.
 */

import { nextRandom } from '@not-here/engine';
import type { CharacterId, Fact, FactTag, WorldState } from '@not-here/engine';

export const PRIVATE_TAG_PREFIX = 'private:';

export interface GossipEdge {
  readonly from: CharacterId;
  readonly to: CharacterId;
  /** If present, only facts with one of these exact tags travel this edge. */
  readonly tags?: readonly FactTag[];
  /** Probability 0..1 each candidate fact spreads; omit for certainty. */
  readonly chance?: number;
}

const isPrivate = (fact: Fact): boolean => fact.tag.startsWith(PRIVATE_TAG_PREFIX);

const edgeAllowsTag = (edge: GossipEdge, tag: FactTag): boolean =>
  edge.tags === undefined || edge.tags.includes(tag);

interface PassAccumulator {
  readonly knownBy: WorldState['knownBy'];
  readonly rngState: number;
}

interface RollResult {
  readonly rngState: number;
  readonly spread: readonly number[];
}

/** Roll each candidate fact against the edge chance, threading the RNG. */
const rollCandidates = (
  candidates: readonly number[],
  chance: number,
  rngState: number,
): RollResult =>
  candidates.reduce<RollResult>(
    (acc, factId) => {
      if (chance >= 1) return { rngState: acc.rngState, spread: [...acc.spread, factId] };
      const [roll, next] = nextRandom(acc.rngState);
      return {
        rngState: next,
        spread: roll < chance ? [...acc.spread, factId] : acc.spread,
      };
    },
    { rngState, spread: [] },
  );

/**
 * Run one gossip pass along a declarative edge list, returning a new state
 * with updated knowledge sets and advanced rngState. Never mutates input.
 */
export const propagateGossip = (
  state: WorldState,
  edges: readonly GossipEdge[],
): WorldState => {
  /** Snapshot: sources spread only what they knew before this pass. */
  const before = state.knownBy;
  const factById = new Map(state.facts.map((f) => [f.id, f] as const));

  const result = edges.reduce<PassAccumulator>(
    (acc, edge) => {
      const targetKnown = acc.knownBy[edge.to];
      const targetSet = new Set(targetKnown);
      const candidates = before[edge.from].filter((factId) => {
        const fact = factById.get(factId);
        if (fact === undefined) return false;
        if (isPrivate(fact)) return false;
        if (!edgeAllowsTag(edge, fact.tag)) return false;
        return !targetSet.has(factId);
      });
      const { rngState, spread } = rollCandidates(
        candidates,
        edge.chance ?? 1,
        acc.rngState,
      );
      if (spread.length === 0) return { knownBy: acc.knownBy, rngState };
      return {
        knownBy: { ...acc.knownBy, [edge.to]: [...targetKnown, ...spread] },
        rngState,
      };
    },
    { knownBy: state.knownBy, rngState: state.rngState },
  );

  if (result.knownBy === state.knownBy && result.rngState === state.rngState) {
    return state;
  }
  return { ...state, knownBy: result.knownBy, rngState: result.rngState };
};
