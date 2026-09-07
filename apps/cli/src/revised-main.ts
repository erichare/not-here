/** The illustrated story through a thinner wall. All decisions use the same engine. */
import { mkdirSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createInterface } from 'node:readline';
import { advance, initialState, resumeScene, type StepResult } from '@not-here/engine';
import { buildRevisedContent, REVISED_OPENING_SCENE, notebookEntries } from '@not-here/story';
import { createLineSource } from './input.ts';
import { loadSave, saveGame } from './save.ts';
import { renderLedger } from './ledger.ts';
import { renderParagraphs, renderChoices, renderEnding } from './render.ts';
import { createAudioSink } from './audio.ts';

const content = buildRevisedContent();
const directory = join(process.cwd(), '.saves', 'story2');
const save = join(directory, 'slot1.json');
const rewind = join(directory, 'rewind.json');
const historyPath = join(directory, 'recent-pages.json');
const audio = createAudioSink(join(dirname(fileURLToPath(import.meta.url)), '../../../auditions'), { silent: process.env['NH_SILENT'] === '1', edition: 'revised' });
const rl = createInterface({ input: process.stdin, output: process.stdout });
const input = createLineSource(rl, { interactive: process.stdin.isTTY === true });
const write = (line: string) => process.stdout.write(`${line}\n`);
const loaded = loadSave(save);
let step = loaded && content.scenes.has(loaded.sceneId) ? resumeScene(content, loaded) : advance(content, initialState(Number(process.env['NH_SEED'] ?? 1971), REVISED_OPENING_SCENE), { kind: 'enter' });
let history: { scene: string; lines: readonly string[] }[] = [];
try { const raw: unknown = JSON.parse(readFileSync(historyPath, 'utf8')); if (Array.isArray(raw)) history = raw.filter(x => x && typeof x.scene === 'string' && Array.isArray(x.lines) && x.lines.every((s: unknown) => typeof s === 'string')).slice(-200); } catch { /* no earlier pages */ }
const persist = () => {
  try {
    mkdirSync(directory, { recursive: true }); saveGame(step.state, save);
    if (['r20-warning', 'r22-warning'].includes(step.state.sceneId)) saveGame(step.state, rewind);
    writeFileSync(historyPath, JSON.stringify(history.slice(-200)));
  } catch { write('Could not save. Keep this session open.'); }
};
const render = (next: StepResult) => {
  step = next;
  if (history.at(-1)?.scene !== step.state.sceneId) history.push({ scene: step.state.sceneId, lines: step.view.paragraphs });
  write(`\nNOVEMBER ${step.state.day + 5} · ${step.view.presentation?.title ?? 'Lorn Bay'}\n`);
  write(renderParagraphs(step.view.paragraphs));
  if (step.view.presentation) write(`\n♪ ${step.view.presentation.sound}`);
  for (const line of audio.handle(step.events)) write(line);
  for (const e of step.events) if (e.kind === 'music.fragments') write(`♪ Returned voices: ${e.characters.join(', ')}.`);
  for (const [index, observation] of (step.view.observations ?? []).entries()) write(`o${index + 1}. ${observation.label} (no time passes)`);
  if (step.view.ending) { write(renderEnding(step.view.ending)); write(step.view.ending === 'unwitnessed' ? 'r rewinds to the last warning · new begins another November · q keeps this ending' : 'new begins another November · q keeps this ending'); }
  else write(renderChoices(step.view.choices).text);
  persist();
  if (step.view.choices.some(c => c.stakes === 'major')) input.discardTypeAhead();
};
try {
  render(step);
  for (;;) {
    if (step.view.input === 'name' && !step.state.flags['player:name']) {
      const name = await input.next('A name you want to try (or q to leave): ');
      if (!name || name === 'q') break;
      try { render(advance(content, step.state, { kind: 'name', name })); } catch { write('Use 1–40 characters.'); }
      continue;
    }
    const answer = (await input.next('number chooses · o# looks closer · n notebook · h recent pages · m opportunities · l Barb’s book · q quit\n> '))?.trim();
    if (answer === undefined || answer.toLowerCase() === 'q') break;
    const key = answer.toLowerCase();
    if (key === 'l') { write(renderLedger(step.state)); continue; }
    if (key === 'n') { for (const e of notebookEntries(step.state)) write(`${e.kind}: ${e.title}\n${e.text}\n`); continue; }
    if (key === 'h') { for (const h of history.slice(-12)) write(renderParagraphs(h.lines)); continue; }
    if (key === 'm') { write(renderChoices(step.view.choices).text); continue; }
    if (step.view.ending) {
      if (key === 'r' && step.view.ending === 'unwitnessed') {
        const checkpoint = loadSave(rewind);
        if (checkpoint && ['r20-warning', 'r22-warning'].includes(checkpoint.sceneId)) { const index = history.map(h => h.scene).lastIndexOf(checkpoint.sceneId); history = index < 0 ? [] : history.slice(0, index + 1); render(resumeScene(content, checkpoint)); }
      } else if (key === 'new') { history = []; rmSync(rewind, { force: true }); render(advance(content, initialState(1971, REVISED_OPENING_SCENE), { kind: 'enter' })); }
      else write(step.view.ending === 'unwitnessed' ? 'r rewinds to the last warning · new begins another November · q keeps this ending' : 'new begins another November · q keeps this ending');
      continue;
    }
    if (/^o\d+$/.test(key)) {
      const item = step.view.observations?.[Number(key.slice(1)) - 1];
      if (item) { step = advance(content, step.state, { kind: 'inspect', observationId: item.id }); write(item.text); persist(); }
      continue;
    }
    const choice = step.view.choices.filter(c => !c.locked)[Number(key) - 1];
    if (choice) render(advance(content, step.state, { kind: 'choose', choiceId: choice.id }));
  }
} finally { persist(); rl.close(); audio.stop(); }
