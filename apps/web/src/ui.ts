/**
 * DOM rendering for the ledger. Scenes render as entries in Maud's ledger:
 * a faint 'DAY N — SLOT' rule, prose paragraphs revealed word-by-word
 * (skippable on click, instant under prefers-reduced-motion), then choices
 * as dash-prefixed ledger lines. Locked choices dim behind a '·'.
 */

import type { WorldState } from '@not-here/engine';
import { createBookLayer } from './book.ts';
import { loadSave } from './save.ts';
import { renderMarginSketch } from './sketches.ts';

const WORD_INTERVAL_MS = 26;
const CAPTION_LIFETIME_MS = 4000;

export interface ChoiceModel {
  readonly id: string;
  readonly label: string;
  readonly locked: boolean;
  readonly stakes?: 'major';
}

export interface SceneModel {
  readonly sceneId?: string;
  readonly header: string;
  readonly paragraphs: readonly string[];
  readonly choices: readonly ChoiceModel[];
  readonly ending?: string;
  /** Current world — Barb's book reads it; absent means no book this frame. */
  readonly world?: WorldState;
}

export interface UiCallbacks {
  readonly onChoose: (choiceId: string) => void;
  readonly onNewGame: () => void;
}

export interface Ui {
  readonly showTitle: (canResume: boolean, onBegin: (fresh: boolean) => void) => void;
  readonly renderScene: (model: SceneModel) => void;
  readonly addCaption: (text: string) => void;
}

const el = <K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className: string,
  text?: string,
): HTMLElementTagNameMap[K] => {
  const node = document.createElement(tag);
  node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
};

const prefersReducedMotion = (): boolean =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Paragraphs with this prefix are document artifacts: rendered verbatim. */
const DOC_PREFIX = '@doc:\n';

/** Split a paragraph into word spans; returns the spans for the typewriter. */
const buildParagraph = (text: string): { p: HTMLParagraphElement; words: HTMLSpanElement[] } => {
  const p = el('p', 'prose');
  const words: HTMLSpanElement[] = [];
  for (const word of text.split(/\s+/).filter((w) => w.length > 0)) {
    const span = el('span', 'w', word);
    words.push(span);
    p.append(span, ' ');
  }
  return { p, words };
};

const buildTitleScreen = (
  canResume: boolean,
  onBegin: (fresh: boolean) => void,
): HTMLElement => {
  const screen = el('section', 'title-screen');
  const name = el('h1', 'title-name', 'NOT HERE');
  const windowButton = el('button', 'lit-window');
  windowButton.type = 'button';
  windowButton.setAttribute(
    'aria-label',
    canResume ? 'The lamp is lit. Resume your ledger.' : 'The lamp is lit. Begin.',
  );
  const panes = el('span', 'panes');
  panes.setAttribute('aria-hidden', 'true');
  windowButton.append(panes);
  const hint = el('p', 'title-hint', 'the lamp is lit — click the window');
  screen.append(name, windowButton, hint);
  windowButton.addEventListener(
    'click',
    (event) => {
      // Don't let the starting click bubble into the first scene's
      // typewriter-skip listener.
      event.stopPropagation();
      onBegin(!canResume);
    },
    { once: true },
  );

  if (canResume) {
    const fresh = el('button', 'new-game-link', 'begin a new ledger instead');
    fresh.type = 'button';
    fresh.addEventListener(
      'click',
      (event) => {
        event.stopPropagation();
        onBegin(true);
      },
      { once: true },
    );
    screen.append(fresh);
  }
  return screen;
};

export const createUi = (root: HTMLElement, callbacks: UiCallbacks): Ui => {
  const page = el('main', 'page');
  const captions = el('div', 'captions');
  captions.setAttribute('aria-live', 'polite');
  root.append(page, captions);

  const addCaption = (text: string): void => {
    const note = el('p', 'caption', text);
    captions.append(note);
    window.setTimeout(() => {
      note.remove();
    }, CAPTION_LIFETIME_MS);
  };

  // Barb's book lives beside the page, never inside it: opening or closing
  // the overlay must not rebuild the scene, restart the typewriter, or
  // re-emit tells.
  const book = createBookLayer(root, { onExitBeat: addCaption });

  let cancelReveal: (() => void) | null = null;

  const finishReveal = (words: readonly HTMLSpanElement[], after: HTMLElement): void => {
    for (const w of words) w.classList.add('on');
    after.classList.add('shown');
    cancelReveal = null;
  };

  const startReveal = (words: readonly HTMLSpanElement[], after: HTMLElement): void => {
    cancelReveal?.();
    if (prefersReducedMotion() || words.length === 0) {
      finishReveal(words, after);
      return;
    }
    let index = 0;
    let timer = 0;
    const skip = (): void => finishRevealAndCleanup();
    const finishRevealAndCleanup = (): void => {
      window.clearTimeout(timer);
      page.removeEventListener('click', skip);
      finishReveal(words, after);
    };
    const tick = (): void => {
      const word = words[index];
      if (word === undefined) {
        finishRevealAndCleanup();
        return;
      }
      word.classList.add('on');
      index += 1;
      timer = window.setTimeout(tick, WORD_INTERVAL_MS);
    };
    page.addEventListener('click', skip);
    cancelReveal = finishRevealAndCleanup;
    tick();
  };

  const buildChoices = (model: SceneModel): HTMLElement => {
    const list = el('ul', 'choices');
    for (const choice of model.choices) {
      const item = el('li', 'choice-line');
      const className = choice.stakes === 'major' ? 'choice major' : 'choice';
      if (choice.locked) {
        item.append(el('span', `${className} locked`, `· ${choice.label}`));
      } else {
        const button = el('button', className, `— ${choice.label}`);
        button.type = 'button';
        button.addEventListener('click', (event) => {
          event.stopPropagation();
          callbacks.onChoose(choice.id);
        });
        item.append(button);
      }
      list.append(item);
    }
    if (model.ending !== undefined) {
      const item = el('li', 'choice-line');
      const again = el('button', 'choice', '— Begin the ledger again.');
      again.type = 'button';
      again.addEventListener('click', (event) => {
        event.stopPropagation();
        callbacks.onNewGame();
      });
      item.append(el('p', 'ending-mark', '— the ledger closes here —'), again);
      list.append(item);
    }
    return list;
  };

  return {
    showTitle: (canResume, onBegin) => {
      cancelReveal?.();
      book.retire();
      page.replaceChildren(buildTitleScreen(canResume, onBegin));
    },

    renderScene: (model) => {
      cancelReveal?.();
      const header = el('header', 'slot-header', model.header);
      const entry = el('section', 'entry');
      const allWords: HTMLSpanElement[] = [];
      for (const paragraph of model.paragraphs) {
        if (paragraph.startsWith(DOC_PREFIX)) {
          entry.append(el('pre', 'doc', paragraph.slice(DOC_PREFIX.length)));
          continue;
        }
        const { p, words } = buildParagraph(paragraph);
        allWords.push(...words);
        entry.append(p);
      }
      const choices = buildChoices(model);
      page.replaceChildren(header, entry, choices);
      const sketch = renderMarginSketch(model.sceneId);
      if (sketch !== null) page.append(sketch);
      window.scrollTo({ top: 0 });
      // The book reads the world the model carries; failing that, the save
      // slot — main.ts persists every step before rendering, so it is
      // current by the time a scene draws.
      book.update(model.world ?? loadSave(window.localStorage));
      startReveal(allWords, choices);
    },

    addCaption,
  };
};
