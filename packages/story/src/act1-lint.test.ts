/**
 * Act 1 invariant lint — mechanical sweeps over EVERY authored Act 1 surface
 * (scene paragraphs, choice labels, locked labels, dialogue rule texts).
 * Scope: ACT1_SCENES + the four Act 1 dialogue rule files ONLY — the pins
 * here are act-local. Whole-game invariants (the touch sweep, the 07:40
 * exclusivity) live in game-lint.test.ts; Act 2's pins in act2-lint.test.ts.
 *
 * Enforced here, per design/game-bible.md §Prose grammar,
 * design/title-thread.md §Rules, and design/decisions.md §Prose economy:
 *
 *  b. Naming — one fixed, non-Dianne resident says 'Wren' in Act 1 so her
 *     identity is legible; Dianne never addresses the player by it (bible:
 *     'love' / 'hon' / 'my girl').
 *  c. Title discipline — the exact phrase 'not here' appears exactly ONCE
 *     outside @doc blocks (Dianne's Day-2 phone call) and exactly ONCE
 *     inside them (the chord sheet). Counts are pinned.
 *  d. Detune twinning — every music.detune emit has a visual twin: either
 *     an immediately-following tell.visual emit, or (the canonical form
 *     after playtest fix-03) a prose paragraph in the SAME scene carrying
 *     the twin — pinned per scene in PROSE_TWINS (accessibility invariant).
 *  e. Prose economy — warn on paragraphs over 120 words; fail over 150
 *     (decisions.md budget: 30–90 words per beat, lint warns at 120).
 *  f. Locked-option surface (playtest fix-11) — the renderer owns the '·'
 *     glyph, so no authored lockedLabel starts with it; and a lockedLabel
 *     must ache, not parrot — it never equals its open label.
 *  g. The bus date (prose grammar #3, playtest fix-08) — the EBUS schedule
 *     card is on screen on EVERY route from Night 1, then repeats either on
 *     Dianne's corkboard (Day 2) or in the fixed Day-3 evening.
 *
 * Plus one integration-seam guard: the day counter's time.set ladder covers
 * days 2..8 exactly once each, on the scenes that own the boundaries.
 */

import { describe, expect, it } from 'vitest';

/** The story package's tsconfig lib omits DOM/Node; vitest supplies console. */
declare const console: { readonly warn: (message: string) => void };
import type { DialogueRule } from '@not-here/memory';
import { ACT1_SCENES } from './content.ts';
import { DIALOGUE_RULES } from './dialogue.ts';
import { RULES as RULES_D34 } from './dialogue-days34.ts';
import { RULES as RULES_D56 } from './dialogue-days56.ts';
import { RULES as RULES_D7 } from './dialogue-day7.ts';
import {
  collectTexts,
  proseTexts,
  sceneEffectArrays,
  sceneProse,
  wordCount,
  type Sourced,
} from './lint-shared.ts';

const ACT1_RULES: readonly DialogueRule[] = [
  ...DIALOGUE_RULES,
  ...RULES_D34,
  ...RULES_D56,
  ...RULES_D7,
];

/** Every authored Act 1 text surface, with a source label for failures. */
const ALL_TEXTS: readonly Sourced[] = collectTexts(ACT1_SCENES, ACT1_RULES);

/** Prose only: paragraphs and lines, minus document artifacts and tokens. */
const PROSE_TEXTS: readonly Sourced[] = proseTexts(ALL_TEXTS);

// ——— b. Naming ———

describe('b. naming — one public name, never from Dianne', () => {
  it("'Wren' appears exactly once, spoken by an orchard man in the fixed Day-2 crowd", () => {
    const hits = ALL_TEXTS.filter(({ text }) => /\bWren\b/.test(text));
    expect(hits).toHaveLength(1);
    expect(hits[0]?.source).toBe('d2-evening');
    expect(hits[0]?.text).toContain('One of the orchard men');
    expect(hits[0]?.text).toContain('“Welcome home, Wren,”');
  });
});

// ——— c. Title discipline ———

describe('c. title discipline — one spoken use, one written use, pinned', () => {
  const TITLE = /not\s+here/gi;
  const hits = ALL_TEXTS.flatMap(({ source, text }) => {
    const count = (text.match(TITLE) ?? []).length;
    return count > 0 ? [{ source, text, count, doc: text.startsWith('@doc:') }] : [];
  });

  it("outside @doc blocks: exactly once — Dianne's Day-2 phone call", () => {
    const spoken = hits.filter((h) => !h.doc);
    expect(spoken.map((h) => ({ source: h.source, count: h.count }))).toEqual([
      { source: 'd2-dianne-2', count: 1 },
    ]);
    // Pin it to the beat itself: the store phone, her back to you.
    expect(spoken[0]?.text).toContain('The store phone rings');
    expect(spoken[0]?.text).toContain('"No. She’s not here."');
  });

  it('inside @doc blocks: exactly once — the chord sheet heading', () => {
    const written = hits.filter((h) => h.doc);
    expect(written.map((h) => ({ source: h.source, count: h.count }))).toEqual([
      { source: 'd3-room-2', count: 1 },
    ]);
    expect(written[0]?.text).toContain('not here (unfinished)');
  });
});

// ——— d. Detune pairing ———

/**
 * fix-03: prose is the canonical visual twin. Every scene that emits a
 * detune WITHOUT an adjacent tell.visual must appear here, with the twin
 * substrings its prose is required to carry.
 */
const PROSE_TWINS: Readonly<Record<string, readonly string[]>> = {
  'd3-evening': ['a quarter-tone flat', 'a shade flat'],
  'd3-night': ['one layer short'],
  'd4-wharf-2': ['a quarter-turn flat'],
  'd4-evening': ['a shade flat'],
  'd5-evening': ['a shade flat', 'idle, road, idle'],
  'd6-ticket-2': ['a quarter-turn flat'],
};

describe('d. detune twinning — every lie has its visual twin', () => {
  it('each music.detune emit is twinned: adjacent tell.visual, or pinned prose', () => {
    for (const scene of ACT1_SCENES) {
      for (const effects of sceneEffectArrays(scene)) {
        effects.forEach((effect, i) => {
          if (effect.op !== 'emit' || effect.event.kind !== 'music.detune') return;
          const next = effects[i + 1];
          const adjacent = next?.op === 'emit' && next.event.kind === 'tell.visual';
          if (adjacent) return;
          const twins = PROSE_TWINS[scene.id];
          expect(
            twins,
            `music.detune in ${scene.id} (index ${i}) has no adjacent tell.visual and no PROSE_TWINS entry`,
          ).toBeDefined();
          for (const twin of twins ?? []) {
            expect(
              sceneProse(scene).includes(twin),
              `${scene.id}: prose twin "${twin}" missing`,
            ).toBe(true);
          }
        });
      }
    }
  });

  it('no scene carries a redundant toast twin — the prose owns it (fix-03)', () => {
    // Scenes in PROSE_TWINS must NOT also emit tell.visual duplicates.
    for (const scene of ACT1_SCENES) {
      if (PROSE_TWINS[scene.id] === undefined) continue;
      const tells = sceneEffectArrays(scene)
        .flat()
        .filter((e) => e.op === 'emit' && e.event.kind === 'tell.visual');
      expect(tells, `${scene.id} re-emits its prose twin as a toast`).toEqual([]);
    }
  });

  it('at least one detune ships in Act 1 (the lint is not vacuous)', () => {
    const total = ACT1_SCENES.flatMap(sceneEffectArrays)
      .flat()
      .filter((e) => e.op === 'emit' && e.event.kind === 'music.detune').length;
    expect(total).toBeGreaterThanOrEqual(3); // Day-3 retellings + Wade's Day 4
  });
});

// ——— e. Prose economy ———

describe('e. prose economy — 30–90 word beats; warn >120, fail >150', () => {
  const over120 = PROSE_TEXTS.map((t) => ({ ...t, words: wordCount(t.text) })).filter(
    (t) => t.words > 120,
  );

  it('no paragraph exceeds 150 words', () => {
    const over150 = over120.filter((t) => t.words > 150);
    expect(
      over150.map((t) => `${t.source} (${t.words}w)`),
      'trim these paragraphs — they are past the hard cap',
    ).toEqual([]);
  });

  it('warn-list: paragraphs over 120 words', () => {
    if (over120.length > 0) {
      // decisions.md: the lint WARNS at 120 — report, don't fail.
      console.warn(
        `[act1-lint] ${over120.length} paragraph(s) over 120 words:\n` +
          over120.map((t) => `  ${t.source}: ${t.words} words`).join('\n'),
      );
    }
    expect(over120.length).toBeGreaterThanOrEqual(0); // reporting only
  });
});

// ——— f. Locked-option surface (fix-11) ———

describe('f. locked labels — one glyph (the renderer’s), real ache', () => {
  const lockedLabels = ACT1_SCENES.flatMap((scene) =>
    scene.choices.flatMap((c) =>
      c.lockedLabel !== undefined
        ? [{ source: `${scene.id}#${c.id}`, label: c.label, lockedLabel: c.lockedLabel }]
        : [],
    ),
  );

  it('no lockedLabel starts with the renderer’s glyph', () => {
    for (const { source, lockedLabel } of lockedLabels) {
      expect(lockedLabel.startsWith('·'), `double glyph in ${source}: ${lockedLabel}`).toBe(false);
    }
  });

  it('no lockedLabel parrots its open label verbatim', () => {
    for (const { source, label, lockedLabel } of lockedLabels) {
      expect(lockedLabel === label, `no ache in ${source}: ${lockedLabel}`).toBe(false);
    }
  });
});

// ——— g. The bus date is on screen on every route (fix-08) ———

describe('g. the EBUS card — the twist’s clock survives every route', () => {
  const cardParagraphs = ACT1_SCENES.flatMap((scene) => {
    if (scene.prose.kind !== 'inline') return [];
    return scene.prose.paragraphs.flatMap((p) =>
      p.text.includes('EBUS — WINTER SCHEDULE') ? [{ source: scene.id, block: p }] : [],
    );
  });

  it('is planted on Night 1, with later copies at the General and the Kettle', () => {
    expect(cardParagraphs.map((c) => c.source).sort()).toEqual([
      'd2-dianne-2',
      'd3-evening',
      'n1-room',
    ]);
  });

  it('every copy circles the 28th twice', () => {
    for (const { source, block } of cardParagraphs) {
      expect(block.text.includes('(( Fri 28 Nov'), `no ring on the card in ${source}`).toBe(true);
    }
  });

  it('the Night-1 copy is fixed on every route', () => {
    const night1 = cardParagraphs.find((c) => c.source === 'n1-room');
    expect(night1?.block.when).toBeUndefined();
  });

  it('the Day-3 copy is the catch-all: gated, so it fires only when unseen', () => {
    const d3 = cardParagraphs.find((c) => c.source === 'd3-evening');
    expect(d3?.block.when).toBeDefined();
  });
});

// ——— Integration seam: the day ladder ———

describe('day ladder — time.set covers days 2..8, each exactly once', () => {
  it('each boundary scene owns its day', () => {
    const owners = new Map<number, string[]>();
    for (const scene of ACT1_SCENES) {
      for (const effects of sceneEffectArrays(scene)) {
        for (const effect of effects) {
          if (effect.op !== 'time.set' || effect.day === undefined) continue;
          owners.set(effect.day, [...(owners.get(effect.day) ?? []), scene.id]);
        }
      }
    }
    expect(Object.fromEntries([...owners.entries()].sort((a, b) => a[0] - b[0]))).toEqual({
      2: ['d2-wake'],
      3: ['d3-morning'],
      4: ['d4-morning'],
      5: ['d5-morning'],
      6: ['d6-morning'],
      7: ['d7-morning'],
      8: ['act1-end'],
    });
  });
});
