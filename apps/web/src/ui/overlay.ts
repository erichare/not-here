/**
 * One overlay mechanism for the book, the ledger-so-far, and the lamp: a
 * sibling dialog that never re-renders the page. Open → the page regions go
 * inert, focus moves to the panel, Tab is trapped between the panel and its
 * close control, Escape / the hotkey / a click on the backdrop close it,
 * and focus returns to wherever the player left it. The hotkey is ignored
 * while typing in a field.
 */

import { el } from './dom.ts';

export interface OverlayPanel {
  readonly panel: HTMLElement;
  readonly close: HTMLButtonElement;
}

export interface OverlayOptions {
  readonly host: HTMLElement;
  readonly className: string;
  readonly label: string;
  /** A single key that toggles the overlay (case-insensitive). */
  readonly hotkey?: string;
  readonly inertTargets: readonly HTMLElement[];
  /** Spoken (as a caption) when the overlay closes by the player's hand. */
  readonly onExitBeat?: () => void;
  /** Whether the hotkey may open right now (e.g. the book is unlocked). */
  readonly canOpen?: () => boolean;
  /** What the hotkey opens — the same builder the owner's button uses. */
  readonly build?: () => OverlayPanel;
}

export interface Overlay {
  readonly open: (build: () => OverlayPanel) => void;
  readonly close: (withBeat: boolean) => void;
  readonly isOpen: () => boolean;
  readonly element: HTMLElement;
}

const isTyping = (target: EventTarget | null): boolean =>
  target instanceof HTMLElement &&
  (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable);

export const createOverlay = (options: OverlayOptions): Overlay => {
  let open = false;
  let restoreFocus: HTMLElement | null = null;
  let current: OverlayPanel | null = null;
  let opener: (() => OverlayPanel) | null = options.build ?? null;

  const overlay = el('div', options.className);
  overlay.hidden = true;
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-label', options.label);
  options.host.append(overlay);

  const close = (withBeat: boolean): void => {
    if (!open) return;
    open = false;
    overlay.hidden = true;
    overlay.replaceChildren();
    for (const target of options.inertTargets) target.removeAttribute('inert');
    if (withBeat) options.onExitBeat?.();
    // Give focus back to wherever the player left it — never the choices'
    // problem that the overlay was open.
    restoreFocus?.focus?.();
    restoreFocus = null;
    current = null;
  };

  const openWith = (build: () => OverlayPanel): void => {
    if (open) return;
    opener = build;
    const built = build();
    built.close.addEventListener('click', (event) => {
      event.stopPropagation();
      close(true);
    });
    const active = document.activeElement;
    restoreFocus = active instanceof HTMLElement ? active : null;
    current = built;
    overlay.replaceChildren(built.panel);
    overlay.hidden = false;
    open = true;
    for (const target of options.inertTargets) target.setAttribute('inert', '');
    built.panel.focus();
  };

  overlay.addEventListener('click', (event) => {
    // Click-outside closes; clicks on the panel itself stay on the panel.
    if (event.target === overlay) {
      event.stopPropagation();
      close(true);
    }
  });

  window.addEventListener('keydown', (event) => {
    if (event.metaKey || event.ctrlKey || event.altKey) return;
    if (event.key === 'Tab' && open && current !== null) {
      event.preventDefault();
      const active = document.activeElement;
      if (event.shiftKey) {
        (active === current.panel ? current.close : current.panel).focus();
      } else {
        (active === current.close ? current.panel : current.close).focus();
      }
      return;
    }
    if (event.key === 'Escape' && open) {
      event.preventDefault();
      close(true);
      return;
    }
    const hotkey = options.hotkey;
    if (hotkey !== undefined && event.key.toLowerCase() === hotkey.toLowerCase()) {
      if (isTyping(event.target)) return;
      if (open) {
        event.preventDefault();
        close(true);
      } else if (opener !== null && (options.canOpen?.() ?? true)) {
        event.preventDefault();
        openWith(opener);
      }
    }
  });

  return {
    open: openWith,
    close,
    isOpen: () => open,
    element: overlay,
  };
};
