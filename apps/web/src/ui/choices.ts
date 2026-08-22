/**
 * Choices as ledger lines — '— Label' buttons, locked lines behind a '·'.
 * Number keys 1–9 pick the nth open choice (the CLI's grammar carried into
 * the browser), suppressed while any overlay owns the page and when a
 * modifier is held. The ending card's lines (close / held / begin again)
 * are built here too.
 */

import { BEGIN_AGAIN, HELD_LINE } from '../model/copy.ts';
import { endingCardFor } from '../model/endings.ts';
import { ACT_BOUNDARY_ENDINGS } from '../save.ts';
import { anyOverlayOpen, el } from './dom.ts';

export interface ChoiceModel {
  readonly id: string;
  readonly label: string;
  readonly locked: boolean;
  readonly stakes?: 'major';
}

export interface ChoicesInput {
  readonly choices: readonly ChoiceModel[];
  readonly ending?: string;
  readonly held?: boolean;
}

export interface ChoicesCallbacks {
  readonly onChoose: (choiceId: string) => void;
  readonly onNewGame: () => void;
}

export const buildChoices = (model: ChoicesInput, callbacks: ChoicesCallbacks): HTMLUListElement => {
  const list = el('ul', 'choices');
  list.inert = true;
  list.setAttribute('aria-hidden', 'true');
  for (const choice of model.choices) {
    const item = el('li', 'choice-line');
    const className = choice.stakes === 'major' ? 'choice major' : 'choice';
    if (choice.locked) {
      item.append(el('span', `${className} locked`, `· ${choice.label}`));
    } else {
      const button = el('button', className, `— ${choice.label}`);
      button.type = 'button';
      button.addEventListener('click', (event) => {
        event.stopPropagation();
        callbacks.onChoose(choice.id);
      });
      item.append(button);
    }
    list.append(item);
  }
  if (model.ending !== undefined) {
    const item = el('li', 'choice-line');
    const card = endingCardFor(model.ending, ACT_BOUNDARY_ENDINGS);
    if (model.held === true) {
      // pt2-fix-01: an act boundary is a held place, not a close — no
      // reset offer; the next act inherits this ledger.
      item.append(el('p', 'ending-mark', '— the ledger waits here —'), el('p', 'held-line', HELD_LINE));
    } else {
      const again = el('button', 'choice', `— ${BEGIN_AGAIN}`);
      again.type = 'button';
      again.addEventListener('click', (event) => {
        event.stopPropagation();
        callbacks.onNewGame();
      });
      item.append(el('p', 'ending-mark', card.held ? '— the ledger waits here —' : '— the ledger closes here —'), again);
    }
    list.append(item);
  }
  return list;
};

/** Arm 1–9 on the list's open choices; returns the disarm function. */
export const armChoiceKeys = (list: HTMLElement): (() => void) => {
  const buttons = [...list.querySelectorAll<HTMLButtonElement>('button.choice')];
  if (buttons.length === 0) return () => {};
  const onKey = (event: KeyboardEvent): void => {
    if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.altKey) return;
    // An open overlay owns the page — no ledger moves under it.
    if (anyOverlayOpen()) return;
    const digit = Number(event.key);
    if (!Number.isInteger(digit) || digit < 1 || digit > buttons.length) return;
    const button = buttons[digit - 1];
    if (button === undefined) return;
    event.preventDefault();
    button.click();
  };
  document.addEventListener('keydown', onKey);
  return () => document.removeEventListener('keydown', onKey);
};
