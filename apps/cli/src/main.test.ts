/**
 * End-to-end run of the terminal build with piped input (NH_SILENT). These
 * assert presentation invariants that only exist at the main-loop level:
 * the ledger hint prints exactly once (fix-04), and no internal identifier
 * ever reaches the screen (fix-07).
 */

import { execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { stripAnsi } from './render.ts';

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
