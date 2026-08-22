/**
 * Documents render as documents (design/decisions.md): letters, schedules,
 * register pages, the chord chart. `@doc:` text arrives verbatim; this
 * model decides, from the text alone and with zero story changes, what
 * kind of paper it is, whether it is printed or handwritten (and whose
 * hand), whether its box-drawing frame should be stripped for a paper
 * edge, and where the pen-ring sits. Anything unrecognised is safe:
 * generic print on paper. Pure.
 */

export type DocForm =
  | 'card' // the EBUS schedule card
  | 'register' // the Kettle's register page
  | 'log' // Tam's mileage log
  | 'notice' // BC Transit / Canada Post notices
  | 'flyer' // the potluck flyer
  | 'list' // the potluck dish list
  | 'map' // Sam's shore map
  | 'chord' // Wren's chord chart
  | 'intake' // the clinic's cont'd page
  | 'letter' // Wren's letter
  | 'reply' // Dianne's unsent reply
  | 'note' // Priya's note
  | 'jotting' // Sam's visit log
  | 'scrap' // the burnt corner
  | 'print' // generic boxed print
  | 'page'; // generic loose page

export type DocHand = 'print' | 'barb' | 'wren' | 'dianne' | 'priya' | 'sam';

export interface DocModel {
  readonly form: DocForm;
  readonly hand: DocHand;
  /** The lines to render (box frame stripped when `boxed`). */
  readonly lines: readonly string[];
  readonly boxed: boolean;
  /** True when the first line is a title set in the hand (the chord chart). */
  readonly handTitle: boolean;
}

const BOX_TOP = /^[┌╔╭]/;
const BOX_BOTTOM = /^[└╚╰]/;
const BOX_SIDE = /^[│║]\s?|\s?[│║]$/g;

const isBoxed = (lines: readonly string[]): boolean =>
  lines.length >= 2 && BOX_TOP.test(lines[0] ?? '') && BOX_BOTTOM.test(lines[lines.length - 1] ?? '');

/** Strip the frame: drop the top/bottom rules and the side bars (one cell each). */
const unbox = (lines: readonly string[]): readonly string[] =>
  lines.slice(1, -1).map((line) => line.replace(BOX_SIDE, ''));

const formFor = (text: string, boxed: boolean): DocForm => {
  // A hand's signature outranks any word the page happens to contain —
  // Dianne's reply mentions seven years, and is not the flyer.
  if (/^Mom —/m.test(text) || /— W\.\s*$/.test(text.trim())) return 'letter';
  if (/^Wren —/m.test(text)) return 'reply';
  if (/— P\.A\./.test(text)) return 'note';
  if (/—n’t look for me/.test(text) || /—n't look for me/.test(text)) return 'scrap';
  if (text.includes('║') || text.includes('not here (unfinished)')) return 'chord';
  if (/^NOV \d+ —/m.test(text)) return 'jotting';
  const upper = text.toUpperCase();
  if (upper.includes('EBUS')) return 'card';
  if (upper.includes('REGISTER')) return 'register';
  if (upper.includes('DAILY LOG')) return 'log';
  if (upper.includes('BC TRANSIT') || upper.includes('CANADA POST')) return 'notice';
  if (upper.includes('SEVEN YEARS')) return 'flyer';
  if (upper.includes('POTLUCK')) return 'list';
  if (upper.includes('W. SHORE')) return 'map';
  if (upper.includes('CLINIC') || /\bID:\s/.test(text) || /\bDOB:\s/.test(text)) return 'intake';
  return boxed ? 'print' : 'page';
};

const handFor = (form: DocForm): DocHand => {
  switch (form) {
    case 'letter':
    case 'scrap':
      return 'wren';
    case 'reply':
      return 'dianne';
    case 'note':
      return 'priya';
    case 'jotting':
      return 'sam';
    default:
      return 'print';
  }
};

export const detectDoc = (text: string): DocModel => {
  const raw = text.split('\n');
  const boxed = isBoxed(raw);
  const form = formFor(text, boxed);
  return {
    form,
    hand: handFor(form),
    lines: boxed ? unbox(raw) : raw,
    boxed,
    handTitle: form === 'chord',
  };
};

export interface DocSpan {
  readonly kind: 'text' | 'ring';
  readonly text: string;
}

/** The pen-ring: `(( … ))` becomes a ringed span; the parens stay in the text, invisibly, so columns hold. */
export const ringSpans = (line: string): readonly DocSpan[] => {
  const match = /\(\(.*?\)\)/.exec(line);
  if (match === null) return [{ kind: 'text', text: line }];
  const before = line.slice(0, match.index);
  const after = line.slice(match.index + match[0].length);
  const out: DocSpan[] = [];
  if (before.length > 0) out.push({ kind: 'text', text: before });
  out.push({ kind: 'ring', text: match[0] });
  if (after.length > 0) out.push({ kind: 'text', text: after });
  return out;
};
