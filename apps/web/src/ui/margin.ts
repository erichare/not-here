/**
 * The margin sketch — an ink portrait in the margin of Barb's book. Phase 1
 * keeps the shipped behaviour verbatim: one card, on the scene where the
 * player first meets someone, inlined as a faded aside inside the page.
 * (Phase 3 moves it to the persistent rail and makes it speaker-aware.)
 */

import { firstMeetingSketch } from '../sketches.ts';

/**
 * Build the margin aside for a scene, or null when the scene introduces
 * nobody. The markup is a build-time constant (bundled SVG), so innerHTML
 * carries no untrusted input.
 */
export const renderMarginSketch = (sceneId: string | undefined): HTMLElement | null => {
  if (sceneId === undefined) return null;
  const svg = firstMeetingSketch(sceneId);
  if (svg === null) return null;
  const aside = document.createElement('aside');
  aside.className = 'margin-sketch';
  aside.setAttribute('aria-hidden', 'true');
  aside.innerHTML = svg;
  return aside;
};
