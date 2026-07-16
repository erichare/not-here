/**
 * Save slot persistence. One slot, keyed 'not-here:slot1', written on
 * `save.autosave` engine events. Storage is injectable (Storage-shaped) so
 * the module is testable in node; the app passes window.localStorage.
 * Never trusts stored data — anything malformed loads as null. Plus the
 * margin sidecar at 'not-here:slot1:margin' — the engine events of the step
 * that parked the save, so a resumed screen replays its margin lines
 * complete (pt2-fix-04).
 */

import {
  resumeScene,
  SAVE_SCHEMA_VERSION,
  type EngineEvent,
  type StepResult,
  type StoryContent,
  type WorldState,
} from '@not-here/engine';

export const SAVE_KEY = 'not-here:slot1';
export const MARGIN_KEY = 'not-here:slot1:margin';

/** The subset of the DOM Storage interface we rely on. */
export interface SaveStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

/** Structural check on the untrusted parse — enough to render and advance. */
const isWorldState = (value: unknown): value is WorldState => {
  if (!isRecord(value)) return false;
  return (
    value['v'] === SAVE_SCHEMA_VERSION &&
    typeof value['day'] === 'number' &&
    typeof value['slot'] === 'string' &&
    typeof value['sceneId'] === 'string' &&
    typeof value['chord'] === 'number' &&
    typeof value['staticMeter'] === 'number' &&
    typeof value['rngState'] === 'number' &&
    isRecord(value['stats']) &&
    isRecord(value['knownBy']) &&
    isRecord(value['flags']) &&
    Array.isArray(value['facts']) &&
    Array.isArray(value['choiceLog'])
  );
};

export const loadSave = (storage: SaveStorage): WorldState | null => {
  let raw: string | null;
  try {
    raw = storage.getItem(SAVE_KEY);
  } catch {
    return null;
  }
  if (raw === null) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    return isWorldState(parsed) ? parsed : null;
  } catch {
    return null;
  }
};

/** Returns false when storage is unavailable/full — the run just isn't kept. */
export const persistSave = (storage: SaveStorage, state: WorldState): boolean => {
  try {
    storage.setItem(SAVE_KEY, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
};

export const clearSave = (storage: SaveStorage): void => {
  try {
    storage.removeItem(SAVE_KEY);
    storage.removeItem(MARGIN_KEY);
  } catch {
    // Nothing to clear if storage itself is gone.
  }
};

export const hasSave = (storage: SaveStorage): boolean => loadSave(storage) !== null;

// ——— Launch classification (pt2-fix-01) ———————————————————————————————

/** The slice of scene data launch needs: does the id exist, is it an end. */
export interface ResumableScene {
  readonly ending?: string;
}

/**
 * Endings that PARK the run rather than finish it: the act card is a
 * TO-BE-CONTINUED marker and the next act inherits the save's flags.
 * True endings (Act 1 hard exits, the Ash ending) are not listed — a save
 * parked on one means a finished run and a fresh start.
 */
export const ACT_BOUNDARY_ENDINGS: ReadonlySet<string> = new Set(['act2-end']);

export type Launch =
  | { readonly kind: 'fresh' }
  | { readonly kind: 'resume'; readonly state: WorldState }
  /** Parked on an act boundary: re-show the card, never clear storage. */
  | { readonly kind: 'held'; readonly state: WorldState };

/** What a loaded save means for this launch (pt2-fix-01). Mirrors the CLI. */
export const classifySave = (
  loaded: WorldState | null,
  scene: ResumableScene | undefined,
): Launch => {
  if (loaded === null || scene === undefined) return { kind: 'fresh' };
  if (scene.ending === undefined) return { kind: 'resume', state: loaded };
  return ACT_BOUNDARY_ENDINGS.has(scene.ending)
    ? { kind: 'held', state: loaded }
    : { kind: 'fresh' };
};

/**
 * classifySave over the stored slot — the launch the title screen acts on.
 * A save referencing a scene this content no longer has (content patch)
 * starts fresh rather than crashing the enter step. Read-only: classifying
 * must never write or clear the slot.
 */
export const classifyLaunch = (
  storage: SaveStorage,
  scenes: ReadonlyMap<string, ResumableScene>,
): Launch => {
  const saved = loadSave(storage);
  return classifySave(saved, saved === null ? undefined : scenes.get(saved.sceneId));
};

// ——— Margin sidecar (pt2-fix-04) ——————————————————————————————————————

export interface SceneMargin {
  readonly v: number;
  readonly sceneId: string;
  readonly events: readonly EngineEvent[];
}

const looksLikeEvent = (value: unknown): boolean => {
  if (!isRecord(value) || typeof value['kind'] !== 'string') return false;
  // The two display-bearing kinds must carry their payload; anything else
  // only needs a kind — the frontend ignores what it does not present.
  if (value['kind'] === 'music.cue') return typeof value['cue'] === 'string';
  if (value['kind'] === 'tell.visual') return typeof value['text'] === 'string';
  return true;
};

const looksLikeMargin = (value: unknown): value is SceneMargin =>
  isRecord(value) &&
  value['v'] === SAVE_SCHEMA_VERSION &&
  typeof value['sceneId'] === 'string' &&
  Array.isArray(value['events']) &&
  value['events'].every(looksLikeEvent);

/**
 * Persist the events of the step being saved. Storage failure is
 * deliberately non-fatal: the margin sidecar is presentation, never run
 * state.
 */
export const saveMargin = (
  storage: SaveStorage,
  sceneId: string,
  events: readonly EngineEvent[],
): void => {
  const margin: SceneMargin = { v: SAVE_SCHEMA_VERSION, sceneId, events };
  try {
    storage.setItem(MARGIN_KEY, JSON.stringify(margin));
  } catch {
    // Swallowed by design; see docstring.
  }
};

/** Load the margin sidecar; anything corrupt, missing, or skewed → null. */
export const loadMargin = (storage: SaveStorage): SceneMargin | null => {
  try {
    const raw = storage.getItem(MARGIN_KEY);
    if (raw === null) return null;
    const parsed: unknown = JSON.parse(raw);
    return looksLikeMargin(parsed) ? parsed : null;
  } catch {
    // Unreachable storage or unparseable JSON both mean: nothing to replay.
    return null;
  }
};

/**
 * Resume a loaded save without re-applying onEnter effects (pt2-fix-03) —
 * the save already holds the post-onEnter state; a re-enter would run the
 * nightly decay twice and swap state-keyed prose variants. The margin
 * sidecar, when it matches, replays the events the first render carried so
 * the resumed screen is complete (pt2-fix-04).
 */
export const resumeStep = (
  content: StoryContent,
  state: WorldState,
  storage: SaveStorage,
): StepResult => {
  const step = resumeScene(content, state);
  const margin = loadMargin(storage);
  return margin !== null && margin.sceneId === state.sceneId
    ? { ...step, events: margin.events }
    : step;
};
