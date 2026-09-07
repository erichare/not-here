/** Edition two: the approved acoustic language carried through November. */
import type { Instrument, NoteEvent, Pattern, Song } from '../src/types.ts';
import { CHORDS_BARB, FRAGMENT_DIANNE, FRAGMENT_PRIYA, FRAGMENT_SAM, FRAGMENT_WADE } from './foghorn-song.ts';

export const ACOUSTIC_PALETTE = {
  guitar: { kind: 'acoustic', voice: 'guitar', env: { attack: .004, decay: 1.4, sustain: .22, release: 1.6 } },
  piano: { kind: 'acoustic', voice: 'piano', env: { attack: .009, decay: 1.8, sustain: .18, release: 2.2 } },
  harmonium: { kind: 'fm', ratio: 2, index: .35, env: { attack: .7, decay: .8, sustain: .45, release: 1.2 } },
  whistle: { kind: 'fm', ratio: 2, index: .08, env: { attack: .065, decay: .18, sustain: .6, release: .18 }, vibrato: { depthCents: 7, rateHz: 4.8, delay: .2 } },
  horn: { kind: 'fm', ratio: 1, index: .65, env: { attack: 1.2, decay: .8, sustain: .65, release: 2.1 } },
  tap: { kind: 'noise', lowpassHz: 650, env: { attack: .004, decay: .07, sustain: 0, release: .08 } },
} as const satisfies Record<string, Instrument>;
const phrase = (source: readonly NoteEvent[], start: number, octave = 0, stretch = 1): NoteEvent[] => {
  const first = source[0]?.t ?? 0;
  return source.map((note, i) => ({ ...note, t: start + (note.t - first) * stretch, dur: note.dur * stretch, pitch: note.pitch + octave, vel: (note.vel ?? 1) * (.63 + (i % 3) * .045) }));
};
const voice = (id: string, instrument: keyof typeof ACOUSTIC_PALETTE, notes: readonly NoteEvent[], gain: number, pan = 0): Pattern => ({ id, instrument: ACOUSTIC_PALETTE[instrument], notes, gain, pan });
const cue = (id: string, patterns: readonly Pattern[], lengthBeats = 144, bpm = 144): Song => ({ id: `v2-${id}`, bpm, lengthBeats, patterns });
const spaced = (source: readonly NoteEvent[], starts: readonly number[], octave = 0) => starts.flatMap(t => phrase(source, t, octave));
const twoNotes: readonly NoteEvent[] = [{ t: 0, dur: 2, pitch: 62, vel: .65 }, { t: 6, dur: 2, pitch: 57, vel: .55 }];
const invertedTurn = FRAGMENT_PRIYA.map(n => ({ ...n, pitch: 2 * 71 - n.pitch }));
const roadPulse = [0, 3, 6, 9, 18, 21].map(t => ({ t, dur: .12, pitch: 0, vel: .5 }));

export const PRODUCTION_SCORES: readonly Song[] = [
  cue('motel', [voice('player', 'piano', spaced(twoNotes, [8, 64, 118], -12), .3, -.1), voice('air', 'harmonium', [{ t: 38, dur: 10, pitch: 50, vel: .25 }, { t: 94, dur: 9, pitch: 45, vel: .2 }], .07, .2)]),
  cue('wharf', [voice('wade', 'horn', spaced(FRAGMENT_WADE, [12, 78], -24), .3, .25), voice('wood', 'guitar', spaced(twoNotes, [44, 114], -12), .24, -.15)]),
  cue('clinic', [voice('priya', 'piano', spaced(invertedTurn, [6, 66, 114], -12), .3, -.18), voice('breath', 'harmonium', [{ t: 34, dur: 6, pitch: 55, vel: .25 }, { t: 95, dur: 7, pitch: 59, vel: .2 }], .06, .15)]),
  cue('boathouse', [voice('sam', 'whistle', spaced(FRAGMENT_SAM, [14, 68, 122], -12), .24, .16), voice('work', 'guitar', spaced(CHORDS_BARB.slice(0, 6), [0, 48, 102]), .24, -.18)]),
  cue('hall', [voice('barb', 'piano', spaced(CHORDS_BARB, [6, 78]), .22, -.1), voice('turn', 'piano', spaced(FRAGMENT_PRIYA.slice(0, 3), [34, 110], -12), .32, .15)]),
  cue('shelter', [voice('traveller', 'guitar', spaced(twoNotes, [12, 72, 124], -12), .32, -.12), voice('tam', 'tap', spaced(roadPulse, [0, 54, 108]), .055, .15)]),
  cue('potluck', [voice('barb', 'piano', spaced(CHORDS_BARB, [0, 48, 96]), .22, -.18), voice('dianne', 'guitar', spaced(FRAGMENT_DIANNE, [12, 78], -12), .26, .1), voice('sam', 'whistle', spaced(FRAGMENT_SAM, [38, 116], -12), .15, .25)], 156),
  cue('letter', [voice('question', 'piano', phrase(invertedTurn.slice(0, 3), 8, -12, 2), .25), voice('other-life', 'guitar', phrase(twoNotes, 33), .3, .15)], 72),
  cue('arrival', [voice('sam', 'whistle', phrase(FRAGMENT_SAM, 12, -12), .25, -.15), voice('room-for-her', 'guitar', phrase(twoNotes, 34), .3, .12)], 66),
  cue('two-wrens', [voice('a-place', 'piano', spaced(CHORDS_BARB.slice(0, 9), [0, 36]), .23, -.2), voice('a-person', 'guitar', spaced(twoNotes, [22, 62]), .32, .2)], 90),
  cue('long-winter', [voice('barb', 'piano', spaced(CHORDS_BARB, [0, 48]), .23, -.12), voice('warmth', 'harmonium', [{ t: 18, dur: 10, pitch: 50, vel: .25 }, { t: 66, dur: 10, pitch: 53, vel: .2 }], .06)], 96),
  cue('stranger', [voice('own-name', 'guitar', spaced(twoNotes, [6, 38, 66]), .3), voice('road', 'tap', spaced(roadPulse, [0, 36]), .04)], 90),
  cue('wren-again', [voice('borrowed', 'guitar', spaced(FRAGMENT_DIANNE, [0, 42], -12), .3, -.1), voice('cost', 'harmonium', [{ t: 12, dur: 12, pitch: 50, detune: -50, vel: .35 }, { t: 56, dur: 14, pitch: 45, detune: -50, vel: .25 }], .15, .15)], 96),
  cue('ash', [voice('barb', 'piano', phrase(CHORDS_BARB.slice(0, 3), 0), .25), voice('absence', 'harmonium', [{ t: 12, dur: 7, pitch: 50, detune: -50, vel: .3 }], .08)], 54),
];

/** Finale and reveal cues finish once, allowing actual silence afterwards. */
export const PRODUCTION_ONE_SHOTS = new Set(['letter', 'arrival', 'two-wrens', 'long-winter', 'stranger', 'wren-again', 'ash'].map(id => `v2-${id}`));

/** Same identities, meter and gaps as the original ensemble; a new orchestration. */
export const ACOUSTIC_ENSEMBLE: readonly Song[] = [
  cue('ensemble-sea', [voice('air', 'harmonium', [{ t: 0, dur: 26, pitch: 38, vel: .2 }], .04)], 36),
  cue('ensemble-sam', [voice('sam', 'whistle', FRAGMENT_SAM.map(n => ({ ...n, pitch: n.pitch - 12 })), .5, .15)], 36),
  cue('ensemble-dianne', [voice('dianne', 'guitar', FRAGMENT_DIANNE.map(n => ({ ...n, pitch: n.pitch - 12 })), .55, -.12)], 36),
  cue('ensemble-barb', [voice('barb', 'piano', CHORDS_BARB, .16, .1)], 36),
  cue('ensemble-priya', [voice('priya', 'piano', FRAGMENT_PRIYA.map(n => ({ ...n, pitch: n.pitch - 12 })), .45, -.05)], 36),
  cue('ensemble-tam', [voice('tam', 'tap', Array.from({ length: 10 }, (_, i) => ({ t: i * 3, dur: .15, pitch: 0, vel: .65 })), .3, .05)], 36),
  cue('ensemble-wade', [voice('wade', 'horn', FRAGMENT_WADE.map(n => ({ ...n, pitch: n.pitch - 24 })), .5, .3)], 36),
];
