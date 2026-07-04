import { describe, expect, it } from 'vitest';
import { applyEffect, applyEffects, type Effect } from './effects.ts';
import { initialState, type WorldState } from './state.ts';

/** Base state: stats { flesh: 3, name: 2, echo: 2, undertow: 1 }, chord 0, static 10. */
const base = initialState(1, 'start');

describe('applyEffect — stat.add', () => {
  it('adds to the stat and emits stat.changed with the raw delta', () => {
    const { state, events } = applyEffect(base, { op: 'stat.add', stat: 'flesh', value: 2 });
    expect(state.stats.flesh).toBe(5);
    expect(state.stats.name).toBe(2);
    expect(events).toEqual([{ kind: 'stat.changed', stat: 'flesh', delta: 2 }]);
  });

  it('clamps at 10', () => {
    const { state, events } = applyEffect(base, { op: 'stat.add', stat: 'flesh', value: 100 });
    expect(state.stats.flesh).toBe(10);
    expect(events).toEqual([{ kind: 'stat.changed', stat: 'flesh', delta: 100 }]);
  });

  it('clamps at 0', () => {
    const { state } = applyEffect(base, { op: 'stat.add', stat: 'undertow', value: -50 });
    expect(state.stats.undertow).toBe(0);
  });

  it('does not mutate the input state', () => {
    const { state } = applyEffect(base, { op: 'stat.add', stat: 'flesh', value: 1 });
    expect(base.stats.flesh).toBe(3);
    expect(state).not.toBe(base);
  });
});

describe('applyEffect — chord.add', () => {
  it('adds and emits music.chord with the new fragment count', () => {
    const { state, events } = applyEffect(base, { op: 'chord.add', value: 2 });
    expect(state.chord).toBe(2);
    expect(events).toEqual([{ kind: 'music.chord', fragments: 2 }]);
  });

  it('clamps at the upper bound 6', () => {
    const { state, events } = applyEffect(base, { op: 'chord.add', value: 99 });
    expect(state.chord).toBe(6);
    expect(events).toEqual([{ kind: 'music.chord', fragments: 6 }]);
  });

  it('clamps at the lower bound 0', () => {
    const { state, events } = applyEffect(base, { op: 'chord.add', value: -3 });
    expect(state.chord).toBe(0);
    expect(events).toEqual([{ kind: 'music.chord', fragments: 0 }]);
  });
});

describe('applyEffect — static.add', () => {
  it('adds and emits music.static with the new amount', () => {
    const { state, events } = applyEffect(base, { op: 'static.add', value: 15 });
    expect(state.staticMeter).toBe(25);
    expect(events).toEqual([{ kind: 'music.static', amount: 25 }]);
  });

  it('clamps to [0, 100]', () => {
    expect(applyEffect(base, { op: 'static.add', value: 500 }).state.staticMeter).toBe(100);
    expect(applyEffect(base, { op: 'static.add', value: -500 }).state.staticMeter).toBe(0);
  });
});

describe('applyEffect — flag.set', () => {
  it('sets the flag, emits no events, and preserves other flags', () => {
    const flagged: WorldState = { ...base, flags: { existing: 1 } };
    const { state, events } = applyEffect(flagged, { op: 'flag.set', key: 'door', value: 'open' });
    expect(state.flags).toEqual({ existing: 1, door: 'open' });
    expect(events).toEqual([]);
    expect(flagged.flags).toEqual({ existing: 1 });
  });
});

describe('applyEffect — fact.add', () => {
  it('appends a fact with sequential id and current day/slot', () => {
    const { state } = applyEffect(base, { op: 'fact.add', tag: 'saw-fog' });
    expect(state.facts).toEqual([{ id: 0, day: 1, slot: 'night', tag: 'saw-fog' }]);
    const { state: again } = applyEffect(state, { op: 'fact.add', tag: 'heard-song' });
    expect(again.facts.map((f) => f.id)).toEqual([0, 1]);
  });

  it('carries about and data only when provided', () => {
    const { state } = applyEffect(base, {
      op: 'fact.add',
      tag: 'confided',
      about: 'dianne',
      data: 'the moth thing',
    });
    expect(state.facts[0]).toEqual({
      id: 0,
      day: 1,
      slot: 'night',
      tag: 'confided',
      about: 'dianne',
      data: 'the moth thing',
    });

    const { state: bare } = applyEffect(base, { op: 'fact.add', tag: 'plain' });
    expect(bare.facts[0]).not.toHaveProperty('about');
    expect(bare.facts[0]).not.toHaveProperty('data');
  });

  it('auto-witnesses: witnessedBy characters learn the fact, others are unchanged', () => {
    const { state } = applyEffect(base, {
      op: 'fact.add',
      tag: 'saw-fog',
      witnessedBy: ['dianne', 'sam'],
    });
    expect(state.knownBy).toEqual({
      dianne: [0],
      wade: [],
      priya: [],
      sam: [0],
      barb: [],
      tam: [],
    });
  });

  it('with no witnessedBy, nobody learns the fact', () => {
    const { state } = applyEffect(base, { op: 'fact.add', tag: 'private' });
    expect(state.knownBy).toEqual(base.knownBy);
  });
});

describe('applyEffect — fact.learn', () => {
  const withFact = applyEffect(base, {
    op: 'fact.add',
    tag: 'saw-fog',
    witnessedBy: ['dianne'],
  }).state;

  it('adds the fact id to the learner', () => {
    const { state, events } = applyEffect(withFact, {
      op: 'fact.learn',
      who: 'wade',
      tag: 'saw-fog',
    });
    expect(state.knownBy.wade).toEqual([0]);
    expect(state.knownBy.dianne).toEqual([0]);
    expect(events).toEqual([]);
  });

  it('is idempotent: learning an already-known fact returns the state unchanged', () => {
    const { state } = applyEffect(withFact, { op: 'fact.learn', who: 'dianne', tag: 'saw-fog' });
    expect(state).toBe(withFact);
  });

  it('is a no-op when no fact with the tag exists', () => {
    const { state } = applyEffect(withFact, { op: 'fact.learn', who: 'priya', tag: 'nothing' });
    expect(state).toBe(withFact);
  });
});

describe('applyEffect — goto', () => {
  it('leaves state untouched and reports the target scene', () => {
    const result = applyEffect(base, { op: 'goto', scene: 'elsewhere' });
    expect(result.state).toBe(base);
    expect(result.events).toEqual([]);
    expect(result.goto).toBe('elsewhere');
  });
});

describe('applyEffects', () => {
  it('applies effects in order and accumulates events in order', () => {
    const effects: readonly Effect[] = [
      { op: 'stat.add', stat: 'flesh', value: 1 },
      { op: 'flag.set', key: 'k', value: true },
      { op: 'chord.add', value: 1 },
      { op: 'static.add', value: -5 },
    ];
    const { state, events, goto } = applyEffects(base, effects);
    expect(state.stats.flesh).toBe(4);
    expect(state.flags.k).toBe(true);
    expect(state.chord).toBe(1);
    expect(state.staticMeter).toBe(5);
    expect(goto).toBeUndefined();
    expect(events).toEqual([
      { kind: 'stat.changed', stat: 'flesh', delta: 1 },
      { kind: 'music.chord', fragments: 1 },
      { kind: 'music.static', amount: 5 },
    ]);
  });

  it('later goto wins over an earlier goto', () => {
    const { goto } = applyEffects(base, [
      { op: 'goto', scene: 'first' },
      { op: 'stat.add', stat: 'echo', value: 1 },
      { op: 'goto', scene: 'second' },
    ]);
    expect(goto).toBe('second');
  });

  it('an earlier goto survives trailing non-goto effects', () => {
    const { goto, state } = applyEffects(base, [
      { op: 'goto', scene: 'target' },
      { op: 'chord.add', value: 1 },
    ]);
    expect(goto).toBe('target');
    expect(state.chord).toBe(1);
  });

  it('empty effect list returns the same state and no events', () => {
    const result = applyEffects(base, []);
    expect(result.state).toBe(base);
    expect(result.events).toEqual([]);
    expect(result.goto).toBeUndefined();
  });
});
