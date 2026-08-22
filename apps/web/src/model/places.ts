/**
 * Place inference — which room of Lorn Bay a scene stands in. Scenes carry
 * no place field; the web build derives one from the scene id's naming
 * token (the authored ids are regular: d16-wharf, d21-kettle, d3-clinic …)
 * with an override table for the ids whose token lies about the room
 * (d11-albums is the shelf behind Dianne's till, not Wren's room; d6-recording
 * is the Kettle's lot at two in the morning; d22-dianne is coffee at the
 * Kettle). Pure, and linted over every scene in buildContent() by
 * places.test.ts — a future scene with an unknown token fails the lint
 * instead of sliding through to 'ambient' unnoticed.
 */

import type { Scene } from '@not-here/engine';

export const PLACES = [
  'card',
  'beach',
  'road',
  'wharf',
  'hornroom',
  'unit',
  'kettle',
  'room',
  'general',
  'house',
  'clinic',
  'shed',
  'hall',
  'depot',
  'shelter',
  'ambient',
] as const;

export type PlaceId = (typeof PLACES)[number];

/** Structural cards: the prologue, the act cards, the held place, the endings. */
export type CardKind = 'prologue' | 'act' | 'held' | 'ending';

const PREFIX = /^(d\d+|n1|act\d)-/;
const SUFFIX = /-\d+$/;

/** The naming token: 'd4-wharf-2' → 'wharf', 'n1-interview-3' → 'interview'. */
export const sceneToken = (id: string): string => id.replace(PREFIX, '').replace(SUFFIX, '');

/** Token → place. Tokens are the authored vocabulary of the scene ids. */
export const TOKEN_PLACES: Readonly<Record<string, PlaceId>> = {
  title: 'card',
  end: 'card',
  beach: 'beach',
  shore: 'beach',
  breakwater: 'beach',
  walk: 'road',
  fog: 'road',
  after: 'road',
  'night-defended': 'road',
  diner: 'kettle',
  meal: 'kettle',
  moose: 'kettle',
  interview: 'kettle',
  kettle: 'kettle',
  counter: 'kettle',
  morning: 'kettle',
  evening: 'kettle',
  errand: 'kettle',
  walkin: 'kettle',
  warning: 'kettle',
  delivery: 'kettle',
  stove: 'kettle',
  vigil: 'kettle',
  lamp: 'kettle',
  open: 'kettle',
  ash: 'kettle',
  recording: 'kettle',
  supper: 'kettle',
  confession: 'kettle',
  room: 'room',
  albums: 'room',
  guitar: 'room',
  dianne: 'general',
  store: 'general',
  stockroom: 'general',
  corkboard: 'general',
  mail: 'general',
  letter: 'general',
  reveal: 'general',
  burn: 'general',
  house: 'house',
  'house-tin': 'house',
  clinic: 'clinic',
  priya: 'clinic',
  shed: 'shed',
  hall: 'hall',
  prep: 'hall',
  verdict: 'hall',
  depot: 'depot',
  'depot-empty': 'depot',
  ride: 'depot',
  wharf: 'wharf',
  'wharf-on': 'wharf',
  'wharf-off': 'wharf',
  ticket: 'wharf',
  'ticket-office': 'wharf',
  'night-exiled': 'wharf',
  hornroom: 'hornroom',
  'sixth-question': 'hornroom',
  silence: 'hornroom',
  crown: 'hornroom',
  night: 'unit',
  wake: 'unit',
  '312': 'unit',
};

/** Ids whose token is not where the scene stands. */
export const PLACE_OVERRIDES: Readonly<Record<string, PlaceId>> = {
  'n1-room': 'unit',
  'd5-ride-3': 'kettle',
  'd7-walk': 'wharf',
  'd7-after': 'hornroom',
  'd10-house-3': 'road',
  'd11-albums': 'general',
  'd11-albums-2': 'general',
  'd11-counter': 'general',
  'd11-counter-2': 'general',
  'd12-morning': 'hall',
  'd12-night': 'clinic',
  'd13-after': 'hall',
  'd14-priya': 'kettle',
  'd14-priya-2': 'kettle',
  'd15-supper': 'house',
  'd15-night': 'house',
  'd15-night-2': 'house',
  'd17-night': 'general',
  'd17-burn': 'house',
  'd18-evening': 'general',
  'd21-night': 'kettle',
  'd22-dianne': 'kettle',
  'd22-dianne-2': 'kettle',
  'd22-open-2': 'wharf',
  'd22-evening': 'house',
  'd22-evening-2': 'road',
};

/** The place a scene stands in. Never throws; unknown tokens → 'ambient'. */
export const placeFor = (scene: Pick<Scene, 'id'>): PlaceId =>
  PLACE_OVERRIDES[scene.id] ?? TOKEN_PLACES[sceneToken(scene.id)] ?? 'ambient';

/** The structural cards are slotless scenes on the title cue. */
export const isCardScene = (scene: Pick<Scene, 'slot' | 'cue'>): boolean =>
  scene.slot === undefined && scene.cue === 'title';

/**
 * What kind of card a scene is, or null for an ordinary ledger entry.
 * Endings outrank act cards; the held boundary (save.ts ACT_BOUNDARY_ENDINGS)
 * is a held place, never a close.
 */
export const cardKindFor = (
  scene: Pick<Scene, 'id' | 'slot' | 'cue' | 'ending'>,
  heldEndings: ReadonlySet<string>,
): CardKind | null => {
  if (scene.ending !== undefined) return heldEndings.has(scene.ending) ? 'held' : 'ending';
  if (!isCardScene(scene)) return null;
  return sceneToken(scene.id) === 'title' ? 'prologue' : 'act';
};
