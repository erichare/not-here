/**
 * The day strip's model: the day, its hour, the calendar date, how far the
 * snowline has come down the hill, and whether the book is unlocked. Day 1
 * is November 6; the circled Friday is November 28 (Day 23). No weekday is
 * ever named here — the prose reserves that for one Friday.
 */

import type { SlotId, WorldState } from '@not-here/engine';
import { isBookUnlocked } from '@not-here/story';

export interface FrameModel {
  readonly day: number;
  readonly slot: SlotId;
  readonly header: string;
  readonly dateLabel: string;
  /** 0 (summit, Night 1) .. 1 (the foot of the hill, Nov 28). */
  readonly snowline: number;
  readonly glyph: string;
  readonly bookUnlocked: boolean;
}

export const FIRST_DAY_OF_MONTH = 6;
export const LAST_DAY = 23;
export const CIRCLED_DATE = 'NOV 28';

export const SLOT_GLYPHS: Readonly<Record<SlotId, string>> = {
  morning: '○',
  afternoon: '◔',
  evening: '◑',
  night: '●',
};

export const slotGlyph = (slot: SlotId): string => SLOT_GLYPHS[slot];

/** 'DAY 4 — MORNING' — the ledger's header line (the CLI's exact format). */
export const headerFor = (day: number, slot: string): string => `DAY ${day} — ${slot.toUpperCase()}`;

/** 'NOV 6' .. 'NOV 28' — never a weekday. Clamped to November. */
export const dateLabel = (day: number): string => {
  const date = Math.max(1, Math.min(30, FIRST_DAY_OF_MONTH + Math.max(1, day) - 1));
  return `NOV ${date}`;
};

/** How far the snow has come down: 0 on the first morning, 1 on the morning of Nov 28. */
export const snowline = (day: number, slot: SlotId): number => {
  const t = (day - 1 + (slot === 'night' ? 0.5 : 0)) / (LAST_DAY - 1);
  return Math.round(Math.max(0, Math.min(1, t)) * 1000) / 1000;
};

export const frameModelFor = (
  state: Pick<WorldState, 'day' | 'flags' | 'choiceLog'> & Partial<Pick<WorldState, 'sceneId' | 'stats' | 'staticMeter'>>,
  slot: SlotId,
  bookUnlocked: boolean = isBookUnlocked(state as WorldState),
): FrameModel => ({
  day: state.day,
  slot,
  header: headerFor(state.day, slot),
  dateLabel: dateLabel(state.day),
  snowline: snowline(state.day, slot),
  glyph: slotGlyph(slot),
  bookUnlocked,
});
