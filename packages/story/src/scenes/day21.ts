/**
 * DAY 21 — Nov 26: The Ask (design/act3-plan.md §Day 21).
 *
 * Morning hub (2 of 3, the day20 mechanism): A. Tam at the depot — the
 * 07:10 idles (sacrificed-sam runs: first run back since the suspension).
 * NOT sacrificed-sam: he nods you aboard, asks nothing outbound, says one
 * thing on the return — "Friday I've got a pickup. Vancouver coach
 * connection." (the innocent route's honest Nov-28 pulse; ambush-safe
 * wording) — and tam:ready sets. sacrificed-sam: he is civil to everyone
 * and does not see you; tam:ready then waits on lever:tam (Priya's Day-22
 * hook) or the Moose mercy gate (a3:sat-with-moose, planted this evening).
 * B. Barb — the pie-case compressor has quit; hauling ice all morning is
 * fact helped-barb-ice (witnessedBy ['barb'], the FIFTH trust rung).
 * C. The guitar — the room alone (FLESH ≥ 5 AND dianne:ready); sixth-bar
 * composition moment 1 of 3 (flag sixthbar = 1). The solitary slot gets no
 * retelling — nothing to retell; the hub math prices it.
 *
 * Evening (set piece, plan-sanctioned): DIANNE'S CONFESSION — defended:
 * her kitchen after supper (locks-house runs: she UNLOCKS the door for you
 * while you watch, the reversal the tell); exiled: she comes down to the
 * ticket office at dusk, Day-15 mirror. Gate: dianne:ready OR knows-truth;
 * if neither holds the evening plays WITHOUT it and Day 22's morning
 * catch-up slot stays open (Day 22 implements it; nothing here forecloses
 * it). Verbs: TAKE the memory of the burning (echo-priced) / ANSWER /
 * STAY SILENT. Sets conf:dianne AND lever:priya; chord +1. THE ASK folds
 * inside: defended — she asks you to stand with her Friday, the orchard
 * man touches his hat; exiled — Wade brings word down, unasked, ashamed.
 * "Tonight is not when this costs" is done being deferred.
 *
 * Night 21: BARB'S CONFESSION (derived trust:barb ≥ 7 OR knows-truth).
 * The register opened to the NAME column at last (title-thread payoff,
 * @doc). THE FACT past the Night-11/12 stonewall: how Frank's winter
 * ENDED — one mug, the double ink stopped, gone by noon. Her SIXTH
 * QUESTION closes the scene and the answer is STORED (d21:sixth-answer)
 * for the Day-23 wharf echo. chord +1; conf:barb; barb:counsel-seeded
 * re-runs its check here and upgrades to barb:counsel-live (the live
 * Night-22 door) only through this scene. Gate-fail: the two-line
 * non-scene inside the plain night door.
 *
 * Flags this file owns: 'd21:went-tam' / 'd21:went-barb' /
 * 'd21:went-guitar', 'd21:second-leg', 'tam:ready', 'sixthbar' (number,
 * moment 1), 'd21:guitar-lingered', 'd21:answered', 'd21:silent',
 * 'burning-memory-taken',
 * 'conf:dianne', 'lever:priya' (the lever chain: conf:dianne names
 * Priya's letter), 'd21:sixth-answer' (string = the chosen answer's
 * choice id; Day 23 echoes it verbatim), 'conf:barb',
 * 'barb:counsel-seeded' (re-run here), 'barb:counsel-live' (the upgrade;
 * only this scene writes it), 'a3:unpayable-armed' (re-armed, the day20
 * shape). Act-owned state touched: 'today:fed', chord (+2 possible).
 * Every fed site is a CHOICE (the day-20 grammar) — never onEnter: the
 * fed-pattern substrate (act3-plan §substrate) must be able to stay
 * empty through a refused run, and Night 21 must be able to decay.
 * Facts: 'rode-with-tam-d21' (tam, not on sacrificed runs),
 * 'helped-barb-ice' (barb — the fifth rung, axes.ts row),
 * 'a3:fed-d21' (barb/dianne — fed-pattern substrate),
 * 'a3:sat-with-moose' (tam — Day 22's mercy gate),
 * 'answered-dianne-d21' (dianne), 'private:burning-memory-taken' +
 * 'private:memory-taken' (dianne, the harvest pair).
 *
 * Prose invariants per design/game-bible.md §Prose grammar: nobody
 * touches you first (Barb's exiled coat-carry is the coat over you, never
 * her hand on you); the town never remarks on the wrongness; no weekday
 * named except Friday; 'Wren' zero times; ONE warm unpriced beat (Sam's
 * duffel, sent ahead); ONE giver-hears-it line per fragment (Dianne's
 * whole-hummed bars, Barb's inked-over hum).
 *
 * 2026-07-17 — SIXTH-BAR AUDITION HOLD: the bar-CHARACTER prose (what the
 * sixth bar sounds like per n1:goodbye never/forgot/door) is deferred
 * until Eric auditions the rendered candidates. d21-guitar authors the
 * staging and the sixthbar flag only and stops short of describing the
 * music. The post-audition pass adds the variant paragraphs there.
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
  locksHouse,
  lullabyTaken,
  NIGHT_DECAY,
} from './act2-shared.ts';

const notExiled: Cond = { op: 'not', of: exiledVerdict };
const notLocksHouse: Cond = { op: 'not', of: locksHouse };
const sacrificedSam: Cond = { op: 'fact.exists', tag: 'sacrificed-sam' };
const notSacrificed: Cond = { op: 'not', of: sacrificedSam };
const earlyTruth: Cond = { op: 'flag', key: 'early-truth' };
const notLullabyTaken: Cond = { op: 'not', of: lullabyTaken };

const wentTam: Cond = { op: 'flag', key: 'd21:went-tam' };
const wentBarb: Cond = { op: 'flag', key: 'd21:went-barb' };
const wentGuitar: Cond = { op: 'flag', key: 'd21:went-guitar' };
const missedTam: Cond = { op: 'not', of: wentTam };
const missedBarb: Cond = { op: 'not', of: wentBarb };
const missedGuitar: Cond = { op: 'not', of: wentGuitar };
const secondLeg: Cond = { op: 'flag', key: 'd21:second-leg' };

/**
 * The solitary slot's door: the airing left the house open and the room
 * ready (dianne:ready is guaranteed by Day 20, attendance or retelling),
 * but the guitar asks arms that can hold it. Honest on the starvation
 * pattern; visible-with-ache at the morning pick, hidden in the hub exits
 * (a lockedLabel there would go on dimming after the second leg spends).
 */
const guitarGate: Cond = {
  op: 'all',
  of: [{ op: 'stat.gte', stat: 'flesh', value: 5 }, { op: 'flag', key: 'dianne:ready' }],
};

/**
 * Dianne's door (act3-plan §Day 21): dianne:ready OR knows-truth —
 * deliberately the most reachable confession. If neither holds, the
 * evening plays without it and the Day-22 morning catch-up slot exists;
 * nothing on this day may foreclose that (Day 22 implements the slot).
 */
const dianneConfessionGate: Cond = {
  op: 'any',
  of: [{ op: 'flag', key: 'dianne:ready' }, knowsTruth],
};

/**
 * Barb's door: derived trust:barb ≥ 7 OR knows-truth — the truth shared
 * is its own door. Arithmetic (see day19.ts:45): baseline 5 + one rung
 * per Barb-witnessed kindness; the morning's ice rung is the fifth and
 * lands before every evaluation of this gate.
 */
const barbConfessionGate: Cond = {
  op: 'any',
  of: [{ op: 'derived.gte', key: 'trust:barb', value: 7 }, knowsTruth],
};

/**
 * The hub's shared second-leg exits (the day20 mechanism verbatim): two
 * unvisited doors stand open until the second slot is spent; after it,
 * only the evening. One forced second pick, never a third.
 */
const HUB_EXITS: readonly Choice[] = [
  {
    id: 'out-to-the-depot',
    label: 'Out to the depot, where the 07:10 idles.',
    when: { op: 'all', of: [{ op: 'not', of: secondLeg }, missedTam] },
    effects: [{ op: 'flag.set', key: 'd21:second-leg', value: true }],
    goto: 'd21-depot',
  },
  {
    id: 'in-to-the-kettle',
    label: 'In to the Kettle, where the ice is losing.',
    when: { op: 'all', of: [{ op: 'not', of: secondLeg }, missedBarb] },
    effects: [{ op: 'flag.set', key: 'd21:second-leg', value: true }],
    goto: 'd21-kettle',
  },
  {
    id: 'up-to-the-empty-house',
    label: 'Up to the house while it stands empty.',
    when: { op: 'all', of: [{ op: 'not', of: secondLeg }, missedGuitar, guitarGate] },
    effects: [{ op: 'flag.set', key: 'd21:second-leg', value: true }],
    goto: 'd21-guitar',
  },
  {
    id: 'let-the-evening-come',
    label: 'Let the evening come.',
    when: secondLeg,
    goto: 'd21-evening',
  },
];

// ——— Morning: two days out, and the town keeps its hands busy ———

const morning = defineScene({
  id: 'd21-morning',
  slot: 'morning',
  // d20-end owns time.set day 21 — slot only here (the act1-end precedent).
  onEnter: [{ op: 'time.set', slot: 'morning' }],
  prose: {
    kind: 'inline',
    paragraphs: [
      {
        text: 'Two days out from Friday the town has stopped talking about Friday, which is how you know there is nothing else in it. The fog sits at the treeline like a guest who knows to wait.',
      },
      {
        text: 'At the foot of the hill the 07:10 idles in front of the depot, breathing white, patient as a kept promise. First morning back since the notice went up; the door stands open on the cold.',
        when: sacrificedSam,
      },
      {
        text: 'At the foot of the hill the 07:10 idles in front of the depot, breathing white, the way it has every working morning of its life. Tam checks his columns against the cold.',
        when: notSacrificed,
      },
      {
        text: 'The Kettle’s window is wrong: the pie case dark, the pies out on the counter in a refugee row, and Barb crossing behind them with something heavy that steams cold instead of hot. The compressor has picked its week to quit.',
      },
      {
        text: 'And up the hill the house stands open-doored and empty for the morning — Dianne down at the General till noon, the airing let run on its own, the porch door off the latch because a draft needs a way through. A house held open is a sentence with the end withheld.',
      },
    ],
  },
  choices: [
    { id: 'out-to-the-depot', label: 'Out to the depot, where the 07:10 idles.', goto: 'd21-depot' },
    { id: 'in-to-the-kettle', label: 'In to the Kettle, where the ice is losing.', goto: 'd21-kettle' },
    {
      id: 'up-to-the-empty-house',
      label: 'Up to the house while it stands empty.',
      when: guitarGate,
      lockedLabel:
        'Up to the house — but what waits there wants steady arms, and yours have not been steady for days.',
      goto: 'd21-guitar',
    },
  ],
});

// ——— A. Tam at the depot — the ride, and one sentence on the return ———

const depot = defineScene({
  id: 'd21-depot',
  slot: 'morning',
  onEnter: [
    { op: 'time.set', slot: 'morning' },
    { op: 'flag.set', key: 'd21:went-tam', value: true },
    {
      op: 'when',
      cond: notSacrificed,
      then: [
        { op: 'flag.set', key: 'tam:ready', value: true },
        { op: 'fact.add', tag: 'rode-with-tam-d21', witnessedBy: ['tam'] },
      ],
    },
  ],
  prose: {
    kind: 'inline',
    paragraphs: [
      {
        text: 'The two school kids are aboard already, and the mail, and the cold. Tam stands at the door with his fare book the way a lighthouse stands at a shore: not for himself.',
        when: notSacrificed,
      },
      {
        text: 'He sees you coming and nods you up the step, and that is the entire transaction. Whatever the ride costs today, he has decided you have paid it somewhere else.',
        when: notSacrificed,
      },
      {
        text: 'First run back. The two school kids board like it is nothing, because for them it is. Tam takes fares with a civility so even it could be laid with a level — the district got its apology, the town gets its bus, everyone gets good morning. His eyes travel the queue and arrive on the far side of you without stopping. Not a cut. A ledger with a line through one entry.',
        when: sacrificedSam,
      },
    ],
  },
  choices: [
    {
      id: 'step-up-when-he-nods',
      label: 'Step up when he nods, and take the ride out and back.',
      when: notSacrificed,
      goto: 'd21-depot-2',
    },
    {
      id: 'step-up-with-the-fare',
      label: 'Step up with exact fare, and ride anyway.',
      when: sacrificedSam,
      goto: 'd21-depot-2',
    },
  ],
});

const depot2 = defineScene({
  id: 'd21-depot-2',
  slot: 'morning',
  prose: {
    kind: 'inline',
    paragraphs: [
      {
        text: 'Outbound he asks nothing. The road does its winter work under the wheels, the school kids get off at the junction school, the mail gets on. Tam drives with both eyes where a driver’s eyes belong, and the quiet in the bus is the working kind.',
        when: notSacrificed,
      },
      {
        text: 'It is on the return leg, with the lake coming back into its window, that he says the one thing he says. “Friday I’ve got a pickup. Vancouver coach connection.” Flat as a schedule, to the road. He does not explain it, and the road does not ask.',
        when: notSacrificed,
      },
      {
        text: 'At the depot he sets the brake and thumbs the door and says thanks for riding, generally, to the bus. It is not nothing. It is the shape a door makes when it has decided not to be a wall.',
        when: notSacrificed,
      },
      {
        text: 'The route runs like it never stopped, which is the point being made. He calls the junction, waits out the mail, keeps the heater fair. The whole loop long he is exactly courteous to a number of passengers that does not include you, and when you step down at the depot his good morning goes to the step you leave empty.',
        when: sacrificedSam,
      },
      {
        text: 'Suspended five days, the run has come back knowing something it did not say all the way out and all the way back. Whatever it is, it is scheduled.',
        when: sacrificedSam,
      },
    ],
  },
  choices: HUB_EXITS,
});

// ——— B. Barb — the ice morning (the fifth rung) ———

const kettle = defineScene({
  id: 'd21-kettle',
  slot: 'morning',
  onEnter: [
    { op: 'time.set', slot: 'morning' },
    { op: 'flag.set', key: 'd21:went-barb', value: true },
    // The FIFTH rung (axes.ts): witnessed by Barb, knowers-restricted.
    // Attendance is the help — the morning is the choice already made.
    { op: 'fact.add', tag: 'helped-barb-ice', witnessedBy: ['barb'] },
  ],
  prose: {
    kind: 'inline',
    paragraphs: [
      {
        text: 'The walk-in still makes cold; the pie case only spends it. So the morning is a bucket line of two: block ice out of the deep shelf, across the kitchen, into the case’s well, and back for more while the first lot dies for its country.',
      },
      { text: '@line:barb:ice-d21' },
      {
        text: 'It is graceless work and it does not care who you are, which is the kindest thing a morning can offer. By the third trip your hands have gone past cold into honest; by the tenth you have lost the count and kept the rhythm. Barb works you like a hired man and watches you like a column that is adding up.',
      },
    ],
  },
  choices: [
    {
      id: 'eat-what-she-puts-down',
      label: 'Eat what she puts down when the case is holding.',
      effects: [
        { op: 'flag.set', key: 'today:fed', value: true },
        { op: 'fact.add', tag: 'a3:fed-d21', witnessedBy: ['barb'] },
      ],
      goto: 'd21-kettle-2',
    },
    {
      id: 'wave-off-the-plate',
      label: 'Wave off the plate and keep your hands cold.',
      effects: [{ op: 'stat.add', stat: 'undertow', value: 1 }],
      goto: 'd21-kettle-2',
    },
  ],
});

const kettle2 = defineScene({
  id: 'd21-kettle-2',
  slot: 'morning',
  prose: {
    kind: 'inline',
    paragraphs: [
      {
        text: 'Eggs and the toast’s dark end, eaten standing at the counter with the ice water still finding your wrists. She tops the coffee without being a person doing a kindness, and writes something short while you eat, and does not read it to you.',
        when: { op: 'flag', key: 'today:fed' },
      },
      {
        text: 'The plate goes back under the pass untouched. Barb looks at it the way she looks at weather that will matter later, and says nothing, and the nothing goes in the book with everything else.',
        when: { op: 'not', of: { op: 'flag', key: 'today:fed' } },
      },
      {
        text: 'By late morning the case hums a lie — cold enough, for now, on borrowed ice — and the pies file back in like a congregation. “It’ll hold to Friday,” Barb says, to the case, in the tone she uses on things that had better.',
      },
    ],
  },
  choices: HUB_EXITS,
});

// ——— C. The guitar — the room alone (sixth-bar moment 1 of 3) ———
//
// 2026-07-17 AUDITION HOLD: the bar-character prose — what the sixth bar
// sounds like, per n1:goodbye (never / forgot / door) — is DEFERRED until
// Eric auditions the rendered candidates. This scene ships the staging
// and the flag only, and stops short of the music itself. The
// post-audition pass adds the variant paragraphs directly below the
// hands-on-the-neck paragraph, keyed saidNever / saidForgot / saidDoor
// (the day19.ts:60 read pattern).

const guitar = defineScene({
  id: 'd21-guitar',
  slot: 'morning',
  onEnter: [
    { op: 'time.set', slot: 'morning' },
    { op: 'flag.set', key: 'd21:went-guitar', value: true },
    // Composition moment 1 of 3 (act3-plan §Mechanics: composition).
    { op: 'flag.set', key: 'sixthbar', value: 1 },
  ],
  prose: {
    kind: 'inline',
    paragraphs: [
      {
        text: 'The porch door is off the latch for the draft, the way an airing needs, and the house takes you in without a floorboard raising its voice. Nobody is home. The stairs know their order. The room at the top is ready for someone, and for the length of this morning the someone is you.',
      },
      {
        text: 'The door she has locked against the whole town for a week of evenings stands open on its own key this morning, the key left standing in the lock like a sentence trailed off. You could think about that for a long time. You go up instead.',
        when: locksHouse,
      },
      {
        text: 'The guitar comes down off its nail with the certainty of a thing that has stopped waiting to be caught, and the bed takes you at its foot, and the weight settles across your knee where a weight like it has settled some thousand times that were never yours.',
      },
      {
        text: 'Your left hand walks up the neck and stops, and the shape it makes on the cold strings is nothing you were ever taught. The fingers know their order the way the stairs know theirs. There is a next place for them to go — you can feel it downhill of the last, the way you can feel a step in the dark before your foot has found it — and your hand hangs there, above the strings, at the edge of the part that does not exist yet.',
      },
      {
        text: 'You do not sound it. Not out of fear. Out of the certainty that it is not finished being written, and that the writing has, without asking, become partly yours.',
      },
    ],
  },
  choices: [
    {
      id: 'sit-a-minute-longer',
      label: 'Sit a minute longer with the weight of it.',
      effects: [{ op: 'flag.set', key: 'd21:guitar-lingered', value: true }],
      goto: 'd21-guitar-2',
    },
    {
      id: 'hang-it-back',
      label: 'Hang it back on its nail before the house returns.',
      goto: 'd21-guitar-2',
    },
  ],
  cue: 'wrens-room',
});

const guitar2 = defineScene({
  id: 'd21-guitar-2',
  slot: 'morning',
  prose: {
    kind: 'inline',
    paragraphs: [
      {
        text: 'You stay until your hands are only hands again, and the room does not hurry you, which from this room is a granted thing. When the guitar goes back on its nail the strings touch the wall and keep their counsel.',
        when: { op: 'flag', key: 'd21:guitar-lingered' },
      },
      {
        text: 'The nail takes the guitar back and the wall takes the nail’s word for it. Going down, you count the stairs without meaning to, and the count is right.',
        when: { op: 'not', of: { op: 'flag', key: 'd21:guitar-lingered' } },
      },
      {
        text: 'Outside, the morning has gone on being a morning. The porch door goes back to the exact angle of its latchlessness. Nobody saw. Which means the only witness the hour had is the one it was about.',
      },
    ],
  },
  choices: HUB_EXITS,
});

// ——— Evening: the duffel ahead of its owner; the missed slot retold ———

const evening = defineScene({
  id: 'd21-evening',
  slot: 'evening',
  onEnter: [
    { op: 'time.set', slot: 'evening' },
    // Act 3 retellings SEED, never complete (the day20 rule). Tam's
    // readiness is the route's, not your attendance's — and it does NOT
    // seed on sacrificed-sam runs: he did not see you, and the town
    // retelling him cannot make him have.
    {
      op: 'when',
      cond: missedTam,
      then: [
        { op: 'when', cond: notSacrificed, then: [{ op: 'flag.set', key: 'tam:ready', value: true }] },
        detune('tam'),
      ],
    },
    { op: 'when', cond: missedBarb, then: [detune('barb')] },
    // The guitar slot gets no retelling: nobody was there to tell it.
  ],
  prose: {
    kind: 'inline',
    paragraphs: [
      {
        text: 'The Kettle at the end of the afternoon is half committee again — the shelter light is fixed, the coach is met, whose truck stands decided — and half just supper smell and steam on the glass. The town has its plans where it likes them: made, and not spoken of.',
      },
      // ——— The day's one warm unpriced beat (tonal-ceiling rule). ———
      {
        text: 'Word comes in with the cold off the street: Sam’s duffel has arrived ahead of him — carried down and left at your door, wherever your door is these days, with a knot in the strap tied the way he ties things, which is to say permanently. He sent it ahead. Not to the coach stop. To wherever you are. Nobody prices it, and nothing about the evening asks you to.',
      },
      // ——— Without-you: Tam's morning, confession-shaped, wrong once.
      {
        text: '“Run went out empty this morning and came back with the mail,” Barb says, though the school kids ride every working day of their lives. “And Tam’s got a pickup Friday — coach connection, Vancouver side. Said it to the crib table like a road report.” She moves on to the shelter light without landing on it.',
        when: { op: 'all', of: [missedTam, notSacrificed] },
      },
      {
        text: '“Run’s back as of this morning,” Barb says, in the voice she keeps for weather that arrived as forecast. “Civil the whole loop, I hear. Sat the four minutes at the top of the hill before he pulled out, the way I heard it — though the four minutes were never his to sit.” She does not explain that, because the town does not explain that.',
        when: { op: 'all', of: [missedTam, sacrificedSam] },
      },
      {
        text: 'Twice, under the clatter, something goes by keeping road-tempo and landing a breath behind its own beat, like an engine note counted across water. Nobody looks up.',
        when: missedTam,
      },
      // ——— Without-you: Barb's morning, minimized — the wrongness hers.
      {
        text: 'Somebody asks after the dark pie case. “Quit in the night,” Barb says. “Hauled the ice across before the first pot. No time at all.” It took the morning; the morning is not mentioned. “Nobody’s hands to spare this week anyway,” she says, and tops a cup that was full.',
        when: missedBarb,
      },
      {
        text: 'Once, from the back kitchen, a phrase off the radio comes through thinner than its own echo, and nobody turns it up.',
        when: missedBarb,
      },
      {
        text: 'You take your place in it from the edges now, and the edges have learned to leave a chair. The evening does not require you. It has stopped being able to pretend it doesn’t notice you either.',
        when: exiledVerdict,
      },
    ],
  },
  choices: [
    // Ruling 5: attending the truth feeds you — but by choice, never by
    // force (the day-20 grammar). The refused entry keeps the substrate
    // and the Night-21 decay alive on refusal-pattern runs.
    {
      id: 'up-the-hill-when-the-dishes-clear',
      label: 'Up the hill when the supper crowd thins, to her table. She is expecting you, in the way of a made bed.',
      when: { op: 'all', of: [dianneConfessionGate, defendedVerdict] },
      effects: [
        { op: 'flag.set', key: 'd21:supper-kept', value: true },
        { op: 'flag.set', key: 'today:fed', value: true },
        { op: 'fact.add', tag: 'a3:fed-d21', witnessedBy: ['dianne'] },
      ],
      goto: 'd21-confession',
    },
    {
      id: 'up-the-hill-past-the-supper',
      label: 'Up the hill the same, and let whatever she kept warm go past you. Tonight you are only here for the words.',
      when: { op: 'all', of: [dianneConfessionGate, defendedVerdict] },
      effects: [{ op: 'stat.add', stat: 'undertow', value: 1 }],
      goto: 'd21-confession',
    },
    {
      id: 'go-down-and-be-findable',
      label: 'Go down to the ticket office and be findable.',
      when: { op: 'all', of: [dianneConfessionGate, exiledVerdict] },
      goto: 'd21-confession',
    },
    {
      id: 'let-the-evening-be-ordinary',
      label: 'Let the evening be ordinary while it still can.',
      when: { op: 'not', of: dianneConfessionGate },
      goto: 'd21-evening-2',
    },
  ],
});

// ——— DIANNE'S CONFESSION — the act's first set piece ———
// Ruling 5: the supper is confession-adjacent and fed BY CHOICE — the
// table entry carries the pair (day-20 grammar); the exiled dish is
// deliberately uneaten and the vigil plate is that route's offset. The
// scene itself never force-feeds: the fed-pattern substrate must be
// able to stay empty through a refused run, and Night 21 must decay.

const confession = defineScene({
  id: 'd21-confession',
  slot: 'evening',
  prose: {
    kind: 'inline',
    paragraphs: [
      {
        text: 'Supper at the house is pot roast and the good gravy and not one word of consequence, and afterward she washes and you dry, and the kitchen goes through its evening the way a tide goes out: on schedule, leaving things standing that the water had covered. She hangs the towel dead centre on its rail. Then she sits down at her own table like a visitor, and folds her hands, and begins.',
        when: { op: 'all', of: [defendedVerdict, notLocksHouse] },
      },
      {
        text: 'She is at the door when you come up the walk — inside it, behind the glass, and for one bad breath it is every evening of the last week. Then, while you watch, she turns the bolt. Openly, slowly, her eyes on yours through the pane: the sound of it swimming out to you in the cold like something surfacing. She has locked this door against the town, the week, and you. Tonight she unlocks it in front of you, which is a sentence in a language the two of you have been inventing, and it says: witnessed. Supper is on the table. Afterward she sits, and folds her hands, and begins.',
        when: { op: 'all', of: [defendedVerdict, locksHouse] },
      },
      {
        text: 'At dusk she comes down to the ticket office, and her coat is still wrong for the wind — the good coat, the town coat, seven falls old and never once traded for a sensible one. She sets a covered dish on the wharf boards between you and does not step back from it this time. She sits on the piling head opposite, in the spray-cold, in the wrong coat, and the dish goes slowly cold between you while she talks, and neither of you moves to save it, because it is doing its work where it is.',
        when: exiledVerdict,
      },
      {
        text: 'Your plate goes back to the kitchen the way it came. She takes it without comment and stacks it with the emptied ones, and whatever she makes of the difference goes where she keeps the rest of the week.',
        when: {
          op: 'all',
          of: [defendedVerdict, { op: 'not', of: { op: 'flag', key: 'd21:supper-kept' } }],
        },
      },
      {
        text: '“I’m going to tell you a morning,” she says. “I’ve told it to the stove and I’ve told it to the dark, and it comes out clean now, which is how I know it’s ready. Nobody else gets it. You do.”',
      },
      {
        text: '“I found the note by six. She’d have wanted more of a head start than that, knowing her, and she got it — I stood at the cold stove and read it the once. Just the once. Then I lit the stove with it.” Her thumb moves on her own knuckle, one pass. “And before the kettle had boiled I was out on the step telling the neighbours the canoe was gone. The canoe’s gone. Three words, and I had them ready, and I have wondered every day since how long I’d had them ready.”',
      },
      {
        text: '“There was never a search I believed in. I walked the shore with the rest of them and I believed in none of it. You can’t drag a lake for a girl whose goodbye you lit the stove with.”',
      },
      {
        text: '“I would rather have had a drowned girl than a left one. Then the fog agreed with me.” It comes out level, a fact from a woman who respects facts. “A drowned girl is yours forever. A left one chose. And I have been living in the agreement seven years.”',
      },
      // Her fragment: on refused routes it is still hers to sound — the
      // giver-hears-it line, one per fragment.
      {
        text: 'And then, past the worst of it, she hums — bars one and two, whole, unhurried, the way you would set two stitches to hold a seam while your hands shook — and hears herself do it, and lets them stand. For the length of four bars nobody she is speaking of is dead.',
        when: notLullabyTaken,
      },
      {
        text: 'And then, past the worst of it, she goes to hum it — and the tune comes out with a hole where its middle was, her voice stepping around the missing stair mid-phrase without her feeling the gap. She does not notice. You do. It is marked here once, and never again: what she gave you does not come back when she reaches for it, and she has stopped being able to tell that she is reaching.',
        when: lullabyTaken,
      },
      {
        text: '“I needed to get the words right before Friday.” She says it to you kindly, and she knows what she is saying, and she says it anyway, to your face, which is the face she has been practising on.',
        when: knowsTruth,
      },
    ],
  },
  choices: [
    {
      id: 'take-the-burning',
      label: 'Take the morning off her — the stove, the match, the three ready words.',
      stakes: 'major',
      effects: [
        { op: 'stat.add', stat: 'echo', value: 2 },
        {
          op: 'fact.add',
          tag: 'private:burning-memory-taken',
          about: 'dianne',
          witnessedBy: ['dianne'],
        },
        { op: 'fact.add', tag: 'private:memory-taken', about: 'dianne', witnessedBy: ['dianne'] },
        { op: 'flag.set', key: 'burning-memory-taken', value: true },
      ],
      goto: 'd21-confession-2',
    },
    {
      id: 'answer-her',
      label: '“You lit the stove. You also kept the room.”',
      stakes: 'major',
      effects: [
        { op: 'stat.add', stat: 'undertow', value: 1 },
        { op: 'fact.add', tag: 'answered-dianne-d21', witnessedBy: ['dianne'] },
        { op: 'flag.set', key: 'd21:answered', value: true },
      ],
      goto: 'd21-confession-2',
    },
    {
      id: 'stay-silent',
      label: 'Say nothing. Stay.',
      stakes: 'major',
      effects: [{ op: 'flag.set', key: 'd21:silent', value: true }],
      goto: 'd21-confession-2',
    },
  ],
});

const confession2 = defineScene({
  id: 'd21-confession-2',
  slot: 'evening',
  onEnter: [
    { op: 'flag.set', key: 'conf:dianne', value: true },
    // The lever chain: Dianne's confession names Priya's letter.
    { op: 'flag.set', key: 'lever:priya', value: true },
    // Her fragment enters the ensemble — on lullaby-taken runs it returns
    // to the ensemble and not to her. Fragment audio stays off (mixer
    // unauditioned); the prose carries it.
    { op: 'chord.add', value: 1 },
  ],
  prose: {
    kind: 'inline',
    paragraphs: [
      {
        text: 'It goes out of her all at once, the way a held breath does, and what it takes with it is exact: the cold stove, the match, the three ready words. She blinks, and picks the thread of the evening back up one sentence too late, and speaks of Friday’s logistics with a lightness that has not been possible in this house for seven years. The tin on the shelf above the stove takes her glance and gives nothing back, and this time neither does she. There is a mercy here. You did not ask her which mercy she wanted.',
        when: { op: 'all', of: [{ op: 'flag', key: 'burning-memory-taken' }, notExiled] },
      },
      {
        text: 'It goes out of her all at once, the way a held breath does, and what it takes with it is exact: the cold stove, the match, the three ready words. She straightens on the piling head, lighter by a morning, and speaks of Friday as if Friday were simple. Up the hill, on the shelf above her stove, whatever the tin has been keeping is ash again — anyone’s ash, any fire’s — and it will still be that when she gets home, and she will not know to mind. There is a mercy here. You did not ask her which mercy she wanted.',
        when: { op: 'all', of: [{ op: 'flag', key: 'burning-memory-taken' }, exiledVerdict] },
      },
      {
        text: 'She takes the answer the way she takes a dish at a funeral: with both hands, without checking what’s under the cloth. “The room,” she says. “Yes.” And for a moment the two true things sit in front of her — the stove lit, the bed made — and she does not choose between them, which is the closest thing to absolution the evening has in stock.',
        when: { op: 'flag', key: 'd21:answered' },
      },
      {
        text: 'You give her nothing, and she nods as though nothing were a currency she has long experience of. “That’s all right,” she says. “I didn’t tell it to be answered. I told it to be heard, and you did that part properly.”',
        when: { op: 'flag', key: 'd21:silent' },
      },
      // ——— THE ASK: the Day-13 debt, cashed at face value. ———
      {
        text: 'At the door, coat on, she asks it plainly. “Friday. When the coach comes in, I’ll be standing at the shelter, and I am asking you to stand up there with me.” No softening around it. A room chose you once, an hour into an evening, and deferred the cost; the vote has a date on it now, and the date is Friday, and tonight is when this starts to cost.',
        when: defendedVerdict,
      },
      {
        text: 'She does not say what standing there will mean. To you, tonight, she does not have to.',
        when: { op: 'all', of: [defendedVerdict, knowsTruth] },
      },
      {
        text: 'On the porch, in the cold, the orchard man is passing with his dog — the one who got to his feet at the hall, unhurried, hat already in his hand. He does not stop. He touches the hat, once, to you and to her door in the same motion, and goes on down the hill with the vote riding easy on his shoulders.',
        when: defendedVerdict,
      },
      {
        text: 'She has been gone up the hill ten minutes when Wade comes down the boards, and he comes the way a man comes to a door he would rather burn than knock on. “You’ll hear it from somebody,” he says, to the piling, ashamed of the errand and doing the errand. “Friday. The shelter. The feeling is—” he makes himself say it “—the feeling is the day would go easier without you in it.” Nobody asked him to bring it. He brought it so it would arrive with an apology attached. The trap the town built at the potluck is out loud at last, and it has your absence written in as the spring.',
        when: exiledVerdict,
      },
    ],
  },
  choices: [
    {
      id: 'sit-the-cold-with-moose',
      label: 'Sit the cold at the diner door, where the dog keeps his watch.',
      goto: 'd21-vigil',
    },
    {
      id: 'take-the-dark-home',
      label: 'Take the dark home.',
      effects: [{ op: 'when', cond: barbConfessionGate, then: [{ op: 'goto', scene: 'd21-lamp' }] }],
      goto: 'd21-night',
    },
  ],
});

// ——— The evening without her (gate-fail; Day 22 owns the catch-up) ———
// Nothing here forecloses the Day-22 morning slot: no conf:*, no lever,
// no flag any later gate reads negatively.

const evening2 = defineScene({
  id: 'd21-evening-2',
  slot: 'evening',
  prose: {
    kind: 'inline',
    paragraphs: [
      {
        text: 'The evening plays itself without an event: supper noise thinning, the shelter light argued into working order, the fog taking the street back a storefront at a time. Up the hill a kitchen window burns and holds whatever it holds one night longer.',
      },
      {
        text: 'Whatever was ready to be said tonight has not found its door yet. Mornings exist. The town is proof.',
      },
    ],
  },
  choices: [
    {
      id: 'take-the-plate-out-to-the-cold',
      label: 'Take the offered plate out to the diner door, and eat it in the dog’s company.',
      effects: [
        { op: 'flag.set', key: 'today:fed', value: true },
        { op: 'fact.add', tag: 'a3:fed-d21', witnessedBy: ['barb'] },
      ],
      goto: 'd21-vigil',
    },
    {
      id: 'eat-inside-and-let-the-night-come',
      label: 'Eat inside, and let the night come on schedule.',
      effects: [
        { op: 'flag.set', key: 'today:fed', value: true },
        { op: 'fact.add', tag: 'a3:fed-d21', witnessedBy: ['barb'] },
        { op: 'when', cond: barbConfessionGate, then: [{ op: 'goto', scene: 'd21-lamp' }] },
      ],
      goto: 'd21-night',
    },
    {
      id: 'take-the-dark-early',
      label: 'Slip out early and take the dark down the hill.',
      effects: [
        { op: 'stat.add', stat: 'undertow', value: 1 },
        { op: 'when', cond: barbConfessionGate, then: [{ op: 'goto', scene: 'd21-lamp' }] },
      ],
      goto: 'd21-night',
    },
  ],
});

// ——— The vigil: the mercy gate plants here (Tam saw) ———

const vigil = defineScene({
  id: 'd21-vigil',
  slot: 'evening',
  onEnter: [{ op: 'fact.add', tag: 'a3:sat-with-moose', witnessedBy: ['tam'] }],
  prose: {
    kind: 'inline',
    paragraphs: [
      {
        text: 'At the hour, Moose gets up from the mat inside the glass, asks the door with his whole body, and takes his post: chin high, facing the pull-in, on duty. Tonight you go out with him. The cold at the diner door is a working cold, the kind that checks your seams, and the two of you sit in it on the same side of the same waiting, and he moves over exactly enough to make it official.',
      },
      {
        text: 'The last run comes down the hill on time, lights first, then the sound of it. First night it has come at all in five days, and the dog’s four minutes get paid again in full: door, air brakes, Tam on the step, the old ceremony of nothing happening. Moose sees it through to the end and only then remembers he is old.',
        when: sacrificedSam,
      },
      {
        text: 'The last run comes down the hill on time, lights first, then the sound of it, and the dog’s four minutes go by the way they have gone by for seven years: door, air brakes, Tam on the step, the ceremony observed.',
        when: notSacrificed,
      },
      {
        text: 'From the step, over the dog’s head, Tam looks at the door of the Kettle and finds you in front of it, sitting the cold for no reason a schedule could hold. He looks for exactly as long as a man looks at a thing he intends to remember. Then he climbs back up, and the bus takes its light away up the hill.',
      },
    ],
  },
  choices: [
    // The cold-sitter's offset (Ruling 5, the wharf route's reachable
    // meal): Barb's plate through the door, only for a day still unfed —
    // a choice, never a force; refusing it is refusing it.
    {
      id: 'take-what-she-hands-through-the-door',
      label: 'Take the plate she hands out through the door, and eat it in the dog’s company.',
      when: { op: 'not', of: { op: 'flag', key: 'today:fed' } },
      effects: [
        { op: 'flag.set', key: 'today:fed', value: true },
        { op: 'fact.add', tag: 'a3:fed-d21', witnessedBy: ['barb'] },
        { op: 'when', cond: barbConfessionGate, then: [{ op: 'goto', scene: 'd21-lamp' }] },
      ],
      goto: 'd21-night',
    },
    {
      id: 'let-the-night-have-the-rest',
      label: 'Let the night have the rest.',
      effects: [{ op: 'when', cond: barbConfessionGate, then: [{ op: 'goto', scene: 'd21-lamp' }] }],
      goto: 'd21-night',
    },
  ],
});

// ——— Night 21, door one: BARB'S CONFESSION — one lamp, the NAME column ———

const lamp = defineScene({
  id: 'd21-lamp',
  slot: 'night',
  onEnter: [
    { op: 'time.set', slot: 'night' },
    // After close the Kettle keeps its own silence — no cue tonight.
    { op: 'emit', event: { kind: 'music.stop' } },
    ...NIGHT_DECAY,
    // The unpayable-night rule stays armed (state only; the day20 shape).
    { op: 'flag.set', key: 'a3:unpayable-armed', value: true },
  ],
  prose: {
    kind: 'inline',
    paragraphs: [
      {
        text: 'After close, the Kettle is one lamp and the tick of the case learning to live on ice. She locks the front, pulls the blind to the height she pulls it, and comes back to the counter where you are still, somehow, allowed to be. The register comes out from under the counter and she does not open it to today.',
        when: notExiled,
      },
      {
        text: 'After close she banks the grill, takes the register from under the counter, and says, “Walk’s cold.” On the hill she swings her coat off and drops it over your shoulders from behind — the coat, never the hand, its weight arriving like a verdict in your favour — and walks beside you inside her cardigan, book under her arm, breath white, down to the ticket office. The first time she did this there was a register to deliver. The second time is a confession. She lights your lamp herself, and lays the book on the counter, and does not open it to today.',
        when: exiledVerdict,
      },
      {
        text: 'She opens it all the way back. Forty years of winters turn past under her thumb, and she stops where the practice started, and turns the book to face you the way you turn a photograph of the dead.',
      },
      {
        text: '@doc:\n┌──────────────────────────────────────────┐\n│  THE KETTLE — REGISTER                   │\n│                                          │\n│  DATE               NAME         UNIT    │\n│  dec, the mill year not here     one     │\n│  jan, the hard one  not here     one     │\n│  nov, last winter   not here     one     │\n│                                          │\n│                     Frank                │\n│                                          │\n│  nov sixth                       one     │\n└──────────────────────────────────────────┘',
      },
      {
        text: 'Every winter guest for forty years, page back through page, and in the NAME column, in her hand, the same two words each time, steady as a pulse. All the way back to the first line of the practice, which is the only one with a name in it, and the name is Frank. Your line is the last one. Your line is still blank. She has been waiting to see what she would get to write.',
      },
      {
        text: '“You asked me once what Frank was,” she says. “I told you to finish your coffee. What he was isn’t the part I owe you.”',
      },
      {
        text: '“You already paid for the other part,” she says, “so I’ll not charge you twice: you know what came in off the ice wearing him, and what the keeping cost. This is the part I kept back even then.”',
        when: earlyTruth,
      },
      {
        text: '“One morning in March I woke up and went for the sound of his laugh, the true one, the summer one — and it wasn’t there. Worn through. The second one had used it up, exactly the way I’d been warned a thing like that uses a person up, and I had let it, pour by pour.” The lamp does what lamps do. “So I ended the winter. Me. Nobody else in it. I came down and I poured one mug instead of two. I wrote the day’s line once and let the ink sit thin. That’s all it took, after all that — one mug, one inking. He was gone by noon. Not out the door. Just — gone by noon, the way morning frost is.”',
      },
      {
        text: '“I’ll tell you the other thing, since you’re the one soul in town it can’t ambush.” Her thumb squares the register to the counter edge. “Once this week — once — I went looking in my head for that girl’s face, the true one, and what came up was yours. Came up first. I caught it. But I caught it late.”',
        when: knowsTruth,
      },
      {
        text: '“Five, I asked you, first night. Here’s six: what’ll you do Friday?”',
      },
    ],
  },
  choices: [
    {
      id: 'ill-be-there',
      label: '“I’ll be there.”',
      stakes: 'major',
      effects: [{ op: 'flag.set', key: 'd21:sixth-answer', value: 'ill-be-there' }],
      goto: 'd21-lamp-2',
    },
    {
      id: 'ill-be-gone-by-then',
      label: '“I’ll be gone by then.”',
      stakes: 'major',
      effects: [{ op: 'flag.set', key: 'd21:sixth-answer', value: 'ill-be-gone-by-then' }],
      goto: 'd21-lamp-2',
    },
    {
      id: 'i-dont-know-yet',
      label: '“I don’t know yet.”',
      stakes: 'major',
      effects: [{ op: 'flag.set', key: 'd21:sixth-answer', value: 'i-dont-know-yet' }],
      goto: 'd21-lamp-2',
    },
    {
      id: 'give-her-the-silence',
      label: 'Say nothing, and let her write the silence down.',
      stakes: 'major',
      effects: [{ op: 'flag.set', key: 'd21:sixth-answer', value: 'give-her-the-silence' }],
      goto: 'd21-lamp-2',
    },
  ],
});

const lamp2 = defineScene({
  id: 'd21-lamp-2',
  slot: 'night',
  onEnter: [
    { op: 'flag.set', key: 'conf:barb', value: true },
    // The confession RE-RUNS the counsel seed check (act3-plan §Day 21):
    // the fifth rung landed this morning, so a run that missed the Day-19
    // write can still seed here — and the seed goes LIVE for the Night-22
    // door only through this scene (a distinct flag; nothing else may
    // write barb:counsel-live).
    {
      op: 'when',
      cond: { op: 'derived.gte', key: 'trust:barb', value: 7 },
      then: [{ op: 'flag.set', key: 'barb:counsel-seeded', value: true }],
    },
    {
      op: 'when',
      cond: { op: 'flag', key: 'barb:counsel-seeded' },
      then: [{ op: 'flag.set', key: 'barb:counsel-live', value: true }],
    },
    // Her chords enter — the score gets its harmony. Fragment audio stays
    // off (mixer unauditioned); the prose carries it.
    { op: 'chord.add', value: 1 },
  ],
  prose: {
    kind: 'inline',
    paragraphs: [
      {
        text: '“There,” she says, as if you had handed her something with corners. She uncaps the pen.',
        when: { op: 'flag', key: 'd21:sixth-answer', value: 'ill-be-there' },
      },
      {
        text: '“Then somebody should know that besides you,” she says, and there is no anger anywhere in the room to be found. She uncaps the pen.',
        when: { op: 'flag', key: 'd21:sixth-answer', value: 'ill-be-gone-by-then' },
      },
      {
        text: '“That’s the first of the six you’ve answered the same way twice,” she says, which is not a complaint. She uncaps the pen.',
        when: { op: 'flag', key: 'd21:sixth-answer', value: 'i-dont-know-yet' },
      },
      {
        text: 'The silence sits between you on the counter and she regards it professionally, like a coin she suspects is foreign but good. “All right,” she says. “That’s an answer. I’ve had it before.” She uncaps the pen.',
        when: { op: 'flag', key: 'd21:sixth-answer', value: 'give-her-the-silence' },
      },
      {
        text: 'She writes it in the REMARKS of a line that is not yours — hers, tonight’s, wherever she files the things she is keeping for someone — and then she inks it again, the second pass riding the first without a tremor, so that whatever the night does to paper, this will still say what it says.',
      },
      {
        text: 'And while the ink dries she hums, low, under the lamp — not the tune; the part beneath the tune, the held part, the part a song stands on — and hears herself doing it, and does not stop until it has somewhere to rest.',
      },
      {
        text: 'At 3:12, later, five bars go out over the water, and for the first time they sound like the top half of something.',
        when: hornOn,
      },
      {
        text: 'The hill home is longer than the hill down was, and it collects the difference from you.',
        when: decayedFlesh,
      },
      {
        text: 'Somewhere between the lamp and your door, the word you answer to sits down to rest, and does not catch up.',
        when: decayedName,
      },
      {
        text: 'You go to put tonight where you keep things, and feel the shelf give half an inch under the weight.',
        when: decayedEcho,
      },
    ],
  },
  choices: [
    { id: 'let-the-twenty-seventh-come', label: 'Let the twenty-seventh come.', goto: 'd21-end' },
  ],
});

// ——— Night 21, door two: the book stays under the counter ———

const night = defineScene({
  id: 'd21-night',
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
    // The unpayable-night rule stays armed (state only; the day20 shape).
    { op: 'flag.set', key: 'a3:unpayable-armed', value: true },
  ],
  prose: {
    kind: 'inline',
    paragraphs: [
      // The two-line non-scene: her fragment stays hers. Missable, priced.
      {
        text: 'Passing the Kettle at close, you see her through the glass with the lamp and the book, and the book stays under the counter.',
      },
      {
        text: 'She double-inks something you cannot read from here, and puts the light out over it.',
      },
      {
        text: 'At 3:12 the five bars go out over the water, and the wait after the fifth has learned your window.',
        when: hornOn,
      },
      {
        text: 'The silence does its 3:12 round and leaves the town a little emptier than the town was banking on.',
        when: hornStopped,
      },
      {
        text: 'You climb to bed on borrowed knees and could not name the lender.',
        when: decayedFlesh,
      },
      {
        text: 'You sign the day off in your head on the way to sleep, and the signature comes away smudged.',
        when: decayedName,
      },
      {
        text: 'The morning’s cold, the idling engine, the weight across your knee — one of them has already gone from you, quietly, and you cannot check which, because checking is the thing that’s gone.',
        when: decayedEcho,
      },
    ],
  },
  choices: [
    { id: 'let-the-twenty-seventh-come', label: 'Let the twenty-seventh come.', goto: 'd21-end' },
  ],
});

// ——— The held place: Day 22 is the next phase's to write ———
// Mirrors d20-end exactly as it was: the card owns `time.set day 22`, so
// a future d22-morning sets SLOT ONLY. ACT_BOUNDARY_ENDINGS in both apps
// holds 'd21-end'; unsealing follows the act boundary precedent.

const dayEnd = defineScene({
  id: 'd21-end',
  onEnter: [{ op: 'time.set', day: 22, slot: 'morning' }],
  prose: {
    kind: 'inline',
    paragraphs: [{ text: '' }, { text: 'NOVEMBER 27' }, { text: '' }],
  },
  choices: [],
  cue: 'title',
  ending: 'd21-end',
});

export const DAY21_SCENES: readonly Scene[] = [
  morning,
  depot,
  depot2,
  kettle,
  kettle2,
  guitar,
  guitar2,
  evening,
  confession,
  confession2,
  evening2,
  vigil,
  lamp,
  lamp2,
  night,
  dayEnd,
];
