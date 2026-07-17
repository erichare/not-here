/**
 * Day 20 content tests (design/act3-plan.md §Day 20 — Nov 25: The House
 * Prepares; LOCKED).
 *
 * Covers: the unsealed act2-end boundary (act1-end precedent — the card
 * keeps day 20, d20-morning sets slot only, d20-end parks the run for the
 * twenty-sixth); the 2-of-3 hub (one morning pick, one forced second leg,
 * never a third); Sam's confession OR-door proved through REAL PLAY on
 * every arm (told-sam-dont-know / d16:sam-named / derived trust:sam ≥ 7)
 * plus the 'given' exclusion and the zero-arm cold night; the arm-level
 * isolation of the shipped gate cond; the chord substrate (conf:sam +
 * chord.add 1, bar 5's return); the fed-pattern substrate (a3:fed-d20 at
 * both sites, witnesses pinned); offset survivability across every hub
 * pair on the stopped track (Ruling 5); the shed verbs (ANSWER / STAY
 * SILENT / the knows-truth release — TAKE is not offered); the guitar's
 * FLESH gate and lockedLabel ache; the retellings that SEED but never
 * complete (dianne:ready / priya:ready from the evening, no conf:*, no
 * chord); Barb's margins fed by the dianne→barb edge at the day boundary;
 * the unpayable-night arming; prose invariants over this fleet's texts.
 *
 * Walkthrough discipline (standing policy, pt2-fix-01): the gate runs use
 * ZERO injected state — real scenes, real choices, from Day 6 or Day 7 to
 * the NOVEMBER 26 card. Ordinary variant tests inject freely.
 *
 * NOTE: these tests assume content.ts has registered DAY20_SCENES and the
 * days-20-23 dialogue rules.
 */

import { describe, expect, it } from 'vitest';
import {
  advance,
  applyEffects,
  CHARACTERS,
  evaluate,
  initialState,
  type Cond,
  type EngineEvent,
  type Scene,
  type SceneId,
  type SceneView,
  type WorldState,
} from '@not-here/engine';
import { isFallback } from '@not-here/memory';
import { buildBarbsBook } from './barbs-book.ts';
import { buildContent } from './content.ts';
import { DAY20_SCENES } from './scenes/day20.ts';
import { RULES } from './dialogue-days2023.ts';

const content = buildContent();
const FLEET_SCENES: readonly Scene[] = DAY20_SCENES;

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

const sawScene = (run: Run, sceneId: SceneId): boolean =>
  run.views.some((v) => v.sceneId === sceneId);

const withFlags =
  (flags: Readonly<Record<string, boolean | number | string>>) =>
  (s: WorldState): WorldState => ({ ...s, flags: { ...s.flags, ...flags } });

// ——— Route segments (validated against the shipped Acts 1–2 scenes) ———

// Day 6 from the morning: the hall intake, then the recording in the lot —
// "I don't know." plants told-sam-dont-know (witnessed by Sam, UNDERTOW +2).
const D6_OPEN = ['go-to-the-hall', 'answer-plainly', 'back-up-the-hill', 'cross-the-lot',
  'say-i-dont-know', 'go-in-eventually'] as const;
// Day 7 close, horn kept / horn stopped at the 3:12 fork.
const ACT1_CLOSE_ON = ['cross-the-lot', 'for-the-song', 'keep-playing', 'lie-down',
  'morning-comes-anyway'] as const;
const ACT1_CLOSE_OFF = ['cross-the-lot', 'for-the-song', 'stop', 'walk-back', 'lie-down',
  'morning-comes-anyway'] as const;
// Days 8–12, the warm spine from the Long Winter walkthrough (day1719.test.ts).
const D8_TO_D12 = [
  'to-stockroom', 'keep-lifting', 'take-the-afternoon', 'cross-the-lot', 'let-day-nine',
  'to-walkin', 'finish-the-crates', 'cross-to-your-unit', 'let-day-ten',
  'go-to-the-hall', 'set-chairs', 'down-the-hill', 'let-her-ink', 'turn-in-late',
  'let-morning-come',
  'to-the-counter', 'slide-the-pad-to-dianne', 'down-to-the-kettle', 'eat-supper',
  'say-nothing', 'cross-the-lot', 'let-the-morning-come',
  'carry-tables', 'take-the-bowl', 'walk-down', 'cross-the-lot', 'sleep',
] as const;
// Day 13, three stances at the potluck.
const D13_DEFEND = ['eat-then-iron', 'take-the-end-chair', 'defend-sam', 'find-your-coat',
  'lie-down'] as const;
const D13_SILENT = ['eat-then-iron', 'take-the-end-chair', 'say-nothing', 'find-your-coat',
  'lie-down'] as const;
const D13_GIVE = ['eat-then-iron', 'take-the-end-chair', 'give-the-night', 'find-your-coat',
  'lie-down'] as const;
const D14_15 = [
  'take-what-is-given', 'hold-the-record', 'to-the-store', 'keep-wrapping',
  'down-the-hill', 'turn-in', 'let-the-fifteenth-come',
  'let-evening-come', 'stay-the-evening', 'refuse-it', 'let-the-sixteenth-come',
] as const;
// Day 16, three stagings: the layover, the breakwater name, the corkboard.
const D16_TAM = ['find-tam', 'sit-the-layover', 'eat-what-barbs-made'] as const;
const D16_NAME = ['find-sam', 'give-the-name', 'back-along-the-tide',
  'eat-what-barbs-made'] as const;
const D16_CORKBOARD = ['find-tam', 'walk-it-off', 'eat-what-barbs-made'] as const;
// Days 17–19 on the refuse/plain side, then across the unsealed card.
const D17_TO_READBACK = ['let-the-seventeenth-come', 'to-clinic', 'let-it-stay-hers',
  'walk-the-long-way', 'turn-in', 'let-morning-come', 'take-the-day'] as const;
const D18_19 = ['up-to-the-house', 'walk-the-parcels-down', 'say-goodnight',
  'let-morning-come', 'eat-whats-put-down'] as const;
const TO_D20 = ['let-the-book-close', 'sleep-toward-it', 'morning-comes-anyway'] as const;
// Day 20: the room then the wharf (horn-on), the evening eaten inside the planning.
const D20_ROOM_WHARF_EAT = ['up-to-diannes', 'let-it-hang', 'down-to-the-wharf',
  'let-him-tell-bar-five', 'let-the-evening-come', 'eat-inside-the-planning'] as const;
const D20_SHED_CLOSE = ['answer-him', 'let-the-twenty-sixth-come'] as const;
// The Night-6 mirror close: runs holding told-sam-dont-know answer AGAIN.
const D20_SHED_CLOSE_MIRROR = ['answer-him-again', 'let-the-twenty-sixth-come'] as const;

// ——— The boundary, unsealed ———

describe('the act boundary — act2-end unsealed, d20-end parks (act1-end precedent)', () => {
  it('act2-end keeps the card and walks into Day 20', () => {
    const card = content.scenes.get('act2-end');
    expect(card).toBeDefined();
    expect(card?.ending).toBeUndefined();
    expect(card?.cue).toBe('title');
    expect(card?.choices.map((c) => ({ id: c.id, goto: c.goto }))).toEqual([
      { id: 'morning-comes-anyway', goto: 'd20-morning' },
    ]);
  });

  it('d20-morning sets SLOT ONLY — day 20 stays the card’s', () => {
    const onEnter = sceneById('d20-morning').onEnter ?? [];
    expect(onEnter).toContainEqual({ op: 'time.set', slot: 'morning' });
    for (const effect of onEnter) {
      if (effect.op !== 'time.set') continue;
      expect(effect.day, 'd20-morning must not re-set the day').toBeUndefined();
    }
  });

  it('d20-end unsealed when Day 21 shipped: the card keeps day 21 and walks into the morning', () => {
    const card = sceneById('d20-end');
    expect(card.cue).toBe('title');
    expect(card.ending).toBeUndefined();
    expect(card.choices.map((c) => ({ id: c.id, goto: c.goto }))).toEqual([
      { id: 'morning-comes-anyway', goto: 'd21-morning' },
    ]);
    expect(card.onEnter).toContainEqual({ op: 'time.set', day: 21, slot: 'morning' });
    expect(rawText(card)).toContain('NOVEMBER 26');
  });

  it('crossing the card into the morning keeps the day and pays no second time.set', () => {
    const run = play('d19-morning', ['eat-whats-put-down', ...TO_D20],
      withFlags({ 'horn-on': true }));
    expect(run.state.sceneId).toBe('d20-morning');
    expect(run.state.day).toBe(20);
    expect(run.state.slot).toBe('morning');
  });
});

// ——— The hub — 2 of 3, forced, never a third ———

describe('the hub — two slots seat, the third is missed (act3-plan §Day 20)', () => {
  it('the morning offers all three doors', () => {
    expect(sceneById('d20-morning').choices.map((c) => c.goto)).toEqual([
      'd20-room', 'd20-wharf', 'd20-clinic',
    ]);
  });

  it('after one leg the two unvisited doors stand open and the evening stays shut', () => {
    const run = play('d20-morning', ['up-to-diannes', 'let-it-hang']);
    const exits = viewOf(run, 'd20-room-2').choices.map((c) => c.id);
    expect(exits).toEqual(['down-to-the-wharf', 'over-to-the-clinic']);
  });

  it('after the second leg only the evening remains — never a third door', () => {
    const run = play(
      'd20-morning',
      ['up-to-diannes', 'let-it-hang', 'down-to-the-wharf', 'let-him-tell-bar-five'],
      withFlags({ 'horn-on': true }),
    );
    expect(run.state.flags['d20:second-leg']).toBe(true);
    const exits = viewOf(run, 'd20-wharf-2').choices;
    expect(exits.map((c) => c.id)).toEqual(['let-the-evening-come']);
    expect(exits[0]?.locked).toBe(false);
  });

  it('each branch latches its went-flag so a door never seats twice', () => {
    const run = play('d20-morning', ['over-to-the-clinic', 'fold-the-wrap']);
    expect(run.state.flags['d20:went-priya']).toBe(true);
    const exits = viewOf(run, 'd20-clinic-2').choices.map((c) => c.id);
    expect(exits).toEqual(['up-to-diannes', 'down-to-the-wharf']);
  });
});

// ——— Sam's confession — the OR-door, reached through real play ———

/** The shipped gate, read off the evening exits (never re-authored here). */
const shippedGate = (): Cond => {
  const evening = sceneById('d20-evening');
  const gates = evening.choices.map((choice) => {
    const redirect = (choice.effects ?? []).find(
      (e) => e.op === 'when' && e.then.some((t) => t.op === 'goto' && t.scene === 'd20-shed'),
    );
    if (redirect?.op !== 'when') throw new Error(`${choice.id}: no shed redirect`);
    return redirect.cond;
  });
  // Both exits must carry the same OR-door.
  expect(gates).toHaveLength(2);
  expect(JSON.stringify(gates[0])).toBe(JSON.stringify(gates[1]));
  if (gates[0] === undefined) throw new Error('no gate found');
  return gates[0];
};

describe("Sam's confession — reached through real play, never injected", () => {
  it('arm 1, told-sam-dont-know: a horn-on run from Day 6, silent at the potluck', () => {
    // The only arm this run holds: potluck silence keeps trust:sam at
    // baseline (5) and never reaches the Day-16 breakwater, so neither
    // other arm can be the opener.
    const run = play('d6-morning', [
      ...D6_OPEN, 'stay-the-morning', ...ACT1_CLOSE_ON,
      ...D8_TO_D12, ...D13_SILENT, ...D14_15, ...D16_TAM,
      ...D17_TO_READBACK, ...D18_19, ...TO_D20,
      ...D20_ROOM_WHARF_EAT, ...D20_SHED_CLOSE_MIRROR,
    ]);
    expect(run.state.sceneId).toBe('d20-end');
    expect(run.state.day).toBe(21);
    expect(sawScene(run, 'd20-shed')).toBe(true);
    expect(sawScene(run, 'd20-night')).toBe(false);
    expect(run.state.flags['potluck:sam']).toBe('silent');
    expect(run.state.flags['d16:sam-named']).toBeUndefined();
    // 5 baseline + 1 for the shed's truth-told — the gate itself saw 5.
    expect(content.derived['trust:sam']?.(run.state)).toBe(6);
    expect(run.state.flags['conf:sam']).toBe(true);
    expect(run.state.chord).toBe(1);
    // The plan's verbatim plant, paid.
    expect(viewOf(run, 'd20-shed').paragraphs.join('\n')).toContain(
      'The dog walked her to the pull-in. Came back alone.',
    );
    // The lot answer happened on this run, so the mirror surfaces render:
    // the "still true" verb and the lot callback in Sam's response.
    const shedView = viewOf(run, 'd20-shed');
    expect(shedView.choices.map((c) => c.id)).toContain('answer-him-again');
    expect(shedView.choices.map((c) => c.id)).not.toContain('answer-him');
    expect(viewOf(run, 'd20-shed-2').paragraphs.join('\n')).toContain(
      'the way it landed in the lot',
    );
  });

  it('arm 2, d16:sam-named: a horn-stopped run through the breakwater name', () => {
    // NOTE: through real play this arm cannot stand alone — the Day-16
    // breakwater gate (day16.ts samGate) itself requires told-sam-dont-know,
    // so every run holding d16:sam-named also holds arm 1. The arm's
    // independent sufficiency is proved at the condition level below.
    const run = play('d6-morning', [
      ...D6_OPEN, 'stay-the-morning', ...ACT1_CLOSE_OFF,
      ...D8_TO_D12, ...D13_DEFEND, ...D14_15, ...D16_NAME,
      ...D17_TO_READBACK, ...D18_19, ...TO_D20,
      'over-to-the-clinic', 'answer-i-dont-know', 'down-to-the-wharf', 'carry-one-end',
      'let-the-evening-come', 'eat-inside-the-planning', ...D20_SHED_CLOSE_MIRROR,
    ]);
    expect(run.state.sceneId).toBe('d20-end');
    expect(run.state.flags['d16:sam-named']).toBe(true);
    expect(sawScene(run, 'd20-shed')).toBe(true);
    expect(run.state.flags['conf:sam']).toBe(true);
    expect(run.state.chord).toBe(1);
    // Stopped track, fed at the evening: the offset pays the night.
    expect(run.state.flags['decay:tonight']).toBe('none');
    // Silence-standing #1 happened on the way.
    expect(run.state.flags['wade:door-thawing']).toBe(1);
  });

  it('arm 3, derived trust:sam ≥ 7: the defended-sam run from Day 7, no confession, no name', () => {
    const spine = [
      'stay-the-morning', ...ACT1_CLOSE_ON,
      ...D8_TO_D12, ...D13_DEFEND, ...D14_15, ...D16_TAM,
      ...D17_TO_READBACK, ...D18_19, ...TO_D20,
    ] as const;
    // At the gate: baseline 5 + 2 (defended-sam, Sam a witness) = 7 exactly.
    const atEvening = play('d7-morning', [
      ...spine, 'up-to-diannes', 'let-it-hang', 'down-to-the-wharf',
      'let-him-tell-bar-five', 'let-the-evening-come',
    ]);
    expect(atEvening.state.sceneId).toBe('d20-evening');
    expect(content.derived['trust:sam']?.(atEvening.state)).toBe(7);
    expect(atEvening.state.facts.some((f) => f.tag === 'told-sam-dont-know')).toBe(false);
    expect(atEvening.state.flags['d16:sam-named']).toBeUndefined();
    const run = play('d7-morning', [...spine, ...D20_ROOM_WHARF_EAT, ...D20_SHED_CLOSE]);
    expect(run.state.sceneId).toBe('d20-end');
    expect(sawScene(run, 'd20-shed')).toBe(true);
    expect(run.state.flags['conf:sam']).toBe(true);
    expect(run.state.chord).toBe(1);
    // Nothing "landed in the lot" on this run — the lot got no answer at
    // all — so the verb and the response carry no Night-6 presupposition.
    const shedView = viewOf(run, 'd20-shed');
    expect(shedView.choices.map((c) => c.id)).toContain('answer-him');
    expect(shedView.choices.map((c) => c.id)).not.toContain('answer-him-again');
    const answer = shedView.choices.find((c) => c.id === 'answer-him');
    expect(answer?.label).toBe('“I don’t know what I am, Sam.”');
    const response = viewOf(run, 'd20-shed-2').paragraphs.join('\n');
    expect(response).not.toContain('in the lot');
    expect(response).toContain('we’re both what we are');
  });

  it("the 'given' exclusion: the scene does not fire and the cold beat prices the theft", () => {
    const run = play('d7-morning', [
      'stay-the-morning', ...ACT1_CLOSE_ON,
      ...D8_TO_D12, ...D13_GIVE, ...D14_15, ...D16_CORKBOARD,
      ...D17_TO_READBACK, ...D18_19, ...TO_D20,
      ...D20_ROOM_WHARF_EAT, 'let-the-twenty-sixth-come',
    ]);
    expect(run.state.sceneId).toBe('d20-end');
    expect(run.state.flags['potluck:sam']).toBe('given');
    expect(sawScene(run, 'd20-shed')).toBe(false);
    expect(sawScene(run, 'd20-night')).toBe(true);
    expect(run.state.flags['conf:sam']).toBeUndefined();
    expect(run.state.chord).toBe(0);
    const night = viewOf(run, 'd20-night').paragraphs.join('\n');
    expect(night).toContain('you are outside it');
    expect(night).toContain('the window between you');
    expect(night).not.toContain('more of a person than you have banked');
  });

  it('zero arms: the cold route stays outside on the quiet variant', () => {
    // The day1719 cold spine — no confession, no name, trust:sam untouched;
    // potluck silence, so the given beat must not render either.
    const run = play('d7-morning', [
      'shore-road', ...ACT1_CLOSE_ON,
      'to-shed', 'say-nothing-wall', 'up-the-shore-road', 'cross-the-lot', 'let-day-nine',
      'to-ride', 'give-the-mirror-nothing', 'walk-up-from-pullin', 'cross-to-your-unit',
      'let-day-ten',
      'go-to-the-shed', 'go-without-a-word', 'back-up-the-road', 'turn-in',
      'let-morning-come',
      'to-the-counter', 'slide-the-pad-to-dianne', 'down-to-the-kettle', 'leave-the-plate',
      'say-nothing', 'cross-the-lot', 'let-the-morning-come',
      'lay-cutlery', 'work-through', 'walk-down', 'cross-the-lot', 'sleep',
      'give-the-day-the-shore', 'take-the-end-chair', 'say-nothing', 'find-your-coat',
      'let-d14-come',
      'leave-it', 'hold-the-record', 'let-the-day-go', 'turn-in', 'let-the-fifteenth-come',
      'let-evening-come', 'stay-the-evening', 'refuse-it', 'let-the-sixteenth-come',
      'find-sam', 'leave-him-to-it', 'go-down-early',
      ...D17_TO_READBACK, 'keep-the-stove-side', 'let-the-evening-find-you', 'say-goodnight',
      'let-morning-come', 'let-the-day-spend',
      ...TO_D20,
      ...D20_ROOM_WHARF_EAT, 'let-the-twenty-sixth-come',
    ]);
    expect(run.state.sceneId).toBe('d20-end');
    expect(sawScene(run, 'd20-shed')).toBe(false);
    expect(content.derived['trust:sam']?.(run.state)).toBe(5);
    const night = viewOf(run, 'd20-night').paragraphs.join('\n');
    expect(night).toContain('more of a person than you have banked');
    expect(night).not.toContain('you are outside it');
  });
});

describe('the OR-door gate — each arm opens it alone (condition level)', () => {
  const gate = shippedGate();
  const base = initialState(11, 'd20-evening');
  const holds = (state: WorldState): boolean => evaluate(gate, state, content.derived);

  it('both evening exits carry the same gate, and a bare state fails it', () => {
    expect(holds(base)).toBe(false);
  });

  it('told-sam-dont-know alone opens it', () => {
    const state = applyEffects(base, [
      { op: 'fact.add', tag: 'told-sam-dont-know', witnessedBy: ['sam'] },
    ]).state;
    expect(holds(state)).toBe(true);
  });

  it('d16:sam-named alone opens it', () => {
    const state = applyEffects(base, [
      { op: 'flag.set', key: 'd16:sam-named', value: true },
    ]).state;
    expect(holds(state)).toBe(true);
  });

  it('trust:sam ≥ 7 alone opens it — defended-sam lands exactly at 7', () => {
    const state = applyEffects(base, [
      { op: 'fact.add', tag: 'defended-sam', about: 'sam', witnessedBy: CHARACTERS },
    ]).state;
    expect(content.derived['trust:sam']?.(state)).toBe(7);
    expect(holds(state)).toBe(true);
  });

  it("potluck:sam='given' shuts the door over every arm at once", () => {
    const state = applyEffects(base, [
      { op: 'fact.add', tag: 'told-sam-dont-know', witnessedBy: ['sam'] },
      { op: 'flag.set', key: 'd16:sam-named', value: true },
      { op: 'fact.add', tag: 'defended-sam', about: 'sam', witnessedBy: CHARACTERS },
      { op: 'flag.set', key: 'potluck:sam', value: 'given' },
    ]).state;
    expect(holds(state)).toBe(false);
  });
});

// ——— The shed verbs ———

describe('the shed — ANSWER, STAY SILENT, the release; TAKE is not offered', () => {
  it('the verb list is exactly three — ANSWER wears two mutually exclusive faces — and none of them takes', () => {
    expect(sceneById('d20-shed').choices.map((c) => c.id)).toEqual([
      'answer-him-again', 'answer-him', 'stay-silent', 'stop-keeping-it',
    ]);
  });

  it('the ANSWER faces split on the lot: "still true" only where Night 6 heard it', () => {
    // Without told-sam-dont-know (the trust:sam arm's run shape), the label
    // must not presuppose the lot answer, and shed-2 must not call back to it.
    const cold = play('d20-shed', ['answer-him']);
    const coldChoices = viewOf(cold, 'd20-shed').choices;
    expect(coldChoices.map((c) => c.id)).not.toContain('answer-him-again');
    expect(coldChoices.find((c) => c.id === 'answer-him')?.label).toBe(
      '“I don’t know what I am, Sam.”',
    );
    expect(viewOf(cold, 'd20-shed-2').paragraphs.join('\n')).not.toContain('in the lot');
    // With the fact, the mirror face replaces the plain one.
    const seed = (s: WorldState): WorldState =>
      applyEffects(s, [
        { op: 'fact.add', tag: 'told-sam-dont-know', witnessedBy: ['sam'] },
      ]).state;
    const mirror = play('d20-shed', ['answer-him-again'], seed);
    const mirrorChoices = viewOf(mirror, 'd20-shed').choices;
    expect(mirrorChoices.map((c) => c.id)).not.toContain('answer-him');
    expect(mirrorChoices.find((c) => c.id === 'answer-him-again')?.label).toBe(
      '“I don’t know what I am, Sam. That’s still true.”',
    );
    expect(viewOf(mirror, 'd20-shed-2').paragraphs.join('\n')).toContain(
      'the way it landed in the lot',
    );
    // Both faces price and plant identically.
    for (const run of [cold, mirror]) {
      expect(run.state.flags['d20:answered']).toBe(true);
      expect(run.state.facts.some((f) => f.tag === 'truth-told')).toBe(true);
    }
    expect(mirror.state.stats.undertow).toBe(cold.state.stats.undertow);
  });

  it('ANSWER pays UNDERTOW +1, plants truth-told for Sam, and hears its response', () => {
    const run = play('d20-shed', ['answer-him']);
    expect(run.state.stats.undertow).toBe(2); // initial 1 + 1
    expect(run.state.flags['d20:answered']).toBe(true);
    const fact = run.state.facts.find((f) => f.tag === 'truth-told');
    expect(fact).toBeDefined();
    expect(run.state.knownBy.sam).toContain(fact?.id);
    const view = viewOf(run, 'd20-shed-2').paragraphs.join('\n');
    expect(view).toContain('we’re both what we are');
    expect(view).not.toContain('the fog’s answer');
  });

  it('STAY SILENT hands him the fog’s answer and costs nothing', () => {
    const run = play('d20-shed', ['stay-silent']);
    expect(run.state.stats.undertow).toBe(1);
    expect(run.state.flags['d20:silent']).toBe(true);
    expect(viewOf(run, 'd20-shed-2').paragraphs.join('\n')).toContain('the fog’s answer');
  });

  it('the release is hidden without knows-truth and spends the letter’s own sentence with it', () => {
    const cold = play('d20-shed', []);
    expect(viewOf(cold, 'd20-shed').choices.map((c) => c.id)).toEqual([
      'answer-him', 'stay-silent',
    ]);
    const run = play('d20-shed', ['stop-keeping-it'], withFlags({ 'knows-truth': true }));
    expect(run.state.flags['d20:spent-the-sentence']).toBe(true);
    expect(run.state.facts.some((f) => f.tag === 'released-sam')).toBe(true);
    expect(run.state.stats.undertow).toBe(1); // the release itself is unpriced
    expect(viewOf(run, 'd20-shed-2').paragraphs.join('\n')).toContain(
      'something eleven years old lets go of his shoulders',
    );
  });

  it('whichever verb, the confession was given: conf:sam, the chord, and the lever move in shed-2', () => {
    for (const verb of ['answer-him', 'stay-silent']) {
      const run = play('d20-shed', [verb]);
      expect(run.state.flags['conf:sam']).toBe(true);
      expect(run.state.chord).toBe(1);
      // The lever chain (act3-plan contract, retrofit landed with Day 21):
      // Sam's confession names Wade's 3:12 — lever:wade ← conf:sam.
      expect(run.state.flags['lever:wade']).toBe(true);
    }
  });
});

// ——— The chord substrate ———

describe('the chord substrate — bar 5 enters the ensemble, audio stays off', () => {
  it('shed-2 adds exactly one fragment and the count is gate-readable', () => {
    const run = play('d20-shed', ['answer-him']);
    expect(run.state.chord).toBe(1);
    expect(run.events).toContainEqual({ kind: 'music.chord', fragments: 1 });
    expect(evaluate({ op: 'chord.gte', value: 1 }, run.state, content.derived)).toBe(true);
    expect(evaluate({ op: 'chord.gte', value: 2 }, run.state, content.derived)).toBe(false);
  });

  it('the giver-hears-it line rides the prose, whatever the verb', () => {
    for (const verb of ['answer-him', 'stay-silent']) {
      expect(viewOf(play('d20-shed', [verb]), 'd20-shed-2').paragraphs.join('\n')).toContain(
        'he whistles it once',
      );
    }
  });

  it('no scene in the fleet emits a new audible cue for the fragment', () => {
    // The act3-ensemble mixer is unauditioned: shed and shed-2 carry no cue
    // and the shed's only emit is the mirror-of-Night-6 music.stop.
    expect(sceneById('d20-shed').cue).toBeUndefined();
    expect(sceneById('d20-shed-2').cue).toBeUndefined();
    const events = play('d20-shed', ['answer-him']).events.filter(
      (e) => e.kind === 'music.cue' || e.kind === 'music.layer' || e.kind === 'music.stinger',
    );
    expect(events).toEqual([]);
  });
});

// ——— The fed-pattern substrate + offset survivability (Ruling 5) ———

describe('the fed substrate — a3:fed-d20 at both sites, witnesses pinned', () => {
  it('Dianne’s room feeds you where the truth lives: today:fed + a3:fed-d20, hers to witness', () => {
    const run = play('d20-morning', ['up-to-diannes']);
    expect(run.state.flags['today:fed']).toBe(true);
    const fed = run.state.facts.find((f) => f.tag === 'a3:fed-d20');
    expect(fed).toBeDefined();
    expect(run.state.knownBy.dianne).toContain(fed?.id);
    expect(run.state.knownBy.barb).not.toContain(fed?.id);
  });

  it('the evening plate is Barb’s witnessed site, open on every route', () => {
    const eat = sceneById('d20-evening').choices.find((c) => c.id === 'eat-inside-the-planning');
    expect(eat).toBeDefined();
    expect(eat?.when, 'the survivability site must never be gated').toBeUndefined();
    expect(eat?.effects).toContainEqual({ op: 'flag.set', key: 'today:fed', value: true });
    expect(eat?.effects).toContainEqual({
      op: 'fact.add', tag: 'a3:fed-d20', witnessedBy: ['barb'],
    });
  });

  it('the substrate is presence-checked, not counted: fact.exists reads it', () => {
    const run = play('d20-morning', ['up-to-diannes']);
    expect(evaluate({ op: 'fact.exists', tag: 'a3:fed-d20' }, run.state, content.derived)).toBe(
      true,
    );
  });
});

describe('offset survivability — every hub pair on the stopped track can pay the night', () => {
  const DOOR: Readonly<Record<string, readonly [string, string]>> = {
    room: ['up-to-diannes', 'let-it-hang'],
    wharf: ['down-to-the-wharf', 'carry-one-end'],
    clinic: ['over-to-the-clinic', 'fold-the-wrap'],
  };
  const pairs = Object.keys(DOOR).flatMap((first) =>
    Object.keys(DOOR).filter((second) => second !== first).map((second) => [first, second]),
  );

  it.each(pairs)('%s then %s, fed at the evening: decay pays nothing', (first, second) => {
    const [firstDoor, firstVerb] = DOOR[first] ?? ['', ''];
    const [secondDoor, secondVerb] = DOOR[second] ?? ['', ''];
    const run = play(
      'd20-morning',
      [firstDoor, firstVerb, secondDoor, secondVerb, 'let-the-evening-come',
        'eat-inside-the-planning'],
      // Given staging keeps the run on the plain night door; stopped track
      // makes the decay observable.
      withFlags({ 'horn-stopped': true, 'potluck:sam': 'given' }),
    );
    expect(run.state.sceneId).toBe('d20-night');
    expect(run.state.facts.some((f) => f.tag === 'a3:fed-d20')).toBe(true);
    expect(run.state.flags['decay:tonight']).toBe('none');
    expect(run.state.stats.flesh).toBe(3); // nothing paid
  });

  it('the dark taken early without a slot’s offset still decays — a route cost, not a trap', () => {
    const run = play(
      'd20-morning',
      ['over-to-the-clinic', 'fold-the-wrap', 'down-to-the-wharf', 'carry-one-end',
        'let-the-evening-come', 'take-the-dark-early'],
      withFlags({ 'horn-stopped': true, 'potluck:sam': 'given' }),
    );
    expect(run.state.flags['decay:tonight']).toBe('flesh');
    expect(run.state.stats.flesh).toBe(2);
  });
});

// ——— The branches’ variant beats ———

describe('the room — the guitar, the press, the readiness', () => {
  it('the guitar aches shut under FLESH 5 and comes down over it', () => {
    const locked = play('d20-morning', ['up-to-diannes']);
    const gate = viewOf(locked, 'd20-room').choices.find((c) => c.id === 'take-the-guitar');
    expect(gate?.locked).toBe(true);
    expect(gate?.label).toBe(
      'Take it — but your arms, today, are not certain they could keep it off the floor.',
    );
    const strong = play('d20-morning', ['up-to-diannes', 'take-the-guitar'], (s) => ({
      ...s,
      stats: { ...s.stats, flesh: 5 },
    }));
    expect(strong.state.flags['d20:guitar-held']).toBe(true);
    expect(viewOf(strong, 'd20-room-2').paragraphs.join('\n')).toContain(
      'your elbow finds the lower bout',
    );
  });

  it('the press exists only with knows-truth, and she does not answer', () => {
    const cold = play('d20-morning', ['up-to-diannes']);
    expect(viewOf(cold, 'd20-room').choices.map((c) => c.id)).not.toContain(
      'ask-who-the-room-is-for',
    );
    const run = play('d20-morning', ['up-to-diannes', 'ask-who-the-room-is-for'],
      withFlags({ 'knows-truth': true }));
    expect(run.state.facts.some((f) => f.tag === 'asked-who-the-room-is-for')).toBe(true);
    expect(viewOf(run, 'd20-room-2').paragraphs.join('\n')).toContain(
      'her face is a door with the key on the inside',
    );
  });

  it('attending sets dianne:ready and plants the airing for the margins', () => {
    const run = play('d20-morning', ['up-to-diannes']);
    expect(run.state.flags['dianne:ready']).toBe(true);
    const fact = run.state.facts.find((f) => f.tag === 'aired-the-room-d20');
    expect(fact).toBeDefined();
    expect(run.state.knownBy.dianne).toContain(fact?.id);
  });

  it('the Kettle-day opener is gated off exiled stagings', () => {
    const staged = play('d20-morning', ['up-to-diannes'],
      withFlags({ 'd18:kettle-day': true }));
    expect(viewOf(staged, 'd20-room').paragraphs.join('\n')).toContain('Twice in two days');
    const exiled = play('d20-morning', ['up-to-diannes'],
      withFlags({ 'd18:kettle-day': true, 'potluck:verdict': 'exiled' }));
    expect(viewOf(exiled, 'd20-room').paragraphs.join('\n')).not.toContain('Twice in two days');
  });
});

describe('the clinic — the closed notebook, or the envelope she cannot remember reading', () => {
  it('the plain staging asks the one question, notebook closed, and prices the honest answer', () => {
    const run = play('d20-morning', ['over-to-the-clinic', 'answer-i-dont-know']);
    expect(viewOf(run, 'd20-clinic').paragraphs.join('\n')).toContain(
      'Are you staying past Friday?',
    );
    expect(run.state.stats.undertow).toBe(2);
    expect(run.state.facts.some((f) => f.tag === 'answered-priya-friday')).toBe(true);
    expect(run.state.flags['priya:ready']).toBe(true);
  });

  it('letter-memory-taken swaps the scene: the envelope, the bag, the private fact', () => {
    const run = play('d20-morning', ['over-to-the-clinic', 'keep-packing'],
      withFlags({ 'letter-memory-taken': true }));
    const view = viewOf(run, 'd20-clinic').paragraphs.join('\n');
    expect(view).toContain('addressed in a hand she knows');
    expect(view).not.toContain('Are you staying past Friday?');
    const found = run.state.facts.find((f) => f.tag === 'private:priya-found-envelope');
    expect(found).toBeDefined();
    expect(run.state.knownBy.priya).toContain(found?.id);
    expect(run.state.knownBy.barb).not.toContain(found?.id);
  });
});

describe('the wharf — the green door by staging', () => {
  it('horn-on: bar five told earns today:remembered', () => {
    const run = play('d20-morning', ['down-to-the-wharf', 'let-him-tell-bar-five'],
      withFlags({ 'horn-on': true }));
    expect(run.state.flags['today:remembered']).toBe(true);
    expect(viewOf(run, 'd20-wharf-2').paragraphs.join('\n')).toContain('Flatted the end of it');
  });

  it('horn-stopped: the silence-standing pays no offset but thaws the door', () => {
    const run = play('d20-morning', ['down-to-the-wharf', 'carry-one-end'],
      withFlags({ 'horn-stopped': true }));
    expect(run.state.flags['wade:door-thawing']).toBe(1);
    expect(run.state.flags['today:remembered']).toBeUndefined();
    expect(viewOf(run, 'd20-wharf-2').paragraphs.join('\n')).toContain('Same time tomorrow');
  });

  it('exiled + horn-on: he asks leave at your threshold', () => {
    const run = play('d20-morning', ['down-to-the-wharf'],
      withFlags({ 'horn-on': true, 'potluck:verdict': 'exiled' }));
    expect(viewOf(run, 'd20-wharf').paragraphs.join('\n')).toContain('Your door now');
  });
});

// ——— The evening — retellings seed, never complete ———

describe('the evening — retellings SEED (*:ready) and never complete a confession', () => {
  const missDianne = ['down-to-the-wharf', 'carry-one-end', 'over-to-the-clinic',
    'fold-the-wrap', 'let-the-evening-come'] as const;

  it('a missed room still readies the house — through Barb, slightly wrong', () => {
    const run = play('d20-morning', [...missDianne], withFlags({ 'horn-stopped': true }));
    expect(run.state.flags['dianne:ready']).toBe(true);
    const view = viewOf(run, 'd20-evening').paragraphs.join('\n');
    // Clue-#8 grammar: canon says second time in seven years; Barb says third.
    expect(view).toContain('Third time she’s aired that room');
    expect(run.events).toContainEqual({
      kind: 'music.detune', pattern: 'dianne', cents: -50,
    });
  });

  it('no conf:* fires and the chord never moves from a retelling', () => {
    const run = play('d20-morning', [...missDianne], withFlags({ 'horn-stopped': true }));
    expect(run.state.chord).toBe(0);
    expect(run.state.flags['conf:sam']).toBeUndefined();
    expect(Object.keys(run.state.flags).filter((k) => k.startsWith('conf:'))).toEqual([]);
  });

  it('a missed clinic seeds priya:ready and relays the question wrong', () => {
    const run = play('d20-morning', ['up-to-diannes', 'let-it-hang', 'down-to-the-wharf',
      'carry-one-end', 'let-the-evening-come'], withFlags({ 'horn-stopped': true }));
    expect(run.state.flags['priya:ready']).toBe(true);
    const view = viewOf(run, 'd20-evening').paragraphs.join('\n');
    expect(view).toContain('Would you still be here come Friday');
    expect(run.events).toContainEqual({
      kind: 'music.detune', pattern: 'priya', cents: -50,
    });
  });

  it('the attended slots do not detune — only the hole has a sound', () => {
    const run = play('d20-morning', [...missDianne], withFlags({ 'horn-stopped': true }));
    const detunes = run.events.filter((e) => e.kind === 'music.detune');
    expect(detunes.map((e) => (e.kind === 'music.detune' ? e.pattern : ''))).toEqual(['dianne']);
  });
});

// ——— Nights, decay tells, arming ———

describe('night 20 — the count, the arming, the fresh tells', () => {
  it('both night doors arm the unpayable night — state only', () => {
    const shed = play('d20-shed', ['answer-him']);
    expect(shed.state.flags['a3:unpayable-armed']).toBe(true);
    const plain = play('d20-night', []);
    expect(plain.state.flags['a3:unpayable-armed']).toBe(true);
  });

  it('the plain night keeps the two-track cue grammar', () => {
    const on = play('d20-night', [], withFlags({ 'horn-on': true }));
    expect(on.events).toContainEqual({ kind: 'music.cue', cue: 'foghorn-312' });
    const off = play('d20-night', [], withFlags({ 'horn-stopped': true }));
    expect(off.events).toContainEqual({ kind: 'music.stop' });
  });

  it('each night door tells its decay in its own words', () => {
    const plain = play('d20-night', [], (s) => ({
      ...withFlags({ 'horn-stopped': true })(s),
      // decay:next unset → FLESH pays first (act2-shared rotation).
    }));
    expect(plain.state.flags['decay:tonight']).toBe('flesh');
    expect(viewOf(plain, 'd20-night').paragraphs.join('\n')).toContain(
      'unsure the floor of it will bear',
    );
    const shed = play('d20-shed', ['stay-silent'], withFlags({ 'horn-stopped': true }));
    expect(shed.state.flags['decay:tonight']).toBe('flesh');
    expect(viewOf(shed, 'd20-shed-2').paragraphs.join('\n')).toContain(
      'spends you like the last of a purse',
    );
  });
});

// ——— The margins — the dianne edge carries the airing at the day boundary ———

describe('Barb’s margins — Day 20 rows travel their real edges', () => {
  it('the airing reaches the page only after the day turns', () => {
    const spine = [
      'stay-the-morning', ...ACT1_CLOSE_ON,
      ...D8_TO_D12, ...D13_DEFEND, ...D14_15, ...D16_TAM,
      ...D17_TO_READBACK, ...D18_19, ...TO_D20,
    ] as const;
    const atEvening = play('d7-morning', [
      ...spine, 'up-to-diannes', 'let-it-hang', 'down-to-the-wharf',
      'let-him-tell-bar-five', 'let-the-evening-come',
    ]);
    expect(
      evaluate(
        { op: 'fact.knownBy', who: 'barb', tag: 'aired-the-room-d20' },
        atEvening.state,
        content.derived,
      ),
    ).toBe(false);
    const parked = play('d7-morning', [...spine, ...D20_ROOM_WHARF_EAT, ...D20_SHED_CLOSE]);
    expect(
      evaluate(
        { op: 'fact.knownBy', who: 'barb', tag: 'aired-the-room-d20' },
        parked.state,
        content.derived,
      ),
    ).toBe(true);
    const { heldFacts } = buildBarbsBook(parked.state);
    expect(heldFacts).toContain(
      'up the hill for the airing, Dianne says. the sash open in that cold. seven years shut, and now twice in the month.',
    );
    expect(heldFacts).toContain(
      'ate what was put in front of her today. the week ahead wants her fed.',
    );
  });
});

// ——— Dialogue rules ———

describe('days 20–23 dialogue rules', () => {
  it('every (speaker, slot) pair has a zero-condition fallback', () => {
    const pairs = new Set(RULES.map((r) => `${r.speaker}:${r.slot}`));
    for (const pair of pairs) {
      const ok = RULES.some((r) => `${r.speaker}:${r.slot}` === pair && isFallback(r));
      expect(ok, `no fallback for ${pair}`).toBe(true);
    }
  });

  it('the resumed-run line surfaces only on the sacrificed route', () => {
    const spine = ['up-to-diannes', 'let-it-hang', 'down-to-the-wharf', 'carry-one-end',
      'let-the-evening-come'] as const;
    const plain = play('d20-morning', [...spine], withFlags({ 'horn-stopped': true }));
    expect(viewOf(plain, 'd20-evening').paragraphs.join('\n')).not.toContain(
      'Run’s back on for the twenty-sixth',
    );
    const resumed = play('d20-morning', [...spine], (s) =>
      applyEffects(withFlags({ 'horn-stopped': true })(s), [
        { op: 'fact.add', tag: 'sacrificed-sam', about: 'sam', witnessedBy: CHARACTERS },
        { op: 'flag.set', key: 'potluck:sam', value: 'given' },
      ]).state,
    );
    expect(viewOf(resumed, 'd20-evening').paragraphs.join('\n')).toContain(
      'Run’s back on for the twenty-sixth',
    );
  });
});

// ——— Prose invariants (this fleet) ———

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

  it('the morning suspension reconciliation rides the sacrificed route only', () => {
    const morning = sceneById('d20-morning');
    if (morning.prose.kind !== 'inline') throw new Error('d20-morning is not inline');
    const doc = morning.prose.paragraphs.find((p) => p.text.startsWith('@doc:'));
    expect(doc?.text).toContain('BC TRANSIT — SERVICE NOTICE');
    expect(doc?.text).toContain('Effective November 26');
    expect(JSON.stringify(doc?.when)).toContain('sacrificed-sam');
  });

  it('the town mentions the duffel by not mentioning it', () => {
    expect(rawText(sceneById('d20-morning'))).toContain(
      'Nobody mentions it, which is how the town mentions it.',
    );
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
