/**
 * Dialogue rules for Days 14–16 (see scenes/day14.ts, day15.ts, day16.ts).
 *
 * Two slots:
 *  - barb:greeting-d14 — the morning after the verdict. The exiled rule is
 *    the act's kindest lie: Barb serves you like nothing happened, and the
 *    line never once looks at the wharf. The defended rule carries the
 *    overcorrecting town. Verdict staging keys on 'potluck:verdict'
 *    (act2-shared conditions inlined here as flag checks — DialogueRule
 *    takes plain Conds).
 *  - dianne:supper-d15 — one line of Dianne per supper staging: the wharf
 *    dish (exiled — highest salience; shame with no sentence to live in),
 *    the Kettle back table ('dianne:locks-house' — never explained), and
 *    the house supper fallback.
 *
 * Every (speaker, slot) pair carries a zero-condition fallback — selectLine
 * throws otherwise, by design. Prose invariants apply to rule texts too:
 * no NPC-initiated touch, Dianne says only 'love' / 'hon' / 'my girl',
 * nobody remarks that anything is strange.
 */

import type { DialogueRule } from '@not-here/memory';

export const RULES: readonly DialogueRule[] = [
  // ——— Barb, Day 14 morning greeting ———

  {
    id: 'barb-g14-exiled',
    speaker: 'barb',
    slot: 'greeting-d14',
    when: { op: 'flag', key: 'potluck:verdict', value: 'exiled' },
    salience: 1,
    text: '“Sit,” Barb says, pot already travelling. “Eggs are on.” The plate arrives the way it arrived on the eighth, and the ninth, and every morning since — as if the walk you took to get here were the same length as everyone else’s.',
  },
  {
    id: 'barb-g14-defended',
    speaker: 'barb',
    slot: 'greeting-d14',
    when: { op: 'flag', key: 'potluck:verdict', value: 'defended' },
    text: '“There’s cinnamon buns,” Barb says, in the tone of a woman reporting a third batch this week. “Alma sent them up. Again.” She sets two down without asking. The town has decided to be good to you, and Barb is letting it, and watching it do it.',
  },
  {
    id: 'barb-g14-fallback',
    speaker: 'barb',
    slot: 'greeting-d14',
    text: '“Morning,” Barb says, and the coffee is there before the stool has taken your weight.',
  },

  // ——— Dianne, Day 15 supper ———

  {
    id: 'dianne-s15-exiled',
    speaker: 'dianne',
    slot: 'supper-d15',
    when: { op: 'flag', key: 'potluck:verdict', value: 'exiled' },
    salience: 2,
    text: '“It wanted eating hot,” Dianne says, to the dish, after — as near to sorry as the wind lets her get. “I’ll come down again. It’s no walk at all.” It is a long walk, and the whole town watched her take it.',
  },
  {
    id: 'dianne-s15-locks',
    speaker: 'dianne',
    slot: 'supper-d15',
    when: { op: 'flag', key: 'dianne:locks-house' },
    salience: 1,
    text: '“The back table’s cosier anyhow,” Dianne says, unpacking, not looking up, daring nothing in particular to disagree.',
  },
  {
    id: 'dianne-s15-fallback',
    speaker: 'dianne',
    slot: 'supper-d15',
    text: '“Eat while it’s hot, love. There’s more than we’ll get through — that’s the point of it.”',
  },
];
