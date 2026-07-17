/**
 * Day 21 content tests (design/act3-plan.md §Day 21 — Nov 26: The Ask;
 * LOCKED).
 *
 * Covers: the unsealed d20-end boundary (the card keeps day 21, d21-morning
 * sets slot only, d21-end parks the run for the twenty-seventh); the 2-of-3
 * morning hub (depot / ice / the guitar-alone door with its FLESH gate,
 * ache-locked at the first pick and hidden in the hub exits); Dianne's
 * confession OR-door (dianne:ready OR knows-truth) and Barb's Night-21
 * OR-door (derived trust:barb ≥ 7 OR knows-truth), both proved through REAL
 * PLAY — the trust arm with the rung arithmetic spelled out (the pt2
 * dead-gate lesson's ground zero: the fifth rung, helped-barb-ice, lands
 * the morning of the gate); THE ASK by staging (defended: the shelter
 * request and the orchard man's hat; exiled: Wade brings word down); the
 * confession verbs (TAKE the burning / ANSWER / STAY SILENT) with the
 * harvest pricing and the on-screen loss in both stagings; the lullaby
 * fork (whole-hummed bars vs the missing stair, marked once); the withheld
 * knows-truth tiers rendered on knowing runs and ABSENT on innocent
 * trust-gated runs (ambush-leak protection, both directions); the
 * sacrificed-sam stagings (Tam civil and unseeing, tam:ready withheld even
 * from the retelling, the Moose vigil planting a3:sat-with-moose); the
 * retellings that SEED but never complete; the sixth question's stored
 * answer (d21:sixth-answer, the Day-23 echo key); the counsel re-run and
 * the barb:counsel-live upgrade (writable ONLY in d21-lamp-2); the register
 * NAME column @doc; the fed-pattern substrate (a3:fed-d21 at the kettle,
 * the table entry, the vigil plate, and the gate-fail evening — every
 * fed site a CHOICE, never onEnter, so a refuser run keeps the substrate
 * empty and Night 21 can decay — Ruling 5 survivability); the
 * night doors' decay and arming; Barb's margins fed same-day by her own
 * witness and next-day by the tam edge; prose invariants over this fleet.
 *
 * Walkthrough discipline (standing policy, pt2-fix-01): the gate runs use
 * ZERO injected state — real scenes, real choices, from Day 7 to the
 * NOVEMBER 27 card. Ordinary variant tests inject freely.
 */

import { describe, expect, it } from 'vitest';
import {
  advance,
  applyEffects,
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
import { ALL_SCENES, buildContent } from './content.ts';
import { DAY21_SCENES } from './scenes/day21.ts';
import { RULES } from './dialogue-days2023.ts';
import { sceneEffectArrays } from './lint-shared.ts';

const content = buildContent();
const FLEET_SCENES: readonly Scene[] = DAY21_SCENES;

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

const barbKnows = (state: WorldState, tag: string): boolean =>
  evaluate({ op: 'fact.knownBy', who: 'barb', tag }, state, content.derived);

const trustBarb = (state: WorldState): number => {
  const value = content.derived['trust:barb']?.(state);
  if (value === undefined) throw new Error('trust:barb resolver missing');
  return value;
};

// ——— Route segments (validated against the shipped Acts 1–3 scenes) ———

const ACT1_CLOSE_ON = ['cross-the-lot', 'for-the-song', 'keep-playing', 'lie-down',
  'morning-comes-anyway'] as const;
const ACT1_CLOSE_OFF = ['cross-the-lot', 'for-the-song', 'stop', 'walk-back', 'lie-down',
  'morning-comes-anyway'] as const;
// Days 8–12, the warm spine: 'stay-the-morning' (Day 7) and 'to-walkin'
// (Day 9) are the run's TWO Barb-witnessed trust rungs.
const D8_TO_D12 = [
  'to-stockroom', 'keep-lifting', 'take-the-afternoon', 'cross-the-lot', 'let-day-nine',
  'to-walkin', 'finish-the-crates', 'cross-to-your-unit', 'let-day-ten',
  'go-to-the-hall', 'set-chairs', 'down-the-hill', 'let-her-ink', 'turn-in-late',
  'let-morning-come',
  'to-the-counter', 'slide-the-pad-to-dianne', 'down-to-the-kettle', 'eat-supper',
  'say-nothing', 'cross-the-lot', 'let-the-morning-come',
  'carry-tables', 'take-the-bowl', 'walk-down', 'cross-the-lot', 'sleep',
] as const;
const D13_DEFEND = ['eat-then-iron', 'take-the-end-chair', 'defend-sam', 'find-your-coat',
  'lie-down'] as const;
const D13_GIVE = ['eat-then-iron', 'take-the-end-chair', 'give-the-night', 'find-your-coat',
  'lie-down'] as const;
const D14_15 = [
  'take-what-is-given', 'hold-the-record', 'to-the-store', 'keep-wrapping',
  'down-the-hill', 'turn-in', 'let-the-fifteenth-come',
  'let-evening-come', 'stay-the-evening', 'refuse-it', 'let-the-sixteenth-come',
] as const;
const D16_TAM = ['find-tam', 'sit-the-layover', 'eat-what-barbs-made'] as const;
const D16_CORKBOARD = ['find-tam', 'walk-it-off', 'eat-what-barbs-made'] as const;
const D17_TO_READBACK = ['let-the-seventeenth-come', 'to-clinic', 'let-it-stay-hers',
  'walk-the-long-way', 'turn-in', 'let-morning-come', 'take-the-day'] as const;
const D18_19 = ['up-to-the-house', 'walk-the-parcels-down', 'say-goodnight',
  'let-morning-come', 'eat-whats-put-down'] as const;
const TO_D20 = ['let-the-book-close', 'sleep-toward-it', 'morning-comes-anyway'] as const;
const D20_ROOM_WHARF_EAT = ['up-to-diannes', 'let-it-hang', 'down-to-the-wharf',
  'let-him-tell-bar-five', 'let-the-evening-come', 'eat-inside-the-planning'] as const;
const D20_SHED_CLOSE = ['answer-him', 'let-the-twenty-sixth-come'] as const;
// The unsealed NOVEMBER 26 card's one bridge (mirrors TO_D20's grammar).
const TO_D21 = ['morning-comes-anyway'] as const;

// The warm defended spine, Day 7 to the parked NOVEMBER 26 card: two Barb
// rungs (kept-barb-company, helped-walkin-d9), the defended verdict, the
// shed confession (conf:sam, lever:wade, chord 1).
const WARM_TO_D20_END = [
  'stay-the-morning', ...ACT1_CLOSE_ON,
  ...D8_TO_D12, ...D13_DEFEND, ...D14_15, ...D16_TAM,
  ...D17_TO_READBACK, ...D18_19, ...TO_D20,
  ...D20_ROOM_WHARF_EAT, ...D20_SHED_CLOSE,
] as const;

// Day 21 on the warm run: depot then ice, the kitchen confession, the lamp.
const D21_DEPOT_KETTLE = ['out-to-the-depot', 'step-up-when-he-nods', 'in-to-the-kettle',
  'eat-what-she-puts-down', 'let-the-evening-come'] as const;
const D21_KITCHEN_ANSWER_LAMP = ['up-the-hill-when-the-dishes-clear', 'answer-her',
  'take-the-dark-home', 'ill-be-there'] as const;

// The cold exiled spine, Day 7 to the parked card, horn stopped, ZERO Barb
// rungs, knows-truth via the LETTER route (Night 17 opened; early-truth
// never fires): the only Frank canon this run holds is Night 11's three
// sentences, and the only Barb door it holds is the truth shared.
const COLD_LETTER_TO_D20_END = [
  'shore-road', ...ACT1_CLOSE_OFF,
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
  'let-the-seventeenth-come',
  'to-mail', 'square-the-backlog', 'carry-the-held-mail', 'turn-in',
  'open-them', 'the-lined-page', 'lie-down-with-it',
  'take-the-day', 'up-the-shore', 'across-to-the-general', 'down-to-the-wharf',
  'let-the-light-have-it', 'say-goodnight', 'let-morning-come', 'let-the-day-spend',
  ...TO_D20,
  'over-to-the-clinic', 'answer-i-dont-know', 'down-to-the-wharf', 'carry-one-end',
  'let-the-evening-come', 'eat-inside-the-planning', 'let-the-twenty-sixth-come',
] as const;

// Day 21 on the cold run: ice then depot, the ticket-office confession.
const D21_KETTLE_DEPOT = ['in-to-the-kettle', 'eat-what-she-puts-down', 'out-to-the-depot',
  'step-up-when-he-nods', 'let-the-evening-come'] as const;
const D21_WHARF_SILENT_LAMP = ['go-down-and-be-findable', 'stay-silent',
  'take-the-dark-home', 'i-dont-know-yet'] as const;

// The given/sacrificed spine (no shed on Day 20; the plain night door).
const GIVEN_TO_D20_END = [
  'stay-the-morning', ...ACT1_CLOSE_ON,
  ...D8_TO_D12, ...D13_GIVE, ...D14_15, ...D16_CORKBOARD,
  ...D17_TO_READBACK, ...D18_19, ...TO_D20,
  ...D20_ROOM_WHARF_EAT, 'let-the-twenty-sixth-come',
] as const;

// ——— The boundary, moved ———

describe('the boundary — d20-end unsealed, d21-end parks (the act boundary precedent)', () => {
  it('d21-morning sets SLOT ONLY — day 21 stays the NOVEMBER 26 card’s', () => {
    const onEnter = sceneById('d21-morning').onEnter ?? [];
    expect(onEnter).toContainEqual({ op: 'time.set', slot: 'morning' });
    for (const effect of onEnter) {
      if (effect.op !== 'time.set') continue;
      expect(effect.day, 'd21-morning must not re-set the day').toBeUndefined();
    }
  });

  it('d21-end mirrors d20-end as it was: cue title, ending marker, no choices, owns day 22', () => {
    const card = sceneById('d21-end');
    expect(card.cue).toBe('title');
    expect(card.ending).toBe('d21-end');
    expect(card.choices).toEqual([]);
    expect(card.onEnter).toContainEqual({ op: 'time.set', day: 22, slot: 'morning' });
    expect(rawText(card)).toContain('NOVEMBER 27');
  });

  it('crossing the card into the morning keeps the day and pays no second time.set', () => {
    const run = play('d20-shed', ['answer-him', 'let-the-twenty-sixth-come', ...TO_D21]);
    expect(run.state.sceneId).toBe('d21-morning');
    expect(run.state.day).toBe(21);
    expect(run.state.slot).toBe('morning');
  });
});

// ——— The hub — 2 of 3, forced, the third door honestly gated ———

describe('the hub — two slots seat; the guitar door needs arms and a ready room', () => {
  it('the morning offers all three doors; the guitar aches shut on a bare run', () => {
    const run = play('d21-morning', []);
    const view = viewOf(run, 'd21-morning');
    expect(view.choices.map((c) => c.id)).toEqual([
      'out-to-the-depot', 'in-to-the-kettle', 'up-to-the-empty-house',
    ]);
    const guitar = view.choices.find((c) => c.id === 'up-to-the-empty-house');
    expect(guitar?.locked).toBe(true);
    expect(guitar?.label).toBe(
      'Up to the house — but what waits there wants steady arms, and yours have not been steady for days.',
    );
  });

  it('after one leg the unvisited doors stand open; the locked guitar is HIDDEN here, not dimmed', () => {
    const bare = play('d21-morning', ['out-to-the-depot', 'step-up-when-he-nods']);
    expect(viewOf(bare, 'd21-depot-2').choices.map((c) => c.id)).toEqual(['in-to-the-kettle']);
    const strong = play(
      'd21-morning',
      ['out-to-the-depot', 'step-up-when-he-nods'],
      (s) => ({
        ...withFlags({ 'dianne:ready': true })(s),
        stats: { ...s.stats, flesh: 5 },
      }),
    );
    expect(viewOf(strong, 'd21-depot-2').choices.map((c) => c.id)).toEqual([
      'in-to-the-kettle', 'up-to-the-empty-house',
    ]);
  });

  it('after the second leg only the evening remains — never a third door', () => {
    const run = play('d21-morning', [
      'out-to-the-depot', 'step-up-when-he-nods', 'in-to-the-kettle', 'eat-what-she-puts-down',
    ]);
    expect(run.state.flags['d21:second-leg']).toBe(true);
    const exits = viewOf(run, 'd21-kettle-2').choices;
    expect(exits.map((c) => c.id)).toEqual(['let-the-evening-come']);
    expect(exits[0]?.locked).toBe(false);
  });

  it('each branch latches its went-flag so a door never seats twice', () => {
    const run = play('d21-morning', ['in-to-the-kettle', 'wave-off-the-plate']);
    expect(run.state.flags['d21:went-barb']).toBe(true);
    expect(viewOf(run, 'd21-kettle-2').choices.map((c) => c.id)).toEqual(['out-to-the-depot']);
  });
});

// ——— Walkthrough (a) — the warm defended run, trust arm, real play ———

describe('walkthrough: defended horn-on — the trust door, rung by rung (zero injected state)', () => {
  // At the parked NOVEMBER 26 card: two Barb-witnessed rungs from Acts 1–2.
  const atCard = play('d7-morning', [...WARM_TO_D20_END]);
  // Through Day 21 to the lamp's last answer, still on day 21.
  const atLamp2 = play('d7-morning', [
    ...WARM_TO_D20_END, ...TO_D21, ...D21_DEPOT_KETTLE, ...D21_KITCHEN_ANSWER_LAMP,
  ]);
  // The full run, parked for the twenty-seventh.
  const run = play('d7-morning', [
    ...WARM_TO_D20_END, ...TO_D21, ...D21_DEPOT_KETTLE, ...D21_KITCHEN_ANSWER_LAMP,
    'let-the-twenty-seventh-come',
  ]);

  it('the rung arithmetic, spelled out: 5 + two Acts-1–2 rungs at the card, + ice = 8', () => {
    expect(atCard.state.sceneId).toBe('d20-end');
    const rungTags = atCard.state.facts.map((f) => f.tag);
    expect(rungTags).toContain('kept-barb-company');
    expect(rungTags).toContain('helped-walkin-d9');
    expect(rungTags).not.toContain('helped-barb-ice');
    expect(trustBarb(atCard.state)).toBe(7); // baseline 5 + 1 + 1
    // Day 19 already seeded the counsel; the LIVE upgrade waits for the lamp.
    expect(atCard.state.flags['barb:counsel-seeded']).toBe(true);
    expect(atCard.state.flags['barb:counsel-live']).toBeUndefined();
    // The Day 20 contract the day inherits.
    expect(atCard.state.flags['conf:sam']).toBe(true);
    expect(atCard.state.flags['lever:wade']).toBe(true);
    expect(atCard.state.flags['dianne:ready']).toBe(true);
    expect(atCard.state.flags['potluck:verdict']).toBe('defended');
    expect(atCard.state.chord).toBe(1);
    // The fifth rung lands the morning of the gate.
    const ice = run.state.facts.find((f) => f.tag === 'helped-barb-ice');
    expect(ice).toBeDefined();
    expect(run.state.knownBy.barb).toContain(ice?.id);
    expect(trustBarb(run.state)).toBe(8); // 7 + the ice morning
  });

  it('the day seats depot and ice, misses the guitar, and parks on the twenty-seventh', () => {
    expect(run.state.sceneId).toBe('d21-end');
    expect(run.state.day).toBe(22);
    for (const seen of ['d21-depot', 'd21-kettle', 'd21-confession', 'd21-lamp'] as const) {
      expect(sawScene(run, seen), `never rendered ${seen}`).toBe(true);
    }
    for (const missed of ['d21-guitar', 'd21-evening-2', 'd21-vigil', 'd21-night'] as const) {
      expect(sawScene(run, missed), `should not render ${missed}`).toBe(false);
    }
    // The missed guitar is priced by the hub math alone: no sixth bar, and
    // no retelling — the solitary slot has nobody to retell it (the
    // no-detune proof runs isolated in the retellings describe below).
    expect(run.state.flags['sixthbar']).toBeUndefined();
  });

  it('the depot ride: he asks nothing outbound, says the pulse on the return, tam:ready sets', () => {
    expect(run.state.flags['tam:ready']).toBe(true);
    const ride = viewOf(run, 'd21-depot-2').paragraphs.join('\n');
    expect(ride).toContain('“Friday I’ve got a pickup. Vancouver coach connection.”');
    const rode = run.state.facts.find((f) => f.tag === 'rode-with-tam-d21');
    expect(rode).toBeDefined();
    expect(run.state.knownBy.tam).toContain(rode?.id);
  });

  it('the confession comes to her kitchen, and THE ASK cashes the potluck debt', () => {
    const view = viewOf(run, 'd21-confession').paragraphs.join('\n');
    expect(view).toContain('she washes and you dry');
    expect(view).toContain('The canoe’s gone.');
    expect(view).toContain('There was never a search I believed in.');
    const after = viewOf(run, 'd21-confession-2').paragraphs.join('\n');
    expect(after).toContain('I am asking you to stand up there with me');
    expect(after).toContain('tonight is when this starts to cost');
    expect(after).toContain('He touches the hat, once, to you and to her door in the same motion');
    // Exiled staging stays off this run.
    expect(after).not.toContain('the day would go easier without you in it');
  });

  it('the cascade lands whole: conf:sam/dianne/barb, both levers, chord 3, counsel live', () => {
    expect(run.state.flags['conf:sam']).toBe(true);
    expect(run.state.flags['conf:dianne']).toBe(true);
    expect(run.state.flags['conf:barb']).toBe(true);
    expect(run.state.flags['lever:wade']).toBe(true);
    expect(run.state.flags['lever:priya']).toBe(true);
    expect(run.state.chord).toBe(3);
    expect(run.state.flags['barb:counsel-seeded']).toBe(true);
    expect(run.state.flags['barb:counsel-live']).toBe(true);
  });

  it('the sixth question closes the lamp and the answer is stored for the wharf', () => {
    const lamp = viewOf(run, 'd21-lamp').paragraphs.join('\n');
    expect(lamp).toContain('“Five, I asked you, first night. Here’s six: what’ll you do Friday?”');
    expect(run.state.flags['d21:sixth-answer']).toBe('ill-be-there');
    const after = viewOf(run, 'd21-lamp-2').paragraphs.join('\n');
    expect(after).toContain('“There,” she says');
    expect(after).toContain('then she inks it again');
  });

  it('the ambush leak is shut: no knows-truth tier renders on the innocent run', () => {
    expect(run.state.flags['knows-truth']).toBeUndefined();
    const confession = viewOf(run, 'd21-confession').paragraphs.join('\n');
    expect(confession).not.toContain('I needed to get the words right before Friday.');
    const lamp = viewOf(run, 'd21-lamp').paragraphs.join('\n');
    expect(lamp).not.toContain('came up was yours');
  });

  it('the margins keep their timing: the ice same-day, the ride only after the day turns', () => {
    // Still day 21, at the lamp: Barb witnessed the ice herself...
    expect(barbKnows(atLamp2.state, 'helped-barb-ice')).toBe(true);
    expect(buildBarbsBook(atLamp2.state).heldFacts).toContain(
      'hauled ice with me the morning the pie case quit. never once asked was there an easier way.',
    );
    // ...but the ride is Tam's until the tam edge runs at the boundary.
    expect(barbKnows(atLamp2.state, 'rode-with-tam-d21')).toBe(false);
    expect(barbKnows(run.state, 'rode-with-tam-d21')).toBe(true);
    expect(buildBarbsBook(run.state).heldFacts).toContain(
      'rode the morning run out and back, Tam says. he mentioned it, which from Tam is a paragraph.',
    );
  });
});

// ——— Walkthrough (b) — the cold exiled run, knows-truth arm, real play ———

describe('walkthrough: exiled horn-stopped knows-truth — the letter route’s door (zero injected state)', () => {
  const run = play('d7-morning', [
    ...COLD_LETTER_TO_D20_END, ...TO_D21, ...D21_KETTLE_DEPOT, ...D21_WHARF_SILENT_LAMP,
    'let-the-twenty-seventh-come',
  ]);

  it('the run’s shape: exiled, stopped track, letter-route knowledge, no Day-20 shed', () => {
    expect(run.state.sceneId).toBe('d21-end');
    expect(run.state.flags['potluck:verdict']).toBe('exiled');
    expect(run.state.flags['horn-stopped']).toBe(true);
    expect(run.state.flags['knows-truth']).toBe(true);
    expect(run.state.flags['letter-opened']).toBe(true);
    expect(run.state.flags['early-truth']).toBeUndefined();
    expect(run.state.flags['conf:sam']).toBeUndefined();
  });

  it('the knows-truth arm carries Barb’s door alone: trust:barb is 6 at the lamp', () => {
    // Zero Acts-1–2 rungs; the ice morning is the run's only rung: 5 + 1.
    const rungs = run.state.facts
      .map((f) => f.tag)
      .filter((tag) =>
        ['helped-barb', 'helped-barb-walkin', 'kept-barb-company', 'helped-walkin-d9',
          'helped-barb-ice'].includes(tag),
      );
    expect(rungs).toEqual(['helped-barb-ice']);
    expect(trustBarb(run.state)).toBe(6); // under the trust gate — the truth opened the door
    expect(sawScene(run, 'd21-lamp')).toBe(true);
    expect(run.state.flags['conf:barb']).toBe(true);
  });

  it('the evening carries the duffel warm beat and the exiled edge', () => {
    const view = viewOf(run, 'd21-evening').paragraphs.join('\n');
    expect(view).toContain('He sent it ahead. Not to the coach stop. To wherever you are.');
    expect(view).toContain('the edges have learned to leave a chair');
  });

  it('she comes down to the ticket office in the wrong coat, and the dish goes cold between you', () => {
    const view = viewOf(run, 'd21-confession').paragraphs.join('\n');
    expect(view).toContain('her coat is still wrong for the wind');
    expect(view).toContain('does not step back from it this time');
    expect(view).not.toContain('she washes and you dry');
  });

  it('THE ASK arrives by Wade, unasked and ashamed', () => {
    const after = viewOf(run, 'd21-confession-2').paragraphs.join('\n');
    expect(after).toContain('the feeling is the day would go easier without you in it');
    expect(after).toContain('so it would arrive with an apology attached');
    expect(after).not.toContain('I am asking you to stand up there with me');
  });

  it('the withheld tiers RENDER here: her door line, and Barb’s your-face line', () => {
    expect(viewOf(run, 'd21-confession').paragraphs.join('\n')).toContain(
      'I needed to get the words right before Friday.',
    );
    const lamp = viewOf(run, 'd21-lamp').paragraphs.join('\n');
    expect(lamp).toContain('came up was yours');
    // Letter-route runs never heard Night 12: the early-truth-gated
    // acknowledgment must not presuppose it.
    expect(lamp).not.toContain('You already paid for the other part');
  });

  it('the exiled lamp walks the book down the hill — the coat over you, never her hand', () => {
    const lamp = viewOf(run, 'd21-lamp').paragraphs.join('\n');
    expect(lamp).toContain('the coat, never the hand');
    expect(lamp).toContain('The second time is a confession.');
  });

  it('a knows-truth run without the trust pattern completes conf:barb but seeds no counsel', () => {
    expect(run.state.flags['barb:counsel-seeded']).toBeUndefined();
    expect(run.state.flags['barb:counsel-live']).toBeUndefined();
  });

  it('the stopped track survives the day: fed at the ice — the dish stays cold — and the night pays nothing', () => {
    expect(run.state.flags['decay:tonight']).toBe('none');
    expect(run.state.facts.filter((f) => f.tag === 'a3:fed-d21').length).toBeGreaterThanOrEqual(1);
    // The exiled dish is deliberately uneaten: this run's only Day-21
    // meal was the ice morning's — one fed fact, not two.
    expect(run.state.facts.filter((f) => f.tag === 'a3:fed-d21')).toHaveLength(1);
  });

  it('the chord counts two: her bars and Barb’s harmony, no bar five on this run', () => {
    expect(run.state.chord).toBe(2);
  });
});

// ——— The gates, condition level — each arm opens alone ———

/** Dianne's OR-door, read off the shipped evening exits (never re-authored). */
const shippedDianneGate = (): Cond => {
  const evening = sceneById('d21-evening');
  const gated = evening.choices.filter((c) => c.goto === 'd21-confession');
  expect(gated).toHaveLength(3);
  const gates = gated.map((choice) => {
    if (choice.when?.op !== 'all') throw new Error(`${choice.id}: no staged gate`);
    return choice.when.of[0];
  });
  for (const gate of gates) {
    expect(JSON.stringify(gate)).toBe(JSON.stringify(gates[0]));
  }
  if (gates[0] === undefined) throw new Error('no gate found');
  return gates[0];
};

/** Barb's OR-door, read off the shipped lamp redirects (never re-authored). */
const shippedBarbGate = (): Cond => {
  const redirectCond = (sceneId: SceneId, choiceId: string): Cond => {
    const choice = sceneById(sceneId).choices.find((c) => c.id === choiceId);
    const redirect = (choice?.effects ?? []).find(
      (e) => e.op === 'when' && e.then.some((t) => t.op === 'goto' && t.scene === 'd21-lamp'),
    );
    if (redirect?.op !== 'when') throw new Error(`${sceneId}#${choiceId}: no lamp redirect`);
    return redirect.cond;
  };
  const gates = [
    redirectCond('d21-confession-2', 'take-the-dark-home'),
    redirectCond('d21-vigil', 'let-the-night-have-the-rest'),
    redirectCond('d21-evening-2', 'eat-inside-and-let-the-night-come'),
    redirectCond('d21-evening-2', 'take-the-dark-early'),
  ];
  for (const gate of gates) {
    expect(JSON.stringify(gate)).toBe(JSON.stringify(gates[0]));
  }
  if (gates[0] === undefined) throw new Error('no gate found');
  return gates[0];
};

describe('the OR-doors — arm-level isolation (condition level)', () => {
  const base = initialState(11, 'd21-evening');

  it('Dianne’s: a bare state fails; dianne:ready alone opens; knows-truth alone opens', () => {
    const gate = shippedDianneGate();
    const holds = (state: WorldState): boolean => evaluate(gate, state, content.derived);
    expect(holds(base)).toBe(false);
    expect(holds(applyEffects(base, [
      { op: 'flag.set', key: 'dianne:ready', value: true },
    ]).state)).toBe(true);
    expect(holds(applyEffects(base, [
      { op: 'flag.set', key: 'knows-truth', value: true },
    ]).state)).toBe(true);
  });

  it('Barb’s trust arm, one rung at a time: 5 fails, 6 fails, 7 opens — the ledger is exact', () => {
    const gate = shippedBarbGate();
    const holds = (state: WorldState): boolean => evaluate(gate, state, content.derived);
    expect(trustBarb(base)).toBe(5);
    expect(holds(base)).toBe(false);
    const oneRung = applyEffects(base, [
      { op: 'fact.add', tag: 'kept-barb-company', witnessedBy: ['barb'] },
    ]).state;
    expect(trustBarb(oneRung)).toBe(6);
    expect(holds(oneRung)).toBe(false);
    const twoRungs = applyEffects(oneRung, [
      { op: 'fact.add', tag: 'helped-walkin-d9', witnessedBy: ['barb'] },
    ]).state;
    expect(trustBarb(twoRungs)).toBe(7);
    expect(holds(twoRungs)).toBe(true);
  });

  it('the fifth rung alone cannot open the door — it rescues a pattern, never replaces one', () => {
    const gate = shippedBarbGate();
    const iceOnly = applyEffects(base, [
      { op: 'fact.add', tag: 'helped-barb-ice', witnessedBy: ['barb'] },
    ]).state;
    expect(trustBarb(iceOnly)).toBe(6);
    expect(evaluate(gate, iceOnly, content.derived)).toBe(false);
  });

  it('knows-truth alone opens Barb’s door at baseline trust', () => {
    const gate = shippedBarbGate();
    const state = applyEffects(base, [
      { op: 'flag.set', key: 'knows-truth', value: true },
    ]).state;
    expect(trustBarb(state)).toBe(5);
    expect(evaluate(gate, state, content.derived)).toBe(true);
  });
});

// ——— Walkthrough (c) — neither gate: the plain night, nothing dead-gated ———

describe('the neither-gate evening — the two-line non-scene, the fragment stays hers', () => {
  // Injected shape: a bare state carries neither dianne:ready nor
  // knows-truth. (Through real play Day 20 seeds dianne:ready on every
  // route — the catch-up slot is Day 22's to reach; authored per plan.)
  const run = play('d21-evening', [
    'let-the-evening-be-ordinary', 'eat-inside-and-let-the-night-come',
    'let-the-twenty-seventh-come',
  ]);

  it('the evening plays without the confession and still reaches the card', () => {
    expect(sawScene(run, 'd21-evening-2')).toBe(true);
    expect(sawScene(run, 'd21-confession')).toBe(false);
    expect(sawScene(run, 'd21-lamp')).toBe(false);
    expect(sawScene(run, 'd21-night')).toBe(true);
    expect(run.state.sceneId).toBe('d21-end');
    expect(run.state.day).toBe(22);
  });

  it('nothing is foreclosed: no conf:*, no lever, chord untouched, no negative flag', () => {
    expect(Object.keys(run.state.flags).filter((k) => k.startsWith('conf:'))).toEqual([]);
    expect(Object.keys(run.state.flags).filter((k) => k.startsWith('lever:'))).toEqual([]);
    expect(run.state.chord).toBe(0);
    expect(run.state.flags['barb:counsel-live']).toBeUndefined();
  });

  it('the non-scene is two lines: the book stays under the counter, the ink stays hers', () => {
    const night = viewOf(run, 'd21-night').paragraphs.join('\n');
    expect(night).toContain('the book stays under the counter');
    expect(night).toContain('She double-inks something you cannot read from here');
  });

  it('the gate-fail evening still feeds: Ruling 5 holds on the stopped track', () => {
    const fed = play('d21-evening', [
      'let-the-evening-be-ordinary', 'eat-inside-and-let-the-night-come',
    ], withFlags({ 'horn-stopped': true }));
    expect(fed.state.facts.some((f) => f.tag === 'a3:fed-d21')).toBe(true);
    expect(fed.state.flags['decay:tonight']).toBe('none');
  });
});

// ——— Walkthrough (d) — sacrificed-sam: civil, unseeing, and the vigil ———

describe('walkthrough: sacrificed-sam — Tam is civil, tam:ready waits, the dog gets company (zero injected state)', () => {
  const run = play('d7-morning', [
    ...GIVEN_TO_D20_END, ...TO_D21,
    'out-to-the-depot', 'step-up-with-the-fare', 'in-to-the-kettle', 'eat-what-she-puts-down',
    'let-the-evening-come',
    'up-the-hill-when-the-dishes-clear', 'stay-silent', 'sit-the-cold-with-moose',
    'let-the-night-have-the-rest', 'give-her-the-silence', 'let-the-twenty-seventh-come',
  ]);

  it('the resumed run is first-morning-back, and his eyes never land', () => {
    expect(run.state.facts.some((f) => f.tag === 'sacrificed-sam')).toBe(true);
    const depot = viewOf(run, 'd21-depot').paragraphs.join('\n');
    expect(depot).toContain('First run back.');
    expect(depot).toContain('arrive on the far side of you without stopping');
    expect(viewOf(run, 'd21-depot-2').paragraphs.join('\n')).not.toContain(
      'Vancouver coach connection',
    );
  });

  it('attendance does not seat you: no tam:ready, no ride fact — he did not see you', () => {
    expect(run.state.flags['tam:ready']).toBeUndefined();
    expect(run.state.facts.some((f) => f.tag === 'rode-with-tam-d21')).toBe(false);
  });

  it('the vigil pays the dog’s four minutes onstage and Tam witnesses the sitting', () => {
    const vigil = viewOf(run, 'd21-vigil').paragraphs.join('\n');
    expect(vigil).toContain('the dog’s four minutes get paid again in full');
    expect(vigil).toContain('a thing he intends to remember');
    const sat = run.state.facts.find((f) => f.tag === 'a3:sat-with-moose');
    expect(sat).toBeDefined();
    expect(run.state.knownBy.tam).toContain(sat?.id);
  });

  it('the mercy gate travels the tam edge at the boundary and margins on the page', () => {
    expect(barbKnows(run.state, 'a3:sat-with-moose')).toBe(true);
    expect(buildBarbsBook(run.state).heldFacts).toContain(
      'sat the cold at my door with the dog till the last run came down, Tam says. the dog kept his post the better for the company.',
    );
  });

  it('the run still confesses and parks whole: conf:dianne, conf:barb, the stored silence', () => {
    expect(run.state.sceneId).toBe('d21-end');
    expect(run.state.flags['conf:dianne']).toBe(true);
    expect(run.state.flags['conf:barb']).toBe(true);
    expect(run.state.flags['d21:sixth-answer']).toBe('give-her-the-silence');
    expect(run.state.chord).toBe(2); // bar five stayed unsung on the given route
  });
});

// ——— The retellings — SEED, never complete; ambush-safe; sacrificed-aware ———

describe('the evening retellings — slightly wrong, never sharpened, never completing', () => {
  const strongArms = (extra?: Readonly<Record<string, boolean | number | string>>) =>
    (s: WorldState): WorldState => ({
      ...withFlags({ 'dianne:ready': true, ...extra })(s),
      stats: { ...s.stats, flesh: 5 },
    });
  const MISS_TAM = ['in-to-the-kettle', 'eat-what-she-puts-down', 'up-to-the-empty-house',
    'hang-it-back', 'let-the-evening-come'] as const;
  const MISS_BARB = ['out-to-the-depot', 'step-up-when-he-nods', 'up-to-the-empty-house',
    'hang-it-back', 'let-the-evening-come'] as const;

  it('a missed depot seeds tam:ready through Barb, wrong once, pulse relayed flat', () => {
    const run = play('d21-morning', [...MISS_TAM], strongArms());
    expect(run.state.flags['tam:ready']).toBe(true);
    const view = viewOf(run, 'd21-evening').paragraphs.join('\n');
    // Clue-#8 grammar: the school kids rode; Barb says the run went out empty.
    expect(view).toContain('Run went out empty this morning');
    expect(view).toContain('coach connection, Vancouver side');
    // The pulse stays a logistics noun — never sharpened toward an arrival.
    expect(view).not.toMatch(/meeting|expecting|waiting for her|someone coming/i);
    expect(run.events).toContainEqual({ kind: 'music.detune', pattern: 'tam', cents: -50 });
    expect(view).toContain('like an engine note counted across water');
  });

  it('on sacrificed-sam the retelling seeds NOTHING — the town cannot make him have seen you', () => {
    const run = play('d21-morning', [...MISS_TAM], (s) =>
      applyEffects(strongArms()(s), [
        { op: 'fact.add', tag: 'sacrificed-sam', about: 'sam', witnessedBy: ['barb'] },
      ]).state,
    );
    expect(run.state.flags['tam:ready']).toBeUndefined();
    const view = viewOf(run, 'd21-evening').paragraphs.join('\n');
    // The wrongness inverts the dog's four minutes onto Tam; no pulse.
    expect(view).toContain('Sat the four minutes at the top of the hill');
    expect(view).not.toContain('Vancouver');
    expect(run.events).toContainEqual({ kind: 'music.detune', pattern: 'tam', cents: -50 });
  });

  it('a missed ice morning is minimized by its own teller — no rung, the hole detunes', () => {
    const run = play('d21-morning', [...MISS_BARB], strongArms());
    expect(run.state.facts.some((f) => f.tag === 'helped-barb-ice')).toBe(false);
    const view = viewOf(run, 'd21-evening').paragraphs.join('\n');
    expect(view).toContain('Hauled the ice across before the first pot. No time at all.');
    expect(view).toContain('thinner than its own echo');
    expect(run.events).toContainEqual({ kind: 'music.detune', pattern: 'barb', cents: -50 });
  });

  it('no conf:* fires and the chord never moves from a retelling', () => {
    const run = play('d21-morning', [...MISS_TAM], strongArms());
    expect(run.state.chord).toBe(0);
    expect(Object.keys(run.state.flags).filter((k) => k.startsWith('conf:'))).toEqual([]);
  });

  it('the attended slots do not detune — only the hole has a sound', () => {
    const run = play('d21-morning', [
      'out-to-the-depot', 'step-up-when-he-nods', 'in-to-the-kettle', 'eat-what-she-puts-down',
      'let-the-evening-come',
    ]);
    expect(run.events.filter((e) => e.kind === 'music.detune')).toEqual([]);
  });
});

// ——— The lullaby fork (e) — whole bars, or the missing stair ———

describe('her fragment at the confession — refused routes hear it whole, taken routes cannot', () => {
  const ready = withFlags({ 'dianne:ready': true, 'potluck:verdict': 'defended' });

  it('on refused routes she hums bars one and two whole — the giver-hears-it line', () => {
    const run = play('d21-evening', ['up-the-hill-when-the-dishes-clear'], ready);
    const view = viewOf(run, 'd21-confession').paragraphs.join('\n');
    expect(view).toContain('bars one and two, whole');
    expect(view).toContain('For the length of four bars nobody she is speaking of is dead.');
    expect(view).not.toContain('missing stair');
  });

  it('on lullaby-taken runs the tune has a hole where its middle was — marked once', () => {
    const run = play('d21-evening', ['up-the-hill-when-the-dishes-clear'],
      withFlags({ 'dianne:ready': true, 'potluck:verdict': 'defended', 'lullaby-taken': true }));
    const view = viewOf(run, 'd21-confession').paragraphs.join('\n');
    expect(view).toContain('the missing stair mid-phrase');
    expect(view).toContain('It is marked here once, and never again');
    expect(view).not.toContain('nobody she is speaking of is dead');
  });
});

// ——— The verbs (f) — TAKE priced dark, ANSWER, STAY SILENT ———

describe('the confession verbs — the harvest pattern, and the loss written on screen', () => {
  const ready = withFlags({ 'dianne:ready': true, 'potluck:verdict': 'defended' });

  it('TAKE pays ECHO +2, files the paired private facts, and deadens the tin — defended staging', () => {
    const run = play('d21-evening', ['up-the-hill-when-the-dishes-clear', 'take-the-burning'],
      ready);
    expect(run.state.stats.echo).toBe(4); // baseline 2 + 2
    expect(run.state.flags['burning-memory-taken']).toBe(true);
    const specific = run.state.facts.find((f) => f.tag === 'private:burning-memory-taken');
    const generic = run.state.facts.find((f) => f.tag === 'private:memory-taken');
    expect(specific?.about).toBe('dianne');
    expect(generic?.about).toBe('dianne');
    expect(run.state.knownBy.dianne).toContain(specific?.id);
    expect(run.state.knownBy.barb).not.toContain(specific?.id);
    const after = viewOf(run, 'd21-confession-2').paragraphs.join('\n');
    expect(after).toContain('what it takes with it is exact');
    expect(after).toContain('The tin on the shelf above the stove takes her glance and gives nothing back');
    expect(after).toContain('You did not ask her which mercy she wanted.');
  });

  it('TAKE on the exiled staging writes the loss against the wharf, the tin senseless up the hill', () => {
    const run = play('d21-evening', ['go-down-and-be-findable', 'take-the-burning'],
      withFlags({ 'dianne:ready': true, 'potluck:verdict': 'exiled' }));
    const after = viewOf(run, 'd21-confession-2').paragraphs.join('\n');
    expect(after).toContain('whatever the tin has been keeping is ash again');
    expect(after).toContain('she will not know to mind');
  });

  it('ANSWER pays UNDERTOW +1, plants the fact for her, and she holds both true things', () => {
    const run = play('d21-evening', ['up-the-hill-when-the-dishes-clear', 'answer-her'], ready);
    expect(run.state.stats.undertow).toBe(2); // baseline 1 + 1
    expect(run.state.flags['d21:answered']).toBe(true);
    const fact = run.state.facts.find((f) => f.tag === 'answered-dianne-d21');
    expect(fact).toBeDefined();
    expect(run.state.knownBy.dianne).toContain(fact?.id);
    expect(viewOf(run, 'd21-confession-2').paragraphs.join('\n')).toContain(
      '“The room,” she says. “Yes.”',
    );
  });

  it('STAY SILENT costs nothing and is heard properly', () => {
    const run = play('d21-evening', ['up-the-hill-when-the-dishes-clear', 'stay-silent'], ready);
    expect(run.state.stats.undertow).toBe(1);
    expect(run.state.stats.echo).toBe(2);
    expect(run.state.flags['d21:silent']).toBe(true);
    expect(viewOf(run, 'd21-confession-2').paragraphs.join('\n')).toContain(
      'I told it to be heard, and you did that part properly.',
    );
  });

  it('whichever verb, the confession was given: conf:dianne, lever:priya, the chord moves', () => {
    for (const verb of ['take-the-burning', 'answer-her', 'stay-silent']) {
      const run = play('d21-evening', ['up-the-hill-when-the-dishes-clear', verb], ready);
      expect(run.state.flags['conf:dianne']).toBe(true);
      expect(run.state.flags['lever:priya']).toBe(true);
      expect(run.state.chord).toBe(1);
    }
  });

  it('the supper is the cascade’s fed site BY CHOICE: the table entry feeds, hers to witness', () => {
    // The scene never force-feeds — the substrate must survive a refuser.
    expect(sceneById('d21-confession').onEnter ?? []).toEqual([]);
    const evening = sceneById('d21-evening');
    const eat = evening.choices.find((c) => c.id === 'up-the-hill-when-the-dishes-clear');
    expect(eat?.effects).toContainEqual({ op: 'flag.set', key: 'today:fed', value: true });
    expect(eat?.effects).toContainEqual({
      op: 'fact.add', tag: 'a3:fed-d21', witnessedBy: ['dianne'],
    });
  });

  it('the refused entry and the exiled entry carry no plate at all', () => {
    const evening = sceneById('d21-evening');
    for (const id of ['up-the-hill-past-the-supper', 'go-down-and-be-findable']) {
      const choice = evening.choices.find((c) => c.id === id);
      expect(choice, id).toBeDefined();
      for (const effect of choice?.effects ?? []) {
        expect(effect, `${id} must not feed`).not.toEqual(
          { op: 'flag.set', key: 'today:fed', value: true },
        );
        expect(effect.op, `${id} must not file a fed fact`).not.toBe('fact.add');
      }
    }
  });

  it('the refused supper is seen once, without remark, and only on the table staging', () => {
    const refused = play('d21-evening', ['up-the-hill-past-the-supper'], ready);
    expect(viewOf(refused, 'd21-confession').paragraphs.join('\n')).toContain(
      'Your plate goes back to the kitchen the way it came.',
    );
    const kept = play('d21-evening', ['up-the-hill-when-the-dishes-clear'], ready);
    expect(viewOf(kept, 'd21-confession').paragraphs.join('\n')).not.toContain(
      'Your plate goes back to the kitchen the way it came.',
    );
  });
});

// ——— THE GUILT — plan-pinned, verbatim (act3-plan §Day 21) ———

describe('THE GUILT stays verbatim', () => {
  it('both pinned sentences appear as authored, adjacent, on every staging', () => {
    expect(rawText(sceneById('d21-confession'))).toContain(
      'I would rather have had a drowned girl than a left one. Then the fog agreed with me.',
    );
  });
});

// ——— The refuser — no force-feed anywhere on the forced path ———

describe('a refused day stays refused — the substrate and the night both live', () => {
  it('wave off every plate through the confession: no a3:fed-d21, and Night 21 decays', () => {
    const run = play('d21-morning', [
      'in-to-the-kettle', 'wave-off-the-plate',
      'out-to-the-depot', 'step-up-when-he-nods',
      'let-the-evening-come',
      'up-the-hill-past-the-supper', 'stay-silent', 'take-the-dark-home',
    ], withFlags({
      'dianne:ready': true, 'potluck:verdict': 'defended', 'horn-stopped': true,
    }));
    expect(sawScene(run, 'd21-confession')).toBe(true);
    expect(run.state.sceneId).toBe('d21-night');
    expect(run.state.facts.some((f) => f.tag === 'a3:fed-d21')).toBe(false);
    expect(run.state.flags['today:fed']).not.toBe(true);
    expect(run.state.flags['decay:tonight']).toBe('flesh');
  });

  it('the vigil plate is the wharf route’s reachable offset — offered unfed, withheld fed', () => {
    const plate = sceneById('d21-vigil').choices.find(
      (c) => c.id === 'take-what-she-hands-through-the-door',
    );
    expect(plate?.when).toEqual({ op: 'not', of: { op: 'flag', key: 'today:fed' } });
    expect(plate?.effects).toContainEqual({ op: 'flag.set', key: 'today:fed', value: true });
    expect(plate?.effects).toContainEqual({
      op: 'fact.add', tag: 'a3:fed-d21', witnessedBy: ['barb'],
    });
    const run = play('d21-evening', [
      'go-down-and-be-findable', 'stay-silent', 'sit-the-cold-with-moose',
      'take-what-she-hands-through-the-door',
    ], withFlags({
      'dianne:ready': true, 'potluck:verdict': 'exiled', 'horn-stopped': true,
    }));
    expect(run.state.facts.some((f) => f.tag === 'a3:fed-d21')).toBe(true);
    expect(run.state.flags['decay:tonight']).toBe('none');
  });
});

// ——— The guitar (g) — the gate, the flag, and the audition hold ———

describe('the guitar alone — FLESH and a ready room; the sixth bar starts, unsounded', () => {
  const strong = (s: WorldState): WorldState => ({
    ...withFlags({ 'dianne:ready': true })(s),
    stats: { ...s.stats, flesh: 5 },
  });

  it('the shipped gate is FLESH ≥ 5 AND dianne:ready — honest both ways', () => {
    const door = sceneById('d21-morning').choices.find((c) => c.id === 'up-to-the-empty-house');
    expect(door?.when).toEqual({
      op: 'all',
      of: [{ op: 'stat.gte', stat: 'flesh', value: 5 }, { op: 'flag', key: 'dianne:ready' }],
    });
    // Arms without the room stay shut; the room without arms stays shut.
    const fleshOnly = play('d21-morning', [], (s) => ({ ...s, stats: { ...s.stats, flesh: 5 } }));
    expect(
      viewOf(fleshOnly, 'd21-morning').choices.find((c) => c.id === 'up-to-the-empty-house')
        ?.locked,
    ).toBe(true);
    const readyOnly = play('d21-morning', [], withFlags({ 'dianne:ready': true }));
    expect(
      viewOf(readyOnly, 'd21-morning').choices.find((c) => c.id === 'up-to-the-empty-house')
        ?.locked,
    ).toBe(true);
  });

  it('entering sets the composition flag: sixthbar is 1, moment one of three', () => {
    const run = play('d21-morning', ['up-to-the-empty-house', 'sit-a-minute-longer'], strong);
    expect(run.state.flags['sixthbar']).toBe(1);
    expect(run.state.flags['d21:went-guitar']).toBe(true);
    expect(run.state.flags['d21:guitar-lingered']).toBe(true);
    expect(sceneById('d21-guitar').cue).toBe('wrens-room');
  });

  it('the hand stops at the edge of the unwritten part — the music itself is not described', () => {
    const view = play('d21-morning', ['up-to-the-empty-house'], strong);
    const text = viewOf(view, 'd21-guitar').paragraphs.join('\n');
    expect(text).toContain('the part that does not exist yet');
    expect(text).toContain('You do not sound it.');
  });

  it('AUDITION HOLD, made testable: no bar-character prose keys on the goodbye answer yet', () => {
    // The post-audition pass adds n1:goodbye-keyed variant paragraphs; until
    // Eric auditions the candidates, nothing in the guitar scenes may read
    // the variant key or voice the three answers back.
    for (const id of ['d21-guitar', 'd21-guitar-2'] as const) {
      const scene = sceneById(id);
      expect(JSON.stringify(scene.prose), `${id} reads n1:goodbye`).not.toContain('n1:goodbye');
      for (const voice of ['I never do', 'I don’t remember leaving it', 'I said it to the door']) {
        expect(rawText(scene), `${id} voices a goodbye answer`).not.toContain(voice);
      }
    }
  });

  it('on locks-house runs the key stands in the lock — the reversal staged as invitation', () => {
    const run = play('d21-morning', ['up-to-the-empty-house'], (s) =>
      withFlags({ 'dianne:locks-house': true })(strong(s)));
    expect(viewOf(run, 'd21-guitar').paragraphs.join('\n')).toContain(
      'the key left standing in the lock',
    );
    const plain = play('d21-morning', ['up-to-the-empty-house'], strong);
    expect(viewOf(plain, 'd21-guitar').paragraphs.join('\n')).not.toContain(
      'key left standing in the lock',
    );
  });
});

// ——— The sixth answer — stored verbatim for the wharf ———

describe('the sixth question — every answer stores its echo key', () => {
  it.each([
    ['ill-be-there', '“There,” she says'],
    ['ill-be-gone-by-then', 'somebody should know that besides you'],
    ['i-dont-know-yet', 'the first of the six you’ve answered the same way twice'],
    ['give-her-the-silence', 'That’s an answer. I’ve had it before.'],
  ])('%s is stored and answered in her voice', (answer, response) => {
    const run = play('d21-lamp', [answer]);
    expect(run.state.flags['d21:sixth-answer']).toBe(answer);
    expect(run.state.flags['conf:barb']).toBe(true);
    expect(viewOf(run, 'd21-lamp-2').paragraphs.join('\n')).toContain(response);
  });

  it('the four verbs are all major and all present', () => {
    expect(sceneById('d21-lamp').choices.map((c) => ({ id: c.id, stakes: c.stakes }))).toEqual([
      { id: 'ill-be-there', stakes: 'major' },
      { id: 'ill-be-gone-by-then', stakes: 'major' },
      { id: 'i-dont-know-yet', stakes: 'major' },
      { id: 'give-her-the-silence', stakes: 'major' },
    ]);
  });
});

// ——— The counsel re-run — the lamp is the only writer of the live door ———

describe('barb:counsel-seeded re-runs at the lamp; barb:counsel-live upgrades only there', () => {
  it('a run that missed the Day-19 seed but holds the pattern seeds AND goes live at the lamp', () => {
    const run = play('d21-lamp', ['ill-be-there'], (s) =>
      applyEffects(s, [
        { op: 'fact.add', tag: 'kept-barb-company', witnessedBy: ['barb'] },
        { op: 'fact.add', tag: 'helped-walkin-d9', witnessedBy: ['barb'] },
      ]).state,
    );
    expect(trustBarb(run.state)).toBe(7);
    expect(run.state.flags['barb:counsel-seeded']).toBe(true);
    expect(run.state.flags['barb:counsel-live']).toBe(true);
  });

  it('a knows-truth run under the trust pattern completes conf:barb with no seed to upgrade', () => {
    const run = play('d21-lamp', ['ill-be-there'], withFlags({ 'knows-truth': true }));
    expect(trustBarb(run.state)).toBe(5);
    expect(run.state.flags['conf:barb']).toBe(true);
    expect(run.state.flags['barb:counsel-seeded']).toBeUndefined();
    expect(run.state.flags['barb:counsel-live']).toBeUndefined();
  });

  it('a Day-19 seed carried in upgrades even if tonight’s trust check would not re-seed', () => {
    const run = play('d21-lamp', ['ill-be-there'],
      withFlags({ 'barb:counsel-seeded': true, 'knows-truth': true }));
    expect(run.state.flags['barb:counsel-live']).toBe(true);
  });

  it('no scene in the whole game writes barb:counsel-live except d21-lamp-2', () => {
    const writers = ALL_SCENES.filter((scene) =>
      sceneEffectArrays(scene)
        .flat()
        .some((e) => e.op === 'flag.set' && e.key === 'barb:counsel-live'),
    ).map((s) => s.id);
    expect(writers).toEqual(['d21-lamp-2']);
  });
});

// ——— The register @doc — the NAME column, in her hand ———

describe('the register opened — the title-thread payoff, mechanical stage only', () => {
  it('the @doc rides the lamp unconditionally: forty years of not here, one Frank, a blank line', () => {
    const lamp = sceneById('d21-lamp');
    if (lamp.prose.kind !== 'inline') throw new Error('d21-lamp is not inline');
    const doc = lamp.prose.paragraphs.find((p) => p.text.startsWith('@doc:'));
    expect(doc).toBeDefined();
    expect(doc?.when).toBeUndefined();
    expect(doc?.text).toContain('THE KETTLE — REGISTER');
    expect(doc?.text).toContain('not here');
    expect(doc?.text).toContain('Frank');
    // Her hand: worded dates, zero numerals.
    expect(doc?.text).not.toMatch(/[0-9]/);
    // The prose twin names the practice without the phrase leaking into it.
    const prose = rawText(lamp);
    expect(prose).toContain('Your line is still blank.');
    expect(prose).toContain('She has been waiting to see what she would get to write.');
  });

  it('the Frank fact lands past the stonewall: one mug, the ink let sit thin, gone by noon', () => {
    const lamp = rawText(sceneById('d21-lamp'));
    expect(lamp).toContain('I poured one mug instead of two.');
    expect(lamp).toContain('He was gone by noon.');
    // Self-contained against Night 11 on every run.
    expect(lamp).toContain('You asked me once what Frank was');
  });
});

// ——— The nights — decay, arming, fresh tells ———

describe('night 21 — the count, the arming, the fresh tells', () => {
  it('both night doors arm the unpayable night — state only', () => {
    const lamp = play('d21-lamp', ['ill-be-there']);
    expect(lamp.state.flags['a3:unpayable-armed']).toBe(true);
    const plain = play('d21-night', []);
    expect(plain.state.flags['a3:unpayable-armed']).toBe(true);
  });

  it('the plain night keeps the two-track cue grammar; the lamp keeps its own silence', () => {
    const on = play('d21-night', [], withFlags({ 'horn-on': true }));
    expect(on.events).toContainEqual({ kind: 'music.cue', cue: 'foghorn-312' });
    const off = play('d21-night', [], withFlags({ 'horn-stopped': true }));
    expect(off.events).toContainEqual({ kind: 'music.stop' });
    const lamp = play('d21-lamp', [], withFlags({ 'horn-on': true }));
    expect(lamp.events).toContainEqual({ kind: 'music.stop' });
    expect(lamp.events.filter((e) => e.kind === 'music.cue')).toEqual([]);
  });

  it('each night door tells its decay in its own words — fresh against Act 2 and Day 20', () => {
    const plain = play('d21-night', [], withFlags({ 'horn-stopped': true }));
    expect(plain.state.flags['decay:tonight']).toBe('flesh');
    const plainView = viewOf(plain, 'd21-night').paragraphs.join('\n');
    expect(plainView).toContain('borrowed knees');
    const lamp = play('d21-lamp', ['ill-be-there'], withFlags({ 'horn-stopped': true }));
    expect(lamp.state.flags['decay:tonight']).toBe('flesh');
    expect(viewOf(lamp, 'd21-lamp-2').paragraphs.join('\n')).toContain(
      'The hill home is longer than the hill down was',
    );
    // Zero repeats: Day 20's tell images stay Day 20's.
    for (const stale of ['unsure the floor of it will bear', 'spends you like the last of a purse']) {
      for (const id of ['d21-lamp', 'd21-lamp-2', 'd21-night'] as const) {
        expect(rawText(sceneById(id)), `${id} reuses a Day 20 tell`).not.toContain(stale);
      }
    }
  });
});

// ——— Survivability (h) — Ruling 5 across every route and staging ———

describe('offset survivability — at least one reachable offset on every Day 21 route', () => {
  it('the ice morning feeds: the eat choice writes today:fed and the barb-witnessed fact', () => {
    const eat = sceneById('d21-kettle').choices.find((c) => c.id === 'eat-what-she-puts-down');
    expect(eat).toBeDefined();
    expect(eat?.when, 'the morning fed site must never be gated').toBeUndefined();
    expect(eat?.effects).toContainEqual({ op: 'flag.set', key: 'today:fed', value: true });
    expect(eat?.effects).toContainEqual({
      op: 'fact.add', tag: 'a3:fed-d21', witnessedBy: ['barb'],
    });
  });

  it('the gate-fail evening keeps two ungated fed sites, one of them in the dog’s company', () => {
    const evening2 = sceneById('d21-evening-2');
    for (const id of ['take-the-plate-out-to-the-cold', 'eat-inside-and-let-the-night-come']) {
      const choice = evening2.choices.find((c) => c.id === id);
      expect(choice?.when, `${id} must never be gated`).toBeUndefined();
      expect(choice?.effects).toContainEqual({ op: 'flag.set', key: 'today:fed', value: true });
      expect(choice?.effects).toContainEqual({
        op: 'fact.add', tag: 'a3:fed-d21', witnessedBy: ['barb'],
      });
    }
    // The plate carried out reaches the vigil: offset and mercy co-achievable.
    expect(
      evening2.choices.find((c) => c.id === 'take-the-plate-out-to-the-cold')?.goto,
    ).toBe('d21-vigil');
  });

  it('a confession route on the stopped track pays no decay: the cascade feeds it', () => {
    const run = play('d21-evening',
      ['up-the-hill-when-the-dishes-clear', 'stay-silent', 'take-the-dark-home'],
      withFlags({ 'dianne:ready': true, 'potluck:verdict': 'defended', 'horn-stopped': true }));
    expect(run.state.sceneId).toBe('d21-night');
    expect(run.state.flags['decay:tonight']).toBe('none');
  });

  it('the dark taken early without the plate still decays — a route cost, not a trap', () => {
    const run = play('d21-evening', ['let-the-evening-be-ordinary', 'take-the-dark-early'],
      withFlags({ 'horn-stopped': true }));
    expect(run.state.flags['decay:tonight']).toBe('flesh');
    expect(run.state.stats.flesh).toBe(2);
  });
});

// ——— Dialogue rules — the ice line's variants ———

describe('days 20–23 dialogue — barb/ice-d21 keys on staging and the kept morning', () => {
  it('every (speaker, slot) pair still has a zero-condition fallback', () => {
    const pairs = new Set(RULES.map((r) => `${r.speaker}:${r.slot}`));
    for (const pair of pairs) {
      const ok = RULES.some((r) => `${r.speaker}:${r.slot}` === pair && isFallback(r));
      expect(ok, `no fallback for ${pair}`).toBe(true);
    }
  });

  it('exiled runs hear the hill in it; kept-company runs are deputized; the rest take the tongs', () => {
    const exiled = play('d21-morning', ['in-to-the-kettle'],
      withFlags({ 'potluck:verdict': 'exiled' }));
    expect(viewOf(exiled, 'd21-kettle').paragraphs.join('\n')).toContain(
      'You came up the hill for this',
    );
    const company = play('d21-morning', ['in-to-the-kettle'], (s) =>
      applyEffects(s, [
        { op: 'fact.add', tag: 'kept-barb-company', witnessedBy: ['barb'] },
      ]).state,
    );
    expect(viewOf(company, 'd21-kettle').paragraphs.join('\n')).toContain(
      'You sat a morning out with me once',
    );
    const plain = play('d21-morning', ['in-to-the-kettle']);
    expect(viewOf(plain, 'd21-kettle').paragraphs.join('\n')).toContain('Take the tongs.');
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
