/**
 * Act 3 ensemble audition render: score data → auditions/act3-ensemble-*.wav
 *
 * Two products:
 *   1. Per-layer loops (act3-ensemble-sea/sam/dianne/barb/priya/tam/wade.wav)
 *      — every layer trimmed to exactly one verse with an end→start crossfade,
 *      so all layers share a sample-exact duration and loop in sync when the
 *      runtime mixers (web GainNodes, CLI afplay set) stack them.
 *   2. act3-ensemble-progression.wav — the chord 0→6 reel: one verse per
 *      stage, fragments entering in cascade order (sam → dianne → barb →
 *      priya → tam → wade), for the audition session (plan §Cues item 2).
 * Also writes act3-ensemble.wav, the full chord-6 mix as a seamless loop.
 *
 * Usage: node packages/music/scripts/render-act3-ensemble.ts
 */

import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { renderSong, type StereoBuffer } from '../src/render.ts';
import { encodeWav } from '../src/wav.ts';
import type { Song } from '../src/types.ts';
import {
  ACT3_ENSEMBLE_BEATS,
  ACT3_ENSEMBLE_BPM,
  ACT3_ENSEMBLE_LAYERS,
  ACT3_FRAGMENT_ORDER,
  act3EnsembleAtChord,
  act3EnsembleFull,
} from '../scores/act3-ensemble.ts';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const outDir = join(repoRoot, 'auditions');
mkdirSync(outDir, { recursive: true });

const SAMPLE_RATE = 44100;
const verseSamples = Math.ceil((ACT3_ENSEMBLE_BEATS * 60) / ACT3_ENSEMBLE_BPM * SAMPLE_RATE);

/** Trim/pad to exactly one verse, blending the tail into the head so the
 * loop point is seamless (releases that would overrun the verse wrap). */
const toLoop = (buffer: StereoBuffer): StereoBuffer => {
  const XFADE = 4096;
  const left = new Float32Array(verseSamples);
  const right = new Float32Array(verseSamples);
  for (let i = 0; i < verseSamples; i++) {
    left[i] = buffer.left[i] ?? 0;
    right[i] = buffer.right[i] ?? 0;
  }
  // Wrap the overrun (samples past the verse) back onto the head.
  for (let i = verseSamples; i < buffer.left.length; i++) {
    const j = i - verseSamples;
    if (j >= verseSamples) break;
    left[j] = (left[j] ?? 0) + (buffer.left[i] ?? 0);
    right[j] = (right[j] ?? 0) + (buffer.right[i] ?? 0);
  }
  // Equal-power crossfade across the seam to hide any residual click.
  for (let i = 0; i < XFADE; i++) {
    const t = i / XFADE;
    const head = Math.sin((t * Math.PI) / 2);
    const tail = Math.cos((t * Math.PI) / 2);
    const li = (left[i] ?? 0) * head + (left[verseSamples - XFADE + i] ?? 0) * tail;
    const ri = (right[i] ?? 0) * head + (right[verseSamples - XFADE + i] ?? 0) * tail;
    left[i] = li;
    right[i] = ri;
  }
  return { left, right, sampleRate: buffer.sampleRate };
};

const write = (song: Song, buffer: StereoBuffer): void => {
  const outPath = join(outDir, `${song.id}.wav`);
  writeFileSync(outPath, encodeWav(buffer));
  const seconds = (buffer.left.length / buffer.sampleRate).toFixed(2);
  console.log(`rendered ${outPath} (${seconds}s)`);
};

// 1. Per-layer loops.
for (const layer of ACT3_ENSEMBLE_LAYERS) {
  write(layer, toLoop(renderSong(layer, SAMPLE_RATE)));
}

// 2. The full chord-6 mix as a loop.
write(act3EnsembleFull, toLoop(renderSong(act3EnsembleFull, SAMPLE_RATE)));

// 3. The progression reel: chord 0 → 6, one verse per stage, 1s crossfades.
const stages: StereoBuffer[] = [];
for (let chord = 0; chord <= ACT3_FRAGMENT_ORDER.length; chord++) {
  stages.push(renderSong(act3EnsembleAtChord(chord), SAMPLE_RATE));
}
const reelXfade = SAMPLE_RATE; // 1s
const reelLength = verseSamples * stages.length;
const reelLeft = new Float32Array(reelLength);
const reelRight = new Float32Array(reelLength);
stages.forEach((stage, si) => {
  const offset = si * verseSamples;
  for (let i = 0; i < verseSamples; i++) {
    let l = stage.left[i] ?? 0;
    let r = stage.right[i] ?? 0;
    if (si > 0 && i < reelXfade) {
      const t = i / reelXfade;
      const prev = stages[si - 1];
      l = l * t + (prev?.left[i] ?? 0) * (1 - t);
      r = r * t + (prev?.right[i] ?? 0) * (1 - t);
    }
    reelLeft[offset + i] = l;
    reelRight[offset + i] = r;
  }
});
write(
  { id: 'act3-ensemble-progression', bpm: ACT3_ENSEMBLE_BPM, lengthBeats: 0, patterns: [] },
  { left: reelLeft, right: reelRight, sampleRate: SAMPLE_RATE },
);
