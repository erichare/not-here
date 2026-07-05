/**
 * Reactive dialogue rules, selected via @not-here/memory's salience matcher.
 *
 * A scene paragraph whose text is '@line:<speaker>:<slot>' is realized by
 * selectLine() over this table (see content.ts). Every (speaker, slot) pair
 * used by a scene MUST include one zero-condition fallback — selectLine
 * throws otherwise, by design.
 */

import type { DialogueRule } from '@not-here/memory';

export const DIALOGUE_RULES: readonly DialogueRule[] = [
  // ——— Barb, evening greeting (Day 2 diner scene) ———

  // She witnessed the drying (fact 'helped-barb'): the book remembers, so she does.
  {
    id: 'barb-greeting-helped',
    speaker: 'barb',
    slot: 'greeting',
    requires: ['helped-barb'],
    salience: 1,
    text: 'Barb pours your coffee before you ask for it and sets it down where the good light is. "Anyone who dries a pot like that," she says, "sits where they like."',
  },

  // She saw you head up the hill this morning (fact 'went-to-dianne').
  {
    id: 'barb-greeting-dianne',
    speaker: 'barb',
    slot: 'greeting',
    requires: ['went-to-dianne'],
    text: '"How’s Dianne keeping?" Barb asks, not looking up from the till. It is the town’s whole question in the town’s voice: no weight on it anywhere, and all the weight under it.',
  },

  // You turned her supper down on Night 1 (fact 'refused-first-meal').
  // Salience lifts it past the lexicographic tie with barb-greeting-dianne
  // (playtest fix-15: the world must notice the Refuser); the helped-barb
  // greeting still wins its tie by id, warmth outranking the edge.
  {
    id: 'barb-greeting-refused',
    speaker: 'barb',
    slot: 'greeting',
    requires: ['refused-first-meal'],
    salience: 1,
    text: '"Eating tonight?" Barb asks. "Or shall I cook for the pleasure of it, like last night." There is no edge on it. There is a little edge on it.',
  },

  // Guaranteed fallback — no conditions, always eligible, chosen last.
  {
    id: 'barb-greeting-fallback',
    speaker: 'barb',
    slot: 'greeting',
    text: '"Evening," Barb says. "Heat’s on. Sit where you like."',
  },
];
