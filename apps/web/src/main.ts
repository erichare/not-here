/**
 * Boot + engine loop — identical shape to the CLI: initialState → advance
 * enter → render view → on choice click advance → render. The engine stays
 * pure; this file owns the single mutable binding to the current WorldState,
 * interprets events (music.cue/music.stop → audio, tell.visual → caption),
 * persists on EVERY step (generous autosave is a locked commitment — closing
 * the tab must never erase a run), and starts the AudioContext on the
 * title-screen gesture.
 */

import {
  advance,
  initialState,
  type EngineEvent,
  type StepResult,
  type WorldState,
} from '@not-here/engine';
import { buildContent, OPENING_SCENE } from '@not-here/story';
import { createAudioPlayer } from './audio.ts';
import { cueCaptionLine } from './cues.ts';
import {
  ACT_BOUNDARY_ENDINGS,
  classifyLaunch,
  clearSave,
  persistSave,
  resumeStep,
  saveMargin,
} from './save.ts';
import { createUi, type SceneModel, type Ui } from './ui.ts';
import './styles.css';

const freshSeed = (): number => (Date.now() ^ Math.floor(Math.random() * 0xffffffff)) >>> 0;

const run = (root: HTMLElement): void => {
  const content = buildContent();
  const storage = window.localStorage;
  let state: WorldState = initialState(freshSeed(), OPENING_SCENE);

  const audio = createAudioPlayer((cue) => ui.addCaption(cueCaptionLine(cue)));

  const headerFor = (next: WorldState): string => {
    const slot = content.scenes.get(next.sceneId)?.slot ?? next.slot;
    return `DAY ${next.day} — ${slot.toUpperCase()}`;
  };

  const handleEvent = (event: EngineEvent): void => {
    switch (event.kind) {
      case 'music.cue':
        audio.cue(event.cue);
        break;
      case 'music.stop':
        // The silence is the score: nothing plays until the next cue.
        audio.stop();
        break;
      case 'tell.visual':
        ui.addCaption(event.text);
        break;
      default:
        // save.autosave is subsumed by the persist-every-step below;
        // layering/stinger/fx events are tier-2 polish in this slice.
        break;
    }
  };

  /** Render a step without touching storage — the held card's path. */
  const renderStep = (result: StepResult): void => {
    state = result.state;
    for (const event of result.events) handleEvent(event);
    const ending = result.view.ending;
    const model: SceneModel = {
      sceneId: result.state.sceneId,
      // Ending scenes carry no DAY header — the act is over, not a ninth day.
      header: ending === undefined ? headerFor(result.state) : '',
      paragraphs: result.view.paragraphs,
      choices: result.view.choices,
      // Barb's book reads the live world, not a stale save.
      world: result.state,
      ...(ending !== undefined ? { ending } : {}),
      // An act-boundary card is a held place (pt2-fix-01): no reset offer.
      ...(ending !== undefined && ACT_BOUNDARY_ENDINGS.has(ending) ? { held: true } : {}),
    };
    ui.renderScene(model);
  };

  const applyStep = (result: StepResult): void => {
    // Generous autosave: every step lands in storage, not just endings.
    persistSave(storage, result.state);
    // The step's events ride along so a resumed screen can replay its
    // margin lines complete (pt2-fix-04). Non-fatal by design.
    saveMargin(storage, result.state.sceneId, result.events);
    renderStep(result);
  };

  const enter = (): void => {
    applyStep(advance(content, state, { kind: 'enter' }));
  };

  const choose = (choiceId: string): void => {
    try {
      applyStep(advance(content, state, { kind: 'choose', choiceId }));
    } catch (error: unknown) {
      // A locked/stale choice click; the ledger simply declines to move.
      ui.addCaption('the pen hesitates.');
      console.error('advance failed', error);
    }
  };

  const newGame = (): void => {
    clearSave(storage);
    state = initialState(freshSeed(), OPENING_SCENE);
    enter();
  };

  const ui: Ui = createUi(root, { onChoose: choose, onNewGame: newGame });

  // Mid-run saves resume; a save parked on a true ending is a finished run;
  // a save parked on an act boundary is a HELD place (pt2-fix-01) — Act 3
  // inherits its flags, so nothing on that path may clear or overwrite it.
  ui.showTitle(classifyLaunch(storage, content.scenes).kind, (fresh) => {
    void audio.start().catch(() => {
      // Audio stays silent (tier-3); the story does not.
    });
    if (fresh) {
      newGame();
      return;
    }
    // Re-classify at click time — the slot may have changed under the card.
    const launch = classifyLaunch(storage, content.scenes);
    if (launch.kind === 'fresh') {
      // The save vanished between the title card and the click.
      enter();
      return;
    }
    // pt2-fix-03: the save already holds the post-onEnter state — a
    // re-enter here would run nightly decay twice and swap state-keyed
    // prose variants between the pre-save render and this one.
    const step = resumeStep(content, launch.state, storage);
    if (launch.kind === 'held') {
      // pt2-fix-01: re-show the act card and leave storage exactly as it
      // was — no save, no margin rewrite, no fresh Day 1.
      renderStep(step);
      return;
    }
    applyStep(step);
  });
};

const root = document.querySelector<HTMLElement>('#app');
if (root === null) {
  throw new Error('NOT HERE: missing #app mount point');
}
run(root);
