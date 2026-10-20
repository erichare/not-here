import type { SceneView, WorldState } from '@not-here/engine';
import { buildRevisedContent, notebookEntries } from '@not-here/story';
import { createBookLayer } from './book.ts';
import { portraitFor } from './portraits.ts';
import { DEFAULT_PREFERENCES, PREFERENCES_KEY, readPreferences, type Preferences } from './preferences.ts';
import { LEGACY_SAVE_KEY, SAVE_KEY } from './save.ts';
import './experience.css';
import { sceneArt } from './scene-art.ts';
import { createTownMap } from './town-map.ts';

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
const button = (label: string, action: () => void, className = ''): HTMLButtonElement => {
  const node = document.createElement('button'); node.type = 'button'; node.textContent = label; node.className = className; node.addEventListener('click', action); return node;
};
const element = <K extends keyof HTMLElementTagNameMap>(tag: K, className = '', value?: string): HTMLElementTagNameMap[K] => {
  const node = document.createElement(tag); node.className = className; if (value !== undefined) node.textContent = value; return node;
};
const ICONS = {
  notebook: '<path d="M5 3h13v18H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Zm0 0v18M9 7h5M9 11h5"/>',
  map: '<path d="m3 5 6-2 6 2 6-2v16l-6 2-6-2-6 2V5Zm6-2v16M15 5v16"/>',
  history: '<path d="M4 10a8 8 0 1 1 1 7M4 4v6h6M12 7v5l3 2"/>',
  sound: '<path d="M4 10v4m4-8v12m4-15v18m4-15v12m4-8v4"/>',
  settings: '<path d="M4 7h9m4 0h3M4 17h3m4 0h9"/><circle cx="15" cy="7" r="2"/><circle cx="9" cy="17" r="2"/>',
  arrow: '<path d="M4 12h16m-6-6 6 6-6 6"/>',
  expand: '<path d="M14 4h6v6M20 4l-7 7M10 20H4v-6M4 20l7-7"/>',
  star: '<path d="M12 2c0 7-3 10-10 10 7 0 10 3 10 10 0-7 3-10 10-10-7 0-10-3-10-10Z"/>',
} as const;
const icon = (name: keyof typeof ICONS): SVGSVGElement => {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 24 24'); svg.setAttribute('fill', 'none'); svg.setAttribute('stroke', 'currentColor');
  svg.setAttribute('stroke-width', '1.25'); svg.setAttribute('stroke-linecap', 'round'); svg.setAttribute('stroke-linejoin', 'round');
  svg.setAttribute('aria-hidden', 'true'); svg.classList.add('experience-icon');
  svg.innerHTML = ICONS[name]; // Static, bundled artwork.
  return svg;
};
const ornament = (): HTMLElement => {
  const node = element('div', 'story-ornament'); node.setAttribute('aria-hidden', 'true'); node.append(icon('star')); return node;
};
const safeRead = (key: string): string | null => { try { return localStorage.getItem(key); } catch { return null; } };
const safeWrite = (key: string, value: string): void => { try { localStorage.setItem(key, value); } catch { /* Saving the game reports its own failure. */ } };
const readHistory = (): HistoryEntry[] => {
  try { const items: unknown = JSON.parse(safeRead(HISTORY_KEY) ?? '[]');
    return Array.isArray(items) ? items.filter((x): x is HistoryEntry => x && typeof x.scene === 'string' && typeof x.title === 'string' && typeof x.day === 'number' && Array.isArray(x.paragraphs) && x.paragraphs.every((p: unknown) => typeof p === 'string')).slice(-200) : [];
  } catch { return []; }
};

export const createExperience = (root: HTMLElement, hooks: Hooks) => {
  root.classList.add('experience-root');
  let model: ExperienceModel | null = null;
  let preferences = readPreferences({ getItem: safeRead });
  let history = readHistory();
  let sounds: string[] = [];
  try { const saved: unknown = JSON.parse(safeRead(SOUNDS_KEY) ?? '[]'); if (Array.isArray(saved)) sounds = saved.filter((s): s is string => typeof s === 'string').slice(-80); } catch { /* no saved captions */ }
  let cancelReveal = () => {};
  const content = buildRevisedContent();
  const header = element('header', 'experience-header');
  const brand = element('span', 'experience-brand', 'NOT HERE');
  brand.prepend(icon('star'));
  const edition = element('span', 'experience-edition', 'An illustrated mystery');
  const toolbar = element('nav', 'experience-tools'); toolbar.setAttribute('aria-label', 'Reading tools');
  const page = element('main', 'experience-page page');
  const live = element('div', 'sr-only'); live.setAttribute('aria-live', 'polite');
  const dialog = element('dialog', 'reading-dialog');
  const book = (() => { root.append(header, page, live, dialog); return createBookLayer(root, { onExitBeat: () => {}, inertTargets: [header, page], buttonHost: toolbar, canOpen: () => !dialog.open }); })();
  const closeDialog = () => dialog.close();
  const openPanel = (title: string, build: (body: HTMLElement) => void, variant = '') => {
    if (dialog.open) dialog.close();
    dialog.className = `reading-dialog${variant ? ` ${variant}` : ''}`;
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
    body.append(element('p', 'muted', 'A small town on Okanagan Lake. Reading the map costs no time. Choose a visit below when you are ready to go.'));
    body.append(createTownMap(model?.presentation?.location), element('h3', '', 'What you can do now'));
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
  }, 'map-dialog');
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
  for (const [label, action, glyph] of [
    ['Notebook', notebook, 'notebook'], ['Map', map, 'map'], ['Recent pages', recall, 'history'],
    ['Sound', soundPanel, 'sound'], ['Settings', settings, 'settings'],
  ] as const) {
    const tool = button(label, action); tool.prepend(icon(glyph)); toolbar.append(tool);
  }
  header.append(brand, edition, toolbar);
  const addCaption = (value: string) => { if (!value) return; sounds = [...sounds.filter(s => s !== value), value].slice(-80); safeWrite(SOUNDS_KEY, JSON.stringify(sounds)); live.textContent = value; };
  const renderScene = (next: ExperienceModel) => {
    cancelReveal(); model = next; toolbar.hidden = false; page.className = 'experience-page page';
    root.dataset.view = 'reading'; edition.hidden = true;
    page.dataset.scene = next.sceneId;
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
    const atmosphere = element('div', 'scene-atmosphere'); atmosphere.setAttribute('aria-hidden', 'true'); visual.append(atmosphere);
    const place = element('div', 'place-caption');
    const placeIndex = element('span', 'place-index', String(next.world.day).padStart(2, '0')); placeIndex.setAttribute('aria-hidden', 'true');
    place.append(element('span', 'eyebrow', `LORN BAY · NOVEMBER ${next.world.day + 5}`), element('h1', '', next.presentation?.title ?? 'Lorn Bay'), element('p', 'place-sound', next.presentation?.sound ?? ''), placeIndex);
    const sceneDetails = element('div', 'scene-details');
    const character = portraitFor(next.presentation?.character);
    if (character) {
      const figure = element('figure', 'character-portrait');
      const portrait = element('img', 'resident-portrait');
      portrait.src = character.src; portrait.alt = character.alt;
      portrait.width = 768; portrait.height = 960; portrait.decoding = 'async';
      const inspect = button('', () => openPanel(character.name, body => {
        const detail = element('img', 'portrait-detail');
        detail.src = character.src; detail.alt = character.alt; detail.width = 768; detail.height = 960;
        body.append(detail);
      }, 'portrait-dialog'), 'portrait-button');
      inspect.setAttribute('aria-label', `View ${character.name}’s portrait`);
      inspect.setAttribute('aria-haspopup', 'dialog');
      inspect.append(portrait, element('span', 'portrait-caption', character.name));
      const affordance = icon('expand'); affordance.classList.add('portrait-expand'); inspect.append(affordance);
      portrait.addEventListener('error', () => figure.remove(), { once: true });
      figure.append(inspect); sceneDetails.append(figure);
    }
    sceneDetails.append(place); visual.append(sceneDetails);
    for (const object of next.presentation?.objects ?? []) place.append(element('p', 'scene-object', object));
    const reading = element('article', 'scene-reading');
    const day = element('p', 'reading-header', next.ending ? next.ending.replaceAll('-', ' ') : `${next.header}`);
    const readingTop = element('div', 'reading-top'); readingTop.append(day, icon('star')); reading.append(readingTop);
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
    if (next.choices.length) choices.append(element('p', 'choice-heading eyebrow', 'What will you do?'));
    for (const [i, c] of next.choices.entries()) {
      const node = button(c.label, () => hooks.onChoose(c.id), `story-choice${c.stakes === 'major' ? ' major' : ''}`);
      const label = element('span', 'choice-label', c.label);
      const number = element('span', 'choice-number', String(i + 1).padStart(2, '0')); number.setAttribute('aria-hidden', 'true');
      node.replaceChildren(number, label, icon('arrow'));
      node.disabled = c.locked; node.dataset.index = String(i + 1); choices.append(node);
    }
    if (next.ending) {
      choices.append(element('p', 'ending-caption', 'The end of this November.'));
      if (next.ending === 'unwitnessed' && hooks.canRewind()) choices.append(button('Return to the last night you were seen', hooks.onRewind, 'story-choice'));
      choices.append(button('Begin another November', hooks.onNewGame, 'story-choice'));
    }
    const readingFoot = element('footer', 'reading-footer');
    readingFoot.append(ornament(), element('span', '', 'A November in Lorn Bay'));
    reading.append(choices, readingFoot); page.replaceChildren(visual, reading); book.update(next.world);
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
    dispose: () => { cancelReveal(); document.removeEventListener('keydown', onKey); book.retire(); root.replaceChildren(); root.classList.remove('experience-root'); delete root.dataset.view; },
    resetHistory: () => { history = []; sounds = []; safeWrite(HISTORY_KEY, '[]'); safeWrite(SOUNDS_KEY, '[]'); },
    rewindHistory: (sceneId: string) => { let index = history.length - 1; while (index >= 0 && history[index]?.scene !== sceneId) index--; history = index >= 0 ? history.slice(0, index + 1) : []; sounds = []; safeWrite(SOUNDS_KEY, '[]'); safeWrite(HISTORY_KEY, JSON.stringify(history)); },
    showTitle: (mode: 'fresh' | 'resume' | 'held', begin: (fresh: boolean) => void) => {
      cancelReveal(); model = null; book.retire(); toolbar.hidden = true; delete document.body.dataset.slot;
      root.dataset.view = 'title'; edition.hidden = false; delete page.dataset.staging; delete page.dataset.scene;
      page.className = 'experience-title page';
      const art = element('div', 'title-art'); art.setAttribute('aria-hidden', 'true');
      const titleImage = element('img', 'title-painting'); titleImage.src = '/art/shore.jpg'; titleImage.alt = ''; titleImage.width = 1672; titleImage.height = 941; titleImage.fetchPriority = 'high';
      art.append(titleImage, element('div', 'title-mist'));
      const panel = element('section', 'title-invitation');
      const title = element('h1'); title.append(element('span', '', 'Not'), document.createTextNode(' '), element('em', '', 'Here'));
      const beginButton = button(mode === 'fresh' ? 'Walk toward the light' : 'Return to your November', () => begin(mode === 'fresh'), 'begin-button');
      beginButton.append(icon('arrow'));
      panel.append(element('p', 'eyebrow title-eyebrow', 'A NOVEMBER IN LORN BAY'), title, ornament(), element('p', 'title-description', 'A town has kept a place for someone.\nYou arrive before she does.'), beginButton);
      if (mode !== 'fresh') panel.append(button('Begin another November', () => begin(true), 'quiet-button'));
      if (hooks.onTitleSound) panel.append(button('Hear your remembered phrase', hooks.onTitleSound, 'quiet-button'));
      const settingsButton = button('Reading & sound settings', settings, 'quiet-button title-settings'); settingsButton.prepend(icon('settings'));
      panel.append(settingsButton);
      const footer = element('footer', 'title-footer');
      const note = element('details', 'content-note');
      note.append(element('summary', '', 'Before you begin'), element('p', '', 'Grief, memory loss, family estrangement, and voluntary self-dissolution. Play at your pace. Sound is optional.'));
      const soundNote = element('span', 'title-sound-note', 'Best enjoyed slowly. Sound is optional.'); soundNote.prepend(icon('sound'));
      footer.append(note, soundNote);
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
      page.replaceChildren(art, panel, footer); applyPreferences();
    },
  };
};
