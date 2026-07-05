/**
 * DAY 3 — the three-way morning (Presence Economy at full width).
 * Beat sheet: design/act1-beats.md §Day 3. Barb names all three slots over
 * coffee (no menu language). A: the room (first ECHO harvest — the quilt;
 * the chord-sheet @doc artifact, the one written appearance of the title
 * this act). B: Sam's shed (trap test #1; the fatal correction gated on
 * ECHO≥3 and always VISIBLE via lockedLabel). C: Priya's clinic (intake;
 * the notebook thread opens).
 *
 * Evening carries the without-you retellings for whichever slots were
 * missed (design/spike-fomo.md, retranslated to Lorn Bay); each retelling
 * ends with the missed character's motif faint and detuned — a music.detune
 * emit whose visual twin lives IN THE PROSE of the same scene (playtest
 * fix-03: prose is the canonical twin; no duplicate toast lines). The missed
 * clinic resolves as the note under the door, at night. The evening also
 * carries the diner's copy of the EBUS winter schedule for any route that
 * hasn't seen Dianne's corkboard yet (playtest fix-08: the bus date is on
 * screen on every route). Prose invariants per design/game-bible.md
 * §Prose grammar.
 */

import { defineScene, type Cond, type Effect, type Scene } from '@not-here/engine';

const wentRoom: Cond = { op: 'flag', key: 'd3:slot', value: 'room' };
const wentShed: Cond = { op: 'flag', key: 'd3:slot', value: 'shed' };
const wentClinic: Cond = { op: 'flag', key: 'd3:slot', value: 'clinic' };
const missedRoom: Cond = { op: 'not', of: wentRoom };
const missedShed: Cond = { op: 'not', of: wentShed };
const missedClinic: Cond = { op: 'not', of: wentClinic };
const tookQuilt: Cond = { op: 'fact.exists', tag: 'private:memory-taken' };

/**
 * A missed-scene motif detune. Its visual twin is a prose paragraph in the
 * same scene (act1-lint pins the pairing) — never a duplicate event line.
 */
const detune = (pattern: string): Effect => ({
  op: 'emit',
  event: { kind: 'music.detune', pattern, cents: -50 },
});

const morning = defineScene({
  id: 'd3-morning',
  slot: 'morning',
  onEnter: [{ op: 'time.set', day: 3, slot: 'morning' }],
  prose: {
    kind: 'inline',
    paragraphs: [
      {
        text: 'Day three arrives like the others: crows, the flat-top, the fog holding the middle of the lake like a kept seat. Coffee is in front of you before you are all the way onto the stool.',
      },
      {
        text: '“Dianne’s airing the room out, up at the house,” Barb says, counting the float into the till. “First time in seven years, that. Window’s open to the street.”',
      },
      {
        text: '“Sam’s down the boat shed since first light, hammering at that canoe nobody paddles. And the doctor’s got clinic hours till noon. She’s asked after you.” Barb lets that sit. “Everyone thinks you should go. Everyone.”',
      },
      {
        text: '“Morning won’t stretch over all three. It never does.” She goes back to the float and leaves the day where you can reach it.',
      },
    ],
  },
  choices: [
    {
      id: 'to-room',
      label: 'Go up to the house.',
      effects: [
        { op: 'flag.set', key: 'd3:slot', value: 'room' },
        { op: 'fact.add', tag: 'went-to-room-d3', witnessedBy: ['barb'] },
      ],
      goto: 'd3-room',
    },
    {
      id: 'to-shed',
      label: 'Go down to the boat shed.',
      effects: [
        { op: 'flag.set', key: 'd3:slot', value: 'shed' },
        { op: 'fact.add', tag: 'went-to-shed-d3', witnessedBy: ['barb'] },
      ],
      goto: 'd3-shed',
    },
    {
      id: 'to-clinic',
      label: 'Go to clinic hours.',
      effects: [
        { op: 'flag.set', key: 'd3:slot', value: 'clinic' },
        { op: 'fact.add', tag: 'went-to-clinic-d3', witnessedBy: ['barb'] },
      ],
      goto: 'd3-clinic',
    },
  ],
});

// ——— A. The room. First ECHO harvest offer, tutorial-scale.

const room = defineScene({
  id: 'd3-room',
  slot: 'morning',
  onEnter: [{ op: 'fact.add', tag: 'aired-room-with-dianne', witnessedBy: ['dianne'] }],
  prose: {
    kind: 'inline',
    paragraphs: [
      {
        text: 'The house above the General has its window open to the street, curtain out over the sill like a flag of some small surrender. Dianne is on the stairs with an armful of sheets. “Up here, love,” she says, as if you had asked.',
      },
      {
        text: 'The room at the top has been kept, not used. Bed, desk, a corkboard gone bare at the corners. The air in it is seven Novembers deep and going out the window a year at a time.',
      },
      {
        text: 'The quilt is off the bed and folded over the sill. Dianne puts a hand flat on it. “My mother pieced this. The winter the lake froze bank to bank — sixty-nine. Out of dance dresses, if you can credit it. There’s a blue in there she got married in. The second time. The good one.”',
      },
      {
        text: 'She tells it whole: the frozen lake, the dresses cut on the kitchen floor, the thimble her mother wore to the end and was buried without. She offers you the end of the story the way you offer someone the end of a sheet to fold.',
      },
      { text: '“You remember the quilt, hon,” she says. Half question. The room leans in.' },
    ],
  },
  choices: [
    {
      id: 'remember-with-her',
      label: '“I remember.” Take the story in, corner to corner.',
      stakes: 'major',
      effects: [
        { op: 'stat.add', stat: 'echo', value: 1 },
        {
          op: 'fact.add',
          tag: 'private:memory-taken',
          about: 'dianne',
          witnessedBy: ['dianne'],
        },
      ],
      goto: 'd3-room-2',
    },
    {
      id: 'let-it-stay',
      label: 'Say nothing. Let the story stay hers.',
      stakes: 'major',
      effects: [
        { op: 'stat.add', stat: 'undertow', value: 1 },
        { op: 'flag.set', key: 'd3:left-quilt', value: true },
      ],
      goto: 'd3-room-2',
    },
  ],
  cue: 'wrens-room',
});

const room2 = defineScene({
  id: 'd3-room-2',
  slot: 'morning',
  onEnter: [{ op: 'flag.set', key: 'seen-chord-sheet', value: true }],
  prose: {
    kind: 'inline',
    paragraphs: [
      {
        text: 'It comes away clean, like a print lifted off glass. Frozen lake, dance dresses, the buried thimble — yours now, down to the smell of the hall the dresses danced in. Dianne nods along, slower near the end, the way you nod at a road you used to drive.',
        when: tookQuilt,
      },
      {
        text: 'You fold with her, corner to corner, and keep the story on her side of the fold. “Listen to me,” she says, pleased and tired and hers. “Talking your whole morning off.”',
        when: { op: 'flag', key: 'd3:left-quilt' },
      },
      {
        text: 'Pinned inside the wardrobe door, where a mirror would go, there is a chord chart. Ruled by hand — the pencil line bows where the ruler slipped. Five systems filled, the letters small and sure. The sixth ruled and left empty.',
      },
      {
        text: '@doc:\n          not here (unfinished)\n\n 1 ║ Dm      │ Dm/C    │ G/B     │ G       ║\n 2 ║ F       │ C/E     │ Dm      │ Dm      ║\n 3 ║ Am      │ G       │ F       │ F       ║\n 4 ║ Em      │ Am      │ G/B     │ G       ║\n 5 ║ Dm      │ F       │ G       │ G       ║\n 6 ║         │         │         │         ║',
      },
      {
        text: 'Dianne carries the sheets past the door and down the stairs, and does not look in at the wardrobe with the whole of her back. Nobody says anything about the song. The window curtain breathes once and lies still.',
      },
    ],
  },
  choices: [
    {
      id: 'hum-first',
      label: 'Hum the first system under your breath, once.',
      effects: [{ op: 'flag.set', key: 'd3:hummed-chart', value: true }],
      goto: 'd3-evening',
    },
    { id: 'close-wardrobe', label: 'Close the wardrobe door on it, gently.', goto: 'd3-evening' },
  ],
});

// ——— B. The boat shed. Trap test #1.

const shed = defineScene({
  id: 'd3-shed',
  slot: 'morning',
  onEnter: [{ op: 'fact.add', tag: 'found-sam-at-shed', witnessedBy: ['sam'] }],
  prose: {
    kind: 'inline',
    paragraphs: [
      {
        text: 'The boat shed stands at the top of the launch on creosote legs. Inside, the canoe is up on sawhorses, hull to the light, and Sam is running caulk down a seam that never asked for it. He doesn’t stop when your shadow crosses the door.',
      },
      {
        text: '“Hold that end steady if you’re staying,” he says. You take the gunwale. For a while there is the gun clicking, the smell of the caulk, and the lake saying nothing.',
      },
      {
        text: '“She had a name for the November wind off the bench,” Sam says, to the hull. “The landlord. On account of it come round the first of the month.” The gun stops. He is not looking at you the way only he can entirely not look at you.',
      },
    ],
  },
  choices: [
    {
      id: 'correct-him',
      label: '“The bailiff. Because it took things.”',
      stakes: 'major',
      when: { op: 'stat.gte', stat: 'echo', value: 3 },
      lockedLabel: 'Correct him. The right word is almost there, at the edge of you.',
      effects: [
        { op: 'flag.set', key: 'd3:trap', value: 'sprung' },
        { op: 'fact.add', tag: 'fog-sam-trap-sprung', about: 'sam', witnessedBy: ['sam'] },
      ],
      goto: 'd3-shed-2',
    },
    {
      id: 'say-nothing',
      label: 'Say nothing. Keep the canoe steady.',
      stakes: 'major',
      effects: [
        { op: 'flag.set', key: 'd3:trap', value: 'held' },
        { op: 'fact.add', tag: 'sam-test-1-passed', about: 'sam', witnessedBy: ['sam'] },
      ],
      goto: 'd3-shed-2',
    },
    {
      id: 'admit-blank',
      label: '“I don’t remember it. Any of it. I’m sorry.”',
      stakes: 'major',
      effects: [
        { op: 'stat.add', stat: 'undertow', value: 1 },
        { op: 'flag.set', key: 'd3:trap', value: 'admitted' },
        { op: 'fact.add', tag: 'sam-test-1-passed', about: 'sam', witnessedBy: ['sam'] },
        { op: 'fact.add', tag: 'truth-told', witnessedBy: ['sam'] },
      ],
      goto: 'd3-shed-2',
    },
  ],
  cue: 'sam-theme',
});

const shed2 = defineScene({
  id: 'd3-shed-2',
  slot: 'morning',
  prose: {
    kind: 'inline',
    paragraphs: [
      {
        text: 'The colour goes out of him from the jaw down. He sets the caulk gun on the rail like a thing that might go off. “Nobody told you that,” he says — not loud, not to you exactly. Then the light off the water has him, and the launch is empty.',
        when: { op: 'flag', key: 'd3:trap', value: 'sprung' },
      },
      {
        text: 'You hold the canoe steady a while longer, for nobody. The gun ticks as it cools.',
        when: { op: 'flag', key: 'd3:trap', value: 'sprung' },
      },
      {
        text: 'He works the seam out to the stem and wipes the nozzle. The look he gives you then runs a beat past the length of any look he has spent on you yet — measuring, or waiting for something to blink. “Thanks for the hands,” he says, and turns the hull.',
        when: { op: 'flag', key: 'd3:trap', value: 'held' },
      },
      {
        text: '“Yeah,” Sam says. Just that. He runs the bead out to the stem before anything else. “Most people pretend.” The look he gives you lasts a beat longer than any he has spent on you yet, and lands somewhere new.',
        when: { op: 'flag', key: 'd3:trap', value: 'admitted' },
      },
      {
        text: 'You walk back up the shore road with caulk smell in your sleeves and the fog burning off the shallows behind you.',
      },
    ],
  },
  choices: [
    { id: 'back-up-the-road', label: 'Give the rest of the morning to the road.', goto: 'd3-evening' },
  ],
});

// ——— C. Clinic hours. Intake; the notebook thread opens.

const clinic = defineScene({
  id: 'd3-clinic',
  slot: 'morning',
  onEnter: [
    { op: 'fact.add', tag: 'priya-intake-done', witnessedBy: ['priya'] },
    { op: 'flag.set', key: 'priya:notebook-open', value: true },
  ],
  prose: {
    kind: 'inline',
    paragraphs: [
      {
        text: 'Clinic hours happen in the front room of the old manse behind the hall: two chairs, a scale, a desk that was a sewing table once. Dr. Anand opens the door before you knock and stands aside exactly wide enough.',
      },
      {
        text: '“Sit,” she says, and takes the far chair, and uncaps a pen. The questions are plain and she writes every answer in full sentences. Sleeping — some. Eating — when it is put in front of you. Headaches — no. She does not ask your name. She leaves a line for it.',
      },
      {
        text: '“Left wrist,” she says, not looking up. “Still aches before weather?” The pen waits on the page like a level held to a wall.',
      },
    ],
  },
  choices: [
    {
      id: 'lie-ache',
      label: '“When the rain’s coming. You know how it is.”',
      stakes: 'major',
      effects: [
        { op: 'static.add', value: 2 },
        { op: 'fact.add', tag: 'lied-at-intake', witnessedBy: ['priya'] },
      ],
      goto: 'd3-clinic-2',
    },
    {
      id: 'honest-wrist',
      label: 'Turn the wrist over in the light. “It doesn’t ache. Should it?”',
      stakes: 'major',
      effects: [
        { op: 'stat.add', stat: 'undertow', value: 1 },
        { op: 'fact.add', tag: 'intake-honest-wrist', witnessedBy: ['priya'] },
        { op: 'fact.add', tag: 'truth-told', witnessedBy: ['priya'] },
      ],
      goto: 'd3-clinic-2',
    },
  ],
  cue: 'priya-theme',
});

const clinic2 = defineScene({
  id: 'd3-clinic-2',
  slot: 'morning',
  prose: {
    kind: 'inline',
    paragraphs: [
      {
        text: 'She writes it down exactly as you said it, quotation marks and all, and rules a neat line underneath. The pen does not hurry and does not stop.',
        when: { op: 'fact.knownBy', who: 'priya', tag: 'lied-at-intake' },
      },
      {
        text: 'She looks at the wrist, then at you, for one long level second. She writes one short sentence and underlines nothing. “Thank you,” she says, and means some of it.',
        when: { op: 'fact.knownBy', who: 'priya', tag: 'intake-honest-wrist' },
      },
      {
        text: 'Under the intake pad there is a second notebook — older, home-covered, fat with use. It stays closed the whole hour, the way a door stays locked.',
      },
      {
        text: '“Come back Thursday,” she says at the door. “Or don’t. I make notes either way.”',
      },
    ],
  },
  choices: [
    { id: 'back-along-hall', label: 'Take the long way back, past the hall.', goto: 'd3-evening' },
  ],
});

// ——— Evening: the without-you retellings, per spike-fomo calibration.

const evening = defineScene({
  id: 'd3-evening',
  slot: 'evening',
  onEnter: [
    { op: 'time.set', slot: 'evening' },
    { op: 'when', cond: missedShed, then: [detune('sam')] },
    { op: 'when', cond: missedRoom, then: [detune('dianne')] },
    // fix-08: the twist's clock must be on screen on every route. Any run
    // that never read Dianne's corkboard gets the diner's copy tonight.
    {
      op: 'when',
      cond: { op: 'not', of: { op: 'flag', key: 'seen-bus-date' } },
      then: [
        { op: 'flag.set', key: 'd3:bus-card', value: true },
        { op: 'flag.set', key: 'seen-bus-date', value: true },
      ],
    },
  ],
  prose: {
    kind: 'inline',
    paragraphs: [
      {
        text: 'Evening fills the Kettle the usual way: orchard men, the crib board, steam on the inside of the glass. Moose holds his post at the door.',
      },
      { text: '@line:barb:greeting' },
      // ——— Without-you: the boat shed, told by Barb (spike-fomo canon).
      {
        text: '“Sam had himself an afternoon,” she says, and doesn’t leave. “Down the boat shed, hammering at that canoe like it owed him rent. Tam looked in on him — someone had to, the noise of it — and got a mouthful for his trouble. ‘She’s not coming back in a boat,’ Sam tells him. Just like that. Tam, of all people.”',
        when: missedShed,
      },
      {
        text: 'She wipes the same stretch of counter twice.',
        when: missedShed,
      },
      {
        text: '“He’s got it in his head the caulk was rotten because nobody’s touched the thing since. Since. Well.” The cloth stops. “It’s good he’s working at something, is what I said to Tam. Better a boat than the other thing.”',
        when: missedShed,
      },
      {
        text: 'She doesn’t say what the other thing is. She double-inks something in the book before she puts it away. Under the room tone, very faint, a whistled phrase — the horn’s fifth bar, sped up, a boy’s tempo — a quarter-tone flat. It surfaces twice and is gone.',
        when: missedShed,
      },
      // ——— Without-you: the room, told by Barb off the street's account.
      {
        text: '“Dianne had the window up at the house today,” Barb says, with the coffee pot for punctuation. “Seven years that sash has been down. Sheets on the line in November, quilt over the sill, and half the street finding errands up that road all morning. Not one of them stopped, mind. You don’t stop a thing like that. You let it air.”',
        when: missedRoom,
      },
      {
        text: '“She was sing—” Barb sets the pot back on the burner. “She was talking to herself while she worked, anyway. Happy, it sounded. There’s a kind of tired you’d trade for, and she’s got it tonight.”',
        when: missedRoom,
      },
      {
        text: 'Under the crib pegs, faint, a few notes in a music-box register, a shade flat, once through and once again. Then just the furnace.',
        when: missedRoom,
      },
      // ——— The diner's schedule card (fix-08), for routes that missed the
      //     General's corkboard. Same card, different wall.
      {
        text: 'Taped by the till, where the specials would go, the winter schedule — Tam brings a stack down every fall and Barb keeps one for the drivers.',
        when: { op: 'flag', key: 'd3:bus-card' },
      },
      {
        text: '@doc:\n┌─────────────────────────────────┐\n│  EBUS — WINTER SCHEDULE         │\n│  VANCOUVER–PENTICTON–LORN BAY   │\n│                                 │\n│   Fri 14 Nov ......... 07:40    │\n│   Fri 21 Nov ......... 07:40    │\n│  (( Fri 28 Nov ....... 07:40 )) │\n│   Fri  5 Dec ......... 07:40    │\n│                                 │\n│  Flag stop. Exact fare. No pets.│\n└─────────────────────────────────┘',
        when: { op: 'flag', key: 'd3:bus-card' },
      },
      {
        text: 'The last Friday of the month is ringed twice round in blue pen, pressed hard enough to hold the paper still. It is not Barb’s pen.',
        when: { op: 'flag', key: 'd3:bus-card' },
      },
      // ——— Common close.
      {
        text: 'The crib game ends in the usual quiet triumph and the usual coats. Barb turns the chairs onto the tables around you, which is the town’s way of striking midnight.',
      },
    ],
  },
  choices: [{ id: 'go-up', label: 'Cross the lot to your unit.', goto: 'd3-night' }],
  cue: 'pub-warm',
});

// ——— Night 3: the note (if the clinic went unattended), the horn, the figure.

const night = defineScene({
  id: 'd3-night',
  slot: 'night',
  onEnter: [
    { op: 'time.set', slot: 'night' },
    { op: 'fact.add', tag: 'heard-third-horn' },
    {
      op: 'when',
      cond: missedClinic,
      then: [
        { op: 'fact.add', tag: 'missed-clinic-noted', witnessedBy: ['priya'] },
        { op: 'flag.set', key: 'priya:notebook-open', value: true },
        detune('priya'),
      ],
    },
    {
      op: 'when',
      cond: { op: 'flag', key: 'n1:watched-lake' },
      then: [{ op: 'flag.set', key: 'd3:saw-figure', value: true }],
    },
  ],
  prose: {
    kind: 'inline',
    paragraphs: [
      {
        text: 'A folded page has been put under the door of your unit, some time in the evening. Small hand, straight, no loops. It is not addressed to anyone.',
        when: missedClinic,
      },
      {
        text: '@doc:\nYou did not come to clinic hours. Noted. — P.A.\n\nFor the record: swelling of the left wrist,\nseven years unresolved. Fractured on the\norchard gate the winter she was nineteen.\nHealed badly. Aches before weather.\n\nWhenever you’re ready.',
        when: missedClinic,
      },
      {
        text: 'You find yourself holding your left wrist. You could not say which winter, or which gate, or whether it aches. It doesn’t. That is the point of the note.',
        when: missedClinic,
      },
      {
        text: 'While you read, four notes come up through the floor from nowhere the floor connects to — a piano wanting tuning, the phrase somehow upside down, a shade flat. Twice. Then the room tone comes back, one layer short.',
        when: missedClinic,
      },
      {
        text: 'At 3:12 the horn takes the night’s five bars out over the water and stops where the rest should be. You mouth the fifth bar along with it now. You did not decide to.',
      },
      {
        text: 'You are at the window before the second bar — habit already. Down at the wharf the beam swings, opens a room in the fog, and closes it. In the opening: a figure at the horn-room rail, still, collar up, facing the water. The beam comes round again and the fog has the wharf to itself.',
        when: { op: 'flag', key: 'n1:watched-lake' },
      },
    ],
  },
  choices: [
    { id: 'let-tomorrow', label: 'Lie back down and let tomorrow come.', goto: 'd4-morning' },
  ],
  cue: 'foghorn-312',
});

export const DAY3_SCENES: readonly Scene[] = [
  morning,
  room,
  room2,
  shed,
  shed2,
  clinic,
  clinic2,
  evening,
  night,
];
