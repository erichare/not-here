/**
 * The title screen: the wordmark, the one lit window (the verb), the hint in
 * the mode's copy, and — only when a run is merely parked — the offer of a
 * fresh ledger. The weather (the wharf, its beam, the town's eleven
 * windows) is the stage's; the title adds nothing to it.
 */

import { NEW_LEDGER, TITLE_COPY, WORDMARK } from '../model/copy.ts';
import { el } from './dom.ts';

/** What the stored slot means for the title screen (pt2-fix-01). */
export type TitleMode = 'fresh' | 'resume' | 'held';

export interface TitleOptions {
  /** The NG+ subtitle, once a run has been completed on this device. */
  readonly subtitle?: string;
}

export const buildTitleScreen = (
  mode: TitleMode,
  onBegin: (fresh: boolean) => void,
  options: TitleOptions = {},
): HTMLElement => {
  const screen = el('section', 'title-screen');
  const name = el('h1', 'title-name', WORDMARK);
  const windowButton = el('button', 'lit-window');
  windowButton.type = 'button';
  windowButton.setAttribute('aria-label', TITLE_COPY[mode].aria);
  const panes = el('span', 'panes');
  panes.setAttribute('aria-hidden', 'true');
  windowButton.append(panes);
  const hint = el('p', 'title-hint', TITLE_COPY[mode].hint);
  screen.append(name);
  if (options.subtitle !== undefined) screen.append(el('p', 'title-subtitle', options.subtitle));
  screen.append(windowButton, hint);
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
    const fresh = el('button', 'new-game-link', NEW_LEDGER);
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
