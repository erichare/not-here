/**
 * What the stage needs to know each step, derived once from the post-step
 * world: the place, the hour, how present you are, how far the fog has got
 * into the page, which fragments of the song have returned, whether the
 * horn still plays. DOM adapters apply it as attributes and custom
 * properties — no node churn per step. Pure.
 */

import type { Scene, SlotId, WorldState } from '@not-here/engine';
import { ACT3_FRAGMENT_ORDER } from '@not-here/music';
import type { StaticTier } from '@not-here/story';
import { placeFor, type PlaceId } from './places.ts';

export type HornState = 'on' | 'stopped' | 'unknown';

export interface StageModel {
  readonly place: PlaceId;
  readonly slot: SlotId | 'none';
  readonly presence: number;
  readonly rotTier: StaticTier;
  /** Returned fragments, in cascade order. */
  readonly fragments: readonly string[];
  readonly horn: HornState;
}

export interface EnsembleFragments {
  readonly fragments: Readonly<Record<string, number>>;
}

export const hornStateFor = (flags: WorldState['flags']): HornState => {
  if (flags['horn-stopped'] === true) return 'stopped';
  if (flags['horn-on'] === true) return 'on';
  return 'unknown';
};

/** Fragments whose gain is up, in the cascade's order. */
export const returnedFragments = (ensemble: EnsembleFragments | null): readonly string[] =>
  ensemble === null
    ? []
    : ACT3_FRAGMENT_ORDER.filter((id) => (ensemble.fragments[id] ?? 0) > 0);

export const deriveStage = (
  scene: Pick<Scene, 'id' | 'slot' | 'ending'> | undefined,
  state: Pick<WorldState, 'flags'>,
  slot: SlotId | 'none',
  presence: number,
  rotTier: StaticTier,
  ensemble: EnsembleFragments | null,
): StageModel => ({
  place: scene === undefined ? 'ambient' : scene.ending !== undefined ? 'card' : placeFor(scene),
  slot,
  presence,
  rotTier,
  fragments: returnedFragments(ensemble),
  horn: hornStateFor(state.flags),
});
