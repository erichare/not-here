/** Reproducible expansion masters. Ensemble WAVs keep exact sample timing. */
import { mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { renderSong } from '../src/render.ts';
import { encodeWav } from '../src/wav.ts';
import { ACOUSTIC_ENSEMBLE, PRODUCTION_SCORES } from '../scores/production.ts';
const directory = fileURLToPath(new URL('../../../auditions/', import.meta.url));
mkdirSync(directory, { recursive: true });
for (const song of PRODUCTION_SCORES) {
  const buffer = renderSong(song, 32000);
  // Matching the quiet opening; normalization must not turn every sparse cue loud.
  for (const channel of [buffer.left, buffer.right]) for (let i = 0; i < channel.length; i++) channel[i]! *= .62;
  writeFileSync(`${directory}${song.id}.wav`, encodeWav(buffer));
  console.log(`${song.id}: ${(buffer.left.length / buffer.sampleRate).toFixed(1)} seconds`);
}
for (const song of ACOUSTIC_ENSEMBLE) for (const lowered of [false, true]) {
  if (lowered && song.id.endsWith('-sea')) continue;
  const variant = { ...song, patterns: song.patterns.map(p => ({ ...p, notes: p.notes.map(n => ({ ...n, detune: (n.detune ?? 0) - (lowered ? 50 : 0) })) })) };
  const buffer = renderSong(variant, 32000);
  const samples = 15 * buffer.sampleRate;
  writeFileSync(`${directory}${song.id}${lowered ? '-lowered' : ''}.wav`, encodeWav({ ...buffer, left: buffer.left.slice(0, samples), right: buffer.right.slice(0, samples) }));
}
// Optional delivery encoding. WAV masters also support the CLI and codec fallback.
const ffmpeg = spawnSync('ffmpeg', ['-version'], { stdio: 'ignore' });
if (ffmpeg.status === 0) {
  let count = 0;
  for (const name of readdirSync(directory).filter(name => /^v2-(?!ensemble-)[a-z0-9-]+\.wav$/.test(name))) {
    const result = spawnSync('ffmpeg', ['-nostdin', '-hide_banner', '-loglevel', 'error', '-y', '-i', `${directory}${name}`, '-c:a', 'aac', '-b:a', '96k', '-movflags', '+faststart', `${directory}${name.replace(/\.wav$/, '.m4a')}`], { stdio: 'inherit' });
    if (result.status !== 0) throw new Error(`Could not encode ${name}`);
    count++;
  }
  console.log(`${count} AAC delivery copies; ensemble loops remain lossless WAV.`);
} else console.log('ffmpeg unavailable: using reproducible WAV delivery and captions.');
