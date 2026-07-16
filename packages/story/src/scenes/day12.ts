/**
 * DAY 12 — prep, the temperature reads (design/act2-beats.md §Day 12).
 *
 * Fixed day, no hub: the hall — tables, the urn, the upright uncovered.
 * The FLESH gate on carrying tables is the bible's canonical gate; its
 * lockedLabel is the beat sheet's, verbatim. The verdict is legible a day
 * early: two temperature reads mirror the derived 'witness' level (flesh +
 * name; the resolver is registered at integration) in small blocking — who
 * hands you things, and what routes around you. Sam is absent from prep;
 * his shed light burns all evening and nobody mentions it, which is how the
 * town mentions it. Someone picks out bar 4 on the upright, wrong way up as
 * always, and stops.
 *
 * EARLY TRUTH (route): at the counter after close, gated undertow ≥ 6 AND
 * pressed-dianne = 3 AND heeded-barbs-warning (hidden gate, no lockedLabel
 * — the route must not advertise itself). Barb answers the Night-11
 * question: what Frank was, what winter did to him, what she chose, what it
 * cost her to watch him thin. Sets 'knows-truth' + 'early-truth'; from here
 * the act plays dramatic-irony inverted (≤ 1 knows-truth paragraph/scene).
 *
 * NIGHT 12 (fixed): the clinic window lit late, watched from the lot — the
 * sam→priya gossip edge seen with your own eyes. You are not in the room;
 * that IS the scene. What crossed: the room-tone clip. What she wrote: not
 * belief — a page number.
 *
 * Night grammar: NIGHT_DECAY spread into onEnter after time.set (never
 * re-authored — imported from act2-shared); cue branches on the track via
 * emits (foghorn-312 on horn-on; music.stop keeps horn-stopped nights
 * cueless); one gated diegetic decay tell per stat, fresh tonight.
 *
 * pt2-fix-01: the horn's bill arrives onstage. This is the act's one fixed,
 * track-gated Wade beat — every route passes through prep eve, so a player
 * who never chose a Wade slot still meets what the nightly feeding costs:
 * the half plate, the coat, Barb re-inking HIS line in the tab book. Gated
 * hornOn only; on horn-stopped routes there is no bill, and the beat's
 * absence is the silence keeping its side of it.
 *
 * Flags owned: 'd12:carried-tables', 'd12:laid-cutlery', 'd12:worked-through',
 * 'today:fed' (offset — the survivability rule's Day-12 meal), 'knows-truth'
 * + 'early-truth' (set on the counter route only). Facts owned:
 * 'helped-potluck-prep' (witnessed by dianne, priya).
 *
 * Prose invariants in force (game-bible.md §Prose grammar): nobody touches
 * you first; nobody remarks that anything is off; Dianne says only
 * 'love' / 'hon' / 'my girl'; no meters — the decay tells are furniture.
 */

import { defineScene, type Cond, type Effect, type Scene } from '@not-here/engine';
import {
  decayedEcho,
  decayedFlesh,
  decayedName,
  hornOn,
  hornStopped,
  knowsTruth,
  NIGHT_DECAY,
} from './act2-shared.ts';

const witnessHigh: Cond = { op: 'derived.gte', key: 'witness', value: 9 };
const witnessLow: Cond = { op: 'not', of: witnessHigh };

const earlyTruthGate: Cond = {
  op: 'all',
  of: [
    { op: 'stat.gte', stat: 'undertow', value: 6 },
    { op: 'flag', key: 'pressed-dianne', value: 3 },
    { op: 'flag', key: 'heeded-barbs-warning' },
  ],
};

/** Track-branched night sound: the horn on horn-on; kept silence otherwise. */
const NIGHT_CUE: readonly Effect[] = [
  {
    op: 'when',
    cond: hornOn,
    then: [{ op: 'emit', event: { kind: 'music.cue', cue: 'foghorn-312' } }],
    else: [{ op: 'emit', event: { kind: 'music.stop' } }],
  },
];

// ——— Morning: the hall, fixed. The verdict rehearses itself in blocking. ———

const morning = defineScene({
  id: 'd12-morning',
  slot: 'morning',
  onEnter: [{ op: 'time.set', day: 12, slot: 'morning' }],
  prose: {
    kind: 'inline',
    paragraphs: [
      {
        text: 'Prep day. The hall doors are chocked open by eight and the town files in with folding tables and roasting pans, everybody moving with the particular economy of people who have done a thing seven times. The urn comes out on its trolley. The upright gets uncovered at the stage end, yellow keys bare to the room.',
      },
      {
        text: 'Dianne is papering the dish tables. When you come level she passes you the loose end of the shelf-paper without looking up — the way work gets handed to hands nobody checks for anymore. You hold; she cuts; neither of you counts the minutes.',
        when: witnessHigh,
      },
      {
        text: 'The work has its own weather today and you stand outside it. A tray of cups comes down the line palm to palm and crosses the table before it reaches you; the shelf-paper gets cut and laid by other hands wherever you slow to help. Nobody decides any of this. It has the smoothness of a thing already decided.',
        when: witnessLow,
      },
      {
        text: 'The tables are down off their trolley, stacked on their sides, waiting on pairs of hands.',
      },
    ],
  },
  choices: [
    {
      id: 'carry-tables',
      label: 'Take the other end of the tables.',
      when: { op: 'stat.gte', stat: 'flesh', value: 5 },
      lockedLabel: 'Take the other end. Your hands know the weight they don’t have.',
      effects: [
        { op: 'stat.add', stat: 'flesh', value: 1 },
        { op: 'stat.add', stat: 'name', value: 1 },
        { op: 'flag.set', key: 'd12:carried-tables', value: true },
        { op: 'fact.add', tag: 'helped-potluck-prep', witnessedBy: ['dianne', 'priya'] },
      ],
      goto: 'd12-prep',
    },
    {
      id: 'lay-cutlery',
      label: 'Lay cups and cutlery down the long tables instead.',
      effects: [
        { op: 'stat.add', stat: 'name', value: 1 },
        { op: 'flag.set', key: 'd12:laid-cutlery', value: true },
        { op: 'fact.add', tag: 'helped-potluck-prep', witnessedBy: ['dianne', 'priya'] },
      ],
      goto: 'd12-prep',
    },
  ],
  cue: 'hall-upright',
});

const prep = defineScene({
  id: 'd12-prep',
  slot: 'morning',
  prose: {
    kind: 'inline',
    paragraphs: [
      {
        text: 'The tables are church-hall heavy and honest about it. Lift, walk, set, square; Dianne directs with her chin; by the third one your arms have stopped asking whether they can and started asking when lunch is.',
        when: { op: 'flag', key: 'd12:carried-tables' },
      },
      {
        text: 'You walk the long tables laying places nobody will keep to — potluck seating is water finding its level — and the rows of cups line up like an argument for something. Order, maybe. Attendance.',
        when: { op: 'flag', key: 'd12:laid-cutlery' },
      },
      {
        text: 'When the trestle by the stage wants pinning, the man holding it nods you over and hands you the bolt without watching it change hands.',
        when: witnessHigh,
      },
      {
        text: 'When the urn wants moving you get a hand to the trolley first, and then somebody is already on the other rail steering it wide, and you are walking beside a thing you are not moving.',
        when: witnessLow,
      },
      {
        text: 'At noon Dianne calls the break like a foreman. Soup out of the tall pot, bread from the Kettle run up in a box, bowls going down the line. One lands in front of you, full, steam off it, before you have found the end of the queue.',
      },
    ],
  },
  choices: [
    {
      id: 'take-the-bowl',
      label: 'Eat what’s put in front of you, all of it.',
      effects: [
        { op: 'stat.add', stat: 'flesh', value: 1 },
        { op: 'flag.set', key: 'today:fed', value: true },
      ],
      goto: 'd12-prep-2',
    },
    {
      id: 'work-through',
      label: 'Leave the bowl. Work through the break.',
      effects: [{ op: 'flag.set', key: 'd12:worked-through', value: true }],
      goto: 'd12-prep-2',
    },
  ],
});

const prep2 = defineScene({
  id: 'd12-prep-2',
  slot: 'morning',
  prose: {
    kind: 'inline',
    paragraphs: [
      {
        text: 'The soup is barley and it is real and you eat all of it. Dianne watches the bowl empty from three tables away and turns back to her list one line easier.',
        when: { op: 'flag', key: 'today:fed' },
      },
      {
        text: 'The bowl goes cold at your elbow while you work. Nobody says anything. When the break ends, Dianne tips it back into the pot herself, not looking at you the whole careful length of the pouring.',
        when: { op: 'flag', key: 'd12:worked-through' },
      },
      {
        text: 'Sam does not come. His name is not on the dish list and nobody reads the gap aloud. The hall works around the place where he isn’t the way the tongue works around a pulled tooth.',
      },
      {
        text: 'Toward four, with the chairs going up in their stacks, somebody at the stage end picks out the turn of the tune on the upright — four notes, upside down, the only way this hall has ever had them — and stops. The lid goes down softly. The stacking goes on, and the four wrong-way notes stay up in the rafters a while, unclaimed.',
      },
      {
        text: 'By five the hall is a promise with its lights off. Tomorrow it gets kept.',
      },
    ],
  },
  choices: [
    {
      id: 'walk-down',
      label: 'Walk down to the Kettle with the last of the light.',
      goto: 'd12-evening',
    },
  ],
});

// ——— Evening: the Kettle; Sam's shed light; the gated counter route. ———

const evening = defineScene({
  id: 'd12-evening',
  slot: 'evening',
  onEnter: [{ op: 'time.set', slot: 'evening' }],
  prose: {
    kind: 'inline',
    paragraphs: [
      {
        text: 'The Kettle takes the prep crowd in shifts and feeds it early. Tomorrow sits in the room like extra furniture: dishes get discussed, ovens negotiated, and the crib board stays in its drawer a second night running.',
      },
      { text: '@line:barb:greeting-d12' },
      // ——— pt2-fix-01: the bill, at supper. A man is paying for the nights;
      // here is what paying has started to look like, in a plate and in ink.
      {
        text: 'Wade is in at the corner stool, hat on his knee — the night before anything the town does together, he comes up and eats where the town can count him. Barb lands the usual. He gets through half of it, neat about the leaving, and his coat has taken to hanging off him the way coats hang on pegs.',
        when: hornOn,
      },
      {
        text: 'He pays exact and goes early, down toward the shed and the small hours it keeps. Behind him Barb slides the tab book off its shelf, finds his line among the day’s, and goes over it with the pen, unhurried, pressing the letters back down. She doesn’t do it for the crib players.',
        when: hornOn,
      },
      {
        text: 'Down the hill the boat shed window is lit. It was lit when you came in; it is lit at eight, and at nine, a small yellow tooth in all that fog. The crib players find the window between hands and then find their coffee again. Nobody has said Sam’s name all evening. The town can say a name every minute without once using it.',
      },
      {
        text: 'Coats go early. Big day. Barb starts on her chairs.',
      },
    ],
  },
  choices: [
    {
      id: 'stay-while-she-closes',
      label: 'Stay while she closes.',
      stakes: 'major',
      when: earlyTruthGate,
      goto: 'd12-counter',
    },
    { id: 'cross-the-lot', label: 'Cross the lot to your unit.', goto: 'd12-night' },
  ],
  cue: 'pub-warm',
});

// ——— EARLY TRUTH — Barb answers the Night-11 question, once. ———

const counter = defineScene({
  id: 'd12-counter',
  slot: 'evening',
  onEnter: [
    { op: 'flag.set', key: 'knows-truth', value: true },
    { op: 'flag.set', key: 'early-truth', value: true },
  ],
  prose: {
    kind: 'inline',
    paragraphs: [
      {
        text: 'The room empties by nods. You stay, and Barb lets you — banks the grill, drops the lights to the one over the register, turns the chairs herself. She pours two coffees and doesn’t slide yours over so much as station it.',
      },
      {
        text: '“You asked what my Frank was.” To the register, not to you. “I said finish your coffee. Well. It’s a long coffee.” She squares the book on its shelf without opening it. “I’ll say it the once, and then it’s said.”',
      },
      {
        text: '“Frank went through the ice at the narrows, November of the year I bought the second fryer. The lake kept him; you know how it keeps. And the week after freeze-up the door went, and a man walked in with the cold on his coat and Frank’s way of not filling a room, and I poured, and my hands knew before I did. The weight of a step. What came in had the step I remembered.” The furnace ticks. “Remembered, mind. Not the same animal at all.”',
      },
      {
        text: '“I could have said. There’s a phone on that wall and a doctor in town and a priest down the lake, and I looked at him across this counter and chose the winter instead.” She turns her wedding band with a thumb, once. “Best winter of my life. I’d choose it again. Both of those things are true, and I’ve had forty years to get them to sit in the same room.”',
      },
      {
        text: '“What it cost—” The cloth stops. “He thinned. Not sick-thin. Less. Every week there was less of him to hold and more of my own remembering gone to hold him up with. It’s the remembering he stood up in, and it wore. By March I couldn’t get the true sound of his laugh back; the winter one had used it up. When the ice went out there wasn’t enough of either Frank left to lose.”',
      },
      {
        text: 'She opens the register at last, finds tonight’s line without hunting, and inks it over twice, slow, the pen pressing. “There. You asked. Now you know what I knew, and what I did about it, and you can judge me or thank me with the same breath. It’ll take both.”',
      },
      {
        text: 'You look at your own hands on the counter, warm where the mug is and warm where it isn’t. You have stopped needing to be told whose remembering you are standing up in.',
      },
    ],
  },
  choices: [
    {
      id: 'thank-her',
      label: '“Thank you. For the winter you got. For this one.”',
      goto: 'd12-night',
    },
    {
      id: 'nothing-to-say',
      label: 'There is nothing to say. Take the knowing out into the fog.',
      goto: 'd12-night',
    },
  ],
});

// ——— Night 12, fixed: the lit clinic window, watched from the lot. ———

const night = defineScene({
  id: 'd12-night',
  slot: 'night',
  onEnter: [{ op: 'time.set', slot: 'night' }, ...NIGHT_DECAY, ...NIGHT_CUE],
  prose: {
    kind: 'inline',
    paragraphs: [
      {
        text: 'The lot is fog to the knees. Halfway across it you see the light: the clinic’s front room, lit long past any hours it keeps, the only window awake on the street.',
      },
      {
        text: 'Through the glass, at the desk that was a sewing table: Priya on one side, Sam on the other, his phone lying flat on the desk between them like a card played and left face up. Her notebook is open beside it. Neither of them is talking. You watch a long minute from the dark and neither mouth moves at all.',
      },
      {
        text: 'Then she pulls the notebook closer and pages backward — a long way backward, deep into the used part of the book — and writes one small thing in a margin there, where a fresh page would have been easier. Not a new entry. A cross-reference. Sam watches her hand do it and does not reach for his phone. Whatever crossed that desk tonight has finished crossing.',
      },
      {
        text: 'They are doing what you did at Barb’s counter tonight: setting a new shape against an old one to see whether it is the same shape. You could save them the winter it costs to find out. You keep walking.',
        when: knowsTruth,
      },
      { text: 'Your unit. The bed. The habit of it.' },
      {
        text: 'The mattress takes you with less argument than it used to, the springs finding less and less to answer.',
        when: decayedFlesh,
      },
      {
        text: 'On the sill, yesterday’s tab slip has gone grey overnight — the ink drying up out of your line a letter at a time, the pencil totals under it still black as beetles.',
        when: decayedName,
      },
      {
        text: 'You reach for one of the mornings that came to you secondhand and it has a room missing now — a door that opens on nothing at all, in a house that never noticed losing it.',
        when: decayedEcho,
      },
      {
        text: 'At 3:12 the horn takes its five bars out over the water, patient as weather. You are awake for it. You are always awake for it now, and it always finds you, and something in you is fed and doesn’t ask by whom.',
        when: hornOn,
      },
      {
        text: '3:12 comes and stands in the room a while, empty-handed. You know the hour without the horn now.',
        when: hornStopped,
      },
    ],
  },
  choices: [{ id: 'sleep', label: 'Sleep.', goto: 'd13-morning' }],
});

export const DAY12_SCENES: readonly Scene[] = [
  morning,
  prep,
  prep2,
  evening,
  counter,
  night,
];
