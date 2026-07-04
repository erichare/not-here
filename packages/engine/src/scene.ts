/**
 * Scene graph types. Scenes are data built with defineScene(); prose is either
 * inline paragraphs or a reference to an ink knot (realized by the story
 * package — the engine never touches inkjs).
 */

import type { Cond } from './conditions.ts';
import type { Effect } from './effects.ts';
import type { CueId, SceneId, SlotId } from './ids.ts';

export type ProseSource =
  | { readonly kind: 'inline'; readonly paragraphs: readonly ProseBlock[] }
  | { readonly kind: 'ink'; readonly knot: string };

/** A paragraph with optional condition — light branching without scene splits. */
export interface ProseBlock {
  readonly text: string;
  readonly when?: Cond;
}

export interface Choice {
  readonly id: string;
  readonly label: string;
  readonly when?: Cond;
  /** Shown but unselectable when gate fails — the ache of the locked option. */
  readonly lockedLabel?: string;
  readonly effects?: readonly Effect[];
  readonly goto: SceneId;
}

export interface Scene {
  readonly id: SceneId;
  /** Day slot this scene belongs to; undefined = structural/interstitial. */
  readonly slot?: SlotId;
  readonly prose: ProseSource;
  readonly choices: readonly Choice[];
  /** Effects applied on entry (facts witnessed, clue plants). */
  readonly onEnter?: readonly Effect[];
  /** Music cue for the scene. */
  readonly cue?: CueId;
  /** Marks scenes re-rendered by the post-reveal Return Pass. */
  readonly recontext?: boolean;
  /** Ending scenes terminate the run. */
  readonly ending?: string;
}

export const defineScene = (scene: Scene): Scene => scene;

/** What a frontend renders after a step. */
export interface SceneView {
  readonly sceneId: SceneId;
  readonly paragraphs: readonly string[];
  readonly choices: readonly { id: string; label: string; locked: boolean }[];
  readonly ending?: string;
}
