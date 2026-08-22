/**
 * The ledger so far — a web-side transcript of this run's entries, so the
 * player can re-read. A sidecar beside the save (its own key; clearSave
 * removes it; held saves never write it), bounded in entries and bytes,
 * appended only from the live/resume path in applyStep and deduped on
 * (scene, paragraphs) so a resumed screen never duplicates its entry.
 * Corrupt storage loads as an empty transcript. Never run state.
 */

export const TRANSCRIPT_KEY = 'not-here:slot1:transcript';
export const TRANSCRIPT_VERSION = 1;
export const TRANSCRIPT_CAP = { entries: 400, bytes: 1_500_000 } as const;

export interface TranscriptEntry {
  readonly scene: string;
  readonly day: number;
  readonly slot: string;
  readonly header: string;
  readonly paragraphs: readonly string[];
  /** The label the player chose to leave this entry, once known. */
  readonly chosen?: string;
  readonly ending?: string;
}

export interface Transcript {
  readonly v: typeof TRANSCRIPT_VERSION;
  readonly entries: readonly TranscriptEntry[];
  /** True once the cap has dropped oldest entries. */
  readonly truncated: boolean;
}

export const EMPTY_TRANSCRIPT: Transcript = { v: TRANSCRIPT_VERSION, entries: [], truncated: false };

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isEntry = (value: unknown): value is TranscriptEntry =>
  isRecord(value) &&
  typeof value['scene'] === 'string' &&
  typeof value['day'] === 'number' &&
  typeof value['slot'] === 'string' &&
  typeof value['header'] === 'string' &&
  Array.isArray(value['paragraphs']) &&
  value['paragraphs'].every((p) => typeof p === 'string') &&
  (value['chosen'] === undefined || typeof value['chosen'] === 'string') &&
  (value['ending'] === undefined || typeof value['ending'] === 'string');

const isTranscript = (value: unknown): value is Transcript =>
  isRecord(value) &&
  value['v'] === TRANSCRIPT_VERSION &&
  typeof value['truncated'] === 'boolean' &&
  Array.isArray(value['entries']) &&
  value['entries'].every(isEntry);

const sameParagraphs = (a: readonly string[], b: readonly string[]): boolean =>
  a.length === b.length && a.every((p, i) => p === b[i]);

/** Drop oldest entries until both caps hold. */
const capped = (transcript: Transcript): Transcript => {
  let entries = transcript.entries;
  let truncated = transcript.truncated;
  while (entries.length > TRANSCRIPT_CAP.entries) {
    entries = entries.slice(1);
    truncated = true;
  }
  while (entries.length > 1 && JSON.stringify(entries).length > TRANSCRIPT_CAP.bytes) {
    entries = entries.slice(1);
    truncated = true;
  }
  return { v: TRANSCRIPT_VERSION, entries, truncated };
};

/**
 * Append an entry. Idempotent on a resumed screen: the same scene with the
 * same paragraphs as the last entry is not appended again.
 */
export const appendEntry = (transcript: Transcript, entry: TranscriptEntry): Transcript => {
  const last = transcript.entries[transcript.entries.length - 1];
  if (last !== undefined && last.scene === entry.scene && sameParagraphs(last.paragraphs, entry.paragraphs)) {
    return transcript;
  }
  return capped({ ...transcript, entries: [...transcript.entries, entry] });
};

/** Record the label chosen to leave a scene, on its most recent entry. */
export const markChosen = (transcript: Transcript, sceneId: string, label: string): Transcript => {
  const index = transcript.entries.map((e) => e.scene).lastIndexOf(sceneId);
  if (index < 0) return transcript;
  const entry = transcript.entries[index];
  if (entry === undefined) return transcript;
  const entries = transcript.entries.map((e, i) => (i === index ? { ...entry, chosen: label } : e));
  return { ...transcript, entries };
};

export const loadTranscript = (storage: { getItem(key: string): string | null }): Transcript => {
  try {
    const raw = storage.getItem(TRANSCRIPT_KEY);
    if (raw === null) return EMPTY_TRANSCRIPT;
    const parsed: unknown = JSON.parse(raw);
    return isTranscript(parsed) ? parsed : EMPTY_TRANSCRIPT;
  } catch {
    return EMPTY_TRANSCRIPT;
  }
};

/**
 * Persist; on quota, evict the oldest half and retry once. False means the
 * ledger-so-far simply isn't kept — never fatal, never before the save.
 */
export const saveTranscript = (
  storage: { setItem(key: string, value: string): void },
  transcript: Transcript,
): boolean => {
  try {
    storage.setItem(TRANSCRIPT_KEY, JSON.stringify(transcript));
    return true;
  } catch {
    const half = Math.floor(transcript.entries.length / 2);
    if (half === 0) return false;
    try {
      storage.setItem(
        TRANSCRIPT_KEY,
        JSON.stringify({ ...transcript, entries: transcript.entries.slice(half), truncated: true }),
      );
      return true;
    } catch {
      return false;
    }
  }
};

export const clearTranscript = (storage: { removeItem(key: string): void }): void => {
  try {
    storage.removeItem(TRANSCRIPT_KEY);
  } catch {
    // Nothing to clear if storage itself is gone.
  }
};
