/**
 * Story content wiring — buildContent() assembles the StoryContent the engine
 * interprets: the scene map, the derived resolvers from @not-here/memory, and
 * inline prose realization (ProseBlock.when conditions + '@line:' dynamic
 * paragraphs resolved through the salience-scored dialogue matcher).
 */

import {
  CHARACTERS,
  evaluate,
  type CharacterId,
  type DerivedResolvers,
  type Scene,
  type SceneId,
  type StoryContent,
  type WorldState,
} from '@not-here/engine';
import { makeResolvers, selectLine } from '@not-here/memory';
import { DIALOGUE_RULES } from './dialogue.ts';
import { DAY2_SCENES } from './scenes/day2.ts';
import { NIGHT1_SCENES } from './scenes/night1.ts';

/** Where a fresh run begins. */
export const OPENING_SCENE: SceneId = 'n1-title';

/** All authored scenes in the Night-1 vertical slice. */
export const ALL_SCENES: readonly Scene[] = [...NIGHT1_SCENES, ...DAY2_SCENES];

/** Paragraphs of this shape are realized via the dialogue rule matcher. */
const DYNAMIC_PREFIX = '@line:';

const isCharacterId = (value: string): value is CharacterId =>
  (CHARACTERS as readonly string[]).includes(value);

const resolveDynamicLine = (
  token: string,
  state: WorldState,
  derived: DerivedResolvers,
): string => {
  const parts = token.slice(DYNAMIC_PREFIX.length).split(':');
  const speaker = parts[0];
  const slot = parts[1];
  if (parts.length !== 2 || speaker === undefined || slot === undefined || slot === '') {
    throw new Error(`Malformed dynamic line token: "${token}" (want @line:<speaker>:<slot>)`);
  }
  if (!isCharacterId(speaker)) {
    throw new Error(`Dynamic line token "${token}" names unknown speaker "${speaker}"`);
  }
  return selectLine(DIALOGUE_RULES, speaker, slot, state, derived).text;
};

const buildSceneMap = (scenes: readonly Scene[]): ReadonlyMap<SceneId, Scene> => {
  const map = new Map<SceneId, Scene>();
  for (const scene of scenes) {
    if (map.has(scene.id)) throw new Error(`Duplicate scene id: ${scene.id}`);
    map.set(scene.id, scene);
  }
  return map;
};

const realizeInline = (
  scene: Scene,
  state: WorldState,
  derived: DerivedResolvers,
): readonly string[] => {
  if (scene.prose.kind !== 'inline') {
    // No ink content exists in the slice; reaching here is a content bug.
    throw new Error(`Scene ${scene.id}: ink prose is not wired in the Night-1 slice`);
  }
  return scene.prose.paragraphs
    .filter((block) => block.when === undefined || evaluate(block.when, state, derived))
    .map((block) =>
      block.text.startsWith(DYNAMIC_PREFIX)
        ? resolveDynamicLine(block.text, state, derived)
        : block.text,
    );
};

/** Assemble the playable Night-1 slice. */
export const buildContent = (): StoryContent => {
  const derived = makeResolvers();
  const scenes = buildSceneMap(ALL_SCENES);
  return {
    scenes,
    derived,
    realizeProse: (scene, state) => realizeInline(scene, state, derived),
  };
};
