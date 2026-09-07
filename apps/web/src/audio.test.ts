import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createAudioPlayer } from './audio.ts';
import { DEFAULT_PREFERENCES } from './preferences.ts';

const param = (value = 0) => ({ value, setValueAtTime: vi.fn(), setTargetAtTime: vi.fn(), cancelScheduledValues: vi.fn(), linearRampToValueAtTime: vi.fn() });
const gainNode = () => ({ gain: param(), connect: vi.fn(), disconnect: vi.fn() });
const filterNode = () => ({ type: '', frequency: param(), connect: vi.fn(), disconnect: vi.fn() });
class Source {
  buffer: unknown; loop = false; detune = param(); onended: (() => void) | null = null;
  connect = vi.fn(); disconnect = vi.fn(); start = vi.fn(); stop = vi.fn();
}
class Context {
  static latest: Context;
  state = 'suspended'; currentTime = 1; sampleRate = 100; destination = {}; sources: Source[] = [];
  filters: ReturnType<typeof filterNode>[] = [];
  gains: ReturnType<typeof gainNode>[] = [];
  constructor() { Context.latest = this; }
  resume = vi.fn(async () => { this.state = 'running'; });
  decodeAudioData = vi.fn(async (bytes: ArrayBuffer) => ({ bytes, duration: 15 }));
  createBufferSource() { const s = new Source(); this.sources.push(s); return s; }
  createGain() { const g = gainNode(); this.gains.push(g); return g; }
  createBiquadFilter() { const f = filterNode(); this.filters.push(f); return f; }
  createBuffer(_channels: number, frames: number) { return { getChannelData: () => new Float32Array(frames) }; }
}
const flush = async () => { for (let i = 0; i < 100; i++) await Promise.resolve(); };
const response = () => ({ ok: true, arrayBuffer: async () => new ArrayBuffer(4) });
beforeEach(() => { vi.stubGlobal('AudioContext', Context); vi.stubGlobal('fetch', vi.fn(async () => response())); });
afterEach(() => vi.unstubAllGlobals());

describe('ordinary scene audio', () => {
  it('loads compressed revised cues, with WAV fallback when a codec is unavailable', async () => {
    const player = createAudioPlayer(vi.fn(), { edition: 'revised' }); await player.start();
    Context.latest.decodeAudioData.mockRejectedValueOnce(new Error('codec unavailable'));
    player.cue('v2-boathouse'); await flush();
    expect(fetch).toHaveBeenNthCalledWith(1, '/auditions/v2-boathouse.m4a');
    expect(fetch).toHaveBeenNthCalledWith(2, '/auditions/v2-boathouse.wav');
    expect(Context.latest.sources).toHaveLength(1);
  });
  it('uses acoustic lossless stems for revised confessions and ordinary missed motifs', async () => {
    const player = createAudioPlayer(vi.fn(), { edition: 'revised' }); await player.start();
    player.fragments(['priya']); await flush();
    expect(fetch).toHaveBeenCalledWith('/auditions/v2-ensemble-priya.wav');
    expect(player.snapshot().mix.sam).toBe(0);
    player.cue('v2-boathouse'); await flush(); player.detune('priya', -50); await flush();
    expect(fetch).toHaveBeenCalledWith('/auditions/v2-ensemble-priya-lowered.wav');
    expect(fetch).not.toHaveBeenCalledWith('/auditions/v2-ensemble-priya.m4a');
  });
  it('evicts decoded cues after a long session without interrupting the current source', async () => {
    const player = createAudioPlayer(vi.fn()); await player.start();
    for (let i = 0; i < 14; i++) { player.cue(`room-${i}`); await flush(); }
    expect(Context.latest.sources.at(-1)!.stop).not.toHaveBeenCalled();
    player.cue('room-0'); await flush();
    expect(vi.mocked(fetch).mock.calls.filter(([url]) => url === '/auditions/room-0.wav')).toHaveLength(2);
  });
  it('holds the same atmosphere across pages without restarting', async () => {
    const player = createAudioPlayer(vi.fn()); await player.start(); player.cue('v2-kettle'); await flush();
    player.cue('v2-kettle'); player.ambience('kettle'); player.ambience('kettle'); await flush();
    expect(Context.latest.sources).toHaveLength(2); // one music source and one room
    expect(Context.latest.sources[0]!.stop).not.toHaveBeenCalled();
  });
  it('lets a one-shot musical moment finish before the newest scene cue', async () => {
    const player = createAudioPlayer(vi.fn()); await player.start(); player.cue('foghorn-312'); await flush();
    const horn = Context.latest.sources[0]!;
    player.cue('v2-kettle'); player.cue('v2-room'); await flush();
    expect(Context.latest.sources).toHaveLength(1);
    horn.onended!(); await flush();
    expect(Context.latest.sources).toHaveLength(2);
    expect(fetch).toHaveBeenLastCalledWith('/auditions/v2-room.wav');
  });
  it('does not start stale A/B/A loads or revive music after explicit silence', async () => {
    const resolves: (() => void)[] = [];
    vi.stubGlobal('fetch', vi.fn(() => new Promise(resolve => resolves.push(() => resolve(response())))));
    const player = createAudioPlayer(vi.fn()); await player.start();
    player.cue('v2-kettle'); player.cue('v2-room'); player.cue('v2-kettle');
    resolves[0]!(); await flush(); expect(Context.latest.sources).toHaveLength(0);
    resolves[2]!(); await flush(); expect(Context.latest.sources).toHaveLength(1);
    player.stop(); resolves[1]!(); await flush();
    expect(Context.latest.sources).toHaveLength(1);
    expect(Context.latest.sources[0]!.stop).toHaveBeenCalled();
  });
  it('reports missing assets and leaves the reader able to continue', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => ({ ok: false, status: 404 })));
    const fallback = vi.fn(); const player = createAudioPlayer(fallback); await player.start();
    player.cue('v2-room'); await flush(); expect(fallback).toHaveBeenCalledWith('v2-room');
    expect(Context.latest.sources).toHaveLength(0);
  });
  it('plays missed-encounter tells during an ordinary cue and stops pending accents', async () => {
    const player = createAudioPlayer(vi.fn()); await player.start(); player.cue('v2-kettle'); await flush();
    player.detune('priya', -50); await flush();
    expect(Context.latest.sources).toHaveLength(2);
    expect(fetch).toHaveBeenCalledWith('/auditions/act3-ensemble-priya-lowered.wav');
    expect(Context.latest.sources[1]!.detune.value).toBe(0);
    player.stop(); expect(Context.latest.sources[1]!.stop).toHaveBeenCalled();
  });
  it('applies static to ordinary music and independently controls all buses', async () => {
    const player = createAudioPlayer(vi.fn());
    player.preferences({ ...DEFAULT_PREFERENCES, music: 0, ambience: 0, effects: 0, voice: 0 });
    await player.start(); player.cue('v2-room'); await flush(); player.static(60);
    const filter = Context.latest.filters.find(f => f.frequency.setTargetAtTime.mock.calls.length)!;
    expect(filter.frequency.setTargetAtTime).toHaveBeenCalledWith(18000 / 7, 1, 1);
    player.preferences({ ...DEFAULT_PREFERENCES, music: 0, ambience: .2, effects: .4, voice: .7 });
    const targets = Context.latest.gains.flatMap(g => g.gain.setTargetAtTime.mock.calls.map(c => c[0]));
    expect(targets).toEqual(expect.arrayContaining([0, .2, .4, .7]));
  });
  it('raises exactly the acquired keeper, including Priya as the first confession', async () => {
    const player = createAudioPlayer(vi.fn()); await player.start(); player.fragments(['priya']); await flush();
    const mix = player.snapshot().mix;
    expect(mix.priya).toBeGreaterThan(0); expect(mix.sam).toBe(0); expect(mix.dianne).toBe(0);
    player.fragments(['wade', 'priya']); await flush();
    expect(player.snapshot().mix.wade).toBeGreaterThan(0); expect(player.snapshot().mix.barb).toBe(0);
  });
  it('does not invent an interview fingerprint and never previews the sixth bar', async () => {
    const player = createAudioPlayer(vi.fn()); await player.start(); player.fingerprint({}); await flush();
    expect(fetch).not.toHaveBeenCalled();
    player.fingerprint({ 'n1:goodbye': 'door' }); await flush();
    expect(fetch).toHaveBeenCalledWith('/auditions/v2-fingerprint-door.wav');
    player.fingerprint({ 'n1:goodbye': 'door' }); await flush(); expect(fetch).toHaveBeenCalledTimes(1);
  });
});
