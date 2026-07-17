/**
 * Whole-game invariant lint — the sweeps that hold across EVERY act, run
 * over ALL_SCENES and every dialogue rule file (Act 1 + Act 2):
 *
 *  1. Touch (game-bible §Prose grammar) — no NPC-initiated touch anywhere
 *     (allowlist: empty; the rule breaks once, in an ENDING, acts away).
 *  2. The 07:40 exclusivity (playtest fix-08 retime) — only the EBUS
 *     schedule card may carry the departure time; Tam's run is 07:10.
 *
 * Act-local pins (title counts, naming, detune twins, day ladders) live in
 * act1-lint.test.ts and act2-lint.test.ts. Duplicate scene ids and goto
 * resolution are swept by content.test.ts.
 */

import { describe, expect, it } from 'vitest';
import type { DialogueRule } from '@not-here/memory';
import { ALL_SCENES } from './content.ts';
import { DIALOGUE_RULES } from './dialogue.ts';
import { RULES as RULES_D34 } from './dialogue-days34.ts';
import { RULES as RULES_D56 } from './dialogue-days56.ts';
import { RULES as RULES_D7 } from './dialogue-day7.ts';
import { RULES as RULES_D89 } from './dialogue-days89.ts';
import { RULES as RULES_D1011 } from './dialogue-days1011.ts';
import { RULES as RULES_D1213 } from './dialogue-days1213.ts';
import { RULES as RULES_D1416 } from './dialogue-days1416.ts';
import { RULES as RULES_D1719 } from './dialogue-days1719.ts';
import { RULES as RULES_D2023 } from './dialogue-days2023.ts';
import {
  collectTexts,
  touchByHand,
  touchBySeating,
  touchDirect,
  type Sourced,
} from './lint-shared.ts';

const ALL_RULES: readonly DialogueRule[] = [
  ...DIALOGUE_RULES,
  ...RULES_D34,
  ...RULES_D56,
  ...RULES_D7,
  ...RULES_D89,
  ...RULES_D1011,
  ...RULES_D1213,
  ...RULES_D1416,
  ...RULES_D1719,
  ...RULES_D2023,
];

/** Every authored text surface in the game, with a source label. */
const ALL_TEXTS: readonly Sourced[] = collectTexts(ALL_SCENES, ALL_RULES);

// ——— 1. Touch ———

describe('touch — nobody touches you first, no exceptions before the endings', () => {
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

// ——— 2. The 07:40 exclusivity ———

describe('the EBUS departure time — 07:40 appears only on the schedule card', () => {
  it('no other schedule anywhere shares the EBUS departure time (fix-08 retime)', () => {
    // Tam's regional run is 07:10; only the EBUS card may say 07:40.
    for (const { source, text } of ALL_TEXTS) {
      if (text.includes('EBUS — WINTER SCHEDULE')) continue;
      expect(text.includes('07:40'), `EBUS time outside the card in ${source}`).toBe(false);
    }
  });
});
