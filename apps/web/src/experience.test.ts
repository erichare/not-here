// @vitest-environment jsdom
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { advance, initialState, type StepResult } from '@not-here/engine';
import { buildRevisedContent, REVISED_OPENING_SCENE } from '@not-here/story';
import { createExperience } from './experience.ts';
import { clearSave, LEGACY_SAVE_KEY } from './save.ts';
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
