/**
 * Serializable effects — the only way state changes. Applying an effect
 * returns a new state plus any engine events it raised (music reactions,
 * fx). Stat changes clamp; fact additions auto-witness.
 */

import type { CharacterId, FactTag, SceneId, StatId } from './ids.ts';
import { clampMeter, clampStat, type Fact, type WorldState } from './state.ts';
import type { EngineEvent } from './events.ts';

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

export const applyEffect = (state: WorldState, effect: Effect): EffectResult => {
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
    case 'goto':
      return { state, events: [], goto: effect.scene };
  }
};

export const applyEffects = (
  state: WorldState,
  effects: readonly Effect[],
): EffectResult =>
  effects.reduce<EffectResult>(
    (acc, effect) => {
      const result = applyEffect(acc.state, effect);
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
