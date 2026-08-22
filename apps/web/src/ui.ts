/**
 * The UI façade: composes the persistent skeleton — the stage, the frame,
 * the reading column, the margin rail, the book, the captions — into the
 * verbs main.ts speaks. Scenes render as entries in Barb's ledger on cold
 * glass in front of the place; the frame carries the day; the margin
 * carries whoever is in the room. Only the page's children are replaced
 * per scene; everything else is updated in place.
 */

import type { WorldState } from '@not-here/engine';
import { createBookLayer } from './book.ts';
import type { SceneFrame } from './model/derive.ts';
import { loadSave } from './save.ts';
import { createCaptions } from './ui/captions.ts';
import { armChoiceKeys, type ChoiceModel } from './ui/choices.ts';
import { createFrame } from './ui/frame.ts';
import { createMargin } from './ui/margin.ts';
import { createRevealer, WORD_INTERVAL_MS } from './ui/reveal.ts';
import { renderEntry } from './ui/scene.ts';
import { buildSkeleton } from './ui/skeleton.ts';
import { createStage } from './ui/stage/index.ts';
import { buildTitleScreen, type TitleMode } from './ui/title.ts';
import type { StageModel } from './model/stage-model.ts';

/** The title's weather: night, fog, nothing named. */
const TITLE_STAGE: StageModel = {
  place: 'ambient',
  slot: 'night',
  presence: 1,
  rotTier: 'clear',
  fragments: [],
  horn: 'unknown',
};

export type { ChoiceModel, TitleMode };

export interface SceneModel {
  readonly sceneId?: string;
  readonly header: string;
  readonly paragraphs: readonly string[];
  readonly choices: readonly ChoiceModel[];
  readonly ending?: string;
  /** Act-boundary card (pt2-fix-01): the run is parked, not finished. */
  readonly held?: boolean;
  /** Current world — Barb's book reads it; absent means no book this frame. */
  readonly world?: WorldState;
  /** Time-of-day slot — the stage's ambient grade keys off it. */
  readonly slot?: string;
  /** Everything the persistent regions need (stage, frame, margin, FX). */
  readonly frame?: SceneFrame;
}

export interface UiCallbacks {
  readonly onChoose: (choiceId: string) => void;
  readonly onNewGame: () => void;
  /** Milliseconds per revealed word — the lamp's pace (0 = at once). */
  readonly wordIntervalMs?: () => number;
}

export interface Ui {
  readonly showTitle: (mode: TitleMode, onBegin: (fresh: boolean) => void, subtitle?: string) => void;
  readonly renderScene: (model: SceneModel) => void;
  readonly addCaption: (text: string) => void;
  /** Transient FX: the detune's silent twin on a sketch; stage beats. */
  readonly beat: (kind: 'detune' | 'stinger', detail?: string) => void;
  readonly pause: () => void;
  readonly resume: () => void;
}

export const createUi = (root: HTMLElement, callbacks: UiCallbacks): Ui => {
  const skeleton = buildSkeleton(root);
  const { page } = skeleton;
  const captions = createCaptions(skeleton.captions);
  const stage = createStage(skeleton.stage);
  const frame = createFrame(skeleton.frame);
  const margin = createMargin(skeleton.margin);

  // Barb's book lives beside the page, never inside it: opening or closing
  // the overlay must not rebuild the scene, restart the typewriter, or
  // re-emit tells. Its button sits in the frame.
  const book = createBookLayer(skeleton.overlays, {
    onExitBeat: captions.add,
    inertTargets: skeleton.inertTargets,
    buttonHost: frame.nav,
    barHost: frame.bar,
  });

  const revealer = createRevealer({
    skipTargets: [page, skeleton.stage],
    wordIntervalMs: callbacks.wordIntervalMs ?? (() => WORD_INTERVAL_MS),
  });
  let cancelChoiceKeys: (() => void) | null = null;

  return {
    showTitle: (mode, onBegin, subtitle) => {
      revealer.cancel();
      cancelChoiceKeys?.();
      cancelChoiceKeys = null;
      book.retire();
      frame.hide();
      margin.clear();
      stage.set(TITLE_STAGE);
      page.className = 'page title-page';
      page.removeAttribute('data-scene');
      delete document.body.dataset['slot'];
      page.replaceChildren(buildTitleScreen(mode, onBegin, subtitle === undefined ? {} : { subtitle }));
    },

    renderScene: (model) => {
      revealer.cancel();
      cancelChoiceKeys?.();
      cancelChoiceKeys = null;
      const sceneFrame = model.frame;
      page.className = model.ending === undefined ? 'page scene-page' : 'page ending-page';
      if (model.sceneId === undefined) page.removeAttribute('data-scene');
      else page.dataset['scene'] = model.sceneId;
      if (model.ending === undefined && model.slot !== undefined) document.body.dataset['slot'] = model.slot;
      else delete document.body.dataset['slot'];

      if (sceneFrame !== undefined) {
        stage.set(sceneFrame.stage);
        if (model.ending === undefined) frame.update(sceneFrame.frame);
        else frame.hide();
        margin.update(sceneFrame.sketches);
      } else {
        frame.hide();
        margin.clear();
      }

      const rot =
        sceneFrame !== undefined && model.world !== undefined
          ? { staticMeter: model.world.staticMeter, seed: model.world.rngState, plan: sceneFrame.rotPlan }
          : undefined;
      const rendered = renderEntry(model, callbacks, rot);
      page.replaceChildren(...rendered.children);
      window.scrollTo({ top: 0 });
      // The book reads the world the model carries; failing that, the save
      // slot — main.ts persists every step before rendering, so it is
      // current by the time a scene draws.
      book.update(model.world ?? loadSave(window.localStorage));
      revealer.start(rendered.revealItems, rendered.choices, () => {
        cancelChoiceKeys?.();
        cancelChoiceKeys = armChoiceKeys(rendered.choices);
      });
    },

    addCaption: captions.add,

    beat: (kind, detail) => {
      if (kind === 'detune' && detail !== undefined) margin.waver(detail);
      if (kind === 'stinger') stage.beat('stinger');
    },

    pause: stage.pause,
    resume: stage.resume,
  };
};
