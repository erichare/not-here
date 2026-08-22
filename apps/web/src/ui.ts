/**
 * The UI façade: composes the persistent skeleton, the revealer, the book,
 * and the captions into the three verbs main.ts speaks — showTitle,
 * renderScene, addCaption. Scenes render as entries in Barb's ledger: a
 * faint 'DAY N — SLOT' rule, prose revealed word-by-word (skippable on
 * click, instant under motion-off), then choices as dash-prefixed ledger
 * lines. Only the page's children are replaced per scene; everything else
 * is updated in place.
 */

import type { WorldState } from '@not-here/engine';
import { createBookLayer } from './book.ts';
import type { SceneFrame } from './model/derive.ts';
import { loadSave } from './save.ts';
import { createCaptions } from './ui/captions.ts';
import { armChoiceKeys, type ChoiceModel } from './ui/choices.ts';
import { createRevealer, WORD_INTERVAL_MS } from './ui/reveal.ts';
import { renderEntry } from './ui/scene.ts';
import { buildSkeleton } from './ui/skeleton.ts';
import { buildTitleScreen, type TitleMode } from './ui/title.ts';

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
  /** Time-of-day slot — the page's ambient grade keys off it (body[data-slot]). */
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
}

export const createUi = (root: HTMLElement, callbacks: UiCallbacks): Ui => {
  const skeleton = buildSkeleton(root);
  const { page, stage } = skeleton;
  const captions = createCaptions(skeleton.captions);

  // Barb's book lives beside the page, never inside it: opening or closing
  // the overlay must not rebuild the scene, restart the typewriter, or
  // re-emit tells.
  const book = createBookLayer(skeleton.overlays, {
    onExitBeat: captions.add,
    inertTargets: skeleton.inertTargets,
  });

  const revealer = createRevealer({
    skipTargets: [page],
    wordIntervalMs: callbacks.wordIntervalMs ?? (() => WORD_INTERVAL_MS),
  });
  let cancelChoiceKeys: (() => void) | null = null;

  const applyStage = (model: SceneModel): void => {
    // Invisible in phase 1 (no CSS reads these yet); the persistent stage
    // learns the place and hour so later phases only add styles.
    const frame = model.frame;
    if (frame === undefined) {
      delete stage.dataset['place'];
      delete stage.dataset['slot'];
      return;
    }
    stage.dataset['place'] = frame.stage.place;
    if (frame.stage.slot === 'none') delete stage.dataset['slot'];
    else stage.dataset['slot'] = frame.stage.slot;
  };

  return {
    showTitle: (mode, onBegin, subtitle) => {
      revealer.cancel();
      cancelChoiceKeys?.();
      cancelChoiceKeys = null;
      book.retire();
      page.className = 'page title-page';
      page.removeAttribute('data-scene');
      delete document.body.dataset['slot'];
      delete stage.dataset['place'];
      delete stage.dataset['slot'];
      page.replaceChildren(buildTitleScreen(mode, onBegin, subtitle === undefined ? {} : { subtitle }));
    },

    renderScene: (model) => {
      revealer.cancel();
      cancelChoiceKeys?.();
      cancelChoiceKeys = null;
      page.className = model.ending === undefined ? 'page scene-page' : 'page ending-page';
      if (model.sceneId === undefined) page.removeAttribute('data-scene');
      else page.dataset['scene'] = model.sceneId;
      // The ambient grade follows the scene's slot; endings take no grade.
      if (model.ending === undefined && model.slot !== undefined) document.body.dataset['slot'] = model.slot;
      else delete document.body.dataset['slot'];
      applyStage(model);

      const rendered = renderEntry(model, callbacks);
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
  };
};
