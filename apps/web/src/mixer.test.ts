import { ACT3_ENSEMBLE_LAYER_GAINS, ACT3_FRAGMENT_ORDER } from '@not-here/music';
import { describe, expect, it } from 'vitest';
import { createEnsembleMixer } from './mixer.ts';

describe('createEnsembleMixer', () => {
  it('starts silent: no fragments, no bed', () => {
    const snap = createEnsembleMixer().snapshot();
    expect(snap.active).toBe(false);
    expect(snap.fragments).toEqual({});
    for (const id of ['sea', ...ACT3_FRAGMENT_ORDER]) {
      expect(snap.mix[id as keyof typeof snap.mix]).toBe(0);
    }
  });

  it('raises one fragment on music.layer and implies the sea bed', () => {
    const mixer = createEnsembleMixer();
    mixer.layer('sam', 1);
    const snap = mixer.snapshot();
    expect(snap.active).toBe(true);
    expect(snap.fragments.sam).toBe(1);
    expect(snap.mix.sam).toBe(ACT3_ENSEMBLE_LAYER_GAINS.sam);
    expect(snap.mix.sea).toBe(ACT3_ENSEMBLE_LAYER_GAINS.sea);
    expect(snap.mix.dianne).toBe(0);
  });

  it('scales the mix by authored gain × target', () => {
    const mixer = createEnsembleMixer();
    mixer.layer('barb', 0.5);
    const snap = mixer.snapshot();
    expect(snap.mix.barb).toBeCloseTo(ACT3_ENSEMBLE_LAYER_GAINS.barb * 0.5);
  });

  it('clamps layer gains into 0..1', () => {
    const mixer = createEnsembleMixer();
    mixer.layer('tam', 7);
    expect(mixer.snapshot().fragments.tam).toBe(1);
    mixer.layer('tam', -3);
    expect(mixer.snapshot().fragments.tam).toBe(0);
    expect(mixer.snapshot().active).toBe(false);
  });

  it('silences the bed when the last fragment drops', () => {
    const mixer = createEnsembleMixer();
    mixer.layer('sam', 1);
    mixer.layer('sam', 0);
    const snap = mixer.snapshot();
    expect(snap.active).toBe(false);
    expect(snap.mix.sea).toBe(0);
  });

  it('ignores unknown patterns — including the day-15 lullaby', () => {
    const mixer = createEnsembleMixer();
    mixer.layer('lullaby', 1);
    mixer.layer('debug-pattern', 1);
    const snap = mixer.snapshot();
    expect(snap.active).toBe(false);
    expect(snap.fragments).toEqual({});
  });

  it('refuses direct sea-layer writes — the bed is implied, never set', () => {
    const mixer = createEnsembleMixer();
    mixer.layer('sea', 1);
    expect(mixer.snapshot().active).toBe(false);
    expect(mixer.snapshot().mix.sea).toBe(0);
  });

  it('music.chord raises the first n cascade layers and lowers the rest', () => {
    const mixer = createEnsembleMixer();
    mixer.layer('wade', 1); // out-of-order raise; chord must override
    mixer.chord(2);
    const snap = mixer.snapshot();
    expect(snap.fragments).toEqual({
      sam: 1,
      dianne: 1,
      barb: 0,
      priya: 0,
      tam: 0,
      wade: 0,
    });
    expect(snap.active).toBe(true);
    expect(snap.mix.wade).toBe(0);
  });

  it('music.chord 0 empties the night', () => {
    const mixer = createEnsembleMixer();
    mixer.chord(6);
    mixer.chord(0);
    const snap = mixer.snapshot();
    expect(snap.active).toBe(false);
    expect(snap.mix.sea).toBe(0);
  });

  it('clamps chord counts into 0..6', () => {
    const mixer = createEnsembleMixer();
    mixer.chord(42);
    expect(Object.values(mixer.snapshot().fragments)).toEqual([1, 1, 1, 1, 1, 1]);
    mixer.chord(-1);
    expect(mixer.snapshot().active).toBe(false);
  });

  it('reset returns to silence', () => {
    const mixer = createEnsembleMixer();
    mixer.chord(4);
    mixer.reset();
    const snap = mixer.snapshot();
    expect(snap.active).toBe(false);
    expect(snap.fragments).toEqual({});
  });

  it('knows its own patterns', () => {
    const mixer = createEnsembleMixer();
    for (const id of ['sea', ...ACT3_FRAGMENT_ORDER]) {
      expect(mixer.isEnsemblePattern(id)).toBe(true);
    }
    expect(mixer.isEnsemblePattern('lullaby')).toBe(false);
    expect(mixer.isEnsemblePattern('')).toBe(false);
  });
});
