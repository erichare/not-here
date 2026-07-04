/**
 * Cue playback for `music.cue` engine events. Fetches /auditions/<cue>.wav,
 * decodes once (cached), and loops it through a per-cue GainNode with a 1s
 * crossfade between cues. Missing or undecodable files degrade silently to
 * the onFallback caption (tier-3: the '♪ cue' ledger note).
 *
 * Browsers gate audio behind a user gesture: start() must be called from the
 * title-screen click before any cue will sound.
 */

const CROSSFADE_SECONDS = 1;

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

  const fadeOutCurrent = (context: AudioContext): void => {
    if (!current) return;
    const now = context.currentTime;
    const { gain, source } = current;
    gain.gain.cancelScheduledValues(now);
    gain.gain.setValueAtTime(gain.gain.value, now);
    gain.gain.linearRampToValueAtTime(0, now + CROSSFADE_SECONDS);
    try {
      source.stop(now + CROSSFADE_SECONDS + 0.05);
    } catch {
      // Already stopped — nothing to do.
    }
    current = null;
  };

  const fadeIn = (context: AudioContext, name: string, buffer: AudioBuffer): void => {
    const now = context.currentTime;
    const source = context.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    const gain = context.createGain();
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(1, now + CROSSFADE_SECONDS);
    source.connect(gain);
    gain.connect(context.destination);
    source.start(now);
    current = { cue: name, source, gain };
  };

  const transition = async (name: string): Promise<void> => {
    if (!ctx) return;
    const buffer = await load(ctx, name);
    if (wanted !== name) return; // superseded while fetching
    fadeOutCurrent(ctx);
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
      if (wanted === name) return;
      wanted = name;
      if (!ctx) {
        // No gesture yet: remember the cue; start() will pick it up.
        return;
      }
      void transition(name);
    },
  };
};
