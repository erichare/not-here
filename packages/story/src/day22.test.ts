/**
 * Day 22 content tests (design/act3-plan.md §Day 22 — Nov 27: The Last
 * Supper). Currently scoped to the night-22 ensemble wiring: the chord
 * re-assert that lets the act3-ensemble mixer re-form the night's texture
 * at 3:12 (the d20-night shape, spread verbatim across the act's plain
 * night doors). The full Day-22 fleet suite lands with the endings phase.
 *
 * NOTE: these tests assume content.ts has registered DAY22_SCENES and the
 * days-20-23 dialogue rules.
 */

import { describe, expect, it } from 'vitest';
import {
  advance,
  initialState,
  type EngineEvent,
  type SceneId,
  type SceneView,
  type WorldState,
} from '@not-here/engine';
import { buildContent } from './content.ts';

const content = buildContent();

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

const withFlags =
  (flags: Readonly<Record<string, boolean | number | string>>) =>
  (s: WorldState): WorldState => ({ ...s, flags: { ...s.flags, ...flags } });

describe('night 22 — the ensemble re-forms at 3:12', () => {
  const withChord =
    (chord: number, flags: Readonly<Record<string, boolean>>) =>
    (s: WorldState): WorldState => ({ ...withFlags(flags)(s), chord });

  it('horn on, fragments banked: the count re-asserts AFTER the horn cue', () => {
    const run = play('d22-night', [], withChord(5, { 'horn-on': true }));
    const cueIdx = run.events.findIndex(
      (e) => e.kind === 'music.cue' && e.cue === 'foghorn-312',
    );
    const chordIdx = run.events.findIndex((e) => e.kind === 'music.chord');
    expect(cueIdx).toBeGreaterThanOrEqual(0);
    // The ensemble must be the final audible state: the mixers let a later
    // music.chord stand the solo cue down, never the reverse.
    expect(chordIdx).toBeGreaterThan(cueIdx);
    expect(run.events[chordIdx]).toEqual({ kind: 'music.chord', fragments: 5 });
    expect(run.state.chord).toBe(5); // the re-assert never moves the count
  });

  it('horn on, nothing banked: the night keeps the solo cue grammar', () => {
    const run = play('d22-night', [], withFlags({ 'horn-on': true }));
    expect(run.events).toContainEqual({ kind: 'music.cue', cue: 'foghorn-312' });
    expect(run.events.filter((e) => e.kind === 'music.chord')).toEqual([]);
  });

  it('horn stopped: the silence is kept even with fragments banked', () => {
    const run = play('d22-night', [], withChord(6, { 'horn-stopped': true }));
    expect(run.events).toContainEqual({ kind: 'music.stop' });
    expect(run.events.filter((e) => e.kind === 'music.chord')).toEqual([]);
  });
});
