/**
 * DAY 14 — the notebook comes to you (design/act2-beats.md §Day 14).
 *
 * Morning: aftermath temperature per potluck verdict (defended: the town
 * overwarm, overcorrecting, feeding you — the ease should feel like what it
 * is; exiled: the wharf morning, the thermos on the piling, the walk up
 * through a town that watches, and Barb serving you like nothing happened —
 * the kindest lie in the act). Fixed afternoon, both stagings: PRIYA COMES
 * TO YOU (clinic manner, house call). The engine-tracked interrogation,
 * deterministic tree — she reads your own Day-3 words back (conditional on
 * 'lied-at-intake' / 'intake-honest-wrist', see scenes/day3.ts):
 *   repeat word-perfect  → fact 'truth-told' witnessed by priya
 *   improve on it        → fact 'contradiction' witnessed by priya (red pen)
 *   reach for the quilt  → offered ONLY if 'private:memory-taken' exists;
 *                          fact 'fog-priya-caught-seam' (fear via fog-* rule)
 * The Day-9 room answer inflects the scene (per the beat sheet's
 * parenthetical): 'improved' earns a second read-back — the green paint
 * set against the Hendersons' paper; 'honest' softens the word-perfect
 * close ("Yours holds."). Exit line per the beat sheet, at the door, not
 * unkind.
 *
 * Press opportunity #4 lives on the DEFENDED track only (Dianne at the
 * store, wrapping the potluck dishes): increments 'pressed-dianne' 0→3;
 * the press that makes it 3 also sets 'dianne:locks-house'. The game never
 * remarks on the locking.
 *
 * Night 14: NIGHT_DECAY (act2-shared, never re-authored); cue branches on
 * the track — foghorn-312 on horn-on, music.stop and no cue on horn-stopped;
 * one gated diegetic decay tell per stat, fresh tonight.
 *
 * Flags owned here: 'd14:answer', 'd14:pressed'. Act-owned state touched:
 * 'today:fed', 'pressed-dianne', 'dianne:locks-house'. Facts: 'truth-told',
 * 'contradiction', 'fog-priya-caught-seam', 'helped-wrap-dishes'.
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
} from './act2-shared.ts';

const liedAtIntake: Cond = { op: 'fact.exists', tag: 'lied-at-intake' };
const honestWrist: Cond = { op: 'fact.exists', tag: 'intake-honest-wrist' };
const noIntakeRecord: Cond = {
  op: 'not',
  of: { op: 'any', of: [liedAtIntake, honestWrist] },
};
const tookQuilt: Cond = { op: 'fact.exists', tag: 'private:memory-taken' };
// The Day-9 room answer — she took it herself, and the notebook kept it.
const improvedRoom: Cond = { op: 'flag', key: 'd9:room-answer', value: 'improved' };
const honestRoom: Cond = { op: 'flag', key: 'd9:room-answer', value: 'honest' };

const morning = defineScene({
  id: 'd14-morning',
  slot: 'morning',
  onEnter: [{ op: 'time.set', day: 14, slot: 'morning' }],
  prose: {
    kind: 'inline',
    paragraphs: [
      {
        text: 'The morning after the hall comes up white and windless, the fog down to the fence lines, the town awake early and being careful with itself.',
      },
      {
        text: 'There is a loaf on the step of your unit under a tea towel, warm at the middle. No note. Somebody’s oven was lit before light.',
        when: defendedVerdict,
      },
      {
        text: 'All morning the Kettle overcorrects. Coffee lands before the cup empties; the good jam is out; two orchard men nod on the way past, deliberate, like men paying an instalment. The ease has a taste. It is the taste of a town agreeing very hard with itself.',
        when: defendedVerdict,
      },
      {
        text: 'Sam’s stool stays empty through the rush. Nobody puts a coat on it.',
        when: defendedVerdict,
      },
      {
        text: 'You wake in the ticket office with the stove down to coals. Out on the piling, before first light, somebody has stood a thermos. Still warm. No note, and no boot prints the frost will own to.',
        when: exiledVerdict,
      },
      {
        text: 'The walk up for coffee is the day’s whole errand. Doors along the front street find reasons to be half-open as you pass, and close, satisfied, after. Nobody looks at you straight on. The looking happens anyway.',
        when: exiledVerdict,
      },
      { text: '@line:barb:greeting-d14' },
      {
        text: 'Food keeps arriving at your elbow in the small ways the Bay has: a plate, a top-up, the heel of something still proving its warmth through the paper.',
      },
    ],
  },
  choices: [
    {
      id: 'take-what-is-given',
      label: 'Eat what’s put in front of you, all of it.',
      effects: [
        { op: 'flag.set', key: 'today:fed', value: true },
        { op: 'stat.add', stat: 'flesh', value: 1 },
      ],
      goto: 'd14-priya',
    },
    {
      id: 'leave-it',
      label: 'Leave it kindly, and go light.',
      effects: [{ op: 'stat.add', stat: 'undertow', value: 1 }],
      goto: 'd14-priya',
    },
  ],
});

// ——— The fixed scene, both stagings: Priya comes to you. ———

const priya = defineScene({
  id: 'd14-priya',
  slot: 'afternoon',
  onEnter: [{ op: 'time.set', slot: 'afternoon' }],
  prose: {
    kind: 'inline',
    paragraphs: [
      {
        text: 'She finds you at the corner table with the light going flat outside — clinic bag over her shoulder, coat still done up. She doesn’t sit until you look at the other chair, and then she sits the way she does everything: as if a record were being kept, because one is.',
        when: defendedVerdict,
      },
      {
        text: 'She comes down the wharf at the hour the light goes flat, clinic bag over her shoulder, and stops at the ticket-office doorway, exactly outside it. “I won’t come in,” she says, which is her way of asking. You stand in the doorway, and the cold divides itself between you.',
        when: exiledVerdict,
      },
      {
        text: 'The notebook comes out of the bag already open to the page. She has marked her place with a strip of gauze.',
      },
      {
        text: 'She reads, level, the quotation marks audible: “‘When the rain’s coming. You know how it is.’ That’s you. Day three, on the wrist.” She looks up. “Eleven days. Tell it to me again.”',
        when: liedAtIntake,
      },
      {
        text: 'She reads, level, the quotation marks audible: “‘It doesn’t ache. Should it?’ That’s you. Day three, on the wrist.” She looks up, and something sits underneath the level this time. “Eleven days. Tell it to me again.”',
        when: honestWrist,
      },
      {
        text: 'She reads from the page, level: the clinic hours you never kept, the note she left under a door, an intake taken standing up in a hall. “You’ve never actually told me about the wrist,” she says. “Tell it to me now.”',
        when: noIntakeRecord,
      },
      {
        text: '“And the paint,” she says, a page earlier in the book, citing more than reading. “‘Green in here, before it was yours.’ The Hendersons papered that room the year they built the manse. There is no green under the paper. I looked.” She lets it sit beside the wrist — two entries, one hand.',
        when: improvedRoom,
      },
      {
        text: 'She has been right since the wrist. You know that now, watching her wait to be wrong.',
        when: knowsTruth,
      },
    ],
  },
  choices: [
    {
      id: 'repeat-word-perfect-lie',
      label: '“When the rain’s coming. You know how it is.” Word for word, weather and all.',
      stakes: 'major',
      when: liedAtIntake,
      effects: [
        { op: 'flag.set', key: 'd14:answer', value: 'repeat' },
        { op: 'fact.add', tag: 'truth-told', witnessedBy: ['priya'] },
      ],
      goto: 'd14-priya-2',
    },
    {
      id: 'repeat-word-perfect-honest',
      label: '“It doesn’t ache. Should it?” The same words. It still doesn’t.',
      stakes: 'major',
      when: honestWrist,
      effects: [
        { op: 'flag.set', key: 'd14:answer', value: 'repeat' },
        { op: 'fact.add', tag: 'truth-told', witnessedBy: ['priya'] },
      ],
      goto: 'd14-priya-2',
    },
    {
      id: 'hold-the-record',
      label: 'Give her exactly what the page already holds. Nothing added.',
      stakes: 'major',
      when: noIntakeRecord,
      effects: [
        { op: 'flag.set', key: 'd14:answer', value: 'repeat' },
        { op: 'fact.add', tag: 'truth-told', witnessedBy: ['priya'] },
      ],
      goto: 'd14-priya-2',
    },
    {
      id: 'improve-on-it',
      label: 'Tell it better — rounder, warmer, the way it should have been said.',
      stakes: 'major',
      effects: [
        { op: 'flag.set', key: 'd14:answer', value: 'improved' },
        { op: 'fact.add', tag: 'contradiction', witnessedBy: ['priya'] },
      ],
      goto: 'd14-priya-2',
    },
    {
      id: 'reach-for-the-quilt',
      label: 'Give her the quilt winter — the frozen lake, the dresses, the thimble.',
      stakes: 'major',
      when: tookQuilt,
      effects: [
        { op: 'flag.set', key: 'd14:answer', value: 'quilt' },
        {
          op: 'fact.add',
          tag: 'fog-priya-caught-seam',
          about: 'priya',
          witnessedBy: ['priya'],
        },
      ],
      goto: 'd14-priya-2',
    },
  ],
  cue: 'priya-theme',
});

const priya2 = defineScene({
  id: 'd14-priya-2',
  slot: 'afternoon',
  prose: {
    kind: 'inline',
    paragraphs: [
      {
        text: 'She listens the way other people aim. When you finish she sits a moment, then closes the notebook — a page early; you see the unused lines go under the cover. “Consistency is all I ever ask of anyone,” she says. It is not warm. It is the exact temperature of fair.',
        when: { op: 'flag', key: 'd14:answer', value: 'repeat' },
      },
      {
        text: 'Her thumb finds the page with the room answer on it, and lets it lie. “Twice, now,” she says. “Most charts argue with themselves inside a week. Yours holds.”',
        when: {
          op: 'all',
          of: [{ op: 'flag', key: 'd14:answer', value: 'repeat' }, honestRoom],
        },
      },
      {
        text: 'The red pen comes out of the bag slowly, the way you’d show a dog the leash. She circles one line, twice, without hurry. “That’s better than what you said. That’s the problem with it.” She writes on after you’ve stopped talking. The circle dries darker than the ink around it.',
        when: { op: 'flag', key: 'd14:answer', value: 'improved' },
      },
      {
        text: 'She goes still before you’re through the frozen lake. You feel the seam give — the story arriving from the wrong side of you — and she watches it arrive. “You weren’t there for that. Dianne was. So how do you carry it?”',
        when: { op: 'flag', key: 'd14:answer', value: 'quilt' },
      },
      {
        text: 'The pen waits a long time. Then it writes — longer than anything you said, on a fresh page, in a different part of the book. Two weeks of who you aren’t. This page is the first about what you might be.',
        when: { op: 'flag', key: 'd14:answer', value: 'quilt' },
      },
      {
        text: 'At the door she stops, bag settled on her shoulder. “I’m not trying to catch you. I’m trying to be wrong.” She leaves without waiting to see what your face does with it.',
      },
    ],
  },
  choices: [
    {
      id: 'to-the-store',
      label: 'Walk up to the General before it closes.',
      when: defendedVerdict,
      goto: 'd14-store',
    },
    {
      id: 'let-the-day-go',
      label: 'Let the rest of the afternoon go by itself.',
      goto: 'd14-evening',
    },
  ],
});

// ——— Defended track only: the store, and press opportunity #4. ———

const store = defineScene({
  id: 'd14-store',
  slot: 'afternoon',
  prose: {
    kind: 'inline',
    paragraphs: [
      {
        text: 'The General smells of cardboard and cold air. The potluck dishes stand ranked on the counter, washed, each with its name-tape smoothed back down, and Dianne is wrapping them in newspaper for the walk home each one has coming. “Hold the tape, love,” she says, and you hold the tape.',
      },
      {
        text: 'The work is small and exact, and she is glad of your hands in it, and says so by saying nothing at all.',
      },
    ],
  },
  choices: [
    {
      id: 'press-what-sam-meant',
      label: '“What did Sam mean? At the hall.”',
      stakes: 'major',
      effects: [
        { op: 'flag.set', key: 'd14:pressed', value: true },
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
      ],
      goto: 'd14-store-2',
    },
    {
      id: 'keep-wrapping',
      label: 'Keep wrapping. Leave the hall where it is.',
      effects: [{ op: 'fact.add', tag: 'helped-wrap-dishes', witnessedBy: ['dianne'] }],
      goto: 'd14-store-2',
    },
  ],
});

const store2 = defineScene({
  id: 'd14-store-2',
  slot: 'afternoon',
  prose: {
    kind: 'inline',
    paragraphs: [
      {
        text: 'The tape gun stops. “He meant he misses her,” Dianne says, to the dish in her hands, and wraps it twice more than it needs. “Grief’s got no manners at his age. It’ll settle.” Then the smile comes up, whole and pleasant and closed, and she asks if you’d pass the string.',
        when: { op: 'flag', key: 'd14:pressed' },
      },
      {
        text: 'The dishes get done, a paper skin each. Dianne stacks them by household, north end first, and reads the stack like a street she can walk down blind. “There,” she says. “A town’s worth.” She sends you off with the heel of somebody’s loaf, for the road.',
        when: { op: 'not', of: { op: 'flag', key: 'd14:pressed' } },
      },
    ],
  },
  choices: [
    { id: 'down-the-hill', label: 'Down the hill before the light goes.', goto: 'd14-evening' },
  ],
});

// ——— Evening, per staging. ———

const evening = defineScene({
  id: 'd14-evening',
  slot: 'evening',
  onEnter: [
    { op: 'time.set', slot: 'evening' },
    {
      op: 'when',
      cond: defendedVerdict,
      then: [{ op: 'emit', event: { kind: 'music.cue', cue: 'pub-warm' } }],
    },
  ],
  prose: {
    kind: 'inline',
    paragraphs: [
      {
        text: 'Supper at the Kettle is a crowded, gentle machine tonight. Plates arrive that weren’t ordered. The crib game keeps stalling because the players keep finding somewhere else to look, and it is mostly at you, and it is mostly kind.',
        when: defendedVerdict,
      },
      {
        text: 'Sam’s dish from the hall sits wrapped behind the counter where Barb put it, going home with nobody.',
        when: defendedVerdict,
      },
      {
        text: 'You take the evening at the wharf end of things. Up the hill the Kettle’s windows go through their hours without you. The fog comes in on schedule and sits down on the water like a regular.',
        when: exiledVerdict,
      },
      {
        text: 'Late, boots on the boards: Wade, passing with the breakwater lantern, not stopping. By the door, where you find them after, a filled thermos and a dry pair of work gloves, and no word attached to either.',
        when: exiledVerdict,
      },
      {
        text: 'The fog takes the hill first, then the street, then the idea of the street.',
      },
    ],
  },
  choices: [{ id: 'turn-in', label: 'Turn in.', goto: 'd14-night' }],
});

// ——— Night 14: the canonical decay block; cue branches on the track. ———

const night = defineScene({
  id: 'd14-night',
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
        text: 'At 3:12 the horn takes its five bars out over the water. It reaches you where you lie, and something in you sits up to be fed, and you let it. Up the shore a man is paying for this. You keep the warmth anyway.',
        when: hornOn,
      },
      {
        text: 'At 3:12 nothing happens, on schedule. The silence has learned the melody’s length; it fills exactly that shape, and waits with you inside it.',
        when: hornStopped,
      },
      {
        text: 'The blankets come down over less than they covered yesterday, and finish flat sooner than they should.',
        when: decayedFlesh,
      },
      {
        text: 'Somewhere in a closed book across the lot, a line about yesterday is letting go of its ink. You sleep already knowing which one.',
        when: decayedName,
      },
      {
        text: 'You go looking for the smell of the hall wax to fall asleep inside, and the corridor to it is shorter than it was, and ends sooner.',
        when: decayedEcho,
      },
    ],
  },
  choices: [
    { id: 'let-the-fifteenth-come', label: 'Let the fifteenth come.', goto: 'd15-morning' },
  ],
});

export const DAY14_SCENES: readonly Scene[] = [
  morning,
  priya,
  priya2,
  store,
  store2,
  evening,
  night,
];
