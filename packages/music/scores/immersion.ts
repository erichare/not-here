import { CHORDS_BARB, FRAGMENT_DIANNE, MELODY } from './foghorn-song.ts';
import type { Instrument, Song } from '../src/types.ts';

const guitar: Instrument = { kind: 'acoustic', voice: 'guitar', env: { attack: .004, decay: 1.4, sustain: .22, release: 1.6 } };
const piano: Instrument = { kind: 'acoustic', voice: 'piano', env: { attack: .009, decay: 1.8, sustain: .18, release: 2.2 } };
const reed: Instrument = { kind: 'fm', ratio: 2, index: .35, env: { attack: .7, decay: .8, sustain: .45, release: 1.2 } };
const notes = (source: typeof MELODY, offset: number, octave = 0) => source.map(n => ({ ...n, t: n.t + offset, pitch: n.pitch + octave, vel: (n.vel ?? 1) * .75 }));
export const IMMERSION_SCORES: readonly Song[] = [
  ...(['never', 'forgot', 'door'] as const).map((answer, index): Song => ({
    id: `v2-fingerprint-${answer}`, bpm: 120, lengthBeats: 9,
    patterns: [{ id: 'player', instrument: guitar, gain: .4, notes: [
      { t: 0, dur: 1, pitch: 62, vel: .55 },
      { t: [3, 2, 4][index]!, dur: [2, 1, 3][index]!, pitch: [57, 60, 64][index]!, vel: .45 },
    ] }],
  })),
  ...(['open', 'rest'] as const).map((ending): Song => ({
    id: `v2-sixth-${ending}`, bpm: 144, lengthBeats: 48,
    patterns: [{ id: 'player', instrument: guitar, gain: .55, notes: [
      ...notes(MELODY, 0),
      ...[62, 64, ending === 'open' ? 67 : 62].map((pitch, i) => ({ t: 30 + i * 2, dur: i === 2 ? 5 : 1.5, pitch, vel: .65 })),
    ] }],
  })),
  { id: 'v2-kettle', bpm: 144, lengthBeats: 108, patterns: [
    { id: 'barb', instrument: piano, notes: [0, 36, 72].flatMap(t => notes(CHORDS_BARB, t)), gain: .25, pan: -.1 },
    { id: 'dianne', instrument: guitar, notes: [12, 72].flatMap(t => notes(FRAGMENT_DIANNE, t, -12)), gain: .34, pan: .18 },
  ] },
  { id: 'v2-room', bpm: 132, lengthBeats: 72, patterns: [
    { id: 'dianne', instrument: guitar, notes: [0, 36].flatMap(t => notes(FRAGMENT_DIANNE, t, -12)), gain: .6, pan: -.12 },
    { id: 'barb', instrument: reed, notes: notes(CHORDS_BARB.slice(0, 6), 36), gain: .07, pan: .25 },
  ] },
  { id: 'v2-room-hollow', bpm: 132, lengthBeats: 72, patterns: [
    { id: 'barb', instrument: reed, notes: notes(CHORDS_BARB.slice(0, 6), 36), gain: .07, pan: .25 },
  ] },
  { id: 'v2-shore', bpm: 144, lengthBeats: 72, patterns: [
    { id: 'wade', instrument: reed, notes: [{ t: 9, dur: 9, pitch: 45 }, { t: 21, dur: 9, pitch: 41 }, { t: 51, dur: 8, pitch: 38 }], gain: .15, pan: .3 },
    { id: 'player', instrument: guitar, notes: [{ t: 34, dur: 2, pitch: 62, vel: .3 }, { t: 38, dur: 2, pitch: 57, vel: .2 }], gain: .2, pan: -.2 },
  ] },
];
