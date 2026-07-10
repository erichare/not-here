/**
 * DAY 13 — THE MEMORIAL POTLUCK (design/act2-beats.md §Day 13; the act's
 * midpoint set piece).
 *
 * Morning (single quiet slot, mirrors Day 7): the Kettle; the register lies
 * closed; Barb's iron line; the EBUS card by the till re-taped — Act 1's
 * exact card, the ring on the 28th showing through the new tape.
 *
 * Evening — the hall (multi-scene; cue hall-upright, then silence when Sam
 * stands — the music.stop rides d13-verdict's onEnter, the upright's lid
 * coming down for the speeches as its diegetic cover). Moose refuses the
 * threshold. Dianne gets as far as "of showing up." Sam's line is the beat
 * sheet's, verbatim — this file owns the act's second and last spoken use
 * of the title phrase. THE VERDICT IS COMPUTED, NOT CHOSEN: derived
 * 'witness' ≥ 9 → defended (chairs scrape toward you; one of the orchard
 * men — this file's one 'Wren', gated on the defended verdict), else →
 * exiled. Facts 'potluck-verdict-*' witnessed by all six. The player's
 * separate Sam-choice (defend / silent / give the town its night) per the
 * beat sheet's exact effects; the cruel option is ECHO +1, STATIC +4 and is
 * written to tempt. knows-truth variant: one paragraph, the worst one.
 *
 * Aftermath split (night 13): defended — Sam alone by the propane tank; if
 * you also defended him, the look that is the friendship arriving early.
 * Exiled — the walk down to the wharf; the ticket office cot made, kettle
 * filled; Wade knew the count before the town did. 'potluck:verdict' =
 * 'exiled' drives the Day 14+ staging (clusters D/E read it per the
 * Contract). Both nights carry NIGHT_DECAY (imported, never re-authored),
 * the track-branched cue emits, fresh gated decay tells, and exit to
 * 'd14-morning'.
 *
 * Flags owned: 'd13:pressed-shirt', 'd13:walked-shore', 'potluck:verdict',
 * 'potluck:sam', 'today:fed' (the Day-13 offset — breakfast). Facts owned:
 * 'potluck-verdict-defended' / 'potluck-verdict-exiled', 'defended-sam',
 * 'sacrificed-sam' (all witnessed by all six).
 *
 * Prose invariants in force: nobody touches you first (Sam's look lands;
 * nothing else does); Moose never growls — he waits out the threshold;
 * nobody remarks; Dianne never addresses you by name.
 */

import {
  CHARACTERS,
  defineScene,
  type Cond,
  type Effect,
  type Scene,
} from '@not-here/engine';
import {
  decayedEcho,
  decayedFlesh,
  decayedName,
  defendedVerdict,
  exiledVerdict,
  hornOn,
  hornStopped,
  knowsTruth,
  NIGHT_DECAY,
} from './act2-shared.ts';

const samDefended: Cond = { op: 'flag', key: 'potluck:sam', value: 'defended' };
const samSilent: Cond = { op: 'flag', key: 'potluck:sam', value: 'silent' };
const samGiven: Cond = { op: 'flag', key: 'potluck:sam', value: 'given' };

/** Track-branched night sound: the horn on horn-on; kept silence otherwise. */
const NIGHT_CUE: readonly Effect[] = [
  {
    op: 'when',
    cond: hornOn,
    then: [{ op: 'emit', event: { kind: 'music.cue', cue: 'foghorn-312' } }],
    else: [{ op: 'emit', event: { kind: 'music.stop' } }],
  },
];

// ——— Morning: quiet, held. The card by the till, re-taped. ———

const morning = defineScene({
  id: 'd13-morning',
  slot: 'morning',
  onEnter: [{ op: 'time.set', day: 13, slot: 'morning' }],
  prose: {
    kind: 'inline',
    paragraphs: [
      {
        text: 'The thirteenth is quiet the way the seventh was quiet — a held morning, the fog barely working at it, half the town home basting something. Moose has the doorway. The crib board stays in its drawer.',
      },
      { text: '@line:barb:greeting-d13' },
      {
        text: 'The register lies closed on its shelf under the counter and stays closed. “There’s an iron in the back if you want it,” Barb says at some point, from the pass, to nobody in particular who could only be you.',
      },
      {
        text: 'By the till, the schedule card has been re-taped — a neat cross of fresh tape over the curl of the old, pressed flat with a thumbnail.',
      },
      {
        text: '@doc:\n┌─────────────────────────────────┐\n│  EBUS — WINTER SCHEDULE         │\n│  VANCOUVER–PENTICTON–LORN BAY   │\n│                                 │\n│   Fri 14 Nov ......... 07:40    │\n│   Fri 21 Nov ......... 07:40    │\n│  (( Fri 28 Nov ....... 07:40 )) │\n│   Fri  5 Dec ......... 07:40    │\n│                                 │\n│  Flag stop. Exact fare. No pets.│\n└─────────────────────────────────┘',
      },
      {
        text: 'The ring around the last Friday shows through the new tape like a bruise through a sleeve. The tape is new. The ring didn’t need renewing.',
      },
    ],
  },
  choices: [
    {
      id: 'eat-then-iron',
      label: 'Eat what she puts down, all of it, then take the iron to your good shirt.',
      effects: [
        { op: 'stat.add', stat: 'flesh', value: 1 },
        { op: 'flag.set', key: 'today:fed', value: true },
        { op: 'flag.set', key: 'd13:pressed-shirt', value: true },
      ],
      goto: 'd13-hall',
    },
    {
      id: 'give-the-day-the-shore',
      label: 'Leave the morning to the shore road and the fog.',
      effects: [{ op: 'flag.set', key: 'd13:walked-shore', value: true }],
      goto: 'd13-hall',
    },
  ],
});

// ——— Evening: the hall fills. Moose stops at the line. ———

const hall = defineScene({
  id: 'd13-hall',
  slot: 'evening',
  onEnter: [{ op: 'time.set', slot: 'evening' }],
  prose: {
    kind: 'inline',
    paragraphs: [
      {
        text: 'At dusk the town walks uphill in its good coats, dishes carried level like verdicts. The hall is lit to the eaves and breathing steam from the kitchen hatch, and the cold outside it has the whole night booked.',
      },
      {
        text: 'Inside: casseroles under foil, every lid striped with masking tape and a name in fat marker. The dish table fills up by family — Yee beside Cole beside names off the orchard gates. No dish came in with you, and no tape either, and the table never leaves a gap where one would go.',
      },
      {
        text: 'The banner is up at the stage end at last: SEVEN YEARS, white on blue. Nobody reads it out. It gets glanced at the way the snowline gets glanced at, and the coffee gets refilled around it.',
      },
      {
        text: 'Moose comes up with the crowd as far as the door and stops there. You are just inside it. People edge around him with plates held high; somebody pats a leg; somebody says, “He’s got old, that dog,” and hangs a coat. He settles on the cold side of the threshold, chin up, facing the light, and does not cross it all night.',
      },
      {
        text: 'Your shirt holds its crease. It is the one thing in the hall that arrived with you, and it behaves.',
        when: { op: 'flag', key: 'd13:pressed-shirt' },
      },
      {
        text: 'The shore road is still on your boots. Nobody minds boots tonight.',
        when: { op: 'flag', key: 'd13:walked-shore' },
      },
      {
        text: 'Somebody’s aunt is at the upright with both hands and the pedal down, rounds of nothing in particular, carols with the corners sanded off. The room talks over it kindly.',
      },
    ],
  },
  choices: [
    {
      id: 'take-the-end-chair',
      label: 'Take the end chair nobody has claimed.',
      goto: 'd13-verdict',
    },
  ],
  cue: 'hall-upright',
});

// ——— The speeches; Sam stands; THE VERDICT IS COMPUTED, NOT CHOSEN. ———

const verdict = defineScene({
  id: 'd13-verdict',
  slot: 'evening',
  onEnter: [
    { op: 'emit', event: { kind: 'music.stop' } },
    {
      op: 'when',
      cond: { op: 'derived.gte', key: 'witness', value: 9 },
      then: [
        { op: 'flag.set', key: 'potluck:verdict', value: 'defended' },
        { op: 'fact.add', tag: 'potluck-verdict-defended', witnessedBy: CHARACTERS },
      ],
      else: [
        { op: 'flag.set', key: 'potluck:verdict', value: 'exiled' },
        { op: 'fact.add', tag: 'potluck-verdict-exiled', witnessedBy: CHARACTERS },
      ],
    },
  ],
  prose: {
    kind: 'inline',
    paragraphs: [
      {
        text: 'The upright’s lid comes down for the speeches and the room hushes itself in rings, the way water settles. Dianne stands with a mug in her hand for a bell and doesn’t need it.',
      },
      {
        text: 'She thanks the committee, the school for the chairs, the orchard crews for the propane. Then: “Seven years,” she says, and the hall holds still in a practiced way. “Seven years of—” Her thumb moves on the mug. “Of showing up,” she says. “Thank you for showing up.” And sits down, to the sound of nobody saying any of the other words.',
      },
      {
        text: 'Then Sam stands. All at once, the way you pull a splinter, chair legs barking on the wax. He is eighteen and shaking and his coat is still on.',
      },
      {
        text: '“That is not my sister. She’s not here. She never came back — whatever this is, it’s not her being here.” Into casserole silence. The urn finishes its cycle and clicks off, and nobody moves toward it.',
      },
      {
        text: 'He is right. Every face in the room knows something it will not let itself say, and yours is one of them.',
        when: knowsTruth,
      },
      {
        text: 'What answers him is not an argument. A chair scrapes — toward you. Then two more, and the orchard crews turn until their shoulders make a loose wall with you inside it. The room is deciding what is real with the only vote it has, which is where it puts its bodies.',
        when: defendedVerdict,
      },
      {
        text: 'One of the orchard men gets to his feet, unhurried, hat already in his hand. “That’s Wren, son. Sit down.” Not unkind. That is the worst of it — how kind the room manages to be, doing this.',
        when: defendedVerdict,
      },
      {
        text: 'Nobody moves toward you. Nobody looks at you either, which takes coordination. Barb studies the place on her lap where the register would be if she had brought it. Dianne studies her folded hands. The town reaches its verdict the way it reaches all of them — without one word anybody could be quoted on.',
        when: exiledVerdict,
      },
      {
        text: 'Sam does not sit. His hands are fists in his coat pockets and his eyes go around the hall for one person who will hold still under them, and stop on you.',
      },
    ],
  },
  choices: [
    {
      id: 'defend-sam',
      label: '“Don’t. He’s allowed. Out of everyone — he’s allowed.”',
      stakes: 'major',
      effects: [
        { op: 'flag.set', key: 'potluck:sam', value: 'defended' },
        { op: 'stat.add', stat: 'undertow', value: 1 },
        { op: 'fact.add', tag: 'defended-sam', about: 'sam', witnessedBy: CHARACTERS },
      ],
      goto: 'd13-after',
    },
    {
      id: 'say-nothing',
      label: 'Say nothing.',
      stakes: 'major',
      effects: [{ op: 'flag.set', key: 'potluck:sam', value: 'silent' }],
      goto: 'd13-after',
    },
    {
      id: 'give-the-night',
      label: '“Sit down, Sam.” In her cadence — the one the memories carry.',
      stakes: 'major',
      effects: [
        { op: 'flag.set', key: 'potluck:sam', value: 'given' },
        { op: 'stat.add', stat: 'echo', value: 1 },
        { op: 'static.add', value: 4 },
        { op: 'fact.add', tag: 'sacrificed-sam', about: 'sam', witnessedBy: CHARACTERS },
      ],
      goto: 'd13-after',
    },
  ],
});

// ——— What you did about Sam, landing. The hall finds its coats. ———

const after = defineScene({
  id: 'd13-after',
  slot: 'evening',
  prose: {
    kind: 'inline',
    paragraphs: [
      {
        text: '“Don’t.” It comes out level and carries — the hall was built for hymns and takes your voice to the corners. “He’s allowed. Out of everyone — he’s allowed.” Nobody argues. The room gives it an inch of silence and holds what it gave.',
        when: samDefended,
      },
      {
        text: 'You feel the seam it opens. A room an hour into choosing you now has to hold two things at once, and the effort shows around the eyes. It costs you nothing visible tonight. Tonight is not when this costs.',
        when: { op: 'all', of: [samDefended, defendedVerdict] },
      },
      {
        text: 'From a room already done counting you, it spends nothing and it buys nothing — except that Sam heard it, and heard who said it. Some purchases only look empty.',
        when: { op: 'all', of: [samDefended, exiledVerdict] },
      },
      {
        text: 'You say nothing. The room handles him — low voices, a coat brought over, an aunt at his elbow talking pie like pie is a rope thrown to a swimmer. You watch, and watching turns out to be its own information: you learn exactly how a town puts a boy away without raising one hand to him.',
        when: samSilent,
      },
      {
        text: '“Sit down, Sam.” It comes out of you in her cadence — the fall on the last word, the patience in it, the one voice in the world with the right to say it to him — and the room exhales like a valve. Somebody laughs too loud at nothing. The urn goes back on. The night is handed back to the town with your prints on it.',
        when: samGiven,
      },
      {
        text: 'Sam sits. Not the way a man sits — the way a wave goes out. For one second he is eleven years old in front of the whole hall, and it was your mouth that did it, wearing hers. The cadence came up easy as breath. Easy as anything borrowed.',
        when: samGiven,
      },
      {
        text: 'After that the evening finds its coats. Foil goes over dishes; the banner stays up for the morning; the hall sorts itself out into who leaves with whom.',
      },
    ],
  },
  choices: [
    {
      id: 'find-your-coat',
      label: 'Find your coat.',
      effects: [
        {
          op: 'when',
          cond: exiledVerdict,
          then: [{ op: 'goto', scene: 'd13-night-exiled' }],
        },
      ],
      goto: 'd13-night-defended',
    },
  ],
});

// ——— Night 13, defended: warm at your back; Sam by the propane tank. ———

const nightDefended = defineScene({
  id: 'd13-night-defended',
  slot: 'night',
  onEnter: [{ op: 'time.set', slot: 'night' }, ...NIGHT_DECAY, ...NIGHT_CUE],
  prose: {
    kind: 'inline',
    paragraphs: [
      {
        text: 'The walk home is warm at your back. The town leaves the hall around you and with you — a loose escort of goodnights, somebody’s headlights holding the road the length of the hill. Doors close behind you like a tide going out politely.',
      },
      {
        text: 'Sam is alone in the lot by the propane tank, hood up, exactly where the light isn’t. His dish went home untouched under its foil. His stool at the Kettle will stand empty a while now. The town has chosen its comfortable ghost over its honest son, and it will be kind to him about it forever, and that is the whole sentence.',
      },
      {
        text: 'He looks at you once. Not a plea, not thanks — an audit. Whatever he finds must balance, because he gives you a half-inch of a nod, the way Tam nods at a road. It is the whole friendship, arriving early, in the only currency he has left tonight.',
        when: samDefended,
      },
      {
        text: 'He does not look at you at all. The hood may as well be a wall with weather on both sides of it. You gave the town its night in her voice; he is out here in the cold doing the sums on what that makes you, and they only come out the one way.',
        when: samGiven,
      },
      {
        text: 'You know what the town bought tonight, and out of whose account. Frank’s winter had an evening like this in it somewhere — early, warm, already paid for.',
        when: knowsTruth,
      },
      { text: 'Your unit. You lie down in the dark with the hall still in your ears.' },
      {
        text: 'Warm as the walk was, the sheets keep none of it. They lie across the bed the way they’d lie across the bed empty.',
        when: decayedFlesh,
      },
      {
        text: 'The unit key’s paper tag catches the streetlight. Barb never wrote on it. It is blanker tonight than paper usually manages.',
        when: decayedName,
      },
      {
        text: 'You reach back for the sound of the room deciding — the chairs, the voice, the kindness — and the middle of the sentence has already worn through, like a coat pocket.',
        when: decayedEcho,
      },
      {
        text: 'At 3:12 the horn plays the town to sleep, five bars, the stop. Tonight it sounds like a thing agreeing with the room’s decision.',
        when: hornOn,
      },
      {
        text: '3:12, and nothing. The verdict came in and the night has no opinion, which is its own kind of one.',
        when: hornStopped,
      },
    ],
  },
  choices: [{ id: 'lie-down', label: 'Let the fourteenth come.', goto: 'd14-morning' }],
});

// ——— Night 13, exiled: the walk goes the other way. Wade knew first. ———

const nightExiled = defineScene({
  id: 'd13-night-exiled',
  slot: 'night',
  onEnter: [{ op: 'time.set', slot: 'night' }, ...NIGHT_DECAY, ...NIGHT_CUE],
  prose: {
    kind: 'inline',
    paragraphs: [
      {
        text: 'Nobody says it to you. It is arranged instead. Barb is at the door ahead of you with her coat on and her hands empty — no key held out, nothing to give and no way to say so — and the crowd’s current runs down the hill tonight instead of up. You go with it because there is nowhere else it goes.',
      },
      {
        text: 'The walk goes the other way, down to the wharf. Behind you the hall lets its light out door by door. Ahead, the breakwater beam swings its slow arm through the fog. Nobody walks with you. Nobody watches you go, either.',
      },
      {
        text: 'The ticket office door stands open an inch on a warm room: stove lit, the cot made army-tight, the kettle filled and set on the ring, the one mug out on the table. Wade is nowhere in it. He did this before the potluck ended — before the verdict was a verdict anywhere but in the arithmetic. He knew the count before the town did.',
      },
      {
        text: 'Somewhere up the hill Sam is carrying the same verdict home in a different pocket. You spent the last of whatever the town was still counting on him. Standing in a doorway made ready before you knew you’d need it, you find you don’t want the spending back.',
        when: samDefended,
      },
      {
        text: 'You gave the town its night, in her cadence, and the town took the gift and finished the count anyway. It bought you nothing. It will cost Sam all the same. The mug on the table is the only thing tonight that was set out for you without a price on it.',
        when: samGiven,
      },
      {
        text: 'You know now why the cot was already made. Wade has known what winters call up longer than anyone in Lorn Bay — and this room is what his knowing does instead of talking.',
        when: knowsTruth,
      },
      {
        text: 'The stove ticks down. You lie on the cot in the small warm dark with the lake at arm’s length under the boards.',
      },
      {
        text: 'The cot is made army-tight and barely loosens under you. In the morning it will look hardly slept in, and it will be right.',
        when: decayedFlesh,
      },
      {
        text: 'A ferry-years luggage label hangs off the cot frame, somebody’s name in copperplate under sixty years of varnish. Whoever they were, this room holds more of them tonight than it holds of you.',
        when: decayedName,
      },
      {
        text: 'You reach back for the hall an hour old — the urn, the chairs, the foil — and part of it has gone soft and won’t take weight, like rot under paint.',
        when: decayedEcho,
      },
      {
        text: '3:12 arrives from almost overhead here, five bars with the compressor’s breath under them, the boards carrying it up through the cot frame. This close, being fed feels like being kept, and you are too tired to mind which it is.',
        when: hornOn,
      },
      {
        text: 'At 3:12, nothing — and from this near, the nothing has architecture. You can hear the size of the room where the sound used to live. The lake goes on saying what it always says.',
        when: hornStopped,
      },
    ],
  },
  choices: [
    { id: 'let-d14-come', label: 'Let the fourteenth come.', goto: 'd14-morning' },
  ],
});

export const DAY13_SCENES: readonly Scene[] = [
  morning,
  hall,
  verdict,
  after,
  nightDefended,
  nightExiled,
];
