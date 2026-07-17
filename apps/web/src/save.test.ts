import { describe, expect, it } from 'vitest';
import {
  advance,
  defineScene,
  initialState,
  SAVE_SCHEMA_VERSION,
  type EngineEvent,
  type Scene,
  type StoryContent,
  type WorldState,
} from '@not-here/engine';
import { buildContent, OPENING_SCENE } from '@not-here/story';
import {
  classifyLaunch,
  classifySave,
  clearSave,
  hasSave,
  loadMargin,
  loadSave,
  MARGIN_KEY,
  persistSave,
  resumeStep,
  SAVE_KEY,
  saveMargin,
  type ResumableScene,
  type SaveStorage,
} from './save.ts';

const memoryStorage = (): SaveStorage & { readonly dump: () => Map<string, string> } => {
  const map = new Map<string, string>();
  return {
    getItem: (key) => map.get(key) ?? null,
    setItem: (key, value) => {
      map.set(key, value);
    },
    removeItem: (key) => {
      map.delete(key);
    },
    dump: () => map,
  };
};

const throwingStorage = (): SaveStorage => ({
  getItem: () => {
    throw new Error('quota');
  },
  setItem: () => {
    throw new Error('quota');
  },
  removeItem: () => {
    throw new Error('quota');
  },
});

describe('save slot', () => {
  it('round-trips a WorldState through the slot', () => {
    const storage = memoryStorage();
    const state = initialState(42, 'n1-title');
    expect(persistSave(storage, state)).toBe(true);
    expect(loadSave(storage)).toEqual(state);
    expect(hasSave(storage)).toBe(true);
  });

  it('returns null when the slot is empty', () => {
    const storage = memoryStorage();
    expect(loadSave(storage)).toBeNull();
    expect(hasSave(storage)).toBe(false);
  });

  it('rejects malformed JSON', () => {
    const storage = memoryStorage();
    storage.setItem(SAVE_KEY, '{not json');
    expect(loadSave(storage)).toBeNull();
  });

  it('rejects a wrong-shape payload', () => {
    const storage = memoryStorage();
    storage.setItem(SAVE_KEY, JSON.stringify({ day: 'one', v: 1 }));
    expect(loadSave(storage)).toBeNull();
  });

  it('rejects a future schema version', () => {
    const storage = memoryStorage();
    const state = { ...initialState(1, 'n1-title'), v: 999 };
    storage.setItem(SAVE_KEY, JSON.stringify(state));
    expect(loadSave(storage)).toBeNull();
  });

  it('clears the slot', () => {
    const storage = memoryStorage();
    persistSave(storage, initialState(7, 'n1-title'));
    clearSave(storage);
    expect(storage.dump().size).toBe(0);
    expect(hasSave(storage)).toBe(false);
  });

  it('degrades gracefully when storage throws', () => {
    const storage = throwingStorage();
    expect(persistSave(storage, initialState(7, 'n1-title'))).toBe(false);
    expect(loadSave(storage)).toBeNull();
    expect(() => clearSave(storage)).not.toThrow();
  });

  it('persists every step of a real walk — generous autosave', () => {
    const content = buildContent();
    const storage = memoryStorage();
    let step = advance(content, initialState(1971, OPENING_SCENE), {
      kind: 'enter',
    });
    persistSave(storage, step.state);
    expect(loadSave(storage)).toEqual(step.state);
    for (let moves = 0; moves < 4; moves += 1) {
      const open = step.view.choices.find((choice) => !choice.locked);
      if (open === undefined) break;
      step = advance(content, step.state, { kind: 'choose', choiceId: open.id });
      // The applyStep contract: every advance lands in storage immediately.
      persistSave(storage, step.state);
      expect(loadSave(storage)).toEqual(step.state);
    }
  });
});

describe('classifySave — act boundaries hold places (pt2-fix-01)', () => {
  const state = initialState(1971, 'act2-end');

  it('no save, or a save on an unknown scene, means a fresh start', () => {
    expect(classifySave(null, undefined)).toEqual({ kind: 'fresh' });
    expect(classifySave(state, undefined)).toEqual({ kind: 'fresh' });
  });

  it('a save parked mid-run resumes', () => {
    expect(classifySave(state, {})).toEqual({ kind: 'resume', state });
  });

  it('a save parked on the held card (d20-end) is held, never discarded', () => {
    expect(classifySave(state, { ending: 'd20-end' })).toEqual({ kind: 'held', state });
  });

  it('act2-end is retired from the hold: the unsealed card is mid-run and resumes', () => {
    // The card lost its `ending` marker when Day 20 shipped — a November
    // parked there walks into Day 20 with its flags intact (mirrors the CLI).
    expect(classifySave(state, {})).toEqual({ kind: 'resume', state });
  });

  it('a save parked on a true ending means a finished run — fresh start', () => {
    expect(classifySave(state, { ending: 'ash' })).toEqual({ kind: 'fresh' });
  });
});

describe('classifyLaunch — the stored slot through classifySave', () => {
  const scenes: ReadonlyMap<string, ResumableScene> = new Map([
    ['n1-room', {}],
    ['act2-end', {}], // unsealed when Day 20 shipped
    ['d20-end', { ending: 'd20-end' }],
    ['act2-ash-2', { ending: 'ash' }],
  ]);

  it('resumes a mid-run save', () => {
    const storage = memoryStorage();
    const midRun = initialState(3, 'n1-room');
    persistSave(storage, midRun);
    expect(classifyLaunch(storage, scenes)).toEqual({ kind: 'resume', state: midRun });
  });

  it('holds a save parked on the NOVEMBER 26 card — storage untouched', () => {
    const storage = memoryStorage();
    const parked = initialState(3, 'd20-end');
    persistSave(storage, parked);
    expect(classifyLaunch(storage, scenes)).toEqual({ kind: 'held', state: parked });
    // Classifying is read-only: the slot the next slice inherits is still there.
    expect(loadSave(storage)).toEqual(parked);
  });

  it('resumes a save parked on the unsealed act2-end card — Day 20 inherits it', () => {
    const storage = memoryStorage();
    const parked = initialState(3, 'act2-end');
    persistSave(storage, parked);
    expect(classifyLaunch(storage, scenes)).toEqual({ kind: 'resume', state: parked });
    expect(loadSave(storage)).toEqual(parked);
  });

  it('a save parked on the Ash ending is a finished run — fresh start', () => {
    const storage = memoryStorage();
    persistSave(storage, initialState(3, 'act2-ash-2'));
    expect(classifyLaunch(storage, scenes)).toEqual({ kind: 'fresh' });
  });

  it('starts fresh when the saved scene no longer exists', () => {
    const storage = memoryStorage();
    persistSave(storage, initialState(3, 'gone-in-a-patch'));
    expect(classifyLaunch(storage, scenes)).toEqual({ kind: 'fresh' });
  });

  it('is fresh with no save at all', () => {
    expect(classifyLaunch(memoryStorage(), scenes)).toEqual({ kind: 'fresh' });
  });

  it('accepts the real content map — d20-end holds, act2-end resumes, ash frees the slot', () => {
    const content = buildContent();
    const storage = memoryStorage();
    persistSave(storage, initialState(9, 'd20-end'));
    expect(classifyLaunch(storage, content.scenes).kind).toBe('held');
    persistSave(storage, initialState(9, 'act2-end'));
    expect(classifyLaunch(storage, content.scenes).kind).toBe('resume');
    persistSave(storage, initialState(9, 'act2-ash-2'));
    expect(classifyLaunch(storage, content.scenes).kind).toBe('fresh');
    persistSave(storage, initialState(9, OPENING_SCENE));
    expect(classifyLaunch(storage, content.scenes).kind).toBe('resume');
  });

  it('the unsealed act1-end card is mid-run now — a save parked there resumes', () => {
    const content = buildContent();
    const storage = memoryStorage();
    persistSave(storage, initialState(9, 'act1-end'));
    expect(classifyLaunch(storage, content.scenes).kind).toBe('resume');
  });
});

describe('margin sidecar — the parked step’s events (pt2-fix-04)', () => {
  const events: readonly EngineEvent[] = [
    { kind: 'music.cue', cue: 'title' },
    { kind: 'tell.visual', text: '(Something has started counting.)' },
    { kind: 'save.autosave' },
  ];

  it('round-trips sceneId and events through the sidecar key', () => {
    const storage = memoryStorage();
    saveMargin(storage, 'act1-end', events);
    expect(loadMargin(storage)).toEqual({
      v: SAVE_SCHEMA_VERSION,
      sceneId: 'act1-end',
      events,
    });
  });

  it('returns null for a missing key or corrupt JSON', () => {
    expect(loadMargin(memoryStorage())).toBeNull();
    const storage = memoryStorage();
    storage.setItem(MARGIN_KEY, '{ not json');
    expect(loadMargin(storage)).toBeNull();
  });

  it('returns null for a version mismatch', () => {
    const storage = memoryStorage();
    storage.setItem(
      MARGIN_KEY,
      JSON.stringify({ v: SAVE_SCHEMA_VERSION + 1, sceneId: 'act1-end', events: [] }),
    );
    expect(loadMargin(storage)).toBeNull();
  });

  it('rejects malformed events wholesale — a bad margin replays nothing', () => {
    const storage = memoryStorage();
    storage.setItem(
      MARGIN_KEY,
      JSON.stringify({
        v: SAVE_SCHEMA_VERSION,
        sceneId: 'act1-end',
        events: [{ kind: 'music.cue' }], // cue payload missing
      }),
    );
    expect(loadMargin(storage)).toBeNull();
  });

  it('degrades gracefully when storage throws — flavour, never run state', () => {
    expect(() => saveMargin(throwingStorage(), 'x', [])).not.toThrow();
    expect(loadMargin(throwingStorage())).toBeNull();
  });

  it('clearSave clears the margin alongside the slot', () => {
    const storage = memoryStorage();
    persistSave(storage, initialState(7, 'n1-title'));
    saveMargin(storage, 'n1-title', events);
    clearSave(storage);
    expect(storage.dump().size).toBe(0);
  });
});

/**
 * Mini fixture story mirroring packages/engine advance.test.ts —
 * dock's onEnter moves the static meter, so a resume that re-entered
 * would observably double-apply it.
 */
const resumeScenes: readonly Scene[] = [
  defineScene({
    id: 'dock',
    prose: { kind: 'inline', paragraphs: [{ text: 'The dock creaks.' }] },
    cue: 'cue-dock',
    onEnter: [{ op: 'static.add', value: 5 }],
    choices: [
      {
        id: 'walk',
        label: 'Walk to the shrine',
        effects: [
          { op: 'stat.add', stat: 'flesh', value: 2 },
          { op: 'fact.add', tag: 'left-dock', witnessedBy: ['dianne'] },
        ],
        goto: 'shrine',
      },
    ],
  }),
  defineScene({
    id: 'shrine',
    prose: { kind: 'inline', paragraphs: [{ text: 'Candles gutter.' }] },
    choices: [{ id: 'finish', label: 'Let go', goto: 'gone' }],
  }),
  defineScene({
    id: 'gone',
    prose: { kind: 'inline', paragraphs: [{ text: 'You are not here.' }] },
    cue: 'cue-gone',
    ending: 'the-fog-takes-you',
    choices: [],
  }),
];

const fixtureContent: StoryContent = {
  scenes: new Map(resumeScenes.map((s) => [s.id, s])),
  derived: { longing: (state) => state.staticMeter / 10 },
  realizeProse: (scene) =>
    scene.prose.kind === 'inline' ? scene.prose.paragraphs.map((p) => p.text) : [],
};

const loadedOrThrow = (storage: SaveStorage): WorldState => {
  const loaded = loadSave(storage);
  if (loaded === null) throw new Error('expected a save in the slot');
  return loaded;
};

describe('resumeStep — save/resume equals continuous play (pt2-fix-03)', () => {
  const start = (): WorldState => initialState(7, 'dock');

  it('does not re-apply onEnter effects to the loaded save', () => {
    const storage = memoryStorage();
    const entered = advance(fixtureContent, start(), { kind: 'enter' });
    expect(entered.state.staticMeter).toBe(15);
    persistSave(storage, entered.state);
    const resumed = resumeStep(fixtureContent, loadedOrThrow(storage), storage);
    // A re-enter would move the meter again (to 20); resume must not.
    expect(resumed.state.staticMeter).toBe(15);
    expect(resumed.state).toEqual(entered.state);
  });

  it('a saved-and-reloaded state resumes to the exact continuous state and view', () => {
    const storage = memoryStorage();
    const continuous = advance(fixtureContent, start(), { kind: 'choose', choiceId: 'walk' });
    // The JSON round-trip a real slot does.
    persistSave(storage, continuous.state);
    const resumed = resumeStep(fixtureContent, loadedOrThrow(storage), storage);
    expect(resumed.state).toEqual(continuous.state);
    expect(resumed.view).toEqual(continuous.view);
  });

  it('a state-dependent view stays on the continuous variant across resume', () => {
    // Prose keyed on the meter — the shape of the night-scene variant swap.
    const variantContent: StoryContent = {
      ...fixtureContent,
      realizeProse: (_scene, state) => [
        state.staticMeter >= 20 ? 'The margin rots.' : 'The margin holds.',
      ],
    };
    const storage = memoryStorage();
    const entered = advance(variantContent, start(), { kind: 'enter' });
    expect(entered.view.paragraphs).toEqual(['The margin holds.']);
    persistSave(storage, entered.state);
    const loaded = loadedOrThrow(storage);
    const reentered = advance(variantContent, loaded, { kind: 'enter' });
    expect(reentered.view.paragraphs).toEqual(['The margin rots.']); // the bug
    const resumed = resumeStep(variantContent, loaded, storage);
    expect(resumed.view.paragraphs).toEqual(['The margin holds.']); // the fix
  });

  it('replays the margin events the first render carried when it matches', () => {
    const storage = memoryStorage();
    const entered = advance(fixtureContent, start(), { kind: 'enter' });
    persistSave(storage, entered.state);
    // As main.ts leaves them: save + margin written together on every step.
    saveMargin(storage, entered.state.sceneId, entered.events);
    const resumed = resumeStep(fixtureContent, loadedOrThrow(storage), storage);
    expect(resumed.events).toEqual(entered.events);
  });

  it('a stale margin from another scene falls back to the scene cue re-emit', () => {
    const storage = memoryStorage();
    const entered = advance(fixtureContent, start(), { kind: 'enter' });
    persistSave(storage, entered.state);
    saveMargin(storage, 'shrine', [{ kind: 'tell.visual', text: 'not this scene' }]);
    const resumed = resumeStep(fixtureContent, loadedOrThrow(storage), storage);
    expect(resumed.events).toEqual([{ kind: 'music.cue', cue: 'cue-dock' }]);
  });

  it('a held act2-end save resumes into Day 20 with every contract flag intact', () => {
    // The plan's exact requirement, mirrored from the CLI E2E: the parked
    // November classifies 'resume', the card re-prints with its open
    // morning, and the choice walks into d20-morning carrying the flags.
    const content = buildContent();
    const storage = memoryStorage();
    const parked: WorldState = {
      ...initialState(7, 'act2-end'),
      day: 20,
      slot: 'morning',
      flags: {
        'knows-truth': true,
        'letter-opened': true,
        'horn-on': true,
        'potluck:sam': 'defended',
        'potluck:verdict': 'defended',
        'd16:sam-named': true,
        'd18:kettle-day': true,
        'barb:counsel-seeded': true,
      },
    };
    persistSave(storage, parked);
    const launch = classifyLaunch(storage, content.scenes);
    if (launch.kind !== 'resume') throw new Error(`expected resume, got ${launch.kind}`);
    const card = resumeStep(content, launch.state, storage);
    expect(card.state).toEqual(parked);
    expect(card.view.ending).toBeUndefined();
    expect(card.view.choices.map((c) => c.id)).toEqual(['morning-comes-anyway']);
    const morning = advance(content, card.state, {
      kind: 'choose',
      choiceId: 'morning-comes-anyway',
    });
    expect(morning.state.sceneId).toBe('d20-morning');
    expect(morning.state.day).toBe(20);
    for (const [key, value] of Object.entries(parked.flags)) {
      expect(morning.state.flags[key], `contract flag ${key}`).toBe(value);
    }
  });

  it('resumes a real mid-run save through the exact main.ts path', () => {
    const content = buildContent();
    const storage = memoryStorage();
    const entered = advance(content, initialState(1971, OPENING_SCENE), { kind: 'enter' });
    persistSave(storage, entered.state);
    saveMargin(storage, entered.state.sceneId, entered.events);
    const launch = classifyLaunch(storage, content.scenes);
    if (launch.kind !== 'resume') throw new Error('expected a resumable save');
    const resumed = resumeStep(content, launch.state, storage);
    expect(resumed.state).toEqual(entered.state);
    expect(resumed.view).toEqual(entered.view);
    expect(resumed.events).toEqual(entered.events);
  });
});
