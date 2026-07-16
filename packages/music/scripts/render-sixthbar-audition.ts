/**
 * Render the sixth-bar candidate variants → auditions/sixthbar-*.wav.
 * Audition material only (design/act3-plan.md §Cues — nothing ships unheard).
 * Usage: node packages/music/scripts/render-sixthbar-audition.ts
 */

import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { renderSong } from '../src/render.ts';
import { encodeWav } from '../src/wav.ts';
import { SIXTHBAR_AUDITION } from '../scores/sixthbar-candidates.ts';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const outDir = join(repoRoot, 'auditions');
mkdirSync(outDir, { recursive: true });

for (const song of SIXTHBAR_AUDITION) {
  const buffer = renderSong(song);
  const wav = encodeWav(buffer);
  const outPath = join(outDir, `${song.id}.wav`);
  writeFileSync(outPath, wav);
  const seconds = (buffer.left.length / buffer.sampleRate).toFixed(1);
  console.log(`rendered ${outPath} (${seconds}s)`);
}
