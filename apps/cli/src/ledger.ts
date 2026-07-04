/**
 * 'Consult the ledger' — Barb's handwritten observations of the guest.
 * Diegetic stat readout: three tiers per stat, one line for STATIC,
 * never a number in sight.
 */

import { STATS, type StatId, type WorldState } from '@not-here/engine';
import { dim, ink, italic, warm, wrap } from './render.ts';

interface Tiers {
  readonly low: string;
  readonly mid: string;
  readonly high: string;
}

const OBSERVATIONS: Readonly<Record<StatId, Tiers>> = {
  flesh: {
    low: 'the chair does not creak under her. it should.',
    mid: 'casts a shadow now, when the lamp is on her side.',
    high: 'solid enough to shoulder a casket, lately.',
  },
  name: {
    low: 'the ink dries pale on her page.',
    mid: 'wears the name like a coat bought secondhand. it mostly fits.',
    high: 'answers to it straight off now, no half-second of borrowing.',
  },
  echo: {
    low: 'asks twice after things a body ought to keep.',
    mid: 'hums along a beat behind. but she hums.',
    high: 'remembers more than she was told.',
  },
  undertow: {
    low: 'keeps her feet dry and her back to the lake.',
    mid: 'stands at windows longer than windows deserve.',
    high: 'looks at the water the way the water looks at everyone.',
  },
};

const tierFor = (value: number): keyof Tiers =>
  value >= 5 ? 'high' : value >= 3 ? 'mid' : 'low';

/** The observation Barb would write for one stat at its current value. */
export const observationFor = (stat: StatId, value: number): string =>
  OBSERVATIONS[stat][tierFor(value)];

/** The single STATIC line — the fog's claim, in her hand. */
export const staticLine = (staticMeter: number): string => {
  if (staticMeter >= 60) return 'some nights the page will not hold her. the letters walk.';
  if (staticMeter >= 30) return 'there is a hiss under her vowels that I do not write down.';
  return 'the fog has not found much of her to argue with. yet.';
};

const LEDGER_WRAP = 64;

const entryBlock = (entry: string): string =>
  wrap(entry, LEDGER_WRAP)
    .map((line, index) =>
      index === 0 ? `  ${ink('~')} ${italic(line)}` : `    ${italic(line)}`,
    )
    .join('\n');

/** Full ledger view: one entry per stat, then the STATIC line. */
export const renderLedger = (state: WorldState): string => {
  const entries = STATS.map((stat) => observationFor(stat, state.stats[stat]));
  const blocks = [...entries, staticLine(state.staticMeter)].map(entryBlock);
  return [
    warm("BARB'S BOOK"),
    dim('double-inked, a steady hand, the guest’s page'),
    '',
    blocks.join('\n\n'),
  ].join('\n');
};
