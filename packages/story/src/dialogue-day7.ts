/**
 * Day 7 reactive dialogue — Barb's 'goodnight' slot, the evening before the
 * Foghorn Choice. Two rules per the beat sheet: one keyed to trust:barb >= 6,
 * one guaranteed zero-condition fallback (selectLine throws otherwise).
 *
 * Both carry the same four words. The scene prose supplies the landing.
 */

import type { DialogueRule } from '@not-here/memory';

export const RULES: readonly DialogueRule[] = [
  // She trusts you — which only makes the sentence heavier.
  {
    id: 'barb-goodnight-trusted',
    speaker: 'barb',
    slot: 'goodnight',
    when: { op: 'derived.gte', key: 'trust:barb', value: 6 },
    text: '"Sleep well tonight," Barb says. She stops wiping when she says it, and looks at you the way she looked at you the first night — for exactly as long as it takes to look at someone. "There’s pie for the morning. I’ll want help with it."',
  },

  // Guaranteed fallback — no conditions, chosen last.
  {
    id: 'barb-goodnight-fallback',
    speaker: 'barb',
    slot: 'goodnight',
    text: '"Sleep well tonight," Barb says, to the room, the way she’d call closing. The chairs are up already, all of them. The lock goes over behind you before you’re three steps into the fog, and you cannot remember it ever going over before.',
  },
];
