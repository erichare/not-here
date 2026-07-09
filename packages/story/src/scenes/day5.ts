/**
 * DAY 5 — Tam's ride, or the hall (design/act1-beats.md §Day 5).
 *
 * Two-slot morning: the 07:10 Penticton run (cue tam-theme; retimed off the
 * EBUS's Friday 07:40 per playtest fix-08 so the two cannot conflate; the
 * idling under
 * everything — his rhythm-fragment, diegetic; his ONE question, "You planning
 * to stay past the 28th?", three answers incl. one marked lie → STATIC +2;
 * how he watches the mirror when Sam's name comes up) OR potluck prep at the
 * community hall (cue hall-upright; the flyer @doc artifact; the upright
 * uncovered — Priya picks three notes that step the wrong way: her inverted
 * bar 4, first plant). The missed slot resolves that evening as an authored
 * without-you retelling (spike-fomo calibration rules; the hole has a sound).
 *
 * Evening (cue pub-warm): FIRST GOSSIP VISIBILITY — Tam's stool-side line
 * ('@line:tam:evening-d5', dialogue-days56.ts) requires a Day-2 fact he never
 * witnessed ('helped-barb' or 'went-to-dianne'), learned across the barb↔tam
 * gossip edge; the line names its source so an attentive player can trace
 * who told whom. Night 5: brief; the horn.
 *
 * Prose invariants in force (game-bible.md §Prose grammar): nobody touches
 * you first; Moose never registers you; nobody remarks on any of it; Dianne
 * says only 'love' / 'hon' / 'my girl'.
 */

import { defineScene, type Cond, type Effect, type Scene } from '@not-here/engine';

const rode: Cond = { op: 'flag', key: 'd5:slot', value: 'ride' };
const wentToHall: Cond = { op: 'flag', key: 'd5:slot', value: 'hall' };
const tookQuilt: Cond = { op: 'fact.exists', tag: 'private:memory-taken' };

/** Missed-scene motif detune; the visual twin is a prose paragraph here. */
const detune = (pattern: string): Effect => ({
  op: 'emit',
  event: { kind: 'music.detune', pattern, cents: -50 },
});

const morning = defineScene({
  id: 'd5-morning',
  slot: 'morning',
  onEnter: [{ op: 'time.set', day: 5, slot: 'morning' }],
  prose: {
    kind: 'inline',
    paragraphs: [
      {
        text: 'The fifth morning is up before you are: the flat-top going, a truck compressing gravel somewhere, the crows already halfway through their argument. The snowline has come down another fence-rail in the night. It gets looked at, around the Bay, the way a clock gets looked at.',
      },
      {
        text: '"Tam’s holding the 07:10 at the pull-in, if you want town," Barb says, pouring before you’ve sat. "His idea, not mine. Don’t expect talk — you’ll get the road there and the road back."',
      },
      {
        text: '"Or the hall’s open. Potluck prep — Dianne’s got the tables down and the doctor counting chairs. They could use hands." She sets the pot back on the ring. "One or the other. The morning won’t stretch."',
      },
    ],
  },
  choices: [
    {
      id: 'take-the-0740',
      label: 'Take the 07:10.',
      effects: [
        { op: 'flag.set', key: 'd5:slot', value: 'ride' },
        { op: 'fact.add', tag: 'rode-with-tam', witnessedBy: ['tam'] },
      ],
      goto: 'd5-ride',
    },
    {
      id: 'help-at-the-hall',
      label: 'Go help at the hall.',
      effects: [
        { op: 'flag.set', key: 'd5:slot', value: 'hall' },
        { op: 'fact.add', tag: 'went-to-hall', witnessedBy: ['priya', 'dianne'] },
      ],
      goto: 'd5-hall',
    },
  ],
});

const ride = defineScene({
  id: 'd5-ride',
  slot: 'morning',
  prose: {
    kind: 'inline',
    paragraphs: [
      {
        text: 'The bus idles at the pull-in with its door open, which is as much invitation as Tam issues. There is no talk of fare; the tray stays covered, and he tips the door shut behind you and takes the bench road south, the lake on your left with the fog still sitting on the middle of it like a held note.',
      },
      {
        text: 'Under everything, the idling. Even out on the highway the engine keeps its low patient knock, a rhythm with no notes in it, and by the first orchard your breathing has gone over to its side.',
      },
      {
        text: 'Two seats back a woman is telling her seatmate about the potluck — who’s doing the hall, what she’s bringing, whether Sam Cole will show his face at it this year. At Sam’s name, Tam’s eyes come up to the mirror. They are not on the road and they are not on the women. They stay on you until the subject changes.',
      },
    ],
  },
  choices: [
    {
      id: 'hold-his-eyes',
      label: 'Hold his eyes in the mirror.',
      effects: [{ op: 'fact.add', tag: 'met-tams-look', witnessedBy: ['tam'] }],
      goto: 'd5-ride-2',
    },
    { id: 'watch-the-lake', label: 'Watch the lake go by.', goto: 'd5-ride-2' },
  ],
  cue: 'tam-theme',
});

const ride2 = defineScene({
  id: 'd5-ride-2',
  slot: 'morning',
  prose: {
    kind: 'inline',
    paragraphs: [
      {
        text: 'Penticton happens: the depot, a pharmacy run, mail tubs for the General swung up through the door. You stay in your seat. It doesn’t need discussing, so it isn’t discussed.',
      },
      {
        text: 'On the climb out of town he asks his one question of the drive. "You planning to stay past the 28th?" The engine idles high at the brow of the bench. He doesn’t fill the silence after it. The lake comes up grey through the windshield and he lets it do the asking with him, the whole way down the hill.',
      },
      {
        text: 'The number brings the winter card back in blue: the ring pressed through paper into cork. Tam meets your eyes in the mirror again and waits to see whether it did.',
        when: { op: 'fact.exists', tag: 'met-tams-look' },
      },
      {
        text: 'The number brings the winter card back in blue: the ring pressed through paper into cork. Tam watches the mirror long enough to see whether it did.',
        when: { op: 'not', of: { op: 'fact.exists', tag: 'met-tams-look' } },
      },
    ],
  },
  choices: [
    {
      id: 'say-staying',
      label: '"I remember why it matters. I’m staying."',
      stakes: 'major',
      effects: [
        { op: 'static.add', value: 2 },
        { op: 'fact.add', tag: 'told-tam-staying', witnessedBy: ['tam'] },
      ],
      goto: 'd5-ride-3',
    },
    {
      id: 'say-dont-know',
      label: '"I don’t know yet."',
      stakes: 'major',
      effects: [
        { op: 'stat.add', stat: 'undertow', value: 1 },
        { op: 'fact.add', tag: 'told-tam-unsure', witnessedBy: ['tam'] },
      ],
      goto: 'd5-ride-3',
    },
    {
      id: 'let-the-road-answer',
      label: 'Let the road answer for you.',
      stakes: 'major',
      effects: [{ op: 'fact.add', tag: 'gave-tam-silence', witnessedBy: ['tam'] }],
      goto: 'd5-ride-3',
    },
  ],
});

const ride3 = defineScene({
  id: 'd5-ride-3',
  slot: 'morning',
  prose: {
    kind: 'inline',
    paragraphs: [
      {
        text: 'Tam nods at the road, once. The engine note doesn’t change and neither does his face, but he brings the bus down a gear sooner than the hill asks, and keeps it there the rest of the way in, quiet, like a man keeping a fire small.',
        when: { op: 'fact.knownBy', who: 'tam', tag: 'told-tam-staying' },
      },
      {
        text: '"No rush on knowing," Tam says, well after. "Roads stay open till they don’t." It has the shape of a weather report and none of the temperature of one.',
        when: { op: 'fact.knownBy', who: 'tam', tag: 'told-tam-unsure' },
      },
      {
        text: 'The silence rides along like a fare he’s carried before. At the Bay he sets the brake and says, "Good run." From Tam, that is a speech with a toast in it.',
        when: { op: 'fact.knownBy', who: 'tam', tag: 'gave-tam-silence' },
      },
      {
        text: 'Moose is up at the diner door when the bus comes down the hill — on his feet before the sound has cleared the trees. Tam steps down and lets the old dog lean into his knee. It is the most either of them says all day.',
      },
    ],
  },
  choices: [{ id: 'go-in', label: 'Go in out of the cold.', goto: 'd5-evening' }],
});

const hall = defineScene({
  id: 'd5-hall',
  slot: 'morning',
  prose: {
    kind: 'inline',
    paragraphs: [
      {
        text: 'The community hall smells of floor wax, coffee urns, and the inside of cupboards. Dianne has the tables down off their trolley; Priya counts chairs against a clipboard and makes the list agree. The banner isn’t up yet. The banner never goes up till the last day, Dianne says, or the roof gets ideas.',
      },
      { text: 'By the door, a stack of new flyers with a staple gun on top:' },
      {
        text: '@doc:\n┌──────────────────────────┐\n│                          │\n│       SEVEN YEARS        │\n│                          │\n│      COMMUNITY HALL      │\n│      BRING A DISH        │\n│                          │\n└──────────────────────────┘',
      },
      {
        text: 'That is the whole of it. Nobody has written what the seven years are of. Everyone the flyer is for already knows.',
      },
      // ——— fix-01 echo: the quilt story losing its maker, in company.
      {
        text: 'While they work, Dianne is telling Priya about the quilt — the frozen winter, the dresses cut on the kitchen floor — and stops where the maker goes. “It’ll come to me,” she says, to the chairs, and counts them again.',
        when: tookQuilt,
      },
    ],
  },
  choices: [
    {
      id: 'carry-tables',
      label: 'Take one end of the tables.',
      // fix-15: the act's one body gate, raised so it can actually lock on
      // a woman who refused every meal (FLESH starts at 3 and never drops).
      when: { op: 'stat.gte', stat: 'flesh', value: 5 },
      lockedLabel: 'Take one end of the tables. (Your hands know they would go through it.)',
      effects: [
        { op: 'stat.add', stat: 'flesh', value: 1 },
        { op: 'stat.add', stat: 'name', value: 1 },
        { op: 'fact.add', tag: 'helped-hall', witnessedBy: ['priya', 'dianne'] },
      ],
      goto: 'd5-hall-2',
    },
    {
      id: 'do-the-flyers',
      label: 'Take the staple gun and do the flyers.',
      effects: [
        { op: 'stat.add', stat: 'name', value: 1 },
        { op: 'fact.add', tag: 'hung-flyers', witnessedBy: ['dianne'] },
      ],
      goto: 'd5-hall-2',
    },
    {
      id: 'keep-to-the-edge',
      label: 'Keep to the edge of the room.',
      effects: [{ op: 'stat.add', stat: 'undertow', value: 1 }],
      goto: 'd5-hall-2',
    },
  ],
  cue: 'hall-upright',
});

const hall2 = defineScene({
  id: 'd5-hall-2',
  slot: 'morning',
  prose: {
    kind: 'inline',
    paragraphs: [
      {
        text: 'The tables are church-hall heavy and the work is real: lift, walk, set, square. Dianne pairs with you on the last two and directs traffic with her chin. "There, love. No — there." By the end your arms know you did it, which is its own kind of news.',
        when: { op: 'fact.knownBy', who: 'dianne', tag: 'helped-hall' },
      },
      {
        text: 'You put flyers up where Dianne points: the door, the noticeboard, the kitchen hatch. She watches you square each one to its frame like it matters, and doesn’t say what her face says, which is that it does.',
        when: { op: 'fact.knownBy', who: 'dianne', tag: 'hung-flyers' },
      },
      {
        text: 'You keep to the edge and the room lets you. Work has a way of closing over a person who doesn’t reach for it, like water.',
        when: {
          op: 'not',
          of: {
            op: 'any',
            of: [
              { op: 'fact.exists', tag: 'helped-hall' },
              { op: 'fact.exists', tag: 'hung-flyers' },
            ],
          },
        },
      },
      {
        text: 'Mid-morning, two of the men walk the upright piano out of the storage room and peel the dust sheet off it. Yellow keys, a water ring on the lid. It hasn’t been played since the hall stopped having reasons.',
      },
      {
        text: 'Priya passes it with her clipboard and stops. One finger. Three notes — right where the tune would turn, and every one of them steps the wrong way: down where the song climbs, up where it settles. Then she stops, puts the lid over the keys, and writes nothing on her list at all.',
      },
    ],
  },
  choices: [
    {
      id: 'hum-the-turn',
      label: 'Hum the turn back the way you know it.',
      effects: [
        { op: 'stat.add', stat: 'echo', value: 1 },
        { op: 'fact.add', tag: 'hummed-bar-four', witnessedBy: ['priya'] },
      ],
      goto: 'd5-hall-3',
    },
    {
      id: 'ask-who-played',
      label: '"Who played it, before?"',
      effects: [{ op: 'fact.add', tag: 'asked-who-played', witnessedBy: ['priya', 'dianne'] }],
      goto: 'd5-hall-3',
    },
    {
      id: 'let-the-lid-stay',
      label: 'Let the lid stay down.',
      effects: [{ op: 'stat.add', stat: 'undertow', value: 1 }],
      goto: 'd5-hall-3',
    },
  ],
});

const hall3 = defineScene({
  id: 'd5-hall-3',
  slot: 'morning',
  prose: {
    kind: 'inline',
    paragraphs: [
      {
        text: 'You hum it, under the room noise, only as far as the turn — down where she went up. Priya doesn’t look at you. Her hand closes around the clipboard hard enough to bow it; then she looks at the piano, as if the piano had done it. She writes one line, unhurried, and goes to count something that is already counted.',
        when: { op: 'fact.knownBy', who: 'priya', tag: 'hummed-bar-four' },
      },
      {
        text: 'Dianne answers from the stepladder, bright as paint: "Carols, some years. Mrs. Yee, when her hands let her." Which is an answer to a different question, and the room goes on setting up around the one you asked.',
        when: { op: 'fact.knownBy', who: 'dianne', tag: 'asked-who-played' },
      },
      {
        text: 'You let it lie. The water ring on the lid is the size of a mug nobody has owned for years.',
        when: {
          op: 'not',
          of: {
            op: 'any',
            of: [
              { op: 'fact.exists', tag: 'hummed-bar-four' },
              { op: 'fact.exists', tag: 'asked-who-played' },
            ],
          },
        },
      },
      {
        text: 'By noon the hall looks like a promise somebody intends to keep. Dianne sends you off with two squares of matrimonial cake in wax paper — "for the walk, hon" — and turns back to her lists.',
      },
    ],
  },
  choices: [
    { id: 'walk-back-down', label: 'Walk back down to the Kettle.', goto: 'd5-evening' },
  ],
});

const evening = defineScene({
  id: 'd5-evening',
  slot: 'evening',
  onEnter: [
    { op: 'time.set', slot: 'evening' },
    // fix-14: the Day-3 grammar holds on Day 5 — the hole has a sound.
    // Each motif's visual twin is the retelling paragraph below.
    { op: 'when', cond: rode, then: [detune('priya')] },
    { op: 'when', cond: wentToHall, then: [detune('tam')] },
  ],
  prose: {
    kind: 'inline',
    paragraphs: [
      {
        text: 'Evening fills the Kettle to its weeknight line: the crib game, two orchard crews, the windows going soft with steam. Moose keeps his post by the door.',
      },
      {
        text: 'The phones are gone from the counter. The two stools nearest yours stay empty until Tam comes in, and he takes the third.',
      },
      { text: '@line:barb:greeting-d5' },
      // ——— Without-you retelling: the hall, via Dianne on the phone to Barb.
      {
        text: '"Hall’s half-built already," Barb says, setting your plate down. "Dianne rang her order in and stayed on the line for the news: they got the old piano out from under its sheet today. Doctor had a go at it, she says. Three notes and shut the lid." She straightens cutlery she has already straightened. "Needs tuning. Always did."',
        when: rode,
      },
      {
        text: 'Later, under the crib pegs, a few upright-piano notes surface in the room’s noise — a shade flat, stepping the wrong direction, twice through and gone. Nobody in the diner is playing anything.',
        when: rode,
      },
      // ——— Without-you retelling: the ride, via Barb, who watches the road.
      {
        text: '"Tam held the 07:10 at the pull-in this morning," Barb says, with the pot in her hand. "Four minutes, engine running, watching the hill road. That man hasn’t run late in seven years — the schedule prints around him." She fills your cup. "Asked if I was holding unit one past the twenty-eighth, too. Came back with Dianne’s mail tubs and a mood you could stand a spoon in."',
        when: wentToHall,
      },
      {
        text: 'Under the room, low, a rhythm with no notes in it — idle, road, idle — surfaces twice and is gone. The crib pegs click on through it.',
        when: wentToHall,
      },
      { text: '@line:tam:evening-d5' },
      {
        text: 'The fog is at the glass by eight, taking the streetlight’s side of the argument. Coats go out in ones. Barb starts on the chairs, which is the clock.',
      },
    ],
  },
  choices: [{ id: 'turn-in', label: 'Turn in.', goto: 'd5-night' }],
  cue: 'pub-warm',
});

const night = defineScene({
  id: 'd5-night',
  slot: 'night',
  onEnter: [
    { op: 'time.set', slot: 'night' },
    { op: 'fact.add', tag: 'heard-fifth-horn' },
  ],
  prose: {
    kind: 'inline',
    paragraphs: [
      {
        text: '3:12. Five bars through the wall, the stop, the fog holding the shape of the last note a moment too long. You know the length of the silence after it to the breath now. You do not remember learning it.',
      },
    ],
  },
  choices: [{ id: 'let-morning-come', label: 'Let the morning come.', goto: 'd6-morning' }],
  cue: 'foghorn-312',
});

export const DAY5_SCENES: readonly Scene[] = [
  morning,
  ride,
  ride2,
  ride3,
  hall,
  hall2,
  hall3,
  evening,
  night,
];
