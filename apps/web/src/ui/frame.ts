/**
 * The frame — the day strip along the top (DAY N · the hour's glyph · the
 * hill with its snowline · NOV 28 ringed · the book and, later, the ledger-
 * so-far and the lamp) and, on a phone, the bottom bar the affordances move
 * to. Updated in place each step; never re-rendered. The hill is one SVG:
 * snow is the hill clipped above the snowline.
 */

import { CIRCLED_DATE, type FrameModel } from '../model/frame-model.ts';
import { el } from './dom.ts';

export interface Frame {
  readonly update: (model: FrameModel) => void;
  readonly hide: () => void;
  readonly show: () => void;
  /** Where the book's consult button lives (the strip's nav). */
  readonly nav: HTMLElement;
  /** The phone's bottom bar — the same buttons, thumb-reachable. */
  readonly bar: HTMLElement;
}

const HILL_PATH = 'M0 22 C30 20 50 8 80 6 C100 5 115 12 135 10 C160 8 180 16 220 22 Z';
/** Summit and foot of the hill, in the 220×24 box. */
const SNOW_SUMMIT = 4;
const SNOW_FOOT = 22;

const buildHill = (): { svg: SVGSVGElement; clip: SVGRectElement; line: SVGLineElement } => {
  const NS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('class', 'hill');
  svg.setAttribute('viewBox', '0 0 220 24');
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('focusable', 'false');
  const defs = document.createElementNS(NS, 'defs');
  const clipPath = document.createElementNS(NS, 'clipPath');
  const clipId = `nh-snow-${Math.floor(Math.random() * 1e9).toString(36)}`;
  clipPath.setAttribute('id', clipId);
  const clip = document.createElementNS(NS, 'rect');
  clip.setAttribute('x', '0');
  clip.setAttribute('y', '0');
  clip.setAttribute('width', '220');
  clip.setAttribute('height', String(SNOW_SUMMIT));
  clipPath.append(clip);
  defs.append(clipPath);
  const land = document.createElementNS(NS, 'path');
  land.setAttribute('class', 'land');
  land.setAttribute('d', HILL_PATH);
  const snow = document.createElementNS(NS, 'path');
  snow.setAttribute('class', 'snow');
  snow.setAttribute('d', HILL_PATH);
  snow.setAttribute('clip-path', `url(#${clipId})`);
  const line = document.createElementNS(NS, 'line');
  line.setAttribute('class', 'line');
  line.setAttribute('x1', '0');
  line.setAttribute('x2', '220');
  line.setAttribute('y1', String(SNOW_SUMMIT));
  line.setAttribute('y2', String(SNOW_SUMMIT));
  svg.append(defs, land, snow, line);
  return { svg, clip, line };
};

export const createFrame = (host: HTMLElement): Frame => {
  const strip = el('div', 'frame-top');
  const left = el('div', 'frame-left');
  const day = el('span', 'frame-day');
  const glyph = el('span', 'frame-glyph');
  glyph.setAttribute('aria-hidden', 'true');
  const slot = el('span', 'frame-slot');
  left.append(day, glyph, slot);
  const hill = buildHill();
  const date = el('span', 'frame-date', CIRCLED_DATE);
  const nav = el('nav', 'frame-nav');
  nav.setAttribute('aria-label', 'the ledger’s margins');
  strip.append(left, hill.svg, date, nav);

  const bar = el('nav', 'frame-bar');
  bar.setAttribute('aria-label', 'the ledger’s margins');

  host.append(strip, bar);
  host.setAttribute('role', 'banner');

  return {
    update: (model) => {
      day.textContent = `DAY ${model.day}`;
      glyph.textContent = model.glyph;
      slot.textContent = model.slot;
      const y = SNOW_SUMMIT + (SNOW_FOOT - SNOW_SUMMIT) * model.snowline;
      hill.clip.setAttribute('height', y.toFixed(2));
      hill.line.setAttribute('y1', y.toFixed(2));
      hill.line.setAttribute('y2', y.toFixed(2));
      date.classList.toggle('pressed', model.day >= 23);
      host.dataset['book'] = model.bookUnlocked ? 'unlocked' : 'locked';
      host.hidden = false;
    },
    hide: () => {
      host.hidden = true;
    },
    show: () => {
      host.hidden = false;
    },
    nav,
    bar,
  };
};
