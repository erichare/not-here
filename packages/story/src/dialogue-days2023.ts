/**
 * Dialogue rules for Days 20–23 (see scenes/day20.ts; later days join as
 * their clusters ship).
 *
 * One dynamic slot so far:
 *  - barb / 'greeting-d20' — her line as she serves you inside the Friday
 *    planning. Variants key on the exile staging and on the sacrificed-sam
 *    route (the resumption notice went up at Dianne's General wall this
 *    morning — the General is Dianne's store, not Barb's; Barb names the
 *    fact and not the reason, which is the town's whole grammar for it).
 *
 * The town never remarks on the wrongness; no weekday is named except
 * Friday; 'Wren' appears zero times in this file. Every (speaker, slot)
 * pair carries a zero-condition fallback — selectLine throws otherwise,
 * by design.
 */

import type { DialogueRule } from '@not-here/memory';

export const RULES: readonly DialogueRule[] = [
  // ——— Barb, Day 20 evening — inside the Friday planning ———

  {
    id: 'barb-g20-exiled',
    speaker: 'barb',
    slot: 'greeting-d20',
    when: { op: 'flag', key: 'potluck:verdict', value: 'exiled' },
    salience: 2,
    text: '“You’re on the list for Friday whether you sit up here or not,” Barb says, setting the plate down where you sit now. “Whose truck, if it snows. That’s the question tonight. Eat while it’s argued.”',
  },
  {
    id: 'barb-g20-resumed',
    speaker: 'barb',
    slot: 'greeting-d20',
    when: { op: 'fact.exists', tag: 'sacrificed-sam' },
    salience: 1,
    text: '“Run’s back on for the twenty-sixth,” Barb says, pouring before you’ve sat. “District found its manners five days shy of December.” She leaves it there, the way she leaves everything she has already decided not to say.',
  },
  {
    id: 'barb-g20-fallback',
    speaker: 'barb',
    slot: 'greeting-d20',
    text: '“Sit,” Barb says, mid-count of who meets the coach. “The planning goes better with the chairs full and the mouths fed.”',
  },
];
