/**
 * Cards and their copy: the act titles, the ending and held-place labels,
 * the NG+ subtitle. Ids are internal — every card speaks the prose register
 * and an unknown id gets the generic close, never the raw id (CLI fix-07,
 * mirrored here). Completed runs are remembered in a separate storage key
 * so the title can learn the song's name (design/title-thread.md rule 4).
 */

export const COMPLETED_KEY = 'not-here:completed';

export interface ActCard {
  readonly eyebrow: string;
  readonly title: string;
}

/** The act titles (design/act*-beats.md, design/act3-plan.md). */
export const ACT_CARDS: Readonly<Record<string, ActCard>> = {
  'n1-title': { eyebrow: 'ACT ONE', title: 'The Return' },
  'act1-end': { eyebrow: 'ACT TWO', title: 'The Seams' },
  'act2-end': { eyebrow: 'ACT THREE', title: 'The Friday Bus' },
};

/** Ending/held labels — the CLI's exact table (apps/cli/src/render.ts). */
export const ENDING_LABELS: Readonly<Record<string, string>> = {
  'act1-end': 'end of the first act',
  'act2-end': 'end of the second act',
  'd20-end': 'held for the twenty-sixth',
  'd21-end': 'held for the twenty-seventh',
  'd22-end': 'held for the twenty-eighth',
};

export const DEFAULT_ENDING_LABEL = 'the ledger closes here';
export const HELD_ENDING_LABEL = 'the ledger waits here';

/** Named endings (game-bible.md) — cards for the day they are authored. */
export const ENDING_NAMES: Readonly<Record<string, string>> = {
  'sixth-bar': 'The Sixth Bar',
  'wren-again': 'Welcome Home',
  'two-wrens': 'Two Wrens',
  stranger: 'The Stranger on the Gravel',
  'long-winter': 'The Long Winter',
  unwitnessed: 'Unwitnessed',
  ash: 'Ash',
};

export const NG_PLUS_SUBTITLE = 'a song by Wren Cole';

export interface EndingCard {
  /** The close/held mark line, in the prose register. */
  readonly mark: string;
  /** A named ending's title, if the ending has one. */
  readonly name: string | null;
  readonly held: boolean;
}

/** Never returns a raw id. */
export const endingCardFor = (endingId: string, heldEndings: ReadonlySet<string>): EndingCard => {
  const held = heldEndings.has(endingId);
  const label = ENDING_LABELS[endingId] ?? (held ? HELD_ENDING_LABEL : DEFAULT_ENDING_LABEL);
  return { mark: `— ${label} —`, name: ENDING_NAMES[endingId] ?? null, held };
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

/** The endings a player has reached on this device, oldest first. */
export const completedEndings = (storage: { getItem(key: string): string | null }): readonly string[] => {
  try {
    const raw = storage.getItem(COMPLETED_KEY);
    if (raw === null) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!isRecord(parsed) || !Array.isArray(parsed['endings'])) return [];
    return parsed['endings'].filter((e): e is string => typeof e === 'string');
  } catch {
    return [];
  }
};

/** Remember a reached ending (held places are not endings — callers filter). */
export const recordEnding = (
  storage: { getItem(key: string): string | null; setItem(key: string, value: string): void },
  endingId: string,
): void => {
  const seen = completedEndings(storage);
  if (seen.includes(endingId)) return;
  try {
    storage.setItem(COMPLETED_KEY, JSON.stringify({ v: 1, endings: [...seen, endingId] }));
  } catch {
    // The device just doesn't remember — the title stays first-run.
  }
};
