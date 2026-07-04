/**
 * DAY 4 — Wade, and the first audible lie.
 * Beat sheet: design/act1-beats.md §Day 4. A: the wharf (Wade intro; the
 * horn room refused; "Not well." — the FIRST lie-detune, unGated, its
 * visual twin the exact marginal note from the sheet). B: Barb's errand
 * (the walk-in; Moose beat #2 — he stares at the held door, not at the
 * hands holding it). C: Dianne follow-up (the albums gone from the shelf;
 * if the quilt memory was taken on Day 3, the cost lands here in one line,
 * uncommented).
 *
 * Evening is fixed regardless of the morning: Sam lays two phones side by
 * side on the counter — clue #6 planted in public, and nobody comments.
 * Night 4: the horn, brief. Prose invariants per design/game-bible.md.
 */

import { defineScene, type Cond, type Scene } from '@not-here/engine';

const tookQuilt: Cond = { op: 'fact.exists', tag: 'private:memory-taken' };
const leftQuilt: Cond = {
  op: 'all',
  of: [{ op: 'flag', key: 'd3:slot', value: 'room' }, { op: 'not', of: tookQuilt }],
};

const morning = defineScene({
  id: 'd4-morning',
  slot: 'morning',
  onEnter: [{ op: 'time.set', day: 4, slot: 'morning' }],
  prose: {
    kind: 'inline',
    paragraphs: [
      {
        text: 'Frost on the lot this morning, first of the year worth the name. The snowline is a hand lower on the hills. Barb slides the toast over and keeps hold of her own thoughts until the coffee is down.',
      },
      {
        text: '“Wade Pike’s down the old wharf, mornings,” she says. “District pays him to mind the breakwater light. What else he minds out there is his own business. He could stand a visitor who doesn’t want anything off him.”',
      },
      {
        text: '“Or my walk-in wants shelving before the frost order lands. Or Dianne’s on her own at the store till noon — she’s been carrying boxes up to the house all week.” She tops the coffee. “Pick one. The day’ll spend itself regardless.”',
      },
    ],
  },
  choices: [
    {
      id: 'to-wharf',
      label: 'Walk down to the old wharf.',
      effects: [
        { op: 'flag.set', key: 'd4:slot', value: 'wharf' },
        { op: 'fact.add', tag: 'went-to-wharf-d4', witnessedBy: ['barb'] },
      ],
      goto: 'd4-wharf',
    },
    {
      id: 'to-errand',
      label: 'Stay and shelve the walk-in.',
      effects: [{ op: 'flag.set', key: 'd4:slot', value: 'errand' }],
      goto: 'd4-errand',
    },
    {
      id: 'to-dianne',
      label: 'Go to the General.',
      effects: [
        { op: 'flag.set', key: 'd4:slot', value: 'dianne' },
        { op: 'fact.add', tag: 'went-to-dianne-d4', witnessedBy: ['barb'] },
      ],
      goto: 'd4-dianne',
    },
  ],
});

// ——— A. The wharf. Wade, and the door that stays shut.

const wharf = defineScene({
  id: 'd4-wharf',
  slot: 'morning',
  onEnter: [{ op: 'fact.add', tag: 'met-wade', witnessedBy: ['wade'] }],
  prose: {
    kind: 'inline',
    paragraphs: [
      {
        text: 'The old ferry wharf keeps its own weather. Planks silvered, bull rail gapped, the breakwater light at the end going round for nobody. Halfway out, a shed hums — a compressor, fed and warm, better roofed than some houses in town.',
      },
      {
        text: 'Wade Pike is in the shed doorway with a grease rag, and he watches you the whole way down the boards, which takes a while, which he lets it.',
      },
      {
        text: 'He shows you the compressor because you are looking at it: tank, governor, a rebuilt gauge older than either of you. He shows you the light because it can be seen from shore. At the far door — new hasp, brass lock gone green — he stops being a tour. “That’s shut,” he says, and it is the whole sentence.',
      },
    ],
  },
  choices: [
    {
      id: 'ask-direct',
      label: '“Did you know her well?”',
      effects: [{ op: 'flag.set', key: 'd4:asked', value: 'direct' }],
      goto: 'd4-wharf-2',
    },
    {
      id: 'ask-sideways',
      label: 'Ask about the light first, and let the real question surface on its own.',
      effects: [{ op: 'flag.set', key: 'd4:asked', value: 'sideways' }],
      goto: 'd4-wharf-2',
    },
  ],
  cue: 'wade-theme',
});

const wharf2 = defineScene({
  id: 'd4-wharf-2',
  slot: 'morning',
  onEnter: [
    { op: 'fact.add', tag: 'asked-wade-knew-her', about: 'wade', witnessedBy: ['wade'] },
    { op: 'flag.set', key: 'heard-first-lie-detune', value: true },
    { op: 'emit', event: { kind: 'music.detune', pattern: 'wade', cents: -50 } },
    {
      op: 'emit',
      event: { kind: 'tell.visual', text: '— something in the room goes a quarter-turn flat.' },
    },
  ],
  prose: {
    kind: 'inline',
    paragraphs: [
      {
        text: 'He takes the question the way he takes weather: no move at all.',
        when: { op: 'flag', key: 'd4:asked', value: 'direct' },
      },
      {
        text: 'He gives the light its history — the lens, the year the district rewired it — and the question is out of you before the history ends, the way questions get out.',
        when: { op: 'flag', key: 'd4:asked', value: 'sideways' },
      },
      {
        text: '“Not well.” He folds the rag over once. “To wave at. Everybody knew her a little.” He checks a gauge that has not moved since he checked it.',
      },
      {
        text: 'Under the compressor hum, something settles a quarter-turn flat — the way a shelf settles at night in a house you know. Felt, not heard. Wade wipes the valve stem he has already wiped.',
      },
      {
        text: 'He walks you back the length of the wharf without another word in him. At the shore end he says, “Mind the third plank,” which is the friendliest thing that has happened out here.',
      },
    ],
  },
  choices: [{ id: 'leave-him', label: 'Leave him to the light.', goto: 'd4-evening' }],
});

// ——— B. Barb's errand. The walk-in; Moose beat #2.

const errand = defineScene({
  id: 'd4-errand',
  slot: 'morning',
  onEnter: [
    { op: 'fact.add', tag: 'helped-barb-walkin', witnessedBy: ['barb'] },
    { op: 'stat.add', stat: 'flesh', value: 1 },
    { op: 'stat.add', stat: 'name', value: 1 },
    { op: 'flag.set', key: 'moose-beat-2', value: true },
  ],
  prose: {
    kind: 'inline',
    paragraphs: [
      {
        text: 'The walk-in wants everything out before anything goes back: crates walked to the kitchen, shelves wiped, new paper cut to fit. Cold breath on your arms, dates and weights called from the doorway. For an hour you and Barb are a system, and the system works.',
      },
      {
        text: 'Moose leaves his post and comes as far as the kitchen doorway. You are holding the walk-in door wide with your shoulder, crate in both hands, and he stares at the door — at the door, standing open on nothing he can find — and waits, patient as furniture, until it swings to. Then he goes back to his spot and lies down with a sound like a dropped duffel.',
      },
      {
        text: '“Mind the front a minute,” Barb says at some point, and is gone into the yard a full five, leaving you alone with the till, the book, and the coffee. It is a wage of a kind, and both of you know the size of it.',
        when: { op: 'derived.gte', key: 'warmth:barb', value: 7 },
      },
    ],
  },
  choices: [
    { id: 'finish-out', label: 'Work it through to the last crate.', goto: 'd4-evening' },
  ],
});

// ——— C. Dianne follow-up. The shelf gap; the quilt's cost, if it was paid.

const dianne = defineScene({
  id: 'd4-dianne',
  slot: 'morning',
  onEnter: [
    { op: 'fact.add', tag: 'visited-dianne-d4', witnessedBy: ['dianne'] },
    { op: 'fact.add', tag: 'saw-album-gap' },
  ],
  prose: {
    kind: 'inline',
    paragraphs: [
      {
        text: 'The General smells of paraffin and parcel tape, and the bell over the door does its one job. Dianne looks up from the mail tubs. “There’s my girl,” she says. “Sit by the heater. It’s just come good.”',
      },
      {
        text: 'Behind the till, something has changed shape. The long shelf under the lake-level card is empty — a stripe of unfaded paint where a row of fat spines stood. You know their shape before you know you know it. Albums.',
      },
      {
        text: '“Up at the house,” Dianne says, following your eye. “Being sorted.” It comes out smooth, a stone the river has had for years. She weighs a parcel that doesn’t need weighing.',
      },
      {
        text: 'The quilt is folded on the parcel shelf, back off the line, stiff with November. She puts a hand flat on it, the way she does. “Somebody made this,” she says. “I want to say—” She squares the corner of the fold. “It’ll come to me, hon.” The scale settles. She reads out the postage.',
        when: tookQuilt,
      },
      {
        text: 'The quilt is folded on the parcel shelf, back off the line. “My mother pieced that,” she says in passing, hand flat on it a moment, and the whole story is in her face for a second, safe where it lives. “You’ll want tea.”',
        when: leftQuilt,
      },
    ],
  },
  choices: [
    {
      id: 'stay-sort',
      label: 'Stay and sort the mail tubs with her.',
      effects: [
        { op: 'stat.add', stat: 'name', value: 1 },
        { op: 'fact.add', tag: 'stayed-with-dianne-d4', witnessedBy: ['dianne'] },
      ],
      goto: 'd4-evening',
    },
    { id: 'go-easy', label: 'Keep it a short visit. Leave her the morning.', goto: 'd4-evening' },
  ],
  cue: 'dianne-theme',
});

// ——— Evening, fixed: two phones, side by side. Clue #6, in public.

const evening = defineScene({
  id: 'd4-evening',
  slot: 'evening',
  onEnter: [
    { op: 'time.set', slot: 'evening' },
    { op: 'fact.add', tag: 'two-phones-laid-out', about: 'sam', witnessedBy: ['sam', 'barb', 'tam'] },
  ],
  prose: {
    kind: 'inline',
    paragraphs: [
      {
        text: 'The Kettle at supper: the crib board, the orchard men, gravy weather. Tam is on his stool with his gloves drying on the rail.',
      },
      { text: '@line:barb:greeting' },
      {
        text: 'Sam comes in with the cold on him and doesn’t take his coat off. He sets two phones on the counter, side by side, screens up — his and one he’s borrowed — and turns them with one finger until they face the room.',
      },
      {
        text: 'The same minute, twice: the hall steps, two days back, tables going in for the potluck. You remember passing. You are at the edge of both frames, half-turned. Two phones, one minute, one you in each. The screens sit there being level with everybody.',
      },
      {
        text: 'He says nothing. Nobody says anything. Tam finds the bottom of his coffee. Barb discovers the far end of the counter. Whoever looks, looks away first, and everybody looks. The screens go dark on their own schedule, and Sam pockets both phones and orders nothing.',
      },
    ],
  },
  choices: [
    {
      id: 'look-longest',
      label: 'Look until the screens sleep.',
      effects: [
        { op: 'stat.add', stat: 'undertow', value: 1 },
        { op: 'fact.add', tag: 'studied-the-photos', witnessedBy: ['sam'] },
      ],
      goto: 'd4-night',
    },
    {
      id: 'back-to-plate',
      label: 'Give your plate your whole attention.',
      effects: [
        { op: 'static.add', value: 2 },
        { op: 'fact.add', tag: 'looked-away-from-photos', witnessedBy: ['sam'] },
      ],
      goto: 'd4-night',
    },
  ],
  cue: 'pub-warm',
});

// ——— Night 4: the horn, brief.

const night = defineScene({
  id: 'd4-night',
  slot: 'night',
  onEnter: [
    { op: 'time.set', slot: 'night' },
    { op: 'fact.add', tag: 'heard-fourth-horn' },
  ],
  prose: {
    kind: 'inline',
    paragraphs: [
      {
        text: '3:12 finds you the way it has taken to finding you: already listening. Five bars through the wall, patient as weather, and the stop.',
      },
      {
        text: 'Tonight you notice what the fifth bar does to the room — how the silence after it isn’t empty so much as held. Like the wall is waiting too.',
      },
    ],
  },
  choices: [{ id: 'let-go', label: 'Let the held breath go.', goto: 'd5-morning' }],
  cue: 'foghorn-312',
});

export const DAY4_SCENES: readonly Scene[] = [
  morning,
  wharf,
  wharf2,
  errand,
  dianne,
  evening,
  night,
];
