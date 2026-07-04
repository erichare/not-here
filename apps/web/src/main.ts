/**
 * Boot + engine loop — identical shape to the CLI: initialState → advance
 * enter → render view → on choice click advance → render. The engine stays
 * pure; this file owns the single mutable binding to the current WorldState,
 * interprets events (music.cue → audio, tell.visual → caption,
 * save.autosave → localStorage), and starts the AudioContext on the
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
import { clearSave, hasSave, loadSave, persistSave } from './save.ts';
import { createUi, type SceneModel, type Ui } from './ui.ts';
import './styles.css';

const freshSeed = (): number => (Date.now() ^ Math.floor(Math.random() * 0xffffffff)) >>> 0;

const run = (root: HTMLElement): void => {
  const content = buildContent();
  const storage = window.localStorage;
  let state: WorldState = initialState(freshSeed(), OPENING_SCENE);

  const audio = createAudioPlayer((cue) => ui.addCaption(`♪ ${cue}`));

  const headerFor = (next: WorldState): string => {
    const slot = content.scenes.get(next.sceneId)?.slot ?? next.slot;
    return `DAY ${next.day} — ${slot.toUpperCase()}`;
  };

  const handleEvent = (event: EngineEvent, next: WorldState): void => {
    switch (event.kind) {
      case 'music.cue':
        audio.cue(event.cue);
        break;
      case 'tell.visual':
        ui.addCaption(event.text);
        break;
      case 'save.autosave':
        persistSave(storage, next);
        break;
      default:
        // Layering/stinger/fx events are tier-2 polish; ignored in this slice.
        break;
    }
  };

  const applyStep = (result: StepResult): void => {
    state = result.state;
    for (const event of result.events) handleEvent(event, result.state);
    const model: SceneModel = {
      header: headerFor(result.state),
      paragraphs: result.view.paragraphs,
      choices: result.view.choices,
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

  ui.showTitle(hasSave(storage), (fresh) => {
    void audio.start().catch(() => {
      // Audio stays silent (tier-3); the story does not.
    });
    if (fresh) {
      newGame();
      return;
    }
    const saved = loadSave(storage);
    if (saved !== null) state = saved;
    enter();
  });
};

const root = document.querySelector<HTMLElement>('#app');
if (root === null) {
  throw new Error('NOT HERE: missing #app mount point');
}
run(root);
