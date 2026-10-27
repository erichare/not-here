"""Render the approved A Place Kept soundtrack using installed instrument samples.

This is an explicit local production command, never part of the application build.
Only mixed compositions are distributed; the instrument libraries stay local.
"""
from __future__ import annotations

import argparse
import hashlib
import importlib.util
import json
import math
import shutil
import subprocess
import sys
from pathlib import Path

import numpy as np
import soundfile as sf
from scipy.signal import butter, fftconvolve, resample_poly, sosfilt

ROOT = Path(__file__).resolve().parents[3]
APPROVED = ROOT / 'auditions/main-theme-01'
DEST = ROOT / 'apps/web/public/music/a-place-kept-v1'
MASTERS = ROOT / 'auditions/soundtrack-a-place-kept-v1'
SPEC = importlib.util.spec_from_file_location('approved_theme', APPROVED / 'render.py')
assert SPEC and SPEC.loader
THEME = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(THEME)
SR = THEME.SR
BPM = 75
KNOCK = Path('/Library/Application Support/Logic/Alchemy Samples/Drums/Single Samples/Mid Knock.aif')
MANIFEST: list[dict] = []
PIANO, GUITAR = {}, {}
ROOM = np.empty((0, 2))
KNOCK_DATA = np.empty((0, 2))


def event(voice: str, beat: float, pitch: int, duration: float, velocity: int = 60,
          gain: float = .5, pan: float = 0) -> dict:
    return dict(voice=voice, beat=beat, pitch=pitch, duration=duration,
                velocity=velocity, gain=gain, pan=pan)


def phrase(bars: list[int], start: float = 0, voice: str = 'guitar',
           octave: int = 0, gain: float = .5, velocity: int = 62,
           invert: bool = False, stretch: float = 1) -> list[dict]:
    notes = []
    for position, bar in enumerate(bars):
        cursor = start + position * 4 * stretch
        for pitch, duration in THEME.THEME[bar]:
            if pitch is not None:
                target = (134 - pitch if invert else pitch) + octave
                notes.append(event(voice, cursor, target, duration * .91 * stretch,
                                   velocity + (3 if duration >= 1.5 else -3), gain,
                                   .15 if voice == 'guitar' else -.08))
            cursor += duration * stretch
    return notes


def harmony(bars: int, start: float = 0, gain: float = .24,
            mode: str = 'piano', sparse: bool = False, offset: int = 0) -> list[dict]:
    notes = []
    for bar in range(bars):
        index = (bar + offset) % 8
        _, bass, chord = THEME.HARMONY[index]
        t = start + bar * 4
        if sparse and bar % 2:
            continue
        notes.append(event('piano', t, bass, 3.7, 43, gain * 1.5, -.12))
        if mode == 'guitar':
            for i, (beat, degree) in enumerate([(0.2, 0), (1, 1), (1.75, 2), (2.5, 3), (3.25, 1)]):
                notes.append(event('guitar', t + beat, chord[degree], min(1.65, 4 - beat),
                                   47 + (i % 3) * 3, gain, .18))
        else:
            for i, pitch in enumerate(chord[:3]):
                notes.append(event('piano', t + .8 + i * .023, pitch, 2.8 - i * .023,
                                   38 + i * 2, gain, -.08))
    return notes


def pulse(bars: int, start: float = 0, gain: float = .1) -> list[dict]:
    return [event('wood', start + bar * 4 + beat, 0, .35, 50 if beat == 0 else 39, gain, .1)
            for bar in range(bars) for beat in [0, 2.5]]


def call(voice: str = 'piano', gain: float = .5) -> list[dict]:
    # Five recognizable bars from the approved melody. Bar six belongs to the player.
    return phrase([0, 1, 2, 3, 4], voice=voice, gain=gain)


def arrangements() -> list[dict]:
    cues = []

    def add(name: str, title: str, notes: list[dict], bars: int, description: str,
            loop: bool = True, bpm: int = BPM, family: str = '', target: float = -25):
        cues.append(dict(id=f'v2-{name}', title=title, notes=notes, bars=bars,
                         description=description, loop=loop, bpm=bpm,
                         family=family, target_rms_db=target))

    add('kettle', 'The Warm Side of the Glass',
        harmony(24, gain=.24) + phrase([0, 1], 12, gain=.48) + phrase([0, 1], 68, gain=.39),
        24, 'Barb’s piano makes room for a brief guitar memory, then returns to ordinary work.')
    room = harmony(16, gain=.16, sparse=True)
    add('room', 'A Room Kept for Someone', room + phrase([0, 1], 4, gain=.62) + phrase([0, 1], 36, gain=.44),
        16, 'Dianne’s opening phrase, close and unhurried on guitar.', family='room')
    add('room-hollow', 'The Room Without the Song', room, 16,
        'The identical piano accompaniment and timing, with Dianne’s guitar removed.', family='room')
    shore = [event('piano', t, p, 4, 41, .36) for t, p in [(0, 38), (16, 45), (40, 38), (64, 41), (80, 45)]]
    shore += phrase([0], 26, gain=.3, stretch=1.4) + phrase([1], 72, gain=.28)
    add('shore', 'November Water', shore, 24, 'Low piano across open water; distant fragments on guitar.', target=-28)
    motel = harmony(16, gain=.14, sparse=True)
    motel += [event('piano', t + dt, p, .8, 48, .43) for t in [6, 29, 50] for dt, p in [(0, 62), (1, 65)]]
    add('motel', 'Unit One', motel, 16, 'The opening pickup repeatedly stops before its expected arrival.', target=-27)
    wharf = harmony(24, gain=.14, sparse=True)
    wharf += phrase([2], 8, 'piano', -24, .68, 55, stretch=2)
    wharf += phrase([2], 54, 'piano', -24, .52, 52, stretch=2) + pulse(10, 48, .045)
    add('wharf', 'Pressure in the Boards', wharf, 24, 'Wade’s falling third in low piano, with a quiet wooden pulse.', target=-27)
    clinic = harmony(16, gain=.13, sparse=True)
    clinic += phrase([3], 4, 'piano', gain=.55, invert=True) + phrase([3], 36, 'piano', gain=.42, invert=True)
    add('clinic', 'The Unsent Reply', clinic, 16, 'Priya’s piano phrase faces the wrong way; the rests remain exposed.', target=-26)
    boathouse = harmony(16, gain=.24, mode='guitar')
    boathouse += phrase([4], 12, 'guitar', gain=.64, velocity=69) + phrase([4], 44, 'guitar', gain=.5, velocity=65)
    add('boathouse', 'Sanding the Canoe', boathouse, 16, 'Sam’s quick rising fragment moves above a buoyant fingerpicked accompaniment.', target=-24)
    hall = harmony(24, gain=.24, sparse=True)
    hall += phrase([3], 18, 'piano', gain=.48) + phrase([0], 46, 'piano', gain=.4) + phrase([3], 76, 'piano', gain=.4)
    add('hall', 'Chairs After Closing', hall, 24, 'Exposed piano chords and brief answering fragments in an empty hall.', target=-26)
    shelter = harmony(16, gain=.22, mode='guitar') + pulse(16, gain=.07)
    shelter += phrase([0], 20, 'guitar', -12, .35) + phrase([1], 52, 'guitar', -12, .3)
    add('shelter', 'The Road Still Goes', shelter, 16, 'Tam’s steady wooden pulse under passing guitar phrases.', target=-25)
    potluck = harmony(24, gain=.25)
    for start in [4, 36, 68]:
        potluck += phrase([0, 1], start, gain=.45) + phrase([4], start + 10, 'piano', gain=.43)
    add('potluck', 'Places at the Table', potluck, 24, 'Dianne and Sam answer across Barb’s harmony, then the room thins.', target=-24)

    add('letter', 'Two Different Letters', harmony(12, gain=.17, sparse=True)
        + phrase([3], 4, 'piano', gain=.56, invert=True)
        + phrase([3], 20, 'piano', gain=.46) + phrase([0, 1], 32, gain=.36)
        + [event('piano', 44, 64, 3, 45, .36)], 12,
        'The inverted turn becomes legible after a pause; the last E remains unsettled.', False)
    add('arrival', 'A Person at the Bus Door', harmony(12, gain=.18, sparse=True)
        + phrase([4], 4, 'guitar', gain=.52, stretch=1.4)
        + phrase([0, 1], 18, 'piano', gain=.45) + phrase([7], 40, gain=.42), 12,
        'Sam’s phrase slows down. Piano answers without claiming the whole room.', False)
    add('two-wrens', 'Room for Both', harmony(16, gain=.2)
        + phrase([0, 1], 4, 'piano', gain=.49) + phrase([2, 3], 16, 'guitar', gain=.5)
        + phrase([4, 5], 32, 'piano', gain=.46) + phrase([6, 7], 48, 'guitar', gain=.45), 16,
        'The two instruments exchange the theme; neither has to disappear.', False, target=-24)
    add('long-winter', 'A Winter of Your Own', harmony(16, gain=.26)
        + phrase([0, 1], 8, 'piano', -12, .45) + phrase([7], 48, 'guitar', gain=.32), 16,
        'Barb’s warm piano harmony and an unhurried opening phrase.', False, 66, target=-25)
    add('stranger', 'A Name on the Ticket', harmony(12, gain=.24, mode='guitar') + pulse(12, gain=.06)
        + phrase([0, 1, 2, 3], 4, 'guitar', gain=.49)
        + phrase([4, 5, 6, 7], 32, 'guitar', gain=.39), 16,
        'The guitar carries its own melody out along the road as the accompaniment falls away.', False)
    borrowed = harmony(16, gain=.19, sparse=True)
    for n in borrowed:
        n['detune'] = -.5
    add('wren-again', 'The Place You Borrowed', borrowed + phrase([0, 1], 4, gain=.58)
        + phrase([0, 1], 36, gain=.47), 16,
        'The familiar lullaby rests over piano a quarter-tone away from belonging.', False, target=-25)
    add('ash', 'What the Book Cannot Keep', harmony(4, gain=.22)
        + phrase([0], 4, gain=.41) + [event('piano', 18, 50, 2, 36, .28)], 8,
        'Piano, then guitar, then the recognizable voices are gone. The ending is silence.', False, target=-28)

    for kind, last in [('open', 67), ('rest', 62)]:
        notes = call('guitar', .6) + harmony(5, gain=.19)
        notes += [event('guitar', 20 + t, p, d, 63, .65) for t, p, d in [(0, 62, .8), (1, 64, .8), (2, last, 1.8)]]
        add(f'sixth-{kind}', 'Your Rising Answer' if kind == 'open' else 'Your Quiet Return', notes, 6,
            'Five shared bars followed by the player’s distinct, deliberate sixth-bar answer.', False, family='sixth')
    for kind, beat, pitch, duration in [('never', 3, 57, 2), ('forgot', 2, 60, 1), ('door', 4, 64, 3)]:
        add(f'fingerprint-{kind}', f'Remembered Phrase: {kind}',
            [event('guitar', 0, 62, 1, 56, .55), event('guitar', beat, pitch, duration, 51, .5)],
            3, 'The original interview’s two-note pitch and rhythm identity, on the sampled guitar.', False, 120, 'fingerprint', -29)
    for kind in ['foghorn-312', 'horn-close']:
        add(kind, 'The Five-Bar Call' if kind == 'foghorn-312' else 'At the Valve',
            call('piano', .5) + harmony(5, gain=.12), 6,
            'The theme’s five-bar call in low, resonant piano; the sixth measure stays empty.',
            kind == 'horn-close', family='call', target=-26)
    return cues


def initialize() -> None:
    global PIANO, GUITAR, ROOM, KNOCK_DATA
    PIANO, GUITAR = THEME.sample_maps()
    ROOM, rate = sf.read(THEME.ROOM, always_2d=True)
    if rate != SR:
        ROOM = resample_poly(ROOM, SR // math.gcd(SR, rate), rate // math.gcd(SR, rate), axis=0)
    KNOCK_DATA, rate = sf.read(KNOCK, always_2d=True)
    KNOCK_DATA = resample_poly(KNOCK_DATA, SR // math.gcd(SR, rate), rate // math.gcd(SR, rate), axis=0)
    # A fixed response gain keeps separately rendered stems additive.
    ROOM /= max(np.sqrt(np.sum(ROOM ** 2) / 2), 1e-9)


def render(notes: list[dict], beats: int, bpm: int = BPM, loop: bool = False,
           detune: float = 0, silent_sixth: bool = False) -> np.ndarray:
    length = round(beats * 60 / bpm * SR)
    tail = 3 * SR
    dry = np.zeros((length + tail, 2))
    takes: dict[int, int] = {}
    for n in sorted(notes, key=lambda item: item['beat']):
        voice, pitch, velocity = n['voice'], n['pitch'], n['velocity']
        target = pitch + detune + n.get('detune', 0)
        if voice == 'wood':
            data = KNOCK_DATA.copy()
        else:
            mapping = GUITAR if voice == 'guitar' else PIANO['M' if velocity >= 74 else 'S']
            root = min(mapping, key=lambda key: abs(key - target))
            if abs(root - target) > 2.5:
                raise ValueError(f'Excessive sample transposition: {voice} {target} from {root}')
            if voice == 'guitar':
                take = takes.get(root, 0)
                path = mapping[root][take % len(mapping[root])]
                takes[root] = take + 1
            else:
                path = mapping[root]
            data = THEME.pitched(path, root, target).copy()
        if data.shape[1] == 1:
            data = np.repeat(data, 2, axis=1)
        hold = round(n['duration'] * 60 / bpm * SR)
        release = round(.3 * SR)
        data = data[:hold + release]
        if hold < len(data):
            data[hold:] *= np.linspace(1, 0, len(data) - hold)[:, None] ** 2
        fade = min(192, len(data))
        data[-fade:] *= np.linspace(1, 0, fade)[:, None]
        pan = n['pan']
        data *= np.array([min(1, 1 - pan), min(1, 1 + pan)])
        data *= n['gain'] * (velocity / 72) ** 1.6
        pos = round(n['beat'] * 60 / bpm * SR)
        end = min(len(dry), pos + len(data))
        dry[pos:end] += data[:end - pos]
    dry = sosfilt(butter(2, [35, 10500], fs=SR, btype='bandpass', output='sos'), dry, axis=0)
    wet = np.column_stack([fftconvolve(dry[:, ch], ROOM[:, ch])[:len(dry)] for ch in range(2)])
    wet = sosfilt(butter(2, [180, 7500], fs=SR, btype='bandpass', output='sos'), wet, axis=0)
    mix = dry + .075 * wet
    if silent_sixth:
        boundary = round(20 * 60 / bpm * SR)
        fade = round(.22 * SR)
        mix[boundary - fade:boundary] *= np.linspace(1, 0, fade)[:, None] ** 2
        mix[boundary:] = 0
        return mix[:length]
    if loop:
        # Carry the room decay into the start of a seamless repeat.
        spill = min(tail, length)
        mix[:spill] += mix[length:length + spill]
        return mix[:length]
    fade = SR
    mix[-fade:] *= np.linspace(1, 0, fade)[:, None] ** 2
    return mix


def gain_for(mix: np.ndarray, target: float) -> float:
    peak = max(float(np.max(np.abs(mix))), 1e-12)
    rms = max(float(np.sqrt(np.mean(mix ** 2))), 1e-12)
    return min(10 ** (target / 20) / rms, .78 / peak, 5)


def export(cue: dict, mix: np.ndarray, ffmpeg: str, wav: bool = False) -> None:
    if not np.isfinite(mix).all() or np.max(np.abs(mix)) >= .99:
        raise ValueError(f'Invalid audio or clipping: {cue["id"]}')
    name = cue['id']
    master = MASTERS / f'{name}.wav'
    sf.write(master, mix, SR, subtype='PCM_24')
    file = f'{name}.wav' if wav else f'{name}.m4a'
    if wav:
        sf.write(DEST / file, mix, SR, subtype='PCM_16')
    else:
        subprocess.run([ffmpeg, '-nostdin', '-hide_banner', '-loglevel', 'error', '-y',
                        '-i', str(master), '-c:a', 'aac', '-b:a', '256k',
                        '-metadata', f'title={cue["title"]}', '-movflags', '+faststart', str(DEST / file)], check=True)
    entry = {key: cue[key] for key in ['id', 'title', 'description', 'loop']}
    entry.update(file=file, sampleRate=SR, frames=len(mix), seconds=len(mix) / SR,
                 channels=1 if mix.ndim == 1 else mix.shape[1],
                 peakDbfs=round(20 * math.log10(max(float(np.max(np.abs(mix))), 1e-12)), 4),
                 sha256=hashlib.sha256((DEST / file).read_bytes()).hexdigest(),
                 bytes=(DEST / file).stat().st_size)
    MANIFEST.append(entry)
    print(f'{name}: {entry["seconds"]:.2f}s, {entry["peakDbfs"]:.1f} dBFS', flush=True)


def ensemble() -> dict[str, list[dict]]:
    return {
        'dianne': phrase([0, 1], voice='guitar', gain=.56),
        'wade': phrase([2], 8, 'piano', -12, .48),
        'priya': phrase([3], 12, 'piano', gain=.51),
        'sam': phrase([4], 16, 'guitar', gain=.59, velocity=65),
        'barb': harmony(5, gain=.2),
        'tam': pulse(5, gain=.08),
        'sea': [event('piano', t, 38, 3.8, 30, .09) for t in [0, 8, 16]],
    }


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--ffmpeg', default=shutil.which('ffmpeg') or '/opt/homebrew/bin/ffmpeg')
    args = parser.parse_args()
    initialize()
    DEST.mkdir(parents=True, exist_ok=True)
    MASTERS.mkdir(parents=True, exist_ok=True)
    (MASTERS / '.gitignore').write_text('*.wav\n')
    if not (APPROVED / 'main-theme-01.wav').exists():
        subprocess.run([sys.executable, str(APPROVED / 'render.py')], check=True)
    title = dict(id='v2-title', title='A Place Kept', loop=True,
                 description='The approved main theme: intimate piano, guitar on its return, and a quiet closing phrase.')
    audio, rate = sf.read(APPROVED / 'main-theme-01.wav', always_2d=True)
    if rate != SR:
        raise ValueError('Unexpected approved master sample rate')
    export(title, audio, args.ffmpeg)
    # Preserve the exact approved listening file rather than recoding its sound.
    if (APPROVED / 'main-theme-01.m4a').exists():
        shutil.copyfile(APPROVED / 'main-theme-01.m4a', DEST / 'v2-title.m4a')
        MANIFEST[-1].update(sha256=hashlib.sha256((DEST / 'v2-title.m4a').read_bytes()).hexdigest(),
                            bytes=(DEST / 'v2-title.m4a').stat().st_size)
    cues = arrangements()
    family_gains = {}
    for cue in cues:
        silent_sixth = cue['family'] == 'call'
        mix = render(cue['notes'], cue['bars'] * 4, cue['bpm'], cue['loop'], silent_sixth=silent_sixth)
        family = cue['family'] or cue['id']
        gain = family_gains.setdefault(family, gain_for(mix, cue['target_rms_db']))
        export(cue, mix * gain, args.ffmpeg)
    stems = {}
    for who, notes in ensemble().items():
        for lowered in ([False] if who == 'sea' else [False, True]):
            key = who + ('-lowered' if lowered else '')
            stems[key] = render(notes, 24, loop=True, detune=-.5 if lowered else 0,
                                silent_sixth=True).mean(axis=1)
    # Bound every possible combination of normal and lowered stems at unity gain.
    envelope = sum(np.maximum(np.abs(stems[who]), np.abs(stems.get(f'{who}-lowered', stems[who]))) for who in ensemble())
    ensemble_gain = min(.7 / max(float(envelope.max()), 1e-12), 5)
    for who, mix in stems.items():
        export(dict(id=f'v2-ensemble-{who}', title=f'The Returned Fragments: {who}', loop=True,
                    description='One aligned character stem; the sixth bar is silent. Playback gain is unity.'),
               mix * ensemble_gain, args.ffmpeg, wav=True)
    sources = sorted(THEME.USED | {THEME.ROOM, KNOCK})
    manifest = dict(version='a-place-kept-v1', approvedThemeSha256=MANIFEST[0]['sha256'],
                    menuRevealSeconds=4.945333333333333, ensembleSeconds=19.2,
                    ensembleGain=1, ensembleFrames=921600, sampleRate=SR,
                    cues=MANIFEST,
                    sourceSamples=[dict(path=str(p), sha256=hashlib.sha256(p.read_bytes()).hexdigest()) for p in sources])
    (DEST / 'manifest.json').write_text(json.dumps(manifest, indent=2, ensure_ascii=False) + '\n')
    (MASTERS / 'score.json').write_text(json.dumps(dict(cues=cues, ensemble=ensemble()), indent=2, ensure_ascii=False) + '\n')
    print(f'{len(MANIFEST)} files; {sum(c["bytes"] for c in MANIFEST):,} distribution bytes', flush=True)


if __name__ == '__main__':
    main()
