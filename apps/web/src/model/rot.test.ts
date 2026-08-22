import { describe, expect, it } from 'vitest';
import {
  ATTRACTOR_DAY,
  ATTRACTOR_METER,
  attractorTail,
  ROT_GLYPHS,
  rotLabel,
  rotPlan,
  rotText,
  WALKING_RATE,
} from './rot.ts';

const LABELS = [
  'Look at the water first.',
  'Walk toward the lights.',
  'Ask about the light first, and let the real question surface on its own.',
  'Press her about the disappearance.',
  'Leave him to the light.',
  'Tell her you remember the lullaby.',
];

describe('rotLabel', () => {
  it('is deterministic in (label, meter, seed)', () => {
    for (const label of LABELS) {
      expect(rotLabel(label, 70, 42)).toEqual(rotLabel(label, 70, 42));
      expect(rotLabel(label, 70, 42, { attract: true })).toEqual(rotLabel(label, 70, 42, { attract: true }));
    }
  });

  it('leaves clear and inked labels untouched', () => {
    for (const meter of [0, 15, 16, 29]) {
      for (const label of LABELS) expect(rotLabel(label, meter, 9)).toEqual([{ kind: 'plain', text: label }]);
    }
  });

  it('hissing spaces one word and substitutes nothing', () => {
    for (const label of LABELS) {
      const segments = rotLabel(label, 45, 3);
      expect(rotText(segments)).toBe(label);
      expect(segments.some((s) => s.kind === 'sub')).toBe(false);
      expect(segments.filter((s) => s.kind === 'spaced').length).toBeLessThanOrEqual(1);
    }
  });

  it('walking substitutes at a bounded rate and keeps the length', () => {
    let eligible = 0;
    let substituted = 0;
    for (let seed = 0; seed < 200; seed += 1) {
      for (const label of LABELS) {
        const segments = rotLabel(label, 80, seed);
        expect(rotText(segments).length).toBe(label.length);
        for (const ch of label) if (ROT_GLYPHS[ch.toLowerCase()] !== undefined) eligible += 1;
        substituted += segments.filter((s) => s.kind === 'sub').reduce((n, s) => n + s.text.length, 0);
      }
    }
    const rate = substituted / eligible;
    expect(rate).toBeGreaterThan(WALKING_RATE * 0.6);
    expect(rate).toBeLessThan(WALKING_RATE * 1.4);
  });

  it('the attractor only lands when asked, only at walking, and writes the tail spaced', () => {
    expect(rotLabel(LABELS[2] as string, 45, 1, { attract: true }).some((s) => s.kind === 'attract')).toBe(false);
    const segments = rotLabel(LABELS[2] as string, 80, 1, { attract: true });
    const last = segments[segments.length - 1];
    expect(last?.kind).toBe('attract');
    expect(last?.text).toBe('n o t   h e r e');
    const short = rotLabel('Sit down.', 80, 1, { attract: true });
    expect(short[short.length - 1]?.text).toBe('e r e');
  });

  it('never renders the contiguous title phrase', () => {
    for (let seed = 0; seed < 50; seed += 1) {
      for (const label of [...LABELS, 'A long enough line that the whole title could fit inside its tail.']) {
        expect(rotText(rotLabel(label, 90, seed, { attract: true }))).not.toMatch(/not\s+here/i);
      }
    }
    expect(attractorTail(7)).toBe('n o t   h e r e');
    expect(attractorTail(4)).toBe('h e r e');
    expect(attractorTail(3)).toBe('e r e');
    expect(attractorTail(0)).toBe('');
  });
});

describe('rotPlan', () => {
  const choices = [
    { label: 'One.', major: false, locked: false },
    { label: 'Two.', major: true, locked: false },
    { label: 'Three.', major: false, locked: true },
    { label: 'Four.', major: false, locked: false },
  ];

  it('stays quiet below the threshold, before Act 3, or outside walking', () => {
    expect(rotPlan(choices, ATTRACTOR_METER - 1, 21, 1).attractIndex).toBeNull();
    expect(rotPlan(choices, 90, ATTRACTOR_DAY - 1, 1).attractIndex).toBeNull();
    expect(rotPlan(choices, 59, 21, 1).attractIndex).toBeNull();
  });

  it('picks at most one label, never a major, never a locked line', () => {
    for (let seed = 0; seed < 40; seed += 1) {
      const index = rotPlan(choices, 90, 21, seed).attractIndex;
      expect(index === 0 || index === 3).toBe(true);
    }
  });

  it('never decays the only open choice', () => {
    const lone = [{ label: 'Go.', major: false, locked: false }, { label: 'Stay.', major: false, locked: true }];
    expect(rotPlan(lone, 90, 21, 4).attractIndex).toBeNull();
  });

  it('is deterministic in the seed', () => {
    expect(rotPlan(choices, 90, 21, 7)).toEqual(rotPlan(choices, 90, 21, 7));
  });
});
