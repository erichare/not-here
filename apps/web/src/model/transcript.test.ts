import { describe, expect, it } from 'vitest';
import {
  appendEntry,
  clearTranscript,
  EMPTY_TRANSCRIPT,
  loadTranscript,
  markChosen,
  saveTranscript,
  TRANSCRIPT_CAP,
  TRANSCRIPT_KEY,
  type TranscriptEntry,
} from './transcript.ts';

const entry = (scene: string, n = 1): TranscriptEntry => ({
  scene,
  day: 1,
  slot: 'night',
  header: 'DAY 1 — NIGHT',
  paragraphs: [`paragraph ${n} of ${scene}`],
});

const memory = () => {
  const map = new Map<string, string>();
  return {
    getItem: (k: string) => map.get(k) ?? null,
    setItem: (k: string, v: string) => void map.set(k, v),
    removeItem: (k: string) => void map.delete(k),
    dump: () => map,
  };
};

describe('appendEntry', () => {
  it('appends in order and dedupes a resumed screen', () => {
    let t = appendEntry(EMPTY_TRANSCRIPT, entry('n1-beach'));
    t = appendEntry(t, entry('n1-walk'));
    t = appendEntry(t, entry('n1-walk')); // the same scene re-rendered on resume
    expect(t.entries.map((e) => e.scene)).toEqual(['n1-beach', 'n1-walk']);
  });

  it('keeps a genuine revisit with different prose', () => {
    let t = appendEntry(EMPTY_TRANSCRIPT, entry('d4-evening', 1));
    t = appendEntry(t, entry('d4-evening', 2));
    expect(t.entries).toHaveLength(2);
  });

  it('caps entries, dropping the oldest and flagging it', () => {
    let t = EMPTY_TRANSCRIPT;
    for (let i = 0; i < TRANSCRIPT_CAP.entries + 5; i += 1) t = appendEntry(t, entry(`s${i}`));
    expect(t.entries).toHaveLength(TRANSCRIPT_CAP.entries);
    expect(t.truncated).toBe(true);
    expect(t.entries[0]?.scene).toBe('s5');
  });
});

describe('markChosen', () => {
  it('records the label on the most recent entry for the scene', () => {
    let t = appendEntry(EMPTY_TRANSCRIPT, entry('n1-beach'));
    t = appendEntry(t, entry('n1-walk'));
    t = markChosen(t, 'n1-beach', 'Walk toward the lights.');
    expect(t.entries[0]?.chosen).toBe('Walk toward the lights.');
    expect(t.entries[1]?.chosen).toBeUndefined();
    expect(markChosen(t, 'nowhere', 'x')).toEqual(t);
  });
});

describe('storage', () => {
  it('round-trips and clears under its own key', () => {
    const storage = memory();
    const t = appendEntry(EMPTY_TRANSCRIPT, entry('n1-beach'));
    expect(saveTranscript(storage, t)).toBe(true);
    expect([...storage.dump().keys()]).toEqual([TRANSCRIPT_KEY]);
    expect(loadTranscript(storage)).toEqual(t);
    clearTranscript(storage);
    expect(loadTranscript(storage)).toEqual(EMPTY_TRANSCRIPT);
  });

  it('loads corrupt or foreign shapes as empty', () => {
    const storage = memory();
    storage.setItem(TRANSCRIPT_KEY, '{bad');
    expect(loadTranscript(storage)).toEqual(EMPTY_TRANSCRIPT);
    storage.setItem(TRANSCRIPT_KEY, JSON.stringify({ v: 1, truncated: false, entries: [{ scene: 3 }] }));
    expect(loadTranscript(storage)).toEqual(EMPTY_TRANSCRIPT);
  });

  it('evicts half and retries once when storage refuses', () => {
    let calls = 0;
    const flaky = {
      setItem: (_k: string, v: string) => {
        calls += 1;
        if (calls === 1) throw new Error('quota');
        expect(JSON.parse(v).entries).toHaveLength(2);
      },
    };
    let t = EMPTY_TRANSCRIPT;
    for (let i = 0; i < 4; i += 1) t = appendEntry(t, entry(`s${i}`));
    expect(saveTranscript(flaky, t)).toBe(true);
    expect(saveTranscript({ setItem: () => { throw new Error('no'); } }, appendEntry(EMPTY_TRANSCRIPT, entry('x')))).toBe(false);
  });
});
