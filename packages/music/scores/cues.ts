/**
 * Vertical-slice cues. Every cue is a derivation of the Foghorn Song's
 * fragments — nothing in the score exists outside the six bars.
 *
 *   title       — the full title arrangement (three verses, building)
 *   shingle     — arrival: sea, drone, bar 3 alone and very slow. Desolate.
 *   pub-warm    — the Kettle: Barb's chords and the counter-line
 *                 only. The melody is withheld — Barb never presumed to know
 *                 the tune. Warmth without the song.
 *   dianne-theme  — bars 1–2 as the music-box lullaby over harmonium.
 *   foghorn-312 — the nightly call: the horn plays bar 3, then holds.
 */

import type { Instrument, NoteEvent, Song } from '../src/types.ts';
import {
  CHORDS_BARB,
  FRAGMENT_DIANNE,
  FRAGMENT_WADE,
} from './foghorn-song.ts';

const shift = (notes: readonly NoteEvent[], beats: number, vel = 1): NoteEvent[] =>
  notes.map((n) => ({ ...n, t: n.t + beats, vel: (n.vel ?? 1) * vel }));

const stretch = (notes: readonly NoteEvent[], factor: number): NoteEvent[] =>
  notes.map((n) => ({ ...n, t: n.t * factor, dur: n.dur * factor }));

const transpose = (notes: readonly NoteEvent[], semitones: number): NoteEvent[] =>
  notes.map((n) => ({ ...n, pitch: n.pitch + semitones }));

// Shared palette (kept in sync with foghorn-song.ts by ear, not by import,
// so each cue can voice its own weather).
const musicBox: Instrument = {
  kind: 'triangle',
  env: { attack: 0.003, decay: 1.2, sustain: 0.1, release: 0.8 },
  vibrato: { depthCents: 5, rateHz: 0.6, delay: 0 },
};

const harmonium: Instrument = {
  kind: 'fm',
  ratio: 2,
  index: 1.2,
  env: { attack: 0.22, decay: 0.5, sustain: 0.7, release: 1.1 },
};

const foghorn: Instrument = {
  kind: 'fm',
  ratio: 1,
  index: 1.1,
  env: { attack: 1.2, decay: 0.8, sustain: 0.8, release: 3.5 },
  vibrato: { depthCents: 4, rateHz: 0.4, delay: 1 },
};

const counterPulse: Instrument = {
  kind: 'pulse',
  duty: 0.125,
  env: { attack: 0.04, decay: 0.35, sustain: 0.45, release: 0.5 },
};

const sea: Instrument = {
  kind: 'noise',
  env: { attack: 1.5, decay: 1.3, sustain: 0.5, release: 2.4 },
  lowpassHz: 560,
};

const seaSwells = (beats: number, gap = 6): NoteEvent[] => {
  const swells: NoteEvent[] = [];
  for (let t = 0; t < beats - 4; t += gap) swells.push({ t, dur: 4, pitch: 0, vel: 0.9 });
  return swells;
};

/** Arrival on the shingle. Bar 3 (the horn's third) stretched to half speed. */
export const cueShingle: Song = {
  id: 'shingle',
  bpm: 132,
  lengthBeats: 48,
  echo: { beats: 3, feedback: 0.3 },
  patterns: [
    { id: 'sea', instrument: sea, notes: seaSwells(48, 5), gain: 0.09, pan: -0.2 },
    {
      id: 'drone',
      instrument: foghorn,
      notes: [{ t: 0, dur: 44, pitch: 26, vel: 0.7 }],
      gain: 0.34,
    },
    {
      id: 'bar3-slow',
      instrument: musicBox,
      notes: [
        ...shift(stretch(shift(FRAGMENT_WADE, -12), 2), 6),
        ...shift(stretch(shift(FRAGMENT_WADE, -12), 2), 30, 0.6),
      ],
      gain: 0.55,
      pan: 0.15,
      echo: 0.45,
    },
  ],
};

/** The Kettle. Chords and counter-line; the tune withheld. */
export const cuePubWarm: Song = {
  id: 'pub-warm',
  bpm: 138,
  lengthBeats: 72,
  echo: { beats: 3, feedback: 0.22 },
  patterns: [
    {
      id: 'chords',
      instrument: harmonium,
      notes: [...shift(CHORDS_BARB, 0), ...shift(CHORDS_BARB, 36, 0.9)],
      gain: 0.2,
    },
    {
      id: 'counter',
      instrument: counterPulse,
      notes: [
        { t: 0, dur: 3, pitch: 50, vel: 0.8 }, { t: 3, dur: 3, pitch: 57, vel: 0.7 },
        { t: 6, dur: 3, pitch: 48, vel: 0.75 }, { t: 9, dur: 3, pitch: 55, vel: 0.7 },
        { t: 12, dur: 6, pitch: 53, vel: 0.75 },
        { t: 18, dur: 3, pitch: 55, vel: 0.7 }, { t: 21, dur: 3, pitch: 59, vel: 0.75 },
        { t: 24, dur: 3, pitch: 53, vel: 0.7 }, { t: 27, dur: 3, pitch: 57, vel: 0.75 },
        { t: 30, dur: 6, pitch: 50, vel: 0.7 },
        { t: 36, dur: 3, pitch: 50, vel: 0.8 }, { t: 39, dur: 3, pitch: 57, vel: 0.7 },
        { t: 42, dur: 3, pitch: 48, vel: 0.75 }, { t: 45, dur: 3, pitch: 55, vel: 0.7 },
        { t: 48, dur: 6, pitch: 53, vel: 0.75 },
        { t: 54, dur: 3, pitch: 55, vel: 0.7 }, { t: 57, dur: 3, pitch: 59, vel: 0.75 },
        { t: 60, dur: 3, pitch: 53, vel: 0.7 }, { t: 63, dur: 3, pitch: 57, vel: 0.75 },
        { t: 66, dur: 6, pitch: 50, vel: 0.7 },
      ],
      gain: 0.2,
      pan: -0.25,
    },
    {
      id: 'fire',
      instrument: sea,
      notes: seaSwells(72, 9),
      gain: 0.04,
      pan: 0.3,
    },
  ],
};

/** Dianne: bars 1–2, the lullaby, twice — the second time barely there. */
export const cueDianneTheme: Song = {
  id: 'dianne-theme',
  bpm: 126,
  lengthBeats: 42,
  echo: { beats: 3, feedback: 0.3 },
  patterns: [
    {
      id: 'lullaby',
      instrument: musicBox,
      notes: [...shift(FRAGMENT_DIANNE, 3), ...shift(FRAGMENT_DIANNE, 24, 0.45)],
      gain: 0.75,
      pan: -0.1,
      echo: 0.35,
    },
    {
      id: 'held',
      instrument: harmonium,
      notes: [
        { t: 0, dur: 15, pitch: 50, vel: 0.5 }, { t: 0, dur: 15, pitch: 57, vel: 0.4 },
        { t: 21, dur: 15, pitch: 50, vel: 0.35 }, { t: 21, dur: 15, pitch: 53, vel: 0.3 },
      ],
      gain: 0.16,
      pan: 0.15,
    },
  ],
};

/** 3:12 AM. The horn plays bar 3 an octave down, and holds, and stops. */
export const cueFoghorn312: Song = {
  id: 'foghorn-312',
  bpm: 132,
  lengthBeats: 30,
  echo: { beats: 4, feedback: 0.4 },
  patterns: [
    {
      id: 'horn',
      instrument: foghorn,
      notes: transpose(shift(FRAGMENT_WADE, -12 + 2), -24).map((n) => ({
        ...n,
        dur: n.dur * 2.5,
      })),
      gain: 0.6,
      pan: 0.1,
      echo: 0.6,
    },
    { id: 'sea', instrument: sea, notes: seaSwells(30, 7), gain: 0.07, pan: -0.3 },
  ],
};
