/**
 * Self-truth tags — the working taxonomy seeded by the Counter Interview.
 *
 * Flag keys take the form `truth:<tag>` with value `true`. The full game
 * uses a fixed 24-tag taxonomy (see design/game-bible.md, LLM touchpoint 1);
 * these ten are the Night-1 slice's working set. Tags may be reachable from
 * more than one answer — setting a flag twice is idempotent by design.
 *
 * Post-reveal, these are what the fog built you partly from: the things YOU
 * brought to it (clue #11). Author scenes that echo them verbatim.
 */

export const TRUTH_TAGS = [
  'hates-the-lake',
  'misses-the-lake',
  'eats-what-is-given',
  'travels-light',
  'keeps-promises',
  'lies-easily',
  'wants-to-be-seen',
  'afraid-of-quiet',
  'never-says-goodbye',
  'doesnt-remember-leaving',
] as const;

export type TruthTag = (typeof TRUTH_TAGS)[number];

/** Canonical flag key for a self-truth tag. */
export const truthFlag = (tag: TruthTag): string => `truth:${tag}`;
