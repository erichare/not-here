/**
 * DAY 19 — the read-back, and the card (design/act2-beats.md §Day 19,
 * §Night 19).
 *
 * Morning: single quiet slot; the snowline at the orchard fence is the
 * countdown made visible now. Evening: THE REGISTER READ-BACK — Barb reads
 * the run's real record back as conditional paragraphs over Act 1 + Act 2
 * flags (the Night-1 goodbye answer in the player's verbatim words, the
 * quilt or its refusal, the boat-shed trap, the 2 AM answer, the valve,
 * both potluck verdicts and all three Sam choices, the lullaby, the Day-17
 * clinic), including one entry the player will have genuinely forgotten
 * (the Day-2 pots, or the Day-4 walk-in). She reads nothing about the
 * letter; if it burned, there is a smell she does not mention. She closes
 * the book with her palm flat over the NAME column (Act 3 owns what's
 * under her hand). Exiled staging: she walks the book down under her coat
 * and reads by the ticket-office stove — the act's one unbent kindness.
 * trust:barb ≥ 7 seeds the Long Winter ('barb:counsel-seeded').
 *
 * Night 19: the act close, one paragraph per track; then the ACT THREE
 * card. 'act2-end' owns time.set day 20 and terminates the current build
 * (ending 'act2-end'; Act 3 replaces it).
 *
 * Flags this file owns: 'barb:counsel-seeded'. Facts:
 * 'asked-barb-name-column'. The read-back re-inks your line: it sets
 * 'today:named', so on the stopped track the count truly does not tick
 * tonight — which is the beat sheet's line, made mechanical.
 */

import { defineScene, type Cond, type Scene } from '@not-here/engine';
import {
  decayedEcho,
  decayedFlesh,
  decayedName,
  exiledVerdict,
  hornOn,
  hornStopped,
  knowsTruth,
  letterMemoryTaken,
  lullabyTaken,
  NIGHT_DECAY,
} from './act2-shared.ts';

const letterBurned: Cond = { op: 'flag', key: 'letter-burned' };
const notExiled: Cond = { op: 'not', of: exiledVerdict };
/**
 * The Long Winter's door (pt2-fix-01). Arithmetic: trust:barb starts at the
 * 5 baseline and moves ONLY on kindnesses Barb witnessed herself — axes.ts
 * gives +1 each, knowers ['barb'], to helped-barb (d2), helped-barb-walkin
 * (d4), kept-barb-company (d7) and helped-walkin-d9 (d9). 5 + 2 = 7: the
 * seed needs a PATTERN of two or more such acts across the run, never one
 * click; a cold run holds 5 exactly (no gossip edge feeds barb any
 * trust-weighted tag, and every authored 'truth-told' is priya's or
 * sam's). All four rungs land days before this scene, so the derived gate
 * in the evening's onEnter reads them settled — no same-day timing hole.
 */
const barbTrustHigh: Cond = { op: 'derived.gte', key: 'trust:barb', value: 7 };
const askedNameColumn: Cond = { op: 'fact.exists', tag: 'asked-barb-name-column' };

// Night-1 goodbye answer, read back in the player's verbatim words.
const saidNever: Cond = { op: 'flag', key: 'n1:goodbye', value: 'never' };
const saidForgot: Cond = { op: 'flag', key: 'n1:goodbye', value: 'forgot' };
const saidDoor: Cond = { op: 'flag', key: 'n1:goodbye', value: 'door' };

// The quilt: taken (Day-3 room attended, story accepted) or left hers.
const quiltTaken: Cond = {
  op: 'all',
  of: [
    { op: 'flag', key: 'd3:slot', value: 'room' },
    { op: 'not', of: { op: 'flag', key: 'd3:left-quilt' } },
  ],
};
const quiltRefused: Cond = { op: 'flag', key: 'd3:left-quilt' };

// The boat-shed trap, all three verbs.
const trapSprung: Cond = { op: 'flag', key: 'd3:trap', value: 'sprung' };
const trapHeld: Cond = { op: 'flag', key: 'd3:trap', value: 'held' };
const trapAdmitted: Cond = { op: 'flag', key: 'd3:trap', value: 'admitted' };

// The 2 AM answer.
const toldSamDontKnow: Cond = { op: 'fact.exists', tag: 'told-sam-dont-know' };
const gaveSamSilence: Cond = { op: 'flag', key: 'd6:said-nothing' };
const deniedSam: Cond = { op: 'fact.exists', tag: 'private:denied-sams-recording' };

// The potluck: what you did about Sam.
const samDefended: Cond = { op: 'flag', key: 'potluck:sam', value: 'defended' };
const samSilent: Cond = { op: 'flag', key: 'potluck:sam', value: 'silent' };
const samGiven: Cond = { op: 'flag', key: 'potluck:sam', value: 'given' };

// The genuinely-forgotten entry: Day-2 pots first, else the Day-4 walk-in.
const forgotPots: Cond = { op: 'fact.exists', tag: 'helped-barb' };
const forgotWalkIn: Cond = {
  op: 'all',
  of: [
    { op: 'not', of: forgotPots },
    { op: 'fact.exists', tag: 'helped-barb-walkin' },
  ],
};
const anyForgotten: Cond = {
  op: 'any',
  of: [forgotPots, { op: 'fact.exists', tag: 'helped-barb-walkin' }],
};

// Night-1 first plate, all three verbs.
const ateAll: Cond = { op: 'fact.exists', tag: 'ate-first-meal' };
const atePolite: Cond = { op: 'fact.exists', tag: 'picked-at-meal' };
const refusedPlate: Cond = { op: 'fact.exists', tag: 'refused-first-meal' };

const wentClinicD17: Cond = { op: 'flag', key: 'd17:slot', value: 'clinic' };

// ——— Morning: the quiet slot ———

const morning = defineScene({
  id: 'd19-morning',
  slot: 'morning',
  onEnter: [{ op: 'time.set', day: 19, slot: 'morning' }],
  prose: {
    kind: 'inline',
    paragraphs: [
      {
        text: 'The snowline is at the orchard fence this morning. Four days, at the pace it has kept. The Bay looks at it the way a kitchen looks at a clock.',
      },
      {
        text: 'The thermos is on the piling. The gulls know the schedule now and attend.',
        when: exiledVerdict,
      },
      {
        text: 'A quiet day, and the Kettle keeps you inside it: the flat-top, the pie case, the hours off their leash.',
        when: notExiled,
      },
    ],
  },
  choices: [
    {
      id: 'eat-whats-put-down',
      label: 'Eat what’s put in front of you.',
      effects: [{ op: 'flag.set', key: 'today:fed', value: true }],
      goto: 'd19-evening',
    },
    { id: 'let-the-day-spend', label: 'Let the day spend itself.', goto: 'd19-evening' },
  ],
});

// ——— Evening: THE REGISTER READ-BACK ———

const evening = defineScene({
  id: 'd19-evening',
  slot: 'evening',
  onEnter: [
    { op: 'time.set', slot: 'evening' },
    // The re-inking below is the offset: read back into the book is named.
    { op: 'flag.set', key: 'today:named', value: true },
    {
      op: 'when',
      cond: barbTrustHigh,
      then: [{ op: 'flag.set', key: 'barb:counsel-seeded', value: true }],
    },
  ],
  prose: {
    kind: 'inline',
    paragraphs: [
      {
        text: 'After close, chairs up, one lamp — the Kettle gone down to the pilot light of itself. Barb brings the register out and sets it where the plates go.',
        when: notExiled,
      },
      {
        text: 'After close, a knock at the ticket-office door: Barb, down the hill in the dark with the register under her coat, like contraband, like a casserole. She sets it on the stove-side table and takes the good chair without being offered it, which is how you know she means to stay.',
        when: exiledVerdict,
      },
      // pt2-fix-06: the morning fork leaves a trace. today:fed is set only
      // by the morning's first option and nothing else touches it before
      // evening, so it carries the fork without a new flag.
      {
        text: '“You ate today, at least,” she says, setting the book square. “Makes a better entry.”',
        when: { op: 'flag', key: 'today:fed' },
      },
      {
        text: '“Let the day spend itself, did you,” she says, setting the book square. “It’ll show in the entry.”',
        when: { op: 'not', of: { op: 'flag', key: 'today:fed' } },
      },
      { text: '“Right,” she says, and opens it to November. “You’ll hear it in my order, not yours.”' },
      {
        text: '“November six. In off the beach road at dark. Ate the last chop and all its outriders.”',
        when: ateAll,
      },
      {
        text: '“November six. In off the beach road at dark. Ate enough to be mannerly, which is not enough.”',
        when: atePolite,
      },
      {
        text: '“November six. In off the beach road at dark. Sat a full plate out whole.”',
        when: refusedPlate,
      },
      {
        text: '“Same night, asked did she say goodbye to the place before this one. Answer as given—” and she reads it in something near your voice: “‘No. I never do.’”',
        when: saidNever,
      },
      {
        text: '“Same night, asked did she say goodbye to the place before this one. Answer as given—” and she reads it in something near your voice: “‘I don’t remember leaving it.’”',
        when: saidForgot,
      },
      {
        text: '“Same night, asked did she say goodbye to the place before this one. Answer as given—” and she reads it in something near your voice: “‘I said it to the door.’”',
        when: saidDoor,
      },
      {
        text: '“November seven. Dried the pots to the squeak and racked them wrong, and I left them wrong a day for the company of it.”',
        when: forgotPots,
      },
      {
        text: '“November eight. Dianne told the quilt story whole, and gave the end of it away.” A beat. “She can’t say now whose pattern the blue was. That’s in the book too.”',
        when: quiltTaken,
      },
      {
        text: '“November eight. Was offered the end of the quilt story and left it where it was made.” She goes over the line again, slow, and offers no reason.',
        when: quiltRefused,
      },
      {
        text: '“November eight. Corrected the boy on a word she had no honest way to own.”',
        when: trapSprung,
      },
      {
        text: '“November eight. Held a canoe steady and her tongue with it.”',
        when: trapHeld,
      },
      {
        text: '“November eight. Told Sam she didn’t remember — any of it. First true thing that boy had been handed in seven years.”',
        when: trapAdmitted,
      },
      {
        text: '“November nine. Shelved my walk-in for winter and turned every label face-out.”',
        when: forgotWalkIn,
      },
      {
        text: 'One of those you had lost whole — not thinned, gone. The book hadn’t.',
        when: anyForgotten,
      },
      {
        text: '“November eleven, two in the morning. The boy asked his question. Answer: ‘I don’t know.’ Kept by both parties.”',
        when: toldSamDontKnow,
      },
      {
        text: '“November eleven, two in the morning. The boy asked his question. Answer: none. He counted it anyway.”',
        when: gaveSamSilence,
      },
      {
        text: '“November eleven, two in the morning. The boy asked his question. Answer: told him his own recording lied.”',
        when: deniedSam,
      },
      {
        text: '“November twelve. Down the wharf at the horn’s hour. Told the man: keep playing.”',
        when: hornOn,
      },
      {
        text: '“November twelve. Down the wharf at the horn’s hour. Shut the valve with her own hand.” She reads it exactly level, which takes doing.',
        when: hornStopped,
      },
      {
        text: '“November eighteen. The hall. When the boy stood up, the room moved her way. Chairs and all.”',
        when: { op: 'flag', key: 'potluck:verdict', value: 'defended' },
      },
      {
        text: '“November eighteen. The hall. The room made up its mind without one word said in it. Bed at the ticket office by ten — Wade had the stove going before the urns were cold.”',
        when: exiledVerdict,
      },
      {
        text: '“Spoke for the boy, inside all that. It cost the room’s comfort, and bought the only thing on offer that night worth having.”',
        when: samDefended,
      },
      {
        text: '“Kept her seat while the room handled him.” The next line is in her hand too, and she reads it because it is there: “Watched it all.”',
        when: samSilent,
      },
      {
        text: '“Told the boy to sit down. In the old cadence.” Barb stops there, and squares the book on the table, and reads on in a voice with the shine taken off it.',
        when: samGiven,
      },
      {
        text: '“November twenty. Dianne hummed the old one over the washing-up and gave the end of it away.” A beat. “Takes her coffee quieter since. That’s in here too.”',
        when: lullabyTaken,
      },
      {
        text: '“November twenty. Was offered the end of a tune and let the owner finish it.” She goes over it a second time anyway, though the ink is dark enough.',
        when: { op: 'not', of: lullabyTaken },
      },
      {
        text: 'She looks up once, here. “Dianne always said you hummed the end different. I wouldn’t know the end from the weather — but I know what always sounds like.” She goes back to the page.',
      },
      {
        text: '“November twenty-two. Clinic. The doctor said a line out loud she’d carried seven years, and walked lighter after.” The page waits under her finger. “Lighter isn’t always the kind direction.”',
        when: { op: 'all', of: [wentClinicD17, letterMemoryTaken] },
      },
      {
        text: '“November twenty-two. Clinic. Sat with the doctor and asked nothing of what was hers.”',
        when: { op: 'all', of: [wentClinicD17, { op: 'not', of: letterMemoryTaken }] },
      },
      {
        text: 'She reads nothing about last night. There is a smell in the room — stove-metal, paper gone to heat — that has ridden your sleeves since; she does not mention it, the way she has never once mentioned weather she couldn’t fix.',
        when: letterBurned,
      },
      {
        text: 'You listen knowing what the book does not say, and not one line of it bends under the weight. It never claimed more than it knew. That is why it holds.',
        when: knowsTruth,
      },
      {
        text: 'One line has gone thin since she wrote it. She goes over it now, no comment, the nib pressing your yesterday back into the paper, and the ink holds you another night.',
      },
      {
        text: 'When it’s done she closes the book with her palm flat over the NAME column, the way you’d hold a page down in wind.',
      },
      {
        text: '“Winters end, you know,” she says then, to the book more than to you. “Best ones end on purpose.” She lets it lie where she set it.',
        when: barbTrustHigh,
      },
    ],
  },
  choices: [
    {
      id: 'ask-name-column',
      label: '“What’s under your hand?”',
      effects: [{ op: 'fact.add', tag: 'asked-barb-name-column', witnessedBy: ['barb'] }],
      goto: 'd19-night',
    },
    { id: 'let-the-book-close', label: 'Let the book close on the month.', goto: 'd19-night' },
  ],
});

// ——— Night 19: the act close ———

const night = defineScene({
  id: 'd19-night',
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
        text: '“Not yet” was all the answer the question got. It was not a no. It had a season in it.',
        when: askedNameColumn,
      },
      {
        text: 'At 3:12, five bars and the stop. The held sixth is the held sixth, patient as ever, going out over water that has heard it two thousand nights and kept every one.',
        when: {
          op: 'all',
          of: [hornOn, { op: 'not', of: { op: 'stat.gte', stat: 'undertow', value: 6 } }],
        },
      },
      {
        text: 'At 3:12, five bars and the stop — and inside the held sixth, for one breath, a pressure. Not a note: the room a note stands in, arrived early, checking the space. You lie still and it passes, and the silence closes up behind it like water. It will be back. It is yours.',
        when: { op: 'all', of: [hornOn, { op: 'stat.gte', stat: 'undertow', value: 6 }] },
      },
      {
        text: 'The silence has finished eating and sits back. Nothing ticks tonight. A full thing resting is worse than an empty one working; you learn that at 3:12 exactly, on the hour nothing strikes.',
        when: hornStopped,
      },
      {
        text: 'You lie down and the bed takes a moment to agree that you have.',
        when: decayedFlesh,
      },
      {
        text: 'Your line in the book is freshly inked, and even so, in the dark, you could not swear to the letters.',
        when: decayedName,
      },
      {
        text: 'The last memory before sleep comes with its sound turned off.',
        when: decayedEcho,
      },
    ],
  },
  choices: [{ id: 'sleep-toward-it', label: 'Sleep, if it takes you.', goto: 'act2-end' }],
});

// ——— ACT THREE title card — the current build terminates here ———

const actEnd = defineScene({
  id: 'act2-end',
  onEnter: [{ op: 'time.set', day: 20, slot: 'morning' }],
  prose: {
    kind: 'inline',
    paragraphs: [{ text: '' }, { text: 'ACT THREE' }, { text: '' }],
  },
  choices: [],
  cue: 'title',
  ending: 'act2-end',
});

export const DAY19_SCENES: readonly Scene[] = [morning, evening, night, actEnd];
