/**
 * The ledger so far — re-read this run's entries, oldest first, each under
 * its DAY — HOUR rule, with the line the player chose to leave it inked
 * beneath. Read-only; the ledger keeps what happened, not what didn't.
 */

import { HISTORY } from '../model/copy.ts';
import type { Transcript } from '../model/transcript.ts';
import { renderDoc } from './docs.ts';
import { el } from './dom.ts';
import { createOverlay, type OverlayPanel } from './overlay.ts';
import { DOC_PREFIX } from './scene.ts';

export interface HistoryLayerHooks {
  readonly buttonHosts: readonly HTMLElement[];
  readonly inertTargets: readonly HTMLElement[];
  readonly load: () => Transcript;
}

export interface HistoryLayer {
  readonly retire: () => void;
  readonly isOpen: () => boolean;
  /** Show/hide the affordance (the title has no ledger). */
  readonly setAvailable: (available: boolean) => void;
}

export const createHistoryLayer = (host: HTMLElement, hooks: HistoryLayerHooks): HistoryLayer => {
  const buttons = hooks.buttonHosts.map((parent) => {
    const b = el('button', 'ledger-open', HISTORY.title);
    b.type = 'button';
    b.setAttribute('aria-haspopup', 'dialog');
    b.hidden = true;
    parent.append(b);
    return b;
  });

  const overlay = createOverlay({
    host,
    className: 'overlay ledger-overlay',
    label: HISTORY.aria,
    inertTargets: hooks.inertTargets,
  });

  const build = (): OverlayPanel => {
    const panel = el('article', 'sheet ledger-page');
    panel.setAttribute('tabindex', '-1');
    const close = el('button', 'sheet-close', HISTORY.close);
    close.type = 'button';
    panel.append(close, el('h2', 'sheet-title', HISTORY.title));
    const transcript = hooks.load();
    if (transcript.entries.length === 0) {
      panel.append(el('p', 'ledger-empty', HISTORY.empty));
    }
    for (const entry of transcript.entries) {
      const section = el('section', 'ledger-entry');
      if (entry.header.length > 0) section.append(el('p', 'ledger-rule', entry.header));
      for (const paragraph of entry.paragraphs) {
        if (paragraph.startsWith(DOC_PREFIX)) {
          const doc = renderDoc(paragraph.slice(DOC_PREFIX.length));
          doc.classList.add('on', 'paper--small');
          section.append(doc);
        } else if (paragraph.trim().length > 0) {
          section.append(el('p', 'ledger-prose', paragraph));
        }
      }
      if (entry.chosen !== undefined) section.append(el('p', 'ledger-chosen', entry.chosen));
      panel.append(section);
    }
    // land on the latest entry
    window.setTimeout(() => {
      panel.scrollTop = panel.scrollHeight;
    }, 0);
    return { panel, close };
  };

  for (const b of buttons) {
    b.addEventListener('click', (event) => {
      event.stopPropagation();
      overlay.open(build);
    });
  }

  return {
    retire: () => overlay.close(false),
    isOpen: overlay.isOpen,
    setAvailable: (available) => {
      for (const b of buttons) b.hidden = !available;
    },
  };
};
