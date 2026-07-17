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
import { makeResolvers, propagateGossip, selectLine, type GossipEdge } from '@not-here/memory';
import { DIALOGUE_RULES } from './dialogue.ts';
import { RULES as RULES_D34 } from './dialogue-days34.ts';
import { RULES as RULES_D56 } from './dialogue-days56.ts';
import { RULES as RULES_D7 } from './dialogue-day7.ts';
import { RULES as RULES_D89 } from './dialogue-days89.ts';
import { RULES as RULES_D1011 } from './dialogue-days1011.ts';
import { RULES as RULES_D1213 } from './dialogue-days1213.ts';
import { RULES as RULES_D1416 } from './dialogue-days1416.ts';
import { RULES as RULES_D1719 } from './dialogue-days1719.ts';
import { RULES as RULES_D2023 } from './dialogue-days2023.ts';
import { DAY2_SCENES } from './scenes/day2.ts';
import { DAY3_SCENES } from './scenes/day3.ts';
import { DAY4_SCENES } from './scenes/day4.ts';
import { DAY5_SCENES } from './scenes/day5.ts';
import { DAY6_SCENES } from './scenes/day6.ts';
import { DAY7_SCENES } from './scenes/day7.ts';
import { DAY8_SCENES } from './scenes/day8.ts';
import { DAY9_SCENES } from './scenes/day9.ts';
import { DAY10_SCENES } from './scenes/day10.ts';
import { DAY11_SCENES } from './scenes/day11.ts';
import { DAY12_SCENES } from './scenes/day12.ts';
import { DAY13_SCENES } from './scenes/day13.ts';
import { DAY14_SCENES } from './scenes/day14.ts';
import { DAY15_SCENES } from './scenes/day15.ts';
import { DAY16_SCENES } from './scenes/day16.ts';
import { DAY17_SCENES } from './scenes/day17.ts';
import { DAY18_SCENES } from './scenes/day18.ts';
import { DAY19_SCENES } from './scenes/day19.ts';
import { DAY20_SCENES } from './scenes/day20.ts';
import { DAY21_SCENES } from './scenes/day21.ts';
import { DAY22_SCENES } from './scenes/day22.ts';
import { NIGHT1_SCENES } from './scenes/night1.ts';

/** Where a fresh run begins. */
export const OPENING_SCENE: SceneId = 'n1-title';

/** Act 1 scenes only (Night 1 → the unsealed act boundary in day7.ts). */
export const ACT1_SCENES: readonly Scene[] = [
  ...NIGHT1_SCENES,
  ...DAY2_SCENES,
  ...DAY3_SCENES,
  ...DAY4_SCENES,
  ...DAY5_SCENES,
  ...DAY6_SCENES,
  ...DAY7_SCENES,
];

/** All authored scenes through Act 3, Day 22. */
export const ALL_SCENES: readonly Scene[] = [
  ...ACT1_SCENES,
  ...DAY8_SCENES,
  ...DAY9_SCENES,
  ...DAY10_SCENES,
  ...DAY11_SCENES,
  ...DAY12_SCENES,
  ...DAY13_SCENES,
  ...DAY14_SCENES,
  ...DAY15_SCENES,
  ...DAY16_SCENES,
  ...DAY17_SCENES,
  ...DAY18_SCENES,
  ...DAY19_SCENES,
  ...DAY20_SCENES,
  ...DAY21_SCENES,
  ...DAY22_SCENES,
];

const ALL_RULES = [
  ...DIALOGUE_RULES,
  ...RULES_D34,
  ...RULES_D56,
  ...RULES_D7,
  ...RULES_D89,
  ...RULES_D1011,
  ...RULES_D1213,
  ...RULES_D1416,
  ...RULES_D1719,
  ...RULES_D2023,
];

/**
 * Who talks to whom in Lorn Bay when the player isn't in the room.
 * 'private:'-tagged facts never move (memory package guarantee).
 */
const GOSSIP_EDGES: readonly GossipEdge[] = [
  { from: 'barb', to: 'tam' },
  { from: 'tam', to: 'barb' },
  { from: 'barb', to: 'dianne' },
  { from: 'dianne', to: 'barb' },
  { from: 'sam', to: 'priya' },
  { from: 'tam', to: 'sam' },
];

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
  return selectLine(ALL_RULES, speaker, slot, state, derived).text;
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
  const derived: DerivedResolvers = {
    ...makeResolvers(),
    witness: (state) => state.stats.flesh + state.stats.name,
  };
  const scenes = buildSceneMap(ALL_SCENES);
  return {
    scenes,
    derived,
    realizeProse: (scene, state) => realizeInline(scene, state, derived),
    postDay: (state) => propagateGossip(state, GOSSIP_EDGES),
  };
};
