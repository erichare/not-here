/**
 * Act 1 invariant lint — mechanical sweeps over EVERY authored Act 1 surface
 * (scene paragraphs, choice labels, locked labels, dialogue rule texts).
 *
 * Enforced here, per design/game-bible.md §Prose grammar,
 * design/title-thread.md §Rules, and design/decisions.md §Prose economy:
 *
 *  a. Touch — no NPC-initiated touch anywhere in Act 1 (allowlist: empty;
 *     the rule breaks once, in an ENDING, acts away from here).
 *  b. Naming — 'Wren' is never uttered in Act 1 content; a fortiori Dianne
 *     never addresses the player by it (bible: 'love' / 'hon' / 'my girl').
 *  c. Title discipline — the exact phrase 'not here' appears exactly ONCE
 *     outside @doc blocks (Dianne's Day-2 phone call) and exactly ONCE
 *     inside them (the chord sheet). Counts are pinned.
 *  d. Detune pairing — every music.detune emit is immediately followed by a
 *     tell.visual emit in the same effects array (accessibility invariant).
 *  e. Prose economy — warn on paragraphs over 120 words; fail over 150
 *     (decisions.md budget: 30–90 words per beat, lint warns at 120).
 *
 * Plus one integration-seam guard: the day counter's time.set ladder covers
 * days 2..8 exactly once each, on the scenes that own the boundaries.
 */

import { describe, expect, it } from 'vitest';
import type { Effect, Scene } from '@not-here/engine';

/** The story package's tsconfig lib omits DOM/Node; vitest supplies console. */
declare const console: { readonly warn: (message: string) => void };
import type { DialogueRule } from '@not-here/memory';
import { ALL_SCENES } from './content.ts';
import { DIALOGUE_RULES } from './dialogue.ts';
import { RULES as RULES_D34 } from './dialogue-days34.ts';
import { RULES as RULES_D56 } from './dialogue-days56.ts';
import { RULES as RULES_D7 } from './dialogue-day7.ts';

const ALL_RULES: readonly DialogueRule[] = [
  ...DIALOGUE_RULES,
  ...RULES_D34,
  ...RULES_D56,
  ...RULES_D7,
];

interface Sourced {
  readonly source: string;
  readonly text: string;
}

/** Every authored Act 1 text surface, with a source label for failures. */
const ALL_TEXTS: readonly Sourced[] = [
  ...ALL_SCENES.flatMap((scene): readonly Sourced[] => {
    if (scene.prose.kind !== 'inline') return [];
    return [
      ...scene.prose.paragraphs.map((p) => ({ source: scene.id, text: p.text })),
      ...scene.choices.flatMap((c) => [
        { source: `${scene.id}#${c.id}`, text: c.label },
        ...(c.lockedLabel !== undefined
          ? [{ source: `${scene.id}#${c.id}:locked`, text: c.lockedLabel }]
          : []),
      ]),
    ];
  }),
  ...ALL_RULES.map((r) => ({ source: `rule:${r.id}`, text: r.text })),
];

/** Prose only: paragraphs and lines, minus document artifacts and tokens. */
const PROSE_TEXTS: readonly Sourced[] = ALL_TEXTS.filter(
  ({ text }) => !text.startsWith('@doc:') && !text.startsWith('@line:'),
);

// ——— a. Touch ———

const SUBJECT = '(?:she|he|they|dianne|barb|tam|wade|priya|sam|moose)';
const TOUCH_VERB =
  '(?:takes|took|touches|touched|grabs|grabbed|hugs|hugged|holds|held|pats|patted|' +
  'strokes|stroked|embraces|embraced|catches|caught|clasps|clasped|pulls|pulled|' +
  'grips|gripped|squeezes|squeezed|steadies|steadied|brushes|brushed|' +
  'reaches\\s+for|reached\\s+for)';

/** NPC subject + contact verb + the player as object. */
const touchDirect = new RegExp(`\\b${SUBJECT}\\s+${TOUCH_VERB}\\s+(?:you|your)\\b`, 'i');
/** An NPC's hand/arm landing on the player without a named verb. */
const touchByHand =
  /\b(?:her|his|their)\s+(?:hands?|arms?|palms?|fingers)\b[^.!?]{0,40}\b(?:on|around|against|over|through)\s+(?:you|yours?)\b/i;
/** Physically seating / placing the player — steering is touching. */
const touchBySeating = /\b(?:sits|sat|sets|set|puts|put|lays|laid|plants|planted)\s+you\b/i;

describe('a. touch — nobody touches you first, no exceptions in Act 1', () => {
  it('no NPC-initiated contact verb reaches the player', () => {
    for (const { source, text } of ALL_TEXTS) {
      expect(touchDirect.test(text), `NPC touch in ${source}: ${text}`).toBe(false);
    }
  });

  it('no NPC hand or arm lands on the player', () => {
    for (const { source, text } of ALL_TEXTS) {
      expect(touchByHand.test(text), `NPC hand-touch in ${source}: ${text}`).toBe(false);
    }
  });

  it('nobody seats, sets, or places the player anywhere', () => {
    for (const { source, text } of ALL_TEXTS) {
      expect(touchBySeating.test(text), `NPC steering-touch in ${source}: ${text}`).toBe(false);
    }
  });
});

// ——— b. Naming ———

describe('b. naming — the name is never said', () => {
  it("'Wren' appears in no Act 1 surface (so Dianne can never say it to you)", () => {
    for (const { source, text } of ALL_TEXTS) {
      expect(/\bWren\b/.test(text), `'Wren' uttered in ${source}: ${text}`).toBe(false);
    }
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

/** An effects array plus every nested when-branch array, flattened out. */
const effectArrays = (effects: readonly Effect[]): readonly (readonly Effect[])[] => [
  effects,
  ...effects.flatMap((e) =>
    e.op === 'when'
      ? [...effectArrays(e.then), ...(e.else !== undefined ? effectArrays(e.else) : [])]
      : [],
  ),
];

const sceneEffectArrays = (scene: Scene): readonly (readonly Effect[])[] => [
  ...effectArrays(scene.onEnter ?? []),
  ...scene.choices.flatMap((c) => effectArrays(c.effects ?? [])),
];

describe('d. detune pairing — every lie has its visual twin, adjacent', () => {
  it('each music.detune emit is immediately followed by a tell.visual emit', () => {
    for (const scene of ALL_SCENES) {
      for (const effects of sceneEffectArrays(scene)) {
        effects.forEach((effect, i) => {
          if (effect.op !== 'emit' || effect.event.kind !== 'music.detune') return;
          const next = effects[i + 1];
          const paired = next?.op === 'emit' && next.event.kind === 'tell.visual';
          expect(paired, `unpaired music.detune in ${scene.id} (index ${i})`).toBe(true);
        });
      }
    }
  });

  it('at least one detune ships in Act 1 (the lint is not vacuous)', () => {
    const total = ALL_SCENES.flatMap(sceneEffectArrays)
      .flat()
      .filter((e) => e.op === 'emit' && e.event.kind === 'music.detune').length;
    expect(total).toBeGreaterThanOrEqual(3); // Day-3 retellings + Wade's Day 4
  });
});

// ——— e. Prose economy ———

const wordCount = (text: string): number =>
  text.split(/\s+/).filter((w) => /[0-9A-Za-z’']/.test(w)).length;

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

// ——— Integration seam: the day ladder ———

describe('day ladder — time.set covers days 2..8, each exactly once', () => {
  it('each boundary scene owns its day', () => {
    const owners = new Map<number, string[]>();
    for (const scene of ALL_SCENES) {
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
