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
const ARTIFACT_PAUSE_MS = 180;
const CAPTION_LIFETIME_MS = 6500;

interface RevealItem {
  readonly node: HTMLElement;
  readonly delayMs: number;
}

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
  /** Act-boundary card (pt2-fix-01): the run is parked, not finished. */
  readonly held?: boolean;
  /** Current world — Barb's book reads it; absent means no book this frame. */
  readonly world?: WorldState;
}

export interface UiCallbacks {
  readonly onChoose: (choiceId: string) => void;
  readonly onNewGame: () => void;
}

/** What the stored slot means for the title screen (pt2-fix-01). */
export type TitleMode = 'fresh' | 'resume' | 'held';

export interface Ui {
  readonly showTitle: (mode: TitleMode, onBegin: (fresh: boolean) => void) => void;
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

/** The held-place card's one line — spoken in the game's register. */
const HELD_LINE = 'Your November is kept. The twenty-seventh is not written yet.';

const TITLE_COPY: Record<TitleMode, { readonly aria: string; readonly hint: string }> = {
  fresh: {
    aria: 'The lamp is lit. Begin.',
    hint: 'the lamp is lit — click the window',
  },
  resume: {
    aria: 'The lamp is lit. Resume your ledger.',
    hint: 'the lamp is still lit — return to the ledger',
  },
  held: {
    aria: 'The lamp is lit. Your November is kept.',
    hint: 'the lamp is still lit — your November is kept',
  },
};

const buildTitleScreen = (
  mode: TitleMode,
  onBegin: (fresh: boolean) => void,
): HTMLElement => {
  const screen = el('section', 'title-screen');
  const name = el('h1', 'title-name', 'NOT HERE');
  const windowButton = el('button', 'lit-window');
  windowButton.type = 'button';
  windowButton.setAttribute('aria-label', TITLE_COPY[mode].aria);
  const panes = el('span', 'panes');
  panes.setAttribute('aria-hidden', 'true');
  windowButton.append(panes);
  const hint = el('p', 'title-hint', TITLE_COPY[mode].hint);
  screen.append(name, windowButton, hint);
  windowButton.addEventListener(
    'click',
    (event) => {
      // Don't let the starting click bubble into the first scene's
      // typewriter-skip listener.
      event.stopPropagation();
      onBegin(mode === 'fresh');
    },
    { once: true },
  );

  // pt2-fix-01: a held place offers no fresh start — nothing on this
  // screen may clear the storage Act Three inherits.
  if (mode === 'resume') {
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
  captions.setAttribute('aria-relevant', 'additions');
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

  const finishReveal = (items: readonly RevealItem[], after: HTMLElement): void => {
    for (const item of items) item.node.classList.add('on');
    after.inert = false;
    after.setAttribute('aria-hidden', 'false');
    after.classList.add('shown');
    cancelReveal = null;
  };

  const startReveal = (items: readonly RevealItem[], after: HTMLElement): void => {
    cancelReveal?.();
    if (prefersReducedMotion() || items.length === 0) {
      finishReveal(items, after);
      return;
    }
    let index = 0;
    let timer = 0;
    const skip = (): void => finishRevealAndCleanup();
    const finishRevealAndCleanup = (): void => {
      window.clearTimeout(timer);
      page.removeEventListener('click', skip);
      finishReveal(items, after);
    };
    const tick = (): void => {
      const item = items[index];
      if (item === undefined) {
        finishRevealAndCleanup();
        return;
      }
      item.node.classList.add('on');
      index += 1;
      timer = window.setTimeout(tick, item.delayMs);
    };
    page.addEventListener('click', skip);
    cancelReveal = finishRevealAndCleanup;
    tick();
  };

  const buildChoices = (model: SceneModel): HTMLElement => {
    const list = el('ul', 'choices');
    list.inert = true;
    list.setAttribute('aria-hidden', 'true');
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
      if (model.held === true) {
        // pt2-fix-01: an act boundary is a held place, not a close — no
        // reset offer; the next act inherits this ledger.
        item.append(
          el('p', 'ending-mark', '— the ledger waits here —'),
          el('p', 'held-line', HELD_LINE),
        );
      } else {
        const again = el('button', 'choice', '— Begin the ledger again.');
        again.type = 'button';
        again.addEventListener('click', (event) => {
          event.stopPropagation();
          callbacks.onNewGame();
        });
        item.append(el('p', 'ending-mark', '— the ledger closes here —'), again);
      }
      list.append(item);
    }
    return list;
  };

  return {
    showTitle: (mode, onBegin) => {
      cancelReveal?.();
      book.retire();
      page.className = 'page title-page';
      page.removeAttribute('data-scene');
      page.replaceChildren(buildTitleScreen(mode, onBegin));
    },

    renderScene: (model) => {
      cancelReveal?.();
      page.className = model.ending === undefined ? 'page scene-page' : 'page ending-page';
      if (model.sceneId === undefined) page.removeAttribute('data-scene');
      else page.dataset.scene = model.sceneId;

      const header = model.header.length > 0 ? el('header', 'slot-header', model.header) : null;
      const entry = el('section', 'entry');
      const revealItems: RevealItem[] = [];
      for (const paragraph of model.paragraphs) {
        if (paragraph.startsWith(DOC_PREFIX)) {
          const document = el('pre', 'doc', paragraph.slice(DOC_PREFIX.length));
          entry.append(document);
          revealItems.push({ node: document, delayMs: ARTIFACT_PAUSE_MS });
          continue;
        }
        const { p, words } = buildParagraph(paragraph);
        revealItems.push(...words.map((node) => ({ node, delayMs: WORD_INTERVAL_MS })));
        entry.append(p);
      }
      const choices = buildChoices(model);
      const sketch = renderMarginSketch(model.sceneId);
      const children: HTMLElement[] = [];
      if (header !== null) children.push(header);
      children.push(entry);
      if (sketch !== null) {
        children.push(sketch);
        revealItems.push({ node: sketch, delayMs: ARTIFACT_PAUSE_MS });
      }
      children.push(choices);
      page.replaceChildren(...children);
      window.scrollTo({ top: 0 });
      // The book reads the world the model carries; failing that, the save
      // slot — main.ts persists every step before rendering, so it is
      // current by the time a scene draws.
      book.update(model.world ?? loadSave(window.localStorage));
      startReveal(revealItems, choices);
    },

    addCaption,
  };
};
