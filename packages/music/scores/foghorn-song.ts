/**
 * THE FOGHORN SONG — main theme of NOT HERE.
 *
 * Six bars in D dorian, 6/8 (beat = eighth note, 6 beats per bar).
 * Bar 6 is a rest. The whole score of the game derives from bars 1–5.
 *
 * Fragment ownership (see design/game-bible.md):
 *   bars 1–2  Dora   — music-box lullaby
 *   bar  3    Elias  — the horn's falling minor third, A → F
 *   bar  4    Ivy    — the turn figure (she remembers it INVERTED)
 *   bar  5    Sam    — the quick rising run, sped up the way a child whistles
 *   chords    Maud   — accompaniment only; she never presumed to know the tune
 *   (rhythm   Tam    — pitchless ostinato; not present in the title arrangement)
 *
 * The melody ends bar 5 hanging on E — the 2nd degree — over the rest where
 * the sixth bar should be. It wants D. It never gets it.
 */

import type {
  Envelope,
  Instrument,
  NoteEvent,
  Pattern,
  Song,
} from '../src/types.ts';

// ---------------------------------------------------------------------------
// Pitches (MIDI)
const D2 = 38;
const F2 = 41;
const A2 = 45;
const C3 = 48;
const D3 = 50;
const F3 = 53;
const G3 = 55;
const A3 = 57;
const B3 = 59;
const C4 = 60;
const D4 = 62;
const E4 = 64;
const F4 = 65;
const G4 = 67;
const A4 = 69;
const B4 = 71;
const C5 = 72;
const D5 = 74;
const E5 = 76;
const F5 = 77;
const G5 = 79;
const A5 = 81;

const BAR = 6; // beats (eighth notes) per bar
export const VERSE_BEATS = 6 * BAR; // six bars

const n = (t: number, dur: number, pitch: number, vel = 1): NoteEvent => ({
  t,
  dur,
  pitch,
  vel,
});

const shift = (notes: readonly NoteEvent[], beats: number): NoteEvent[] =>
  notes.map((note) => ({ ...note, t: note.t + beats }));

// ---------------------------------------------------------------------------
// THE MELODY — bars 1–5, then the rest.

/** Dora, bars 1–2: the lullaby. A gentle arch, then a fall to warmth. */
export const FRAGMENT_DORA: readonly NoteEvent[] = [
  n(0, 2, D5), n(2, 1, E5), n(3, 2, F5), n(5, 1, E5),
  n(6, 2, D5), n(8, 1, C5), n(9, 3, A4),
];

/** Elias, bar 3: the horn. A falling minor third, held. */
export const FRAGMENT_ELIAS: readonly NoteEvent[] = [
  n(12, 3, A4), n(15, 3, F4),
];

/** Ivy, bar 4: the turn — the dorian B natural, questioning. */
export const FRAGMENT_IVY: readonly NoteEvent[] = [
  n(18, 1, B4), n(19, 1, C5), n(20, 1, D5), n(21, 1, C5), n(22, 1, B4), n(23, 1, G4),
];

/** Sam, bar 5: the run — quick, rising, ends hanging on the 2nd degree. */
export const FRAGMENT_SAM: readonly NoteEvent[] = [
  n(24, 1, D5), n(25, 1, E5), n(26, 1, F5), n(27, 1, G5), n(28, 1, A5, 0.9),
  n(29, 1, E5, 0.85),
];

/** Bars 1–5 assembled. Bar 6 (beats 30–35) is a rest — always. */
export const MELODY: readonly NoteEvent[] = [
  ...FRAGMENT_DORA,
  ...FRAGMENT_ELIAS,
  ...FRAGMENT_IVY,
  ...FRAGMENT_SAM,
];

/** Maud, chords: Dm | C | F | G | F→Am | (rest). Voiced low-mid, close. */
const chord = (t: number, dur: number, pitches: readonly number[], vel = 1): NoteEvent[] =>
  pitches.map((p) => n(t, dur, p, vel));

export const CHORDS_MAUD: readonly NoteEvent[] = [
  ...chord(0, 6, [D3, A3, F4], 0.9),
  ...chord(6, 6, [C3, G3, E4], 0.85),
  ...chord(12, 6, [F3, A3, C4], 0.85),
  ...chord(18, 6, [G3, B3, D4], 0.9),
  ...chord(24, 3, [F3, A3, C4], 0.85),
  ...chord(27, 3, [A3, C4, E4], 0.8),
];

/** Verse-C counter-line: a slow walk underneath, pulse voice. */
const COUNTER: readonly NoteEvent[] = [
  n(0, 3, D4, 0.9), n(3, 3, C4, 0.8),
  n(6, 3, A3, 0.85), n(9, 3, G3, 0.8),
  n(12, 6, F3, 0.85),
  n(18, 3, G3, 0.8), n(21, 3, B3, 0.85),
  n(24, 3, F3, 0.8), n(27, 3, A3, 0.85),
];

// ---------------------------------------------------------------------------
// Instruments — chiptune-folk palette.

const musicBox: Instrument = {
  kind: 'triangle',
  env: { attack: 0.003, decay: 1.1, sustain: 0.12, release: 0.7 },
  vibrato: { depthCents: 5, rateHz: 0.7, delay: 0 }, // tape warble
};

const musicBoxSparkle: Instrument = {
  kind: 'triangle',
  env: { attack: 0.002, decay: 0.35, sustain: 0, release: 0.2 },
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

const fiddle: Instrument = {
  kind: 'pulse',
  duty: 0.25,
  env: { attack: 0.06, decay: 0.25, sustain: 0.6, release: 0.35 },
  vibrato: { depthCents: 12, rateHz: 5.2, delay: 0.18 },
};

const counterPulse: Instrument = {
  kind: 'pulse',
  duty: 0.125,
  env: { attack: 0.03, decay: 0.3, sustain: 0.5, release: 0.4 },
};

const sea: Instrument = {
  kind: 'noise',
  env: { attack: 1.4, decay: 1.2, sustain: 0.5, release: 2.2 },
  lowpassHz: 620,
};

// ---------------------------------------------------------------------------
// Arrangement — title-screen audition build.
//   intro (2 bars): sea, one distant horn call
//   verse A: music box alone
//   verse B: + harmonium (Maud), + foghorn drone
//   verse C: + fiddle unison, + counter-line — the fullest the theme ever gets
//   outro (3 bars): bar-six silence, the horn calling A→F into the fog
const INTRO = 2 * BAR;
const VERSE_A = INTRO;
const VERSE_B = VERSE_A + VERSE_BEATS;
const VERSE_C = VERSE_B + VERSE_BEATS;
const OUTRO = VERSE_C + VERSE_BEATS;
const LENGTH = OUTRO + 3 * BAR;

const seaSwells = (from: number, to: number): NoteEvent[] => {
  const swells: NoteEvent[] = [];
  for (let t = from; t < to; t += BAR) swells.push(n(t, 4, 0, 0.9));
  return swells;
};

export const foghornSong: Song = {
  id: 'foghorn-song-title',
  bpm: 144, // eighth-note pulse: dotted-quarter ≈ 48 — slow, tidal
  lengthBeats: LENGTH,
  echo: { beats: 3, feedback: 0.28 },
  patterns: [
    // The sea, throughout.
    {
      id: 'sea',
      instrument: sea,
      notes: seaSwells(0, LENGTH - BAR),
      gain: 0.055,
      pan: -0.2,
    },
    // Distant horn: intro call, then the drone through B/C, then the last call.
    {
      id: 'horn-calls',
      instrument: foghorn,
      notes: [
        n(0, 4, A2, 0.9), n(4, 6, F2, 0.9),
        n(OUTRO + 2, 4, A2, 0.8), n(OUTRO + 6, 8, F2, 0.85),
      ],
      gain: 0.5,
      pan: 0.35,
      echo: 0.5,
    },
    {
      id: 'horn-drone',
      instrument: foghorn,
      notes: [n(VERSE_B, VERSE_BEATS, D2, 0.7), n(VERSE_C, VERSE_BEATS + BAR, D2, 0.75)],
      gain: 0.4,
      pan: 0,
    },
    // The melody — music box, all three verses.
    {
      id: 'melody-musicbox',
      instrument: musicBox,
      notes: [
        ...shift(MELODY, VERSE_A),
        ...shift(MELODY, VERSE_B),
        ...shift(MELODY, VERSE_C),
      ],
      gain: 0.8,
      pan: -0.12,
      echo: 0.3,
    },
    {
      id: 'melody-sparkle',
      instrument: musicBoxSparkle,
      notes: [
        ...shift(MELODY, VERSE_A),
        ...shift(MELODY, VERSE_B),
        ...shift(MELODY, VERSE_C),
      ].map((note) => ({ ...note, pitch: note.pitch + 12, vel: (note.vel ?? 1) * 0.28 })),
      gain: 0.5,
      pan: 0.18,
      echo: 0.35,
    },
    // Maud's chords — verses B and C.
    {
      id: 'chords-harmonium',
      instrument: harmonium,
      notes: [...shift(CHORDS_MAUD, VERSE_B), ...shift(CHORDS_MAUD, VERSE_C)],
      gain: 0.16,
      pan: 0.1,
    },
    // Verse C: the fiddle joins the tune, the counter-line walks below.
    {
      id: 'fiddle-unison',
      instrument: fiddle,
      notes: shift(MELODY, VERSE_C).map((note) => ({
        ...note,
        vel: (note.vel ?? 1) * 0.5,
      })),
      gain: 0.3,
      pan: 0.3,
      echo: 0.2,
    },
    {
      id: 'counter-line',
      instrument: counterPulse,
      notes: shift(COUNTER, VERSE_C),
      gain: 0.22,
      pan: -0.3,
    },
  ],
};
