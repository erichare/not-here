/** Committed sampled recordings; normal builds need no local instrument libraries. */
import { ACT3_FRAGMENT_ORDER, type Act3LayerId } from '../scores/act3-ensemble.ts';

export const SAMPLED_SOUNDTRACK_DIRECTORY = 'music/a-place-kept-v1';
export const TITLE_REVEAL_SECONDS = 4.945333;
export const SAMPLED_ENSEMBLE_SECONDS = 19.2;
export const SAMPLED_ENSEMBLE_FRAMES = 921_600;

export interface SampledCue {
  readonly file: string;
  readonly caption: string;
  readonly loop: boolean;
}

const cue = (id: string, caption: string, loop = true): SampledCue => ({
  file: `${SAMPLED_SOUNDTRACK_DIRECTORY}/${id}.m4a`, caption, loop,
});

/** Existing story cue identities remain stable across the new arrangements. */
export const SAMPLED_CUES: Readonly<Record<string, SampledCue>> = {
  'v2-title': cue('v2-title', 'a rising piano phrase, answered by plucked strings'),
  'v2-foghorn-312': cue('v2-foghorn-312', 'five bars over the water, then the stop', false),
  'v2-horn-close': cue('v2-horn-close', 'the low call at arm’s length, all five bars returning'),
  'v2-motel': cue('v2-motel', 'low piano notes; long spaces around the heater'),
  'v2-wharf': cue('v2-wharf', 'a falling piano phrase, and a low wooden reply'),
  'v2-clinic': cue('v2-clinic', 'a piano turn faces the wrong way; the room waits'),
  'v2-boathouse': cue('v2-boathouse', 'a quick plucked run, with room around each answer'),
  'v2-hall': cue('v2-hall', 'the piano stops before the turn is complete'),
  'v2-shelter': cue('v2-shelter', 'a soft wooden pulse and guitar notes leaving space for the road'),
  'v2-potluck': cue('v2-potluck', 'piano and guitar share the room, answering one another'),
  'v2-letter': cue('v2-letter', 'the questioning turn, then notes with their own space', false),
  'v2-arrival': cue('v2-arrival', 'a quick guitar phrase; a quiet answer after a pause', false),
  'v2-two-wrens': cue('v2-two-wrens', 'piano and guitar sit apart, with room for both', false),
  'v2-long-winter': cue('v2-long-winter', 'warm piano chords, with a small guitar phrase beside them', false),
  'v2-stranger': cue('v2-stranger', 'a small guitar phrase takes the road at its own pace', false),
  'v2-wren-again': cue('v2-wren-again', 'the borrowed guitar lullaby; underneath it the piano remains out of tune', false),
  'v2-ash': cue('v2-ash', 'the voices disappear into silence', false),
  'v2-kettle': cue('v2-kettle', 'piano chords, a small guitar phrase, room to breathe'),
  'v2-shore': cue('v2-shore', 'low piano across the water; guitar notes left apart'),
  'v2-room': cue('v2-room', 'the first two bars, close enough to hear the strings'),
  'v2-room-hollow': cue('v2-room-hollow', 'the guitar has gone from the room; the piano remains'),
  'v2-fingerprint-never': cue('v2-fingerprint-never', 'two plucked notes; the second turns away', false),
  'v2-fingerprint-forgot': cue('v2-fingerprint-forgot', 'two plucked notes, the second arriving early', false),
  'v2-fingerprint-door': cue('v2-fingerprint-door', 'two plucked notes, with a space left open', false),
  'v2-sixth-open': cue('v2-sixth-open', 'five bars, and your own rising answer', false),
  'v2-sixth-rest': cue('v2-sixth-rest', 'five bars, and your own quiet return', false),
};

const ENSEMBLE_IDS: readonly string[] = ['sea', ...ACT3_FRAGMENT_ORDER];

/** Undefined means this is not one of the committed sampled recordings. */
export const sampledAudioFile = (name: string): string | undefined => {
  const ordinary = SAMPLED_CUES[name];
  if (ordinary) return ordinary.file;
  const match = /^v2-ensemble-([a-z]+)(-lowered)?$/.exec(name);
  if (!match || !ENSEMBLE_IDS.includes(match[1]!) || (match[1] === 'sea' && match[2])) return undefined;
  return `${SAMPLED_SOUNDTRACK_DIRECTORY}/${name}.wav`;
};

/** These stems already carry their authored balance; avoid attenuating it twice. */
export const SAMPLED_ENSEMBLE_GAINS: Readonly<Record<Act3LayerId, number>> = {
  sea: 1, sam: 1, dianne: 1, barb: 1, priya: 1, tam: 1, wade: 1,
};
