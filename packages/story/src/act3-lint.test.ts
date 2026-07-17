/**
 * Act 3 invariant lint — mechanical sweeps over EVERY authored Act 3 surface
 * (scene paragraphs, choice labels, locked labels, dialogue rule texts).
 * Scope: DAY20 + DAY21 scene arrays + the days-20-23 dialogue rule file;
 * later clusters (Days 22–23) join both lists as they ship. Whole-game
 * invariants (touch, 07:40) live in game-lint.test.ts.
 *
 * Enforced here, per design/act3-plan.md §Rulings:
 *
 *  a. Title discipline — Act 3 prose writes ZERO uses of the title phrase;
 *     the register NAME column (Night 21's @doc, in Barb's hand) is the
 *     mechanical-stage exemption its header anticipated, pinned to exactly
 *     that one document. The act's one SPOKEN use is Wade's Night-22 horn
 *     speech (re-pin when the Days 22–23 cluster ships).
 *  b. Naming — 'Wren' appears ZERO times in Act 3 surfaces before the Day
 *     23 files exist; Dianne especially never says it. (The glyph-rot
 *     attractor is mechanical-stage exempt.)
 *  c. Weekdays — no weekday is ever named except Friday.
 *  d. Prose economy — warn over 120 words; fail over 150.
 *  e. Detune twinning — every music.detune has its prose twin in the SAME
 *     scene, pinned per scene in PROSE_TWINS; twin images stay fresh
 *     against the Act 2 anchors AND the Day 20 coinages (each night hears
 *     it in its own words).
 *  f. The giver-hears-it line — exactly ONE per returned fragment: Sam's
 *     (Day 20), Dianne's and Barb's (Day 21).
 *  g. Day ladder — the only day-owning time.sets in this fleet are the
 *     boundary cards': d20-end's day 21 and d21-end's day 22.
 *  h. Presence decay — NIGHT_DECAY spread BY REFERENCE into every Act 3
 *     night door, never re-authored.
 *  i. Locked-option surface — no authored '·' glyph; a lockedLabel aches,
 *     never parrots.
 *  j. The warm unpriced beat — exactly one per day, unconditional.
 */

import { describe, expect, it } from 'vitest';

/** The story package's tsconfig lib omits DOM/Node; vitest supplies console. */
declare const console: { readonly warn: (message: string) => void };
import type { Scene } from '@not-here/engine';
import type { DialogueRule } from '@not-here/memory';
import { RULES as RULES_D2023 } from './dialogue-days2023.ts';
import { NIGHT_DECAY } from './scenes/act2-shared.ts';
import { DAY20_SCENES } from './scenes/day20.ts';
import { DAY21_SCENES } from './scenes/day21.ts';
import {
  collectTexts,
  proseTexts,
  sceneEffectArrays,
  sceneProse,
  wordCount,
  type Sourced,
} from './lint-shared.ts';

const ACT3_SCENES: readonly Scene[] = [...DAY20_SCENES, ...DAY21_SCENES];

const ACT3_RULES: readonly DialogueRule[] = [...RULES_D2023];

/** Every authored Act 3 text surface, with a source label for failures. */
const ALL_TEXTS: readonly Sourced[] = collectTexts(ACT3_SCENES, ACT3_RULES);

/** Prose only: paragraphs and lines, minus document artifacts and tokens. */
const PROSE_TEXTS: readonly Sourced[] = proseTexts(ALL_TEXTS);

const sceneById = (id: string): Scene => {
  const scene = ACT3_SCENES.find((s) => s.id === id);
  if (!scene) throw new Error(`act3-lint: missing scene ${id}`);
  return scene;
};

// ——— a. Title discipline ———

describe('a. title discipline — zero prose uses; the register @doc is the one mechanical stage', () => {
  const TITLE = /not\s+here/i;
  /** The NAME column payoff (title-thread §The register, seen at last). */
  const isRegisterDoc = ({ source, text }: Sourced): boolean =>
    source === 'd21-lamp' && text.startsWith('@doc:');

  it('no surface outside the register document carries it; Wade’s Night-22 speech re-pins this when it ships', () => {
    for (const { source, text } of ALL_TEXTS) {
      if (isRegisterDoc({ source, text })) continue;
      expect(TITLE.test(text), `title phrase in ${source}`).toBe(false);
    }
  });

  it('the exemption is exactly one document — the register, in her hand, no numerals', () => {
    const hits = ALL_TEXTS.filter(({ text }) => TITLE.test(text));
    expect(hits.map((h) => h.source)).toEqual(['d21-lamp']);
    expect(hits[0]?.text.startsWith('@doc:')).toBe(true);
    // Her hand's discipline: the register is canonically numeral-free.
    expect(hits[0]?.text).not.toMatch(/[0-9]/);
    expect(hits[0]?.text).toContain('Frank');
  });
});

// ——— b. Naming ———

describe("b. naming — 'Wren' zero times in Act 3 before Day 23", () => {
  it('no scene, label, or rule says the name', () => {
    for (const { source, text } of ALL_TEXTS) {
      expect(/\bWren\b/.test(text), `the name is on a budget: ${source}`).toBe(false);
    }
  });

  it('no Act 3 Dianne dialogue rule ever says the name', () => {
    for (const rule of ACT3_RULES) {
      if (rule.speaker !== 'dianne') continue;
      expect(/\bWren\b/.test(rule.text), `Dianne names the player in rule:${rule.id}`).toBe(false);
    }
  });
});

// ——— c. Weekdays ———

describe('c. weekdays — Friday is the only day of the week this town names', () => {
  it('no other weekday appears on any surface', () => {
    const WEEKDAY = /\b(Monday|Tuesday|Wednesday|Thursday|Saturday|Sunday)s?\b/i;
    for (const { source, text } of ALL_TEXTS) {
      expect(WEEKDAY.test(text), `a weekday other than Friday in ${source}`).toBe(false);
    }
  });

  it('Friday is live on Day 20 (the lint is not vacuous)', () => {
    expect(ALL_TEXTS.some(({ text }) => /\bFriday\b/.test(text))).toBe(true);
  });
});

// ——— d. Prose economy ———

describe('d. prose economy — 30–90 word beats; warn >120, fail >150', () => {
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
      console.warn(
        `[act3-lint] ${over120.length} paragraph(s) over 120 words:\n` +
          over120.map((t) => `  ${t.source}: ${t.words} words`).join('\n'),
      );
    }
    expect(over120.length).toBeGreaterThanOrEqual(0); // reporting only
  });
});

// ——— e. Detune twinning ———

/**
 * Prose is the canonical visual twin (fix-03; act1/act2-lint carry the same
 * table). d20-evening detunes each missed slot's motif; its three twin
 * images are fresh coinages, checked below against the Act 2 anchors so no
 * evening ever reuses another's flatness image.
 */
const PROSE_TWINS: Readonly<Record<string, readonly string[]>> = {
  'd20-evening': ['half a step shy of itself', 'a degree flat', 'a fraction under true'],
  'd21-evening': ['an engine note counted across water', 'thinner than its own echo'],
};

describe('e. detune twinning — every lie has its visual twin', () => {
  it('each music.detune emit is twinned: adjacent tell.visual, or pinned prose', () => {
    for (const scene of ACT3_SCENES) {
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

  it('no scene carries a redundant toast twin — the prose owns it', () => {
    for (const scene of ACT3_SCENES) {
      if (PROSE_TWINS[scene.id] === undefined) continue;
      const tells = sceneEffectArrays(scene)
        .flat()
        .filter((e) => e.op === 'emit' && e.event.kind === 'tell.visual');
      expect(tells, `${scene.id} re-emits its prose twin as a toast`).toEqual([]);
    }
  });

  it('the Act 3 flatness images never reuse an Act 2 anchor phrase', () => {
    const ACT2_IMAGES = [
      'a shade flat', 'a quarter-turn flat', 'a quarter-tone flat', 'a hair under true',
      'a breath flat', 'a finger’s width flat',
    ] as const;
    for (const id of Object.keys(PROSE_TWINS)) {
      const prose = sceneProse(sceneById(id));
      for (const phrase of ACT2_IMAGES) {
        expect(prose.includes(phrase), `${id} reuses the Act 2 image "${phrase}"`).toBe(false);
      }
    }
  });

  it('later evenings never reuse the Day 20 coinages — each night hears it in its own words', () => {
    const ACT3_D20_IMAGES = PROSE_TWINS['d20-evening'] ?? [];
    expect(ACT3_D20_IMAGES.length).toBeGreaterThan(0);
    for (const id of Object.keys(PROSE_TWINS)) {
      if (id === 'd20-evening') continue;
      const prose = sceneProse(sceneById(id));
      for (const phrase of ACT3_D20_IMAGES) {
        expect(prose.includes(phrase), `${id} reuses the Day 20 image "${phrase}"`).toBe(false);
      }
    }
  });

  it('the retellings keep detuning through the act (the lint is not vacuous)', () => {
    const emitters = new Set(
      ACT3_SCENES.filter((scene) =>
        sceneEffectArrays(scene)
          .flat()
          .some((e) => e.op === 'emit' && e.event.kind === 'music.detune'),
      ).map((s) => s.id),
    );
    expect([...emitters].sort()).toEqual(Object.keys(PROSE_TWINS).sort());
  });
});

// ——— f. The giver-hears-it line ———

describe('f. giver-hears-it — exactly ONE line per returned fragment', () => {
  it("Sam's: one paragraph, on the shed step, and nowhere else", () => {
    const hits = ALL_TEXTS.filter(({ text }) => /whistles it once/.test(text));
    expect(hits.map((h) => h.source)).toEqual(['d20-shed-2']);
    expect(hits[0]?.text).toContain('first time since he was eleven');
  });

  it("Dianne's: the whole-hummed bars, in the confession, and nowhere else", () => {
    const hits = ALL_TEXTS.filter(({ text }) => /nobody she is speaking of is dead/.test(text));
    expect(hits.map((h) => h.source)).toEqual(['d21-confession']);
    expect(hits[0]?.text).toContain('bars one and two, whole');
    // On lullaby-taken runs she cannot hear it — the loss is marked once,
    // in exactly one paragraph, and never again.
    const marked = ALL_TEXTS.filter(({ text }) => /missing stair/.test(text));
    expect(marked.map((m) => m.source)).toEqual(['d21-confession']);
    expect(marked[0]?.text).toContain('It is marked here once, and never again');
  });

  it("Barb's: the under-the-lamp hum, after the sixth question, and nowhere else", () => {
    const hits = ALL_TEXTS.filter(({ text }) => /the part a song stands on/.test(text));
    expect(hits.map((h) => h.source)).toEqual(['d21-lamp-2']);
    expect(hits[0]?.text).toContain('hears herself doing it');
  });
});

// ——— g. The day ladder ———

describe('g. day ladder — the boundary cards own the days: d20-end 21, d21-end 22', () => {
  it('the only day-owning time.sets in this fleet are the cards’', () => {
    const owners = new Map<number, string[]>();
    for (const scene of ACT3_SCENES) {
      for (const effects of sceneEffectArrays(scene)) {
        for (const effect of effects) {
          if (effect.op !== 'time.set' || effect.day === undefined) continue;
          owners.set(effect.day, [...(owners.get(effect.day) ?? []), scene.id]);
        }
      }
    }
    expect(Object.fromEntries([...owners.entries()].sort((a, b) => a[0] - b[0]))).toEqual({
      21: ['d20-end'],
      22: ['d21-end'],
    });
  });
});

// ——— h. Presence decay — the canonical block, spread by reference ———

/** Each night has two doors; entry is mutually exclusive, so each carries it. */
const DECAY_NIGHTS: readonly string[] = ['d20-shed', 'd20-night', 'd21-lamp', 'd21-night'];

describe('h. presence decay — NIGHT_DECAY spread verbatim, once per door', () => {
  it('every Act 3 night door includes the exact shared effect objects in onEnter', () => {
    for (const id of DECAY_NIGHTS) {
      const onEnter = sceneById(id).onEnter ?? [];
      for (const effect of NIGHT_DECAY) {
        expect(
          onEnter.includes(effect),
          `${id}: onEnter does not spread NIGHT_DECAY by reference`,
        ).toBe(true);
      }
    }
  });

  it('the block is never re-authored: only the night doors advance the rotation', () => {
    const writers = ACT3_SCENES.filter((scene) =>
      sceneEffectArrays(scene)
        .flat()
        .some((e) => e.op === 'flag.set' && e.key === 'decay:next'),
    ).map((s) => s.id);
    expect(writers.sort()).toEqual([...DECAY_NIGHTS].sort());
  });

  it('both doors arm the unpayable night — state only, no new events', () => {
    for (const id of DECAY_NIGHTS) {
      const onEnter = sceneById(id).onEnter ?? [];
      expect(onEnter).toContainEqual({
        op: 'flag.set', key: 'a3:unpayable-armed', value: true,
      });
    }
  });
});

// ——— i. Locked-option surface ———

describe('i. locked labels — one glyph (the renderer’s), real ache', () => {
  const lockedLabels = ACT3_SCENES.flatMap((scene) =>
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

// ——— j. The warm unpriced beat ———

describe('j. the warm unpriced beat — one per day, Days 20–22 (tonal ceiling)', () => {
  it('Day 20’s is the coach-manifest laugh, unconditional, in the evening', () => {
    const evening = sceneById('d20-evening');
    if (evening.prose.kind !== 'inline') throw new Error('d20-evening is not inline');
    const beat = evening.prose.paragraphs.find((p) => p.text.includes('the room laughs'));
    expect(beat).toBeDefined();
    expect(beat?.when, 'the warm beat must cost nothing to reach').toBeUndefined();
    expect(beat?.text).toContain('Nobody prices the laugh.');
  });

  it('Day 21’s is Sam’s duffel sent ahead, unconditional, in the evening', () => {
    const evening = sceneById('d21-evening');
    if (evening.prose.kind !== 'inline') throw new Error('d21-evening is not inline');
    const beat = evening.prose.paragraphs.find((p) =>
      p.text.includes('duffel has arrived ahead of him'),
    );
    expect(beat).toBeDefined();
    expect(beat?.when, 'the warm beat must cost nothing to reach').toBeUndefined();
    expect(beat?.text).toContain('He sent it ahead. Not to the coach stop. To wherever you are.');
    expect(beat?.text).toContain('Nobody prices it');
  });
});
