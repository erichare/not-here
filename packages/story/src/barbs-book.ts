/**
 * BARB'S BOOK — the character sheet, fully diegetic (design/barbs-book-spec.md).
 *
 * Pure model builder: (state) → the page Barb would show you. One source of
 * truth for BOTH builds — apps/cli prints these blocks in its 72-column
 * frame, apps/web wraps them in the ledger-page dialog. Nothing exists in
 * one build that doesn't exist in the other.
 *
 * MUST NEVER SHOW (spec): bare numbers, stat names, meters, deltas, internal
 * slugs, anything about CHORD, the fog as an agent — never a line Barb could
 * not plausibly have written by hand at the end of a shift.
 *
 * Tiers are RESCALED to Act-1 range (low <4, mid 4–7, high ≥8) so at least
 * two observations visibly move between Day 2 and Day 7 on a warm route —
 * proven by the scripted walkthrough in barbs-book.test.ts.
 */

import { STATS, type FactTag, type StatId, type WorldState } from '@not-here/engine';
import { ALL_SCENES } from './content.ts';

/** How far the fog has gotten into the page itself. */
export type StaticTier = 'clear' | 'inked' | 'hissing' | 'walking';

export interface BarbsBook {
  /** The register entry as a verbatim document block — NAME column blank. */
  readonly registerDoc: string;
  /** One observation per stat, in STATS order, in Barb's hand. */
  readonly observations: readonly string[];
  /** The fog's claim, in her hand, weather-deniable at the low end. */
  readonly staticLine: string;
  /** Drives page degradation in the web overlay; never shown as text. */
  readonly staticTier: StaticTier;
  /** 'What you told her, Night One' — the five answers, verbatim. */
  readonly truths: readonly string[];
  /** 'Margins, other hands' — one line per fact Barb actually knows. */
  readonly heldFacts: readonly string[];
}

/** The book exists once Barb has closed it on your line, Night 1. */
export const isBookUnlocked = (state: WorldState): boolean =>
  Boolean(state.flags['barbs-book:unlocked']);

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
    // The UNDERTOW mirror survives every rewrite (spec): it is the only
    // mirror the Refuser's path has.
    low: 'keeps her feet dry and her back to the lake.',
    mid: 'stands at windows longer than windows deserve.',
    high: 'looks at the water the way the water looks at everyone.',
  },
};

/** Act-1 rescale (spec): low <4, mid 4–7, high ≥8. */
const tierFor = (value: number): keyof Tiers =>
  value >= 8 ? 'high' : value >= 4 ? 'mid' : 'low';

/** The observation Barb would write for one stat at its current value. */
export const observationFor = (stat: StatId, value: number): string =>
  OBSERVATIONS[stat][tierFor(value)];

export const staticTierFor = (staticMeter: number): StaticTier => {
  if (staticMeter >= 60) return 'walking';
  if (staticMeter >= 30) return 'hissing';
  if (staticMeter >= 16) return 'inked';
  return 'clear';
};

const STATIC_LINES: Readonly<Record<StaticTier, string>> = {
  clear: 'the damp hasn’t got into her yet. it gets into everything here.',
  inked: 'the ink fights her lately; I write her twice and keep the second.',
  hissing: 'there is a hiss under her vowels that I do not write down.',
  walking: 'some nights the page will not hold her. the letters walk.',
};

/** The single STATIC line — the fog's claim, never the fog as an agent. */
export const staticLineFor = (staticMeter: number): string =>
  STATIC_LINES[staticTierFor(staticMeter)];

/**
 * The Night-1 register entry, boxed the way both builds print documents.
 * No numerals anywhere in the book — the date and unit are in her hand.
 */
const DOC_INNER_WIDTH = 46;

const docLine = (text: string): string => `│${text.padEnd(DOC_INNER_WIDTH)}│`;

const docRow = (date: string, name: string, unit: string, remarks: string): string =>
  docLine(`  ${date.padEnd(13)}${name.padEnd(15)}${unit.padEnd(7)}${remarks}`);

const REGISTER_DOC = [
  `┌${'─'.repeat(DOC_INNER_WIDTH)}┐`,
  docLine('  THE KETTLE — REGISTER'),
  docLine(''),
  docRow('DATE', 'NAME', 'UNIT', 'REMARKS'),
  docRow('nov sixth', '', 'one', 'supper,'),
  docRow('', '', '', 'tab'),
  `└${'─'.repeat(DOC_INNER_WIDTH)}┘`,
].join('\n');

/** The interview, in scene order — resolved to the player's verbatim words. */
const INTERVIEW_SCENE_IDS = [
  'n1-interview-1',
  'n1-interview-2',
  'n1-interview-3',
  'n1-interview-4',
  'n1-interview-5',
] as const;

const choiceLabel = (sceneId: string, choiceId: string): string | undefined => {
  const scene = ALL_SCENES.find((s) => s.id === sceneId);
  return scene?.choices.find((c) => c.id === choiceId)?.label;
};

/**
 * 'What you told her, Night One' — the five answers quoted verbatim in the
 * player's own words (the verbatim-echo graft from decisions.md, given a
 * home). Never tag slugs; always the label the player chose.
 */
const truthsOf = (state: WorldState): readonly string[] =>
  INTERVIEW_SCENE_IDS.flatMap((sceneId) => {
    const record = [...state.choiceLog].reverse().find((r) => r.scene === sceneId);
    if (!record) return [];
    const label = choiceLabel(sceneId, record.choice);
    return label !== undefined ? [label] : [];
  });

/**
 * 'Margins, other hands' — authored lines keyed to facts Barb KNOWS
 * (witnessed, or arrived over a gossip edge). Mechanically honest: an entry
 * appears only when the knowledge does, which quietly teaches the system.
 *
 * The table runs the whole shipped game (pt2-fix-01: Act 2 margins — the
 * ledger must not go dead after Day 7). Rules the table keeps: only tags
 * Barb actually holds (witnessed, or reachable over the tam/dianne edges);
 * never a private:* tag; nothing about the letter night — the Day-19
 * read-back's silence on it is a ruling, and the page keeps it too.
 */
const MARGIN_LINES: readonly { readonly tag: FactTag; readonly line: string }[] = [
  { tag: 'kept-barb-company', line: 'sat the morning out with me.' },
  { tag: 'went-to-dianne', line: 'gave Dianne her first morning.' },
  { tag: 'refused-first-meal', line: 'sat a full plate out. wrote it small.' },
  { tag: 'ate-first-meal', line: 'cleaned her plate the first night. wrote it plain.' },
  { tag: 'picked-at-meal', line: 'moved her supper around more than through it.' },
  { tag: 'helped-barb', line: 'dries a pot properly. gone over twice, so it takes.' },
  { tag: 'helped-barb-walkin', line: 'hauled the walk-in with me till neither of us could feel our hands.' },
  { tag: 'helped-hall', line: 'carried tables at the hall till the list ran out. Dianne told it twice.' },
  { tag: 'told-tam-staying', line: 'staying past the month, Tam says. holding the unit.' },
  { tag: 'went-to-room-d3', line: 'up at the house with Dianne all morning, airing. good.' },
  { tag: 'went-to-shed-d3', line: 'went down by the boat shed early. came back with the cold on her.' },
  { tag: 'went-to-clinic-d3', line: 'took herself over to the clinic. Priya keeps her own book.' },
  { tag: 'visited-dianne-d4', line: 'back up the hill to Dianne’s. some tabs I don’t keep.' },
  { tag: 'went-to-wharf-d4', line: 'out on the wharf in that weather. I didn’t ask.' },
  { tag: 'two-phones-laid-out', line: 'Sam put two phones on my counter. I did not write what they showed.' },
  // ——— Act 2, Days 8–19 (pt2-fix-01) ———
  { tag: 'helped-stockroom', line: 'walked Dianne’s shelves in off the frost. fed for it. that pot is never small.' },
  { tag: 'went-to-sams-shed-d8', line: 'went to the boat shed because Sam asked. asked. I wrote it the day it happened.' },
  { tag: 'went-to-clinic-d9', line: 'up to the clinic for the doctor’s morning. what’s written there is hers to keep.' },
  { tag: 'helped-walkin-d9', line: 'shelved my walk-in for winter, every label face-out. I never asked for face-out.' },
  { tag: 'went-to-house-d10', line: 'up the hill the morning Dianne laid the first fire of the year. wood wanted carrying.' },
  { tag: 'went-to-shed-d10', line: 'looked in on the boat shed. the boy’s light burns past two. I keep the count here.' },
  { tag: 'barb-inked-the-blank', line: 'a blank on the hall list, beside her dish. she let me ink it. I inked it twice.' },
  { tag: 'signed-the-receipt-line', line: 'signed the courier’s pad herself, Dianne says. the line held till morning. that is not nothing.' },
  { tag: 'helped-potluck-prep', line: 'gave the hall her morning the day before the doings. tables, cups, the urn.' },
  { tag: 'potluck-verdict-defended', line: 'the boy stood at the hall, and the room moved her way. chairs and all.' },
  { tag: 'potluck-verdict-exiled', line: 'the hall decided without one word said. I had no key to give her. I had nothing.' },
  { tag: 'defended-sam', line: 'spoke for the boy into all that quiet. it cost the room’s comfort. worth the ink.' },
  { tag: 'sacrificed-sam', line: 'told the boy to sit down, in the old cadence. I wrote it because it happened.' },
  { tag: 'went-to-clinic-d17', line: 'went up to the clinic when the doctor asked. she asks once. I said it once.' },
  { tag: 'ran-the-mail-d17', line: 'took my outgoing across in its elastic, ahead of the pickup. the mail came to no harm.' },
  { tag: 'helped-dianne-parcels', line: 'held string while the hall’s dishes went home. every lid found its pot, Dianne says.' },
  // ——— Act 3, Day 20 ———
  // Night 20 stays off the page by the same ruling that keeps the letter
  // night off it: Sam's confession is witnessed by Sam alone, and no
  // gossip edge runs sam→barb. The book never claims more than it knows.
  // The airing count keeps honest books: the Day-3 airing was the first in
  // seven years (day3.ts canon), so the Day-20 row counts the shut years
  // and then the month, and claims nothing about her own last inking.
  { tag: 'aired-the-room-d20', line: 'up the hill for the airing, Dianne says. the sash open in that cold. seven years shut, and now twice in the month.' },
  { tag: 'a3:fed-d20', line: 'ate what was put in front of her today. the week ahead wants her fed.' },
  // ——— Act 3, Day 21 ———
  // Night 21 keeps the Night-20 ruling: Barb's own confession is a flag,
  // not a fact — there is nothing for the page to claim, and the page's
  // sanctioned self-acknowledgment is the register itself (gate-pass) or
  // the unread double ink (gate-fail). Tam-witnessed rows below arrive at
  // the Day-21→22 boundary over the tam edge; the ice row is hers same-day.
  { tag: 'helped-barb-ice', line: 'hauled ice with me the morning the pie case quit. never once asked was there an easier way.' },
  { tag: 'a3:fed-d21', line: 'fed again today. whatever Friday wants of her, it will not find her empty.' },
  { tag: 'rode-with-tam-d21', line: 'rode the morning run out and back, Tam says. he mentioned it, which from Tam is a paragraph.' },
  { tag: 'a3:sat-with-moose', line: 'sat the cold at my door with the dog till the last run came down, Tam says. the dog kept his post the better for the company.' },
];

const barbKnows = (state: WorldState, tag: FactTag): boolean => {
  const known = new Set(state.knownBy.barb);
  return state.facts.some((f) => f.tag === tag && known.has(f.id));
};

const heldFactsOf = (state: WorldState): readonly string[] =>
  MARGIN_LINES.filter(({ tag }) => barbKnows(state, tag)).map(({ line }) => line);

/** Build the whole page. Pure; a new model every call, nothing mutated. */
export const buildBarbsBook = (state: WorldState): BarbsBook => ({
  registerDoc: REGISTER_DOC,
  observations: STATS.map((stat) => observationFor(stat, state.stats[stat])),
  staticLine: staticLineFor(state.staticMeter),
  staticTier: staticTierFor(state.staticMeter),
  truths: truthsOf(state),
  heldFacts: heldFactsOf(state),
});
