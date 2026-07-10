/**
 * DAY 16 — the name, the log, the question (design/act2-beats.md §Day 16).
 *
 * Morning (fixed): if 'lullaby-taken' — Dianne, over the first coffee, easy
 * as weather: "Morning, Wren." Her first and only use, pre-endings; the
 * paragraph carries the lullaby-taken gate (act2-lint pins this). It lands
 * like a door latching in another room. She no longer hums it — the scene
 * notices once, five words.
 *
 * Day hub (two-way):
 *  A. Tam — if 'defended-sam' is known to him: the depot bench, the mileage
 *     log unfolded unprompted (@doc: `one passenger, cash, no name — 04:10`),
 *     "I keep my columns.", and 'today:remembered' (the log IS a shared
 *     memory of her). If 'sacrificed-sam': the hub redirects to the
 *     corkboard — BC Transit service-adjustment @doc, Tam gone until Act 3;
 *     the evening carries the Moose beat ("The last run isn't coming.").
 *     Otherwise: the bench, civil, and the coat pocket that stays shut.
 *  B. Sam — gated (UNDERTOW ≥ 5 AND 'told-sam-dont-know'): the breakwater,
 *     low tide, the guarded friendship verbatim from the bible; he asks the
 *     travel name; flag 'd16:sam-named' (the Stranger seed). Without the
 *     gate: the shed, colder — he logs your visit while you stand there.
 *
 * Evening: without-you retelling for the missed slot (spike-fomo rules;
 * motif detuned, prose twin in the SAME scene — 'a shade flat' for Tam,
 * 'a quarter-tone flat' for Sam). Night 16: NIGHT_DECAY; cue branches on
 * the track; exits to 'd17-morning'.
 *
 * Flags owned here: 'd16:slot', 'd16:sam-named'. Act-owned state touched:
 * 'today:remembered', 'today:fed'. Facts read: 'defended-sam',
 * 'sacrificed-sam', 'told-sam-dont-know'.
 * Prose invariants per design/game-bible.md §Prose grammar.
 */

import { defineScene, type Cond, type Scene } from '@not-here/engine';
import {
  NIGHT_DECAY,
  decayedEcho,
  decayedFlesh,
  decayedName,
  defendedVerdict,
  detune,
  exiledVerdict,
  hornOn,
  hornStopped,
  knowsTruth,
  lullabyTaken,
} from './act2-shared.ts';

const sacrificedSam: Cond = { op: 'fact.exists', tag: 'sacrificed-sam' };
const tamHasTheProof: Cond = { op: 'fact.knownBy', who: 'tam', tag: 'defended-sam' };
const samGate: Cond = {
  op: 'all',
  of: [
    { op: 'stat.gte', stat: 'undertow', value: 5 },
    { op: 'fact.exists', tag: 'told-sam-dont-know' },
  ],
};
const wentToTam: Cond = { op: 'flag', key: 'd16:slot', value: 'tam' };
const wentToSam: Cond = { op: 'flag', key: 'd16:slot', value: 'sam' };
const missedTam: Cond = { op: 'not', of: wentToTam };
const missedSam: Cond = { op: 'not', of: wentToSam };

const morning = defineScene({
  id: 'd16-morning',
  slot: 'morning',
  onEnter: [{ op: 'time.set', day: 16, slot: 'morning' }],
  prose: {
    kind: 'inline',
    paragraphs: [
      {
        text: 'First coffee at the Kettle, early enough that the chairs are still dreaming on the tables. Dianne is in with the bread order; she pours herself a cup from Barb’s pot like family and settles onto the stool beside yours with the whole counter empty.',
        when: defendedVerdict,
      },
      {
        text: 'First light, and boots on the boards you know by weight now: Dianne, down the hill herself, with the thermos this time and two enamel cups. She pours on the piling head, breath and steam indistinguishable, and sets yours on the wood between you.',
        when: exiledVerdict,
      },
      {
        text: '“Morning, Wren,” she says, easy as weather, passing the milk. One word too late to take back. It does not feel like winning. It feels like a door latching in another room of a house you are both standing in.',
        when: lullabyTaken,
      },
      {
        text: 'She doesn’t hum it anymore.',
        when: lullabyTaken,
      },
      {
        text: 'You know whose name it is, and where its owner is, and that this morning, in this town, it answers to you.',
        when: { op: 'all', of: [knowsTruth, lullabyTaken] },
      },
      {
        text: 'Up at the pull-in, the regional bus sits over its layover, engine ticking as it cools. Down the shore, past the launch, the boat shed has its light on against the fog.',
        when: { op: 'not', of: sacrificedSam },
      },
      {
        text: 'The pull-in stands empty at ten past the hour, and goes on standing empty, and the street doesn’t look at it. Down the shore, the boat shed has its light on against the fog.',
        when: sacrificedSam,
      },
    ],
  },
  choices: [
    {
      id: 'find-tam',
      label: 'Go up the hill, toward the pull-in.',
      effects: [
        { op: 'flag.set', key: 'd16:slot', value: 'tam' },
        {
          op: 'when',
          cond: sacrificedSam,
          then: [{ op: 'goto', scene: 'd16-corkboard' }],
        },
      ],
      goto: 'd16-depot',
    },
    {
      id: 'find-sam',
      label: 'Go down the shore to Sam.',
      effects: [
        { op: 'flag.set', key: 'd16:slot', value: 'sam' },
        {
          op: 'when',
          cond: samGate,
          then: [{ op: 'goto', scene: 'd16-breakwater' }],
        },
      ],
      goto: 'd16-shed',
    },
  ],
});

// ——— A. Tam: the log (defended-sam), or the pocket that stays shut. ———

const depot = defineScene({
  id: 'd16-depot',
  slot: 'afternoon',
  onEnter: [
    { op: 'time.set', slot: 'afternoon' },
    {
      op: 'when',
      cond: tamHasTheProof,
      then: [{ op: 'flag.set', key: 'today:remembered', value: true }],
    },
  ],
  prose: {
    kind: 'inline',
    paragraphs: [
      {
        text: 'Tam has the depot bench and a thermos cup and the particular stillness of a man mid-layover. He makes room by existing slightly to the left.',
      },
      {
        text: 'Between the bench and the water, the front street practises not watching you the whole length of itself.',
        when: exiledVerdict,
      },
      {
        text: 'He doesn’t greet you. He reaches inside his coat and unfolds a logbook gone soft at the corners, opens it against the wind to a page he has clearly found before, and holds it where you can read. Seven Novembers back. A ruled line in the middle of the month.',
        when: tamHasTheProof,
      },
      {
        text: '@doc:\n┌──────────────────────────────────────────┐\n│  DAILY LOG — T. OSEI            NOVEMBER  │\n│                                           │\n│  17   penticton rtn             112 km    │\n│  18   penticton rtn             112 km    │\n│  18   one passenger, cash,                │\n│       no name — 04:10                     │\n│  19   penticton rtn             112 km    │\n└──────────────────────────────────────────┘',
        when: tamHasTheProof,
      },
      {
        text: '“I keep my columns,” Tam says. He folds the book away and drinks his coffee, and the two of you watch the fog take the far shore in the company of the only piece of paper in the Bay that was ever allowed to disagree with the lake.',
        when: tamHasTheProof,
      },
      {
        text: 'The talk is bus talk, which is to say the fog, which is to say nothing. Once, his hand moves toward the inside pocket of his coat and comes back with a tire gauge that needed no checking. Whatever lives in that pocket stays there.',
        when: { op: 'not', of: tamHasTheProof },
      },
    ],
  },
  choices: [
    { id: 'sit-the-layover', label: 'Sit the layover out with him.', goto: 'd16-evening' },
  ],
  cue: 'tam-theme',
});

const corkboard = defineScene({
  id: 'd16-corkboard',
  slot: 'afternoon',
  onEnter: [{ op: 'time.set', slot: 'afternoon' }],
  prose: {
    kind: 'inline',
    paragraphs: [
      {
        text: 'The pull-in is empty and stays that way. The answer is at the General, on the corkboard, on letterhead, under a pin that has pinned livelier things.',
      },
      {
        text: '@doc:\n┌──────────────────────────────────────────┐\n│  BC TRANSIT — SERVICE NOTICE              │\n│                                           │\n│  ROUTE 40   PENTICTON – LORN BAY          │\n│  Effective immediately: route service     │\n│  adjustment. Weekday runs suspended       │\n│  to month-end.                            │\n│                                           │\n│  We regret any inconvenience.             │\n└──────────────────────────────────────────┘',
      },
      {
        text: 'Nobody at the counter mentions it. It gets read around, the way the banner got read around. By afternoon the mail tubs that would have gone to town have been moved somewhere less visible.',
      },
    ],
  },
  choices: [
    { id: 'walk-it-off', label: 'Walk the long way back.', goto: 'd16-evening' },
  ],
});

// ——— B. Sam: the breakwater (gated), or the shed and the visit log. ———

const breakwater = defineScene({
  id: 'd16-breakwater',
  slot: 'afternoon',
  onEnter: [{ op: 'time.set', slot: 'afternoon' }],
  prose: {
    kind: 'inline',
    paragraphs: [
      {
        text: 'Low tide has pulled the lake back off the breakwater’s knees. Sam is out at the elbow of it with his hood down, for once, doing nothing, which from Sam is an event. He watches you pick your way out to him and doesn’t film it.',
      },
      {
        text: '“You’re not her.” He says it to the waterline, conversational — a fact the two of you keep in common now. “Fine. Then who are you? Because I could use somebody who isn’t pretending.”',
      },
      {
        text: 'The question stands there with its hands in its pockets. Behind it, seven years of being the only one in town who wouldn’t say the comfortable thing.',
      },
      {
        text: '“If you ever went,” he says. “Left, I mean. On a bus, whatever. What name would you travel under?” He isn’t reaching for the phone. Both hands stay in the cold, in sight, empty.',
      },
    ],
  },
  choices: [
    {
      id: 'give-the-name',
      label: 'Give him the name you’d travel under.',
      stakes: 'major',
      effects: [{ op: 'flag.set', key: 'd16:sam-named', value: true }],
      goto: 'd16-breakwater-2',
    },
    {
      id: 'keep-it',
      label: '“Not yet.”',
      goto: 'd16-breakwater-2',
    },
  ],
  cue: 'sam-theme',
});

const breakwater2 = defineScene({
  id: 'd16-breakwater-2',
  slot: 'afternoon',
  prose: {
    kind: 'inline',
    paragraphs: [
      {
        text: 'You say it, out loud, over open water, and it holds. Sam nods once and writes nothing down — no phone, no notebook, nothing. From Sam, that is sacrament. “Okay,” he says, and the name goes wherever he keeps the things he doesn’t need proof of.',
        when: { op: 'flag', key: 'd16:sam-named' },
      },
      {
        text: '“Not yet,” you say, and he takes that too, without a flinch, like a man used to instalments. “When you know it,” he says, “I’ll be the one who doesn’t write it down.”',
        when: { op: 'not', of: { op: 'flag', key: 'd16:sam-named' } },
      },
      {
        text: 'The tide turns under the two of you, in no hurry. For an hour the Bay is just a place where water meets rock, and you are just somebody standing on the rock, and that is his gift, and he doesn’t know he gave it.',
      },
    ],
  },
  choices: [
    { id: 'back-along-the-tide', label: 'Walk back along the tide line.', goto: 'd16-evening' },
  ],
});

const shed = defineScene({
  id: 'd16-shed',
  slot: 'afternoon',
  onEnter: [{ op: 'time.set', slot: 'afternoon' }],
  prose: {
    kind: 'inline',
    paragraphs: [
      {
        text: 'The boat shed light is on. Inside, the wall has grown since the hall: new printouts, a second map, the string gone taut between pins. Sam looks up when your shadow crosses the door, and back down, and writes.',
      },
      {
        text: 'He doesn’t ask why you came. He notes it. You can read the top line of the visit log from where you stand — today’s date, the time to the minute, and a blank where a purpose would go, waiting for you to have one.',
      },
      {
        text: '“Shut the door going out,” he says, mid-line. “The damp gets the ink.”',
      },
    ],
  },
  choices: [
    { id: 'leave-him-to-it', label: 'Leave him to the wall.', goto: 'd16-evening' },
  ],
  cue: 'sam-theme',
});

// ——— Evening: retellings for the missed slot; the Moose beat. ———

const evening = defineScene({
  id: 'd16-evening',
  slot: 'evening',
  onEnter: [
    { op: 'time.set', slot: 'evening' },
    {
      op: 'when',
      cond: defendedVerdict,
      then: [{ op: 'emit', event: { kind: 'music.cue', cue: 'pub-warm' } }],
    },
    { op: 'when', cond: missedTam, then: [detune('tam')] },
    { op: 'when', cond: missedSam, then: [detune('sam')] },
  ],
  prose: {
    kind: 'inline',
    paragraphs: [
      {
        text: 'The Kettle does its evening. The overcorrection has begun to relax into plain custom: your coffee arrives without ceremony now, which is how a decision becomes furniture.',
        when: defendedVerdict,
      },
      {
        text: 'You take the end of the day where you take it now. The lights up the hill do their hours. Somebody has left two split logs and kindling inside the ticket-office door, dry, with no word attached.',
        when: exiledVerdict,
      },
      {
        text: 'You come up for supper all the same, boots loud on a street that has decided not to hear them. The Kettle takes you in the way it takes the weather.',
        when: exiledVerdict,
      },
      // ——— Without-you: Sam, out at the elbow, not filming (spike-fomo).
      {
        text: '“Sam was out the breakwater at low tide,” Barb says, with the pot for punctuation. “Out at the elbow, hood down, hours. Not filming anything. Just standing.” A pause with a refill in it. “First time anybody’s seen the phone stay in his pocket since the hall.”',
        when: missedSam,
      },
      {
        text: 'Under the evening, twice, a whistled phrase surfaces — the fifth bar, sped up, a boy’s tempo kept into eighteen — a quarter-tone flat. It doesn’t come a third time.',
        when: missedSam,
      },
      // ——— Without-you: Tam and the logbook he sat with (spike-fomo).
      {
        text: '“Tam sat his whole layover on the depot bench today,” Barb says, refilling without being asked. “Logbook out on his knee the length of it. Folded it away when the Henderson boy came for the mail.” She lets that be all of it, which from Barb is underlining.',
        when: { op: 'all', of: [missedTam, { op: 'not', of: sacrificedSam }] },
      },
      {
        text: '“Notice went up at the General,” Barb says, and doesn’t dress it. “Run’s suspended to month-end. First time in nine years.” She wipes the counter she already wiped. “No Tam till December, then.” The room takes it the way rooms here take news: by getting on with its coffee at a slightly different volume.',
        when: { op: 'all', of: [missedTam, sacrificedSam] },
      },
      {
        text: 'Later, under the room, a road rhythm idles up through the floorboards — no notes in it, just engine and rest — a shade flat, once, twice, done.',
        when: missedTam,
      },
      // ——— The Moose beat (sacrificed-sam routes, every evening it costs).
      {
        text: 'At the hour the run used to come down the hill, Moose gets up, goes to the diner door, and takes his post — chin high, facing the pull-in, doing his one job. The headlights don’t come. He waits the usual four minutes, and then he waits longer, because nobody has told him. The last run isn’t coming.',
        when: sacrificedSam,
      },
      {
        text: 'Supper happens to you either way; Barb has decided the kitchen is open as long as you’re in sight of it.',
      },
    ],
  },
  choices: [
    {
      id: 'eat-what-barbs-made',
      label: 'Eat what Barb’s made. All of it.',
      effects: [{ op: 'flag.set', key: 'today:fed', value: true }],
      goto: 'd16-night',
    },
    {
      id: 'go-down-early',
      label: 'Skip supper. Take the dark early.',
      effects: [{ op: 'stat.add', stat: 'undertow', value: 1 }],
      goto: 'd16-night',
    },
  ],
});

// ——— Night 16: the canonical decay block; exits into Day 17's cluster. ———

const night = defineScene({
  id: 'd16-night',
  slot: 'night',
  onEnter: [
    { op: 'time.set', slot: 'night' },
    {
      op: 'when',
      cond: hornOn,
      then: [{ op: 'emit', event: { kind: 'music.cue', cue: 'foghorn-312' } }],
    },
    {
      op: 'when',
      cond: hornStopped,
      then: [{ op: 'emit', event: { kind: 'music.stop' } }],
    },
    ...NIGHT_DECAY,
  ],
  prose: {
    kind: 'inline',
    paragraphs: [
      {
        text: 'Five bars at 3:12, the stop. You mouth the fifth bar and are asleep before the silence finishes.',
        when: hornOn,
      },
      {
        text: 'The count does not need you awake. You sleep anyway, inside a town with nothing under it, and the nothing holds.',
        when: hornStopped,
      },
      {
        text: 'Somewhere up the hill a kitchen is quiet at the hour it never used to be.',
        when: lullabyTaken,
      },
      {
        text: 'The springs under the mattress hold their breath all night. Nothing you do persuades them of your weight.',
        when: decayedFlesh,
      },
      {
        text: 'By the door, your tab slip has faded to pressure marks, the paper keeping only the shape of the words.',
        when: decayedName,
      },
      {
        text: 'You reach for a morning from the first week to carry you down, and come down instead on the step that isn’t there.',
        when: decayedEcho,
      },
    ],
  },
  choices: [
    { id: 'let-the-seventeenth-come', label: 'Let the seventeenth come.', goto: 'd17-morning' },
  ],
});

export const DAY16_SCENES: readonly Scene[] = [
  morning,
  depot,
  corkboard,
  breakwater,
  breakwater2,
  shed,
  evening,
  night,
];
