/**
 * Choices as ledger lines: a pen-stroke dash, then the label. The hover
 * draws an underline; the press INKS the line (a second pass of the pen)
 * before the scene turns — once, ever: the list commits on the first press
 * and ignores the rest. Locked lines sit behind a hollow dot. Number keys
 * 1–9 pick the nth open choice (the CLI's grammar), suppressed while any
 * overlay owns the page and when a modifier is held; a number hint appears
 * only after the keyboard has been used. STATIC rot touches the visible
 * label only — the accessible name stays whole.
 */

import { BEGIN_AGAIN, HELD_LINE } from '../model/copy.ts';
import { endingCardFor } from '../model/endings.ts';
import { rotLabel, rotText, type RotPlan, type RotSegment } from '../model/rot.ts';
import { ACT_BOUNDARY_ENDINGS } from '../save.ts';
import { anyOverlayOpen, el, motionOff, wait } from './dom.ts';

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

export interface RotInput {
  readonly staticMeter: number;
  readonly seed: number;
  readonly plan: RotPlan;
}

/** The pen's second pass before the turn. */
export const INK_MS = 350;

const STROKE = '<svg class="stroke" viewBox="0 0 24 12" aria-hidden="true" focusable="false"><path d="M2 6 C8 4 14 7 22 5"/></svg>';
const DOT = '<svg class="stroke stroke--dot" viewBox="0 0 12 12" aria-hidden="true" focusable="false"><circle cx="6" cy="6" r="2.4"/></svg>';

const labelSpan = (segments: readonly RotSegment[]): HTMLElement => {
  const span = el('span', 'label');
  for (const segment of segments) {
    if (segment.kind === 'plain') span.append(document.createTextNode(segment.text));
    else span.append(el('span', `rot-${segment.kind}`, segment.text));
  }
  return span;
};

export const buildChoices = (model: ChoicesInput, callbacks: ChoicesCallbacks, rot?: RotInput): HTMLUListElement => {
  const list = el('ul', 'choices');
  list.inert = true;
  list.setAttribute('aria-hidden', 'true');
  let committed = false;

  const commit = (button: HTMLButtonElement, id: string): void => {
    if (committed) return;
    committed = true;
    list.classList.add('committed');
    button.classList.add('inked');
    for (const other of list.querySelectorAll<HTMLButtonElement>('button.choice')) other.disabled = other !== button;
    if (motionOff()) {
      callbacks.onChoose(id);
      return;
    }
    void wait(INK_MS).then(() => callbacks.onChoose(id));
  };

  model.choices.forEach((choice, index) => {
    const item = el('li', 'choice-line');
    const className = choice.stakes === 'major' ? 'choice major' : 'choice';
    if (choice.locked) {
      const line = el('span', `${className} locked`);
      line.innerHTML = DOT;
      line.append(labelSpan([{ kind: 'plain', text: choice.label }]));
      item.append(line);
    } else {
      const button = el('button', className);
      button.type = 'button';
      button.innerHTML = STROKE;
      const segments =
        rot === undefined
          ? [{ kind: 'plain' as const, text: choice.label }]
          : rotLabel(choice.label, rot.staticMeter, rot.seed + index, {
              attract: rot.plan.attractIndex === index,
            });
      const visible = rotText(segments);
      if (visible !== choice.label) button.setAttribute('aria-label', choice.label);
      button.append(labelSpan(segments));
      const openIndex = model.choices.slice(0, index + 1).filter((c) => !c.locked).length;
      if (openIndex <= 9) {
        const hint = el('span', 'num', String(openIndex));
        hint.setAttribute('aria-hidden', 'true');
        button.append(hint);
      }
      button.addEventListener('click', (event) => {
        event.stopPropagation();
        commit(button, choice.id);
      });
      item.append(button);
    }
    list.append(item);
  });

  if (model.ending !== undefined) {
    const item = el('li', 'choice-line');
    const card = endingCardFor(model.ending, ACT_BOUNDARY_ENDINGS);
    if (model.held === true) {
      // pt2-fix-01: an act boundary is a held place, not a close — no
      // reset offer; the next act inherits this ledger.
      item.append(el('p', 'ending-mark', card.mark), el('p', 'held-line', HELD_LINE));
    } else {
      const again = el('button', 'choice');
      again.type = 'button';
      again.innerHTML = STROKE;
      again.append(labelSpan([{ kind: 'plain', text: BEGIN_AGAIN }]));
      again.addEventListener('click', (event) => {
        event.stopPropagation();
        callbacks.onNewGame();
      });
      item.append(el('p', 'ending-mark', card.mark), again);
    }
    list.append(item);
  }
  return list;
};

/** Arm 1–9 on the list's open choices; returns the disarm function. */
export const armChoiceKeys = (list: HTMLElement): (() => void) => {
  const buttons = [...list.querySelectorAll<HTMLButtonElement>('button.choice:not([disabled])')];
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
    document.body.dataset['input'] = 'keyboard';
    button.click();
  };
  document.addEventListener('keydown', onKey);
  return () => document.removeEventListener('keydown', onKey);
};
