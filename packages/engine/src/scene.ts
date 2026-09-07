/**
 * Scene graph types. Scenes are data built with defineScene(); prose is either
 * inline paragraphs or a reference to an ink knot (realized by the story
 * package — the engine never touches inkjs).
 */

import type { Cond } from './conditions.ts';
import type { Effect } from './effects.ts';
import type { CueId, SceneId, SlotId } from './ids.ts';

export type LocationId = 'kettle' | 'motel' | 'shore' | 'general' | 'wharf' | 'clinic' | 'boathouse' | 'hall' | 'shelter';

export interface Observation {
  readonly id: string;
  readonly label: string;
  readonly text: string;
  readonly kind?: 'observation' | 'suspicion' | 'document';
  readonly when?: Cond;
  readonly effects?: readonly Effect[];
}

export interface ScenePresentation {
  readonly location: LocationId;
  readonly title: string;
  readonly character?: 'barb' | 'dianne' | 'sam' | 'priya' | 'tam' | 'wade' | 'wren';
  readonly mood?: 'ordinary' | 'warm' | 'uneasy' | 'reveal';
  readonly ambience: LocationId;
  readonly sound: string;
  readonly staging?: 'memory-loss' | 'potluck' | 'letter' | 'arrival';
  readonly objects?: readonly string[];
  readonly light?: 'morning' | 'day' | 'evening' | 'night';
  readonly composition?: 'kettle-work';
  readonly voice?: { readonly id: string; readonly transcript: string };
}

export interface Artifact {
  readonly id: string;
  readonly title: string;
  readonly text: string;
  readonly when?: Cond;
}

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
  /** Render with extra visual weight; reserved for narratively consequential choices. */
  readonly stakes?: 'major';
  readonly when?: Cond;
  /** Shown but unselectable when gate fails — the ache of the locked option. */
  readonly lockedLabel?: string;
  readonly effects?: readonly Effect[];
  readonly goto: SceneId;
}

export interface Scene {
  readonly id: SceneId;
  readonly presentation?: ScenePresentation;
  readonly observations?: readonly Observation[];
  readonly artifacts?: readonly Artifact[];
  readonly input?: 'name';
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
  readonly artifacts?: readonly Omit<Artifact, 'when'>[];
  readonly sceneId: SceneId;
  readonly presentation?: ScenePresentation;
  readonly observations?: readonly Omit<Observation, 'when' | 'effects'>[];
  readonly input?: 'name';
  readonly paragraphs: readonly string[];
  readonly choices: readonly {
    id: string;
    label: string;
    locked: boolean;
    stakes?: 'major';
  }[];
  readonly ending?: string;
}
