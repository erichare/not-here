/**
 * DAY 17 — the trail ends at the till drawer (design/act2-beats.md §Day 17,
 * §Night 17).
 *
 * Two-way morning hub. A: the clinic — Priya and the envelope she has
 * carried seven years; she reads ONE line aloud from memory, and the second
 * harvest offer follows (take → ECHO +2, the paired private facts about
 * priya, flag 'letter-memory-taken'; the cost is written on screen next
 * scene — she is KIND now; refuse → UNDERTOW +1 and the "safe one" line;
 * 'today:remembered' either way). B: the mail run — the delivery slip @doc
 * in Dianne's counter clutter sets 'found-mail-slip'. Missing B is the
 * honest never-find route: Night 17 falls through to a plain decay night.
 *
 * NIGHT 17 — THE LETTER (fires only on 'found-mail-slip'; entry varies on
 * dianne:locks-house × d16:sam-named). On locks-house WITHOUT Sam the night
 * does not fire at all — the Contract forbids unannounced after-hours entry
 * once she locks, and the beat sheet ties the truth-route on that branch to
 * the Sam alliance ('the alliance buying the truth-route'); d17-night
 * carries the locked-out beat. Three stakes-major choices:
 * open (THE REVEAL, knowing route — cue 'title', bars 1–5 complete for the
 * first time, music.stop where the sixth should live; flags 'letter-opened'
 * + 'knows-truth'); burn unread ('letter-burned', STATIC +10); THE OTHER
 * BOOK (hidden unless STATIC ≥ 16, no lockedLabel) → ASH, the act's ending
 * ('ash', terminal, full strength, no rescue line).
 *
 * Flags this file owns: 'd17:slot', 'found-mail-slip', 'letter-memory-taken',
 * 'letter-opened', 'letter-burned', 'knows-truth' (set here on the knowing
 * route; early-truth may have set it first). Facts: 'went-to-clinic-d17',
 * 'ran-the-mail-d17', 'helped-dianne-counter', 'heard-priyas-letter-line',
 * 'private:letter-memory-taken' about priya + paired 'private:memory-taken'
 * about priya (the Two Wrens gate reads the specific one).
 *
 * Prose invariants in force (design/game-bible.md §Prose grammar): nobody
 * touches you first; nobody remarks that anything is wrong; the sign-off of
 * the letter is verbatim per design/title-thread.md; the reply draft's
 * salutation is this act's single @doc use of the name. Each music.detune
 * emit's visual twin lives in the prose of the same scene.
 */

import { defineScene, type Cond, type Scene } from '@not-here/engine';
import {
  decayedEcho,
  decayedFlesh,
  decayedName,
  defendedVerdict,
  detune,
  exiledVerdict,
  hornOn,
  hornStopped,
  letterMemoryTaken,
  locksHouse,
  NIGHT_DECAY,
} from './act2-shared.ts';

const wentClinic: Cond = { op: 'flag', key: 'd17:slot', value: 'clinic' };
const wentMail: Cond = { op: 'flag', key: 'd17:slot', value: 'mail' };
const foundSlip: Cond = { op: 'flag', key: 'found-mail-slip' };
const samNamed: Cond = { op: 'flag', key: 'd16:sam-named' };
const earlyTruth: Cond = { op: 'flag', key: 'early-truth' };
const samLetsYouIn: Cond = { op: 'all', of: [locksHouse, samNamed] };
const helpedCounter: Cond = { op: 'fact.exists', tag: 'helped-dianne-counter' };
/** The quilt was only offered in d3-room; the lean callback gates on it. */
const quiltOffered: Cond = { op: 'flag', key: 'd3:slot', value: 'room' };

// ——— Morning hub: the clinic, or the mail run ———

const morning = defineScene({
  id: 'd17-morning',
  slot: 'morning',
  onEnter: [{ op: 'time.set', day: 17, slot: 'morning' }],
  prose: {
    kind: 'inline',
    paragraphs: [
      {
        text: 'Day seventeen comes up stone-grey and close: fog to the breakwater, frost in the ruts, the crows keeping their counsel for once.',
      },
      {
        text: 'The thermos is on the piling before first light, lid tight, no note. There is never a note. You drink it facing the water, then walk up through a town that minds its own business at you the whole way to the Kettle.',
        when: exiledVerdict,
      },
      {
        text: 'The Kettle keeps your stool by common law now. Coffee lands before you are all the way onto it.',
        when: defendedVerdict,
      },
      {
        text: '“Doctor’s holding clinic till noon,” Barb says, at the flat-top, not turning. “She asked would you come up. She doesn’t ask things twice, so I’m saying it once.”',
      },
      {
        text: '“And that—” the outgoing mail in its elastic, squared on the counter’s end “—wants walking over to Dianne’s counter before the pickup at two. Morning won’t stretch over both. You know how they are.”',
      },
      // pt2-fix-02: the mail run gets its own gravity — equal pull, no
      // signpost. The clinic keeps "she doesn't ask things twice."
      {
        text: '“Dianne’s been stood at that counter all week like it owes her something,” she adds, to the flat-top. “Wouldn’t hurt her to have somebody in the store of a morning.”',
      },
    ],
  },
  choices: [
    {
      id: 'to-clinic',
      label: 'Go up to clinic hours.',
      effects: [
        { op: 'flag.set', key: 'd17:slot', value: 'clinic' },
        { op: 'fact.add', tag: 'went-to-clinic-d17', witnessedBy: ['barb'] },
      ],
      goto: 'd17-clinic',
    },
    {
      id: 'to-mail',
      label: 'Take the bundle across to the General.',
      effects: [
        { op: 'flag.set', key: 'd17:slot', value: 'mail' },
        { op: 'fact.add', tag: 'ran-the-mail-d17', witnessedBy: ['barb'] },
      ],
      goto: 'd17-mail',
    },
  ],
});

// ——— A. The clinic: the envelope, and the second harvest ———

const clinic = defineScene({
  id: 'd17-clinic',
  slot: 'morning',
  onEnter: [{ op: 'fact.add', tag: 'heard-priyas-letter-line', witnessedBy: ['priya'] }],
  prose: {
    kind: 'inline',
    paragraphs: [
      {
        text: 'Clinic hours are thinning out when you come up: one truck leaving, the waiting chairs empty, the scale idle in its corner. Priya doesn’t reach for the intake pad. On the desk in front of her, square to the blotter, sits an envelope gone soft at the corners, the way paper goes when it has been carried more than kept.',
      },
      {
        text: '“She wrote me a letter, the week it happened,” she says. Clinic voice, which is how you know it isn’t. “One letter. I never answered it. Seven years I have been the town’s doctor about that fact.”',
      },
      {
        text: 'She doesn’t open it. She looks at you, eyes open, level, and lays the line down from memory the way you’d lay down a card you had spent years not playing: “‘I can’t stay where everyone has already decided who I am.’”',
      },
      {
        text: 'The envelope stays shut under her hand. And the room leans in, the way it leaned at the quilt — not her; she has offered nothing. The morning that letter arrived is sitting up in her, bright at the edges, close enough to take whole.',
        when: quiltOffered,
      },
      {
        text: 'The envelope stays shut under her hand. And the room leans in, the way it leaned at the lullaby — not her; she has offered nothing. The morning that letter arrived is sitting up in her, bright at the edges, close enough to take whole.',
        when: { op: 'not', of: quiltOffered },
      },
    ],
  },
  choices: [
    {
      id: 'take-the-morning',
      label: 'Take the morning the letter came to her. Corner to corner. Whole.',
      stakes: 'major',
      effects: [
        { op: 'stat.add', stat: 'echo', value: 2 },
        {
          op: 'fact.add',
          tag: 'private:letter-memory-taken',
          about: 'priya',
          witnessedBy: ['priya'],
        },
        {
          op: 'fact.add',
          tag: 'private:memory-taken',
          about: 'priya',
          witnessedBy: ['priya'],
        },
        { op: 'flag.set', key: 'letter-memory-taken', value: true },
      ],
      goto: 'd17-clinic-2',
    },
    {
      id: 'let-it-stay-hers',
      label: 'Let the morning stay hers.',
      stakes: 'major',
      effects: [{ op: 'stat.add', stat: 'undertow', value: 1 }],
      goto: 'd17-clinic-2',
    },
  ],
  cue: 'priya-theme',
});

// The cost is written on screen here (act2-beats: she is KIND next scene).
const clinic2 = defineScene({
  id: 'd17-clinic-2',
  slot: 'morning',
  onEnter: [{ op: 'flag.set', key: 'today:remembered', value: true }],
  prose: {
    kind: 'inline',
    paragraphs: [
      {
        text: 'It comes away whole: the day’s mail in her two hands, one hand knowing before the other; the flap unopened until dark; the reading, standing up, coat still on — and under all of it, the why of her going, which lived nowhere else. Across the desk, Priya blinks once, the way a projector drops a slide.',
        when: letterMemoryTaken,
      },
      {
        text: 'Then she is kind to you. That is the whole of the change and the size of it. She walks you to the door, holds it wide, says something easy about the fog getting in — kind as a stranger on a bus. Seven years of carrying have gone off her like weather. What they carried is in you now, and of the two of you, only you know there was ever a weight.',
        when: letterMemoryTaken,
      },
      {
        text: '“She wrote to me because I was the safe one,” Priya says, to the envelope, evening its corners. “I have spent seven years being the safe one.” She puts it away inside her coat, flat to the lining, where you keep the thing you’d go back into a fire for.',
        when: { op: 'not', of: letterMemoryTaken },
      },
      {
        text: 'At the door she stops you with nothing but the pause. “Thank you for not asking,” she says, which is the closest thing to warm the room has ever given you, and costs her the usual amounts.',
        when: { op: 'not', of: letterMemoryTaken },
      },
    ],
  },
  choices: [
    { id: 'walk-the-long-way', label: 'Take the long way back down.', goto: 'd17-evening' },
  ],
});

// ——— B. The mail run: the slip, the bare nail, the new brass ———

const mail = defineScene({
  id: 'd17-mail',
  slot: 'morning',
  onEnter: [{ op: 'fact.learn', who: 'dianne', tag: 'ran-the-mail-d17' }],
  prose: {
    kind: 'inline',
    paragraphs: [
      {
        text: 'The General smells of string and stove and apples on the turn. Dianne is feeding the label printer and losing graciously. “On the counter, hon — elastic means it’s Barb’s.” The Kettle’s bundle joins the outgoing tray like a settled question.',
      },
      {
        text: '“Pickup’s not till two. Don’t let anyone make off with the till.” She goes back for the held mail, and the store hums around the going of her.',
      },
    ],
  },
  choices: [
    {
      id: 'square-the-backlog',
      label: 'Square the parcel backlog while she’s in the back.',
      effects: [
        { op: 'flag.set', key: 'today:named', value: true },
        { op: 'fact.add', tag: 'helped-dianne-counter', witnessedBy: ['dianne'] },
      ],
      goto: 'd17-mail-2',
    },
    { id: 'mind-the-bell', label: 'Stand where the bell can see you.', goto: 'd17-mail-2' },
  ],
  cue: 'dianne-theme',
});

const mail2 = defineScene({
  id: 'd17-mail-2',
  slot: 'morning',
  onEnter: [{ op: 'flag.set', key: 'found-mail-slip', value: true }],
  prose: {
    kind: 'inline',
    paragraphs: [
      {
        text: 'You square the backlog by size and destination, and the counter becomes a counter again. When she’s back, Dianne takes it in, says nothing about it, and writes two words against the Kettle’s line in the counter book — then goes over them a second time, wetting the pen. Ink, where your morning went. It holds.',
        when: helpedCounter,
      },
      {
        text: 'Waiting does what waiting does at counters: your eye files the clutter. Rubber bands. A coupon for the boat wash, expired with the season. And half under the blotter, curled at one corner, a Canada Post delivery slip.',
      },
      {
        text: '@doc:\n┌──────────────────────────────────────┐\n│  CANADA POST — DELIVERY NOTICE       │\n│                                      │\n│  Item ..... LETTER, SIGNATURE REQ’D  │\n│  Date ..... NOV 01        11:20      │\n│  Rec’d by . D. COLE                  │\n│  Sender ... —                        │\n│                                      │\n│  Retain for your records.            │\n└──────────────────────────────────────┘',
      },
      {
        text: 'A letter, signed for, weeks back. The sender line is empty the way a held breath is empty.',
      },
      {
        text: 'Under the till there is a shallow drawer, and on the drawer a small brass lock with bright new scratches around its mouth. The key that fits a lock like that lived on a nail by the register — you have watched change counted past it since your first morning in the store. The nail is bare.',
      },
      {
        text: 'Dianne comes back with Barb’s held mail and the kettle question — “tea, before they miss you?” — and the counter is a counter, and the drawer is a drawer, and you drink the tea.',
      },
    ],
  },
  choices: [
    { id: 'carry-the-held-mail', label: 'Carry Barb’s held mail back up.', goto: 'd17-evening' },
  ],
});

// ——— Evening: retellings for the missed slot (spike-fomo rules 1–6) ———

const evening = defineScene({
  id: 'd17-evening',
  slot: 'evening',
  onEnter: [
    { op: 'time.set', slot: 'evening' },
    // The hole has a sound. Each motif's visual twin is its retelling
    // paragraph below — never a duplicate toast (fix-03 grammar).
    { op: 'when', cond: wentMail, then: [detune('priya')] },
    { op: 'when', cond: wentClinic, then: [detune('dianne')] },
  ],
  prose: {
    kind: 'inline',
    paragraphs: [
      {
        text: 'Evening at the Kettle, weeknight-size: crib pegs, two coats steaming on chair backs, the window sweating itself a view. Moose has the door and the door has his chin.',
      },
      {
        text: 'You came up from the wharf for it. The walk through town goes the way it goes now — nobody looks, the whole way, with great attention.',
        when: exiledVerdict,
      },
      { text: '@line:barb:greeting-d17' },
      // ——— Without-you: the clinic (told by Barb, off Della's account).
      {
        text: '“Doctor closed up at noon sharp,” Barb says, evening the sugar jars. “No afternoon list. Della had it she stood at the mailbox out front the better part of twenty minutes, one envelope in her hand. Never posted it. Took it back inside with her.” The jars are even. She does them once more.',
        when: wentMail,
      },
      {
        text: 'Under the crib game, four notes off a piano nobody owns go by upside down and a shade flat — once, once again — and the furnace takes them back.',
        when: wentMail,
      },
      // ——— Without-you: the mail run (Barb walked it over herself).
      {
        text: '“Ran the bundle over myself at four,” Barb says, pouring. “Side door’s gone stiff, so round the front like company. Dianne’s got every hall dish wrapped to go home already — paper and string, Christmas run backwards. Asked after you twice.” She sets the pot down. “In the one visit.”',
        when: wentClinic,
      },
      {
        text: 'Behind the room’s noise a music-box line goes by a quarter-tone flat, twice through, finishing neither time.',
        when: wentClinic,
      },
      {
        text: 'The fog is at the glass by eight. Chairs go up. The town goes out a window at a time.',
      },
    ],
  },
  choices: [
    {
      id: 'turn-in',
      label: 'Turn in.',
      effects: [
        {
          op: 'when',
          // The letter fires on the slip — unless she locks and Sam never got
          // the name: after locks-house there is no unannounced entry (the
          // Contract), and the spare key is the alliance's to lend.
          cond: {
            op: 'all',
            of: [foundSlip, { op: 'any', of: [{ op: 'not', of: locksHouse }, samNamed] }],
          },
          then: [{ op: 'goto', scene: 'd17-letter' }],
        },
      ],
      goto: 'd17-night',
    },
  ],
  cue: 'pub-warm',
});

// ——— Night 17, plain: the never-find route falls through to decay ———

const night = defineScene({
  id: 'd17-night',
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
        text: 'You go down anyway, at an hour with no name to it, the slip’s knowledge lying in you like a swallowed key. The side door of the General does not give. The new lock has been thrown properly tonight, from the inside, by a hand that has learned its own door after all. You stand in the fog until the cold decides for you, and carry the knowing back up the hill unspent.',
        when: { op: 'all', of: [foundSlip, locksHouse, { op: 'not', of: samNamed }] },
      },
      {
        text: 'At 3:12 the horn takes its five bars out over the water and stops where the rest would go. Sleep arrives on the far side of the stop, fed from somewhere, asking nothing.',
        when: hornOn,
      },
      {
        text: 'No horn. The silence knows the hour by heart now; it arrives at 3:12 exactly and sits where the song sat, filling it edge to edge.',
        when: hornStopped,
      },
      {
        text: 'Once, turning over, the blankets have to look for you before they settle.',
        when: decayedFlesh,
      },
      {
        text: 'You try to picture your line in Barb’s book and get the date, the unit, the supper, and a pale place where the rest was.',
        when: decayedName,
      },
      {
        text: 'A kitchen you could walk blind last week has moved a wall. You stop reaching for it and lie still.',
        when: decayedEcho,
      },
    ],
  },
  choices: [{ id: 'let-morning-come', label: 'Let the morning come.', goto: 'd18-morning' }],
});

// ——— NIGHT 17 — THE LETTER ———

const letter = defineScene({
  id: 'd17-letter',
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
        text: 'You lie down and the slip lies down with you. Signed for. Sender, nothing. At an hour with no name to it you are dressed and on the road with your breath going ahead of you, and none of it was decided.',
      },
      {
        text: 'The road takes your weight lightly tonight. You try not to notice how lightly.',
        when: decayedFlesh,
      },
      {
        text: 'Past the Kettle’s dark glass the register sleeps with your line in it, and the thought of the ink comes thin, like a voice through two walls.',
        when: decayedName,
      },
      {
        text: 'You reach for a memory to walk with. It gives you its doorway and keeps its room.',
        when: decayedEcho,
      },
      {
        text: 'Sam is at the General’s side door, hood up, the stockroom spare already in the lock, as if the two of you had planned this. In every way that counts, you have. “Whatever’s in there,” he says, low, “I don’t need to see it. You do.” He holds the door exactly wide enough and watches the street while you go in.',
        when: samLetsYouIn,
      },
      {
        text: 'The side door of the General has never been locked; the town doesn’t, so the store doesn’t. Tonight the knob catches, half-turned — a lock so new it hasn’t learned its own door — and then gives, the way things give in a town where locking is a language nobody grew up speaking.',
        when: { op: 'not', of: locksHouse },
      },
      {
        text: 'Inside, the store by streetlight: string, cold shelving, the corkboard grey and holding its dates. The till drawer’s new brass takes what light there is. The drawer is older than its lock. You lift it on its runners — the way you were taught your first door in this town — and it comes.',
      },
      {
        text: 'Inside: an envelope with no return address, opened once and put back with the flap tucked in, the way you’d close a door on someone sleeping. Under it, a lined page folded twice, soft at the fold, in the hand the corkboard notices are written in. Never sent. Carried enough to look travelled anyway.',
      },
      { text: 'The stove is four steps away, banked low for the morning. It ticks.' },
    ],
  },
  choices: [
    { id: 'open-them', label: 'Open them. Both.', stakes: 'major', goto: 'd17-reveal' },
    {
      id: 'burn-unread',
      label: 'Feed both papers to the stove. Unread.',
      stakes: 'major',
      effects: [
        { op: 'flag.set', key: 'letter-burned', value: true },
        { op: 'static.add', value: 10 },
      ],
      goto: 'd17-burn',
    },
    {
      // Hidden unless the fog already owns enough of you. No lockedLabel,
      // by design: below the gate this door does not exist.
      id: 'the-other-book',
      label: 'Not this drawer. Not this paper. The book that keeps you sleeps across the lot.',
      stakes: 'major',
      when: { op: 'static.gte', value: 16 },
      goto: 'act2-ash',
    },
  ],
});

// ——— THE REVEAL, knowing route ———

const reveal = defineScene({
  id: 'd17-reveal',
  slot: 'night',
  onEnter: [
    { op: 'flag.set', key: 'letter-opened', value: true },
    { op: 'flag.set', key: 'knows-truth', value: true },
  ],
  prose: {
    kind: 'inline',
    paragraphs: [
      {
        text: 'You read standing up, by the window’s streetlight, because sitting down would make it a decision.',
      },
      {
        text: '@doc:\nMom —\n\nSeven addresses since the one you know. This is the\nfirst one I could write to you from, so I am.\n\nI’m coming on the Friday bus — the 28th, the morning\none, through Penticton. Don’t organize anything.\nDon’t tell people. I want to be a person walking in,\nnot a thing arriving.\n\nI finished the song. Five years and a Sunday bar on\nCommercial Drive, but it has an ending now.\n\nTell Sam he can stop keeping it. I was never here\nanyway — that was the whole trouble.\n\n— W.',
      },
      {
        text: 'The hand is quick and slants right and crosses nothing out. Paper weeks old, not years. She is alive. She finished the song. She is coming on the ringed Friday — into a town that already has one of her, standing in its dark store, holding her mail.',
      },
      {
        text: 'What Barb gave you at the counter had a shape and no date. Now it has a date, and the date has a bus.',
        when: earlyTruth,
      },
    ],
  },
  choices: [{ id: 'the-lined-page', label: 'The lined page, folded twice.', goto: 'd17-reveal-2' }],
  cue: 'title',
});

const reveal2 = defineScene({
  id: 'd17-reveal-2',
  slot: 'night',
  // The stop lands where the sixth bar should live; the held rest follows.
  onEnter: [{ op: 'emit', event: { kind: 'music.stop' } }],
  prose: {
    kind: 'inline',
    paragraphs: [
      {
        text: 'The lined page is hers the way the corkboard notices are hers — quick capitals gone soft with hurry. It has been folded and unfolded until the crease is cloth.',
      },
      {
        text: '@doc:\nWren —\n\nYour letter is in the till drawer. I have read it more\nnights than I have slept, and answered it the once,\nwhich is this, which isn’t.\n\nI burned the first one. You will want that said to\nyour face. Come and I will say it to your face.\n\nSam kept whatever you gave him to keep. It has cost\nhim seven years of being the only one telling\n\nIt is not that I don’t know what is in my kitchen\nthese mornings. I have known since the second cup.\nWhat I don’t know is how to want it gone, when it\nhums your\n\nHurry, my girl. Come before I get too good at the\nother one.',
      },
      {
        text: 'Somewhere between the envelope and the lined page the song has come up around you — all five bars, in order, whole, closer than a wall for the first time in your life, whatever your life is — and it stops now, exactly where a sixth would stand, and holds the rest.',
      },
      {
        text: 'A long way out, the horn takes up the held place once, distant, and sets it down unfinished.',
        when: hornOn,
      },
      {
        text: 'The fog lies flat against the glass. For four seconds it is the loudest thing in the Bay, and it makes no sound at all.',
        when: hornStopped,
      },
      {
        text: 'You put both papers back the way a person puts back what they mean never to have touched: flap tucked, fold matched, drawer let down onto its runners. The walk up gives you the town exactly as you left it. Nothing has changed. Everything has. Both will keep until daylight.',
        when: { op: 'not', of: exiledVerdict },
      },
      {
        text: 'You put both papers back the way a person puts back what they mean never to have touched: flap tucked, fold matched, drawer let down onto its runners. The walk down to the boards gives you the town exactly as you left it. Nothing has changed. Everything has. Both will keep until daylight.',
        when: exiledVerdict,
      },
    ],
  },
  choices: [{ id: 'lie-down-with-it', label: 'Lie down with it.', goto: 'd18-morning' }],
});

// ——— Burn unread: willful innocence, priced ———

const burn = defineScene({
  id: 'd17-burn',
  slot: 'night',
  prose: {
    kind: 'inline',
    paragraphs: [
      {
        text: 'You don’t read them. That is the entire work of it, and it is work: the stove is four steps away, lit low for the morning, and the four steps are the longest road in the Bay.',
      },
      {
        text: 'Both papers. The fire takes them the way the lake takes things — completely, and as if it had been waiting.',
      },
      {
        text: 'Up the hill, on a shelf above another stove, a tobacco tin has been keeping seven winters of exactly this. It has company tonight.',
      },
      {
        text: 'You settle the drawer back onto its runners, lighter. The walk up is quiet, and the fog keeps you company the whole way — easy, unhurried, like a thing that has been paid.',
        when: { op: 'not', of: exiledVerdict },
      },
      {
        text: 'You settle the drawer back onto its runners, lighter. The walk down to the boards is quiet, and the fog keeps you company the whole way — easy, unhurried, like a thing that has been paid.',
        when: exiledVerdict,
      },
    ],
  },
  choices: [{ id: 'go-up', label: 'Go up.', goto: 'd18-morning' }],
});

// ——— ASH — the act's dark exit (two scenes, terminal) ———

const ash = defineScene({
  id: 'act2-ash',
  slot: 'night',
  onEnter: [{ op: 'emit', event: { kind: 'music.stop' } }],
  prose: {
    kind: 'inline',
    paragraphs: [
      {
        text: 'You leave the drawer shut. Paper in a drawer is half a thing; across the lot, under a counter, sleeps the book that has been doing the rest of it all winter — the dates, the double ink, the NAME column holding your chair.',
      },
      {
        text: 'The Kettle’s lock was never meant against anyone who knows how doors work in this town. Inside: chairs up, furnace ticking, the register squared under the counter where her hand leaves it. You carry it to the stove like a sleeping thing.',
      },
      {
        text: 'The early pages go like kindling, which is all they are — summer guests, a roofing bill, Augusts. The blank line in the NAME column is the first thing on its page to catch, as if it had less holding it down.',
      },
      {
        text: 'The double-inked pages go last. They fight — lines written twice char and stay legible, char and stay, saying themselves into the heat — and then they don’t.',
      },
      {
        text: 'The fire settles. The furnace ticks on. Nothing in Lorn Bay is louder than it was a minute ago, and the difference between this quiet and every quiet before it is that this one is finished.',
      },
    ],
  },
  choices: [{ id: 'stay-until-warmth', label: 'Stay until it’s only warmth.', goto: 'act2-ash-2' }],
});

const ash2 = defineScene({
  id: 'act2-ash-2',
  slot: 'morning',
  onEnter: [{ op: 'time.set', slot: 'morning' }],
  prose: {
    kind: 'inline',
    paragraphs: [
      { text: 'Morning comes up ordinary. That is the whole of what it comes up.' },
      {
        text: 'The banner over the hall says SEVEN YEARS. People pass under it with dishes to collect and read it the way you’d read a sign in an alphabet you almost know. Nobody takes it down. Nobody could say whose job that would be.',
      },
      {
        text: 'At the General, Dianne stands a guitar on the counter like a parcel that came without an address. “Whose is this, then?” she asks Sam, because he’s the one in the store. Sam turns it over. His thumb finds a worn place on the neck where a thumb should go, and nothing in him comes to meet it. “Swap meet?” he says. He isn’t lying. There is nothing left in him to lie about.',
      },
      {
        text: 'You are still here. The town is kind to strangers; it will feed you without asking who you are, because there is no one left to ask on behalf of.',
      },
      { text: 'Nobody ever calls you anything again.' },
    ],
  },
  choices: [],
  ending: 'ash',
});

export const DAY17_SCENES: readonly Scene[] = [
  morning,
  clinic,
  clinic2,
  mail,
  mail2,
  evening,
  night,
  letter,
  reveal,
  reveal2,
  burn,
  ash,
  ash2,
];
