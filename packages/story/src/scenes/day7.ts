/**
 * DAY 7 — breath, then the branch (design/act1-beats.md §Day 7).
 *
 * Single quiet morning slot (the register briefly open — thread beat 2, no
 * comment from anyone), a short early-fog evening, and then the act's one
 * railroad: the walk to the wharf at 3:12 and THE FOGHORN CHOICE. The act
 * ends on the walk back up and the ACT TWO title card ('act1-end', now the
 * unsealed act boundary: one choice carries the player into d8-morning).
 *
 * The evening comes in two variants (pt2-fix-01: the shore road was a null
 * branch on the climax day): stay the morning and 'd7-evening' plays as
 * before; take the shore road and 'd7-shore' carries the walk — the wharf
 * by daylight, the highway pull-in, the ringed Friday in the wild — and
 * lands at the same closing-time goodnight. Both converge on 'd7-walk'.
 *
 * Flags this file owns (Act 2 branches on them):
 *   'horn-on'              — the player told Wade to keep playing
 *   'horn-stopped'         — the player closed the valve herself
 *   'wade-confession-seed' — Wade's confession path opens early (horn-on)
 *   'd7:walked-shore'      — the morning went to the shore road
 * Facts: 'let-wade-play' / 'stopped-the-horn', witnessed by wade only;
 * 'stood-at-the-pull-in', witnessed by nobody — nobody could have.
 * The presence-decay mechanic itself is Act 2's; Act 1 only announces it —
 * the '(Something has started counting.)' visual tell rides the lie-down
 * choice out of d7-after (playtest fix-03: it is the LAST thing Act 1 says).
 *
 * Prose invariants in force (design/game-bible.md §Prose grammar): nobody
 * touches you first — in the Stop branch YOU reach past Wade and touch the
 * HORN, never him; nobody remarks that anything is strange.
 */

import { defineScene, type Choice, type Cond, type Scene } from '@not-here/engine';

const hornOn: Cond = { op: 'flag', key: 'horn-on' };
const hornStopped: Cond = { op: 'flag', key: 'horn-stopped' };
const tookQuilt: Cond = { op: 'fact.exists', tag: 'private:memory-taken' };
const deniedSam: Cond = { op: 'fact.exists', tag: 'private:denied-sams-recording' };
const answeredSamHonestly: Cond = { op: 'fact.exists', tag: 'told-sam-dont-know' };
const gaveSamSilence: Cond = { op: 'flag', key: 'd6:said-nothing' };
const neverSaysGoodbye: Cond = { op: 'flag', key: 'n1:goodbye', value: 'never' };
const forgotLeaving: Cond = { op: 'flag', key: 'n1:goodbye', value: 'forgot' };
const saidGoodbyeToDoor: Cond = { op: 'flag', key: 'n1:goodbye', value: 'door' };
const hummedChart: Cond = { op: 'flag', key: 'd3:hummed-chart' };

// ——— Morning: the book briefly open (register thread, beat 2) ———

const morning = defineScene({
  id: 'd7-morning',
  slot: 'morning',
  onEnter: [
    { op: 'time.set', day: 7, slot: 'morning' },
    { op: 'flag.set', key: 'register:seen-blank-name', value: true },
  ],
  prose: {
    kind: 'inline',
    paragraphs: [
      {
        text: 'The fog doesn’t burn off. Morning comes up grey on grey, and the crows keep whatever they have to themselves. Across the lot the diner light is on early, or still.',
      },
      {
        text: 'Inside it’s just Barb. The register lies open on the counter — she is going down the month with one finger, some arithmetic of her own — and she doesn’t close it when you come in. From your stool you can read the page. There is nothing on it that isn’t yours.',
      },
      {
        text: '@doc:\n┌──────────────────────────────────────────────┐\n│  THE KETTLE — REGISTER                       │\n│                                              │\n│  DATE      NAME           UNIT   REMARKS     │\n│  Nov 6                    1      supper,     │\n│                                  tab         │\n└──────────────────────────────────────────────┘',
      },
      {
        text: 'One line for November. The date, the unit, the supper — beneath each dark word, a first hand has faded to a pressure mark, the paper remembering what the ink would not. Some of it has been written back lately. And the NAME column is still open, six days now, the way you’d leave a chair for someone.',
      },
      {
        text: 'Tucked under the cover is a loose slip in Dianne’s hand: quilt maker? Barb has written one name beneath it, lightly, and not gone over the ink.',
        when: tookQuilt,
      },
      {
        text: 'Barb squares the book shut on her way past — no hurry in it, a chapter finished rather than a page lost — and pours your coffee. "Quiet one today," she says, to the pot. It is.',
      },
    ],
  },
  choices: [
    {
      id: 'stay-the-morning',
      label: 'Stay at the counter while she works.',
      effects: [
        { op: 'stat.add', stat: 'flesh', value: 1 },
        { op: 'fact.add', tag: 'kept-barb-company', witnessedBy: ['barb'] },
      ],
      goto: 'd7-evening',
    },
    {
      // pt2-fix-01: the walk feeds UNDERTOW the way the counter feeds FLESH —
      // a morning spent as nobody, on purpose.
      id: 'shore-road',
      label: 'Take the coffee with you and walk the shore road.',
      effects: [
        { op: 'flag.set', key: 'd7:walked-shore', value: true },
        { op: 'stat.add', stat: 'undertow', value: 1 },
      ],
      goto: 'd7-shore',
    },
  ],
});

// ——— Evening: short; the fog in early; "Sleep well tonight." ———

const evening = defineScene({
  id: 'd7-evening',
  slot: 'evening',
  onEnter: [{ op: 'time.set', slot: 'evening' }],
  prose: {
    kind: 'inline',
    paragraphs: [
      {
        text: 'The fog comes in early and means it. By four the streetlights are on and might as well not be; by five the hills are gone and the town has pulled its shoulders in. The men look at the window, and settle up, and go while there’s still a road to go by.',
      },
      // ——— fix-14, resized by pt2-fix-01: the shore branch has its own
      // evening now ('d7-shore'); this scene plays the stayed morning only.
      {
        text: 'The morning went into the till roll and the pie, and Barb let you stay inside the work of it, and neither of you counted the hours.',
        when: { op: 'fact.exists', tag: 'kept-barb-company' },
      },
      {
        text: 'No crib game tonight. Moose takes his post at the door early, facing the lot, waiting on the last run the way he does. Barb turns the sign around at half past seven, and nobody is there to see it but you.',
      },
      {
        text: 'By the till, the EBUS schedule has curled under its tape. Friday the twenty-eighth is still ringed twice, blue on blue, hard as a bruise.',
      },
      { text: '@line:barb:goodnight' },
      { text: 'It is not clear she believes you will.' },
    ],
  },
  choices: [
    { id: 'cross-the-lot', label: 'Cross the lot to your unit.', goto: 'd7-walk' },
  ],
  cue: 'pub-warm',
});

// ——— The shore road (pt2-fix-01) — the other evening. A held-breath walk:
// the wharf by daylight, the pull-in above it, the same goodnight. Nothing
// happens, on purpose; the dread is in what the landscape is for. ———

const shoreRoad = defineScene({
  id: 'd7-shore',
  slot: 'evening',
  onEnter: [
    { op: 'time.set', slot: 'evening' },
    // Unwitnessed on purpose: who could see you out there? Nobody did.
    { op: 'fact.add', tag: 'stood-at-the-pull-in' },
  ],
  prose: {
    kind: 'inline',
    paragraphs: [
      {
        text: 'The shore road takes the heat out of the cup before the first bend. Fog sits on the water in one long held breath; frost fans hold the shade. The town gives you up a house at a time — woodsmoke, a lit kitchen, then gravel and your own boots, the loudest thing left. Nobody passes. Nothing turns to look.',
      },
      {
        text: 'Where the road runs out along the water, the old wharf comes through the fog in pieces: pilings, the shut compressor shed, the breakwater light burning its small daylight nothing. You can see the whole walk of it from here — the boards, the door at the end — and your feet slow without consulting you. By day the horn is just a shape. It has nothing to say until it does.',
      },
      {
        text: 'Above the wharf the road climbs to the highway pull-in: a widening of gravel, a pole, a bench worn bare where people have waited. Behind the scratched glass of the notice frame, the same schedule card as the diner’s — the same Friday ringed twice, blue on blue, all the way out here. Whoever rings a date twice rings every copy.',
      },
      {
        text: 'You sit on the bench until the cold comes through your coat. The highway is one long sound that never arrives. The pull-in is built for one thing, and it goes on doing it empty: holding a place where a person will stand with a bag and wait. You get up before you can learn how long you would have stayed.',
      },
      {
        text: 'The fog comes in early and means it. It walks you back — hills gone first, then roofs, then the diner light, which comes back a piece at a time as you cross to it. The Kettle is chairs-up, the crib board away, Moose at his post facing the lot. You set the cup by the register. Barb turns the sign around at half past seven with you on the warm side of it.',
      },
      { text: '@line:barb:goodnight' },
      { text: 'It is not clear she believes you will.' },
    ],
  },
  choices: [
    { id: 'cross-the-lot', label: 'Cross the lot to your unit.', goto: 'd7-walk' },
  ],
  cue: 'pub-warm',
});

// ——— THE WALK — the act's one railroad. Under 120 words, all dread. ———

const walk = defineScene({
  id: 'd7-walk',
  slot: 'night',
  onEnter: [{ op: 'time.set', slot: 'night' }],
  prose: {
    kind: 'inline',
    paragraphs: [
      {
        text: 'You lie down in your clothes. Night passes without stopping. At 3:12 you are awake, dressed, at the door with your hand on the cold latch. None of these were decisions.',
      },
      {
        text: 'The horn is playing. You go down through the sleeping town toward it — past the General, past the hall — and where the road gives onto the old wharf the fog parts along the boards ahead of you, a corridor exactly your width. It closes again behind. You don’t look.',
      },
      {
        text: 'Five bars, the stop. Then, for the first time all week, the first note comes again. Five bars, nearer. The horn room door at the end stands open. The light inside is the color of a kept fire.',
      },
    ],
  },
  choices: [
    {
      id: 'for-the-song',
      label: 'Go in because the song has been calling you all week.',
      effects: [{ op: 'flag.set', key: 'd7:entered-for', value: 'song' }],
      goto: 'd7-hornroom',
    },
    {
      id: 'for-sam',
      label: 'Go in because Sam asked what you are.',
      effects: [{ op: 'flag.set', key: 'd7:entered-for', value: 'sam' }],
      goto: 'd7-hornroom',
    },
    {
      id: 'for-the-town',
      label: 'Go in because someone has to stop pretending.',
      effects: [{ op: 'flag.set', key: 'd7:entered-for', value: 'town' }],
      goto: 'd7-hornroom',
    },
  ],
  cue: 'foghorn-312',
});

// ——— THE HORN ROOM — the Foghorn Choice ———

const keepPlayingChoice: Choice = {
  id: 'keep-playing',
  label: '"Keep playing."',
  stakes: 'major',
  effects: [
    { op: 'flag.set', key: 'horn-on', value: true },
    { op: 'fact.add', tag: 'let-wade-play', witnessedBy: ['wade'] },
    { op: 'flag.set', key: 'wade-confession-seed', value: true },
  ],
  goto: 'd7-after',
};

const stopChoice: Choice = {
  id: 'stop',
  label: '"Stop."',
  stakes: 'major',
  effects: [
    { op: 'flag.set', key: 'horn-stopped', value: true },
    { op: 'fact.add', tag: 'stopped-the-horn', witnessedBy: ['wade'] },
    { op: 'static.add', value: -5 },
  ],
  goto: 'd7-silence',
};

const hornroom = defineScene({
  id: 'd7-hornroom',
  slot: 'night',
  prose: {
    kind: 'inline',
    paragraphs: [
      {
        text: 'Wade at the valves. You have seen men stand that way at a wheelhouse: feet apart, hands light, the whole body listening. The compressor breathes behind him and the horn takes the breath and turns it into the tune you know — and here, not through a wall, not across water, it has a body. It stands in the room with you. It moves the air in your chest on its way out over the lake.',
      },
      {
        text: 'Five bars whole, at full voice for the first time. The fifth leans forward the way it always leans, and the silence where a sixth should go is not silence in here. It is a held breath. The whole room makes it together — the man, the machine, and you.',
      },
      {
        text: 'The song called you here, and the answer in your body is old enough to feel borrowed.',
        when: { op: 'flag', key: 'd7:entered-for', value: 'song' },
      },
      {
        text: 'Sam’s question has followed you down the boards. What are you? In this room it stops sounding like an accusation and starts sounding like a door.',
        when: { op: 'flag', key: 'd7:entered-for', value: 'sam' },
      },
      {
        text: 'The whole town has made a room around this sound and called the room weather. Standing inside it, you can feel how much work pretending is.',
        when: { op: 'flag', key: 'd7:entered-for', value: 'town' },
      },
      {
        text: 'You told Barb you never say goodbye. The horn has spent seven years making the same refusal.',
        when: neverSaysGoodbye,
      },
      {
        text: 'You told Barb you don’t remember leaving. Tonight the road from your bed to this room is another blank with your footprints through it.',
        when: forgotLeaving,
      },
      {
        text: 'You told Barb you said goodbye to the door. Tonight another door stood open, and you came through.',
        when: saidGoodbyeToDoor,
      },
      {
        text: 'You hummed the first line from the wardrobe once. In here the horn gives it back at a size that makes the paper version feel like a warning.',
        when: hummedChart,
      },
      {
        text: 'The lie you gave Sam has followed too. It stands behind you in the doorway and has no room tone to hide in.',
        when: deniedSam,
      },
      {
        text: 'The true thing you gave Sam has followed too: I don’t know. Here, under the horn, it feels less like emptiness than a debt.',
        when: answeredSamHonestly,
      },
      {
        text: 'The nothing you gave Sam has followed too. It is not silence. You know that now.',
        when: gaveSamSilence,
      },
      // ——— fix-09: the widest route arrives a stranger, and the scene knows.
      {
        text: 'You have never spoken to this man. You know his name the way you know the song — from the wrong side of a wall.',
        when: {
          op: 'all',
          of: [
            { op: 'not', of: { op: 'fact.exists', tag: 'met-wade' } },
            { op: 'not', of: { op: 'fact.exists', tag: 'helped-wade' } },
          ],
        },
      },
      {
        text: 'He sees you. His eyes come to the door, find you, and go back to the valves. He doesn’t stop. He doesn’t miss a beat to the seeing. The song goes out again over the water, patient as weather, and his hands wait on the brass for whatever you have come down to say.',
      },
      {
        text: 'Between one phrase and the next, the floor finds more of your weight. Warmth gathers in your palms. The horn is not only calling you; it is keeping you. Wade watches the gauge instead of your face, and the lack of surprise is another answer.',
      },
      {
        text: 'The feeling has the clean edges of the quilt story entering you: something becoming yours while its first owner goes thin around it. This time you recognize the bargain before you make it.',
        when: tookQuilt,
      },
    ],
  },
  choices: [
    keepPlayingChoice,
    stopChoice,
    {
      id: 'ask-sixth-bar',
      label: 'Ask him what the sixth bar is.',
      stakes: 'major',
      effects: [{ op: 'fact.add', tag: 'asked-wade-sixth-bar', witnessedBy: ['wade'] }],
      goto: 'd7-sixth-question',
    },
  ],
  cue: 'horn-close',
});

// ——— The question before the choice — Wade answers what he knows, truthfully. ———

const sixthQuestion = defineScene({
  id: 'd7-sixth-question',
  slot: 'night',
  prose: {
    kind: 'inline',
    paragraphs: [
      { text: '“What’s the sixth bar?”' },
      {
        text: 'Wade’s hands stop without closing the valve. The horn spends the last of the fifth bar, and the room holds its breath.',
      },
      {
        text: '“There wasn’t one,” he says. The machine keeps its pitch. “She never finished it.”',
      },
      {
        text: 'The answer fits every memory in you and leaves the blank exactly where it was. Then his hand settles on the brass again, waiting on what you came to say.',
      },
    ],
  },
  choices: [keepPlayingChoice, stopChoice],
});

// ——— The valve closed: the loudest thing in the act ———

const silence = defineScene({
  id: 'd7-silence',
  slot: 'night',
  // fix-05: the valve closes and so does the mixer — nothing may loop under
  // "there is no music of any kind."
  onEnter: [{ op: 'emit', event: { kind: 'music.stop' } }],
  prose: {
    kind: 'inline',
    paragraphs: [
      {
        text: 'You cross the floor. He watches you come and his hands stay where they are, and you reach past him — close enough to smell machine oil and wet wool — and you shut the valve yourself. Brass, warm from its work. The horn draws one more breath and lets it go unspent.',
      },
      {
        text: 'What comes after is not quiet. Seven years of nights had that sound in them, and every one of them backs up into the room at once. The compressor idles down through its registers like a thing lying down to sleep. You can hear the fog against the doorway. You can hear that it makes no sound at all.',
      },
      {
        text: '"Okay," Wade says. To the valves, not to you. He turns a small brass screw a quarter-turn, and the air goes out of everything. He doesn’t play it again. He doesn’t look at you again. In all of Lorn Bay, for the first time in seven years, there is no music of any kind.',
      },
    ],
  },
  choices: [{ id: 'walk-back', label: 'Walk back up.', goto: 'd7-after' }],
});

// ——— AFTER — the walk home, one paragraph either way ———

const after = defineScene({
  id: 'd7-after',
  slot: 'night',
  prose: {
    kind: 'inline',
    paragraphs: [
      {
        text: '“Keep playing.” Wade’s fingers settle on the brass, which is how you learn he was afraid. “I wondered when you’d come down,” he says. Not welcome. Confirmation. Then he gives the horn the next first note.',
        when: hornOn,
      },
      {
        text: 'The phrase returns before the room has given back the last one. Wade feeds it air. Each pass leaves you a little more weight for the boards to carry. He does not ask who pays the difference. Neither do you.',
        when: hornOn,
      },
      {
        text: 'You climb home with the song at your back, going out over the water like a lamp left burning in a room behind you. It is still playing when you reach the lot, still playing when you lie down — five bars, the stop, five bars — and something in you is fed by it, and lets itself be, and you don’t ask that something its name. Somewhere up the hill, or only in the song, a woman loses the next line of a thing she had been humming. The horn covers it kindly.',
        when: hornOn,
      },
      {
        text: 'You climb home through a town with nothing underneath it. Your boots are the only sound between the wharf and your door, and they are not enough. The fog has stopped moving. Twice you stop to listen — the way you’d press on a bruise — and the silence comes back richer each time, better fed, like it has already learned to eat. Nothing calls you anything, the whole way home.',
        when: hornStopped,
      },
    ],
  },
  choices: [
    {
      id: 'lie-down',
      label: 'Lie down.',
      // Decay seeding: Act 2 implements the nightly count; Act 1 announces
      // it once, on the lie-down — the last thing the act says (fix-03).
      effects: [
        {
          op: 'when',
          cond: hornStopped,
          then: [
            {
              op: 'emit',
              event: { kind: 'tell.visual', text: '(Something has started counting.)' },
            },
          ],
        },
      ],
      goto: 'act1-end',
    },
  ],
});

// ——— ACT TWO title card — the unsealed act boundary (Act 2 continues) ———

const actEnd = defineScene({
  id: 'act1-end',
  onEnter: [{ op: 'time.set', day: 8, slot: 'morning' }],
  prose: {
    kind: 'inline',
    paragraphs: [{ text: '' }, { text: 'ACT TWO' }, { text: '' }],
  },
  choices: [
    { id: 'morning-comes-anyway', label: 'Morning comes anyway.', goto: 'd8-morning' },
  ],
  cue: 'title',
});

export const DAY7_SCENES: readonly Scene[] = [
  morning,
  evening,
  shoreRoad,
  walk,
  hornroom,
  sixthQuestion,
  silence,
  after,
  actEnd,
];
