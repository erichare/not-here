"""Standalone sampled-instrument audition; does not change game playback.

Requires the locally installed Logic Yamaha piano, Alchemy fingerstyle guitar,
and Space Designer room response. No Apple sample files are copied to outputs.
"""

from __future__ import annotations

import hashlib
import json
import math
import re
import struct
from fractions import Fraction
from functools import lru_cache
from pathlib import Path

import mido
import numpy as np
import soundfile as sf
from scipy.signal import butter, fftconvolve, resample_poly, sosfilt

OUT = Path(__file__).resolve().parent
PIANO = Path('/Library/Application Support/Logic/EXS Factory Samples/01 Acoustic Pianos/Yamaha Grand Piano')
GUITAR = Path('/Library/Application Support/Logic/Alchemy Samples/Guitars/Acoustic Guitars/Acoustic Guitar 2 Finger RR')
ROOM = Path('/Library/Audio/Impulse Responses/Apple/02 Medium Spaces/02 Halls/1.6s_Small Hall.SDIR')
SR = 48000

# Quarter-note durations; each bar is four beats. None represents a rest.
THEME = [
    [(None, .5), (62, .5), (65, 1), (69, 1.5), (67, .5)],
    [(64, 1), (65, .5), (64, .5), (62, 1.5), (None, .5)],
    [(None, .5), (62, .5), (65, 1), (72, 1.5), (69, .5)],
    [(67, 1), (64, .5), (67, .5), (69, 1.5), (None, .5)],
    [(69, .5), (72, .5), (74, 1.5), (72, .5), (69, 1)],
    [(67, 1.5), (64, .5), (65, 1), (69, 1)],
    [(64, 1), (65, .5), (64, .5), (61, 1), (64, 1)],
    [(62, 3), (None, 1)],
]
HARMONY = [
    ('Dm(add9)', 38, [50, 57, 64, 65]),
    ('Bbmaj7', 34, [50, 53, 57, 62]),
    ('Fmaj7/A', 33, [48, 53, 57, 64]),
    ('C6/G', 31, [48, 52, 57, 60]),
    ('Bbmaj7', 34, [50, 53, 57, 62]),
    ('Gm6', 43, [50, 55, 58, 64]),
    ('A7(b13)', 33, [49, 55, 57, 65]),
    ('Dm(add9)', 38, [50, 57, 62, 64]),
]
# Written phrase pacing rather than timing jitter: intro, three statements, coda.
TEMPOS = [72] + [75, 74, 76, 73, 77, 75, 73, 69] + [
    76, 75, 77, 74, 78, 76, 73, 70
] + [74, 73, 75, 72, 76, 72, 68, 63] + [60]
BAR_TIMES = np.concatenate(([0.0], np.cumsum([240 / t for t in TEMPOS])))
EVENTS: list[dict] = []
USED: set[Path] = set()
TRANSPOSITIONS: list[float] = []


def seconds(beat: float) -> float:
    bar = min(int(beat // 4), len(TEMPOS) - 1)
    return float(BAR_TIMES[bar] + (beat - bar * 4) * 60 / TEMPOS[bar])


def note(track: str, bar: int, beat: float, pitch: int, duration: float,
         velocity: int, gain: float, delay: float = 0.0) -> None:
    start = bar * 4 + beat
    # Piano damping follows harmonic pedal changes; no cross-chord wash.
    release = max(start + duration, (bar + 1) * 4 - .10) if track == 'piano_support' else start + duration
    EVENTS.append(dict(track=track, beat=start, end_beat=release, pitch=pitch,
                       velocity=velocity, gain=gain, delay=delay,
                       start=seconds(start) + delay,
                       hold=seconds(release) - seconds(start)))


def compose() -> None:
    note('piano_support', 0, 0, 38, 3.8, 43, .34)
    for i, p in enumerate([57, 64, 65]):
        note('piano_support', 0, .25 + i * .12, p, 3.2, 38 + i, .20)
    for statement in range(3):
        for b, melody in enumerate(THEME):
            bar = 1 + statement * 8 + b
            _, bass, chord = HARMONY[b]
            lift = [0, 3, -1][statement] + [0, -3, 1, -2, 6, 2, -1, -6][b]
            cursor = 0.0
            for index, (pitch, duration) in enumerate(melody):
                if pitch is not None:
                    # The middle statement opens in a higher register. The last
                    # returns to the original register and broadens at its crest.
                    octave = 12 if statement == 1 else 0
                    velocity = 65 + lift + (4 if duration >= 1.5 else -5 if duration == .5 else 0)
                    note('piano_lead', bar, cursor, pitch + octave, duration * .93,
                         velocity, .69, delay=.012 if duration >= 1 else .004)
                    if statement == 2 and b == 4 and duration >= 1:
                        note('piano_support', bar, cursor, pitch - 12, duration,
                             49, .24, delay=.018)
                cursor += duration
            note('piano_support', bar, 0, bass, 3.85,
                 45 + min(lift, 3), .38)
            if statement == 0:
                # Leave the hook exposed; harmony enters between its gestures.
                for i, p in enumerate(chord[:3]):
                    note('piano_support', bar, 1.06, p, 2.6, 38 + i, .23,
                         delay=i * .021)
                if b in (2, 4, 5):
                    note('piano_support', bar, 3.05, chord[1], .8, 36, .19)
            else:
                # Finger positions remain close; four sample takes alternate.
                pattern = [(0, 0), (.76, 1), (1.48, 2), (2.05, 3), (2.77, 1), (3.48, 2)]
                if statement == 2 and b >= 6:
                    pattern = [(0, 0), (.76, 1), (1.48, 2)]
                for j, (when, degree) in enumerate(pattern):
                    note('guitar', bar, when, chord[degree], min(2.0, 4 - when),
                         53 + (j % 3) * 3 + min(lift, 4), .31,
                         delay=[.0, .011, -.007, .008][j % 4])
                if b in (0, 2, 4, 7):
                    for i, p in enumerate(chord[1:3]):
                        note('piano_support', bar, 2.1, p, 1.7, 36, .19,
                             delay=i * .026)
    for i, p in enumerate([38, 50, 57, 64]):
        note('piano_support', 25, .08 * i, p, 3.6 - .08 * i, 34 + i, .25)
    note('piano_lead', 25, .7, 62, 3.0, 43, .46)


def wav_root(path: Path) -> int:
    data = path.read_bytes()
    if data[:4] != b'RIFF' or data[8:12] != b'WAVE':
        raise ValueError(f'Not a RIFF WAV: {path}')
    pos = 12
    while pos + 8 <= len(data):
        tag, size = struct.unpack_from('<4sI', data, pos)
        if tag == b'smpl' and size >= 36:
            return struct.unpack_from('<I', data, pos + 8 + 12)[0]
        pos += 8 + size + size % 2
    raise ValueError(f'Missing sample root: {path}')


@lru_cache(maxsize=192)
def pitched(path: Path, root: int, target: int) -> np.ndarray:
    USED.add(path)
    TRANSPOSITIONS.append(abs(target - root))
    data, rate = sf.read(path, dtype='float64', always_2d=True)
    ratio = Fraction(SR / (rate * 2 ** ((target - root) / 12))).limit_denominator(2048)
    return resample_poly(data, ratio.numerator, ratio.denominator, axis=0)


def sample_maps() -> tuple[dict[str, dict[int, Path]], dict[int, list[Path]]]:
    piano: dict[str, dict[int, Path]] = {'S': {}, 'M': {}}
    for path in sorted(PIANO.glob('*KM56_*.wav')):
        match = re.fullmatch(r'(\d{3})_.+KM56_([SM])\.wav', path.name)
        if match:
            piano[match[2]][int(match[1])] = path
    guitar: dict[int, list[Path]] = {}
    for path in sorted(GUITAR.glob('*.wav')):
        guitar.setdefault(wav_root(path), []).append(path)
    if not piano['S'] or not piano['M'] or not guitar or not ROOM.is_file():
        raise FileNotFoundError('Install the required Logic instrument libraries before rendering.')
    return piano, guitar


def write_midi() -> None:
    midi = mido.MidiFile(ticks_per_beat=960)
    tempo_track = mido.MidiTrack()
    midi.tracks.append(tempo_track)
    tempo_track.append(mido.MetaMessage('time_signature', numerator=4, denominator=4, time=0))
    for i, bpm in enumerate(TEMPOS):
        tempo_track.append(mido.MetaMessage('set_tempo', tempo=mido.bpm2tempo(bpm), time=0 if i == 0 else 3840))
    for channel, name in enumerate(['piano_lead', 'piano_support', 'guitar']):
        track = mido.MidiTrack()
        midi.tracks.append(track)
        track.append(mido.MetaMessage('track_name', name=name, time=0))
        track.append(mido.Message('program_change', program=25 if name == 'guitar' else 0, channel=channel, time=0))
        timeline = []
        for event in EVENTS:
            if event['track'] == name:
                for kind, position in [('note_on', event['beat']), ('note_off', event['end_beat'])]:
                    timeline.append((round(position * 960), kind, event))
        previous = 0
        for tick, kind, event in sorted(timeline, key=lambda item: (item[0], item[1] == 'note_on')):
            track.append(mido.Message(kind, channel=channel, note=event['pitch'],
                                      velocity=event['velocity'] if kind == 'note_on' else 0,
                                      time=tick - previous))
            previous = tick
    midi.save(OUT / 'main-theme-01.mid')


def render() -> None:
    compose()
    if not all(sum(d for _, d in bar) == 4 for bar in THEME):
        raise ValueError('Every melody bar must total four beats.')
    piano_map, guitar_map = sample_maps()
    frames = math.ceil((BAR_TIMES[-1] + 5) * SR)
    tracks = {name: np.zeros((frames, 2)) for name in ['piano_lead', 'piano_support', 'guitar']}
    takes: dict[int, int] = {}
    for event in sorted(EVENTS, key=lambda e: e['start']):
        pitch, velocity = event['pitch'], event['velocity']
        if event['track'] == 'guitar':
            root = min(guitar_map, key=lambda n: abs(n - pitch))
            take = takes.get(root, 0)
            paths = guitar_map[root]
            path = paths[take % len(paths)]
            takes[root] = take + 1
            data = pitched(path, root, pitch).copy()
            data = np.repeat(data, 2, axis=1) if data.shape[1] == 1 else data
            data *= np.array([.68, .94])  # Modest right-of-center guitar.
        else:
            layer = 'M' if velocity >= 74 else 'S'
            root = min(piano_map[layer], key=lambda n: abs(n - pitch))
            data = pitched(piano_map[layer][root], root, pitch).copy()
        hold = round(event['hold'] * SR)
        release = round((.28 if event['track'] == 'guitar' else .34) * SR)
        data = data[:hold + release]
        if hold < len(data):
            data[hold:] *= np.linspace(1, 0, len(data) - hold)[:, None] ** 2
        fade = min(round(.004 * SR), len(data))
        data[-fade:] *= np.linspace(1, 0, fade)[:, None]
        data *= event['gain'] * (velocity / 72) ** 1.6
        start = round(event['start'] * SR)
        end = min(frames, start + len(data))
        tracks[event['track']][start:end] += data[:end - start]
    for name, data in tracks.items():
        low = 95 if name == 'guitar' else 35
        tracks[name] = sosfilt(butter(2, [low, 10500], fs=SR, btype='bandpass', output='sos'), data, axis=0)
    dry = sum(tracks.values())
    ir, rate = sf.read(ROOM, always_2d=True)
    USED.add(ROOM)
    if rate != SR:
        ratio = Fraction(SR, rate)
        ir = resample_poly(ir, ratio.numerator, ratio.denominator, axis=0)
    wet = np.column_stack([fftconvolve(dry[:, ch], ir[:, ch])[:frames] for ch in range(2)])
    wet = sosfilt(butter(2, [180, 7500], fs=SR, btype='bandpass', output='sos'), wet, axis=0)
    wet *= .16 * np.sqrt(np.mean(dry ** 2)) / max(np.sqrt(np.mean(wet ** 2)), 1e-12)
    mix = dry + wet
    mix -= np.mean(mix, axis=0)
    # Preserve phrase dynamics. Peak gain only; no brickwall compression.
    mix *= 10 ** (-1.8 / 20) / np.max(np.abs(mix))
    fade = round(2.5 * SR)
    mix[-fade:] *= np.linspace(1, 0, fade)[:, None] ** 2
    mix[:240] *= np.linspace(0, 1, 240)[:, None]
    if not np.all(np.isfinite(mix)) or np.max(np.abs(mix)) >= 1:
        raise ValueError('Invalid samples or clipping in master.')
    if max(TRANSPOSITIONS) > 2:
        raise ValueError('An instrument needs excessive sample transposition.')
    sf.write(OUT / 'main-theme-01.wav', mix, SR, subtype='PCM_24')
    write_midi()
    report = dict(title='A Place Kept — main-theme audition 01', sample_rate=SR,
                  seconds=frames / SR, channels=2, pcm_bits=24,
                  peak_dbfs=float(20 * np.log10(np.max(np.abs(mix)))),
                  rms_dbfs=float(20 * np.log10(np.sqrt(np.mean(mix ** 2)))),
                  max_sample_transposition_semitones=max(TRANSPOSITIONS),
                  note_count=len(EVENTS), tempos=TEMPOS,
                  section_seconds=[float(BAR_TIMES[i]) for i in [0, 1, 9, 17, 25, 26]],
                  harmony=[chord[0] for chord in HARMONY], notes=EVENTS,
                  sources=[dict(path=str(p), sha256=hashlib.sha256(p.read_bytes()).hexdigest()) for p in sorted(USED)])
    (OUT / 'score-and-render.json').write_text(json.dumps(report, indent=2) + '\n')
    print(json.dumps({k: v for k, v in report.items() if k not in ('notes', 'sources')}, indent=2))


if __name__ == '__main__':
    render()
