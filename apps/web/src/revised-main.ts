import { advance, initialState, resumeScene, type EngineEvent, type StepResult, type WorldState } from '@not-here/engine';
import { buildRevisedContent, REVISED_OPENING_SCENE } from '@not-here/story';
import { createAudioPlayer } from './audio.ts';
import { cueCaptionLine } from './cues.ts';
import { createExperience } from './experience.ts';
import { classifyLaunch, clearSave, isWorldState, loadSave, persistSave, resumeStep, saveMargin } from './save.ts';
import './styles/index.css';
import { EMPTY_PLAYBACK, playbackEvents, readPlayback, rememberPlayback } from './playback-state.ts';

const root = document.querySelector<HTMLElement>('#app');
if (!root) throw new Error('Missing game root');
const content = buildRevisedContent();
let state = initialState(0x5eed, REVISED_OPENING_SCENE);
const storage = window.localStorage;
const audio = createAudioPlayer(cue => ui.addCaption(cueCaptionLine(cue)), { edition: 'revised' });
const CHECKPOINT = 'not-here:story2:rewind';
const PLAYBACK = 'not-here:story2:playback';
let playback = EMPTY_PLAYBACK;
const checkpoint = (): WorldState | null => {
  try {
    const data: unknown = JSON.parse(storage.getItem(CHECKPOINT) ?? 'null');
    return isWorldState(data) && ['r20-warning', 'r22-warning'].includes(data.sceneId) ? data : null;
  } catch { return null; }
};
const event = (e: EngineEvent): void => {
  switch (e.kind) {
    case 'music.cue': audio.cue(e.cue); ui.addCaption(cueCaptionLine(e.cue)); break;
    case 'music.stop': audio.stop(); ui.addCaption('The music stops. The room remains.'); break;
    case 'music.fragments': audio.fragments(e.characters); ui.addCaption(`The song holds ${e.characters.join(', ') || 'an empty place'}.`); break;
    case 'music.layer': audio.layer(e.pattern, e.gain); break;
    case 'music.detune': audio.detune(e.pattern, e.cents); break;
    case 'music.static': audio.static(e.amount); break;
    case 'music.stinger': audio.stinger(e.cue); ui.addCaption(cueCaptionLine(e.cue)); break;
    case 'tell.visual': ui.addCaption(e.text); break;
  }
};
const render = (step: StepResult, save = true): void => {
  state = step.state;
  let restored = null;
  if (!save) { try { restored = readPlayback(storage.getItem(PLAYBACK), state.sceneId); } catch { /* storage unavailable */ } }
  playback = restored ?? rememberPlayback(playback, step.events);
  if (save) {
    if (['r20-warning', 'r22-warning'].includes(state.sceneId)) {
      try { storage.setItem(CHECKPOINT, JSON.stringify(state)); } catch { /* optional rewind */ }
    }
    if (!persistSave(storage, state)) ui.addCaption('Your browser could not save this page. Keep the tab open.');
    saveMargin(storage, state.sceneId, step.events);
    try { storage.setItem(PLAYBACK, JSON.stringify({ sceneId: state.sceneId, events: playbackEvents(playback) })); } catch { /* main save reports storage failure */ }
  }
  (restored ? [...playbackEvents(restored), ...step.events.filter(e => e.kind === 'tell.visual')] : step.events).forEach(event);
  audio.ambience(step.view.ending === 'unwitnessed' ? null : step.view.presentation?.ambience ?? null);
  ui.renderScene({ ...step.view, world: state, slot: content.scenes.get(state.sceneId)?.slot ?? state.slot, header: `Day ${state.day} · ${content.scenes.get(state.sceneId)?.slot ?? state.slot}` });
};
const fresh = (): void => {
  clearSave(storage); ui.resetHistory();
  playback = EMPTY_PLAYBACK; audio.stop(); audio.fingerprint({});
  try { storage.removeItem(CHECKPOINT); } catch { /* optional rewind */ }
  state = initialState(crypto.getRandomValues(new Uint32Array(1))[0]!, REVISED_OPENING_SCENE);
  render(advance(content, state, { kind: 'enter' }));
};
const titleSave = loadSave(storage);
const ui = createExperience(root, {
  ...(typeof titleSave?.flags['n1:goodbye'] === 'string' ? { onTitleSound: () => { void audio.start().then(() => { audio.fingerprint({}); audio.fingerprint(titleSave.flags); ui.addCaption(cueCaptionLine(`v2-fingerprint-${titleSave.flags['n1:goodbye']}`)); }).catch(() => ui.addCaption('Your remembered phrase is two plucked notes with a space between them.')); } } : {}),
  onChoose: choiceId => render(advance(content, state, { kind: 'choose', choiceId })),
  onInspect: observationId => render(advance(content, state, { kind: 'inspect', observationId })),
  onName: name => render(advance(content, state, { kind: 'name', name })),
  onNewGame: fresh,
  onPreferences: p => audio.preferences(p),
  canRewind: () => checkpoint() !== null,
  onRewind: () => { const s = checkpoint(); if (s) { ui.rewindHistory(s.sceneId); render(resumeScene(content, s)); } },
});
const savedEnding = loadSave(storage);
ui.showTitle(savedEnding && content.scenes.get(savedEnding.sceneId)?.ending ? 'resume' : classifyLaunch(storage, content.scenes).kind, beginFresh => {
  void audio.start().catch(() => ui.addCaption('Audio is unavailable. Every clue is still on the page.'));
  if (beginFresh) { fresh(); return; }
  const completed = loadSave(storage);
  if (completed && content.scenes.get(completed.sceneId)?.ending) { render(resumeStep(content, completed, storage), false); return; }
  const launch = classifyLaunch(storage, content.scenes);
  if (launch.kind === 'fresh') fresh();
  else render(resumeStep(content, launch.state, storage), false);
});
