import { describe, expect, it } from 'vitest';
import { firstMeetingSketch } from './sketches.ts';

describe('mystery-safe first-meeting sketches', () => {
  it('does not identify the horn operator on Night 1', () => {
    expect(firstMeetingSketch('n1-312')).toBeNull();
  });

  it('introduces Wade only when the player meets him at the wharf', () => {
    expect(firstMeetingSketch('d4-wharf')).toContain('<svg');
  });
});
