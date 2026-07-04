import { describe, expect, it } from 'vitest';
import { isFallback, selectLine, specificity } from './rules.ts';
import type { DialogueRule } from './rules.ts';
import { makeResolvers } from './resolvers.ts';
import { makeState } from './testing/fixtures.ts';

const derived = makeResolvers();

const fallback: DialogueRule = {
  id: 'barb-greeting-default',
  speaker: 'barb',
  slot: 'greeting',
  text: 'Evening, pet. Usual table?',
};

describe('isFallback / specificity', () => {
  it('classifies zero-condition rules as fallbacks', () => {
    expect(isFallback(fallback)).toBe(true);
    expect(isFallback({ ...fallback, when: { op: 'always' } })).toBe(false);
    expect(isFallback({ ...fallback, requires: ['kindness'] })).toBe(false);
  });

  it('scores conditions + requires + salience, counting nested leaves', () => {
    const rule: DialogueRule = {
      ...fallback,
      id: 'scored',
      when: {
        op: 'all',
        of: [
          { op: 'day.gte', value: 3 },
          { op: 'not', of: { op: 'flag', key: 'wake-done' } },
        ],
      },
      requires: ['lie-caught'],
      salience: 2,
    };
    expect(specificity(rule)).toBe(2 + 1 + 2);
    expect(specificity(fallback)).toBe(0);
  });
});

describe('selectLine', () => {
  it('falls back to the zero-condition rule when nothing else passes', () => {
    const rules: readonly DialogueRule[] = [
      fallback,
      {
        id: 'barb-greeting-day10',
        speaker: 'barb',
        slot: 'greeting',
        when: { op: 'day.gte', value: 10 },
        text: 'Still here, then.',
      },
    ];
    const picked = selectLine(rules, 'barb', 'greeting', makeState([]), derived);
    expect(picked.id).toBe('barb-greeting-default');
  });

  it('picks the most specific passing rule', () => {
    const state = makeState([{ tag: 'lie-caught', knownBy: ['barb'] }]);
    const rules: readonly DialogueRule[] = [
      fallback,
      {
        id: 'barb-greeting-lied',
        speaker: 'barb',
        slot: 'greeting',
        requires: ['lie-caught'],
        text: 'Careful with your stories in my house.',
      },
      {
        id: 'barb-greeting-lied-day1',
        speaker: 'barb',
        slot: 'greeting',
        when: { op: 'day.lte', value: 1 },
        requires: ['lie-caught'],
        text: 'First night and already a story that does not hold water.',
      },
    ];
    const picked = selectLine(rules, 'barb', 'greeting', state, derived);
    expect(picked.id).toBe('barb-greeting-lied-day1');
  });

  it('skips rules requiring facts the speaker does not know', () => {
    const state = makeState([{ tag: 'lie-caught', knownBy: ['priya'] }]);
    const rules: readonly DialogueRule[] = [
      fallback,
      {
        id: 'barb-greeting-lied',
        speaker: 'barb',
        slot: 'greeting',
        requires: ['lie-caught'],
        text: 'Careful with your stories in my house.',
      },
    ];
    const picked = selectLine(rules, 'barb', 'greeting', state, derived);
    expect(picked.id).toBe('barb-greeting-default');
  });

  it('uses salience as a bonus to break specificity', () => {
    const state = makeState([
      { tag: 'kindness', knownBy: ['barb'] },
      { tag: 'lie-caught', knownBy: ['barb'] },
    ]);
    const rules: readonly DialogueRule[] = [
      fallback,
      {
        id: 'barb-greeting-kind',
        speaker: 'barb',
        slot: 'greeting',
        requires: ['kindness'],
        text: 'Word gets around, you know. The good kind.',
      },
      {
        id: 'barb-greeting-lied',
        speaker: 'barb',
        slot: 'greeting',
        requires: ['lie-caught'],
        salience: 5,
        text: 'Careful with your stories in my house.',
      },
    ];
    const picked = selectLine(rules, 'barb', 'greeting', state, derived);
    expect(picked.id).toBe('barb-greeting-lied');
  });

  it('breaks ties deterministically by lexicographic rule id', () => {
    const state = makeState([{ tag: 'kindness', knownBy: ['barb'] }]);
    const tied = (id: string): DialogueRule => ({
      id,
      speaker: 'barb',
      slot: 'greeting',
      requires: ['kindness'],
      text: id,
    });
    const rules = [fallback, tied('b-rule'), tied('a-rule'), tied('c-rule')];
    const picked = selectLine(rules, 'barb', 'greeting', state, derived);
    expect(picked.id).toBe('a-rule');
    // Order-independence: reversing the list picks the same rule.
    const reversed = selectLine([...rules].reverse(), 'barb', 'greeting', state, derived);
    expect(reversed.id).toBe('a-rule');
  });

  it('never picks the fallback while a conditional rule passes, even with high fallback salience', () => {
    const state = makeState([{ tag: 'kindness', knownBy: ['barb'] }]);
    const rules: readonly DialogueRule[] = [
      { ...fallback, salience: 100 },
      {
        id: 'barb-greeting-kind',
        speaker: 'barb',
        slot: 'greeting',
        requires: ['kindness'],
        text: 'Word gets around.',
      },
    ];
    const picked = selectLine(rules, 'barb', 'greeting', state, derived);
    expect(picked.id).toBe('barb-greeting-kind');
  });

  it('supports derived-axis conditions through the engine Cond language', () => {
    const state = makeState([{ tag: 'lie-caught', knownBy: ['priya'] }]);
    const rules: readonly DialogueRule[] = [
      { id: 'priya-wake-default', speaker: 'priya', slot: 'wake-verdict', text: 'I have questions.' },
      {
        id: 'priya-wake-distrust',
        speaker: 'priya',
        slot: 'wake-verdict',
        when: { op: 'not', of: { op: 'derived.gte', key: 'trust:priya', value: 3 } },
        text: 'You were not there for that. So how do you carry it?',
      },
    ];
    const picked = selectLine(rules, 'priya', 'wake-verdict', state, derived);
    expect(picked.id).toBe('priya-wake-distrust');
  });

  it('throws a clear error naming the (speaker, slot) missing a fallback', () => {
    const rules: readonly DialogueRule[] = [
      {
        id: 'sam-test-trap',
        speaker: 'sam',
        slot: 'trap-question',
        when: { op: 'day.gte', value: 2 },
        text: 'Remember the jetty joke?',
      },
    ];
    expect(() =>
      selectLine(rules, 'sam', 'trap-question', makeState([]), derived),
    ).toThrowError(/speaker "sam".*slot "trap-question"/);
  });

  it('throws when there are no rules at all for the slot', () => {
    expect(() =>
      selectLine([], 'tam', 'ferry-talk', makeState([]), derived),
    ).toThrowError(/speaker "tam".*slot "ferry-talk"/);
  });
});
