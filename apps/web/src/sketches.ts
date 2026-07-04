/**
 * Margin sketches — ink portraits drawn in the margin of Barb's book.
 * Each character has one card (assets/sketches/*.svg, bundled inline via
 * Vite `?raw`); it appears once, on the scene where the player first meets
 * them, as a faded aside in the page's right margin. CSS owns visibility:
 * hidden under 1100px viewports and under prefers-reduced-motion.
 */

import barbSvg from '../../../assets/sketches/barb.svg?raw';
import dianneSvg from '../../../assets/sketches/dianne.svg?raw';
import priyaSvg from '../../../assets/sketches/priya.svg?raw';
import samSvg from '../../../assets/sketches/sam.svg?raw';
import tamSvg from '../../../assets/sketches/tam.svg?raw';
import wadeSvg from '../../../assets/sketches/wade.svg?raw';
import wrenSvg from '../../../assets/sketches/wren.svg?raw';

export type SketchCharacter =
  | 'dianne'
  | 'barb'
  | 'wade'
  | 'sam'
  | 'priya'
  | 'tam'
  | 'wren';

const SKETCHES: Readonly<Record<SketchCharacter, string>> = {
  dianne: dianneSvg,
  barb: barbSvg,
  wade: wadeSvg,
  sam: samSvg,
  priya: priyaSvg,
  tam: tamSvg,
  wren: wrenSvg,
};

/**
 * Scene id → who the player meets there for the first time.
 * Ids are the post-retheme ids (design/retheme-lorn-bay.md name map).
 * Branch-dependent intros (Dianne, Sam, Priya) sit on their intro scenes;
 * a run that skips the scene simply never gets that margin card.
 */
const FIRST_MEETING: Readonly<Record<string, SketchCharacter>> = {
  'n1-diner': 'barb', // the Kettle's counter, Night 1
  'n1-312': 'wade', // the horn at 3:12 — Wade's hand on the valve
  'd2-dianne': 'dianne', // Lorn Bay General, Day 2 morning
  'd2-evening': 'tam', // Tam comes in on the back of the cold
  'd3-shed': 'sam', // the boat shed, caulk gun going, Day 3
  'd3-clinic': 'priya', // clinic hours in the old manse, Day 3
  'act1-end': 'wren', // the empty frame, where the act closes
};

/** The inline SVG for a scene's first meeting, or null if there is none. */
export const firstMeetingSketch = (sceneId: string): string | null => {
  const who = FIRST_MEETING[sceneId];
  return who === undefined ? null : SKETCHES[who];
};

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
