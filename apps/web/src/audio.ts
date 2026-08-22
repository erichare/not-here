/**
 * Cue playback for `music.cue` / `music.stop` engine events, plus the Act 3
 * ensemble mixer for `music.layer` / `music.chord` / `music.detune`.
 *
 * Cues: fetches /auditions/<cue>.wav, decodes once (cached), and plays it
 * through a per-cue GainNode with a 1s crossfade between cues. Loop policy
 * comes from the shared cue map: ambient cues and the Night-7 close call
 * loop; one-shot beats play once and leave silence. stop() fades the current
 * source out over ~1.5s and nothing plays again until the next cue — the
 * silence is the score. Missing or undecodable files degrade silently to the
 * onFallback caption (tier-3: the '♪ <caption>' ledger note).
 *
 * Ensemble: the chord.add mixer. Each layer is its own loop-synced WAV
 * (act3-ensemble-<layer>.wav — sample-exact 15s loops) through its own
 * GainNode; all sources start together so the stack stays in sync.
 * music.layer raises one fragment, music.chord {fragments: n} raises the
 * first n of the cascade (sam → dianne → barb → priya → tam → wade) and
 * lowers the rest; the sea bed sounds whenever any fragment is up. Layers
 * re-enter over a slow 2s ramp — a fragment returning is a confession
 * landing, not a fader slam. music.detune rides a playing layer's
 * AudioBufferSourceNode.detune — the lie-tell, live. Cue and ensemble are
 * mutually exclusive: a scene cue fades the ensemble out, and the ensemble
 * forming fades the cue.
 *
 * Browsers gate audio behind a user gesture: start() must be called from the
 * title-screen click before any cue will sound.
 */

import { ACT3_FRAGMENT_ORDER } from '@not-here/music';
import { cueLoops } from './cues.ts';
import { createEnsembleMixer, type EnsembleSnapshot } from './mixer.ts';

const CROSSFADE_SECONDS = 1;
const STOP_FADE_SECONDS = 1.5;
/** A fragment returning is a confession landing — slow, not a fader slam. */
const LAYER_FADE_SECONDS = 2;

const ENSEMBLE_LAYER_IDS = ['sea', ...ACT3_FRAGMENT_ORDER] as const;

interface PlayingCue {
  readonly cue: string;
  readonly source: AudioBufferSourceNode;
  readonly gain: GainNode;
}

interface EnsembleNode {
  readonly source: AudioBufferSourceNode;
  readonly gain: GainNode;
}

export interface AudioPlayer {
  /** Create/resume the AudioContext. Call from a user gesture. */
  readonly start: () => Promise<void>;
  /** The lamp's volume, 0..1 — applied to the master gain (not the cues). */
  readonly setVolume: (volume: number) => void;
  /** Mute is a gain of zero, never a stop — the silence stays the score. */
  readonly setMuted: (muted: boolean) => void;
  /** The Act 3 ensemble's returned fragments — for the visual twin. */
  readonly snapshot: () => EnsembleSnapshot;
  /** Transition to a cue by name. Fire-and-forget; never throws. */
  readonly cue: (name: string) => void;
  /** Fade to silence; no cue plays until the next cue(). Never throws. */
  readonly stop: () => void;
  /** music.layer: set one ensemble fragment's target gain. Never throws. */
  readonly layer: (pattern: string, gain: number) => void;
  /** music.chord: raise the first n cascade fragments, lower the rest. */
  readonly chord: (fragments: number) => void;
  /** music.detune: bend a playing ensemble layer by cents. Never throws. */
  readonly detune: (pattern: string, cents: number) => void;
}

export const createAudioPlayer = (
  onFallback: (cue: string) => void,
): AudioPlayer => {
  let ctx: AudioContext | null = null;
  /** Every cue and ensemble layer runs through this; the lamp sets it. */
  let master: GainNode | null = null;
  let volume = 1;
  let muted = false;
  let current: PlayingCue | null = null;
  /** Latest requested cue — stale fetches resolve and bow out. */
  let wanted: string | null = null;
  /** Decoded buffers; null marks a cue known to be missing/broken. */
  const buffers = new Map<string, AudioBuffer | null>();

  const mixer = createEnsembleMixer();
  let ensemble: { readonly nodes: Map<string, EnsembleNode> } | null = null;
  /** Supersession counter for async ensemble starts. */
  let ensembleGeneration = 0;

  const applyMaster = (): void => {
    if (!ctx || !master) return;
    const now = ctx.currentTime;
    master.gain.setTargetAtTime(muted ? 0 : volume, now, 0.05);
  };

  const masterOf = (context: AudioContext): GainNode => {
    if (!master) {
      master = context.createGain();
      master.gain.value = muted ? 0 : volume;
      master.connect(context.destination);
    }
    return master;
  };

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
    gain.connect(masterOf(context));
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

  // ------------------------------------------------------------- ensemble

  const teardownEnsemble = (context: AudioContext, seconds: number): void => {
    ensembleGeneration += 1; // any in-flight start bows out
    if (!ensemble) return;
    const now = context.currentTime;
    for (const { source, gain } of ensemble.nodes.values()) {
      gain.gain.cancelScheduledValues(now);
      gain.gain.setValueAtTime(gain.gain.value, now);
      gain.gain.linearRampToValueAtTime(0, now + seconds);
      try {
        source.stop(now + seconds + 0.05);
      } catch {
        // Already stopped — nothing to do.
      }
    }
    ensemble = null;
  };

  const applyMix = (context: AudioContext, mix: Readonly<Record<string, number>>): void => {
    if (!ensemble) return;
    const now = context.currentTime;
    for (const [id, node] of ensemble.nodes) {
      const target = mix[id] ?? 0;
      node.gain.gain.cancelScheduledValues(now);
      node.gain.gain.setValueAtTime(node.gain.gain.value, now);
      node.gain.gain.linearRampToValueAtTime(target, now + LAYER_FADE_SECONDS);
    }
  };

  const startEnsemble = async (context: AudioContext, generation: number): Promise<void> => {
    if (ensemble) return;
    const entries: [string, AudioBuffer][] = [];
    for (const id of ENSEMBLE_LAYER_IDS) {
      const buffer = await load(context, `act3-ensemble-${id}`);
      if (generation !== ensembleGeneration || ensemble) return; // superseded
      if (buffer === null) continue; // a missing layer degrades silently
      entries.push([id, buffer]);
    }
    if (entries.length === 0) return;
    const now = context.currentTime + 0.05;
    const nodes = new Map<string, EnsembleNode>();
    for (const [id, buffer] of entries) {
      const source = context.createBufferSource();
      source.buffer = buffer;
      source.loop = true; // layer WAVs are sample-exact 15s loops
      const gain = context.createGain();
      gain.gain.setValueAtTime(0, now);
      source.connect(gain);
      gain.connect(masterOf(context));
      source.start(now); // all layers start together — the stack stays in sync
      nodes.set(id, { source, gain });
    }
    ensemble = { nodes };
  };

  const syncEnsemble = (): void => {
    if (!ctx) return;
    const snap = mixer.snapshot();
    if (!snap.active) {
      teardownEnsemble(ctx, LAYER_FADE_SECONDS);
      return;
    }
    // The ensemble takes the night over: any scene cue fades out.
    fadeOutCurrent(ctx, CROSSFADE_SECONDS);
    wanted = null;
    const generation = (ensembleGeneration += 1);
    void startEnsemble(ctx, generation).then(() => {
      if (generation !== ensembleGeneration || !ctx) return;
      applyMix(ctx, snap.mix);
    });
  };

  return {
    start: async () => {
      ctx ??= new AudioContext();
      masterOf(ctx);
      if (ctx.state === 'suspended') await ctx.resume();
      if (wanted !== null && current === null) void transition(wanted);
      if (mixer.snapshot().active) syncEnsemble();
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
      // A scene cue takes over from the ensemble.
      mixer.reset();
      teardownEnsemble(ctx, CROSSFADE_SECONDS);
      void transition(name);
    },
    stop: () => {
      // Drop the wish first so an in-flight fetch bows out (wanted !== name).
      wanted = null;
      mixer.reset();
      if (!ctx) return;
      teardownEnsemble(ctx, STOP_FADE_SECONDS);
      fadeOutCurrent(ctx, STOP_FADE_SECONDS);
    },
    layer: (pattern, gain) => {
      if (!mixer.isEnsemblePattern(pattern)) return; // e.g. Act 2's 'lullaby'
      mixer.layer(pattern, gain);
      syncEnsemble();
    },
    chord: (fragments) => {
      mixer.chord(fragments);
      syncEnsemble();
    },
    setVolume: (next) => {
      volume = Math.max(0, Math.min(1, next));
      applyMaster();
    },
    setMuted: (next) => {
      muted = next;
      applyMaster();
    },
    snapshot: () => mixer.snapshot(),
    detune: (pattern, cents) => {
      if (!ctx || !ensemble) return;
      const node = ensemble.nodes.get(pattern);
      if (!node) return;
      const now = ctx.currentTime;
      node.source.detune.setValueAtTime(node.source.detune.value, now);
      node.source.detune.linearRampToValueAtTime(cents, now + 0.5);
    },
  };
};
