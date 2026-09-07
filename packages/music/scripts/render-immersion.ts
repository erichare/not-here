import { mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { renderSong } from '../src/render.ts';
import { encodeWav } from '../src/wav.ts';
import { IMMERSION_SCORES } from '../scores/immersion.ts';
const directory = fileURLToPath(new URL('../../../auditions/', import.meta.url));
mkdirSync(directory, { recursive: true });
for (const song of IMMERSION_SCORES) {
  const buffer = renderSong(song, 32000);
  writeFileSync(`${directory}${song.id}.wav`, encodeWav(buffer));
  console.log(`${song.id}: ${(buffer.left.length / buffer.sampleRate).toFixed(1)} seconds`);
}
