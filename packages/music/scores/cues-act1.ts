/**
 * Act 1 cues — Days 3–7. Every cue derives from the six bars.
 *
 *   wrens-room  — bars 1–2 with notes MISSING: the lullaby as Dianne now
 *                 holds it, gapped. The airing of the room.
 *   wade-theme  — bar 3 on the horn voice, answered by its own echo a
 *                 fifth down: penance repeating itself. The wharf by day.
 *   priya-theme — bar 4 INVERTED (chromatically wrong on purpose — she
 *                 learned it wrong so it couldn't hurt her). The clinic.
 *   sam-theme   — bar 5, whistle register, restless, each phrase hung on E.
 *   tam-theme   — the pitchless ostinato: engine idle, road hum, and once,
 *                 low, bars 1–2 half-hummed. The ride to Penticton.
 *   hall-upright— the community hall's upright, out of tune, someone
 *                 picking out the turn and stopping. Potluck prep.
 *   horn-close  — Night 7. The horn at full volume, not through a wall:
 *                 bars 1–5 complete and enormous, then the rest, held.
 */

import type { Instrument, NoteEvent, Song } from '../src/types.ts';
import {
  CHORDS_BARB,
  FRAGMENT_DIANNE,
  FRAGMENT_PRIYA,
  FRAGMENT_SAM,
  FRAGMENT_WADE,
} from './foghorn-song.ts';

const shift = (notes: readonly NoteEvent[], beats: number, vel = 1): NoteEvent[] =>
  notes.map((n) => ({ ...n, t: n.t + beats, vel: (n.vel ?? 1) * vel }));

const stretch = (notes: readonly NoteEvent[], factor: number): NoteEvent[] =>
  notes.map((n) => ({ ...n, t: n.t * factor, dur: n.dur * factor }));

const transpose = (notes: readonly NoteEvent[], semitones: number): NoteEvent[] =>
  notes.map((n) => ({ ...n, pitch: n.pitch + semitones }));

const drop = (notes: readonly NoteEvent[], indices: readonly number[]): NoteEvent[] =>
  notes.filter((_, i) => !indices.includes(i));

/** Mirror a melody around its first pitch. */
const invert = (notes: readonly NoteEvent[]): NoteEvent[] => {
  const axis = notes[0]?.pitch ?? 60;
  return notes.map((n) => ({ ...n, pitch: axis - (n.pitch - axis) }));
};

const at = (notes: readonly NoteEvent[]): NoteEvent[] => shift(notes, -(notes[0]?.t ?? 0));

// Palette (voiced per cue; see foghorn-song.ts for the canon instruments).
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
const hornClose: Instrument = {
  kind: 'fm',
  ratio: 1,
  index: 2.2,
  env: { attack: 0.5, decay: 1.0, sustain: 0.85, release: 4.5 },
  vibrato: { depthCents: 6, rateHz: 0.35, delay: 0.8 },
};
const whistle: Instrument = {
  kind: 'pulse',
  duty: 0.5,
  env: { attack: 0.02, decay: 0.15, sustain: 0.55, release: 0.2 },
  vibrato: { depthCents: 14, rateHz: 5.8, delay: 0.1 },
};
const upright: Instrument = {
  kind: 'pulse',
  duty: 0.25,
  env: { attack: 0.004, decay: 0.9, sustain: 0.08, release: 0.5 },
};
const engineThud: Instrument = {
  kind: 'fm',
  ratio: 0.5,
  index: 0.9,
  env: { attack: 0.01, decay: 0.12, sustain: 0.2, release: 0.1 },
};
const air: Instrument = {
  kind: 'noise',
  env: { attack: 1.5, decay: 1.3, sustain: 0.5, release: 2.4 },
  lowpassHz: 560,
};
const roomTick: Instrument = {
  kind: 'noise',
  env: { attack: 0.002, decay: 0.05, sustain: 0, release: 0.04 },
  lowpassHz: 2400,
};

const swells = (beats: number, gap = 6, dur = 4): NoteEvent[] => {
  const out: NoteEvent[] = [];
  for (let t = 0; t < beats - dur; t += gap) out.push({ t, dur, pitch: 0, vel: 0.9 });
  return out;
};

/** Day 3 — Wren's room. The lullaby with holes where notes used to be. */
export const cueWrensRoom: Song = {
  id: 'wrens-room',
  bpm: 120,
  lengthBeats: 54,
  echo: { beats: 3, feedback: 0.34 },
  patterns: [
    {
      id: 'lullaby-gapped',
      instrument: musicBox,
      // Bars 1–2 with the 3rd and 6th notes gone — she airs the room; the
      // tune has moth-holes in it.
      notes: [
        ...shift(drop(at(FRAGMENT_DIANNE), [2, 5]), 3),
        ...shift(drop(at(FRAGMENT_DIANNE), [1, 2, 5]), 30, 0.55),
      ],
      gain: 0.7,
      pan: -0.1,
      echo: 0.4,
    },
    {
      id: 'held-air',
      instrument: harmonium,
      notes: [
        { t: 0, dur: 20, pitch: 50, vel: 0.4 }, { t: 0, dur: 20, pitch: 57, vel: 0.3 },
        { t: 27, dur: 20, pitch: 50, vel: 0.3 }, { t: 27, dur: 20, pitch: 53, vel: 0.25 },
      ],
      gain: 0.14,
      pan: 0.15,
    },
    { id: 'dust', instrument: air, notes: swells(54, 8), gain: 0.04, pan: 0.25 },
  ],
};

/** Day 4 — the wharf. Bar 3 and its answer, a fifth down: penance repeating. */
export const cueWadeTheme: Song = {
  id: 'wade-theme',
  bpm: 126,
  lengthBeats: 60,
  echo: { beats: 4, feedback: 0.38 },
  patterns: [
    {
      id: 'call',
      instrument: foghorn,
      notes: [
        ...shift(stretch(at(FRAGMENT_WADE), 1.5), 4),
        ...shift(stretch(at(FRAGMENT_WADE), 1.5), 34, 0.85),
      ],
      gain: 0.5,
      pan: 0.2,
      echo: 0.5,
    },
    {
      id: 'answer-below',
      instrument: foghorn,
      notes: [
        ...transpose(shift(stretch(at(FRAGMENT_WADE), 1.5), 17), -7).map((n) => ({ ...n, vel: 0.55 })),
        ...transpose(shift(stretch(at(FRAGMENT_WADE), 1.5), 47), -7).map((n) => ({ ...n, vel: 0.45 })),
      ],
      gain: 0.42,
      pan: -0.25,
      echo: 0.55,
    },
    { id: 'lake', instrument: air, notes: swells(60, 5), gain: 0.07, pan: -0.15 },
  ],
};

/** The clinic. Bar 4 inverted — wrong on purpose, so it couldn't hurt her. */
export const cuePriyaTheme: Song = {
  id: 'priya-theme',
  bpm: 132,
  lengthBeats: 48,
  echo: { beats: 3, feedback: 0.2 },
  patterns: [
    {
      id: 'turn-inverted',
      instrument: musicBox,
      notes: [
        ...shift(invert(at(FRAGMENT_PRIYA)), 4),
        ...shift(invert(at(FRAGMENT_PRIYA)), 22, 0.7),
        ...shift(at(FRAGMENT_PRIYA).slice(0, 3), 40, 0.5), // three RIGHT notes, then she stops
      ],
      gain: 0.62,
      pan: 0.1,
      echo: 0.3,
    },
    {
      id: 'clinic-tick',
      instrument: roomTick,
      notes: Array.from({ length: 22 }, (_, i) => ({ t: i * 2 + 1, dur: 0.1, pitch: 0, vel: 0.5 })),
      gain: 0.08,
      pan: -0.3,
    },
    {
      id: 'under-drone',
      instrument: harmonium,
      notes: [{ t: 0, dur: 44, pitch: 45, vel: 0.35 }],
      gain: 0.1,
    },
  ],
};

/** The boat shed. Bar 5 in the whistle register, restless, hung on E. */
export const cueSamTheme: Song = {
  id: 'sam-theme',
  bpm: 168,
  lengthBeats: 60,
  echo: { beats: 2, feedback: 0.22 },
  patterns: [
    {
      id: 'run',
      instrument: whistle,
      notes: [
        ...shift(at(FRAGMENT_SAM), 2),
        ...shift(at(FRAGMENT_SAM), 14, 0.85),
        ...transpose(shift(at(FRAGMENT_SAM), 26, 0.9), 12).map((n, i) => (i >= 4 ? { ...n, pitch: n.pitch - 12 } : n)),
        ...shift(at(FRAGMENT_SAM), 44, 0.75),
      ],
      gain: 0.34,
      pan: 0.15,
      echo: 0.25,
    },
    {
      id: 'scrape',
      instrument: roomTick,
      notes: [
        ...Array.from({ length: 9 }, (_, i) => ({ t: i * 6 + 1, dur: 0.4, pitch: 0, vel: 0.7 })),
        ...Array.from({ length: 9 }, (_, i) => ({ t: i * 6 + 3.5, dur: 0.2, pitch: 0, vel: 0.4 })),
      ],
      gain: 0.12,
      pan: -0.35,
    },
  ],
};

/** The ride. Engine idle, road hum — and once, low, half the lullaby. */
export const cueTamTheme: Song = {
  id: 'tam-theme',
  bpm: 144,
  lengthBeats: 72,
  echo: { beats: 3, feedback: 0.18 },
  patterns: [
    {
      id: 'idle',
      instrument: engineThud,
      notes: Array.from({ length: 60 }, (_, i) => {
        const bar = Math.floor(i / 4);
        const beat = i % 4;
        return { t: bar * 4.5 + beat, dur: 0.5, pitch: 38, vel: beat === 0 ? 0.9 : 0.55 };
      }),
      gain: 0.3,
      pan: -0.1,
    },
    {
      id: 'road',
      instrument: air,
      notes: [{ t: 0, dur: 66, pitch: 0, vel: 0.8 }],
      gain: 0.05,
      pan: 0.2,
    },
    {
      id: 'half-hummed',
      instrument: harmonium,
      notes: transpose(shift(stretch(at(FRAGMENT_DIANNE).slice(0, 4), 1.5), 30, 0.5), -12),
      gain: 0.16,
      pan: 0.1,
      echo: 0.4,
    },
  ],
};

/** The hall. The upright, out of tune, finding the turn and stopping. */
export const cueHallUpright: Song = {
  id: 'hall-upright',
  bpm: 126,
  lengthBeats: 54,
  echo: { beats: 3, feedback: 0.26 },
  patterns: [
    {
      id: 'picking',
      instrument: upright,
      // Someone finds the first three notes of the turn, wrong-tuned; tries
      // again; gets one more; stops. The gaps are the content.
      notes: [
        ...shift(at(FRAGMENT_PRIYA).slice(0, 3), 4).map((n, i) => ({ ...n, dur: 1.6, detune: [9, -14, 6][i] ?? 0 })),
        ...shift(at(FRAGMENT_PRIYA).slice(0, 4), 16, 0.85).map((n, i) => ({ ...n, dur: 1.6, detune: [9, -14, 6, -11][i] ?? 0 })),
        ...shift(at(FRAGMENT_PRIYA).slice(0, 1), 30, 0.6).map((n) => ({ ...n, dur: 3, detune: 9 })),
      ],
      gain: 0.5,
      pan: -0.2,
      echo: 0.35,
    },
    {
      id: 'hall-chords',
      instrument: harmonium,
      notes: shift(CHORDS_BARB.slice(0, 6), 36, 0.5),
      gain: 0.1,
      pan: 0.2,
    },
    { id: 'hall-air', instrument: air, notes: swells(54, 9), gain: 0.035, pan: 0.3 },
  ],
};

/** Night 7 — the horn room, door open. Bars 1–5, enormous, then the rest. */
export const cueHornClose: Song = {
  id: 'horn-close',
  bpm: 120,
  lengthBeats: 60,
  echo: { beats: 4, feedback: 0.45 },
  patterns: [
    {
      id: 'horn-full',
      instrument: hornClose,
      // Sequential: bars 1–2 at 6, bar 3 at 18, bar 4 at 24, bar 5 at 30;
      // the rest (bar 6) is beats 36–42, held.
      notes: [
        ...transpose(shift(at(FRAGMENT_DIANNE), 6), -12),
        ...transpose(shift(at(FRAGMENT_WADE), 18), -12),
        ...transpose(shift(at(FRAGMENT_PRIYA), 24), -12),
        ...transpose(shift(at(FRAGMENT_SAM), 30), -12),
      ],
      gain: 0.62,
      pan: 0,
      echo: 0.55,
    },
    {
      id: 'under-drone',
      instrument: foghorn,
      notes: [{ t: 0, dur: 40, pitch: 26, vel: 0.8 }],
      gain: 0.4,
      pan: -0.1,
    },
    // Bar 6: beats 36–42 are the rest — only the sea, and the echo dying.
    { id: 'night-lake', instrument: air, notes: swells(56, 5), gain: 0.08, pan: 0.2 },
  ],
};

export const ACT1_CUES: readonly Song[] = [
  cueWrensRoom,
  cueWadeTheme,
  cuePriyaTheme,
  cueSamTheme,
  cueTamTheme,
  cueHallUpright,
  cueHornClose,
];
