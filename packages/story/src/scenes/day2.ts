/**
 * DAY 2 — the first slot choice, tutorializing the Presence Economy.
 *
 * One morning, two places to be: Dora at the post office (plants clue #7,
 * the circled ferry date, without emphasis) or Maud's cellar (the dishes
 * beat — fact 'helped-maud', witnessed). Whichever is missed resolves that
 * EVENING as a without-you retelling in the register of design/spike-fomo.md.
 * Per calibration rule 4, the first retelling is a pure gift: warm, funny,
 * zero loss.
 *
 * The evening pub scene selects Maud's greeting through the memory package
 * (see ../dialogue.ts — the '@line:maud:greeting' dynamic paragraph).
 */

import { defineScene, type Cond, type Scene } from '@not-here/engine';

const wentToDora: Cond = { op: 'flag', key: 'd2:slot', value: 'dora' };
const stayedWithMaud: Cond = { op: 'flag', key: 'd2:slot', value: 'maud' };

const wake = defineScene({
  id: 'd2-wake',
  slot: 'morning',
  onEnter: [{ op: 'time.set', day: 2, slot: 'morning' }],
  prose: {
    kind: 'inline',
    paragraphs: [
      {
        text: 'Morning arrives grey and workmanlike. Gulls on the chimney, having their argument. The fog has pulled back to the harbour mouth and sits there like it is owed something.',
      },
      {
        text: 'Below: pans, water run and run again, the street door going once. A town doing its morning.',
      },
    ],
  },
  choices: [{ id: 'go-down', label: 'Go down.', goto: 'd2-morning' }],
});

const morning = defineScene({
  id: 'd2-morning',
  slot: 'morning',
  prose: {
    kind: 'inline',
    paragraphs: [
      {
        text: 'Bread on the bar, tea beside it, no ceremony. Maud is already elbow-deep in the day.',
      },
      {
        text: '"Dora Halloway’s asking for you," she says. "Post office. Word goes round a town this size faster than the milk, and Dora is where the word ends up." She lets that be all it is.',
      },
      {
        text: '"Or there’s the cellar, wants doing before the dray comes, and my knees are past it. Suit yourself. One or the other — the morning’s not wide enough for both."',
      },
    ],
  },
  choices: [
    {
      id: 'go-to-dora',
      label: 'Go to the post office.',
      effects: [
        { op: 'flag.set', key: 'd2:slot', value: 'dora' },
        { op: 'fact.add', tag: 'went-to-dora', witnessedBy: ['maud'] },
      ],
      goto: 'd2-dora',
    },
    {
      id: 'stay-for-cellar',
      label: 'Stay and do the cellar.',
      effects: [{ op: 'flag.set', key: 'd2:slot', value: 'maud' }],
      goto: 'd2-cellar',
    },
  ],
});

const dora = defineScene({
  id: 'd2-dora',
  slot: 'morning',
  onEnter: [{ op: 'fact.add', tag: 'visited-dora', witnessedBy: ['dora'] }],
  prose: {
    kind: 'inline',
    paragraphs: [
      {
        text: 'The post office is the front room of a house with a counter across it. Stamps under glass, string in a drawer that is always open, a paraffin heater doing its best. Behind the counter hangs a tide-clock instead of a clock-clock, its one hand leaning toward LOW.',
      },
      {
        text: 'The woman sorting the second post is small and quick and grey at the temples, and when she sees you she puts both hands flat on the counter, as if the counter had tried to move.',
      },
      { text: '"There you are," she says. Not a question. "There you are, my girl."' },
      {
        text: 'She comes round the counter and stops a step short of you, arms half-raised, palms open — the shape of a hug with the hug left out. She waits. She would wait all day. You understand that it is yours to finish.',
      },
    ],
  },
  choices: [
    {
      id: 'step-in',
      label: 'Step into her arms and let them close.',
      effects: [
        { op: 'stat.add', stat: 'flesh', value: 1 },
        { op: 'fact.add', tag: 'embraced-dora', witnessedBy: ['dora'] },
      ],
      goto: 'd2-dora-2',
    },
    {
      id: 'take-hands',
      label: 'Take her hands instead.',
      effects: [
        { op: 'stat.add', stat: 'flesh', value: 1 },
        { op: 'fact.add', tag: 'took-doras-hands', witnessedBy: ['dora'] },
      ],
      goto: 'd2-dora-2',
    },
    {
      id: 'stand-still',
      label: 'Stand where you are.',
      effects: [
        { op: 'stat.add', stat: 'undertow', value: 1 },
        { op: 'fact.add', tag: 'held-back-from-dora', witnessedBy: ['dora'] },
      ],
      goto: 'd2-dora-2',
    },
  ],
  cue: 'dora-theme',
});

const dora2 = defineScene({
  id: 'd2-dora-2',
  slot: 'morning',
  onEnter: [{ op: 'flag.set', key: 'seen-ferry-date', value: true }],
  prose: {
    kind: 'inline',
    paragraphs: [
      {
        text: 'You step in and her arms close, light as you please, as if you might be wet paint. She smells of paraffin and lavender and the inside of the counter drawer. She lets go the moment you begin to.',
        when: { op: 'fact.knownBy', who: 'dora', tag: 'embraced-dora' },
      },
      {
        text: 'You take her hands. They are cold in the way of front rooms in spring, and they close around yours and hold on, and that is the whole conversation for a while.',
        when: { op: 'fact.knownBy', who: 'dora', tag: 'took-doras-hands' },
      },
      {
        text: 'You stand where you are. Her arms come down by inches, finding work on the way — a smoothed apron, a straightened pile of post. "Right," she says, gently, to the pile. "Right."',
        when: { op: 'fact.knownBy', who: 'dora', tag: 'held-back-from-dora' },
      },
      {
        text: 'She sits you on the stool by the heater and finds tea from somewhere, the way postmistresses can. "Drink that, love," she says. "Don’t talk yet."',
      },
      {
        text: 'While she sorts the second post you read the pinboard, because it is there. Parish notices. A bicycle, ten shillings, hardly used. The tide tables, soft at the corners. And the spring ferry timetable, new this year:',
      },
      {
        text: '@doc:\n┌─────────────────────────────────┐\n│  CALEDONIAN COASTAL SAILINGS    │\n│  SPRING SERVICE — MAINLAND      │\n│                                 │\n│   Tue 14 April ....... 07:40    │\n│   Fri 24 April ....... 07:40    │\n│  (( Tue 28 April ..... 07:40 )) │\n│   Fri  8 May ......... 07:40    │\n│                                 │\n│  Fares as posted. No dogs.      │\n└─────────────────────────────────┘',
      },
      {
        text: 'One sailing ringed twice round in blue ink. The ring has been gone over so many times it has pressed through to the cork.',
      },
      {
        text: 'Dora talks while she works. Nothing that needs answering: the weather, the roof, whose boy has gone to Lowestoft. Twice she loses the thread of a sentence looking at you, picks up a different sentence instead, and carries on.',
      },
    ],
  },
  choices: [
    {
      id: 'stay-till-done',
      label: 'Stay until the post is done.',
      effects: [
        { op: 'stat.add', stat: 'name', value: 1 },
        { op: 'fact.add', tag: 'stayed-with-dora', witnessedBy: ['dora'] },
      ],
      goto: 'd2-evening',
    },
    {
      id: 'promise-tomorrow',
      label: '"I’ll come again tomorrow."',
      effects: [
        { op: 'fact.add', tag: 'promised-dora-return', witnessedBy: ['dora'] },
      ],
      goto: 'd2-evening',
    },
  ],
});

const cellar = defineScene({
  id: 'd2-cellar',
  slot: 'morning',
  prose: {
    kind: 'inline',
    paragraphs: [
      {
        text: 'The cellar takes the morning. Empties up the ramp, the new barrels walked down it on their rims, chocked, spiled, left to settle. The dray horse breathes at the window grate like news from a larger world.',
      },
      {
        text: 'Then the glasses from last night, and the plates, and the big pot with its opinion of being cleaned. Maud washes. There is a cloth on the rail and a rack half-filled, and a place at her elbow where a second pair of hands would go.',
      },
    ],
  },
  choices: [
    {
      id: 'take-the-cloth',
      label: 'Take the cloth and dry.',
      effects: [
        { op: 'fact.add', tag: 'helped-maud', witnessedBy: ['maud'] },
        { op: 'stat.add', stat: 'flesh', value: 1 },
        { op: 'stat.add', stat: 'name', value: 1 },
      ],
      goto: 'd2-cellar-2',
    },
    {
      id: 'watch-her-work',
      label: 'Watch her hands and keep your own to yourself.',
      effects: [
        { op: 'stat.add', stat: 'undertow', value: 1 },
        { op: 'flag.set', key: 'd2:watched-maud', value: true },
      ],
      goto: 'd2-cellar-2',
    },
  ],
});

const cellar2 = defineScene({
  id: 'd2-cellar-2',
  slot: 'morning',
  prose: {
    kind: 'inline',
    paragraphs: [
      {
        text: 'You dry. She washes. The water goes grey, the rack fills, the pot argues and gives in. It is the plainest hour you have had since the shingle, and something in you sits down inside it and stays sat.',
        when: { op: 'fact.knownBy', who: 'maud', tag: 'helped-maud' },
      },
      {
        text: 'At the end Maud looks at the rack as if counting. "Well," she says, which is a wage. Later, passing the bar, you see her open the book, write one line, and then go over the line again, pressing — twice, so it takes.',
        when: { op: 'fact.knownBy', who: 'maud', tag: 'helped-maud' },
      },
      {
        text: 'Maud doesn’t offer the cloth twice. She washes and stacks and the morning goes on being pleasant somewhere just outside of you, like weather through a window.',
        when: { op: 'flag', key: 'd2:watched-maud' },
      },
      {
        text: 'The afternoon is yours. The tide comes up the causeway on time, which everyone treats as a compliment to the tables. You walk the harbour wall as far as the fog will let you and come back with your hands in your pockets.',
      },
    ],
  },
  choices: [
    { id: 'to-evening', label: 'See to yourself until evening.', goto: 'd2-evening' },
  ],
});

const evening = defineScene({
  id: 'd2-evening',
  slot: 'evening',
  onEnter: [{ op: 'time.set', slot: 'evening' }],
  prose: {
    kind: 'inline',
    paragraphs: [
      {
        text: 'By evening the pub has people in it: harbour men, a domino game, the fire built up proper. Cobble is at his post by the door, waiting for the ferry that isn’t coming.',
      },
      { text: '@line:maud:greeting' },
      // ——— Without-you retelling: the cellar day, told by Maud (you were at Dora's).
      {
        text: '"You missed the drama," Maud says, arriving with your plate. "Dray came early. Tam Osei helps me get the mild down the ramp — and the last barrel gets away from him. Slow, mind. The dignified kind of away."',
        when: wentToDora,
      },
      {
        text: '"And Tam walks alongside it the whole way down with his hand out, talking to it — now then, now then — like it was a horse he was disappointed in. Barrel fetches up against the wall sweet as you like. Not a drop troubled."',
        when: wentToDora,
      },
      {
        text: '"He’s told it twice tonight already himself, and the barrel’s bigger every telling." She goes off to see to the dominoes, taking the story with her.',
        when: wentToDora,
      },
      {
        text: 'Under the room, briefly, a rhythm with no notes in it — an engine idling, a road going by under wheels — there and gone before you can stand it somewhere. Nobody in the pub is making it. Then the dominoes click and it isn’t anywhere.',
        when: wentToDora,
      },
      // ——— Without-you retelling: Dora's morning, told by Tam (you stayed with Maud).
      {
        text: 'Tam Osei comes in on the back of the cold, working his gloves off finger by finger, and takes his half at the bar. He nods to you the way he’d nod to weather that had behaved all day.',
        when: stayedWithMaud,
      },
      {
        text: '"Dora had me in this morning," he says, to Maud mostly. "Wanted my book out — the spring sailings. Had me check one date against her list twice, like the print might have moved since. Then she buys a stamp she doesn’t need and tells me the roof fund’s at four pounds."',
        when: stayedWithMaud,
      },
      {
        text: '"She was singing when I left," he adds, surprised at it all over again, and puts his face in his glass.',
        when: stayedWithMaud,
      },
      {
        text: 'Very faint, under the dominoes: a few notes in a music-box register, a shade flat, twice through and gone. You could not say where from. The fire ticks on regardless.',
        when: stayedWithMaud,
      },
      // ——— Common close.
      {
        text: 'The dominoes end the way they always end, in one man’s quiet triumph and everyone else’s coats. The men go out in ones. Maud turns chairs onto tables around you without hurry, which is a kind of clock.',
      },
    ],
  },
  choices: [{ id: 'go-up', label: 'Go up to bed.', goto: 'd2-night' }],
  cue: 'pub-warm',
});

const night = defineScene({
  id: 'd2-night',
  slot: 'night',
  onEnter: [
    { op: 'time.set', slot: 'night' },
    { op: 'fact.add', tag: 'heard-second-horn' },
  ],
  prose: {
    kind: 'inline',
    paragraphs: [
      { text: 'You wake at 3:12 without asking anything of the dark. You simply arrive there, the way you arrived on the shingle: mid-listening.' },
      {
        text: 'Through the wall, the horn. Five bars, the stop, the silence you now know better than to wait through. You listen to the fifth bar mostly — the one that ends leaning forward, like a sentence interrupted politely, year after year.',
      },
      {
        text: 'You could learn to sleep through it, probably. You already know you won’t.',
      },
    ],
  },
  choices: [{ id: 'let-it-come', label: 'Let the next thing come.', goto: 'slice-end' }],
  cue: 'foghorn-312',
});

export const DAY2_SCENES: readonly Scene[] = [
  wake,
  morning,
  dora,
  dora2,
  cellar,
  cellar2,
  evening,
  night,
];
