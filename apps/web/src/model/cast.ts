/**
 * Cast inference — who is in the room with you, so the margin can carry
 * their sketch. Scenes carry no cast field; the web build derives one from
 * (1) an explicit override table, (2) the `@line:<speaker>:` tokens that
 * survive on the Scene object, (3) the id's naming token, (4) the scene's
 * cue. On top of that sits the first-meeting gate: a sketch may appear only
 * once the player has actually met the character — the same rule the
 * original FIRST_MEETING table enforced, now derived from the run's visited
 * scenes so a player who skipped Sam's boat shed on Day 3 still gets his
 * sketch the first time they do meet him.
 *
 * Mystery invariant (sketches.test.ts, cast.test.ts): Night 1's 3:12 must
 * never identify the horn operator, and no one appears before their intro.
 */

import type { CharacterId, Scene, SceneId, WorldState } from '@not-here/engine';
import { axisValue } from '@not-here/memory';
import { sceneToken } from './places.ts';

export type SketchCharacter = CharacterId | 'wren';

export interface CastModel {
  /** Present characters, primary first, at most two. */
  readonly present: readonly CharacterId[];
  /** Wren's empty frame stands in for a face the book never gets. */
  readonly wrenFrame: boolean;
}

export interface VisibleSketch {
  readonly who: SketchCharacter;
  /** 0..1 — trust-faded, bounded so a sketch never vanishes or shouts. */
  readonly opacity: number;
}

/**
 * Scene id → who the player meets there for the first time (the original
 * gate, kept verbatim). Branch-dependent intros sit on their intro scenes; a
 * run that skips one simply meets that character later, via castFor.
 */
export const FIRST_MEETING: Readonly<Record<string, SketchCharacter>> = {
  'n1-diner': 'barb', // the Kettle's counter, Night 1
  'd4-wharf': 'wade', // first actual meeting; Night 1 must not identify the player
  'd2-dianne': 'dianne', // Lorn Bay General, Day 2 morning
  'd2-evening': 'tam', // Tam comes in on the back of the cold
  'd3-shed': 'sam', // the boat shed, caulk gun going, Day 3
  'd3-clinic': 'priya', // clinic hours in the old manse, Day 3
  'act1-end': 'wren', // the empty frame, where the act closes
};

const CHARACTER_IDS: ReadonlySet<string> = new Set<CharacterId>([
  'dianne',
  'wade',
  'priya',
  'sam',
  'barb',
  'tam',
]);

const isCharacterId = (value: string): value is CharacterId => CHARACTER_IDS.has(value);

/** Token → the character the room belongs to. Absent tokens mean nobody. */
export const TOKEN_CAST: Readonly<Record<string, readonly CharacterId[]>> = {
  diner: ['barb'],
  meal: ['barb'],
  moose: ['barb'],
  interview: ['barb'],
  kettle: ['barb'],
  counter: ['barb'],
  evening: ['barb'],
  errand: ['barb'],
  walkin: ['barb'],
  warning: ['barb'],
  delivery: ['barb'],
  stove: ['barb'],
  lamp: ['barb'],
  vigil: ['barb'],
  ash: ['barb'],
  dianne: ['dianne'],
  store: ['dianne'],
  stockroom: ['dianne'],
  corkboard: ['dianne'],
  mail: ['dianne'],
  house: ['dianne'],
  'house-tin': ['dianne'],
  albums: ['dianne'],
  hall: ['dianne'],
  prep: ['dianne'],
  confession: ['dianne'],
  wharf: ['wade'],
  'wharf-on': ['wade'],
  'wharf-off': ['wade'],
  ticket: ['wade'],
  'ticket-office': ['wade'],
  hornroom: ['wade'],
  'sixth-question': ['wade'],
  silence: ['wade'],
  crown: ['wade'],
  shed: ['sam'],
  recording: ['sam'],
  breakwater: ['sam'],
  clinic: ['priya'],
  priya: ['priya'],
  ride: ['tam'],
  depot: ['tam'],
};

/** Cue → the character whose theme it is. */
export const CUE_CAST: Readonly<Record<string, readonly CharacterId[]>> = {
  'dianne-theme': ['dianne'],
  'priya-theme': ['priya'],
  'sam-theme': ['sam'],
  'wade-theme': ['wade'],
  'horn-close': ['wade'],
  'tam-theme': ['tam'],
  'pub-warm': ['barb'],
};

/**
 * Per-scene truth where inference would be wrong. Empty arrays suppress —
 * the night scenes alone in the unit, the walk down to the horn, Night 1
 * before anyone is met.
 */
export const CAST_OVERRIDES: Readonly<Record<string, readonly CharacterId[]>> = {
  'n1-beach': [],
  'n1-walk': [],
  'n1-room': ['barb'],
  'n1-312': [],
  'd2-morning': ['barb'],
  'd2-delivery-2': [],
  'd2-evening': ['barb', 'tam'],
  'd3-shed-2': [],
  'd4-evening': ['barb', 'tam'],
  'd5-evening': ['barb', 'tam'],
  'd5-ride-3': ['tam', 'barb'],
  'd6-hall-2': [],
  'd7-shore': [],
  'd7-walk': [],
  'd7-after': ['wade'],
  'd8-wharf-2': [],
  'd8-stockroom-2': ['dianne'],
  'd10-house-3': [],
  'd10-shed-2': [],
  'd11-albums': ['dianne'],
  'd11-albums-2': [],
  'd11-counter': ['dianne'],
  'd11-counter-2': ['dianne'],
  'd12-morning': ['dianne'],
  'd12-counter': ['barb'],
  'd12-night': ['priya'],
  'd13-hall': ['dianne', 'sam'],
  'd13-verdict': ['sam', 'dianne'],
  'd13-after': ['dianne'],
  'd13-night-defended': [],
  'd13-night-exiled': ['barb'],
  'd14-priya': ['priya'],
  'd14-priya-2': ['priya'],
  'd14-evening': [],
  'd15-supper': ['dianne'],
  'd15-night': ['dianne'],
  'd15-night-2': ['dianne'],
  'd16-corkboard': [],
  'd17-night': [],
  'd17-letter': [],
  'd17-reveal': [],
  'd17-reveal-2': [],
  'd17-burn': [],
  'act2-ash': [],
  'act2-ash-2': [],
  'd18-beach': [],
  'd18-corkboard': ['dianne'],
  'd18-wharf': ['wade'],
  'd18-fog': [],
  'd18-stove': ['barb'],
  'd18-house': ['dianne'],
  'd18-evening': ['dianne'],
  'd19-evening': ['barb'],
  'd19-night': [],
  'd20-room': ['dianne'],
  'd20-room-2': ['dianne'],
  'd20-evening': ['barb'],
  'd20-night': [],
  'd21-guitar': [],
  'd21-guitar-2': [],
  'd21-evening-2': ['barb'],
  'd21-night': [],
  'd22-open': [],
  'd22-open-2': ['wade'],
  'd22-dianne': ['dianne'],
  'd22-dianne-2': ['dianne'],
  'd22-depot-empty': [],
  'd22-evening': ['dianne'],
  'd22-evening-2': [],
  'd22-after': [],
};

const LINE_TOKEN = /^@line:([a-z]+):/;

/** Speakers named by the scene's `@line:<speaker>:` paragraphs, in order. */
const speakersOf = (scene: Pick<Scene, 'prose'>): CharacterId[] => {
  if (scene.prose.kind !== 'inline') return [];
  const out: CharacterId[] = [];
  for (const block of scene.prose.paragraphs) {
    const match = LINE_TOKEN.exec(block.text);
    const who = match?.[1];
    if (who !== undefined && isCharacterId(who) && !out.includes(who)) out.push(who);
  }
  return out;
};

const dedupe = (ids: readonly CharacterId[]): CharacterId[] => {
  const out: CharacterId[] = [];
  for (const id of ids) if (!out.includes(id)) out.push(id);
  return out;
};

/** Who is present in a scene — static, from the Scene alone. */
export const castFor = (scene: Pick<Scene, 'id' | 'prose' | 'cue'>): CastModel => {
  const override = CAST_OVERRIDES[scene.id];
  const present =
    override !== undefined
      ? [...override]
      : dedupe([
          ...speakersOf(scene),
          ...(TOKEN_CAST[sceneToken(scene.id)] ?? []),
          ...(scene.cue !== undefined ? (CUE_CAST[scene.cue] ?? []) : []),
        ]).slice(0, 2);
  return { present, wrenFrame: scene.id === 'act1-end' };
};

/**
 * Everyone the run has met: the first-meeting table over every visited
 * scene, plus anyone castFor names in a visited scene. Visited = the scenes
 * the player chose in, plus the scene they stand in now.
 */
export const metCharacters = (
  state: Pick<WorldState, 'choiceLog' | 'sceneId'>,
  scenes: ReadonlyMap<SceneId, Pick<Scene, 'id' | 'prose' | 'cue'>>,
): ReadonlySet<SketchCharacter> => {
  const met = new Set<SketchCharacter>();
  const visited = new Set<string>([state.sceneId, ...state.choiceLog.map((c) => c.scene)]);
  for (const id of visited) {
    const first = FIRST_MEETING[id];
    if (first !== undefined) met.add(first);
    const scene = scenes.get(id);
    if (scene !== undefined) for (const who of castFor(scene).present) met.add(who);
  }
  return met;
};

/** Trust 0..10 → sketch opacity, bounded: never gone, never louder than marginalia. */
export const sketchOpacity = (trust: number): number => {
  const t = Math.max(0, Math.min(10, trust)) / 10;
  return Math.round((0.22 + 0.33 * t) * 1000) / 1000;
};

/** Wren's frame is fixed: it never trust-fades and never wavers. */
export const WREN_FRAME_OPACITY = 0.45;

/**
 * The sketches the margin may show for this scene: present ∩ met, with
 * trust-derived opacity, plus Wren's empty frame where the act closes.
 */
export const visibleCast = (
  scene: Pick<Scene, 'id' | 'prose' | 'cue'>,
  state: WorldState,
  scenes: ReadonlyMap<SceneId, Pick<Scene, 'id' | 'prose' | 'cue'>>,
): readonly VisibleSketch[] => {
  const met = metCharacters(state, scenes);
  const cast = castFor(scene);
  const out: VisibleSketch[] = cast.present
    .filter((who) => met.has(who))
    .map((who) => ({ who, opacity: sketchOpacity(axisValue(state, who, 'trust')) }));
  if (cast.wrenFrame) out.push({ who: 'wren', opacity: WREN_FRAME_OPACITY });
  return out;
};
