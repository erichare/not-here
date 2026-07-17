/**
 * NOT HERE — terminal front-end for the Night-1 vertical slice.
 *
 *   node apps/cli/src/main.ts        (seed via NH_SEED, default 1971;
 *                                     NH_SILENT=1 skips afplay)
 *
 * Keys: number = choose · l = consult the ledger · q = quit (saves).
 */

import { dirname, join } from 'node:path';
import { cwd, env, stderr, stdin, stdout } from 'node:process';
import { createInterface } from 'node:readline';
import { fileURLToPath } from 'node:url';
import {
  advance,
  initialState,
  resumeScene,
  type SlotId,
  type StepResult,
  type StoryContent,
  type WorldState,
} from '@not-here/engine';
import { buildContent, OPENING_SCENE } from '@not-here/story';
import { createAudioSink, type AudioSink } from './audio.ts';
import { createLineSource, promptFor, type LineSource } from './input.ts';
import { renderLedger } from './ledger.ts';
import {
  clearScreen,
  degradeMargin,
  dim,
  renderChoices,
  renderEnding,
  renderHeader,
  renderParagraphs,
} from './render.ts';
import {
  appendLedgerLine,
  classifySave,
  loadMargin,
  loadSave,
  saveGame,
  saveMargin,
} from './save.ts';

const HERE = dirname(fileURLToPath(import.meta.url));
const AUDITIONS_DIR = join(HERE, '..', '..', '..', 'auditions');
const SAVE_PATH = join(cwd(), '.saves', 'slot1.json');
const MARGIN_PATH = join(cwd(), '.saves', 'slot1.margin.json');
const LEDGER_PATH = join(cwd(), '.saves', 'barb-ledger.txt');
const DEFAULT_SEED = 1971;

const write = (text: string): void => {
  stdout.write(`${text}\n`);
};

const parseSeed = (raw: string | undefined): number => {
  if (raw === undefined || raw.trim() === '') return DEFAULT_SEED;
  const parsed = Number.parseInt(raw, 10);
  return Number.isNaN(parsed) ? DEFAULT_SEED : parsed;
};

const slotOf = (content: StoryContent, state: WorldState): SlotId =>
  content.scenes.get(state.sceneId)?.slot ?? state.slot;

const trySave = (step: StepResult): void => {
  try {
    saveGame(step.state, SAVE_PATH);
    // The step's events ride along so a resumed screen can re-print its
    // margin lines complete (pt2-fix-04). Non-fatal by design.
    saveMargin(step.state.sceneId, step.events, MARGIN_PATH);
  } catch (error: unknown) {
    const reason = error instanceof Error ? error.message : String(error);
    write(dim(`(could not save: ${reason})`));
  }
};

const drawScene = (
  content: StoryContent,
  step: StepResult,
  eventLines: readonly string[],
): void => {
  stdout.write(clearScreen());
  // Ending scenes carry no DAY header — the act is over, not a ninth day.
  if (step.view.ending === undefined) {
    write(renderHeader(step.state.day, slotOf(content, step.state)));
    write('');
  }
  write(renderParagraphs(step.view.paragraphs));
  write('');
  // Margin notes (captions, tells) sit under the prose they follow from —
  // and at high STATIC the fog gets into the margin ink, never the prose.
  for (const [index, line] of eventLines.entries()) {
    write(`  ${degradeMargin(line, step.state.staticMeter, step.state.rngState + index)}`);
  }
  if (eventLines.length > 0) write('');
};

const HINT = dim('a number chooses · l consults the ledger · q quits');

/** Barb's one lesson made visible: printed once, under the room's choices. */
const LEDGER_HINT = dim('l consults the ledger');

/** The scene the Counter Interview lands on — where the hint belongs. */
const LEDGER_HINT_SCENE = 'n1-room';

/** Read input until it yields the next step, or undefined to stop. */
const promptLoop = async (
  input: LineSource,
  content: StoryContent,
  step: StepResult,
  openIds: readonly string[],
  redraw: () => void,
  major: boolean,
): Promise<StepResult | undefined> => {
  for (;;) {
    const answer = await input.next(promptFor(major, input.interactive));
    const key = answer?.trim().toLowerCase();
    if (key === undefined || key === 'q') {
      trySave(step);
      write(dim('Saved. The fog keeps your place.'));
      return undefined;
    }
    if (key === 'l') {
      stdout.write(clearScreen());
      write(renderLedger(step.state));
      write('');
      const back = await input.next(dim('(enter closes the book) '));
      if (back === undefined) {
        trySave(step);
        return undefined;
      }
      redraw();
      continue;
    }
    const n = Number.parseInt(key, 10);
    const choiceId = Number.isNaN(n) ? undefined : openIds[n - 1];
    if (choiceId === undefined) {
      write(HINT);
      continue;
    }
    const label =
      step.view.choices.find((choice) => choice.id === choiceId)?.label ?? choiceId;
    appendLedgerLine(
      { day: step.state.day, slot: slotOf(content, step.state), label },
      LEDGER_PATH,
    );
    return advance(content, step.state, { kind: 'choose', choiceId });
  }
};

/**
 * Resume a loaded save without re-applying onEnter effects (pt2-fix-03) —
 * the save already holds the post-onEnter state; a re-enter would run the
 * nightly decay twice and swap the closing-paragraph variants. The margin
 * sidecar, when it matches, replays the events the first print carried so
 * the re-print is complete (pt2-fix-04).
 */
const resumeStep = (content: StoryContent, state: WorldState): StepResult => {
  const step = resumeScene(content, state);
  const margin = loadMargin(MARGIN_PATH);
  return margin !== undefined && margin.sceneId === state.sceneId
    ? { ...step, events: margin.events }
    : step;
};

/** The held-place card's one line — spoken in the game's register. */
const HELD_LINE = 'Your November is kept. The twenty-sixth is not written yet.';

const runGame = async (input: LineSource, audio: AudioSink): Promise<void> => {
  const content = buildContent();
  const loaded = loadSave(SAVE_PATH);
  const launch = classifySave(
    loaded,
    loaded === undefined ? undefined : content.scenes.get(loaded.sceneId),
  );

  if (launch.kind === 'held') {
    // pt2-fix-01: an act boundary is a held place, not a finished run —
    // Act 3 inherits this save's flags. Re-print the card and leave the
    // file exactly as it was: no prompt, no save, no fresh Day 1.
    const step = resumeStep(content, launch.state);
    drawScene(content, step, audio.handle(step.events));
    if (step.view.ending !== undefined) write(renderEnding(step.view.ending));
    write(dim(HELD_LINE));
    return;
  }

  let step =
    launch.kind === 'resume'
      ? resumeStep(content, launch.state)
      : advance(content, initialState(parseSeed(env['NH_SEED']), OPENING_SCENE), {
          kind: 'enter',
        });
  // App-side flag (not engine state): the ledger hint prints exactly once,
  // under the first choice list after the Counter Interview (fix-04).
  let ledgerHintShown = false;

  for (;;) {
    const eventLines = audio.handle(step.events);
    if (step.events.some((event) => event.kind === 'save.autosave')) {
      trySave(step);
    }
    drawScene(content, step, eventLines);

    if (step.view.ending !== undefined) {
      write(renderEnding(step.view.ending));
      trySave(step);
      return;
    }

    const rendered = renderChoices(step.view.choices);
    const showLedgerHint =
      !ledgerHintShown && step.state.sceneId === LEDGER_HINT_SCENE;
    if (showLedgerHint) ledgerHintShown = true;
    const redraw = (): void => {
      // The ledger redraw must not re-emit scene tell lines (fix-03).
      drawScene(content, step, []);
      write(rendered.text);
      write('');
    };
    write(rendered.text);
    if (showLedgerHint) write(`  ${LEDGER_HINT}`);
    write('');

    if (rendered.openIds.length === 0) {
      // Authored dead end without an ending marker — save and stop.
      trySave(step);
      return;
    }

    // pt2-fix-02: a major fork must be answered by someone who has seen
    // it — on a live terminal, blind type-ahead is forfeit at render time.
    const major = step.view.choices.some(
      (choice) => !choice.locked && choice.stakes === 'major',
    );
    if (major) input.discardTypeAhead();

    const next = await promptLoop(input, content, step, rendered.openIds, redraw, major);
    if (next === undefined) return;
    step = next;
  }
};

const main = async (): Promise<void> => {
  const rl = createInterface({ input: stdin, output: stdout });
  const audio = createAudioSink(AUDITIONS_DIR, {
    silent: env['NH_SILENT'] === '1',
  });
  try {
    await runGame(createLineSource(rl, { interactive: stdin.isTTY === true }), audio);
  } finally {
    rl.close();
    audio.stop();
  }
};

main().catch((error: unknown) => {
  const reason = error instanceof Error ? (error.stack ?? error.message) : String(error);
  stderr.write(`not-here: ${reason}\n`);
  process.exitCode = 1;
});
