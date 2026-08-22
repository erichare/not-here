/**
 * ANSI rendering helpers for the terminal front-end. Aesthetic: Barb's
 * tab book under the counter light — warm, spare, no ornament, no emoji.
 * Pure string builders; main.ts owns the actual writes.
 */

import type { EngineEvent } from '@not-here/engine';

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

/** The strip's slot glyphs — the same four the web frame draws. */
const SLOT_GLYPHS: Readonly<Record<string, string>> = {
  morning: '○',
  afternoon: '◔',
  evening: '◑',
  night: '●',
};

/** Per-slot tones, dim: grey mornings, the one warm evening, blue night. */
const SLOT_TONES: Readonly<Record<string, string>> = {
  morning: '2;38;5;251',
  afternoon: '2;38;5;248',
  evening: '2;38;5;180',
  night: '2;38;5;67',
};

/** One-line header, right-aligned and slot-toned: '○  DAY N — SLOT'. */
export const renderHeader = (
  day: number,
  slot: string,
  width: number = WRAP_WIDTH,
): string => {
  const glyph = SLOT_GLYPHS[slot];
  const label = `${glyph === undefined ? '' : `${glyph}  `}DAY ${day} — ${slot.toUpperCase()}`;
  const tone = SLOT_TONES[slot];
  const paint = tone === undefined ? faint : style(tone);
  return paint(label.padStart(width));
};

// ——— 3:12 ————————————————————————————————————————————————————————————
// The web build drops the room away for the horn; here 3:12 is a line
// under the header — the horn's five bars, or the silence in their place.

export type ThreeTwelveKind = 'horn' | 'silence';

const HORN_CUE = 'foghorn-312';
const NIGHT_ID = /-night(-\d+)?$/;

/** Which 3:12 a step is, if any: the horn's cue, or a night under the stop. */
export const threeTwelveKind = (
  sceneId: string,
  slot: string | undefined,
  flags: Readonly<Record<string, unknown>>,
  events: readonly EngineEvent[],
): ThreeTwelveKind | undefined => {
  if (events.some((event) => event.kind === 'music.cue' && event.cue === HORN_CUE)) {
    return 'horn';
  }
  if (slot === 'night' && NIGHT_ID.test(sceneId) && flags['horn-stopped'] === true) {
    return 'silence';
  }
  return undefined;
};

const THREE_TWELVE_LINES: Readonly<Record<ThreeTwelveKind, string>> = {
  horn: '— 3:12 —',
  silence: '— 3:12 — no horn —',
};

/** Centered, faint 3:12 line under the header. */
export const renderThreeTwelve = (
  kind: ThreeTwelveKind,
  width: number = WRAP_WIDTH,
): string => {
  const label = THREE_TWELVE_LINES[kind];
  const pad = Math.max(0, Math.floor((width - label.length) / 2));
  return `${' '.repeat(pad)}${faint(label)}`;
};

/** Verbatim document artifacts — '@doc:' paragraphs render unwrapped. */
const DOC_PREFIX = '@doc:\n';

/** Documents that arrive already drawn keep their own frame. */
const BOX_OPENERS = ['┌', '╔', '╭'];

/** Indent plus the frame's own two columns either side. */
const FRAME_COST = 8;

/**
 * A plain document gets a single ruled frame — the paper the web build
 * draws, in box characters. Drawn docs pass through; a doc too wide for
 * the frame at the wrap width stays as authored (never re-wrapped).
 */
export const frameDoc = (
  lines: readonly string[],
  width: number = WRAP_WIDTH,
): readonly string[] => {
  const first = (lines[0] ?? '').trimStart();
  if (BOX_OPENERS.some((glyph) => first.startsWith(glyph))) return lines;
  const widths = lines.map((line) => [...line].length);
  const inner = Math.max(0, ...widths);
  if (inner > width - FRAME_COST) return lines;
  const bar = '─'.repeat(inner + 2);
  return [
    `┌${bar}┐`,
    ...lines.map((line, i) => `│ ${line}${' '.repeat(inner - (widths[i] ?? 0))} │`),
    `└${bar}┘`,
  ];
};

const renderDoc = (paragraph: string): string =>
  frameDoc(paragraph.slice(DOC_PREFIX.length).split('\n'))
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

/** The STATIC reading the choice labels are read through (web parity). */
export interface ChoiceRot {
  readonly staticMeter: number;
  readonly seed: number;
}

/**
 * Numbered open choices; locked ones dim with a '·' prefix, unnumbered.
 * Under `rot`, the labels alone pass through degradeMargin — the numbers,
 * glyphs and stakes marks stay legible so a choice can always be made.
 */
export const renderChoices = (
  choices: readonly ChoiceLine[],
  rot?: ChoiceRot,
): RenderedChoices => {
  const open = choices.filter((choice) => !choice.locked);
  const labelOf = (label: string, index: number): string =>
    rot === undefined ? label : degradeMargin(label, rot.staticMeter, rot.seed + index);
  const lines = choices.map((choice, index) =>
    choice.locked
      ? dim(`${choice.stakes === 'major' ? '  !' : '  '}  · ${labelOf(stripLockedGlyph(choice.label), index)}`)
      : `${choice.stakes === 'major' ? warm('! ') : '  '}${warm(`${open.indexOf(choice) + 1}.`)} ${labelOf(choice.label, index)}`,
  );
  return { text: lines.join('\n'), openIds: open.map((choice) => choice.id) };
};

/**
 * Ending ids are internal; the card speaks the prose register instead.
 * Unknown ids get the generic close — never the raw id (fix-07).
 */
const ENDING_LABELS: Readonly<Record<string, string>> = {
  'act1-end': 'end of the first act',
  'act2-end': 'end of the second act',
  'd20-end': 'held for the twenty-sixth',
  'd21-end': 'held for the twenty-seventh',
  'd22-end': 'held for the twenty-eighth',
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
