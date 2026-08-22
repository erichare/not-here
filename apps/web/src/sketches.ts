/**
 * Margin sketches — ink portraits drawn in the margin of Barb's book.
 * Each character has one card (assets/sketches/*.svg, bundled inline via
 * Vite `?raw`). The first-meeting gate lives in model/cast.ts (pure, linted
 * over the whole story); this module only binds it to the bundled SVGs.
 */

import barbSvg from '../../../assets/sketches/barb.svg?raw';
import dianneSvg from '../../../assets/sketches/dianne.svg?raw';
import priyaSvg from '../../../assets/sketches/priya.svg?raw';
import samSvg from '../../../assets/sketches/sam.svg?raw';
import tamSvg from '../../../assets/sketches/tam.svg?raw';
import wadeSvg from '../../../assets/sketches/wade.svg?raw';
import wrenSvg from '../../../assets/sketches/wren.svg?raw';
import { FIRST_MEETING, type SketchCharacter } from './model/cast.ts';

export { FIRST_MEETING, type SketchCharacter };

export const SKETCHES: Readonly<Record<SketchCharacter, string>> = {
  dianne: dianneSvg,
  barb: barbSvg,
  wade: wadeSvg,
  sam: samSvg,
  priya: priyaSvg,
  tam: tamSvg,
  wren: wrenSvg,
};

/** The bundled SVG for a character. */
export const sketchSvg = (who: SketchCharacter): string => SKETCHES[who];

/** The inline SVG for a scene's first meeting, or null if there is none. */
export const firstMeetingSketch = (sceneId: string): string | null => {
  const who = FIRST_MEETING[sceneId];
  return who === undefined ? null : SKETCHES[who];
};
