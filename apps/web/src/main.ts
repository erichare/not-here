/**
 * Boot + engine loop — identical shape to the CLI: initialState → advance
 * enter → render view → on choice click advance → render. The engine stays
 * pure; this file owns the single mutable binding to the current WorldState,
 * interprets events (music.cue/music.stop → audio, tell.visual → caption),
 * persists on EVERY step (generous autosave is a locked commitment — closing
 * the tab must never erase a run), starts the AudioContext on the
 * title-screen gesture, and derives the scene frame (stage, cast, rot,
 * presence, beat) once per step for the persistent regions.
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
import { PEN_HESITATES } from './model/copy.ts';
import { deriveSceneFrame } from './model/derive.ts';
import { completedEndings, NG_PLUS_SUBTITLE, recordEnding } from './model/endings.ts';
import { headerFor } from './model/frame-model.ts';
import {
  captionPolicy,
  cssVarsFor,
  effectiveMotion,
  loadSettings,
  type Settings,
} from './model/settings-model.ts';
import {
  appendEntry,
  loadTranscript,
  markChosen,
  saveTranscript,
} from './model/transcript.ts';
import {
  ACT_BOUNDARY_ENDINGS,
  classifyLaunch,
  clearSave,
  persistSave,
  resumeStep,
  saveMargin,
} from './save.ts';
import { prefersReducedMotion, setVars } from './ui/dom.ts';
import { createUi, type SceneModel, type Ui } from './ui.ts';
import './styles/index.css';

const freshSeed = (): number => (Date.now() ^ Math.floor(Math.random() * 0xffffffff)) >>> 0;

/** Apply the lamp's settings to the document: type scale, pace, motion. */
const applySettings = (settings: Settings): void => {
  setVars(document.documentElement, cssVarsFor(settings));
  document.documentElement.dataset['motion'] = effectiveMotion(settings, prefersReducedMotion());
};

const run = (root: HTMLElement): void => {
  const content = buildContent();
  const storage = window.localStorage;
  let state: WorldState = initialState(freshSeed(), OPENING_SCENE);
  let settings = loadSettings(storage);
  applySettings(settings);

  const audio = createAudioPlayer((cue) => ui.addCaption(cueCaptionLine(cue)));
  audio.setVolume(settings.volume);
  audio.setMuted(settings.muted);

  const slotFor = (next: WorldState): string =>
    content.scenes.get(next.sceneId)?.slot ?? next.slot;

  const handleEvent = (event: EngineEvent): void => {
    switch (event.kind) {
      case 'music.cue':
        audio.cue(event.cue);
        // Muted players get the cue line the CLI always prints.
        if (captionPolicy(settings) === 'always') ui.addCaption(cueCaptionLine(event.cue));
        break;
      case 'music.stop':
        // The silence is the score: nothing plays until the next cue.
        audio.stop();
        break;
      case 'music.layer':
        audio.layer(event.pattern, event.gain);
        break;
      case 'music.chord':
        audio.chord(event.fragments);
        break;
      case 'music.detune':
        audio.detune(event.pattern, event.cents);
        break;
      case 'tell.visual':
        ui.addCaption(event.text);
        break;
      default:
        // save.autosave is subsumed by the persist-every-step below;
        // stat.changed / music.static are derived from the post-step world
        // (deriveSceneFrame), never replayed per event; stinger / glyphrot
        // are not emitted by content today.
        break;
    }
  };

  /** Render a step without touching storage — the held card's path. */
  const renderStep = (result: StepResult): void => {
    state = result.state;
    for (const event of result.events) handleEvent(event);
    const ending = result.view.ending;
    const frame = deriveSceneFrame({
      content,
      state: result.state,
      events: result.events,
      ensemble: audio.snapshot(),
      heldEndings: ACT_BOUNDARY_ENDINGS,
      choices: result.view.choices,
    });
    const model: SceneModel = {
      sceneId: result.state.sceneId,
      // The slot drives the page's ambient grade (ui.ts keys body[data-slot]).
      slot: slotFor(result.state),
      // Ending scenes carry no DAY header — the act is over, not a ninth day.
      header: ending === undefined ? headerFor(result.state.day, slotFor(result.state)) : '',
      paragraphs: result.view.paragraphs,
      choices: result.view.choices,
      // Barb's book reads the live world, not a stale save.
      world: result.state,
      frame,
      ...(ending !== undefined ? { ending } : {}),
      // An act-boundary card is a held place (pt2-fix-01): no reset offer.
      ...(ending !== undefined && ACT_BOUNDARY_ENDINGS.has(ending) ? { held: true } : {}),
    };
    lastChoices = model.choices.map((c) => ({ id: c.id, label: c.label }));
    ui.renderScene(model);
  };

  /** The ledger so far: append this step's entry after the save lands. */
  const recordEntry = (result: StepResult): void => {
    const ending = result.view.ending;
    const transcript = appendEntry(loadTranscript(storage), {
      scene: result.state.sceneId,
      day: result.state.day,
      slot: slotFor(result.state),
      header: ending === undefined ? headerFor(result.state.day, slotFor(result.state)) : '',
      paragraphs: result.view.paragraphs,
      ...(ending !== undefined ? { ending } : {}),
    });
    saveTranscript(storage, transcript);
    if (ending !== undefined && !ACT_BOUNDARY_ENDINGS.has(ending)) recordEnding(storage, ending);
  };

  const applyStep = (result: StepResult): void => {
    // Generous autosave: every step lands in storage, not just endings.
    persistSave(storage, result.state);
    // The step's events ride along so a resumed screen can replay its
    // margin lines complete (pt2-fix-04). Non-fatal by design.
    saveMargin(storage, result.state.sceneId, result.events);
    recordEntry(result);
    renderStep(result);
  };

  const enter = (): void => {
    applyStep(advance(content, state, { kind: 'enter' }));
  };

  /** The latest open choices by id, so a chosen label can be recorded. */
  let lastChoices: readonly { id: string; label: string }[] = [];

  const choose = (choiceId: string): void => {
    try {
      const label = lastChoices.find((c) => c.id === choiceId)?.label;
      if (label !== undefined) {
        saveTranscript(storage, markChosen(loadTranscript(storage), state.sceneId, label));
      }
      applyStep(advance(content, state, { kind: 'choose', choiceId }));
    } catch (error: unknown) {
      // A locked/stale choice click; the ledger simply declines to move.
      ui.addCaption(PEN_HESITATES);
      console.error('advance failed', error);
    }
  };

  const newGame = (): void => {
    clearSave(storage);
    state = initialState(freshSeed(), OPENING_SCENE);
    enter();
  };

  const ui: Ui = createUi(root, {
    onChoose: choose,
    onNewGame: newGame,
    wordIntervalMs: () => settings.revealMs,
  });

  // Mid-run saves resume; a save parked on a true ending is a finished run;
  // a save parked on an act boundary is a HELD place (pt2-fix-01) — Act 3
  // inherits its flags, so nothing on that path may clear or overwrite it.
  const subtitle = completedEndings(storage).length > 0 ? NG_PLUS_SUBTITLE : undefined;
  ui.showTitle(
    classifyLaunch(storage, content.scenes).kind,
    (fresh) => {
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
    },
    subtitle,
  );

  // Settings may change under us later (phase 7 adds the lamp's controls);
  // keep the binding reachable for that wiring.
  void ((next: Settings) => {
    settings = next;
    applySettings(settings);
    audio.setVolume(settings.volume);
    audio.setMuted(settings.muted);
  });
};

const root = document.querySelector<HTMLElement>('#app');
if (root === null) {
  throw new Error('NOT HERE: missing #app mount point');
}
run(root);
