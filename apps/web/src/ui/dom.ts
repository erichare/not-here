/**
 * DOM helpers shared by every adapter. `wait` is the only sequencing
 * primitive the UI uses: nothing may await animationend/transitionend,
 * because the reduced-motion kill switch sets every animation to none —
 * a wait collapses to zero under motion-off instead.
 */

export const el = <K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className: string,
  text?: string,
): HTMLElementTagNameMap[K] => {
  const node = document.createElement(tag);
  node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
};

export const prefersReducedMotion = (): boolean =>
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** The single motion switch: the OS preference or the lamp's "hold still". */
export const motionOff = (): boolean =>
  document.documentElement.dataset['motion'] === 'off' || prefersReducedMotion();

/** Resolve after `ms` — or at once when motion is off. */
export const wait = (ms: number): Promise<void> =>
  new Promise((resolve) => {
    window.setTimeout(resolve, motionOff() ? 0 : ms);
  });

export const setVars = (node: HTMLElement, vars: Readonly<Record<string, string>>): void => {
  for (const [name, value] of Object.entries(vars)) node.style.setProperty(name, value);
};

/** True while any dialog-overlay is open — the page belongs to it. */
export const anyOverlayOpen = (): boolean =>
  document.querySelector('#overlays [role="dialog"]:not([hidden])') !== null;
