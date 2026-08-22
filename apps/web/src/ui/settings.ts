/**
 * The lamp — the settings sheet, in the game's register: the pen's pace,
 * the print, the lamp (volume and mute), the weather (motion), the lamp's
 * stutter (flicker). Controls are pen ticks in radio groups, never sliders
 * that look like a web form. Changes apply at once and are remembered.
 */

import { SETTINGS } from '../model/copy.ts';
import {
  REVEAL_PRESETS,
  revealPresetFor,
  TEXT_SCALES,
  type RevealPreset,
  type Settings,
  type TextScale,
} from '../model/settings-model.ts';
import { el } from './dom.ts';
import { createOverlay, type OverlayPanel } from './overlay.ts';

export interface SettingsLayerHooks {
  readonly buttonHosts: readonly HTMLElement[];
  readonly inertTargets: readonly HTMLElement[];
  readonly get: () => Settings;
  readonly onChange: (next: Settings) => void;
}

export interface SettingsLayer {
  readonly retire: () => void;
  readonly isOpen: () => boolean;
}

interface Tick<T> {
  readonly label: string;
  readonly value: T;
}

const VOLUMES = [0, 0.25, 0.5, 0.75, 1] as const;

export const createSettingsLayer = (host: HTMLElement, hooks: SettingsLayerHooks): SettingsLayer => {
  const buttons = hooks.buttonHosts.map((parent) => {
    const b = el('button', 'lamp-open', SETTINGS.title);
    b.type = 'button';
    b.setAttribute('aria-haspopup', 'dialog');
    parent.append(b);
    return b;
  });

  const overlay = createOverlay({
    host,
    className: 'overlay lamp-overlay',
    label: SETTINGS.aria,
    inertTargets: hooks.inertTargets,
  });

  const build = (): OverlayPanel => {
    const panel = el('article', 'sheet lamp-page');
    panel.setAttribute('tabindex', '-1');
    const close = el('button', 'sheet-close', SETTINGS.close);
    close.type = 'button';
    panel.append(close, el('h2', 'sheet-title', SETTINGS.title));

    const render = (): void => {
      const current = hooks.get();
      const rows = panel.querySelector('.lamp-rows');
      rows?.remove();
      const list = el('div', 'lamp-rows');

      const row = <T,>(
        label: string,
        note: string,
        ticks: readonly Tick<T>[],
        selected: T,
        apply: (value: T) => Settings,
      ): void => {
        const wrap = el('div', 'lamp-row');
        const head = el('div', 'lamp-label', label);
        const group = el('div', 'ticks');
        group.setAttribute('role', 'radiogroup');
        group.setAttribute('aria-label', label);
        for (const tick of ticks) {
          const b = el('button', `tick${Object.is(tick.value, selected) ? ' on' : ''}`, tick.label);
          b.type = 'button';
          b.setAttribute('role', 'radio');
          b.setAttribute('aria-checked', Object.is(tick.value, selected) ? 'true' : 'false');
          b.addEventListener('click', (event) => {
            event.stopPropagation();
            hooks.onChange(apply(tick.value));
            render();
          });
          group.append(b);
        }
        wrap.append(head, group, el('p', 'lamp-note', note));
        list.append(wrap);
      };

      row<RevealPreset>(
        SETTINGS.pace.label,
        SETTINGS.pace.note,
        [
          { label: SETTINGS.pace.slow, value: 'slow' },
          { label: SETTINGS.pace.steady, value: 'steady' },
          { label: SETTINGS.pace.quick, value: 'quick' },
          { label: SETTINGS.pace.instant, value: 'instant' },
        ],
        revealPresetFor(current.revealMs),
        (value) => ({ ...current, revealMs: REVEAL_PRESETS[value] }),
      );
      row<TextScale>(
        SETTINGS.print.label,
        SETTINGS.print.note,
        [
          { label: SETTINGS.print.smaller, value: TEXT_SCALES[0] },
          { label: SETTINGS.print.normal, value: TEXT_SCALES[1] },
          { label: SETTINGS.print.larger, value: TEXT_SCALES[2] },
          { label: SETTINGS.print.largest, value: TEXT_SCALES[3] },
        ],
        current.textScale,
        (value) => ({ ...current, textScale: value }),
      );
      row<number | 'muted'>(
        SETTINGS.lamp.label,
        SETTINGS.lamp.note,
        [
          { label: SETTINGS.lamp.unlit, value: 'muted' },
          ...VOLUMES.filter((v) => v > 0).map((v) => ({ label: '·'.repeat(Math.round(v * 4)), value: v })),
        ],
        current.muted ? 'muted' : current.volume,
        (value) => (value === 'muted' ? { ...current, muted: true } : { ...current, muted: false, volume: value }),
      );
      row<Settings['motion']>(
        SETTINGS.weather.label,
        SETTINGS.weather.note,
        [
          { label: SETTINGS.weather.system, value: 'system' },
          { label: SETTINGS.weather.move, value: 'on' },
          { label: SETTINGS.weather.still, value: 'off' },
        ],
        current.motion,
        (value) => ({ ...current, motion: value }),
      );
      row<boolean>(
        SETTINGS.stutter.label,
        SETTINGS.stutter.note,
        [
          { label: SETTINGS.stutter.on, value: true },
          { label: SETTINGS.stutter.off, value: false },
        ],
        current.flicker,
        (value) => ({ ...current, flicker: value }),
      );
      panel.append(list);
    };
    render();
    return { panel, close };
  };

  for (const b of buttons) {
    b.addEventListener('click', (event) => {
      event.stopPropagation();
      overlay.open(build);
    });
  }

  return {
    retire: () => overlay.close(false),
    isOpen: overlay.isOpen,
  };
};
