/**
 * Web-side cue presentation: the diegetic caption line for the toast
 * channel and the loop policy for the player. The map itself lives in
 * @not-here/music (shared with the CLI) — one source of truth, so no raw
 * cue id can reach a screen in either build.
 */

import { cueCaption, cueLoops } from '@not-here/music';

export { cueCaption, cueLoops };

/** The caption toast line for a cue — '♪ <feel>', never '♪ <id>'. */
export const cueCaptionLine = (cue: string): string => `♪ ${cueCaption(cue)}`;
