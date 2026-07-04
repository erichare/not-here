/**
 * WorldState — the single serializable truth. Immutable: every transition
 * returns a new state. The fact ledger is append-only; character knowledge is
 * a per-character set of witnessed fact ids; relationship axes are DERIVED
 * (never stored) by the memory package.
 */

import type { CharacterId, FactTag, SceneId, SlotId, StatId } from './ids.ts';

/** One thing that happened. Immutable, append-only. */
export interface Fact {
  readonly id: number;
  readonly day: number;
  readonly slot: SlotId;
  readonly tag: FactTag;
  /** Character most concerned, if any. */
  readonly about?: CharacterId;
  /** Free payload — e.g. the verbatim player phrase for echo-back. */
  readonly data?: string;
}

export interface ChoiceRecord {
  readonly scene: SceneId;
  readonly choice: string;
  readonly day: number;
  readonly slot: SlotId;
}

export interface WorldState {
  readonly day: number;
  readonly slot: SlotId;
  readonly sceneId: SceneId;
  /** 0..10 each. */
  readonly stats: Readonly<Record<StatId, number>>;
  /** Song fragments gathered, 0..6 — drives the adaptive mixer. */
  readonly chord: number;
  /** The fog's claim, 0..100. */
  readonly staticMeter: number;
  readonly facts: readonly Fact[];
  /** Fact ids each character knows (witnessed or heard via gossip). */
  readonly knownBy: Readonly<Record<CharacterId, readonly number[]>>;
  readonly flags: Readonly<Record<string, boolean | number | string>>;
  readonly rngState: number;
  readonly choiceLog: readonly ChoiceRecord[];
  /** Schema version for save migration. */
  readonly v: number;
}

export const SAVE_SCHEMA_VERSION = 1;

export const initialState = (seed: number, openingScene: SceneId): WorldState => ({
  day: 1,
  slot: 'night',
  sceneId: openingScene,
  stats: { flesh: 3, name: 2, echo: 2, undertow: 1 },
  chord: 0,
  staticMeter: 10,
  facts: [],
  knownBy: { dora: [], elias: [], ivy: [], sam: [], maud: [], tam: [] },
  flags: {},
  rngState: seed >>> 0,
  choiceLog: [],
  v: SAVE_SCHEMA_VERSION,
});

/** Mulberry32 step — returns [value 0..1, nextState]. Pure. */
export const nextRandom = (rngState: number): readonly [number, number] => {
  const a = (rngState + 0x6d2b79f5) >>> 0;
  let x = Math.imul(a ^ (a >>> 15), 1 | a);
  x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x;
  return [((x ^ (x >>> 14)) >>> 0) / 4294967296, a] as const;
};

export const clampStat = (value: number): number => Math.max(0, Math.min(10, value));

export const clampMeter = (value: number): number => Math.max(0, Math.min(100, value));
