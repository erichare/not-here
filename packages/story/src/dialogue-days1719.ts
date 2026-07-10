/**
 * Dialogue rules for Days 17–19 (see scenes/day17.ts, day18.ts).
 *
 * Two dynamic slots:
 *  - barb / 'greeting-d17' — the Day-17 evening greeting; variants key on
 *    which morning slot the player took ('d17:slot' flag, player-visible
 *    state, no gossip hop needed) and on the exile staging.
 *  - dianne / 'evening-d18' — her line over the return parcels. The
 *    'ran-the-mail-d17' variant uses `requires`: Dianne witnessed the
 *    errand herself on Day 17 (fact.learn in scenes/day17.ts), so the tag
 *    is known to her by Day 18 with no gossip edge involved.
 *
 * Dianne addresses the player only as 'love' / 'hon' / 'my girl' — her one
 * use of the name lives in the Day-16 cluster, gated on 'lullaby-taken',
 * and nowhere near this file. Every (speaker, slot) pair carries a
 * zero-condition fallback — selectLine throws otherwise, by design.
 */

import type { DialogueRule } from '@not-here/memory';

export const RULES: readonly DialogueRule[] = [
  // ——— Barb, Day 17 evening greeting ———

  {
    id: 'barb-g17-clinic',
    speaker: 'barb',
    slot: 'greeting-d17',
    when: { op: 'flag', key: 'd17:slot', value: 'clinic' },
    text: '“Doctor kept the door for you, then,” Barb says, pouring. “She doesn’t hold doors. Sit — it’s the chowder or nothing, and it’s good it’s the chowder.”',
  },
  {
    id: 'barb-g17-mail',
    speaker: 'barb',
    slot: 'greeting-d17',
    when: { op: 'flag', key: 'd17:slot', value: 'mail' },
    text: '“Bundle made it across, Dianne’s tea got drunk, and my elastic came home,” Barb says, nodding you to the stool. “That’s a full day’s civics in this town. Sit.”',
  },
  {
    id: 'barb-g17-exiled',
    speaker: 'barb',
    slot: 'greeting-d17',
    when: { op: 'flag', key: 'potluck:verdict', value: 'exiled' },
    salience: 1,
    text: '“Wind’s off the water tonight,” Barb says, and sets the plate down where you sit now, which is a sentence too, if you can read her hand.',
  },
  {
    id: 'barb-g17-fallback',
    speaker: 'barb',
    slot: 'greeting-d17',
    text: '“Evening,” Barb says. “Fog’s taken the hill again. Sit while there’s soup.”',
  },

  // ——— Dianne, Day 18 evening — over the return parcels ———

  {
    id: 'dianne-e18-mail',
    speaker: 'dianne',
    slot: 'evening-d18',
    requires: ['ran-the-mail-d17'],
    salience: 1,
    text: '“Twice in two days I’ve had the good help,” Dianne says, cutting string to a length she doesn’t measure. “Hold that end, hon. We’ll have the hall’s dishes home by Friday.”',
  },
  {
    id: 'dianne-e18-exiled',
    speaker: 'dianne',
    slot: 'evening-d18',
    when: { op: 'flag', key: 'potluck:verdict', value: 'exiled' },
    text: '“There’s tea in the back still warm, hon,” Dianne says, before anything else, before hello. She looks at the parcels while she says it, and not at the door you came through.',
  },
  {
    id: 'dianne-e18-fallback',
    speaker: 'dianne',
    slot: 'evening-d18',
    text: '“Mind the string end, love — it whips,” Dianne says, by way of good evening, and clears you a working corner of the counter with one forearm.',
  },
];
