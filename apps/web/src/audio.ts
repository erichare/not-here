/**
 * Cue playback for `music.cue` / `music.stop` engine events. Fetches
 * /auditions/<cue>.wav, decodes once (cached), and plays it through a
 * per-cue GainNode with a 1s crossfade between cues. Loop policy comes from
 * the shared cue map: ambient cues and the Night-7 close call loop; one-shot
 * beats play once and leave silence. stop() fades the current source out over ~1.5s and
 * nothing plays again until the next cue — the silence is the score.
 * Missing or undecodable files degrade silently to the onFallback caption
 * (tier-3: the '♪ <caption>' ledger note).
 *
 * Browsers gate audio behind a user gesture: start() must be called from the
 * title-screen click before any cue will sound.
 */

import { cueLoops } from './cues.ts';

const CROSSFADE_SECONDS = 1;
const STOP_FADE_SECONDS = 1.5;

interface PlayingCue {
  readonly cue: string;
  readonly source: AudioBufferSourceNode;
  readonly gain: GainNode;
}

export interface AudioPlayer {
  /** Create/resume the AudioContext. Call from a user gesture. */
  readonly start: () => Promise<void>;
  /** Transition to a cue by name. Fire-and-forget; never throws. */
  readonly cue: (name: string) => void;
  /** Fade to silence; no cue plays until the next cue(). Never throws. */
  readonly stop: () => void;
}

export const createAudioPlayer = (
  onFallback: (cue: string) => void,
): AudioPlayer => {
  let ctx: AudioContext | null = null;
  let current: PlayingCue | null = null;
  /** Latest requested cue — stale fetches resolve and bow out. */
  let wanted: string | null = null;
  /** Decoded buffers; null marks a cue known to be missing/broken. */
  const buffers = new Map<string, AudioBuffer | null>();

  const load = async (context: AudioContext, name: string): Promise<AudioBuffer | null> => {
    const cached = buffers.get(name);
    if (cached !== undefined) return cached;
    try {
      const response = await fetch(`/auditions/${encodeURIComponent(name)}.wav`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const bytes = await response.arrayBuffer();
      const buffer = await context.decodeAudioData(bytes);
      buffers.set(name, buffer);
      return buffer;
    } catch {
      buffers.set(name, null);
      return null;
    }
  };

  const fadeOutCurrent = (context: AudioContext, seconds: number): void => {
    if (!current) return;
    const now = context.currentTime;
    const { gain, source } = current;
    gain.gain.cancelScheduledValues(now);
    gain.gain.setValueAtTime(gain.gain.value, now);
    gain.gain.linearRampToValueAtTime(0, now + seconds);
    try {
      source.stop(now + seconds + 0.05);
    } catch {
      // Already stopped — nothing to do.
    }
    current = null;
  };

  const fadeIn = (context: AudioContext, name: string, buffer: AudioBuffer): void => {
    const now = context.currentTime;
    const source = context.createBufferSource();
    source.buffer = buffer;
    source.loop = cueLoops(name);
    const gain = context.createGain();
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(1, now + CROSSFADE_SECONDS);
    source.connect(gain);
    gain.connect(context.destination);
    const started: PlayingCue = { cue: name, source, gain };
    if (!source.loop) {
      // One-shot beat: when it ends on its own, it leaves real silence.
      source.onended = (): void => {
        if (current === started) current = null;
      };
    }
    source.start(now);
    current = started;
  };

  const transition = async (name: string): Promise<void> => {
    if (!ctx) return;
    const buffer = await load(ctx, name);
    if (wanted !== name) return; // superseded (or stopped) while fetching
    fadeOutCurrent(ctx, CROSSFADE_SECONDS);
    if (buffer === null) {
      onFallback(name);
      return;
    }
    fadeIn(ctx, name, buffer);
  };

  return {
    start: async () => {
      ctx ??= new AudioContext();
      if (ctx.state === 'suspended') await ctx.resume();
      if (wanted !== null && current === null) void transition(wanted);
    },
    cue: (name) => {
      // Re-requests of the playing cue are no-ops, but the same cue after a
      // one-shot ended (or a failed load) must sound again next scene.
      if (wanted === name && current !== null) return;
      wanted = name;
      if (!ctx) {
        // No gesture yet: remember the cue; start() will pick it up.
        return;
      }
      void transition(name);
    },
    stop: () => {
      // Drop the wish first so an in-flight fetch bows out (wanted !== name).
      wanted = null;
      if (!ctx) return;
      fadeOutCurrent(ctx, STOP_FADE_SECONDS);
    },
  };
};
