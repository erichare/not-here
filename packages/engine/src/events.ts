/**
 * Engine events — how the same state machine drives music and presentation on
 * every platform. Frontends interpret; the engine only emits.
 */

import type { CueId, StatId } from './ids.ts';

export type EngineEvent =
  /** Enter a scene → play/transition to its cue. */
  | { readonly kind: 'music.cue'; readonly cue: CueId }
  /** Vertical layering: set a pattern's target gain (0..1). */
  | { readonly kind: 'music.layer'; readonly pattern: string; readonly gain: number }
  /** The lie-detune tell. Always paired with a `tell.visual`. */
  | { readonly kind: 'music.detune'; readonly pattern: string; readonly cents: number }
  /** CHORD changed: the mixer gains/loses a fragment. */
  | { readonly kind: 'music.chord'; readonly fragments: number }
  /** STATIC changed: bitcrush/detune intensity 0..100. */
  | { readonly kind: 'music.static'; readonly amount: number }
  /** A musical stinger on a beat-quantized boundary. */
  | { readonly kind: 'music.stinger'; readonly cue: CueId }
  /** Visual twin for any audio tell — accessibility invariant. */
  | { readonly kind: 'tell.visual'; readonly text: string }
  | { readonly kind: 'stat.changed'; readonly stat: StatId; readonly delta: number }
  /** Glyph-rot intensity for the fog's claim on your words. */
  | { readonly kind: 'fx.glyphrot'; readonly intensity: number }
  | { readonly kind: 'save.autosave' };
