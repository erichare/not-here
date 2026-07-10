/**
 * Dialogue rules for Days 12–13 (see scenes/day12.ts, day13.ts).
 *
 * Two reactive slots, both Barb's:
 *
 *  - barb / 'greeting-d12' (the Kettle, prep-day evening): the carried-tables
 *    variant reads the day off your sleeves — no gossip edge needed; Barb
 *    reads evidence, not sources, same as her Day-5 'hall dust' line.
 *  - barb / 'greeting-d13' (potluck morning): the early-truth variant keys on
 *    the flag set at her own counter the night before (scenes/day12.ts,
 *    'd12-counter'). Deliberately oblique — the one-warning rule stands, and
 *    this rule does not reference Night 11 or re-perform anything; it is a
 *    woman pouring coffee over a thing both of you now carry.
 *
 * Every (speaker, slot) pair carries a zero-condition fallback — selectLine
 * throws otherwise, by design.
 */

import type { DialogueRule } from '@not-here/memory';

export const RULES: readonly DialogueRule[] = [
  // ——— Barb, Day 12 evening greeting (prep day) ———

  {
    id: 'barb-g12-carried',
    speaker: 'barb',
    slot: 'greeting-d12',
    when: { op: 'flag', key: 'd12:carried-tables' },
    text: '"Hall dust and table oil," Barb says, reading your sleeves like a page. "Dianne will sleep tonight, then. Sit — it’s stew, and you’ve carried for it."',
  },
  {
    id: 'barb-g12-fallback',
    speaker: 'barb',
    slot: 'greeting-d12',
    text: '"Big day tomorrow," Barb says, pouring without being asked. "Tonight the whole Bay eats early and lies about being calm. Sit."',
  },

  // ——— Barb, Day 13 morning greeting (the potluck) ———

  {
    id: 'barb-g13-early-truth',
    speaker: 'barb',
    slot: 'greeting-d13',
    when: { op: 'flag', key: 'early-truth' },
    text: '"Morning," Barb says, and pours, and doesn’t ask how you slept — which from her is a whole conversation, held with the pot. The counter between you keeps last night exactly where the two of you left it.',
  },
  {
    id: 'barb-g13-fallback',
    speaker: 'barb',
    slot: 'greeting-d13',
    text: '"Morning," Barb says. "Half the town’s home basting things. You get the quiet, and the first of the pot."',
  },
];
