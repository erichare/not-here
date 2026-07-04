/**
 * NIGHT 1 — the vertical slice opening: title beat, the gravel beach below
 * the old wharf (clue #1), the walk into town, the Kettle (first meal,
 * Moose — clue #4), the Counter Interview (see ./interview.ts), the room,
 * and the first 3:12 AM horn. Terminates (after Day 2, see ./day2.ts) at
 * 'slice-end'.
 *
 * Prose invariants in force (design/game-bible.md §Prose grammar):
 * nobody touches you first; the "soaked" clothes carry no lake on them;
 * the dog never growls; nobody remarks that any of this is strange.
 */

import { defineScene, type Scene } from '@not-here/engine';
import { INTERVIEW_SCENES } from './interview.ts';

const title = defineScene({
  id: 'n1-title',
  prose: {
    kind: 'inline',
    paragraphs: [
      {
        text: 'Lorn Bay, British Columbia. The first week of November. In July there are paddleboards and tasting rooms and a beach you can’t see the sand of. In November there are three hundred people, eleven lit windows, and a fog that sits on the lake for weeks. The snowline comes down the hills a little every night.',
      },
      { text: 'Tonight the fog is in. It usually is.' },
      {
        text: 'At 3:12 in the morning the horn on the old ferry wharf will play five bars of a song and stop. Nobody will wake for it. It has done this every night for seven years.',
      },
    ],
  },
  choices: [{ id: 'open-eyes', label: 'Open your eyes.', goto: 'n1-beach' }],
  cue: 'title',
});

const beach = defineScene({
  id: 'n1-beach',
  slot: 'night',
  onEnter: [{ op: 'fact.add', tag: 'woke-on-beach' }],
  prose: {
    kind: 'inline',
    paragraphs: [
      {
        text: 'Gravel. You know that first: lake stones, rounded, dark where they face the water and grey where they don’t. You are lying on them and they have not hurt you.',
      },
      {
        text: 'You sit up. The old ferry wharf stands over you on its pilings, and at the end of it the breakwater light turns, trawling the fog and catching nothing.',
      },
      {
        text: 'Your clothes are soaked through. That is the story your clothes tell, anyway. But there is no lake smell on you, no milfoil in your cuffs, and your hair is dry at the roots. This is a November night that would kill a swimmer in forty minutes, and there is no cold in you for it to speak to.',
      },
      {
        text: 'You stand. The stones shift and settle under your boots the way they would for anyone.',
      },
      {
        text: 'Up the shore, set back from the waterline, there are lights. Not many. A town’s worth, off-season.',
      },
    ],
  },
  choices: [
    {
      id: 'look-at-water',
      label: 'Look at the water first.',
      effects: [{ op: 'flag.set', key: 'n1:looked-back', value: true }],
      goto: 'n1-walk',
    },
    { id: 'walk-to-town', label: 'Walk toward the lights.', goto: 'n1-walk' },
  ],
  cue: 'shingle',
});

const walk = defineScene({
  id: 'n1-walk',
  slot: 'night',
  prose: {
    kind: 'inline',
    paragraphs: [
      {
        text: 'The lake is flat and black and gives you nothing back. You look at it a while anyway, in case.',
        when: { op: 'flag', key: 'n1:looked-back' },
      },
      {
        text: 'The road up from the beach runs between orchard rows. Somewhere above town a frost fan is going, a low steady roar the dark stopped noticing years ago. The fog stands thick at the bends and thin where the fan works at it. You walk through both kinds.',
      },
      {
        text: 'The town starts without announcing itself. A boat-wash sign, then a streetlight. One to a corner, each wearing its own sleeve of fog.',
      },
      {
        text: 'Every window is dark except one. Low, wide, yellow, at the bottom of the hill where the water must be — a diner window, with a sign over it you can’t read from here and don’t need to. It is the only lit thing in Lorn Bay that isn’t the breakwater light.',
      },
      {
        text: 'You walk toward it. Your boots are loud and then quieter: somewhere back there the gravel shoulder became sidewalk and you didn’t notice the change.',
      },
    ],
  },
  choices: [{ id: 'go-in', label: 'Go in.', goto: 'n1-diner' }],
});

const diner = defineScene({
  id: 'n1-diner',
  slot: 'night',
  prose: {
    kind: 'inline',
    paragraphs: [
      {
        text: 'The Kettle. A diner room with six motel units out back, a shelf of mugs with names on them, chairs up on half the tables. The warmth meets you at the door and goes through you on its way out.',
      },
      {
        text: 'A woman behind the counter, sixty-odd, sleeves pushed up, wiping a stretch of counter she has plainly already wiped. She looks at you for exactly as long as it takes to look at someone.',
      },
      { text: '"Well," she says. "Sit down before you fall down."' },
      {
        text: 'She doesn’t ask who you are. She racks the cloth, takes down a plate, and goes through to the kitchen. Nobody else is in. The coffee maker ticks.',
      },
    ],
  },
  choices: [{ id: 'sit', label: 'Sit at the counter.', goto: 'n1-meal' }],
  cue: 'pub-warm',
});

const meal = defineScene({
  id: 'n1-meal',
  slot: 'night',
  prose: {
    kind: 'inline',
    paragraphs: [
      {
        text: 'The plate comes back loaded: hash browns, a pork chop, gravy over all of it, toast on the side to make the point. She sets it down in front of you and stands the ketchup beside it.',
      },
      {
        text: '"That was the last of the chops," she says, to the room, not to you. "Kitchen’s closed." It was hers. You understand that without being told, and she watches you understand it.',
      },
      { text: '"Barb," she says, as if answering something. "Barb Kettle. Eat."' },
    ],
  },
  choices: [
    {
      id: 'eat-all',
      label: 'Eat. All of it.',
      effects: [
        { op: 'stat.add', stat: 'flesh', value: 2 },
        { op: 'fact.add', tag: 'ate-first-meal', witnessedBy: ['barb'] },
      ],
      goto: 'n1-moose',
    },
    {
      id: 'eat-some',
      label: 'Eat a little, to be polite.',
      effects: [
        { op: 'stat.add', stat: 'flesh', value: 1 },
        { op: 'fact.add', tag: 'picked-at-meal', witnessedBy: ['barb'] },
      ],
      goto: 'n1-moose',
    },
    {
      id: 'refuse',
      label: '"I’m not hungry."',
      effects: [
        { op: 'stat.add', stat: 'undertow', value: 1 },
        { op: 'flag.set', key: 'n1:refused-meal', value: true },
        { op: 'fact.add', tag: 'refused-first-meal', witnessedBy: ['barb'] },
      ],
      goto: 'n1-moose',
    },
  ],
});

const moose = defineScene({
  id: 'n1-moose',
  slot: 'night',
  prose: {
    kind: 'inline',
    paragraphs: [
      {
        text: 'The food does something the warmth couldn’t. Weight, maybe. By the end of the plate you feel the stool under you differently, the floor through your boots.',
        when: { op: 'fact.knownBy', who: 'barb', tag: 'ate-first-meal' },
      },
      {
        text: 'You eat some of the hash browns and let the rest cool into evidence. Barb doesn’t remark on it.',
        when: { op: 'fact.knownBy', who: 'barb', tag: 'picked-at-meal' },
      },
      {
        text: 'Barb takes the plate back without a word and doesn’t scrape it. She covers it and puts it in the walk-in. The subject is closed.',
        when: { op: 'flag', key: 'n1:refused-meal' },
      },
      {
        text: 'There is a dog by the door you had taken for a dropped coat. Old, heavy, some kind of lab under some kind of everything else, grey to the eyebrows.',
      },
      {
        text: 'He gets up, works his hips loose, and crosses the room. He passes so close his fur should brush your shin. It doesn’t. He goes by the way a dog goes by a chair it has known all its life, and settles at the door, facing the parking lot.',
      },
      {
        text: '"Moose," Barb says. "He waits up for Tam’s last run. There’s no last run tonight."',
      },
    ],
  },
  choices: [
    {
      id: 'say-his-name',
      label: 'Say his name.',
      effects: [
        { op: 'flag.set', key: 'n1:spoke-to-moose', value: true },
        { op: 'stat.add', stat: 'echo', value: 1 },
      ],
      goto: 'n1-interview-1',
    },
    {
      id: 'reach-for-him',
      label: 'Put your hand down where he could find it.',
      effects: [{ op: 'flag.set', key: 'n1:reached-for-moose', value: true }],
      goto: 'n1-interview-1',
    },
    { id: 'let-him-be', label: 'Let him be.', goto: 'n1-interview-1' },
  ],
});

const room = defineScene({
  id: 'n1-room',
  slot: 'night',
  prose: {
    kind: 'inline',
    paragraphs: [
      {
        text: 'Barb writes you into the book herself: the date, the unit, the supper. The NAME column she leaves blank — leaves it the way you’d leave a chair, for someone.',
      },
      {
        text: 'She blots the line and closes the book on it. "That’ll do," she says. "Unit one. It’s made up. Door sticks — lift it."',
      },
      {
        text: 'The units are out back, six doors under one long gutter. Unit one is small and clean: bed, chair, a baseboard heater ticking up to temperature, a window with the lake in it. Through the thinning fog you can make out the breakwater, the black water it keeps, and the light going round and round at the end of the old wharf.',
      },
      {
        text: 'Across the lot, faintly, Barb’s voice — low, one side of a conversation. She is talking to the dog, or to the book. Then the diner sign goes out, and the fog closes over where it was.',
      },
      { text: 'You lie down in your clothes and put the light out.' },
    ],
  },
  choices: [
    { id: 'sleep', label: 'Sleep, or something like it.', goto: 'n1-312' },
    {
      id: 'window-first',
      label: 'Stand at the window a while first.',
      effects: [{ op: 'flag.set', key: 'n1:watched-lake', value: true }],
      goto: 'n1-312',
    },
  ],
});

const horn = defineScene({
  id: 'n1-312',
  slot: 'night',
  onEnter: [
    { op: 'flag.set', key: 'heard-horn-312', value: true },
    { op: 'fact.add', tag: 'heard-first-horn' },
  ],
  prose: {
    kind: 'inline',
    paragraphs: [
      {
        text: 'The lake keeps no hours worth watching. A loon calls once, far out in the fog, and thinks better of it. Eventually you lie down anyway.',
        when: { op: 'flag', key: 'n1:watched-lake' },
      },
      { text: 'You surface at 3:12 exactly, called up through the wall.' },
      {
        text: 'The horn. But it doesn’t just sound — it plays. Notes, held and bent, a phrase with a middle to it. Five bars of a tune, carried up from the wharf on the fog, patient as weather.',
      },
      {
        text: 'It goes once through and stops where something else should start. You wait for the rest. There is no rest.',
      },
      {
        text: 'You know the tune. You knew it before you were awake. You could hum every note of the five bars, and not one note of what comes after — that place is smooth and blank, like the face of a worn coin.',
      },
      {
        text: 'No light comes on anywhere in the town. Nobody wakes for it. It is, apparently, just what the nights do here.',
      },
    ],
  },
  choices: [
    {
      id: 'listen',
      label: 'Listen until you are sure it is finished.',
      goto: 'd2-wake',
    },
    {
      id: 'hand-to-wall',
      label: 'Press your palm flat to the wall.',
      effects: [{ op: 'stat.add', stat: 'echo', value: 1 }],
      goto: 'd2-wake',
    },
  ],
  cue: 'foghorn-312',
});

const sliceEnd = defineScene({
  id: 'slice-end',
  prose: {
    kind: 'inline',
    paragraphs: [
      { text: 'Here the fog closes over Lorn Bay, for now.' },
      {
        text: 'Two nights in. Twenty-one to go — the schedule card on the corkboard says so, ringed twice, pressed through to the cork.',
      },
      {
        text: 'The horn will play again tomorrow at 3:12. Five bars, then the stop. Somebody, somewhere, knows the sixth.',
      },
      { text: 'TO BE CONTINUED.' },
    ],
  },
  choices: [],
  cue: 'title',
  ending: 'slice-end',
});

export const NIGHT1_SCENES: readonly Scene[] = [
  title,
  beach,
  walk,
  diner,
  meal,
  moose,
  ...INTERVIEW_SCENES,
  room,
  horn,
  sliceEnd,
];
