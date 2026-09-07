import { describe, expect, it } from 'vitest';
import { ACOUSTIC_ENSEMBLE, PRODUCTION_SCORES, PRODUCTION_ONE_SHOTS } from './production.ts';
import { CUE_META } from '../src/captions.ts';
import { renderSong } from '../src/render.ts';

describe('expanded acoustic score', () => {
  it('leaves the sixth bar empty in every acquired fragment', () => {
    expect(ACOUSTIC_ENSEMBLE.map(s => s.id.replace('v2-ensemble-', ''))).toEqual(['sea', 'sam', 'dianne', 'barb', 'priya', 'tam', 'wade']);
    for (const song of ACOUSTIC_ENSEMBLE) {
      expect(song.lengthBeats).toBe(36); expect(song.bpm).toBe(144);
      for (const pattern of song.patterns) for (const note of pattern.notes) expect(note.t + note.dur, song.id).toBeLessThanOrEqual(30);
    }
  });
  it('reveals and endings finish once, with an accessible caption for every cue', () => {
    for (const song of PRODUCTION_SCORES) {
      expect(CUE_META[song.id]?.caption.length, song.id).toBeGreaterThan(15);
      expect(CUE_META[song.id]?.loop, song.id).toBe(!PRODUCTION_ONE_SHOTS.has(song.id));
      for (const pattern of song.patterns) for (const note of pattern.notes) {
        expect(note.t).toBeGreaterThanOrEqual(0); expect(note.t + note.dur, song.id).toBeLessThanOrEqual(song.lengthBeats);
      }
    }
  });
  it('quiet and dissonant arrangements render finite sound and leave a silent tail', () => {
    for (const id of ['v2-clinic', 'v2-arrival', 'v2-wren-again']) {
      const buffer = renderSong(PRODUCTION_SCORES.find(s => s.id === id)!, 8000);
      expect(buffer.left.some(x => Math.abs(x) > .05)).toBe(true);
      expect(buffer.left.every(x => Number.isFinite(x) && Math.abs(x) < 1)).toBe(true);
      expect(buffer.left.slice(-800).every(x => Math.abs(x) < .001)).toBe(true);
    }
  });
});
