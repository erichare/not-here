import { describe, expect, it } from 'vitest';
import { advance, initialState, type WorldState } from '@not-here/engine';
import { buildContent, OPENING_SCENE } from '@not-here/story';
import { ACT_BOUNDARY_ENDINGS } from '../save.ts';
import { deriveSceneFrame } from './derive.ts';
import { returnedFragments } from './stage-model.ts';

const content = buildContent();

const frameAt = (state: WorldState) => {
  const step = advance(content, state, { kind: 'enter' });
  return deriveSceneFrame({
    content,
    state: step.state,
    events: step.events,
    ensemble: null,
    heldEndings: ACT_BOUNDARY_ENDINGS,
    choices: step.view.choices,
  });
};

describe('deriveSceneFrame', () => {
  it('opens on the prologue card, whole, clear, with no beat', () => {
    const frame = frameAt(initialState(1, OPENING_SCENE));
    expect(frame.card).toBe('prologue');
    expect(frame.stage.place).toBe('card');
    expect(frame.presence.tier).toBe('whole');
    expect(frame.rot.tier).toBe('clear');
    expect(frame.rotPlan.attractIndex).toBeNull();
    expect(frame.beat).toBeNull();
    expect(frame.sketches).toEqual([]);
  });

  it('hears the horn at n1-312 and shows nobody', () => {
    const frame = frameAt({ ...initialState(2, OPENING_SCENE), sceneId: 'n1-312' });
    expect(frame.beat?.kind).toBe('horn');
    expect(frame.stage.place).toBe('unit');
    expect(frame.cast.present).toEqual([]);
    expect(frame.frame.header).toBe('DAY 1 — NIGHT');
  });

  it('takes the ending scenes out of the slot grade and marks the held place', () => {
    const held = frameAt({ ...initialState(3, OPENING_SCENE), sceneId: 'd22-end', day: 22 });
    expect(held.card).toBe('held');
    expect(held.stage.slot).toBe('none');
    expect(held.stage.place).toBe('card');
  });

  it('carries the horn state and the returned fragments', () => {
    const stopped = frameAt({ ...initialState(4, OPENING_SCENE), sceneId: 'd9-night', day: 9, flags: { 'horn-stopped': true } });
    expect(stopped.stage.horn).toBe('stopped');
    expect(stopped.beat?.kind).toBe('silence');
    expect(returnedFragments({ fragments: { sam: 1, dianne: 0.5, wade: 0 } })).toEqual(['sam', 'dianne']);
    expect(returnedFragments(null)).toEqual([]);
  });
});
