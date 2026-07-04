/**
 * DAY 2 — the first slot choice, tutorializing the Presence Economy.
 *
 * One morning, two places to be: Dianne at Lorn Bay General (plants clue #7,
 * the circled bus date, without emphasis) or the Kettle's delivery morning
 * (the dishes beat — fact 'helped-barb', witnessed). Whichever is missed
 * resolves that EVENING as a without-you retelling in the register of
 * design/spike-fomo.md. Per calibration rule 4, the first retelling is a
 * pure gift: warm, funny, zero loss.
 *
 * The evening diner scene selects Barb's greeting through the memory package
 * (see ../dialogue.ts — the '@line:barb:greeting' dynamic paragraph).
 */

import { defineScene, type Cond, type Scene } from '@not-here/engine';

const wentToDianne: Cond = { op: 'flag', key: 'd2:slot', value: 'dianne' };
const stayedWithBarb: Cond = { op: 'flag', key: 'd2:slot', value: 'barb' };

const wake = defineScene({
  id: 'd2-wake',
  slot: 'morning',
  onEnter: [{ op: 'time.set', day: 2, slot: 'morning' }],
  prose: {
    kind: 'inline',
    paragraphs: [
      {
        text: 'Morning arrives grey and workmanlike. Crows on the power line, having their argument. The fog has pulled back to the middle of the lake and sits there like it is owed something.',
      },
      {
        text: 'Across the lot: the flat-top scraping, water run and run again, a truck door going once. A town doing its morning.',
      },
    ],
  },
  choices: [{ id: 'go-down', label: 'Go over.', goto: 'd2-morning' }],
});

const morning = defineScene({
  id: 'd2-morning',
  slot: 'morning',
  prose: {
    kind: 'inline',
    paragraphs: [
      {
        text: 'Toast on the counter, coffee beside it, no ceremony. Barb is already elbow-deep in the day.',
      },
      {
        text: '"Dianne Cole’s asking for you," she says. "The General. Word goes round a town this size faster than the plow, and Dianne is where the word ends up." She lets that be all it is.',
      },
      {
        text: '"Or you can stay — keg truck’s due, the back room wants clearing first, and my knees are past it. Suit yourself. One or the other — the morning’s not wide enough for both."',
      },
    ],
  },
  choices: [
    {
      id: 'go-to-dianne',
      label: 'Go to the General.',
      effects: [
        { op: 'flag.set', key: 'd2:slot', value: 'dianne' },
        { op: 'fact.add', tag: 'went-to-dianne', witnessedBy: ['barb'] },
      ],
      goto: 'd2-dianne',
    },
    {
      id: 'stay-for-delivery',
      label: 'Stay for the delivery.',
      effects: [{ op: 'flag.set', key: 'd2:slot', value: 'barb' }],
      goto: 'd2-delivery',
    },
  ],
});

const dianne = defineScene({
  id: 'd2-dianne',
  slot: 'morning',
  onEnter: [{ op: 'fact.add', tag: 'visited-dianne', witnessedBy: ['dianne'] }],
  prose: {
    kind: 'inline',
    paragraphs: [
      {
        text: 'Lorn Bay General is the front room of a house that grew shelves. The Canada Post counter at the back, a corkboard by the door doing the work of a newspaper, a paraffin heater doing its best. Behind the till, a lake-level card gone soft at the corners, pinned where a calendar would go.',
      },
      {
        text: 'The woman sorting the mail tubs is small and quick and grey at the temples, and when she sees you she puts both hands flat on the counter, as if the counter had tried to move.',
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
        { op: 'fact.add', tag: 'embraced-dianne', witnessedBy: ['dianne'] },
      ],
      goto: 'd2-dianne-2',
    },
    {
      id: 'take-hands',
      label: 'Take her hands instead.',
      effects: [
        { op: 'stat.add', stat: 'flesh', value: 1 },
        { op: 'fact.add', tag: 'took-diannes-hands', witnessedBy: ['dianne'] },
      ],
      goto: 'd2-dianne-2',
    },
    {
      id: 'stand-still',
      label: 'Stand where you are.',
      effects: [
        { op: 'stat.add', stat: 'undertow', value: 1 },
        { op: 'fact.add', tag: 'held-back-from-dianne', witnessedBy: ['dianne'] },
      ],
      goto: 'd2-dianne-2',
    },
  ],
  cue: 'dianne-theme',
});

const dianne2 = defineScene({
  id: 'd2-dianne-2',
  slot: 'morning',
  onEnter: [{ op: 'flag.set', key: 'seen-bus-date', value: true }],
  prose: {
    kind: 'inline',
    paragraphs: [
      {
        text: 'You step in and her arms close, light as you please, as if you might be wet paint. She smells of the paraffin heater and packing tape and something older under both. She lets go the moment you begin to.',
        when: { op: 'fact.knownBy', who: 'dianne', tag: 'embraced-dianne' },
      },
      {
        text: 'You take her hands. They are cold in the way of front rooms in November, and they close around yours and hold on, and that is the whole conversation for a while.',
        when: { op: 'fact.knownBy', who: 'dianne', tag: 'took-diannes-hands' },
      },
      {
        text: 'You stand where you are. Her arms come down by inches, finding work on the way — a squared stack of flyers, a straightened pile of mail. "Right," she says, gently, to the pile. "Right."',
        when: { op: 'fact.knownBy', who: 'dianne', tag: 'held-back-from-dianne' },
      },
      {
        text: 'She sits you on the stool by the heater and finds tea from somewhere, the way she always could. "Drink that, love," she says. "Don’t talk yet."',
      },
      {
        text: 'While she sorts the tubs you read the corkboard, because it is there. A quagga-mussel boat-wash notice. A snow-tire clinic in Penticton. The potluck flyer for the community hall — seven years, it says, and nothing else about it. And the bus schedule card, new this fall:',
      },
      {
        text: '@doc:\n┌─────────────────────────────────┐\n│  EBUS — WINTER SCHEDULE         │\n│  VANCOUVER–PENTICTON–LORN BAY   │\n│                                 │\n│   Fri 14 Nov ......... 07:40    │\n│   Fri 21 Nov ......... 07:40    │\n│  (( Fri 28 Nov ....... 07:40 )) │\n│   Fri  5 Dec ......... 07:40    │\n│                                 │\n│  Flag stop. Exact fare. No pets.│\n└─────────────────────────────────┘',
      },
      {
        text: 'One Friday ringed twice round in blue pen. The ring has been gone over so many times it has pressed through to the cork.',
      },
      {
        text: 'The store phone rings. Dianne takes it with her back to you. "General," she says. Then, after a while: "No. She’s not here." A pause the length of a sentence. "She hasn’t been here for a long time." She hangs the receiver up gently, the way you’d close a door on a sleeping room, and goes back to the tubs.',
      },
      {
        text: 'Dianne talks while she works. Nothing that needs answering: the weather, the hall roof, whose boy has gone up to Fort McMurray. Twice she loses the thread of a sentence looking at you, picks up a different sentence instead, and carries on.',
      },
    ],
  },
  choices: [
    {
      id: 'stay-till-done',
      label: 'Stay until the mail is done.',
      effects: [
        { op: 'stat.add', stat: 'name', value: 1 },
        { op: 'fact.add', tag: 'stayed-with-dianne', witnessedBy: ['dianne'] },
      ],
      goto: 'd2-evening',
    },
    {
      id: 'promise-tomorrow',
      label: '"I’ll come again tomorrow."',
      effects: [
        { op: 'fact.add', tag: 'promised-dianne-return', witnessedBy: ['dianne'] },
      ],
      goto: 'd2-evening',
    },
  ],
});

const delivery = defineScene({
  id: 'd2-delivery',
  slot: 'morning',
  prose: {
    kind: 'inline',
    paragraphs: [
      {
        text: 'The back room takes the morning. Empties stacked and rolled out, the new kegs walked off the tailgate on their rims, chocked, lines checked, left to settle. The truck idles at the door like news from a larger world.',
      },
      {
        text: 'Then the glasses from last night, and the plates, and the big stock pot with its opinion of being cleaned. Barb washes. There is a cloth on the rail and a rack half-filled, and a place at her elbow where a second pair of hands would go.',
      },
    ],
  },
  choices: [
    {
      id: 'take-the-cloth',
      label: 'Take the cloth and dry.',
      effects: [
        { op: 'fact.add', tag: 'helped-barb', witnessedBy: ['barb'] },
        { op: 'stat.add', stat: 'flesh', value: 1 },
        { op: 'stat.add', stat: 'name', value: 1 },
      ],
      goto: 'd2-delivery-2',
    },
    {
      id: 'watch-her-work',
      label: 'Watch her hands and keep your own to yourself.',
      effects: [
        { op: 'stat.add', stat: 'undertow', value: 1 },
        { op: 'flag.set', key: 'd2:watched-barb', value: true },
      ],
      goto: 'd2-delivery-2',
    },
  ],
});

const delivery2 = defineScene({
  id: 'd2-delivery-2',
  slot: 'morning',
  prose: {
    kind: 'inline',
    paragraphs: [
      {
        text: 'You dry. She washes. The water goes grey, the rack fills, the pot argues and gives in. It is the plainest hour you have had since the beach, and something in you sits down inside it and stays sat.',
        when: { op: 'fact.knownBy', who: 'barb', tag: 'helped-barb' },
      },
      {
        text: 'At the end Barb looks at the rack as if counting. "Well," she says, which is a wage. Later, passing the till, you see her open the book, write one line, and then go over the line again, pressing — twice, so it takes.',
        when: { op: 'fact.knownBy', who: 'barb', tag: 'helped-barb' },
      },
      {
        text: 'Barb doesn’t offer the cloth twice. She washes and stacks and the morning goes on being pleasant somewhere just outside of you, like weather through a window.',
        when: { op: 'flag', key: 'd2:watched-barb' },
      },
      {
        text: 'The afternoon is yours. The snowline is lower on the hills than it was yesterday, which everyone treats as a schedule kept. You walk the rail trail as far as the fog will let you and come back with your hands in your pockets.',
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
        text: 'By evening the diner has people in it: orchard men in off the pruning, a crib game, the heat up proper. Moose is at his post by the door, waiting for the last run that isn’t coming.',
      },
      { text: '@line:barb:greeting' },
      // ——— Without-you retelling: the delivery morning, told by Barb (you were at Dianne's).
      {
        text: '"You missed the show," Barb says, arriving with your plate. "Truck came early. Tam Osei helps me get the kegs down the ramp — and the last one gets away from him. Slow, mind. The dignified kind of away."',
        when: wentToDianne,
      },
      {
        text: '"And Tam walks alongside it the whole way down the lot with his hand out, talking to it — whoa now, whoa now — like it was a horse he was disappointed in. Keg fetches up against the wall sweet as you like. Not a drop troubled."',
        when: wentToDianne,
      },
      {
        text: '"He’s told it twice tonight already himself, and the keg’s bigger every telling." She goes off to see to the crib board, taking the story with her.',
        when: wentToDianne,
      },
      {
        text: 'Under the room, briefly, a rhythm with no notes in it — an engine idling, a road going by under wheels — there and gone before you can stand it somewhere. Nobody in the diner is making it. Then the crib pegs click and it isn’t anywhere.',
        when: wentToDianne,
      },
      // ——— Without-you retelling: Dianne's morning, told by Tam (you stayed with Barb).
      {
        text: 'Tam Osei comes in on the back of the cold, working his gloves off finger by finger, and takes his usual stool. He nods to you the way he’d nod to weather that had behaved all day.',
        when: stayedWithBarb,
      },
      {
        text: '"Dianne had me in this morning," he says, to Barb mostly. "Wanted my printed schedule out — the winter runs. Had me check one date against her card twice, like the print might have moved since. Then she buys a book of stamps she doesn’t need and tells me the hall roof fund’s at four hundred."',
        when: stayedWithBarb,
      },
      {
        text: '"She was singing when I left," he adds, surprised at it all over again, and puts his face in his coffee.',
        when: stayedWithBarb,
      },
      {
        text: 'Very faint, under the crib game: a few notes in a music-box register, a shade flat, twice through and gone. You could not say where from. The furnace ticks on regardless.',
        when: stayedWithBarb,
      },
      // ——— Common close.
      {
        text: 'The crib game ends the way it always ends, in one man’s quiet triumph and everyone else’s coats. The men go out in ones. Barb turns chairs onto tables around you without hurry, which is a kind of clock.',
      },
    ],
  },
  choices: [{ id: 'go-up', label: 'Go back to your unit.', goto: 'd2-night' }],
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
      { text: 'You wake at 3:12 without asking anything of the dark. You simply arrive there, the way you arrived on the beach: mid-listening.' },
      {
        text: 'Through the wall, the horn. Five bars, the stop, the silence you now know better than to wait through. You listen to the fifth bar mostly — the one that ends leaning forward, like a sentence interrupted politely, year after year.',
      },
      {
        text: 'You could learn to sleep through it, probably. You already know you won’t.',
      },
    ],
  },
  choices: [{ id: 'let-it-come', label: 'Let the next thing come.', goto: 'd3-morning' }],
  cue: 'foghorn-312',
});

export const DAY2_SCENES: readonly Scene[] = [
  wake,
  morning,
  dianne,
  dianne2,
  delivery,
  delivery2,
  evening,
  night,
];
