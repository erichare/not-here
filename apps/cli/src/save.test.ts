import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { initialState, SAVE_SCHEMA_VERSION } from '@not-here/engine';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { appendLedgerLine, formatLedgerLine, loadSave, saveGame } from './save.ts';

let dir: string;

beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), 'nh-cli-save-'));
});

afterEach(() => {
  rmSync(dir, { recursive: true, force: true });
});

describe('saveGame / loadSave', () => {
  it('round-trips a WorldState, creating the directory', () => {
    const state = initialState(1971, 'n1-title');
    const path = join(dir, '.saves', 'slot1.json');
    saveGame(state, path);
    expect(loadSave(path)).toEqual(state);
  });

  it('returns undefined for a missing file', () => {
    expect(loadSave(join(dir, 'nope.json'))).toBeUndefined();
  });

  it('returns undefined for corrupt JSON', () => {
    const path = join(dir, 'slot1.json');
    writeFileSync(path, '{ not json', 'utf8');
    expect(loadSave(path)).toBeUndefined();
  });

  it('returns undefined for a version mismatch', () => {
    const path = join(dir, 'slot1.json');
    const stale = { ...initialState(1, 'n1-title'), v: SAVE_SCHEMA_VERSION + 1 };
    writeFileSync(path, JSON.stringify(stale), 'utf8');
    expect(loadSave(path)).toBeUndefined();
  });

  it('returns undefined for a wrong shape', () => {
    const path = join(dir, 'slot1.json');
    writeFileSync(path, JSON.stringify({ v: SAVE_SCHEMA_VERSION }), 'utf8');
    expect(loadSave(path)).toBeUndefined();
  });
});

describe('maud-ledger.txt', () => {
  it('formats the diegetic line', () => {
    expect(formatLedgerLine({ day: 2, slot: 'morning', label: 'Go down.' })).toBe(
      'Day 2, morning — Go down.',
    );
  });

  it('appends one line per choice', () => {
    const path = join(dir, '.saves', 'maud-ledger.txt');
    appendLedgerLine({ day: 1, slot: 'night', label: 'Eat. All of it.' }, path);
    appendLedgerLine({ day: 2, slot: 'morning', label: 'Go down.' }, path);
    expect(readFileSync(path, 'utf8')).toBe(
      'Day 1, night — Eat. All of it.\nDay 2, morning — Go down.\n',
    );
  });
});
