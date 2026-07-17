import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  defineScene,
  initialState,
  SAVE_SCHEMA_VERSION,
  type EngineEvent,
} from '@not-here/engine';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  appendLedgerLine,
  classifySave,
  formatLedgerLine,
  loadMargin,
  loadSave,
  saveGame,
  saveMargin,
} from './save.ts';

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

describe('classifySave — act boundaries hold places (pt2-fix-01)', () => {
  const state = initialState(1971, 'act2-end');
  const bare = { prose: { kind: 'inline' as const, paragraphs: [] }, choices: [] };

  it('no save, or a save on an unknown scene, means a fresh start', () => {
    expect(classifySave(undefined, undefined)).toEqual({ kind: 'fresh' });
    expect(classifySave(state, undefined)).toEqual({ kind: 'fresh' });
  });

  it('a save parked mid-run resumes', () => {
    const scene = defineScene({ id: 'd8-morning', ...bare });
    expect(classifySave(state, scene)).toEqual({ kind: 'resume', state });
  });

  it('a save parked on the held card (d20-end) is held, never discarded', () => {
    const scene = defineScene({ id: 'd20-end', ...bare, ending: 'd20-end' });
    expect(classifySave(state, scene)).toEqual({ kind: 'held', state });
  });

  it('act2-end is retired from the hold: the unsealed card is mid-run and resumes', () => {
    // The card lost its `ending` marker when Day 20 shipped — a November
    // parked there walks into Day 20 with its flags intact.
    const scene = defineScene({ id: 'act2-end', ...bare });
    expect(classifySave(state, scene)).toEqual({ kind: 'resume', state });
  });

  it('a save parked on a true ending means a finished run — fresh start', () => {
    const ash = defineScene({ id: 'act2-ash-2', ...bare, ending: 'ash' });
    expect(classifySave(state, ash)).toEqual({ kind: 'fresh' });
  });
});

describe('slot1.margin.json — the parked step’s events (pt2-fix-04)', () => {
  const events: readonly EngineEvent[] = [
    { kind: 'music.cue', cue: 'title' },
    { kind: 'tell.visual', text: '(Something has started counting.)' },
    { kind: 'save.autosave' },
  ];

  it('round-trips sceneId and events, creating the directory', () => {
    const path = join(dir, '.saves', 'slot1.margin.json');
    saveMargin('act1-end', events, path);
    expect(loadMargin(path)).toEqual({
      v: SAVE_SCHEMA_VERSION,
      sceneId: 'act1-end',
      events,
    });
  });

  it('returns undefined for a missing file or corrupt JSON', () => {
    expect(loadMargin(join(dir, 'nope.json'))).toBeUndefined();
    const path = join(dir, 'slot1.margin.json');
    writeFileSync(path, '{ not json', 'utf8');
    expect(loadMargin(path)).toBeUndefined();
  });

  it('returns undefined for a version mismatch', () => {
    const path = join(dir, 'slot1.margin.json');
    const stale = { v: SAVE_SCHEMA_VERSION + 1, sceneId: 'act1-end', events: [] };
    writeFileSync(path, JSON.stringify(stale), 'utf8');
    expect(loadMargin(path)).toBeUndefined();
  });

  it('rejects malformed events wholesale — a bad margin replays nothing', () => {
    const path = join(dir, 'slot1.margin.json');
    const broken = {
      v: SAVE_SCHEMA_VERSION,
      sceneId: 'act1-end',
      events: [{ kind: 'music.cue' }], // cue payload missing
    };
    writeFileSync(path, JSON.stringify(broken), 'utf8');
    expect(loadMargin(path)).toBeUndefined();
  });

  it('write failure is swallowed — the margin is flavour, never run state', () => {
    // The target path IS a directory, so the write fails; nothing throws.
    expect(() => saveMargin('x', [], dir)).not.toThrow();
  });
});

describe('barb-ledger.txt', () => {
  it('formats the diegetic line', () => {
    expect(formatLedgerLine({ day: 2, slot: 'morning', label: 'Go down.' })).toBe(
      'Day 2, morning — Go down.',
    );
  });

  it('appends one line per choice', () => {
    const path = join(dir, '.saves', 'barb-ledger.txt');
    appendLedgerLine({ day: 1, slot: 'night', label: 'Eat. All of it.' }, path);
    appendLedgerLine({ day: 2, slot: 'morning', label: 'Go down.' }, path);
    expect(readFileSync(path, 'utf8')).toBe(
      'Day 1, night — Eat. All of it.\nDay 2, morning — Go down.\n',
    );
  });
});
