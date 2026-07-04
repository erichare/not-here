/**
 * Persistence. WorldState JSON at .saves/slot1.json — schema-version
 * checked; corrupt, missing, or skewed saves mean a fresh start. Plus the
 * append-only plain-text .saves/maud-ledger.txt: one line per choice made,
 * the diegetic cross-run artifact (NG+ reads it later).
 */

import { appendFileSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { SAVE_SCHEMA_VERSION, type SlotId, type WorldState } from '@not-here/engine';

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

export interface LedgerEntry {
  readonly day: number;
  readonly slot: SlotId;
  readonly label: string;
}

/** One line in Maud's book. */
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
