/**
 * DAY 11 — the albums, and the one warning (design/act2-beats.md §Day 11).
 *
 * Two-way morning hub; the day narrows toward its night. A — Dianne's
 * albums, back downstairs, "sorted": seven Novembers of prints, and the
 * sleeve for the year the canoe went over is not thin — it is EMPTY, and
 * re-labelled in newer ink. Press opportunity #3 ("Who sorted these?") —
 * the press that makes pressed-dianne 3 also sets dianne:locks-house (via
 * the defensive when-chain; the game never remarks on the locking).
 * Staying instead earns today:remembered — being told is not the taking.
 * B — the Canada Post counter: the parcel backlog, and the marked,
 * stat-gated signing choice (when NAME ≥ 4; the lockedLabel aches) —
 * success is today:named, and the register keeps it overnight.
 *
 * Evening: the without-you retelling for the missed slot (both slots are
 * Dianne's, so the hole is dianne-shaped either way; twin in prose), and
 * supper (today:fed offset). Then NIGHT 11 — BARB'S ONE WARNING, fixed on
 * both tracks: the canon Frank text from design/title-thread.md §Act 2,
 * said to the register, not to you. This scene owns the act's FIRST of
 * two spoken title uses (the second is Sam's, at the potluck). Heeding
 * sets 'heeded-barbs-warning'; the joke deflection is a marked lie
 * (STATIC +2). No dialogue rule references the warning again, ever —
 * the one-warning rule is mechanical.
 *
 * Night 11 ('d11-night'): canonical decay block; conditional foghorn-312
 * on horn-on only; music.stop on horn-stopped so nothing loops under the
 * silence; exits to 'd12-morning'.
 *
 * Flags this file owns (day-local): 'd11:slot' ('albums'|'counter'),
 * 'd11:saw-sleeve', 'd11:signed', 'd11:kept-silent', 'd11:joked'.
 * Contract flags touched: 'pressed-dianne' / 'dianne:locks-house' (press
 * chain), 'heeded-barbs-warning', 'today:named', 'today:fed',
 * 'today:remembered'. Facts (cluster-local): went-to-albums-d11 /
 * went-to-counter-d11 (barb), pressed-dianne-d11, heard-dianne-albums,
 * helped-counter-d11, signed-the-receipt-line (dianne).
 */

import { defineScene, type Cond, type Effect, type Scene } from '@not-here/engine';
import {
  NIGHT_DECAY,
  decayedEcho,
  decayedFlesh,
  decayedName,
  detune,
  hornOn,
  hornStopped,
} from './act2-shared.ts';

const wentAlbums: Cond = { op: 'flag', key: 'd11:slot', value: 'albums' };
const wentCounter: Cond = { op: 'flag', key: 'd11:slot', value: 'counter' };
const missedAlbums: Cond = { op: 'not', of: wentAlbums };
const missedCounter: Cond = { op: 'not', of: wentCounter };
const signed: Cond = { op: 'flag', key: 'd11:signed' };

/**
 * Attendance is tracked (act2-beats §Day 8, game-bible §Presence Economy):
 * skip Dianne twice running — Days 8 and 10 — and the bible's line fires
 * here, once, in Barb's voice. The line names where you actually were on
 * Day 8, so each skip route carries its own variant.
 */
const missedHouseD10: Cond = { op: 'not', of: { op: 'flag', key: 'd10:slot', value: 'house' } };
const skippedForWharf: Cond = {
  op: 'all',
  of: [{ op: 'flag', key: 'd8:slot', value: 'wharf' }, missedHouseD10],
};
const skippedForShed: Cond = {
  op: 'all',
  of: [{ op: 'flag', key: 'd8:slot', value: 'shed' }, missedHouseD10],
};

/** Same defensive press chain as Day 10 — exact values, 3 locks the house. */
const PRESS_DIANNE: readonly Effect[] = [
  {
    op: 'when',
    cond: { op: 'flag', key: 'pressed-dianne', value: 2 },
    then: [
      { op: 'flag.set', key: 'pressed-dianne', value: 3 },
      { op: 'flag.set', key: 'dianne:locks-house', value: true },
    ],
    else: [
      {
        op: 'when',
        cond: { op: 'flag', key: 'pressed-dianne', value: 1 },
        then: [{ op: 'flag.set', key: 'pressed-dianne', value: 2 }],
        else: [
          {
            op: 'when',
            cond: { op: 'flag', key: 'pressed-dianne', value: 3 },
            then: [],
            else: [{ op: 'flag.set', key: 'pressed-dianne', value: 1 }],
          },
        ],
      },
    ],
  },
];

// ——— Morning hub ———

const morning = defineScene({
  id: 'd11-morning',
  slot: 'morning',
  onEnter: [{ op: 'time.set', day: 11, slot: 'morning' }],
  prose: {
    kind: 'inline',
    paragraphs: [
      {
        text: 'Morning eleven is frost to the waterline and a sky the colour of dishwater going cold. The crows have moved their argument to the packinghouse roof. Barb pours before you ask.',
      },
      {
        text: '“Albums are back on the shelf at the General,” she says. “Sorted — that’s the word going round with them. Dianne’s showing pages to anyone who stands still.”',
      },
      {
        text: '“And the counter’s a week behind on parcels. Tam brought three tubs down and the bench eats her mornings. She’d not ask.” Barb squares the sugar. “I’m asking.”',
      },
    ],
  },
  choices: [
    {
      id: 'to-the-albums',
      label: 'Go stand still by the albums.',
      effects: [
        { op: 'flag.set', key: 'd11:slot', value: 'albums' },
        { op: 'fact.add', tag: 'went-to-albums-d11', witnessedBy: ['barb'] },
      ],
      goto: 'd11-albums',
    },
    {
      id: 'to-the-counter',
      label: 'Work the parcel backlog.',
      effects: [
        { op: 'flag.set', key: 'd11:slot', value: 'counter' },
        { op: 'fact.add', tag: 'went-to-counter-d11', witnessedBy: ['barb'] },
      ],
      goto: 'd11-counter',
    },
  ],
});

// ——— A. The albums, and the sleeve ———

const albums = defineScene({
  id: 'd11-albums',
  slot: 'morning',
  onEnter: [{ op: 'flag.set', key: 'd11:saw-sleeve', value: true }],
  prose: {
    kind: 'inline',
    paragraphs: [
      {
        text: 'The long shelf behind the till has its spines back — seven fat Novembers of them, squared and dusted, the stripe of unfaded paint gone under them like it was never bare. Dianne has one open on the counter glass between customers.',
      },
      {
        text: '“There’s the hall the year the roof went,” she says, corner by corner. “There’s the beach in the good August. There’s the packinghouse crew, the whole daft lot of them.” The pages turn at her pace and the morning goes with them, warm as the heater.',
      },
      {
        text: 'Each album keeps a sleeve of loose prints inside the back cover. Seven sleeves back, the year the canoe went over is not thin, the way a hard year would be thin. It is empty. And its label is newer ink than its neighbours — the year written twice, the second hand over the ghost of the first, steadier.',
      },
    ],
  },
  choices: [
    {
      id: 'press-who-sorted',
      label: '“Who sorted these?”',
      stakes: 'major',
      effects: [
        { op: 'fact.add', tag: 'pressed-dianne-d11', about: 'dianne', witnessedBy: ['dianne'] },
        ...PRESS_DIANNE,
      ],
      goto: 'd11-albums-2',
    },
    {
      id: 'stay-for-the-stories',
      label: 'Stay for the stories under the prints.',
      effects: [
        { op: 'flag.set', key: 'today:remembered', value: true },
        { op: 'fact.add', tag: 'heard-dianne-albums', witnessedBy: ['dianne'] },
      ],
      goto: 'd11-albums-2',
    },
  ],
  cue: 'wrens-room',
});

const albums2 = defineScene({
  id: 'd11-albums-2',
  slot: 'morning',
  prose: {
    kind: 'inline',
    paragraphs: [
      {
        text: '“I did, hon. Winters want projects.” The album under her hands closes on its own weight. She stays pleasant the whole way through it — pleasant to the door, pleasant past it, a pleasantness with the counter inside it. She sells Mrs. Yee her stamps. She recommends the parcel tape. She does not open another album.',
        when: { op: 'fact.knownBy', who: 'dianne', tag: 'pressed-dianne-d11' },
      },
      {
        text: 'The morning goes down page by page. You say nothing you’d have to own, and she gives the stories anyway — the hall, the good August — and one of them comes to stay with you a while without leaving her. Being told is not the taking. You learn the difference by the way the room doesn’t lean.',
        when: { op: 'fact.knownBy', who: 'dianne', tag: 'heard-dianne-albums' },
      },
      {
        text: 'The bell over the door does its one job on your way out. Behind you the albums keep the shelf, spines level, the seventh one back holding its place like a tooth that has stopped hurting.',
      },
    ],
  },
  choices: [{ id: 'back-down-the-hill', label: 'Give the afternoon to the hill road.', goto: 'd11-evening' }],
});

// ——— B. The counter, and the line ———

const counter = defineScene({
  id: 'd11-counter',
  slot: 'morning',
  onEnter: [{ op: 'fact.add', tag: 'helped-counter-d11', witnessedBy: ['dianne'] }],
  prose: {
    kind: 'inline',
    paragraphs: [
      {
        text: 'Three tubs deep, the backlog. You take the counter side: parcels alphabetical, cards for what won’t fit the boxes, string where the tape won’t hold. Dianne calls the names out of the tubs and the morning finds a rhythm the two of you don’t have to discuss.',
      },
      {
        text: 'Late morning, the courier van from town — signature stock, one parcel, the Kettle’s winter order. The pad comes across the counter and waits where pads wait. Dianne’s hands are in the third tub. There is a line at the bottom for a name.',
      },
    ],
  },
  choices: [
    {
      id: 'sign-the-line',
      label: 'Sign the receipt line yourself.',
      stakes: 'major',
      when: { op: 'stat.gte', stat: 'name', value: 4 },
      lockedLabel: 'The pen is right there. The line is not for you yet.',
      effects: [
        { op: 'flag.set', key: 'today:named', value: true },
        { op: 'flag.set', key: 'd11:signed', value: true },
        { op: 'stat.add', stat: 'name', value: 1 },
        { op: 'fact.add', tag: 'signed-the-receipt-line', witnessedBy: ['dianne'] },
      ],
      goto: 'd11-counter-2',
    },
    {
      id: 'slide-the-pad-to-dianne',
      label: 'Slide the pad down the counter to Dianne.',
      goto: 'd11-counter-2',
    },
  ],
  cue: 'dianne-theme',
});

const counter2 = defineScene({
  id: 'd11-counter-2',
  slot: 'morning',
  prose: {
    kind: 'inline',
    paragraphs: [
      {
        text: 'The pen takes your weight. You sign. The driver checks the line the way drivers do, which is not at all, and the flimsy tears off yellow and lies on the counter — signed, dated, done. Dianne looks over from the third tub, and whatever crosses her face files itself under the morning’s work.',
        when: signed,
      },
      {
        text: 'The parcel under the signature is the Kettle’s. You carry it down the hill with the flimsy taped to the brown paper, your own hand riding on top of it the whole way.',
        when: signed,
      },
      {
        text: 'Dianne wipes her palm on her cardigan and signs — D. Cole, the letters worn smooth with use — and the pad goes back over the counter. The morning closes over the moment like water over a dropped stone.',
        when: { op: 'not', of: signed },
      },
      {
        text: 'By early dark the tubs are empty and stacked inside each other, and the counter is a counter again. Dianne sends you off with the day’s thanks folded into a remark about the fog.',
        when: { op: 'not', of: signed },
      },
    ],
  },
  choices: [{ id: 'down-to-the-kettle', label: 'Down to the Kettle.', goto: 'd11-evening' }],
});

// ——— Evening: the retelling, the supper, the narrowing ———

const evening = defineScene({
  id: 'd11-evening',
  slot: 'evening',
  onEnter: [
    { op: 'time.set', slot: 'evening' },
    { op: 'when', cond: missedAlbums, then: [detune('dianne')] },
    { op: 'when', cond: missedCounter, then: [detune('dianne')] },
  ],
  prose: {
    kind: 'inline',
    paragraphs: [
      {
        text: 'Supper at the Kettle, thin crowd, the fog leaning its whole weight on the glass. Moose keeps the door. The crib board stays in its drawer tonight.',
      },
      { text: '@line:barb:greeting-d11' },
      // ——— Without-you: the albums. Absence hands you the audience.
      {
        text: '“Dianne had the albums open on the counter glass all day,” Barb says. “Anyone who stood still got a page or two. Mrs. Yee got a wedding entire.” She sets the plate down. “Seven years those were upstairs. Now it’s the shop’s own little museum, and she’s the tour.”',
        when: missedAlbums,
      },
      {
        text: 'Under the supper noise, a music-box phrase goes by a shade flat — twice through — and takes itself back. The furnace covers for it.',
        when: missedAlbums,
      },
      // ——— Without-you: the counter. Absence hands you the waiting line.
      {
        text: '“Counter’s still a week behind,” Barb says. “And my till rolls are sitting up there — signature stock, mind. Dianne won’t leave them on the shelf overnight, and won’t sign them across to just anyone either. So they wait.” She says it to the soup, mild as anything.',
        when: missedCounter,
      },
      {
        text: 'Back of the room, low, a music-box phrase surfaces a shade flat, once and once more, and is gone before the ladle finds the pot again.',
        when: missedCounter,
      },
      {
        text: 'The Kettle’s parcel stands by the till with its yellow flimsy taped on top — your hand, riding the brown paper. Barb has the register open beside it before you’ve finished your coffee.',
        when: signed,
      },
      // ——— Attendance, kept: skip Dianne Days 8 AND 10, and the town says so.
      {
        text: '“Twice she’s asked for you up the hill now,” Barb says, in a lull, to the sugar more than to you. “Twice the morning went elsewhere. You were out at the wharf when Dianne needed the stockroom shelves.” The pot goes back on the ring. “She keeps that sort of thing the way she keeps receipts. Never mentioned. Never lost.”',
        when: skippedForWharf,
      },
      {
        text: '“Twice she’s asked for you up the hill now,” Barb says, in a lull, to the sugar more than to you. “Twice the morning went elsewhere. You were down at the boat shed when Dianne needed the stockroom shelves.” The pot goes back on the ring. “She keeps that sort of thing the way she keeps receipts. Never mentioned. Never lost.”',
        when: skippedForShed,
      },
      {
        text: 'The plate arrives whether you asked or not. That is the house style.',
      },
    ],
  },
  choices: [
    {
      id: 'eat-supper',
      label: 'Eat what she puts down.',
      effects: [
        { op: 'flag.set', key: 'today:fed', value: true },
        { op: 'stat.add', stat: 'flesh', value: 1 },
      ],
      goto: 'd11-warning',
    },
    {
      id: 'leave-the-plate',
      label: 'Leave the plate mostly where it stands.',
      effects: [{ op: 'stat.add', stat: 'undertow', value: 1 }],
      goto: 'd11-warning',
    },
  ],
  cue: 'pub-warm',
});

// ——— NIGHT 11: Barb's one warning (fixed, both tracks) ———

const warning = defineScene({
  id: 'd11-warning',
  slot: 'night',
  onEnter: [{ op: 'time.set', slot: 'night' }],
  prose: {
    kind: 'inline',
    paragraphs: [
      {
        text: 'The room empties by nine. Chairs go up. Barb leaves one lamp burning over the counter and your coffee inside its ring of light, and for a while the furnace does all the talking either of you needs.',
      },
      {
        text: 'The yellow flimsy is in the register — folded flat to the page, the date gone over twice beside it. Your hand, kept. It is the darkest ink on the spread.',
        when: signed,
      },
      {
        text: 'Then, to the register, not to you: “My Frank came back, one winter. Sat where you’re sitting. He was here — and he was not here. And the second one wore the first one out.”',
      },
      {
        text: 'She squares the book under the lamp. She does not say it again.',
      },
    ],
  },
  choices: [
    {
      id: 'ask-what-he-was',
      label: '“What was he?”',
      stakes: 'major',
      effects: [{ op: 'flag.set', key: 'heeded-barbs-warning', value: true }],
      goto: 'd11-warning-2',
    },
    {
      id: 'say-nothing',
      label: 'Say nothing. Let the lamp hum.',
      stakes: 'major',
      effects: [{ op: 'flag.set', key: 'd11:kept-silent', value: true }],
      goto: 'd11-warning-2',
    },
    {
      id: 'make-it-a-joke',
      label: '“Winter does that to husbands, I hear.”',
      stakes: 'major',
      effects: [
        { op: 'static.add', value: 2 },
        { op: 'flag.set', key: 'd11:joked', value: true },
      ],
      goto: 'd11-warning-2',
    },
  ],
});

const warning2 = defineScene({
  id: 'd11-warning-2',
  slot: 'night',
  prose: {
    kind: 'inline',
    paragraphs: [
      {
        text: '“Finish your coffee.” That is all the answer the night owes you, apparently. She waits it out, collects the cup, washes it with her back to the room, and leaves the lamp for you to switch.',
        when: { op: 'flag', key: 'heeded-barbs-warning' },
      },
      {
        text: 'The lamp hums. She lets the silence stand exactly as long as it wants to, then collects the cup, washes it, and puts the forty years back wherever she keeps them.',
        when: { op: 'flag', key: 'd11:kept-silent' },
      },
      {
        text: '“That’ll be it,” Barb says, level as a shelf, and the cup goes to the sink half-finished. Whatever the joke was for, it never got there. The lot outside is long, and lit by nothing.',
        when: { op: 'flag', key: 'd11:joked' },
      },
      {
        text: 'The lamp clicks off behind you before you reach the door of your unit.',
      },
    ],
  },
  choices: [{ id: 'cross-the-lot', label: 'Cross the lot and lie down.', goto: 'd11-night' }],
});

// ——— Night 11 ———

const night = defineScene({
  id: 'd11-night',
  slot: 'night',
  onEnter: [
    { op: 'time.set', slot: 'night' },
    {
      op: 'when',
      cond: hornOn,
      then: [{ op: 'emit', event: { kind: 'music.cue', cue: 'foghorn-312' } }],
    },
    { op: 'when', cond: hornStopped, then: [{ op: 'emit', event: { kind: 'music.stop' } }] },
    ...NIGHT_DECAY,
  ],
  prose: {
    kind: 'inline',
    paragraphs: [
      {
        text: '3:12. Five bars over the water, the stop. Your body is fed before you are awake enough to be asked, and asleep again before you can put a word to what was paid, or by whom.',
        when: hornOn,
      },
      {
        text: '3:12 passes with nothing in it. You wake for the nothing anyway, on the minute — the habit outliving its reason, the way a dog waits at a door.',
        when: hornStopped,
      },
      {
        text: 'You lie down and are a long time warming the sheets. Longer than a body should take.',
        when: decayedFlesh,
      },
      {
        text: 'Across the lot the register lies shut on the month, and one line of it is fainter tonight. You could not say which. Only that it was yours.',
        when: decayedName,
      },
      {
        text: 'You go looking for last week — the clinic soap, the weight of a caulk gun — and it comes back worn thin in the middle.',
        when: decayedEcho,
      },
    ],
  },
  choices: [{ id: 'let-the-morning-come', label: 'Let the morning come.', goto: 'd12-morning' }],
});

export const DAY11_SCENES: readonly Scene[] = [
  morning,
  albums,
  albums2,
  counter,
  counter2,
  evening,
  warning,
  warning2,
  night,
];
