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
 *   2. A DOM layer (createBookLayer) — a sibling overlay owned by ui.ts.
 *      Opening and closing never touches the prose page, so the typewriter
 *      is never re-triggered and no tells are re-emitted.
 *
 * Zero numerals anywhere on the page, ever.
 */

import type { WorldState } from '@not-here/engine';
import { buildBarbsBook, isBookUnlocked, staticTierFor } from '@not-here/story';

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
}

const EXIT_BEAT = 'the book goes back under the counter.';

const element = <K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className: string,
  text?: string,
): HTMLElementTagNameMap[K] => {
  const node = document.createElement(tag);
  node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
};

const sectionLabel = (text: string): HTMLElement =>
  element('p', 'book-section-label', text);

const buildPageElement = (page: BookPage): HTMLElement => {
  const panel = element('article', `book-page rot-${page.staticTier}`);
  panel.setAttribute('tabindex', '-1');

  panel.append(
    element('h2', 'book-title', 'BARB’S BOOK'),
    element('p', 'book-subtitle', 'double-inked, a steady hand, the guest’s page'),
  );

  const register = element('pre', 'doc book-register', page.registerDoc);
  panel.append(register);

  const hand = element('div', 'book-hand-lines');
  for (const line of page.observations) hand.append(element('p', 'book-entry', line));
  hand.append(element('p', 'book-entry book-static', page.staticLine));
  panel.append(hand);

  if (page.told.length > 0) {
    panel.append(sectionLabel('what you told her, night one'));
    const told = element('div', 'book-hand-lines');
    for (const line of page.told) told.append(element('p', 'book-entry book-quote', line));
    panel.append(told);
  }

  if (page.margins.length > 0) {
    panel.append(sectionLabel('margins, other hands'));
    const margins = element('div', 'book-hand-lines');
    for (const line of page.margins) {
      margins.append(element('p', 'book-entry', line));
    }
    panel.append(margins);
  }

  return panel;
};

export const createBookLayer = (root: HTMLElement, hooks: BookLayerHooks): BookLayer => {
  let world: WorldState | null = null;
  let unlocked = false;
  let unlockSeen: boolean | null = null;
  let open = false;
  let restoreFocus: HTMLElement | null = null;
  let currentPanel: HTMLElement | null = null;
  let currentClose: HTMLButtonElement | null = null;

  const button = element('button', 'book-consult', 'consult Barb’s book');
  button.type = 'button';
  button.hidden = true;
  button.setAttribute('aria-haspopup', 'dialog');
  button.setAttribute('aria-expanded', 'false');

  const overlay = element('div', 'book-overlay');
  overlay.hidden = true;
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-label', 'Barb’s book');

  root.append(button, overlay);
  const scenePage = root.querySelector<HTMLElement>('.page');

  const close = (withBeat: boolean): void => {
    if (!open) return;
    open = false;
    overlay.hidden = true;
    overlay.replaceChildren();
    button.setAttribute('aria-expanded', 'false');
    scenePage?.removeAttribute('inert');
    button.inert = false;
    if (withBeat) hooks.onExitBeat(EXIT_BEAT);
    // Give focus back to wherever the player left it — never the choices'
    // problem that the book was open.
    restoreFocus?.focus?.();
    restoreFocus = null;
    currentPanel = null;
    currentClose = null;
  };

  const openBook = (): void => {
    if (open || !unlocked || world === null) return;
    const page = buildBookPage(world);
    const panel = buildPageElement(page);
    const closeButton = element('button', 'book-close', 'close the book');
    closeButton.type = 'button';
    closeButton.addEventListener('click', (event) => {
      event.stopPropagation();
      close(true);
    });
    panel.prepend(closeButton);

    const active = document.activeElement;
    restoreFocus = active instanceof HTMLElement ? active : null;
    currentPanel = panel;
    currentClose = closeButton;
    overlay.replaceChildren(panel);
    overlay.hidden = false;
    open = true;
    button.setAttribute('aria-expanded', 'true');
    scenePage?.setAttribute('inert', '');
    button.inert = true;
    panel.focus();
  };

  button.addEventListener('click', (event) => {
    event.stopPropagation();
    openBook();
  });

  overlay.addEventListener('click', (event) => {
    // Click-outside closes; clicks on the page itself stay on the page.
    if (event.target === overlay) {
      event.stopPropagation();
      close(true);
    }
  });

  window.addEventListener('keydown', (event) => {
    if (event.metaKey || event.ctrlKey || event.altKey) return;
    if (event.key === 'Tab' && open && currentPanel !== null && currentClose !== null) {
      event.preventDefault();
      const active = document.activeElement;
      if (event.shiftKey) {
        (active === currentPanel ? currentClose : currentPanel).focus();
      } else {
        (active === currentClose ? currentPanel : currentClose).focus();
      }
      return;
    }
    if (event.key === 'Escape' && open) {
      event.preventDefault();
      close(true);
      return;
    }
    if (event.key === 'l' || event.key === 'L') {
      const target = event.target;
      if (
        target instanceof HTMLElement &&
        (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)
      ) {
        return;
      }
      if (open) {
        event.preventDefault();
        close(true);
      } else if (unlocked && world !== null) {
        event.preventDefault();
        openBook();
      }
    }
  });

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
    if (!unlocked) close(false);
  };

  const retire = (): void => {
    close(false);
    world = null;
    unlocked = false;
    unlockSeen = null;
    button.hidden = true;
    button.classList.remove('pulse');
  };

  return {
    update,
    retire,
    isOpen: () => open,
  };
};
