import { describe, expect, it } from 'vitest';
import { verifySampledSoundtrack } from '../scripts/verify-sampled.ts';

describe('committed sampled soundtrack', () => {
  it('ships every routed recording with aligned, silent-sixth-bar stems and safe mixed headroom', () => {
    const result = verifySampledSoundtrack();
    expect(result.recordings).toBe(39);
    expect(result.ordinaryCues).toBe(26);
    expect(result.alignedStems).toBe(13);
    expect(result.worstCaseStemPeak).toBeLessThan(.71);
  });
});
