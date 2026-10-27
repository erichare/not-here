# A Place Kept — main-theme audition 01

A new, standalone melody for NOT HERE. This audition explores realistic acoustic
instruments and a recognizable theme before any game cues are replaced.

The starting direction is warm and wistful with an unsettled edge. The lead is a
sampled Yamaha grand piano. Fingerpicked acoustic guitar joins the second
statement. These are arranged instrument recordings, not a live ensemble take.

## Listen

- `main-theme-01.m4a`: compact stereo listening copy, AAC at 256 kbps.
- `main-theme-01.wav`: lossless stereo master, 48 kHz, 24-bit PCM.
- `main-theme-01.mid`: editable three-track composition with tempo changes.
- `score-and-render.json`: exact rendered note events, timing, source hashes,
  and technical measurements.

The MIDI preserves the notes and bar tempos. The audio also includes small
performance offsets, sample selection, damping, EQ, and room processing, so
playing the MIDI with a different instrument will not reproduce the master.

## Musical shape

| Time | Section |
| --- | --- |
| 0:00 | Brief piano introduction |
| 0:03 | Eight-bar main theme, piano alone |
| 0:29 | Theme one octave higher, with fingerpicked guitar |
| 0:55 | Return to the original register, then a slower closing phrase |
| 1:22 | Short piano coda and decay |

The theme is in D minor, in 4/4. Its opening rising third and held arrival recur
with a higher answer. The E naturals over B-flat and G minor supply a little
tension; the closing C-sharp leads back to D. The final chord leaves an open ninth.
The melody is new; it does not adapt the existing Foghorn Song.

Listen for whether the opening phrase stays in mind, whether the piano and guitar
feel right for Lorn Bay, and whether the higher second statement is too bright.
The creator approved this direction and recording on October 27, 2026. It now
serves as the revised edition's main theme; see `design/soundtrack-a-place-kept.md`
for the full score built around it.

## Sound sources

The renderer reads these existing local Logic libraries in place:

- Yamaha Grand Piano: soft and medium sampled dynamics, stereo recordings.
- Alchemy Acoustic Guitar 2 Finger RR: four alternate recorded takes per sampled
  pitch. The arrangement alternates those takes.
- Space Designer `1.6s_Small Hall.SDIR`: a restrained shared room response.

Original instrument samples are 44.1 kHz/16-bit. Processing and export run at
48 kHz, and the WAV uses 24-bit PCM to retain the processed result. The higher
export resolution does not add detail to the source recordings. No raw library
samples are included in this folder. Rendering on another machine requires the
same installed libraries; no libraries are downloaded by the script.

## Reproduce

From the repository root, use Python with the packages in `requirements.txt`:

```sh
python auditions/main-theme-01/render.py
ffmpeg -nostdin -hide_banner -loglevel error -y \
  -i auditions/main-theme-01/main-theme-01.wav \
  -c:a aac -b:a 256k -movflags +faststart \
  auditions/main-theme-01/main-theme-01.m4a
```

The renderer writes only this audition folder. It does not change game score
data, audio routing, existing cues, or the normal audio build.

## Verification

The successful render checks four beats in each theme bar, finite samples, no
clipping, and at most two semitones of transposition from an instrument sample.
It produces 261 note events and a 90.87-second master. `verification.json` records
checks of the final WAV, decoded AAC, and MIDI. `loudness.txt` contains FFmpeg's
measurement of the final master.

Observed result: **10/10 technical checks passed**, including unclipped WAV and
decoded AAC, a quiet ending, 261 balanced MIDI note-on/note-off pairs, and matching
delivery duration. Master loudness is **-19.7 LUFS**, true peak **-1.79 dBTP**, with
an **8.4 LU** loudness range. The creator subsequently approved this main theme.

Commands used for the local render and checks:

```sh
/private/tmp/not-here-audition-venv/bin/python auditions/main-theme-01/render.py
/opt/homebrew/bin/ffmpeg -nostdin -hide_banner -loglevel error -y \
  -i auditions/main-theme-01/main-theme-01.wav \
  -c:a aac -b:a 256k -movflags +faststart \
  auditions/main-theme-01/main-theme-01.m4a
/opt/homebrew/bin/ffmpeg -nostdin -hide_banner \
  -i auditions/main-theme-01/main-theme-01.wav \
  -af loudnorm=I=-18:TP=-1:LRA=11:print_format=json -f null - \
  2> auditions/main-theme-01/loudness.txt
```

The loudness command measures the master without overwriting it. The music keeps
its phrase dynamics; the renderer uses a single peak gain rather than a limiter.
Automated checks and code review do not establish listening approval.
