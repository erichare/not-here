/**
 * Days 5–6 content tests (design/act1-beats.md §Day 5, §Day 6).
 *
 * Covers: hub slot topology and day-boundary time.set; without-you
 * retellings for both missed slots on both days; clue plants (the potluck
 * flyer @doc, Priya's inverted bar-4 at the upright, Wade's cot, the
 * room-tone recording); fact witnessing (told-tam-staying, told-sam-dont-know,
 * the private denial); engine-driven gossip propagation feeding the Day-5/6
 * evening dialogue rules; the marked-lie STATIC costs; the ECHO≥4-gated
 * lie-detune with its paired visual twin; and the no-cue silence of
 * d6-recording. Prose invariants re-checked over this fleet's texts.
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
import { DAY5_SCENES } from './scenes/day5.ts';
import { DAY6_SCENES } from './scenes/day6.ts';
import { RULES } from './dialogue-days56.ts';

const content = buildContent();
const FLEET_SCENES: readonly Scene[] = [...DAY5_SCENES, ...DAY6_SCENES];

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

const RIDE_PATH = [
  'take-the-0740', 'hold-his-eyes', 'say-staying', 'go-in', 'turn-in',
  'let-morning-come',
] as const;

const HALL_PATH = [
  'help-at-the-hall', 'carry-tables', 'hum-the-turn', 'walk-back-down',
  'turn-in', 'let-morning-come',
] as const;

describe('hubs and day boundaries', () => {
  it('d5-morning offers the ride and the hall', () => {
    expect(sceneById('d5-morning').choices.map((c) => c.goto)).toEqual([
      'd5-ride', 'd5-hall',
    ]);
  });

  it('d6-morning offers the hall and the ticket office', () => {
    expect(sceneById('d6-morning').choices.map((c) => c.goto)).toEqual([
      'd6-hall', 'd6-ticket-office',
    ]);
  });

  it('entries set their day; night 5 exits into day 6', () => {
    const d5 = play('d5-morning', []);
    expect(d5.state.day).toBe(5);
    expect(d5.state.slot).toBe('morning');
    const run = play('d5-morning', [...RIDE_PATH]);
    expect(run.state.sceneId).toBe('d6-morning');
    expect(run.state.day).toBe(6);
  });

  it('day 6 exits into d7-morning', () => {
    const run = play('d6-morning', [
      'go-to-the-hall', 'answer-plainly', 'back-up-the-hill', 'cross-the-lot',
      'say-i-dont-know', 'go-in-eventually',
    ]);
    expect(run.state.sceneId).toBe('d7-morning');
  });
});

describe('cue discipline', () => {
  it('uses the assigned cues', () => {
    expect(sceneById('d5-ride').cue).toBe('tam-theme');
    expect(sceneById('d5-hall').cue).toBe('hall-upright');
    expect(sceneById('d6-hall').cue).toBe('hall-upright');
    expect(sceneById('d6-ticket-office').cue).toBe('wade-theme');
    expect(sceneById('d5-evening').cue).toBe('pub-warm');
    expect(sceneById('d6-evening').cue).toBe('pub-warm');
    expect(sceneById('d5-night').cue).toBe('foghorn-312');
  });

  it('d6-recording is the silent scene — no cue, and none after it', () => {
    expect(sceneById('d6-recording').cue).toBeUndefined();
    expect(sceneById('d6-recording-2').cue).toBeUndefined();
    const run = play('d6-morning', [
      'go-to-the-hall', 'answer-plainly', 'back-up-the-hill', 'cross-the-lot',
      'say-nothing', 'go-in-eventually',
    ]);
    const cues = run.events.flatMap((e) => (e.kind === 'music.cue' ? [e.cue] : []));
    expect(cues).toEqual(['hall-upright', 'pub-warm']);
  });
});

describe('day 5 — the ride', () => {
  const run = play('d5-morning', [...RIDE_PATH]);

  it('plays tam-theme and records the ride as Tam-witnessed', () => {
    expect(run.events.some((e) => e.kind === 'music.cue' && e.cue === 'tam-theme')).toBe(true);
    const id = factIdOf(run.state, 'rode-with-tam');
    expect(run.state.knownBy.tam).toContain(id);
    // No tam→priya edge exists; the ride never reaches the notebook.
    expect(run.state.knownBy.priya).not.toContain(id);
  });

  it('the marked lie costs STATIC +2 and Tam holds the answer', () => {
    expect(run.state.staticMeter).toBe(12);
    const id = factIdOf(run.state, 'told-tam-staying');
    expect(run.state.knownBy.tam).toContain(id);
    expect(run.state.knownBy.priya).not.toContain(id);
  });

  it('the missed hall arrives as a retelling — piano plant included', () => {
    const evening = viewOf(run, 'd5-evening').paragraphs.join('\n');
    expect(evening).toContain('Three notes and shut the lid');
    expect(evening).not.toContain('held the 07:40');
  });

  it('the lie gossips tam→barb at the day boundary, and Barb says so on Day 6', () => {
    const id = factIdOf(run.state, 'told-tam-staying');
    expect(run.state.knownBy.barb).toContain(id);
    const d6evening = sceneById('d6-evening');
    const prose = content.realizeProse(d6evening, run.state).join('\n');
    expect(prose).toContain('Tam tells me');
    expect(prose).toContain('She doesn’t go near the book');
  });
});

describe('day 5 — the hall', () => {
  const run = play('d5-morning', [...HALL_PATH]);

  it('shows the flyer @doc and the inverted turn at the upright', () => {
    expect(rawText(sceneById('d5-hall'))).toContain('SEVEN YEARS');
    expect(rawText(sceneById('d5-hall'))).toContain('BRING A DISH');
    expect(rawText(sceneById('d5-hall-2'))).toContain('steps the wrong way');
  });

  it('carrying tables feeds FLESH and NAME, witnessed by Priya and Dianne', () => {
    expect(run.state.stats.flesh).toBe(4);
    expect(run.state.stats.name).toBe(3);
    const id = factIdOf(run.state, 'helped-hall');
    expect(run.state.knownBy.priya).toContain(id);
    expect(run.state.knownBy.dianne).toContain(id);
  });

  it('the missed ride arrives as a retelling with the engine motif', () => {
    const evening = viewOf(run, 'd5-evening').paragraphs.join('\n');
    expect(evening).toContain('held the 07:40');
    expect(evening).toContain('idle, road, idle');
    expect(evening).not.toContain('Three notes and shut the lid');
  });

  it('helped-hall gossips dianne→barb; Barb credits Dianne on Day 6', () => {
    const id = factIdOf(run.state, 'helped-hall');
    expect(run.state.knownBy.barb).toContain(id);
    const prose = content.realizeProse(sceneById('d6-evening'), run.state).join('\n');
    expect(prose).toContain('Dianne says you carried tables');
  });

  it('the tables are FLESH-gated: locked label shows when the body is thin', () => {
    const run2 = play('d5-morning', ['help-at-the-hall'], (s) => ({
      ...s,
      stats: { ...s.stats, flesh: 2 },
    }));
    const view = viewOf(run2, 'd5-hall');
    const gate = view.choices.find((c) => c.id === 'carry-tables');
    expect(gate?.locked).toBe(true);
    expect(gate?.label).toBe('· Take one end of the tables.');
  });
});

describe('first gossip visibility (day 5 evening)', () => {
  it('Tam voices a fact only Barb witnessed, and credits her', () => {
    // Day 2: Barb alone saw the drying; one barb→tam hop carried it.
    const seed = (s: WorldState): WorldState =>
      propagateGossip(
        applyEffects(s, [
          { op: 'fact.add', tag: 'helped-barb', witnessedBy: ['barb'] },
        ]).state,
        [{ from: 'barb', to: 'tam' }],
      );
    const run = play('d5-morning', ['take-the-0740', 'watch-the-lake', 'say-dont-know', 'go-in'], seed);
    const evening = viewOf(run, 'd5-evening').paragraphs.join('\n');
    expect(evening).toContain('Barb tells me you dry a pot properly');
    const id = factIdOf(run.state, 'helped-barb');
    expect(run.state.knownBy.tam).toContain(id);
  });

  it('with nothing gossiped, Tam falls back to two fingers off the mug', () => {
    const run = play('d5-morning', [...HALL_PATH.slice(0, 4)]);
    const evening = viewOf(run, 'd5-evening').paragraphs.join('\n');
    expect(evening).toContain('two fingers off the mug');
  });
});

describe('day 6 — Priya at the hall', () => {
  it('does the intake here, compressed, when the Day-3 clinic was skipped', () => {
    const run = play('d6-morning', ['go-to-the-hall']);
    const view = viewOf(run, 'd6-hall').paragraphs.join('\n');
    expect(view).toContain('Since the mountain won’t come');
    const id = factIdOf(run.state, 'intake-done-late');
    expect(run.state.knownBy.priya).toContain(id);
  });

  it('advances the notebook thread instead when the clinic was attended', () => {
    const run = play('d6-morning', ['go-to-the-hall'], (s) => ({
      ...s,
      flags: { ...s.flags, 'd3:slot': 'clinic' },
    }));
    const view = viewOf(run, 'd6-hall').paragraphs.join('\n');
    expect(view).toContain('Still stand by that?');
    expect(view).not.toContain('Since the mountain won’t come');
    expect(run.state.facts.some((f) => f.tag === 'intake-done-late')).toBe(false);
  });

  it('deferring to her page is a marked lie: STATIC +2', () => {
    const run = play('d6-morning', ['go-to-the-hall', 'defer-to-the-page']);
    expect(run.state.staticMeter).toBe(12);
  });
});

describe('day 6 — the ticket office', () => {
  it('shows the cot and the kettle', () => {
    const text = rawText(sceneById('d6-ticket-office'));
    expect(text).toContain('cot made army-tight');
    expect(text).toContain('kettle on the stove ring');
  });

  it('detunes Wade at ECHO≥4, immediately paired with its visual twin', () => {
    const run = play('d6-morning', ['walk-the-loaf-down', 'ask-about-the-cot'], (s) => ({
      ...s,
      stats: { ...s.stats, echo: 5 },
    }));
    const i = run.events.findIndex((e) => e.kind === 'music.detune');
    expect(i).toBeGreaterThanOrEqual(0);
    const next = run.events[i + 1];
    expect(next?.kind).toBe('tell.visual');
  });

  it('stays undetuned below the ECHO gate', () => {
    const run = play('d6-morning', ['walk-the-loaf-down', 'ask-about-the-cot']);
    expect(run.events.some((e) => e.kind === 'music.detune')).toBe(false);
  });
});

describe('day 6 — retellings for the missed slot', () => {
  it('missing the wharf: Sam was down there with the phone', () => {
    const run = play('d6-morning', [
      'go-to-the-hall', 'turn-the-question', 'back-up-the-hill',
    ]);
    const evening = viewOf(run, 'd6-evening').paragraphs.join('\n');
    expect(evening).toContain('Sam spent his afternoon down the wharf');
  });

  it('missing the hall: the notebook advances without you', () => {
    const run = play('d6-morning', [
      'walk-the-loaf-down', 'warm-your-hands', 'walk-back-up',
    ]);
    const evening = viewOf(run, 'd6-evening').paragraphs.join('\n');
    expect(evening).toContain('asked where you’d got to');
  });
});

describe('night 6 — the recording', () => {
  const toLot = ['go-to-the-hall', 'answer-plainly', 'back-up-the-hill', 'cross-the-lot'] as const;

  it('renders the clip as prose: room tone where you spoke', () => {
    const run = play('d6-morning', [...toLot]);
    const view = viewOf(run, 'd6-recording').paragraphs.join('\n');
    expect(view).toContain('room tone');
    expect(view).toContain('what you are');
  });

  it('deny is a marked lie: STATIC +2, and the fact stays private to Sam', () => {
    const run = play('d6-morning', [...toLot, 'deny-the-file']);
    expect(run.state.staticMeter).toBe(12);
    const id = factIdOf(run.state, 'private:denied-sams-recording');
    expect(run.state.knownBy.sam).toContain(id);
    // Sam shows no one: the private prefix survives his gossip edge.
    const after = propagateGossip(run.state, [{ from: 'sam', to: 'priya' }]);
    expect(after.knownBy.priya).not.toContain(id);
  });

  it('"I don’t know" feeds UNDERTOW +2 and Sam holds the fact', () => {
    const run = play('d6-morning', [...toLot, 'say-i-dont-know']);
    // 1 base + 1 (answer-plainly) + 2 (the honest answer).
    expect(run.state.stats.undertow).toBe(4);
    const id = factIdOf(run.state, 'told-sam-dont-know');
    expect(run.state.knownBy.sam).toContain(id);
    expect(run.state.knownBy.barb).not.toContain(id);
    const view = viewOf(run, 'd6-recording-2').paragraphs.join('\n');
    expect(view).toContain('wasn’t rehearsed');
  });

  it('saying nothing is also heard', () => {
    const run = play('d6-morning', [...toLot, 'say-nothing']);
    const view = viewOf(run, 'd6-recording-2').paragraphs.join('\n');
    expect(view).toContain('doesn’t lie to me');
  });
});

describe('days 5–6 dialogue rules', () => {
  it('every (speaker, slot) pair has a zero-condition fallback', () => {
    const pairs = new Set(RULES.map((r) => `${r.speaker}:${r.slot}`));
    for (const pair of pairs) {
      const ok = RULES.some((r) => `${r.speaker}:${r.slot}` === pair && isFallback(r));
      expect(ok, `no fallback for ${pair}`).toBe(true);
    }
  });

  it('at least one rule per day requires a fact its speaker never witnessed', () => {
    expect(RULES.some((r) => r.id === 'tam-e5-helped-barb' && r.requires?.length)).toBe(true);
    expect(RULES.some((r) => r.id === 'barb-g6-staying' && r.requires?.length)).toBe(true);
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

  it('holds the title discipline: the phrase appears nowhere in Days 5–6', () => {
    for (const { source, text } of texts) {
      expect(/\bnot\s+here\b/i.test(text), `title phrase in ${source}`).toBe(false);
    }
  });
});
