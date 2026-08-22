/**
 * Presence — how much of you is still here. Only the horn-stopped track can
 * fade (act3-plan: Unwitnessed is unreachable with the horn on); until the
 * decay bites, presence is whole. FLESH, NAME and ECHO are the presence
 * stats (UNDERTOW is the self); their sum drives the fade. Pure.
 */

import type { WorldState } from '@not-here/engine';

export type PresenceTier = 'whole' | 'thinning' | 'faint' | 'gone';

export interface PresenceModel {
  /** 0 (nothing lost) .. 1 (collapse). */
  readonly fade: number;
  /** 1 - fade, what the page multiplies by. */
  readonly value: number;
  readonly tier: PresenceTier;
}

export const WHOLE: PresenceModel = { fade: 0, value: 1, tier: 'whole' };

/** Below this sum of FLESH+NAME+ECHO the fade begins (the opening is 7). */
const FADE_CEILING = 6;

const tierFor = (fade: number): PresenceTier => {
  if (fade <= 0) return 'whole';
  if (fade < 0.4) return 'thinning';
  if (fade < 0.85) return 'faint';
  return 'gone';
};

export const presenceFor = (state: Pick<WorldState, 'stats' | 'flags'>): PresenceModel => {
  if (state.flags['horn-stopped'] !== true) return WHOLE;
  const sum = state.stats.flesh + state.stats.name + state.stats.echo;
  const fade = Math.max(0, Math.min(1, (FADE_CEILING - sum) / FADE_CEILING));
  const rounded = Math.round(fade * 1000) / 1000;
  return { fade: rounded, value: Math.round((1 - rounded) * 1000) / 1000, tier: tierFor(rounded) };
};
