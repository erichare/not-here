import { describe, expect, it } from 'vitest';
import {
  degradeMargin,
  italic,
  renderChoices,
  renderEnding,
  renderHeader,
  renderParagraphs,
  rotRateFor,
  stripAnsi,
  wrap,
} from './render.ts';

describe('wrap', () => {
  it('wraps at the given width without splitting words', () => {
    const lines = wrap('the fog stands in the lane at night thick at the bends', 20);
    expect(lines.every((line) => line.length <= 20)).toBe(true);
    expect(lines.join(' ')).toBe(
      'the fog stands in the lane at night thick at the bends',
    );
  });

  it('keeps an over-long word on its own line', () => {
    expect(wrap('a extraordinarily-long-word b', 10)).toEqual([
      'a',
      'extraordinarily-long-word',
      'b',
    ]);
  });

  it('returns no lines for blank text', () => {
    expect(wrap('   ', 10)).toEqual([]);
  });
});

describe('renderHeader', () => {
  it('right-aligns DAY N — SLOT at the wrap width', () => {
    const plain = stripAnsi(renderHeader(2, 'morning', 40));
    expect(plain).toHaveLength(40);
    expect(plain.trimStart()).toBe('DAY 2 — MORNING');
  });
});

describe('renderParagraphs', () => {
  it('separates paragraphs with one blank line', () => {
    const out = stripAnsi(renderParagraphs(['one', 'two'], 40));
    expect(out).toBe('one\n\ntwo');
  });
});

describe('renderChoices', () => {
  const choices = [
    { id: 'a', label: 'Eat.', locked: false },
    { id: 'b', label: 'The word you cannot afford.', locked: true },
    { id: 'c', label: 'Let him be.', locked: false },
  ];

  it('numbers only open choices, in order', () => {
    const { text, openIds } = renderChoices(choices);
    const plain = stripAnsi(text);
    expect(openIds).toEqual(['a', 'c']);
    expect(plain).toContain('1. Eat.');
    expect(plain).toContain('2. Let him be.');
  });

  it('marks locked choices with a dot prefix and no number', () => {
    const plain = stripAnsi(renderChoices(choices).text);
    expect(plain).toContain('· The word you cannot afford.');
    expect(plain).not.toContain('3.');
  });

  it('strips an authored leading glyph from lockedLabel — the renderer owns it', () => {
    const doubled = [{ id: 'x', label: '· Take one end of the tables.', locked: true }];
    const plain = stripAnsi(renderChoices(doubled).text);
    expect(plain).toContain('· Take one end of the tables.');
    expect(plain).not.toContain('· ·');
  });

  it('marks major-stakes choices more prominently', () => {
    const marked = [
      { id: 'a', label: 'Keep playing.', locked: false, stakes: 'major' as const },
      { id: 'b', label: 'Ask why.', locked: true, stakes: 'major' as const },
    ];
    const plain = stripAnsi(renderChoices(marked).text);
    expect(plain).toContain('! 1. Keep playing.');
    expect(plain).toContain('!  · Ask why.');
  });
});

describe('renderEnding', () => {
  it('maps act1-end to its diegetic card, no internal id', () => {
    const plain = stripAnsi(renderEnding('act1-end'));
    expect(plain).toContain('— end of the first act —');
    expect(plain).not.toContain('act1-end');
  });

  it('closes unknown ending ids generically, never echoing the id', () => {
    const plain = stripAnsi(renderEnding('slice-end'));
    expect(plain).toContain('— the ledger closes here —');
    expect(plain).not.toContain('slice-end');
  });
});

describe('degradeMargin (STATIC perceptibility)', () => {
  const line = italic('the horn holds the third bar longer than the water wants');
  const SEED = 1971;

  it('leaves the line alone while the fog is quiet', () => {
    expect(rotRateFor(0)).toBe(0);
    expect(rotRateFor(29)).toBe(0);
    expect(degradeMargin(line, 0, SEED)).toBe(line);
    expect(degradeMargin(line, 29, SEED)).toBe(line);
  });

  it('substitutes glyphs at the ≥30 tier, deterministically', () => {
    const once = degradeMargin(line, 30, SEED);
    const twice = degradeMargin(line, 30, SEED);
    expect(once).toBe(twice);
    expect(stripAnsi(once)).toHaveLength(stripAnsi(line).length);
  });

  it('degrades harder at ≥60 than at ≥30', () => {
    expect(rotRateFor(60)).toBeGreaterThan(rotRateFor(30));
    const countDiffs = (a: string, b: string): number =>
      [...stripAnsi(a)].filter((ch, i) => ch !== stripAnsi(b)[i]).length;
    const at30 = countDiffs(degradeMargin(line, 30, SEED), line);
    const at60 = countDiffs(degradeMargin(line, 60, SEED), line);
    expect(at60).toBeGreaterThan(0);
    expect(at60).toBeGreaterThanOrEqual(at30);
  });

  it('never touches ANSI escape sequences', () => {
    const rotted = degradeMargin(line, 60, SEED);
    expect(rotted.startsWith('\u001b[3')).toBe(true);
    expect(rotted.endsWith('\u001b[0m')).toBe(true);
  });

  it('varies with the seed — same save, same rot; new run, new rot', () => {
    const a = degradeMargin(line, 60, 1);
    const b = degradeMargin(line, 60, 2);
    // Not a hard guarantee per character, but two seeds over a long line
    // colliding entirely would mean the PRNG is not doing its job.
    expect(a === b).toBe(false);
  });
});
