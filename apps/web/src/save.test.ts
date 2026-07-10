import { describe, expect, it } from 'vitest';
import { advance, initialState } from '@not-here/engine';
import { buildContent, OPENING_SCENE } from '@not-here/story';
import {
  clearSave,
  hasSave,
  loadSave,
  persistSave,
  resumableSave,
  SAVE_KEY,
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
