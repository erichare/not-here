/**
 * Barb's Book unit tests (design/barbs-book-spec.md, playtest fix-12).
 *
 * The load-bearing proof: a scripted WARM walkthrough (fed, helpful, present)
 * from Night 1 to Day 7, with the book read at both ends — at least two of
 * her observations must visibly change, or the Pleaser's instrument is flat.
 * Plus: tier boundaries at the Act-1 rescale, the verbatim Night-One echo,
 * the margins honesty rule, and the no-numerals discipline.
 *
 * pt2-fix-01: the Act 2 margins block proves the ledger stays alive Days
 * 8–19 — witnessed facts margin as the scenes plant them, gossip-borne
 * facts wait for the edge, private:* facts never surface, and the whole
 * table passes the page discipline.
 */

import { describe, expect, it } from 'vitest';
import {
  advance,
  applyEffects,
  CHARACTERS,
  initialState,
  type Effect,
  type WorldState,
} from '@not-here/engine';
import { buildBarbsBook, observationFor, staticLineFor } from './barbs-book.ts';
import { buildContent, OPENING_SCENE } from './content.ts';

const content = buildContent();

/** The warm route: eat everything, dry the pots, carry the tables, stay. */
const WARM_PATH = [
  'open-eyes', 'walk-to-town', 'go-in', 'sit', 'eat-all', 'say-his-name',
  'q1-window', 'q2-however', 'q3-on-the-tab', 'q4-heavy', 'q5-said-it-to-the-door',
  'sleep', 'listen',
  // Day 2: the delivery morning with Barb.
  'go-down', 'stay-for-delivery', 'take-the-cloth', 'to-evening', 'go-up', 'let-it-come',
  // Day 3: the room; the quilt taken.
  'to-room', 'remember-with-her', 'close-wardrobe', 'go-up', 'let-tomorrow',
  // Day 4: the walk-in.
  'to-errand', 'finish-out', 'look-longest', 'let-go',
  // Day 5: the hall; the tables carried.
  'help-at-the-hall', 'carry-tables', 'hum-the-turn', 'walk-back-down', 'turn-in',
  'let-morning-come',
  // Day 6: the hall; the honest answer in the lot.
  'go-to-the-hall', 'answer-plainly', 'back-up-the-hill', 'cross-the-lot',
  'say-i-dont-know', 'go-in-eventually',
  // Day 7: the last ordinary morning, given to Barb.
  'stay-the-morning',
] as const;

interface WarmRun {
  readonly day2: WorldState;
  readonly day7: WorldState;
}

const playWarm = (): WarmRun => {
  let step = advance(content, initialState(21, OPENING_SCENE), { kind: 'enter' });
  let day2: WorldState | undefined;
  for (const choiceId of WARM_PATH) {
    step = advance(content, step.state, { kind: 'choose', choiceId });
    if (day2 === undefined && step.state.day === 2) day2 = step.state;
  }
  if (day2 === undefined) throw new Error('warm walkthrough never reached Day 2');
  if (step.state.day !== 7) throw new Error(`warm walkthrough ended on day ${step.state.day}`);
  return { day2, day7: step.state };
};

const run = playWarm();

describe('tier movement — the warm route is visible in her hand', () => {
  it('at least two observations change between Day 2 and Day 7', () => {
    const early = buildBarbsBook(run.day2).observations;
    const late = buildBarbsBook(run.day7).observations;
    expect(early).toHaveLength(4);
    expect(late).toHaveLength(4);
    const moved = early.filter((line, i) => line !== late[i]).length;
    expect(moved, 'the Pleaser’s instrument must not flatline').toBeGreaterThanOrEqual(2);
  });

  it('the Act-1 rescale sits at low <4, mid 4–7, high ≥8', () => {
    expect(observationFor('name', 3)).toBe(observationFor('name', 0));
    expect(observationFor('name', 4)).toBe(observationFor('name', 7));
    expect(observationFor('name', 8)).toBe(observationFor('name', 10));
    expect(new Set([observationFor('name', 3), observationFor('name', 4), observationFor('name', 8)]).size).toBe(3);
  });

  it('the UNDERTOW mirror survives: the water line is the high tier', () => {
    expect(observationFor('undertow', 8)).toBe(
      'looks at the water the way the water looks at everyone.',
    );
  });
});

describe('the STATIC line — weather-deniable, never the fog as an agent', () => {
  it('has four distinct tiers at 0 / 16 / 30 / 60', () => {
    const lines = [staticLineFor(10), staticLineFor(16), staticLineFor(30), staticLineFor(60)];
    expect(new Set(lines).size).toBe(4);
    expect(lines[0]).toContain('the damp hasn’t got into her yet');
    expect(lines[1]).toContain('I write her twice and keep the second');
  });

  it('never names the fog', () => {
    for (const value of [0, 10, 16, 30, 60, 100]) {
      expect(staticLineFor(value)).not.toMatch(/fog/i);
    }
  });
});

describe('what you told her, Night One — verbatim, never slugs', () => {
  it('quotes all five interview answers in the player’s own words', () => {
    const { truths } = buildBarbsBook(run.day7);
    expect(truths).toEqual([
      '"The window."',
      '"However it comes."',
      '"Put dinner down as owed."',
      '"Heavy. Nothing wakes me."',
      '"I said it to the door."',
    ]);
  });

  it('is empty before the interview happens', () => {
    expect(buildBarbsBook(initialState(21, OPENING_SCENE)).truths).toEqual([]);
  });
});

describe('margins, other hands — only what Barb actually knows', () => {
  it('carries the warm route’s witnessed facts by Day 7', () => {
    const { heldFacts } = buildBarbsBook(run.day7);
    expect(heldFacts).toContain('sat the morning out with me.');
    expect(heldFacts).toContain('cleaned her plate the first night. wrote it plain.');
    expect(heldFacts).toContain('dries a pot properly. gone over twice, so it takes.');
  });

  it('gossip-only entries appear once the edge has carried them', () => {
    const before = applyEffects(initialState(21, OPENING_SCENE), [
      { op: 'fact.add', tag: 'helped-hall', witnessedBy: ['dianne'] },
    ]).state;
    expect(buildBarbsBook(before).heldFacts).not.toContain(
      'carried tables at the hall till the list ran out. Dianne told it twice.',
    );
    const after = applyEffects(before, [{ op: 'fact.learn', who: 'barb', tag: 'helped-hall' }]).state;
    expect(buildBarbsBook(after).heldFacts).toContain(
      'carried tables at the hall till the list ran out. Dianne told it twice.',
    );
  });
});

describe('margins, other hands — Act 2 keeps the ledger alive (pt2-fix-01)', () => {
  const plant = (effects: readonly Effect[]): WorldState =>
    applyEffects(initialState(21, OPENING_SCENE), effects).state;

  it('facts Barb witnesses first-hand margin as the scenes plant them', () => {
    // Tags + witnesses exactly as the Act 2 scene files add them:
    // day8.ts (the hub), day9.ts (her walk-in), day10.ts (the inked blank),
    // day13.ts (the potluck, all six in the hall), day17.ts (the mail run).
    const state = plant([
      { op: 'fact.add', tag: 'went-to-sams-shed-d8', witnessedBy: ['barb'] },
      { op: 'fact.add', tag: 'helped-walkin-d9', witnessedBy: ['barb'] },
      { op: 'fact.add', tag: 'barb-inked-the-blank', witnessedBy: ['barb'] },
      { op: 'fact.add', tag: 'potluck-verdict-defended', witnessedBy: CHARACTERS },
      { op: 'fact.add', tag: 'defended-sam', about: 'sam', witnessedBy: CHARACTERS },
      { op: 'fact.add', tag: 'ran-the-mail-d17', witnessedBy: ['barb'] },
    ]);
    const { heldFacts } = buildBarbsBook(state);
    expect(heldFacts).toContain(
      'went to the boat shed because Sam asked. asked. I wrote it the day it happened.',
    );
    expect(heldFacts).toContain(
      'shelved my walk-in for winter, every label face-out. I never asked for face-out.',
    );
    expect(heldFacts).toContain(
      'a blank on the hall list, beside her dish. she let me ink it. I inked it twice.',
    );
    expect(heldFacts).toContain(
      'the boy stood at the hall, and the room moved her way. chairs and all.',
    );
    expect(heldFacts).toContain(
      'spoke for the boy into all that quiet. it cost the room’s comfort. worth the ink.',
    );
    expect(heldFacts).toContain(
      'took my outgoing across in its elastic, ahead of the pickup. the mail came to no harm.',
    );
  });

  it('the exiled verdict and the given boy get their lines', () => {
    const { heldFacts } = buildBarbsBook(
      plant([
        { op: 'fact.add', tag: 'potluck-verdict-exiled', witnessedBy: CHARACTERS },
        { op: 'fact.add', tag: 'sacrificed-sam', about: 'sam', witnessedBy: CHARACTERS },
      ]),
    );
    expect(heldFacts).toContain(
      'the hall decided without one word said. I had no key to give her. I had nothing.',
    );
    expect(heldFacts).toContain(
      'told the boy to sit down, in the old cadence. I wrote it because it happened.',
    );
  });

  it('gossip-borne Act 2 facts wait for the dianne edge to carry them', () => {
    const before = plant([
      { op: 'fact.add', tag: 'signed-the-receipt-line', witnessedBy: ['dianne'] },
      { op: 'fact.add', tag: 'helped-dianne-parcels', witnessedBy: ['dianne'] },
    ]);
    expect(buildBarbsBook(before).heldFacts).toEqual([]);
    const after = applyEffects(before, [
      { op: 'fact.learn', who: 'barb', tag: 'signed-the-receipt-line' },
      { op: 'fact.learn', who: 'barb', tag: 'helped-dianne-parcels' },
    ]).state;
    expect(buildBarbsBook(after).heldFacts).toEqual([
      'signed the courier’s pad herself, Dianne says. the line held till morning. that is not nothing.',
      'held string while the hall’s dishes went home. every lid found its pot, Dianne says.',
    ]);
  });

  it('private facts never margin — even if Barb somehow held them', () => {
    // The gossip layer never carries private: tags; the table must hold
    // even against a forced learn. The letter night itself plants only
    // flags, so the Day-19 silence ruling is preserved by construction.
    const state = plant([
      { op: 'fact.add', tag: 'private:lullaby-taken', about: 'dianne', witnessedBy: ['dianne'] },
      { op: 'fact.add', tag: 'private:memory-taken', about: 'dianne', witnessedBy: ['dianne'] },
      { op: 'fact.add', tag: 'private:letter-memory-taken', about: 'priya', witnessedBy: ['priya'] },
      { op: 'fact.learn', who: 'barb', tag: 'private:lullaby-taken' },
      { op: 'fact.learn', who: 'barb', tag: 'private:memory-taken' },
      { op: 'fact.learn', who: 'barb', tag: 'private:letter-memory-taken' },
    ]);
    expect(buildBarbsBook(state).heldFacts).toEqual([]);
  });

  it('every Act 2 margin passes the page discipline', () => {
    // Light the whole Act 2 table at once (verdicts are exclusive in play;
    // for the discipline sweep both may burn) and run the page rules.
    const ACT2_TAGS = [
      'helped-stockroom',
      'went-to-sams-shed-d8',
      'went-to-clinic-d9',
      'helped-walkin-d9',
      'went-to-house-d10',
      'went-to-shed-d10',
      'barb-inked-the-blank',
      'signed-the-receipt-line',
      'helped-potluck-prep',
      'potluck-verdict-defended',
      'potluck-verdict-exiled',
      'defended-sam',
      'sacrificed-sam',
      'went-to-clinic-d17',
      'ran-the-mail-d17',
      'helped-dianne-parcels',
    ] as const;
    const state = plant(
      ACT2_TAGS.map((tag) => ({ op: 'fact.add', tag, witnessedBy: ['barb'] }) as const),
    );
    const { heldFacts } = buildBarbsBook(state);
    expect(heldFacts).toHaveLength(ACT2_TAGS.length);
    expect(new Set(heldFacts).size).toBe(heldFacts.length);
    for (const line of heldFacts) {
      expect(line, `numeral on the page: ${line}`).not.toMatch(/[0-9]/);
      expect(line, `stat name on the page: ${line}`).not.toMatch(
        /\b(FLESH|NAME|ECHO|UNDERTOW|STATIC|CHORD)\b/,
      );
      expect(line, `slug on the page: ${line}`).not.toMatch(/[a-z]+-[a-z]+-[a-z]+/);
      expect(line, `the title is on a budget: ${line}`).not.toMatch(/not\s+here/i);
      expect(line, `the name is on a budget: ${line}`).not.toMatch(/\bWren\b/);
    }
  });
});

describe('the discipline — what the page must never show', () => {
  it('no numerals outside the register line, no stat names, no slugs', () => {
    const book = buildBarbsBook(run.day7);
    const surfaces = [...book.observations, book.staticLine, ...book.heldFacts];
    for (const line of surfaces) {
      expect(line, `numeral on the page: ${line}`).not.toMatch(/[0-9]/);
      expect(line, `stat name on the page: ${line}`).not.toMatch(
        /\b(FLESH|NAME|ECHO|UNDERTOW|STATIC|CHORD)\b/,
      );
      expect(line, `slug on the page: ${line}`).not.toMatch(/[a-z]+-[a-z]+-[a-z]+/);
    }
  });

  it('the register doc keeps the NAME column blank and holds no numerals', () => {
    const { registerDoc } = buildBarbsBook(run.day7);
    expect(registerDoc).toContain('THE KETTLE — REGISTER');
    expect(registerDoc).toContain('supper,');
    // The kept chair: the entry row runs date → blank NAME → unit.
    const entryRow = registerDoc.split('\n').find((l) => l.includes('nov sixth'));
    expect(entryRow).toMatch(/nov sixth\s{10,}one/);
    // No numerals anywhere on the page (spec).
    expect(registerDoc).not.toMatch(/\d/);
  });
});
