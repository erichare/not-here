/**
 * Days 3–4 content tests: the three-way hub, without-you retellings for both
 * missed slots (with paired detune/visual-twin emits), the ECHO-gated trap at
 * the shed, the quilt harvest's privacy and its Day-4 cost line, Wade's first
 * lie-detune, the two-phones plant, and the title discipline (the exact
 * phrase appears once, in the chord-sheet @doc artifact only).
 */

import { describe, expect, it } from 'vitest';
import {
  advance,
  initialState,
  type CharacterId,
  type EngineEvent,
  type FactTag,
  type Scene,
  type SceneId,
  type SceneView,
  type WorldState,
} from '@not-here/engine';
import { isFallback } from '@not-here/memory';
import { buildContent } from './content.ts';
import { DIALOGUE_RULES } from './dialogue.ts';
import { RULES as RULES_D34 } from './dialogue-days34.ts';
import { DAY3_SCENES } from './scenes/day3.ts';
import { DAY4_SCENES } from './scenes/day4.ts';

const content = buildContent();

interface Run {
  readonly state: WorldState;
  readonly views: readonly SceneView[];
  readonly events: readonly EngineEvent[];
}

const playFrom = (
  start: SceneId,
  choiceIds: readonly string[],
  state0?: WorldState,
): Run => {
  let step = advance(content, state0 ?? initialState(11, start), { kind: 'enter' });
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
  if (!view) throw new Error(`Run never rendered scene ${sceneId}`);
  return view;
};

const paragraphsOf = (run: Run, sceneId: SceneId): string =>
  viewOf(run, sceneId).paragraphs.join('\n');

const factKnownBy = (state: WorldState, who: CharacterId, tag: FactTag): boolean => {
  const fact = state.facts.find((f) => f.tag === tag);
  return fact !== undefined && state.knownBy[who].includes(fact.id);
};

const detunesOf = (run: Run): readonly string[] =>
  run.events.flatMap((e) => (e.kind === 'music.detune' ? [e.pattern] : []));

const sceneTexts = (scenes: readonly Scene[]): readonly string[] =>
  scenes.flatMap((scene) => {
    if (scene.prose.kind !== 'inline') return [];
    return [
      ...scene.prose.paragraphs.map((p) => p.text),
      ...scene.choices.flatMap((c) => [
        c.label,
        ...(c.lockedLabel !== undefined ? [c.lockedLabel] : []),
      ]),
    ];
  });

// ——— Canonical runs.

const ROOM_RUN = playFrom('d3-morning', [
  'to-room', 'remember-with-her', 'close-wardrobe', 'go-up', 'let-tomorrow',
]);
const SHED_RUN = playFrom('d3-morning', [
  'to-shed', 'say-nothing', 'back-up-the-road', 'go-up', 'let-tomorrow',
]);
const CLINIC_RUN = playFrom('d3-morning', [
  'to-clinic', 'lie-ache', 'back-along-hall', 'go-up', 'let-tomorrow',
]);
const QUILT_COST_RUN = playFrom('d3-morning', [
  'to-room', 'remember-with-her', 'close-wardrobe', 'go-up', 'let-tomorrow', 'to-dianne',
]);
const QUILT_LEFT_RUN = playFrom('d3-morning', [
  'to-room', 'let-it-stay', 'close-wardrobe', 'go-up', 'let-tomorrow', 'to-dianne',
]);
const WHARF_RUN = playFrom('d4-morning', [
  'to-wharf', 'ask-direct', 'leave-him', 'look-longest', 'let-go',
]);

describe('the three-way hubs', () => {
  it('Day 3 offers the room, the shed, and the clinic', () => {
    const hub = DAY3_SCENES.find((s) => s.id === 'd3-morning');
    expect(hub?.choices.map((c) => c.goto)).toEqual(['d3-room', 'd3-shed', 'd3-clinic']);
  });

  it('Day 4 offers the wharf, the errand, and the General', () => {
    const hub = DAY4_SCENES.find((s) => s.id === 'd4-morning');
    expect(hub?.choices.map((c) => c.goto)).toEqual(['d4-wharf', 'd4-errand', 'd4-dianne']);
  });

  it('the hubs set day and slot on entry', () => {
    expect(viewOf(ROOM_RUN, 'd3-morning')).toBeDefined();
    expect(ROOM_RUN.state.day).toBe(4); // let-tomorrow crossed into Day 4
    expect(WHARF_RUN.state.day).toBe(5); // let-go crossed into Day 5
  });
});

describe('without-you retellings (Day 3 evening/night)', () => {
  it('attending the room: the shed arrives as Barb’s telling, the clinic as the note', () => {
    const evening = paragraphsOf(ROOM_RUN, 'd3-evening');
    expect(evening).toContain('She’s not coming back in a boat');
    expect(evening).not.toContain('Dianne had the window up at the house');
    const night = paragraphsOf(ROOM_RUN, 'd3-night');
    expect(night).toContain('You did not come to clinic hours. Noted. — P.A.');
    expect(detunesOf(ROOM_RUN)).toEqual(['sam', 'priya']);
  });

  it('attending the shed: the room arrives as Barb’s telling, the clinic as the note', () => {
    const evening = paragraphsOf(SHED_RUN, 'd3-evening');
    expect(evening).toContain('Dianne had the window up at the house');
    expect(evening).not.toContain('She’s not coming back in a boat');
    const night = paragraphsOf(SHED_RUN, 'd3-night');
    expect(night).toContain('holding your left wrist');
    expect(detunesOf(SHED_RUN)).toEqual(['dianne', 'priya']);
  });

  it('attending the clinic: both morning slots retold in the evening, no note at night', () => {
    const evening = paragraphsOf(CLINIC_RUN, 'd3-evening');
    expect(evening).toContain('She’s not coming back in a boat');
    expect(evening).toContain('Dianne had the window up at the house');
    const night = paragraphsOf(CLINIC_RUN, 'd3-night');
    expect(night).not.toContain('You did not come to clinic hours');
    expect(detunesOf(CLINIC_RUN)).toEqual(['sam', 'dianne']);
  });

  it('the motif twins live in the prose, not in toast events (fix-03)', () => {
    // No duplicate tell.visual lines ride these runs; act1-lint pins each
    // detune to its prose twin in the same scene.
    for (const run of [ROOM_RUN, SHED_RUN, CLINIC_RUN, WHARF_RUN, QUILT_COST_RUN]) {
      expect(run.events.filter((e) => e.kind === 'tell.visual')).toEqual([]);
    }
    expect(paragraphsOf(ROOM_RUN, 'd3-evening')).toContain('a quarter-tone flat');
    expect(paragraphsOf(SHED_RUN, 'd3-evening')).toContain('a shade flat');
    expect(paragraphsOf(ROOM_RUN, 'd3-night')).toContain('one layer short');
  });
});

describe('the quilt harvest (first ECHO offer)', () => {
  it('taking it raises ECHO and records a private fact about Dianne', () => {
    expect(ROOM_RUN.state.stats.echo).toBe(3); // 2 at start of day + 1
    expect(factKnownBy(ROOM_RUN.state, 'dianne', 'private:memory-taken')).toBe(true);
  });

  it('the private harvest never gossips — Barb does not learn it at the day boundary', () => {
    // The run crossed Day 3 → Day 4, so propagation has run once.
    expect(factKnownBy(ROOM_RUN.state, 'barb', 'private:memory-taken')).toBe(false);
    // A public fact Barb witnessed DID travel her edges.
    expect(factKnownBy(ROOM_RUN.state, 'tam', 'went-to-room-d3')).toBe(true);
  });

  it('leaving it feeds UNDERTOW instead', () => {
    const before = initialState(11, 'd3-morning').stats.undertow;
    expect(QUILT_LEFT_RUN.state.stats.undertow).toBe(before + 1);
    expect(QUILT_LEFT_RUN.state.facts.some((f) => f.tag === 'private:memory-taken')).toBe(false);
  });

  it('the cost lands on the next Dianne visit: she no longer remembers the maker', () => {
    const dianne = paragraphsOf(QUILT_COST_RUN, 'd4-dianne');
    expect(dianne).toContain('It’ll come to me, hon');
    expect(dianne).not.toContain('My mother pieced that');
  });

  it('leaving the quilt keeps the story hers on Day 4', () => {
    const dianne = paragraphsOf(QUILT_LEFT_RUN, 'd4-dianne');
    expect(dianne).toContain('My mother pieced that');
    expect(dianne).not.toContain('It’ll come to me, hon');
  });

  it('the cost fires on every route (fix-01): skip Dianne and Barb relays it', () => {
    const skipDianne = playFrom('d3-morning', [
      'to-room', 'remember-with-her', 'close-wardrobe', 'go-up', 'let-tomorrow',
      'to-errand', 'finish-out',
    ]);
    const evening = paragraphsOf(skipDianne, 'd4-evening');
    expect(evening).toContain('who pieced that quilt of her mother’s');
    // The fuller beat stays the reward for revisiting: no relay when you went.
    expect(paragraphsOf(QUILT_COST_RUN, 'd4-dianne')).toContain('It’ll come to me, hon');
  });

  it('no quilt taken, no cost relayed (fix-01 stays honest)', () => {
    const run = playFrom('d3-morning', [
      'to-room', 'let-it-stay', 'close-wardrobe', 'go-up', 'let-tomorrow',
      'to-errand', 'finish-out',
    ]);
    expect(paragraphsOf(run, 'd4-evening')).not.toContain('who pieced that quilt');
  });
});

describe('Day 4 evening — the hole has a sound here too (fix-14)', () => {
  it('missing the wharf: the open shed doors arrive with a detuned motif', () => {
    const run = playFrom('d3-morning', [
      'to-clinic', 'honest-wrist', 'back-along-hall', 'go-up', 'let-tomorrow',
      'to-dianne', 'go-easy',
    ]);
    const evening = paragraphsOf(run, 'd4-evening');
    expect(evening).toContain('Wade had the shed doors open all morning');
    expect(evening).toContain('a shade flat');
    expect(detunesOf(run)).toContain('wade');
  });

  it('missing the General: the shelf gap arrives in passing, with the music-box', () => {
    const evening = paragraphsOf(WHARF_RUN, 'd4-evening');
    expect(evening).toContain('bare wood now');
    expect(detunesOf(WHARF_RUN)).toContain('dianne');
  });

  it('the photographed minute is Day-2-plausible on every route', () => {
    const evening = paragraphsOf(WHARF_RUN, 'd4-evening');
    expect(evening).toContain('the Kettle door at closing, two nights back');
    expect(evening).not.toContain('tables going in');
  });

  it('studying the photos follows you up to Night 4, with the flat disagreement', () => {
    const night = paragraphsOf(WHARF_RUN, 'd4-night'); // WHARF_RUN looks longest
    expect(night).toContain('In his, you are half-turned toward the door. In the other, away.');
  });

  it('looking away also makes a sound at Night 4', () => {
    const run = playFrom('d4-morning', ['to-errand', 'finish-out', 'back-to-plate', 'let-go']);
    expect(paragraphsOf(run, 'd4-night')).toContain('The not-looking climbed the stairs with you');
    expect(paragraphsOf(run, 'd4-night')).not.toContain('In his, you are half-turned');
  });
});

describe('Sam remembers the shed (fix-02)', () => {
  const base = initialState(11, 'd3-morning');
  const attuned: WorldState = { ...base, stats: { ...base.stats, echo: 3 } };
  const SPRUNG_RUN = playFrom(
    'd3-morning',
    ['to-shed', 'correct-him', 'back-up-the-road', 'go-up', 'let-tomorrow', 'to-errand', 'finish-out'],
    attuned,
  );

  it('Barb’s Day-3 greeting goes neutral — no chair by the heater tonight', () => {
    const evening = paragraphsOf(SPRUNG_RUN, 'd3-evening');
    expect(evening).toContain('Sam came up the hill before noon');
    expect(evening).not.toContain('You’ve earned the chair by the heater');
  });

  it('the shed shadows the two-phones beat on Day 4', () => {
    const evening = paragraphsOf(SPRUNG_RUN, 'd4-evening');
    expect(evening).toContain('He hasn’t, since the boat shed');
  });

  it('held trap leaves Day 4 unshadowed', () => {
    const evening = paragraphsOf(WHARF_RUN, 'd4-evening');
    expect(evening).not.toContain('since the boat shed');
  });
});

describe('Sam’s trap test #1', () => {
  it('the fatal correction is visible but locked below ECHO 3', () => {
    const run = playFrom('d3-morning', ['to-shed']);
    const view = viewOf(run, 'd3-shed');
    const trap = view.choices.find((c) => c.id === 'correct-him');
    expect(trap?.locked).toBe(true);
    expect(trap?.label).toContain('The right word is almost there');
  });

  it('with ECHO 3 the trap springs: he goes white and leaves', () => {
    const base = initialState(11, 'd3-morning');
    const boosted: WorldState = { ...base, stats: { ...base.stats, echo: 3 } };
    const run = playFrom('d3-morning', ['to-shed', 'correct-him'], boosted);
    expect(viewOf(run, 'd3-shed').choices.find((c) => c.id === 'correct-him')?.locked).toBe(false);
    expect(paragraphsOf(run, 'd3-shed-2')).toContain('Nobody told you that');
    expect(factKnownBy(run.state, 'sam', 'fog-sam-trap-sprung')).toBe(true);
  });

  it('saying nothing seeds the UNDERTOW path: sam-test-1-passed, witnessed by Sam', () => {
    expect(factKnownBy(SHED_RUN.state, 'sam', 'sam-test-1-passed')).toBe(true);
    expect(SHED_RUN.state.facts.some((f) => f.tag === 'fog-sam-trap-sprung')).toBe(false);
  });
});

describe('Priya’s clinic', () => {
  it('intake completes and the notebook thread opens', () => {
    expect(factKnownBy(CLINIC_RUN.state, 'priya', 'priya-intake-done')).toBe(true);
    expect(CLINIC_RUN.state.flags['priya:notebook-open']).toBe(true);
  });

  it('the marked lie at intake raises STATIC by 2 and Priya writes it down', () => {
    expect(CLINIC_RUN.state.staticMeter).toBe(12); // 10 baseline + 2
    expect(factKnownBy(CLINIC_RUN.state, 'priya', 'lied-at-intake')).toBe(true);
  });

  it('missing the clinic still advances her thread — the note is hers', () => {
    expect(factKnownBy(ROOM_RUN.state, 'priya', 'missed-clinic-noted')).toBe(true);
    expect(ROOM_RUN.state.flags['priya:notebook-open']).toBe(true);
  });
});

describe('Day 4: Wade and the first audible lie', () => {
  it('“Not well.” detunes his stem a quarter-tone, unGated, twin carried in prose', () => {
    const detune = WHARF_RUN.events.find(
      (e) => e.kind === 'music.detune' && e.pattern === 'wade',
    );
    expect(detune?.kind === 'music.detune' && detune.cents).toBe(-50);
    const prose = paragraphsOf(WHARF_RUN, 'd4-wharf-2');
    expect(prose).toContain('“Not well.”');
    // fix-03: the twin FOLLOWS the lie, inside the prose — no toast above it.
    expect(prose).toContain('a quarter-turn flat');
    expect(WHARF_RUN.events.some((e) => e.kind === 'tell.visual')).toBe(false);
  });

  it('the horn room stays shut', () => {
    expect(paragraphsOf(WHARF_RUN, 'd4-wharf')).toContain('“That’s shut,”');
  });

  it('the two phones land side by side in public — witnessed, uncommented', () => {
    const evening = paragraphsOf(WHARF_RUN, 'd4-evening');
    expect(evening).toContain('two phones on the counter, side by side');
    expect(evening).toContain('He says nothing. Nobody says anything.');
    for (const who of ['sam', 'barb', 'tam'] as const) {
      expect(factKnownBy(WHARF_RUN.state, who, 'two-phones-laid-out')).toBe(true);
    }
  });

  it('the album shelf gap is planted on the Dianne follow-up', () => {
    expect(paragraphsOf(QUILT_COST_RUN, 'd4-dianne')).toContain('unfaded paint');
    expect(QUILT_COST_RUN.state.facts.some((f) => f.tag === 'saw-album-gap')).toBe(true);
  });
});

describe('the title discipline (Days 3–4)', () => {
  it('the exact phrase appears once, in the chord-sheet @doc artifact only', () => {
    const texts = [
      ...sceneTexts(DAY3_SCENES),
      ...sceneTexts(DAY4_SCENES),
      ...RULES_D34.map((r) => r.text),
    ];
    const hits = texts.filter((t) => /not here/i.test(t));
    expect(hits).toHaveLength(1);
    const artifact = hits[0] ?? '';
    expect(artifact.startsWith('@doc:')).toBe(true);
    expect(artifact).toContain('not here (unfinished)');
    expect(artifact.match(/not here/gi)).toHaveLength(1);
  });

  it('the chord sheet has five filled systems and an empty sixth', () => {
    const doc = sceneTexts(DAY3_SCENES).find((t) => t.includes('not here (unfinished)')) ?? '';
    expect(doc).toContain(' 5 ║ Dm');
    expect(doc).toMatch(/\n 6 ║\s+│\s+│\s+│\s+║/); // sixth system ruled, empty
  });
});

describe('Barb’s evening greetings, Days 3–4', () => {
  it('every (speaker, slot) pair used has a zero-condition fallback in the combined table', () => {
    const combined = [...DIALOGUE_RULES, ...RULES_D34];
    for (const rule of RULES_D34) {
      const hasFallback = combined.some(
        (r) => r.speaker === rule.speaker && r.slot === rule.slot && isFallback(r),
      );
      expect(hasFallback, `no fallback for ${rule.speaker}:${rule.slot}`).toBe(true);
    }
  });

  it('Day 3 greeting keys to the morning Barb watched you pick', () => {
    expect(paragraphsOf(ROOM_RUN, 'd3-evening')).toContain('holding the other end of one');
    expect(paragraphsOf(CLINIC_RUN, 'd3-evening')).toContain('You’ll be a page by now');
  });

  it('Day 4 greeting keys to the wharf visit', () => {
    expect(paragraphsOf(WHARF_RUN, 'd4-evening')).toContain('The half of it he gives');
  });
});

describe('night 3 window habit', () => {
  it('window-first sleepers see the figure at the horn-room rail', () => {
    const base = initialState(11, 'd3-morning');
    const watcher: WorldState = {
      ...base,
      flags: { ...base.flags, 'n1:watched-lake': true },
    };
    const run = playFrom('d3-morning', ['to-room', 'let-it-stay', 'close-wardrobe', 'go-up'], watcher);
    const night = paragraphsOf(run, 'd3-night');
    expect(night).toContain('a figure at the horn-room rail');
    expect(run.state.flags['d3:saw-figure']).toBe(true);
    expect(paragraphsOf(ROOM_RUN, 'd3-night')).not.toContain('horn-room rail');
  });
});
