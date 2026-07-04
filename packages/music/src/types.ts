/**
 * Score-as-data: the canonical song format for NOT HERE.
 *
 * Music is text. Every cue in the game is data of this shape, rendered by the
 * same engine in the browser (AudioContext), the terminal (node-web-audio-api
 * or offline WAV), and the audition loop (offline WAV).
 *
 * Instrument spec is FROZEN per design/decisions.md:
 * pulse, triangle, noise, 2-op FM — plus envelopes, vibrato, echo send.
 */

/** ADSR envelope, times in seconds, sustain as 0..1 level. */
export interface Envelope {
  readonly attack: number;
  readonly decay: number;
  readonly sustain: number;
  readonly release: number;
}

/** Pitch modulation. depthCents at rateHz, starting after delay seconds. */
export interface Vibrato {
  readonly depthCents: number;
  readonly rateHz: number;
  readonly delay: number;
}

export interface PulseInstrument {
  readonly kind: 'pulse';
  /** Duty cycle 0..1 (0.5 = square, 0.25/0.125 = classic thin chip tones). */
  readonly duty: number;
  readonly env: Envelope;
  readonly vibrato?: Vibrato;
}

export interface TriangleInstrument {
  readonly kind: 'triangle';
  readonly env: Envelope;
  readonly vibrato?: Vibrato;
}

export interface NoiseInstrument {
  readonly kind: 'noise';
  readonly env: Envelope;
  /** One-pole lowpass cutoff in Hz; omit for white noise. */
  readonly lowpassHz?: number;
}

export interface FmInstrument {
  readonly kind: 'fm';
  /** Modulator frequency = ratio × carrier frequency. */
  readonly ratio: number;
  /** Peak modulation index (radians). */
  readonly index: number;
  readonly env: Envelope;
  /** Envelope applied to the modulation index; defaults to env. */
  readonly modEnv?: Envelope;
  readonly vibrato?: Vibrato;
}

export type Instrument =
  | PulseInstrument
  | TriangleInstrument
  | NoiseInstrument
  | FmInstrument;

/**
 * One note. Times are in beats from pattern start.
 * pitch is a MIDI note number; noise instruments ignore it (use it to scale
 * the lowpass brightness if present). vel 0..1 defaults to 1.
 */
export interface NoteEvent {
  readonly t: number;
  readonly dur: number;
  readonly pitch: number;
  readonly vel?: number;
  /** Cents offset — the lie-detune mechanic lives here. */
  readonly detune?: number;
}

/** A voice: one instrument playing a sequence of notes. */
export interface Pattern {
  readonly id: string;
  readonly instrument: Instrument;
  readonly notes: readonly NoteEvent[];
  /** Linear gain 0..1, default 1. */
  readonly gain?: number;
  /** Stereo position -1..1, equal-power, default 0. */
  readonly pan?: number;
  /** Echo send 0..1, default 0. */
  readonly echo?: number;
}

export interface EchoConfig {
  /** Delay time in beats. */
  readonly beats: number;
  /** Feedback 0..1. */
  readonly feedback: number;
}

export interface Song {
  readonly id: string;
  readonly bpm: number;
  /** Total length in beats (defines render length together with releases). */
  readonly lengthBeats: number;
  readonly patterns: readonly Pattern[];
  readonly echo?: EchoConfig;
}

export const midiToHz = (midi: number, detuneCents = 0): number =>
  440 * Math.pow(2, (midi - 69 + detuneCents / 100) / 12);
