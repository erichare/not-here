import { describe, expect, it } from 'vitest';
import { CHARACTERS, evaluate } from '@not-here/engine';
import { AXES, AXIS_BASELINE } from './axes.ts';
import { derivedKey, makeResolvers } from './resolvers.ts';
import { makeState } from './testing/fixtures.ts';

describe('makeResolvers', () => {
  it('exposes trust/warmth/fear keys for all six characters', () => {
    const resolvers = makeResolvers();
    const keys = Object.keys(resolvers).sort();
    const expected = CHARACTERS.flatMap((who) =>
      AXES.map((axis) => derivedKey(axis, who)),
    ).sort();
    expect(keys).toEqual(expected);
    expect(keys).toHaveLength(18);
  });

  it('resolves axis values from the crafted state', () => {
    const resolvers = makeResolvers();
    const state = makeState([
      { tag: 'kindness', knownBy: ['dora'] },
      { tag: 'lie-caught', knownBy: ['ivy'] },
    ]);
    expect(resolvers['warmth:dora']?.(state)).toBe(AXIS_BASELINE + 1);
    expect(resolvers['trust:ivy']?.(state)).toBe(AXIS_BASELINE - 3);
    expect(resolvers['fear:sam']?.(state)).toBe(AXIS_BASELINE);
  });

  it('plugs into the engine condition language via derived.gte', () => {
    const resolvers = makeResolvers();
    const state = makeState([{ tag: 'kindness', knownBy: ['maud'] }]);
    expect(
      evaluate({ op: 'derived.gte', key: 'warmth:maud', value: 6 }, state, resolvers),
    ).toBe(true);
    expect(
      evaluate({ op: 'derived.gte', key: 'warmth:elias', value: 6 }, state, resolvers),
    ).toBe(false);
  });

  it('honors a custom weight table', () => {
    const resolvers = makeResolvers([
      { tag: 'kindness', axis: 'fear', delta: 4 },
    ]);
    const state = makeState([{ tag: 'kindness', knownBy: ['tam'] }]);
    expect(resolvers['fear:tam']?.(state)).toBe(AXIS_BASELINE + 4);
    // kindness→warmth rule from the default table is absent in the custom one
    expect(resolvers['warmth:tam']?.(state)).toBe(AXIS_BASELINE);
  });
});
