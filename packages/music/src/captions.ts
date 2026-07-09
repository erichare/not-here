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
};

/** What plays when a cue nobody catalogued drifts through. Never the id. */
export const UNKNOWN_CUE_CAPTION = 'something under the room, too low to place';

/** Diegetic caption for a cue id. Total: unknown ids get the generic line. */
export const cueCaption = (cue: string): string =>
  CUE_META[cue]?.caption ?? UNKNOWN_CUE_CAPTION;

/** Whether a cue loops under the scene. Unknown cues loop (ambient default). */
export const cueLoops = (cue: string): boolean => CUE_META[cue]?.loop ?? true;
