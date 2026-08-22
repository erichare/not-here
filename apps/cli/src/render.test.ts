import type { EngineEvent } from '@not-here/engine';
import { describe, expect, it } from 'vitest';
import {
  degradeMargin,
  frameDoc,
  italic,
  renderChoices,
  renderEnding,
  renderHeader,
  renderParagraphs,
  renderThreeTwelve,
  rotRateFor,
  stripAnsi,
  threeTwelveKind,
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
  it('right-aligns the slot glyph and DAY N — SLOT at the wrap width', () => {
    const plain = stripAnsi(renderHeader(2, 'morning', 40));
    expect(plain).toHaveLength(40);
    expect(plain.trimStart()).toBe('○  DAY 2 — MORNING');
  });

  it('tones the line by slot — evening is the one warm header', () => {
    expect(renderHeader(3, 'evening')).toContain('38;5;180');
    expect(renderHeader(3, 'night')).toContain('38;5;67');
    expect(renderHeader(3, 'morning')).not.toContain('38;5;180');
  });

  it('keeps an unknown slot plain and faint, without a glyph', () => {
    expect(stripAnsi(renderHeader(3, 'dusk', 40)).trimStart()).toBe('DAY 3 — DUSK');
  });
});

describe('the 3:12 line', () => {
  const horn: EngineEvent = { kind: 'music.cue', cue: 'foghorn-312' };

  it('is the horn when the step carries its cue', () => {
    expect(threeTwelveKind('n1-312', 'night', {}, [horn])).toBe('horn');
  });

  it('is the silence on a night under the stop, and nothing otherwise', () => {
    expect(threeTwelveKind('d9-night', 'night', { 'horn-stopped': true }, [])).toBe('silence');
    expect(threeTwelveKind('d9-night-2', 'night', { 'horn-stopped': true }, [])).toBe('silence');
    expect(threeTwelveKind('d9-night', 'night', {}, [])).toBeUndefined();
    expect(threeTwelveKind('d9-morning', 'morning', { 'horn-stopped': true }, [])).toBeUndefined();
  });

  it('renders centred and faint, never naming a scene', () => {
    const plain = stripAnsi(renderThreeTwelve('horn', 40));
    expect(plain.trim()).toBe('— 3:12 —');
    expect(plain.length - plain.trimStart().length).toBe(16);
    expect(stripAnsi(renderThreeTwelve('silence')).trim()).toBe('— 3:12 — no horn —');
  });
});

describe('renderParagraphs', () => {
  it('separates paragraphs with one blank line', () => {
    const out = stripAnsi(renderParagraphs(['one', 'two'], 40));
    expect(out).toBe('one\n\ntwo');
  });

  it('frames a plain document and indents it, verbatim inside', () => {
    const out = stripAnsi(renderParagraphs(['@doc:\nMom —\n— W.'], 40));
    expect(out.split('\n')).toEqual(['    ┌───────┐', '    │ Mom — │', '    │ — W.  │', '    └───────┘']);
  });
});

describe('frameDoc', () => {
  it('rules a plain document into a single box', () => {
    const lines = frameDoc(['Mom —', '', 'I took the bus.', '— W.']);
    const bar = '─'.repeat(17);
    expect(lines[0]).toBe(`┌${bar}┐`);
    expect(lines).toContain('│ I took the bus. │');
    expect(lines).toContain('│                 │');
    expect(lines.at(-1)).toBe(`└${bar}┘`);
    expect(lines).toHaveLength(6);
  });

  it('leaves a drawn document exactly as authored', () => {
    const drawn = ['┌──┐', '│ x│', '└──┘'];
    expect(frameDoc(drawn)).toBe(drawn);
    const double = ['  ╔══╗', '  ║ x║', '  ╚══╝'];
    expect(frameDoc(double)).toBe(double);
  });

  it('never re-wraps: a document wider than the frame passes through', () => {
    const wide = ['x'.repeat(66)];
    expect(frameDoc(wide, 72)).toBe(wide);
    expect(frameDoc(['x'.repeat(64)], 72)).toHaveLength(3);
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

  it('rots only the labels under STATIC — numbers and marks stay legible', () => {
    const rot = { staticMeter: 60, seed: 7 };
    const rotted = stripAnsi(renderChoices(choices, rot).text);
    const clean = stripAnsi(renderChoices(choices).text);
    expect(rotted).not.toBe(clean);
    expect(rotted.split('\n').map((line) => line.slice(0, 6))).toEqual(
      clean.split('\n').map((line) => line.slice(0, 6)),
    );
    expect(renderChoices(choices, rot).text).toBe(renderChoices(choices, rot).text);
  });

  it('leaves the labels alone below the hissing tier', () => {
    expect(renderChoices(choices, { staticMeter: 29, seed: 7 }).text).toBe(
      renderChoices(choices).text,
    );
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

  it('maps act2-end to its diegetic card, no internal id', () => {
    const plain = stripAnsi(renderEnding('act2-end'));
    expect(plain).toContain('— end of the second act —');
    expect(plain).not.toContain('act2-end');
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
