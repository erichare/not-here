/**
 * ACT 3 ENSEMBLE — the chord.add mixer score.
 *
 * The night's five bars, reassembling one fragment per confession (see
 * design/act3-plan.md §Mechanics: "The chord (0→6)"). Each keeper's fragment
 * re-enters the night ensemble as their confession lands, in cascade order:
 *
 *   1. sam     — bar 5, the run, in the whistle voice (first time since he was eleven)
 *   2. dianne  — bars 1–2, the music-box lullaby (to the ensemble, not back to her)
 *   3. barb    — the chords: the score finally gets its harmony
 *   4. priya   — bar 4, the turn, right side up at last
 *   5. tam     — the pitchless ostinato enters as the ensemble's pulse
 *   6. wade    — bar 3 and the drone: the low held line the whole song stands on
 *
 * Bar 6 stays a rest here — the sixth bar belongs to the finale, not the
 * ensemble. One verse (36 beats, 6/8 at the title's tidal 144) loops under
 * the night; every layer Song shares bpm and lengthBeats so per-layer WAV
 * renders loop in sync when the runtime mixer stacks them.
 *
 * Runtime contract: apps play `act3-ensemble-<layer>.wav` per active layer
 * through per-layer gain nodes; `music.layer` sets one layer's target gain,
 * `music.chord {fragments: n}` raises the first n layers of
 * ACT3_FRAGMENT_ORDER (and lowers the rest). The sea bed sounds whenever any
 * fragment is up. Layer WAVs are individually normalized at render time, so
 * mixers must apply ACT3_ENSEMBLE_LAYER_GAINS to restore the authored balance.
 */

import type { Instrument, NoteEvent, Pattern, Song } from '../src/types.ts';
import {
  CHORDS_BARB,
  FRAGMENT_DIANNE,
  FRAGMENT_PRIYA,
  FRAGMENT_SAM,
  FRAGMENT_WADE,
  VERSE_BEATS,
} from './foghorn-song.ts';

export const ACT3_ENSEMBLE_BPM = 144;
export const ACT3_ENSEMBLE_BEATS = VERSE_BEATS; // one verse: six bars of 6/8

/** The confession-cascade order — music.chord counts along this list. */
export const ACT3_FRAGMENT_ORDER = [
  'sam',
  'dianne',
  'barb',
  'priya',
  'tam',
  'wade',
] as const;

export type Act3LayerId = 'sea' | (typeof ACT3_FRAGMENT_ORDER)[number];

// ---------------------------------------------------------------------------
// Instruments — the shipped chiptune-folk palette (spec frozen in decisions.md)

const sea: Instrument = {
  kind: 'noise',
  env: { attack: 1.4, decay: 1.2, sustain: 0.5, release: 2.2 },
  lowpassHz: 620,
};

const musicBox: Instrument = {
  kind: 'triangle',
  env: { attack: 0.003, decay: 1.1, sustain: 0.12, release: 0.7 },
  vibrato: { depthCents: 5, rateHz: 0.7, delay: 0 },
};

const whistle: Instrument = {
  kind: 'triangle',
  env: { attack: 0.02, decay: 0.15, sustain: 0.85, release: 0.12 },
  vibrato: { depthCents: 9, rateHz: 5.6, delay: 0.1 },
};

const clinic: Instrument = {
  kind: 'triangle',
  env: { attack: 0.05, decay: 0.4, sustain: 0.5, release: 0.5 },
};

const harmonium: Instrument = {
  kind: 'fm',
  ratio: 2,
  index: 1.4,
  env: { attack: 0.18, decay: 0.4, sustain: 0.75, release: 0.9 },
  modEnv: { attack: 0.25, decay: 0.8, sustain: 0.5, release: 0.9 },
};

const foghorn: Instrument = {
  kind: 'fm',
  ratio: 1,
  index: 1.1,
  env: { attack: 1.4, decay: 0.8, sustain: 0.8, release: 3.0 },
  vibrato: { depthCents: 4, rateHz: 0.4, delay: 1 },
};

const pulse: Instrument = {
  kind: 'noise',
  env: { attack: 0.004, decay: 0.09, sustain: 0, release: 0.12 },
  lowpassHz: 900,
};

// ---------------------------------------------------------------------------
// Notes

const D2 = 38;

const n = (t: number, dur: number, pitch: number, vel = 1): NoteEvent => ({
  t,
  dur,
  pitch,
  vel,
});

const seaSwells = (): NoteEvent[] => {
  const swells: NoteEvent[] = [];
  for (let t = 0; t < ACT3_ENSEMBLE_BEATS; t += 6) swells.push(n(t, 4, 0, 0.9));
  return swells;
};

/** Tam's ostinato: pitchless, two to the bar, the whole verse through. */
const tamPulse = (): NoteEvent[] => {
  const hits: NoteEvent[] = [];
  for (let t = 0; t < ACT3_ENSEMBLE_BEATS; t += 3) hits.push(n(t, 0.15, 0, 0.8));
  return hits;
};

// ---------------------------------------------------------------------------
// Layer definitions — one Song per layer, all sharing bpm and lengthBeats so
// their renders loop in sync when stacked by the runtime mixer.

interface Act3Layer {
  readonly id: Act3LayerId;
  readonly patterns: readonly Pattern[];
}

const LAYERS: readonly Act3Layer[] = [
  {
    id: 'sea',
    patterns: [
      { id: 'sea', instrument: sea, notes: seaSwells(), gain: 0.055, pan: -0.2 },
    ],
  },
  {
    id: 'sam',
    patterns: [
      { id: 'sam-run', instrument: whistle, notes: FRAGMENT_SAM, gain: 0.5, pan: 0.15, echo: 0.3 },
    ],
  },
  {
    id: 'dianne',
    patterns: [
      { id: 'dianne-lullaby', instrument: musicBox, notes: FRAGMENT_DIANNE, gain: 0.55, pan: -0.12, echo: 0.3 },
    ],
  },
  {
    id: 'barb',
    patterns: [
      { id: 'barb-chords', instrument: harmonium, notes: CHORDS_BARB, gain: 0.16, pan: 0.1 },
    ],
  },
  {
    id: 'priya',
    patterns: [
      { id: 'priya-turn', instrument: clinic, notes: FRAGMENT_PRIYA, gain: 0.45, pan: -0.05, echo: 0.25 },
    ],
  },
  {
    id: 'tam',
    patterns: [
      { id: 'tam-pulse', instrument: pulse, notes: tamPulse(), gain: 0.3, pan: 0.05 },
    ],
  },
  {
    id: 'wade',
    patterns: [
      { id: 'wade-bar3', instrument: foghorn, notes: FRAGMENT_WADE, gain: 0.5, pan: 0.3, echo: 0.4 },
      { id: 'wade-drone', instrument: foghorn, notes: [n(0, ACT3_ENSEMBLE_BEATS, D2, 0.7)], gain: 0.35, pan: 0 },
    ],
  },
];

const layerSong = (layer: Act3Layer): Song => ({
  id: `act3-ensemble-${layer.id}`,
  bpm: ACT3_ENSEMBLE_BPM,
  lengthBeats: ACT3_ENSEMBLE_BEATS,
  echo: { beats: 3, feedback: 0.28 },
  patterns: layer.patterns,
});

/** Per-layer Songs, for the audition render loop. Bed first, then cascade. */
export const ACT3_ENSEMBLE_LAYERS: readonly Song[] = LAYERS.map(layerSong);

/** Authored per-pattern balance, keyed by layer id — the mixer's gain map. */
export const ACT3_ENSEMBLE_LAYER_GAINS: Readonly<Record<Act3LayerId, number>> =
  Object.fromEntries(
    LAYERS.map((layer) => [
      layer.id,
      Math.max(...layer.patterns.map((p) => p.gain ?? 1)),
    ]),
  ) as Record<Act3LayerId, number>;

/** The ensemble at a given chord count: the sea bed plus n fragments. */
export const act3EnsembleAtChord = (fragments: number): Song => {
  const count = Math.max(0, Math.min(ACT3_FRAGMENT_ORDER.length, Math.floor(fragments)));
  const active = new Set<Act3LayerId>([
    'sea',
    ...ACT3_FRAGMENT_ORDER.slice(0, count),
  ]);
  return {
    id: `act3-ensemble-chord-${count}`,
    bpm: ACT3_ENSEMBLE_BPM,
    lengthBeats: ACT3_ENSEMBLE_BEATS,
    echo: { beats: 3, feedback: 0.28 },
    patterns: LAYERS.filter((layer) => active.has(layer.id)).flatMap(
      (layer) => layer.patterns,
    ),
  };
};

/** The full mix — chord = 6, the night before Friday. */
export const act3EnsembleFull: Song = {
  ...act3EnsembleAtChord(ACT3_FRAGMENT_ORDER.length),
  id: 'act3-ensemble',
};
