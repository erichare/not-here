/**
 * Diegetic cue captions — the single map both frontends use when a cue is
 * named on screen (tier-3 fallback, accessibility caption). Captions are
 * written to the prose register: feel, not label. A raw cue id must never
 * reach a player; unknown cues fall back to a generic line, never the id.
 *
 * Loop policy lives here too: ambient cues loop under the scene, the nightly
 * horn beat plays once, and the Night-7 close call repeats until the player
 * either closes the valve or leaves it playing.
 */

export interface CueMeta {
  /** What the caption channel prints after the '♪'. Never the cue id. */
  readonly caption: string;
  /** False for one-shot beats: play once, then nothing. */
  readonly loop: boolean;
}

export const CUE_META: Readonly<Record<string, CueMeta>> = {
  'v2-motel': { caption: 'two low piano notes; long spaces around the heater', loop: true },
  'v2-wharf': { caption: 'the horn’s falling third, and a low wooden reply', loop: true },
  'v2-clinic': { caption: 'a piano turn faces the wrong way; the room waits', loop: true },
  'v2-boathouse': { caption: 'a loose whistled run over plucked strings', loop: true },
  'v2-hall': { caption: 'an imperfect upright, stopping before the turn is complete', loop: true },
  'v2-shelter': { caption: 'a soft pulse and two guitar notes leaving space for the road', loop: true },
  'v2-potluck': { caption: 'piano and guitar share the room; a whistle finds a place between them', loop: true },
  'v2-letter': { caption: 'the questioning turn, then two notes with their own space', loop: false },
  'v2-arrival': { caption: 'Sam’s whistled run; a quiet guitar answer after a pause', loop: false },
  'v2-two-wrens': { caption: 'piano and guitar sit apart, with room for both', loop: false },
  'v2-long-winter': { caption: 'Barb’s chords stay warm as the reed settles beside them', loop: false },
  'v2-stranger': { caption: 'a small guitar phrase takes the road at its own pace', loop: false },
  'v2-wren-again': { caption: 'the borrowed lullaby; underneath it a reed remains out of tune', loop: false },
  'v2-ash': { caption: 'a piano chord, a reed losing its place, then silence', loop: false },
  'v2-kettle': { caption: 'piano chords, a small guitar phrase, room to breathe', loop: true },
  'v2-shore': { caption: 'a low reed across the water; two guitar notes left apart', loop: true },
  'v2-room': { caption: 'the first two bars, close enough to hear the strings', loop: true },
  'v2-room-hollow': { caption: 'the guitar has gone from the room; a thin reed remains', loop: true },
  'v2-fingerprint-never': { caption: 'two plucked notes; the second turns away', loop: false },
  'v2-fingerprint-forgot': { caption: 'two plucked notes, the second arriving early', loop: false },
  'v2-fingerprint-door': { caption: 'two plucked notes, with a space left open', loop: false },
  'v2-sixth-open': { caption: 'five bars, and your own rising answer', loop: false },
  'v2-sixth-rest': { caption: 'five bars, and your own quiet return', loop: false },
  title: { caption: 'five bars you almost know', loop: true },
  'foghorn-song-title': { caption: 'five bars you almost know', loop: true },
  shingle: { caption: 'small waves working the gravel', loop: true },
  'pub-warm': { caption: 'the Kettle, warm side of the glass', loop: true },
  // Retheme alias — same room, newer name; either id captions the same.
  'kettle-warm': { caption: 'the Kettle, warm side of the glass', loop: true },
  'dianne-theme': {
    caption: 'a lullaby, twice — the second time barely there',
    loop: true,
  },
  'foghorn-312': {
    caption: 'five bars over the water, then the stop',
    loop: false,
  },
  'wrens-room': { caption: 'a tune the kept room knows', loop: true },
  'wade-theme': { caption: 'a call over the water, and its low answer', loop: true },
  'priya-theme': { caption: 'a small tune turned wrong side out', loop: true },
  'sam-theme': { caption: 'a whistled run that will not sit still', loop: true },
  'tam-theme': {
    caption: 'engine idle, road hum — once, low, half a lullaby',
    loop: true,
  },
  'hall-upright': {
    caption: 'the hall upright, finding the turn and stopping',
    loop: true,
  },
  'horn-close': {
    caption: 'the horn at arm’s length, all five bars returning',
    loop: true,
  },
  // The Act 3 chord.add ensemble — the night's five bars reassembling.
  'act3-ensemble': {
    caption: 'five bars over the water, gaining voices',
    loop: true,
  },
};

/** What plays when a cue nobody catalogued drifts through. Never the id. */
export const UNKNOWN_CUE_CAPTION = 'something under the room, too low to place';

/** Diegetic caption for a cue id. Total: unknown ids get the generic line. */
export const cueCaption = (cue: string): string =>
  CUE_META[cue]?.caption ?? UNKNOWN_CUE_CAPTION;

/** Whether a cue loops under the scene. Unknown cues loop (ambient default). */
export const cueLoops = (cue: string): boolean => CUE_META[cue]?.loop ?? true;
