import { describe, expect, it } from 'vitest';
import { evaluate, type Cond, type DerivedResolvers } from './conditions.ts';
import { initialState, type WorldState } from './state.ts';

const NO_DERIVED: DerivedResolvers = {};

/** Base state: stats { flesh: 3, name: 2, echo: 2, undertow: 1 }, chord 0, static 10, day 1. */
const base = initialState(1, 'start');

const withFacts = (state: WorldState): WorldState => ({
  ...state,
  facts: [
    { id: 0, day: 1, slot: 'night', tag: 'saw-fog' },
    { id: 1, day: 1, slot: 'night', tag: 'heard-song', about: 'dianne' },
  ],
  knownBy: { ...state.knownBy, dianne: [0], wade: [1] },
});

const check = (cond: Cond, state: WorldState = base, derived: DerivedResolvers = NO_DERIVED) =>
  evaluate(cond, state, derived);

describe('evaluate — leaf ops', () => {
  it('always is true', () => {
    expect(check({ op: 'always' })).toBe(true);
  });

  it('stat.gte compares against the named stat', () => {
    expect(check({ op: 'stat.gte', stat: 'flesh', value: 3 })).toBe(true);
    expect(check({ op: 'stat.gte', stat: 'flesh', value: 4 })).toBe(false);
  });

  it('stat.lte compares against the named stat', () => {
    expect(check({ op: 'stat.lte', stat: 'undertow', value: 1 })).toBe(true);
    expect(check({ op: 'stat.lte', stat: 'undertow', value: 0 })).toBe(false);
  });

  it('chord.gte compares against chord', () => {
    expect(check({ op: 'chord.gte', value: 0 })).toBe(true);
    expect(check({ op: 'chord.gte', value: 1 })).toBe(false);
    expect(check({ op: 'chord.gte', value: 3 }, { ...base, chord: 3 })).toBe(true);
  });

  it('static.gte / static.lte compare against staticMeter', () => {
    expect(check({ op: 'static.gte', value: 10 })).toBe(true);
    expect(check({ op: 'static.gte', value: 11 })).toBe(false);
    expect(check({ op: 'static.lte', value: 10 })).toBe(true);
    expect(check({ op: 'static.lte', value: 9 })).toBe(false);
  });

  it('day.gte / day.lte compare against day', () => {
    expect(check({ op: 'day.gte', value: 1 })).toBe(true);
    expect(check({ op: 'day.gte', value: 2 })).toBe(false);
    expect(check({ op: 'day.lte', value: 1 })).toBe(true);
    expect(check({ op: 'day.lte', value: 0 })).toBe(false);
  });
});

describe('evaluate — flag', () => {
  const flagged: WorldState = {
    ...base,
    flags: { truthy: true, falsy: false, count: 0, label: 'moth' },
  };

  it('without value checks truthiness', () => {
    expect(check({ op: 'flag', key: 'truthy' }, flagged)).toBe(true);
    expect(check({ op: 'flag', key: 'falsy' }, flagged)).toBe(false);
    expect(check({ op: 'flag', key: 'count' }, flagged)).toBe(false);
    expect(check({ op: 'flag', key: 'missing' }, flagged)).toBe(false);
  });

  it('with value checks strict equality', () => {
    expect(check({ op: 'flag', key: 'count', value: 0 }, flagged)).toBe(true);
    expect(check({ op: 'flag', key: 'count', value: 1 }, flagged)).toBe(false);
    expect(check({ op: 'flag', key: 'label', value: 'moth' }, flagged)).toBe(true);
    expect(check({ op: 'flag', key: 'label', value: 'wasp' }, flagged)).toBe(false);
    expect(check({ op: 'flag', key: 'missing', value: true }, flagged)).toBe(false);
  });
});

describe('evaluate — facts', () => {
  const state = withFacts(base);

  it('fact.exists finds a fact by tag', () => {
    expect(check({ op: 'fact.exists', tag: 'saw-fog' }, state)).toBe(true);
    expect(check({ op: 'fact.exists', tag: 'nothing' }, state)).toBe(false);
  });

  it('fact.knownBy requires the character to know a fact with that tag', () => {
    expect(check({ op: 'fact.knownBy', who: 'dianne', tag: 'saw-fog' }, state)).toBe(true);
    expect(check({ op: 'fact.knownBy', who: 'wade', tag: 'heard-song' }, state)).toBe(true);
    // Fact exists but this character never witnessed it.
    expect(check({ op: 'fact.knownBy', who: 'wade', tag: 'saw-fog' }, state)).toBe(false);
    // Character knows some fact, but not one with this tag.
    expect(check({ op: 'fact.knownBy', who: 'dianne', tag: 'heard-song' }, state)).toBe(false);
    // Nobody knows anything about a tag with no facts.
    expect(check({ op: 'fact.knownBy', who: 'priya', tag: 'nothing' }, state)).toBe(false);
  });
});

describe('evaluate — derived.gte', () => {
  it('calls the named resolver with the state', () => {
    const derived: DerivedResolvers = {
      trust: (state) => state.stats.flesh * 2,
    };
    expect(check({ op: 'derived.gte', key: 'trust', value: 6 }, base, derived)).toBe(true);
    expect(check({ op: 'derived.gte', key: 'trust', value: 7 }, base, derived)).toBe(false);
  });

  it('throws on an unknown derived key', () => {
    expect(() => check({ op: 'derived.gte', key: 'nope', value: 1 })).toThrow(
      'Unknown derived key: nope',
    );
  });
});

describe('evaluate — combinators', () => {
  const T: Cond = { op: 'always' };
  const F: Cond = { op: 'chord.gte', value: 99 };

  it('all is true only when every child is true (empty → true)', () => {
    expect(check({ op: 'all', of: [T, T] })).toBe(true);
    expect(check({ op: 'all', of: [T, F] })).toBe(false);
    expect(check({ op: 'all', of: [] })).toBe(true);
  });

  it('any is true when at least one child is true (empty → false)', () => {
    expect(check({ op: 'any', of: [F, T] })).toBe(true);
    expect(check({ op: 'any', of: [F, F] })).toBe(false);
    expect(check({ op: 'any', of: [] })).toBe(false);
  });

  it('not inverts its child', () => {
    expect(check({ op: 'not', of: F })).toBe(true);
    expect(check({ op: 'not', of: T })).toBe(false);
  });

  it('evaluates deeply nested combinators', () => {
    const nested: Cond = {
      op: 'all',
      of: [
        { op: 'any', of: [F, { op: 'not', of: F }] },
        {
          op: 'not',
          of: { op: 'all', of: [T, F] },
        },
        { op: 'stat.gte', stat: 'flesh', value: 1 },
      ],
    };
    expect(check(nested)).toBe(true);

    const nestedFalse: Cond = {
      op: 'any',
      of: [{ op: 'all', of: [T, { op: 'not', of: T }] }, F],
    };
    expect(check(nestedFalse)).toBe(false);
  });
});
