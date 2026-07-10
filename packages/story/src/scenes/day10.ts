/**
 * DAY 10 — the ash tin (design/act2-beats.md §Day 10).
 *
 * Three-way morning hub, Barb naming the slots over coffee (no menu
 * language): A — Dianne's house (the woodstove; the tobacco tin gone matte
 * with heat; the marked choice that opens it while she's at the woodpile:
 * ash packed to felt and one unburned corner, blue ballpoint — the goodbye
 * note existed, undatable, devastating only in hindsight; taking the corner
 * is not offered; press opportunity #2 if you ask what she burns in
 * November). B — the hall (committee morning; the dish-list @doc with the
 * blank beside the casserole; the today:named path lands that EVENING when
 * Barb inks the blank herself, double-inked — the NAME column ache made
 * small and domestic). C — Sam's shed (he logs YOUR days now; the exercise
 * book, the forty-three minutes at the wharf).
 *
 * Evening: without-you retellings for both missed slots (spike-fomo rules;
 * each motif surfaces faint and detuned, its visual twin IN THE PROSE of
 * the same scene). Night 10: the canonical decay block (act2-shared
 * NIGHT_DECAY — never re-authored here); foghorn-312 only on horn-on
 * nights via a conditional emit; horn-stopped nights emit music.stop so
 * nothing loops under the silence.
 *
 * Flags this file owns (day-local): 'd10:slot' ('house'|'hall'|'shed'),
 * 'd10:opened-tin', 'd10:dish-blank', 'd10:inked-blank'. Contract flags
 * touched: 'pressed-dianne' (defensive when-chain on exact values; the
 * press that makes 3 also sets 'dianne:locks-house'), 'today:fed',
 * 'today:named' (offsets). Facts (cluster-local, day-suffixed):
 * went-to-house-d10 / went-to-hall-d10 / went-to-shed-d10 (barb),
 * visited-dianne-d10, sat-dianne-stove-d10, pressed-dianne-d10 (dianne),
 * helped-hall-d10, asked-whose-casserole (priya), visited-shed-d10,
 * told-sam-log-fair, asked-sam-log (sam), barb-inked-the-blank (barb).
 *
 * Prose invariants per design/game-bible.md §Prose grammar: nobody touches
 * you first; Dianne says only 'love' / 'hon' / 'my girl'; Moose fails to
 * register you; the town narrates around the wrongness, never at it.
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
  locksHouse,
} from './act2-shared.ts';

const wentHouse: Cond = { op: 'flag', key: 'd10:slot', value: 'house' };
const wentHall: Cond = { op: 'flag', key: 'd10:slot', value: 'hall' };
const wentShed: Cond = { op: 'flag', key: 'd10:slot', value: 'shed' };
const missedHouse: Cond = { op: 'not', of: wentHouse };
const missedHall: Cond = { op: 'not', of: wentHall };
const missedShed: Cond = { op: 'not', of: wentShed };
const openedTin: Cond = { op: 'flag', key: 'd10:opened-tin' };
const sawDishBlank: Cond = { op: 'flag', key: 'd10:dish-blank' };
const toldSamDontKnow: Cond = { op: 'fact.exists', tag: 'told-sam-dont-know' };

/**
 * The Contract's press counter, incremented defensively on exact values.
 * Whichever press takes it to 3 also locks the house — after that the
 * knock beats hold and unannounced entries disappear, and the game never
 * remarks on any of it.
 */
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
  id: 'd10-morning',
  slot: 'morning',
  onEnter: [{ op: 'time.set', day: 10, slot: 'morning' }],
  prose: {
    kind: 'inline',
    paragraphs: [
      {
        text: 'The tenth morning smells of woodsmoke for the first time — one chimney, up the hill, working out its draw. The snowline has taken the top rail of the orchard fence. Coffee arrives before you do.',
      },
      {
        text: '“Dianne’s laid the first house fire of the year,” Barb says, counting the float. “She’s asked would you stop up. Wood wants carrying, and she won’t say so twice.”',
      },
      {
        text: '“Hall’s got its committee morning — the dish list goes up today, and the doctor’s down there pinning it. And Sam’s light was burning past two again.” She sets the pot back on the ring. “That’s the morning. It won’t seat all three.”',
      },
    ],
  },
  choices: [
    {
      id: 'go-up-to-the-house',
      label: 'Go up to Dianne’s.',
      effects: [
        { op: 'flag.set', key: 'd10:slot', value: 'house' },
        { op: 'fact.add', tag: 'went-to-house-d10', witnessedBy: ['barb'] },
      ],
      goto: 'd10-house',
    },
    {
      id: 'go-to-the-hall',
      label: 'Go down to the hall.',
      effects: [
        { op: 'flag.set', key: 'd10:slot', value: 'hall' },
        { op: 'fact.add', tag: 'went-to-hall-d10', witnessedBy: ['barb'] },
      ],
      goto: 'd10-hall',
    },
    {
      id: 'go-to-the-shed',
      label: 'Look in on the boat shed.',
      effects: [
        { op: 'flag.set', key: 'd10:slot', value: 'shed' },
        { op: 'fact.add', tag: 'went-to-shed-d10', witnessedBy: ['barb'] },
      ],
      goto: 'd10-shed',
    },
  ],
});

// ——— A. Dianne's house: the stove, and the tin ———

const house = defineScene({
  id: 'd10-house',
  slot: 'morning',
  onEnter: [{ op: 'fact.add', tag: 'visited-dianne-d10', witnessedBy: ['dianne'] }],
  prose: {
    kind: 'inline',
    paragraphs: [
      {
        text: 'The house door is on the latch, the way it has been all week. “In the kitchen, love,” comes down the hall before your knuckles reach the wood.',
        when: { op: 'not', of: locksHouse },
      },
      {
        text: 'The house door doesn’t give. You knock, and wait, and somewhere inside a bolt travels — a small sound the door has not made before — and then Dianne is in the gap with the kitchen warm behind her. “There’s my girl. In you come.”',
        when: locksHouse,
      },
      {
        text: 'The woodstove has the kitchen by both shoulders. Kettle on the back ring, a pot working at the front, the window steamed to lace. On the shelf above the stove, among the matches and the jar lids, a tobacco tin gone matte with heat — its paint fired off some winter long enough ago that the bare metal has its own colour now.',
      },
      {
        text: '“Stove eats like a teenager in this cold,” Dianne says, and lifts the wood sling off its nail, and goes out to the pile. The kitchen is yours and the fire’s. Out in the yard, the woodpile starts its slow count.',
      },
    ],
  },
  choices: [
    {
      id: 'open-the-tin',
      label: 'Take the tin down.',
      stakes: 'major',
      effects: [{ op: 'flag.set', key: 'd10:opened-tin', value: true }],
      goto: 'd10-house-tin',
    },
    {
      id: 'keep-to-the-stove',
      label: 'Keep to the stove till she’s back.',
      goto: 'd10-house-2',
    },
  ],
  cue: 'dianne-theme',
});

const houseTin = defineScene({
  id: 'd10-house-tin',
  slot: 'morning',
  prose: {
    kind: 'inline',
    paragraphs: [
      {
        text: 'The lid comes off with the sound of a jar giving up. Inside: ash. Not loose — packed, felted, the way paper ash packs when it has been rained on and dried and left. It has been ash a long time. The tin has been on that shelf longer.',
      },
      {
        text: 'Down one side, where the fire didn’t finish, a corner of lined paper survives. Blue ballpoint, pressed hard, four words’ worth of somebody’s hand:',
      },
      {
        text: '@doc:\n\n        —n’t look for me.',
      },
      {
        text: 'There is nothing else in the tin. The corner stays where the ash holds it. Out in the yard, the woodpile keeps its rhythm.',
      },
    ],
  },
  choices: [{ id: 'put-the-lid-back', label: 'Put the lid back.', goto: 'd10-house-2' }],
});

const house2 = defineScene({
  id: 'd10-house-2',
  slot: 'morning',
  prose: {
    kind: 'inline',
    paragraphs: [
      {
        text: 'She comes back with the sling loaded and stacks the splits by feel, talking the whole time about the potluck and the price of pastry margarine. Soup finds the front ring. She ladles yours first, the thick of it, and stands the thin end of the pot aside for herself.',
      },
      {
        text: 'Steam climbs past the shelf. The tin takes the shine of it and gives nothing back.',
        when: openedTin,
      },
    ],
  },
  choices: [
    {
      id: 'ask-what-she-burns',
      label: '“What do you burn, Novembers?”',
      stakes: 'major',
      effects: [
        { op: 'fact.add', tag: 'pressed-dianne-d10', about: 'dianne', witnessedBy: ['dianne'] },
        ...PRESS_DIANNE,
      ],
      goto: 'd10-house-3',
    },
    {
      id: 'eat-what-she-puts-down',
      label: 'Eat what she puts in front of you.',
      effects: [
        { op: 'flag.set', key: 'today:fed', value: true },
        { op: 'stat.add', stat: 'flesh', value: 1 },
        { op: 'fact.add', tag: 'sat-dianne-stove-d10', witnessedBy: ['dianne'] },
      ],
      goto: 'd10-house-3',
    },
    {
      id: 'carry-the-wood-and-go',
      label: 'Carry the last sling in, and go while the going is easy.',
      effects: [{ op: 'stat.add', stat: 'undertow', value: 1 }],
      goto: 'd10-house-3',
    },
  ],
});

const house3 = defineScene({
  id: 'd10-house-3',
  slot: 'morning',
  prose: {
    kind: 'inline',
    paragraphs: [
      {
        text: '“Stove rubbish,” she says, pleasant as the steam. “Old paper. A house makes paper all year — November’s when I get ahead of it. Cardboard won’t take at the front, you have to feed it in behind.” She stirs the pot the number of times a pot gets stirred, and tops your bowl without being asked.',
        when: { op: 'fact.knownBy', who: 'dianne', tag: 'pressed-dianne-d10' },
      },
      {
        text: 'The soup is barley and yesterday’s chicken, and it takes the morning with it. She watches you eat the way weather watches a field. “There’s my girl,” she says, to the empty bowl, and washes it before you can reach the sink.',
        when: { op: 'fact.knownBy', who: 'dianne', tag: 'sat-dianne-stove-d10' },
      },
      {
        text: 'You bring the last of the wood in and stack it wrong, and she restacks it behind you without a word about either. The door finds its latch behind you. The soup goes on working at the front ring for one.',
        when: {
          op: 'not',
          of: {
            op: 'any',
            of: [
              { op: 'fact.exists', tag: 'pressed-dianne-d10' },
              { op: 'fact.exists', tag: 'sat-dianne-stove-d10' },
            ],
          },
        },
      },
      {
        text: 'The fog takes the road back down a fence-post at a time. Behind you the chimney keeps its one job going.',
      },
    ],
  },
  choices: [
    { id: 'down-to-the-kettle', label: 'Down to the Kettle before the light goes.', goto: 'd10-evening' },
  ],
});

// ——— B. The hall: the dish list, and the blank ———

const hall = defineScene({
  id: 'd10-hall',
  slot: 'morning',
  onEnter: [{ op: 'flag.set', key: 'd10:dish-blank', value: true }],
  prose: {
    kind: 'inline',
    paragraphs: [
      {
        text: 'The hall has its committee morning: urns counted, the floor chalked where the tables will go, borrowed cutlery clicking into rolls. Priya pins a ruled sheet to the noticeboard and squares it to the frame like a chart going up.',
      },
      {
        text: '@doc:\n┌────────────────────────────────┐\n│  POTLUCK — NOV 18              │\n│                                │\n│  DISH               NAME       │\n│  scalloped spuds    M. Yee     │\n│  buns               the Kettle │\n│  casserole                     │\n│  pickles            E. Fenn    │\n│                                │\n└────────────────────────────────┘',
      },
      {
        text: 'Halfway down, someone has written casserole in the dish column, and the space beside it is open. Not skipped — left. The entries after it step around the gap without closing it, and the pen on its string hangs plumb underneath.',
      },
      {
        text: 'Priya reads the list once, top to bottom, and ticks nothing. Nobody asks whose casserole.',
      },
    ],
  },
  choices: [
    {
      id: 'set-chairs',
      label: 'Set chairs until the chalk lines are furniture.',
      effects: [{ op: 'fact.add', tag: 'helped-hall-d10', witnessedBy: ['priya'] }],
      goto: 'd10-hall-2',
    },
    {
      id: 'ask-whose-casserole',
      label: '“Who’s bringing the casserole?”',
      effects: [{ op: 'fact.add', tag: 'asked-whose-casserole', witnessedBy: ['priya'] }],
      goto: 'd10-hall-2',
    },
  ],
  cue: 'hall-upright',
});

const hall2 = defineScene({
  id: 'd10-hall-2',
  slot: 'morning',
  prose: {
    kind: 'inline',
    paragraphs: [
      {
        text: 'The chairs go out in ranks until the room stops being a floor plan. Priya counts them against her clipboard twice and lets the second count agree. By noon the hall is a room waiting for its reason.',
        when: { op: 'fact.knownBy', who: 'priya', tag: 'helped-hall-d10' },
      },
      {
        text: '“The list fills itself,” Priya says, not unkindly, eyes on the clipboard. “It always has.” Down the sheet the blank stays open, and the committee works around it the way you work around a wet floor.',
        when: { op: 'fact.knownBy', who: 'priya', tag: 'asked-whose-casserole' },
      },
      {
        text: 'The list gets one more name before lunch — pickles, spoken for twice now — and the sheet comes down off the board to make its rounds: the General tomorrow, the Kettle tonight for the buns column. The blank rides down the hill with it.',
      },
    ],
  },
  choices: [{ id: 'down-the-hill', label: 'Follow the afternoon down the hill.', goto: 'd10-evening' }],
});

// ——— C. Sam's shed: your days, in his columns ———

const shed = defineScene({
  id: 'd10-shed',
  slot: 'morning',
  onEnter: [{ op: 'fact.add', tag: 'visited-shed-d10', witnessedBy: ['sam'] }],
  prose: {
    kind: 'inline',
    paragraphs: [
      {
        text: 'The boat shed has become a room with a job. The lake map over the workbench, the three X’s, the column of printed screenshots — all where they were, but tended now, squared, current. The phone waits on its tripod, facing the door, and the door is you.',
      },
      {
        text: 'A school exercise book lies open on the bench, ruled into columns of his own. He adds today’s date to the map margin first, then turns to the book.',
      },
      {
        text: '@doc:\nNOV 12 — wharf. 03:06–03:49.\nNOV 13 — around. didn’t leave.\nNOV 14 — around.\nNOV 15 —',
      },
      {
        text: '“You were at the wharf forty-three minutes, night of the twelfth,” Sam says, conversational, like weather. He writes the fifteenth in while you stand inside it. He doesn’t hide the book and he doesn’t offer it.',
      },
      {
        text: '“You said you don’t know what you are,” he says, to the map. “This is me finding out. Figured you’d rather know it’s happening.”',
        when: toldSamDontKnow,
      },
      {
        text: 'He waits, pen up, the way the phone on the tripod waits.',
        when: { op: 'not', of: toldSamDontKnow },
      },
    ],
  },
  choices: [
    {
      id: 'say-its-fair',
      label: '“It’s fair. Keep the columns.”',
      effects: [
        { op: 'stat.add', stat: 'undertow', value: 1 },
        { op: 'fact.add', tag: 'told-sam-log-fair', witnessedBy: ['sam'] },
      ],
      goto: 'd10-shed-2',
    },
    {
      id: 'ask-what-the-book-gets',
      label: '“What does the book get you?”',
      effects: [{ op: 'fact.add', tag: 'asked-sam-log', witnessedBy: ['sam'] }],
      goto: 'd10-shed-2',
    },
    {
      id: 'go-without-a-word',
      label: 'Go, and let the entry end where it ends.',
      effects: [{ op: 'flag.set', key: 'd10:left-shed', value: true }],
      goto: 'd10-shed-2',
    },
  ],
  cue: 'sam-theme',
});

const shed2 = defineScene({
  id: 'd10-shed-2',
  slot: 'morning',
  prose: {
    kind: 'inline',
    paragraphs: [
      {
        text: 'Something in his shoulders lets down a notch. “Columns don’t grieve,” he says. “That’s the whole point of them.” He writes one more word on the fifteenth and doesn’t angle the book away from you while he does it.',
        when: { op: 'fact.knownBy', who: 'sam', tag: 'told-sam-log-fair' },
      },
      {
        text: '“Everybody else keeps an account of you in their heads,” he says. “Heads edit.” He caps the pen. “Paper doesn’t.” He believes it the way you believe a railing.',
        when: { op: 'fact.knownBy', who: 'sam', tag: 'asked-sam-log' },
      },
      {
        text: 'The pen keeps its small noise going behind you the whole way to the door, and stops when the door does.',
        when: { op: 'flag', key: 'd10:left-shed' },
      },
      {
        text: 'Down the launch the lake holds its no-comment. The fog has the far shore and is coming over for the near one.',
      },
    ],
  },
  choices: [{ id: 'back-up-the-road', label: 'Back up the shore road.', goto: 'd10-evening' }],
});

// ——— Evening: retellings, and the blank comes down the hill ———

const evening = defineScene({
  id: 'd10-evening',
  slot: 'evening',
  onEnter: [
    { op: 'time.set', slot: 'evening' },
    { op: 'when', cond: missedHouse, then: [detune('dianne')] },
    { op: 'when', cond: missedHall, then: [detune('priya')] },
    { op: 'when', cond: missedShed, then: [detune('sam')] },
  ],
  prose: {
    kind: 'inline',
    paragraphs: [
      {
        text: 'The Kettle at supper: the crib board, two orchard crews, the windows sweated soft. Moose holds his post at the door and watches the lot for the only arrival he counts.',
      },
      { text: '@line:barb:greeting-d10' },
      // ——— Without-you: the house. Absence hands you the ritual's shape.
      {
        text: '“Dianne had her first fire going by eight,” Barb says, with the pot for punctuation. “She does her burning every November, that one. Gets ahead of the paper, she says. Same week every year — near enough you could set the potluck by it.”',
        when: missedHouse,
      },
      {
        text: 'Under the room, a few notes in a music-box register go by a shade flat — once, and once again, and not a third time. The crib pegs click on through it.',
        when: missedHouse,
      },
      // ——— Without-you: the hall. Absence hands you the blank anyway.
      {
        text: '“List went up at the hall,” Barb says. “I’m buns. The doctor pinned it and then stood off it a while, the way she stands off things she’s written.” The pot goes back on the ring. “There’s a casserole on it nobody’s put a name to yet. It’ll sort itself. They mostly do.”',
        when: missedHall,
      },
      {
        text: 'Behind the counter talk, three upright-piano notes step the wrong way, a shade flat, twice through, and quit. Nobody in the diner is playing anything.',
        when: missedHall,
      },
      // ——— Without-you: the shed. Absence hands you the escalation.
      {
        text: '“Sam’s light was on when the fog came down,” Barb says, not looking up from the soup. “Tam looked in on his way past. Got the door. Not a mouthful this time — just the door.” She wipes the same stretch of counter twice and lets the subject find its own way out.',
        when: missedShed,
      },
      {
        text: 'Under the crib pegs, faint, a whistled phrase — the horn’s fifth bar at a boy’s tempo — a quarter-tone flat. It surfaces twice and is gone.',
        when: missedShed,
      },
      // ——— The blank, come down the hill for the buns column.
      {
        text: 'The dish list is by the till, down from the hall for the buns column. Barb writes her own line in the ledger hand she keeps for public paper, then lets the pen hover. “This yours, then?” she asks — the casserole line, the open space beside it. The pen waits the way her pens wait.',
        when: sawDishBlank,
      },
    ],
  },
  choices: [
    {
      id: 'let-her-ink',
      label: '“Write it how you’d write it.”',
      when: sawDishBlank,
      effects: [
        { op: 'flag.set', key: 'today:named', value: true },
        { op: 'flag.set', key: 'd10:inked-blank', value: true },
        { op: 'stat.add', stat: 'name', value: 1 },
        { op: 'fact.add', tag: 'barb-inked-the-blank', witnessedBy: ['barb'] },
      ],
      goto: 'd10-evening-2',
    },
    {
      id: 'keep-the-blank',
      label: '“Leave the line. The dish can stand for itself.”',
      when: sawDishBlank,
      effects: [{ op: 'stat.add', stat: 'undertow', value: 1 }],
      goto: 'd10-evening-2',
    },
    {
      id: 'turn-in',
      label: 'Turn in.',
      when: { op: 'not', of: sawDishBlank },
      goto: 'd10-night',
    },
  ],
  cue: 'pub-warm',
});

const evening2 = defineScene({
  id: 'd10-evening-2',
  slot: 'evening',
  prose: {
    kind: 'inline',
    paragraphs: [
      {
        text: 'She writes unit one, small, in the name space — then goes over it again, the pen pressing the second time, the way she inks the things she means to keep. “There,” she says, to the page. It isn’t a name. On that sheet, tonight, it does the work of one.',
        when: { op: 'flag', key: 'd10:inked-blank' },
      },
      {
        text: 'She caps the pen. “Suit yourself,” she says, and means several things by it, and files the list under the tin of rubber bands where public paper waits its turn back up the hill. The line rides blank all the way to the potluck.',
        when: { op: 'not', of: { op: 'flag', key: 'd10:inked-blank' } },
      },
      {
        text: 'Chairs go up around you, which is the town striking midnight.',
      },
    ],
  },
  choices: [{ id: 'turn-in-late', label: 'Cross the lot to your unit.', goto: 'd10-night' }],
});

// ——— Night 10 ———

const night = defineScene({
  id: 'd10-night',
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
        text: 'At 3:12 the horn takes its five bars out over the water, and the town sleeps on the sound like bread rising. Something in you takes its portion too. You let it. The letting is easier than it was a week ago, which you notice, and file with the other things you don’t look at directly.',
        when: hornOn,
      },
      {
        text: 'The night comes with nothing under it. The fog is at the glass making the sound fog makes, which is none, and 3:12 goes by without turning its head.',
        when: hornStopped,
      },
      {
        text: 'You pull the second blanket over and it settles too fast — the way a sheet settles on a bed nobody is in.',
        when: decayedFlesh,
      },
      {
        text: 'By the door, the unit card has gone grey at the edges in a single night. The number holds. The rest of it is letting go.',
        when: decayedName,
      },
      {
        text: 'You reach back for one of last week’s mornings and the middle of it is gone — not dark: gone, a stair your foot had already trusted.',
        when: decayedEcho,
      },
    ],
  },
  choices: [{ id: 'let-morning-come', label: 'Let the morning come.', goto: 'd11-morning' }],
});

export const DAY10_SCENES: readonly Scene[] = [
  morning,
  house,
  houseTin,
  house2,
  house3,
  hall,
  hall2,
  shed,
  shed2,
  evening,
  evening2,
  night,
];
