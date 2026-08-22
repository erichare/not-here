/**
 * The margin rail — the ink sketch of whoever is in the room, drawn in the
 * margin of Barb's book. Speaker-aware (model/cast.ts decides who, and the
 * first-meeting gate decides whether), trust-faded, and it wavers once on a
 * lie (the silent twin of the detune). Wren's frame never fades, never
 * wavers. On a phone the rail sits above the entry, small and right-aligned.
 */

import type { VisibleSketch } from '../model/cast.ts';
import { sketchSvg } from '../sketches.ts';
import { el } from './dom.ts';

export interface Margin {
  readonly update: (sketches: readonly VisibleSketch[]) => void;
  /** The detune twin: the named character's sketch wavers once. */
  readonly waver: (who: string) => void;
  readonly clear: () => void;
}

export const WAVER_MS = 2400;

export const createMargin = (host: HTMLElement): Margin => {
  let shown: string[] = [];

  const render = (sketches: readonly VisibleSketch[]): void => {
    const next = sketches.map((s) => s.who);
    const same = next.length === shown.length && next.every((w, i) => w === shown[i]);
    if (same) {
      // Only the fade changes — no node churn, no re-settle.
      sketches.forEach((s, i) => {
        const card = host.children[i];
        if (card instanceof HTMLElement) card.style.setProperty('--sketch-opacity', String(s.opacity));
      });
      return;
    }
    host.replaceChildren();
    for (const sketch of sketches) {
      const card = el('figure', `sketch sketch--${sketch.who}`);
      card.style.setProperty('--sketch-opacity', String(sketch.opacity));
      card.innerHTML = sketchSvg(sketch.who);
      host.append(card);
    }
    shown = next;
    host.hidden = sketches.length === 0;
  };

  return {
    update: render,
    waver: (who) => {
      const card = host.querySelector<HTMLElement>(`.sketch--${CSS.escape(who)}`);
      if (card === null) return;
      card.classList.add('waver');
      card.classList.add('detuned');
      window.setTimeout(() => card.classList.remove('waver'), WAVER_MS);
    },
    clear: () => {
      host.replaceChildren();
      shown = [];
      host.hidden = true;
    },
  };
};
