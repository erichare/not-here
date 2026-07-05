/**
 * Save slot persistence. One slot, keyed 'not-here:slot1', written on
 * `save.autosave` engine events. Storage is injectable (Storage-shaped) so
 * the module is testable in node; the app passes window.localStorage.
 * Never trusts stored data — anything malformed loads as null.
 */

import { SAVE_SCHEMA_VERSION, type WorldState } from '@not-here/engine';

export const SAVE_KEY = 'not-here:slot1';

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
  } catch {
    // Nothing to clear if storage itself is gone.
  }
};

export const hasSave = (storage: SaveStorage): boolean => loadSave(storage) !== null;

/** The slice of scene data resume needs: does the id exist, is it an end. */
export interface ResumableScene {
  readonly ending?: string;
}

/**
 * The save worth resuming, or null. Mirrors the CLI: a save parked on an
 * ending is a finished run (never trap resume on the act card), and a save
 * referencing a scene this content no longer has (content patch) starts
 * fresh rather than crashing the enter step.
 */
export const resumableSave = (
  storage: SaveStorage,
  scenes: ReadonlyMap<string, ResumableScene>,
): WorldState | null => {
  const saved = loadSave(storage);
  if (saved === null) return null;
  const scene = scenes.get(saved.sceneId);
  if (scene === undefined || scene.ending !== undefined) return null;
  return saved;
};
