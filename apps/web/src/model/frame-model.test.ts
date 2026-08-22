import { describe, expect, it } from 'vitest';
import { initialState } from '@not-here/engine';
import { dateLabel, frameModelFor, headerFor, slotGlyph, snowline } from './frame-model.ts';

describe('the day strip model', () => {
  it('dates Day 1 as Nov 6 and Day 23 as Nov 28, naming no weekday', () => {
    expect(dateLabel(1)).toBe('NOV 6');
    expect(dateLabel(23)).toBe('NOV 28');
    for (let day = 1; day <= 23; day += 1) {
      expect(dateLabel(day)).toMatch(/^NOV \d{1,2}$/);
      expect(dateLabel(day)).not.toMatch(/mon|tue|wed|thu|fri|sat|sun/i);
    }
  });

  it('brings the snow down the hill monotonically, summit to foot', () => {
    expect(snowline(1, 'morning')).toBe(0);
    expect(snowline(23, 'morning')).toBe(1);
    let last = -1;
    for (let day = 1; day <= 23; day += 1) {
      for (const slot of ['morning', 'afternoon', 'evening', 'night'] as const) {
        const y = snowline(day, slot);
        expect(y).toBeGreaterThanOrEqual(last);
        last = y;
      }
    }
    expect(snowline(1, 'night')).toBeGreaterThan(snowline(1, 'evening'));
    expect(snowline(40, 'night')).toBe(1);
  });

  it('keeps the CLI header format and the slot glyphs', () => {
    expect(headerFor(2, 'morning')).toBe('DAY 2 — MORNING');
    expect(slotGlyph('night')).toBe('●');
    expect(slotGlyph('morning')).toBe('○');
  });

  it('assembles the frame from a state', () => {
    const frame = frameModelFor(initialState(1, 'n1-title'), 'night');
    expect(frame).toMatchObject({ day: 1, slot: 'night', header: 'DAY 1 — NIGHT', dateLabel: 'NOV 6', glyph: '●', bookUnlocked: false });
    expect(frame.snowline).toBeGreaterThan(0);
  });
});
