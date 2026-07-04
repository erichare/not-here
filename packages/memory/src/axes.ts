/**
 * Relationship axes — trust, warmth, fear — DERIVED, never stored.
 *
 * Each axis is a pure function of the facts a character KNOWS
 * (state.knownBy[who]), computed from a declarative, tag-weighted table.
 * Because feelings are re-derived from the ledger on demand:
 *  - rebalancing weights retroactively fixes every save file,
 *  - "why does she feel this way" is answerable by listing contributing facts,
 *  - counter/history drift bugs cannot exist.
 *
 * Writers extend behaviour by adding rows to the weight table (data, not code).
 */

import type { CharacterId, FactTag, WorldState } from '@not-here/engine';

export type AxisId = 'trust' | 'warmth' | 'fear';

export const AXES: readonly AxisId[] = ['trust', 'warmth', 'fear'];

/** Every axis starts here (0..10 scale) before witnessed facts move it. */
export const AXIS_BASELINE = 5;

export const AXIS_MIN = 0;
export const AXIS_MAX = 10;

/**
 * One row of the weight table. A rule contributes `delta` to `axis` for a
 * character `who` whenever a fact `who` knows matches:
 *  - `tag`: exact fact tag, or a prefix pattern ending in '*'
 *    (e.g. 'helped-*' matches 'helped-sam').
 *  - `knowers` (optional): rule only applies when `who` is in this list
 *    (e.g. 'defended-sam' moves trust only for tam and sam).
 *  - `aboutKnowerOnly` (optional): rule only applies when the fact is ABOUT
 *    the knower (fact.about === who) — used for the ECHO paradox.
 */
export interface AxisWeightRule {
  readonly tag: string;
  readonly axis: AxisId;
  readonly delta: number;
  readonly knowers?: readonly CharacterId[];
  readonly aboutKnowerOnly?: boolean;
}

/**
 * Default weight table. Exported as data so writers can extend or replace it
 * (pass a custom table to axisValue / makeResolvers).
 */
export const DEFAULT_AXIS_WEIGHTS: readonly AxisWeightRule[] = [
  // Kindness warms whoever witnesses it.
  { tag: 'kindness', axis: 'warmth', delta: 1 },
  { tag: 'helped-*', axis: 'warmth', delta: 1 },

  // Being caught in a lie shatters trust and puts people on edge.
  { tag: 'lie-caught', axis: 'trust', delta: -3 },
  { tag: 'lie-caught', axis: 'fear', delta: 1 },
  { tag: 'contradiction', axis: 'trust', delta: -3 },

  // Telling a costly truth slowly rebuilds trust.
  { tag: 'truth-told', axis: 'trust', delta: 1 },

  // Standing up for Sam matters to Sam — and Tam is watching.
  { tag: 'defended-sam', axis: 'trust', delta: 2, knowers: ['tam', 'sam'] },

  // The ECHO paradox: taking someone's memory of Wren cools their warmth for
  // you while raising their trust — they love the passing, fear the seam.
  { tag: 'memory-taken', axis: 'warmth', delta: -2, aboutKnowerOnly: true },
  { tag: 'memory-taken', axis: 'trust', delta: 1, aboutKnowerOnly: true },
  { tag: 'memory-taken', axis: 'fear', delta: 1, aboutKnowerOnly: true },

  // The fog frightens everyone who sees it work.
  { tag: 'fog-*', axis: 'fear', delta: 2 },
  { tag: 'threatened', axis: 'fear', delta: 2 },
];

/** Exact match, or prefix match when the pattern ends in '*'. */
export const tagMatches = (pattern: string, tag: FactTag): boolean =>
  pattern.endsWith('*') ? tag.startsWith(pattern.slice(0, -1)) : tag === pattern;

export const clampAxis = (value: number): number =>
  Math.max(AXIS_MIN, Math.min(AXIS_MAX, value));

const ruleApplies = (
  rule: AxisWeightRule,
  axis: AxisId,
  who: CharacterId,
  tag: FactTag,
  about: CharacterId | undefined,
): boolean => {
  if (rule.axis !== axis) return false;
  if (!tagMatches(rule.tag, tag)) return false;
  if (rule.knowers !== undefined && !rule.knowers.includes(who)) return false;
  if (rule.aboutKnowerOnly === true && about !== who) return false;
  return true;
};

/**
 * Derive one axis value for one character from the facts they know.
 * Pure; recomputed on demand (a few hundred facts is microseconds).
 */
export const axisValue = (
  state: WorldState,
  who: CharacterId,
  axis: AxisId,
  weights: readonly AxisWeightRule[] = DEFAULT_AXIS_WEIGHTS,
): number => {
  const known = new Set(state.knownBy[who]);
  const raw = state.facts.reduce((total, fact) => {
    if (!known.has(fact.id)) return total;
    const factDelta = weights.reduce(
      (sum, rule) =>
        ruleApplies(rule, axis, who, fact.tag, fact.about) ? sum + rule.delta : sum,
      0,
    );
    return total + factDelta;
  }, AXIS_BASELINE);
  return clampAxis(raw);
};
