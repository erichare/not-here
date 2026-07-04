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
  // ——— Maud, evening greeting (Day 2 pub scene) ———

  // She witnessed the drying (fact 'helped-maud'): the ledger remembers, so she does.
  {
    id: 'maud-greeting-helped',
    speaker: 'maud',
    slot: 'greeting',
    requires: ['helped-maud'],
    salience: 1,
    text: 'Maud draws your half before you ask for it and sets it down where the good light is. "Anyone who dries a pot like that," she says, "sits where they like."',
  },

  // She saw you go up the street this morning (fact 'went-to-dora').
  {
    id: 'maud-greeting-dora',
    speaker: 'maud',
    slot: 'greeting',
    requires: ['went-to-dora'],
    text: '"How’s Dora keeping?" Maud asks, not looking up from the pumps. It is the town’s whole question in the town’s voice: no weight on it anywhere, and all the weight under it.',
  },

  // You turned her supper down on Night 1 (fact 'refused-first-meal').
  {
    id: 'maud-greeting-refused',
    speaker: 'maud',
    slot: 'greeting',
    requires: ['refused-first-meal'],
    text: '"Eating tonight?" Maud asks. "Or shall I cook for the pleasure of it, like last night." There is no edge on it. There is a little edge on it.',
  },

  // Guaranteed fallback — no conditions, always eligible, chosen last.
  {
    id: 'maud-greeting-fallback',
    speaker: 'maud',
    slot: 'greeting',
    text: '"Evening," Maud says. "Fire’s good. Sit where you like."',
  },
];
