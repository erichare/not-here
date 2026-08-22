import { describe, expect, it } from 'vitest';
import {
  captionPolicy,
  cssVarsFor,
  DEFAULT_SETTINGS,
  effectiveMotion,
  loadSettings,
  parseSettings,
  revealPresetFor,
  saveSettings,
  SETTINGS_KEY,
} from './settings-model.ts';

const memory = () => {
  const map = new Map<string, string>();
  return {
    getItem: (k: string) => map.get(k) ?? null,
    setItem: (k: string, v: string) => void map.set(k, v),
    removeItem: (k: string) => void map.delete(k),
    dump: () => map,
  };
};

describe('parseSettings', () => {
  it('falls back to defaults for garbage', () => {
    expect(parseSettings(null)).toEqual(DEFAULT_SETTINGS);
    expect(parseSettings('x')).toEqual(DEFAULT_SETTINGS);
    expect(parseSettings([])).toEqual(DEFAULT_SETTINGS);
  });

  it('falls back per field, not per record', () => {
    const parsed = parseSettings({ textScale: 1.12, revealMs: 'fast', motion: 'sideways', volume: 7, muted: 'yes' });
    expect(parsed.textScale).toBe(1.12);
    expect(parsed.revealMs).toBe(DEFAULT_SETTINGS.revealMs);
    expect(parsed.motion).toBe('system');
    expect(parsed.volume).toBe(1);
    expect(parsed.muted).toBe(false);
  });

  it('clamps and rounds', () => {
    expect(parseSettings({ revealMs: -4 }).revealMs).toBe(0);
    expect(parseSettings({ revealMs: 999 }).revealMs).toBe(120);
    expect(parseSettings({ revealMs: 25.6 }).revealMs).toBe(26);
    expect(parseSettings({ textScale: 3 }).textScale).toBe(1);
    expect(parseSettings({ volume: -1 }).volume).toBe(0);
  });
});

describe('storage round trip', () => {
  it('saves and loads under its own key', () => {
    const storage = memory();
    const settings = { ...DEFAULT_SETTINGS, textScale: 1.25 as const, muted: true };
    expect(saveSettings(storage, settings)).toBe(true);
    expect([...storage.dump().keys()]).toEqual([SETTINGS_KEY]);
    expect(loadSettings(storage)).toEqual(settings);
  });

  it('treats corrupt JSON as defaults and a refusing store as unsaved', () => {
    const storage = memory();
    storage.setItem(SETTINGS_KEY, '{not json');
    expect(loadSettings(storage)).toEqual(DEFAULT_SETTINGS);
    const refusing = { setItem: () => { throw new Error('quota'); } };
    expect(saveSettings(refusing, DEFAULT_SETTINGS)).toBe(false);
  });
});

describe('derived policies', () => {
  it('maps to css custom properties', () => {
    expect(cssVarsFor(DEFAULT_SETTINGS)).toEqual({ '--text-scale': '1', '--reveal-ms': '26' });
  });

  it('motion: system defers, on/off override', () => {
    expect(effectiveMotion(DEFAULT_SETTINGS, true)).toBe('off');
    expect(effectiveMotion(DEFAULT_SETTINGS, false)).toBe('on');
    expect(effectiveMotion({ ...DEFAULT_SETTINGS, motion: 'on' }, true)).toBe('on');
    expect(effectiveMotion({ ...DEFAULT_SETTINGS, motion: 'off' }, false)).toBe('off');
  });

  it('muted players always get the cue captions', () => {
    expect(captionPolicy(DEFAULT_SETTINGS)).toBe('fallback-only');
    expect(captionPolicy({ ...DEFAULT_SETTINGS, muted: true })).toBe('always');
    expect(captionPolicy({ ...DEFAULT_SETTINGS, volume: 0 })).toBe('always');
  });

  it('names the nearest pace preset', () => {
    expect(revealPresetFor(0)).toBe('instant');
    expect(revealPresetFor(26)).toBe('steady');
    expect(revealPresetFor(30)).toBe('steady');
    expect(revealPresetFor(45)).toBe('slow');
    expect(revealPresetFor(12)).toBe('quick');
  });
});
