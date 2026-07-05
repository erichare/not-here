import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { EngineEvent } from '@not-here/engine';
import { cueCaption, UNKNOWN_CUE_CAPTION } from '@not-here/music';
import { buildContent } from '@not-here/story';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createAudioSink } from './audio.ts';
import { stripAnsi } from './render.ts';

let dir: string;

beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), 'nh-cli-audio-'));
});

afterEach(() => {
  rmSync(dir, { recursive: true, force: true });
});

const sink = () => createAudioSink(dir);

describe('createAudioSink', () => {
  it('prints a diegetic caption line, never the raw cue id', () => {
    const lines = sink().handle([{ kind: 'music.cue', cue: 'wrens-room' }]);
    expect(lines.map(stripAnsi)).toEqual(['♪ a tune the kept room knows']);
  });

  it('captions unknown cues without leaking the id', () => {
    const lines = sink().handle([{ kind: 'music.cue', cue: 'debug-slug-99' }]);
    const plain = stripAnsi(lines[0] ?? '');
    expect(plain).toMatch(/^♪ /);
    expect(plain).not.toContain('debug-slug-99');
  });

  it('prints the caption even when a WAV exists and playback starts', () => {
    // A garbage WAV: the spawn may fail asynchronously, but the caption is
    // the accessibility channel and must print regardless of playback.
    writeFileSync(join(dir, 'title.wav'), 'not really a wav');
    const s = sink();
    const lines = s.handle([{ kind: 'music.cue', cue: 'title' }]);
    expect(lines.map(stripAnsi)).toEqual([`♪ ${cueCaption('title')}`]);
    s.stop();
  });

  it('music.stop kills playback and prints nothing — the silence is silent', () => {
    writeFileSync(join(dir, 'title.wav'), 'not really a wav');
    const s = sink();
    s.handle([{ kind: 'music.cue', cue: 'title' }]);
    const lines = s.handle([{ kind: 'music.stop' }]);
    expect(lines).toEqual([]);
  });

  it('prints tell.visual text in italics', () => {
    const lines = sink().handle([{ kind: 'tell.visual', text: 'The note bends.' }]);
    expect(lines).toHaveLength(1);
    expect(stripAnsi(lines[0] ?? '')).toBe('The note bends.');
    expect(lines[0]).toContain('[3');
  });

  it('ignores events it does not present', () => {
    const events: readonly EngineEvent[] = [
      { kind: 'stat.changed', stat: 'flesh', delta: 1 },
      { kind: 'music.static', amount: 40 },
      { kind: 'save.autosave' },
    ];
    expect(sink().handle(events)).toEqual([]);
  });

  it('never plays when silent, and still captions', () => {
    writeFileSync(join(dir, 'title.wav'), 'not really a wav');
    const silent = createAudioSink(dir, { silent: true });
    const lines = silent.handle([{ kind: 'music.cue', cue: 'title' }]);
    expect(lines.map(stripAnsi)).toEqual([`♪ ${cueCaption('title')}`]);
  });

  it('stop() is safe with nothing playing', () => {
    expect(() => sink().stop()).not.toThrow();
  });
});

describe('caption map totality', () => {
  it('every cue the story ships has a diegetic caption with no raw id', () => {
    const content = buildContent();
    const cues = new Set(
      [...content.scenes.values()].flatMap((scene) =>
        scene.cue !== undefined ? [scene.cue] : [],
      ),
    );
    expect(cues.size).toBeGreaterThan(0);
    for (const cue of cues) {
      const caption = cueCaption(cue);
      expect(caption, `cue '${cue}' is missing a caption`).not.toBe(
        UNKNOWN_CUE_CAPTION,
      );
      expect(caption.toLowerCase()).not.toContain(cue.toLowerCase());
    }
  });

  it('the fallback caption never echoes the id back', () => {
    expect(cueCaption('barb-secret-cue')).toBe(UNKNOWN_CUE_CAPTION);
    expect(UNKNOWN_CUE_CAPTION).not.toMatch(/[a-z0-9]+-[a-z0-9-]+/);
  });
});
