/**
 * The UI façade: composes the persistent skeleton — the stage, the frame,
 * the reading column, the margin rail, the book, the ledger-so-far, the
 * lamp, the captions, the 3:12 beat — into the verbs main.ts speaks.
 * Scenes render as entries in Barb's ledger on cold glass in front of the
 * place; the frame carries the day; the margin carries whoever is in the
 * room. Only the page's children are replaced per scene; everything else
 * is updated in place. Live choices pass through the turn (leave → beat →
 * render); resume and held paths render synchronously and replay nothing.
 */

import type { WorldState } from '@not-here/engine';
import { createBookLayer } from './book.ts';
import type { ThreeTwelveBeat } from './model/beats.ts';
import type { SceneFrame } from './model/derive.ts';
import type { Settings } from './model/settings-model.ts';
import type { StageModel } from './model/stage-model.ts';
import type { Transcript } from './model/transcript.ts';
import { loadSave } from './save.ts';
import { createCaptions } from './ui/captions.ts';
import { cardChrome } from './ui/cards.ts';
import { armChoiceKeys, type ChoiceModel } from './ui/choices.ts';
import { createFrame } from './ui/frame.ts';
import { createHistoryLayer } from './ui/history.ts';
import { createInterstitial } from './ui/interstitial.ts';
import { createMargin } from './ui/margin.ts';
import { createRevealer, WORD_INTERVAL_MS } from './ui/reveal.ts';
import { renderEntry } from './ui/scene.ts';
import { createSettingsLayer } from './ui/settings.ts';
import { buildSkeleton } from './ui/skeleton.ts';
import { createStage } from './ui/stage/index.ts';
import { buildTitleScreen, type TitleMode } from './ui/title.ts';
import { createTurnController } from './ui/turn.ts';

export type { ChoiceModel, TitleMode };

/** The title's weather: the wharf at night, the beam, the town's eleven windows. */
const TITLE_STAGE: StageModel = {
  place: 'wharf',
  slot: 'night',
  presence: 1,
  rotTier: 'clear',
  fragments: [],
  horn: 'unknown',
};

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
  /** The lamp: current settings and what to do when they change. */
  readonly settings?: { readonly get: () => Settings; readonly onChange: (next: Settings) => void };
  /** The ledger so far. */
  readonly transcript?: () => Transcript;
}

export interface Ui {
  readonly showTitle: (mode: TitleMode, onBegin: (fresh: boolean) => void, subtitle?: string) => void;
  /** Render synchronously — the resume and held paths. No beat, no turn. */
  readonly renderScene: (model: SceneModel) => void;
  /** The live path: leave the page, play the 3:12 beat if it is one, render. */
  readonly turn: (model: SceneModel, beat: ThreeTwelveBeat | null) => Promise<void>;
  readonly addCaption: (text: string) => void;
  /** Transient FX: the detune's silent twin on a sketch; stage beats. */
  readonly beat: (kind: 'detune' | 'stinger', detail?: string) => void;
  readonly pause: () => void;
  readonly resume: () => void;
  /** True while a turn is in flight — the ledger declines to move again. */
  readonly busy: () => boolean;
}

export const createUi = (root: HTMLElement, callbacks: UiCallbacks): Ui => {
  const skeleton = buildSkeleton(root);
  const { page } = skeleton;
  const captions = createCaptions(skeleton.captions);
  const stage = createStage(skeleton.stage);
  const frame = createFrame(skeleton.frame);
  const margin = createMargin(skeleton.margin);
  const interstitial = createInterstitial(skeleton.interstitial, stage);
  const turn = createTurnController(page, interstitial);

  // Barb's book lives beside the page, never inside it: opening or closing
  // the overlay must not rebuild the scene, restart the typewriter, or
  // re-emit tells. Its button sits in the frame, first among the margins.
  const book = createBookLayer(skeleton.overlays, {
    onExitBeat: captions.add,
    inertTargets: skeleton.inertTargets,
    buttonHost: frame.nav,
    barHost: frame.bar,
  });
  const history =
    callbacks.transcript === undefined
      ? null
      : createHistoryLayer(skeleton.overlays, {
          buttonHosts: [frame.nav, frame.bar],
          inertTargets: skeleton.inertTargets,
          load: callbacks.transcript,
        });
  const settings =
    callbacks.settings === undefined
      ? null
      : createSettingsLayer(skeleton.overlays, {
          buttonHosts: [frame.nav, frame.bar],
          inertTargets: skeleton.inertTargets,
          get: callbacks.settings.get,
          onChange: callbacks.settings.onChange,
        });

  const revealer = createRevealer({
    skipTargets: [page, skeleton.stage],
    wordIntervalMs: callbacks.wordIntervalMs ?? (() => WORD_INTERVAL_MS),
  });
  let cancelChoiceKeys: (() => void) | null = null;

  /** The reactive layer: presence and rot reach the whole page via #app. */
  const applyFx = (sceneFrame: SceneFrame | undefined): void => {
    if (sceneFrame === undefined) {
      root.style.setProperty('--presence', '1');
      delete root.dataset['presence'];
      delete root.dataset['rot'];
      return;
    }
    root.style.setProperty('--presence', String(sceneFrame.presence.value));
    root.dataset['presence'] = sceneFrame.presence.tier;
    root.dataset['rot'] = sceneFrame.rot.tier;
  };

  const render = (model: SceneModel): void => {
    revealer.cancel();
    cancelChoiceKeys?.();
    cancelChoiceKeys = null;
    const sceneFrame = model.frame;
    const card = sceneFrame?.card ?? null;
    const isCard = model.ending === undefined && (card === 'act' || card === 'held');
    page.className =
      model.ending === undefined ? (isCard ? 'page scene-page card-page' : 'page scene-page') : 'page ending-page';
    if (model.sceneId === undefined) page.removeAttribute('data-scene');
    else page.dataset['scene'] = model.sceneId;
    if (model.ending === undefined && model.slot !== undefined) document.body.dataset['slot'] = model.slot;
    else delete document.body.dataset['slot'];

    applyFx(sceneFrame);
    if (sceneFrame !== undefined) {
      stage.set(sceneFrame.stage);
      if (model.ending === undefined) frame.update(sceneFrame.frame);
      else frame.hide();
      margin.update(sceneFrame.sketches, sceneFrame.stage.fragments.length);
    } else {
      frame.hide();
      margin.clear();
    }
    history?.setAvailable(true);

    const rot =
      sceneFrame !== undefined && model.world !== undefined
        ? { staticMeter: model.world.staticMeter, seed: model.world.rngState, plan: sceneFrame.rotPlan }
        : undefined;
    const chrome = cardChrome(card, model.sceneId, model.ending);
    const entryModel = { ...model, paragraphs: model.paragraphs.filter((p) => !chrome.skip(p)) };
    const rendered = renderEntry(entryModel, callbacks, rot);
    page.replaceChildren(...chrome.above, ...rendered.children);
    window.scrollTo({ top: 0 });
    // The book reads the world the model carries; failing that, the save
    // slot — main.ts persists every step before rendering, so it is
    // current by the time a scene draws.
    book.update(model.world ?? loadSave(window.localStorage));
    revealer.start(rendered.revealItems, rendered.choices, () => {
      cancelChoiceKeys?.();
      cancelChoiceKeys = armChoiceKeys(rendered.choices);
    });
  };

  return {
    showTitle: (mode, onBegin, subtitle) => {
      revealer.cancel();
      cancelChoiceKeys?.();
      cancelChoiceKeys = null;
      book.retire();
      history?.retire();
      history?.setAvailable(false);
      settings?.retire();
      frame.hide();
      margin.clear();
      applyFx(undefined);
      stage.set(TITLE_STAGE);
      page.className = 'page title-page';
      page.removeAttribute('data-scene');
      delete document.body.dataset['slot'];
      page.replaceChildren(buildTitleScreen(mode, onBegin, subtitle === undefined ? {} : { subtitle }));
    },

    renderScene: render,

    turn: (model, beat) => turn.run(() => render(model), beat),

    addCaption: captions.add,

    beat: (kind, detail) => {
      if (kind === 'detune' && detail !== undefined) margin.waver(detail);
      if (kind === 'stinger') stage.beat('stinger');
    },

    pause: stage.pause,
    resume: stage.resume,
    busy: turn.busy,
  };
};
