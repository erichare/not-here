import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { CHARACTERS } from '@not-here/engine';
import { PORTRAITS, portraitFor } from './portraits.ts';

describe('painted character portraits', () => {
  it('ships a distinct painting for every character in the scene presentation', () => {
    expect(Object.keys(PORTRAITS).sort()).toEqual([...CHARACTERS, 'wren'].sort());
    expect(new Set(Object.values(PORTRAITS).map(portrait => portrait.src)).size).toBe(7);
    for (const portrait of Object.values(PORTRAITS)) {
      const asset = fileURLToPath(new URL(`../public${portrait.src}`, import.meta.url));
      expect(existsSync(asset), portrait.src).toBe(true);
    }
  });

  it('returns Wren only when the scene explicitly presents Wren', () => {
    expect(portraitFor('wren')).toBe(PORTRAITS.wren);
    for (const character of CHARACTERS) {
      expect(portraitFor(character)).toBe(PORTRAITS[character]);
      expect(portraitFor(character)).not.toBe(PORTRAITS.wren);
    }
  });

  it.each([undefined, '', 'unknown', 'constructor', '__proto__', 'toString'])(
    'has no fallback portrait for %s',
    character => {
      expect(portraitFor(character)).toBeNull();
    },
  );
});
