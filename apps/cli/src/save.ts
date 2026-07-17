/**
 * Persistence. WorldState JSON at .saves/slot1.json — schema-version
 * checked; corrupt, missing, or skewed saves mean a fresh start. Plus the
 * append-only plain-text .saves/barb-ledger.txt: one line per choice made,
 * the diegetic cross-run artifact (NG+ reads it later). And the margin
 * sidecar at .saves/slot1.margin.json — the engine events of the step that
 * parked the save, so a resumed screen re-prints its margin lines complete
 * (pt2-fix-04).
 */

import { appendFileSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import {
  SAVE_SCHEMA_VERSION,
  type EngineEvent,
  type Scene,
  type SlotId,
  type WorldState,
} from '@not-here/engine';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const looksLikeWorldState = (value: unknown): value is WorldState =>
  isRecord(value) &&
  value['v'] === SAVE_SCHEMA_VERSION &&
  typeof value['day'] === 'number' &&
  typeof value['slot'] === 'string' &&
  typeof value['sceneId'] === 'string' &&
  isRecord(value['stats']) &&
  typeof value['chord'] === 'number' &&
  typeof value['staticMeter'] === 'number' &&
  Array.isArray(value['facts']) &&
  isRecord(value['knownBy']) &&
  isRecord(value['flags']) &&
  typeof value['rngState'] === 'number' &&
  Array.isArray(value['choiceLog']);

/** Load a save; anything corrupt, missing, or version-skewed → undefined. */
export const loadSave = (path: string): WorldState | undefined => {
  try {
    const parsed: unknown = JSON.parse(readFileSync(path, 'utf8'));
    return looksLikeWorldState(parsed) ? parsed : undefined;
  } catch {
    // Missing file or unparseable JSON both mean: fresh start.
    return undefined;
  }
};

/** Write the save, creating .saves/ as needed. Throws on IO failure. */
export const saveGame = (state: WorldState, path: string): void => {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(state, null, 2)}\n`, 'utf8');
};

// ——— Launch classification (pt2-fix-01) ———————————————————————————————

/**
 * Endings that PARK the run rather than finish it: the boundary card is a
 * TO-BE-CONTINUED marker and the next slice inherits the save's flags.
 * True endings (Act 1 hard exits, the Ash ending) are not listed — a save
 * parked on one means a finished run and a fresh start. 'act2-end' is
 * RETIRED from this set: the card unsealed when Day 20 shipped (it lost
 * its `ending` marker, so saves parked there classify 'resume' and walk
 * into Day 20 with their flags intact). The held place is now 'd20-end',
 * where the authored days run out.
 */
export const ACT_BOUNDARY_ENDINGS: ReadonlySet<string> = new Set(['d20-end']);

export type Launch =
  | { readonly kind: 'fresh' }
  | { readonly kind: 'resume'; readonly state: WorldState }
  /** Parked on an act boundary: re-print the card, never overwrite. */
  | { readonly kind: 'held'; readonly state: WorldState };

/** What a loaded save means for this launch (pt2-fix-01). */
export const classifySave = (
  loaded: WorldState | undefined,
  scene: Scene | undefined,
): Launch => {
  if (loaded === undefined || scene === undefined) return { kind: 'fresh' };
  if (scene.ending === undefined) return { kind: 'resume', state: loaded };
  return ACT_BOUNDARY_ENDINGS.has(scene.ending)
    ? { kind: 'held', state: loaded }
    : { kind: 'fresh' };
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
  // only needs a kind — the audio sink ignores what it does not present.
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
 * Persist the events of the step being saved. IO failure is deliberately
 * non-fatal: the margin sidecar is presentation, never run state.
 */
export const saveMargin = (
  sceneId: string,
  events: readonly EngineEvent[],
  path: string,
): void => {
  const margin: SceneMargin = { v: SAVE_SCHEMA_VERSION, sceneId, events };
  try {
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, `${JSON.stringify(margin, null, 2)}\n`, 'utf8');
  } catch {
    // Swallowed by design; see docstring.
  }
};

/** Load the margin sidecar; anything corrupt, missing, or skewed → undefined. */
export const loadMargin = (path: string): SceneMargin | undefined => {
  try {
    const parsed: unknown = JSON.parse(readFileSync(path, 'utf8'));
    return looksLikeMargin(parsed) ? parsed : undefined;
  } catch {
    // Missing file or unparseable JSON both mean: no margin to replay.
    return undefined;
  }
};

export interface LedgerEntry {
  readonly day: number;
  readonly slot: SlotId;
  readonly label: string;
}

/** One line in Barb's book. */
export const formatLedgerLine = (entry: LedgerEntry): string =>
  `Day ${entry.day}, ${entry.slot} — ${entry.label}`;

/**
 * Append one diegetic line per choice made. IO failure is deliberately
 * non-fatal: the text ledger is flavour and must never kill the run.
 */
export const appendLedgerLine = (entry: LedgerEntry, path: string): void => {
  try {
    mkdirSync(dirname(path), { recursive: true });
    appendFileSync(path, `${formatLedgerLine(entry)}\n`, 'utf8');
  } catch {
    // Swallowed by design; see docstring.
  }
};
