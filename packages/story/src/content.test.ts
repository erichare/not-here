/**
 * Night-1 slice content tests: the content builds, the graph closes, the
 * scripted walkthroughs reach 'slice-end', and the prose invariants hold
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

describe('content build', () => {
  it('builds, and the opening scene exists', () => {
    expect(content.scenes.has(OPENING_SCENE)).toBe(true);
  });

  it('has no duplicate scene ids', () => {
    expect(new Set(ALL_SCENES.map((s) => s.id)).size).toBe(ALL_SCENES.length);
  });

  it('only references the five slice music cues', () => {
    const allowed = new Set(['title', 'shingle', 'pub-warm', 'dianne-theme', 'foghorn-312']);
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

  it('exactly one ending scene, and it is slice-end', () => {
    const endings = ALL_SCENES.filter((s) => s.ending !== undefined);
    expect(endings.map((s) => s.id)).toEqual(['slice-end']);
    expect(endings[0]?.ending).toBe('slice-end');
  });
});

describe('walkthrough: the Dianne branch', () => {
  const run = play(DIANNE_PATH);

  it('reaches slice-end', () => {
    expect(run.state.sceneId).toBe('slice-end');
    const last = run.views[run.views.length - 1];
    expect(last?.ending).toBe('slice-end');
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
    expect(cues).toEqual([
      'title', 'shingle', 'pub-warm', 'foghorn-312', 'dianne-theme', 'pub-warm',
      'foghorn-312', 'title',
    ]);
    expect(run.events.some((e) => e.kind === 'save.autosave')).toBe(true);
  });
});

describe('walkthrough: the Barb branch', () => {
  const run = play(BARB_PATH);

  it('reaches slice-end', () => {
    expect(run.state.sceneId).toBe('slice-end');
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
