import { describe, expect, it } from 'vitest';
import {
  ACT3_ENSEMBLE_BEATS,
  ACT3_ENSEMBLE_BPM,
  ACT3_ENSEMBLE_LAYER_GAINS,
  ACT3_ENSEMBLE_LAYERS,
  ACT3_FRAGMENT_ORDER,
  act3EnsembleAtChord,
  act3EnsembleFull,
  type Act3LayerId,
} from './act3-ensemble.ts';
import {
  CHORDS_BARB,
  FRAGMENT_DIANNE,
  FRAGMENT_PRIYA,
  FRAGMENT_SAM,
  FRAGMENT_WADE,
} from './foghorn-song.ts';

const layerById = (id: Act3LayerId) => {
  const song = ACT3_ENSEMBLE_LAYERS.find((layer) => layer.id === `act3-ensemble-${id}`);
  expect(song, `missing layer '${id}'`).toBeDefined();
  return song!;
};

describe('act3-ensemble score', () => {
  it('orders the fragments as the confession cascade', () => {
    expect(ACT3_FRAGMENT_ORDER).toEqual([
      'sam',
      'dianne',
      'barb',
      'priya',
      'tam',
      'wade',
    ]);
  });

  it('ships one bed plus six fragment layers, all loop-synced', () => {
    expect(ACT3_ENSEMBLE_LAYERS.map((song) => song.id)).toEqual([
      'act3-ensemble-sea',
      'act3-ensemble-sam',
      'act3-ensemble-dianne',
      'act3-ensemble-barb',
      'act3-ensemble-priya',
      'act3-ensemble-tam',
      'act3-ensemble-wade',
    ]);
    for (const song of ACT3_ENSEMBLE_LAYERS) {
      expect(song.bpm).toBe(ACT3_ENSEMBLE_BPM);
      expect(song.lengthBeats).toBe(ACT3_ENSEMBLE_BEATS);
    }
  });

  it('reuses the authored fragment note material per layer', () => {
    expect(layerById('sam').patterns[0]?.notes).toBe(FRAGMENT_SAM);
    expect(layerById('dianne').patterns[0]?.notes).toBe(FRAGMENT_DIANNE);
    expect(layerById('barb').patterns[0]?.notes).toBe(CHORDS_BARB);
    expect(layerById('priya').patterns[0]?.notes).toBe(FRAGMENT_PRIYA);
    expect(layerById('wade').patterns[0]?.notes).toBe(FRAGMENT_WADE);
  });

  it('gives wade the low drone the song stands on', () => {
    const wade = layerById('wade');
    expect(wade.patterns).toHaveLength(2);
    const drone = wade.patterns.find((p) => p.id === 'wade-drone');
    expect(drone).toBeDefined();
    expect(drone?.notes).toHaveLength(1);
    expect(drone?.notes[0]?.pitch).toBe(38); // D2
    expect(drone?.notes[0]?.dur).toBe(ACT3_ENSEMBLE_BEATS);
  });

  it('keeps tam pitchless — the pulse has no melody', () => {
    const tam = layerById('tam');
    expect(tam.patterns).toHaveLength(1);
    for (const note of tam.patterns[0]?.notes ?? []) {
      expect(note.pitch).toBe(0);
    }
  });

  it('exposes an authored gain for every layer', () => {
    const ids: Act3LayerId[] = ['sea', ...ACT3_FRAGMENT_ORDER];
    for (const id of ids) {
      expect(ACT3_ENSEMBLE_LAYER_GAINS[id], `no gain for '${id}'`).toBeGreaterThan(0);
    }
  });

  it('chord 0 is the sea alone; chord 6 is everyone', () => {
    const chord0 = act3EnsembleAtChord(0);
    expect(chord0.patterns.map((p) => p.id)).toEqual(['sea']);

    const chord6 = act3EnsembleAtChord(6);
    const patternIds = chord6.patterns.map((p) => p.id);
    expect(patternIds).toContain('sea');
    expect(patternIds).toContain('sam-run');
    expect(patternIds).toContain('dianne-lullaby');
    expect(patternIds).toContain('barb-chords');
    expect(patternIds).toContain('priya-turn');
    expect(patternIds).toContain('tam-pulse');
    expect(patternIds).toContain('wade-bar3');
    expect(patternIds).toContain('wade-drone');
  });

  it('walks the cascade one fragment per chord step', () => {
    expect(act3EnsembleAtChord(1).patterns.map((p) => p.id)).toEqual(['sea', 'sam-run']);
    expect(act3EnsembleAtChord(3).patterns.map((p) => p.id)).toEqual([
      'sea',
      'sam-run',
      'dianne-lullaby',
      'barb-chords',
    ]);
  });

  it('clamps out-of-range chord counts', () => {
    expect(act3EnsembleAtChord(-2).patterns.map((p) => p.id)).toEqual(['sea']);
    expect(act3EnsembleAtChord(99).patterns.map((p) => p.id)).toEqual(
      act3EnsembleAtChord(6).patterns.map((p) => p.id),
    );
  });

  it('names the full mix act3-ensemble for the audition WAV', () => {
    expect(act3EnsembleFull.id).toBe('act3-ensemble');
    expect(act3EnsembleFull.patterns).toEqual(act3EnsembleAtChord(6).patterns);
  });
});
