/**
 * The captions channel — audio fallbacks and visual tells as short-lived
 * italic notes in the corner (aria-live, additions only).
 */

import { el } from './dom.ts';

export const CAPTION_LIFETIME_MS = 6500;

export interface Captions {
  readonly add: (text: string) => void;
}

export const createCaptions = (host: HTMLElement): Captions => ({
  add: (text) => {
    const note = el('p', 'caption', text);
    host.append(note);
    window.setTimeout(() => {
      note.remove();
    }, CAPTION_LIFETIME_MS);
  },
});
