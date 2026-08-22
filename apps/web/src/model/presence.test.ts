import { describe, expect, it } from 'vitest';
import { initialState } from '@not-here/engine';
import { presenceFor } from './presence.ts';

const base = initialState(1, 'n1-title');
const withStats = (flesh: number, name: number, echo: number, stopped = true) => ({
  ...base,
  stats: { ...base.stats, flesh, name, echo },
  flags: stopped ? { 'horn-stopped': true } : {},
});

describe('presenceFor', () => {
  it('is whole on the opening', () => {
    expect(presenceFor(base)).toEqual({ fade: 0, value: 1, tier: 'whole' });
  });

  it('never fades while the horn plays, whatever the stats', () => {
    expect(presenceFor(withStats(0, 0, 0, false)).tier).toBe('whole');
  });

  it('fades monotonically with the presence stats once the horn is stopped', () => {
    let last = -1;
    for (let sum = 0; sum <= 10; sum += 1) {
      const fade = presenceFor(withStats(sum, 0, 0)).fade;
      expect(fade).toBeGreaterThanOrEqual(0);
      expect(fade).toBeLessThanOrEqual(1);
      if (last >= 0) expect(fade).toBeLessThanOrEqual(last);
      last = fade;
    }
  });

  it('is still whole at the opening sum, thinning below it, gone at nothing', () => {
    expect(presenceFor(withStats(3, 2, 2)).tier).toBe('whole');
    expect(presenceFor(withStats(2, 2, 1)).tier).toBe('thinning');
    expect(presenceFor(withStats(1, 1, 1)).tier).toBe('faint');
    expect(presenceFor(withStats(0, 0, 0))).toEqual({ fade: 1, value: 0, tier: 'gone' });
  });
});
