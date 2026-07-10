/**
 * Day 7 content tests — the act's climax (design/act1-beats.md §Day 7).
 *
 * Covers: the single quiet morning slot (Day 7 by design owes no without-you
 * retellings — there is nothing simultaneous to miss), the register clue
 * plant (@doc, NAME column still blank), the railroaded walk (< 120 words,
 * posture-only), the Foghorn Choice (an open question that returns to the
 * two final options), both branch outcomes with correctly witnessed facts,
 * the decay-seeding announcement, and the ACT TWO card at 'act1-end'.
 */

import { describe, expect, it } from 'vitest';
import {
  advance,
  applyEffects,
  initialState,
  type Effect,
  type EngineEvent,
  type SceneView,
  type WorldState,
} from '@not-here/engine';
import { isFallback } from '@not-here/memory';
import { buildContent } from './content.ts';
import { RULES } from './dialogue-day7.ts';
import { DAY7_SCENES } from './scenes/day7.ts';

const content = buildContent();

interface Step {
  readonly state: WorldState;
  readonly view: SceneView;
  readonly events: readonly EngineEvent[];
}

const enterDay7 = (seed = 7): Step =>
  advance(content, initialState(seed, 'd7-morning'), { kind: 'enter' });

const choose = (step: Step, choiceId: string): Step =>
  advance(content, step.state, { kind: 'choose', choiceId });

const sceneText = (sceneId: string): string => {
  const scene = DAY7_SCENES.find((s) => s.id === sceneId);
  if (!scene || scene.prose.kind !== 'inline') throw new Error(`missing ${sceneId}`);
  return scene.prose.paragraphs.map((p) => p.text).join('\n');
};

/** Every effect in a scene, flattened through 'when' branches. */
const flattenEffects = (effects: readonly Effect[]): readonly Effect[] =>
  effects.flatMap((e) =>
    e.op === 'when'
      ? [e, ...flattenEffects(e.then), ...flattenEffects(e.else ?? [])]
      : [e],
  );

const allDay7Effects = (): readonly Effect[] =>
  DAY7_SCENES.flatMap((scene) => [
    ...flattenEffects(scene.onEnter ?? []),
    ...scene.choices.flatMap((c) => flattenEffects(c.effects ?? [])),
  ]);

describe('day 7 structure — the single quiet slot', () => {
  it('d7-morning sets day 7, morning slot, on entry', () => {
    const step = enterDay7();
    expect(step.state.day).toBe(7);
    expect(step.state.slot).toBe('morning');
  });

  it('offers one slot: every morning choice leads to the same evening', () => {
    const morning = DAY7_SCENES.find((s) => s.id === 'd7-morning');
    expect(morning).toBeDefined();
    for (const choice of morning?.choices ?? []) {
      expect(choice.goto).toBe('d7-evening');
    }
  });

  it('walks the fixed spine morning → evening → walk → hornroom', () => {
    const step = choose(
      choose(choose(enterDay7(), 'stay-the-morning'), 'cross-the-lot'),
      'for-sam',
    );
    expect(step.state.sceneId).toBe('d7-hornroom');
    expect(step.state.slot).toBe('night');
  });
});

describe('the register clue (thread beat 2)', () => {
  it('renders the book as a document with the NAME column blank', () => {
    const text = sceneText('d7-morning');
    expect(text).toContain('@doc:');
    expect(text).toContain('NAME');
    // The one November line carries date, unit, remarks — and no name.
    expect(text).toMatch(/Nov 6\s+1\s+supper,/);
    expect(text).toContain('still open, six days now');
    expect(text).toContain('a first hand has faded to a pressure mark');
  });

  it('nobody comments — no question, no answer, in the morning prose', () => {
    const view = enterDay7().view;
    const prose = view.paragraphs.join('\n');
    expect(prose).toContain('NAME');
    expect(prose).not.toMatch(/\?/); // a morning without a single question
  });
});

describe('the walk — the act’s one railroad', () => {
  it('offers posture choices only; every one enters the horn room', () => {
    const walk = DAY7_SCENES.find((s) => s.id === 'd7-walk');
    expect(walk?.choices.map((c) => c.goto)).toEqual([
      'd7-hornroom',
      'd7-hornroom',
      'd7-hornroom',
    ]);
    expect(walk?.choices.every((c) => c.when === undefined)).toBe(true);
  });

  it('is under 120 words and arrives at 3:12, the fog parting along the boards', () => {
    const text = sceneText('d7-walk');
    const words = text.split(/\s+/).filter((t) => /[0-9a-z’']/i.test(t));
    expect(words.length).toBeLessThan(120);
    expect(text).toContain('3:12');
    expect(text).toContain('the fog parts along the boards');
    expect(text).toContain('for the first time all week, the first note comes again');
  });
});

describe('the horn room — the Foghorn Choice', () => {
  const atHorn = choose(
    choose(choose(enterDay7(), 'shore-road'), 'cross-the-lot'),
    'for-sam',
  );

  it('cues horn-close and plays all five bars whole, at full voice', () => {
    expect(atHorn.events).toContainEqual({ kind: 'music.cue', cue: 'horn-close' });
    const text = sceneText('d7-hornroom');
    expect(text).toContain('Five bars whole, at full voice for the first time');
    expect(text).toContain('He doesn’t stop.');
    expect(text).toContain('The horn is not only calling you; it is keeping you.');
  });

  it('shows exactly three open options, including the sixth-bar question', () => {
    expect(atHorn.view.choices).toHaveLength(3);
    expect(atHorn.view.choices[0]).toEqual({
      id: 'keep-playing',
      label: '"Keep playing."',
      locked: false,
      stakes: 'major',
    });
    expect(atHorn.view.choices[1]).toEqual({
      id: 'stop',
      label: '"Stop."',
      locked: false,
      stakes: 'major',
    });
    expect(atHorn.view.choices[2]).toEqual({
      id: 'ask-sixth-bar',
      label: 'Ask him what the sixth bar is.',
      locked: false,
      stakes: 'major',
    });
  });

  it('carries the chosen posture and Sam answer into the horn room', () => {
    expect(atHorn.view.paragraphs.join('\n')).toContain('Sam’s question has followed you');
  });

  it('echoes the player’s Night-1 goodbye answer and chord-sheet choice', () => {
    const scene = DAY7_SCENES.find((s) => s.id === 'd7-hornroom');
    if (!scene) throw new Error('missing d7-hornroom');
    const state = {
      ...initialState(7, 'd7-hornroom'),
      flags: { 'n1:goodbye': 'forgot', 'd3:hummed-chart': true },
    };
    const prose = content.realizeProse(scene, state).join('\n');
    expect(prose).toContain('You told Barb you don’t remember leaving');
    expect(prose).toContain('You hummed the first line from the wardrobe once');
  });

  it('a stranger is named a stranger (fix-09), and a met Wade is not', () => {
    // This route never met Wade: no Day-4 wharf, no Day-6 loaf.
    expect(atHorn.view.paragraphs.join('\n')).toContain('You have never spoken to this man');
    const scene = DAY7_SCENES.find((s) => s.id === 'd7-hornroom');
    if (!scene) throw new Error('missing d7-hornroom');
    const met = applyEffects(initialState(7, 'd7-hornroom'), [
      { op: 'fact.add', tag: 'met-wade', witnessedBy: ['wade'] },
    ]).state;
    expect(content.realizeProse(scene, met).join('\n')).not.toContain(
      'You have never spoken to this man',
    );
  });

  it('lets the player ask, gets Wade’s limited truth, then returns to Keep / Stop', () => {
    const answer = choose(atHorn, 'ask-sixth-bar');
    expect(answer.state.sceneId).toBe('d7-sixth-question');
    expect(answer.events.some((event) => event.kind === 'music.stop')).toBe(false);
    expect(answer.events.some((event) => event.kind === 'music.cue')).toBe(false);
    expect(answer.view.paragraphs.join('\n')).toContain('“There wasn’t one,”');
    expect(answer.view.paragraphs.join('\n')).toContain('“She never finished it.”');
    expect(answer.view.choices).toEqual([
      { id: 'keep-playing', label: '"Keep playing."', locked: false, stakes: 'major' },
      { id: 'stop', label: '"Stop."', locked: false, stakes: 'major' },
    ]);
    const fact = answer.state.facts.find((candidate) => candidate.tag === 'asked-wade-sixth-bar');
    expect(fact).toBeDefined();
    expect(fact && answer.state.knownBy.wade.includes(fact.id)).toBe(true);
  });

  it('preserves both final branches after the question', () => {
    const answer = choose(atHorn, 'ask-sixth-bar');
    const keep = choose(answer, 'keep-playing');
    expect(keep.state.flags['horn-on']).toBe(true);
    expect(keep.events.some((event) => event.kind === 'music.stop')).toBe(false);
    const stop = choose(answer, 'stop');
    expect(stop.state.flags['horn-stopped']).toBe(true);
    expect(stop.events).toContainEqual({ kind: 'music.stop' });
  });
});

describe('branch: "Keep playing."', () => {
  const atHorn = choose(
    choose(choose(enterDay7(), 'stay-the-morning'), 'cross-the-lot'),
    'for-the-song',
  );
  const after = choose(atHorn, 'keep-playing');

  it('sets horn-on and seeds Wade’s confession path', () => {
    expect(after.state.flags['horn-on']).toBe(true);
    expect(after.state.flags['wade-confession-seed']).toBe(true);
    expect(after.state.flags['horn-stopped']).toBeUndefined();
  });

  it('records let-wade-play as a fact Wade witnessed — and only Wade', () => {
    const fact = after.state.facts.find((f) => f.tag === 'let-wade-play');
    expect(fact).toBeDefined();
    expect(fact && after.state.knownBy.wade.includes(fact.id)).toBe(true);
    expect(fact && after.state.knownBy.barb.includes(fact.id)).toBe(false);
  });

  it('does not start the count — not even on the lie-down — and the song follows you home', () => {
    expect(after.events.some((e) => e.kind === 'tell.visual')).toBe(false);
    const end = choose(after, 'lie-down');
    expect(end.events.some((e) => e.kind === 'tell.visual')).toBe(false);
    const prose = after.view.paragraphs.join('\n');
    expect(prose).toContain('I wondered when you’d come down');
    expect(prose).toContain('with the song at your back');
    expect(prose).not.toContain('nothing underneath it');
  });
});

describe('branch: "Stop."', () => {
  const atHorn = choose(
    choose(choose(enterDay7(), 'stay-the-morning'), 'cross-the-lot'),
    'for-the-town',
  );
  const silence = choose(atHorn, 'stop');
  const after = choose(silence, 'walk-back');

  it('you touch the horn, not Wade — and the valve closes in d7-silence', () => {
    expect(silence.state.sceneId).toBe('d7-silence');
    const text = sceneText('d7-silence');
    expect(text).toContain('you shut the valve yourself');
    expect(text).toContain('there is no music of any kind');
  });

  it('sets horn-stopped, lowers STATIC by 5 (an honest act), witnesses the fact to Wade', () => {
    expect(silence.state.flags['horn-stopped']).toBe(true);
    expect(silence.state.staticMeter).toBe(initialState(7, 'd7-morning').staticMeter - 5);
    const fact = silence.state.facts.find((f) => f.tag === 'stopped-the-horn');
    expect(fact).toBeDefined();
    expect(fact && silence.state.knownBy.wade.includes(fact.id)).toBe(true);
  });

  it('announces the decay on the lie-down — the last thing Act 1 says (fix-03)', () => {
    // Not on entering d7-after: the walk home is prose, uninterrupted …
    expect(after.events.some((e) => e.kind === 'tell.visual')).toBe(false);
    const prose = after.view.paragraphs.join('\n');
    expect(prose).toContain('nothing underneath it');
    expect(prose).not.toContain('with the song at your back');
    // … and the count starts exactly once, as the act closes.
    const end = choose(after, 'lie-down');
    expect(
      end.events.filter(
        (e) => e.kind === 'tell.visual' && e.text === '(Something has started counting.)',
      ),
    ).toHaveLength(1);
    expect(end.view.sceneId).toBe('act1-end');
    expect(end.view.ending).toBeUndefined();
  });
});

describe('act1-end — the ACT TWO card', () => {
  const run = ['stay-the-morning', 'cross-the-lot', 'for-the-song', 'keep-playing', 'lie-down'].reduce(
    (step, id) => choose(step, id),
    enterDay7(),
  );

  it('sets day 8, is no longer an ending, and cues title', () => {
    expect(run.state.day).toBe(8);
    expect(run.view.ending).toBeUndefined();
    expect(run.events).toContainEqual({ kind: 'music.cue', cue: 'title' });
  });

  it('renders ACT TWO inside a hard line of white space', () => {
    expect(run.view.paragraphs).toEqual(['', 'ACT TWO', '']);
  });

  it('carries one choice, and it walks into Day 8 (the unsealed boundary)', () => {
    expect(run.view.choices).toEqual([
      { id: 'morning-comes-anyway', label: 'Morning comes anyway.', locked: false },
    ]);
    const card = DAY7_SCENES.find((s) => s.id === 'act1-end');
    expect(card?.ending).toBeUndefined();
    expect(card?.choices.map((c) => c.goto)).toEqual(['d8-morning']);
  });
});

describe('barb’s goodnight (dialogue-day7)', () => {
  const evening = content.scenes.get('d7-evening');
  if (!evening) throw new Error('missing d7-evening');

  it('has a zero-condition fallback for every (speaker, slot) pair', () => {
    const pairs = new Set(RULES.map((r) => `${r.speaker}:${r.slot}`));
    for (const pair of pairs) {
      expect(
        RULES.some((r) => `${r.speaker}:${r.slot}` === pair && isFallback(r)),
        `no fallback for ${pair}`,
      ).toBe(true);
    }
  });

  it('falls back to the closing-time goodnight when Barb’s trust is baseline', () => {
    const prose = content.realizeProse(evening, initialState(3, 'd7-evening')).join('\n');
    expect(prose).toContain('Sleep well tonight');
    expect(prose).toContain('the way she’d call closing');
    expect(prose).toContain('It is not clear she believes you will.');
  });

  it('warms the goodnight when you kept her company (fix-15: reachable in play)', () => {
    const trusted = applyEffects(initialState(3, 'd7-evening'), [
      { op: 'fact.add', tag: 'kept-barb-company', witnessedBy: ['barb'] },
    ]).state;
    const prose = content.realizeProse(evening, trusted).join('\n');
    expect(prose).toContain('Sleep well tonight');
    expect(prose).toContain('There’s pie for the morning');
  });

  it('the warm goodnight is live on a real route: stay the morning, hear the pie', () => {
    const step = choose(enterDay7(), 'stay-the-morning');
    expect(step.view.sceneId).toBe('d7-evening');
    const prose = step.view.paragraphs.join('\n');
    expect(prose).toContain('There’s pie for the morning');
  });
});

describe('day 7 invariants', () => {
  const texts = [
    ...DAY7_SCENES.flatMap((scene) =>
      scene.prose.kind === 'inline'
        ? [
            ...scene.prose.paragraphs.map((p) => p.text),
            ...scene.choices.flatMap((c) => [c.label, ...(c.lockedLabel ? [c.lockedLabel] : [])]),
          ]
        : [],
    ),
    ...RULES.map((r) => r.text),
  ];

  it('the phrase of the title appears nowhere — Day 2 spent Act 1’s one use', () => {
    for (const text of texts) {
      expect(/not\s+here/i.test(text), text).toBe(false);
    }
  });

  it('nobody says the name', () => {
    for (const text of texts) {
      expect(/\bWren\b/.test(text), text).toBe(false);
    }
  });

  it('every music.detune is immediately followed by a tell.visual (vacuously: day 7 tells no lies)', () => {
    const effects = allDay7Effects();
    effects.forEach((effect, i) => {
      if (effect.op === 'emit' && effect.event.kind === 'music.detune') {
        const next = effects[i + 1];
        expect(next?.op === 'emit' && next.event.kind === 'tell.visual').toBe(true);
      }
    });
    expect(effects.some((e) => e.op === 'emit' && e.event.kind === 'music.detune')).toBe(false);
  });
});
