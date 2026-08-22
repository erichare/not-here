/**
 * Settings — the lamp. A separate storage key from the save (never touched
 * by clearSave), parsed per-field from untrusted JSON: any invalid field
 * falls back to its default, never the whole record. Applied as CSS custom
 * properties (--text-scale, --reveal-ms) and the html[data-motion] switch;
 * volume/mute reach the master GainNode in audio.ts. Pure.
 */

export const SETTINGS_KEY = 'not-here:settings';
export const SETTINGS_VERSION = 1;

export const TEXT_SCALES = [0.9, 1, 1.12, 1.25] as const;
export type TextScale = (typeof TEXT_SCALES)[number];

export const REVEAL_PRESETS = { slow: 40, steady: 26, quick: 14, instant: 0 } as const;
export type RevealPreset = keyof typeof REVEAL_PRESETS;

export type MotionPreference = 'system' | 'on' | 'off';

export interface Settings {
  readonly v: typeof SETTINGS_VERSION;
  readonly textScale: TextScale;
  /** Milliseconds per word; 0 = at once. */
  readonly revealMs: number;
  readonly motion: MotionPreference;
  /** Whether the lamp's stutter and stingers may flicker. */
  readonly flicker: boolean;
  readonly volume: number;
  readonly muted: boolean;
}

export const DEFAULT_SETTINGS: Settings = {
  v: SETTINGS_VERSION,
  textScale: 1,
  revealMs: REVEAL_PRESETS.steady,
  motion: 'system',
  flicker: true,
  volume: 0.8,
  muted: false,
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isTextScale = (value: unknown): value is TextScale =>
  typeof value === 'number' && (TEXT_SCALES as readonly number[]).includes(value);

const isMotion = (value: unknown): value is MotionPreference =>
  value === 'system' || value === 'on' || value === 'off';

const clamp01 = (x: number): number => Math.max(0, Math.min(1, x));

/** Structural, per-field parse of untrusted storage. Never throws. */
export const parseSettings = (raw: unknown): Settings => {
  if (!isRecord(raw)) return DEFAULT_SETTINGS;
  const revealMs = raw['revealMs'];
  const volume = raw['volume'];
  return {
    v: SETTINGS_VERSION,
    textScale: isTextScale(raw['textScale']) ? raw['textScale'] : DEFAULT_SETTINGS.textScale,
    revealMs:
      typeof revealMs === 'number' && Number.isFinite(revealMs)
        ? Math.max(0, Math.min(120, Math.round(revealMs)))
        : DEFAULT_SETTINGS.revealMs,
    motion: isMotion(raw['motion']) ? raw['motion'] : DEFAULT_SETTINGS.motion,
    flicker: typeof raw['flicker'] === 'boolean' ? raw['flicker'] : DEFAULT_SETTINGS.flicker,
    volume:
      typeof volume === 'number' && Number.isFinite(volume) ? clamp01(volume) : DEFAULT_SETTINGS.volume,
    muted: typeof raw['muted'] === 'boolean' ? raw['muted'] : DEFAULT_SETTINGS.muted,
  };
};

export const serializeSettings = (settings: Settings): string => JSON.stringify(settings);

export const loadSettings = (storage: {
  getItem(key: string): string | null;
}): Settings => {
  try {
    const raw = storage.getItem(SETTINGS_KEY);
    if (raw === null) return DEFAULT_SETTINGS;
    return parseSettings(JSON.parse(raw));
  } catch {
    return DEFAULT_SETTINGS;
  }
};

/** False when storage refuses — the lamp just isn't remembered. */
export const saveSettings = (
  storage: { setItem(key: string, value: string): void },
  settings: Settings,
): boolean => {
  try {
    storage.setItem(SETTINGS_KEY, serializeSettings(settings));
    return true;
  } catch {
    return false;
  }
};

/** The CSS custom properties the page reads. */
export const cssVarsFor = (settings: Settings): Readonly<Record<'--text-scale' | '--reveal-ms', string>> => ({
  '--text-scale': String(settings.textScale),
  '--reveal-ms': String(settings.revealMs),
});

/** 'system' defers to the OS; 'on'/'off' override it. */
export const effectiveMotion = (settings: Settings, systemReduced: boolean): 'on' | 'off' => {
  if (settings.motion === 'off') return 'off';
  if (settings.motion === 'on') return 'on';
  return systemReduced ? 'off' : 'on';
};

/** Muted players get the cue captions the CLI always prints. */
export const captionPolicy = (settings: Settings): 'fallback-only' | 'always' =>
  settings.muted || settings.volume === 0 ? 'always' : 'fallback-only';

/** The nearest preset name for a speed (for the settings control's tick). */
export const revealPresetFor = (revealMs: number): RevealPreset => {
  let best: RevealPreset = 'steady';
  let bestDistance = Number.POSITIVE_INFINITY;
  for (const [name, ms] of Object.entries(REVEAL_PRESETS) as [RevealPreset, number][]) {
    const d = Math.abs(ms - revealMs);
    if (d < bestDistance) {
      best = name;
      bestDistance = d;
    }
  }
  return best;
};
