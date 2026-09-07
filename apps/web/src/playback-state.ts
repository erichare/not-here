import type { EngineEvent } from '@not-here/engine';

/** A resumable musical intention. One-shot tells are deliberately not replayed. */
export interface PlaybackState {
  readonly bed: Extract<EngineEvent, { kind: 'music.cue' | 'music.stop' | 'music.fragments' }> | null;
  readonly layers: Readonly<Record<string, number>>;
  readonly staticAmount: number;
}
export const EMPTY_PLAYBACK: PlaybackState = { bed: null, layers: {}, staticAmount: 0 };
export const rememberPlayback = (before: PlaybackState, events: readonly EngineEvent[]): PlaybackState => {
  let state = before;
  for (const event of events) {
    if (event.kind === 'music.cue' || event.kind === 'music.stop' || event.kind === 'music.fragments') state = { ...state, bed: event, layers: {} };
    if (event.kind === 'music.layer') state = { ...state, layers: { ...state.layers, [event.pattern]: event.gain } };
    if (event.kind === 'music.static') state = { ...state, staticAmount: event.amount };
  }
  return state;
};
export const playbackEvents = (state: PlaybackState): readonly EngineEvent[] => [
  ...(state.bed ? [state.bed] : []),
  ...Object.entries(state.layers).map(([pattern, gain]) => ({ kind: 'music.layer' as const, pattern, gain })),
  { kind: 'music.static', amount: state.staticAmount },
];
export const readPlayback = (raw: string | null, sceneId: string): PlaybackState | null => {
  try {
    const value: unknown = JSON.parse(raw ?? 'null');
    if (!value || typeof value !== 'object' || !('sceneId' in value) || value.sceneId !== sceneId || !('events' in value) || !Array.isArray(value.events)) return null;
    const valid: EngineEvent[] = [];
    for (const e of value.events) {
      if (!e || typeof e !== 'object') return null;
      if (e.kind === 'music.stop') valid.push({ kind: 'music.stop' });
      else if (e.kind === 'music.cue' && typeof e.cue === 'string' && /^[a-z0-9-]+$/.test(e.cue)) valid.push({ kind: 'music.cue', cue: e.cue });
      else if (e.kind === 'music.fragments' && Array.isArray(e.characters) && e.characters.every((c: unknown) => typeof c === 'string')) valid.push({ kind: 'music.fragments', characters: e.characters });
      else if (e.kind === 'music.layer' && typeof e.pattern === 'string' && Number.isFinite(e.gain)) valid.push({ kind: 'music.layer', pattern: e.pattern, gain: e.gain });
      else if (e.kind === 'music.static' && Number.isFinite(e.amount)) valid.push({ kind: 'music.static', amount: e.amount });
      else return null;
    }
    return rememberPlayback(EMPTY_PLAYBACK, valid);
  } catch { return null; }
};
