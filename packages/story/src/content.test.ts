/**
 * Night-1 slice content tests: the content builds, the graph closes, the
 * scripted walkthroughs reach 'act1-end', and the prose invariants hold
 * (design/game-bible.md §Prose grammar; design/twist-recontext-table.md).
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
import { ALL_SCENES, buildContent, OPENING_SCENE } from './content.ts';
import { DIALOGUE_RULES } from './dialogue.ts';

const content = buildContent();

/** Every goto target a scene can reach (choices, choice effects, onEnter). */
const gotoTargets = (scene: Scene): readonly SceneId[] => {
  const fromChoices = scene.choices.map((c) => c.goto);
  const fromChoiceEffects = scene.choices.flatMap((c) =>
    (c.effects ?? []).flatMap((e) => (e.op === 'goto' ? [e.scene] : [])),
  );
  const fromOnEnter = (scene.onEnter ?? []).flatMap((e) =>
    e.op === 'goto' ? [e.scene] : [],
  );
  return [...fromChoices, ...fromChoiceEffects, ...fromOnEnter];
};

/** All authored surface text: paragraphs, choice labels, dialogue lines. */
const allTexts = (): readonly { source: string; text: string }[] => [
  ...ALL_SCENES.flatMap((scene) => {
    if (scene.prose.kind !== 'inline') return [];
    const paragraphs = scene.prose.paragraphs.map((p) => ({
      source: scene.id,
      text: p.text,
    }));
    const labels = scene.choices.flatMap((c) => [
      { source: `${scene.id}#${c.id}`, text: c.label },
      ...(c.lockedLabel !== undefined
        ? [{ source: `${scene.id}#${c.id}:locked`, text: c.lockedLabel }]
        : []),
    ]);
    return [...paragraphs, ...labels];
  }),
  ...DIALOGUE_RULES.map((r) => ({ source: `rule:${r.id}`, text: r.text })),
];

interface Playthrough {
  readonly state: WorldState;
  readonly views: readonly SceneView[];
  readonly events: readonly EngineEvent[];
}

const play = (choiceIds: readonly string[], seed = 42): Playthrough => {
  let step = advance(content, initialState(seed, OPENING_SCENE), { kind: 'enter' });
  const views: SceneView[] = [step.view];
  const events: EngineEvent[] = [...step.events];
  for (const choiceId of choiceIds) {
    step = advance(content, step.state, { kind: 'choose', choiceId });
    views.push(step.view);
    events.push(...step.events);
  }
  // Walk any remaining (stub) scenes by first open choice until an ending.
  // The Act 1 fleet replaces stubs with real scenes and extends the scripts.
  for (let i = 0; i < 60 && step.view.ending === undefined; i++) {
    const first = step.view.choices.find((c) => !c.locked);
    if (!first) break;
    step = advance(content, step.state, { kind: 'choose', choiceId: first.id });
    views.push(step.view);
    events.push(...step.events);
  }
  return { state: step.state, views, events };
};

const viewOf = (run: Playthrough, sceneId: SceneId): SceneView => {
  const view = run.views.find((v) => v.sceneId === sceneId);
  if (!view) throw new Error(`Walkthrough never rendered scene ${sceneId}`);
  return view;
};

const DIANNE_PATH = [
  'open-eyes', 'walk-to-town', 'go-in', 'sit', 'eat-all', 'say-his-name',
  'q1-window', 'q2-however', 'q3-on-the-tab', 'q4-light', 'q5-said-it-to-the-door',
  'sleep', 'listen', 'go-down', 'go-to-dianne', 'step-in', 'stay-till-done',
  'go-up', 'let-it-come',
] as const;

const BARB_PATH = [
  'open-eyes', 'look-at-water', 'go-in', 'sit', 'refuse', 'let-him-be',
  'q1-booth', 'q2-none', 'q3-whats-true', 'q4-dont-sleep', 'q5-never-do',
  'window-first', 'hand-to-wall', 'go-down', 'stay-for-delivery', 'take-the-cloth',
  'to-evening', 'go-up', 'let-it-come',
] as const;

// ——— Full Act 1 routes (Night 1 → act1-end), one per Foghorn branch. ———

const HORN_ON_PATH = [
  ...DIANNE_PATH,
  // Day 3: the shed; trap held. Room + clinic resolve without you.
  'to-shed', 'say-nothing', 'back-up-the-road', 'go-up', 'let-tomorrow',
  // Day 4: the wharf; the first audible lie; the two phones.
  'to-wharf', 'ask-direct', 'leave-him', 'look-longest', 'let-go',
  // Day 5: the 07:40; the marked lie about the 28th.
  'take-the-0740', 'hold-his-eyes', 'say-staying', 'go-in', 'turn-in',
  'let-morning-come',
  // Day 6: the hall (late intake); the recording; the honest answer.
  'go-to-the-hall', 'answer-plainly', 'back-up-the-hill', 'cross-the-lot',
  'say-i-dont-know', 'go-in-eventually',
  // Day 7: the branch — "Keep playing."
  'stay-the-morning', 'cross-the-lot', 'for-sam', 'keep-playing', 'lie-down',
] as const;

const HORN_STOPPED_PATH = [
  ...BARB_PATH,
  // Day 3: the room; the quilt left hers. Shed + clinic resolve without you.
  'to-room', 'let-it-stay', 'close-wardrobe', 'go-up', 'let-tomorrow',
  // Day 4: the walk-in with Barb; Moose beat #2.
  'to-errand', 'finish-out', 'look-longest', 'let-go',
  // Day 5: the hall; the flyer goes up; the lid stays down.
  'help-at-the-hall', 'do-the-flyers', 'let-the-lid-stay', 'walk-back-down',
  'turn-in', 'let-morning-come',
  // Day 6: the loaf to Wade; the recording; the said nothing.
  'walk-the-loaf-down', 'warm-your-hands', 'walk-back-up', 'cross-the-lot',
  'say-nothing', 'go-in-eventually',
  // Day 7: the branch — "Stop."
  'shore-road', 'cross-the-lot', 'for-the-town', 'stop', 'walk-back', 'lie-down',
] as const;

/** One recorded step of a traced run: what rendered, on what day, with what state. */
interface TraceStep {
  readonly sceneId: SceneId;
  readonly day: number;
  readonly state: WorldState;
}

interface TracedRun extends Playthrough {
  readonly trace: readonly TraceStep[];
}

/** play(), but keeping per-step (sceneId, day, state) for boundary assertions. */
const playTraced = (choiceIds: readonly string[], seed = 42): TracedRun => {
  let step = advance(content, initialState(seed, OPENING_SCENE), { kind: 'enter' });
  const views: SceneView[] = [step.view];
  const events: EngineEvent[] = [...step.events];
  const trace: TraceStep[] = [
    { sceneId: step.view.sceneId, day: step.state.day, state: step.state },
  ];
  for (const choiceId of choiceIds) {
    step = advance(content, step.state, { kind: 'choose', choiceId });
    views.push(step.view);
    events.push(...step.events);
    trace.push({ sceneId: step.view.sceneId, day: step.state.day, state: step.state });
  }
  return { state: step.state, views, events, trace };
};

const stepAt = (run: TracedRun, sceneId: SceneId): TraceStep => {
  const found = run.trace.find((t) => t.sceneId === sceneId);
  if (!found) throw new Error(`Traced run never rendered ${sceneId}`);
  return found;
};

const knowsTag = (state: WorldState, who: keyof WorldState['knownBy'], tag: string): boolean => {
  const fact = state.facts.find((f) => f.tag === tag);
  return fact !== undefined && state.knownBy[who].includes(fact.id);
};

describe('content build', () => {
  it('builds, and the opening scene exists', () => {
    expect(content.scenes.has(OPENING_SCENE)).toBe(true);
  });

  it('has no duplicate scene ids', () => {
    expect(new Set(ALL_SCENES.map((s) => s.id)).size).toBe(ALL_SCENES.length);
  });

  it('only references shipped music cues', () => {
    const allowed = new Set([
      'title', 'shingle', 'pub-warm', 'dianne-theme', 'foghorn-312',
      'wrens-room', 'wade-theme', 'priya-theme', 'sam-theme', 'tam-theme',
      'hall-upright', 'horn-close',
    ]);
    for (const scene of ALL_SCENES) {
      if (scene.cue !== undefined) expect(allowed.has(scene.cue)).toBe(true);
    }
  });
});

describe('graph closure', () => {
  it('every goto target exists', () => {
    for (const scene of ALL_SCENES) {
      for (const target of gotoTargets(scene)) {
        expect(content.scenes.has(target), `${scene.id} → ${target}`).toBe(true);
      }
    }
  });

  it('every scene is reachable from the opening', () => {
    const seen = new Set<SceneId>([OPENING_SCENE]);
    const queue: SceneId[] = [OPENING_SCENE];
    for (let next = queue.shift(); next !== undefined; next = queue.shift()) {
      const scene = content.scenes.get(next);
      if (!scene) continue;
      for (const target of gotoTargets(scene)) {
        if (!seen.has(target)) {
          seen.add(target);
          queue.push(target);
        }
      }
    }
    for (const scene of ALL_SCENES) {
      expect(seen.has(scene.id), `orphan scene: ${scene.id}`).toBe(true);
    }
  });

  it('exactly one ending scene, and it is act1-end', () => {
    const endings = ALL_SCENES.filter((s) => s.ending !== undefined);
    expect(endings.map((s) => s.id)).toEqual(['act1-end']);
    expect(endings[0]?.ending).toBe('act1-end');
  });
});

describe('walkthrough: the Dianne branch', () => {
  const run = play(DIANNE_PATH);

  it('reaches act1-end', () => {
    expect(run.state.sceneId).toBe('act1-end');
    const last = run.views[run.views.length - 1];
    expect(last?.ending).toBe('act1-end');
  });

  it('sets the interview truth flags and slice flags', () => {
    expect(run.state.flags['truth:misses-the-lake']).toBe(true);
    expect(run.state.flags['truth:eats-what-is-given']).toBe(true);
    expect(run.state.flags['truth:keeps-promises']).toBe(true);
    expect(run.state.flags['truth:afraid-of-quiet']).toBe(true);
    expect(run.state.flags['heard-horn-312']).toBe(true);
    expect(run.state.flags['seen-bus-date']).toBe(true);
  });

  it('greets you as someone who went to Dianne, and retells the delivery warmly', () => {
    const evening = viewOf(run, 'd2-evening').paragraphs.join('\n');
    expect(evening).toContain('How’s Dianne keeping?');
    expect(evening).toContain('You missed the show');
    expect(evening).not.toContain('the winter runs');
  });

  it('emits the cue trail and a final autosave', () => {
    const cues = run.events.flatMap((e) => (e.kind === 'music.cue' ? [e.cue] : []));
    // Night 1 + Day 2 open the trail; the Day 3–7 fleet appends its own cues.
    expect(cues.slice(0, 7)).toEqual([
      'title', 'shingle', 'pub-warm', 'foghorn-312', 'dianne-theme', 'pub-warm',
      'foghorn-312',
    ]);
    // The act closes on the ACT TWO title card (day7.ts, 'act1-end').
    expect(cues[cues.length - 1]).toBe('title');
    expect(run.events.some((e) => e.kind === 'save.autosave')).toBe(true);
  });
});

describe('walkthrough: the Barb branch', () => {
  const run = play(BARB_PATH);

  it('reaches act1-end', () => {
    expect(run.state.sceneId).toBe('act1-end');
  });

  it('records helped-barb as a fact Barb witnessed', () => {
    const fact = run.state.facts.find((f) => f.tag === 'helped-barb');
    expect(fact).toBeDefined();
    expect(fact && run.state.knownBy.barb.includes(fact.id)).toBe(true);
  });

  it('selects the helped-barb greeting over the refused-meal one', () => {
    const evening = viewOf(run, 'd2-evening').paragraphs.join('\n');
    expect(evening).toContain('Anyone who dries a pot');
    expect(evening).not.toContain('Eating tonight?');
  });

  it('retells Dianne’s morning without you — the bus date arrives secondhand', () => {
    const evening = viewOf(run, 'd2-evening').paragraphs.join('\n');
    expect(evening).toContain('the winter runs');
    expect(evening).toContain('She was singing when I left');
    expect(evening).not.toContain('You missed the show');
  });
});

describe('Night-1 ECHO seeding is capped (fix-10)', () => {
  it('the cap holds at dawn: an all-attunement Night 1 still enters Day 2 at ECHO 4', () => {
    let step = advance(content, initialState(9, OPENING_SCENE), { kind: 'enter' });
    for (const id of [
      'open-eyes', 'walk-to-town', 'go-in', 'sit', 'eat-some', 'say-his-name',
      'q1-window', 'q2-two-heaped', 'q3-what-they-call-me', 'q4-light',
      'q5-dont-remember', 'window-first', 'hand-to-wall',
    ]) {
      step = advance(content, step.state, { kind: 'choose', choiceId: id });
    }
    expect(step.state.sceneId).toBe('d2-wake');
    expect(step.state.stats.echo).toBe(4); // 2 baseline + 2 seeded, capped
  });
});

describe('Barb teaches the book, exactly once (fix-04)', () => {
  it('the authored line closes the Counter Interview, in n1-room', () => {
    const room = ALL_SCENES.find((s) => s.id === 'n1-room');
    if (!room || room.prose.kind !== 'inline') throw new Error('missing n1-room');
    const text = room.prose.paragraphs.map((p) => p.text).join('\n');
    expect(text).toContain('Ask, if you ever want to know what I’ve written.');
  });

  it('unlocks the book for the frontends on entering n1-room', () => {
    const run = play(DIANNE_PATH.slice(0, 11));
    expect(run.state.flags['barbs-book:unlocked']).toBe(true);
  });

  it('is taught nowhere else — one lesson, one cadence', () => {
    const hits = allTexts().filter(({ text }) =>
      text.includes('Ask, if you ever want to know'),
    );
    expect(hits.map((h) => h.source)).toEqual(['n1-room']);
  });
});

describe('dialogue rules', () => {
  it('every (speaker, slot) pair has a zero-condition fallback', () => {
    const pairs = new Set(DIALOGUE_RULES.map((r) => `${r.speaker}:${r.slot}`));
    for (const pair of pairs) {
      const hasFallback = DIALOGUE_RULES.some(
        (r) => `${r.speaker}:${r.slot}` === pair && isFallback(r),
      );
      expect(hasFallback, `no fallback for ${pair}`).toBe(true);
    }
  });

  it('falls back to the plain greeting when Barb knows nothing', () => {
    const fresh = initialState(7, 'd2-evening');
    const scene = content.scenes.get('d2-evening');
    if (!scene) throw new Error('missing d2-evening');
    const prose = content.realizeProse(scene, fresh).join('\n');
    expect(prose).toContain('Heat’s on. Sit where you like.');
  });
});

describe('prose invariants', () => {
  const texts = allTexts();

  it('no character ever initiates touch with the player', () => {
    const touch =
      /\b(she|he|they|dianne|barb|tam|wade|priya|sam|moose)\s+(takes|touches|hugs|grabs|holds|pats|strokes|embraces|catches|clasps|pulls|reaches\s+for)\s+(you|your)\b/i;
    for (const { source, text } of texts) {
      expect(touch.test(text), `NPC-initiated touch in ${source}: ${text}`).toBe(false);
    }
  });

  it('the name Wren appears nowhere in the slice — Dianne least of all', () => {
    for (const { source, text } of texts) {
      expect(/\bWren\b/.test(text), `'Wren' spoken in ${source}`).toBe(false);
    }
  });

  it('the arrival text carries no lake on you, and no cold in you', () => {
    const beach = ALL_SCENES.find((s) => s.id === 'n1-beach');
    if (!beach || beach.prose.kind !== 'inline') throw new Error('missing beach scene');
    const arrival = beach.prose.paragraphs.map((p) => p.text).join('\n');
    expect(arrival).toContain('no lake smell');
    expect(arrival).toContain('no milfoil in your cuffs');
    expect(arrival).toContain('dry at the roots');
    expect(arrival).toContain('no cold in you');
  });

  it('Moose never growls', () => {
    for (const { source, text } of texts) {
      expect(/growl/i.test(text), `growl in ${source}`).toBe(false);
    }
  });

  it('nobody calls any of it strange', () => {
    for (const { source, text } of texts) {
      expect(/(?<!-)\b(strange|odd|uncanny|impossible)\b/i.test(text), `remarked in ${source}`).toBe(
        false,
      );
    }
  });
});

describe('full Act 1 walkthrough — horn-on route', () => {
  const run = playTraced(HORN_ON_PATH);

  it('reaches act1-end on Day 8 with the ending marker', () => {
    expect(run.state.sceneId).toBe('act1-end');
    expect(run.views[run.views.length - 1]?.ending).toBe('act1-end');
    expect(run.state.day).toBe(8);
  });

  it('the day counter reads 1..8, monotonic, each hub on its own day', () => {
    const days = run.trace.map((t) => t.day);
    days.forEach((day, i) => {
      if (i > 0) expect(day, `day went backwards at step ${i}`).toBeGreaterThanOrEqual(days[i - 1] ?? 0);
    });
    expect([...new Set(days)]).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
    expect(stepAt(run, 'd2-wake').day).toBe(2);
    expect(stepAt(run, 'd3-morning').day).toBe(3);
    expect(stepAt(run, 'd4-morning').day).toBe(4);
    expect(stepAt(run, 'd5-morning').day).toBe(5);
    expect(stepAt(run, 'd6-morning').day).toBe(6);
    expect(stepAt(run, 'd7-morning').day).toBe(7);
    expect(stepAt(run, 'act1-end').day).toBe(8);
  });

  it('gossip postDay ran: the Day-5 lie crosses tam→barb at the 5→6 boundary', () => {
    // Only Tam witnessed 'told-tam-staying'; Barb still ignorant at Night 5 …
    expect(knowsTag(stepAt(run, 'd5-night').state, 'barb', 'told-tam-staying')).toBe(false);
    // … and knows it when Day 6 opens: learned via the edge, not the room.
    expect(knowsTag(stepAt(run, 'd6-morning').state, 'barb', 'told-tam-staying')).toBe(true);
  });

  it('the gossip is visible in dialogue: Tam credits Barb on Day 5, Barb credits Tam on Day 6', () => {
    const d5 = viewOf(run, 'd5-evening').paragraphs.join('\n');
    expect(d5).toContain('Barb keeps me current');
    const d6 = viewOf(run, 'd6-evening').paragraphs.join('\n');
    expect(d6).toContain('Tam tells me');
  });

  it('sets the horn-on flags; Wade alone holds the fact; nothing starts counting', () => {
    expect(run.state.flags['horn-on']).toBe(true);
    expect(run.state.flags['wade-confession-seed']).toBe(true);
    expect(run.state.flags['horn-stopped']).toBeUndefined();
    expect(knowsTag(run.state, 'wade', 'let-wade-play')).toBe(true);
    expect(knowsTag(run.state, 'barb', 'let-wade-play')).toBe(false);
    expect(
      run.events.some((e) => e.kind === 'tell.visual' && e.text === '(Something has started counting.)'),
    ).toBe(false);
  });

  it('carries the marked-lie STATIC cost and detunes Wade’s stem', () => {
    expect(run.state.staticMeter).toBe(12); // 10 baseline + say-staying
    // fix-03: the visual twins ride the prose of the emitting scenes —
    // pinned scene by scene in act1-lint's PROSE_TWINS.
    expect(run.events.some((e) => e.kind === 'music.detune' && e.pattern === 'wade')).toBe(true);
  });
});

describe('full Act 1 walkthrough — horn-stopped route', () => {
  const run = playTraced(HORN_STOPPED_PATH);

  it('reaches act1-end on Day 8 with the ending marker', () => {
    expect(run.state.sceneId).toBe('act1-end');
    expect(run.views[run.views.length - 1]?.ending).toBe('act1-end');
    expect(run.state.day).toBe(8);
  });

  it('the day counter reads 1..8 across every boundary', () => {
    const days = run.trace.map((t) => t.day);
    days.forEach((day, i) => {
      if (i > 0) expect(day, `day went backwards at step ${i}`).toBeGreaterThanOrEqual(days[i - 1] ?? 0);
    });
    expect([...new Set(days)]).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
  });

  it('gossip postDay ran: helped-barb crosses barb→tam at the 2→3 boundary', () => {
    expect(knowsTag(stepAt(run, 'd2-night').state, 'tam', 'helped-barb')).toBe(false);
    expect(knowsTag(stepAt(run, 'd3-morning').state, 'tam', 'helped-barb')).toBe(true);
    // Still known (facts only accumulate) when Day 6 opens — the check the
    // beat sheet asks for: a fact learned via edges exists by Day 6.
    expect(knowsTag(stepAt(run, 'd6-morning').state, 'tam', 'helped-barb')).toBe(true);
  });

  it('Tam voices the gossiped fact on Day 5, crediting his source', () => {
    const d5 = viewOf(run, 'd5-evening').paragraphs.join('\n');
    expect(d5).toContain('Barb tells me you dry a pot properly');
  });

  it('the window-first habit pays off: the figure at the horn-room rail, Night 3', () => {
    expect(viewOf(run, 'd3-night').paragraphs.join('\n')).toContain('a figure at the horn-room rail');
    expect(run.state.flags['d3:saw-figure']).toBe(true);
  });

  it('sets horn-stopped; Wade alone holds the fact; the count begins', () => {
    expect(run.state.flags['horn-stopped']).toBe(true);
    expect(run.state.flags['horn-on']).toBeUndefined();
    expect(knowsTag(run.state, 'wade', 'stopped-the-horn')).toBe(true);
    expect(knowsTag(run.state, 'barb', 'stopped-the-horn')).toBe(false);
    expect(
      run.events.some((e) => e.kind === 'tell.visual' && e.text === '(Something has started counting.)'),
    ).toBe(true);
  });

  it('closing the valve is the honest act: STATIC ends below baseline', () => {
    expect(run.state.staticMeter).toBe(5); // 10 baseline − 5 at the valve
  });

  it('the silent scene stays silent: no cue between pub-warm and the act card', () => {
    const cues = run.events.flatMap((e) => (e.kind === 'music.cue' ? [e.cue] : []));
    const lastPubWarm = cues.lastIndexOf('pub-warm'); // d7-evening
    // After the Day-7 evening: the walk (foghorn-312), the horn room
    // (horn-close), then nothing — d6-recording earlier and d7-silence/after
    // carry no cue — until the ACT TWO card's title.
    expect(cues.slice(lastPubWarm + 1)).toEqual(['foghorn-312', 'horn-close', 'title']);
  });
});
