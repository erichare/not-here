/**
 * One ledger entry: prose paragraphs split into word spans for the reveal,
 * `@doc:` artifacts rendered as paper, and the choices. The DAY — SLOT
 * header lives in the frame now (the strip); ending and held cards keep
 * their own marks in the choices list. Returns the nodes plus the reveal plan.
 */

import { renderDoc } from './docs.ts';
import { ARTIFACT_PAUSE_MS, WORD_INTERVAL_MS, type RevealItem } from './reveal.ts';
import { buildChoices, type ChoicesCallbacks, type ChoicesInput, type RotInput } from './choices.ts';
import { el } from './dom.ts';

/** Paragraphs with this prefix are document artifacts: rendered verbatim. */
export const DOC_PREFIX = '@doc:\n';

export interface EntryModel extends ChoicesInput {
  readonly sceneId?: string;
  readonly header: string;
  readonly paragraphs: readonly string[];
}

export interface RenderedEntry {
  readonly children: readonly HTMLElement[];
  readonly revealItems: readonly RevealItem[];
  readonly choices: HTMLUListElement;
}

/** Split a paragraph into word spans; returns the spans for the typewriter. */
export const buildParagraph = (text: string): { p: HTMLParagraphElement; words: HTMLSpanElement[] } => {
  const p = el('p', 'prose');
  const words: HTMLSpanElement[] = [];
  for (const word of text.split(/\s+/).filter((w) => w.length > 0)) {
    const span = el('span', 'w', word);
    words.push(span);
    p.append(span, ' ');
  }
  return { p, words };
};

export const renderEntry = (model: EntryModel, callbacks: ChoicesCallbacks, rot?: RotInput): RenderedEntry => {
  const entry = el('section', 'entry');
  const revealItems: RevealItem[] = [];
  for (const paragraph of model.paragraphs) {
    if (paragraph.startsWith(DOC_PREFIX)) {
      const doc = renderDoc(paragraph.slice(DOC_PREFIX.length));
      entry.append(doc);
      revealItems.push({ node: doc, delayMs: ARTIFACT_PAUSE_MS });
      continue;
    }
    const { p, words } = buildParagraph(paragraph);
    revealItems.push(...words.map((node) => ({ node, delayMs: WORD_INTERVAL_MS })));
    entry.append(p);
  }
  const choices = buildChoices(model, callbacks, rot);
  return { children: [entry, choices], revealItems, choices };
};
