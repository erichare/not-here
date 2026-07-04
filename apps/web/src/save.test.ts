import { describe, expect, it } from 'vitest';
import { initialState } from '@not-here/engine';
import {
  clearSave,
  hasSave,
  loadSave,
  persistSave,
  SAVE_KEY,
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
});
