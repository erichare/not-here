/**
 * The structural cards: the prologue's act line, the act titles, the held
 * place, the named endings. Chrome around the engine's card prose, never
 * prose itself; ids never reach the player (model/endings.ts).
 */

import type { CardKind } from '../model/places.ts';
import { ACT_CARDS, endingCardFor } from '../model/endings.ts';
import { ACT_BOUNDARY_ENDINGS } from '../save.ts';
import { el } from './dom.ts';

export interface CardChrome {
  /** Nodes to place above the entry (eyebrow, title). */
  readonly above: readonly HTMLElement[];
  /** Engine paragraphs to skip because the chrome already says them. */
  readonly skip: (paragraph: string) => boolean;
}

const NONE: CardChrome = { above: [], skip: () => false };

export const cardChrome = (kind: CardKind | null, sceneId: string | undefined, ending: string | undefined): CardChrome => {
  if (kind === null || sceneId === undefined) return NONE;
  if (kind === 'ending' && ending !== undefined) {
    const card = endingCardFor(ending, ACT_BOUNDARY_ENDINGS);
    if (card.name === null) return NONE;
    return { above: [el('p', 'card-title', card.name)], skip: () => false };
  }
  const act = ACT_CARDS[sceneId];
  if (act === undefined) return NONE;
  const eyebrow = el('p', 'card-eyebrow', act.eyebrow);
  if (kind === 'prologue') {
    // the first screen: a small act line above the opening, nothing louder
    return { above: [el('p', 'card-eyebrow card-eyebrow--prologue', `${act.eyebrow} · ${act.title}`)], skip: () => false };
  }
  const title = el('p', 'card-title', act.title);
  return {
    above: [eyebrow, title],
    // the engine's own 'ACT TWO' line is the eyebrow already
    skip: (paragraph) => paragraph.trim().toUpperCase() === act.eyebrow,
  };
};
