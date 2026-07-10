/**
 * Dialogue rules for Days 10–11 evening scenes (see scenes/day10.ts,
 * scenes/day11.ts).
 *
 * Gossip visibility continues the Act 1 pattern: barb-g11-stove requires
 * 'sat-dianne-stove-d10', a fact witnessed only by Dianne — it reaches
 * Barb across the dianne→barb gossip edge at the Day 10→11 boundary, and
 * the line credits its source ("Dianne says") so the route stays traceable.
 *
 * One-warning rule (design/act2-beats.md §Day 11): NO rule in this file —
 * or any file, ever — references Barb's Night-11 warning. She says it once,
 * to the register, and the dialogue system is forbidden the callback.
 *
 * Every (speaker, slot) pair carries a zero-condition fallback — selectLine
 * throws otherwise, by design.
 */

import type { DialogueRule } from '@not-here/memory';

export const RULES: readonly DialogueRule[] = [
  // ——— Barb, Day 10 evening greeting ———

  {
    id: 'barb-g10-house',
    speaker: 'barb',
    slot: 'greeting-d10',
    when: { op: 'flag', key: 'd10:slot', value: 'house' },
    text: '“Woodsmoke on you,” Barb says, approving of it. “First fire up the house, and she kept you for it. She’ll have done soup off the front ring — sit anyway, there’s pie.”',
  },
  {
    id: 'barb-g10-hall',
    speaker: 'barb',
    slot: 'greeting-d10',
    when: { op: 'flag', key: 'd10:slot', value: 'hall' },
    text: '“Hall’s chalked and chaired, I hear,” Barb says, drawing your coffee. “List’ll be down to me for the buns line by supper’s end. Committees move paper the way rivers move silt.”',
  },
  {
    id: 'barb-g10-shed',
    speaker: 'barb',
    slot: 'greeting-d10',
    when: { op: 'flag', key: 'd10:slot', value: 'shed' },
    text: '“You’ve been down the shed,” Barb says, no question in it. She pours. “That boy eats standing up these days, when he eats. Take the stool he’d take, if he came.”',
  },
  {
    id: 'barb-g10-fallback',
    speaker: 'barb',
    slot: 'greeting-d10',
    text: '“Evening,” Barb says. “Fog’s in early and the special isn’t. Sit; it’ll find you.”',
  },

  // ——— Barb, Day 11 evening greeting — the gossip edge does its work ———
  // She witnessed none of Day 10's kitchen; Dianne told her, and she says so.

  {
    id: 'barb-g11-stove',
    speaker: 'barb',
    slot: 'greeting-d11',
    requires: ['sat-dianne-stove-d10'],
    salience: 1,
    text: '“Dianne says you sat her kitchen yesterday and did a bowl the credit it was owed,” Barb says, pouring. “She’d have told the whole street by noon. May have.”',
  },
  {
    id: 'barb-g11-albums',
    speaker: 'barb',
    slot: 'greeting-d11',
    when: { op: 'flag', key: 'd11:slot', value: 'albums' },
    text: '“Dianne kept you the whole morning, then,” Barb says, setting the plate. “Good. She talks better over pictures. Always did.”',
  },
  {
    id: 'barb-g11-counter',
    speaker: 'barb',
    slot: 'greeting-d11',
    when: { op: 'flag', key: 'd11:slot', value: 'counter' },
    text: '“Counter’s clear for the first time since the tubs came,” Barb says. “That’ll be your doing. Dianne doesn’t clear a backlog, she outlives it.”',
  },
  {
    id: 'barb-g11-fallback',
    speaker: 'barb',
    slot: 'greeting-d11',
    text: '“Soup night,” Barb says, already moving. “Don’t fight it.”',
  },
];
