/**
 * The stage — the persistent, full-viewport place behind the ledger. Two
 * slots crossfade when the place changes; a same-place update only sets
 * attributes and custom properties (no node churn). Everything animates in
 * CSS on composited layers; the stage pauses when the tab is hidden and is
 * still under the motion switch. aria-hidden throughout: the stage is
 * weather, never content.
 */

import type { StageModel } from '../../model/stage-model.ts';
import { el, wait } from '../dom.ts';
import { isWharfVariant, kettleSvg, propSvg, variantFor, wharfSvg, type SetVariant } from './layers.ts';

export type StageBeat = 'horn' | 'silence' | 'stinger';

export interface Stage {
  readonly set: (model: StageModel) => void;
  readonly beat: (kind: StageBeat) => void;
  readonly pause: () => void;
  readonly resume: () => void;
  /** Clear the stage (the title owns its own dressing). */
  readonly clear: () => void;
}

export const CROSSFADE_MS = 1200;
export const BEAT_MS = { horn: 7400, silence: 3500, stinger: 700 } as const;

const PHONE_QUERY = '(max-width: 720px)';

const buildSet = (variant: SetVariant, phone: boolean, night: boolean): HTMLElement => {
  const set = el('div', `set set--${variant}`);
  set.append(el('div', 'sky'));
  set.append(el('div', 'fog fog--far'));
  const art = el('div', 'art');
  if (isWharfVariant(variant)) {
    art.innerHTML = wharfSvg(phone, night);
    const beam = el('div', 'beam');
    art.append(beam);
    if (variant === 'unit') art.append(el('div', 'unit-frame'));
  } else if (variant === 'kettle') {
    art.innerHTML = kettleSvg(phone);
    art.append(el('div', 'lamp-pool'), el('div', 'heater-glow'));
  } else {
    set.append(el('div', 'tint'));
    set.append(el('div', 'sig'));
    art.innerHTML = propSvg(variant, phone);
  }
  set.append(art);
  set.append(el('div', 'fog fog--near'));
  return set;
};

export const createStage = (host: HTMLElement): Stage => {
  const slots = [el('div', 'stage-slot'), el('div', 'stage-slot')] as const;
  const grain = el('div', 'stage-grain');
  const vignette = el('div', 'stage-vignette');
  const beats = el('div', 'stage-beats');
  // five rings from the horn bell — one per bar; CSS stages their delays
  for (let i = 0; i < 5; i += 1) beats.append(el('span', 'ring312'));
  host.append(slots[0], slots[1], grain, vignette, beats);

  let active = 0;
  let current: { variant: SetVariant; phone: boolean; night: boolean } | null = null;
  let generation = 0;
  const phoneQuery = typeof window.matchMedia === 'function' ? window.matchMedia(PHONE_QUERY) : null;
  const isPhone = (): boolean => phoneQuery?.matches ?? false;

  const mount = (variant: SetVariant, night: boolean): void => {
    const phone = isPhone();
    const next = 1 - active;
    const incoming = slots[next] as HTMLElement;
    const outgoing = slots[active] as HTMLElement;
    incoming.replaceChildren(buildSet(variant, phone, night));
    incoming.classList.add('active');
    outgoing.classList.remove('active');
    active = next;
    current = { variant, phone, night };
    const myGeneration = (generation += 1);
    void wait(CROSSFADE_MS).then(() => {
      if (myGeneration === generation) outgoing.replaceChildren();
    });
  };

  const set = (model: StageModel): void => {
    host.dataset['place'] = model.place;
    if (model.slot === 'none') delete host.dataset['slot'];
    else host.dataset['slot'] = model.slot;
    host.dataset['horn'] = model.horn;
    host.dataset['rot'] = model.rotTier;
    host.style.setProperty('--presence', String(model.presence));
    host.style.setProperty('--fragments', String(model.fragments.length));
    const variant = variantFor(model.place);
    const night = model.slot === 'night' || model.slot === 'none';
    if (current === null || current.variant !== variant || current.phone !== isPhone() || current.night !== night) {
      mount(variant, night);
    }
  };

  phoneQuery?.addEventListener?.('change', () => {
    if (current !== null) mount(current.variant, current.night);
  });

  return {
    set,
    beat: (kind) => {
      const cls = `beat-${kind}`;
      host.classList.add(cls);
      void wait(BEAT_MS[kind]).then(() => host.classList.remove(cls));
    },
    pause: () => {
      host.dataset['paused'] = '';
    },
    resume: () => {
      delete host.dataset['paused'];
    },
    clear: () => {
      for (const slot of slots) {
        slot.replaceChildren();
        slot.classList.remove('active');
      }
      current = null;
      delete host.dataset['place'];
      delete host.dataset['slot'];
      delete host.dataset['horn'];
    },
  };
};
