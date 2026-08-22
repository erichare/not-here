import { describe, expect, it } from 'vitest';
import { buildContent } from '@not-here/story';
import { detectDoc, ringSpans } from './docs.ts';

const DOC_PREFIX = '@doc:\n';
const content = buildContent();

/** Every @doc: block in the story, keyed by scene id (first occurrence). */
const docs = new Map<string, string>();
for (const scene of content.scenes.values()) {
  if (scene.prose.kind !== 'inline') continue;
  for (const block of scene.prose.paragraphs) {
    if (block.text.startsWith(DOC_PREFIX) && !docs.has(scene.id)) docs.set(scene.id, block.text.slice(DOC_PREFIX.length));
  }
}

const form = (id: string) => {
  const text = docs.get(id);
  if (text === undefined) throw new Error(`no doc in ${id}`);
  return detectDoc(text);
};

describe('detectDoc over every authored document', () => {
  it('finds the documents the story ships', () => {
    expect(docs.size).toBeGreaterThanOrEqual(21);
  });

  it('names each canonical form', () => {
    expect(form('n1-room').form).toBe('card');
    expect(form('d2-dianne-2').form).toBe('card');
    expect(form('d7-morning').form).toBe('register');
    expect(form('d21-lamp').form).toBe('register');
    expect(form('d16-depot').form).toBe('log');
    expect(form('d22-depot').form).toBe('log');
    expect(form('d16-corkboard').form).toBe('notice');
    expect(form('d17-mail-2').form).toBe('notice');
    expect(form('d5-hall').form).toBe('flyer');
    expect(form('d10-hall').form).toBe('list');
    expect(form('d8-shed').form).toBe('map');
    expect(form('d3-room-2').form).toBe('chord');
    expect(form('d9-clinic').form).toBe('intake');
    expect(form('d17-reveal').form).toBe('letter');
    expect(form('d17-reveal-2').form).toBe('reply');
    expect(form('d3-night').form).toBe('note');
    expect(form('d10-shed').form).toBe('jotting');
    expect(form('d10-house-tin').form).toBe('scrap');
  });

  it('keeps every box-drawn document printed, in monospace, with its frame stripped', () => {
    for (const [id, text] of docs) {
      const doc = detectDoc(text);
      if (!text.startsWith('┌')) continue;
      expect(doc.boxed, id).toBe(true);
      expect(doc.hand, id).toBe('print');
      expect(doc.lines.some((l) => /[┌└│]/.test(l)), id).toBe(false);
      // the inner text is intact, line for line
      expect(doc.lines.length).toBe(text.split('\n').length - 2);
    }
  });

  it('gives the loose pages a hand', () => {
    expect(form('d17-reveal').hand).toBe('wren');
    expect(form('d10-house-tin').hand).toBe('wren');
    expect(form('d17-reveal-2').hand).toBe('dianne');
    expect(form('d3-night').hand).toBe('priya');
    expect(form('d10-shed').hand).toBe('sam');
    expect(form('d3-room-2').handTitle).toBe(true);
    expect(form('d9-clinic').hand).toBe('print');
  });

  it('never throws on strange input', () => {
    expect(detectDoc('').form).toBe('page');
    expect(detectDoc('┌──┐\n│ x │\n└──┘').form).toBe('print');
    expect(detectDoc('just a line').lines).toEqual(['just a line']);
  });
});

describe('ringSpans', () => {
  it('ringes the double-parenthesised span and keeps the parens in the text', () => {
    const spans = ringSpans('  (( Fri 28 Nov ....... 07:40 )) ');
    expect(spans.map((s) => s.kind)).toEqual(['text', 'ring', 'text']);
    expect(spans.map((s) => s.text).join('')).toBe('  (( Fri 28 Nov ....... 07:40 )) ');
    expect(ringSpans('plain')).toEqual([{ kind: 'text', text: 'plain' }]);
  });
});
