import { describe, expect, it } from 'vitest';
import { advance, type EngineInput, type StepResult, type StoryContent } from './advance.ts';
import type { Scene } from './scene.ts';
import { defineScene } from './scene.ts';
import { initialState, type WorldState } from './state.ts';

/**
 * Mini fixture story: dock → shrine → gone(ending).
 * Exercises cues, onEnter effects, gated/hidden/locked choices,
 * effect-goto overriding choice.goto, and an ending scene.
 */
const scenes: readonly Scene[] = [
  defineScene({
    id: 'dock',
    prose: { kind: 'inline', paragraphs: [{ text: 'The dock creaks.' }] },
    cue: 'cue-dock',
    onEnter: [{ op: 'static.add', value: 5 }],
    choices: [
      {
        id: 'walk',
        label: 'Walk to the shrine',
        effects: [
          { op: 'stat.add', stat: 'flesh', value: 2 },
          { op: 'fact.add', tag: 'left-dock', witnessedBy: ['dianne'] },
        ],
        goto: 'shrine',
      },
      {
        id: 'sing',
        label: 'Sing the old song',
        when: { op: 'chord.gte', value: 3 },
        lockedLabel: 'Your throat holds no song yet',
        goto: 'shrine',
      },
      {
        id: 'whisper',
        label: 'Whisper the secret',
        when: { op: 'flag', key: 'knows-secret' },
        goto: 'shrine',
      },
      {
        id: 'vanish',
        label: 'Step off the edge',
        stakes: 'major',
        effects: [{ op: 'goto', scene: 'gone' }],
        goto: 'shrine',
      },
    ],
  }),
  defineScene({
    id: 'shrine',
    prose: { kind: 'inline', paragraphs: [{ text: 'Candles gutter.' }] },
    choices: [{ id: 'finish', label: 'Let go', goto: 'gone' }],
  }),
  defineScene({
    id: 'gone',
    prose: { kind: 'inline', paragraphs: [{ text: 'You are not here.' }] },
    cue: 'cue-gone',
    ending: 'the-fog-takes-you',
    choices: [],
  }),
];

const content: StoryContent = {
  scenes: new Map(scenes.map((s) => [s.id, s])),
  derived: { longing: (state) => state.staticMeter / 10 },
  realizeProse: (scene) =>
    scene.prose.kind === 'inline' ? scene.prose.paragraphs.map((p) => p.text) : [],
};

const start = (): WorldState => initialState(7, 'dock');

const deepFreeze = <T>(value: T): T => {
  if (value !== null && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const key of Object.getOwnPropertyNames(value)) {
      deepFreeze((value as Record<string, unknown>)[key]);
    }
  }
  return value;
};

describe('advance — enter', () => {
  it('emits music.cue first when the scene has a cue, then onEnter events', () => {
    const { events } = advance(content, start(), { kind: 'enter' });
    expect(events).toEqual([
      { kind: 'music.cue', cue: 'cue-dock' },
      { kind: 'music.static', amount: 15 },
    ]);
  });

  it('applies onEnter effects to the returned state', () => {
    const { state } = advance(content, start(), { kind: 'enter' });
    expect(state.staticMeter).toBe(15);
    expect(state.sceneId).toBe('dock');
  });

  it('omits music.cue when the scene has none', () => {
    const atShrine: WorldState = { ...start(), sceneId: 'shrine' };
    const { events } = advance(content, atShrine, { kind: 'enter' });
    expect(events).toEqual([]);
  });

  it('builds the view from realized prose and the post-onEnter state', () => {
    const { view } = advance(content, start(), { kind: 'enter' });
    expect(view.sceneId).toBe('dock');
    expect(view.paragraphs).toEqual(['The dock creaks.']);
    expect(view.ending).toBeUndefined();
  });

  it('throws on an unknown scene id', () => {
    const lost: WorldState = { ...start(), sceneId: 'nowhere' };
    expect(() => advance(content, lost, { kind: 'enter' })).toThrow('Unknown scene: nowhere');
  });
});

describe('advance — choice gating in the view', () => {
  it('shows open choices with locked:false, locked choices via lockedLabel, and hides the rest', () => {
    const { view } = advance(content, start(), { kind: 'enter' });
    expect(view.choices).toEqual([
      { id: 'walk', label: 'Walk to the shrine', locked: false },
      { id: 'sing', label: 'Your throat holds no song yet', locked: true },
      // 'whisper' has a failing gate and no lockedLabel → hidden entirely.
      { id: 'vanish', label: 'Step off the edge', locked: false, stakes: 'major' },
    ]);
  });

  it('unlocks a gated choice once its condition holds', () => {
    const tuned: WorldState = { ...start(), chord: 3, flags: { 'knows-secret': true } };
    const { view } = advance(content, tuned, { kind: 'enter' });
    expect(view.choices).toEqual([
      { id: 'walk', label: 'Walk to the shrine', locked: false },
      { id: 'sing', label: 'Sing the old song', locked: false },
      { id: 'whisper', label: 'Whisper the secret', locked: false },
      { id: 'vanish', label: 'Step off the edge', locked: false, stakes: 'major' },
    ]);
  });
});

describe('advance — choose', () => {
  it('throws on an unknown choice id', () => {
    expect(() => advance(content, start(), { kind: 'choose', choiceId: 'nope' })).toThrow(
      'Unknown choice nope in dock',
    );
  });

  it('throws when picking a locked choice', () => {
    expect(() => advance(content, start(), { kind: 'choose', choiceId: 'sing' })).toThrow(
      'Choice sing is locked in dock',
    );
  });

  it('allows a previously locked choice once its gate passes', () => {
    const tuned: WorldState = { ...start(), chord: 3 };
    const { state } = advance(content, tuned, { kind: 'choose', choiceId: 'sing' });
    expect(state.sceneId).toBe('shrine');
  });

  it('appends to choiceLog with the pre-choice day and slot', () => {
    const { state } = advance(content, start(), { kind: 'choose', choiceId: 'walk' });
    expect(state.choiceLog).toEqual([{ scene: 'dock', choice: 'walk', day: 1, slot: 'night' }]);
  });

  it('applies choice effects then enters the target scene', () => {
    const { state, view, events } = advance(content, start(), {
      kind: 'choose',
      choiceId: 'walk',
    });
    expect(state.sceneId).toBe('shrine');
    expect(state.stats.flesh).toBe(5);
    expect(state.facts).toEqual([{ id: 0, day: 1, slot: 'night', tag: 'left-dock' }]);
    expect(state.knownBy.dianne).toEqual([0]);
    expect(view.sceneId).toBe('shrine');
    // Choice events come before entry events (shrine has no cue/onEnter).
    expect(events).toEqual([{ kind: 'stat.changed', stat: 'flesh', delta: 2 }]);
  });

  it('an effect goto overrides the choice goto', () => {
    const { state, view } = advance(content, start(), { kind: 'choose', choiceId: 'vanish' });
    expect(state.sceneId).toBe('gone');
    expect(view.sceneId).toBe('gone');
  });
});

describe('advance — endings', () => {
  it('entering an ending scene emits save.autosave and sets view.ending', () => {
    const { events, view } = advance(content, start(), { kind: 'choose', choiceId: 'vanish' });
    expect(view.ending).toBe('the-fog-takes-you');
    expect(events).toEqual([
      { kind: 'music.cue', cue: 'cue-gone' },
      { kind: 'save.autosave' },
    ]);
  });
});

describe('advance — determinism', () => {
  const script: readonly EngineInput[] = [
    { kind: 'enter' },
    { kind: 'choose', choiceId: 'walk' },
    { kind: 'choose', choiceId: 'finish' },
  ];

  const run = (): readonly StepResult[] => {
    let state = start();
    return script.map((input) => {
      const step = advance(content, state, input);
      state = step.state;
      return step;
    });
  };

  it('same content, state, and input sequence produce deep-equal results twice', () => {
    const first = run();
    const second = run();
    expect(second).toEqual(first);
    expect(second[second.length - 1]?.state).toEqual(first[first.length - 1]?.state);
    expect(first[first.length - 1]?.view.ending).toBe('the-fog-takes-you');
  });
});

describe('advance — immutability', () => {
  it('never mutates the input state on enter (deep-frozen input)', () => {
    const frozen = deepFreeze(start());
    expect(() => advance(content, frozen, { kind: 'enter' })).not.toThrow();
    expect(frozen).toEqual(start());
  });

  it('never mutates the input state on choose (deep-frozen input)', () => {
    const frozen = deepFreeze(start());
    const { state } = advance(content, frozen, { kind: 'choose', choiceId: 'walk' });
    expect(frozen).toEqual(start());
    expect(state).not.toBe(frozen);
    expect(state.choiceLog).toHaveLength(1);
    expect(frozen.choiceLog).toHaveLength(0);
  });

  it('never mutates a deep-frozen mid-story state through an ending', () => {
    const walked = advance(content, deepFreeze(start()), {
      kind: 'choose',
      choiceId: 'walk',
    }).state;
    const frozen = deepFreeze(walked);
    const snapshot = JSON.parse(JSON.stringify(frozen)) as unknown;
    expect(() => advance(content, frozen, { kind: 'choose', choiceId: 'finish' })).not.toThrow();
    expect(JSON.parse(JSON.stringify(frozen))).toEqual(snapshot);
  });
});
