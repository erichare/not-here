import { describe, expect, it } from 'vitest';
import { sampledAudioFile, SAMPLED_CUES, SAMPLED_ENSEMBLE_GAINS } from './soundtrack.ts';
import { cueCaption, cueLoops, UNKNOWN_CUE_CAPTION } from './captions.ts';

describe('sampled soundtrack contract', () => {
  it('catalogs all 26 revised cues with captions and stable recorded paths', () => {
    expect(Object.keys(SAMPLED_CUES)).toHaveLength(26);
    for (const [id, metadata] of Object.entries(SAMPLED_CUES)) {
      expect(sampledAudioFile(id)).toBe(`music/a-place-kept-v1/${id}.m4a`);
      expect(cueCaption(id)).toBe(metadata.caption);
      expect(cueCaption(id)).not.toBe(UNKNOWN_CUE_CAPTION);
    }
  });
  it('keeps one-shot nights and endings separate from looping places and title', () => {
    for (const id of ['v2-foghorn-312', 'v2-arrival', 'v2-sixth-open', 'v2-ash']) expect(cueLoops(id)).toBe(false);
    for (const id of ['v2-title', 'v2-horn-close', 'v2-room']) expect(cueLoops(id)).toBe(true);
  });
  it('allows only authored ensemble files and leaves original cues alone', () => {
    expect(sampledAudioFile('v2-ensemble-priya-lowered')).toBe('music/a-place-kept-v1/v2-ensemble-priya-lowered.wav');
    expect(sampledAudioFile('v2-ensemble-sea')).toBe('music/a-place-kept-v1/v2-ensemble-sea.wav');
    for (const name of ['title', 'foghorn-312', '../v2-title', 'v2-ensemble-sea-lowered', 'v2-ensemble-unknown']) expect(sampledAudioFile(name)).toBeUndefined();
    expect(Object.values(SAMPLED_ENSEMBLE_GAINS)).toEqual(Array(7).fill(1));
  });
});
