/**
 * NIGHT 1 — the vertical slice opening: title beat, the shingle (clue #1),
 * the walk into town, the Kettle & Anchor (first meal, Cobble — clue #4),
 * the Pub Interview (see ./interview.ts), the room, and the first 3:12 AM
 * foghorn. Terminates (after Day 2, see ./day2.ts) at 'slice-end'.
 *
 * Prose invariants in force (design/game-bible.md §Prose grammar):
 * nobody touches you first; salt is DRY; the dog never growls; nobody
 * remarks that any of this is strange.
 */

import { defineScene, type Scene } from '@not-here/engine';
import { INTERVIEW_SCENES } from './interview.ts';

const title = defineScene({
  id: 'n1-title',
  prose: {
    kind: 'inline',
    paragraphs: [
      {
        text: 'Port Lorn, spring, 1971. A ferry town on a tidal causeway. Twice a day the road to the mainland drowns; twice a day it comes back. The tide tables are pinned up in every kitchen, and they are consulted the way scripture is consulted, which is to say constantly, and mostly about small things.',
      },
      { text: 'Tonight the fog is in. It usually is.' },
      {
        text: 'At 3:12 in the morning the lighthouse will play five bars of a song and stop. Nobody will wake for it. It has done this every night for seven years.',
      },
    ],
  },
  choices: [{ id: 'open-eyes', label: 'Open your eyes.', goto: 'n1-shingle' }],
  cue: 'title',
});

const shingle = defineScene({
  id: 'n1-shingle',
  slot: 'night',
  onEnter: [{ op: 'fact.add', tag: 'woke-on-shingle' }],
  prose: {
    kind: 'inline',
    paragraphs: [
      {
        text: 'Shingle. You know that first: stones the size of fists, rounded, wet where they face the water and grey where they don’t. You are lying on them and they have not hurt you.',
      },
      {
        text: 'You sit up. The lighthouse stands over you with its light going round, trawling the fog and catching nothing.',
      },
      {
        text: 'Your clothes are soaked through. That is the story your clothes tell, anyway. But the salt crusted in your seams is dry — dry as flour, dry as a road in August — and when the wind comes off the water it goes through your coat and finds no cold in you to speak to.',
      },
      {
        text: 'You stand. The stones shift and settle under your boots the way they would for anyone.',
      },
      {
        text: 'Down the beach, set back from the tideline, there are lights. Not many. A town’s worth, off-season.',
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
        text: 'The water is flat and black and gives you nothing back. You look at it a while anyway, in case.',
        when: { op: 'flag', key: 'n1:looked-back' },
      },
      {
        text: 'The road up from the beach is single-track, hedged with gorse. The fog stands in it the way fog stands in a lane at night: thick at the bends, thin where the wind works at it. You walk through both kinds.',
      },
      {
        text: 'The town starts without announcing itself. A wall, then a lamp. Sodium lamps, orange, one to a corner, each wearing its own sleeve of fog.',
      },
      {
        text: 'Every window is dark except one. Low, wide, yellow, at the bottom of the street where the harbour must be — a pub window, with a sign over it you can’t read from here and don’t need to. It is the only lit thing in Port Lorn that isn’t the lighthouse.',
      },
      {
        text: 'You walk toward it. Your boots are loud and then quieter: somewhere back there the road gave way to cobbles and you didn’t notice the change.',
      },
    ],
  },
  choices: [{ id: 'go-in', label: 'Go in.', goto: 'n1-pub' }],
});

const pub = defineScene({
  id: 'n1-pub',
  slot: 'night',
  prose: {
    kind: 'inline',
    paragraphs: [
      {
        text: 'The Kettle & Anchor. Brass on the beams, a fire banked low, chairs up on half the tables. The warmth meets you at the door and goes through you on its way out.',
      },
      {
        text: 'A woman behind the bar, sixty-odd, sleeves rolled, drying a glass she has plainly already dried. She looks at you for exactly as long as it takes to look at someone.',
      },
      { text: '"Well," she says. "Sit down before you fall down."' },
      {
        text: 'She doesn’t ask who you are. She puts the glass away, takes down a plate, and goes through to the back. Nobody else is in. The fire ticks.',
      },
    ],
  },
  choices: [{ id: 'sit', label: 'Sit at the bar.', goto: 'n1-meal' }],
  cue: 'pub-warm',
});

const meal = defineScene({
  id: 'n1-meal',
  slot: 'night',
  prose: {
    kind: 'inline',
    paragraphs: [
      {
        text: 'The plate comes back loaded: potatoes, a chop, gravy over all of it, bread on the side to make the point. She sets it down in front of you and stands the salt cellar beside it.',
      },
      {
        text: '"There’s no more of the chop," she says, to the room, not to you. "That was the last of it." It was hers. You understand that without being told, and she watches you understand it.',
      },
      { text: '"Maud," she says, as if answering something. "Maud Kettle. Eat."' },
    ],
  },
  choices: [
    {
      id: 'eat-all',
      label: 'Eat. All of it.',
      effects: [
        { op: 'stat.add', stat: 'flesh', value: 2 },
        { op: 'fact.add', tag: 'ate-first-meal', witnessedBy: ['maud'] },
      ],
      goto: 'n1-cobble',
    },
    {
      id: 'eat-some',
      label: 'Eat a little, to be polite.',
      effects: [
        { op: 'stat.add', stat: 'flesh', value: 1 },
        { op: 'fact.add', tag: 'picked-at-meal', witnessedBy: ['maud'] },
      ],
      goto: 'n1-cobble',
    },
    {
      id: 'refuse',
      label: '"I’m not hungry."',
      effects: [
        { op: 'stat.add', stat: 'undertow', value: 1 },
        { op: 'flag.set', key: 'n1:refused-meal', value: true },
        { op: 'fact.add', tag: 'refused-first-meal', witnessedBy: ['maud'] },
      ],
      goto: 'n1-cobble',
    },
  ],
});

const cobble = defineScene({
  id: 'n1-cobble',
  slot: 'night',
  prose: {
    kind: 'inline',
    paragraphs: [
      {
        text: 'The food does something the fire couldn’t. Weight, maybe. By the end of the plate you feel the stool under you differently, the floor through your boots.',
        when: { op: 'fact.knownBy', who: 'maud', tag: 'ate-first-meal' },
      },
      {
        text: 'You eat some of the potatoes and let the rest cool into evidence. Maud doesn’t remark on it.',
        when: { op: 'fact.knownBy', who: 'maud', tag: 'picked-at-meal' },
      },
      {
        text: 'Maud takes the plate back without a word and doesn’t scrape it. She covers it and puts it in the cold pantry. The subject is closed.',
        when: { op: 'flag', key: 'n1:refused-meal' },
      },
      {
        text: 'There is a dog by the fire you had taken for a rug. Old, heavy, some kind of collie under some kind of everything else, grey to the eyebrows.',
      },
      {
        text: 'He gets up, works his hips loose, and crosses the room. He passes so close his fur should brush your shin. It doesn’t. He goes by the way a dog goes by a chair it has known all its life, and settles at the end of the bar, facing the door.',
      },
      {
        text: '"Cobble," Maud says. "He waits up for the last ferry. There hasn’t been a last ferry since October."',
      },
    ],
  },
  choices: [
    {
      id: 'say-his-name',
      label: 'Say his name.',
      effects: [
        { op: 'flag.set', key: 'n1:spoke-to-cobble', value: true },
        { op: 'stat.add', stat: 'echo', value: 1 },
      ],
      goto: 'n1-interview-1',
    },
    {
      id: 'reach-for-him',
      label: 'Put your hand down where he could find it.',
      effects: [{ op: 'flag.set', key: 'n1:reached-for-cobble', value: true }],
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
        text: 'Maud blots the page and closes the book on it. "That’ll do," she says. "Room at the top of the stairs. Bed’s made."',
      },
      {
        text: 'The stairs complain in the usual places. The room is small and clean: bed, chair, washstand, a window with the harbour in it. Through the thinning fog you can make out the harbour wall, the black water it keeps, and the lighthouse going round and round above the point.',
      },
      {
        text: 'Below you, faintly, Maud’s voice — low, one side of a conversation. She is talking to the dog, or to the book. Then the bar light goes out under your door.',
      },
      { text: 'You lie down in your clothes and put the lamp out.' },
    ],
  },
  choices: [
    { id: 'sleep', label: 'Sleep, or something like it.', goto: 'n1-312' },
    {
      id: 'window-first',
      label: 'Stand at the window a while first.',
      effects: [{ op: 'flag.set', key: 'n1:watched-harbour', value: true }],
      goto: 'n1-312',
    },
  ],
});

const foghorn = defineScene({
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
        text: 'The harbour keeps no hours worth watching. A rowboat knocks against its mooring somewhere, twice, and thinks better of it. Eventually you lie down anyway.',
        when: { op: 'flag', key: 'n1:watched-harbour' },
      },
      { text: 'You surface at 3:12 exactly, called up through the wall.' },
      {
        text: 'The foghorn. But it doesn’t just sound — it plays. Notes, held and bent, a phrase with a middle to it. Five bars of a tune, carried up the hill through the fog, patient as weather.',
      },
      {
        text: 'It goes once through and stops where something else should start. You wait for the rest. There is no rest.',
      },
      {
        text: 'You know the tune. You knew it before you were awake. You could hum every note of the five bars, and not one note of what comes after — that place is smooth and blank, like the face of a worn coin.',
      },
      {
        text: 'No light comes on anywhere in the town below. Nobody wakes for it. It is, apparently, just what the nights do here.',
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
      { text: 'Here the fog closes over Port Lorn, for now.' },
      {
        text: 'Two nights in. Twenty-one to go — the tide tables say so, and the tide tables are scripture here.',
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
  shingle,
  walk,
  pub,
  meal,
  cobble,
  ...INTERVIEW_SCENES,
  room,
  foghorn,
  sliceEnd,
];
