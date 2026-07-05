/**
 * ANSI rendering helpers for the terminal front-end. Aesthetic: Barb's
 * tab book under the counter light — warm, spare, no ornament, no emoji.
 * Pure string builders; main.ts owns the actual writes.
 */

export const WRAP_WIDTH = 72;

const ESC = '\u001b';

const style =
  (codes: string) =>
  (text: string): string =>
    `${ESC}[${codes}m${text}${ESC}[0m`;

/** Body prose: dim grey, pencil under lamplight. */
export const body = style('38;5;245');
export const dim = style('2');
export const italic = style('3;38;5;250');
export const faint = style('2;38;5;244');
/** Warm lamplight accents — brass, lamp oil. */
export const warm = style('38;5;180');
/** Brown ink, Barb's hand. */
export const ink = style('38;5;137');

const emphasis = style('1;38;5;180');

/** Strip ANSI styling — used by tests and width math. */
export const stripAnsi = (text: string): string =>
  text.replaceAll(/\u001b\[[0-9;]*m/g, '');

export const clearScreen = (): string => `${ESC}[2J${ESC}[3J${ESC}[H`;

/** Greedy word-wrap at `width` columns. */
export const wrap = (text: string, width: number = WRAP_WIDTH): readonly string[] => {
  const words = text.split(/\s+/).filter((word) => word.length > 0);
  const lines: string[] = [];
  let line = '';
  for (const word of words) {
    if (line === '') {
      line = word;
    } else if (line.length + 1 + word.length <= width) {
      line = `${line} ${word}`;
    } else {
      lines.push(line);
      line = word;
    }
  }
  if (line !== '') lines.push(line);
  return lines;
};

/** One-line header, right-aligned faint: 'DAY N — SLOT'. */
export const renderHeader = (
  day: number,
  slot: string,
  width: number = WRAP_WIDTH,
): string => {
  const label = `DAY ${day} — ${slot.toUpperCase()}`;
  return faint(label.padStart(width));
};

/** Verbatim document artifacts — '@doc:' paragraphs render unwrapped. */
const DOC_PREFIX = '@doc:\n';

const renderDoc = (paragraph: string): string =>
  paragraph
    .slice(DOC_PREFIX.length)
    .split('\n')
    .map((line) => `    ${faint(line)}`)
    .join('\n');

/** Dim grey paragraphs, wrapped, one blank line between. */
export const renderParagraphs = (
  paragraphs: readonly string[],
  width: number = WRAP_WIDTH,
): string =>
  paragraphs
    .map((paragraph) =>
      paragraph.startsWith(DOC_PREFIX)
        ? renderDoc(paragraph)
        : wrap(paragraph, width).map(body).join('\n'),
    )
    .join('\n\n');

export interface ChoiceLine {
  readonly id: string;
  readonly label: string;
  readonly locked: boolean;
  readonly stakes?: 'major';
}

export interface RenderedChoices {
  readonly text: string;
  /** Ids of selectable choices, in the order they were numbered. */
  readonly openIds: readonly string[];
}

/**
 * The renderer owns the locked glyph; authored lockedLabels that arrive with
 * their own '· ' would double it (defense in depth against the content lint).
 */
const stripLockedGlyph = (label: string): string => label.replace(/^·\s*/u, '');

/** Numbered open choices; locked ones dim with a '·' prefix, unnumbered. */
export const renderChoices = (choices: readonly ChoiceLine[]): RenderedChoices => {
  const open = choices.filter((choice) => !choice.locked);
  const lines = choices.map((choice) =>
    choice.locked
      ? dim(`${choice.stakes === 'major' ? '  !' : '  '}  · ${stripLockedGlyph(choice.label)}`)
      : `${choice.stakes === 'major' ? warm('! ') : '  '}${warm(`${open.indexOf(choice) + 1}.`)} ${choice.label}`,
  );
  return { text: lines.join('\n'), openIds: open.map((choice) => choice.id) };
};

/**
 * Ending ids are internal; the card speaks the prose register instead.
 * Unknown ids get the generic close — never the raw id (fix-07).
 */
const ENDING_LABELS: Readonly<Record<string, string>> = {
  'act1-end': 'end of the first act',
};

const DEFAULT_ENDING_LABEL = 'the ledger closes here';

/** Centered, emphasized ending card. */
export const renderEnding = (endingId: string, width: number = WRAP_WIDTH): string => {
  const label = `— ${ENDING_LABELS[endingId] ?? DEFAULT_ENDING_LABEL} —`;
  const pad = Math.max(0, Math.floor((width - label.length) / 2));
  return `\n${' '.repeat(pad)}${emphasis(label)}\n`;
};

// ——— STATIC perceptibility (fix-13) ————————————————————————————————————
// The fog's claim degrades the margin channel only — captions and tells,
// never body prose, never a number. Deterministic per (seed, line): the
// same save shows the same rot.

/** Wrong-but-nearby letterforms; the letters walk, they do not vanish. */
const ROT_GLYPHS: Readonly<Record<string, string>> = {
  a: 'ɑ',
  c: 'ɔ',
  d: 'ð',
  e: 'ǝ',
  g: 'ǥ',
  h: 'ɦ',
  i: 'ɪ',
  l: 'ɭ',
  m: 'ɱ',
  n: 'ɳ',
  o: 'ø',
  r: 'ɾ',
  s: 'ʂ',
  t: 'ʈ',
  u: 'ʊ',
  w: 'ʍ',
};

/** Mulberry32 step — pure; local so the renderer stays dependency-free. */
const rotStep = (state: number): readonly [number, number] => {
  const a = (state + 0x6d2b79f5) >>> 0;
  let x = Math.imul(a ^ (a >>> 15), 1 | a);
  x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x;
  return [((x ^ (x >>> 14)) >>> 0) / 4294967296, a] as const;
};

/** Substitution odds per eligible letter at a given STATIC reading. */
export const rotRateFor = (staticMeter: number): number => {
  if (staticMeter >= 60) return 1 / 6;
  if (staticMeter >= 30) return 1 / 14;
  return 0;
};

/**
 * Occasional wrong glyphs in a margin line — subtle below the ≥60 tier.
 * ANSI escape sequences pass through untouched; only lowercase-able letters
 * with a rot twin are eligible. Pure and deterministic in (line, meter, seed).
 */
export const degradeMargin = (
  line: string,
  staticMeter: number,
  seed: number,
): string => {
  const rate = rotRateFor(staticMeter);
  if (rate === 0) return line;
  let rng = (seed ^ 0x9e3779b9) >>> 0;
  let out = '';
  let i = 0;
  while (i < line.length) {
    if (line[i] === ESC) {
      const end = line.indexOf('m', i);
      if (end === -1) {
        out += line.slice(i);
        break;
      }
      out += line.slice(i, end + 1);
      i = end + 1;
      continue;
    }
    const ch = line[i] as string;
    const twin = ROT_GLYPHS[ch.toLowerCase()];
    if (twin === undefined) {
      out += ch;
    } else {
      const [roll, next] = rotStep(rng);
      rng = next;
      out += roll < rate ? twin : ch;
    }
    i += 1;
  }
  return out;
};
