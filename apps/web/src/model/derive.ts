/**
 * One derivation per step: everything the persistent regions (stage, frame,
 * margin, FX) need, computed from the post-step world. Deterministic and
 * resume-safe — a resumed save derives the same frame with no event replay.
 */

import type { EngineEvent, Scene, SlotId, StoryContent, WorldState } from '@not-here/engine';
import { staticTierFor } from '@not-here/story';
import { threeTwelveBeat, type ThreeTwelveBeat } from './beats.ts';
import { castFor, visibleCast, type CastModel, type VisibleSketch } from './cast.ts';
import { frameModelFor, type FrameModel } from './frame-model.ts';
import { cardKindFor, type CardKind } from './places.ts';
import { presenceFor, type PresenceModel } from './presence.ts';
import { rotModelFor, rotPlan, type RotModel, type RotPlan } from './rot.ts';
import { deriveStage, type EnsembleFragments, type StageModel } from './stage-model.ts';

export interface SceneFrame {
  readonly stage: StageModel;
  readonly cast: CastModel;
  readonly sketches: readonly VisibleSketch[];
  readonly rot: RotModel;
  readonly rotPlan: RotPlan;
  readonly presence: PresenceModel;
  readonly frame: FrameModel;
  readonly card: CardKind | null;
  readonly beat: ThreeTwelveBeat | null;
}

export interface DeriveInput {
  readonly content: StoryContent;
  readonly state: WorldState;
  readonly events: readonly EngineEvent[];
  readonly ensemble: EnsembleFragments | null;
  readonly heldEndings: ReadonlySet<string>;
  /** The view's choices, for the rot plan (which label, if any, decays). */
  readonly choices: readonly { readonly label: string; readonly locked: boolean; readonly stakes?: 'major' }[];
}

const NO_SCENE: Pick<Scene, 'id' | 'prose' | 'cue'> = { id: '', prose: { kind: 'inline', paragraphs: [] } };

export const deriveSceneFrame = (input: DeriveInput): SceneFrame => {
  const { content, state, events, ensemble, heldEndings, choices } = input;
  const scene = content.scenes.get(state.sceneId);
  const slot: SlotId = scene?.slot ?? state.slot;
  const presence = presenceFor(state);
  const rotTier = staticTierFor(state.staticMeter);
  const plan = rotPlan(
    choices.map((c) => ({ label: c.label, major: c.stakes === 'major', locked: c.locked })),
    state.staticMeter,
    state.day,
    state.rngState,
  );
  const isEnding = scene?.ending !== undefined;
  return {
    stage: deriveStage(scene, state, isEnding ? 'none' : slot, presence.value, rotTier, ensemble),
    cast: castFor(scene ?? NO_SCENE),
    sketches: scene === undefined ? [] : visibleCast(scene, state, content.scenes),
    rot: rotModelFor(state.staticMeter, plan.attractIndex !== null),
    rotPlan: plan,
    presence,
    frame: frameModelFor(state, slot),
    card: scene === undefined ? null : cardKindFor(scene, heldEndings),
    beat: threeTwelveBeat(scene, state, events),
  };
};
