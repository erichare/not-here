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
import { createInterface, type Interface } from 'node:readline';
import { fileURLToPath } from 'node:url';
import {
  advance,
  initialState,
  type SlotId,
  type StepResult,
  type StoryContent,
  type WorldState,
} from '@not-here/engine';
import { buildContent, OPENING_SCENE } from '@not-here/story';
import { createAudioSink, type AudioSink } from './audio.ts';
import { renderLedger } from './ledger.ts';
import {
  clearScreen,
  degradeMargin,
  dim,
  renderChoices,
  renderEnding,
  renderHeader,
  renderParagraphs,
  warm,
} from './render.ts';
import { appendLedgerLine, loadSave, saveGame } from './save.ts';

const HERE = dirname(fileURLToPath(import.meta.url));
const AUDITIONS_DIR = join(HERE, '..', '..', '..', 'auditions');
const SAVE_PATH = join(cwd(), '.saves', 'slot1.json');
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

interface LineSource {
  /** Next input line; undefined once stdin closes (EOF, ctrl-d). */
  readonly next: (prompt: string) => Promise<string | undefined>;
}

/**
 * Buffered line reader. rl.question drops lines that arrive while no
 * question is pending — fatal for piped input, which lands in one chunk —
 * so every 'line' event is queued and consumed in order instead.
 */
const createLineSource = (rl: Interface): LineSource => {
  const queue: string[] = [];
  const waiters: ((line: string | undefined) => void)[] = [];
  let closed = false;
  rl.on('line', (line) => {
    const waiter = waiters.shift();
    if (waiter !== undefined) waiter(line);
    else queue.push(line);
  });
  rl.on('close', () => {
    closed = true;
    for (const waiter of waiters.splice(0)) waiter(undefined);
  });
  return {
    next: (prompt: string): Promise<string | undefined> => {
      const buffered = queue.shift();
      if (buffered !== undefined) return Promise.resolve(buffered);
      if (closed) return Promise.resolve(undefined);
      stdout.write(prompt);
      return new Promise((resolve) => {
        waiters.push(resolve);
      });
    },
  };
};

const slotOf = (content: StoryContent, state: WorldState): SlotId =>
  content.scenes.get(state.sceneId)?.slot ?? state.slot;

const trySave = (state: WorldState): void => {
  try {
    saveGame(state, SAVE_PATH);
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
): Promise<StepResult | undefined> => {
  for (;;) {
    const answer = await input.next(warm('> '));
    const key = answer?.trim().toLowerCase();
    if (key === undefined || key === 'q') {
      trySave(step.state);
      write(dim('Saved. The fog keeps your place.'));
      return undefined;
    }
    if (key === 'l') {
      stdout.write(clearScreen());
      write(renderLedger(step.state));
      write('');
      const back = await input.next(dim('(enter closes the book) '));
      if (back === undefined) {
        trySave(step.state);
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

const startingState = (content: StoryContent): WorldState => {
  const loaded = loadSave(SAVE_PATH);
  if (loaded !== undefined) {
    const scene = content.scenes.get(loaded.sceneId);
    // Resume mid-run; a save parked on an ending means a finished run.
    if (scene !== undefined && scene.ending === undefined) return loaded;
  }
  return initialState(parseSeed(env['NH_SEED']), OPENING_SCENE);
};

const runGame = async (input: LineSource, audio: AudioSink): Promise<void> => {
  const content = buildContent();
  let step = advance(content, startingState(content), { kind: 'enter' });
  // App-side flag (not engine state): the ledger hint prints exactly once,
  // under the first choice list after the Counter Interview (fix-04).
  let ledgerHintShown = false;

  for (;;) {
    const eventLines = audio.handle(step.events);
    if (step.events.some((event) => event.kind === 'save.autosave')) {
      trySave(step.state);
    }
    drawScene(content, step, eventLines);

    if (step.view.ending !== undefined) {
      write(renderEnding(step.view.ending));
      trySave(step.state);
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
      trySave(step.state);
      return;
    }

    const next = await promptLoop(input, content, step, rendered.openIds, redraw);
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
    await runGame(createLineSource(rl), audio);
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
