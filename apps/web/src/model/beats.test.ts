import { describe, expect, it } from 'vitest';
import { advance, initialState, type EngineEvent, type WorldState } from '@not-here/engine';
import { buildContent } from '@not-here/story';
import { dayTurned, HORN_CUE, stingerBeat, threeTwelveBeat } from './beats.ts';

const content = buildContent();
const base = initialState(5, 'n1-title');
const horn: EngineEvent[] = [{ kind: 'music.cue', cue: HORN_CUE }];

describe('threeTwelveBeat', () => {
  it('hears the horn wherever the cue lands', () => {
    const scene = content.scenes.get('d2-night');
    expect(threeTwelveBeat(scene, base, horn)).toEqual({ kind: 'horn', day: 1 });
  });

  it('fires from the real engine on Night 1', () => {
    const at312: WorldState = { ...base, sceneId: 'n1-312' };
    const step = advance(content, at312, { kind: 'enter' });
    expect(threeTwelveBeat(content.scenes.get('n1-312'), step.state, step.events)?.kind).toBe('horn');
  });

  it('is the silence on a night scene once the horn is stopped', () => {
    const stopped: WorldState = { ...base, day: 9, flags: { 'horn-stopped': true } };
    expect(threeTwelveBeat(content.scenes.get('d9-night'), stopped, [])).toEqual({ kind: 'silence', day: 9 });
    expect(threeTwelveBeat(content.scenes.get('d15-night-2'), stopped, [])?.kind).toBe('silence');
  });

  it('is nothing on ordinary scenes, cards, or the lot at two in the morning', () => {
    expect(threeTwelveBeat(content.scenes.get('d6-recording'), base, [])).toBeNull();
    expect(threeTwelveBeat(content.scenes.get('act1-end'), base, [])).toBeNull();
    expect(threeTwelveBeat(content.scenes.get('d4-wharf'), base, [])).toBeNull();
    expect(threeTwelveBeat(undefined, base, [])).toBeNull();
  });

  it('every authored night scene is either a horn or a silence night', () => {
    const on = { ...base, flags: { 'horn-on': true } };
    const off = { ...base, flags: { 'horn-stopped': true } };
    for (const scene of content.scenes.values()) {
      if (!/-night(-\d+)?$/.test(scene.id) || scene.slot !== 'night') continue;
      const stepOn = advance(content, { ...on, sceneId: scene.id }, { kind: 'enter' });
      const stepOff = advance(content, { ...off, sceneId: scene.id }, { kind: 'enter' });
      const beatOn = threeTwelveBeat(scene, stepOn.state, stepOn.events);
      const beatOff = threeTwelveBeat(scene, stepOff.state, stepOff.events);
      // Act 1 nights carry the horn cue unconditionally (the choice is Night 7);
      // from Act 2 on, the stopped track is always a silence.
      const day = Number(/^d(\d+)-/.exec(scene.id)?.[1] ?? 1);
      if (beatOn !== null) expect(beatOn.kind).toBe('horn');
      if (day >= 8) expect(beatOff?.kind, scene.id).toBe('silence');
      else expect(beatOff?.kind, scene.id).toBe('horn');
    }
  });
});

describe('stingerBeat / dayTurned', () => {
  it('sees a stinger and a day turning', () => {
    expect(stingerBeat([{ kind: 'music.stinger', cue: 'x' }])).toBe(true);
    expect(stingerBeat(horn)).toBe(false);
    expect(dayTurned({ day: 3 }, { day: 4 })).toBe(true);
    expect(dayTurned({ day: 4 }, { day: 4 })).toBe(false);
  });
});
