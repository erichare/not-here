/**
 * Beats — the moments that get an interstitial or a stage flinch, derived
 * from a step's events and scene. The 3:12 horn: Act 1 carries the cue on
 * the night scene; Acts 2–3 emit it from onEnter under horn-on, and
 * music.stop under horn-stopped (the silence variant). Both arrive in
 * StepResult.events before the scene draws, so the beat can play first.
 * Resume and held paths never call this — they render synchronously and
 * replay nothing.
 */

import type { EngineEvent, Scene, WorldState } from '@not-here/engine';

export type ThreeTwelveKind = 'horn' | 'silence';

export interface ThreeTwelveBeat {
  readonly kind: ThreeTwelveKind;
  readonly day: number;
}

export const HORN_CUE = 'foghorn-312';

const NIGHT_ID = /-night(-\d+)?$/;

export const threeTwelveBeat = (
  scene: Pick<Scene, 'id' | 'slot'> | undefined,
  state: Pick<WorldState, 'day' | 'flags'>,
  events: readonly EngineEvent[],
): ThreeTwelveBeat | null => {
  if (events.some((e) => e.kind === 'music.cue' && e.cue === HORN_CUE)) {
    return { kind: 'horn', day: state.day };
  }
  if (
    scene !== undefined &&
    scene.slot === 'night' &&
    NIGHT_ID.test(scene.id) &&
    state.flags['horn-stopped'] === true
  ) {
    return { kind: 'silence', day: state.day };
  }
  return null;
};

/** A stinger landed this step (future-proof: content emits none today). */
export const stingerBeat = (events: readonly EngineEvent[]): boolean =>
  events.some((e) => e.kind === 'music.stinger');

/** The day turned between two states — the strip's snowline drops. */
export const dayTurned = (prev: Pick<WorldState, 'day'>, next: Pick<WorldState, 'day'>): boolean =>
  next.day > prev.day;
