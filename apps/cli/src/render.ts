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
}

export interface RenderedChoices {
  readonly text: string;
  /** Ids of selectable choices, in the order they were numbered. */
  readonly openIds: readonly string[];
}

/** Numbered open choices; locked ones dim with a '·' prefix, unnumbered. */
export const renderChoices = (choices: readonly ChoiceLine[]): RenderedChoices => {
  const open = choices.filter((choice) => !choice.locked);
  const lines = choices.map((choice) =>
    choice.locked
      ? dim(`     · ${choice.label}`)
      : `  ${warm(`${open.indexOf(choice) + 1}.`)} ${choice.label}`,
  );
  return { text: lines.join('\n'), openIds: open.map((choice) => choice.id) };
};

/** Centered, emphasized ending card. */
export const renderEnding = (endingId: string, width: number = WRAP_WIDTH): string => {
  const label = `— ${endingId} —`;
  const pad = Math.max(0, Math.floor((width - label.length) / 2));
  return `\n${' '.repeat(pad)}${emphasis(label)}\n`;
};
