/**
 * DAY 8 — the morning after (design/act2-beats.md §Day 8; the split
 * establishes). act1-end already owns `time.set day 8`, so d8-morning sets
 * SLOT ONLY. Three-way hub, Barb naming the slots over coffee:
 *   A. Dianne's stockroom — shelves before the frost; lunch (today:fed);
 *      PRESS OPPORTUNITY #1 (marked, quiet: the canoe question — she answers
 *      the orchard beach, clear morning, seen from the road; the Day-4
 *      evening tellings said otherwise; clue #8 in motion, uncommented).
 *   B. The wharf, TRACK-SPLIT via hidden hub gates (no lockedLabel — the
 *      other track's door simply isn't there): horn-on → d8-wharf-on (cue
 *      horn-close; the duty cycle, the gauge, what five bars cost; the
 *      fifth-bar memory = today:remembered). horn-stopped → d8-wharf-off
 *      (padlocked shed, batteries carried alone, one line all day).
 *   C. Sam's wall — the lake map @doc (three X's, three tellings), the
 *      memorial-page printouts, the tripod phone, the GARBAGE folder.
 *
 * Evening: without-you retellings for BOTH missed slots (spike-fomo rules
 * 1–6); each missed character's motif detuned, visual twin IN THE PROSE of
 * the same scene (twins: dianne 'a shade flat', wade 'a quarter-turn flat',
 * sam 'a quarter-tone flat'). Night 8: first decay night (stopped) / first
 * fed-by-the-horn night, named as such (on). NIGHT_DECAY is spread from
 * act2-shared — never re-authored here.
 *
 * Flags this file owns: 'd8:slot' ('stockroom'|'wharf'|'shed' — Day 11's
 * evening reads it, with 'd10:slot', for the skipped-shelves attendance
 * line: skip Dianne on Days 8 AND 10 and Barb says so), 'd8:pressed',
 * 'pressed-dianne' increment #1 (defensive when-chain per the Contract;
 * the branch that would make 3 also sets 'dianne:locks-house'),
 * 'today:fed' / 'today:remembered' (offsets, consumed by NIGHT_DECAY).
 * Facts: helped-stockroom (dianne), wade-told-fifth-bar / asked-duty-cycle /
 * stood-with-wade (wade), asked-sams-map / asked-garbage-folder (sam),
 * went-to-*-d8 attendance (barb).
 *
 * Prose invariants per design/game-bible.md §Prose grammar: nobody touches
 * you first; nobody remarks; Dianne says 'love' / 'hon' only; Moose never
 * registers you. Title/name budget for this cluster: none in this file.
 */

import { defineScene, type Cond, type Effect, type Scene } from '@not-here/engine';
import { detune, hornOn, hornStopped, NIGHT_DECAY, decayedEcho, decayedFlesh, decayedName } from './act2-shared.ts';

const wentStockroom: Cond = { op: 'flag', key: 'd8:slot', value: 'stockroom' };
const wentWharf: Cond = { op: 'flag', key: 'd8:slot', value: 'wharf' };
const wentShed: Cond = { op: 'flag', key: 'd8:slot', value: 'shed' };
const missedStockroom: Cond = { op: 'not', of: wentStockroom };
const missedWharf: Cond = { op: 'not', of: wentWharf };
const missedShed: Cond = { op: 'not', of: wentShed };

/**
 * The press counter, incremented defensively via exact-match when-chains
 * (Contract: number flag 0–3; the increment that reaches 3 also sets
 * 'dianne:locks-house'; at 3 it stays 3). Press #1 can only make it 1 in
 * an honest run — the chain is authored whole anyway.
 */
const PRESS_DIANNE: readonly Effect[] = [
  {
    op: 'when',
    cond: { op: 'flag', key: 'pressed-dianne', value: 1 },
    then: [{ op: 'flag.set', key: 'pressed-dianne', value: 2 }],
    else: [
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
            cond: { op: 'flag', key: 'pressed-dianne', value: 3 },
            then: [],
            else: [{ op: 'flag.set', key: 'pressed-dianne', value: 1 }],
          },
        ],
      },
    ],
  },
];

// ——— Morning hub: Barb names the day, no menu language ———

const morning = defineScene({
  id: 'd8-morning',
  slot: 'morning',
  // act1-end owns time.set day 8 — slot only here (Contract §Scene ids).
  onEnter: [{ op: 'time.set', slot: 'morning' }],
  prose: {
    kind: 'inline',
    paragraphs: [
      {
        text: 'Morning arrives the way it said it would: frost thick enough on the lot to keep boot prints, the crows starting the day’s first argument up the hill. The Kettle’s glass is sweating before you’re across the gravel.',
      },
      {
        text: 'You slept inside the song and woke fed on it, and the morning tastes ordinary — which is a thing the morning had to work at.',
        when: hornOn,
      },
      {
        text: 'The radio is on at the Kettle, low, for the first time since you came. Under the cutlery and the furnace there is a lot of morning to fill, and everything in the room takes a shift filling it.',
        when: hornStopped,
      },
      {
        text: '“Dianne wants her stockroom shelves walked forward before the frost gets the back room,” Barb says, counting the float into the till. “Said to send you up if you were sitting idle. You look idle to me.”',
      },
      {
        text: '“Wade’s at the shed this morning. Compressor day. You can hear it from the road when the door goes.”',
        when: hornOn,
      },
      {
        text: '“Wade’s walking batteries down the wharf for the breakwater light. Alone. He’d tell you that’s how batteries get walked.”',
        when: hornStopped,
      },
      {
        text: '“And Sam asked would you stop by the boat shed.” She lets the pot finish pouring. “Asked. From him that’s a carpet rolled out.” She goes back to the float. “The morning won’t stretch. You know that by now.”',
      },
    ],
  },
  choices: [
    {
      id: 'to-stockroom',
      label: 'Go up to the General.',
      effects: [
        { op: 'flag.set', key: 'd8:slot', value: 'stockroom' },
        { op: 'fact.add', tag: 'went-to-stockroom-d8', witnessedBy: ['barb'] },
      ],
      goto: 'd8-stockroom',
    },
    {
      id: 'to-wharf-on',
      label: 'Go down to the wharf.',
      when: hornOn,
      effects: [
        { op: 'flag.set', key: 'd8:slot', value: 'wharf' },
        { op: 'fact.add', tag: 'went-to-wharf-d8', witnessedBy: ['barb'] },
      ],
      goto: 'd8-wharf-on',
    },
    {
      id: 'to-wharf-off',
      label: 'Go down to the wharf.',
      when: hornStopped,
      effects: [
        { op: 'flag.set', key: 'd8:slot', value: 'wharf' },
        { op: 'fact.add', tag: 'went-to-wharf-d8', witnessedBy: ['barb'] },
      ],
      goto: 'd8-wharf-off',
    },
    {
      id: 'to-shed',
      label: 'Go to the boat shed.',
      effects: [
        { op: 'flag.set', key: 'd8:slot', value: 'shed' },
        { op: 'fact.add', tag: 'went-to-sams-shed-d8', witnessedBy: ['barb'] },
      ],
      goto: 'd8-shed',
    },
  ],
});

// ——— A. The stockroom. Domestic, warm; press opportunity #1.

const stockroom = defineScene({
  id: 'd8-stockroom',
  slot: 'morning',
  onEnter: [
    { op: 'fact.add', tag: 'helped-stockroom', witnessedBy: ['dianne'] },
    { op: 'stat.add', stat: 'flesh', value: 1 },
  ],
  prose: {
    kind: 'inline',
    paragraphs: [
      {
        text: 'The back room of the General is colder than the store by a coat’s worth. Dianne has the shelves half-emptied already, jars ranked on the counter like evacuees, and a plan she explains twice because the first telling was for herself: everything walks forward, off the outside wall, before the frost comes through the block.',
      },
      {
        text: '“You take the low end, love.” The work is real — shelf by shelf, the wood swollen with seven winters of the lake’s breathing. She talks while you lift: the frost order coming, the parcel backlog, Mrs. Yee’s roof. The whole town ledger, kept out loud.',
      },
      {
        text: 'On the hotplate in the corner a pot has been going since before you came. It was going before she knew you’d come. It is not a small pot.',
      },
    ],
  },
  choices: [
    {
      id: 'press-canoe',
      label: '“Where did the canoe come ashore, again?”',
      stakes: 'major',
      effects: [...PRESS_DIANNE, { op: 'flag.set', key: 'd8:pressed', value: true }],
      goto: 'd8-stockroom-2',
    },
    {
      id: 'keep-lifting',
      label: 'Keep lifting. Let her keep the ledger.',
      effects: [{ op: 'flag.set', key: 'd8:kept-lifting', value: true }],
      goto: 'd8-stockroom-2',
    },
  ],
  cue: 'dianne-theme',
});

const stockroom2 = defineScene({
  id: 'd8-stockroom-2',
  slot: 'morning',
  onEnter: [{ op: 'flag.set', key: 'today:fed', value: true }],
  prose: {
    kind: 'inline',
    paragraphs: [
      {
        text: '“Off the orchard beach, hon. Past the point.” She fits a jar into its new row. “Clear morning. You could see it from the road — half the town did.” The row comes out even under her hands. “There was frost on the boards that week too,” she says, and sends you up the stepladder for the last of the pickles.',
        when: { op: 'flag', key: 'd8:pressed' },
      },
      {
        text: 'The ledger runs on — whose woodpile is short, whose boy is back from Kamloops — and you are inside it now, one more kept account. The shelves come forward a hand’s width, out of the wall’s reach, and the room is better for it in a way you can feel in your palms.',
        when: { op: 'flag', key: 'd8:kept-lifting' },
      },
      {
        text: 'Lunch happens at the counter with the sign turned for half an hour: soup, bread heeled with butter, a pickle from the newest jar. She plates yours first and salts it without asking, which is correct. “Eat while it’s hot, love.”',
      },
      {
        text: 'She waves you off with the heel of the loaf in wax paper. Behind you the bell does its one job, and through the glass she is already back among the jars, telling the ledger to the room.',
      },
    ],
  },
  choices: [
    { id: 'take-the-afternoon', label: 'Take the loaf-heel and the afternoon.', goto: 'd8-evening' },
  ],
});

// ——— B (horn-on). The compressor shed: what five bars cost.

const wharfOn = defineScene({
  id: 'd8-wharf-on',
  slot: 'morning',
  prose: {
    kind: 'inline',
    paragraphs: [
      {
        text: 'The shed door stands open on its chain and the compressor is running its morning top-up — a sound you have only ever had through walls and water. Wade waves you in with two fingers off the gauge: come in or don’t, either’s fine, but the cold isn’t staying out for a committee.',
      },
      {
        text: 'He shows you the duty cycle because you are standing where it happens. The tank breathes up to pressure through the small hours; the governor holds it; at 3:12 the cam wakes and spends the night’s whole savings in five bars. “Forty pounds of air a night,” he says. “Give or take the fog.” Nobody pays for the diesel. You don’t ask. The jerry cans by the door answer.',
      },
      {
        text: 'He talks about the horn the way other men talk over a grave they tend — present tense, small facts, no flowers. The fifth bar comes up in the telling, and his hand moves on the brass like it is going somewhere.',
      },
    ],
  },
  choices: [
    {
      id: 'hear-the-fifth-bar',
      label: 'Let him tell you what she did to the fifth bar.',
      effects: [
        { op: 'flag.set', key: 'today:remembered', value: true },
        { op: 'fact.add', tag: 'wade-told-fifth-bar', witnessedBy: ['wade'] },
      ],
      goto: 'd8-wharf-2',
    },
    {
      id: 'keep-to-the-machine',
      label: 'Keep to the machine. Ask what the governor holds.',
      effects: [{ op: 'fact.add', tag: 'asked-duty-cycle', witnessedBy: ['wade'] }],
      goto: 'd8-wharf-2',
    },
  ],
  cue: 'horn-close',
});

const wharfOn2 = defineScene({
  id: 'd8-wharf-2',
  slot: 'morning',
  prose: {
    kind: 'inline',
    paragraphs: [
      {
        text: '“She’d land the last note early,” he says, to the gauge. “Couldn’t wait for it. Eighth of a beat, maybe less. You’d only catch it standing close.” He eases the drain cock and lets the tank sigh. “The cam plays it straight. I never found a way to teach brass the hurry.” The compressor takes the quiet over. You stand close.',
        when: { op: 'fact.exists', tag: 'wade-told-fifth-bar' },
      },
      {
        text: '“You always hummed the end different, mind,” he says. Still to the gauge, like a reading he’s taking. “Past where the cam stops. Like you had somewhere the rest of it lived.” The tank breathes. He doesn’t ask where.',
        when: { op: 'fact.exists', tag: 'wade-told-fifth-bar' },
      },
      {
        text: '“Governor holds ninety. Horn wants sixty-five a bar, five bars, and the line bleeds some.” He taps the rebuilt gauge, which reads true because he rebuilt it. “Cold snap, and the tank works nights same as me.” The numbers are a wall a man can stand behind, and he stands behind them the whole visit.',
        when: { op: 'fact.exists', tag: 'asked-duty-cycle' },
      },
      {
        text: 'Walking back up the boards you can hear the tank climbing behind you, patient, putting away breath for 3:12. It will spend the whole of it tonight. You know now what a night costs, in pounds and in diesel, and you know it is not Wade the nights are keeping.',
      },
    ],
  },
  choices: [{ id: 'up-the-boards', label: 'Give the wharf back to him.', goto: 'd8-evening' }],
});

// ——— B (horn-stopped). The padlocked shed; one line all day.

const wharfOff = defineScene({
  id: 'd8-wharf-off',
  slot: 'morning',
  prose: {
    kind: 'inline',
    paragraphs: [
      {
        text: 'The shed is padlocked. Not the green door — the shed itself, chain through both hasps, and the chain is new enough to still be bright. Inside, the compressor is a shape under a tarp now. You can tell by the silence, which has a tarp on it too.',
      },
      {
        text: 'Wade is halfway down the wharf with a battery in each hand, going flat-footed on the frosted boards. Breakwater-light batteries, lead and years heavy. A hand truck stands by the shed doing nothing, and so do you: when you step toward the load he angles past, not rude — already carrying it, the way he means to carry all of it.',
      },
      {
        text: 'One trip, mid-wharf, both hands full, he stops long enough to say it. “District pays for the light.” Then the boards take his weight away down the line. It is everything he says. By the sound of the town later, it is everything he says all day.',
      },
    ],
  },
  choices: [
    {
      id: 'stand-the-wharf',
      label: 'Stand the wharf with him anyway, trip for trip.',
      effects: [{ op: 'fact.add', tag: 'stood-with-wade', witnessedBy: ['wade'] }],
      goto: 'd8-evening',
    },
    { id: 'leave-him-to-it', label: 'Leave him to it.', goto: 'd8-evening' },
  ],
  cue: 'wade-theme',
});

// ——— C. Sam's wall. Showing you is a test too.

const shed = defineScene({
  id: 'd8-shed',
  slot: 'morning',
  onEnter: [{ op: 'fact.add', tag: 'saw-sams-wall', witnessedBy: ['sam'] }],
  prose: {
    kind: 'inline',
    paragraphs: [
      {
        text: 'The boat shed has turned its back on boats. The sawhorses are against the wall, and the wall is the point now: a lake map over the workbench, a column of printouts squared under a screw through their corners, dates in the margins in three different pens. A phone stands on a tripod by the door, facing the door. Its little light is on.',
      },
      {
        text: 'Sam lets you look. That is the visit: he stands where he can see you and the wall at once, and lets you look.',
      },
      {
        text: '@doc:\n┌──────────────────────────────────────┐\n│  W. SHORE — where the canoe came in  │\n│                                      │\n│    ~   ~   ~   ~   ~   ~   ~   ~     │\n│   X  cedar point          (R.G.)     │\n│        X  public launch   (T.O.)     │\n│   X  orchard beach        (mum)      │\n│                                      │\n│   same canoe. same week.             │\n└──────────────────────────────────────┘',
      },
      {
        text: 'Under the map, the memorial page, printed out monthly like a bank statement: seven years of candles and thinking-of-you-Di, and in the whole column not one post from the house it is about. The dates are circled. The gaps between the dates are circled harder.',
      },
      {
        text: 'The laptop on the bench is open to a folder named GARBAGE. Eleven files. He has backed them up twice — you can see the drives from here, taped to the underside of the shelf, which is not where garbage goes.',
      },
    ],
  },
  choices: [
    {
      id: 'ask-the-xs',
      label: '“Three places.”',
      effects: [{ op: 'fact.add', tag: 'asked-sams-map', witnessedBy: ['sam'] }],
      goto: 'd8-shed-2',
    },
    {
      id: 'ask-the-folder',
      label: '“Why GARBAGE?”',
      effects: [{ op: 'fact.add', tag: 'asked-garbage-folder', witnessedBy: ['sam'] }],
      goto: 'd8-shed-2',
    },
    {
      id: 'say-nothing-wall',
      label: 'Say nothing. Let him watch you read it.',
      effects: [{ op: 'flag.set', key: 'd8:read-quiet', value: true }],
      goto: 'd8-shed-2',
    },
  ],
  cue: 'sam-theme',
});

const shed2 = defineScene({
  id: 'd8-shed-2',
  slot: 'morning',
  prose: {
    kind: 'inline',
    paragraphs: [
      {
        text: '“Three tellings,” Sam says. “Same canoe. I wrote them down the year I figured out nobody else was going to.” He squares a corner that is already square. “Ask around long enough, you get a fourth.” There is no X for his own telling, you notice. He was eleven. Nobody asked him.',
        when: { op: 'fact.exists', tag: 'asked-sams-map' },
      },
      {
        text: '“Because nobody opens a folder called that,” he says. “Including me.” A drive ticks somewhere under the shelf, keeping its copies. “I stopped listening to them in August. Stopped making them in October.” He looks at the tripod, not at you.',
        when: { op: 'fact.exists', tag: 'asked-garbage-folder' },
      },
      {
        text: 'You give the wall the time it asks for, and Sam gives you the same. When you turn around he is looking at you the way he looked at the borrowed phone on the counter — as if the instrument that might be lying is not the one in his hand.',
        when: { op: 'flag', key: 'd8:read-quiet' },
      },
      {
        text: 'On the way out you pass through the tripod’s little cone of attention. Sam reaches past — to the door frame, not to you — and thumbs the phone dark as you go by. “Wind’s coming round,” he says, which is true, and which is also the only goodbye on offer.',
      },
    ],
  },
  choices: [{ id: 'up-the-shore-road', label: 'Take the shore road back.', goto: 'd8-evening' }],
});

// ——— Evening: the without-you retellings (spike-fomo rules 1–6) ———

const evening = defineScene({
  id: 'd8-evening',
  slot: 'evening',
  onEnter: [
    { op: 'time.set', slot: 'evening' },
    { op: 'when', cond: missedStockroom, then: [detune('dianne')] },
    { op: 'when', cond: missedWharf, then: [detune('wade')] },
    { op: 'when', cond: missedShed, then: [detune('sam')] },
  ],
  prose: {
    kind: 'inline',
    paragraphs: [
      {
        text: 'The Kettle at supper, fuller than the weather deserves: the crib board, two orchard crews, coats steaming on their pegs. Moose holds the door down like ballast.',
      },
      { text: '@line:barb:greeting-d8' },
      // ——— Without-you: the stockroom. The pot that plates two.
      {
        text: '“Dianne got her shelves forward on her own steam,” Barb says, in the lull. “Rang down at two for nothing she needed. Had the pot on all morning — force of habit plates two, she said, and laughed about it, so I laughed too.” The cloth makes its pass. “That back room’s beat the frost seven years running. It’ll beat it eight.”',
        when: missedStockroom,
      },
      {
        text: 'A few notes surface under the room — the music-box register, a shade flat, twice through. Then the furnace has the floor back.',
        when: missedStockroom,
      },
      // ——— Without-you: the wharf, horn-on. The cost, overheard.
      {
        text: '“Compressor ran past noon today,” one of the orchard men says at the crib board. “Heard it from the bench rows. He’ll be hauling his own diesel again Friday.” The pegs move. Nobody asks what the machine is for.',
        when: { op: 'all', of: [missedWharf, hornOn] },
      },
      // ——— Without-you: the wharf, horn-stopped. He refused Tam too.
      {
        text: '“Wade walked the light’s batteries down by hand today,” Barb says. “Tam offered the truck at the pull-in. He took the boards instead, every trip.” She fills your cup on the way past. “There’s men who set a thing down by picking everything else up. I’ve served three generations of them.”',
        when: { op: 'all', of: [missedWharf, hornStopped] },
      },
      {
        text: 'Later, under the furnace note, four held tones with fog on them come up a quarter-turn flat — once, and back under.',
        when: missedWharf,
      },
      // ——— Without-you: the shed. The library, the coins, the long way home.
      {
        text: '“Sam was up at the school library when it opened,” Barb says, quieter, to the pie case. “Printing. The librarian counts his pages out loud, Dianne says. He pays in coins and takes the long way home along the shore.” The pie case closes. “Growing boy,” she says, to nobody, which is the town’s whole file on it.',
        when: missedShed,
      },
      {
        text: 'Somewhere under the room a whistled phrase surfaces — the fifth bar at a boy’s clip, a quarter-tone flat. Twice, and gone.',
        when: missedShed,
      },
      {
        text: 'The crib game finds its winner. Chairs go up around you at the hour the chairs go up, and outside the fog has come down to the streetlights to wait with everybody else.',
      },
    ],
  },
  choices: [{ id: 'cross-the-lot', label: 'Cross the lot to your unit.', goto: 'd8-night' }],
  cue: 'pub-warm',
});

// ——— Night 8: first decay night / first fed-by-the-horn night ———
// No scene cue: the track decides. foghorn-312 only when the horn plays;
// the stopped track gets music.stop so nothing loops under the silence.

const night = defineScene({
  id: 'd8-night',
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
        text: 'At 3:12 the horn takes up through the wall, five bars and the held nothing after. You are awake for the first two and fed through all five — warmth arriving in the palms first, the floor firmer under the bed’s legs. Something is feeding you. You could walk the sound back through the fog to the shed where it is paid for, and you don’t. You sleep. That is the arrangement.',
        when: hornOn,
      },
      {
        text: 'No horn. 3:12 arrives anyway — you wake for it the way you would for a train that stopped running — and the night goes on being one unbroken piece of quiet, seam to seam.',
        when: hornStopped,
      },
      {
        text: 'The blankets weigh less than they should. You pull them to your chin and the cold doesn’t argue; it just fits you closer than it did yesterday, like a coat taken in.',
        when: decayedFlesh,
      },
      {
        text: 'Some time in the small hours you think of the tab book across the lot, your line in it, and the thought won’t hold its ink. It goes grey while you hold it, and you let it go.',
        when: decayedName,
      },
      {
        text: 'You reach back for one of the borrowed winters and it has lost a room. The hallway is there, the cold, the voices — and where a door stood there is wall now, smooth, with no one to ask.',
        when: decayedEcho,
      },
    ],
  },
  choices: [{ id: 'let-day-nine', label: 'Let the ninth day come.', goto: 'd9-morning' }],
});

export const DAY8_SCENES: readonly Scene[] = [
  morning,
  stockroom,
  stockroom2,
  wharfOn,
  wharfOn2,
  wharfOff,
  shed,
  shed2,
  evening,
  night,
];
