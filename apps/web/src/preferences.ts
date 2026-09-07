export interface Preferences {
  music: number; ambience: number; effects: number; voice: number;
  textSize: number; paced: boolean; reducedMotion: boolean;
}
export const DEFAULT_PREFERENCES: Preferences = { music: .65, ambience: .4, effects: .35, voice: .65, textSize: 18, paced: false, reducedMotion: false };
export const PREFERENCES_KEY = 'not-here:preferences';
export const readPreferences = (storage: Pick<Storage, 'getItem'>): Preferences => {
  try {
    const value: unknown = JSON.parse(storage.getItem(PREFERENCES_KEY) ?? '{}');
    if (!value || typeof value !== 'object') return { ...DEFAULT_PREFERENCES };
    const record = value as Record<string, unknown>;
    const result = { ...DEFAULT_PREFERENCES };
    for (const key of ['music', 'ambience', 'effects', 'voice', 'textSize'] as const) {
      const n = record[key];
      if (typeof n === 'number' && Number.isFinite(n)) result[key] = Math.max(key === 'textSize' ? 16 : 0, Math.min(key === 'textSize' ? 26 : 1, n));
    }
    for (const key of ['paced', 'reducedMotion'] as const) if (typeof record[key] === 'boolean') result[key] = record[key];
    return result;
  } catch { return { ...DEFAULT_PREFERENCES }; }
};
