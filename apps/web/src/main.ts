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
import { clearSave, persistSave, resumableSave } from './save.ts';
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

  const applyStep = (result: StepResult): void => {
    state = result.state;
    // Generous autosave: every step lands in storage, not just endings.
    persistSave(storage, result.state);
    for (const event of result.events) handleEvent(event);
    const model: SceneModel = {
      sceneId: result.state.sceneId,
      // Ending scenes carry no DAY header — the act is over, not a ninth day.
      header: result.view.ending === undefined ? headerFor(result.state) : '',
      paragraphs: result.view.paragraphs,
      choices: result.view.choices,
      // Barb's book reads the live world, not a stale save.
      world: result.state,
      ...(result.view.ending !== undefined ? { ending: result.view.ending } : {}),
    };
    ui.renderScene(model);
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

  // Mid-run saves resume; a save parked on an ending is a finished run
  // (mirrors the CLI — resume must never trap the player on the act card).
  ui.showTitle(resumableSave(storage, content.scenes) !== null, (fresh) => {
    void audio.start().catch(() => {
      // Audio stays silent (tier-3); the story does not.
    });
    if (fresh) {
      newGame();
      return;
    }
    const saved = resumableSave(storage, content.scenes);
    if (saved !== null) state = saved;
    enter();
  });
};

const root = document.querySelector<HTMLElement>('#app');
if (root === null) {
  throw new Error('NOT HERE: missing #app mount point');
}
run(root);
