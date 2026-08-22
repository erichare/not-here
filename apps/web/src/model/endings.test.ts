import { describe, expect, it } from 'vitest';
import { buildContent } from '@not-here/story';
import { ACT_BOUNDARY_ENDINGS } from '../save.ts';
import { ACT_CARDS, completedEndings, endingCardFor, NG_PLUS_SUBTITLE, recordEnding } from './endings.ts';

const SLUG = /\b(d\d{1,2}|n1|act\d)-[a-z]/;

describe('endingCardFor', () => {
  it('never speaks a raw id, for every authored ending', () => {
    const content = buildContent();
    for (const scene of content.scenes.values()) {
      if (scene.ending === undefined) continue;
      const card = endingCardFor(scene.ending, ACT_BOUNDARY_ENDINGS);
      expect(card.mark).not.toContain(scene.ending);
      expect(card.mark).not.toMatch(SLUG);
      expect(card.mark).toMatch(/^— .+ —$/);
    }
  });

  it('knows the held place from a close', () => {
    expect(endingCardFor('d22-end', ACT_BOUNDARY_ENDINGS)).toMatchObject({ held: true, mark: '— held for the twenty-eighth —' });
    expect(endingCardFor('never-authored', ACT_BOUNDARY_ENDINGS)).toMatchObject({ held: false, mark: '— the ledger closes here —' });
    expect(endingCardFor('ash', ACT_BOUNDARY_ENDINGS).name).toBe('Ash');
    expect(endingCardFor('wren-again', ACT_BOUNDARY_ENDINGS).name).toBe('Welcome Home');
  });

  it('has act titles and the song’s name, free of digits and slugs', () => {
    for (const card of Object.values(ACT_CARDS)) {
      expect(card.title).not.toMatch(/\d/);
      expect(card.eyebrow).toMatch(/^ACT (ONE|TWO|THREE)$/);
    }
    expect(NG_PLUS_SUBTITLE).toBe('a song by Wren Cole');
  });
});

describe('completed endings', () => {
  it('remembers each ending once, in order, and shrugs at bad storage', () => {
    const map = new Map<string, string>();
    const storage = {
      getItem: (k: string) => map.get(k) ?? null,
      setItem: (k: string, v: string) => void map.set(k, v),
    };
    expect(completedEndings(storage)).toEqual([]);
    recordEnding(storage, 'ash');
    recordEnding(storage, 'ash');
    recordEnding(storage, 'long-winter');
    expect(completedEndings(storage)).toEqual(['ash', 'long-winter']);
    map.set('not-here:completed', '[oops');
    expect(completedEndings(storage)).toEqual([]);
  });
});
