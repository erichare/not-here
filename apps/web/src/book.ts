/**
 * BARB'S BOOK — the character sheet, fully diegetic (design/barbs-book-spec.md).
 * One lit ledger page over dimmed prose; everything in Barb's hand.
 *
 * Two halves:
 *   1. A pure page model (isBookUnlocked / buildBookPage) — no DOM, unit-
 *      testable. The page CONTENT is the shared model in @not-here/story
 *      (barbs-book.ts): one source of truth for both builds, per the spec's
 *      CLI PARITY rule. This half only re-exports it plus web-only shaping
 *      (the register box, the StaticTier used as a CSS rot class).
 *   2. A DOM layer (createBookLayer) — a sibling overlay on ui/overlay.ts.
 *      Opening and closing never touches the prose page, so the typewriter
 *      is never re-triggered and no tells are re-emitted.
 *
 * Zero numerals anywhere on the page, ever.
 */

import type { WorldState } from '@not-here/engine';
import { buildBarbsBook, isBookUnlocked, staticTierFor } from '@not-here/story';
import { BOOK } from './model/copy.ts';
import { el } from './ui/dom.ts';
import { createOverlay, type OverlayPanel } from './ui/overlay.ts';

export { isBookUnlocked, staticTierFor };
export { observationFor, staticLineFor, type StaticTier } from '@not-here/story';

// ---------------------------------------------------------------------------
// Pure page model — entirely the shared @not-here/story model. The web build
// adds NOTHING: content, register box, and rot tier all come from one source
// of truth (CLI parity, per the spec).
// ---------------------------------------------------------------------------

export interface BookPage {
  /** The register entry, a verbatim document block (monospace box). */
  readonly registerDoc: string;
  /** One line per stat, in Barb's hand. */
  readonly observations: readonly string[];
  /** The single STATIC line. */
  readonly staticLine: string;
  /** The interview answers, quoted verbatim in the player's own words. */
  readonly told: readonly string[];
  /** Margins, other hands — facts Barb witnessed or gossip reached her. */
  readonly margins: readonly string[];
  readonly staticTier: ReturnType<typeof staticTierFor>;
}

export const buildBookPage = (state: WorldState): BookPage => {
  const book = buildBarbsBook(state);
  return {
    registerDoc: book.registerDoc,
    observations: book.observations,
    staticLine: book.staticLine,
    told: book.truths,
    margins: book.heldFacts,
    staticTier: book.staticTier,
  };
};

// ---------------------------------------------------------------------------
// DOM layer — sibling overlay, never a re-render of the prose page
// ---------------------------------------------------------------------------

export interface BookLayer {
  /** Called on every renderScene with the current world (null = unknown). */
  readonly update: (world: WorldState | null) => void;
  /** Title screen / teardown: hide the button, close the page. */
  readonly retire: () => void;
  readonly isOpen: () => boolean;
}

export interface BookLayerHooks {
  /** The one-line exit beat, surfaced as a caption by ui.ts. */
  readonly onExitBeat: (text: string) => void;
  /** The regions an open book makes inert. */
  readonly inertTargets: readonly HTMLElement[];
}

const sectionLabel = (text: string): HTMLElement => el('p', 'book-section-label', text);

const buildPageElement = (page: BookPage): HTMLElement => {
  const panel = el('article', `book-page rot-${page.staticTier}`);
  panel.setAttribute('tabindex', '-1');

  panel.append(el('h2', 'book-title', BOOK.title), el('p', 'book-subtitle', BOOK.subtitle));

  const register = el('pre', 'doc book-register', page.registerDoc);
  panel.append(register);

  const hand = el('div', 'book-hand-lines');
  for (const line of page.observations) hand.append(el('p', 'book-entry', line));
  hand.append(el('p', 'book-entry book-static', page.staticLine));
  panel.append(hand);

  if (page.told.length > 0) {
    panel.append(sectionLabel(BOOK.told));
    const told = el('div', 'book-hand-lines');
    for (const line of page.told) told.append(el('p', 'book-entry book-quote', line));
    panel.append(told);
  }

  if (page.margins.length > 0) {
    panel.append(sectionLabel(BOOK.margins));
    const margins = el('div', 'book-hand-lines');
    for (const line of page.margins) margins.append(el('p', 'book-entry', line));
    panel.append(margins);
  }

  return panel;
};

export const createBookLayer = (host: HTMLElement, hooks: BookLayerHooks): BookLayer => {
  let world: WorldState | null = null;
  let unlocked = false;
  let unlockSeen: boolean | null = null;

  const button = el('button', 'book-consult', BOOK.consult);
  button.type = 'button';
  button.hidden = true;
  button.setAttribute('aria-haspopup', 'dialog');
  button.setAttribute('aria-expanded', 'false');
  host.append(button);

  const overlay = createOverlay({
    host,
    className: 'book-overlay',
    label: BOOK.aria,
    hotkey: 'l',
    inertTargets: hooks.inertTargets,
    onExitBeat: () => {
      button.setAttribute('aria-expanded', 'false');
      button.inert = false;
      hooks.onExitBeat(BOOK.exitBeat);
    },
    canOpen: () => unlocked && world !== null,
    build: () => build(),
  });

  const build = (): OverlayPanel => {
    if (world === null) throw new Error('NOT HERE: the book has no world to read');
    const panel = buildPageElement(buildBookPage(world));
    const close = el('button', 'book-close', BOOK.close);
    close.type = 'button';
    panel.prepend(close);
    button.setAttribute('aria-expanded', 'true');
    button.inert = true;
    return { panel, close };
  };

  const openBook = (): void => {
    if (overlay.isOpen() || !unlocked || world === null) return;
    overlay.open(build);
  };

  button.addEventListener('click', (event) => {
    event.stopPropagation();
    openBook();
  });

  const closeQuiet = (): void => {
    if (!overlay.isOpen()) return;
    overlay.close(false);
    button.setAttribute('aria-expanded', 'false');
    button.inert = false;
  };

  const update = (next: WorldState | null): void => {
    world = next;
    unlocked = next !== null && isBookUnlocked(next);
    const wasUnlocked = unlockSeen;
    unlockSeen = unlocked;
    button.hidden = !unlocked;
    // One pulse, exactly at the unlock moment — never on resume, never again.
    if (unlocked && wasUnlocked === false) {
      button.classList.add('pulse');
      button.addEventListener(
        'animationend',
        () => {
          button.classList.remove('pulse');
        },
        { once: true },
      );
    }
    if (!unlocked) closeQuiet();
  };

  const retire = (): void => {
    closeQuiet();
    world = null;
    unlocked = false;
    unlockSeen = null;
    button.hidden = true;
    button.classList.remove('pulse');
  };

  return { update, retire, isOpen: overlay.isOpen };
};
