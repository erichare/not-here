import { describe, expect, it } from 'vitest';
import { initialState, type WorldState } from '@not-here/engine';
import { buildBarbsBook } from '@not-here/story';
import {
  buildBookPage,
  isBookUnlocked,
  observationFor,
  staticLineFor,
  staticTierFor,
} from './book.ts';

const SEED = 7;

const base = (): WorldState => initialState(SEED, 'n1-arrival');

// The unlock is the flag n1-room sets when Barb closes the book on your
// line ('barbs-book:unlocked') — shared with the CLI via @not-here/story.
const withInterview = (state: WorldState): WorldState => ({
  ...state,
  flags: { ...state.flags, 'barbs-book:unlocked': true },
  choiceLog: [
    ...state.choiceLog,
    { scene: 'n1-interview-1', choice: 'q1-booth', day: 1, slot: 'night' },
    { scene: 'n1-interview-2', choice: 'q2-two-heaped', day: 1, slot: 'night' },
    { scene: 'n1-interview-3', choice: 'q3-whats-true', day: 1, slot: 'night' },
    { scene: 'n1-interview-4', choice: 'q4-light', day: 1, slot: 'night' },
    { scene: 'n1-interview-5', choice: 'q5-never-do', day: 1, slot: 'night' },
  ],
});

describe('unlock gating', () => {
  it('stays shut before Barb closes the book on your line', () => {
    expect(isBookUnlocked(base())).toBe(false);
  });

  it('stays shut mid-interview', () => {
    const mid: WorldState = {
      ...base(),
      choiceLog: [{ scene: 'n1-interview-3', choice: 'q3-whats-true', day: 1, slot: 'night' }],
    };
    expect(isBookUnlocked(mid)).toBe(false);
  });

  it('opens once the room scene sets the flag', () => {
    expect(isBookUnlocked(withInterview(base()))).toBe(true);
  });
});

describe('the page', () => {
  it('shows no numerals anywhere, ever', () => {
    const state: WorldState = {
      ...withInterview(base()),
      staticMeter: 72,
      facts: [{ id: 0, day: 2, slot: 'morning', tag: 'kept-barb-company' }],
      knownBy: { ...base().knownBy, barb: [0] },
    };
    const page = buildBookPage(state);
    const everything = [
      page.registerDoc,
      ...page.observations,
      page.staticLine,
      ...page.told,
      ...page.margins,
    ].join('\n');
    expect(everything).not.toMatch(/\d/);
  });

  it('keeps the register entry with the NAME column blank', () => {
    const page = buildBookPage(base());
    expect(page.registerDoc).toContain('THE KETTLE — REGISTER');
    expect(page.registerDoc).toContain('nov sixth');
    expect(page.registerDoc).toContain('supper,');
    // Nothing but her columns' silence between the date and the party.
    expect(page.registerDoc).toMatch(/nov sixth +one/);
  });

  it('quotes the interview answers verbatim, in the player’s own words', () => {
    const page = buildBookPage(withInterview(base()));
    expect(page.told).toContain('"Two. Heaped."');
    expect(page.told).toContain('"The booth."');
    expect(page.told).toHaveLength(5);
    // Never tag slugs.
    expect(page.told.join(' ')).not.toContain('q2-two-heaped');
  });

  it('writes margins only for facts Barb knows', () => {
    const facts = [
      { id: 0, day: 2, slot: 'morning', tag: 'kept-barb-company' },
      { id: 1, day: 2, slot: 'morning', tag: 'went-to-dianne' },
    ] as const;
    const seen = buildBookPage({
      ...base(),
      facts: [...facts],
      knownBy: { ...base().knownBy, barb: [0] },
    });
    expect(seen.margins).toEqual(['sat the morning out with me.']);
    const unseen = buildBookPage({ ...base(), facts: [...facts] });
    expect(unseen.margins).toEqual([]);
  });

  it('is the shared @not-here/story page verbatim — CLI parity', () => {
    const state: WorldState = {
      ...withInterview(base()),
      staticMeter: 34,
      facts: [
        { id: 0, day: 2, slot: 'morning', tag: 'kept-barb-company' },
        { id: 1, day: 2, slot: 'evening', tag: 'ate-first-meal' },
      ],
      knownBy: { ...base().knownBy, barb: [0, 1] },
    };
    const book = buildBarbsBook(state);
    const page = buildBookPage(state);
    expect(page.observations).toEqual(book.observations);
    expect(page.staticLine).toBe(book.staticLine);
    expect(page.told).toEqual(book.truths);
    expect(page.margins).toEqual(book.heldFacts);
  });

  it('rescales observation tiers to the Act-1 range', () => {
    expect(observationFor('flesh', 3)).toBe('the chair does not creak under her. it should.');
    expect(observationFor('flesh', 4)).toBe('casts a shadow now, when the lamp is on her side.');
    expect(observationFor('flesh', 7)).toBe('casts a shadow now, when the lamp is on her side.');
    expect(observationFor('flesh', 8)).toBe('solid enough to shoulder a casket, lately.');
    // The Refuser's only mirror survives every rewrite.
    expect(observationFor('undertow', 9)).toBe(
      'looks at the water the way the water looks at everyone.',
    );
  });

  it('lets the static line degrade tier by tier', () => {
    expect(staticTierFor(10)).toBe('clear');
    expect(staticLineFor(10)).toContain('the damp hasn’t got into her yet');
    expect(staticTierFor(16)).toBe('inked');
    expect(staticLineFor(16)).toContain('I write her twice and keep the second');
    expect(staticTierFor(30)).toBe('hissing');
    expect(staticLineFor(45)).toContain('a hiss under her vowels');
    expect(staticTierFor(60)).toBe('walking');
    expect(staticLineFor(80)).toContain('the letters walk');
  });
});
