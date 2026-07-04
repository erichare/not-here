/**
 * Serializable condition expressions. No closures in content — conditions are
 * data, so the story graph can be statically analyzed (reachability, ending
 * gates) and saves survive content patches.
 *
 * `derived.*` ops call named pure resolvers registered by content (the memory
 * package's axes — trust, warmth, fear — arrive through this door).
 */

import type { CharacterId, FactTag, StatId } from './ids.ts';
import type { WorldState } from './state.ts';

export type Cond =
  | { readonly op: 'always' }
  | { readonly op: 'stat.gte'; readonly stat: StatId; readonly value: number }
  | { readonly op: 'stat.lte'; readonly stat: StatId; readonly value: number }
  | { readonly op: 'chord.gte'; readonly value: number }
  | { readonly op: 'static.gte'; readonly value: number }
  | { readonly op: 'static.lte'; readonly value: number }
  | { readonly op: 'flag'; readonly key: string; readonly value?: boolean | number | string }
  | { readonly op: 'fact.exists'; readonly tag: FactTag }
  | { readonly op: 'fact.knownBy'; readonly who: CharacterId; readonly tag: FactTag }
  | { readonly op: 'day.gte'; readonly value: number }
  | { readonly op: 'day.lte'; readonly value: number }
  | { readonly op: 'derived.gte'; readonly key: string; readonly value: number }
  | { readonly op: 'all'; readonly of: readonly Cond[] }
  | { readonly op: 'any'; readonly of: readonly Cond[] }
  | { readonly op: 'not'; readonly of: Cond };

export type DerivedResolver = (state: WorldState) => number;
export type DerivedResolvers = Readonly<Record<string, DerivedResolver>>;

export const evaluate = (
  cond: Cond,
  state: WorldState,
  derived: DerivedResolvers,
): boolean => {
  switch (cond.op) {
    case 'always':
      return true;
    case 'stat.gte':
      return state.stats[cond.stat] >= cond.value;
    case 'stat.lte':
      return state.stats[cond.stat] <= cond.value;
    case 'chord.gte':
      return state.chord >= cond.value;
    case 'static.gte':
      return state.staticMeter >= cond.value;
    case 'static.lte':
      return state.staticMeter <= cond.value;
    case 'flag':
      return cond.value === undefined
        ? Boolean(state.flags[cond.key])
        : state.flags[cond.key] === cond.value;
    case 'fact.exists':
      return state.facts.some((f) => f.tag === cond.tag);
    case 'fact.knownBy': {
      const known = new Set(state.knownBy[cond.who]);
      return state.facts.some((f) => f.tag === cond.tag && known.has(f.id));
    }
    case 'day.gte':
      return state.day >= cond.value;
    case 'day.lte':
      return state.day <= cond.value;
    case 'derived.gte': {
      const resolver = derived[cond.key];
      if (!resolver) throw new Error(`Unknown derived key: ${cond.key}`);
      return resolver(state) >= cond.value;
    }
    case 'all':
      return cond.of.every((c) => evaluate(c, state, derived));
    case 'any':
      return cond.of.some((c) => evaluate(c, state, derived));
    case 'not':
      return !evaluate(cond.of, state, derived);
  }
};
