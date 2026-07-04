/**
 * Serializable effects — the only way state changes. Applying an effect
 * returns a new state plus any engine events it raised (music reactions,
 * fx). Stat changes clamp; fact additions auto-witness.
 */

import type { CharacterId, FactTag, SceneId, SlotId, StatId } from './ids.ts';
import { clampMeter, clampStat, type Fact, type WorldState } from './state.ts';
import type { EngineEvent } from './events.ts';
import { evaluate, type Cond, type DerivedResolvers } from './conditions.ts';

export type Effect =
  | { readonly op: 'stat.add'; readonly stat: StatId; readonly value: number }
  | { readonly op: 'chord.add'; readonly value: number }
  | { readonly op: 'static.add'; readonly value: number }
  | { readonly op: 'flag.set'; readonly key: string; readonly value: boolean | number | string }
  | {
      readonly op: 'fact.add';
      readonly tag: FactTag;
      readonly about?: CharacterId;
      readonly data?: string;
      /** Who saw it happen. Omit for private facts. */
      readonly witnessedBy?: readonly CharacterId[];
    }
  | { readonly op: 'fact.learn'; readonly who: CharacterId; readonly tag: FactTag }
  | { readonly op: 'time.set'; readonly day?: number; readonly slot?: SlotId }
  /** Conditional effects — presence decay, gated stingers, branch-on-state. */
  | {
      readonly op: 'when';
      readonly cond: Cond;
      readonly then: readonly Effect[];
      readonly else?: readonly Effect[];
    }
  /** Content-raised events: lie-detune, visual twins, layer changes. */
  | { readonly op: 'emit'; readonly event: EngineEvent }
  | { readonly op: 'goto'; readonly scene: SceneId };

export interface EffectResult {
  readonly state: WorldState;
  readonly events: readonly EngineEvent[];
  readonly goto?: SceneId;
}

const addFact = (state: WorldState, effect: Extract<Effect, { op: 'fact.add' }>): WorldState => {
  const fact: Fact = {
    id: state.facts.length,
    day: state.day,
    slot: state.slot,
    tag: effect.tag,
    ...(effect.about !== undefined ? { about: effect.about } : {}),
    ...(effect.data !== undefined ? { data: effect.data } : {}),
  };
  const knownBy = Object.fromEntries(
    Object.entries(state.knownBy).map(([who, ids]) => [
      who,
      effect.witnessedBy?.includes(who as CharacterId) ? [...ids, fact.id] : ids,
    ]),
  ) as WorldState['knownBy'];
  return { ...state, facts: [...state.facts, fact], knownBy };
};

const learnFact = (state: WorldState, who: CharacterId, tag: FactTag): WorldState => {
  const fact = state.facts.find((f) => f.tag === tag);
  if (!fact || state.knownBy[who].includes(fact.id)) return state;
  return {
    ...state,
    knownBy: { ...state.knownBy, [who]: [...state.knownBy[who], fact.id] },
  };
};

const NO_DERIVED: DerivedResolvers = {};

export const applyEffect = (
  state: WorldState,
  effect: Effect,
  derived: DerivedResolvers = NO_DERIVED,
): EffectResult => {
  switch (effect.op) {
    case 'stat.add': {
      const next = {
        ...state,
        stats: {
          ...state.stats,
          [effect.stat]: clampStat(state.stats[effect.stat] + effect.value),
        },
      };
      return { state: next, events: [{ kind: 'stat.changed', stat: effect.stat, delta: effect.value }] };
    }
    case 'chord.add': {
      const chord = Math.max(0, Math.min(6, state.chord + effect.value));
      return {
        state: { ...state, chord },
        events: [{ kind: 'music.chord', fragments: chord }],
      };
    }
    case 'static.add': {
      const staticMeter = clampMeter(state.staticMeter + effect.value);
      return {
        state: { ...state, staticMeter },
        events: [{ kind: 'music.static', amount: staticMeter }],
      };
    }
    case 'flag.set':
      return { state: { ...state, flags: { ...state.flags, [effect.key]: effect.value } }, events: [] };
    case 'fact.add':
      return { state: addFact(state, effect), events: [] };
    case 'fact.learn':
      return { state: learnFact(state, effect.who, effect.tag), events: [] };
    case 'time.set':
      return {
        state: {
          ...state,
          ...(effect.day !== undefined ? { day: effect.day } : {}),
          ...(effect.slot !== undefined ? { slot: effect.slot } : {}),
        },
        events: [],
      };
    case 'when': {
      const branch = evaluate(effect.cond, state, derived)
        ? effect.then
        : (effect.else ?? []);
      return applyEffects(state, branch, derived);
    }
    case 'emit':
      return { state, events: [effect.event] };
    case 'goto':
      return { state, events: [], goto: effect.scene };
  }
};

export const applyEffects = (
  state: WorldState,
  effects: readonly Effect[],
  derived: DerivedResolvers = NO_DERIVED,
): EffectResult =>
  effects.reduce<EffectResult>(
    (acc, effect) => {
      const result = applyEffect(acc.state, effect, derived);
      return {
        state: result.state,
        events: [...acc.events, ...result.events],
        ...(result.goto !== undefined
          ? { goto: result.goto }
          : acc.goto !== undefined
            ? { goto: acc.goto }
            : {}),
      };
    },
    { state, events: [] },
  );
