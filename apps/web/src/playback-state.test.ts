import { expect, it } from 'vitest';
import { EMPTY_PLAYBACK, playbackEvents, readPlayback, rememberPlayback } from './playback-state.ts';

it('restores an inherited cue after pages with no new musical instruction', () => {
  let state = rememberPlayback(EMPTY_PLAYBACK, [{ kind: 'music.cue', cue: 'v2-room' }, { kind: 'music.static', amount: 40 }]);
  state = rememberPlayback(state, []);
  const loaded = readPlayback(JSON.stringify({ sceneId: 'd3-room-2', events: playbackEvents(state) }), 'd3-room-2');
  expect(loaded).toEqual(state);
  expect(readPlayback(JSON.stringify({ sceneId: 'd3-room-2', events: playbackEvents(state) }), 'n1-beach')).toBeNull();
});
it('restores silence and exact fragment identities without replaying a stinger', () => {
  const fragments = rememberPlayback(EMPTY_PLAYBACK, [{ kind: 'music.fragments', characters: ['priya', 'tam'] }, { kind: 'music.stinger', cue: 'one-time' }]);
  expect(playbackEvents(fragments)).toEqual([{ kind: 'music.fragments', characters: ['priya', 'tam'] }, { kind: 'music.static', amount: 0 }]);
  expect(playbackEvents(rememberPlayback(fragments, [{ kind: 'music.stop' }]))).toEqual([{ kind: 'music.stop' }, { kind: 'music.static', amount: 0 }]);
});
it.each(['null', '{', '{"sceneId":"x","events":[{"kind":"music.cue","cue":"../../secret"}]}'])('rejects invalid saved playback %s', raw => expect(readPlayback(raw, 'x')).toBeNull());
