/**
 * Days 17–19 content tests (design/act2-beats.md §Day 17, §Day 18, §Day 19).
 *
 * Covers: hub topology and the day ladder (17, 18, 19, then act2-end's
 * day 20); the second harvest (take and refuse, paired private facts, the
 * on-screen kindness cost); the mail-run slip and 'found-mail-slip'; the
 * without-you retellings with their detunes and prose twins; Night-17
 * routing (letter vs plain decay night); the Letter branch — open (flags,
 * cue 'title', the held rest's music.stop, the verbatim sign-off and the
 * one @doc salutation), burn (STATIC +10, 'letter-burned'), and ASH
 * (STATIC ≥ 16 gate, hidden not locked-labelled, terminal); the Return
 * Pass (all four recontext scenes, one line each); the lighter-fog day and
 * the tin lid; the register read-back's conditional entries, the forgotten
 * entry, the smell, the counsel seed; Night 19's track paragraphs; decay
 * behaviour on every night this cluster owns. Prose invariants re-checked
 * over this fleet's texts (zero title-phrase, one @doc 'Wren', touch,
 * growl, remark words).
 *
 * NOTE: these tests assume content.ts has registered DAY17–DAY19 scenes and
 * the days-17-19 dialogue rules (integration wires that after this cluster
 * lands). They are complete and correct against that wiring.
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
import { isFallback } from '@not-here/memory';
import { buildContent } from './content.ts';
import { DAY17_SCENES } from './scenes/day17.ts';
import { DAY18_SCENES } from './scenes/day18.ts';
import { DAY19_SCENES } from './scenes/day19.ts';
import { NIGHT_DECAY } from './scenes/act2-shared.ts';
import { RULES } from './dialogue-days1719.ts';

const content = buildContent();
const FLEET_SCENES: readonly Scene[] = [...DAY17_SCENES, ...DAY18_SCENES, ...DAY19_SCENES];

const sceneById = (id: SceneId): Scene => {
  const scene = FLEET_SCENES.find((s) => s.id === id);
  if (!scene) throw new Error(`Missing scene ${id}`);
  return scene;
};

const rawText = (scene: Scene): string => {
  if (scene.prose.kind !== 'inline') throw new Error(`${scene.id}: not inline`);
  return scene.prose.paragraphs.map((p) => p.text).join('\n');
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

const withFlags =
  (flags: Readonly<Record<string, boolean | number | string>>) =>
  (s: WorldState): WorldState => ({ ...s, flags: { ...s.flags, ...flags } });

const CLINIC_TAKE = ['to-clinic', 'take-the-morning', 'walk-the-long-way'] as const;
const CLINIC_REFUSE = ['to-clinic', 'let-it-stay-hers', 'walk-the-long-way'] as const;
const MAIL = ['to-mail', 'square-the-backlog', 'carry-the-held-mail'] as const;
const MAIL_QUIET = ['to-mail', 'mind-the-bell', 'carry-the-held-mail'] as const;
const OPEN_ROUTE = [...MAIL, 'turn-in', 'open-them', 'the-lined-page', 'lie-down-with-it'] as const;
const RETURN_PASS = [
  'take-the-day', 'up-the-shore', 'across-to-the-general', 'down-to-the-wharf',
  'let-the-light-have-it', 'say-goodnight', 'let-morning-come',
] as const;

describe('hubs and the day ladder', () => {
  it('d17-morning offers the clinic and the mail run', () => {
    expect(sceneById('d17-morning').choices.map((c) => c.goto)).toEqual([
      'd17-clinic', 'd17-mail',
    ]);
  });

  it('each boundary scene owns its day', () => {
    const d17 = play('d17-morning', []);
    expect(d17.state.day).toBe(17);
    expect(d17.state.slot).toBe('morning');
    const d18 = play('d17-morning', [...CLINIC_TAKE, 'turn-in', 'let-morning-come']);
    expect(d18.state.sceneId).toBe('d18-morning');
    expect(d18.state.day).toBe(18);
  });

  it('the whole knowing route runs 17 → 18 → 19 → the ACT THREE card', () => {
    const run = play(
      'd17-morning',
      [...OPEN_ROUTE, ...RETURN_PASS, 'eat-whats-put-down', 'let-the-book-close', 'sleep-toward-it'],
      withFlags({ 'horn-on': true }),
    );
    expect(run.state.sceneId).toBe('act2-end');
    expect(run.state.day).toBe(20);
    const card = viewOf(run, 'act2-end');
    expect(card.paragraphs).toEqual(['', 'ACT THREE', '']);
    expect(card.ending).toBe('act2-end');
    expect(run.events).toContainEqual({ kind: 'music.cue', cue: 'title' });
  });

  it('the act2-end card mirrors act1-end: cue title, ending marker, no choices', () => {
    const card = sceneById('act2-end');
    expect(card.cue).toBe('title');
    expect(card.ending).toBe('act2-end');
    expect(card.choices).toEqual([]);
  });
});

describe('day 17 — the second harvest', () => {
  it('taking the morning pays ECHO +2 and files the paired private facts', () => {
    const run = play('d17-morning', [...CLINIC_TAKE]);
    expect(run.state.stats.echo).toBe(4); // baseline 2 + 2
    expect(run.state.flags['letter-memory-taken']).toBe(true);
    expect(run.state.flags['today:remembered']).toBe(true);
    const specific = run.state.facts.find((f) => f.tag === 'private:letter-memory-taken');
    const generic = run.state.facts.find((f) => f.tag === 'private:memory-taken');
    expect(specific?.about).toBe('priya');
    expect(generic?.about).toBe('priya');
    expect(run.state.knownBy.priya).toContain(specific?.id);
  });

  it('the cost is written on screen next scene: she is kind now', () => {
    const run = play('d17-morning', [...CLINIC_TAKE]);
    const view = viewOf(run, 'd17-clinic-2').paragraphs.join('\n');
    expect(view).toContain('Then she is kind to you.');
    expect(view).toContain('kind as a stranger');
    expect(view).not.toContain('the safe one');
  });

  it('refusing pays UNDERTOW +1 and gets the safe-one line; remembered either way', () => {
    const run = play('d17-morning', [...CLINIC_REFUSE]);
    expect(run.state.stats.undertow).toBe(2); // baseline 1 + 1
    expect(run.state.flags['letter-memory-taken']).toBeUndefined();
    expect(run.state.flags['today:remembered']).toBe(true);
    const view = viewOf(run, 'd17-clinic-2').paragraphs.join('\n');
    expect(view).toContain('I have spent seven years being the safe one.');
    expect(view).not.toContain('kind as a stranger');
  });

  it('the private harvest never travels a gossip edge', () => {
    const run = play('d17-morning', [...CLINIC_TAKE, 'turn-in', 'let-morning-come']);
    const id = factIdOf(run.state, 'private:letter-memory-taken');
    expect(run.state.knownBy.priya).toContain(id);
    for (const who of ['dianne', 'wade', 'sam', 'barb', 'tam'] as const) {
      expect(run.state.knownBy[who]).not.toContain(id);
    }
  });
});

describe('day 17 — the mail run', () => {
  it('finds the slip: found-mail-slip is set and the @doc names D. Cole', () => {
    const run = play('d17-morning', [...MAIL]);
    expect(run.state.flags['found-mail-slip']).toBe(true);
    const doc = rawText(sceneById('d17-mail-2'));
    expect(doc).toContain('D. COLE');
    expect(doc).toContain('Sender ... —');
  });

  it('squaring the backlog earns the day’s named offset, witnessed by Dianne', () => {
    const run = play('d17-morning', [...MAIL]);
    expect(run.state.flags['today:named']).toBe(true);
    const id = factIdOf(run.state, 'helped-dianne-counter');
    expect(run.state.knownBy.dianne).toContain(id);
  });

  it('Dianne learns the errand itself (fact.learn) for the Day-18 rule', () => {
    const run = play('d17-morning', [...MAIL]);
    const id = factIdOf(run.state, 'ran-the-mail-d17');
    expect(run.state.knownBy.dianne).toContain(id);
  });
});

describe('day 17 — evening retellings (spike-fomo grammar)', () => {
  it('missing the clinic: the mailbox retelling, priya motif detuned, prose twin', () => {
    const run = play('d17-morning', [...MAIL]);
    const evening = viewOf(run, 'd17-evening').paragraphs.join('\n');
    expect(evening).toContain('the mailbox out front');
    expect(evening).toContain('Never posted it.');
    expect(evening).toContain('a shade flat');
    expect(evening).not.toContain('round the front like company');
    expect(run.events.some((e) => e.kind === 'music.detune' && e.pattern === 'priya')).toBe(true);
    expect(run.events.some((e) => e.kind === 'tell.visual')).toBe(false);
  });

  it('missing the mail run: Barb went round the front, dianne motif detuned, prose twin', () => {
    const run = play('d17-morning', [...CLINIC_REFUSE]);
    const evening = viewOf(run, 'd17-evening').paragraphs.join('\n');
    expect(evening).toContain('round the front like company');
    expect(evening).toContain('a quarter-tone flat');
    expect(evening).not.toContain('the mailbox out front');
    expect(run.events.some((e) => e.kind === 'music.detune' && e.pattern === 'dianne')).toBe(true);
    expect(run.events.some((e) => e.kind === 'tell.visual')).toBe(false);
  });
});

describe('night 17 — routing and the plain decay night', () => {
  it('found-mail-slip routes the night to the letter; without it, decay only', () => {
    const withSlip = play('d17-morning', [...MAIL, 'turn-in']);
    expect(withSlip.state.sceneId).toBe('d17-letter');
    const without = play('d17-morning', [...CLINIC_TAKE, 'turn-in']);
    expect(without.state.sceneId).toBe('d17-night');
  });

  it('locks-house without Sam: the letter night does not fire — the new lock holds', () => {
    const lockedOut = play(
      'd17-morning',
      [...MAIL, 'turn-in'],
      withFlags({ 'horn-on': true, 'dianne:locks-house': true }),
    );
    expect(lockedOut.state.sceneId).toBe('d17-night');
    expect(lockedOut.state.flags['letter-opened']).toBeUndefined();
    const view = viewOf(lockedOut, 'd17-night').paragraphs.join('\n');
    expect(view).toContain('The new lock has been thrown properly tonight');
    // Without the slip, the locked-out beat has nothing to be about.
    const noSlip = play(
      'd17-morning',
      [...CLINIC_TAKE, 'turn-in'],
      withFlags({ 'horn-on': true, 'dianne:locks-house': true }),
    );
    expect(viewOf(noSlip, 'd17-night').paragraphs.join('\n')).not.toContain(
      'The new lock has been thrown properly',
    );
  });

  it('every night this cluster owns spreads the canonical decay block', () => {
    for (const id of ['d17-night', 'd17-letter', 'd18-night', 'd19-night'] as const) {
      const scene = sceneById(id);
      expect(
        NIGHT_DECAY.every((effect) => scene.onEnter?.includes(effect)),
        `${id} re-authors or omits NIGHT_DECAY`,
      ).toBe(true);
    }
  });

  it('horn-stopped, no offsets: flesh pays first, the rotation advances, the tell renders', () => {
    const run = play('d17-morning', [...MAIL_QUIET, 'turn-in'], withFlags({ 'horn-stopped': true }));
    expect(run.state.stats.flesh).toBe(2); // 3 - 1
    expect(run.state.flags['decay:tonight']).toBe('flesh');
    expect(run.state.flags['decay:next']).toBe('name');
    const view = viewOf(run, 'd17-letter').paragraphs.join('\n');
    expect(view).toContain('how lightly');
  });

  it('the rotation honours decay:next', () => {
    const run = play(
      'd17-morning',
      [...MAIL_QUIET, 'turn-in'],
      withFlags({ 'horn-stopped': true, 'decay:next': 'name' }),
    );
    expect(run.state.stats.name).toBe(1); // 2 - 1
    expect(run.state.flags['decay:next']).toBe('echo');
  });

  it('an offset consumes the night: no stat pays, nothing is said about it', () => {
    const run = play('d17-morning', [...CLINIC_TAKE, 'turn-in'], withFlags({ 'horn-stopped': true }));
    expect(run.state.stats.flesh).toBe(3);
    expect(run.state.flags['decay:tonight']).toBe('none');
    expect(run.state.flags['today:remembered']).toBe(false);
    const view = viewOf(run, 'd17-night').paragraphs.join('\n');
    expect(view).not.toContain('a beat late');
  });

  it('horn-on nights never decay and carry the foghorn cue; stopped nights carry none', () => {
    const on = play('d17-morning', [...CLINIC_TAKE, 'turn-in'], withFlags({ 'horn-on': true }));
    expect(on.state.stats.flesh).toBe(3);
    expect(on.events).toContainEqual({ kind: 'music.cue', cue: 'foghorn-312' });
    const off = play('d17-morning', [...CLINIC_TAKE, 'turn-in'], withFlags({ 'horn-stopped': true }));
    expect(off.events).toContainEqual({ kind: 'music.stop' });
    expect(off.events.some((e) => e.kind === 'music.cue' && e.cue === 'foghorn-312')).toBe(false);
  });
});

describe('night 17 — THE LETTER', () => {
  it('entry varies: Sam and the stockroom spare only on locks-house + sam-named', () => {
    const sam = play(
      'd17-morning',
      [...MAIL, 'turn-in'],
      withFlags({ 'horn-on': true, 'dianne:locks-house': true, 'd16:sam-named': true }),
    );
    const samView = viewOf(sam, 'd17-letter').paragraphs.join('\n');
    expect(samView).toContain('the stockroom spare');
    expect(samView).not.toContain('half-turned');
    const alone = play('d17-morning', [...MAIL, 'turn-in'], withFlags({ 'horn-on': true }));
    const aloneView = viewOf(alone, 'd17-letter').paragraphs.join('\n');
    expect(aloneView).toContain('half-turned');
    expect(aloneView).not.toContain('the stockroom spare');
  });

  it('opening is the reveal: flags, cue title, then the stop where the sixth should live', () => {
    const run = play(
      'd17-morning',
      [...MAIL, 'turn-in', 'open-them', 'the-lined-page'],
      withFlags({ 'horn-on': true }),
    );
    expect(run.state.flags['letter-opened']).toBe(true);
    expect(run.state.flags['knows-truth']).toBe(true);
    expect(run.events).toContainEqual({ kind: 'music.cue', cue: 'title' });
    // horn-on: the letter-night entry emits no stop, so the reveal's rest
    // is the only one in the run.
    expect(run.events.filter((e) => e.kind === 'music.stop')).toHaveLength(1);
  });

  it('the letter carries the verbatim sign-off; the draft carries the one @doc salutation', () => {
    const letter = rawText(sceneById('d17-reveal'));
    expect(letter).toContain('Tell Sam he can stop keeping it. I was never here');
    expect(letter).toContain('that was the whole trouble.');
    expect(letter).toContain('— W.');
    const draft = rawText(sceneById('d17-reveal-2'));
    expect(draft).toContain('Wren —');
    expect(draft).toContain('before I get too good at the\nother one');
  });

  it('burning unread prices willful innocence: STATIC +10, letter-burned', () => {
    const run = play('d17-morning', [...MAIL, 'turn-in', 'burn-unread', 'go-up'], withFlags({ 'horn-on': true }));
    expect(run.state.flags['letter-burned']).toBe(true);
    expect(run.state.flags['knows-truth']).toBeUndefined();
    expect(run.state.staticMeter).toBe(20); // 10 baseline + 10
    const burn = viewOf(run, 'd17-burn').paragraphs.join('\n');
    expect(burn).toContain('as if it had been waiting');
    expect(burn).toContain('It has company tonight.');
  });
});

describe('ASH — the act’s dark exit', () => {
  it('the other book is hidden below STATIC 16 — no locked label, no trace', () => {
    const run = play('d17-morning', [...MAIL, 'turn-in'], withFlags({ 'horn-on': true }));
    const ids = viewOf(run, 'd17-letter').choices.map((c) => c.id);
    expect(ids).toEqual(['open-them', 'burn-unread']);
    expect(sceneById('d17-letter').choices.find((c) => c.id === 'the-other-book')?.lockedLabel)
      .toBeUndefined();
  });

  it('choosing it below the gate is impossible', () => {
    expect(() =>
      play('d17-morning', [...MAIL, 'turn-in', 'the-other-book'], withFlags({ 'horn-on': true })),
    ).toThrow(/locked/);
  });

  it('at STATIC ≥ 16 it opens onto the burning, and the burning ends the act', () => {
    const run = play(
      'd17-morning',
      [...MAIL, 'turn-in', 'the-other-book', 'stay-until-warmth'],
      (s) => ({ ...withFlags({ 'horn-on': true })(s), staticMeter: 16 }),
    );
    const burning = viewOf(run, 'act2-ash').paragraphs.join('\n');
    expect(burning).toContain('less holding it down');
    expect(burning).toContain('The double-inked pages go last.');
    expect(run.events).toContainEqual({ kind: 'music.stop' });
    const morning = viewOf(run, 'act2-ash-2');
    expect(morning.ending).toBe('ash');
    expect(morning.paragraphs.join('\n')).toContain('Nobody ever calls you anything again.');
    expect(morning.choices).toEqual([]);
  });

  it('the ash morning never uses the name — the guitar and the banner carry it', () => {
    expect(/\bWren\b/.test(rawText(sceneById('act2-ash-2')))).toBe(false);
    expect(rawText(sceneById('act2-ash-2'))).toContain('SEVEN YEARS');
  });
});

describe('day 18 — the Return Pass', () => {
  const run = play('d17-morning', [...OPEN_ROUTE, 'take-the-day'], withFlags({ 'horn-on': true }));

  it('knows-truth routes the day through all four recontext scenes', () => {
    expect(run.state.sceneId).toBe('d18-beach');
    const recontext = FLEET_SCENES.filter((s) => s.recontext === true).map((s) => s.id);
    expect(recontext.sort()).toEqual(['d18-beach', 'd18-corkboard', 'd18-kettle', 'd18-wharf']);
  });

  it('each scene re-renders its one line, unexplained', () => {
    expect(rawText(sceneById('d18-beach'))).toContain('The lake never had you.');
    expect(rawText(sceneById('d18-kettle'))).toContain('you happened yesterday');
    // Day 18 = Nov 23; the ringed bus is Fri Nov 28 (the EBUS card's math).
    expect(rawText(sceneById('d18-corkboard'))).toContain('Five days.');
    expect(sceneById('d18-beach').cue).toBe('shingle');
  });

  it('the wharf line follows the track', () => {
    const on = play('d17-morning', [...OPEN_ROUTE, 'take-the-day', 'up-the-shore',
      'across-to-the-general', 'down-to-the-wharf'], withFlags({ 'horn-on': true }));
    expect(viewOf(on, 'd18-wharf').paragraphs.join('\n')).toContain('watching his back');
    const off = play('d17-morning', [...OPEN_ROUTE, 'take-the-day', 'up-the-shore',
      'across-to-the-general', 'down-to-the-wharf'], withFlags({ 'horn-stopped': true }));
    expect(viewOf(off, 'd18-wharf').paragraphs.join('\n')).toContain('what he had been feeding');
  });

  it('the Kettle stop still feeds the day’s offset', () => {
    const mid = play('d17-morning', [...OPEN_ROUTE, 'take-the-day', 'up-the-shore'],
      withFlags({ 'horn-on': true }));
    expect(mid.state.flags['today:fed']).toBe(true);
  });
});

describe('day 18 — the lighter fog', () => {
  it('letter-burned: the fog line, and the tin lid up at the house', () => {
    const run = play('d17-morning', [...MAIL, 'turn-in', 'burn-unread', 'go-up',
      'take-the-day', 'up-to-the-house'], withFlags({ 'horn-on': true }));
    expect(run.state.sceneId).toBe('d18-house');
    expect(viewOf(run, 'd18-fog').paragraphs.join('\n')).toContain('lighter this morning');
    expect(viewOf(run, 'd18-house').paragraphs.join('\n')).toContain('doesn’t sit flush');
  });

  it('never-found: the same plain day without either tell', () => {
    const run = play('d17-morning', [...CLINIC_TAKE, 'turn-in', 'let-morning-come',
      'take-the-day', 'up-to-the-house'], withFlags({ 'horn-on': true }));
    expect(viewOf(run, 'd18-fog').paragraphs.join('\n')).not.toContain('lighter this morning');
    expect(viewOf(run, 'd18-house').paragraphs.join('\n')).not.toContain('doesn’t sit flush');
  });

  it('both day routes reach an offset', () => {
    const kettle = play('d17-morning', [...CLINIC_TAKE, 'turn-in', 'let-morning-come',
      'take-the-day', 'keep-the-stove-side'], withFlags({ 'horn-on': true }));
    expect(kettle.state.flags['today:fed']).toBe(true);
    const house = play('d17-morning', [...CLINIC_TAKE, 'turn-in', 'let-morning-come',
      'take-the-day', 'up-to-the-house'], withFlags({ 'horn-on': true }));
    expect(house.state.flags['today:fed']).toBe(true);
  });
});

describe('day 18 — evening at the store', () => {
  it('the knowing route watches one unbroken minute; nobody confronts anybody', () => {
    const knowing = play('d17-morning', [...OPEN_ROUTE, ...RETURN_PASS.slice(0, 5)],
      withFlags({ 'horn-on': true }));
    const view = viewOf(knowing, 'd18-evening');
    expect(view.paragraphs.join('\n')).toContain('one unbroken minute');
    expect(view.choices.map((c) => c.id)).toEqual(['say-goodnight']);
  });

  it('the burned route gets the same evening without the minute', () => {
    const burned = play('d17-morning', [...MAIL, 'turn-in', 'burn-unread', 'go-up',
      'take-the-day', 'keep-the-stove-side'], withFlags({ 'horn-on': true }));
    expect(viewOf(burned, 'd18-evening').paragraphs.join('\n')).not.toContain('one unbroken minute');
  });

  it('Dianne’s parcel line credits the Day-17 errand she witnessed', () => {
    const run = play('d17-morning', [...MAIL, 'turn-in', 'burn-unread', 'go-up',
      'take-the-day', 'keep-the-stove-side'], withFlags({ 'horn-on': true }));
    const prose = content.realizeProse(sceneById('d18-evening'), run.state).join('\n');
    expect(prose).toContain('Twice in two days');
  });
});

describe('day 19 — the register read-back', () => {
  const seedFacts = (s: WorldState): WorldState =>
    applyEffects(s, [
      { op: 'fact.add', tag: 'ate-first-meal', witnessedBy: ['barb'] },
      { op: 'fact.add', tag: 'helped-barb', witnessedBy: ['barb'] },
      { op: 'fact.add', tag: 'told-sam-dont-know', witnessedBy: ['sam'] },
    ]).state;

  const base = (s: WorldState): WorldState =>
    seedFacts(
      withFlags({
        'horn-stopped': true,
        'n1:goodbye': 'never',
        'd3:slot': 'room',
        'd3:trap': 'held',
        'potluck:verdict': 'exiled',
        'potluck:sam': 'given',
        'lullaby-taken': true,
        'd17:slot': 'clinic',
        'letter-memory-taken': true,
      })(s),
    );

  const run = play('d19-morning', ['let-the-day-spend'], base);
  const readback = viewOf(run, 'd19-evening').paragraphs.join('\n');

  it('exiled staging: she walks the book down under her coat', () => {
    expect(readback).toContain('under her coat');
    expect(readback).not.toContain('where the plates go');
  });

  it('reads the Night-1 goodbye answer back in the player’s verbatim words', () => {
    expect(readback).toContain('‘No. I never do.’');
  });

  it('reads the run’s record: quilt, shed, 2 AM, valve, potluck, Sam, lullaby, clinic', () => {
    expect(readback).toContain('whose pattern the blue was');
    expect(readback).toContain('Held a canoe steady');
    expect(readback).toContain('Kept by both parties');
    expect(readback).toContain('Shut the valve with her own hand');
    expect(readback).toContain('Wade had the stove going');
    expect(readback).toContain('In the old cadence');
    expect(readback).toContain('over the washing-up');
    expect(readback).toContain('walked lighter after');
  });

  it('includes the entry the player forgot, and says so', () => {
    expect(readback).toContain('Dried the pots');
    expect(readback).toContain('The book hadn’t.');
  });

  it('closes with her palm flat over the NAME column, and re-inks you (today:named)', () => {
    expect(readback).toContain('palm flat over the NAME column');
    expect(run.state.flags['today:named']).toBe(true);
  });

  it('reads nothing about the letter; burned adds only a smell she does not mention', () => {
    expect(readback).not.toContain('does not mention');
    const burned = play('d19-morning', ['let-the-day-spend'], (s) =>
      withFlags({ 'letter-burned': true })(base(s)),
    );
    const view = viewOf(burned, 'd19-evening').paragraphs.join('\n');
    expect(view).toContain('she does not mention it');
    expect(view).not.toContain('till drawer');
  });

  it('defended staging keeps the Kettle, the room’s verdict line, and Sam defended', () => {
    const defended = play('d19-morning', ['let-the-day-spend'], (s) =>
      withFlags({ 'potluck:verdict': 'defended', 'potluck:sam': 'defended' })(base(s)),
    );
    const view = viewOf(defended, 'd19-evening').paragraphs.join('\n');
    expect(view).toContain('where the plates go');
    expect(view).toContain('Chairs and all');
    expect(view).toContain('Spoke for the boy');
  });

  it('trust:barb ≥ 7 seeds the Long Winter, one sentence, never pushed', () => {
    expect(readback).not.toContain('end on purpose');
    expect(run.state.flags['barb:counsel-seeded']).toBeUndefined();
    const trusted = play('d19-morning', ['let-the-day-spend'], (s) =>
      applyEffects(base(s), [
        { op: 'fact.add', tag: 'truth-told', witnessedBy: ['barb'] },
        { op: 'fact.add', tag: 'truth-told', witnessedBy: ['barb'] },
      ]).state,
    );
    expect(viewOf(trusted, 'd19-evening').paragraphs.join('\n')).toContain('end on purpose');
    expect(trusted.state.flags['barb:counsel-seeded']).toBe(true);
  });
});

describe('night 19 — the act close', () => {
  const toNight = ['let-the-day-spend', 'let-the-book-close'] as const;

  it('horn-on closes on the held sixth; high UNDERTOW hears the haunting begin', () => {
    const low = play('d19-morning', [...toNight], withFlags({ 'horn-on': true }));
    expect(viewOf(low, 'd19-night').paragraphs.join('\n')).toContain('two thousand nights');
    const high = play('d19-morning', [...toNight], (s) => ({
      ...withFlags({ 'horn-on': true })(s),
      stats: { ...s.stats, undertow: 6 },
    }));
    const view = viewOf(high, 'd19-night').paragraphs.join('\n');
    expect(view).toContain('It is yours.');
    expect(view).not.toContain('two thousand nights');
  });

  it('horn-stopped: the silence sits back, and the count truly does not tick', () => {
    const run = play('d19-morning', [...toNight], withFlags({ 'horn-stopped': true }));
    const view = viewOf(run, 'd19-night').paragraphs.join('\n');
    expect(view).toContain('finished eating');
    // The read-back re-inked you: today:named was the night's offset.
    expect(run.state.flags['decay:tonight']).toBe('none');
    expect(run.events).toContainEqual({ kind: 'music.stop' });
  });

  it('asking after the NAME column earns its unanswer at night', () => {
    const run = play('d19-morning', ['let-the-day-spend', 'ask-name-column'],
      withFlags({ 'horn-on': true }));
    expect(viewOf(run, 'd19-night').paragraphs.join('\n')).toContain('It had a season in it.');
  });
});

describe('days 17–19 dialogue rules', () => {
  it('every (speaker, slot) pair has a zero-condition fallback', () => {
    const pairs = new Set(RULES.map((r) => `${r.speaker}:${r.slot}`));
    for (const pair of pairs) {
      const ok = RULES.some((r) => `${r.speaker}:${r.slot}` === pair && isFallback(r));
      expect(ok, `no fallback for ${pair}`).toBe(true);
    }
  });

  it('Dianne’s rules never use the name — love, hon, my girl only', () => {
    for (const rule of RULES.filter((r) => r.speaker === 'dianne')) {
      expect(/\bWren\b/.test(rule.text), `name in ${rule.id}`).toBe(false);
    }
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
      /\b(she|he|they|dianne|barb|tam|wade|priya|sam|moose)\s+(takes|touches|hugs|grabs|holds|pats|strokes|embraces|catches|clasps|pulls|reaches\s+for)\s+(you|your)\b/i;
    const byHand =
      /\b(her|his|their)\s+(hands?|arms?|palms?|fingers)\b[^.!?]{0,40}\b(on|around|against|over|through)\s+(you|yours?)\b/i;
    const seating = /\b(sits|sat|sets|set|puts|put|lays|laid|plants|planted)\s+you\b/i;
    for (const { source, text } of texts) {
      expect(touch.test(text), `NPC-initiated touch in ${source}`).toBe(false);
      expect(byHand.test(text), `NPC hand-touch in ${source}`).toBe(false);
      expect(seating.test(text), `NPC steering-touch in ${source}`).toBe(false);
    }
  });

  it("'Wren' appears exactly once in this cluster — the draft's @doc salutation", () => {
    const hits = texts.filter(({ text }) => /\bWren\b/.test(text));
    expect(hits.map((h) => h.source)).toEqual(['d17-reveal-2']);
    expect(hits[0]?.text.startsWith('@doc:')).toBe(true);
  });

  it('owns zero uses of the title phrase — the letter says “never here” instead', () => {
    for (const { source, text } of texts) {
      expect(/\bnot\s+here\b/i.test(text), `title phrase in ${source}`).toBe(false);
    }
    expect(rawText(sceneById('d17-reveal'))).toContain('never here');
  });

  it('never growls, never remarks', () => {
    for (const { source, text } of texts) {
      expect(/growl/i.test(text), `growl in ${source}`).toBe(false);
      expect(/\b(strange|odd|uncanny|impossible)\b/i.test(text), `remark in ${source}`).toBe(false);
    }
  });

  it('no paragraph exceeds the 150-word hard cap', () => {
    const wordCount = (t: string): number =>
      t.split(/\s+/).filter((w) => /[0-9A-Za-z’']/.test(w)).length;
    const over = texts
      .filter(({ text }) => !text.startsWith('@doc:') && !text.startsWith('@line:'))
      .map((t) => ({ ...t, words: wordCount(t.text) }))
      .filter((t) => t.words > 150);
    expect(over.map((t) => `${t.source} (${t.words}w)`)).toEqual([]);
  });
});
