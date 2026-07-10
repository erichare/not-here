/**
 * Days 10–11 content tests (design/act2-beats.md §Day 10, §Day 11).
 *
 * Covers: hub topology and the day ladder boundaries (d10-morning owns
 * day 10, d11-morning day 11, d11-night exits to d12-morning); the ash-tin
 * clue plant (the unburned corner @doc; taking the corner is not offered);
 * the defensive pressed-dianne when-chain (press #2 and press #3, the
 * increment that makes 3 setting dianne:locks-house) and the Day-10 knock
 * beat under a forced lock; the dish-list blank and the evening double-ink
 * (today:named); the NAME≥4-gated receipt signing with its aching
 * lockedLabel; Barb's one warning (canon text, heeded flag, the marked-lie
 * STATIC cost); presence decay on both nights (managed vs unmanaged, the
 * rotation, offset consumption, the diegetic tells, offset flags cleared
 * on both tracks); track-branched night cues (foghorn-312 on horn-on only,
 * nothing on horn-stopped); without-you retellings with detuned motifs
 * whose visual twins live in the prose (no tell.visual toasts); gossip
 * visibility across the Day 10→11 boundary (dianne→barb); and the prose
 * invariants over this fleet's texts, including the pinned single spoken
 * "not here" (the warning) and zero 'Wren'.
 *
 * NOTE: these tests require content.ts to register DAY10_SCENES,
 * DAY11_SCENES, and the days-10-11 dialogue rules (integration wires
 * them after this cluster lands).
 */

import { describe, expect, it } from 'vitest';
import {
  advance,
  initialState,
  type EngineEvent,
  type Scene,
  type SceneId,
  type SceneView,
  type WorldState,
} from '@not-here/engine';
import { isFallback } from '@not-here/memory';
import { buildContent } from './content.ts';
import { DAY10_SCENES } from './scenes/day10.ts';
import { DAY11_SCENES } from './scenes/day11.ts';
import { RULES } from './dialogue-days1011.ts';

const content = buildContent();
const FLEET_SCENES: readonly Scene[] = [...DAY10_SCENES, ...DAY11_SCENES];

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

const HOUSE_EAT_TO_NIGHT = [
  'go-up-to-the-house', 'keep-to-the-stove', 'eat-what-she-puts-down',
  'down-to-the-kettle', 'turn-in',
] as const;

const SHED_TO_NIGHT = [
  'go-to-the-shed', 'say-its-fair', 'back-up-the-road', 'turn-in',
] as const;

const HALL_TO_EVENING = ['go-to-the-hall', 'set-chairs', 'down-the-hill'] as const;

const ALBUMS_STAY = ['to-the-albums', 'stay-for-the-stories', 'back-down-the-hill'] as const;
const COUNTER_SLIDE = [
  'to-the-counter', 'slide-the-pad-to-dianne', 'down-to-the-kettle',
] as const;

describe('hubs and day boundaries', () => {
  it('d10-morning offers the house, the hall, and the shed', () => {
    expect(sceneById('d10-morning').choices.map((c) => c.goto)).toEqual([
      'd10-house', 'd10-hall', 'd10-shed',
    ]);
  });

  it('d11-morning offers the albums and the counter', () => {
    expect(sceneById('d11-morning').choices.map((c) => c.goto)).toEqual([
      'd11-albums', 'd11-counter',
    ]);
  });

  it('d10-morning owns day 10; night 10 exits into day 11', () => {
    const d10 = play('d10-morning', []);
    expect(d10.state.day).toBe(10);
    expect(d10.state.slot).toBe('morning');
    const run = play('d10-morning', [...SHED_TO_NIGHT, 'let-morning-come']);
    expect(run.state.sceneId).toBe('d11-morning');
    expect(run.state.day).toBe(11);
  });

  it('d11-night exits to d12-morning (next cluster owns it)', () => {
    expect(sceneById('d11-night').choices.map((c) => c.goto)).toEqual(['d12-morning']);
  });

  it('the day narrows: both supper choices land in the warning', () => {
    for (const choice of sceneById('d11-evening').choices) {
      expect(choice.goto).toBe('d11-warning');
    }
  });
});

describe('cue discipline', () => {
  it('uses the assigned cues on the day scenes', () => {
    expect(sceneById('d10-house').cue).toBe('dianne-theme');
    expect(sceneById('d10-hall').cue).toBe('hall-upright');
    expect(sceneById('d10-shed').cue).toBe('sam-theme');
    expect(sceneById('d10-evening').cue).toBe('pub-warm');
    expect(sceneById('d11-albums').cue).toBe('wrens-room');
    expect(sceneById('d11-counter').cue).toBe('dianne-theme');
    expect(sceneById('d11-evening').cue).toBe('pub-warm');
  });

  it('night scenes carry no static cue; the warning carries none either', () => {
    expect(sceneById('d10-night').cue).toBeUndefined();
    expect(sceneById('d11-night').cue).toBeUndefined();
    expect(sceneById('d11-warning').cue).toBeUndefined();
    expect(sceneById('d11-warning-2').cue).toBeUndefined();
  });

  it('horn-on nights emit foghorn-312', () => {
    const run = play('d10-morning', [...SHED_TO_NIGHT], withFlags({ 'horn-on': true }));
    expect(
      run.events.some((e) => e.kind === 'music.cue' && e.cue === 'foghorn-312'),
    ).toBe(true);
  });

  it('horn-stopped nights carry no cue at all — the evening loop is stopped', () => {
    const run = play('d10-morning', [...SHED_TO_NIGHT], withFlags({ 'horn-stopped': true }));
    const cues = run.events.flatMap((e) => (e.kind === 'music.cue' ? [e.cue] : []));
    expect(cues).not.toContain('foghorn-312');
    // The last cue of the day is the evening's pub-warm; the night adds none,
    // and stops the loop so nothing plays under the silence.
    expect(cues[cues.length - 1]).toBe('pub-warm');
    expect(run.events).toContainEqual({ kind: 'music.stop' });
  });

  it('night 11 stops the loop on the stopped track too', () => {
    const run = play(
      'd11-morning',
      [...ALBUMS_STAY, 'eat-supper', 'say-nothing', 'cross-the-lot'],
      withFlags({ 'horn-stopped': true }),
    );
    expect(run.events).toContainEqual({ kind: 'music.stop' });
    expect(run.events.some((e) => e.kind === 'music.cue' && e.cue === 'foghorn-312')).toBe(false);
  });
});

describe('day 10 — the ash tin', () => {
  it('the unburned corner is planted as a document, four words of it', () => {
    const run = play('d10-morning', ['go-up-to-the-house', 'open-the-tin']);
    expect(run.state.flags['d10:opened-tin']).toBe(true);
    const view = viewOf(run, 'd10-house-tin').paragraphs.join('\n');
    expect(view).toContain('—n’t look for me.');
    expect(view).toContain('packed, felted');
  });

  it('taking the corner is not offered — the lid goes back, and that is all', () => {
    const tin = sceneById('d10-house-tin');
    expect(tin.choices).toHaveLength(1);
    expect(tin.choices[0]?.id).toBe('put-the-lid-back');
    expect(rawText(tin)).toContain('The corner stays where the ash holds it.');
  });

  it('the tin keeps its weight in the room after the lid is back', () => {
    const run = play('d10-morning', [
      'go-up-to-the-house', 'open-the-tin', 'put-the-lid-back',
    ]);
    expect(viewOf(run, 'd10-house-2').paragraphs.join('\n')).toContain(
      'gives nothing back',
    );
    const unopened = play('d10-morning', ['go-up-to-the-house', 'keep-to-the-stove']);
    expect(viewOf(unopened, 'd10-house-2').paragraphs.join('\n')).not.toContain(
      'gives nothing back',
    );
  });

  it('eating what she puts down is the offset: today:fed, FLESH fed at her cost', () => {
    const run = play('d10-morning', [
      'go-up-to-the-house', 'keep-to-the-stove', 'eat-what-she-puts-down',
    ]);
    expect(run.state.flags['today:fed']).toBe(true);
    expect(run.state.stats.flesh).toBe(4);
    const id = factIdOf(run.state, 'sat-dianne-stove-d10');
    expect(run.state.knownBy.dianne).toContain(id);
    // The cost is on the page: she serves herself the thin end.
    expect(rawText(sceneById('d10-house-2'))).toContain('thin end of the pot');
  });
});

describe('the press counter — defensive on exact values', () => {
  const PRESS_HOUSE = ['go-up-to-the-house', 'keep-to-the-stove', 'ask-what-she-burns'] as const;

  it('press #2 from nothing makes 1; the house stays open', () => {
    const run = play('d10-morning', [...PRESS_HOUSE]);
    expect(run.state.flags['pressed-dianne']).toBe(1);
    expect(run.state.flags['dianne:locks-house']).toBeUndefined();
  });

  it('press #2 after a Day-8 press makes 2', () => {
    const run = play('d10-morning', [...PRESS_HOUSE], withFlags({ 'pressed-dianne': 1 }));
    expect(run.state.flags['pressed-dianne']).toBe(2);
    expect(run.state.flags['dianne:locks-house']).toBeUndefined();
  });

  it('the press that makes 3 also locks the house', () => {
    const run = play('d10-morning', [...PRESS_HOUSE], withFlags({ 'pressed-dianne': 2 }));
    expect(run.state.flags['pressed-dianne']).toBe(3);
    expect(run.state.flags['dianne:locks-house']).toBe(true);
  });

  it('at 3 the counter holds — no fourth increment from these days', () => {
    const run = play('d10-morning', [...PRESS_HOUSE], withFlags({ 'pressed-dianne': 3 }));
    expect(run.state.flags['pressed-dianne']).toBe(3);
  });

  it('press #3 (the albums) runs the same chain', () => {
    const pressed = play(
      'd11-morning',
      ['to-the-albums', 'press-who-sorted'],
      withFlags({ 'pressed-dianne': 2 }),
    );
    expect(pressed.state.flags['pressed-dianne']).toBe(3);
    expect(pressed.state.flags['dianne:locks-house']).toBe(true);
    const first = play('d11-morning', ['to-the-albums', 'press-who-sorted']);
    expect(first.state.flags['pressed-dianne']).toBe(1);
    expect(first.state.flags['dianne:locks-house']).toBeUndefined();
  });

  it('pressing goes pleasant and closed; no scene remarks on the locking', () => {
    const run = play('d11-morning', ['to-the-albums', 'press-who-sorted']);
    const view = viewOf(run, 'd11-albums-2').paragraphs.join('\n');
    expect(view).toContain('She does not open another album.');
    expect(view).not.toContain('lock');
  });
});

describe('the knock beat (dianne:locks-house)', () => {
  it('locked: the door does not give, and a bolt travels', () => {
    const run = play(
      'd10-morning',
      ['go-up-to-the-house'],
      withFlags({ 'dianne:locks-house': true }),
    );
    const view = viewOf(run, 'd10-house').paragraphs.join('\n');
    expect(view).toContain('a bolt travels');
    expect(view).not.toContain('on the latch');
  });

  it('unlocked: the latch, the voice down the hall', () => {
    const run = play('d10-morning', ['go-up-to-the-house']);
    const view = viewOf(run, 'd10-house').paragraphs.join('\n');
    expect(view).toContain('on the latch');
    expect(view).not.toContain('a bolt travels');
  });
});

describe('day 10 — the dish list and the double-inked blank', () => {
  it('the list is a document with a casserole and an open name space', () => {
    const text = rawText(sceneById('d10-hall'));
    expect(text).toContain('POTLUCK — NOV 18');
    expect(text).toContain('casserole');
    expect(text).toContain('Nobody asks whose casserole.');
  });

  it('the hall route must face the blank in the evening; others turn in', () => {
    const hall = play('d10-morning', [...HALL_TO_EVENING]);
    const ids = viewOf(hall, 'd10-evening').choices.map((c) => c.id);
    expect(ids).toContain('let-her-ink');
    expect(ids).toContain('keep-the-blank');
    expect(ids).not.toContain('turn-in');
    const shed = play('d10-morning', ['go-to-the-shed', 'say-its-fair', 'back-up-the-road']);
    expect(viewOf(shed, 'd10-evening').choices.map((c) => c.id)).toEqual(['turn-in']);
  });

  it('letting Barb ink the blank is the today:named offset, double-inked', () => {
    const run = play('d10-morning', [...HALL_TO_EVENING, 'let-her-ink']);
    expect(run.state.flags['today:named']).toBe(true);
    expect(run.state.stats.name).toBe(3);
    const view = viewOf(run, 'd10-evening-2').paragraphs.join('\n');
    expect(view).toContain('unit one');
    expect(view).toContain('goes over it again');
    const id = factIdOf(run.state, 'barb-inked-the-blank');
    expect(run.state.knownBy.barb).toContain(id);
  });

  it('keeping the blank costs nothing but the name: UNDERTOW moves', () => {
    const run = play('d10-morning', [...HALL_TO_EVENING, 'keep-the-blank']);
    expect(run.state.stats.undertow).toBe(2);
    expect(run.state.flags['today:named']).toBeUndefined();
    expect(viewOf(run, 'd10-evening-2').paragraphs.join('\n')).toContain(
      'rides blank all the way to the potluck',
    );
  });
});

describe('presence decay — nights 10 and 11', () => {
  const UNMANAGED_BOTH_DAYS = [
    'go-to-the-shed', 'go-without-a-word', 'back-up-the-road', 'turn-in',
    'let-morning-come',
    'to-the-albums', 'press-who-sorted', 'back-down-the-hill',
    'leave-the-plate', 'say-nothing', 'cross-the-lot',
  ] as const;

  it('unmanaged on horn-stopped: flesh pays night 10, name pays night 11', () => {
    const run = play('d10-morning', [...UNMANAGED_BOTH_DAYS], withFlags({ 'horn-stopped': true }));
    expect(run.state.stats.flesh).toBe(2); // 3 - 1, night 10
    expect(run.state.stats.name).toBe(1); // 2 - 1, night 11
    expect(run.state.flags['decay:tonight']).toBe('name');
    expect(run.state.flags['decay:next']).toBe('echo');
    const night10 = viewOf(run, 'd10-night').paragraphs.join('\n');
    expect(night10).toContain('settles too fast');
    const night11 = viewOf(run, 'd11-night').paragraphs.join('\n');
    expect(night11).toContain('fainter tonight');
  });

  it('an offset consumes the night silently: no decay, no tell, no comment', () => {
    const run = play(
      'd10-morning',
      [...HOUSE_EAT_TO_NIGHT],
      withFlags({ 'horn-stopped': true }),
    );
    expect(run.state.stats.flesh).toBe(4); // fed, not decayed
    expect(run.state.flags['decay:tonight']).toBe('none');
    const night = viewOf(run, 'd10-night').paragraphs.join('\n');
    expect(night).not.toContain('settles too fast');
    expect(night).not.toContain('letting go');
  });

  it('a managed pair of days never pays: fed, remembered, fed again', () => {
    const run = play(
      'd10-morning',
      [
        ...HOUSE_EAT_TO_NIGHT, 'let-morning-come',
        ...ALBUMS_STAY, 'eat-supper', 'say-nothing', 'cross-the-lot',
      ],
      withFlags({ 'horn-stopped': true }),
    );
    expect(run.state.stats.flesh).toBe(5); // two meals, zero decay
    expect(run.state.flags['decay:tonight']).toBe('none');
    expect(run.state.flags['decay:next']).toBeUndefined(); // rotation never advanced
  });

  it('the rotation honors decay:next from earlier nights', () => {
    const run = play(
      'd10-morning',
      [...SHED_TO_NIGHT],
      withFlags({ 'horn-stopped': true, 'decay:next': 'name' }),
    );
    expect(run.state.stats.name).toBe(1);
    expect(run.state.flags['decay:tonight']).toBe('name');
    expect(run.state.flags['decay:next']).toBe('echo');
    expect(viewOf(run, 'd10-night').paragraphs.join('\n')).toContain('unit card');
  });

  it('horn-on nights feed instead: no decay, no tells, offsets still cleared', () => {
    const run = play(
      'd10-morning',
      [...HOUSE_EAT_TO_NIGHT],
      withFlags({ 'horn-on': true }),
    );
    expect(run.state.stats.flesh).toBe(4);
    expect(run.state.flags['decay:tonight']).toBeUndefined();
    expect(run.state.flags['today:fed']).toBe(false);
    const night = viewOf(run, 'd10-night').paragraphs.join('\n');
    expect(night).toContain('takes its portion');
    expect(night).not.toContain('settles too fast');
  });

  it('offset flags are cleared at night on the stopped track too', () => {
    const run = play(
      'd10-morning',
      [...HALL_TO_EVENING, 'let-her-ink', 'turn-in-late'],
      withFlags({ 'horn-stopped': true }),
    );
    expect(run.state.flags['decay:tonight']).toBe('none');
    expect(run.state.flags['today:named']).toBe(false);
    expect(run.state.flags['today:fed']).toBe(false);
    expect(run.state.flags['today:remembered']).toBe(false);
  });
});

describe('day 11 — the albums and the sleeve', () => {
  it('the empty re-labelled sleeve is planted, innocent, undated', () => {
    const text = rawText(sceneById('d11-albums'));
    expect(text).toContain('It is empty.');
    expect(text).toContain('newer ink');
    expect(text).toContain('the year written twice');
  });

  it('staying for the stories is today:remembered — told, not taken', () => {
    const run = play('d11-morning', ['to-the-albums', 'stay-for-the-stories']);
    expect(run.state.flags['today:remembered']).toBe(true);
    expect(run.state.stats.echo).toBe(2); // no harvest here
    expect(viewOf(run, 'd11-albums-2').paragraphs.join('\n')).toContain(
      'Being told is not the taking.',
    );
  });
});

describe('day 11 — the receipt line', () => {
  it('locks below NAME 4, and the locked label aches without parroting', () => {
    const run = play('d11-morning', ['to-the-counter']);
    const gate = viewOf(run, 'd11-counter').choices.find((c) => c.id === 'sign-the-line');
    expect(gate?.locked).toBe(true);
    expect(gate?.label).toBe('The pen is right there. The line is not for you yet.');
    const scene = sceneById('d11-counter');
    const choice = scene.choices.find((c) => c.id === 'sign-the-line');
    expect(choice?.lockedLabel?.startsWith('·')).toBe(false);
    expect(choice?.lockedLabel).not.toBe(choice?.label);
  });

  it('at NAME 4 the line takes your hand: today:named, and the flimsy rides down', () => {
    const run = play(
      'd11-morning',
      ['to-the-counter', 'sign-the-line', 'down-to-the-kettle'],
      (s) => ({ ...s, stats: { ...s.stats, name: 4 } }),
    );
    expect(run.state.flags['d11:signed']).toBe(true);
    expect(run.state.flags['today:named']).toBe(true);
    expect(run.state.stats.name).toBe(5);
    const id = factIdOf(run.state, 'signed-the-receipt-line');
    expect(run.state.knownBy.dianne).toContain(id);
    expect(viewOf(run, 'd11-counter-2').paragraphs.join('\n')).toContain('flimsy');
  });

  it('the register keeps the signature overnight — the warning scene shows it', () => {
    const signedRun = play(
      'd11-morning',
      ['to-the-counter', 'sign-the-line', 'down-to-the-kettle', 'eat-supper'],
      (s) => ({ ...s, stats: { ...s.stats, name: 4 } }),
    );
    expect(viewOf(signedRun, 'd11-warning').paragraphs.join('\n')).toContain(
      'darkest ink on the spread',
    );
    const unsigned = play('d11-morning', [...COUNTER_SLIDE, 'eat-supper']);
    expect(viewOf(unsigned, 'd11-warning').paragraphs.join('\n')).not.toContain(
      'darkest ink',
    );
  });
});

describe("night 11 — Barb's one warning", () => {
  it('carries the canon Frank text, said to the register', () => {
    const text = rawText(sceneById('d11-warning'));
    expect(text).toContain(
      '“My Frank came back, one winter. Sat where you’re sitting. He was here — and he was not here. And the second one wore the first one out.”',
    );
    expect(text).toContain('to the register, not to you');
    expect(text).toContain('She does not say it again.');
  });

  it('heeding sets the flag; the only answer tonight is the coffee', () => {
    const run = play('d11-morning', [...COUNTER_SLIDE, 'eat-supper', 'ask-what-he-was']);
    expect(run.state.flags['heeded-barbs-warning']).toBe(true);
    expect(viewOf(run, 'd11-warning-2').paragraphs.join('\n')).toContain(
      'Finish your coffee.',
    );
  });

  it('the joke is a marked lie: STATIC +2, and the flag stays unset', () => {
    const run = play('d11-morning', [...COUNTER_SLIDE, 'leave-the-plate', 'make-it-a-joke']);
    expect(run.state.staticMeter).toBe(12);
    expect(run.state.flags['heeded-barbs-warning']).toBeUndefined();
  });

  it('saying nothing costs nothing and earns nothing', () => {
    const run = play('d11-morning', [...COUNTER_SLIDE, 'eat-supper', 'say-nothing']);
    expect(run.state.staticMeter).toBe(10);
    expect(run.state.flags['heeded-barbs-warning']).toBeUndefined();
  });

  it('no dialogue rule ever references the warning (one-warning rule)', () => {
    for (const rule of RULES) {
      expect(/frank/i.test(rule.text), `warning echo in rule:${rule.id}`).toBe(false);
      expect(/warn/i.test(rule.text), `warning echo in rule:${rule.id}`).toBe(false);
    }
  });
});

describe('without-you retellings — the hole has a sound', () => {
  it('the house route misses the hall and the shed; both motifs detune', () => {
    const run = play('d10-morning', [
      'go-up-to-the-house', 'keep-to-the-stove', 'eat-what-she-puts-down',
      'down-to-the-kettle',
    ]);
    const patterns = run.events.flatMap((e) =>
      e.kind === 'music.detune' ? [e.pattern] : [],
    );
    expect(patterns).toContain('priya');
    expect(patterns).toContain('sam');
    expect(patterns).not.toContain('dianne');
    const evening = viewOf(run, 'd10-evening').paragraphs.join('\n');
    expect(evening).toContain('a shade flat');
    expect(evening).toContain('a quarter-tone flat');
    expect(evening).toContain('nobody’s put a name to');
    expect(evening).toContain('just the door');
  });

  it('the shed route hears the house and the hall, absent and edited', () => {
    const run = play('d10-morning', ['go-to-the-shed', 'say-its-fair', 'back-up-the-road']);
    const patterns = run.events.flatMap((e) =>
      e.kind === 'music.detune' ? [e.pattern] : [],
    );
    expect(patterns).toContain('dianne');
    expect(patterns).toContain('priya');
    const evening = viewOf(run, 'd10-evening').paragraphs.join('\n');
    expect(evening).toContain('She does her burning every November');
    expect(evening).toContain('music-box register');
  });

  it('day 11: whichever Dianne you missed, the hole is dianne-shaped', () => {
    const albums = play('d11-morning', [...ALBUMS_STAY]);
    expect(
      albums.events.some((e) => e.kind === 'music.detune' && e.pattern === 'dianne'),
    ).toBe(true);
    expect(viewOf(albums, 'd11-evening').paragraphs.join('\n')).toContain('till rolls');
    const counterRun = play('d11-morning', [...COUNTER_SLIDE]);
    expect(
      counterRun.events.some((e) => e.kind === 'music.detune' && e.pattern === 'dianne'),
    ).toBe(true);
    expect(viewOf(counterRun, 'd11-evening').paragraphs.join('\n')).toContain('museum');
  });

  it('prose is the twin: no tell.visual toast rides any detune', () => {
    const run = play('d10-morning', ['go-to-the-shed', 'say-its-fair', 'back-up-the-road']);
    expect(run.events.some((e) => e.kind === 'tell.visual')).toBe(false);
  });
});

describe('attendance is tracked — the skipped-shelves line (Days 8+10)', () => {
  it('skipping Dianne both days fires the bible’s line on the Day-11 evening', () => {
    const run = play(
      'd10-morning',
      [...SHED_TO_NIGHT, 'let-morning-come', ...ALBUMS_STAY],
      withFlags({ 'd8:slot': 'wharf' }),
    );
    expect(viewOf(run, 'd11-evening').paragraphs.join('\n')).toContain(
      'You were out at the wharf when Dianne needed the stockroom shelves.',
    );
  });

  it('the line names where you actually were on Day 8', () => {
    const run = play(
      'd10-morning',
      [...SHED_TO_NIGHT, 'let-morning-come', ...ALBUMS_STAY],
      withFlags({ 'd8:slot': 'shed' }),
    );
    const evening = viewOf(run, 'd11-evening').paragraphs.join('\n');
    expect(evening).toContain('down at the boat shed when Dianne needed the stockroom shelves');
    expect(evening).not.toContain('out at the wharf when Dianne');
  });

  it('attending either day keeps the line unsaid', () => {
    const attendedD10 = play(
      'd10-morning',
      [...HOUSE_EAT_TO_NIGHT, 'let-morning-come', ...ALBUMS_STAY],
      withFlags({ 'd8:slot': 'wharf' }),
    );
    expect(viewOf(attendedD10, 'd11-evening').paragraphs.join('\n')).not.toContain(
      'stockroom shelves',
    );
    const attendedD8 = play(
      'd10-morning',
      [...SHED_TO_NIGHT, 'let-morning-come', ...ALBUMS_STAY],
      withFlags({ 'd8:slot': 'stockroom' }),
    );
    expect(viewOf(attendedD8, 'd11-evening').paragraphs.join('\n')).not.toContain(
      'stockroom shelves',
    );
  });
});

describe('gossip visibility across the day boundary', () => {
  it("Dianne's kitchen reaches Barb overnight, and Barb credits her source", () => {
    const run = play('d10-morning', [
      ...HOUSE_EAT_TO_NIGHT, 'let-morning-come', ...ALBUMS_STAY,
    ]);
    const id = factIdOf(run.state, 'sat-dianne-stove-d10');
    expect(run.state.knownBy.barb).toContain(id);
    expect(viewOf(run, 'd11-evening').paragraphs.join('\n')).toContain(
      'Dianne says you sat her kitchen',
    );
  });

  it('with nothing carried over, the slot greeting wins instead', () => {
    const run = play('d10-morning', [
      ...SHED_TO_NIGHT, 'let-morning-come', ...ALBUMS_STAY,
    ]);
    const evening = viewOf(run, 'd11-evening').paragraphs.join('\n');
    expect(evening).toContain('She talks better over pictures');
    expect(evening).not.toContain('Dianne says you sat her kitchen');
  });
});

describe('days 10–11 dialogue rules', () => {
  it('every (speaker, slot) pair has a zero-condition fallback', () => {
    const pairs = new Set(RULES.map((r) => `${r.speaker}:${r.slot}`));
    for (const pair of pairs) {
      const ok = RULES.some((r) => `${r.speaker}:${r.slot}` === pair && isFallback(r));
      expect(ok, `no fallback for ${pair}`).toBe(true);
    }
  });

  it('at least one rule requires a fact its speaker never witnessed', () => {
    expect(RULES.some((r) => r.id === 'barb-g11-stove' && r.requires?.length)).toBe(true);
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
    for (const { source, text } of texts) {
      expect(touch.test(text), `NPC-initiated touch in ${source}`).toBe(false);
    }
  });

  it('never says Wren, never growls, never remarks', () => {
    for (const { source, text } of texts) {
      expect(/\bWren\b/.test(text), `'Wren' in ${source}`).toBe(false);
      expect(/growl/i.test(text), `growl in ${source}`).toBe(false);
      expect(/\b(strange|odd|uncanny|impossible)\b/i.test(text), `remark in ${source}`).toBe(false);
    }
  });

  it("the spoken title budget: exactly once, Barb's warning, never in a doc", () => {
    const hits = texts.flatMap(({ source, text }) => {
      const count = (text.match(/not\s+here/gi) ?? []).length;
      return count > 0 ? [{ source, count, doc: text.startsWith('@doc:') }] : [];
    });
    expect(hits).toEqual([{ source: 'd11-warning', count: 1, doc: false }]);
  });

  it('no schedule outside the EBUS card shares its departure time', () => {
    for (const { source, text } of texts) {
      expect(text.includes('07:40'), `EBUS time in ${source}`).toBe(false);
    }
  });

  it('prose economy: no paragraph past the 150-word hard cap', () => {
    const words = (t: string): number =>
      t.split(/\s+/).filter((w) => /[0-9A-Za-z’']/.test(w)).length;
    const over = texts
      .filter(({ text }) => !text.startsWith('@doc:') && !text.startsWith('@line:'))
      .map((t) => ({ ...t, count: words(t.text) }))
      .filter((t) => t.count > 150);
    expect(over.map((t) => `${t.source} (${t.count}w)`)).toEqual([]);
  });
});
