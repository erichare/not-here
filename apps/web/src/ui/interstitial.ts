/**
 * The 3:12 beat. The column has gone; the unit's window frame drops away;
 * the wharf is there in night-deep. "3:12." at the column's left margin,
 * five pulses at bar length — a ring from the horn bell — then the stop,
 * with the beam crossing the silence; or, on the stopped track, a dark
 * hold. Any key, click or tap skips. Under motion-off: a short still.
 * The horn's cue has already started (events are handled before the turn).
 */

import type { ThreeTwelveBeat } from '../model/beats.ts';
import { INTERSTITIAL } from '../model/copy.ts';
import { el, motionOff, wait } from './dom.ts';
import type { Stage } from './stage/index.ts';

export interface Interstitial {
  readonly show: (beat: ThreeTwelveBeat) => Promise<void>;
}

export const HORN_MS = 7400;
export const SILENCE_MS = 3500;
export const STILL_MS = 1200;

export const createInterstitial = (host: HTMLElement, stage: Stage): Interstitial => {
  const mark = el('p', 'inter-mark', INTERSTITIAL.mark);
  const line = el('p', 'inter-line');
  const skip = el('p', 'inter-skip', INTERSTITIAL.skip);
  const column = el('div', 'inter-column');
  column.append(mark, line, skip);
  host.append(column);
  host.setAttribute('role', 'status');
  host.setAttribute('aria-live', 'polite');

  return {
    show: (beat) =>
      new Promise((resolve) => {
        line.textContent = beat.kind === 'horn' ? INTERSTITIAL.horn : INTERSTITIAL.silence;
        host.hidden = false;
        host.removeAttribute('aria-hidden');
        host.dataset['beat'] = beat.kind;
        stage.beat(beat.kind);
        const total = motionOff() ? STILL_MS : beat.kind === 'horn' ? HORN_MS : SILENCE_MS;
        let done = false;
        const finish = (): void => {
          if (done) return;
          done = true;
          window.removeEventListener('keydown', onKey, true);
          host.removeEventListener('click', finish);
          host.hidden = true;
          host.setAttribute('aria-hidden', 'true');
          delete host.dataset['beat'];
          resolve();
        };
        const onKey = (event: KeyboardEvent): void => {
          if (event.metaKey || event.ctrlKey || event.altKey) return;
          event.preventDefault();
          event.stopPropagation();
          finish();
        };
        window.addEventListener('keydown', onKey, true);
        host.addEventListener('click', finish);
        void wait(total).then(finish);
      }),
  };
};
