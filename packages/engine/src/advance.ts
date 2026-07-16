/**
 * The interpreter. Pure: advance(content, state, input) → {state, view, events}.
 * No IO, no clocks, no platform. Frontends render the view and interpret
 * events; the memory package supplies derived resolvers; the story package
 * supplies content (scenes, prose realization, resolvers).
 */

import { evaluate, type DerivedResolvers } from './conditions.ts';
import { applyEffects } from './effects.ts';
import type { EngineEvent } from './events.ts';
import type { SceneId } from './ids.ts';
import type { Scene, SceneView } from './scene.ts';
import type { WorldState } from './state.ts';

export interface StoryContent {
  readonly scenes: ReadonlyMap<SceneId, Scene>;
  readonly derived: DerivedResolvers;
  /** Realize prose for a scene given state (ink or inline). */
  readonly realizeProse: (scene: Scene, state: WorldState) => readonly string[];
  /**
   * Pure, deterministic day-boundary hook — runs once whenever a step ends on
   * a later day than it began (gossip propagation lives here). Must not
   * change day/slot/sceneId.
   */
  readonly postDay?: (state: WorldState) => WorldState;
}

export type EngineInput =
  | { readonly kind: 'enter' }
  | { readonly kind: 'choose'; readonly choiceId: string };

export interface StepResult {
  readonly state: WorldState;
  readonly view: SceneView;
  readonly events: readonly EngineEvent[];
}

const sceneOrThrow = (content: StoryContent, id: SceneId): Scene => {
  const scene = content.scenes.get(id);
  if (!scene) throw new Error(`Unknown scene: ${id}`);
  return scene;
};

const buildView = (
  content: StoryContent,
  scene: Scene,
  state: WorldState,
): SceneView => ({
  sceneId: scene.id,
  paragraphs: content.realizeProse(scene, state),
  choices: scene.choices.flatMap(
    (choice): { id: string; label: string; locked: boolean; stakes?: 'major' }[] => {
      const open = !choice.when || evaluate(choice.when, state, content.derived);
      const stakes = choice.stakes === undefined ? {} : { stakes: choice.stakes };
      if (open) return [{ id: choice.id, label: choice.label, locked: false, ...stakes }];
      if (choice.lockedLabel) {
        return [{ id: choice.id, label: choice.lockedLabel, locked: true, ...stakes }];
      }
      return [];
    },
  ),
  ...(scene.ending !== undefined ? { ending: scene.ending } : {}),
});

const enterScene = (
  content: StoryContent,
  state: WorldState,
  sceneId: SceneId,
): StepResult => {
  const scene = sceneOrThrow(content, sceneId);
  const entered: WorldState = { ...state, sceneId: scene.id };
  const result = scene.onEnter
    ? applyEffects(entered, scene.onEnter, content.derived)
    : { state: entered, events: [] as readonly EngineEvent[] };
  const events: EngineEvent[] = [...result.events];
  if (scene.cue) events.unshift({ kind: 'music.cue', cue: scene.cue });
  if (scene.ending) events.push({ kind: 'save.autosave' });
  return {
    state: result.state,
    view: buildView(content, scene, result.state),
    events,
  };
};

/**
 * Rebuild the view for the scene the state is already parked on WITHOUT
 * re-applying onEnter effects (pt2-fix-03). advance(…, {kind:'enter'}) runs
 * scene.onEnter, which is right on first entry but double-applies decay
 * blocks, fact appends, and meter moves when a frontend re-enters a loaded
 * save — the save already holds the post-onEnter state. State passes through
 * untouched; the scene cue is re-emitted so the frontend can restore the
 * score. Never emits save.autosave: resuming must not trigger a save.
 */
export const resumeScene = (content: StoryContent, state: WorldState): StepResult => {
  const scene = sceneOrThrow(content, state.sceneId);
  return {
    state,
    view: buildView(content, scene, state),
    events: scene.cue ? [{ kind: 'music.cue', cue: scene.cue }] : [],
  };
};

export const advance = (
  content: StoryContent,
  state: WorldState,
  input: EngineInput,
): StepResult => {
  if (input.kind === 'enter') return enterScene(content, state, state.sceneId);

  const scene = sceneOrThrow(content, state.sceneId);
  const choice = scene.choices.find((c) => c.id === input.choiceId);
  if (!choice) throw new Error(`Unknown choice ${input.choiceId} in ${scene.id}`);
  const open = !choice.when || evaluate(choice.when, state, content.derived);
  if (!open) throw new Error(`Choice ${input.choiceId} is locked in ${scene.id}`);

  const logged: WorldState = {
    ...state,
    choiceLog: [
      ...state.choiceLog,
      { scene: scene.id, choice: choice.id, day: state.day, slot: state.slot },
    ],
  };
  const applied = choice.effects
    ? applyEffects(logged, choice.effects, content.derived)
    : { state: logged, events: [] as readonly EngineEvent[] };
  const target = applied.goto ?? choice.goto;
  const entered = enterScene(content, applied.state, target);
  const dayCrossed = entered.state.day > state.day && content.postDay;
  const finalState = dayCrossed ? content.postDay!(entered.state) : entered.state;
  return {
    state: finalState,
    view: entered.view,
    events: [...applied.events, ...entered.events],
  };
};
