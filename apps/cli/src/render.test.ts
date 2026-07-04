import { describe, expect, it } from 'vitest';
import {
  renderChoices,
  renderEnding,
  renderHeader,
  renderParagraphs,
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
});

describe('renderEnding', () => {
  it('shows the ending id between dashes', () => {
    expect(stripAnsi(renderEnding('slice-end'))).toContain('— slice-end —');
  });
});
