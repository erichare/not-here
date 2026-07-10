/**
 * Dialogue rules for Days 8–9 evening scenes (see scenes/day8.ts, day9.ts).
 *
 * Two reactive slots, both Barb's evening greeting:
 *
 *  - barb:greeting-d8 — keyed to the day's attended slot ('d8:slot'), same
 *    device as barb:greeting-d5. The wharf greeting reads the split without
 *    naming it (Barb pours either way).
 *  - barb:greeting-d9 — one GOSSIP-VISIBLE rule: 'helped-stockroom' is
 *    witnessed only by Dianne on Day 8; the dianne→barb edge lands it at
 *    the Day 8→9 boundary, and Barb credits her source ("Dianne says") so
 *    the route stays traceable. Salience 1 lets the carried fact outrank
 *    the same-day slot variants. The rest key on 'd9:slot'.
 *
 * Every (speaker, slot) pair carries a zero-condition fallback — selectLine
 * throws otherwise, by design. Prose invariants apply to rule texts too:
 * no touch, no remarking, no title phrase, no name.
 */

import type { DialogueRule } from '@not-here/memory';

export const RULES: readonly DialogueRule[] = [
  // ——— Barb, Day 8 evening greeting ———

  {
    id: 'barb-g8-stockroom',
    speaker: 'barb',
    slot: 'greeting-d8',
    when: { op: 'flag', key: 'd8:slot', value: 'stockroom' },
    text: '“You’ve the General’s back room on your sleeves,” Barb says, setting the plate down. “Shelf dust and brine. Dianne rang her order in an hour lighter than usual, so whatever you lifted, it wasn’t only jars.”',
  },
  {
    id: 'barb-g8-wharf',
    speaker: 'barb',
    slot: 'greeting-d8',
    when: { op: 'flag', key: 'd8:slot', value: 'wharf' },
    text: '“Down the wharf all morning,” Barb says. Not a question. She pours, and gives the plate a quarter-turn so the meat faces you. “Whatever Wade said, that’s likely the week’s ration of him. Eat.”',
  },
  {
    id: 'barb-g8-shed',
    speaker: 'barb',
    slot: 'greeting-d8',
    when: { op: 'flag', key: 'd8:slot', value: 'shed' },
    text: '“Boat shed, was it.” Barb sets the plate down and straightens the fork she just set straight. “You looked, then. That’s more than the rest of us have managed. Eat it hot.”',
  },
  {
    id: 'barb-g8-fallback',
    speaker: 'barb',
    slot: 'greeting-d8',
    text: '“Evening,” Barb says. “Chops night. Sit — they don’t improve for waiting and neither do you.”',
  },

  // ——— Barb, Day 9 evening greeting — the stockroom travelled dianne→barb ———

  {
    id: 'barb-g9-stockroom',
    speaker: 'barb',
    slot: 'greeting-d9',
    requires: ['helped-stockroom'],
    salience: 1,
    text: '“Dianne says her back room’s fit for a hard winter now,” Barb says, drawing your coffee. “Said it twice, which from her is a parade. You did good going up yesterday.” She leaves the pot within reach, which is its own remark.',
  },
  {
    id: 'barb-g9-clinic',
    speaker: 'barb',
    slot: 'greeting-d9',
    when: { op: 'flag', key: 'd9:slot', value: 'clinic' },
    text: '“Clinic kept, then,” Barb says, with the pot. “The doctor writes her page either way — you may as well be on it warm. Soup’s barley. Sit.”',
  },
  {
    id: 'barb-g9-ride',
    speaker: 'barb',
    slot: 'greeting-d9',
    when: { op: 'flag', key: 'd9:slot', value: 'ride' },
    text: '“Town and back with Tam again,” Barb says. “He’ll allow you ride quiet, and from Tam that’s a testimonial. Soup’s barley; the bread’s yesterday’s but the butter isn’t.”',
  },
  {
    id: 'barb-g9-walkin',
    speaker: 'barb',
    slot: 'greeting-d9',
    when: { op: 'flag', key: 'd9:slot', value: 'walkin' },
    text: '“You earned the noon plate,” Barb says, and puts down the evening one anyway. “Walk-in’s done till March. I’d say don’t let it go to your head, but there’s worse places for a shelved winter to go.”',
  },
  {
    id: 'barb-g9-fallback',
    speaker: 'barb',
    slot: 'greeting-d9',
    text: '“Clinic day,” Barb says, like a verdict on it. “Soup’s barley. Eat it while it argues.”',
  },
];
