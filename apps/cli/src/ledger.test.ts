import { initialState, STATS, type WorldState } from '@not-here/engine';
import { describe, expect, it } from 'vitest';
import { observationFor, renderLedger, staticLine } from './ledger.ts';
import { stripAnsi } from './render.ts';

const withStats = (
  stats: Partial<Record<(typeof STATS)[number], number>>,
  staticMeter = 10,
): WorldState => {
  const base = initialState(1971, 'n1-title');
  return { ...base, stats: { ...base.stats, ...stats }, staticMeter };
};

describe('observationFor', () => {
  it('has three distinct tiers for every stat', () => {
    for (const stat of STATS) {
      const low = observationFor(stat, 0);
      const mid = observationFor(stat, 3);
      const high = observationFor(stat, 5);
      expect(new Set([low, mid, high]).size).toBe(3);
    }
  });

  it('tier boundaries sit at 3 and 5', () => {
    expect(observationFor('flesh', 2)).toBe(observationFor('flesh', 0));
    expect(observationFor('flesh', 4)).toBe(observationFor('flesh', 3));
    expect(observationFor('flesh', 10)).toBe(observationFor('flesh', 5));
  });

  it('writes the specified signature lines', () => {
    expect(observationFor('flesh', 5)).toContain('coffin handle');
    expect(observationFor('echo', 5)).toContain('remembers more than she was told');
    expect(observationFor('name', 0)).toContain('ink dries pale');
  });
});

describe('staticLine', () => {
  it('rises with the fog', () => {
    const calm = staticLine(0);
    const mid = staticLine(30);
    const loud = staticLine(60);
    expect(new Set([calm, mid, loud]).size).toBe(3);
  });
});

describe('renderLedger', () => {
  it('shows no numbers anywhere (diegetic invariant)', () => {
    const out = stripAnsi(renderLedger(withStats({ flesh: 7, echo: 5 }, 45)));
    expect(out).not.toMatch(/\d/);
  });

  it('includes one entry per stat plus the static line', () => {
    const out = stripAnsi(renderLedger(withStats({})));
    for (const stat of STATS) {
      expect(out).toContain(observationFor(stat, withStats({}).stats[stat]));
    }
    expect(out).toContain(staticLine(10));
  });
});
