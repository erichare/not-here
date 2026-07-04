/**
 * Offline renderer: Song data → stereo Float32 sample buffers.
 *
 * Pure functions, no platform dependencies — this is both the audition
 * pipeline and the terminal WAV-fallback tier. Real-time backends (browser
 * AudioContext, node-web-audio-api) share the same Song format.
 */

import {
  midiToHz,
  type Envelope,
  type Instrument,
  type NoteEvent,
  type Pattern,
  type Song,
  type Vibrato,
} from './types.ts';

export interface StereoBuffer {
  readonly left: Float32Array;
  readonly right: Float32Array;
  readonly sampleRate: number;
}

const envelopeAt = (env: Envelope, t: number, noteDur: number): number => {
  if (t < 0) return 0;
  if (t < env.attack) return t / Math.max(env.attack, 1e-6);
  const afterAttack = t - env.attack;
  if (afterAttack < env.decay) {
    return 1 - (1 - env.sustain) * (afterAttack / Math.max(env.decay, 1e-6));
  }
  if (t < noteDur) return env.sustain;
  const released = t - noteDur;
  if (released >= env.release) return 0;
  const levelAtRelease = t - released < env.attack ? 1 : env.sustain;
  return levelAtRelease * (1 - released / Math.max(env.release, 1e-6));
};

const vibratoOffset = (vib: Vibrato | undefined, t: number): number => {
  if (!vib || t < vib.delay) return 0;
  const ramp = Math.min(1, (t - vib.delay) / 0.4);
  return vib.depthCents * ramp * Math.sin(2 * Math.PI * vib.rateHz * (t - vib.delay));
};

/** Mulberry32 — deterministic noise so renders are reproducible. */
const makeRng = (seed: number): (() => number) => {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let x = Math.imul(a ^ (a >>> 15), 1 | a);
    x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x;
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
};

interface VoiceContext {
  readonly sampleRate: number;
  readonly rng: () => number;
}

const renderNoteInto = (
  out: Float32Array,
  startSample: number,
  inst: Instrument,
  note: NoteEvent,
  durSec: number,
  ctx: VoiceContext,
): void => {
  const { sampleRate } = ctx;
  const totalSec = durSec + inst.env.release;
  const totalSamples = Math.min(
    Math.floor(totalSec * sampleRate),
    out.length - startSample,
  );
  const vel = note.vel ?? 1;
  let phase = 0;
  let lpState = 0;

  for (let i = 0; i < totalSamples; i++) {
    const t = i / sampleRate;
    const amp = envelopeAt(inst.env, t, durSec) * vel;
    if (amp <= 0 && t > durSec) break;

    let sample = 0;
    if (inst.kind === 'noise') {
      sample = ctx.rng() * 2 - 1;
      if (inst.lowpassHz !== undefined) {
        const alpha = 1 - Math.exp((-2 * Math.PI * inst.lowpassHz) / sampleRate);
        lpState += alpha * (sample - lpState);
        sample = lpState * 2.5;
      }
    } else {
      const vib = 'vibrato' in inst ? inst.vibrato : undefined;
      const hz = midiToHz(note.pitch, (note.detune ?? 0) + vibratoOffset(vib, t));
      phase += hz / sampleRate;
      const p = phase - Math.floor(phase);
      if (inst.kind === 'pulse') {
        sample = p < inst.duty ? 1 : -1;
      } else if (inst.kind === 'triangle') {
        sample = 2 * Math.abs(2 * p - 1) - 1;
      } else {
        const modEnv = envelopeAt(inst.modEnv ?? inst.env, t, durSec);
        const mod = Math.sin(2 * Math.PI * phase * inst.ratio) * inst.index * modEnv;
        sample = Math.sin(2 * Math.PI * phase + mod);
      }
    }
    out[startSample + i] = (out[startSample + i] ?? 0) + sample * amp;
  }
};

const renderPattern = (
  pattern: Pattern,
  lengthSamples: number,
  secPerBeat: number,
  ctx: VoiceContext,
): Float32Array => {
  const buf = new Float32Array(lengthSamples);
  for (const note of pattern.notes) {
    const startSample = Math.floor(note.t * secPerBeat * ctx.sampleRate);
    if (startSample >= lengthSamples) continue;
    renderNoteInto(buf, startSample, pattern.instrument, note, note.dur * secPerBeat, ctx);
  }
  return buf;
};

const applyEcho = (
  buf: Float32Array,
  delaySamples: number,
  feedback: number,
  send: number,
): Float32Array => {
  const out = new Float32Array(buf.length);
  const delayLine = new Float32Array(Math.max(delaySamples, 1));
  let idx = 0;
  for (let i = 0; i < buf.length; i++) {
    const dry = buf[i] ?? 0;
    const wet = delayLine[idx] ?? 0;
    out[i] = dry + wet * send;
    delayLine[idx] = dry + wet * feedback;
    idx = (idx + 1) % delayLine.length;
  }
  return out;
};

const softLimit = (x: number): number => Math.tanh(x);

/** Render a Song to a stereo buffer. Deterministic for a given song. */
export const renderSong = (song: Song, sampleRate = 44100): StereoBuffer => {
  const secPerBeat = 60 / song.bpm;
  const maxRelease = Math.max(...song.patterns.map((p) => p.instrument.env.release), 0);
  const lengthSamples = Math.ceil((song.lengthBeats * secPerBeat + maxRelease + 0.5) * sampleRate);
  const left = new Float32Array(lengthSamples);
  const right = new Float32Array(lengthSamples);
  const echoSamples = song.echo
    ? Math.floor(song.echo.beats * secPerBeat * sampleRate)
    : 0;

  song.patterns.forEach((pattern, pi) => {
    const ctx: VoiceContext = { sampleRate, rng: makeRng(0x5eed + pi * 7919) };
    let voice = renderPattern(pattern, lengthSamples, secPerBeat, ctx);
    if (song.echo && (pattern.echo ?? 0) > 0) {
      voice = applyEcho(voice, echoSamples, song.echo.feedback, pattern.echo ?? 0);
    }
    const gain = pattern.gain ?? 1;
    const pan = pattern.pan ?? 0;
    const gl = gain * Math.cos(((pan + 1) * Math.PI) / 4);
    const gr = gain * Math.sin(((pan + 1) * Math.PI) / 4);
    for (let i = 0; i < lengthSamples; i++) {
      const s = voice[i] ?? 0;
      left[i] = (left[i] ?? 0) + s * gl;
      right[i] = (right[i] ?? 0) + s * gr;
    }
  });

  let peak = 0;
  for (let i = 0; i < lengthSamples; i++) {
    peak = Math.max(peak, Math.abs(left[i] ?? 0), Math.abs(right[i] ?? 0));
  }
  const norm = peak > 0 ? 0.85 / peak : 1;
  for (let i = 0; i < lengthSamples; i++) {
    left[i] = softLimit((left[i] ?? 0) * norm);
    right[i] = softLimit((right[i] ?? 0) * norm);
  }
  return { left, right, sampleRate };
};
