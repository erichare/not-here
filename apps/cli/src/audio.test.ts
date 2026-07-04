import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { EngineEvent } from '@not-here/engine';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createAudioSink } from './audio.ts';
import { stripAnsi } from './render.ts';

let dir: string;
let asyncLines: string[];

beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), 'nh-cli-audio-'));
  asyncLines = [];
});

afterEach(() => {
  rmSync(dir, { recursive: true, force: true });
});

const sink = () => createAudioSink(dir, (line) => asyncLines.push(line));

describe('createAudioSink', () => {
  it('falls back to a dim note line when the cue WAV is missing', () => {
    const lines = sink().handle([{ kind: 'music.cue', cue: 'title' }]);
    expect(lines.map(stripAnsi)).toEqual(['♪ title']);
  });

  it('prints tell.visual text in italics', () => {
    const lines = sink().handle([{ kind: 'tell.visual', text: 'The note bends.' }]);
    expect(lines).toHaveLength(1);
    expect(stripAnsi(lines[0] ?? '')).toBe('The note bends.');
    expect(lines[0]).toContain('[3');
  });

  it('ignores events it does not present', () => {
    const events: readonly EngineEvent[] = [
      { kind: 'stat.changed', stat: 'flesh', delta: 1 },
      { kind: 'music.static', amount: 40 },
      { kind: 'save.autosave' },
    ];
    expect(sink().handle(events)).toEqual([]);
  });

  it('never plays when silent, even if the file exists', () => {
    const silent = createAudioSink(dir, (line) => asyncLines.push(line), {
      silent: true,
    });
    const lines = silent.handle([{ kind: 'music.cue', cue: 'anything' }]);
    expect(lines.map(stripAnsi)).toEqual(['♪ anything']);
  });

  it('stop() is safe with nothing playing', () => {
    expect(() => sink().stop()).not.toThrow();
  });
});
