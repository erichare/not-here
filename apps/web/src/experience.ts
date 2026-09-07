import type { SceneView, WorldState } from '@not-here/engine';
import { buildRevisedContent, LOCATIONS, notebookEntries } from '@not-here/story';
import { createBookLayer } from './book.ts';
import { firstMeetingSketch } from './sketches.ts';
import { DEFAULT_PREFERENCES, PREFERENCES_KEY, readPreferences, type Preferences } from './preferences.ts';
import { LEGACY_SAVE_KEY, SAVE_KEY } from './save.ts';
import './experience.css';
import { sceneArt } from './scene-art.ts';

export interface ExperienceModel extends SceneView { readonly world: WorldState; readonly header: string; readonly slot: string }
interface Hooks {
  onChoose(id: string): void; onInspect(id: string): void; onName(name: string): void;
  onNewGame(): void; onRewind(): void; canRewind(): boolean;
  onPreferences(preferences: Preferences): void;
  onTitleSound?(): void;
}
interface HistoryEntry { scene: string; title: string; paragraphs: readonly string[]; day: number }
const HISTORY_KEY = 'not-here:story2:history';
const SOUNDS_KEY = 'not-here:story2:sounds';
const INTRO: Record<string, string> = { barb: 'n1-diner', dianne: 'd2-dianne', sam: 'd3-shed', priya: 'd3-clinic', tam: 'd2-evening', wade: 'd4-wharf' };
const button = (label: string, action: () => void, className = ''): HTMLButtonElement => {
  const node = document.createElement('button'); node.type = 'button'; node.textContent = label; node.className = className; node.addEventListener('click', action); return node;
};
const element = <K extends keyof HTMLElementTagNameMap>(tag: K, className = '', value?: string): HTMLElementTagNameMap[K] => {
  const node = document.createElement(tag); node.className = className; if (value !== undefined) node.textContent = value; return node;
};
const safeRead = (key: string): string | null => { try { return localStorage.getItem(key); } catch { return null; } };
const safeWrite = (key: string, value: string): void => { try { localStorage.setItem(key, value); } catch { /* Saving the game reports its own failure. */ } };
const readHistory = (): HistoryEntry[] => {
  try { const items: unknown = JSON.parse(safeRead(HISTORY_KEY) ?? '[]');
    return Array.isArray(items) ? items.filter((x): x is HistoryEntry => x && typeof x.scene === 'string' && typeof x.title === 'string' && typeof x.day === 'number' && Array.isArray(x.paragraphs) && x.paragraphs.every((p: unknown) => typeof p === 'string')).slice(-200) : [];
  } catch { return []; }
};

export const createExperience = (root: HTMLElement, hooks: Hooks) => {
  let model: ExperienceModel | null = null;
  let preferences = readPreferences({ getItem: safeRead });
  let history = readHistory();
  let sounds: string[] = [];
  try { const saved: unknown = JSON.parse(safeRead(SOUNDS_KEY) ?? '[]'); if (Array.isArray(saved)) sounds = saved.filter((s): s is string => typeof s === 'string').slice(-80); } catch { /* no saved captions */ }
  let cancelReveal = () => {};
  const content = buildRevisedContent();
  const header = element('header', 'experience-header');
  const brand = element('span', 'experience-brand', 'NOT HERE');
  const toolbar = element('nav', 'experience-tools'); toolbar.setAttribute('aria-label', 'Reading tools');
  const page = element('main', 'experience-page page');
  const live = element('div', 'sr-only'); live.setAttribute('aria-live', 'polite');
  const dialog = element('dialog', 'reading-dialog');
  const book = (() => { root.append(header, page, live, dialog); return createBookLayer(root, { onExitBeat: () => {}, inertTargets: [header, page], buttonHost: toolbar, canOpen: () => !dialog.open }); })();
  const closeDialog = () => dialog.close();
  const openPanel = (title: string, build: (body: HTMLElement) => void) => {
    if (dialog.open) dialog.close();
    const heading = element('h2', '', title); heading.id = 'reading-dialog-title';
    dialog.setAttribute('aria-labelledby', heading.id);
    const body = element('div', 'dialog-body');
    dialog.replaceChildren(button('Close', closeDialog, 'dialog-close'), heading, body);
    build(body); dialog.showModal();
  };
  const documentBlock = (value: string): HTMLElement => {
    const paper = element('figure', 'evidence-paper');
    paper.append(element('figcaption', '', 'A document'), element('pre', '', value.slice(6)));
    const details = element('details'); details.append(element('summary', '', 'Read as plain text'), element('p', 'document-transcript', value.slice(6).replace(/[┌┐└┘─│]/g, ''))); paper.append(details); return paper;
  };
  const paragraphs = (parent: HTMLElement, lines: readonly string[]) => {
    for (const line of lines.filter(Boolean)) parent.append(line.startsWith('@doc:\n') ? documentBlock(line) : element('p', '', line));
  };
  const notebook = () => openPanel('Your notebook', body => {
    if (!model) return;
    const entries = notebookEntries(model.world);
    for (const kind of ['observation', 'document', 'suspicion'] as const) {
      body.append(element('h3', '', kind === 'suspicion' ? 'Questions, not conclusions' : kind === 'document' ? 'Evidence' : 'Things you noticed'));
      const items = entries.filter(e => e.kind === kind);
      for (const entry of items) body.append(element('h4', '', entry.title), element('p', '', entry.text));
      if (!items.length) body.append(element('p', 'muted', 'Nothing written here yet.'));
    }
    const documents = history.flatMap(h => h.paragraphs.filter(p => p.startsWith('@doc:\n')));
    if (documents.length) { body.append(element('h3', '', 'Pages you have read')); for (const doc of [...new Set(documents)]) body.append(documentBlock(doc)); }
  });
  const map = () => openPanel('Lorn Bay', body => {
    body.append(element('p', 'muted', 'The lake below. The highway above. Reading the map costs no time. Choosing a visit below commits to it.'));
    const grid = element('div', 'town-map');
    for (const [id, location] of Object.entries(LOCATIONS)) {
      const place = element('div', `map-place${model?.presentation?.location === id ? ' current' : ''}`);
      place.style.gridArea = id;
      place.append(element('strong', '', location.title));
      if (model?.presentation?.location === id) place.append(element('span', '', 'You are here'));
      grid.append(place);
    }
    body.append(grid, element('h3', '', 'What you can do now'));
    if (!model) return;
    let opportunities = 0;
    for (const c of model.choices.filter(c => !c.locked)) {
      const target = content.scenes.get(content.scenes.get(model.sceneId)?.choices.find(x => x.id === c.id)?.goto ?? '');
      const label = target?.presentation?.title;
      if (target?.presentation?.location === model.presentation?.location && !/^d\d+-morning$/.test(model.sceneId) && model.sceneId !== 'r22-future') continue;
      opportunities++;
      body.append(button(`${label ? `${label} · ` : ''}${c.label}`, () => { closeDialog(); hooks.onChoose(c.id); }, 'map-opportunity'));
    }
    if (!opportunities) body.append(element('p', 'muted', 'You are in the middle of something here. Finish the passage to see where the day can go.'));
  });
  const recall = () => openPanel('Recent pages', body => {
    for (const entry of [...history].reverse()) {
      const details = element('details', 'history-page'); details.append(element('summary', '', `Day ${entry.day} · ${entry.title}`));
      paragraphs(details, entry.paragraphs); body.append(details);
    }
  });
  const soundPanel = () => openPanel('Listening notes', body => {
    body.append(element('p', 'muted', 'Sound clues stay here when their sounds have passed.'));
    for (const sound of sounds) body.append(element('p', '', sound));
    if (!sounds.length) body.append(element('p', '', 'The room is quiet.'));
  });
  const applyPreferences = () => {
    root.style.setProperty('--reading-size', `${preferences.textSize}px`);
    document.body.classList.toggle('reduce-motion', preferences.reducedMotion);
    hooks.onPreferences(preferences);
    safeWrite(PREFERENCES_KEY, JSON.stringify(preferences));
  };
  const settings = () => openPanel('Make yourself comfortable', body => {
    for (const key of ['music', 'ambience', 'effects', 'voice', 'textSize'] as const) {
      const label = element('label', 'setting');
      const name = key === 'textSize' ? 'Text size' : key[0]!.toUpperCase() + key.slice(1);
      const input = element('input'); input.type = 'range'; input.min = key === 'textSize' ? '16' : '0'; input.max = key === 'textSize' ? '26' : '1'; input.step = key === 'textSize' ? '1' : '.05'; input.value = String(preferences[key]);
      input.addEventListener('input', () => { preferences = { ...preferences, [key]: Number(input.value) }; applyPreferences(); });
      label.append(element('span', '', name), input); body.append(label);
    }
    for (const [key, name] of [['paced', 'Reveal paragraphs gradually'], ['reducedMotion', 'Reduce motion']] as const) {
      const label = element('label', 'setting'); const input = element('input'); input.type = 'checkbox'; input.checked = preferences[key];
      input.addEventListener('change', () => { preferences = { ...preferences, [key]: input.checked }; if (key === 'reducedMotion') cancelReveal(); applyPreferences(); });
      label.append(input, element('span', '', name)); body.append(label);
    }
    body.append(button('Restore defaults', () => { preferences = { ...DEFAULT_PREFERENCES }; applyPreferences(); closeDialog(); settings(); }));
    body.append(element('p', 'muted', 'Keyboard: Tab to move, Enter to choose, 1–9 for choices, L for Barb’s book. Escape closes a panel. All story clues work with sound off.'));
  });
  toolbar.append(button('Notebook', notebook), button('Map', map), button('Recent pages', recall), button('Sound', soundPanel), button('Settings', settings));
  header.append(brand, toolbar);
  const addCaption = (value: string) => { if (!value) return; sounds = [...sounds.filter(s => s !== value), value].slice(-80); safeWrite(SOUNDS_KEY, JSON.stringify(sounds)); live.textContent = value; };
  const renderScene = (next: ExperienceModel) => {
    cancelReveal(); model = next; toolbar.hidden = false; page.className = 'experience-page page';
    document.body.dataset.slot = next.slot;
    const previous = history.at(-1);
    const entry = { scene: next.sceneId, title: next.presentation?.title ?? next.header, paragraphs: next.paragraphs, day: next.world.day };
    if (previous?.scene === next.sceneId) history[history.length - 1] = entry;
    else history.push(entry);
    history = history.slice(-200); safeWrite(HISTORY_KEY, JSON.stringify(history));
    const visual = element('aside', `scene-visual mood-${next.presentation?.mood ?? 'ordinary'}`);
    if (next.presentation?.staging) page.dataset.staging = next.presentation.staging; else delete page.dataset.staging;
    const location = next.presentation?.location ?? 'shore'; visual.dataset.location = location;
    visual.dataset.light = next.presentation?.light ?? 'day';
    const artwork = sceneArt(next.presentation);
    const img = element('img', 'location-painting'); img.src = artwork.src; img.alt = artwork.alt;
    img.decoding = 'async'; img.width = 1672; img.height = 941;
    if (artwork.focus) img.style.objectPosition = artwork.focus;
    img.addEventListener('error', () => { img.remove(); visual.classList.add('art-unavailable'); visual.append(element('p', 'art-description', artwork.alt)); }, { once: true });
    visual.append(img);
    const place = element('div', 'place-caption'); place.append(element('span', 'eyebrow', `LORN BAY · NOVEMBER ${next.world.day + 5}`), element('h1', '', next.presentation?.title ?? 'Lorn Bay'), element('p', '', next.presentation?.sound ?? ''));
    visual.append(place);
    for (const object of next.presentation?.objects ?? []) place.append(element('p', 'scene-object', object));
    const reading = element('article', 'scene-reading');
    const day = element('p', 'reading-header', next.ending ? next.ending.replaceAll('-', ' ') : `${next.header}`); reading.append(day);
    const who = next.presentation?.character;
    if (who === 'wren') {
      const portrait = element('img', 'resident-portrait wren-portrait'); portrait.src = '/art/wren.jpg'; portrait.alt = 'Wren, travel-worn and direct, in a practical coat with a canvas bag strap over her shoulder.';
      portrait.width = 240; portrait.height = 300; portrait.decoding = 'async'; reading.append(portrait);
    } else if (who && INTRO[who]) {
      const portrait = element('div', 'resident-portrait'); portrait.setAttribute('role', 'img'); portrait.setAttribute('aria-label', who[0]!.toUpperCase() + who.slice(1));
      portrait.innerHTML = firstMeetingSketch(INTRO[who]) ?? ''; // trusted bundled SVG, never user input
      reading.append(portrait);
    }
    const prose = element('section', 'scene-prose'); paragraphs(prose, next.paragraphs); reading.append(prose);
    if (next.observations?.length) {
      const observations = element('div', 'observations'); observations.append(element('p', 'eyebrow', 'Take a closer look · no time passes'));
      for (const item of next.observations) observations.append(button(item.label, () => {
        hooks.onInspect(item.id);
        openPanel(item.label, body => { body.append(element('p', '', item.text), element('p', 'muted', 'Kept in your notebook.')); });
      }, 'observe-button'));
      reading.append(observations);
    }
    if (next.input === 'name') {
      const form = element('form', 'name-form'); const label = element('label', '', 'The name you want to try'); label.htmlFor = 'player-name';
      const input = element('input'); input.id = 'player-name'; input.name = 'name'; input.maxLength = 40; input.required = true; input.autocomplete = 'off'; input.value = String(next.world.flags['player:name'] ?? '');
      const submit = element('button', '', 'Write it down'); submit.type = 'submit';
      const error = element('p'); error.setAttribute('role', 'alert');
      form.append(label, input, submit, error); form.addEventListener('submit', event => { event.preventDefault(); try { hooks.onName(input.value); } catch { error.textContent = 'Choose a name of 1–40 characters.'; } }); reading.append(form);
    }
    const choices = element('div', 'story-choices');
    for (const [i, c] of next.choices.entries()) {
      const node = button(c.label, () => hooks.onChoose(c.id), `story-choice${c.stakes === 'major' ? ' major' : ''}`);
      node.disabled = c.locked; node.dataset.index = String(i + 1); choices.append(node);
    }
    if (next.ending) {
      choices.append(element('p', 'ending-caption', 'The end of this November.'));
      if (next.ending === 'unwitnessed' && hooks.canRewind()) choices.append(button('Return to the last night you were seen', hooks.onRewind, 'story-choice'));
      choices.append(button('Begin another November', hooks.onNewGame, 'story-choice'));
    }
    reading.append(choices); page.replaceChildren(visual, reading); book.update(next.world);
    if (next.presentation?.sound) addCaption(next.presentation.sound);
    if (preferences.paced && !preferences.reducedMotion && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
      const nodes = [...prose.children] as HTMLElement[];
      nodes.forEach(n => { n.hidden = true; }); choices.inert = true;
      const timers = nodes.map((node, i) => window.setTimeout(() => { node.hidden = false; if (i === nodes.length - 1) choices.inert = false; }, i * 650));
      const reveal = button('Show the whole passage', () => cancelReveal(), 'reveal-button'); reading.insertBefore(reveal, prose);
      cancelReveal = () => { timers.forEach(clearTimeout); nodes.forEach(n => { n.hidden = false; }); choices.inert = false; reveal.remove(); };
    } else cancelReveal = () => {};
    if (previous?.scene !== next.sceneId) { window.scrollTo({ top: 0 }); day.tabIndex = -1; day.focus({ preventScroll: true }); }
  };
  const onKey = (event: KeyboardEvent) => {
    const target = event.target;
    if (dialog.open || book.isOpen() || event.metaKey || event.ctrlKey || event.altKey || (target instanceof HTMLElement && (['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName) || target.isContentEditable))) return;
    if (/^[1-9]$/.test(event.key)) { const b = page.querySelector<HTMLButtonElement>(`.story-choice[data-index="${event.key}"]`); if (b && !b.closest('[inert]')) { event.preventDefault(); b.click(); } }
  };
  document.addEventListener('keydown', onKey);
  return { renderScene, addCaption,
    dispose: () => { cancelReveal(); document.removeEventListener('keydown', onKey); book.retire(); root.replaceChildren(); },
    resetHistory: () => { history = []; sounds = []; safeWrite(HISTORY_KEY, '[]'); safeWrite(SOUNDS_KEY, '[]'); },
    rewindHistory: (sceneId: string) => { let index = history.length - 1; while (index >= 0 && history[index]?.scene !== sceneId) index--; history = index >= 0 ? history.slice(0, index + 1) : []; sounds = []; safeWrite(SOUNDS_KEY, '[]'); safeWrite(HISTORY_KEY, JSON.stringify(history)); },
    showTitle: (mode: 'fresh' | 'resume' | 'held', begin: (fresh: boolean) => void) => {
      cancelReveal(); model = null; book.retire(); toolbar.hidden = true; delete document.body.dataset.slot;
      page.className = 'experience-title page';
      const panel = element('section', 'title-invitation');
      panel.append(element('p', 'eyebrow', 'A NOVEMBER IN LORN BAY'), element('h1', '', 'NOT HERE'), element('p', 'title-description', 'A town has kept a place for someone.\nYou arrive before she does.'), button(mode === 'fresh' ? 'Walk toward the light' : 'Return to your November', () => begin(mode === 'fresh'), 'begin-button'));
      if (mode !== 'fresh') panel.append(button('Begin another November', () => begin(true), 'quiet-button'));
      if (hooks.onTitleSound) panel.append(button('Hear your remembered phrase', hooks.onTitleSound, 'quiet-button'));
      panel.append(button('Reading & sound settings', settings, 'quiet-button'), element('p', 'content-note', 'Grief, memory loss, family estrangement, and voluntary self-dissolution. Play at your pace. Sound is optional.'));
      const incompatible = mode === 'fresh' ? safeRead(SAVE_KEY) : null;
      if (incompatible) {
        panel.append(element('p', 'legacy-note', 'This saved revised path cannot be resumed by this edition. Export it before beginning a fresh November.'));
        panel.append(button('Export saved revised path', () => { const url = URL.createObjectURL(new Blob([incompatible], {type:'application/json'})); const link = element('a'); link.href = url; link.download = 'not-here-revised-save.json'; link.click(); window.setTimeout(() => URL.revokeObjectURL(url),1000); }, 'quiet-button'));
      }
      const legacy = safeRead(LEGACY_SAVE_KEY);
      if (legacy) {
        panel.append(element('p', 'legacy-note', 'Your original November is preserved. This revised story begins separately.'));
        panel.append(button('Play the original edition', () => { window.location.search = '?edition=original'; }, 'quiet-button'));
        panel.append(button('Export original save', () => { const blob = new Blob([legacy], { type: 'application/json' }); const url = URL.createObjectURL(blob); const a = element('a'); a.href = url; a.download = 'not-here-original-save.json'; a.click(); window.setTimeout(() => URL.revokeObjectURL(url), 1000); }, 'quiet-button'));
      }
      page.replaceChildren(panel); applyPreferences();
    },
  };
};
