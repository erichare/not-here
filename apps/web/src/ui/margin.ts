/**
 * The margin rail — the ink sketch of whoever is in the room, drawn in the
 * margin of Barb's book, and, in Act 3, Wren's chart completing as the
 * fragments of the song come home. Speaker-aware (model/cast.ts decides who,
 * and the first-meeting gate decides whether), trust-faded, and it wavers
 * once on a lie (the silent twin of the detune). Wren's frame never fades,
 * never wavers. On a phone the rail sits above the entry, small.
 */

import type { VisibleSketch } from '../model/cast.ts';
import { CHORD_SYSTEMS, inkedSystems } from '../model/chord.ts';
import { sketchSvg } from '../sketches.ts';
import { el } from './dom.ts';

export interface Margin {
  readonly update: (sketches: readonly VisibleSketch[], fragments: number) => void;
  /** The detune twin: the named character's sketch wavers once. */
  readonly waver: (who: string) => void;
  readonly clear: () => void;
}

export const WAVER_MS = 2400;

const buildChord = (): HTMLElement => {
  const strip = el('div', 'chord');
  strip.setAttribute('aria-hidden', 'true');
  CHORD_SYSTEMS.forEach((system, index) => {
    const row = el('div', 'chord-sys');
    row.dataset['n'] = String(index + 1);
    if (system.length > 0) row.append(el('i', 'chord-ink', system.join('   ')));
    strip.append(row);
  });
  return strip;
};

export const createMargin = (host: HTMLElement): Margin => {
  const sketches = el('div', 'sketches');
  const chord = buildChord();
  chord.hidden = true;
  host.append(sketches, chord);
  let shown: string[] = [];
  let inked = -1;

  const renderSketches = (next: readonly VisibleSketch[]): void => {
    const ids = next.map((s) => s.who);
    const same = ids.length === shown.length && ids.every((w, i) => w === shown[i]);
    if (same) {
      // Only the fade changes — no node churn, no re-settle.
      next.forEach((s, i) => {
        const card = sketches.children[i];
        if (card instanceof HTMLElement) card.style.setProperty('--sketch-opacity', String(s.opacity));
      });
      return;
    }
    sketches.replaceChildren();
    for (const sketch of next) {
      const card = el('figure', `sketch sketch--${sketch.who}`);
      card.style.setProperty('--sketch-opacity', String(sketch.opacity));
      card.innerHTML = sketchSvg(sketch.who);
      sketches.append(card);
    }
    shown = ids;
  };

  const renderChord = (fragments: number): void => {
    const count = inkedSystems(fragments);
    chord.hidden = fragments <= 0;
    if (count === inked) return;
    inked = count;
    chord.dataset['inked'] = String(count);
    chord.querySelectorAll<HTMLElement>('.chord-sys').forEach((row, index) => {
      row.classList.toggle('inked', index < count);
    });
  };

  return {
    update: (next, fragments) => {
      renderSketches(next);
      renderChord(fragments);
      host.hidden = next.length === 0 && fragments <= 0;
    },
    waver: (who) => {
      const card = sketches.querySelector<HTMLElement>(`.sketch--${CSS.escape(who)}`);
      if (card === null) return;
      card.classList.add('waver', 'detuned');
      window.setTimeout(() => card.classList.remove('waver'), WAVER_MS);
    },
    clear: () => {
      sketches.replaceChildren();
      shown = [];
      chord.hidden = true;
      inked = -1;
      host.hidden = true;
    },
  };
};
