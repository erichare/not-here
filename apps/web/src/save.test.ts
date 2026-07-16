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
  clearSave,
  hasSave,
  loadMargin,
  loadSave,
  MARGIN_KEY,
  persistSave,
  resumableSave,
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

describe('resumableSave', () => {
  const scenes: ReadonlyMap<string, ResumableScene> = new Map([
    ['n1-room', {}],
    ['act2-end', { ending: 'act2-end' }],
  ]);

  it('returns a mid-run save', () => {
    const storage = memoryStorage();
    const midRun = initialState(3, 'n1-room');
    persistSave(storage, midRun);
    expect(resumableSave(storage, scenes)).toEqual(midRun);
  });

  it('treats a save parked on an ending as a finished run', () => {
    const storage = memoryStorage();
    persistSave(storage, initialState(3, 'act2-end'));
    expect(resumableSave(storage, scenes)).toBeNull();
  });

  it('starts fresh when the saved scene no longer exists', () => {
    const storage = memoryStorage();
    persistSave(storage, initialState(3, 'gone-in-a-patch'));
    expect(resumableSave(storage, scenes)).toBeNull();
  });

  it('is null with no save at all', () => {
    expect(resumableSave(memoryStorage(), scenes)).toBeNull();
  });

  it('accepts the real content map and a real ending scene', () => {
    const content = buildContent();
    const storage = memoryStorage();
    persistSave(storage, initialState(9, 'act2-end'));
    expect(resumableSave(storage, content.scenes)).toBeNull();
    persistSave(storage, initialState(9, OPENING_SCENE));
    expect(resumableSave(storage, content.scenes)).not.toBeNull();
  });

  it('the unsealed act1-end card is mid-run now — a save parked there resumes', () => {
    const content = buildContent();
    const storage = memoryStorage();
    persistSave(storage, initialState(9, 'act1-end'));
    expect(resumableSave(storage, content.scenes)).not.toBeNull();
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

  it('resumes a real mid-run save through the exact main.ts path', () => {
    const content = buildContent();
    const storage = memoryStorage();
    const entered = advance(content, initialState(1971, OPENING_SCENE), { kind: 'enter' });
    persistSave(storage, entered.state);
    saveMargin(storage, entered.state.sceneId, entered.events);
    const saved = resumableSave(storage, content.scenes);
    if (saved === null) throw new Error('expected a resumable save');
    const resumed = resumeStep(content, saved, storage);
    expect(resumed.state).toEqual(entered.state);
    expect(resumed.view).toEqual(entered.view);
    expect(resumed.events).toEqual(entered.events);
  });
});
