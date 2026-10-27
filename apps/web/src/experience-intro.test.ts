// @vitest-environment jsdom
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { advance, initialState } from '@not-here/engine';
import { buildRevisedContent, REVISED_OPENING_SCENE } from '@not-here/story';
import { createExperience } from './experience.ts';
import { PREFERENCES_KEY } from './preferences.ts';

let ui: ReturnType<typeof createExperience>;
let root: HTMLElement;
let marker: () => void;
let mediaChange: () => void;
const media = { matches: false, addEventListener: vi.fn((_event: string, callback: () => void) => { mediaChange = callback; }), removeEventListener: vi.fn() };
const cancel = vi.fn();
const intro = vi.fn((reveal: () => void) => { marker = reveal; return cancel; });
const begin = vi.fn();
const remembered = vi.fn();
const setup = () => {
  ui = createExperience(root, {
    onChoose: vi.fn(), onInspect: vi.fn(), onName: vi.fn(), onNewGame: vi.fn(),
    onRewind: vi.fn(), canRewind: () => false, onPreferences: vi.fn(),
    onTitleIntro: intro, onTitleSound: remembered,
  });
  ui.showTitle('fresh', begin);
};
const find = (label: string) => {
  const node = [...root.querySelectorAll('button')].find(button => button.textContent === label);
  if (!node) throw new Error(`Missing button: ${label}`);
  return node;
};
const menu = () => root.querySelector<HTMLElement>('.title-menu')!;

beforeEach(() => {
  vi.clearAllMocks(); localStorage.clear(); document.body.innerHTML = '<div id="app"></div>';
  document.body.classList.remove('reduce-motion');
  root = document.getElementById('app')!;
  media.matches = false;
  vi.stubGlobal('matchMedia', () => media);
  window.scrollTo = vi.fn();
  HTMLDialogElement.prototype.showModal = function () { this.setAttribute('open', ''); };
  HTMLDialogElement.prototype.close = function () { this.removeAttribute('open'); };
});
afterEach(() => { ui?.dispose(); vi.useRealTimers(); vi.unstubAllGlobals(); });

it('starts only on a gesture and keeps the menu hidden until the note marker', () => {
  setup();
  expect(root.dataset.intro).toBe('ready');
  expect(menu().hidden).toBe(true); expect(menu().inert).toBe(true);
  expect(intro).not.toHaveBeenCalled();
  find('Begin with sound').click();
  expect(root.dataset.intro).toBe('playing'); expect(intro).toHaveBeenCalledOnce();
  vi.useFakeTimers(); vi.advanceTimersByTime(15000);
  expect(menu().hidden).toBe(true); expect(begin).not.toHaveBeenCalled();
  marker();
  expect(root.dataset.intro).toBe('menu');
  expect(menu().hidden).toBe(false); expect(menu().inert).toBe(false);
  expect(document.activeElement).toBe(find('Walk toward the light'));
  expect(begin).not.toHaveBeenCalled();
});

it('offers a silent skip before playback and keeps the remembered phrase separate', () => {
  setup(); find('Skip intro').click();
  expect(intro).not.toHaveBeenCalled(); expect(menu().hidden).toBe(false);
  find('Hear your remembered phrase').click(); expect(remembered).toHaveBeenCalledOnce();
  find('Walk toward the light').click(); expect(begin).toHaveBeenCalledExactlyOnceWith(true);
});

it('cancels a playing intro on skip and ignores a later marker', () => {
  setup(); find('Begin with sound').click(); find('Skip intro').click();
  expect(cancel).toHaveBeenCalledOnce(); expect(menu().hidden).toBe(false);
  find('Reading & sound settings').focus(); marker();
  expect(document.activeElement).toBe(find('Reading & sound settings'));
  expect(root.dataset.intro).toBe('menu');
});

it('lets Escape skip the intro without overriding an open settings dialog', () => {
  setup(); find('Sound & motion settings').click();
  document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
  expect(menu().hidden).toBe(true);
  root.querySelector<HTMLDialogElement>('dialog')!.close();
  document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
  expect(menu().hidden).toBe(false); expect(intro).not.toHaveBeenCalled();
});

it.each([{ music: 0 }, { reducedMotion: true }])('shows the menu immediately for saved preferences %j', preferences => {
  localStorage.setItem(PREFERENCES_KEY, JSON.stringify(preferences)); setup();
  expect(menu().hidden).toBe(false); expect(intro).not.toHaveBeenCalled();
  expect(root.querySelector<HTMLElement>('.title-prelude')!.hidden).toBe(true);
});

it('honors system reduced motion before and during the intro', () => {
  media.matches = true; setup();
  expect(menu().hidden).toBe(false); expect(intro).not.toHaveBeenCalled();
  ui.dispose(); media.matches = false; setup(); find('Begin with sound').click();
  media.matches = true; mediaChange();
  expect(menu().hidden).toBe(false); expect(cancel).toHaveBeenCalledOnce();
});

it('reveals behind settings when the reader mutes music without moving dialog focus', () => {
  setup(); find('Sound & motion settings').click();
  const music = [...root.querySelectorAll('label')].find(label => label.textContent === 'Music')!.querySelector('input')!;
  music.focus(); music.value = '0'; music.dispatchEvent(new Event('input', { bubbles: true }));
  expect(menu().hidden).toBe(false); expect(document.activeElement).toBe(music);
  expect(intro).not.toHaveBeenCalled();
});

it('keeps menu access when the playback hook fails immediately', () => {
  intro.mockImplementationOnce(() => { throw new Error('Audio unavailable'); });
  setup(); find('Begin with sound').click();
  expect(menu().hidden).toBe(false); expect(root.dataset.intro).toBe('menu');
});

it('cancels intro callbacks when a scene replaces the title', () => {
  setup(); find('Begin with sound').click();
  const content = buildRevisedContent();
  const step = advance(content, initialState(42, REVISED_OPENING_SCENE), { kind: 'enter' });
  ui.renderScene({ ...step.view, world: step.state, header: 'Day 1', slot: 'night' });
  marker();
  expect(cancel).toHaveBeenCalledOnce(); expect(root.dataset.view).toBe('reading');
  expect(root.dataset.intro).toBeUndefined(); expect(root.querySelector('.title-menu')).toBeNull();
});

it('cancels a manually played theme when leaving the menu', () => {
  setup(); find('Skip intro').click(); find('Hear the main theme').click();
  expect(intro).toHaveBeenCalledOnce(); expect(menu().hidden).toBe(false);
  find('Walk toward the light').click();
  expect(cancel).toHaveBeenCalledOnce(); expect(begin).toHaveBeenCalledExactlyOnceWith(true);
});

it('retains resume and new-game actions after the intro', () => {
  setup(); ui.showTitle('resume', begin); find('Skip intro').click();
  find('Return to your November').click(); expect(begin).toHaveBeenLastCalledWith(false);
  find('Begin another November').click(); expect(begin).toHaveBeenLastCalledWith(true);
});
