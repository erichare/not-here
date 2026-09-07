import type { LocationId, Scene, ScenePresentation, WorldState } from '@not-here/engine';

export const LOCATIONS: Record<LocationId, { title: string; sound: string }> = {
  kettle: { title: 'The Kettle', sound: 'The refrigerator hums. A spoon touches a mug behind the counter.' },
  motel: { title: 'Unit One', sound: 'The baseboard heater ticks. Water moves beyond the window.' },
  shore: { title: 'The Shore Road', sound: 'Small waves work the gravel. A frost fan turns above the orchards.' },
  general: { title: 'Lorn Bay General', sound: 'The label printer feeds. Upstairs, a floorboard answers a footstep.' },
  wharf: { title: 'The Old Wharf', sound: 'Lake water knocks under the boards. Pressure settles in the compressor.' },
  clinic: { title: 'The Clinic', sound: 'The fluorescent light hums. Paper shifts on the examination table.' },
  boathouse: { title: 'Sam’s Boathouse', sound: 'A loose rope taps the siding. Sandpaper runs along wood.' },
  hall: { title: 'The Community Hall', sound: 'The heating pipes settle. Somewhere a chair moves across the floor.' },
  shelter: { title: 'The Highway Pull-in', sound: 'A diesel engine idles beyond the bend. Wind catches the shelter glass.' },
};

/** Explicit exceptions keep ambiguous scene names out of the visual heuristic. */
const AT: Record<string, LocationId> = {
  'n1-beach': 'shore', 'n1-walk': 'shore', 'n1-room': 'motel', 'n1-312': 'motel',
  'd3-room': 'general', 'd3-room-2': 'general', 'd21-guitar': 'general', 'd22-guitar': 'general',
  'r14-letter': 'general', 'r14-reveal': 'general', 'r14-reply': 'general',
  'r18-message': 'boathouse', 'r18-reply': 'boathouse', 'r22-future': 'kettle',
  'r3-repair': 'boathouse', 'r21-place': 'kettle', 'r21-truth': 'kettle', 'r21-protect': 'general', 'r21-departure': 'shelter', 'r21-alone': 'motel', 'r22-absence': 'kettle',
  'r23-arrival': 'shelter', 'r23-honesty': 'shelter', 'r23-claim': 'shelter',
  'ending-two-wrens': 'wharf', 'ending-sixth-bar': 'wharf', 'r23-compose': 'wharf',
  'ending-stranger': 'shelter', 'ending-wren-again': 'shelter',
  'ending-unwitnessed': 'motel', 'ending-long-winter': 'kettle', 'r23-release': 'wharf',
  'd5-ride-3': 'kettle', 'd7-walk': 'wharf', 'd7-after': 'wharf', 'd10-house-3': 'shore',
  'd11-albums': 'general', 'd11-albums-2': 'general', 'd11-counter': 'general', 'd11-counter-2': 'general',
  'd12-morning': 'hall', 'd12-night': 'clinic', 'd13-after': 'hall',
  'd14-priya': 'kettle', 'd14-priya-2': 'kettle', 'd15-supper': 'general', 'd15-night': 'general', 'd15-night-2': 'general',
  'd17-night': 'general', 'd17-burn': 'general', 'd18-evening': 'general', 'd21-night': 'kettle',
  'd22-dianne': 'kettle', 'd22-dianne-2': 'kettle', 'd22-open-2': 'wharf', 'd22-evening': 'general', 'd22-evening-2': 'shore',
};

// The original authored vocabulary mapped to the revised nine compositions.
const TOKENS: Readonly<Record<string, LocationId>> = Object.fromEntries(([
  ['shore', 'beach shore breakwater walk fog after night-defended'],
  ['wharf', 'wharf wharf-on wharf-off ticket ticket-office night-exiled hornroom sixth-question silence crown'],
  ['motel', 'night wake 312'],
  ['general', 'room albums guitar dianne store stockroom corkboard mail letter reveal burn house house-tin'],
  ['clinic', 'clinic priya'], ['boathouse', 'shed'], ['hall', 'hall prep verdict'],
  ['shelter', 'depot depot-empty ride'],
] as const).flatMap(([place, words]) => words.split(' ').map(word => [word, place])));

export const presentationFor = (scene: Scene): ScenePresentation => {
  const id = scene.id;
  const token = id.replace(/^(d\d+|n1|act\d)-/, '').replace(/-\d+$/, '');
  const location: LocationId = AT[id] ?? TOKENS[token] ?? 'kettle';
  const character = /^(r23-(arrival|honesty|claim)|ending-two-wrens|ending-wren-again)$/.test(id) ? 'wren' :
    /dianne|confession/.test(token) ? 'dianne' :
    token === 'priya' ? 'priya' :
    id === 'd2-evening' ? 'tam' :
    location === 'general' && !/letter|reveal/.test(id) ? 'dianne' :
    location === 'clinic' ? 'priya' : location === 'boathouse' ? 'sam' :
    location === 'wharf' && !/ending/.test(id) ? 'wade' :
    location === 'kettle' ? 'barb' : location === 'shelter' && /depot|ride/.test(id) ? 'tam' : undefined;
  return { location, title: LOCATIONS[location].title, ambience: location,
    sound: LOCATIONS[location].sound,
    mood: /reveal|verdict|ending/.test(id) ? 'reveal' : location === 'kettle' ? 'warm' : 'ordinary',
    ...(character ? { character } : {}),
  };
};

/** Authored cue changes, leaving scenes with intentional inherited silence alone. */
export const revisedCue = (scene: Scene): string | undefined => {
  const at: Record<string, string> = {
    'n1-beach': 'v2-shore', 'n1-room': 'v2-motel',
    'd13-hall': 'v2-potluck', 'r14-letter': 'v2-letter', 'r14-reveal': 'v2-letter',
    'r23-arrival': 'v2-arrival', 'ending-two-wrens': 'v2-two-wrens',
    'ending-long-winter': 'v2-long-winter', 'ending-stranger': 'v2-stranger',
    'ending-wren-again': 'v2-wren-again', 'act2-ash': 'v2-ash',
  };
  const aliases: Record<string, string> = {
    'pub-warm': 'v2-kettle', 'kettle-warm': 'v2-kettle', shingle: 'v2-shore',
    'wrens-room': 'v2-room', 'dianne-theme': 'v2-room', 'wade-theme': 'v2-wharf',
    'priya-theme': 'v2-clinic', 'sam-theme': 'v2-boathouse', 'tam-theme': 'v2-shelter',
    'hall-upright': 'v2-hall',
  };
  return at[scene.id] ?? (scene.cue ? aliases[scene.cue] ?? scene.cue : undefined);
};

export const acquiredFragments = (state: WorldState): readonly string[] =>
  ['sam', 'dianne', 'barb', 'priya', 'tam', 'wade'].filter(who => state.flags[`conf:${who}`] === true);

export interface NotebookEntry { readonly title: string; readonly text: string; readonly kind: 'observation' | 'suspicion' | 'document' }
export const notebookEntries = (state: WorldState): readonly NotebookEntry[] => {
  const observations = state.facts.filter(f => f.tag.startsWith('observed:')).map(f => {
    try {
      const entry: unknown = JSON.parse(f.data ?? '');
      if (entry && typeof entry === 'object' && 'title' in entry && typeof entry.title === 'string' && 'text' in entry && typeof entry.text === 'string' && 'kind' in entry && ['observation', 'suspicion', 'document'].includes(String(entry.kind))) return entry as NotebookEntry;
    } catch { /* The early sample stored title and text on separate lines. */ }
    const [title = '', ...lines] = (f.data ?? '').split('\n');
    return { title, text: lines.join('\n'), kind: 'observation' as const };
  });
  const entries: NotebookEntry[] = [...observations];
  if (state.flags['heard-horn-312']) entries.push({ title: 'The unfinished song', text: 'Five bars, then a space. Every night at 3:12.', kind: 'observation' });
  if (state.flags['seen-chord-sheet']) entries.push({ title: 'The chord sheet', text: 'The tune on the page is the tune from the wharf. The last measure is empty.', kind: 'document' });
  if (state.facts.some(f => /memory-taken|lullaby-taken/.test(f.tag))) entries.push({ title: 'What remembering costs', text: 'I kept a memory. Its owner could no longer reach it. Telling them the facts did not bring the remembering back.', kind: 'observation' });
  if (state.flags['letter-opened']) entries.push({ title: 'Wren’s letter', text: 'She is alive. She has a flat and a job fixing instruments elsewhere. She returns on November 28 to see Sam, not to become the girl they remember.', kind: 'document' });
  if (state.flags['r:message']) entries.push({ title: 'Wren’s reply', text: String(state.flags['r:reply'] ?? 'Sam kept the conversation on his phone.'), kind: 'document' });
  if (!state.flags['knows-truth'] && state.flags['heard-horn-312']) entries.push({ title: 'A question', text: 'Why does this town need the song to keep stopping in the same place?', kind: 'suspicion' });
  return entries;
};
