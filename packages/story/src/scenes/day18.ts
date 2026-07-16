/**
 * DAY 18 — the Return Pass / the lighter fog (design/act2-beats.md §Day 18).
 *
 * knows-truth (letter or early-truth): the act's quietest day is a
 * re-reading. Four scenes tagged `recontext: true` — the gravel beach, the
 * Kettle, the General's corkboard, the wharf — each re-rendering EXACTLY one
 * line with its post-reveal reading, never explained (twist-recontext-table
 * §Post-reveal Return Pass; act2-lint requires all four).
 *
 * letter-burned: the lighter-fog day. One beat at the stove tin if the
 * player walks up to Dianne's — the lid doesn't sit flush anymore. Nothing
 * else changes, which is the horror of it. The never-found route gets the
 * same plain day with ONE countdown pulse of its own (pt2-fix-03) — a beat
 * that pays nothing forward but keeps the act's last days taut.
 *
 * Evening (all routes): Dianne at the store wrapping the hall's dishes to
 * go back. The knowing route watches one unbroken domestic minute and
 * understands; NO confrontation is offered — Act 3's cascade owns
 * confession. Night 18: decay per track.
 *
 * Flags this file owns: 'd18:kettle-day'. Facts: 'helped-dianne-parcels'.
 * Reads (Contract): 'knows-truth', 'letter-burned', 'dianne:locks-house',
 * 'potluck:verdict', the today:* offsets, the decay:* tells.
 */

import { defineScene, type Cond, type Scene } from '@not-here/engine';
import {
  decayedEcho,
  decayedFlesh,
  decayedName,
  defendedVerdict,
  exiledVerdict,
  hornOn,
  hornStopped,
  knowsTruth,
  locksHouse,
  NIGHT_DECAY,
} from './act2-shared.ts';

const letterBurned: Cond = { op: 'flag', key: 'letter-burned' };

// ——— Morning: the day routes on what the till drawer gave up ———

const morning = defineScene({
  id: 'd18-morning',
  slot: 'morning',
  onEnter: [{ op: 'time.set', day: 18, slot: 'morning' }],
  prose: {
    kind: 'inline',
    paragraphs: [
      {
        text: 'Day eighteen comes up with the snowline into the low orchards and the fog gone thin over the shallows — the lake trying winter on for size.',
      },
      {
        text: 'The thermos is on the piling before first light, lid tight, no note. You drink it facing the water, like a person keeping a shift.',
        when: exiledVerdict,
      },
      {
        text: 'The Kettle finds reasons to feed you before you’ve asked — the town still overcorrecting, a warmth with arithmetic in it.',
        when: defendedVerdict,
      },
    ],
  },
  choices: [
    {
      id: 'take-the-day',
      label: 'Take the day walking.',
      effects: [{ op: 'when', cond: knowsTruth, then: [{ op: 'goto', scene: 'd18-beach' }] }],
      goto: 'd18-fog',
    },
  ],
});

// ——— The Return Pass: four scenes, one re-read line each, never explained ———

const beach = defineScene({
  id: 'd18-beach',
  slot: 'morning',
  recontext: true,
  prose: {
    kind: 'inline',
    paragraphs: [
      {
        text: 'The gravel beach below the breakwater light, at a walking hour for once. Stones dark where they face the water, grey where they don’t. A heron owns the shallows and files no report.',
      },
      {
        text: 'You stood up off these stones, that first night, with no cold in you. Now you know why. The lake never had you. Nothing did.',
      },
    ],
  },
  choices: [{ id: 'up-the-shore', label: 'Up the shore road.', goto: 'd18-kettle' }],
  cue: 'shingle',
});

const kettle = defineScene({
  id: 'd18-kettle',
  slot: 'morning',
  recontext: true,
  onEnter: [{ op: 'flag.set', key: 'today:fed', value: true }],
  prose: {
    kind: 'inline',
    paragraphs: [
      {
        text: 'The Kettle mid-morning: the crib board idle, the pie case deciding. Barb puts a plate down in front of you that you didn’t order, because ordering was never the mechanism.',
      },
      {
        text: 'Under the counter the register sleeps with the month in it. The double ink was never bookkeeping. It is the only reason the paper still says you happened yesterday.',
      },
    ],
  },
  choices: [{ id: 'across-to-the-general', label: 'Across to the General.', goto: 'd18-corkboard' }],
});

const corkboard = defineScene({
  id: 'd18-corkboard',
  slot: 'morning',
  recontext: true,
  prose: {
    kind: 'inline',
    paragraphs: [
      {
        text: 'The General between customers. Dianne is at the scale with somebody’s apples. The corkboard holds its usual weather: firewood, a lost glove, boat-wash hours gone out of season, the bus card.',
      },
      {
        text: 'The ring around the last Friday, blue, pressed through — it was never clutter, never a date that mattered to someone else. It is a countdown, and you can finally read it. Five days.',
      },
    ],
  },
  choices: [{ id: 'down-to-the-wharf', label: 'Down to the wharf.', goto: 'd18-wharf' }],
});

const wharf = defineScene({
  id: 'd18-wharf',
  slot: 'morning',
  recontext: true,
  prose: {
    kind: 'inline',
    paragraphs: [
      {
        text: 'The old wharf takes your boots the way it takes weather. The breakwater light turns, pale in daylight, working anyway.',
      },
      {
        text: 'Wade is at the compressor shed with his back to the road, feeding the machine its afternoon. Seven years of nights he has called the same five bars over the water — and you know now what came up the beach to answer, because it is standing on his wharf, watching his back.',
        when: hornOn,
      },
      {
        text: 'The shed is padlocked and the man is up a ladder at the light, back to the road. He locked it the night you shut it. He has known longer than anyone what he had been feeding.',
        when: hornStopped,
      },
    ],
  },
  choices: [
    { id: 'let-the-light-have-it', label: 'Let the light have the afternoon.', goto: 'd18-evening' },
  ],
});

// ——— The lighter fog: the burned route, and the never-found route ———

const fogDay = defineScene({
  id: 'd18-fog',
  slot: 'morning',
  prose: {
    kind: 'inline',
    paragraphs: [
      {
        text: 'The day is a plain one, which the Bay does well: wood smoke, gulls arguing over the packinghouse roof, the fog gone thin over the shallows.',
      },
      {
        text: 'The fog is lighter this morning. You tell yourself that means something. You get most of the way to believing it, which is a distance you are getting good at.',
        when: letterBurned,
      },
      // pt2-fix-03: the never-found route's one countdown pulse. It pays
      // nothing forward; it only keeps the last days of the act taut.
      {
        text: 'At the General, mid-morning, Dianne weighs a parcel and stops — hand flat on the till drawer, not opening it, resting, the way you’d rest a hand on a gate you were deciding about. On the corkboard the bus card’s tape has been pressed down again. Fresh thumb-shine on old yellow.',
        when: {
          op: 'all',
          of: [{ op: 'not', of: knowsTruth }, { op: 'not', of: letterBurned }],
        },
      },
    ],
  },
  choices: [
    { id: 'up-to-the-house', label: 'Walk up to Dianne’s with the morning.', goto: 'd18-house' },
    {
      id: 'keep-the-stove-side',
      label: 'Keep the stove side of the day at the Kettle.',
      effects: [
        { op: 'flag.set', key: 'd18:kettle-day', value: true },
        { op: 'flag.set', key: 'today:fed', value: true },
      ],
      goto: 'd18-stove',
    },
  ],
});

// pt2-fix-04: the stove side of the day gets its minute on screen — the
// other branch has a whole house; this one had a bare goto. Flags stay on
// the choice above exactly as authored (d18:kettle-day is Act 3's).
const stoveDay = defineScene({
  id: 'd18-stove',
  slot: 'morning',
  prose: {
    kind: 'inline',
    paragraphs: [
      {
        text: 'You keep the stove side of the day: the flat-top’s weather, the pie case’s slow arithmetic, coffee arriving on its own schedule. The Kettle works around you the way water works around a piling, which is one of the ways this town says stay.',
      },
      {
        text: 'In the slack after lunch Barb brings the register up, goes over one line — yesterday’s, not today’s — until the nib bites, and squares the book away without a word spent on it.',
      },
    ],
  },
  choices: [
    { id: 'let-the-evening-find-you', label: 'Let the evening find you there.', goto: 'd18-evening' },
  ],
});

const house = defineScene({
  id: 'd18-house',
  slot: 'morning',
  onEnter: [{ op: 'flag.set', key: 'today:fed', value: true }],
  prose: {
    kind: 'inline',
    paragraphs: [
      {
        text: 'You knock now, at this door. It is just what the door is, these days. Dianne’s voice carries you in.',
        when: locksHouse,
      },
      // pt2-fix-05: the default line narrates the meal landing; the
      // refused-first-meal variant grants the refusal its history — Barb
      // witnessed the Night-1 plate, and the barb↔dianne edge carries it.
      {
        text: 'The house holds its morning: the stove going, bread under a towel, the radio talking to itself about the roads. She feeds you at the table without a menu of it — soup, the end of the loaf, “eat that or it travels.”',
        when: { op: 'not', of: { op: 'fact.exists', tag: 'refused-first-meal' } },
      },
      {
        text: 'The house holds its morning: the stove going, bread under a towel, the radio talking to itself about the roads. Soup lands at your place, and the end of the loaf. “Eat that or it travels.” She doesn’t stay to referee the plate — a courtesy from a kitchen that has heard about the first one.',
        when: { op: 'fact.exists', tag: 'refused-first-meal' },
      },
      {
        text: 'On the shelf above the stove the tobacco tin sits where it has sat seven years. The lid doesn’t sit flush anymore. Nothing else in the kitchen has changed, which is the size of it.',
        when: letterBurned,
      },
    ],
  },
  choices: [
    { id: 'walk-the-parcels-down', label: 'Walk her parcels down when she goes.', goto: 'd18-evening' },
  ],
});

// ——— Evening: the return parcels (all routes converge) ———

const evening = defineScene({
  id: 'd18-evening',
  slot: 'evening',
  onEnter: [{ op: 'time.set', slot: 'evening' }],
  prose: {
    kind: 'inline',
    paragraphs: [
      {
        text: 'Evening at the General, after the sign turns: the hall’s dishes going home. Brown paper, string, each lid matched to its pot, each name-tape read and honoured.',
      },
      {
        text: 'The side door is on the latch after close now. You knock; the latch gives from inside, and she’s back at the counter by the time you’re in.',
        when: locksHouse,
      },
      { text: '@line:dianne:evening-d18' },
      {
        text: 'You hold string; she cuts. Scissors, fold, tape, turn. The parcels square up one after another, each with a house to go to, each getting her hand flat on it once before it joins the crate — a habit that isn’t about parcels.',
      },
      {
        text: 'For one unbroken minute the store is just this: a woman taping a parcel shut, tongue-tip of concentration, string wound off the elbow the way her mother would have wound it. You watch the whole minute and understand every day of the last three weeks — the airing, the albums, the locking, the tin. You could end her winter with one word. You hold the string. She cuts.',
        when: knowsTruth,
      },
      {
        text: 'She sends you off with the last of the counter tea. The crate waits by the door for the pickup, addressed and certain of itself.',
      },
    ],
  },
  choices: [
    {
      id: 'say-goodnight',
      label: 'Say goodnight to the store.',
      effects: [{ op: 'fact.add', tag: 'helped-dianne-parcels', witnessedBy: ['dianne'] }],
      goto: 'd18-night',
    },
  ],
  cue: 'dianne-theme',
});

// ——— Night 18 ———

const night = defineScene({
  id: 'd18-night',
  slot: 'night',
  onEnter: [
    { op: 'time.set', slot: 'night' },
    ...NIGHT_DECAY,
    {
      op: 'when',
      cond: hornOn,
      then: [{ op: 'emit', event: { kind: 'music.cue', cue: 'foghorn-312' } }],
      else: [{ op: 'emit', event: { kind: 'music.stop' } }],
    },
  ],
  prose: {
    kind: 'inline',
    paragraphs: [
      {
        text: 'At 3:12 the horn plays for a town that sleeps through it, and something in you eats without being asked, and will be fuller in the morning than the night deserved.',
        when: hornOn,
      },
      {
        text: 'You know what it is calling now, and that it cannot stop, and that neither of you can.',
        when: { op: 'all', of: [hornOn, knowsTruth] },
      },
      {
        text: 'The silence does its rounds. You know the hour it passes your door without needing to wake for it, and you wake for it.',
        when: hornStopped,
      },
      {
        text: 'The blankets lie the same as ever. It is what’s under them that has less to say for itself tonight.',
        when: decayedFlesh,
      },
      {
        text: 'You picture tomorrow’s coffee: the mug, the pour. In the picture, this time, Barb sets it down a stool to the left of you.',
        when: decayedName,
      },
      {
        text: 'Someone’s winter — a kitchen, a frozen bank-to-bank year — comes when called but arrives short one room.',
        when: decayedEcho,
      },
    ],
  },
  choices: [{ id: 'let-morning-come', label: 'Let the morning come.', goto: 'd19-morning' }],
});

export const DAY18_SCENES: readonly Scene[] = [
  morning,
  beach,
  kettle,
  corkboard,
  wharf,
  fogDay,
  stoveDay,
  house,
  evening,
  night,
];
