/**
 * DAY 6 — the recording (design/act1-beats.md §Day 6).
 *
 * Morning: the hall again (cue hall-upright; Priya cornering you politely —
 * notebook thread; if the Day-3 clinic was skipped she does the intake HERE,
 * compressed and cooler) OR Wade's old ticket office (cue wade-theme; the
 * cot, the kettle; nobody half-lives at a wharf and gets asked about it —
 * except, if you choose, by you; Wade's answers detune, ECHO≥4-gated per the
 * Day-4 rule, each detune's visual twin carried in the prose of the same
 * scene — playtest fix-03: prose is the canonical twin).
 *
 * NIGHT 6 (fixed, the act's dark beat): Sam in the lot at 2 AM with the
 * recording that has room tone where your voice was. He isn't threatening;
 * he's asking what you are. deny → STATIC +2 (marked lie, private fact —
 * Sam shows no one); say nothing; "I don't know" → UNDERTOW +2, fact
 * 'told-sam-dont-know' witnessed by sam (the seed of the game's most guarded
 * friendship). The clip is prose, not a @doc — sound can't be a document.
 *
 * d6-recording carries NO cue: the first scene in the game with no music.
 * The silence is the score. (d6-recording-2 stays silent too; the 3:12 horn
 * arrives in prose only, from the middle of the empty lot.)
 *
 * Integration note: `clinicSkipped` keys on Day 3's shipped clinic signals
 * (flag 'd3:slot' === 'clinic', fact 'went-to-clinic-d3' — see
 * scenes/day3.ts). If those markers move, update this Cond.
 */

import { defineScene, type Cond, type Scene } from '@not-here/engine';

const clinicSkipped: Cond = {
  op: 'not',
  of: {
    op: 'any',
    of: [
      { op: 'flag', key: 'd3:slot', value: 'clinic' },
      { op: 'fact.exists', tag: 'went-to-clinic-d3' },
    ],
  },
};

const wentToHall: Cond = { op: 'flag', key: 'd6:slot', value: 'hall' };
const wentToWharf: Cond = { op: 'flag', key: 'd6:slot', value: 'wharf' };
const trapSprung: Cond = { op: 'fact.exists', tag: 'fog-sam-trap-sprung' };

const morning = defineScene({
  id: 'd6-morning',
  slot: 'morning',
  onEnter: [{ op: 'time.set', day: 6, slot: 'morning' }],
  prose: {
    kind: 'inline',
    paragraphs: [
      {
        text: 'The snowline is into the top orchards now. The Kettle’s window has sweated itself a view, and Barb reads the fog the way other towns read a forecast.',
      },
      {
        text: '"Doctor’s been down the hall since eight, cornering the last of the prep," she says. "They’d have you back — Dianne said as much."',
      },
      {
        text: '"Or—" she wraps a loaf in a bread bag, ties it, and stands it on the counter like a small argument "—somebody could walk this down to Wade. He stops eating when the fog stays. Nobody says so out loud anymore."',
      },
    ],
  },
  choices: [
    {
      id: 'go-to-the-hall',
      label: 'Go down to the hall.',
      effects: [
        { op: 'flag.set', key: 'd6:slot', value: 'hall' },
        { op: 'fact.add', tag: 'went-to-hall-again', witnessedBy: ['priya'] },
      ],
      goto: 'd6-hall',
    },
    {
      id: 'walk-the-loaf-down',
      label: 'Walk the loaf down to the wharf.',
      effects: [
        { op: 'flag.set', key: 'd6:slot', value: 'wharf' },
        { op: 'fact.add', tag: 'helped-wade', witnessedBy: ['wade'] },
      ],
      goto: 'd6-ticket-office',
    },
  ],
});

const hall = defineScene({
  id: 'd6-hall',
  slot: 'morning',
  onEnter: [
    {
      op: 'when',
      cond: clinicSkipped,
      then: [{ op: 'fact.add', tag: 'intake-done-late', witnessedBy: ['priya'] }],
    },
  ],
  prose: {
    kind: 'inline',
    paragraphs: [
      {
        text: 'The hall is nearly a room for company: tables in ranks, the urns out, borrowed cutlery being counted into rolls. Priya is at the far end with the clipboard, and she doesn’t hurry over — she finishes her count first, which somehow makes it worse when she does come.',
      },
      {
        text: '"Since the mountain won’t come," she says, pleasantly, and there is the clinic folder, down here among the casserole lists. She does the intake standing up, compressed: height by eye, colour by eye, sleep — she watches you decide what to answer and writes the deciding, not the answer. "We’ll call that done, then." It takes four minutes. She has been waiting three days.',
        when: clinicSkipped,
      },
      {
        text: '"One thing," she says, and finds the page without hunting. She reads a sentence of yours back — your own words, level, in her voice — and watches your face while it comes home to you. "Still stand by that?" The pen waits. It is a friendly-looking pen.',
        when: { op: 'not', of: clinicSkipped },
      },
    ],
  },
  choices: [
    {
      id: 'answer-plainly',
      label: 'Answer everything, plainly.',
      effects: [
        { op: 'stat.add', stat: 'undertow', value: 1 },
        { op: 'fact.add', tag: 'answered-priya-plain', witnessedBy: ['priya'] },
      ],
      goto: 'd6-hall-2',
    },
    {
      id: 'defer-to-the-page',
      label: '"However you wrote it down is how it was."',
      effects: [
        { op: 'static.add', value: 2 },
        { op: 'fact.add', tag: 'deferred-to-priyas-page', witnessedBy: ['priya'] },
      ],
      goto: 'd6-hall-2',
    },
    {
      id: 'turn-the-question',
      label: '"Is the notebook for the clinic, or for you?"',
      effects: [{ op: 'fact.add', tag: 'turned-priyas-question', witnessedBy: ['priya'] }],
      goto: 'd6-hall-2',
    },
  ],
  cue: 'hall-upright',
});

const hall2 = defineScene({
  id: 'd6-hall-2',
  slot: 'morning',
  prose: {
    kind: 'inline',
    paragraphs: [
      {
        text: 'You answer what she asks, no more, no varnish. She writes exactly as long as you speak and not a word past it. At the end she caps the pen. "Thank you," she says, and some fraction of it is real, and she looks tired around the eyes for the first time since you met her.',
        when: { op: 'fact.knownBy', who: 'priya', tag: 'answered-priya-plain' },
      },
      {
        text: 'Something flickers behind the pleasantness — quick, filed. "That’s one way to keep a story straight," she says, lightly, and writes on after you’ve stopped talking, which a person only does when the interesting part wasn’t said.',
        when: { op: 'fact.knownBy', who: 'priya', tag: 'deferred-to-priyas-page' },
      },
      {
        text: '"For the clinic," she says, without a beat in between. Then, capping the pen: "The clinic’s files stay in the clinic." Which you notice is a smaller promise than it sounds like.',
        when: { op: 'fact.knownBy', who: 'priya', tag: 'turned-priyas-question' },
      },
      {
        text: 'On your way out you pass the upright. The lid is down, and the stack of potluck flyers has been squared on top of it, like a paperweight on a thing that might otherwise open.',
      },
    ],
  },
  choices: [
    { id: 'back-up-the-hill', label: 'Back up the hill before the light goes.', goto: 'd6-evening' },
  ],
});

const ticketOffice = defineScene({
  id: 'd6-ticket-office',
  slot: 'morning',
  // fix-09: this IS meeting Wade, for any route that skipped the Day-4
  // wharf — d7-hornroom reads the fact. Guarded so the ledger stays clean.
  onEnter: [
    {
      op: 'when',
      cond: { op: 'not', of: { op: 'fact.exists', tag: 'met-wade' } },
      then: [{ op: 'fact.add', tag: 'met-wade', witnessedBy: ['wade'] }],
    },
  ],
  prose: {
    kind: 'inline',
    paragraphs: [
      {
        text: 'The old ticket office is the one door on the wharf without a padlock. A knock gets you "It’s open," and inside is the whole winter of a man: the ticket window with its brass lip, a woodstove ticking, a cot made army-tight against the wall, one mug, one chair, a kettle on the stove ring. A coat on a nail. At the back, a green door whose padlock the weather has not been allowed near.',
      },
      {
        text: '"From Barb," you say, and stand the loaf on the table. Wade looks at it the way you’d look at weather arriving. "She thinks I don’t eat," he says, and cuts two slices, which is not a disagreement. Through the wall, faint, the compressor shed keeps its own low pulse. Nobody in the Bay asks why a man paid to mind a light keeps a bed where the horn can hear him. You could.',
      },
    ],
  },
  choices: [
    {
      id: 'ask-about-the-cot',
      label: '"You sleep down here, Wade?"',
      effects: [{ op: 'fact.add', tag: 'asked-about-the-cot', witnessedBy: ['wade'] }],
      goto: 'd6-ticket-2',
    },
    {
      id: 'ask-about-the-door',
      label: '"What’s through the green door?"',
      effects: [{ op: 'fact.add', tag: 'asked-about-horn-room', witnessedBy: ['wade'] }],
      goto: 'd6-ticket-2',
    },
    {
      id: 'warm-your-hands',
      label: 'Ask nothing. Warm your hands at the stove.',
      effects: [{ op: 'flag.set', key: 'd6:stove', value: true }],
      goto: 'd6-ticket-2',
    },
  ],
  cue: 'wade-theme',
});

const ticket2 = defineScene({
  id: 'd6-ticket-2',
  slot: 'morning',
  onEnter: [
    // Lie-detunes gate on ECHO≥4 after Day 4's freebie (act1-beats §Day 4).
    // Accessibility invariant: each detune's visual twin is the when-matched
    // 'quarter-turn flat' paragraph below (fix-03: prose is the twin).
    {
      op: 'when',
      cond: {
        op: 'all',
        of: [
          { op: 'fact.exists', tag: 'asked-about-the-cot' },
          { op: 'stat.gte', stat: 'echo', value: 4 },
        ],
      },
      then: [{ op: 'emit', event: { kind: 'music.detune', pattern: 'wade', cents: -50 } }],
    },
    {
      op: 'when',
      cond: {
        op: 'all',
        of: [
          { op: 'fact.exists', tag: 'asked-about-horn-room' },
          { op: 'stat.gte', stat: 'echo', value: 4 },
        ],
      },
      then: [{ op: 'emit', event: { kind: 'music.detune', pattern: 'wade', cents: -50 } }],
    },
  ],
  prose: {
    kind: 'inline',
    paragraphs: [
      {
        text: '"No," Wade says, to the stove. "Naps, some afternoons. Light wants checking nights, is all." He feeds the fire a split it doesn’t need. The kettle starts up its note under the lid.',
        when: { op: 'fact.exists', tag: 'asked-about-the-cot' },
      },
      {
        text: 'Under the kettle’s note, something goes a quarter-turn flat. Felt, not heard, the way a shelf settles at night.',
        when: {
          op: 'all',
          of: [
            { op: 'fact.exists', tag: 'asked-about-the-cot' },
            { op: 'stat.gte', stat: 'echo', value: 4 },
          ],
        },
      },
      {
        text: '"Compressor," Wade says. "For the light." The light on the breakwater runs off the pole line; you have seen the cable come down the hill. You let it stand. He turns the loaf-end in and cuts a third slice nobody asked for.',
        when: { op: 'fact.exists', tag: 'asked-about-horn-room' },
      },
      {
        text: 'Under the stove-tick, something goes a quarter-turn flat. The compressor keeps its pulse; the flatness is not the compressor.',
        when: {
          op: 'all',
          of: [
            { op: 'fact.exists', tag: 'asked-about-horn-room' },
            { op: 'stat.gte', stat: 'echo', value: 4 },
          ],
        },
      },
      {
        text: 'You put your hands out over the stove and he lets the quiet do the hosting. He pours the tea into the one mug and sets it at your side of the table, and keeps a jam jar for himself, and neither of you names the arrangement.',
        when: { op: 'flag', key: 'd6:stove' },
      },
      {
        text: 'When you go, he follows you out as far as the ticket window’s shadow and no farther, the way a man walks a guest to the edge of what’s his. Behind him the horn stands hooded at the wharf-end, facing the water, like a thing that has learned to wait.',
      },
    ],
  },
  choices: [{ id: 'walk-back-up', label: 'Walk back up before dark.', goto: 'd6-evening' }],
});

const evening = defineScene({
  id: 'd6-evening',
  slot: 'evening',
  onEnter: [{ op: 'time.set', slot: 'evening' }],
  prose: {
    kind: 'inline',
    paragraphs: [
      {
        text: 'The Kettle again, earlier than usual — the fog has moved everyone’s clocks up an hour without consulting them. Soup night. The crib board stays in its drawer.',
      },
      { text: '@line:barb:greeting-d6' },
      // ——— Without-you retelling: the wharf, via Barb (Sam was down there instead).
      {
        text: '"Sam spent his afternoon down the wharf with that phone out," Barb says, not looking up from the soup. "Wade sent him back up the hill — never went near him, just used the voice. The one off the ferry deck." She taps the ladle twice. "That boy is looking for something a screen can’t find." And that is as far as she goes with it.',
        when: wentToHall,
      },
      // ——— fix-14: the loaf you didn't walk down is still on the counter.
      {
        text: 'The loaf sits where she stood it this morning, re-wrapped once, by the till. Nobody walked it down. Nobody says so either.',
        when: wentToHall,
      },
      // ——— Without-you retelling: the hall, via Dianne’s stop-in; Priya’s
      //     notebook advances without you, which is exactly Priya.
      {
        text: '"Hall’s done, near enough," Barb says. "Dianne stopped in for stock cubes and gave me the tour of it in words. Doctor asked where you’d got to today." A beat, the pot going back on the ring. "Wrote something in that book of hers when Dianne couldn’t say."',
        when: wentToWharf,
      },
      {
        text: 'People go early. By nine it’s you, the furnace, and Moose at the door with his chin on his paws, keeping the only appointment he believes in. Barb doesn’t hurry you. She washes what’s washed already until you stand, says good night to the middle distance, and lets the room go dark behind you both.',
      },
    ],
  },
  choices: [{ id: 'cross-the-lot', label: 'Cross the lot to your unit.', goto: 'd6-recording' }],
  cue: 'pub-warm',
});

// NO cue, by design: the first scene in the game with no music. The mixer
// holds nothing under this; the silence is the point (act1-beats §Day 6).
// fix-05: the music.stop emit makes the silence real in both builds — the
// last cue must not be left looping under the act's designed quiet.
const recording = defineScene({
  id: 'd6-recording',
  slot: 'night',
  onEnter: [
    { op: 'time.set', slot: 'night' },
    { op: 'emit', event: { kind: 'music.stop' } },
  ],
  prose: {
    kind: 'inline',
    paragraphs: [
      {
        text: 'You don’t remember choosing the lot over the bed. It is two in the morning by the diner clock through the dark glass, and you are on the gravel between the units, and Sam is sitting on the tailgate of the dead pickup with his phone in both hands, coat over pyjama pants. He was waiting.',
      },
      // The silence's visual twin (fix-05): the beat exists for silent players.
      {
        text: 'The night has no undertone. No held chord, no room-hum arranging itself into music — only gravel under your boots and the diner furnace through glass. You notice because until now something always answered.',
      },
      {
        text: '"Tuesday," he says. No hello. "The diner. You were at the counter, talking with Barb. I was in the corner booth. Twelve minutes of it." He turns the phone flat on his palm, like dealing a card face up, and presses play.',
      },
      {
        text: 'The diner, to the life. The furnace. Crib pegs. Barb saying the fog’s got the week booked, and then leaving the kind of gap a person leaves for an answer. The gap is room tone. Furnace, a chair creak, the pegs. It runs the length you remember talking and not one grain longer, and then Barb laughs at whatever was said in it. There is nobody in the gap at all.',
      },
      {
        text: 'Sam thumbs it off. His hands are steady; it’s his voice that isn’t. "Eleven files like that. I stopped making them." He looks at you — level, tired, seven years older than eighteen. "Who’d believe I didn’t fake it. So I’m not showing anyone. I’m asking you." The lot is very quiet. "I’m not asking where my sister is. I’m asking what you are."',
      },
      // ——— fix-02: the shed came down the hill with him.
      {
        text: '"The bailiff," he says. "I keep coming back to that." Since the boat shed he hasn’t looked at you once, not straight on. He looks at you now.',
        when: trapSprung,
      },
    ],
  },
  choices: [
    {
      id: 'deny-the-file',
      label: '"The file’s doctored, Sam. It has to be."',
      stakes: 'major',
      when: { op: 'not', of: trapSprung },
      effects: [
        { op: 'static.add', value: 2 },
        { op: 'fact.add', tag: 'private:denied-sams-recording', witnessedBy: ['sam'] },
      ],
      goto: 'd6-recording-2',
    },
    {
      // fix-02: after the shed, the same lie has to walk past the bailiff.
      id: 'deny-the-file-sprung',
      label: '"The file’s doctored." The word goes out knowing how he’ll weigh it.',
      stakes: 'major',
      when: trapSprung,
      effects: [
        { op: 'static.add', value: 2 },
        { op: 'fact.add', tag: 'private:denied-sams-recording', witnessedBy: ['sam'] },
      ],
      goto: 'd6-recording-2',
    },
    {
      id: 'say-nothing',
      label: 'Say nothing.',
      stakes: 'major',
      effects: [{ op: 'flag.set', key: 'd6:said-nothing', value: true }],
      goto: 'd6-recording-2',
    },
    {
      id: 'say-i-dont-know',
      label: '"I don’t know."',
      stakes: 'major',
      effects: [
        { op: 'stat.add', stat: 'undertow', value: 2 },
        { op: 'fact.add', tag: 'told-sam-dont-know', witnessedBy: ['sam'] },
      ],
      goto: 'd6-recording-2',
    },
  ],
});

// Still no cue: the silence runs to the end of the night. The horn arrives
// as prose, from the middle of the empty lot.
const recording2 = defineScene({
  id: 'd6-recording-2',
  slot: 'night',
  prose: {
    kind: 'inline',
    paragraphs: [
      {
        text: 'Sam nods slowly, the way you nod at a wall you’ve hit before. "Yeah," he says. "That’s the sentence. Everyone’s got a copy." He pockets the phone and goes up the hill without hurrying, and doesn’t look back, and you stand in the lot with the nothing you chose instead.',
        when: { op: 'fact.knownBy', who: 'sam', tag: 'private:denied-sams-recording' },
      },
      {
        text: 'The two of you stand inside the quiet like it’s shelter. In the end something in his shoulders comes down an inch. "You’re the only one in this town who doesn’t lie to me," he says. "You just don’t say anything instead. That’s not the same. But it’s not nothing." He goes up the hill with his hood down in the cold.',
        when: { op: 'flag', key: 'd6:said-nothing' },
      },
      {
        text: 'It is out of you before you can weigh it, and it weighs nothing, and it is the heaviest true thing you own. Sam goes still. Then: "Okay," he says. He tries it again, softer, like a note he wasn’t sure the piano had: "You don’t know." One laugh, no sound in it. "That’s the first thing anybody in this town has said to me in seven years that wasn’t rehearsed." He slides off the tailgate. "I’m not going to tell them. Who’d believe that either."',
        when: {
          op: 'all',
          of: [
            { op: 'fact.knownBy', who: 'sam', tag: 'told-sam-dont-know' },
            { op: 'not', of: { op: 'flag', key: 'd3:trap', value: 'admitted' } },
          ],
        },
      },
      // ——— fix-02: he has heard you not-know before, at the shed, on purpose.
      {
        text: 'It is out of you before you can weigh it. Sam goes still, and then a sound that is nearly a laugh. "Twice now," he says. "You keep not knowing things at me. Nobody here does that once." He slides off the tailgate. "I’m not going to tell them. Who’d believe that either."',
        when: {
          op: 'all',
          of: [
            { op: 'fact.knownBy', who: 'sam', tag: 'told-sam-dont-know' },
            { op: 'flag', key: 'd3:trap', value: 'admitted' },
          ],
        },
      },
      {
        text: 'At 3:12 the horn takes up over the water, five bars into the fog. Sam is gone by then; his window is dark by the second bar. You stand in the middle of the lot and listen the whole way through, and for the first time the stop at the end sounds less like something missing and more like something being left for you to say.',
      },
    ],
  },
  choices: [{ id: 'go-in-eventually', label: 'Go in, eventually.', goto: 'd7-morning' }],
});

export const DAY6_SCENES: readonly Scene[] = [
  morning,
  hall,
  hall2,
  ticketOffice,
  ticket2,
  evening,
  recording,
  recording2,
];
