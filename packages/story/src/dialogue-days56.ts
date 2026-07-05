/**
 * Dialogue rules for Days 5–6 evening scenes (see scenes/day5.ts, day6.ts).
 *
 * Gossip visibility lives here. Rules whose `requires` name facts the speaker
 * never witnessed only fire once the fact has travelled a gossip edge
 * (content.ts GOSSIP_EDGES, propagated at day boundaries):
 *
 *  - tam-e5-*: Tam requires Day-2 facts witnessed only by Barb
 *    ('helped-barb', 'went-to-dianne') — one hop, barb→tam, landed at the
 *    Day 2→3 boundary. Each line credits Barb, so the route is traceable.
 *  - barb-g6-*: Barb requires Day-5 facts witnessed only by Tam or Dianne
 *    ('told-tam-staying', 'rode-with-tam' via tam→barb; 'helped-hall' via
 *    dianne→barb) — landed at the Day 5→6 boundary. Each line names its
 *    source ("Tam tells me", "Dianne says").
 *
 * Every (speaker, slot) pair carries a zero-condition fallback — selectLine
 * throws otherwise, by design.
 */

import type { DialogueRule } from '@not-here/memory';

export const RULES: readonly DialogueRule[] = [
  // ——— Barb, Day 5 evening greeting ———

  {
    id: 'barb-g5-rode',
    speaker: 'barb',
    slot: 'greeting-d5',
    when: { op: 'flag', key: 'd5:slot', value: 'ride' },
    text: '"Town and back in a day," Barb says, drawing your coffee. "That’s more Penticton than most of us take in a month. Sit — plate’s hot."',
  },
  {
    id: 'barb-g5-hall',
    speaker: 'barb',
    slot: 'greeting-d5',
    when: { op: 'flag', key: 'd5:slot', value: 'hall' },
    text: '"You’ve hall dust on your sleeve," Barb says, approving of it. "Dianne feed you? She’ll have fed you. Sit anyway."',
  },
  {
    id: 'barb-g5-fallback',
    speaker: 'barb',
    slot: 'greeting-d5',
    text: '"Evening," Barb says. "It’s stew or it’s stew. You’ll have the stew."',
  },

  // ——— Tam, Day 5 evening — FIRST GOSSIP VISIBILITY ———
  // He witnessed neither fact; Barb told him, and he says so.

  {
    id: 'tam-e5-helped-barb',
    speaker: 'tam',
    slot: 'evening-d5',
    requires: ['helped-barb'],
    salience: 1,
    text: 'Tam turns his mug a quarter-turn and considers you over it. "Barb tells me you dry a pot properly," he says at last. "She has never once said that about anybody." He goes back to his coffee as if a form has been signed and filed.',
  },
  {
    id: 'tam-e5-dianne',
    speaker: 'tam',
    slot: 'evening-d5',
    requires: ['went-to-dianne'],
    text: '"Heard you gave Dianne your first morning here," Tam says, to his coffee, not to you. "Barb keeps me current whether I ask or not." A while later, unattached to anything: "That store runs on string and her nerve. It was good you went."',
  },
  // The Refuser's route reaches the gossip mechanic too (playtest fix-15):
  // Barb witnessed the refused plate on Night 1; the barb→tam edge carried
  // it. Salience matches tam-e5-helped-barb — warmth wins that tie by id,
  // but a pure Refuser has no warmth in the table, and hears this.
  {
    id: 'tam-e5-refused-plate',
    speaker: 'tam',
    slot: 'evening-d5',
    requires: ['refused-first-meal'],
    salience: 1,
    text: '“Barb says you sat a full plate out, first night,” Tam offers, to the counter, not to you. “She’s told it three times now. It gets colder every telling.”',
  },
  {
    id: 'tam-e5-fallback',
    speaker: 'tam',
    slot: 'evening-d5',
    text: 'Tam is at his stool with his cap on the counter. When you come in he lifts two fingers off the mug, which is his whole speech on most subjects.',
  },

  // ——— Barb, Day 6 evening greeting — the gossip has teeth now ———

  {
    id: 'barb-g6-staying',
    speaker: 'barb',
    slot: 'greeting-d6',
    requires: ['told-tam-staying'],
    salience: 1,
    text: '"Staying past the twenty-eighth, Tam tells me," Barb says, setting the plate down. She looks at you one beat longer than the plate needs. "I’ll hold the unit through December, then." She doesn’t go near the book to write it down.',
  },
  {
    id: 'barb-g6-rode',
    speaker: 'barb',
    slot: 'greeting-d6',
    requires: ['rode-with-tam'],
    text: '"Tam allows the run went fine yesterday," Barb says, pouring. "That’s him raving, so it must have."',
  },
  {
    id: 'barb-g6-helped-hall',
    speaker: 'barb',
    slot: 'greeting-d6',
    requires: ['helped-hall'],
    text: '"Dianne says you carried tables yesterday till the doctor ran out of list," Barb says. "She told me twice. She liked telling it."',
  },
  {
    id: 'barb-g6-fallback',
    speaker: 'barb',
    slot: 'greeting-d6',
    text: '"In early," Barb says, tipping her head at the window. "Fog’s moved supper up for everyone. Sit; it’s soup."',
  },
];
