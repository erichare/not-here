/**
 * DAY 20 — Nov 25: The House Prepares (design/act3-plan.md §Day 20).
 *
 * Morning (fixed, both stagings): the corkboard's EBUS card is GONE — a
 * darker rectangle in the cork (the countdown gone private; knows-truth
 * gets one line — she is hiding it FROM you). sacrificed-sam runs ONLY:
 * a new @doc under the thumbtacks — BC Transit letterhead, Penticton
 * service RESUMED effective the 26th — with one line reconciling the early
 * resumption against "till December" (the district relented; nobody says
 * for what). Dianne is airing the upstairs room again — second time in
 * seven years. Sam's potluck bill lands onstage the same walk: the shed's
 * plywood wall is down, a duffel where the tripod stood, variant by
 * 'potluck:sam'. Nobody mentions it, which is how the town mentions it.
 *
 * Day hub (2 of 3, new Act 3 shape): the morning's first pick and one
 * forced second pick; 'd20:second-leg' latches after the transition so
 * each branch scene seats exactly once and the evening takes the rest.
 * Missed slots fire Act 3 retellings in the evening — confession-shaped
 * and slightly wrong (clue-#8 grammar); retellings SEED (*:ready) but
 * never complete confessions (no conf:*, no chord.add from a retelling).
 *
 * Night 20 (fixed): SAM'S CONFESSION — 2 AM, the gutted shed, mirror of
 * Night 6. OR-door gate: (told-sam-dont-know OR d16:sam-named OR derived
 * trust:sam ≥ 7) AND potluck:sam ≠ 'given'. TAKE is not offered — Sam
 * hands you nothing. chord.add +1 (bar 5, the whistle voice; fragment
 * audio stays off — the act3-ensemble mixer is unauditioned; the prose
 * carries the return). On 'given' runs the scene does not fire: the shed
 * light burns and you are outside it. NIGHT_DECAY spreads verbatim from
 * act2-shared into BOTH night doors; the unpayable-night rule arms
 * tonight (state only — 'a3:unpayable-armed'; Unwitnessed ships later).
 *
 * Flags this file owns: 'd20:went-dianne' / 'd20:went-wade' /
 * 'd20:went-priya', 'd20:second-leg', 'd20:guitar-held', 'd20:answered',
 * 'd20:silent', 'd20:spent-the-sentence', 'dianne:ready', 'priya:ready',
 * 'wade:door-thawing' (number, step 1), 'conf:sam', 'lever:wade'
 * (the lever chain: conf:sam names Wade's 3:12), 'a3:unpayable-armed'.
 * Act-owned state touched: 'today:fed', 'today:remembered', chord (+1).
 * Facts: 'aired-the-room-d20' (dianne), 'a3:fed-d20' (fed-pattern
 * substrate, dianne/barb), 'asked-who-the-room-is-for' (dianne),
 * 'wade-told-bar-five-d20' / 'held-wades-can' / 'stood-with-wade-d20'
 * (wade), 'answered-priya-friday' / 'private:priya-found-envelope'
 * (priya), 'truth-told' / 'released-sam' (sam).
 *
 * Prose invariants per design/game-bible.md §Prose grammar: nobody
 * touches you first; the town never remarks on the wrongness; no weekday
 * named except Friday; 'Wren' zero times; ONE warm unpriced beat (the
 * coach manifest laugh); ONE giver-hears-it line for Sam's fragment.
 */

import { defineScene, type Choice, type Cond, type Scene } from '@not-here/engine';
import {
  decayedEcho,
  decayedFlesh,
  decayedName,
  defendedVerdict,
  detune,
  exiledVerdict,
  hornOn,
  hornStopped,
  knowsTruth,
  letterMemoryTaken,
  NIGHT_DECAY,
} from './act2-shared.ts';

const notExiled: Cond = { op: 'not', of: exiledVerdict };
const sacrificedSam: Cond = { op: 'fact.exists', tag: 'sacrificed-sam' };
const samGiven: Cond = { op: 'flag', key: 'potluck:sam', value: 'given' };
const samDefendedAtHall: Cond = { op: 'flag', key: 'potluck:sam', value: 'defended' };
const samSilentAtHall: Cond = { op: 'flag', key: 'potluck:sam', value: 'silent' };
const kettleDay: Cond = { op: 'flag', key: 'd18:kettle-day' };
/**
 * The Night-6 lot answer. The OR-door's trust:sam arm admits runs where it
 * never happened (silence or denial in the lot), so every surface that
 * echoes "I don't know" as a repetition — the ANSWER label's second
 * sentence, shed-2's lot callback — must gate on this fact and carry a
 * neutral variant otherwise.
 */
const toldSamDontKnow: Cond = { op: 'fact.exists', tag: 'told-sam-dont-know' };
const neverToldSamDontKnow: Cond = { op: 'not', of: toldSamDontKnow };

const wentDianne: Cond = { op: 'flag', key: 'd20:went-dianne' };
const wentWade: Cond = { op: 'flag', key: 'd20:went-wade' };
const wentPriya: Cond = { op: 'flag', key: 'd20:went-priya' };
const missedDianne: Cond = { op: 'not', of: wentDianne };
const missedWade: Cond = { op: 'not', of: wentWade };
const missedPriya: Cond = { op: 'not', of: wentPriya };
const secondLeg: Cond = { op: 'flag', key: 'd20:second-leg' };

/**
 * Night 20's OR-door (act3-plan §Day 20): no single Day-6 choice may
 * dead-gate the cascade. trust:sam ≥ 7 is reachable via defended-sam
 * (baseline 5 + 2, sam a witness — see day19.ts:45 for the arithmetic
 * grammar). The 'given' exclusion prices the cadence theft (Ruling 7).
 */
const samConfessionGate: Cond = {
  op: 'all',
  of: [
    { op: 'not', of: samGiven },
    {
      op: 'any',
      of: [
        toldSamDontKnow,
        { op: 'flag', key: 'd16:sam-named' },
        { op: 'derived.gte', key: 'trust:sam', value: 7 },
      ],
    },
  ],
};

/**
 * The hub's shared second-leg exits: from any branch's closing scene, the
 * two unvisited doors stand open until the second slot is spent; after it,
 * only the evening. The 2-of-3 shape is enforced here — one forced second
 * pick, never a third.
 */
const HUB_EXITS: readonly Choice[] = [
  {
    id: 'up-to-diannes',
    label: 'Up the hill, to the open sash.',
    when: { op: 'all', of: [{ op: 'not', of: secondLeg }, missedDianne] },
    effects: [{ op: 'flag.set', key: 'd20:second-leg', value: true }],
    goto: 'd20-room',
  },
  {
    id: 'down-to-the-wharf',
    label: 'Down to the wharf, to Wade.',
    when: { op: 'all', of: [{ op: 'not', of: secondLeg }, missedWade] },
    effects: [{ op: 'flag.set', key: 'd20:second-leg', value: true }],
    goto: 'd20-wharf',
  },
  {
    id: 'over-to-the-clinic',
    label: 'Over to the clinic before it closes for winter.',
    when: { op: 'all', of: [{ op: 'not', of: secondLeg }, missedPriya] },
    effects: [{ op: 'flag.set', key: 'd20:second-leg', value: true }],
    goto: 'd20-clinic',
  },
  {
    id: 'let-the-evening-come',
    label: 'Let the evening come.',
    when: secondLeg,
    goto: 'd20-evening',
  },
];

// ——— Morning: the house prepares, and the town does not say so ———

const morning = defineScene({
  id: 'd20-morning',
  slot: 'morning',
  // act2-end owns time.set day 20 — slot only here (the act1-end precedent).
  onEnter: [{ op: 'time.set', slot: 'morning' }],
  prose: {
    kind: 'inline',
    paragraphs: [
      {
        text: 'Day twenty comes up hard-frosted, the fog down to the second orchard row. Three days out from Friday, and the street does its morning the way it does any morning, which takes more doing now.',
      },
      {
        text: 'At the General, the corkboard has been weeded. Where the bus card hung there is a darker rectangle in the cork, clean-edged, the shape of seven years of tape. The firewood notices crowd toward the gap without filling it.',
      },
      {
        text: 'She has taken it down rather than let you read it again. Which means she has watched you read it. Which means she knows what the ring does.',
        when: knowsTruth,
      },
      {
        text: 'Under the thumbtacks, lower than eye height, new letterhead.',
        when: sacrificedSam,
      },
      {
        text: '@doc:\n┌──────────────────────────────────────────┐\n│  BC TRANSIT — SERVICE NOTICE              │\n│                                           │\n│  ROUTE 40   PENTICTON – LORN BAY          │\n│  Effective November 26: weekday runs      │\n│  resume on the winter schedule.           │\n│  We thank you for your patience.          │\n└──────────────────────────────────────────┘',
        when: sacrificedSam,
      },
      {
        text: 'The first notice said month-end. The counter said December. The district has relented early, and nobody at the counter says for what.',
        when: sacrificedSam,
      },
      {
        text: 'Up the hill, Dianne’s house has its upstairs sash raised, curtains breathing out into the cold. The second time in seven years. The street keeps its eyes at street level.',
      },
      {
        text: 'Past the launch, the boat shed stands open a hand’s width. The plywood wall inside is down — map, pins, the folder, gone. A duffel sits where the tripod stood.',
      },
      {
        text: 'The duffel is packed and zipped, squared to the door like a thing that has decided.',
        when: samGiven,
      },
      {
        text: 'The duffel gapes half-packed, one boot in and one boot standing sentry beside it.',
        when: samDefendedAtHall,
      },
      {
        text: 'The duffel hangs slack, barely started. The map is nowhere among the leavings, which means it is folded small and riding in his jacket.',
        when: samSilentAtHall,
      },
      { text: 'Nobody mentions it, which is how the town mentions it.' },
    ],
  },
  choices: [
    { id: 'up-to-diannes', label: 'Up the hill, to the open sash.', goto: 'd20-room' },
    { id: 'down-to-the-wharf', label: 'Down to the wharf, to Wade.', goto: 'd20-wharf' },
    {
      id: 'over-to-the-clinic',
      label: 'Over to the clinic before it closes for winter.',
      goto: 'd20-clinic',
    },
  ],
});

// ——— A. Dianne — the room (sets dianne:ready; the guitar; the press) ———

const room = defineScene({
  id: 'd20-room',
  slot: 'afternoon',
  onEnter: [
    { op: 'time.set', slot: 'afternoon' },
    { op: 'flag.set', key: 'd20:went-dianne', value: true },
    { op: 'flag.set', key: 'dianne:ready', value: true },
    { op: 'fact.add', tag: 'aired-the-room-d20', about: 'dianne', witnessedBy: ['dianne'] },
    // Ruling 5: the offsets live inside the cascade now. Being fed here is
    // attending the truth; a3:fed-d20 is the fed-pattern substrate.
    { op: 'flag.set', key: 'today:fed', value: true },
    { op: 'fact.add', tag: 'a3:fed-d20', witnessedBy: ['dianne'] },
  ],
  prose: {
    kind: 'inline',
    paragraphs: [
      {
        text: 'The stairs are narrow and know their order. The room at the top has its window up and its curtains out, and Dianne is mid-wrestle with the mattress, turning it the way you turn a thing you cannot ask to turn itself.',
      },
      {
        text: '“Twice in two days, and now a third,” she says, meaning Barb’s counter and the days it has had you, not asking why today it doesn’t. She nods you to the far corners of the mattress.',
        when: { op: 'all', of: [kettleDay, notExiled] },
      },
      {
        text: 'The bed goes over with a sound like a held breath let go. She squares the corners by long habit — hospital folds, sheets that smell of the cold — making the room ready the way you make a thing ready when you will not say what for.',
      },
      {
        text: 'On the sill, on a plate that came up with her, the heel of a loaf and cheese cut thick. “Eat that while it’s yours,” she says, without turning.',
      },
      {
        text: 'On the wall above where the pillow goes, the guitar has hung its seven years, strings dull as pond ice. She lifts it down to dust beneath it, and stands a moment too long, neck out, not quite offering.',
      },
    ],
  },
  choices: [
    {
      id: 'take-the-guitar',
      label: 'Take the guitar out of the pause.',
      when: { op: 'stat.gte', stat: 'flesh', value: 5 },
      lockedLabel: 'Take it — but your arms, today, are not certain they could keep it off the floor.',
      effects: [{ op: 'flag.set', key: 'd20:guitar-held', value: true }],
      goto: 'd20-room-2',
    },
    { id: 'let-it-hang', label: 'Let her put it back on the wall.', goto: 'd20-room-2' },
    {
      id: 'ask-who-the-room-is-for',
      label: '“Who is the room for?”',
      stakes: 'major',
      when: knowsTruth,
      effects: [
        { op: 'fact.add', tag: 'asked-who-the-room-is-for', about: 'dianne', witnessedBy: ['dianne'] },
      ],
      goto: 'd20-room-2',
    },
  ],
  cue: 'wrens-room',
});

const room2 = defineScene({
  id: 'd20-room-2',
  slot: 'afternoon',
  prose: {
    kind: 'inline',
    paragraphs: [
      {
        text: 'It comes into your hands with the certainty of a thing that has been waiting to be caught. The weight is wrong for a stranger’s arms: your elbow finds the lower bout before you’ve told it to. Dianne watches your hold, and doesn’t remark on it, and goes back to the sheets a half-beat late.',
        when: { op: 'flag', key: 'd20:guitar-held' },
      },
      {
        text: 'The guitar goes back on its nail. The strings touch the wall and mutter once, and the dust settles where it was.',
        when: { op: 'not', of: { op: 'flag', key: 'd20:guitar-held' } },
      },
      {
        text: 'She doesn’t answer. She smooths the top sheet with both hands until it has no more flat to give, and then does it again. When she straightens, her face is a door with the key on the inside.',
        when: { op: 'fact.exists', tag: 'asked-who-the-room-is-for' },
      },
      {
        text: 'From the doorway the room looks ready for someone. That was always true. What’s new is that she has stopped minding that you see it.',
      },
    ],
  },
  choices: HUB_EXITS,
});

// ——— B. Wade — the wharf (the green door / silence-standing #1) ———

const wharf = defineScene({
  id: 'd20-wharf',
  slot: 'afternoon',
  onEnter: [
    { op: 'time.set', slot: 'afternoon' },
    { op: 'flag.set', key: 'd20:went-wade', value: true },
  ],
  prose: {
    kind: 'inline',
    paragraphs: [
      {
        text: 'The ticket office door is propped with a paint can, and Wade is inside on one knee at the green door, laying primer along the panels in long unhurried passes. The padlock hangs open on the hasp. Seven years the weather was not allowed near this door, and today the whole wharf can watch it being made new.',
        when: { op: 'all', of: [hornOn, notExiled] },
      },
      {
        text: 'A knock at your own threshold: Wade, at the door of the room the town moved you into, a paint can in one hand and permission nowhere assumed. “Your door now,” he says, meaning the green one at the back, and waits to be let in to it. He does not explain the padlock, or the open hasp, or the primer already stirred.',
        when: { op: 'all', of: [hornOn, exiledVerdict] },
      },
      {
        text: 'Wade is at the top of the wharf with the battery cart, two down, one to go. The last one he does not lift. He stands at one end of it, facing the water, in a silence with a shape to it — the first he has offered you since the valve.',
        when: hornStopped,
      },
    ],
  },
  choices: [
    {
      id: 'let-him-tell-bar-five',
      label: 'Let him tell you what she did to the fifth bar.',
      when: hornOn,
      effects: [
        { op: 'flag.set', key: 'today:remembered', value: true },
        { op: 'fact.add', tag: 'wade-told-bar-five-d20', witnessedBy: ['wade'] },
      ],
      goto: 'd20-wharf-2',
    },
    {
      id: 'hold-the-can',
      label: 'Hold the can for him and say nothing.',
      when: hornOn,
      effects: [{ op: 'fact.add', tag: 'held-wades-can', witnessedBy: ['wade'] }],
      goto: 'd20-wharf-2',
    },
    {
      id: 'carry-one-end',
      label: 'Take one end of the battery.',
      when: hornStopped,
      effects: [
        { op: 'flag.set', key: 'wade:door-thawing', value: 1 },
        { op: 'fact.add', tag: 'stood-with-wade-d20', witnessedBy: ['wade'] },
      ],
      goto: 'd20-wharf-2',
    },
  ],
  cue: 'wade-theme',
});

const wharf2 = defineScene({
  id: 'd20-wharf-2',
  slot: 'afternoon',
  prose: {
    kind: 'inline',
    paragraphs: [
      {
        text: '“She’d sing it back wrong,” he says, to the door, painting. “Fifth bar. Flatted the end of it on purpose, so the horn would have to say it again. Made the thing repeat itself like an old man.” A pass of the brush. “Took me a year to hear it was a game. Took her no time at all.” He lets you hold the can, and for a while the job is the whole of the world, and the world is the size of a door.',
        when: { op: 'fact.exists', tag: 'wade-told-bar-five-d20' },
      },
      {
        text: 'He lets you hold the can, and neither of you spends a word on it. “It was always this green,” he says at the end, tapping the lid home. “People think you paint a thing to change it.”',
        when: { op: 'fact.exists', tag: 'held-wades-can' },
      },
      {
        text: 'He lets you lift. That is the whole of it, and it is enormous: the weight goes between you, down the boards, up onto the shelf by the light, and not once does he tell you how to carry. At the end he looks at the battery, not at you. “Same time tomorrow,” he says, which in the old language of the wharf is a door coming off its latch.',
        when: hornStopped,
      },
      {
        text: 'When he goes he leaves the room smelling of primer and the padlock hanging open, and it is somehow more your dwelling for having been asked.',
        when: { op: 'all', of: [hornOn, exiledVerdict] },
      },
    ],
  },
  choices: HUB_EXITS,
});

// ——— C. Priya — the clinic packs for winter (sets priya:ready) ———

const clinic = defineScene({
  id: 'd20-clinic',
  slot: 'afternoon',
  onEnter: [
    { op: 'time.set', slot: 'afternoon' },
    { op: 'flag.set', key: 'd20:went-priya', value: true },
    { op: 'flag.set', key: 'priya:ready', value: true },
    {
      op: 'when',
      cond: letterMemoryTaken,
      // The harvest's cost, paid onstage; she shows no one (seeds Day 22).
      then: [
        { op: 'fact.add', tag: 'private:priya-found-envelope', about: 'priya', witnessedBy: ['priya'] },
      ],
    },
  ],
  prose: {
    kind: 'inline',
    paragraphs: [
      {
        text: 'The clinic is coming down into boxes: the eye chart off its nail, the scale sleeved in bubble wrap, the little room surrendering its authority one drawer at a time. Priya packs the way she charts — nothing touched twice.',
      },
      {
        text: 'Mid-shelf, she stops. An envelope, out of a folder of her own filing — opened, the flap soft with handling, addressed in a hand she knows. You watch her read the front of it twice and go still, the stillness of a person listening for a sound that has already stopped. She cannot find the reading of it anywhere in herself. You could tell her where it went. It went into you.',
        when: letterMemoryTaken,
      },
      {
        text: 'She does not put it in the box with the files. She puts it in her bag, between her own things, and packs on, one beat slower than before.',
        when: letterMemoryTaken,
      },
      {
        text: 'She works to the bottom of a drawer before she speaks, and when she does, the notebook is on the desk, closed, and stays closed — the first conversation the two of you have ever had without it listening. “Are you staying past Friday?” That’s all. No pen. The question sits in the room wearing its own coat.',
        when: { op: 'not', of: letterMemoryTaken },
      },
    ],
  },
  choices: [
    {
      id: 'answer-i-dont-know',
      label: '“I don’t know yet.” Let that be true out loud.',
      when: { op: 'not', of: letterMemoryTaken },
      effects: [
        { op: 'stat.add', stat: 'undertow', value: 1 },
        { op: 'fact.add', tag: 'answered-priya-friday', witnessedBy: ['priya'] },
      ],
      goto: 'd20-clinic-2',
    },
    {
      id: 'fold-the-wrap',
      label: 'Say nothing. Fold the bubble wrap.',
      when: { op: 'not', of: letterMemoryTaken },
      goto: 'd20-clinic-2',
    },
    {
      id: 'keep-packing',
      label: 'Keep packing. Leave her with what she can’t find.',
      when: letterMemoryTaken,
      goto: 'd20-clinic-2',
    },
    {
      id: 'carry-the-box-out',
      label: 'Carry the sealed box out to her car.',
      when: letterMemoryTaken,
      goto: 'd20-clinic-2',
    },
  ],
  cue: 'priya-theme',
});

const clinic2 = defineScene({
  id: 'd20-clinic-2',
  slot: 'afternoon',
  prose: {
    kind: 'inline',
    paragraphs: [
      {
        text: '“Then I’ll leave the space in the file,” she says. No notebook opens. She writes nothing down, which from Priya is its own kind of answer, and she finishes wrapping the scale like a woman with all winter to do it.',
        when: { op: 'fact.exists', tag: 'answered-priya-friday' },
      },
      {
        text: '“All right,” she says, to the silence, evenly, and lets you keep it. On her way past the window she stops one breath at the lake, off-duty at last, and looks at it like a person instead of a chart.',
        when: {
          op: 'all',
          of: [
            { op: 'not', of: letterMemoryTaken },
            { op: 'not', of: { op: 'fact.exists', tag: 'answered-priya-friday' } },
          ],
        },
      },
      {
        text: 'The last boxes seal in a silence that isn’t unfriendly, only occupied. At the door she pats her bag once — not checking for keys — and catches herself doing it, and files that too.',
        when: letterMemoryTaken,
      },
      {
        text: 'The sign on the clinic door turns for the season. Whatever the town needs healed now will have to hold till spring.',
      },
    ],
  },
  choices: HUB_EXITS,
});

// ——— Evening: Friday planned as logistics; the missed slot retold ———

const evening = defineScene({
  id: 'd20-evening',
  slot: 'evening',
  onEnter: [
    { op: 'time.set', slot: 'evening' },
    {
      op: 'when',
      cond: defendedVerdict,
      then: [{ op: 'emit', event: { kind: 'music.cue', cue: 'pub-warm' } }],
    },
    // Act 3 retellings SEED: the readiness is the house's, not your
    // attendance's. conf:* and chord never move from a retelling.
    {
      op: 'when',
      cond: missedDianne,
      then: [{ op: 'flag.set', key: 'dianne:ready', value: true }, detune('dianne')],
    },
    { op: 'when', cond: missedWade, then: [detune('wade')] },
    {
      op: 'when',
      cond: missedPriya,
      then: [{ op: 'flag.set', key: 'priya:ready', value: true }, detune('priya')],
    },
  ],
  prose: {
    kind: 'inline',
    paragraphs: [
      {
        text: 'The Kettle at supper is a committee that would never call itself one. Friday gets planned out loud as logistics, nothing but logistics: who meets the coach, whether the shelter light works, whose truck if it snows. Nobody says why. The why sits in the middle of the table with the salt.',
      },
      { text: '@line:barb:greeting-d20' },
      {
        text: 'Barb serves you inside the planning like furniture — the plate arriving mid-sentence, the coffee topped on the turn — which is the warmest thing nobody could ever be thanked for.',
      },
      // ——— The day's one warm unpriced beat (tonal-ceiling rule). ———
      {
        text: 'The coach list gets read out for the meeting-of, and a name on it stops the room — then the room laughs, all of it at once, even the crib players, because the name is Gerry Odegaard, who swore on the church steps he would die before he rode a bus. Nobody prices the laugh. It costs nothing. For one beat the winter has no hand out.',
      },
      // ——— Without-you: Dianne and the room (confession-shaped, wrong once).
      {
        text: '“Third time she’s aired that room in seven years,” Barb says, when the planning thins. “Turned the mattress, made the bed up fresh both sides — like for a guest with a habit of sides.” She wipes a ring that isn’t there and moves on to the shelter light.',
        when: missedDianne,
      },
      {
        text: 'Under the room, twice, a slow phrase off somebody’s kitchen radio goes by, half a step shy of itself. It doesn’t come back a third time.',
        when: missedDianne,
      },
      // ——— Without-you: Wade and the door (horn-on staging).
      {
        text: '“Green door’s getting its paint,” Barb says, like a weather item. “Had the office propped open to the cold the day long — wanted it witnessed, is my reading. Fresh green over the old, someone said.”',
        when: { op: 'all', of: [missedWade, hornOn] },
      },
      // ——— Without-you: Wade and the battery (stopped staging).
      {
        text: '“Batteries went down the wharf alone again,” Barb says. “He stood the last one at the top a long minute first. Somebody offered him an end, the way I heard it, and he wouldn’t have it.”',
        when: { op: 'all', of: [missedWade, hornStopped] },
      },
      {
        text: 'Later, low, a long-held note works under the floorboards, a degree flat, surfacing twice and going under.',
        when: missedWade,
      },
      // ——— Without-you: Priya and the question, relayed slightly wrong.
      {
        text: '“Doctor’s got the clinic in boxes,” Barb says. “Winter closure, same as every year — except she did the windows too this year, which she never.” The pot hovers. “Asked after you. Would you still be here come Friday. I said I keep a tab, not a calendar.”',
        when: missedPriya,
      },
      {
        text: 'Twice, under the talk, something spare and exact goes by, a fraction under true, like a pulse taken through a coat sleeve.',
        when: missedPriya,
      },
      {
        text: 'You take the end of the day where you take it now, and come up for the planning all the same; the room needs its chairs filled, and yours counts as one.',
        when: exiledVerdict,
      },
    ],
  },
  choices: [
    {
      id: 'eat-inside-the-planning',
      label: 'Eat what lands in front of you, inside the planning.',
      effects: [
        { op: 'flag.set', key: 'today:fed', value: true },
        { op: 'fact.add', tag: 'a3:fed-d20', witnessedBy: ['barb'] },
        { op: 'when', cond: samConfessionGate, then: [{ op: 'goto', scene: 'd20-shed' }] },
      ],
      goto: 'd20-night',
    },
    {
      id: 'take-the-dark-early',
      label: 'Slip out early and take the dark down the hill.',
      effects: [
        { op: 'stat.add', stat: 'undertow', value: 1 },
        { op: 'when', cond: samConfessionGate, then: [{ op: 'goto', scene: 'd20-shed' }] },
      ],
      goto: 'd20-night',
    },
  ],
});

// ——— Night 20, door one: SAM'S CONFESSION — the gutted shed, 2 AM ———
// No cue, and a music.stop: the mirror of Night 6 keeps Night 6's silence.

const shed = defineScene({
  id: 'd20-shed',
  slot: 'night',
  onEnter: [
    { op: 'time.set', slot: 'night' },
    { op: 'emit', event: { kind: 'music.stop' } },
    ...NIGHT_DECAY,
    // The unpayable-night rule arms tonight — state only; the Unwitnessed
    // check itself ships with the endings phase.
    { op: 'flag.set', key: 'a3:unpayable-armed', value: true },
  ],
  prose: {
    kind: 'inline',
    paragraphs: [
      {
        text: 'Two in the morning, and you don’t remember choosing the shore path over the bed. The shed door stands open a hand’s width, light on, the room gutted to its studs. Sam sits on an upturned crate with the duffel between his boots. “I keep the hours now,” he says. “Sit anywhere. There’s nowhere.”',
      },
      {
        text: 'He doesn’t build to it. “She woke me. Climbing past my window with a pack. I was eleven.” One hand opens: what an eleven-year-old thinks. “I followed as far as the breakwater. Watched her put the canoe out dark — toward the highway shore. Not out. Across.”',
      },
      {
        text: 'The wall he took down said three landfalls, three tellings. It was never three stories. It was one canoe, going where a canoe goes when it is a door and not a boat.',
      },
      {
        text: '“She saw me. Came back in — close enough to talk, not close enough to touch. Made me promise.” The words have been kept so long they come out in her cadence, not his: “Don’t tell them where I went. Let them decide.”',
      },
      {
        text: '“And then I waved.” It arrives without pity for himself. “I thought it was an adventure. I stood on the rocks and I waved her off, and she waved back, and I went in and slept like a stone.” He looks at his hands the way you’d look at borrowed tools.',
      },
      {
        text: '“The dog walked her to the pull-in. Came back alone. He’s been seeing her off every night since.” He says it level, like a man reading a log column. “Seven years of four minutes. Somebody in this town has been telling the truth the whole time. It just wasn’t anybody who talks.”',
      },
    ],
  },
  choices: [
    // ANSWER wears two faces, one verb: on runs that gave Sam the lot's
    // "I don't know" (Night 6), the answer is a repetition — "still true".
    // On trust-arm runs where the lot got silence or a denial, the same
    // truth is said for the first time, and nothing claims otherwise.
    {
      id: 'answer-him-again',
      label: '“I don’t know what I am, Sam. That’s still true.”',
      stakes: 'major',
      when: toldSamDontKnow,
      effects: [
        { op: 'stat.add', stat: 'undertow', value: 1 },
        { op: 'fact.add', tag: 'truth-told', witnessedBy: ['sam'] },
        { op: 'flag.set', key: 'd20:answered', value: true },
      ],
      goto: 'd20-shed-2',
    },
    {
      id: 'answer-him',
      label: '“I don’t know what I am, Sam.”',
      stakes: 'major',
      when: neverToldSamDontKnow,
      effects: [
        { op: 'stat.add', stat: 'undertow', value: 1 },
        { op: 'fact.add', tag: 'truth-told', witnessedBy: ['sam'] },
        { op: 'flag.set', key: 'd20:answered', value: true },
      ],
      goto: 'd20-shed-2',
    },
    {
      id: 'stay-silent',
      label: 'Say nothing.',
      stakes: 'major',
      effects: [{ op: 'flag.set', key: 'd20:silent', value: true }],
      goto: 'd20-shed-2',
    },
    {
      id: 'stop-keeping-it',
      label: '“You can stop keeping it.”',
      stakes: 'major',
      when: knowsTruth,
      effects: [
        { op: 'flag.set', key: 'd20:spent-the-sentence', value: true },
        { op: 'fact.add', tag: 'released-sam', about: 'sam', witnessedBy: ['sam'] },
      ],
      goto: 'd20-shed-2',
    },
  ],
});

const shed2 = defineScene({
  id: 'd20-shed-2',
  slot: 'night',
  onEnter: [
    { op: 'flag.set', key: 'conf:sam', value: true },
    // The lever chain (act3-plan contract): each confession names the next
    // keeper. Sam's names Wade's 3:12 — lever:wade ← conf:sam. Retrofit
    // landed with Day 21 (the carried Day-20 ruling, resolved: real flag).
    { op: 'flag.set', key: 'lever:wade', value: true },
    // Bar 5 returns to the ensemble. Fragment audio stays off (the
    // act3-ensemble mixer is unauditioned); the prose carries the return.
    { op: 'chord.add', value: 1 },
  ],
  prose: {
    kind: 'inline',
    paragraphs: [
      {
        text: '“Okay,” he says, and it lands the way it landed in the lot: a true thing, weighed and kept. “Then we’re both what we are, and neither of us gets told.”',
        when: { op: 'all', of: [{ op: 'flag', key: 'd20:answered' }, toldSamDontKnow] },
      },
      {
        text: '“Okay,” he says, and takes it the way he takes weather off the water: a true thing, weighed and kept. “Then we’re both what we are, and neither of us gets told.”',
        when: { op: 'all', of: [{ op: 'flag', key: 'd20:answered' }, neverToldSamDontKnow] },
      },
      {
        text: 'You give him the fog’s answer, and he takes it from the fog. “Yeah,” he says, to the doorway, to the dark over the water. “That’s about what I figured was listening.”',
        when: { op: 'flag', key: 'd20:silent' },
      },
      {
        text: 'The sentence goes out of you in its owner’s plain hand, and Sam goes very still, and then something eleven years old lets go of his shoulders on its way out of the room. He doesn’t ask how you know. In this town, tonight, knowing is the only thing that doesn’t need papers.',
        when: { op: 'flag', key: 'd20:spent-the-sentence' },
      },
      {
        text: 'On the shed step he whistles it once — the fifth bar, whole, unhurried — first time since he was eleven, and the night takes the line and holds it the way the horn used to hold its stop.',
      },
      {
        text: 'At 3:12, from the wharf, five bars go out over the water, and tonight the fifth of them has company somewhere behind your teeth.',
        when: hornOn,
      },
      {
        text: 'Walking back, the shore path spends you like the last of a purse.',
        when: decayedFlesh,
      },
      {
        text: 'Your key knows the lock. For one long second, standing there, you could not have said whose pocket it came out of.',
        when: decayedName,
      },
      {
        text: 'You reach for the sound of the whistle to carry down into sleep, and the shed step is already further off than it should be.',
        when: decayedEcho,
      },
    ],
  },
  choices: [
    { id: 'let-the-twenty-sixth-come', label: 'Let the twenty-sixth come.', goto: 'd20-end' },
  ],
});

// ——— Night 20, door two: the night the scene does not fire ———

const night = defineScene({
  id: 'd20-night',
  slot: 'night',
  onEnter: [
    { op: 'time.set', slot: 'night' },
    {
      op: 'when',
      cond: hornOn,
      then: [{ op: 'emit', event: { kind: 'music.cue', cue: 'foghorn-312' } }],
      else: [{ op: 'emit', event: { kind: 'music.stop' } }],
    },
    ...NIGHT_DECAY,
    // The unpayable-night rule arms tonight — state only (see d20-shed).
    { op: 'flag.set', key: 'a3:unpayable-armed', value: true },
  ],
  prose: {
    kind: 'inline',
    paragraphs: [
      // Act 3's coldest without-you beat: the cadence theft, priced.
      {
        text: 'From your window the boat shed light burns at two in the morning, and you are outside it. That is the whole of the arrangement now: the light, the water, the window between you. Whatever is being said down there tonight is being said to the fog — because the fog, at least, never used his sister’s voice on him.',
        when: samGiven,
      },
      {
        text: 'The shed light is on late, and goes off unremarked. Some doors need more of a person than you have banked. The town sleeps around the shape of Friday.',
        when: { op: 'not', of: samGiven },
      },
      {
        text: 'At 3:12 the five bars go out over the water and the held sixth waits its turn, patient, nearer.',
        when: hornOn,
      },
      {
        text: 'The silence makes its round at 3:12 and finds your door without trying.',
        when: hornStopped,
      },
      {
        text: 'You get into bed the way you’d wade in: unsure the floor of it will bear.',
        when: decayedFlesh,
      },
      {
        text: 'Somewhere down the hill your tab slip holds one day fewer than you do, and you couldn’t say which day it let go.',
        when: decayedName,
      },
      {
        text: 'You go looking for the smell of this morning’s frost and find the shelf swept.',
        when: decayedEcho,
      },
    ],
  },
  choices: [
    { id: 'let-the-twenty-sixth-come', label: 'Let the twenty-sixth come.', goto: 'd20-end' },
  ],
});

// ——— The unsealed act boundary (Day 21 shipped) ———
// The card keeps `time.set day 21` — d21-morning sets SLOT ONLY — but the
// `ending` marker is gone and one choice walks through, exactly as
// act1-end and act2-end unsealed before it. Saves parked here classify
// 'resume' and enter Day 21 with their flags intact; the held place is
// now 'd21-end' (see day21.ts and ACT_BOUNDARY_ENDINGS in both apps).

const dayEnd = defineScene({
  id: 'd20-end',
  onEnter: [{ op: 'time.set', day: 21, slot: 'morning' }],
  prose: {
    kind: 'inline',
    paragraphs: [{ text: '' }, { text: 'NOVEMBER 26' }, { text: '' }],
  },
  choices: [
    { id: 'morning-comes-anyway', label: 'Morning comes anyway.', goto: 'd21-morning' },
  ],
  cue: 'title',
});

export const DAY20_SCENES: readonly Scene[] = [
  morning,
  room,
  room2,
  wharf,
  wharf2,
  clinic,
  clinic2,
  evening,
  shed,
  shed2,
  night,
  dayEnd,
];
