import { describe, expect, it } from 'vitest';
import { applyEffects, type Effect } from './effects.ts';
import { advance, type StoryContent } from './advance.ts';
import { initialState } from './state.ts';
import { defineScene } from './scene.ts';
import type { DerivedResolvers } from './conditions.ts';

const derived: DerivedResolvers = { 'trust:barb': () => 7 };

describe('when effect', () => {
  it('applies then-branch when the condition holds', () => {
    const effects: readonly Effect[] = [
      {
        op: 'when',
        cond: { op: 'derived.gte', key: 'trust:barb', value: 5 },
        then: [{ op: 'stat.add', stat: 'flesh', value: 1 }],
        else: [{ op: 'stat.add', stat: 'flesh', value: -1 }],
      },
    ];
    const state = initialState(1, 'x');
    const result = applyEffects(state, effects, derived);
    expect(result.state.stats.flesh).toBe(state.stats.flesh + 1);
  });

  it('applies else-branch when the condition fails, and nests', () => {
    const effects: readonly Effect[] = [
      {
        op: 'when',
        cond: { op: 'flag', key: 'horn-stopped' },
        then: [
          {
            op: 'when',
            cond: { op: 'stat.gte', stat: 'flesh', value: 1 },
            then: [{ op: 'stat.add', stat: 'flesh', value: -1 }],
          },
        ],
        else: [{ op: 'flag.set', key: 'fed', value: true }],
      },
    ];
    const off = applyEffects(initialState(1, 'x'), effects, derived);
    expect(off.state.flags['fed']).toBe(true);

    const on = applyEffects(
      { ...initialState(1, 'x'), flags: { 'horn-stopped': true } },
      effects,
      derived,
    );
    expect(on.state.stats.flesh).toBe(2);
  });
});

describe('emit effect', () => {
  it('raises the event without touching state', () => {
    const state = initialState(1, 'x');
    const result = applyEffects(
      state,
      [
        { op: 'emit', event: { kind: 'music.detune', pattern: 'wade', cents: -50 } },
        { op: 'emit', event: { kind: 'tell.visual', text: 'a quarter-turn flat' } },
      ],
      derived,
    );
    expect(result.state).toEqual(state);
    expect(result.events).toEqual([
      { kind: 'music.detune', pattern: 'wade', cents: -50 },
      { kind: 'tell.visual', text: 'a quarter-turn flat' },
    ]);
  });
});

describe('postDay hook', () => {
  const scenes = [
    defineScene({
      id: 'a',
      prose: { kind: 'inline', paragraphs: [{ text: 'x' }] },
      choices: [
        {
          id: 'next-day',
          label: 'sleep',
          effects: [{ op: 'time.set', day: 2, slot: 'morning' }],
          goto: 'b',
        },
        { id: 'stay', label: 'stay', goto: 'b' },
      ],
    }),
    defineScene({ id: 'b', prose: { kind: 'inline', paragraphs: [{ text: 'y' }] }, choices: [] }),
  ];
  const content = (postDay?: StoryContent['postDay']): StoryContent => ({
    scenes: new Map(scenes.map((s) => [s.id, s])),
    derived,
    realizeProse: () => ['p'],
    ...(postDay ? { postDay } : {}),
  });

  it('runs exactly when the day increases', () => {
    const marked = content((s) => ({ ...s, flags: { ...s.flags, gossiped: true } }));
    const start = initialState(1, 'a');
    const crossed = advance(marked, start, { kind: 'choose', choiceId: 'next-day' });
    expect(crossed.state.flags['gossiped']).toBe(true);

    const stayed = advance(marked, start, { kind: 'choose', choiceId: 'stay' });
    expect(stayed.state.flags['gossiped']).toBeUndefined();
  });
});
