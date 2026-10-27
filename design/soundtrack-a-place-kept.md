# A Place Kept — soundtrack and opening

The creator approved the first main-theme audition on October 27, 2026, then
asked to rebuild the soundtrack around its realistic instruments and warm,
wistful mood with an unsettling undertone. The approved recording is now the
revised edition's main theme. Its distributed AAC file is byte-for-byte identical
to the audition.

## Opening

“Begin with sound” starts the main theme and opens the painted shoreline. The
main menu enters on the first held A in the melody, **4.945333 seconds after the
audio starts**. The cue uses the audio clock, so download time does not shift the
entrance. The title arrives first; the menu and supporting text follow the note.

Skip and Escape reveal the menu immediately. Muted music and reduced motion
bypass the timed opening. Audio failure also reveals the menu. A separate
remembered-phrase button remains available after the interview, and choosing a
story page cancels any pending intro callback. The preserved original edition
keeps its existing title and music.

## The score

The revised edition includes **26 complete cues and 13 synchronized character
stems**. Piano and fingerpicked guitar carry the music; recorded wooden
percussion supplies Tam's pulse. These are arrangements of recorded instrument
samples, not live ensemble performances. The environmental sound system remains
separate from the score.

The full theme has eight bars. The story's call uses its first five melodic bars,
then leaves the sixth empty. This preserves the chart, nightly call, and the
player's final answer without rewriting their meaning. In this arrangement, a
bar has four quarter notes; the call runs at 75 BPM.

| Character | Musical identity |
| --- | --- |
| Dianne | The opening two bars, close on guitar |
| Wade | The third bar, including the falling C–A third, in a low piano register |
| Priya | The fourth-bar turn; the clinic inverts it and the returned fragment restores it |
| Sam | The fifth-bar rising run, brighter and quicker on guitar |
| Barb | The harmony and bass, without claiming a melodic fragment |
| Tam | Recorded wooden taps beneath the shared pulse |

Locations generally run 51–77 seconds. They quote selected fragments with space
between statements instead of repeating the entire title melody. The Kettle is
warm and harmonic; the motel's pickup stops before its arrival; the clinic turns
the phrase the wrong way; the boathouse is more rhythmically active. Endings have
distinct arrangements and finish once. Ash removes the voices and leaves
silence; Unwitnessed retains its intentional silence.

The room-without-lullaby cue uses the **same accompaniment, timeline, and gain**
as the room cue, with Dianne's melody removed. It is not normalized back up.
The two-note interview fingerprints retain their separate pitch/rhythm identities.
The two sixth-bar answers remain distinct.

All ensemble stems and their quarter-tone alternatives contain exactly
**921,600 mono frames at 48 kHz: 19.2 seconds**. The last 3.2 seconds are completely
silent. A shared gain preserves the balance between voices; every possible
normal/lowered combination fits below full scale at unity playback gain.

## Files and reproduction

- `apps/web/public/music/a-place-kept-v1/`: committed playback assets and manifest.
- `packages/music/src/soundtrack.ts`: shared cue paths, captions, loop policy,
  and ensemble calibration.
- `packages/music/scripts/render-sampled.py`: authored arrangements and local
  sample rendering, reusing the approved audition's theme and sample reader.
- `auditions/soundtrack-a-place-kept-v1/score.json`: rendered note data.
- `auditions/soundtrack-a-place-kept-v1/*.wav`: local lossless masters, ignored by Git.
- `apps/web/public/art-review.html`: updated listening room, including the main theme.

Normal builds use the committed recordings. They do not require Python, Logic,
instrument libraries, credentials, or an external music service. Original-edition
audio still renders through its existing command. Old revised synthetic renders
are excluded from the browser bundle.

To regenerate the sampled score locally, install the dependencies from
`auditions/main-theme-01/requirements.txt` into a virtual environment, activate it,
and run `pnpm render:sampled`. The installed Yamaha grand, Alchemy fingerstyle
guitar, Space Designer small hall, and wooden knock sample are required. The
renderer reads them in place and distributes only the mixed compositions.
`pnpm verify:soundtrack` checks the packaged recordings without those libraries.

Playback cues use 256 kbps AAC. Ensemble stems use lossless 16-bit mono WAV to
keep exact phase and reduce decoded memory. The complete playback pack is
**54,538,214 bytes**. Lossless local masters use 48 kHz/24-bit PCM; most original
instrument samples are 44.1 kHz/16-bit.

## Verification observed

The following commands used the bundled Node runtime on `PATH`:

```sh
node node_modules/vitest/vitest.mjs run
# 1,185 tests passed across 66 files.

node node_modules/typescript/bin/tsc --noEmit -p apps/web/tsconfig.json
node node_modules/typescript/bin/tsc --noEmit -p apps/cli/tsconfig.json
node node_modules/typescript/bin/tsc --noEmit -p packages/music/tsconfig.json
node node_modules/typescript/bin/tsc --noEmit -p packages/story/tsconfig.json
# All four type checks passed.

node packages/music/scripts/verify-sampled.ts
# 39 recordings; 26 cues; 13 aligned stems; all hashes and paths match.
# Every normal/lowered combination has a peak bound of 0.699981689453125.

/private/tmp/not-here-audition-venv/bin/python packages/music/scripts/render-sampled.py
# Rendered the complete pack from the installed samples.

node packages/music/scripts/render-all.ts
# Original-edition audio regeneration passed.

# From apps/web:
node node_modules/vite/bin/vite.js build
# Production build passed. All 39 emitted recordings match their source hashes;
# obsolete revised synth assets are absent and the original title is retained.
```

All 26 AAC cues were decoded with FFmpeg and checked for finite samples, no
clipping, and duration within one codec frame. The title's AAC bytes match the
approved audition. The ordinary build's original-audio render completed without
changing the sampled pack. Detailed decode measurements are in
`auditions/soundtrack-a-place-kept-v1/decoded-audio-check.json`.

The initial full-suite invocation lacked `node` on child-process `PATH`; 17 CLI
tests could not start. Rerunning with the bundled runtime on `PATH` passed the
entire suite. The bundled fallback pnpm attempted dependency installation and
stopped before altering the dependency directory, so verification invoked the
project's installed test/build tools directly.

The browser opening was checked through ready, playing, and menu states. The
menu was absent from the accessibility tree before its cue, and focus moved to
the main action after reveal. Skip and saved reduced-motion behavior were also
checked. These checks establish behavior, not a human listening verdict for
every new arrangement. No production deployment was performed.

Complementary Chromium checks covered immediate skip, the 390-pixel-wide menu
without horizontal overflow, title playback followed by the new shore cue, and
the updated listening room. The original edition has regression-test and HTTP
coverage; a separate full browser playthrough was not performed.

The development server on port 5181 started midway through audio rendering and
retained a stale public-file list. The final preview therefore serves the finished
production build at **http://127.0.0.1:5182/**. All 39 recordings on that server
were checked for audio content type, exact byte size, and matching SHA-256 hash;
the manifest is valid JSON. This avoids treating an HTML fallback with status 200
as a successfully served recording.
