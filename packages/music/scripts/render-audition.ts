/**
 * Audition loop: render score data → auditions/*.wav for listening.
 * Usage: node packages/music/scripts/render-audition.ts
 */

import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { renderSong } from '../src/render.ts';
import { encodeWav } from '../src/wav.ts';
import { foghornSong } from '../scores/foghorn-song.ts';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const outDir = join(repoRoot, 'auditions');
mkdirSync(outDir, { recursive: true });

for (const song of [foghornSong]) {
  const buffer = renderSong(song);
  const wav = encodeWav(buffer);
  const outPath = join(outDir, `${song.id}.wav`);
  writeFileSync(outPath, wav);
  const seconds = (buffer.left.length / buffer.sampleRate).toFixed(1);
  console.log(`rendered ${outPath} (${seconds}s)`);
}
