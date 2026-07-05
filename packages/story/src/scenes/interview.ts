/**
 * THE COUNTER INTERVIEW — Night 1, the Kettle.
 *
 * Character creation as five strange questions over decaf. Each answer
 * weights stats (Effect stat.add) and sets one self-truth flag (see
 * ../truths.ts). Barb asks everyone who stops here these questions; nobody,
 * least of all Barb, treats them as anything. This is the multiple-choice
 * fallback build of LLM touchpoint 1 — the canonical no-key path.
 *
 * Post-reveal note (clue #11): these answers are woven, inverted, into the
 * main theme from the title screen. What you tell Barb tonight, the fog
 * already used.
 */

import { defineScene, type Effect, type Scene } from '@not-here/engine';
import { truthFlag } from '../truths.ts';

/**
 * Night-1 ECHO seeding, capped (playtest fix-10): every attunement pick in
 * the interview and the Night-1 habit beats grants at most +1, and grants
 * stop once ECHO reaches 4 (baseline 2 + 2 seeded). The d3-shed correction
 * stays gated at ECHO≥3 — "barely reachable" exactly as the beat sheet asks.
 */
export const echoSeed: Effect = {
  op: 'when',
  cond: { op: 'stat.lte', stat: 'echo', value: 3 },
  then: [{ op: 'stat.add', stat: 'echo', value: 1 }],
};

const q1 = defineScene({
  id: 'n1-interview-1',
  slot: 'night',
  prose: {
    kind: 'inline',
    paragraphs: [
      {
        text: '"Moose." The dog comes off the floor all at once, up and turned, staring past your shoulder at the room in general. His tail gives one uncertain beat. Then whatever it was is over for him; he circles twice, lies back down with his spine to you, and is asleep before you have finished being sorry.',
        when: { op: 'flag', key: 'n1:spoke-to-moose' },
      },
      {
        text: 'You put your hand down where his nose could find it. He does not lift his head. His breathing does not change. After a while you take the hand back.',
        when: { op: 'flag', key: 'n1:reached-for-moose' },
      },
      {
        text: 'Barb comes back with the decaf pot and two mugs, pours both, pushes one across the counter. She does not sit. Owners don’t.',
      },
      {
        text: '"Now," she says. "Few things I ask anybody who stops here. No harm in any of them."',
      },
      {
        text: '"Where’ll you want to sit, mornings? Window looks at the lake. Booth’s by the kitchen and looks at nothing."',
      },
    ],
  },
  choices: [
    {
      id: 'q1-booth',
      label: '"The booth."',
      effects: [
        { op: 'stat.add', stat: 'flesh', value: 1 },
        { op: 'stat.add', stat: 'undertow', value: 1 },
        { op: 'flag.set', key: truthFlag('hates-the-lake'), value: true },
      ],
      goto: 'n1-interview-2',
    },
    {
      id: 'q1-window',
      label: '"The window."',
      effects: [
        echoSeed,
        { op: 'flag.set', key: truthFlag('misses-the-lake'), value: true },
      ],
      goto: 'n1-interview-2',
    },
    {
      id: 'q1-wherever',
      label: '"Wherever’s free."',
      effects: [
        { op: 'stat.add', stat: 'name', value: 2 },
        { op: 'flag.set', key: truthFlag('travels-light'), value: true },
      ],
      goto: 'n1-interview-2',
    },
  ],
});

const q2 = defineScene({
  id: 'n1-interview-2',
  slot: 'night',
  prose: {
    kind: 'inline',
    paragraphs: [
      {
        text: 'She nods as if you have confirmed something she had money on. The lid comes off a sugar jar old enough to have opinions.',
      },
      { text: '"Sugar?"' },
    ],
  },
  choices: [
    {
      id: 'q2-however',
      label: '"However it comes."',
      effects: [
        { op: 'stat.add', stat: 'flesh', value: 2 },
        { op: 'flag.set', key: truthFlag('eats-what-is-given'), value: true },
      ],
      goto: 'n1-interview-3',
    },
    {
      id: 'q2-two-heaped',
      label: '"Two. Heaped."',
      effects: [
        echoSeed,
        { op: 'flag.set', key: truthFlag('wants-to-be-seen'), value: true },
      ],
      goto: 'n1-interview-3',
    },
    {
      id: 'q2-none',
      label: '"None."',
      effects: [
        { op: 'stat.add', stat: 'undertow', value: 2 },
        { op: 'flag.set', key: truthFlag('travels-light'), value: true },
      ],
      goto: 'n1-interview-3',
    },
  ],
});

const q3 = defineScene({
  id: 'n1-interview-3',
  slot: 'night',
  prose: {
    kind: 'inline',
    paragraphs: [
      {
        text: 'She brings the tab book up from under the counter. It opens flat at a working page: columns, dates, small marginal weather. She uncaps a pen.',
      },
      {
        text: '"I keep the book," she says. "Everyone that stops. What am I writing?"',
      },
      { text: 'She is not asking your name. She is asking what she writes.' },
    ],
  },
  choices: [
    {
      id: 'q3-what-they-call-me',
      label: '"Whatever the town’s calling me."',
      effects: [
        echoSeed,
        { op: 'stat.add', stat: 'name', value: 1 },
        { op: 'flag.set', key: truthFlag('lies-easily'), value: true },
      ],
      goto: 'n1-interview-4',
    },
    {
      id: 'q3-whats-true',
      label: '"Write what’s true."',
      effects: [
        { op: 'stat.add', stat: 'undertow', value: 2 },
        { op: 'flag.set', key: truthFlag('wants-to-be-seen'), value: true },
      ],
      goto: 'n1-interview-4',
    },
    {
      id: 'q3-on-the-tab',
      label: '"Put dinner down as owed."',
      effects: [
        { op: 'stat.add', stat: 'name', value: 2 },
        { op: 'flag.set', key: truthFlag('keeps-promises'), value: true },
      ],
      goto: 'n1-interview-4',
    },
  ],
});

const q4 = defineScene({
  id: 'n1-interview-4',
  slot: 'night',
  prose: {
    kind: 'inline',
    paragraphs: [
      {
        text: 'Whatever she writes, she writes it small and does not show you. The pen stays out.',
      },
      {
        text: '"Sleep light or heavy? Horn goes at night, out on the wharf. Some can’t keep from listening for it."',
      },
    ],
  },
  choices: [
    {
      id: 'q4-light',
      label: '"Light. I’ll listen."',
      effects: [
        echoSeed,
        { op: 'flag.set', key: truthFlag('afraid-of-quiet'), value: true },
      ],
      goto: 'n1-interview-5',
    },
    {
      id: 'q4-heavy',
      label: '"Heavy. Nothing wakes me."',
      effects: [
        { op: 'stat.add', stat: 'flesh', value: 2 },
        { op: 'flag.set', key: truthFlag('lies-easily'), value: true },
      ],
      goto: 'n1-interview-5',
    },
    {
      id: 'q4-dont-sleep',
      label: '"I don’t sleep much."',
      effects: [
        { op: 'stat.add', stat: 'undertow', value: 2 },
        { op: 'flag.set', key: truthFlag('afraid-of-quiet'), value: true },
      ],
      goto: 'n1-interview-5',
    },
  ],
});

const q5 = defineScene({
  id: 'n1-interview-5',
  slot: 'night',
  prose: {
    kind: 'inline',
    paragraphs: [
      {
        text: 'The last one she asks into the book, writing something else while she does, as if the question were nothing and the marginal weather were the point.',
      },
      {
        text: '"The place you came from. Did you say goodbye to it?"',
      },
    ],
  },
  choices: [
    {
      id: 'q5-never-do',
      label: '"No. I never do."',
      effects: [
        { op: 'stat.add', stat: 'undertow', value: 2 },
        { op: 'flag.set', key: truthFlag('never-says-goodbye'), value: true },
      ],
      goto: 'n1-room',
    },
    {
      id: 'q5-dont-remember',
      label: '"I don’t remember leaving it."',
      effects: [
        echoSeed,
        { op: 'flag.set', key: truthFlag('doesnt-remember-leaving'), value: true },
      ],
      goto: 'n1-room',
    },
    {
      id: 'q5-said-it-to-the-door',
      label: '"I said it to the door."',
      effects: [
        { op: 'stat.add', stat: 'flesh', value: 1 },
        { op: 'stat.add', stat: 'name', value: 1 },
        { op: 'flag.set', key: truthFlag('keeps-promises'), value: true },
      ],
      goto: 'n1-room',
    },
  ],
});

export const INTERVIEW_SCENES: readonly Scene[] = [q1, q2, q3, q4, q5];
