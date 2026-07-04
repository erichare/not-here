/**
 * DAY 7 — breath, then the branch (design/act1-beats.md §Day 7).
 *
 * Single quiet morning slot (the register briefly open — thread beat 2, no
 * comment from anyone), a short early-fog evening, and then the act's one
 * railroad: the walk to the wharf at 3:12 and THE FOGHORN CHOICE. The act
 * ends on the walk back up and the ACT TWO title card ('act1-end' ending
 * marker terminates the current build; Act 2 replaces it).
 *
 * Flags this file owns (Act 2 branches on them):
 *   'horn-on'              — the player told Wade to keep playing
 *   'horn-stopped'         — the player closed the valve herself
 *   'wade-confession-seed' — Wade's confession path opens early (horn-on)
 * Facts: 'let-wade-play' / 'stopped-the-horn', witnessed by wade only.
 * The presence-decay mechanic itself is Act 2's; Act 1 only announces it
 * (the '(Something has started counting.)' visual tell in d7-after).
 *
 * Prose invariants in force (design/game-bible.md §Prose grammar): nobody
 * touches you first — in the Stop branch YOU reach past Wade and touch the
 * HORN, never him; nobody remarks that anything is strange.
 */

import { defineScene, type Cond, type Scene } from '@not-here/engine';

const hornOn: Cond = { op: 'flag', key: 'horn-on' };
const hornStopped: Cond = { op: 'flag', key: 'horn-stopped' };

// ——— Morning: the book briefly open (register thread, beat 2) ———

const morning = defineScene({
  id: 'd7-morning',
  slot: 'morning',
  onEnter: [
    { op: 'time.set', day: 7, slot: 'morning' },
    { op: 'flag.set', key: 'register:seen-blank-name', value: true },
  ],
  prose: {
    kind: 'inline',
    paragraphs: [
      {
        text: 'The fog doesn’t burn off. Morning comes up grey on grey, and the crows keep whatever they have to themselves. Across the lot the diner light is on early, or still.',
      },
      {
        text: 'Inside it’s just Barb. The register lies open on the counter — she is going down the month with one finger, some arithmetic of her own — and she doesn’t close it when you come in. From your stool you can read the page. There is nothing on it that isn’t yours.',
      },
      {
        text: '@doc:\n┌──────────────────────────────────────────────┐\n│  THE KETTLE — REGISTER                       │\n│                                              │\n│  DATE      NAME           UNIT   REMARKS     │\n│  Nov 5                    1      supper,     │\n│                                  tab         │\n└──────────────────────────────────────────────┘',
      },
      {
        text: 'One line for November. The date, the unit, the supper — the ink gone over more than once, some of it lately. And the NAME column still open, six days now, the way you’d leave a chair for someone.',
      },
      {
        text: 'Barb squares the book shut on her way past — no hurry in it, a chapter finished rather than a page lost — and pours your coffee. "Quiet one today," she says, to the pot. It is.',
      },
    ],
  },
  choices: [
    {
      id: 'stay-the-morning',
      label: 'Stay at the counter while she works.',
      effects: [
        { op: 'stat.add', stat: 'flesh', value: 1 },
        { op: 'fact.add', tag: 'kept-barb-company', witnessedBy: ['barb'] },
      ],
      goto: 'd7-evening',
    },
    {
      id: 'shore-road',
      label: 'Take the coffee with you and walk the shore road.',
      effects: [{ op: 'flag.set', key: 'd7:walked-shore', value: true }],
      goto: 'd7-evening',
    },
  ],
});

// ——— Evening: short; the fog in early; "Sleep well tonight." ———

const evening = defineScene({
  id: 'd7-evening',
  slot: 'evening',
  onEnter: [{ op: 'time.set', slot: 'evening' }],
  prose: {
    kind: 'inline',
    paragraphs: [
      {
        text: 'The fog comes in early and means it. By four the streetlights are on and might as well not be; by five the hills are gone and the town has pulled its shoulders in. The men look at the window, and settle up, and go while there’s still a road to go by.',
      },
      {
        text: 'No crib game tonight. Moose takes his post at the door early, facing the lot, waiting on the last run the way he does. Barb turns the sign around at half past seven, and nobody is there to see it but you.',
      },
      { text: '@line:barb:goodnight' },
      { text: 'It is not clear she believes you will.' },
    ],
  },
  choices: [
    { id: 'cross-the-lot', label: 'Cross the lot to your unit.', goto: 'd7-walk' },
  ],
  cue: 'pub-warm',
});

// ——— THE WALK — the act's one railroad. Under 120 words, all dread. ———

const walk = defineScene({
  id: 'd7-walk',
  slot: 'night',
  onEnter: [{ op: 'time.set', slot: 'night' }],
  prose: {
    kind: 'inline',
    paragraphs: [
      {
        text: 'You lie down in your clothes. The night passes over without stopping. At 3:12 you are awake, and dressed, and at the door with your hand on the cold of the latch, and none of these were decisions.',
      },
      {
        text: 'The horn is playing. You go down through the sleeping town toward it — past the General, past the hall — and where the road gives onto the old wharf the fog parts along the boards ahead of you, a corridor exactly your width. It closes again behind. You don’t look.',
      },
      {
        text: 'Five bars, the stop. Five bars, nearer. The horn room door at the end stands open. The light inside is the color of a kept fire.',
      },
    ],
  },
  choices: [{ id: 'go-in', label: 'Go in.', goto: 'd7-hornroom' }],
  cue: 'foghorn-312',
});

// ——— THE HORN ROOM — the Foghorn Choice ———

const hornroom = defineScene({
  id: 'd7-hornroom',
  slot: 'night',
  prose: {
    kind: 'inline',
    paragraphs: [
      {
        text: 'Wade at the valves. You have seen men stand that way at a wheelhouse: feet apart, hands light, the whole body listening. The compressor breathes behind him and the horn takes the breath and turns it into the tune you know — and here, not through a wall, not across water, it has a body. It stands in the room with you. It moves the air in your chest on its way out over the lake.',
      },
      {
        text: 'Five bars, complete, at full voice for the first time. The fifth leans forward the way it always leans, and the silence where a sixth should go is not silence in here. It is a held breath. The whole room makes it together — the man, the machine, and you.',
      },
      {
        text: 'He sees you. His eyes come to the door, find you, and go back to the valves. He doesn’t stop. He doesn’t miss a beat to the seeing. The song goes out again over the water, patient as weather, and his hands wait on the brass for whatever you have come down to say.',
      },
    ],
  },
  choices: [
    {
      id: 'keep-playing',
      label: '"Keep playing."',
      effects: [
        { op: 'flag.set', key: 'horn-on', value: true },
        { op: 'fact.add', tag: 'let-wade-play', witnessedBy: ['wade'] },
        { op: 'flag.set', key: 'wade-confession-seed', value: true },
      ],
      goto: 'd7-after',
    },
    {
      id: 'stop',
      label: '"Stop."',
      effects: [
        { op: 'flag.set', key: 'horn-stopped', value: true },
        { op: 'fact.add', tag: 'stopped-the-horn', witnessedBy: ['wade'] },
        { op: 'static.add', value: -5 },
      ],
      goto: 'd7-silence',
    },
    {
      // The ache: always visible, never openable in Act 1 (CHORD caps below 6).
      id: 'ask-sixth-bar',
      label: 'Ask him what the sixth bar is.',
      lockedLabel: '· Ask him what the sixth bar is.',
      when: { op: 'chord.gte', value: 6 },
      goto: 'd7-after',
    },
  ],
  cue: 'horn-close',
});

// ——— The valve closed: the loudest thing in the act ———

const silence = defineScene({
  id: 'd7-silence',
  slot: 'night',
  prose: {
    kind: 'inline',
    paragraphs: [
      {
        text: 'You cross the floor. He watches you come and his hands stay where they are, and you reach past him — close enough to smell machine oil and wet wool — and you shut the valve yourself. Brass, warm from its work. The horn draws one more breath and lets it go unspent.',
      },
      {
        text: 'What comes after is not quiet. Seven years of nights had that sound in them, and every one of them backs up into the room at once. The compressor idles down through its registers like a thing lying down to sleep. You can hear the fog against the doorway. You can hear that it makes no sound at all.',
      },
      {
        text: '"Okay," Wade says. To the valves, not to you. He turns a small brass screw a quarter-turn, and the air goes out of everything. He doesn’t play it again. He doesn’t look at you again. In all of Lorn Bay, for the first time in seven years, there is no music of any kind.',
      },
    ],
  },
  choices: [{ id: 'walk-back', label: 'Walk back up.', goto: 'd7-after' }],
});

// ——— AFTER — the walk home, one paragraph either way ———

const after = defineScene({
  id: 'd7-after',
  slot: 'night',
  onEnter: [
    // Decay seeding: Act 2 implements the nightly count; Act 1 announces it.
    {
      op: 'when',
      cond: { op: 'flag', key: 'horn-stopped' },
      then: [
        {
          op: 'emit',
          event: { kind: 'tell.visual', text: '(Something has started counting.)' },
        },
      ],
    },
  ],
  prose: {
    kind: 'inline',
    paragraphs: [
      {
        text: 'You climb home with the song at your back, going out over the water like a lamp left burning in a room behind you. It is still playing when you reach the lot, still playing when you lie down — five bars, the stop, five bars — and something in you is fed by it, and lets itself be, and you don’t ask that something its name.',
        when: hornOn,
      },
      {
        text: 'You climb home through a town with nothing underneath it. Your boots are the only sound between the wharf and your door, and they are not enough. The fog has stopped moving. Twice you stop to listen — the way you’d press on a bruise — and the silence comes back richer each time, better fed, like it has already learned to eat. Nothing calls you anything, the whole way home.',
        when: hornStopped,
      },
    ],
  },
  choices: [{ id: 'lie-down', label: 'Lie down.', goto: 'act1-end' }],
});

// ——— ACT TWO title card — the current build terminates here ———

const actEnd = defineScene({
  id: 'act1-end',
  onEnter: [{ op: 'time.set', day: 8, slot: 'morning' }],
  prose: {
    kind: 'inline',
    paragraphs: [{ text: '' }, { text: 'ACT TWO' }, { text: '' }],
  },
  choices: [],
  cue: 'title',
  ending: 'act1-end',
});

export const DAY7_SCENES: readonly Scene[] = [
  morning,
  evening,
  walk,
  hornroom,
  silence,
  after,
  actEnd,
];
