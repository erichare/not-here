/** Story edition 2. Original scenes remain available for legacy saves and regression fixtures. */
import { type Choice, type Cond, type Effect, type Scene, type StoryContent, type WorldState } from '@not-here/engine';
import { ALL_SCENES, buildContent } from './content.ts';
import { acquiredFragments, presentationFor, revisedCue } from './presentation.ts';

export const REVISED_OPENING_SCENE = 'n1-beach';
export const STORY_EDITION = 2;
const flag = (key: string): Cond => ({ op: 'flag', key });
const set = (key: string, value: boolean | string | number = true): Effect => ({ op: 'flag.set', key, value });
const text = (...paragraphs: string[]): Scene['prose'] => ({ kind: 'inline', paragraphs: paragraphs.map(text => ({ text })) });
const choice = (id: string, label: string, goto: string, effects?: readonly Effect[]): Choice => ({ id, label, goto, ...(effects ? { effects } : {}) });
const scene = (id: string, paragraphs: string[], choices: readonly Choice[], extra: Partial<Scene> = {}): Scene => ({ id, prose: text(...paragraphs), choices, ...extra });
const major = (id: string, label: string, goto: string, effects?: readonly Effect[]): Choice => ({ ...choice(id, label, goto, effects), stakes: 'major' });
const nameReady: Cond = { op: 'flag', key: 'player:name' };

const additions: Scene[] = [
  scene('r20-prepare', [
    'You draw four lines on the back of a delivery slip. Sam watches from the other end of the counter. “That is either a plan or the worst song you’ve written.”',
    '“Mine, though.”',
    'He pushes the pencil back with its eraser. There are three days left. You can spend them asking for explanations, or doing something with the ones you have.',
  ], [
    choice('make-place', 'Arrange work and a room under your own name.', 'r21-place', [set('r:preparation', 'place')]),
    choice('prepare-leaving', 'Arrange a seat with Tam and tell Sam how to reach you.', 'r21-departure', [set('r:preparation', 'departure')]),
    choice('tell-town', 'Ask Barb for a chance to tell people who you are.', 'r21-truth', [set('r:preparation', 'truth')]),
    { ...major('protect-place', 'Help Dianne prepare the homecoming she wants.', 'r21-protect', [set('r:preparation', 'protect')]), when: flag('knows-truth') },
    { ...major('keep-away', 'Spend the next two days alone, despite Barb’s warning.', 'r21-alone', [set('r:preparation', 'alone')]), when: flag('r:declined-help') },
  ]),
  scene('r21-place', [
    'November 26. Barb has written a list: curtain rail, leaking trap, cabinet hinges. “All jobs I’ve successfully avoided since August. Pick one.”',
    'You pick the hinges. She gives you a screwdriver and moves her coffee out of the way.',
    'The next morning there is a key on the workbench. Unit one, under your own name. You still have to tell the people whose memories you carry what happened to them. A room does not settle that account.',
  ], [choice('keep-working', 'Finish the hinge before the last evening.', 'r22-absence', [set('r:work-arranged'), { op: 'fact.add', tag: 'work-under-own-name', witnessedBy: ['barb'] }])], { onEnter: [{ op: 'time.set', day: 21, slot: 'morning' }], cue: 'v2-kettle' }),
  scene('r21-departure', [
    'November 26. Tam tears a strip off the bottom of the timetable and writes 04:10 on it. “I can hold a seat. I can’t tell you where to go after.”',
    'Sam finds an unused envelope. He writes the Kettle’s address carefully, then crosses out the postal code and starts again. “Haven’t actually posted a letter,” he says. “Ever.”',
    'The next morning you pack very little. A borrowed life has left you short of things you can honestly call yours.',
  ], [choice('keep-envelope', 'Keep the address. Leave room to change your mind.', 'r22-absence', [set('r:seat-held'), { op: 'fact.add', tag: 'departure-arranged', witnessedBy: ['tam', 'sam'] }])], { onEnter: [{ op: 'time.set', day: 21, slot: 'morning' }], cue: 'tam-theme' }),
  scene('r21-truth', [
    'November 26. Barb gives you the quiet half-hour after lunch. “Say what happened. People can supply their own adjectives.”',
    'You begin with the beach. You say you have been answering to a life you did not live. When somebody asks whether you are a ghost, you tell them you do not know a useful word for it.',
    'Dianne leaves before you finish. The next morning she brings back the mugs she took home after the potluck. She puts them down one at a time. “I heard,” she says. It is all she can manage yet.',
  ], [choice('keep-truth', 'Let people decide what to do with what you said.', 'r22-absence', [set('r:public-truth'), { op: 'fact.add', tag: 'fog-spoke-for-self', witnessedBy: ['barb', 'dianne', 'tam'] }])], { onEnter: [{ op: 'time.set', day: 21, slot: 'morning' }], cue: 'v2-kettle' }),
  scene('r21-protect', [
    'November 26. Dianne asks whether the good plates are too much. She has already taken them down.',
    'You help her set the table. When she says “when you come home” about tomorrow, you do not correct her. She knows the difference. For an afternoon you agree to make it smaller.',
    'The next morning Sam looks through the window at the extra place and goes away. You have protected something. It may not be what you meant to protect.',
  ], [choice('keep-setting', 'Leave the plates. You can still tell the truth tomorrow.', 'r22-absence', [set('r:protected-lie'), { op: 'fact.add', tag: 'helped-sustain-substitution', witnessedBy: ['dianne'] }])], { onEnter: [{ op: 'time.set', day: 21, slot: 'morning' }], cue: 'dianne-theme' }),
  scene('r21-alone', [
    'November 26. You let the knock pass. By afternoon the plate outside the door is cold.',
    'On the next morning the edge of the chair shows through your sleeve. You do not sit in it. The horn is silent, and you have given nobody a place to look for you.',
    'There is still time to cross the lot. Barb has left a light on.',
  ], [major('cross-lot', 'Go to the light before the last night.', 'r22-warning')], { onEnter: [{ op: 'time.set', day: 22, slot: 'evening' }, { op: 'stat.add', stat: 'flesh', value: -3 }, set('r:isolated')] }),
  scene('r22-absence', [
    'November 27. While you made arrangements, other people kept going. Priya packed the clinic. Wade was down at the wharf. Dianne carried a guitar between rooms without putting it anywhere.',
    'You heard versions of their days over the counter. Versions are not confessions, and they have not put any new music in your hands.',
    'Tonight you take your unfinished business down to the Kettle. Tomorrow will arrive with its own.',
  ], [choice('face-last-night', 'Sit down with Barb.', 'r22-gate')], { onEnter: [{ op: 'time.set', day: 22, slot: 'evening' }, set('r:missed-final-visits')] }),
  scene('r1-name', [
    'Barb turns the book a little, keeping a hand on the cover. “And what would you like me to call you?”',
    '“It doesn’t have to be the name you came with.” She puts a pencil beside the book. “You can try one out.”',
  ], [{ ...choice('keep-name', 'Keep this name for yourself.', 'n1-interview-1'), when: nameReady }], { input: 'name', cue: 'pub-warm' }),
  scene('r1-close', [
    'Barb is trying to put a fitted sheet into a square. She has been trying for some time.',
    '“Six rooms,” she says. “Twenty years. Still can’t fold the bloody things.”',
  ], [
    choice('help-fold', 'Take the other corners.', 'n1-room', [{ op: 'fact.add', tag: 'helped-barb-close', witnessedBy: ['barb'] }]),
    choice('bad-fold', '“Roll it up. Nobody checks the cupboard.”', 'n1-room', [{ op: 'fact.add', tag: 'laughed-with-barb', witnessedBy: ['barb'] }]),
  ], { onEnter: [{ op: 'emit', event: { kind: 'music.stinger', cue: 'interview-fingerprint' } }] }),
  scene('r3-repair', [
    'Sam has a strip of sandpaper folded around a block. He pushes another block along the bench, stopping short of your hand.',
    '“With the grain. Unless you want to spend the rest of your stay fixing what you did in the next five minutes.”',
    'For a while you work. He puts on a song with terrible drums. “Don’t start,” he says. “The chorus is good.”',
  ], [
    choice('like-chorus', '“Fine. The chorus is good.”', 'd3-shed', [{ op: 'fact.add', tag: 'repaired-with-sam', witnessedBy: ['sam'] }]),
    choice('terrible-drums', '“I’m still allowed to hate the drums.”', 'd3-shed', [{ op: 'fact.add', tag: 'laughed-with-sam', witnessedBy: ['sam'] }]),
  ], { cue: 'sam-theme' }),
  scene('r14-letter', [
    'The morning after the potluck, Dianne is taking dishes back to their owners. At the General, a drawer sits open beneath the till. Two folded pages lie inside.',
    'On top is an envelope postmarked this October. Below it is a reply in Dianne’s hand. The reply has no envelope.',
    'This could answer something. It could also make it impossible to keep accepting what they are giving you.',
  ], [
    major('read-letter', 'Read the two letters.', 'r14-reveal'),
    major('leave-letter', 'Close the drawer. You are not ready.', 'd14-morning', [set('r:letter-declined')]),
  ], { onEnter: [{ op: 'time.set', day: 14, slot: 'morning' }], observations: [
    { id: 'arrival-postmark', label: 'Examine the envelope', kind: 'document', text: 'Received October 16. D. Cole. Twenty-one days before you woke on the beach. The letter was here first.' },
  ] }),
  scene('r14-reveal', [
    '@doc:\nMom —\n\nI’m coming through Penticton on Friday, November 28.\nI want to see Sam. He’s eighteen now. He can decide\nfor himself whether he wants to see me.\n\nI have a flat here. A job fixing instruments. Friends\nwho don’t ask me to play every time I sit down.\nI miss some things. I’m not moving back.\n\nPlease don’t organize anything. I want to arrive\nas a person, not as the answer to something.\n\nI finished the song.\n— Wren',
    'She is alive. While they were keeping her room, she was paying rent somewhere else. You read the sentence about the song twice.',
  ], [choice('read-reply', 'Read the page underneath.', 'r14-reply')], {
    onEnter: [set('letter-opened'), set('knows-truth')], cue: 'title',
  }),
  scene('r14-reply', [
    '@doc:\nWren —\n\nI burned your first note. I let them say drowned.\nI should have corrected them. I liked the way\npeople looked after me. There. I have written it.\n\nSomething has been coming to breakfast. It hums\nyour song. It looks at the kitchen as though\nit remembers where things belong.\n\nI know it isn’t you. I don’t know how to want\nit gone.\n\nCome before I get better at this.',
    'You put the pages back. The drawer catches; you lift it until it closes.',
    'Outside, someone is unloading milk. You can help with that. Or you can walk past. For the first time the choice seems to belong to someone who has never been Wren.',
  ], [choice('face-day', 'Step out into the morning.', 'd14-morning')], { onEnter: [{ op: 'emit', event: { kind: 'music.stop' } }] }),
  scene('r18-message', [
    'Sam is outside the shed with his phone. “She gave Mum a number. Mum put it in a drawer, obviously.”',
    '“I wrote yesterday. For me.” He looks down at the screen. “She asked if you wanted to say anything. I can type it. Your voice still won’t record.”',
  ], [
    major('tell-truth', '“I’m not you. I’ve been living in the place they kept for you.”', 'r18-reply', [set('r:message', 'honest'), set('r:reply', 'I know you didn’t choose your face. Don’t make choices in my name. We can talk when I arrive.')]),
    major('admit-harm', '“I have taken things that belonged to you. I don’t know how to give them back.”', 'r18-reply', [set('r:message', 'admit'), set('r:reply', 'Then stop taking. Tell them what you took. I can be angry and still meet you.')]),
    major('ask-boundary', '“What do you want when you get here?”', 'r18-reply', [set('r:message', 'boundary'), set('r:reply', 'Breakfast with Sam. No speeches. My mother asking before she makes plans for me. You can want things too.')]),
    choice('decline-message', '“Not yet. Thank her for asking.”', 'd18-morning', [set('r:message-declined')]),
  ], { onEnter: [{ op: 'time.set', day: 18, slot: 'morning' }], cue: 'sam-theme' }),
  scene('r18-reply', [
    'Sam types exactly what you said. He lets you read it before sending. A reply comes while he is picking old varnish off his thumbnail.',
    '@doc:\nWREN\n{reply}',
    '“She’s got opinions,” Sam says. He sounds pleased about it. “I’d forgotten that part.”',
    'He puts the phone away. It keeps his words and hers. It has not made a recording of you.',
  ], [choice('give-phone-back', 'Let the conversation stand.', 'd18-morning')]),
  scene('r22-future', [
    'Barb sets two clean mugs on the counter. “Tomorrow’s getting here with or without our help.”',
    'Tam can take you out at 4:10. Barb can keep a room for a winter, if a winter is what you want. Or you can meet the woman on the morning bus.',
    '“You don’t have to make yourself disappear to make room,” she says. “But I won’t choose for you.”',
  ], [
    major('meet-wren', 'Stay for the morning bus.', 'r23-arrival'),
    major('leave-town', 'Ask Tam for a seat on the early run.', 'ending-stranger'),
    major('one-winter', '“I’d like a winter. Here. As myself.”', 'ending-long-winter'),
    { ...major('own-song', 'Ask Wade about playing your own ending to the song.', 'r23-compose'), when: flag('knows-truth') },
  ], { onEnter: [set('r:checkpoint'), { op: 'time.set', day: 22, slot: 'night' }] }),
  scene('r23-arrival', [
    'The bus comes round the bend at 7:40. Tam steps away from the shelter. The door opens with a hiss.',
    'A woman climbs down carrying a canvas bag and a guitar case with a broken catch. She is older than the girl in the photographs. She stops to pull her sleeve out of the handle.',
    'Moose gets up. He goes straight to her. “Hello, you,” she says, and puts the bag down for him.',
    'This is Wren. Alive. Sam reaches her first. She laughs, then cries, then tells him he is taller than he said. Dianne has not moved.',
    'Wren sees you. Nobody has prepared a sentence for this part.',
  ], [
    major('own-name', '“I’m {name}. I’ve been staying here.”', 'r23-honesty'),
    major('claim-place', 'Let the town keep calling you Wren.', 'r23-claim'),
    major('leave-now', 'Ask Tam to help you leave under your own name.', 'ending-stranger'),
  ], { onEnter: [{ op: 'time.set', day: 23, slot: 'morning' }, set('knows-truth')], cue: 'tam-theme' }),
  scene('r23-honesty', [
    '“I know,” Wren says. “Sam told me there was someone.” She looks at her mother. “That isn’t the same as telling me what happened.”',
    'There are things in you that came from other people. Some of those people cannot remember them anymore. Wren waits while you decide what to say about that.',
  ], [
    major('stop-taking', 'Tell her what you know. Promise to stop taking and speak only for yourself.', 'ending-two-wrens', [set('r:separate-person'), { op: 'fact.add', tag: 'acknowledged-borrowed-life', witnessedBy: ['sam', 'dianne', 'barb', 'tam'] }]),
    choice('need-time', '“I need time. Somewhere else.”', 'ending-stranger'),
  ]),
  scene('r23-claim', [
    'Dianne turns toward you. The old name is ready in her mouth. You could let her say it. You know now whose place you would be taking.',
    'Wren picks up her bag. Sam keeps his eyes on you.',
  ], [
    major('sustain-lie', '“I’m home, Mum.” Keep the place they gave you.', 'ending-wren-again', [set('r:claimed-wren')]),
    major('correct-name', '“No. She’s your daughter. I’m someone else.”', 'r23-honesty'),
  ]),
  scene('r23-compose', [
    'Wade puts a hand on the valve wheel. “You can use it. You don’t owe us the ending.”',
    'The five bars are familiar. The space after them is yours. If you give the fog its material back with your last note, it will keep the sound and lose the person playing. You can still walk away.',
  ], [
    major('bar-open', 'Make a phrase that leaves an opening. Play it, and choose to let go.', 'ending-sixth-bar', [set('r:bar', 'open')]),
    major('bar-rest', 'Let the last note be a quiet answer. Play it, and choose to let go.', 'ending-sixth-bar', [set('r:bar', 'rest')]),
    major('keep-living', '“I want to hear what comes after tomorrow.” Leave the valves.', 'r23-arrival'),
  ], { cue: 'horn-close' }),
  scene('ending-two-wrens', [
    'You tell her. Where you do not know, you say that too. Nobody gets a missing memory back while you speak.',
    '“I’m not sharing my name,” Wren says. “And I’m not staying in that room.” Then, after a moment: “But I didn’t ask you to go.”',
    '“May I?” Wren asks, holding out her hand. You turn yours toward her. For once somebody moves first: she closes the space.',
    '“You’re here.”',
    'Moose leans against both your legs. Up the hill, Barb opens the book. Under the old line she rules another and writes {name}. There is room. There is still work to do.',
  ], [], { ending: 'two-wrens', cue: 'pub-warm' }),
  scene('ending-stranger', [
    'Tam checks the mirror. “Seat belt catches. Give it a proper pull.” He waits until you have it.',
    'Sam stands by the door. “Text when—” He stops. “Write, then. If you want.”',
    '“{name},” he says, trying it once. It sounds like someone you might get to be.',
    'The bus pulls away. The first bend takes the lake out of sight. Tam asks if you mind the radio. For once the answer is only about the radio.',
    '@doc:\nMILEAGE LOG\nOne passenger. Name given: {name}.',
  ], [], { ending: 'stranger', cue: 'tam-theme' }),
  scene('ending-long-winter', [
    '“Unit one needs a curtain rail,” Barb says. “You can start with that.”',
    'You stay through the first snow. Wren comes and goes on her own arrangements. Some days Dianne says the wrong name, corrects herself, and keeps talking.',
    'Nothing taken comes back. New things happen: a repaired cupboard, an argument over a film, the morning Moose decides your feet are in his way.',
    'In February you tell Barb which night. She argues about the date because she has ordered a cake. You move it to Saturday.',
    'On that night she sits with you until the window is only glass. In the morning the book keeps your name: {name}.',
  ], [], { ending: 'long-winter', cue: 'pub-warm' }),
  scene('ending-sixth-bar', [
    'The horn carries five bars across the lake. At the place where it always stops, you play your own.',
    'You hear a shape you chose, not one you remembered. It is enough. It does not have to explain you.',
    'Above the wharf, a woman steps from the bus and listens. The last note goes out over the water. Your hands are no longer on the valves.',
    'Later Wade writes the notes down. Under Wren’s name he adds yours. Barb keeps a line in the book, too.',
    '@doc:\n{ nameCredit }\nWas here.',
  ], [], { ending: 'sixth-bar', cue: 'sixthbar-door-context' }),
  scene('ending-wren-again', [
    '“My girl,” Dianne says, and the people behind her stop having to decide.',
    'Wren looks from her mother to you. Sam says her name, clearly. The crowd hears him and turns away. Its remembering has become a choice it can make together.',
    '“Come on,” Wren tells him. She takes her bag. The driver waits while Sam climbs aboard behind her.',
    'The town waves from the shelter. Dianne is already asking what you want for supper.',
    'In the book, Barb finally fills the space. Wren. You have somewhere to live. You will have to answer to it.',
  ], [], { ending: 'wren-again', cue: 'dianne-theme' }),
  scene('r20-warning', [
    'Barb watches your cup move against the saucer without a sound.',
    '“You’re getting harder to keep track of. Food helps. So does somebody knowing where you’ll be. Neither needs to cost anyone a memory.”',
    'She puts a plate on the counter. “If you keep going without either, there will come a night when I can’t find you. I want you to understand that.”',
  ], [
    choice('accept-help', 'Eat, and tell her where you will be tomorrow.', 'd20-morning', [set('r:accepted-help'), { op: 'stat.add', stat: 'flesh', value: 2 }]),
    major('decline-help', '“I understand. I still want to be left alone.”', 'd20-morning', [set('r:declined-help')]),
  ], { onEnter: [set('r:warning-seen')], cue: 'v2-kettle' }),
  scene('r22-warning', [
    'Tonight you cannot lift the cup. Your fingers close; the handle stays where it was.',
    'Barb says your name twice. The second time reaches you.',
    '“Stay where I can see you. Let me make you something.” This is the night she warned you about. If you walk into the dark alone now, you may not come back.',
  ], [
    major('stay-visible', 'Stay. Accept the plate and the company.', 'r22-future', [set('r:accepted-help')]),
    major('walk-unseen', 'Walk out alone, knowing what will happen.', 'ending-unwitnessed'),
  ], { cue: 'v2-kettle' }),
  scene('ending-unwitnessed', [
    'Inside, Barb asks Tam whether the morning bus is running. He says it is.',
    'A coat goes over the back of your chair. Nobody moves it. The coffee maker finishes its cycle.',
    'Barb opens the book. The sentence about your evening stops in the middle of a word. She waits with the pen above the paper. Then she closes it.',
    'The room continues. You are no longer in it.',
  ], [], { ending: 'unwitnessed', onEnter: [{ op: 'emit', event: { kind: 'music.stop' } }] }),
  scene('r-ash-warning', [
    'The book is open to a page from before you arrived. Wren’s guitar lesson. Her first overnight trip. Things Barb wrote down while the people who lived them began to disagree.',
    'This book holds more than you. Burning it would sever the town’s hold on her as well. Wren would still exist. Her life elsewhere would go on. Here, even Sam might lose the sister he waited for.',
    'You can close the cover.',
  ], [major('burn-witness', 'Burn it, knowing whose memories it holds.', 'act2-ash', [set('r:ash-understood')]), choice('spare-book', 'Leave the book where it belongs.', 'd19-morning')]),
];

/** Remove only the delayed-letter route; the original days remain reachable as ordinary visits. */
const revise = (original: Scene): Scene => {
  let s: Scene = { ...original };
  if (s.id === 'n1-beach') s = { ...s, prose: text(
    'Gravel under your palms. Above you, the old ferry wharf stands on black pilings. A light turns at its far end.',
    'Your coat is wet. You sit up, then stand. Up the shore, one window is still lit.',
  ), onEnter: [...(s.onEnter ?? []), set('story:edition', STORY_EDITION)], observations: [
    { id: 'wet-coat', label: 'Feel the coat', text: 'Water gathers at the hem, but your hair is dry at the roots. Your hands are steady. You cannot remember getting out of the lake.' },
    { id: 'lake-stones', label: 'Look at the stones', text: 'The gravel beneath you has no hollow in it. You turn one stone over. There is ordinary damp underneath.' },
  ] };
  if (s.id === 'n1-walk') s = { ...s, prose: text('The road climbs between orchard rows. A frost fan turns above the fog. Your boots change from gravel to pavement.', 'The lit window belongs to a diner. Chairs are up on half the tables. Someone is still working behind the counter.') };
  if (s.id === 'n1-diner') s = { ...s, observations: [
    { id: 'kettle-mugs', label: 'Read the mugs', text: 'Some have names. Some have faded logos. One says WORLD’S OKAYEST GRANDAD. Its handle has been glued twice.' },
    { id: 'empty-stool', label: 'Look at the counter', text: 'A clean place is set beside the till. There is a dish towel on the next stool. Somebody expected to sit there.' },
  ] };
  if (s.id === 'n1-moose') s = { ...s, choices: s.choices.map(c => ({ ...c, goto: 'r1-name' })) };
  if (s.id === 'n1-interview-5') s = { ...s, choices: s.choices.map(c => ({ ...c, goto: 'r1-close' })) };
  if (s.id === 'n1-room') s = { ...s, observations: [
    { id: 'winter-schedule', label: 'Read the winter schedule', kind: 'document', text: 'Friday November 28. Morning bus, 07:40. Circled twice in blue pen. The paper is dented beneath the ink.' },
  ] };
  if (s.id === 'd3-morning') s = { ...s, choices: s.choices.map(c => c.goto === 'd3-shed' ? { ...c, goto: 'r3-repair' } : c) };
  if (s.id === 'd3-room') s = { ...s, observations: [
    { id: 'quilt', label: 'Look closely at the quilt', text: 'The patches have faded at different rates. Dianne points to a blue square. “My mother’s second wedding. She said the dress deserved another outing.”' },
  ] };
  if (s.id === 'd3-room-2' && s.prose.kind === 'inline') s = { ...s, prose: { ...s.prose, paragraphs: [...s.prose.paragraphs,
    { text: 'You tell her again who made the quilt. “My mother,” she repeats. The fact is back. She still cannot picture the woman sewing.', when: { op: 'fact.exists', tag: 'private:memory-taken' } },
  ] } };
  if (s.id === 'd13-night-defended' || s.id === 'd13-night-exiled') s = { ...s, choices: s.choices.map(c => ({ ...c, goto: 'r14-letter' })) };
  if (s.id === 'd17-evening') s = { ...s, choices: s.choices.map(c => c.goto === 'd17-letter' ? { ...c, goto: 'd17-night' } : c) };
  if (s.id === 'd17-night') s = { ...s, choices: s.choices.map(c => ({ ...c, goto: 'r18-gate' })) };
  if (s.id === 'd20-morning') s = { ...s, choices: [...s.choices, major('prepare-future', 'Spend the next two days preparing a life of your own.', 'r20-prepare')] };
  if (s.id === 'act2-end') s = { ...s, choices: s.choices.map(c => ({ ...c, goto: 'r20-gate' })) };
  if (s.id === 'd22-after' || s.id === 'd22-night') s = { ...s, choices: [choice('choose-future', 'Go to the Kettle before morning.', 'r22-gate')] };
  if (s.id === 'd22-end') { const { ending: _ending, ...rest } = s; s = { ...rest, choices: [choice('choose-future', 'Choose what comes next.', 'r22-future')] }; }
  // Conscious destruction is available only after the player understands the book.
  if (s.id === 'd19-morning') s = { ...s, choices: [...s.choices, { ...major('consider-ash', 'Consider what destroying the register would do.', 'r-ash-warning'), when: flag('knows-truth') }] };
  s = { ...s, choices: s.choices.map(c => c.goto === 'act2-ash' ? { ...c, goto: 'r-ash-warning' } : c) };
  if (s.id === 'act2-ash') s = { ...s, prose: text('You carry the register to the Kettle’s stove. The first pages catch at once: summer guests, a roofing bill, a girl learning the guitar.', 'The double-inked pages take longer. You hold them in the heat until the words cannot be read. You understood what they kept. You burn them anyway.', 'The room stays warm. Across the lot, the General’s light goes out.') };
  if (s.id === 'd3-room') s = { ...s, prose: s.prose.kind === 'inline' ? { ...s.prose, paragraphs: [...s.prose.paragraphs, { text: 'You can feel the telling becoming something you could keep as your own. As it gathers in you, Dianne falters. Her thumb loses its place on the blue square. Taking the whole memory may leave her without it. You can listen without claiming it.' }] } : s.prose };
  if (s.prose.kind === 'inline') s = { ...s, prose: { ...s.prose, paragraphs: s.prose.paragraphs.map(p => ({ ...p, text: p.text.replaceAll('NOV 01', 'OCT 16') })) } };
  return { ...s, ...(s.cue ? { cue: ({ 'pub-warm': 'v2-kettle', shingle: 'v2-shore', 'wrens-room': 'v2-room', 'dianne-theme': 'v2-room' } as Record<string, string>)[s.cue] ?? s.cue } : {}), presentation: presentationFor(s) };
};

// Conditional one-choice gates preserve the shared engine's explicit graph.
const gates: Scene[] = [
  scene('r18-gate', ['November 23. The depot has put up the winter timetable.'], [
    { ...choice('message', 'See Sam before the morning gets away.', 'r18-message'), when: flag('knows-truth') },
    { ...choice('morning', 'Go down to breakfast.', 'd18-morning'), when: { op: 'not', of: flag('knows-truth') } },
  ]),
  scene('r20-gate', ['November 25. Three days until the bus.'], [
    { ...choice('warning', 'Sit where Barb can see you.', 'r20-warning'), when: flag('horn-stopped') },
    { ...choice('morning', 'Begin the morning.', 'd20-morning'), when: { op: 'not', of: flag('horn-stopped') } },
  ]),
  scene('r22-gate', ['The last night before the bus. There is still a light in the Kettle.'], [
    { ...choice('warning', 'Cross to the light.', 'r22-warning'), when: { op: 'all', of: [flag('r:declined-help'), { op: 'any', of: ['flesh', 'name', 'echo'].map(stat => ({ op: 'stat.lte' as const, stat: stat as 'flesh' | 'name' | 'echo', value: 1 })) }] } },
    { ...choice('future', 'Sit down with Barb.', 'r22-future'), when: { op: 'not', of: { op: 'all', of: [flag('r:declined-help'), { op: 'any', of: ['flesh', 'name', 'echo'].map(stat => ({ op: 'stat.lte' as const, stat: stat as 'flesh' | 'name' | 'echo', value: 1 })) }] } } },
  ]),
];

export const REVISED_SCENES: readonly Scene[] = [...ALL_SCENES.map(revise), ...additions.map(s => ({ ...s, ...(s.cue === 'pub-warm' ? { cue: 'v2-kettle' } : {}), presentation: presentationFor(s) })), ...gates.map(s => ({ ...s, presentation: presentationFor(s) }))].map(s => ({ ...s,
  ...(revisedCue(s) ? { cue: revisedCue(s)! } : {}),
  ...(s.prose.kind === 'inline' ? { artifacts: s.prose.paragraphs.flatMap((p, i) => p.text.startsWith('@doc:\n') ? [{ id: `${s.id}:document:${i}`, title: s.id.includes('reveal') ? 'Wren’s letter' : s.id.includes('reply') ? 'A reply' : 'A kept page', text: p.text.slice(6), ...(p.when ? { when: p.when } : {}) }] : []) } : {}),
}));

export const buildRevisedContent = (): StoryContent => {
  const original = buildContent();
  return { ...original, scenes: new Map(REVISED_SCENES.map(s => [s.id, s])),
    realizePresentation: (scene, state) => {
      if (!scene.presentation) return scene.presentation;
      const base = { ...scene.presentation,
        light: state.slot === 'night' ? 'night' as const : state.slot === 'morning' ? 'morning' as const : state.slot === 'evening' ? 'evening' as const : 'day' as const,
      };
      if (scene.id === 'd3-room-2' && state.facts.some(f => f.tag === 'private:memory-taken')) return { ...base, staging: 'memory-loss', mood: 'uneasy', objects: ['The blue patch. Her hand resting beside it.'] };
      if (/^d13-(hall|verdict|potluck)/.test(scene.id)) return { ...base, location: 'hall', ambience: 'hall', sound: 'Cutlery touches mismatched plates. A chair scrapes; the room briefly quiets.', title: 'The Memorial Potluck', staging: 'potluck', objects: ['Dishes brought from different kitchens. A place to be counted.'] };
      if (/^r14-(letter|reveal|reply)$/.test(scene.id)) return { ...base, staging: 'letter', objects: ['Two pages. Different dates.'] };
      if (/^r23-(arrival|honesty|claim)$/.test(scene.id)) return { ...base, staging: 'arrival', sound: scene.id === 'r23-arrival' ? 'The bus idles. Its air brakes release; the door folds open.' : 'The bus keeps idling behind her. Wind moves through the open door.', objects: ['A canvas bag. A broken guitar-case catch.'] };
      if (base.location === 'kettle' && state.flags['r:work-arranged']) return { ...base, composition: 'kettle-work', objects: ['Your screwdriver waits beside the loose hinge.'] };
      return base;
    },
    realizeLabel: (label, state) => label.replaceAll('{name}', String(state.flags['player:name'] ?? 'Robin')).replaceAll('{reply}', String(state.flags['r:reply'] ?? 'We can talk when I arrive.')).replaceAll('{ nameCredit }', `NOT HERE — Wren Cole & ${String(state.flags['player:name'] ?? 'Robin')}`),
    realizeProse: (scene, state) => [...original.realizeProse(scene, state).map(line => line
      .replaceAll('{name}', String(state.flags['player:name'] ?? 'Robin'))
      .replaceAll('{ nameCredit }', `NOT HERE — Wren Cole & ${String(state.flags['player:name'] ?? 'Robin')}`)
      .replaceAll('{reply}', String(state.flags['r:reply'] ?? 'We can talk when I arrive.'))),
      ...(scene.id === 'ending-two-wrens' && state.flags['r:public-truth'] ? ['Barb has already told her about your afternoon at the counter. It saves you an explanation. It does not save you the apology.'] : []),
      ...(scene.id === 'ending-two-wrens' && state.flags['r:work-arranged'] ? ['Your screwdriver is still by the loose hinge. Tomorrow you will finish it.'] : []),
      ...(scene.id === 'ending-sixth-bar' ? [acquiredFragments(state).length ? `You heard parts of this music from ${acquiredFragments(state).join(', ')}. Their names stay with the notes Wade writes down.` : 'You never heard everyone’s part. What you played was enough to be your own choice.'] : []),
    ],
    realizeEvents: (state, events) => events.map(event => {
      if (event.kind === 'music.stinger' && event.cue === 'interview-fingerprint') return { ...event, cue: `v2-fingerprint-${state.flags['n1:goodbye'] ?? 'door'}` };
      if (event.kind === 'music.chord') return { kind: 'music.fragments' as const, characters: acquiredFragments(state) };
      if (event.kind === 'music.cue' && event.cue === 'sixthbar-door-context') return { ...event, cue: state.flags['r:bar'] === 'rest' ? 'v2-sixth-rest' : 'v2-sixth-open' };
      if (event.kind === 'music.layer' && event.pattern === 'lullaby' && event.gain === 0) return { kind: 'music.cue' as const, cue: 'v2-room-hollow' };
      if (event.kind === 'music.cue' && ['dianne-theme', 'v2-room'].includes(event.cue) && state.flags['lullaby-taken']) return { ...event, cue: 'v2-room-hollow' };
      if (event.kind === 'music.cue') return { ...event, cue: revisedCue({ id: '', prose: text(''), choices: [], cue: event.cue }) ?? event.cue };
      return event;
    }),
  };
};
