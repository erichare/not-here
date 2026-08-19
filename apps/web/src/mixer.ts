/**
 * Act 3 ensemble mixer — the pure state half of the chord.add mechanic.
 * Tracks which fragments of the night's five bars have returned (one per
 * confession, in cascade order) and computes target gains; the WebAudio
 * adapter in audio.ts owns the actual nodes. Kept platform-free so the
 * logic is unit-testable without an AudioContext.
 *
 * music.layer {pattern, gain} sets one fragment's target; music.chord
 * {fragments: n} raises the first n layers of the cascade and lowers the
 * rest. The sea bed is implied: it sounds whenever any fragment is up.
 * Unknown patterns are ignored — the mixer never learns a raw id.
 */

import {
  ACT3_ENSEMBLE_LAYER_GAINS,
  ACT3_FRAGMENT_ORDER,
  type Act3LayerId,
} from '@not-here/music';

export interface EnsembleSnapshot {
  /** True when any fragment is up — the bed (and the ensemble) should sound. */
  readonly active: boolean;
  /** Target gain 0..1 per fragment layer id (cascade members only). */
  readonly fragments: Readonly<Record<string, number>>;
  /** Final GainNode value per layer: authored balance × target. */
  readonly mix: Readonly<Record<Act3LayerId, number>>;
}

export interface EnsembleMixer {
  readonly layer: (pattern: string, gain: number) => void;
  readonly chord: (fragments: number) => void;
  readonly snapshot: () => EnsembleSnapshot;
  readonly reset: () => void;
  readonly isEnsemblePattern: (pattern: string) => boolean;
}

const clamp01 = (x: number): number => Math.max(0, Math.min(1, x));

export const createEnsembleMixer = (): EnsembleMixer => {
  let targets: Record<string, number> = {};

  const isEnsemblePattern = (pattern: string): boolean =>
    pattern === 'sea' || (ACT3_FRAGMENT_ORDER as readonly string[]).includes(pattern);

  const snapshot = (): EnsembleSnapshot => {
    const active = Object.values(targets).some((gain) => gain > 0);
    const mix = { ...ACT3_ENSEMBLE_LAYER_GAINS };
    for (const id of ACT3_FRAGMENT_ORDER) {
      mix[id] = ACT3_ENSEMBLE_LAYER_GAINS[id] * (targets[id] ?? 0);
    }
    mix.sea = active ? ACT3_ENSEMBLE_LAYER_GAINS.sea : 0;
    return { active, fragments: { ...targets }, mix };
  };

  return {
    layer: (pattern, gain) => {
      if (!isEnsemblePattern(pattern) || pattern === 'sea') return;
      targets[pattern] = clamp01(gain);
    },
    chord: (fragments) => {
      const count = Math.max(0, Math.min(ACT3_FRAGMENT_ORDER.length, Math.floor(fragments)));
      targets = Object.fromEntries(
        ACT3_FRAGMENT_ORDER.map((id, i) => [id, i < count ? 1 : 0]),
      );
    },
    snapshot,
    reset: () => {
      targets = {};
    },
    isEnsemblePattern,
  };
};
