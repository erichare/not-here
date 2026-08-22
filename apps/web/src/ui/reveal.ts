/**
 * The word-by-word reveal: prose arrives a word at a time (each `.w` span
 * gets `.on`; CSS fades it), document artifacts and sketches as one item
 * each; a click on the page skips to the end; under motion-off it is
 * instant. Choices stay inert and hidden until the reveal is done — then
 * `after` is shown and the number keys are armed.
 */

import { motionOff } from './dom.ts';

export const WORD_INTERVAL_MS = 26;
export const ARTIFACT_PAUSE_MS = 180;

export interface RevealItem {
  readonly node: HTMLElement;
  readonly delayMs: number;
}

export interface Revealer {
  readonly start: (items: readonly RevealItem[], after: HTMLElement, onDone: () => void) => void;
  readonly cancel: () => void;
}

export interface RevealerOptions {
  /** Elements a click on which skips the reveal (the page; later the stage). */
  readonly skipTargets: readonly HTMLElement[];
  /** Milliseconds per word — the lamp's pace; 0 means at once. */
  readonly wordIntervalMs: () => number;
}

export const createRevealer = (options: RevealerOptions): Revealer => {
  let cancelCurrent: (() => void) | null = null;

  const finish = (items: readonly RevealItem[], after: HTMLElement, onDone: () => void): void => {
    for (const item of items) item.node.classList.add('on');
    after.inert = false;
    after.setAttribute('aria-hidden', 'false');
    after.classList.add('shown');
    cancelCurrent = null;
    onDone();
  };

  const start: Revealer['start'] = (items, after, onDone) => {
    cancelCurrent?.();
    const perWord = options.wordIntervalMs();
    if (motionOff() || perWord <= 0 || items.length === 0) {
      finish(items, after, onDone);
      return;
    }
    let index = 0;
    let timer = 0;
    const cleanup = (): void => {
      window.clearTimeout(timer);
      for (const target of options.skipTargets) target.removeEventListener('click', skip);
    };
    const skip = (): void => {
      cleanup();
      finish(items, after, onDone);
    };
    const tick = (): void => {
      const item = items[index];
      if (item === undefined) {
        skip();
        return;
      }
      item.node.classList.add('on');
      index += 1;
      // Word items scale with the lamp's pace; artifacts keep their beat.
      const delay = item.delayMs === WORD_INTERVAL_MS ? perWord : item.delayMs;
      timer = window.setTimeout(tick, delay);
    };
    for (const target of options.skipTargets) target.addEventListener('click', skip);
    cancelCurrent = () => {
      cleanup();
      cancelCurrent = null;
    };
    tick();
  };

  return {
    start,
    cancel: () => {
      cancelCurrent?.();
    },
  };
};
