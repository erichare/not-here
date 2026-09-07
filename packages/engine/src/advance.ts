/**
 * The interpreter. Pure: advance(content, state, input) → {state, view, events}.
 * No IO, no clocks, no platform. Frontends render the view and interpret
 * events; the memory package supplies derived resolvers; the story package
 * supplies content (scenes, prose realization, resolvers).
 */

import { evaluate, type DerivedResolvers } from './conditions.ts';
import { applyEffects, type EffectResult } from './effects.ts';
import type { EngineEvent } from './events.ts';
import type { SceneId } from './ids.ts';
import type { Scene, SceneView } from './scene.ts';
import type { WorldState } from './state.ts';

export interface StoryContent {
  readonly realizeLabel?: (label: string, state: WorldState) => string;
  readonly realizePresentation?: (scene: Scene, state: WorldState) => Scene['presentation'];
  readonly realizeEvents?: (state: WorldState, events: readonly EngineEvent[]) => readonly EngineEvent[];
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
  | { readonly kind: 'inspect'; readonly observationId: string }
  | { readonly kind: 'name'; readonly name: string }
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
  ...(scene.presentation ? { presentation: content.realizePresentation?.(scene, state) ?? scene.presentation } : {}),
  ...(scene.artifacts ? { artifacts: scene.artifacts.filter(a => !a.when || evaluate(a.when, state, content.derived)).map(({ when: _when, ...a }) => ({ ...a, text: content.realizeLabel?.(a.text, state) ?? a.text })) } : {}),
  ...(scene.input ? { input: scene.input } : {}),
  ...(scene.observations ? { observations: scene.observations
    .filter(item => !item.when || evaluate(item.when, state, content.derived))
    .map(({ when: _when, effects: _effects, ...item }) => item) } : {}),
  paragraphs: content.realizeProse(scene, state),
  choices: scene.choices.flatMap(
    (choice): { id: string; label: string; locked: boolean; stakes?: 'major' }[] => {
      const open = !choice.when || evaluate(choice.when, state, content.derived);
      const stakes = choice.stakes === undefined ? {} : { stakes: choice.stakes };
      if (open) return [{ id: choice.id, label: content.realizeLabel?.(choice.label, state) ?? choice.label, locked: false, ...stakes }];
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
    events: content.realizeEvents?.(result.state, events) ?? events,
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
    events: content.realizeEvents?.(state, scene.cue ? [{ kind: 'music.cue', cue: scene.cue }] : [])
      ?? (scene.cue ? [{ kind: 'music.cue', cue: scene.cue }] : []),
  };
};

export const advance = (
  content: StoryContent,
  state: WorldState,
  input: EngineInput,
): StepResult => {
  if (input.kind === 'enter') return enterScene(content, state, state.sceneId);

  const scene = sceneOrThrow(content, state.sceneId);
  if (input.kind === 'name') {
    if (scene.input !== 'name') throw new Error('This scene does not ask for a name');
    const name = input.name.normalize('NFC').replace(/[\u0000-\u001f\u007f]/gu, '').trim();
    if (!name || [...name].length > 40) throw new Error('Use a name of 1–40 characters');
    const named = { ...state, flags: { ...state.flags, 'player:name': name } };
    return { state: named, view: buildView(content, scene, named), events: [] };
  }
  if (input.kind === 'inspect') {
    const item = scene.observations?.find(o => o.id === input.observationId);
    if (!item || (item.when && !evaluate(item.when, state, content.derived))) throw new Error('Observation unavailable');
    const tag = `observed:${item.id}`;
    const result: EffectResult = state.facts.some(f => f.tag === tag) ? { state, events: [] } : applyEffects(state, [
      { op: 'fact.add', tag, data: JSON.stringify({ title: item.label, text: item.text, kind: item.kind ?? 'observation' }) }, ...(item.effects ?? []),
    ], content.derived);
    // Inspection may reveal a fact or a musical clue, but never advances time or location.
    if (result.goto || result.state.day !== state.day || result.state.slot !== state.slot) throw new Error('An observation cannot spend time or move scenes');
    return { state: result.state, view: buildView(content, scene, result.state), events: content.realizeEvents?.(result.state, result.events) ?? result.events };
  }
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
    events: content.realizeEvents?.(finalState, [...applied.events, ...entered.events]) ?? [...applied.events, ...entered.events],
  };
};
