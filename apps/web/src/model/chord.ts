/**
 * Wren's chord chart — the five systems she finished and the sixth she
 * didn't, exactly as the chart pinned inside her wardrobe door reads
 * (packages/story, d3-room-2). The Act 3 ensemble returns one fragment per
 * confession, and the margin's strip inks one more system each time: the
 * chart completing is the visual twin of the song reassembling.
 */

/** The six systems, in Wren's order; the sixth is the rest. */
export const CHORD_SYSTEMS: readonly (readonly string[])[] = [
  ['Dm', 'Dm/C', 'G/B', 'G'],
  ['F', 'C/E', 'Dm', 'Dm'],
  ['Am', 'G', 'F', 'F'],
  ['Em', 'Am', 'G/B', 'G'],
  ['Dm', 'F', 'G', 'G'],
  [],
];

/** How many systems are inked for this many returned fragments (0..6, the sixth never by the cascade). */
export const inkedSystems = (fragments: number): number =>
  Math.max(0, Math.min(CHORD_SYSTEMS.length - 1, Math.floor(fragments)));
