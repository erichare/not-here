/**
 * DAY 15 — the lullaby (design/act2-beats.md §Day 15).
 *
 * Day: Dianne, per staging. Defended: supper at the house — unless
 * 'dianne:locks-house', in which case she brings it to the Kettle's back
 * table (the house stays hers at night now; never explained). Exiled: she
 * comes down to the wharf at dusk with a dish and her coat wrong for the
 * wind, ashamed of the town and unable to say so — the dish is the apology.
 * 'today:fed' is set on EVERY variant (supper onEnter).
 *
 * NIGHT 15 — THE HARVEST (set piece, small). Over the washing-up (or the
 * dish, on the wharf boards) Dianne hums bars 1–2 (cue dianne-theme,
 * lullaby layer up on entry). She catches herself, doesn't stop, offers it
 * the way the quilt was offered: "You remember this one, hon."
 *   take  → ECHO +2; facts 'private:lullaby-taken' about dianne + paired
 *           'private:memory-taken' about dianne; flag 'lullaby-taken';
 *           music.layer 'lullaby' → gain 0 in d15-night-2, whose prose
 *           carries the visual twin (the missing-stair paragraph).
 *   refuse→ UNDERTOW +1; flag 'd15:refused' (day-local); she finishes it
 *           alone, and for four bars the kitchen is seven years ago and
 *           nobody in it is dead. Two Wrens stays open.
 *
 * Night close: NIGHT_DECAY (act2-shared); cue branches on the track. Note:
 * 'today:fed' is guaranteed on Day 15, so the stopped-track decay resolves
 * to 'none' tonight — the tells below are carried for lint parity and for
 * saves that arrive by paths the act doesn't predict.
 *
 * pt2-fix-04: the supper prose no longer writes a tracked refuser eating.
 * 'refused-first-meal' with FLESH still at base gates the variant where the
 * dish sits and Dianne watches what the not-eating means instead. The
 * 'today:fed' flag stays set on EVERY variant BY DESIGN — a meal cooked for
 * you is the offset, eaten or not, and Night 15's decay must resolve 'none'
 * under the harvest.
 * pt2-fix-05: the no-quilt fallback names the bargain's edge before the
 * take/refuse choice — worth AND erasure, one clause, at the brink.
 *
 * Flags owned here: 'd15:refused'. Act-owned state touched: 'today:fed',
 * 'lullaby-taken'. Facts: 'private:lullaby-taken', 'private:memory-taken'.
 * Prose invariants per design/game-bible.md §Prose grammar.
 */

import { defineScene, type Cond, type Scene } from '@not-here/engine';
import {
  NIGHT_DECAY,
  decayedEcho,
  decayedFlesh,
  decayedName,
  defendedVerdict,
  exiledVerdict,
  hornOn,
  hornStopped,
  knowsTruth,
  locksHouse,
  lullabyTaken,
} from './act2-shared.ts';

const tookQuilt = { op: 'fact.exists', tag: 'private:memory-taken' } as const;
/** The quilt was only ever offered in d3-room — the callbacks gate on it. */
const quiltOffered = { op: 'flag', key: 'd3:slot', value: 'room' } as const;
const quiltRefused = { op: 'flag', key: 'd3:left-quilt' } as const;

// pt2-fix-04: the run-long refusal the game tracks (night1's fact, day19's
// read-back) — still unbroken while FLESH has never been fed above base.
const trackedRefuser: Cond = {
  op: 'all',
  of: [
    { op: 'fact.exists', tag: 'refused-first-meal' },
    { op: 'not', of: { op: 'stat.gte', stat: 'flesh', value: 4 } },
  ],
};
const notTrackedRefuser: Cond = { op: 'not', of: trackedRefuser };

const morning = defineScene({
  id: 'd15-morning',
  slot: 'morning',
  onEnter: [{ op: 'time.set', day: 15, slot: 'morning' }],
  prose: {
    kind: 'inline',
    paragraphs: [
      {
        text: 'The fog has moved in to stay. It has stopped being weather and started being the room the town lives in.',
      },
      {
        text: 'Word comes with the coffee, the way word does here: supper, up at the house, six o’clock, no argument entertained. Dianne has told Barb, who tells you, so the town is witness and the invitation can’t be mislaid.',
        when: { op: 'all', of: [defendedVerdict, { op: 'not', of: locksHouse }] },
      },
      {
        text: '“Back table, six o’clock,” Barb relays, wiping nothing. “She’s bringing it down herself.” No mention of the house. Nobody mentions the house.',
        when: { op: 'all', of: [defendedVerdict, locksHouse] },
      },
      {
        text: 'No word comes down the hill all day, which is its own kind of word. You mend the morning into the afternoon with wharf work that doesn’t need you, and the fog keeps the town from having to watch itself not look.',
        when: exiledVerdict,
      },
    ],
  },
  choices: [
    { id: 'let-evening-come', label: 'Let the day go by until evening.', goto: 'd15-supper' },
  ],
});

const supper = defineScene({
  id: 'd15-supper',
  slot: 'evening',
  onEnter: [
    { op: 'time.set', slot: 'evening' },
    { op: 'flag.set', key: 'today:fed', value: true },
  ],
  prose: {
    kind: 'inline',
    paragraphs: [
      {
        text: 'The house above the General is warm to the street. Supper is roast and potatoes and the gravy she is famous for two doors in either direction. She serves you first and eats standing, the way she has always fed the people she means to keep.',
        when: { op: 'all', of: [defendedVerdict, { op: 'not', of: locksHouse }] },
      },
      {
        text: 'The Kettle’s back table, six o’clock, a casserole under a bath towel, still oven-hot. Dianne unpacks it like a picnic in the wrong season, apologizing to the food for the journey. Barb clears the neighbouring table of nobody and stands guard over the emptiness with a coffee pot.',
        when: { op: 'all', of: [defendedVerdict, locksHouse] },
      },
      {
        text: 'At dusk she comes down the wharf with a covered dish and her coat wrong for the wind — the good coat, the town coat, no coat for boards and spray. She sets the dish on the piling head and steps back from it. The dish is the whole speech. She stays while you eat, facing the water, and can’t say the thing, and doesn’t, and stays anyway.',
        when: { op: 'all', of: [exiledVerdict, notTrackedRefuser] },
      },
      // ——— pt2-fix-04: the refuser's dish. She watches what the not-eating
      // means; the plate is not made to move. 'today:fed' holds regardless.
      {
        text: 'At dusk she comes down the wharf with a covered dish and her coat wrong for the wind — the good coat, the town coat, no coat for boards and spray. She sets the dish on the piling head and steps back from it. The dish is the whole speech. She stays, facing the water, and never once looks to see whether the lid has moved. She has learned what you do with what she cooks. She cooks anyway.',
        when: { op: 'all', of: [exiledVerdict, trackedRefuser] },
      },
      { text: '@line:dianne:supper-d15' },
      {
        text: 'The food does what food does. For the length of a plate the day has no verdicts in it, only salt and heat and her watching you eat with both hands around a cooling mug.',
        when: notTrackedRefuser,
      },
      {
        text: 'The dish does what dishes do around you now: sits, and steams itself out, and neither of you says the word for that. She keeps both hands around the cooling mug and watches the not-eating the way she watches the lake in November — a thing she has decided to live beside without naming it.',
        when: trackedRefuser,
      },
    ],
  },
  choices: [
    { id: 'stay-the-evening', label: 'Stay. Let the evening run its length.', goto: 'd15-night' },
  ],
});

// ——— NIGHT 15 — THE HARVEST. ———

const night = defineScene({
  id: 'd15-night',
  slot: 'night',
  onEnter: [
    { op: 'time.set', slot: 'night' },
    { op: 'emit', event: { kind: 'music.layer', pattern: 'lullaby', gain: 1 } },
  ],
  prose: {
    kind: 'inline',
    paragraphs: [
      {
        text: 'The washing-up is a two-person machine: she washes, you dry, the window over the sink giving back two women and a kitchen.',
        when: { op: 'all', of: [defendedVerdict, { op: 'not', of: locksHouse }] },
      },
      {
        text: 'The washing-up happens anyway, in miniature — the casserole dish, the Kettle’s back sink, Barb pretending not to lend it. Dianne washes; you dry; the window gives back the two of you and somebody’s kitchen.',
        when: { op: 'all', of: [defendedVerdict, locksHouse] },
      },
      {
        text: 'She gathers the dish and stands with it against her hip, not leaving. Fog on the water. The boards tick with cold.',
        when: exiledVerdict,
      },
      {
        text: 'Then, from nowhere the evening announced, she hums. Two bars — small, from the chest more than the mouth. The start of the tune. The part that rocks.',
      },
      {
        text: '“You always hummed the end different, you know,” she says, to the middle distance, easy as passing a plate. “Even here at the start of it — leaning already. Headed somewhere with it.” She isn’t asking anything. Not with words.',
      },
      {
        text: 'She catches herself doing it — and doesn’t stop. She turns it toward you instead, the way the quilt was turned: “You remember this one, hon.” The room leans in.',
        when: quiltOffered,
      },
      {
        text: 'She catches herself doing it — and doesn’t stop. She turns it toward you instead: “You remember this one, hon.” The room leans in.',
        when: { op: 'not', of: quiltOffered },
      },
      {
        text: 'You know this bargain now. It has clean edges: something becomes yours, and its first owner goes thin around the place it used to live.',
        when: tookQuilt,
      },
      {
        text: 'It is the fold of the quilt again — a story offered corner to corner. You left that one on her side of the fold. This one is smaller, and worth more.',
        when: quiltRefused,
      },
      // pt2-fix-05: the untutored route hears the terms before the choice.
      {
        text: 'Nothing has been offered to you like this before — a thing entirely hers, held out whole, corner to corner. The room knows what it is worth before you do, and knows the terms: say yes and the tune changes houses. It will live in you and only visit her, and the visits will get shorter.',
        when: {
          op: 'not',
          of: { op: 'any', of: [tookQuilt, quiltRefused] },
        },
      },
      {
        text: 'You know what the leaning is now. It is not memory being shared. It is the last of a daughter changing hands.',
        when: knowsTruth,
      },
    ],
  },
  choices: [
    {
      id: 'take-it',
      label: '“I remember.”',
      stakes: 'major',
      effects: [
        { op: 'stat.add', stat: 'echo', value: 2 },
        {
          op: 'fact.add',
          tag: 'private:lullaby-taken',
          about: 'dianne',
          witnessedBy: ['dianne'],
        },
        {
          op: 'fact.add',
          tag: 'private:memory-taken',
          about: 'dianne',
          witnessedBy: ['dianne'],
        },
        { op: 'flag.set', key: 'lullaby-taken', value: true },
      ],
      goto: 'd15-night-2',
    },
    {
      id: 'refuse-it',
      label: '“Hum it again. I like hearing it be yours.”',
      stakes: 'major',
      effects: [
        { op: 'stat.add', stat: 'undertow', value: 1 },
        { op: 'flag.set', key: 'd15:refused', value: true },
      ],
      goto: 'd15-night-2',
    },
  ],
  cue: 'dianne-theme',
});

const night2 = defineScene({
  id: 'd15-night-2',
  slot: 'night',
  onEnter: [
    {
      op: 'when',
      cond: lullabyTaken,
      then: [{ op: 'emit', event: { kind: 'music.layer', pattern: 'lullaby', gain: 0 } }],
    },
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
        text: 'The two bars come away clean, roots and all. You could hum them now in her mother’s key. Dianne carries the tune on — and the next phrase isn’t there. She goes around it, the way you go around a missing stair, and doesn’t notice, and comes down safe on the far side of a hole exactly the size of what she gave you.',
        when: lullabyTaken,
      },
      {
        text: 'She has given you the last of the private ones. There is nothing of hers left to take that she would feel going. Goodnight lands warm and ordinary.',
        when: lullabyTaken,
      },
      {
        text: 'She hums it again, all of it, to where it stops being hers and never got further. You keep your mouth closed and your face open, and for four bars the kitchen is seven years ago and nobody in it is dead.',
        when: { op: 'all', of: [{ op: 'flag', key: 'd15:refused' }, { op: 'not', of: exiledVerdict }] },
      },
      {
        text: 'She hums it again, all of it, to where it stops being hers and never got further. You keep your mouth closed and your face open, and for four bars the wharf is a kitchen seven years ago and nobody in it is dead.',
        when: { op: 'all', of: [{ op: 'flag', key: 'd15:refused' }, exiledVerdict] },
      },
      {
        text: 'At 3:12 the horn sends its five bars out over the water. You listen to the first two the whole way through, and the listening isn’t neutral anymore.',
        when: hornOn,
      },
      {
        text: 'The fog stands at the glass. Whatever was hummed tonight is the only music the Bay got, and the night spends the rest of itself remembering it.',
        when: hornStopped,
      },
      {
        text: 'You turn once in the night and the blankets lie a beat late, the way water closes over a smaller stone.',
        when: decayedFlesh,
      },
      {
        text: 'The receipt in your coat pocket has gone pale at the edges, the ink giving the paper back.',
        when: decayedName,
      },
      {
        text: 'A story you were keeping for the dark has a room missing from the middle of it now. You walk around the gap twice, and give up, and sleep.',
        when: decayedEcho,
      },
    ],
  },
  choices: [
    { id: 'let-the-sixteenth-come', label: 'Let the morning come.', goto: 'd16-morning' },
  ],
});

export const DAY15_SCENES: readonly Scene[] = [morning, supper, night, night2];
