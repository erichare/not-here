// @vitest-environment jsdom
/**
 * DOM smoke tests — the five invariants the pure tests cannot see: the
 * skeleton, the book's inert/focus discipline, one press = one advance,
 * motion-off = instant reveal, settings reach the document.
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { initialState, type WorldState } from '@not-here/engine';
import { cssVarsFor, DEFAULT_SETTINGS } from './model/settings-model.ts';
import { setVars } from './ui/dom.ts';
import { createUi, type SceneModel } from './ui.ts';

const unlockedWorld = (): WorldState => {
  const base = initialState(7, 'n1-room');
  return {
    ...base,
    flags: { ...base.flags, 'barbs-book:unlocked': true },
    choiceLog: [
      { scene: 'n1-interview-1', choice: 'q1-booth', day: 1, slot: 'night' },
      { scene: 'n1-interview-2', choice: 'q2-two-heaped', day: 1, slot: 'night' },
      { scene: 'n1-interview-3', choice: 'q3-whats-true', day: 1, slot: 'night' },
      { scene: 'n1-interview-4', choice: 'q4-light', day: 1, slot: 'night' },
      { scene: 'n1-interview-5', choice: 'q5-never-do', day: 1, slot: 'night' },
    ],
  };
};

const model = (overrides: Partial<SceneModel> = {}): SceneModel => ({
  sceneId: 'n1-beach',
  header: 'DAY 1 — NIGHT',
  slot: 'night',
  paragraphs: ['Gravel. You know that first: lake stones, rounded.', '@doc:\nEBUS — WINTER SCHEDULE'],
  choices: [
    { id: 'look', label: 'Look at the water first.', locked: false },
    { id: 'walk', label: 'Walk toward the lights.', locked: false },
    { id: 'stay', label: 'Stay down.', locked: true },
  ],
  ...overrides,
});

/** One keydown, dispatched on the document so it reaches document AND window listeners exactly once. */
const key = (k: string): void => {
  document.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true }));
};

beforeEach(() => {
  document.body.innerHTML = '<div id="app"></div>';
  delete document.documentElement.dataset['motion'];
  window.scrollTo = vi.fn() as unknown as typeof window.scrollTo;
});

const mount = (onChoose = vi.fn(), onNewGame = vi.fn()) => {
  const root = document.querySelector<HTMLElement>('#app') as HTMLElement;
  const ui = createUi(root, { onChoose, onNewGame, wordIntervalMs: () => 26 });
  return { ui, root, onChoose, onNewGame };
};

describe('skeleton', () => {
  it('builds the persistent regions once and renders an entry into the page', () => {
    const { ui, root } = mount();
    document.documentElement.dataset['motion'] = 'off';
    ui.renderScene(model());
    expect([...root.children].map((c) => c.id || c.className)).toEqual([
      'stage',
      'frame',
      'reading',
      'overlays',
      'interstitial',
      'captions',
    ]);
    const page = root.querySelector('#reading > main.page') as HTMLElement;
    expect(page.classList.contains('scene-page')).toBe(true);
    expect(page.querySelector('header.slot-header')?.textContent).toBe('DAY 1 — NIGHT');
    expect(page.querySelectorAll('.entry p.prose span.w').length).toBeGreaterThan(5);
    expect(page.querySelector('.entry pre.doc')?.textContent).toBe('EBUS — WINTER SCHEDULE');
    expect(page.querySelectorAll('ul.choices button.choice')).toHaveLength(2);
    expect(page.querySelector('.choice.locked')?.textContent).toBe('· Stay down.');
    expect(document.body.dataset['slot']).toBe('night');
    const pageBefore = page;
    ui.renderScene(model({ sceneId: 'n1-walk' }));
    expect(root.querySelector('#reading > main.page')).toBe(pageBefore);
  });
});

describe('the book', () => {
  it('opens beside the page, makes it inert, traps keys, and gives focus back', () => {
    const { ui, root, onChoose } = mount();
    document.documentElement.dataset['motion'] = 'off';
    ui.renderScene(model({ world: unlockedWorld() }));
    const consult = root.querySelector<HTMLButtonElement>('button.book-consult') as HTMLButtonElement;
    expect(consult.hidden).toBe(false);
    const proseBefore = [...root.querySelectorAll('.entry p.prose')];
    consult.focus();
    key('l');
    const overlay = root.querySelector('.book-overlay') as HTMLElement;
    expect(overlay.hidden).toBe(false);
    expect(overlay.getAttribute('role')).toBe('dialog');
    expect(root.querySelector('#reading')?.hasAttribute('inert')).toBe(true);
    expect(root.querySelector('.book-page .book-title')?.textContent).toBe('BARB’S BOOK');
    expect(root.querySelector('.book-page')?.textContent).not.toMatch(/\d/);
    // The number keys belong to the book while it is open.
    key('1');
    expect(onChoose).not.toHaveBeenCalled();
    // The page was never re-rendered.
    expect([...root.querySelectorAll('.entry p.prose')]).toEqual(proseBefore);
    key('Escape');
    expect(overlay.hidden).toBe(true);
    expect(root.querySelector('#reading')?.hasAttribute('inert')).toBe(false);
    expect(document.activeElement).toBe(consult);
  });
});

describe('choices', () => {
  it('a press advances exactly once, and the keys pick the nth open choice', () => {
    const { ui, root, onChoose } = mount();
    document.documentElement.dataset['motion'] = 'off';
    ui.renderScene(model());
    const [first] = root.querySelectorAll<HTMLButtonElement>('button.choice');
    first?.click();
    expect(onChoose).toHaveBeenCalledTimes(1);
    expect(onChoose).toHaveBeenCalledWith('look');
    key('2');
    expect(onChoose).toHaveBeenCalledTimes(2);
    expect(onChoose).toHaveBeenLastCalledWith('walk');
    key('3'); // the locked line has no number
    expect(onChoose).toHaveBeenCalledTimes(2);
  });
});

describe('motion off', () => {
  it('reveals every word at once and shows the choices synchronously', () => {
    const { ui, root } = mount();
    document.documentElement.dataset['motion'] = 'off';
    ui.renderScene(model());
    const words = [...root.querySelectorAll('.w')];
    expect(words.length).toBeGreaterThan(0);
    expect(words.every((w) => w.classList.contains('on'))).toBe(true);
    const choices = root.querySelector('ul.choices') as HTMLElement;
    expect(choices.classList.contains('shown')).toBe(true);
    expect(choices.getAttribute('aria-hidden')).toBe('false');
  });

  it('otherwise reveals word by word on the pace given', () => {
    vi.useFakeTimers();
    try {
      const { ui, root } = mount();
      ui.renderScene(model());
      const words = [...root.querySelectorAll('.w')];
      expect(words[0]?.classList.contains('on')).toBe(true);
      expect(words[words.length - 1]?.classList.contains('on')).toBe(false);
      vi.advanceTimersByTime(26 * words.length + 400);
      expect(words.every((w) => w.classList.contains('on'))).toBe(true);
      expect(root.querySelector('ul.choices')?.classList.contains('shown')).toBe(true);
    } finally {
      vi.useRealTimers();
    }
  });
});

describe('settings', () => {
  it('reach the document as custom properties', () => {
    setVars(document.documentElement, cssVarsFor({ ...DEFAULT_SETTINGS, textScale: 1.25, revealMs: 0 }));
    expect(document.documentElement.style.getPropertyValue('--text-scale')).toBe('1.25');
    expect(document.documentElement.style.getPropertyValue('--reveal-ms')).toBe('0');
  });
});
