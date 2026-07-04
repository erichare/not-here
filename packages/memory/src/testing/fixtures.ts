/**
 * Test fixtures — crafted WorldStates for memory-package tests.
 * Not exported from the package index; test support only.
 */

import { CHARACTERS, initialState } from '@not-here/engine';
import type { CharacterId, Fact, WorldState } from '@not-here/engine';

export interface FactSpec {
  readonly tag: string;
  readonly about?: CharacterId;
  /** Characters who know this fact from the start. */
  readonly knownBy?: readonly CharacterId[];
}

/** Build a WorldState whose ledger and knowledge sets match the specs. */
export const makeState = (
  specs: readonly FactSpec[],
  seed = 42,
): WorldState => {
  const base = initialState(seed, 'test-scene');
  const facts: readonly Fact[] = specs.map((spec, id) => ({
    id,
    day: 1,
    slot: 'night',
    tag: spec.tag,
    ...(spec.about !== undefined ? { about: spec.about } : {}),
  }));
  const knownBy = CHARACTERS.reduce<Record<CharacterId, readonly number[]>>(
    (acc, who) => ({
      ...acc,
      [who]: facts
        .filter((fact) => specs[fact.id]?.knownBy?.includes(who))
        .map((fact) => fact.id),
    }),
    { ...base.knownBy },
  );
  return { ...base, facts, knownBy };
};
