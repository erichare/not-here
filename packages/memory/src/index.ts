/**
 * @not-here/memory — witnessed-facts memory system.
 *
 * Relationship axes derived (never stored) from per-character knowledge sets,
 * a salience-scored dialogue rule matcher with guaranteed fallbacks, and
 * one-hop gossip propagation over a declarative edge list.
 */

export {
  AXES,
  AXIS_BASELINE,
  AXIS_MAX,
  AXIS_MIN,
  DEFAULT_AXIS_WEIGHTS,
  axisValue,
  clampAxis,
  tagMatches,
} from './axes.ts';
export type { AxisId, AxisWeightRule } from './axes.ts';

export { derivedKey, makeResolvers } from './resolvers.ts';

export { isFallback, selectLine, specificity } from './rules.ts';
export type { DialogueRule } from './rules.ts';

export { PRIVATE_TAG_PREFIX, propagateGossip } from './gossip.ts';
export type { GossipEdge } from './gossip.ts';
