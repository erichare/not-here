import { mkdtempSync, readFileSync, rmSync, mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { afterEach, expect, it } from 'vitest';
import { advance, initialState } from '@not-here/engine';
import { buildRevisedContent, REVISED_OPENING_SCENE } from '@not-here/story';

const directories: string[] = [];
const entry = fileURLToPath(new URL('./main.ts', import.meta.url));
const temporary = () => { const path = mkdtempSync(join(tmpdir(), 'not-here-revised-')); directories.push(path); return path; };
afterEach(() => { for (const path of directories.splice(0)) rmSync(path, { recursive: true, force: true }); });
const run = (cwd: string, input: string) => {
  const result = spawnSync(process.execPath, [entry], { cwd, input, encoding: 'utf8', env: { ...process.env, NH_EDITION: 'revised', NH_SILENT: '1', NH_SEED: '42' }, timeout: 15000 });
  expect(result.status, result.stderr).toBe(0);
  return result.stdout;
};
const replay = (picks: Record<string, string>) => {
  const content = buildRevisedContent();
  let step = advance(content, initialState(42, REVISED_OPENING_SCENE), { kind: 'enter' });
  const lines: string[] = [];
  for (let i = 0; i < 500 && !step.view.ending; i++) {
    if (step.view.input === 'name') { lines.push('Alex'); step = advance(content, step.state, { kind: 'name', name: 'Alex' }); }
    const choices = step.view.choices.filter(c => !c.locked);
    const index = Math.max(0, choices.findIndex(c => c.id === picks[step.state.sceneId]));
    lines.push(String(index + 1)); step = advance(content, step.state, { kind: 'choose', choiceId: choices[index]!.id });
  }
  expect(step.view.ending).toBeTruthy(); return lines.join('\n') + '\n';
};

it('keeps free observations and original CLI saves intact', () => {
  const cwd = temporary(); mkdirSync(join(cwd, '.saves')); writeFileSync(join(cwd, '.saves/slot1.json'), 'original-save');
  const out = run(cwd, 'o1\nn\nq\n');
  expect(out).toContain('dry at the roots');
  const saved = JSON.parse(readFileSync(join(cwd, '.saves/story2/slot1.json'), 'utf8'));
  expect(saved.sceneId).toBe('n1-beach'); expect(saved.choiceLog).toHaveLength(0);
  expect(readFileSync(join(cwd, '.saves/slot1.json'), 'utf8')).toBe('original-save');
});
it('plays an honest zero-confession ending through the CLI', () => {
  const cwd = temporary();
  const out = run(cwd, replay({ 'd3-room': 'let-it-stay', 'd20-morning': 'prepare-future', 'r20-prepare': 'make-place' }) + 'q\n');
  expect(out).toContain('Two Wrens'); expect(out).toContain('Alex');
  const saved = JSON.parse(readFileSync(join(cwd, '.saves/story2/slot1.json'), 'utf8'));
  expect(Object.keys(saved.flags).filter(k => k.startsWith('conf:'))).toEqual([]);
});
it('rewinds Unwitnessed to its saved final warning', () => {
  const cwd = temporary();
  const input = replay({ 'd7-hornroom': 'stop', 'r20-warning': 'decline-help', 'd20-morning': 'prepare-future', 'r20-prepare': 'keep-away', 'r22-warning': 'walk-unseen' });
  const out = run(cwd, input + 'r\nq\n');
  expect(out).toContain('Unwitnessed'); expect(out).toContain('Stay. Accept the plate and the company.');
  expect(JSON.parse(readFileSync(join(cwd, '.saves/story2/slot1.json'), 'utf8')).sceneId).toBe('r22-warning');
  expect(readFileSync(join(cwd, '.saves/story2/recent-pages.json'), 'utf8')).not.toContain('The room continues. You are no longer in it.');
});
