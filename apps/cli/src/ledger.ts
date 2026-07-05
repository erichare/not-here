/**
 * 'Consult the ledger' — Barb's book on the terminal. The page itself is
 * built by the shared model in @not-here/story (barbs-book.ts): one source
 * of truth for both builds; this file only frames the blocks in the
 * 72-column ledger aesthetic. Never a bare number outside the register
 * line Barb actually wrote by hand.
 */

import type { WorldState } from '@not-here/engine';
import { buildBarbsBook } from '@not-here/story';
import { dim, faint, ink, italic, warm, wrap } from './render.ts';

const LEDGER_WRAP = 64;

const entryBlock = (entry: string): string =>
  wrap(entry, LEDGER_WRAP)
    .map((line, index) =>
      index === 0 ? `  ${ink('~')} ${italic(line)}` : `    ${italic(line)}`,
    )
    .join('\n');

/** A labelled run of lines, omitted entirely when it has nothing to say. */
const section = (label: string, lines: readonly string[]): readonly string[] =>
  lines.length === 0 ? [] : ['', dim(label), '', ...lines];

/** Full ledger view: the register line, her observations, other hands. */
export const renderLedger = (state: WorldState): string => {
  const book = buildBarbsBook(state);
  const observations = [...book.observations, book.staticLine]
    .map(entryBlock)
    .join('\n\n');
  return [
    warm("BARB'S BOOK"),
    dim('double-inked, a steady hand, the guest’s page'),
    '',
    book.registerDoc
      .split('\n')
      .map((line) => `    ${faint(line)}`)
      .join('\n'),
    '',
    observations,
    // The interview answers are quoted verbatim — labels carry their own
    // quotation marks, so nothing is added around them.
    ...section(
      'what you told her, night one',
      book.truths.map((answer) => `    ${italic(answer)}`),
    ),
    ...section(
      'margins, other hands',
      book.heldFacts.map(entryBlock),
    ),
  ].join('\n');
};
