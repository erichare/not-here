/**
 * Shared lint machinery for the act lints and the whole-game lint.
 *
 * The sweeps themselves live in act1-lint.test.ts (Act-1-local pins),
 * act2-lint.test.ts (Act-2-local pins), and game-lint.test.ts (whole-game
 * invariants: touch, the 07:40 exclusivity). This module owns only the
 * reusable text-collection helpers and regexes so the three files cannot
 * drift apart on what counts as an authored surface.
 */

import type { Effect, Scene } from '@not-here/engine';
import type { DialogueRule } from '@not-here/memory';

export interface Sourced {
  readonly source: string;
  readonly text: string;
}

/** Every authored text surface of a scene list + rule list, source-labelled. */
export const collectTexts = (
  scenes: readonly Scene[],
  rules: readonly DialogueRule[],
): readonly Sourced[] => [
  ...scenes.flatMap((scene): readonly Sourced[] => {
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
  ...rules.map((r) => ({ source: `rule:${r.id}`, text: r.text })),
];

/** Prose only: paragraphs and lines, minus document artifacts and tokens. */
export const proseTexts = (texts: readonly Sourced[]): readonly Sourced[] =>
  texts.filter(({ text }) => !text.startsWith('@doc:') && !text.startsWith('@line:'));

// ——— Touch (game-bible §Prose grammar: nobody touches you first) ———

const SUBJECT = '(?:she|he|they|dianne|barb|tam|wade|priya|sam|moose)';
const TOUCH_VERB =
  '(?:takes|took|touches|touched|grabs|grabbed|hugs|hugged|holds|held|pats|patted|' +
  'strokes|stroked|embraces|embraced|catches|caught|clasps|clasped|pulls|pulled|' +
  'grips|gripped|squeezes|squeezed|steadies|steadied|brushes|brushed|' +
  'reaches\\s+for|reached\\s+for)';

/** NPC subject + contact verb + the player as object. */
export const touchDirect = new RegExp(`\\b${SUBJECT}\\s+${TOUCH_VERB}\\s+(?:you|your)\\b`, 'i');
/** An NPC's hand/arm landing on the player without a named verb. */
export const touchByHand =
  /\b(?:her|his|their)\s+(?:hands?|arms?|palms?|fingers)\b[^.!?]{0,40}\b(?:on|around|against|over|through)\s+(?:you|yours?)\b/i;
/** Physically seating / placing the player — steering is touching. */
export const touchBySeating = /\b(?:sits|sat|sets|set|puts|put|lays|laid|plants|planted)\s+you\b/i;

// ——— Prose economy (decisions.md: 30–90 word beats; warn 120, fail 150) ———

export const wordCount = (text: string): number =>
  text.split(/\s+/).filter((w) => /[0-9A-Za-z’']/.test(w)).length;

// ——— Effect plumbing ———

/** An effects array plus every nested when-branch array, flattened out. */
export const effectArrays = (effects: readonly Effect[]): readonly (readonly Effect[])[] => [
  effects,
  ...effects.flatMap((e) =>
    e.op === 'when'
      ? [...effectArrays(e.then), ...(e.else !== undefined ? effectArrays(e.else) : [])]
      : [],
  ),
];

/** Every effect array a scene owns: onEnter and each choice's effects. */
export const sceneEffectArrays = (scene: Scene): readonly (readonly Effect[])[] => [
  ...effectArrays(scene.onEnter ?? []),
  ...scene.choices.flatMap((c) => effectArrays(c.effects ?? [])),
];

/** All of a scene's paragraph text joined — the surface prose twins live in. */
export const sceneProse = (scene: Scene): string =>
  scene.prose.kind === 'inline' ? scene.prose.paragraphs.map((p) => p.text).join('\n') : '';
