/**
 * Glyph-rot — the fog's claim on your words, web side. Mirrors the CLI's
 * margin rot (apps/cli/src/render.ts degradeMargin: the same wrong-but-
 * nearby letterforms, the same thresholds, deterministic in the save) and
 * adds the title-thread attractor: at high STATIC in Act 3 one choice label
 * per screen decays at its tail into the spaced letters of the title. Rules
 * that keep it honest (design/title-thread.md, the plan's invariants):
 *   - rot touches choice labels only — never prose, documents, captions;
 *   - the attractor renders the SPACED form, never the contiguous phrase;
 *   - at most one label per screen, never a major choice, never the only
 *     open choice; the real label stays the accessible name (ui side);
 *   - everything is a pure function of (label, meter, seed).
 */

import { staticTierFor, type StaticTier } from '@not-here/story';

export type RotSegmentKind = 'plain' | 'spaced' | 'sub' | 'attract';

export interface RotSegment {
  readonly kind: RotSegmentKind;
  readonly text: string;
}

export interface RotModel {
  readonly tier: StaticTier;
  /** staticMeter / 100 */
  readonly value: number;
  /** Whether the attractor is armed for this screen (see rotPlan). */
  readonly attractArmed: boolean;
}

/** Wrong-but-nearby letterforms; the letters walk, they do not vanish. */
export const ROT_GLYPHS: Readonly<Record<string, string>> = {
  a: 'ɑ',
  c: 'ɔ',
  d: 'ð',
  e: 'ǝ',
  g: 'ǥ',
  h: 'ɦ',
  i: 'ɪ',
  l: 'ɭ',
  m: 'ɱ',
  n: 'ɳ',
  o: 'ø',
  r: 'ɾ',
  s: 'ʂ',
  t: 'ʈ',
  u: 'ʊ',
  w: 'ʍ',
};

/**
 * The title's letters. The attractor writes them spaced — 'n o t   h e r e',
 * a wide gap at the word break — so the contiguous phrase never appears in
 * any text node (design/title-thread.md keeps the phrase itself scarce).
 */
export const ATTRACTOR_LETTERS = ['n', 'o', 't', 'h', 'e', 'r', 'e'] as const;
const ATTRACTOR_BREAK = 3; // index of 'h' — the word gap sits before it

/** The last `n` letters of the title, spaced. */
export const attractorTail = (n: number): string => {
  const count = Math.max(0, Math.min(ATTRACTOR_LETTERS.length, n));
  const start = ATTRACTOR_LETTERS.length - count;
  let out = '';
  for (let i = start; i < ATTRACTOR_LETTERS.length; i += 1) {
    if (i > start) out += i === ATTRACTOR_BREAK ? '   ' : ' ';
    out += ATTRACTOR_LETTERS[i];
  }
  return out;
};
export const ATTRACTOR_METER = 75;
export const ATTRACTOR_DAY = 20;
/** Substitution odds per eligible letter at the walking tier (the CLI's). */
export const WALKING_RATE = 1 / 6;
/** The attractor replaces this share of a label's tail (at least three). */
export const ATTRACTOR_SHARE = 0.15;

/** Mulberry32 step — pure; local so the model stays dependency-free. */
const rotStep = (state: number): readonly [number, number] => {
  const a = (state + 0x6d2b79f5) >>> 0;
  let x = Math.imul(a ^ (a >>> 15), 1 | a);
  x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x;
  return [((x ^ (x >>> 14)) >>> 0) / 4294967296, a] as const;
};

export const rotModelFor = (staticMeter: number, attractArmed: boolean): RotModel => ({
  tier: staticTierFor(staticMeter),
  value: Math.max(0, Math.min(1, staticMeter / 100)),
  attractArmed,
});

const pushSegment = (out: RotSegment[], kind: RotSegmentKind, text: string): void => {
  if (text.length === 0) return;
  const last = out[out.length - 1];
  if (last !== undefined && last.kind === kind) {
    out[out.length - 1] = { kind, text: last.text + text };
    return;
  }
  out.push({ kind, text });
};

/** The label's words with their offsets — for picking one to space. */
const words = (label: string): readonly { start: number; end: number }[] => {
  const out: { start: number; end: number }[] = [];
  const re = /\S+/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(label)) !== null) out.push({ start: match.index, end: match.index + match[0].length });
  return out;
};

export interface RotLabelOptions {
  /** Apply the attractor to this label (rotPlan decides which one). */
  readonly attract?: boolean;
}

/**
 * Render one label as segments. Deterministic in (label, meter, seed).
 * clear/inked: untouched (inked is a CSS second pass, not a substitution).
 * hissing: one word letter-spaced. walking: one word spaced, eligible letters
 * substituted at WALKING_RATE; with `attract`, the tail becomes the title.
 */
export const rotLabel = (
  label: string,
  staticMeter: number,
  seed: number,
  options: RotLabelOptions = {},
): readonly RotSegment[] => {
  const tier = staticTierFor(staticMeter);
  if (tier === 'clear' || tier === 'inked') return [{ kind: 'plain', text: label }];

  let rng = (seed ^ 0x9e3779b9) >>> 0;
  const next = (): number => {
    const [roll, state] = rotStep(rng);
    rng = state;
    return roll;
  };

  const ws = words(label);
  const spaced = ws.length > 0 ? ws[Math.floor(next() * ws.length)] : undefined;
  const attract = options.attract === true && tier === 'walking';
  const tail = attract
    ? Math.min(ATTRACTOR_LETTERS.length, label.length, Math.max(3, Math.round(label.length * ATTRACTOR_SHARE)))
    : 0;
  const keep = label.length - tail;

  const out: RotSegment[] = [];
  for (let i = 0; i < keep; i += 1) {
    const ch = label[i] as string;
    const inSpaced = spaced !== undefined && i >= spaced.start && i < spaced.end;
    const twin = tier === 'walking' ? ROT_GLYPHS[ch.toLowerCase()] : undefined;
    if (twin !== undefined && next() < WALKING_RATE) {
      pushSegment(out, 'sub', twin);
      continue;
    }
    pushSegment(out, inSpaced ? 'spaced' : 'plain', ch);
  }
  if (tail > 0) pushSegment(out, 'attract', attractorTail(tail));
  return out;
};

/** The visible text of a rendered label — what a sighted player reads. */
export const rotText = (segments: readonly RotSegment[]): string =>
  segments.map((s) => s.text).join('');

export interface RotCandidate {
  readonly label: string;
  readonly major: boolean;
  readonly locked: boolean;
}

export interface RotPlan {
  readonly tier: StaticTier;
  /** Index (into the given list) of the one label that decays, or null. */
  readonly attractIndex: number | null;
}

/**
 * Decide, per screen, whether and where the attractor lands: walking tier,
 * STATIC ≥ 75, Act 3 (day ≥ 20), never a major, never the only open choice,
 * never a locked line. Deterministic in the seed.
 */
export const rotPlan = (
  choices: readonly RotCandidate[],
  staticMeter: number,
  day: number,
  seed: number,
): RotPlan => {
  const tier = staticTierFor(staticMeter);
  const open = choices.filter((c) => !c.locked);
  if (tier !== 'walking' || staticMeter < ATTRACTOR_METER || day < ATTRACTOR_DAY || open.length <= 1) {
    return { tier, attractIndex: null };
  }
  const candidates = choices.map((c, i) => (c.locked || c.major ? -1 : i)).filter((i) => i >= 0);
  if (candidates.length === 0) return { tier, attractIndex: null };
  const [roll] = rotStep((seed ^ 0x51ed270b) >>> 0);
  const pick = candidates[Math.floor(roll * candidates.length)];
  return { tier, attractIndex: pick ?? null };
};
