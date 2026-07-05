import { initialState, STATS, type WorldState } from '@not-here/engine';
import { observationFor, staticLineFor } from '@not-here/story';
import { describe, expect, it } from 'vitest';
import { renderLedger } from './ledger.ts';
import { stripAnsi } from './render.ts';

const withStats = (
  stats: Partial<Record<(typeof STATS)[number], number>>,
  staticMeter = 10,
): WorldState => {
  const base = initialState(1971, 'n1-title');
  return { ...base, stats: { ...base.stats, ...stats }, staticMeter };
};

describe('renderLedger', () => {
  it('shows no numbers outside the handwritten register line', () => {
    const out = stripAnsi(renderLedger(withStats({ flesh: 7, echo: 5 }, 45)));
    const outsideRegister = out
      .split('\n')
      .filter((line) => !line.includes('supper, tab'))
      .join('\n');
    expect(outsideRegister).not.toMatch(/\d/);
  });

  it('includes one entry per stat plus the static line (shared source)', () => {
    const state = withStats({});
    const out = stripAnsi(renderLedger(state));
    for (const stat of STATS) {
      expect(out).toContain(observationFor(stat, state.stats[stat]));
    }
    expect(out).toContain(staticLineFor(state.staticMeter));
  });

  it('quotes a night-one answer verbatim once it is on the log', () => {
    const base = withStats({});
    const state: WorldState = {
      ...base,
      choiceLog: [
        { scene: 'n1-interview-2', choice: 'q2-two-heaped', day: 1, slot: 'night' },
      ],
    };
    const out = stripAnsi(renderLedger(state));
    expect(out).toContain('what you told her, night one');
    expect(out).toContain('Two. Heaped.');
    expect(out).not.toContain('q2-two-heaped');
  });

  it('keeps the margins section silent until Barb knows something', () => {
    expect(stripAnsi(renderLedger(withStats({})))).not.toContain(
      'margins, other hands',
    );
  });
});
