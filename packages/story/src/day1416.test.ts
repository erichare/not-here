/**
 * Days 14–16 content tests (design/act2-beats.md §Day 14, §Day 15, §Day 16).
 *
 * Covers: day-boundary time.set ownership (14/15/16) and the d16-night →
 * d17-morning seam; verdict staging on every scene (defended town vs wharf
 * exile, forced via 'potluck:verdict'); the fixed Priya interrogation tree
 * (repeat → 'truth-told', improve → 'contradiction', the quilt reach gated
 * on 'private:memory-taken' → 'fog-priya-caught-seam', the exit line);
 * press #4 (defended only; increments 'pressed-dianne'; the third press
 * sets 'dianne:locks-house'); the Night-15 harvest (take: ECHO +2, paired
 * private facts, 'lullaby-taken', lullaby layer to 0 with the missing-stair
 * prose twin; refuse: UNDERTOW +1, the four bars); Day-16 morning naming
 * ("Morning, Wren." pinned to the lullaby-taken gate), the mileage-log and
 * corkboard @docs, the Sam gate ('d16:sam-named'); Day-16 without-you
 * retellings with detuned motifs twinned in prose; NIGHT_DECAY behaviour
 * on both tracks (offset consumed / stat paid / horn-on immune) with the
 * gated diegetic tells; cue discipline (foghorn-312 only on horn-on nights,
 * music.stop on horn-stopped nights). Prose invariants re-checked over this
 * fleet's texts, including the act's naming budget (exactly one, gated) and
 * this cluster's zero-title-phrase budget.
 *
 * NOTE: these tests assume content.ts registers DAY14–DAY16 scenes and the
 * days-1416 dialogue rules (integration wiring, per act2-beats §Contract).
 */

import { describe, expect, it } from 'vitest';
import {
  advance,
  applyEffects,
  initialState,
  type EngineEvent,
  type Scene,
  type SceneId,
  type SceneView,
  type WorldState,
} from '@not-here/engine';
import { isFallback, propagateGossip } from '@not-here/memory';
import { buildContent } from './content.ts';
import { DAY14_SCENES } from './scenes/day14.ts';
import { DAY15_SCENES } from './scenes/day15.ts';
import { DAY16_SCENES } from './scenes/day16.ts';
import { RULES } from './dialogue-days1416.ts';

const content = buildContent();
const FLEET_SCENES: readonly Scene[] = [
  ...DAY14_SCENES,
  ...DAY15_SCENES,
  ...DAY16_SCENES,
];

const sceneById = (id: SceneId): Scene => {
  const scene = FLEET_SCENES.find((s) => s.id === id);
  if (!scene) throw new Error(`Missing scene ${id}`);
  return scene;
};

interface Run {
  readonly state: WorldState;
  readonly views: readonly SceneView[];
  readonly events: readonly EngineEvent[];
}

const play = (
  start: SceneId,
  choiceIds: readonly string[],
  mutate?: (s: WorldState) => WorldState,
): Run => {
  const base = initialState(11, start);
  let step = advance(content, mutate ? mutate(base) : base, { kind: 'enter' });
  const views: SceneView[] = [step.view];
  const events: EngineEvent[] = [...step.events];
  for (const choiceId of choiceIds) {
    step = advance(content, step.state, { kind: 'choose', choiceId });
    views.push(step.view);
    events.push(...step.events);
  }
  return { state: step.state, views, events };
};

const viewOf = (run: Run, sceneId: SceneId): SceneView => {
  const view = run.views.find((v) => v.sceneId === sceneId);
  if (!view) throw new Error(`Run never rendered ${sceneId}`);
  return view;
};

const factIdOf = (state: WorldState, tag: string): number => {
  const fact = state.facts.find((f) => f.tag === tag);
  if (!fact) throw new Error(`Missing fact ${tag}`);
  return fact.id;
};

// ——— Mutators for forcing preconditions the prior clusters own. ———

const withFlags =
  (flags: Readonly<Record<string, boolean | number | string>>) =>
  (s: WorldState): WorldState => ({ ...s, flags: { ...s.flags, ...flags } });

const defended = withFlags({ 'potluck:verdict': 'defended' });
const exiled = withFlags({ 'potluck:verdict': 'exiled' });

const compose =
  (...fns: readonly ((s: WorldState) => WorldState)[]) =>
  (s: WorldState): WorldState =>
    fns.reduce((acc, fn) => fn(acc), s);

const seedFact =
  (tag: string, witnessedBy: readonly ('dianne' | 'wade' | 'priya' | 'sam' | 'barb' | 'tam')[], about?: 'dianne' | 'priya' | 'sam') =>
  (s: WorldState): WorldState =>
    applyEffects(s, [
      { op: 'fact.add', tag, ...(about !== undefined ? { about } : {}), witnessedBy },
    ]).state;

const ALL_SIX = ['dianne', 'wade', 'priya', 'sam', 'barb', 'tam'] as const;

// Common walk: morning → Priya → evening (skipping the store).
const D14_TO_EVENING = ['take-what-is-given', 'improve-on-it', 'let-the-day-go'] as const;

describe('day boundaries and topology', () => {
  it('each morning owns its day, exactly once across the fleet', () => {
    const owners = new Map<number, string[]>();
    for (const scene of FLEET_SCENES) {
      for (const effect of scene.onEnter ?? []) {
        if (effect.op !== 'time.set' || effect.day === undefined) continue;
        owners.set(effect.day, [...(owners.get(effect.day) ?? []), scene.id]);
      }
    }
    expect(Object.fromEntries([...owners.entries()].sort((a, b) => a[0] - b[0]))).toEqual({
      14: ['d14-morning'],
      15: ['d15-morning'],
      16: ['d16-morning'],
    });
  });

  it('night 14 exits into day 15; night 15 into day 16; night 16 into day 17', () => {
    expect(sceneById('d14-night').choices.map((c) => c.goto)).toEqual(['d15-morning']);
    expect(sceneById('d15-night-2').choices.map((c) => c.goto)).toEqual(['d16-morning']);
    expect(sceneById('d16-night').choices.map((c) => c.goto)).toEqual(['d17-morning']);
  });

  it('the d16 hub is two-way: the pull-in and the shore', () => {
    expect(sceneById('d16-morning').choices.map((c) => c.goto)).toEqual([
      'd16-depot',
      'd16-shed',
    ]);
  });

  it('playing day 14 through the night lands on day 15', () => {
    const run = play('d14-morning', [...D14_TO_EVENING, 'turn-in', 'let-the-fifteenth-come'], defended);
    expect(run.state.sceneId).toBe('d15-morning');
    expect(run.state.day).toBe(15);
  });
});

describe('day 14 — aftermath temperature per verdict', () => {
  it('defended: the loaf on the step, the overcorrecting town', () => {
    const run = play('d14-morning', [], defended);
    const view = viewOf(run, 'd14-morning').paragraphs.join('\n');
    expect(view).toContain('loaf on the step');
    expect(view).toContain('agreeing very hard with itself');
    expect(view).not.toContain('thermos');
  });

  it('exiled: the thermos on the piling, the town that watches', () => {
    const run = play('d14-morning', [], exiled);
    const view = viewOf(run, 'd14-morning').paragraphs.join('\n');
    expect(view).toContain('somebody has stood a thermos');
    expect(view).toContain('The looking happens anyway.');
    expect(view).not.toContain('loaf on the step');
  });

  it('Barb serves the exile like nothing happened (dialogue rule)', () => {
    const run = play('d14-morning', [], exiled);
    expect(viewOf(run, 'd14-morning').paragraphs.join('\n')).toContain(
      'the same length as everyone else’s',
    );
  });

  it('eating what is given sets the offset and feeds FLESH', () => {
    const run = play('d14-morning', ['take-what-is-given'], defended);
    expect(run.state.flags['today:fed']).toBe(true);
    expect(run.state.stats.flesh).toBe(4);
  });

  it('defended: the kindness shows its grain — fed in, not up (pt2-fix-02)', () => {
    const run = play('d14-morning', [], defended);
    const view = viewOf(run, 'd14-morning').paragraphs.join('\n');
    expect(view).toContain('only inventory');
    expect(view).toContain('It is feeding you in.');
  });

  it('the seam stays off the exiled track', () => {
    const run = play('d14-morning', [], exiled);
    expect(viewOf(run, 'd14-morning').paragraphs.join('\n')).not.toContain('feeding you in');
  });
});

describe('day 14 — the other lit window (pt2-fix-03)', () => {
  it('exiled: Sam’s cost is first-hand from the wharf — the plate, no knock', () => {
    const run = play('d14-morning', [...D14_TO_EVENING], exiled);
    const view = viewOf(run, 'd14-evening').paragraphs.join('\n');
    expect(view).toContain('without knocking');
    expect(view).toContain('They are feeding him the way they feed you.');
  });

  it('the shed-step plate stays off the defended track', () => {
    const run = play('d14-morning', [...D14_TO_EVENING], defended);
    expect(viewOf(run, 'd14-evening').paragraphs.join('\n')).not.toContain('without knocking');
  });
});

describe('day 14 — the notebook comes to you', () => {
  it('stages the house call per verdict', () => {
    const atKettle = play('d14-morning', ['take-what-is-given'], defended);
    expect(viewOf(atKettle, 'd14-priya').paragraphs.join('\n')).toContain('corner table');
    const atWharf = play('d14-morning', ['take-what-is-given'], exiled);
    expect(viewOf(atWharf, 'd14-priya').paragraphs.join('\n')).toContain('“I won’t come in,”');
  });

  it('plays priya-theme', () => {
    expect(sceneById('d14-priya').cue).toBe('priya-theme');
  });

  it('reads the Day-3 lie back verbatim, and only offers its own repeat', () => {
    const seed = compose(defended, seedFact('lied-at-intake', ['priya']));
    const run = play('d14-morning', ['take-what-is-given'], seed);
    const view = viewOf(run, 'd14-priya');
    expect(view.paragraphs.join('\n')).toContain('‘When the rain’s coming. You know how it is.’');
    const ids = view.choices.map((c) => c.id);
    expect(ids).toContain('repeat-word-perfect-lie');
    expect(ids).not.toContain('repeat-word-perfect-honest');
    expect(ids).not.toContain('hold-the-record');
  });

  it('reads the honest wrist back verbatim on that route', () => {
    const seed = compose(defended, seedFact('intake-honest-wrist', ['priya']));
    const run = play('d14-morning', ['take-what-is-given'], seed);
    const view = viewOf(run, 'd14-priya');
    expect(view.paragraphs.join('\n')).toContain('‘It doesn’t ache. Should it?’');
    expect(view.choices.map((c) => c.id)).toContain('repeat-word-perfect-honest');
  });

  it('repeating word-perfect earns truth-told, witnessed by Priya', () => {
    const seed = compose(defended, seedFact('lied-at-intake', ['priya']));
    const run = play(
      'd14-morning',
      ['take-what-is-given', 'repeat-word-perfect-lie'],
      seed,
    );
    const id = factIdOf(run.state, 'truth-told');
    expect(run.state.knownBy.priya).toContain(id);
    expect(viewOf(run, 'd14-priya-2').paragraphs.join('\n')).toContain(
      'Consistency is all I ever ask of anyone',
    );
  });

  it('improving on it draws the red pen: contradiction, witnessed by Priya', () => {
    const run = play('d14-morning', ['take-what-is-given', 'improve-on-it'], defended);
    const id = factIdOf(run.state, 'contradiction');
    expect(run.state.knownBy.priya).toContain(id);
    expect(viewOf(run, 'd14-priya-2').paragraphs.join('\n')).toContain(
      'That’s better than what you said. That’s the problem with it.',
    );
  });

  it('the quilt reach is hidden until the quilt was taken', () => {
    const bare = play('d14-morning', ['take-what-is-given'], defended);
    expect(viewOf(bare, 'd14-priya').choices.map((c) => c.id)).not.toContain(
      'reach-for-the-quilt',
    );
    const seeded = compose(
      defended,
      seedFact('private:memory-taken', ['dianne'], 'dianne'),
    );
    const run = play('d14-morning', ['take-what-is-given'], seeded);
    expect(viewOf(run, 'd14-priya').choices.map((c) => c.id)).toContain('reach-for-the-quilt');
  });

  it('she catches the seam whole, and the fact lands with her fear rule', () => {
    const seeded = compose(
      defended,
      seedFact('private:memory-taken', ['dianne'], 'dianne'),
    );
    const run = play(
      'd14-morning',
      ['take-what-is-given', 'reach-for-the-quilt'],
      seeded,
    );
    const id = factIdOf(run.state, 'fog-priya-caught-seam');
    expect(run.state.knownBy.priya).toContain(id);
    expect(viewOf(run, 'd14-priya-2').paragraphs.join('\n')).toContain(
      'You weren’t there for that. Dianne was. So how do you carry it?',
    );
  });

  it('the Day-9 room lie is read back beside the wrist', () => {
    const run = play(
      'd14-morning',
      ['take-what-is-given'],
      compose(defended, withFlags({ 'd9:room-answer': 'improved' })),
    );
    const view = viewOf(run, 'd14-priya').paragraphs.join('\n');
    expect(view).toContain('Green in here, before it was yours.');
    expect(view).toContain('I looked.');
    const bare = play('d14-morning', ['take-what-is-given'], defended);
    expect(viewOf(bare, 'd14-priya').paragraphs.join('\n')).not.toContain('Green in here');
  });

  it('an honest Day-9 room answer softens the word-perfect close', () => {
    const run = play(
      'd14-morning',
      ['take-what-is-given', 'hold-the-record'],
      compose(defended, withFlags({ 'd9:room-answer': 'honest' })),
    );
    expect(viewOf(run, 'd14-priya-2').paragraphs.join('\n')).toContain('Yours holds.');
    const bare = play('d14-morning', ['take-what-is-given', 'hold-the-record'], defended);
    expect(viewOf(bare, 'd14-priya-2').paragraphs.join('\n')).not.toContain('Yours holds.');
  });

  it('exits on her whole character in nine words', () => {
    const run = play('d14-morning', ['take-what-is-given', 'improve-on-it'], defended);
    expect(viewOf(run, 'd14-priya-2').paragraphs.join('\n')).toContain(
      'I’m not trying to catch you. I’m trying to be wrong.',
    );
  });
});

describe('day 14 — press opportunity #4 (defended track only)', () => {
  it('the store is not offered on the exiled track', () => {
    const run = play('d14-morning', ['take-what-is-given', 'improve-on-it'], exiled);
    expect(viewOf(run, 'd14-priya-2').choices.map((c) => c.id)).not.toContain('to-the-store');
  });

  it('a first press makes one, and the house stays open', () => {
    const run = play(
      'd14-morning',
      ['take-what-is-given', 'improve-on-it', 'to-the-store', 'press-what-sam-meant'],
      defended,
    );
    expect(run.state.flags['pressed-dianne']).toBe(1);
    expect(run.state.flags['dianne:locks-house']).toBeUndefined();
    expect(viewOf(run, 'd14-store-2').paragraphs.join('\n')).toContain(
      'He meant he misses her',
    );
  });

  it('the press that makes three locks the house', () => {
    const run = play(
      'd14-morning',
      ['take-what-is-given', 'improve-on-it', 'to-the-store', 'press-what-sam-meant'],
      compose(defended, withFlags({ 'pressed-dianne': 2 })),
    );
    expect(run.state.flags['pressed-dianne']).toBe(3);
    expect(run.state.flags['dianne:locks-house']).toBe(true);
  });

  it('a fourth press cannot happen: the counter holds at three', () => {
    const run = play(
      'd14-morning',
      ['take-what-is-given', 'improve-on-it', 'to-the-store', 'press-what-sam-meant'],
      compose(defended, withFlags({ 'pressed-dianne': 3, 'dianne:locks-house': true })),
    );
    expect(run.state.flags['pressed-dianne']).toBe(3);
  });

  it('wrapping instead is a kindness Dianne holds', () => {
    const run = play(
      'd14-morning',
      ['take-what-is-given', 'improve-on-it', 'to-the-store', 'keep-wrapping'],
      defended,
    );
    const id = factIdOf(run.state, 'helped-wrap-dishes');
    expect(run.state.knownBy.dianne).toContain(id);
  });
});

describe('night 14 — the decay block on both tracks', () => {
  const toNight = [...D14_TO_EVENING, 'turn-in'] as const;
  const noOffsetPath = ['leave-it', 'improve-on-it', 'let-the-day-go', 'turn-in'] as const;

  it('horn-stopped with no offset: flesh pays first, and the tell shows', () => {
    const run = play(
      'd14-morning',
      [...noOffsetPath],
      compose(exiled, withFlags({ 'horn-stopped': true })),
    );
    expect(run.state.stats.flesh).toBe(2);
    expect(run.state.flags['decay:tonight']).toBe('flesh');
    expect(run.state.flags['decay:next']).toBe('name');
    expect(viewOf(run, 'd14-night').paragraphs.join('\n')).toContain(
      'finish flat sooner than they should',
    );
  });

  it('horn-stopped with the day fed: the offset is consumed silently', () => {
    const run = play(
      'd14-morning',
      [...toNight],
      compose(exiled, withFlags({ 'horn-stopped': true })),
    );
    expect(run.state.stats.flesh).toBe(4); // 3 base + the meal; nothing paid
    expect(run.state.flags['decay:tonight']).toBe('none');
    expect(run.state.flags['today:fed']).toBe(false);
    const night = viewOf(run, 'd14-night').paragraphs.join('\n');
    expect(night).not.toContain('finish flat sooner');
    expect(night).not.toContain('letting go of its ink');
  });

  it('horn-on: no decay, and the horn carries the night', () => {
    const run = play(
      'd14-morning',
      [...noOffsetPath],
      compose(defended, withFlags({ 'horn-on': true })),
    );
    expect(run.state.stats.flesh).toBe(3);
    expect(run.state.flags['decay:tonight']).toBeUndefined();
    expect(
      run.events.some((e) => e.kind === 'music.cue' && e.cue === 'foghorn-312'),
    ).toBe(true);
    expect(viewOf(run, 'd14-night').paragraphs.join('\n')).toContain(
      'something in you sits up to be fed',
    );
  });

  it('horn-stopped nights carry no cue — the stop is real', () => {
    const run = play(
      'd14-morning',
      [...noOffsetPath],
      compose(exiled, withFlags({ 'horn-stopped': true })),
    );
    expect(run.events.some((e) => e.kind === 'music.cue' && e.cue === 'foghorn-312')).toBe(false);
    expect(run.events).toContainEqual({ kind: 'music.stop' });
    expect(viewOf(run, 'd14-night').paragraphs.join('\n')).toContain(
      'nothing happens, on schedule',
    );
  });
});

describe('day 15 — the table is set on every staging', () => {
  it('the supper sets today:fed on every variant', () => {
    for (const staging of [defended, exiled, compose(defended, withFlags({ 'dianne:locks-house': true }))]) {
      const run = play('d15-morning', ['let-evening-come'], staging);
      expect(run.state.flags['today:fed']).toBe(true);
    }
  });

  it('stages the supper: house, back table, or the wharf dish', () => {
    const house = play('d15-morning', ['let-evening-come'], defended);
    expect(viewOf(house, 'd15-supper').paragraphs.join('\n')).toContain('warm to the street');
    const back = play(
      'd15-morning',
      ['let-evening-come'],
      compose(defended, withFlags({ 'dianne:locks-house': true })),
    );
    expect(viewOf(back, 'd15-supper').paragraphs.join('\n')).toContain('back table');
    const wharf = play('d15-morning', ['let-evening-come'], exiled);
    const text = viewOf(wharf, 'd15-supper').paragraphs.join('\n');
    expect(text).toContain('her coat wrong for the wind');
    expect(text).toContain('The dish is the whole speech.');
  });

  // ——— pt2-fix-04: a tracked refuser is never written eating. ———

  it('the refuser’s dish sits differently, and the offset holds by design', () => {
    const refuser = compose(exiled, seedFact('refused-first-meal', ['barb']));
    const run = play('d15-morning', ['let-evening-come'], refuser);
    const view = viewOf(run, 'd15-supper').paragraphs.join('\n');
    expect(view).toContain('never once looks to see whether the lid has moved');
    expect(view).toContain('She has learned what you do with what she cooks.');
    expect(view).toContain('watches the not-eating');
    expect(view).not.toContain('She stays while you eat');
    expect(view).not.toContain('watching you eat');
    expect(run.state.flags['today:fed']).toBe(true);
  });

  it('a refusal since broken keeps the fed prose: the pattern, not the entry', () => {
    const brokeIt = compose(
      exiled,
      seedFact('refused-first-meal', ['barb']),
      (s: WorldState): WorldState => ({ ...s, stats: { ...s.stats, flesh: 4 } }),
    );
    const run = play('d15-morning', ['let-evening-come'], brokeIt);
    const view = viewOf(run, 'd15-supper').paragraphs.join('\n');
    expect(view).toContain('She stays while you eat');
    expect(view).toContain('watching you eat');
    expect(view).not.toContain('watches the not-eating');
  });
});

describe('night 15 — the harvest', () => {
  const TO_HARVEST = ['let-evening-come', 'stay-the-evening'] as const;

  it('hums on dianne-theme with the lullaby layer up', () => {
    expect(sceneById('d15-night').cue).toBe('dianne-theme');
    const run = play('d15-morning', [...TO_HARVEST], defended);
    expect(run.events).toContainEqual({
      kind: 'music.layer',
      pattern: 'lullaby',
      gain: 1,
    });
    expect(viewOf(run, 'd15-night').paragraphs.join('\n')).toContain(
      'You remember this one, hon.',
    );
  });

  it('taking it: ECHO +2, the paired private facts, the flag, the layer out', () => {
    const run = play('d15-morning', [...TO_HARVEST, 'take-it'], defended);
    expect(run.state.stats.echo).toBe(4); // 2 base + 2
    expect(run.state.flags['lullaby-taken']).toBe(true);
    const lullaby = run.state.facts.find((f) => f.tag === 'private:lullaby-taken');
    const paired = run.state.facts.find((f) => f.tag === 'private:memory-taken');
    expect(lullaby?.about).toBe('dianne');
    expect(paired?.about).toBe('dianne');
    expect(run.state.knownBy.dianne).toContain(lullaby?.id);
    expect(run.state.knownBy.dianne).toContain(paired?.id);
    expect(run.events).toContainEqual({
      kind: 'music.layer',
      pattern: 'lullaby',
      gain: 0,
    });
  });

  it('the layer-out is twinned in prose: the missing stair', () => {
    const run = play('d15-morning', [...TO_HARVEST, 'take-it'], defended);
    const view = viewOf(run, 'd15-night-2').paragraphs.join('\n');
    expect(view).toContain('the way you go around a missing stair');
    expect(view).toContain('the last of the private ones');
    expect(run.events.some((e) => e.kind === 'tell.visual')).toBe(false);
  });

  it('the untutored route hears the terms at the brink (pt2-fix-05)', () => {
    const run = play('d15-morning', [...TO_HARVEST], defended);
    const view = viewOf(run, 'd15-night').paragraphs.join('\n');
    expect(view).toContain('say yes and the tune changes houses');
    expect(view).toContain('the visits will get shorter');
  });

  it('the quilt callbacks stay off routes that never saw the offer', () => {
    const never = play('d15-morning', [...TO_HARVEST], defended);
    const view = viewOf(never, 'd15-night').paragraphs.join('\n');
    expect(view).not.toContain('the way the quilt was turned');
    expect(view).not.toContain('her side of the fold');
    expect(view).toContain('Nothing has been offered to you like this before');
    const refused = play(
      'd15-morning',
      [...TO_HARVEST],
      compose(defended, withFlags({ 'd3:slot': 'room', 'd3:left-quilt': true })),
    );
    const refusedView = viewOf(refused, 'd15-night').paragraphs.join('\n');
    expect(refusedView).toContain('the way the quilt was turned');
    expect(refusedView).toContain('You left that one on her side of the fold.');
    expect(refusedView).not.toContain('Nothing has been offered to you like this before');
  });

  it('the harvest never gossips: the private facts stay Dianne’s', () => {
    const run = play('d15-morning', [...TO_HARVEST, 'take-it'], defended);
    const id = factIdOf(run.state, 'private:lullaby-taken');
    const after = propagateGossip(run.state, [{ from: 'dianne', to: 'barb' }]);
    expect(after.knownBy.barb).not.toContain(id);
  });

  it('refusing: UNDERTOW +1, no flag, and the four bars', () => {
    const run = play('d15-morning', [...TO_HARVEST, 'refuse-it'], defended);
    expect(run.state.stats.undertow).toBe(2); // 1 base + 1
    expect(run.state.flags['lullaby-taken']).toBeUndefined();
    expect(
      run.events.some(
        (e) => e.kind === 'music.layer' && e.pattern === 'lullaby' && e.gain === 0,
      ),
    ).toBe(false);
    expect(viewOf(run, 'd15-night-2').paragraphs.join('\n')).toContain(
      'the kitchen is seven years ago and nobody in it is dead',
    );
  });

  it('the exiled refusal keeps the same four bars on the boards', () => {
    const run = play('d15-morning', [...TO_HARVEST, 'refuse-it'], exiled);
    expect(viewOf(run, 'd15-night-2').paragraphs.join('\n')).toContain(
      'the wharf is a kitchen seven years ago',
    );
  });

  it('the guaranteed offset absorbs the stopped-track count tonight', () => {
    const run = play(
      'd15-morning',
      [...TO_HARVEST, 'refuse-it'],
      compose(defended, withFlags({ 'horn-stopped': true })),
    );
    expect(run.state.flags['decay:tonight']).toBe('none');
    expect(run.state.stats.flesh).toBe(3);
  });
});

describe('day 16 — the name', () => {
  it('with the lullaby taken, Dianne names you, and the scene notices once', () => {
    const run = play('d16-morning', [], compose(defended, withFlags({ 'lullaby-taken': true })));
    const view = viewOf(run, 'd16-morning').paragraphs.join('\n');
    expect(view).toContain('“Morning, Wren,”');
    expect(view).toContain('a door latching in another room');
    expect(view).toContain('She doesn’t hum it anymore.');
  });

  it('without the flag, the name never comes', () => {
    const run = play('d16-morning', [], defended);
    const view = viewOf(run, 'd16-morning').paragraphs.join('\n');
    expect(view).not.toContain('Wren');
    expect(view).not.toContain('She doesn’t hum it anymore.');
  });

  it('the Wren paragraph carries the lullaby-taken gate (Dianne-never-names guard)', () => {
    const scene = sceneById('d16-morning');
    if (scene.prose.kind !== 'inline') throw new Error('not inline');
    const named = scene.prose.paragraphs.filter((p) => /\bWren\b/.test(p.text));
    expect(named).toHaveLength(1);
    expect(JSON.stringify(named[0]?.when)).toContain('lullaby-taken');
  });
});

describe('day 16 — the log', () => {
  it('defending Sam bought the proof: the log, unfolded unprompted', () => {
    const run = play(
      'd16-morning',
      ['find-tam'],
      compose(defended, seedFact('defended-sam', ALL_SIX)),
    );
    const view = viewOf(run, 'd16-depot').paragraphs.join('\n');
    expect(view).toContain('one passenger, cash,');
    expect(view).toContain('no name — 04:10');
    expect(view).toContain('“I keep my columns,”');
    expect(run.state.flags['today:remembered']).toBe(true);
  });

  it('without the trust, the pocket stays shut', () => {
    const run = play('d16-morning', ['find-tam'], defended);
    const view = viewOf(run, 'd16-depot').paragraphs.join('\n');
    expect(view).toContain('tire gauge');
    expect(view).not.toContain('04:10');
    expect(run.state.flags['today:remembered']).toBeUndefined();
  });

  it('sacrificing Sam re-routes the morning to the corkboard', () => {
    const run = play(
      'd16-morning',
      ['find-tam'],
      compose(defended, seedFact('sacrificed-sam', ALL_SIX)),
    );
    expect(run.state.sceneId).toBe('d16-corkboard');
    const view = viewOf(run, 'd16-corkboard').paragraphs.join('\n');
    expect(view).toContain('SERVICE NOTICE');
    expect(view).toContain('route service');
  });

  it('the evening carries Moose at the door, five words at the end', () => {
    const run = play(
      'd16-morning',
      ['find-tam', 'walk-it-off'],
      compose(defended, seedFact('sacrificed-sam', ALL_SIX)),
    );
    expect(viewOf(run, 'd16-evening').paragraphs.join('\n')).toContain(
      'The last run isn’t coming.',
    );
  });
});

describe('day 16 — the question', () => {
  const gate = (s: WorldState): WorldState =>
    seedFact('told-sam-dont-know', ['sam'])({
      ...s,
      stats: { ...s.stats, undertow: 5 },
    });

  it('the guarded friendship arrives only through the gate', () => {
    const run = play('d16-morning', ['find-sam'], compose(defended, gate));
    expect(run.state.sceneId).toBe('d16-breakwater');
    const view = viewOf(run, 'd16-breakwater').paragraphs.join('\n');
    expect(view).toContain(
      '“Fine. Then who are you? Because I could use somebody who isn’t pretending.”',
    );
    expect(view).toContain('What name would you travel under?');
  });

  it('naming yourself to Sam is written nowhere and remembered everywhere', () => {
    const run = play('d16-morning', ['find-sam', 'give-the-name'], compose(defended, gate));
    expect(run.state.flags['d16:sam-named']).toBe(true);
    expect(viewOf(run, 'd16-breakwater-2').paragraphs.join('\n')).toContain(
      'writes nothing down',
    );
  });

  it('keeping the name is taken without a flinch, and sets nothing', () => {
    const run = play('d16-morning', ['find-sam', 'keep-it'], compose(defended, gate));
    expect(run.state.flags['d16:sam-named']).toBeUndefined();
    expect(viewOf(run, 'd16-breakwater-2').paragraphs.join('\n')).toContain(
      'I’ll be the one who doesn’t write it down',
    );
  });

  it('below the gate: the shed, colder, and the visit log', () => {
    const run = play('d16-morning', ['find-sam'], defended);
    expect(run.state.sceneId).toBe('d16-shed');
    const view = viewOf(run, 'd16-shed').paragraphs.join('\n');
    expect(view).toContain('a blank where a purpose would go');
    expect(view).toContain('The damp gets the ink.');
  });
});

describe('day 16 — the hole has a sound (retellings)', () => {
  it('missing Sam: the retelling and his motif, a quarter-tone flat', () => {
    const run = play('d16-morning', ['find-tam', 'sit-the-layover'], defended);
    expect(run.events.some((e) => e.kind === 'music.detune' && e.pattern === 'sam')).toBe(true);
    expect(run.events.some((e) => e.kind === 'music.detune' && e.pattern === 'tam')).toBe(false);
    const view = viewOf(run, 'd16-evening').paragraphs.join('\n');
    expect(view).toContain('a quarter-tone flat');
    expect(view).toContain('the phone stay in his pocket');
    expect(view).not.toContain('a shade flat');
  });

  it('missing Tam: the bench he sat with the logbook, a shade flat', () => {
    const run = play('d16-morning', ['find-sam', 'leave-him-to-it'], defended);
    expect(run.events.some((e) => e.kind === 'music.detune' && e.pattern === 'tam')).toBe(true);
    const view = viewOf(run, 'd16-evening').paragraphs.join('\n');
    expect(view).toContain('a shade flat');
    expect(view).toContain('Logbook out on his knee');
    expect(view).not.toContain('a quarter-tone flat');
  });

  it('no redundant toast twins ride the detunes (fix-03)', () => {
    const run = play('d16-morning', ['find-sam', 'leave-him-to-it'], defended);
    expect(run.events.some((e) => e.kind === 'tell.visual')).toBe(false);
  });
});

describe('night 16 — the seam into day 17', () => {
  it('branches its cue on the track like every act-2 night', () => {
    const on = play(
      'd16-morning',
      ['find-sam', 'leave-him-to-it', 'eat-what-barbs-made'],
      compose(defended, withFlags({ 'horn-on': true })),
    );
    expect(on.events.some((e) => e.kind === 'music.cue' && e.cue === 'foghorn-312')).toBe(true);
    const off = play(
      'd16-morning',
      ['find-sam', 'leave-him-to-it', 'eat-what-barbs-made'],
      compose(defended, withFlags({ 'horn-stopped': true })),
    );
    expect(off.events.some((e) => e.kind === 'music.cue' && e.cue === 'foghorn-312')).toBe(false);
    expect(off.events).toContainEqual({ kind: 'music.stop' });
  });

  it('supper at the Kettle is day 16’s reachable offset', () => {
    const run = play(
      'd16-morning',
      ['find-sam', 'leave-him-to-it', 'eat-what-barbs-made'],
      compose(defended, withFlags({ 'horn-stopped': true })),
    );
    expect(run.state.flags['decay:tonight']).toBe('none');
  });

  it('an unmanaged day 16 pays the rotation', () => {
    const run = play(
      'd16-morning',
      ['find-sam', 'leave-him-to-it', 'go-down-early'],
      compose(exiled, withFlags({ 'horn-stopped': true, 'decay:next': 'name' })),
    );
    expect(run.state.stats.name).toBe(1); // 2 base − 1
    expect(run.state.flags['decay:tonight']).toBe('name');
    expect(run.state.flags['decay:next']).toBe('echo');
    expect(viewOf(run, 'd16-night').paragraphs.join('\n')).toContain(
      'faded to pressure marks',
    );
  });
});

describe('days 14–16 dialogue rules', () => {
  it('every (speaker, slot) pair has a zero-condition fallback', () => {
    const pairs = new Set(RULES.map((r) => `${r.speaker}:${r.slot}`));
    for (const pair of pairs) {
      const ok = RULES.some((r) => `${r.speaker}:${r.slot}` === pair && isFallback(r));
      expect(ok, `no fallback for ${pair}`).toBe(true);
    }
  });

  it('the exiled supper line outranks the locked-house line when both hold', () => {
    const run = play(
      'd15-morning',
      ['let-evening-come'],
      compose(exiled, withFlags({ 'dianne:locks-house': true })),
    );
    const view = viewOf(run, 'd15-supper').paragraphs.join('\n');
    expect(view).toContain('the whole town watched her take it');
    expect(view).not.toContain('back table’s cosier');
  });
});

describe('prose invariants (this fleet)', () => {
  const texts: readonly { source: string; text: string }[] = [
    ...FLEET_SCENES.flatMap((scene) => {
      if (scene.prose.kind !== 'inline') return [];
      return [
        ...scene.prose.paragraphs.map((p) => ({ source: scene.id, text: p.text })),
        ...scene.choices.flatMap((c) => [
          { source: `${scene.id}#${c.id}`, text: c.label },
          ...(c.lockedLabel !== undefined
            ? [{ source: `${scene.id}#${c.id}:locked`, text: c.lockedLabel }]
            : []),
        ]),
      ];
    }),
    ...RULES.map((r) => ({ source: `rule:${r.id}`, text: r.text })),
  ];

  it('nobody touches you first', () => {
    const touch =
      /\b(she|he|they|dianne|barb|tam|wade|priya|sam|moose)\s+(takes|touches|hugs|grabs|holds|pats|strokes|embraces|catches|clasps|pulls|steadies|reaches\s+for)\s+(you|your)\b/i;
    for (const { source, text } of texts) {
      expect(touch.test(text), `NPC-initiated touch in ${source}`).toBe(false);
    }
  });

  it('never growls, never remarks', () => {
    for (const { source, text } of texts) {
      expect(/growl/i.test(text), `growl in ${source}`).toBe(false);
      expect(/\b(strange|odd|uncanny|impossible)\b/i.test(text), `remark in ${source}`).toBe(false);
    }
  });

  it('holds the title budget: the phrase appears nowhere in Days 14–16', () => {
    for (const { source, text } of texts) {
      expect(/\bnot\s+here\b/i.test(text), `title phrase in ${source}`).toBe(false);
    }
  });

  it('spends the cluster’s whole Wren budget in one gated breath', () => {
    const hits = texts.filter(({ text }) => /\bWren\b/.test(text));
    expect(hits.map((h) => h.source)).toEqual(['d16-morning']);
    expect(hits[0]?.text).toContain('“Morning, Wren,”');
  });

  it('keeps every paragraph under the hard cap', () => {
    const wordCount = (text: string): number =>
      text.split(/\s+/).filter((w) => /[0-9A-Za-z’']/.test(w)).length;
    for (const { source, text } of texts) {
      if (text.startsWith('@doc:') || text.startsWith('@line:')) continue;
      expect(wordCount(text), `over 150 words in ${source}`).toBeLessThanOrEqual(150);
    }
  });

  it('only the assigned EBUS card time exists nowhere in this fleet', () => {
    for (const { source, text } of texts) {
      expect(text.includes('07:40'), `EBUS time outside the card in ${source}`).toBe(false);
    }
  });
});
