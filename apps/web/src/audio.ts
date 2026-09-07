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
import { DEFAULT_PREFERENCES, type Preferences } from './preferences.ts';
import { createSoundscape } from './soundscape.ts';

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
  readonly fragments: (characters: readonly string[]) => void;
  readonly preferences: (preferences: Preferences) => void;
  readonly ambience: (location: string | null) => void;
  readonly fingerprint: (flags: Readonly<Record<string, boolean | number | string>>) => void;
  readonly static: (amount: number) => void;
  readonly stinger: (cue: string) => void;
  readonly voice: (cue: string) => void;
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
  options: { readonly edition?: 'original' | 'revised' } = {},
): AudioPlayer => {
  const ensemblePrefix = options.edition === 'revised' ? 'v2-ensemble' : 'act3-ensemble';
  let ctx: AudioContext | null = null;
  /** Every cue and ensemble layer runs through this; the lamp sets it. */
  let master: GainNode | null = null;
  let volume = 1;
  let muted = false;
  let preferences: Preferences = { ...DEFAULT_PREFERENCES, music: 1 };
  const buses = new Map<string, GainNode>();
  let soundscape: ReturnType<typeof createSoundscape> | null = null;
  let pendingAmbience: string | null = null;
  let fingerprint = '';
  let accentGeneration = 0;
  const accents = new Set<AudioBufferSourceNode>();
  let cueGeneration = 0;
  let deferredCue: string | null = null;
  let musicFilter: BiquadFilterNode | null = null;
  let staticAmount = 0;
  let current: PlayingCue | null = null;
  /** Latest requested cue — stale fetches resolve and bow out. */
  let wanted: string | null = null;
  /** Decoded buffers; null marks a cue known to be missing/broken. */
  const buffers = new Map<string, AudioBuffer | null>();
  const rememberBuffer = (name: string, buffer: AudioBuffer | null): void => {
    buffers.delete(name); buffers.set(name, buffer);
    const bytes = () => [...buffers.values()].reduce((total, item) => total + (item ? (item.length ?? 0) * (item.numberOfChannels ?? 2) * 4 : 0), 0);
    while (buffers.size > 12 || bytes() > 48 * 1024 * 1024) buffers.delete(buffers.keys().next().value!);
  };

  const mixer = createEnsembleMixer();
  let ensemble: { readonly nodes: Map<string, EnsembleNode> } | null = null;
  /** Supersession counter for async ensemble starts. */
  let ensembleGeneration = 0;
  let ensembleStartedAt = 0;
  const detuneRequests = new Map<string, number>();

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

  const bus = (context: AudioContext, name: 'music' | 'ambience' | 'effects' | 'voice'): GainNode => {
    let node = buses.get(name);
    if (!node) {
      node = context.createGain(); node.gain.value = preferences[name];
      if (name === 'music') {
        musicFilter = context.createBiquadFilter(); musicFilter.type = 'lowpass';
        musicFilter.frequency.value = 18000 / (1 + staticAmount / 10);
        node.connect(musicFilter); musicFilter.connect(masterOf(context));
      } else node.connect(masterOf(context));
      buses.set(name, node);
    }
    return node;
  };

  const load = async (context: AudioContext, name: string): Promise<AudioBuffer | null> => {
    const cached = buffers.get(name);
    if (cached !== undefined) return cached;
    const formats = options.edition === 'revised' && name.startsWith('v2-') && !name.startsWith('v2-ensemble-') ? ['m4a', 'wav'] : ['wav'];
    for (const format of formats) {
      try {
        const response = await fetch(`/auditions/${encodeURIComponent(name)}.${format}`);
        if (!response.ok) continue;
        const buffer = await context.decodeAudioData(await response.arrayBuffer());
        // Bound decoded memory; playing sources retain their own buffer references.
        rememberBuffer(name, buffer);
        return buffer;
      } catch { /* Try the WAV master when encoding or codec support is absent. */ }
    }
    rememberBuffer(name, null);
    return null;
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
    gain.connect(bus(context, 'music'));
    const started: PlayingCue = { cue: name, source, gain };
    source.onended = (): void => { source.disconnect(); gain.disconnect(); };
    if (!source.loop) {
      // One-shot beat: when it ends on its own, it leaves real silence.
      source.onended = (): void => {
        source.disconnect(); gain.disconnect();
        if (current === started) {
          current = null;
          if (deferredCue !== null) { const next = deferredCue; deferredCue = null; wanted = next; void transition(next); }
        }
      };
    }
    source.start(now);
    current = started;
  };

  const transition = async (name: string): Promise<void> => {
    if (!ctx) return;
    const generation = ++cueGeneration;
    const buffer = await load(ctx, name);
    if (wanted !== name || generation !== cueGeneration) return;
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
      const buffer = await load(context, `${ensemblePrefix}-${id}`);
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
      gain.connect(bus(context, 'music'));
      source.start(now); // all layers start together — the stack stays in sync
      source.onended = () => { source.disconnect(); gain.disconnect(); };
      nodes.set(id, { source, gain });
    }
    ensemble = { nodes }; ensembleStartedAt = now;
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
    wanted = null; deferredCue = null; cueGeneration++;
    const generation = (ensembleGeneration += 1);
    void startEnsemble(ctx, generation).then(() => {
      if (generation !== ensembleGeneration || !ctx) return;
      applyMix(ctx, snap.mix);
    });
  };

  const accent = async (name: string, cents: number, channel: 'music' | 'effects' | 'voice'): Promise<void> => {
    if (!ctx) return;
    const context = ctx;
    const generation = accentGeneration;
    const buffer = await load(context, name);
    if (generation !== accentGeneration) return;
    if (!buffer) { onFallback(name); return; }
    const source = context.createBufferSource(); source.buffer = buffer; source.detune.value = cents;
    const gain = context.createGain(); gain.gain.value = channel === 'voice' ? 1 : .13;
    source.connect(gain); gain.connect(bus(context, channel));
    accents.add(source);
    source.onended = () => { accents.delete(source); source.disconnect(); gain.disconnect(); };
    source.start();
  };

  return {
    preferences: next => {
      preferences = next;
      if (ctx) for (const name of ['music', 'ambience', 'effects', 'voice'] as const) bus(ctx, name).gain.setTargetAtTime(next[name], ctx.currentTime, .05);
    },
    ambience: location => {
      pendingAmbience = location;
      if (ctx) { soundscape ??= createSoundscape(ctx, bus(ctx, 'ambience')); soundscape.set(location); }
    },
    fingerprint: flags => {
      const answer = flags['n1:goodbye'];
      if (typeof answer !== 'string') { fingerprint = ''; return; }
      if (typeof answer !== 'string' || fingerprint === answer || !ctx) return;
      fingerprint = answer;
      // Introduced after the interview; never invent an answer on the first title screen.
      if (['never', 'forgot', 'door'].includes(answer)) void accent(`v2-fingerprint-${answer}`, 0, 'music');
    },
    fragments: characters => { mixer.fragments(characters); syncEnsemble(); },
    static: amount => {
      // Persistent filtering affects ordinary cues as well as the ensemble.
      staticAmount = Math.max(0, Math.min(100, amount));
      if (ctx && musicFilter) musicFilter.frequency.setTargetAtTime(18000 / (1 + staticAmount / 10), ctx.currentTime, 1);
    },
    stinger: name => { void accent(name, 0, name.startsWith('v2-fingerprint-') ? 'music' : 'effects'); },
    voice: name => { void accent(name, 0, 'voice'); },
    start: async () => {
      ctx ??= new AudioContext();
      masterOf(ctx);
      soundscape ??= createSoundscape(ctx, bus(ctx, 'ambience'));
      soundscape.set(pendingAmbience);
      if (ctx.state === 'suspended') await ctx.resume();
      if (wanted !== null && current === null) void transition(wanted);
      if (mixer.snapshot().active) syncEnsemble();
    },
    cue: (name) => {
      // Re-requests of the playing cue are no-ops, but the same cue after a
      // one-shot ended (or a failed load) must sound again next scene.
      if (wanted === name && current !== null) { deferredCue = null; return; }
      if (current && !current.source.loop) { deferredCue = name; return; }
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
      accentGeneration++;
      cueGeneration++; deferredCue = null;
      for (const source of accents) { try { source.stop(); } catch { /* ended */ } }
      accents.clear();
      // Drop the wish first so an in-flight fetch bows out (wanted !== name).
      wanted = null;
      mixer.reset();
      if (!ctx) return;
      teardownEnsemble(ctx, STOP_FADE_SECONDS);
      fadeOutCurrent(ctx, STOP_FADE_SECONDS);
    },
    layer: (pattern, gain) => {
      if (!mixer.isEnsemblePattern(pattern)) {
        if (ctx && current && pattern === 'lullaby') current.gain.gain.setTargetAtTime(Math.max(.08, gain), ctx.currentTime, 1);
        return;
      }
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
      if (!ctx) return;
      if (!ensemble) {
        if (mixer.isEnsemblePattern(pattern)) void accent(`${ensemblePrefix}-${pattern}${cents === -50 ? '-lowered' : ''}`, cents === -50 ? 0 : cents, 'music');
        return;
      }
      const node = ensemble.nodes.get(pattern);
      if (!node) return;
      // Authored quarter-tone variants keep the same 15-second loop duration.
      // Source.detune would change playback speed and drift away from the other parts.
      const context = ctx; const playing = ensemble;
      const request = (detuneRequests.get(pattern) ?? 0) + 1; detuneRequests.set(pattern, request);
      if (cents !== -50 && cents !== 0) return;
      void load(context, `${ensemblePrefix}-${pattern}${cents === -50 ? '-lowered' : ''}`).then(buffer => {
        if (!buffer || ensemble !== playing || detuneRequests.get(pattern) !== request) return;
        const now = context.currentTime;
        const source = context.createBufferSource(); source.buffer = buffer; source.loop = true;
        source.connect(node.gain);
        source.onended = () => source.disconnect();
        source.start(now, Math.max(0, now - ensembleStartedAt) % buffer.duration);
        // Preserve the layer gain when replacing its source.
        node.source.onended = () => node.source.disconnect();
        try { node.source.stop(now); } catch { /* ended */ }
        playing.nodes.set(pattern, { ...node, source });
      });
    },
  };
};
