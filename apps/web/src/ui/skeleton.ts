/**
 * The persistent skeleton, built once. Every later render touches only the
 * ledger page's children; the stage, frame, margin rail, overlays,
 * interstitial, and captions are long-lived siblings updated in place.
 *
 *   #app
 *     #stage         aria-hidden, [data-place][data-slot]   (phase 2 draws it)
 *     #frame         role=banner                             (phase 2 draws it)
 *     #reading       main.page (the ledger entry) + aside#margin
 *     #overlays      the book / history / settings dialogs + their buttons
 *     #interstitial  the 3:12 beat                           (phase 6)
 *     .captions      aria-live
 */

import { el } from './dom.ts';

export interface Skeleton {
  readonly stage: HTMLElement;
  readonly frame: HTMLElement;
  readonly reading: HTMLElement;
  readonly page: HTMLElement;
  readonly margin: HTMLElement;
  readonly overlays: HTMLElement;
  readonly interstitial: HTMLElement;
  readonly captions: HTMLElement;
  /** The regions an open overlay makes inert. */
  readonly inertTargets: readonly HTMLElement[];
}

export const buildSkeleton = (root: HTMLElement): Skeleton => {
  const stage = el('div', 'stage');
  stage.id = 'stage';
  stage.setAttribute('aria-hidden', 'true');

  const frame = el('header', 'frame');
  frame.id = 'frame';
  frame.hidden = true;

  const reading = el('div', 'reading');
  reading.id = 'reading';
  const page = el('main', 'page');
  const margin = el('aside', 'margin');
  margin.id = 'margin';
  margin.hidden = true;
  margin.setAttribute('aria-hidden', 'true');
  reading.append(page, margin);

  const overlays = el('div', 'overlays');
  overlays.id = 'overlays';

  const interstitial = el('div', 'interstitial');
  interstitial.id = 'interstitial';
  interstitial.hidden = true;
  interstitial.setAttribute('aria-hidden', 'true');

  const captions = el('div', 'captions');
  captions.setAttribute('aria-live', 'polite');
  captions.setAttribute('aria-relevant', 'additions');

  root.append(stage, frame, reading, overlays, interstitial, captions);
  return {
    stage,
    frame,
    reading,
    page,
    margin,
    overlays,
    interstitial,
    captions,
    inertTargets: [reading, frame, stage],
  };
};
