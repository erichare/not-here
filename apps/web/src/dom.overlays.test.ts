// @vitest-environment jsdom
/**
 * The lamp and the ledger-so-far: both ride the shared overlay (inert page,
 * Escape closes, focus returns), the lamp's ticks change settings at once,
 * the ledger lists the run; the turn plays a beat before rendering and
 * refuses a second press while it is in flight.
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DEFAULT_SETTINGS, type Settings } from './model/settings-model.ts';
import { EMPTY_TRANSCRIPT, appendEntry, markChosen, type Transcript } from './model/transcript.ts';
import { createUi, type SceneModel } from './ui.ts';

const key = (k: string): void => {
  document.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true }));
};

const model = (): SceneModel => ({
  sceneId: 'n1-beach',
  header: 'DAY 1 — NIGHT',
  slot: 'night',
  paragraphs: ['Gravel. You know that first.'],
  choices: [
    { id: 'look', label: 'Look at the water first.', locked: false },
    { id: 'walk', label: 'Walk toward the lights.', locked: false },
  ],
});

beforeEach(() => {
  document.body.innerHTML = '<div id="app"></div>';
  document.documentElement.dataset['motion'] = 'off';
  window.scrollTo = vi.fn() as unknown as typeof window.scrollTo;
});

const mount = (transcript: Transcript = EMPTY_TRANSCRIPT) => {
  let settings: Settings = DEFAULT_SETTINGS;
  const onChange = vi.fn((next: Settings) => {
    settings = next;
  });
  const onChoose = vi.fn();
  const root = document.querySelector<HTMLElement>('#app') as HTMLElement;
  const ui = createUi(root, {
    onChoose,
    onNewGame: vi.fn(),
    wordIntervalMs: () => settings.revealMs,
    settings: { get: () => settings, onChange },
    transcript: () => transcript,
  });
  return { ui, root, onChange, onChoose, settings: () => settings };
};

describe('the lamp', () => {
  it('opens from the frame, changes a setting on a tick, and closes on Escape', () => {
    const { ui, root, onChange, settings } = mount();
    ui.renderScene(model());
    const open = root.querySelector<HTMLButtonElement>('#frame .frame-nav .lamp-open') as HTMLButtonElement;
    expect(open).not.toBeNull();
    open.click();
    const overlay = root.querySelector('.lamp-overlay') as HTMLElement;
    expect(overlay.hidden).toBe(false);
    expect(root.querySelector('#reading')?.hasAttribute('inert')).toBe(true);
    const atOnce = [...overlay.querySelectorAll<HTMLButtonElement>('.tick')].find((t) => t.textContent === 'at once');
    atOnce?.click();
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(settings().revealMs).toBe(0);
    const still = [...overlay.querySelectorAll<HTMLButtonElement>('.tick')].find((t) => t.textContent === 'hold still');
    still?.click();
    expect(settings().motion).toBe('off');
    // the sheet re-rendered with the new ticks marked
    expect(overlay.querySelector('.tick.on')?.textContent).toBe('at once');
    key('Escape');
    expect(overlay.hidden).toBe(true);
    expect(root.querySelector('#reading')?.hasAttribute('inert')).toBe(false);
  });

  it('never writes a number into the sheet', () => {
    const { ui, root } = mount();
    ui.renderScene(model());
    root.querySelector<HTMLButtonElement>('#frame .frame-nav .lamp-open')?.click();
    expect(root.querySelector('.lamp-page')?.textContent).not.toMatch(/\d/);
  });
});

describe('the ledger so far', () => {
  it('lists the run oldest first with the chosen lines, and no ids', () => {
    let transcript = appendEntry(EMPTY_TRANSCRIPT, {
      scene: 'n1-beach',
      day: 1,
      slot: 'night',
      header: 'DAY 1 — NIGHT',
      paragraphs: ['Gravel.', '@doc:\n┌──┐\n│ x│\n└──┘'],
    });
    transcript = markChosen(transcript, 'n1-beach', 'Walk toward the lights.');
    transcript = appendEntry(transcript, { scene: 'n1-walk', day: 1, slot: 'night', header: 'DAY 1 — NIGHT', paragraphs: ['The road.'] });
    const { ui, root } = mount(transcript);
    ui.renderScene(model());
    root.querySelector<HTMLButtonElement>('#frame .frame-nav .ledger-open')?.click();
    const sheet = root.querySelector('.ledger-page') as HTMLElement;
    expect(sheet).not.toBeNull();
    const entries = [...sheet.querySelectorAll('.ledger-entry')];
    expect(entries).toHaveLength(2);
    expect(entries[0]?.querySelector('.ledger-chosen')?.textContent).toBe('Walk toward the lights.');
    expect(entries[0]?.querySelector('.paper')).not.toBeNull();
    expect(sheet.textContent).not.toMatch(/n1-beach|n1-walk/);
    key('Escape');
    expect(root.querySelector<HTMLElement>('.ledger-overlay')?.hidden).toBe(true);
  });

  it('is not offered on the title', () => {
    const { ui, root } = mount();
    ui.showTitle('fresh', vi.fn());
    expect(root.querySelector<HTMLButtonElement>('#frame .frame-nav .ledger-open')?.hidden).toBe(true);
  });
});

describe('the turn', () => {
  it('renders after the beat and refuses a second turn while one is in flight', async () => {
    const { ui, root } = mount();
    const first = ui.turn(model(), { kind: 'horn', day: 1 });
    expect(ui.busy()).toBe(true);
    const second = ui.turn({ ...model(), sceneId: 'n1-walk' }, null);
    await first;
    await second;
    // the second turn was dropped: the page still shows the first entry
    expect(root.querySelector<HTMLElement>('main.page')?.dataset['scene']).toBe('n1-beach');
    expect(ui.busy()).toBe(false);
    expect(root.querySelector('#interstitial')?.hasAttribute('hidden')).toBe(true);
  });
});
