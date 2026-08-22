import { describe, expect, it } from 'vitest';
import { buildContent } from '@not-here/story';
import { ACT_BOUNDARY_ENDINGS } from '../save.ts';
import { cardKindFor, isCardScene, PLACES, placeFor, sceneToken, type PlaceId } from './places.ts';

const content = buildContent();
const scenes = [...content.scenes.values()];

const place = (id: string): PlaceId => {
  const scene = content.scenes.get(id);
  if (scene === undefined) throw new Error(`no such scene ${id}`);
  return placeFor(scene);
};

describe('sceneToken', () => {
  it('strips the day prefix and the numeric suffix', () => {
    expect(sceneToken('d4-wharf-2')).toBe('wharf');
    expect(sceneToken('n1-interview-3')).toBe('interview');
    expect(sceneToken('act1-end')).toBe('end');
    expect(sceneToken('d10-house-tin')).toBe('house-tin');
    expect(sceneToken('n1-312')).toBe('312');
  });
});

describe('placeFor — the lint over every authored scene', () => {
  it('resolves every scene to a known place, never ambient', () => {
    const unresolved = scenes.filter((s) => placeFor(s) === 'ambient').map((s) => s.id);
    expect(unresolved).toEqual([]);
    for (const s of scenes) expect(PLACES).toContain(placeFor(s));
  });

  it('pins the hero places', () => {
    for (const id of ['d4-wharf', 'd4-wharf-2', 'd8-wharf-on', 'd8-wharf-off', 'd18-wharf', 'd20-wharf', 'd22-wharf', 'd7-walk', 'd22-open-2']) {
      expect(place(id), id).toBe('wharf');
    }
    for (const id of ['d7-hornroom', 'd7-sixth-question', 'd7-silence', 'd7-after', 'd22-crown']) {
      expect(place(id), id).toBe('hornroom');
    }
    for (const id of [
      'n1-diner', 'n1-meal', 'n1-moose', 'n1-interview-1', 'n1-interview-5', 'd2-morning', 'd2-evening',
      'd4-errand', 'd9-walkin', 'd11-warning', 'd12-counter', 'd18-kettle', 'd21-kettle', 'd21-lamp', 'd22-dianne',
    ]) {
      expect(place(id), id).toBe('kettle');
    }
  });

  it('knows the rooms the ids lie about', () => {
    expect(place('d11-albums')).toBe('general'); // the shelf behind Dianne's till, not Wren's room
    expect(place('d6-recording')).toBe('kettle'); // the lot at two in the morning
    expect(place('d15-supper')).toBe('house');
    expect(place('d17-burn')).toBe('house');
    expect(place('d13-night-exiled')).toBe('wharf');
    expect(place('d12-night')).toBe('clinic');
    expect(place('n1-312')).toBe('unit');
    expect(place('n1-room')).toBe('unit');
  });

  it('covers the coverage floor for the two hero stages', () => {
    const count = (p: PlaceId): number => scenes.filter((s) => placeFor(s) === p).length;
    expect(count('wharf')).toBeGreaterThanOrEqual(12);
    expect(count('kettle')).toBeGreaterThanOrEqual(40);
  });
});

describe('cards', () => {
  it('the structural cards are exactly the slotless title-cue scenes', () => {
    const cards = scenes.filter(isCardScene).map((s) => s.id).sort();
    expect(cards).toEqual(['act1-end', 'act2-end', 'd20-end', 'd21-end', 'd22-end', 'n1-title']);
  });

  it('classifies prologue / act / held / ending', () => {
    const kind = (id: string) => {
      const scene = content.scenes.get(id);
      if (scene === undefined) throw new Error(id);
      return cardKindFor(scene, ACT_BOUNDARY_ENDINGS);
    };
    expect(kind('n1-title')).toBe('prologue');
    expect(kind('act1-end')).toBe('act');
    expect(kind('act2-end')).toBe('act');
    expect(kind('d22-end')).toBe('held');
    expect(kind('act2-ash-2')).toBe('ending');
    expect(kind('d4-wharf')).toBeNull();
    expect(kind('d17-reveal')).toBeNull(); // title cue, but a slotted night scene
  });
});
