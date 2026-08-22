import { describe, expect, it } from 'vitest';
import * as copy from './copy.ts';

const strings = (value: unknown, out: string[] = []): string[] => {
  if (typeof value === 'string') out.push(value);
  else if (value !== null && typeof value === 'object') for (const v of Object.values(value)) strings(v, out);
  return out;
};

const ALL = strings(copy);
const SLUG = /\b(d\d{1,2}|n1|act\d)-[a-z]/;

describe('UI copy discipline', () => {
  it('exports something to check', () => {
    expect(ALL.length).toBeGreaterThan(20);
  });

  it('never writes a number except the hour of the horn', () => {
    for (const s of ALL) {
      if (s === copy.INTERSTITIAL.mark) continue;
      expect(s, s).not.toMatch(/\d/);
    }
  });

  it('never leaks a scene id', () => {
    for (const s of ALL) expect(s, s).not.toMatch(SLUG);
  });

  it('never says the title outside the wordmark', () => {
    for (const s of ALL) {
      if (s === copy.WORDMARK) continue;
      expect(s, s).not.toMatch(/not\s+here/i);
    }
  });
});
