/**
 * Reactive dialogue for Days 3–4: Barb's evening greetings, keyed to what she
 * actually knows (witnessed morning departures, the walk-in shelving). Rules
 * are day-bounded so Day-2 greetings don't leak forward and Day-3 greetings
 * don't outlive their evening. The zero-condition fallback for the (barb,
 * greeting) pair already ships in ./dialogue.ts — these rules only ever
 * outrank it, never replace it.
 */

import type { Cond } from '@not-here/engine';
import type { DialogueRule } from '@not-here/memory';

/** True only on the given day — keeps each evening's line in its evening. */
const onDay = (day: number): Cond => ({
  op: 'all',
  of: [
    { op: 'day.gte', value: day },
    { op: 'day.lte', value: day },
  ],
});

export const RULES: readonly DialogueRule[] = [
  // ——— Day 3 evening: she watched you pick a morning over her coffee.
  {
    id: 'barb-greeting-d3-room',
    speaker: 'barb',
    slot: 'greeting',
    when: onDay(3),
    requires: ['went-to-room-d3'],
    text: '“Up at Dianne’s all morning,” Barb says, setting the plate down soft. “Sheets on the line in November. There are worse ways to spend a morning than holding the other end of one.”',
  },
  {
    id: 'barb-greeting-d3-shed',
    speaker: 'barb',
    slot: 'greeting',
    when: onDay(3),
    requires: ['went-to-shed-d3'],
    text: '“The hammering let up a while, down the shed,” Barb says. “That’ll have been you. Sit. You’ve earned the chair by the heater.”',
  },
  // The trap sprang (playtest fix-02): she saw Sam come up the hill wrong,
  // and the chair-by-the-heater warmth would ring false. Neutral instead.
  {
    id: 'barb-greeting-d3-shed-sprung',
    speaker: 'barb',
    slot: 'greeting',
    when: {
      op: 'all',
      of: [onDay(3), { op: 'fact.exists', tag: 'fog-sam-trap-sprung' }],
    },
    requires: ['went-to-shed-d3'],
    text: '“Sam came up the hill before noon,” Barb says, and that is all she says about the morning. She pours, and watches the coffee instead of you, and lets the plate do the talking.',
  },
  {
    id: 'barb-greeting-d3-clinic',
    speaker: 'barb',
    slot: 'greeting',
    when: onDay(3),
    requires: ['went-to-clinic-d3'],
    text: '“Doctor get her look at you, then,” Barb says, pouring. “She writes it all down, that one. Always has. You’ll be a page by now.”',
  },

  // ——— Day 4 evening.
  {
    id: 'barb-greeting-d4-wharf',
    speaker: 'barb',
    slot: 'greeting',
    when: onDay(4),
    requires: ['went-to-wharf-d4'],
    text: '“Wade give you the tour?” Barb asks. “The half of it he gives, anyway.” She pours before you can answer either way.',
  },
  {
    id: 'barb-greeting-d4-walkin',
    speaker: 'barb',
    slot: 'greeting',
    when: onDay(4),
    requires: ['helped-barb-walkin'],
    text: '“I’ve been in that walk-in twice tonight just to look at it,” Barb says. “Don’t let on I said so.” The coffee lands with a little extra weight, which is thanks.',
  },
  {
    id: 'barb-greeting-d4-dianne',
    speaker: 'barb',
    slot: 'greeting',
    when: onDay(4),
    requires: ['went-to-dianne-d4'],
    text: '“Two mornings up that hill inside a week,” Barb says. “She’ll take to baking for you next. Nobody comes through that the same size.”',
  },
];
