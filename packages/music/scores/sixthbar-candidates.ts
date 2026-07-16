/**
 * THE SIXTH BAR — candidate variants for Act 3's composition finale.
 *
 * AUDITION MATERIAL ONLY. Nothing here is wired into the game; per
 * design/act3-plan.md §Cues, no new sound ships unheard. These are the three
 * notated fallback variants the no-key game selects by the player's Night-1
 * answer (n1:goodbye) — the intake literally composes your bar (clue #11):
 *
 *   'never'  — a bar that ends without cadence. Out of bar 5's hanging E it
 *              climbs the ii triad — E, G, then a trailed-off B — the chord
 *              that most wants to lead home, stacked and then abandoned on
 *              the dorian question-note, with air left in the bar.
 *   'forgot' — a bar that quotes bar 1 and stops mid-figure. The lullaby's
 *              opening restated at pitch, then the memory fails on its peak
 *              note: the F cut to a single fading beat, and nothing after.
 *   'door'   — the only variant that resolves. Bar 1 circles D–E–F–E and
 *              never comes down the far side; this bar finishes the arch —
 *              F, E, and the first D the melody has ever been given, held
 *              plain to the end.
 *
 * Each candidate renders two ways: SOLO on the guitar voice (the player's
 * instrument), and IN CONTEXT — bars 1–5 exactly as shipped on the music box,
 * the candidate answering in bar 6 over the sea and the horn's low D.
 */

import type { Instrument, NoteEvent, Song } from '../src/types.ts';
import { CHORDS_BARB, MELODY, VERSE_BEATS } from './foghorn-song.ts';

// ---------------------------------------------------------------------------
// Pitches (MIDI) — the candidates live in the melody's own register.
const D2 = 38;
const F2 = 41;
const A2 = 45;
const B4 = 71;
const D5 = 74;
const E5 = 76;
const F5 = 77;
const G5 = 79;

const BAR = 6; // beats (eighth notes) per bar, as in foghorn-song.ts

const n = (t: number, dur: number, pitch: number, vel = 1): NoteEvent => ({
  t,
  dur,
  pitch,
  vel,
});

const shift = (notes: readonly NoteEvent[], beats: number): NoteEvent[] =>
  notes.map((note) => ({ ...note, t: note.t + beats }));

// ---------------------------------------------------------------------------
// The candidate bars. Times are relative to beat 0 of the sixth bar; each
// spans at most 6 beats, rests as absence.

/** 'never' — E5(2) G5(2) B4(1), then air. No D anywhere; no cadence. */
export const SIXTHBAR_NEVER: readonly NoteEvent[] = [
  n(0, 2, E5, 0.85), n(2, 2, G5, 0.75), n(4, 1, B4, 0.65),
];

/** 'forgot' — bar 1's opening at pitch, broken on its peak: D5(2) E5(1) F5(1), then two silent beats. */
export const SIXTHBAR_FORGOT: readonly NoteEvent[] = [
  n(0, 2, D5, 0.85), n(2, 1, E5, 0.8), n(3, 1, F5, 0.7),
];

/** 'door' — the arch completed: F5(1) E5(1) D5(4), the D held to the bar's end. */
export const SIXTHBAR_DOOR: readonly NoteEvent[] = [
  n(0, 1, F5, 0.85), n(1, 1, E5, 0.8), n(2, 4, D5, 0.9),
];

// ---------------------------------------------------------------------------
// Voices — mirrors of the shipped instruments in foghorn-song.ts (which keeps
// its voices module-private; redefined here so this file stays audition-only
// and touches nothing shipped).

const guitar: Instrument = {
  kind: 'pulse',
  duty: 0.25,
  env: { attack: 0.06, decay: 0.25, sustain: 0.6, release: 0.35 },
  vibrato: { depthCents: 12, rateHz: 5.2, delay: 0.18 },
};

const musicBox: Instrument = {
  kind: 'triangle',
  env: { attack: 0.003, decay: 1.1, sustain: 0.12, release: 0.7 },
  vibrato: { depthCents: 5, rateHz: 0.7, delay: 0 },
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

const sea: Instrument = {
  kind: 'noise',
  env: { attack: 1.4, decay: 1.2, sustain: 0.5, release: 2.2 },
  lowpassHz: 620,
};

// ---------------------------------------------------------------------------
// SOLO arrangements — the bar alone, guitar voice, half a bar of lead-in and
// a tail to let the release breathe. Two bars total.

const solo = (id: string, bar: readonly NoteEvent[]): Song => ({
  id,
  bpm: 144,
  lengthBeats: 2 * BAR,
  echo: { beats: 3, feedback: 0.28 },
  patterns: [
    {
      id: 'candidate-guitar',
      instrument: guitar,
      notes: shift(bar, 3),
      gain: 0.55,
      pan: 0,
      echo: 0.25,
    },
  ],
});

export const sixthbarNeverSolo: Song = solo('sixthbar-never', SIXTHBAR_NEVER);
export const sixthbarForgotSolo: Song = solo('sixthbar-forgot', SIXTHBAR_FORGOT);
export const sixthbarDoorSolo: Song = solo('sixthbar-door', SIXTHBAR_DOOR);

// ---------------------------------------------------------------------------
// CONTEXT arrangements — intro (2 bars: sea, one distant horn call), one verse
// of bars 1–5 exactly as shipped, the candidate entering in bar 6 on the
// guitar — the player's voice answering the town's tune — then the tail.

const INTRO = 2 * BAR;
const VERSE = INTRO;
const BAR_SIX = VERSE + 5 * BAR;
const LENGTH = VERSE + VERSE_BEATS + 2 * BAR;

const seaSwells = (from: number, to: number): NoteEvent[] => {
  const swells: NoteEvent[] = [];
  for (let t = from; t < to; t += BAR) swells.push(n(t, 4, 0, 0.9));
  return swells;
};

const context = (id: string, bar: readonly NoteEvent[]): Song => ({
  id,
  bpm: 144,
  lengthBeats: LENGTH,
  echo: { beats: 3, feedback: 0.28 },
  patterns: [
    {
      id: 'sea',
      instrument: sea,
      notes: seaSwells(0, LENGTH - BAR),
      gain: 0.055,
      pan: -0.2,
    },
    {
      id: 'horn-call',
      instrument: foghorn,
      notes: [n(0, 4, A2, 0.9), n(4, 6, F2, 0.9)],
      gain: 0.5,
      pan: 0.35,
      echo: 0.5,
    },
    {
      id: 'horn-drone',
      instrument: foghorn,
      notes: [n(VERSE, VERSE_BEATS + BAR, D2, 0.7)],
      gain: 0.4,
      pan: 0,
    },
    {
      id: 'melody-musicbox',
      instrument: musicBox,
      notes: shift(MELODY, VERSE),
      gain: 0.8,
      pan: -0.12,
      echo: 0.3,
    },
    {
      id: 'melody-sparkle',
      instrument: musicBoxSparkle,
      notes: shift(MELODY, VERSE).map((note) => ({
        ...note,
        pitch: note.pitch + 12,
        vel: (note.vel ?? 1) * 0.28,
      })),
      gain: 0.5,
      pan: 0.18,
      echo: 0.35,
    },
    {
      id: 'chords-harmonium',
      instrument: harmonium,
      notes: shift(CHORDS_BARB, VERSE),
      gain: 0.16,
      pan: 0.1,
    },
    {
      id: 'candidate-guitar',
      instrument: guitar,
      notes: shift(bar, BAR_SIX),
      gain: 0.5,
      pan: 0.3,
      echo: 0.3,
    },
  ],
});

export const sixthbarNeverContext: Song = context('sixthbar-never-context', SIXTHBAR_NEVER);
export const sixthbarForgotContext: Song = context('sixthbar-forgot-context', SIXTHBAR_FORGOT);
export const sixthbarDoorContext: Song = context('sixthbar-door-context', SIXTHBAR_DOOR);

export const SIXTHBAR_AUDITION: readonly Song[] = [
  sixthbarNeverSolo,
  sixthbarNeverContext,
  sixthbarForgotSolo,
  sixthbarForgotContext,
  sixthbarDoorSolo,
  sixthbarDoorContext,
];
