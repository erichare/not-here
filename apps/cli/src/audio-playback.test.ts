import { spawn } from 'node:child_process';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createAudioSink } from './audio.ts';

vi.mock('node:fs', () => ({ existsSync: vi.fn(() => true) }));
vi.mock('node:child_process', async () => {
  const { EventEmitter } = await import('node:events');
  return { spawn: vi.fn(() => Object.assign(new EventEmitter(), {
    kill: vi.fn(), unref: vi.fn(),
  })) };
});

beforeEach(() => vi.clearAllMocks());
const child = () => vi.mocked(spawn).mock.results.at(-1)!.value as ReturnType<typeof spawn>;

describe('revised terminal recording playback', () => {
  it('loops successful location recordings, preserves continuity, and stops respawning after stop', () => {
    const audio = createAudioSink('/game/auditions', { edition: 'revised' });
    audio.handle([{ kind: 'music.cue', cue: 'v2-kettle' }]);
    expect(spawn).toHaveBeenCalledWith('afplay', ['/game/apps/web/public/music/a-place-kept-v1/v2-kettle.m4a'], expect.any(Object));
    audio.handle([{ kind: 'music.cue', cue: 'v2-kettle' }]);
    expect(spawn).toHaveBeenCalledTimes(1);
    child().emit('exit', 0);
    expect(spawn).toHaveBeenCalledTimes(2);
    const stopped = child(); audio.stop(); stopped.emit('exit', 0);
    expect(spawn).toHaveBeenCalledTimes(2);
  });

  it('allows a one-shot to finish before the newest requested location', () => {
    const audio = createAudioSink('/game/auditions', { edition: 'revised' });
    audio.handle([{ kind: 'music.cue', cue: 'v2-foghorn-312' }]);
    audio.handle([{ kind: 'music.cue', cue: 'v2-kettle' }, { kind: 'music.cue', cue: 'v2-room' }]);
    expect(spawn).toHaveBeenCalledTimes(1);
    child().emit('exit', 0);
    expect(spawn).toHaveBeenLastCalledWith('afplay', ['/game/apps/web/public/music/a-place-kept-v1/v2-room.m4a'], expect.any(Object));
    audio.stop();
  });

  it('does not loop a failed decoder or respawn a superseded process', () => {
    const audio = createAudioSink('/game/auditions', { edition: 'revised' });
    audio.handle([{ kind: 'music.cue', cue: 'v2-room' }]);
    const old = child();
    audio.handle([{ kind: 'music.cue', cue: 'v2-kettle' }]);
    old.emit('error', new Error('stale failure')); old.emit('exit', 0);
    expect(spawn).toHaveBeenCalledTimes(2);
    child().emit('exit', 1);
    expect(spawn).toHaveBeenCalledTimes(2);
    audio.stop();
  });

  it('uses the calibrated stems at unity and leaves the original file path alone', () => {
    const audio = createAudioSink('/game/auditions', { edition: 'revised' });
    audio.handle([{ kind: 'music.fragments', characters: ['priya'] }]);
    expect(spawn).toHaveBeenCalledWith('afplay', ['-v', '1', '/game/apps/web/public/music/a-place-kept-v1/v2-ensemble-priya.wav'], expect.any(Object));
    expect(spawn).toHaveBeenCalledWith('afplay', ['-v', '1', '/game/apps/web/public/music/a-place-kept-v1/v2-ensemble-sea.wav'], expect.any(Object));
    audio.stop();
    const original = createAudioSink('/game/auditions');
    original.handle([{ kind: 'music.cue', cue: 'title' }]);
    expect(spawn).toHaveBeenLastCalledWith('afplay', ['/game/auditions/title.wav'], expect.any(Object));
    original.stop();
  });
});
