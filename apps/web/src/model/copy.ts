/**
 * Every player-facing string the UI itself authors — chrome, captions, the
 * title's hints, the lamp's controls. The prose package owns the story; the
 * UI never injects prose into an entry. Rules (copy.test.ts): no digits, no
 * scene-id-like slugs, never the title phrase outside the attractor.
 */

export const TITLE_COPY = {
  fresh: { aria: 'The lamp is lit. Begin.', hint: 'the lamp is lit — click the window' },
  resume: { aria: 'The lamp is lit. Resume your ledger.', hint: 'the lamp is still lit — return to the ledger' },
  held: { aria: 'The lamp is lit. Your November is kept.', hint: 'the lamp is still lit — your November is kept' },
} as const;

export const WORDMARK = 'NOT HERE';

/** The held-place card's one line — spoken in the game's register. */
export const HELD_LINE = 'Your November is kept. The twenty-eighth is not written yet.';

export const BEGIN_AGAIN = 'Begin the ledger again.';
export const NEW_LEDGER = 'begin a new ledger instead';

export const PEN_HESITATES = 'the pen hesitates.';

export const BOOK = {
  consult: 'consult Barb’s book',
  close: 'close the book',
  exitBeat: 'the book goes back under the counter.',
  title: 'BARB’S BOOK',
  subtitle: 'double-inked, a steady hand, the guest’s page',
  told: 'what you told her, night one',
  margins: 'margins, other hands',
  aria: 'Barb’s book',
} as const;

export const FRAME = {
  book: 'Barb’s book',
  history: 'the ledger so far',
  settings: 'the lamp',
} as const;

export const HISTORY = {
  title: 'the ledger so far',
  close: 'back to the page',
  empty: 'nothing written yet.',
  aria: 'the ledger so far',
} as const;

export const SETTINGS = {
  title: 'the lamp',
  close: 'leave it',
  aria: 'the lamp',
  pace: { label: 'the pen’s pace', note: 'how fast she writes.', slow: 'slow', steady: 'steady', quick: 'quick', instant: 'at once' },
  print: { label: 'the print', note: 'for the reading glasses.', smaller: 'smaller', normal: 'as printed', larger: 'larger', largest: 'largest' },
  lamp: { label: 'the lamp', note: 'how far the horn carries.', lit: 'lit', unlit: 'unlit' },
  weather: { label: 'the weather', note: 'the fog holds still if you ask it.', move: 'let it move', still: 'hold still', system: 'as the room is' },
  stutter: { label: 'the lamp’s stutter', note: 'a lived-in lamp stutters, once in a while.', on: 'let it stutter', off: 'keep it steady' },
} as const;

export const INTERSTITIAL = {
  mark: '3:12.',
  horn: 'five bars, then the stop',
  silence: 'no horn. the quiet goes on being one piece.',
  skip: 'any key',
} as const;
