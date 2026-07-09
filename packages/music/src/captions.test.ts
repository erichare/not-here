import { describe, expect, it } from 'vitest';
import { ACT1_CUES } from '../scores/cues-act1.ts';
import {
  cueDianneTheme,
  cueFoghorn312,
  cuePubWarm,
  cueShingle,
} from '../scores/cues.ts';
import { foghornSong } from '../scores/foghorn-song.ts';
import { CUE_META, cueCaption, cueLoops, UNKNOWN_CUE_CAPTION } from './captions.ts';

const COMPOSED = [
  foghornSong,
  cueShingle,
  cuePubWarm,
  cueDianneTheme,
  cueFoghorn312,
  ...ACT1_CUES,
];

describe('cue captions', () => {
  it('covers every composed cue', () => {
    for (const song of COMPOSED) {
      expect(CUE_META[song.id], `no caption for '${song.id}'`).toBeDefined();
    }
  });

  it('never lets a cue id leak through its own caption', () => {
    for (const [id, meta] of Object.entries(CUE_META)) {
      expect(meta.caption.toLowerCase()).not.toContain(id.toLowerCase());
      // Captions read as prose, not slugs: no kebab-case identifiers.
      expect(meta.caption).not.toMatch(/[a-z0-9]+(?:-[a-z0-9]+){1,}/);
    }
  });

  it('is total — unknown cues get the generic line, never the id', () => {
    expect(cueCaption('some-internal-slug')).toBe(UNKNOWN_CUE_CAPTION);
    expect(cueCaption('some-internal-slug')).not.toContain('slug');
  });

  it('the nightly horn is one-shot; the close call and ambient cues loop', () => {
    expect(cueLoops('foghorn-312')).toBe(false);
    expect(cueLoops('horn-close')).toBe(true);
    expect(cueLoops('pub-warm')).toBe(true);
    expect(cueLoops('wrens-room')).toBe(true);
    // Unknown cues default to ambient looping.
    expect(cueLoops('some-internal-slug')).toBe(true);
  });
});
