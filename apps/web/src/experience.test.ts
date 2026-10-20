// @vitest-environment jsdom
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { advance, initialState, type StepResult } from '@not-here/engine';
import { buildRevisedContent, REVISED_OPENING_SCENE } from '@not-here/story';
import { createExperience } from './experience.ts';
import { clearSave, LEGACY_SAVE_KEY, SAVE_KEY } from './save.ts';
import { PREFERENCES_KEY } from './preferences.ts';
import { TRANSCRIPT_KEY } from './model/transcript.ts';

const content = buildRevisedContent();
let ui: ReturnType<typeof createExperience>;
let root: HTMLElement;
let step: StepResult;
const choose = vi.fn();
const render = () => ui.renderScene({ ...step.view, world: step.state, header: `Day ${step.state.day}`, slot: step.state.slot });
const click = (label: string) => {
  const button = [...root.querySelectorAll('button')].find(b => b.textContent === label);
  if (!button) throw new Error(`Missing button ${label}`);
  button.click();
};
beforeEach(() => {
  localStorage.clear(); choose.mockClear(); document.body.innerHTML = '<div id="app"></div>';
  root = document.getElementById('app')!;
  window.scrollTo = vi.fn();
  vi.stubGlobal('matchMedia', () => ({ matches: false }));
  HTMLDialogElement.prototype.showModal = function () { this.setAttribute('open', ''); };
  HTMLDialogElement.prototype.close = function () { this.removeAttribute('open'); };
  ui = createExperience(root, { onChoose: choose, onInspect: id => { step = advance(content, step.state, { kind: 'inspect', observationId: id }); render(); }, onName: name => { step = advance(content, step.state, { kind: 'name', name }); render(); }, onNewGame: vi.fn(), onRewind: vi.fn(), canRewind: () => true, onPreferences: vi.fn() });
  step = advance(content, initialState(42, REVISED_OPENING_SCENE), { kind: 'enter' });
  render();
});
afterEach(() => { ui.dispose(); vi.unstubAllGlobals(); });

it('shows the whole prose immediately and retains art without motion', () => {
  expect(root.querySelector('.scene-prose')?.textContent).toContain('Gravel under your palms');
  expect(root.querySelector('.scene-prose [hidden]')).toBeNull();
  click('Settings');
  const label = [...root.querySelectorAll('label')].find(l => l.textContent?.includes('Reduce motion'))!;
  label.querySelector('input')!.click();
  expect(document.body.classList.contains('reduce-motion')).toBe(true);
  expect(root.querySelector('img.location-painting')).not.toBeNull();
  expect(JSON.parse(localStorage.getItem(PREFERENCES_KEY)!).reducedMotion).toBe(true);
});
it('keeps observation text in a notebook without choosing or spending time', () => {
  click('Feel the coat'); expect(step.state.choiceLog).toHaveLength(0); expect(step.state.day).toBe(1);
  click('Close'); click('Notebook');
  expect(root.querySelector('dialog')!.textContent).toContain('dry at the roots');
  expect(choose).not.toHaveBeenCalled();
});
it('blocks numeric choice shortcuts while a modal or name input owns focus', () => {
  click('Map'); document.dispatchEvent(new KeyboardEvent('keydown', { key: '1', bubbles: true })); expect(choose).not.toHaveBeenCalled(); click('Close');
  document.dispatchEvent(new KeyboardEvent('keydown', { key: '1', bubbles: true })); expect(choose).toHaveBeenCalledTimes(1);
  while (step.view.input !== 'name') step = advance(content, step.state, { kind: 'choose', choiceId: step.view.choices.find(c => !c.locked)!.id });
  render(); const input = root.querySelector<HTMLInputElement>('#player-name')!;
  input.dispatchEvent(new KeyboardEvent('keydown', { key: '1', bubbles: true })); expect(choose).toHaveBeenCalledTimes(1);
  input.value = '<Alex>'; root.querySelector('form')!.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
  expect(step.state.flags['player:name']).toBe('<Alex>'); expect(root.querySelector('Alex')).toBeNull();
});
it('makes document text and earlier dialogue available to silent play', () => {
  ui.renderScene({ ...step.view, world: step.state, header: 'Day 1', slot: 'night', paragraphs: ['An earlier conversation.', '@doc:\nSCHEDULE\nFriday November 28 · 07:40'] });
  expect(root.querySelector('.document-transcript')!.textContent).toContain('07:40');
  click('Recent pages'); expect(root.querySelector('dialog')!.textContent).toContain('An earlier conversation.');
  click('Close'); ui.addCaption('The guitar phrase has gone.'); click('Sound'); expect(root.querySelector('dialog')!.textContent).toContain('The guitar phrase has gone.');
});
it('does not open Barb’s book behind another modal', () => {
  step = { ...step, state: { ...step.state, flags: { ...step.state.flags, 'barbs-book:unlocked': true } } }; render();
  click('Notebook'); document.dispatchEvent(new KeyboardEvent('keydown', {key:'l',bubbles:true}));
  expect(root.querySelector('.book-overlay:not([hidden])')).toBeNull();
  expect(root.querySelector('dialog')!.open).toBe(true);
});
it('clearing a revised run preserves the original save and transcript', () => {
  localStorage.setItem(LEGACY_SAVE_KEY, 'original-save'); localStorage.setItem(TRANSCRIPT_KEY, 'original-pages');
  clearSave(localStorage);
  expect(localStorage.getItem(LEGACY_SAVE_KEY)).toBe('original-save'); expect(localStorage.getItem(TRANSCRIPT_KEY)).toBe('original-pages');
});

it('lets a new reader adjust settings before beginning a fresh story', () => {
  const begin = vi.fn();
  ui.showTitle('fresh', begin);

  expect(root.querySelector<HTMLElement>('.experience-tools')!.hidden).toBe(true);
  expect(root.querySelector('.scene-prose')).toBeNull();
  document.dispatchEvent(new KeyboardEvent('keydown', { key: '1', bubbles: true }));
  expect(choose).not.toHaveBeenCalled();
  click('Reading & sound settings');
  expect(root.querySelector('dialog')!.open).toBe(true);
  expect(begin).not.toHaveBeenCalled();
  click('Close');
  click('Walk toward the light');
  expect(begin).toHaveBeenCalledExactlyOnceWith(true);
});

it.each(['resume', 'held'] as const)('keeps returning and starting over distinct on a %s title', mode => {
  const begin = vi.fn();
  ui.showTitle(mode, begin);

  click('Return to your November');
  expect(begin).toHaveBeenLastCalledWith(false);
  click('Begin another November');
  expect(begin).toHaveBeenLastCalledWith(true);
  expect(begin).toHaveBeenCalledTimes(2);
});

it('keeps both saved editions available for export on a fresh title', () => {
  localStorage.setItem(SAVE_KEY, 'incompatible-revised-save');
  localStorage.setItem(LEGACY_SAVE_KEY, 'original-save');
  const begin = vi.fn();
  const createObjectURL = vi.fn(() => 'blob:save-export');
  const revokeObjectURL = vi.fn();
  vi.stubGlobal('URL', { createObjectURL, revokeObjectURL });
  const downloads: string[] = [];
  const clickAnchor = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (this: HTMLAnchorElement) {
    downloads.push(this.download);
  });
  vi.useFakeTimers();
  try {
    ui.showTitle('fresh', begin);
    expect(root.textContent).toContain('Your original November is preserved.');
    expect([...root.querySelectorAll('button')].some(node => node.textContent === 'Play the original edition')).toBe(true);
    click('Export saved revised path');
    click('Export original save');
    expect(downloads).toEqual(['not-here-revised-save.json', 'not-here-original-save.json']);
    expect(createObjectURL).toHaveBeenCalledTimes(2);
    expect(localStorage.getItem(SAVE_KEY)).toBe('incompatible-revised-save');
    expect(localStorage.getItem(LEGACY_SAVE_KEY)).toBe('original-save');
    expect(begin).not.toHaveBeenCalled();
    vi.runAllTimers();
    expect(revokeObjectURL).toHaveBeenCalledTimes(2);
  } finally {
    clickAnchor.mockRestore();
    vi.useRealTimers();
  }
});

it('keeps numbered choices labeled by their story text and sends the matching choice id', () => {
  const choices = [...root.querySelectorAll<HTMLButtonElement>('.story-choice[data-index]')];
  expect(choices).toHaveLength(step.view.choices.length);
  for (const [index, node] of choices.entries()) {
    const choice = step.view.choices[index]!;
    expect(node.querySelector('.choice-label')?.textContent).toBe(choice.label);
    expect(node.querySelector('.choice-number')?.getAttribute('aria-hidden')).toBe('true');
    expect(node.querySelector('svg')?.getAttribute('aria-hidden')).toBe('true');
    expect(node.disabled).toBe(choice.locked);
    if (!choice.locked) {
      node.click();
      expect(choose).toHaveBeenLastCalledWith(choice.id);
    }
  }
});

it('keeps the opening landscape free of a character portrait', () => {
  expect(step.view.presentation?.character).toBeUndefined();
  expect(root.querySelector('.character-portrait')).toBeNull();
  expect(root.querySelector('img[src="/art/portraits/wren.jpg"]')).toBeNull();
});

it('opens Barb’s painting in a named dialog and blocks choices while it is open', () => {
  step = advance(content, initialState(42, 'n1-diner'), { kind: 'enter' });
  render();

  const portrait = root.querySelector<HTMLImageElement>('.resident-portrait')!;
  expect(portrait.tagName).toBe('IMG');
  expect(portrait.getAttribute('src')).toBe('/art/portraits/barb.jpg');
  expect(portrait.alt).toContain('Barb');
  expect(root.querySelector('.character-portrait svg:not(.portrait-expand)')).toBeNull();
  const inspect = root.querySelector<HTMLButtonElement>('button[aria-label="View Barb’s portrait"]')!;
  expect(inspect.getAttribute('aria-haspopup')).toBe('dialog');
  inspect.click();

  const dialog = root.querySelector<HTMLDialogElement>('dialog')!;
  expect(dialog.open).toBe(true);
  expect(dialog.classList.contains('portrait-dialog')).toBe(true);
  const title = document.getElementById(dialog.getAttribute('aria-labelledby')!);
  expect(title?.textContent).toBe('Barb');
  expect(dialog.querySelector<HTMLImageElement>('.portrait-detail')?.getAttribute('src')).toBe(portrait.getAttribute('src'));
  document.dispatchEvent(new KeyboardEvent('keydown', { key: '1', bubbles: true }));
  expect(choose).not.toHaveBeenCalled();

  click('Close');
  click('Settings');
  expect(dialog.open).toBe(true);
  expect(dialog.classList.contains('portrait-dialog')).toBe(false);
  expect(dialog.querySelector('.portrait-detail')).toBeNull();
  expect(dialog.textContent).toContain('Reduce motion');
});

it('removes a failed character painting without removing the scene art or showing another person', () => {
  step = advance(content, initialState(42, 'n1-diner'), { kind: 'enter' });
  render();

  root.querySelector<HTMLImageElement>('.resident-portrait')!.dispatchEvent(new Event('error'));

  expect(root.querySelector('.character-portrait')).toBeNull();
  expect(root.querySelector('img.location-painting')).not.toBeNull();
  expect(root.querySelector('img[src="/art/portraits/wren.jpg"]')).toBeNull();
});

it('shows Wren only for her explicit presentation and clears her portrait on an unpeopled scene', () => {
  step = advance(content, initialState(42, 'r23-arrival'), { kind: 'enter' });
  render();
  expect(step.view.presentation?.character).toBe('wren');
  expect(root.querySelector<HTMLImageElement>('.resident-portrait')?.getAttribute('src')).toBe('/art/portraits/wren.jpg');

  step = advance(content, initialState(42, REVISED_OPENING_SCENE), { kind: 'enter' });
  render();

  expect(step.view.presentation?.character).toBeUndefined();
  expect(root.querySelector('.character-portrait')).toBeNull();
  expect(root.querySelector('img[src="/art/portraits/wren.jpg"]')).toBeNull();
});

it('lets the reader open and explore the map without choosing or spending time', () => {
  const before = JSON.stringify(step.state);
  click('Map');

  const dialog = root.querySelector<HTMLDialogElement>('dialog')!;
  expect(dialog.classList.contains('map-dialog')).toBe(true);
  expect(dialog.querySelector('[aria-current="location"]')?.getAttribute('data-location')).toBe('shore');
  const mapView = dialog.querySelector<HTMLElement>('.atlas-viewport')!;
  mapView.scrollIntoView = vi.fn();
  dialog.querySelector<HTMLButtonElement>('[aria-label="Find The Kettle on the map"]')!.click();
  expect(document.activeElement).toBe(mapView);
  mapView.dispatchEvent(new KeyboardEvent('keydown', { key: '1', bubbles: true }));
  dialog.querySelector<HTMLButtonElement>('[aria-label="Zoom in"]')!.click();
  expect(choose).not.toHaveBeenCalled();
  expect(JSON.stringify(step.state)).toBe(before);
  expect(dialog.open).toBe(true);

  click('Close');
  click('Settings');
  expect(dialog.classList.contains('map-dialog')).toBe(false);
});

it('offers only unlocked map visits and closes the map before choosing the matching story choice', () => {
  step = advance(content, initialState(42, 'd2-morning'), { kind: 'enter' });
  const available = step.view.choices.filter(choice => !choice.locked);
  expect(available.length).toBeGreaterThanOrEqual(2);
  const blocked = available[0]!;
  const chosen = available[1]!;
  ui.renderScene({
    ...step.view, world: step.state, header: 'Day 2', slot: step.state.slot,
    choices: step.view.choices.map(choice => choice.id === blocked.id ? { ...choice, locked: true } : choice),
  });
  click('Map');

  const dialog = root.querySelector<HTMLDialogElement>('dialog')!;
  const visits = [...dialog.querySelectorAll<HTMLButtonElement>('.map-opportunity')];
  expect(visits.some(visit => visit.textContent?.includes(blocked.label))).toBe(false);
  const visit = visits.find(node => node.textContent?.includes(chosen.label))!;
  expect(visit).toBeDefined();
  visit.click();
  expect(choose).toHaveBeenCalledExactlyOnceWith(chosen.id);
  expect(dialog.open).toBe(false);
});
