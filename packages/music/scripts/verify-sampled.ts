/** Validate distributable recordings without Python, codecs, or sample libraries. */
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ACT3_FRAGMENT_ORDER } from '../scores/act3-ensemble.ts';
import {
  SAMPLED_CUES, SAMPLED_ENSEMBLE_FRAMES, SAMPLED_ENSEMBLE_SECONDS,
  SAMPLED_SOUNDTRACK_DIRECTORY, sampledAudioFile, TITLE_REVEAL_SECONDS,
} from '../src/soundtrack.ts';

interface Recording {
  id: string; file: string; frames: number; channels: number; sampleRate: number;
  seconds: number; loop: boolean; sha256: string; bytes: number;
}
interface Manifest {
  version: string; approvedThemeSha256: string; menuRevealSeconds: number;
  ensembleFrames: number; cues: Recording[];
}

const directory = fileURLToPath(new URL(`../../../apps/web/public/${SAMPLED_SOUNDTRACK_DIRECTORY}/`, import.meta.url));

function pcm16(buffer: Buffer): { data: Buffer; channels: number; sampleRate: number } {
  assert.equal(buffer.toString('ascii', 0, 4), 'RIFF');
  assert.equal(buffer.toString('ascii', 8, 12), 'WAVE');
  let data: Buffer | undefined;
  let channels = 0;
  let sampleRate = 0;
  for (let offset = 12; offset + 8 <= buffer.length;) {
    const size = buffer.readUInt32LE(offset + 4);
    assert.ok(offset + 8 + size <= buffer.length, 'WAV chunk exceeds file');
    const tag = buffer.toString('ascii', offset, offset + 4);
    if (tag === 'fmt ') {
      assert.ok(size >= 16);
      assert.equal(buffer.readUInt16LE(offset + 8), 1, 'stems use linear PCM');
      channels = buffer.readUInt16LE(offset + 10);
      sampleRate = buffer.readUInt32LE(offset + 12);
      assert.equal(buffer.readUInt16LE(offset + 22), 16, 'stems use 16 bits');
    }
    if (tag === 'data') data = buffer.subarray(offset + 8, offset + 8 + size);
    offset += 8 + size + size % 2;
  }
  assert.ok(data && channels > 0 && sampleRate > 0, 'WAV requires format and data');
  return { data, channels, sampleRate };
}

export function verifySampledSoundtrack() {
  const manifest = JSON.parse(readFileSync(resolve(directory, 'manifest.json'), 'utf8')) as Manifest;
  const layers = ['sea', ...ACT3_FRAGMENT_ORDER];
  const expected = [...Object.keys(SAMPLED_CUES), ...layers.flatMap(layer => [
    `v2-ensemble-${layer}`, ...(layer === 'sea' ? [] : [`v2-ensemble-${layer}-lowered`]),
  ])];
  assert.equal(manifest.version, 'a-place-kept-v1');
  assert.ok(Math.abs(manifest.menuRevealSeconds - TITLE_REVEAL_SECONDS) < .000001);
  assert.equal(manifest.ensembleFrames, SAMPLED_ENSEMBLE_FRAMES);
  assert.deepEqual(manifest.cues.map(cue => cue.id).sort(), [...expected].sort());
  assert.deepEqual(readdirSync(directory).filter(name => /\.(m4a|wav)$/.test(name)).sort(),
    manifest.cues.map(cue => cue.file).sort(), 'no missing or orphaned distribution files');
  const stems = new Map<string, Buffer>();
  let bytes = 0;
  for (const cue of manifest.cues) {
    assert.match(cue.file, /^v2-[a-z0-9-]+\.(m4a|wav)$/);
    assert.equal(sampledAudioFile(cue.id), `${SAMPLED_SOUNDTRACK_DIRECTORY}/${cue.file}`);
    const buffer = readFileSync(resolve(directory, cue.file));
    assert.equal(buffer.length, cue.bytes, cue.id);
    assert.equal(createHash('sha256').update(buffer).digest('hex'), cue.sha256, cue.id);
    assert.equal(cue.sampleRate, 48_000);
    assert.ok(Math.abs(cue.frames / cue.sampleRate - cue.seconds) < .000001);
    bytes += buffer.length;
    if (cue.id === 'v2-title') assert.equal(cue.sha256, manifest.approvedThemeSha256);
    if (SAMPLED_CUES[cue.id]) assert.equal(cue.loop, SAMPLED_CUES[cue.id]!.loop);
    if (cue.file.endsWith('.wav')) {
      const pcm = pcm16(buffer);
      assert.equal(pcm.channels, 1, cue.id);
      assert.equal(cue.channels, 1, cue.id);
      assert.equal(pcm.sampleRate, 48_000);
      assert.equal(pcm.data.length / 2, SAMPLED_ENSEMBLE_FRAMES);
      assert.equal(cue.seconds, SAMPLED_ENSEMBLE_SECONDS);
      assert.ok(pcm.data.subarray(16 * 48_000 * 2).every(value => value === 0), `${cue.id}: sixth bar must be silent`);
      stems.set(cue.id, pcm.data);
    }
  }
  let largestPossibleSample = 0;
  for (let index = 0; index < SAMPLED_ENSEMBLE_FRAMES; index++) {
    let bound = 0;
    for (const layer of layers) {
      const normal = stems.get(`v2-ensemble-${layer}`)!;
      const lowered = stems.get(`v2-ensemble-${layer}-lowered`) ?? normal;
      bound += Math.max(Math.abs(normal.readInt16LE(index * 2)), Math.abs(lowered.readInt16LE(index * 2)));
    }
    largestPossibleSample = Math.max(largestPossibleSample, bound);
  }
  assert.ok(largestPossibleSample < 32767, 'every combination of normal/lowered stems has headroom at unity gain');
  return { recordings: manifest.cues.length, ordinaryCues: Object.keys(SAMPLED_CUES).length,
    alignedStems: stems.size, bytes, worstCaseStemPeak: largestPossibleSample / 32768 };
}

if (resolve(process.argv[1] ?? '') === fileURLToPath(import.meta.url)) {
  console.log(JSON.stringify(verifySampledSoundtrack(), null, 2));
}
