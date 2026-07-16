/**
 * Days 8–9 content tests (design/act2-beats.md §Day 8, §Day 9).
 *
 * Covers: the three-way hubs and the track-split wharf gates (hidden, not
 * locked); d8-morning setting SLOT ONLY (act1-end owns day 8) while
 * d9-morning owns day 9; press opportunity #1 and the defensive
 * pressed-dianne when-chain (1→2→3 with locks-house on the increment that
 * makes 3); the offsets (today:fed at the stockroom lunch and the walk-in,
 * today:remembered at the horn-on wharf) and NIGHT_DECAY behaviour on both
 * tracks — managed vs unmanaged two-night trajectories, the rotation, the
 * gated diegetic tells, the track-branched night audio (foghorn-312 emit /
 * music.stop, no scene cue); the clue plants (the intake @doc with the
 * act's single written title use, the three-X map, the orchard-beach press
 * answer); without-you retellings with detuned motifs and in-prose twins;
 * marked-lie STATIC costs; fact witnessing; the dianne→barb gossip edge
 * feeding barb:greeting-d9. Prose invariants re-checked over this fleet.
 *
 * NOTE: these tests require content.ts to register DAY8_SCENES,
 * DAY9_SCENES, and the days 8–9 dialogue rules (integration wiring).
 */

import { describe, expect, it } from 'vitest';
import {
  advance,
  applyEffects,
  initialState,
  type Effect,
  type EngineEvent,
  type Scene,
  type SceneId,
  type SceneView,
  type WorldState,
} from '@not-here/engine';
import { isFallback } from '@not-here/memory';
import { buildContent } from './content.ts';
import { NIGHT_DECAY } from './scenes/act2-shared.ts';
import { DAY8_SCENES } from './scenes/day8.ts';
import { DAY9_SCENES } from './scenes/day9.ts';
import { RULES } from './dialogue-days89.ts';

const content = buildContent();
const FLEET_SCENES: readonly Scene[] = [...DAY8_SCENES, ...DAY9_SCENES];

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
  const base = initialState(89, start);
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

/** Seed a Day-8 entry: act1-end owns day 8; the track flag is Night 7's. */
const onTrack =
  (track: 'horn-on' | 'horn-stopped', flags: Record<string, boolean | number | string> = {}) =>
  (s: WorldState): WorldState => ({
    ...s,
    day: 8,
    flags: { ...s.flags, [track]: true, ...flags },
  });

// Route shorthands (day 8 → into day 9).
const D8_STOCKROOM = ['to-stockroom', 'keep-lifting', 'take-the-afternoon', 'cross-the-lot', 'let-day-nine'] as const;
const D8_SHED = ['to-shed', 'say-nothing-wall', 'up-the-shore-road', 'cross-the-lot', 'let-day-nine'] as const;

describe('hubs, gates, and day boundaries', () => {
  it('d8-morning sets slot only — act1-end owns time.set day 8', () => {
    const morning = sceneById('d8-morning');
    const timeSets = (morning.onEnter ?? []).filter((e) => e.op === 'time.set');
    expect(timeSets).toEqual([{ op: 'time.set', slot: 'morning' }]);
    const run = play('d8-morning', [], onTrack('horn-on'));
    expect(run.state.day).toBe(8); // untouched from the seed
    expect(run.state.slot).toBe('morning');
  });

  it('d9-morning owns day 9; no fleet scene sets day 8 or 10', () => {
    const flatten = (effects: readonly Effect[]): readonly Effect[] =>
      effects.flatMap((e) =>
        e.op === 'when' ? [e, ...flatten(e.then), ...flatten(e.else ?? [])] : [e],
      );
    const owners = new Map<number, string[]>();
    for (const scene of FLEET_SCENES) {
      const all = [
        ...flatten(scene.onEnter ?? []),
        ...scene.choices.flatMap((c) => flatten(c.effects ?? [])),
      ];
      for (const effect of all) {
        if (effect.op !== 'time.set' || effect.day === undefined) continue;
        owners.set(effect.day, [...(owners.get(effect.day) ?? []), scene.id]);
      }
    }
    expect(Object.fromEntries(owners.entries())).toEqual({ 9: ['d9-morning'] });
  });

  it('the wharf door belongs to the track: horn-on hides the stopped scene and vice versa', () => {
    const on = play('d8-morning', [], onTrack('horn-on'));
    expect(on.views[0]?.choices.map((c) => c.id)).toEqual([
      'to-stockroom', 'to-wharf-on', 'to-shed',
    ]);
    const off = play('d8-morning', [], onTrack('horn-stopped'));
    expect(off.views[0]?.choices.map((c) => c.id)).toEqual([
      'to-stockroom', 'to-wharf-off', 'to-shed',
    ]);
  });

  it('night 8 exits into day 9; night 9 gotos d10-morning (next cluster)', () => {
    const run = play('d8-morning', [...D8_STOCKROOM], onTrack('horn-on'));
    expect(run.state.sceneId).toBe('d9-morning');
    expect(run.state.day).toBe(9);
    expect(sceneById('d9-night').choices.map((c) => c.goto)).toEqual(['d10-morning']);
  });
});

describe('cue discipline', () => {
  it('day scenes use the assigned existing cues', () => {
    expect(sceneById('d8-stockroom').cue).toBe('dianne-theme');
    expect(sceneById('d8-wharf-on').cue).toBe('horn-close');
    expect(sceneById('d8-wharf-off').cue).toBe('wade-theme');
    expect(sceneById('d8-shed').cue).toBe('sam-theme');
    expect(sceneById('d8-evening').cue).toBe('pub-warm');
    expect(sceneById('d9-clinic').cue).toBe('priya-theme');
    expect(sceneById('d9-ride').cue).toBe('tam-theme');
    expect(sceneById('d9-evening').cue).toBe('pub-warm');
  });

  it('night scenes carry NO scene cue — the track decides by emit', () => {
    expect(sceneById('d8-night').cue).toBeUndefined();
    expect(sceneById('d9-night').cue).toBeUndefined();
  });

  it('horn-on nights emit foghorn-312; horn-stopped nights emit music.stop', () => {
    const on = play('d8-morning', [...D8_SHED.slice(0, 4)], onTrack('horn-on'));
    expect(on.events).toContainEqual({ kind: 'music.cue', cue: 'foghorn-312' });
    expect(on.events.some((e) => e.kind === 'music.stop')).toBe(false);
    const off = play('d8-morning', [...D8_SHED.slice(0, 4)], onTrack('horn-stopped'));
    expect(off.events).toContainEqual({ kind: 'music.stop' });
    expect(off.events.some((e) => e.kind === 'music.cue' && e.cue === 'foghorn-312')).toBe(false);
  });
});

describe('press opportunity #1 — the canoe question', () => {
  const press = ['to-stockroom', 'press-canoe'] as const;

  it('first press sets pressed-dianne to 1 and does not lock the house', () => {
    const run = play('d8-morning', [...press], onTrack('horn-on'));
    expect(run.state.flags['pressed-dianne']).toBe(1);
    expect(run.state.flags['dianne:locks-house']).toBeUndefined();
  });

  it('increments defensively: 1→2, 2→3 (locks the house), 3 stays 3', () => {
    const at1 = play('d8-morning', [...press], onTrack('horn-on', { 'pressed-dianne': 1 }));
    expect(at1.state.flags['pressed-dianne']).toBe(2);
    expect(at1.state.flags['dianne:locks-house']).toBeUndefined();
    const at2 = play('d8-morning', [...press], onTrack('horn-on', { 'pressed-dianne': 2 }));
    expect(at2.state.flags['pressed-dianne']).toBe(3);
    expect(at2.state.flags['dianne:locks-house']).toBe(true);
    const at3 = play('d8-morning', [...press], onTrack('horn-on', { 'pressed-dianne': 3 }));
    expect(at3.state.flags['pressed-dianne']).toBe(3);
    expect(at3.state.flags['dianne:locks-house']).toBeUndefined();
  });

  it('she answers the orchard beach, clear morning — and only when pressed', () => {
    const pressed = play('d8-morning', [...press], onTrack('horn-on'));
    const prose = viewOf(pressed, 'd8-stockroom-2').paragraphs.join('\n');
    expect(prose).toContain('orchard beach');
    expect(prose).toContain('Clear morning');
    const quiet = play('d8-morning', ['to-stockroom', 'keep-lifting'], onTrack('horn-on'));
    expect(viewOf(quiet, 'd8-stockroom-2').paragraphs.join('\n')).not.toContain('orchard beach');
  });

  it('the third telling is already on Sam’s map, initialled to the house', () => {
    const map = rawText(sceneById('d8-shed'));
    expect(map).toContain('@doc:');
    expect(map).toContain('cedar point');
    expect(map).toContain('public launch');
    expect(map).toContain('orchard beach');
    expect(map).toContain('(mum)');
    expect(map).toContain('same canoe. same week.');
  });
});

describe('offsets and the decay engine', () => {
  it('the stockroom lunch feeds you; the night consumes the offset silently', () => {
    const run = play('d8-morning', D8_STOCKROOM.slice(0, 3), onTrack('horn-stopped'));
    expect(run.state.flags['today:fed']).toBe(true);
    const night = play('d8-morning', D8_STOCKROOM.slice(0, 4), onTrack('horn-stopped'));
    expect(night.state.flags['decay:tonight']).toBe('none');
    expect(night.state.stats.flesh).toBe(4); // 3 seed + 1 stockroom, undecayed
    expect(night.state.flags['today:fed']).toBe(false);
    const prose = viewOf(night, 'd8-night').paragraphs.join('\n');
    expect(prose).not.toContain('blankets weigh less');
  });

  it('an unmanaged first night pays FLESH, tells it in the blankets, advances the rotation', () => {
    const run = play('d8-morning', D8_SHED.slice(0, 4), onTrack('horn-stopped'));
    expect(run.state.stats.flesh).toBe(2); // 3 seed − 1
    expect(run.state.flags['decay:tonight']).toBe('flesh');
    expect(run.state.flags['decay:next']).toBe('name');
    expect(viewOf(run, 'd8-night').paragraphs.join('\n')).toContain('blankets weigh less');
  });

  it('night 9 unmanaged pays NAME next — the visible collapse trajectory', () => {
    const run = play(
      'd8-morning',
      [...D8_SHED, 'to-ride', 'say-still-at-it', 'walk-up-from-pullin', 'cross-to-your-unit'],
      onTrack('horn-stopped'),
    );
    expect(run.state.stats.flesh).toBe(2);
    expect(run.state.stats.name).toBe(1); // 2 seed − 1
    expect(run.state.flags['decay:tonight']).toBe('name');
    expect(run.state.flags['decay:next']).toBe('echo');
    expect(viewOf(run, 'd9-night').paragraphs.join('\n')).toContain('birds leaving a wire');
  });

  it('a managed pair of days never decays: fed both days, both nights say nothing', () => {
    const run = play(
      'd8-morning',
      [...D8_STOCKROOM, 'to-walkin', 'finish-the-crates', 'cross-to-your-unit'],
      onTrack('horn-stopped'),
    );
    expect(run.state.stats.flesh).toBe(5); // 3 + stockroom + walk-in, no decay
    expect(run.state.stats.name).toBe(2);
    expect(run.state.flags['decay:tonight']).toBe('none');
    const n8 = viewOf(run, 'd8-night').paragraphs.join('\n');
    const n9 = viewOf(run, 'd9-night').paragraphs.join('\n');
    for (const prose of [n8, n9]) {
      expect(prose).not.toContain('blankets weigh less');
      expect(prose).not.toContain('birds leaving a wire');
      expect(prose).not.toContain('stops taking requests');
    }
  });

  it('horn-on nights never decay, and still clear the offsets', () => {
    const run = play('d8-morning', D8_STOCKROOM.slice(0, 4), onTrack('horn-on'));
    expect(run.state.stats.flesh).toBe(4);
    expect(run.state.flags['decay:tonight']).toBeUndefined();
    expect(run.state.flags['today:fed']).toBe(false);
    expect(viewOf(run, 'd8-night').paragraphs.join('\n')).toContain('That is the arrangement.');
  });

  it('both night scenes spread the canonical NIGHT_DECAY block, by reference', () => {
    for (const id of ['d8-night', 'd9-night'] as const) {
      const onEnter = sceneById(id).onEnter ?? [];
      for (const effect of NIGHT_DECAY) {
        expect(onEnter.includes(effect), `${id} misses a NIGHT_DECAY effect`).toBe(true);
      }
    }
  });

  it('the horn-on wharf offers today:remembered — the fifth-bar memory', () => {
    const run = play(
      'd8-morning',
      ['to-wharf-on', 'hear-the-fifth-bar'],
      onTrack('horn-on'),
    );
    expect(run.state.flags['today:remembered']).toBe(true);
    const id = factIdOf(run.state, 'wade-told-fifth-bar');
    expect(run.state.knownBy.wade).toContain(id);
    expect(viewOf(run, 'd8-wharf-2').paragraphs.join('\n')).toContain('teach brass the hurry');
  });
});

describe('day 8 — the wharf split and the wall', () => {
  it('horn-stopped: the shed is chained and Wade says his one line', () => {
    const text = rawText(sceneById('d8-wharf-off'));
    expect(text).toContain('padlocked');
    expect(text).toContain('“District pays for the light.”');
    const run = play('d8-morning', ['to-wharf-off', 'stand-the-wharf'], onTrack('horn-stopped'));
    const id = factIdOf(run.state, 'stood-with-wade');
    expect(run.state.knownBy.wade).toContain(id);
  });

  it('the wall shows the tripod, the printouts, and the GARBAGE folder', () => {
    const text = rawText(sceneById('d8-shed'));
    expect(text).toContain('tripod');
    expect(text).toContain('GARBAGE');
    expect(text).toContain('not where garbage goes');
  });

  it('asking about the X’s gets the fourth-telling line and the missing X', () => {
    const run = play('d8-morning', ['to-shed', 'ask-the-xs'], onTrack('horn-on'));
    const prose = viewOf(run, 'd8-shed-2').paragraphs.join('\n');
    expect(prose).toContain('Three tellings');
    expect(prose).toContain('Nobody asked him.');
    const id = factIdOf(run.state, 'asked-sams-map');
    expect(run.state.knownBy.sam).toContain(id);
  });

  it('pt2-fix-02: the folder’s clock agrees with Night 6 — eleven files, stopped Tuesday', () => {
    const run = play('d8-morning', ['to-shed', 'ask-the-folder'], onTrack('horn-on'));
    const prose = viewOf(run, 'd8-shed-2').paragraphs.join('\n');
    expect(prose).toContain('Eleven since you walked in — I stopped Tuesday.');
    expect(prose).not.toContain('October');
    expect(prose).not.toContain('August');
  });

  it('pt2-fix-03: the horn keeps the fifth bar now — the cost, rehearsed in passing', () => {
    expect(rawText(sceneById('d8-wharf-on'))).toContain('what the horn has, he only visits');
  });
});

describe('day 8 evening — retellings and detunes', () => {
  it('the stockroom route misses wharf and shed: both motifs detune, twins in prose', () => {
    const run = play('d8-morning', D8_STOCKROOM.slice(0, 3), onTrack('horn-on'));
    const patterns = run.events.flatMap((e) => (e.kind === 'music.detune' ? [e.pattern] : []));
    expect(patterns.sort()).toEqual(['sam', 'wade']);
    const evening = viewOf(run, 'd8-evening').paragraphs.join('\n');
    expect(evening).toContain('a quarter-turn flat'); // wade twin
    expect(evening).toContain('a quarter-tone flat'); // sam twin
    expect(evening).not.toContain('a shade flat'); // dianne attended
    expect(run.events.some((e) => e.kind === 'tell.visual')).toBe(false);
  });

  it('the shed route misses stockroom and wharf: dianne and wade detune', () => {
    const run = play('d8-morning', D8_SHED.slice(0, 3), onTrack('horn-stopped'));
    const patterns = run.events.flatMap((e) => (e.kind === 'music.detune' ? [e.pattern] : []));
    expect(patterns.sort()).toEqual(['dianne', 'wade']);
    const evening = viewOf(run, 'd8-evening').paragraphs.join('\n');
    expect(evening).toContain('a shade flat');
    expect(evening).toContain('force of habit plates two');
  });

  it('the missed wharf retells per track: diesel overheard (on) / the refused truck (stopped)', () => {
    const on = play('d8-morning', D8_STOCKROOM.slice(0, 3), onTrack('horn-on'));
    const onProse = viewOf(on, 'd8-evening').paragraphs.join('\n');
    expect(onProse).toContain('hauling his own diesel');
    expect(onProse).not.toContain('offered the truck');
    const off = play('d8-morning', D8_STOCKROOM.slice(0, 3), onTrack('horn-stopped'));
    const offProse = viewOf(off, 'd8-evening').paragraphs.join('\n');
    expect(offProse).toContain('offered the truck');
    expect(offProse).not.toContain('hauling his own diesel');
  });

  it('the missed shed retelling reaches every attending route', () => {
    const run = play('d8-morning', ['to-wharf-on', 'keep-to-the-machine', 'up-the-boards'], onTrack('horn-on'));
    const evening = viewOf(run, 'd8-evening').paragraphs.join('\n');
    expect(evening).toContain('school library');
    expect(evening).toContain('pays in coins');
  });
});

describe('day 9 — the clinic', () => {
  const toClinic = ['to-clinic'] as const;

  it('renders the intake page with the fields she could not fill', () => {
    const text = rawText(sceneById('d9-clinic'));
    expect(text).toContain('ID: not provided.');
    expect(text).toContain('DOB: not provided.');
    expect(text).toContain('Patient presents as: —');
    expect(text).toContain('district file: no match.');
    expect(text).toContain('pt. not here for exam.');
  });

  it('continues the wrist thread per the Day-3 answer', () => {
    const lied = play('d9-morning', [...toClinic], (s) =>
      applyEffects(s, [{ op: 'fact.add', tag: 'lied-at-intake', witnessedBy: ['priya'] }]).state,
    );
    expect(viewOf(lied, 'd9-clinic').paragraphs.join('\n')).toContain('It rained Tuesday');
    const honest = play('d9-morning', [...toClinic], (s) =>
      applyEffects(s, [{ op: 'fact.add', tag: 'intake-honest-wrist', witnessedBy: ['priya'] }]).state,
    );
    expect(viewOf(honest, 'd9-clinic').paragraphs.join('\n')).toContain('shorter than “unresolved.”');
    const late = play('d9-morning', [...toClinic]);
    expect(viewOf(late, 'd9-clinic').paragraphs.join('\n')).toContain('first proper look');
  });

  it('offers the right honest answer for the route taken', () => {
    const late = play('d9-morning', [...toClinic]);
    const lateIds = viewOf(late, 'd9-clinic').choices.map((c) => c.id);
    expect(lateIds).toContain('first-time-honest-late');
    expect(lateIds).not.toContain('first-time-honest');
    const attended = play('d9-morning', [...toClinic], (s) => ({
      ...s,
      flags: { ...s.flags, 'd3:slot': 'clinic' },
    }));
    const ids = viewOf(attended, 'd9-clinic').choices.map((c) => c.id);
    expect(ids).toContain('first-time-honest');
    expect(ids).not.toContain('first-time-honest-late');
  });

  it('the honest answer earns trust; the room answer is recorded for Day 14', () => {
    const run = play('d9-morning', [...toClinic, 'first-time-honest-late']);
    expect(run.state.flags['d9:room-answer']).toBe('honest');
    const id = factIdOf(run.state, 'truth-told');
    expect(run.state.knownBy.priya).toContain(id);
    expect(content.derived['trust:priya']?.(run.state)).toBe(6);
    expect(viewOf(run, 'd9-clinic-2').paragraphs.join('\n')).toContain('Most people renovate');
  });

  it('improving on the room is a marked lie: STATIC +2, and she files it', () => {
    const run = play('d9-morning', [...toClinic, 'improve-the-room']);
    expect(run.state.staticMeter).toBe(12);
    expect(run.state.flags['d9:room-answer']).toBe('improved');
    const id = factIdOf(run.state, 'lied-priya-room');
    expect(run.state.knownBy.priya).toContain(id);
    expect(viewOf(run, 'd9-clinic-2').paragraphs.join('\n')).toContain('I wasn’t here either');
  });

  it('silence is also written down', () => {
    const run = play('d9-morning', [...toClinic, 'let-the-pen-wait']);
    expect(run.state.flags['d9:room-answer']).toBe('silent');
    expect(viewOf(run, 'd9-clinic-2').paragraphs.join('\n')).toContain('That’s an answer too');
  });
});

describe('day 9 — the walk-in and the ride', () => {
  it('the walk-in feeds you and Moose minds the door, not you', () => {
    const run = play('d9-morning', ['to-walkin']);
    expect(run.state.flags['today:fed']).toBe(true);
    expect(run.state.stats.flesh).toBe(4);
    const prose = viewOf(run, 'd9-walkin').paragraphs.join('\n');
    expect(prose).toContain('Not on you. On the door');
    const id = factIdOf(run.state, 'helped-walkin-d9');
    expect(run.state.knownBy.barb).toContain(id);
  });

  it('the map answer is offered only to someone who saw the wall', () => {
    const cold = play('d9-morning', ['to-ride']);
    expect(viewOf(cold, 'd9-ride').choices.map((c) => c.id)).not.toContain('tell-the-map');
    const saw = play('d9-morning', ['to-ride'], (s) => ({
      ...s,
      flags: { ...s.flags, 'd8:slot': 'shed' },
    }));
    expect(viewOf(saw, 'd9-ride').choices.map((c) => c.id)).toContain('tell-the-map');
    const told = play('d9-morning', ['to-ride', 'tell-the-map'], (s) => ({
      ...s,
      flags: { ...s.flags, 'd8:slot': 'shed' },
    }));
    expect(viewOf(told, 'd9-ride-2').paragraphs.join('\n')).toContain('“Three,” he says.');
  });

  it('lying to Tam about Sam is a marked lie: STATIC +2, Tam holds it', () => {
    const run = play('d9-morning', ['to-ride', 'say-let-go']);
    expect(run.state.staticMeter).toBe(12);
    const id = factIdOf(run.state, 'lied-tam-about-sam');
    expect(run.state.knownBy.tam).toContain(id);
    expect(viewOf(run, 'd9-ride-2').paragraphs.join('\n')).toContain('He doesn’t nod');
  });

  it('silence gets the four-a.m. light put in your keeping', () => {
    const run = play('d9-morning', ['to-ride', 'give-the-mirror-nothing']);
    expect(viewOf(run, 'd9-ride-2').paragraphs.join('\n')).toContain(
      'Somebody should know that besides me.',
    );
  });
});

describe('day 9 evening — retellings and detunes', () => {
  const rideRoute = ['to-ride', 'say-still-at-it', 'walk-up-from-pullin'] as const;

  it('missing the clinic: she waited in the patient chair; priya detunes, twin in prose', () => {
    const run = play('d9-morning', [...rideRoute]);
    const evening = viewOf(run, 'd9-evening').paragraphs.join('\n');
    expect(evening).toContain('held your ten o’clock till eleven');
    expect(evening).toContain('a hair under true'); // pt2-fix-01: night 9's own image
    expect(run.events.some((e) => e.kind === 'music.detune' && e.pattern === 'priya')).toBe(true);
    expect(run.events.some((e) => e.kind === 'tell.visual')).toBe(false);
  });

  it('pt2-fix-01: the trough evening closes early, and briefly', () => {
    const run = play('d9-morning', [...rideRoute]);
    const evening = viewOf(run, 'd9-evening').paragraphs.join('\n');
    expect(evening).toContain('an hour shy of itself');
    expect(evening).not.toContain('a shade flat'); // night 8's image stays night 8's
  });

  it('missing the ride: Tam asked after Sam — and the engine idles under the room', () => {
    const run = play('d9-morning', ['to-walkin', 'finish-the-crates']);
    const evening = viewOf(run, 'd9-evening').paragraphs.join('\n');
    expect(evening).toContain('Asked had Sam been in');
    expect(evening).toContain('idle, road, idle');
    expect(run.events.some((e) => e.kind === 'music.detune' && e.pattern === 'tam')).toBe(true);
  });

  it('missing the walk-in retells warm and carries NO motif (Act 1 precedent)', () => {
    const run = play('d9-morning', [...rideRoute]);
    const evening = viewOf(run, 'd9-evening').paragraphs.join('\n');
    expect(evening).toContain('Moose dined well');
    expect(run.events.some((e) => e.kind === 'music.detune' && e.pattern === 'barb')).toBe(false);
  });
});

describe('days 8–9 dialogue rules', () => {
  it('every (speaker, slot) pair has a zero-condition fallback', () => {
    const pairs = new Set(RULES.map((r) => `${r.speaker}:${r.slot}`));
    for (const pair of pairs) {
      const ok = RULES.some((r) => `${r.speaker}:${r.slot}` === pair && isFallback(r));
      expect(ok, `no fallback for ${pair}`).toBe(true);
    }
  });

  it('the stockroom gossips dianne→barb overnight, and Barb credits Dianne on Day 9', () => {
    const run = play('d8-morning', [...D8_STOCKROOM], onTrack('horn-on'));
    const id = factIdOf(run.state, 'helped-stockroom');
    expect(run.state.knownBy.barb).toContain(id);
    const prose = content
      .realizeProse(sceneById('d9-evening'), run.state)
      .join('\n');
    expect(prose).toContain('Dianne says her back room’s fit for a hard winter');
  });

  it('greeting-d8 tracks the attended slot', () => {
    const run = play('d8-morning', D8_SHED.slice(0, 3), onTrack('horn-on'));
    expect(viewOf(run, 'd8-evening').paragraphs.join('\n')).toContain('Boat shed, was it.');
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
    const seat = /\b(sits|sat|sets|set|puts|put|lays|laid|plants|planted)\s+you\b/i;
    for (const { source, text } of texts) {
      expect(touch.test(text), `NPC-initiated touch in ${source}`).toBe(false);
      expect(seat.test(text), `NPC steering-touch in ${source}`).toBe(false);
    }
  });

  it('never says the name, never growls, never remarks', () => {
    for (const { source, text } of texts) {
      expect(/\bWren\b/.test(text), `name in ${source}`).toBe(false);
      expect(/growl/i.test(text), `growl in ${source}`).toBe(false);
      expect(/\b(strange|odd|uncanny|impossible)\b/i.test(text), `remark in ${source}`).toBe(false);
    }
  });

  it('the title phrase appears exactly once — written, on the intake page', () => {
    const hits = texts.filter(({ text }) => /not\s+here/i.test(text));
    expect(hits.map((h) => h.source)).toEqual(['d9-clinic']);
    expect(hits[0]?.text.startsWith('@doc:')).toBe(true);
    expect((hits[0]?.text.match(/not\s+here/gi) ?? []).length).toBe(1);
    expect(hits[0]?.text).toContain('pt. not here for exam.');
  });

  it('keeps the EBUS departure time off every non-card surface (07:40 pin)', () => {
    for (const { source, text } of texts) {
      expect(text.includes('07:40'), `EBUS time in ${source}`).toBe(false);
    }
  });

  it('no paragraph exceeds the 150-word hard cap', () => {
    const wordCount = (t: string): number =>
      t.split(/\s+/).filter((w) => /[0-9A-Za-z’']/.test(w)).length;
    for (const { source, text } of texts) {
      if (text.startsWith('@doc:') || text.startsWith('@line:')) continue;
      expect(wordCount(text), `over-cap paragraph in ${source}`).toBeLessThanOrEqual(150);
    }
  });
});
