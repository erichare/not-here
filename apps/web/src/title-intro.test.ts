import { expect, it, vi } from 'vitest';
import { startTitleIntro } from './title-intro.ts';

const settle = async () => { await Promise.resolve(); await Promise.resolve(); };

it('waits for audio readiness and the audio marker, not elapsed loading time', async () => {
  let ready!: () => void;
  let marker!: () => void;
  const audio = { start: vi.fn(() => new Promise<void>(resolve => { ready = resolve; })), titleIntro: vi.fn((reveal: () => void) => { marker = reveal; return vi.fn(); }) };
  const reveal = vi.fn();
  startTitleIntro(audio, reveal, vi.fn());
  expect(audio.titleIntro).not.toHaveBeenCalled();
  ready(); await settle();
  expect(audio.titleIntro).toHaveBeenCalledOnce();
  expect(reveal).not.toHaveBeenCalled();
  marker(); expect(reveal).toHaveBeenCalledOnce();
});

it('does not start delayed audio after the intro is skipped', async () => {
  let ready!: () => void;
  const audio = { start: vi.fn(() => new Promise<void>(resolve => { ready = resolve; })), titleIntro: vi.fn(() => vi.fn()) };
  const reveal = vi.fn();
  const cancel = startTitleIntro(audio, reveal, vi.fn());
  cancel(); ready(); await settle();
  expect(audio.titleIntro).not.toHaveBeenCalled();
  expect(reveal).not.toHaveBeenCalled();
});

it('cancels an active marker and ignores its late callback', async () => {
  let marker!: () => void;
  const cancelMarker = vi.fn();
  const audio = { start: vi.fn(async () => {}), titleIntro: vi.fn((reveal: () => void) => { marker = reveal; return cancelMarker; }) };
  const reveal = vi.fn();
  const cancel = startTitleIntro(audio, reveal, vi.fn());
  await settle(); cancel(); marker();
  expect(cancelMarker).toHaveBeenCalledOnce();
  expect(reveal).not.toHaveBeenCalled();
});

it('reveals the menu when audio cannot start', async () => {
  const reveal = vi.fn(); const unavailable = vi.fn();
  startTitleIntro({ start: vi.fn(async () => { throw new Error('Audio unavailable'); }), titleIntro: vi.fn() }, reveal, unavailable);
  await settle();
  expect(unavailable).toHaveBeenCalledOnce(); expect(reveal).toHaveBeenCalledOnce();
});

it('does not report a failed audio start after leaving the title', async () => {
  let fail!: (error: Error) => void;
  const reveal = vi.fn(); const unavailable = vi.fn();
  const cancel = startTitleIntro({ start: () => new Promise<void>((_, reject) => { fail = reject; }), titleIntro: vi.fn() }, reveal, unavailable);
  cancel(); fail(new Error('Audio unavailable')); await settle();
  expect(unavailable).not.toHaveBeenCalled(); expect(reveal).not.toHaveBeenCalled();
});
