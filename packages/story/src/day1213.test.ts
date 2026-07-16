/**
 * Days 12–13 content tests (design/act2-beats.md §Day 12, §Day 13).
 *
 * Covers: the day ladder (d12-morning owns day 12, d13-morning day 13, both
 * night exits point at d14-morning); the canonical FLESH table gate and its
 * aching lockedLabel; the witness temperature reads (derived 'witness' =
 * flesh + name — the resolver is registered at integration); the early-truth
 * counter route (hidden gate, knows-truth + early-truth flags, the potluck's
 * knows-truth variant paragraph); Night 12's decay behaviour on both tracks
 * (rotation, offset consumption, today:* hygiene, the track-branched cue
 * emits) and the watched clinic window; the re-taped EBUS card with the
 * double ring; the computed potluck verdict (both outcomes, facts witnessed
 * by all six); all three Sam choices and their exact costs; the aftermath
 * split routing; and the fleet-local prose invariants, including the pinned
 * single 'Wren' and single spoken title phrase this cluster owns.
 *
 * NOTE: these tests require content.ts to register DAY12/DAY13 scenes, the
 * days-12/13 dialogue rules, and the 'witness' derived resolver
 * ((s) => s.stats.flesh + s.stats.name) — integration wiring, per the
 * Contract. They are complete and correct against that wiring.
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
import { DAY12_SCENES } from './scenes/day12.ts';
import { DAY13_SCENES } from './scenes/day13.ts';
import { RULES } from './dialogue-days1213.ts';

const content = buildContent();
const FLEET_SCENES: readonly Scene[] = [...DAY12_SCENES, ...DAY13_SCENES];

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

const ALL_SIX = ['dianne', 'wade', 'priya', 'sam', 'barb', 'tam'] as const;

/** Day 12, no offsets earned, straight to bed. */
const D12_LEAN = ['lay-cutlery', 'work-through', 'walk-down', 'cross-the-lot'] as const;
/** Day 12, the soup offset taken. */
const D12_FED = ['lay-cutlery', 'take-the-bowl', 'walk-down', 'cross-the-lot'] as const;

const hornStopped = (s: WorldState): WorldState => ({
  ...s,
  flags: { ...s.flags, 'horn-stopped': true },
});
const hornOn = (s: WorldState): WorldState => ({
  ...s,
  flags: { ...s.flags, 'horn-on': true },
});

describe('day ladder and boundaries', () => {
  it('d12-morning owns day 12', () => {
    const run = play('d12-morning', []);
    expect(run.state.day).toBe(12);
    expect(run.state.slot).toBe('morning');
  });

  it('night 12 exits into d13-morning, which owns day 13', () => {
    const run = play('d12-morning', [...D12_LEAN, 'sleep']);
    expect(run.state.sceneId).toBe('d13-morning');
    expect(run.state.day).toBe(13);
  });

  it('both night-13 scenes exit into d14-morning (data-level; cluster D owns it)', () => {
    expect(sceneById('d13-night-defended').choices.map((c) => c.goto)).toEqual([
      'd14-morning',
    ]);
    expect(sceneById('d13-night-exiled').choices.map((c) => c.goto)).toEqual([
      'd14-morning',
    ]);
  });

  it('day 12 is fixed — no hub: the morning leads only into prep', () => {
    expect(sceneById('d12-morning').choices.map((c) => c.goto)).toEqual([
      'd12-prep',
      'd12-prep',
    ]);
  });
});

describe('cue discipline', () => {
  it('uses the assigned cues, and only existing ones', () => {
    expect(sceneById('d12-morning').cue).toBe('hall-upright');
    expect(sceneById('d12-evening').cue).toBe('pub-warm');
    expect(sceneById('d13-hall').cue).toBe('hall-upright');
    expect(sceneById('d13-morning').cue).toBeUndefined();
    expect(sceneById('d13-verdict').cue).toBeUndefined();
    expect(sceneById('d12-night').cue).toBeUndefined();
    expect(sceneById('d13-night-defended').cue).toBeUndefined();
    expect(sceneById('d13-night-exiled').cue).toBeUndefined();
  });

  it('the hall goes silent when Sam stands: music.stop rides d13-verdict', () => {
    const run = play('d13-morning', ['eat-then-iron', 'take-the-end-chair']);
    expect(run.events).toContainEqual({ kind: 'music.stop' });
  });
});

describe('day 12 — the table gate and the temperature reads', () => {
  it('the tables lock below FLESH 5, and the locked label aches (the bible’s gate)', () => {
    const run = play('d12-morning', []);
    const gate = viewOf(run, 'd12-morning').choices.find((c) => c.id === 'carry-tables');
    expect(gate?.locked).toBe(true);
    expect(gate?.label).toBe(
      'Take the other end. Your hands know the weight they don’t have.',
    );
  });

  it('a fed body carries: FLESH and NAME move, Dianne and Priya witness', () => {
    const run = play('d12-morning', ['carry-tables'], (s) => ({
      ...s,
      stats: { ...s.stats, flesh: 5 },
    }));
    expect(run.state.stats.flesh).toBe(6);
    expect(run.state.stats.name).toBe(3);
    const id = factIdOf(run.state, 'helped-potluck-prep');
    expect(run.state.knownBy.dianne).toContain(id);
    expect(run.state.knownBy.priya).toContain(id);
    expect(run.state.knownBy.barb).not.toContain(id);
  });

  it('high witness: the shelf-paper is passed without looking', () => {
    const run = play('d12-morning', [], (s) => ({
      ...s,
      stats: { ...s.stats, flesh: 5, name: 4 },
    }));
    const view = viewOf(run, 'd12-morning').paragraphs.join('\n');
    expect(view).toContain('without looking up');
    expect(view).not.toContain('before it reaches you');
  });

  it('low witness: the tray crosses the table before it reaches you', () => {
    const run = play('d12-morning', []);
    const view = viewOf(run, 'd12-morning').paragraphs.join('\n');
    expect(view).toContain('before it reaches you');
    expect(view).not.toContain('without looking up');
  });

  it('the prep-help fact gossips dianne→barb at the day boundary', () => {
    const run = play('d12-morning', ['carry-tables', 'take-the-bowl', 'walk-down',
      'cross-the-lot', 'sleep'], (s) => ({ ...s, stats: { ...s.stats, flesh: 5 } }));
    const id = factIdOf(run.state, 'helped-potluck-prep');
    expect(run.state.knownBy.barb).toContain(id);
  });

  it('plants the day beats: bar 4 upside down, Sam absent, the shed light burning', () => {
    expect(rawText(sceneById('d12-prep-2'))).toContain('four notes, upside down');
    expect(rawText(sceneById('d12-prep-2'))).toContain('Sam does not come');
    expect(rawText(sceneById('d12-evening'))).toContain('boat shed window is lit');
  });
});

describe('day 12 — the bill comes up the hill (pt2-fix-01)', () => {
  const TO_EVENING = ['lay-cutlery', 'work-through', 'walk-down'] as const;

  it('horn-on: Wade is onstage at the Kettle, visibly less than he was', () => {
    const run = play('d12-morning', [...TO_EVENING], hornOn);
    const view = viewOf(run, 'd12-evening').paragraphs.join('\n');
    expect(view).toContain('hanging off him the way coats hang on pegs');
    expect(view).toContain('pressing the letters back down');
    expect(view).toContain('She doesn’t do it for the crib players.');
  });

  it('horn-stopped: no bill — the beat is gated out whole', () => {
    const run = play('d12-morning', [...TO_EVENING], hornStopped);
    const view = viewOf(run, 'd12-evening').paragraphs.join('\n');
    expect(view).not.toContain('hanging off him');
    expect(view).not.toContain('pressing the letters back down');
  });

  it('the beat is fixed on its track: no hub choice can route around prep eve', () => {
    expect(sceneById('d12-prep-2').choices.map((c) => c.goto)).toEqual(['d12-evening']);
  });
});

describe('day 12 — the early-truth counter route', () => {
  const earned = (s: WorldState): WorldState => ({
    ...s,
    stats: { ...s.stats, undertow: 6 },
    flags: { ...s.flags, 'pressed-dianne': 3, 'heeded-barbs-warning': true },
  });

  it('the counter choice is hidden until the route is earned — no lockedLabel leak', () => {
    const cold = play('d12-morning', ['lay-cutlery', 'work-through', 'walk-down']);
    expect(viewOf(cold, 'd12-evening').choices.map((c) => c.id)).not.toContain(
      'stay-while-she-closes',
    );
    const warm = play('d12-morning', ['lay-cutlery', 'work-through', 'walk-down'], earned);
    expect(viewOf(warm, 'd12-evening').choices.map((c) => c.id)).toContain(
      'stay-while-she-closes',
    );
  });

  it('Barb answers what Frank was; knows-truth and early-truth set', () => {
    const run = play(
      'd12-morning',
      ['lay-cutlery', 'work-through', 'walk-down', 'stay-while-she-closes'],
      earned,
    );
    const view = viewOf(run, 'd12-counter').paragraphs.join('\n');
    expect(view).toContain('what my Frank was');
    expect(view).toContain('the step I remembered');
    expect(view).toContain('whose remembering you are standing up in');
    expect(run.state.flags['knows-truth']).toBe(true);
    expect(run.state.flags['early-truth']).toBe(true);
  });

  it('the potluck carries the knows-truth variant — one paragraph, the worst one', () => {
    const run = play(
      'd12-morning',
      ['lay-cutlery', 'work-through', 'walk-down', 'stay-while-she-closes',
        'thank-her', 'sleep', 'eat-then-iron', 'take-the-end-chair'],
      earned,
    );
    const view = viewOf(run, 'd13-verdict').paragraphs.join('\n');
    expect(view).toContain('He is right.');
    expect(view).toContain('yours is one of them');
  });

  it('without the route, the potluck stays fair: no rightness confirmed', () => {
    const run = play('d13-morning', ['eat-then-iron', 'take-the-end-chair']);
    expect(viewOf(run, 'd13-verdict').paragraphs.join('\n')).not.toContain('He is right.');
  });
});

describe('night 12 — decay, offsets, and the track-branched cue', () => {
  it('horn-stopped, nothing offered: flesh pays first, rotation advances', () => {
    const run = play('d12-morning', [...D12_LEAN], hornStopped);
    expect(run.state.stats.flesh).toBe(2);
    expect(run.state.flags['decay:tonight']).toBe('flesh');
    expect(run.state.flags['decay:next']).toBe('name');
    const view = viewOf(run, 'd12-night').paragraphs.join('\n');
    expect(view).toContain('less and less to answer');
  });

  it('the rotation honours decay:next — name pays, ink goes grey', () => {
    const run = play('d12-morning', [...D12_LEAN], (s) => ({
      ...hornStopped(s),
      flags: { ...hornStopped(s).flags, 'decay:next': 'name' },
    }));
    expect(run.state.stats.name).toBe(2); // 2 base + 1 cutlery − 1 decay
    expect(run.state.flags['decay:tonight']).toBe('name');
    expect(run.state.flags['decay:next']).toBe('echo');
    expect(viewOf(run, 'd12-night').paragraphs.join('\n')).toContain('black as beetles');
  });

  it('the soup offset is consumed silently: no decay, no tell, flags cleared', () => {
    const run = play('d12-morning', [...D12_FED], hornStopped);
    expect(run.state.stats.flesh).toBe(4); // 3 + 1 bowl, untouched by night
    expect(run.state.flags['decay:tonight']).toBe('none');
    expect(run.state.flags['today:fed']).toBe(false);
    const view = viewOf(run, 'd12-night').paragraphs.join('\n');
    expect(view).not.toContain('less and less to answer');
    expect(view).not.toContain('black as beetles');
  });

  it('horn-on: no decay, the horn cue plays, and the complicity line renders', () => {
    const run = play('d12-morning', [...D12_LEAN], hornOn);
    expect(run.state.stats.flesh).toBe(3);
    expect(run.state.flags['decay:tonight']).toBeUndefined();
    expect(
      run.events.some((e) => e.kind === 'music.cue' && e.cue === 'foghorn-312'),
    ).toBe(true);
    expect(viewOf(run, 'd12-night').paragraphs.join('\n')).toContain(
      'always awake for it now',
    );
  });

  it('horn-stopped nights are cueless: music.stop, never foghorn-312', () => {
    const run = play('d12-morning', [...D12_LEAN], hornStopped);
    expect(run.events).toContainEqual({ kind: 'music.stop' });
    expect(
      run.events.some((e) => e.kind === 'music.cue' && e.cue === 'foghorn-312'),
    ).toBe(false);
    expect(viewOf(run, 'd12-night').paragraphs.join('\n')).toContain('empty-handed');
  });

  it('the clinic window is watched from outside — the sam→priya edge made visible', () => {
    const text = rawText(sceneById('d12-night'));
    expect(text).toContain('flat on the desk between them');
    expect(text).toContain('A cross-reference.');
    expect(text).toContain('Neither of them is talking');
  });
});

describe('day 13 morning — the re-taped card', () => {
  const text = rawText(sceneById('d13-morning'));

  it('carries Act 1’s exact EBUS card with the double ring', () => {
    expect(text).toContain('EBUS — WINTER SCHEDULE');
    expect(text).toContain('(( Fri 28 Nov ....... 07:40 ))');
    expect(text).toContain('bruise through a sleeve');
  });

  it('the register lies closed; the iron is offered', () => {
    expect(text).toContain('register lies closed');
    expect(text).toContain('iron in the back');
  });

  it('the card block is fixed — no gate on the countdown', () => {
    const scene = sceneById('d13-morning');
    if (scene.prose.kind !== 'inline') throw new Error('not inline');
    const card = scene.prose.paragraphs.find((p) =>
      p.text.includes('EBUS — WINTER SCHEDULE'),
    );
    expect(card?.when).toBeUndefined();
  });
});

describe('the potluck — the verdict is computed, not chosen', () => {
  const strong = (s: WorldState): WorldState => ({
    ...s,
    stats: { ...s.stats, flesh: 5, name: 4 },
  });

  it('witness ≥ 9: defended — the fact lands on all six, the chairs move toward you', () => {
    const run = play('d13-morning', ['eat-then-iron', 'take-the-end-chair'], strong);
    expect(run.state.flags['potluck:verdict']).toBe('defended');
    const id = factIdOf(run.state, 'potluck-verdict-defended');
    for (const who of ALL_SIX) expect(run.state.knownBy[who]).toContain(id);
    const view = viewOf(run, 'd13-verdict').paragraphs.join('\n');
    expect(view).toContain('A chair scrapes — toward you.');
    expect(view).toContain('That’s Wren, son. Sit down.');
  });

  it('witness < 9: exiled — nobody moves toward you, and no name is granted', () => {
    const run = play('d13-morning', ['give-the-day-the-shore', 'take-the-end-chair']);
    expect(run.state.flags['potluck:verdict']).toBe('exiled');
    const id = factIdOf(run.state, 'potluck-verdict-exiled');
    for (const who of ALL_SIX) expect(run.state.knownBy[who]).toContain(id);
    const view = viewOf(run, 'd13-verdict').paragraphs.join('\n');
    expect(view).toContain('Nobody moves toward you.');
    expect(view).not.toContain('Wren');
  });

  it('Sam’s line is verbatim, on both verdicts', () => {
    for (const path of [
      play('d13-morning', ['eat-then-iron', 'take-the-end-chair'], strong),
      play('d13-morning', ['give-the-day-the-shore', 'take-the-end-chair']),
    ]) {
      expect(viewOf(path, 'd13-verdict').paragraphs.join('\n')).toContain(
        'That is not my sister. She’s not here. She never came back — whatever this is, it’s not her being here.',
      );
    }
  });

  it('defending Sam: UNDERTOW +1, the fact witnessed by all six', () => {
    const run = play('d13-morning', ['eat-then-iron', 'take-the-end-chair', 'defend-sam'], strong);
    expect(run.state.stats.undertow).toBe(2);
    expect(run.state.flags['potluck:sam']).toBe('defended');
    const id = factIdOf(run.state, 'defended-sam');
    for (const who of ALL_SIX) expect(run.state.knownBy[who]).toContain(id);
    expect(viewOf(run, 'd13-after').paragraphs.join('\n')).toContain('He’s allowed.');
  });

  it('saying nothing: the room handles him, and no fact is minted', () => {
    const run = play('d13-morning', ['give-the-day-the-shore', 'take-the-end-chair', 'say-nothing']);
    expect(run.state.flags['potluck:sam']).toBe('silent');
    expect(run.state.facts.some((f) => f.tag === 'defended-sam')).toBe(false);
    expect(run.state.facts.some((f) => f.tag === 'sacrificed-sam')).toBe(false);
    expect(viewOf(run, 'd13-after').paragraphs.join('\n')).toContain(
      'rope thrown to a swimmer',
    );
  });

  it('giving the town its night: ECHO +1, STATIC +4, the cost written on Sam', () => {
    const run = play('d13-morning', ['eat-then-iron', 'take-the-end-chair', 'give-the-night'], strong);
    expect(run.state.stats.echo).toBe(3);
    expect(run.state.staticMeter).toBe(14);
    expect(run.state.flags['potluck:sam']).toBe('given');
    const id = factIdOf(run.state, 'sacrificed-sam');
    for (const who of ALL_SIX) expect(run.state.knownBy[who]).toContain(id);
    const view = viewOf(run, 'd13-after').paragraphs.join('\n');
    expect(view).toContain('wearing hers');
    expect(view).toContain('the way a wave goes out');
  });
});

describe('the aftermath split', () => {
  const strong = (s: WorldState): WorldState => ({
    ...s,
    stats: { ...s.stats, flesh: 5, name: 4 },
  });
  const TO_COAT = ['take-the-end-chair', 'defend-sam', 'find-your-coat'] as const;

  it('defended verdict routes to the propane-tank night', () => {
    const run = play('d13-morning', ['eat-then-iron', ...TO_COAT], strong);
    expect(run.state.sceneId).toBe('d13-night-defended');
  });

  it('exiled verdict routes to the wharf night', () => {
    const run = play('d13-morning', ['give-the-day-the-shore', ...TO_COAT]);
    expect(run.state.sceneId).toBe('d13-night-exiled');
  });

  it('defended + defended-sam: the look that is the friendship arriving early', () => {
    const run = play('d13-morning', ['eat-then-iron', ...TO_COAT], strong);
    const view = viewOf(run, 'd13-night-defended').paragraphs.join('\n');
    expect(view).toContain('arriving early');
    expect(view).not.toContain('does not look at you at all');
  });

  it('defended + given: he does not look at you at all', () => {
    const run = play(
      'd13-morning',
      ['eat-then-iron', 'take-the-end-chair', 'give-the-night', 'find-your-coat'],
      strong,
    );
    const view = viewOf(run, 'd13-night-defended').paragraphs.join('\n');
    expect(view).toContain('does not look at you at all');
    expect(view).not.toContain('arriving early');
  });

  it('exiled: the ticket office was made ready, and Wade knew first', () => {
    const run = play('d13-morning', ['give-the-day-the-shore', ...TO_COAT]);
    const view = viewOf(run, 'd13-night-exiled').paragraphs.join('\n');
    expect(view).toContain('cot made army-tight');
    expect(view).toContain('kettle filled');
    expect(view).toContain('He knew the count before the town did.');
  });

  it('night 13 still runs the decay — the shore route pays, the fed route does not', () => {
    const lean = play(
      'd13-morning',
      ['give-the-day-the-shore', ...TO_COAT],
      (s) => hornStopped(s),
    );
    expect(lean.state.stats.flesh).toBe(2);
    expect(lean.state.flags['decay:tonight']).toBe('flesh');
    const fed = play(
      'd13-morning',
      ['eat-then-iron', 'take-the-end-chair', 'say-nothing', 'find-your-coat'],
      (s) => hornStopped(s),
    );
    expect(fed.state.stats.flesh).toBe(4);
    expect(fed.state.flags['decay:tonight']).toBe('none');
    expect(fed.state.flags['today:fed']).toBe(false);
  });

  it('the horn plays over the exile only on the horn-on track', () => {
    const on = play('d13-morning', ['give-the-day-the-shore', ...TO_COAT], hornOn);
    expect(on.events.some((e) => e.kind === 'music.cue' && e.cue === 'foghorn-312')).toBe(true);
    expect(viewOf(on, 'd13-night-exiled').paragraphs.join('\n')).toContain(
      'almost overhead',
    );
    const off = play('d13-morning', ['give-the-day-the-shore', ...TO_COAT], hornStopped);
    expect(
      off.events.some((e) => e.kind === 'music.cue' && e.cue === 'foghorn-312'),
    ).toBe(false);
    expect(viewOf(off, 'd13-night-exiled').paragraphs.join('\n')).toContain(
      'the nothing has architecture',
    );
  });
});

describe('days 12–13 dialogue rules', () => {
  it('every (speaker, slot) pair has a zero-condition fallback', () => {
    const pairs = new Set(RULES.map((r) => `${r.speaker}:${r.slot}`));
    for (const pair of pairs) {
      const ok = RULES.some((r) => `${r.speaker}:${r.slot}` === pair && isFallback(r));
      expect(ok, `no fallback for ${pair}`).toBe(true);
    }
  });

  it('the Day-13 greeting bends around early-truth without re-performing the warning', () => {
    const rule = RULES.find((r) => r.id === 'barb-g13-early-truth');
    expect(rule?.when).toEqual({ op: 'flag', key: 'early-truth' });
    expect(rule?.text).not.toMatch(/not\s+here/i);
    expect(rule?.text).not.toContain('Frank');
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
      /\b(she|he|they|dianne|barb|tam|wade|priya|sam|moose)\s+(takes|touches|hugs|grabs|holds|pats|strokes|embraces|catches|clasps|pulls|grips|squeezes|steadies|brushes|reaches\s+for)\s+(you|your)\b/i;
    const byHand =
      /\b(?:her|his|their)\s+(?:hands?|arms?|palms?|fingers)\b[^.!?]{0,40}\b(?:on|around|against|over|through)\s+(?:you|yours?)\b/i;
    const seating = /\b(?:sits|sat|sets|set|puts|put|lays|laid|plants|planted)\s+you\b/i;
    for (const { source, text } of texts) {
      expect(touch.test(text), `NPC-initiated touch in ${source}`).toBe(false);
      expect(byHand.test(text), `NPC hand-touch in ${source}`).toBe(false);
      expect(seating.test(text), `NPC steering-touch in ${source}`).toBe(false);
    }
  });

  it('never growls, never remarks', () => {
    for (const { source, text } of texts) {
      expect(/growl/i.test(text), `growl in ${source}`).toBe(false);
      expect(
        /\b(strange|odd|uncanny|impossible)\b/i.test(text),
        `remark in ${source}`,
      ).toBe(false);
    }
  });

  it("'Wren' appears exactly once — the orchard man, gated on the defended verdict", () => {
    const hits = texts.filter(({ text }) => /\bWren\b/.test(text));
    expect(hits).toHaveLength(1);
    expect(hits[0]?.source).toBe('d13-verdict');
    expect(hits[0]?.text).toContain('One of the orchard men');
    expect(hits[0]?.text).toContain('“That’s Wren, son. Sit down.”');
    const scene = sceneById('d13-verdict');
    if (scene.prose.kind !== 'inline') throw new Error('not inline');
    const block = scene.prose.paragraphs.find((p) => /\bWren\b/.test(p.text));
    expect(block?.when, 'the Wren paragraph must be verdict-gated').toBeDefined();
  });

  it('the title phrase is spoken exactly once — Sam, at the potluck, never in a @doc', () => {
    const TITLE = /\bnot\s+here\b/gi;
    const hits = texts.flatMap(({ source, text }) => {
      const count = (text.match(TITLE) ?? []).length;
      return count > 0 ? [{ source, count, doc: text.startsWith('@doc:') }] : [];
    });
    expect(hits.filter((h) => h.doc)).toEqual([]);
    expect(hits.filter((h) => !h.doc)).toEqual([{ source: 'd13-verdict', count: 1, doc: false }]);
  });

  it('no schedule time leaks outside the EBUS card', () => {
    for (const { source, text } of texts) {
      if (text.includes('EBUS — WINTER SCHEDULE')) continue;
      expect(text.includes('07:40'), `EBUS time outside the card in ${source}`).toBe(false);
    }
  });

  it('prose economy: no paragraph over the 150-word hard cap', () => {
    const wordCount = (text: string): number =>
      text.split(/\s+/).filter((w) => /[0-9A-Za-z’']/.test(w)).length;
    const over = texts
      .filter(({ text }) => !text.startsWith('@doc:') && !text.startsWith('@line:'))
      .map((t) => ({ ...t, words: wordCount(t.text) }))
      .filter((t) => t.words > 150);
    expect(over.map((t) => `${t.source} (${t.words}w)`)).toEqual([]);
  });
});
