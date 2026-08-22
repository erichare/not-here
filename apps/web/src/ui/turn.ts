/**
 * The turn — how a live choice becomes the next entry: the page breathes
 * out, the 3:12 beat plays if this is its night, the next entry renders,
 * the page breathes in. One turn at a time; resume and held paths render
 * synchronously and never pass through here (no beat is ever replayed).
 */

import type { ThreeTwelveBeat } from '../model/beats.ts';
import { wait } from './dom.ts';
import type { Interstitial } from './interstitial.ts';

export interface TurnController {
  readonly run: (render: () => void, beat: ThreeTwelveBeat | null) => Promise<void>;
  readonly busy: () => boolean;
}

export const LEAVE_MS = 220;

export const createTurnController = (page: HTMLElement, interstitial: Interstitial): TurnController => {
  let turning = false;
  return {
    run: async (render, beat) => {
      if (turning) return;
      turning = true;
      try {
        page.classList.add('leaving');
        await wait(LEAVE_MS);
        if (beat !== null) await interstitial.show(beat);
        render();
        page.classList.remove('leaving');
      } finally {
        turning = false;
      }
    },
    busy: () => turning,
  };
};
