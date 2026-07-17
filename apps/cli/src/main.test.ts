/**
 * End-to-end run of the terminal build with piped input (NH_SILENT). These
 * assert presentation invariants that only exist at the main-loop level:
 * the ledger hint prints exactly once (fix-04), no internal identifier
 * ever reaches the screen (fix-07), act boundaries hold the save
 * (pt2-fix-01), resume does not re-apply onEnter effects (pt2-fix-03),
 * and re-prints keep their margin lines (pt2-fix-04).
 */

import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { initialState, SAVE_SCHEMA_VERSION, type WorldState } from '@not-here/engine';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { stripAnsi } from './render.ts';
import { loadSave } from './save.ts';

const MAIN = fileURLToPath(new URL('./main.ts', import.meta.url));

let cwd: string;

beforeEach(() => {
  cwd = mkdtempSync(join(tmpdir(), 'nh-cli-e2e-'));
});

afterEach(() => {
  rmSync(cwd, { recursive: true, force: true });
});

/** Run the CLI to completion of the given inputs; returns plain text. */
const play = (inputs: readonly string[]): string => {
  const out = execFileSync('node', [MAIN], {
    input: `${inputs.join('\n')}\n`,
    cwd,
    env: { ...process.env, NH_SILENT: '1', NH_SEED: '1971' },
    encoding: 'utf8',
  });
  return stripAnsi(out);
};

// First choice through Night 1 into the room and past the 3:12 horn.
const NIGHT1_WALK = ['1', '1', '1', '1', '1', '1', '1', '1', '1', '1', '1', 'q'];

describe('terminal build, Night 1 walk', () => {
  it('prints the ledger hint exactly once, after the interview', () => {
    const plain = play(NIGHT1_WALK);
    const hits = plain.split('l consults the ledger').length - 1;
    // All inputs are valid choices, so the generic bad-input hint never
    // fires; the one occurrence is the post-interview teach (fix-04).
    expect(hits).toBe(1);
    expect(plain.indexOf('What am I writing?')).toBeLessThan(
      plain.indexOf('l consults the ledger'),
    );
  });

  it('never shows a raw cue id — captions are diegetic', () => {
    const plain = play(NIGHT1_WALK);
    for (const id of ['wrens-room', 'foghorn-312', 'pub-warm', 'shingle']) {
      expect(plain).not.toContain(id);
    }
    expect(plain).toContain('♪ ');
  });

  it('opening the ledger does not re-print the scene captions', () => {
    const plain = play(['1', 'l', '', 'q']);
    const captions = plain.split('♪ small waves working the gravel').length - 1;
    expect(captions).toBe(1);
    expect(plain).toContain("BARB'S BOOK");
  });
});

const SAVE_FILE = (): string => join(cwd, '.saves', 'slot1.json');

/** Park a hand-built save in the test cwd, as if a run had quit there. */
const parkSave = (state: WorldState): void => {
  mkdirSync(join(cwd, '.saves'), { recursive: true });
  writeFileSync(SAVE_FILE(), `${JSON.stringify(state, null, 2)}\n`, 'utf8');
};

describe('the unsealed boundary — a held act2-end save resumes into Day 20', () => {
  // The full Act 2 contract Day 20 reads, parked as a real run leaves it
  // (pt2-fix-01 retired for act2-end: the card lost its ending marker).
  const parked: WorldState = {
    ...initialState(7, 'act2-end'),
    day: 20,
    slot: 'morning',
    flags: {
      'knows-truth': true,
      'letter-opened': true,
      'horn-on': true,
      'potluck:sam': 'defended',
      'potluck:verdict': 'defended',
      'd16:sam-named': true,
      'd18:kettle-day': true,
      'barb:counsel-seeded': true,
    },
  };

  it('relaunching re-prints the card with the open morning — no held exit, no fresh Day 1', () => {
    parkSave(parked);
    const plain = play([]);
    expect(plain).toContain('ACT THREE');
    expect(plain).toContain('Morning comes anyway.');
    expect(plain).not.toContain('end of the second act');
    expect(plain).not.toContain('Your November is kept.');
    expect(plain).not.toContain('DAY 1 —');
  });

  it('a no-choice relaunch leaves the parked state exactly as it was', () => {
    parkSave(parked);
    play([]);
    expect(loadSave(SAVE_FILE())).toEqual(parked);
  });

  it('choosing the morning walks into d20-morning with every contract flag intact', () => {
    parkSave(parked);
    const plain = play(['1', 'q']);
    expect(plain).toContain('DAY 20 — MORNING');
    const saved = loadSave(SAVE_FILE());
    expect(saved?.sceneId).toBe('d20-morning');
    expect(saved?.day).toBe(20);
    for (const [key, value] of Object.entries(parked.flags)) {
      expect(saved?.flags[key], `contract flag ${key} did not survive the boundary`).toBe(value);
    }
  });
});

describe('the held place moved to the NOVEMBER 26 card (pt2-fix-01)', () => {
  const held: WorldState = {
    ...initialState(7, 'd20-end'),
    day: 21,
    slot: 'morning',
    flags: { 'knows-truth': true, 'conf:sam': true },
  };

  it('relaunching on d20-end re-prints the card and exits', () => {
    parkSave(held);
    const plain = play([]);
    expect(plain).toContain('NOVEMBER 26');
    expect(plain).toContain('held for the twenty-sixth');
    expect(plain).toContain('Your November is kept. The twenty-sixth is not written yet.');
    // No fresh Day 1, no prompt, no day header on the card.
    expect(plain).not.toContain('DAY 1 —');
    expect(plain).not.toContain('a number chooses');
  });

  it('never overwrites the held save — the next slice inherits its flags', () => {
    parkSave(held);
    const before = readFileSync(SAVE_FILE(), 'utf8');
    play([]);
    play([]); // stable across as many launches as it takes
    expect(readFileSync(SAVE_FILE(), 'utf8')).toBe(before);
    expect(loadSave(SAVE_FILE())?.flags['conf:sam']).toBe(true);
  });

  it('a save parked on the Ash ending still means a fresh start', () => {
    parkSave({ ...initialState(7, 'act2-ash-2'), day: 18, slot: 'morning' });
    const plain = play(['q']);
    expect(plain).toContain('DAY 1 —');
    expect(loadSave(SAVE_FILE())?.sceneId).not.toBe('act2-ash-2');
  });
});

describe('resume is a re-print, not a re-entry (pt2-fix-03, pt2-fix-04)', () => {
  it('quitting and relaunching leaves the saved state untouched', () => {
    // n1-beach's onEnter appends a fact — a re-enter on resume would
    // append it again (and NIGHT_DECAY-style blocks would pay twice).
    play(['1', 'q']);
    const first = loadSave(SAVE_FILE());
    expect(first?.sceneId).toBe('n1-beach');
    expect(first?.facts).toHaveLength(1);
    play(['q']);
    expect(loadSave(SAVE_FILE())).toEqual(first);
  });

  it('the resumed screen re-prints the same margin lines as the first print', () => {
    const firstRun = play(['1', 'q']);
    expect(firstRun).toContain('♪ small waves working the gravel');
    const resumed = play(['q']);
    expect(resumed).toContain('♪ small waves working the gravel');
  });

  it('the act card keeps its counting line on re-print', () => {
    // As the game leaves them: the save parked on the ACT TWO card, the
    // margin sidecar carrying the tell the lie-down choice emitted.
    parkSave({
      ...initialState(7, 'act1-end'),
      day: 8,
      slot: 'morning',
      flags: { 'horn-stopped': true },
    });
    writeFileSync(
      join(cwd, '.saves', 'slot1.margin.json'),
      JSON.stringify({
        v: SAVE_SCHEMA_VERSION,
        sceneId: 'act1-end',
        events: [
          { kind: 'tell.visual', text: '(Something has started counting.)' },
          { kind: 'music.cue', cue: 'title' },
        ],
      }),
      'utf8',
    );
    const plain = play(['q']);
    expect(plain).toContain('ACT TWO');
    expect(plain).toContain('(Something has started counting.)');
  });
});
