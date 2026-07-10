/**
 * DAY 9 — clinic day; the clinic keeps its own book (design/act2-beats.md
 * §Day 9; the prose names no weekday — the shipped EBUS card pins
 * Fri 14 Nov, so Day 9's date is a Friday and the beat sheet's 'Thursday'
 * heading cannot be spoken on screen). d9-morning owns `time.set day 9`.
 * Three-way hub:
 *   A. Clinic hours — Priya's follow-up. She transcribes the intake into
 *      the chart while you watch; the intake page renders as @doc and
 *      carries THE ACT'S ONE WRITTEN TITLE USE, corner shorthand, small
 *      enough to miss: `pt. not here for exam.` The wrist thread continues
 *      (gated on Day 3's lied-at-intake / intake-honest-wrist, else the
 *      late-intake first look). Her questions have begun to be about
 *      memory: "What's the first thing you remember about this room?" —
 *      the honest answer is Day 3. The answer is recorded in
 *      'd9:room-answer' ('honest' | 'improved' | 'silent') for Day 14's
 *      interrogation tree. The improve is a MARKED LIE (static +2).
 *   B. Barb's walk-in — winter re-shelving; today:fed (she feeds the
 *      help); Moose beat: his post faces the door you're holding.
 *   C. Tam ride #2 — nothing asked on the way out; one question on the
 *      way back, answered into the mirror ("Sam still at that wall of
 *      his?"). "He's let it go" is a MARKED LIE (static +2). A hidden
 *      extra answer opens if the player saw the wall on Day 8.
 *
 * Evening: without-you retellings for both missed slots (spike-fomo rules;
 * priya and tam motifs detune with prose twins — 'a shade flat' and
 * 'idle, road, idle'; Barb's own missed walk-in retells with NO detune,
 * per Act 1 precedent, day4). Night 9: decay/horn per track; NIGHT_DECAY
 * spread from act2-shared, fresh diegetic tells, goto d10-morning.
 *
 * Flags this file owns: 'd9:slot' ('clinic'|'walkin'|'ride'),
 * 'd9:room-answer', 'd9:mirror-silence', 'today:fed'. Facts:
 * priya-followup-done / told-priya-room-first / lied-priya-room /
 * truth-told (priya), helped-walkin-d9 (barb), rode-with-tam-d9 /
 * told-tam-sam-at-wall / told-tam-sams-map / lied-tam-about-sam (tam).
 *
 * Prose invariants per design/game-bible.md §Prose grammar; note the
 * clinic's standing one: Priya examines the wrist BY EYE — she never
 * touches you, and nobody remarks on a doctor who doesn't.
 */

import { defineScene, type Cond, type Scene } from '@not-here/engine';
import { detune, hornOn, hornStopped, NIGHT_DECAY, decayedEcho, decayedFlesh, decayedName } from './act2-shared.ts';

const wentClinic: Cond = { op: 'flag', key: 'd9:slot', value: 'clinic' };
const wentWalkin: Cond = { op: 'flag', key: 'd9:slot', value: 'walkin' };
const wentRide: Cond = { op: 'flag', key: 'd9:slot', value: 'ride' };
const missedClinic: Cond = { op: 'not', of: wentClinic };
const missedWalkin: Cond = { op: 'not', of: wentWalkin };
const missedRide: Cond = { op: 'not', of: wentRide };

/** Day 3's clinic happened (either signal day3.ts ships). */
const clinicD3: Cond = {
  op: 'any',
  of: [
    { op: 'flag', key: 'd3:slot', value: 'clinic' },
    { op: 'fact.exists', tag: 'went-to-clinic-d3' },
  ],
};

const morning = defineScene({
  id: 'd9-morning',
  slot: 'morning',
  onEnter: [{ op: 'time.set', day: 9, slot: 'morning' }],
  prose: {
    kind: 'inline',
    paragraphs: [
      {
        text: 'The ninth morning comes up grey with a hem of real cold in it. The snowline is a rail lower on the hills, and the fog has taken the middle of the lake for the day.',
      },
      {
        text: '“Clinic’s open,” Barb says, first thing. “Clinic days she keeps like church. She’ll have your page where her hand falls.”',
      },
      {
        text: '“Or my walk-in wants its winter shelving, and I want a second pair of arms more than I want the last word. Which is saying something.”',
      },
      {
        text: '“Or Tam’s holding the 07:10. He asked was anybody riding. He means you — ‘anybody’ is as far as his grammar bends.” She sets the pot back on the ring. “One of the three. The morning won’t be told twice.”',
      },
    ],
  },
  choices: [
    {
      id: 'to-clinic',
      label: 'Go to clinic hours.',
      effects: [
        { op: 'flag.set', key: 'd9:slot', value: 'clinic' },
        { op: 'fact.add', tag: 'went-to-clinic-d9', witnessedBy: ['barb'] },
      ],
      goto: 'd9-clinic',
    },
    {
      id: 'to-walkin',
      label: 'Stay and shelve the walk-in.',
      effects: [{ op: 'flag.set', key: 'd9:slot', value: 'walkin' }],
      goto: 'd9-walkin',
    },
    {
      id: 'to-ride',
      label: 'Take the 07:10.',
      effects: [
        { op: 'flag.set', key: 'd9:slot', value: 'ride' },
        { op: 'fact.add', tag: 'rode-with-tam-d9', witnessedBy: ['tam'] },
      ],
      goto: 'd9-ride',
    },
  ],
});

// ——— A. Clinic hours. The chart, the page, the room question.

const clinic = defineScene({
  id: 'd9-clinic',
  slot: 'morning',
  onEnter: [{ op: 'fact.add', tag: 'priya-followup-done', witnessedBy: ['priya'] }],
  prose: {
    kind: 'inline',
    paragraphs: [
      {
        text: 'Clinic hours in the manse front room: two chairs, the scale, the sewing-table desk. Dr. Anand has the door open before your knock again, and the chart already out, and this time a second page clipped over the first.',
      },
      {
        text: 'She transcribes while you sit — the intake, line by line, into the permanent record, her pen unhurried, your own answers legible upside down. She copies the wrist row whole. She leaves the name line the way she found it.',
      },
      {
        text: '@doc:\nLORN BAY CLINIC — cont’d, Nov 14\n\nID: not provided.\nDOB: not provided.\nPatient presents as: —\n\nsleep: some.  appetite: when put\nin front of her.  headaches: nil.\nl. wrist: see intake. unresolved.\n\n            district file: no match.\n\n     pt. not here for exam.',
      },
      {
        text: 'It rained Tuesday, all day, off the lake. At the wrist row her pen pauses the length of a heartbeat, and moves on. She doesn’t ask again. A thing asked twice is a different kind of question, and she is saving that kind.',
        when: { op: 'fact.exists', tag: 'lied-at-intake' },
      },
      {
        text: '“Doesn’t ache,” she reads back from the old page, nearly in your cadence. She looks at the wrist where it rests on the chair arm and measures it against its neighbour by eye alone. Writes one word. Whatever the word is, it is shorter than “unresolved.”',
        when: { op: 'fact.exists', tag: 'intake-honest-wrist' },
      },
      {
        text: 'The left wrist gets its first proper look — turned in the light at her asking, weighed against the right by eye. She writes longer than the looking took.',
        when: {
          op: 'not',
          of: {
            op: 'any',
            of: [
              { op: 'fact.exists', tag: 'lied-at-intake' },
              { op: 'fact.exists', tag: 'intake-honest-wrist' },
            ],
          },
        },
      },
      {
        text: 'Then she caps the pen, which turns out to be the start of something rather than the end. “New page,” she says. “Different kind of question. What’s the first thing you remember about this room?”',
      },
    ],
  },
  choices: [
    {
      id: 'first-time-honest',
      label: '“Last week. That chair. You left a line for my name.”',
      stakes: 'major',
      when: clinicD3,
      effects: [
        { op: 'stat.add', stat: 'undertow', value: 1 },
        { op: 'flag.set', key: 'd9:room-answer', value: 'honest' },
        { op: 'fact.add', tag: 'told-priya-room-first', witnessedBy: ['priya'] },
        { op: 'fact.add', tag: 'truth-told', witnessedBy: ['priya'] },
      ],
      goto: 'd9-clinic-2',
    },
    {
      id: 'first-time-honest-late',
      label: '“Right now. This is the first time I’ve sat in it.”',
      stakes: 'major',
      when: { op: 'not', of: clinicD3 },
      effects: [
        { op: 'stat.add', stat: 'undertow', value: 1 },
        { op: 'flag.set', key: 'd9:room-answer', value: 'honest' },
        { op: 'fact.add', tag: 'told-priya-room-first', witnessedBy: ['priya'] },
        { op: 'fact.add', tag: 'truth-told', witnessedBy: ['priya'] },
      ],
      goto: 'd9-clinic-2',
    },
    {
      id: 'improve-the-room',
      label: '“The paint. It was green in here, before it was yours.”',
      stakes: 'major',
      effects: [
        { op: 'static.add', value: 2 },
        { op: 'flag.set', key: 'd9:room-answer', value: 'improved' },
        { op: 'fact.add', tag: 'lied-priya-room', witnessedBy: ['priya'] },
      ],
      goto: 'd9-clinic-2',
    },
    {
      id: 'let-the-pen-wait',
      label: 'Say nothing. Let the pen wait.',
      stakes: 'major',
      effects: [{ op: 'flag.set', key: 'd9:room-answer', value: 'silent' }],
      goto: 'd9-clinic-2',
    },
  ],
  cue: 'priya-theme',
});

const clinic2 = defineScene({
  id: 'd9-clinic-2',
  slot: 'morning',
  prose: {
    kind: 'inline',
    paragraphs: [
      {
        text: 'She writes it whole, quotation marks and all. “Most people renovate,” she says, to the page. “A week on, the story’s got a porch on it.” The pen rules a clean line. “Thank you for leaving it alone.”',
        when: { op: 'flag', key: 'd9:room-answer', value: 'honest' },
      },
      {
        text: 'She writes it in full, slower than you said it. “Green,” she says. “Before me.” The pen comes back up the line and sits under the word without underlining it. “The Hendersons kept this room papered, I’m told. But then I wasn’t here either.” The folder is fatter when it closes than the visit was.',
        when: { op: 'flag', key: 'd9:room-answer', value: 'improved' },
      },
      {
        text: 'The pen waits. She lets it, one beat past comfortable, then writes anyway — less than a sentence, more than a word. “That’s an answer too,” she says, without heat. It goes in the folder with the rest of you.',
        when: { op: 'flag', key: 'd9:room-answer', value: 'silent' },
      },
      {
        text: 'At the door, behind you: “Clinic days. Same chair. I’ll keep the page open either way.” Down the steps the fog has the street. The bolt doesn’t turn until you’re past the gate. You hear it wait.',
      },
    ],
  },
  choices: [
    { id: 'give-fog-the-street', label: 'Give the rest of the morning to the fog.', goto: 'd9-evening' },
  ],
});

// ——— B. Barb's walk-in. She feeds the help; Moose minds the door.

const walkin = defineScene({
  id: 'd9-walkin',
  slot: 'morning',
  onEnter: [
    { op: 'fact.add', tag: 'helped-walkin-d9', witnessedBy: ['barb'] },
    { op: 'stat.add', stat: 'flesh', value: 1 },
    { op: 'flag.set', key: 'today:fed', value: true },
  ],
  prose: {
    kind: 'inline',
    paragraphs: [
      {
        text: 'The walk-in gives up its summer arrangement crate by crate: everything out, the shelves wiped and papered, the winter order walked in and ranked by date, heaviest low. Barb calls weights and dates from the doorway and you call them back, and the cold room becomes a system with two people in it.',
      },
      {
        text: 'Moose comes as far as the kitchen and sits himself down facing the walk-in door — the door, which you are holding open on your shoulder — and waits on it. Not on you. On the door, until it swings to and the matter is settled. Then he pads back to his post. “He likes a shut door,” Barb says, to the scale.',
      },
      {
        text: 'Noon is a plate at the counter with your name nowhere on it and your portion all through it — the help’s plate, the old rate. She stands over her own bowl at the till, and for ten minutes the Kettle is two women eating in the kind of quiet that costs nothing.',
      },
    ],
  },
  choices: [{ id: 'finish-the-crates', label: 'Work it to the last crate.', goto: 'd9-evening' }],
});

// ——— C. Tam ride #2. The mirror, the Sam question.

const ride = defineScene({
  id: 'd9-ride',
  slot: 'morning',
  prose: {
    kind: 'inline',
    paragraphs: [
      {
        text: 'The 07:10 idles at the pull-in with its door open and the heater already fighting for the front seats. Tam tips his cap a half-inch: boarding formalities complete. The bench road south, the lake on your left, the fog lying on the water like a sheet over furniture — and no question, the whole way out. The engine does the talking he approves of.',
      },
      {
        text: 'Penticton is the depot, the pharmacy, two mail tubs and a tray of bedding plants somebody ordered out of season. You keep your seat. It has become your seat, which is a thing that happens on the second ride, and is not nothing on any bus of Tam’s.',
      },
      {
        text: 'On the climb out of town he adjusts the mirror, which he has not needed to do in twenty years of this road. “Sam still at that wall of his?” The road unspools. The mirror doesn’t. He watches you in it, patient as the yellow line, while the answer takes whatever shape it is going to take.',
      },
    ],
  },
  choices: [
    {
      id: 'say-still-at-it',
      label: '“He is. Still at it.”',
      effects: [{ op: 'fact.add', tag: 'told-tam-sam-at-wall', witnessedBy: ['tam'] }],
      goto: 'd9-ride-2',
    },
    {
      id: 'tell-the-map',
      label: '“I’ve seen it. A map. Three X’s. He keeps it neat.”',
      when: { op: 'flag', key: 'd8:slot', value: 'shed' },
      effects: [{ op: 'fact.add', tag: 'told-tam-sams-map', witnessedBy: ['tam'] }],
      goto: 'd9-ride-2',
    },
    {
      id: 'say-let-go',
      label: '“He’s let it go, I think. Finally.”',
      stakes: 'major',
      effects: [
        { op: 'static.add', value: 2 },
        { op: 'fact.add', tag: 'lied-tam-about-sam', witnessedBy: ['tam'] },
      ],
      goto: 'd9-ride-2',
    },
    {
      id: 'give-the-mirror-nothing',
      label: 'Meet the mirror and give it nothing.',
      effects: [{ op: 'flag.set', key: 'd9:mirror-silence', value: true }],
      goto: 'd9-ride-2',
    },
  ],
  cue: 'tam-theme',
});

const ride2 = defineScene({
  id: 'd9-ride-2',
  slot: 'morning',
  prose: {
    kind: 'inline',
    paragraphs: [
      {
        text: '“Good,” Tam says. To the road, not the mirror. A mile later, in the same breath as a gear change: “Boy keeps his own books. Runs in the family he’s got left.” The bench rows go by. The subject closes the way a ledger closes — meaning it will open again, on schedule.',
        when: { op: 'fact.knownBy', who: 'tam', tag: 'told-tam-sam-at-wall' },
      },
      {
        text: '“Three,” he says. Only the number. His eyes are back on the road before the word is done and they stay there, both hands high on the wheel, the way a man drives past an accident he isn’t going to talk about. At the pull-in he sets the brake and looks at you once, straight, no mirror in between. “Thanks for riding.”',
        when: { op: 'fact.knownBy', who: 'tam', tag: 'told-tam-sams-map' },
      },
      {
        text: 'The mirror holds you for a hundred yards of highway. “That so,” Tam says. The engine idles high at the brow and he lets it, longer than the hill wants. Then the town comes up through the windshield and takes the silence off both of you. He doesn’t nod when you step down.',
        when: { op: 'fact.knownBy', who: 'tam', tag: 'lied-tam-about-sam' },
      },
      {
        text: 'You give the mirror the lake. Tam takes it back without complaint — a man used to freight that doesn’t answer. But at the flag stop he says, to the door as it opens: “His light’s been on at four. Somebody should know that besides me.” And then the cold, and the gravel, and the bus breathing behind you.',
        when: { op: 'flag', key: 'd9:mirror-silence' },
      },
    ],
  },
  choices: [{ id: 'walk-up-from-pullin', label: 'Walk up from the pull-in.', goto: 'd9-evening' }],
});

// ——— Evening: retellings for the missed slots ———

const evening = defineScene({
  id: 'd9-evening',
  slot: 'evening',
  onEnter: [
    { op: 'time.set', slot: 'evening' },
    { op: 'when', cond: missedClinic, then: [detune('priya')] },
    { op: 'when', cond: missedRide, then: [detune('tam')] },
    // Barb's own missed scene retells with no motif — Act 1 precedent (day4).
  ],
  prose: {
    kind: 'inline',
    paragraphs: [
      {
        text: 'The supper crowd is thinned by the fog to regulars: the crib board, the radio off again, Moose in the doorway draught where he prefers his post.',
      },
      { text: '@line:barb:greeting-d9' },
      // ——— Without-you: the clinic. She waited in the patient chair.
      {
        text: '“Doctor held your ten o’clock till eleven,” Barb says, when the counter clears. “Sat in the patient chair herself to wait — Dianne could see straight in from the post counter. Then she wrote the hour up like any other.” The pot finds the ring. “Clinic-day people,” she says, and doesn’t finish it.',
        when: missedClinic,
      },
      {
        text: 'Under the room, a few piano notes climb the wrong direction, a shade flat — once, again, gone. The upright at the hall is half a town away, and shut.',
        when: missedClinic,
      },
      // ——— Without-you: the walk-in. The help's plate, no help. No motif.
      {
        text: '“Did the walk-in myself between rushes,” Barb says, no weight on it at all. “Made the help’s plate at noon out of habit, so Moose dined well.” The dog’s tail concedes one beat against the floor — for the plate, not the teller. “Winter order’s shelved. It comes every year, like it or don’t.”',
        when: missedWalkin,
      },
      // ——— Without-you: the ride. Tam asked after somebody.
      {
        text: '“Tam came back with the tubs and a question,” Barb says. “Asked had Sam been in. Sam.” She lets the plate land. “Seven years that man’s asked after nobody — schedules, yes, people, no. I gave him the answer and he wore it down the hill.”',
        when: missedRide,
      },
      {
        text: 'Under the crib pegs, low, an engine rhythm surfaces where no engine is — idle, road, idle — a quarter-tone flat, twice through. Then the furnace owns the room again.',
        when: missedRide,
      },
      {
        text: 'The fog leans on the glass until the glass gives up its view. Coats, the till, the chairs. Barb turns the sign, and the town turns with it.',
      },
    ],
  },
  choices: [{ id: 'cross-to-your-unit', label: 'Cross the lot.', goto: 'd9-night' }],
  cue: 'pub-warm',
});

// ——— Night 9: decay / the horn, per track ———

const night = defineScene({
  id: 'd9-night',
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
        text: '3:12, five bars, the stop. You didn’t go to the window tonight. The song comes to the bed now like everything else here does — plated, salted, decided for you — and the part of you that eats it has stopped asking to be introduced.',
        when: hornOn,
      },
      {
        text: 'The quiet again, wall to wall. Somewhere up the hill a frost fan starts, roars at the cold for an hour, and quits — the only voice out there with anything to say, and none of it to you.',
        when: hornStopped,
      },
      {
        text: 'You wake once with your arm hanging off the bed and no report from it — no pins, no cold, no weight of blood. You bring it back under the blanket and hold it with the other one until it agrees to be an arm.',
        when: decayedFlesh,
      },
      {
        text: 'You dream a page of the tab book, your line on it, and watch the pen strokes lift off one at a time like birds leaving a wire — no fright in it, no sound. In the morning you will not remember which word they were.',
        when: decayedName,
      },
      {
        text: 'One of the borrowed songs — hers, the hall’s, the kitchen radio’s, you no longer sort them — plays itself down to the turn and stops taking requests. The turn is gone. You lie in the dark humming up to an edge, twice, and step back from it both times.',
        when: decayedEcho,
      },
    ],
  },
  choices: [{ id: 'let-day-ten', label: 'Let the tenth day come.', goto: 'd10-morning' }],
});

export const DAY9_SCENES: readonly Scene[] = [
  morning,
  clinic,
  clinic2,
  walkin,
  ride,
  ride2,
  evening,
  night,
];
