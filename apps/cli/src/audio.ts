/**
 * Event handler for EngineEvent[] on the terminal. music.cue plays the
 * matching audition WAV via afplay when present (killing the previous
 * player first) and ALWAYS returns the dim '♪ <caption>' line — the caption
 * channel is accessibility, not a fallback, so deaf players get it whether
 * or not audio is sounding. Captions are diegetic (see @not-here/music
 * captions.ts); a raw cue id never reaches the screen. music.stop kills the
 * current player and prints nothing: the silence is the score.
 * tell.visual prints in italics. Never crashes when afplay is missing.
 *
 * Ensemble mixing (music.layer / music.chord): the act3-ensemble layers
 * ship as per-layer loops (`act3-ensemble-<layer>.wav`). afplay plays a
 * file once, so each active layer respawns on exit to loop; `-v` applies
 * the authored per-layer gain (ACT3_ENSEMBLE_LAYER_GAINS) since the layer
 * WAVs are individually normalized at render time. music.chord reconciles
 * the active set to the first n fragments of the cascade; the sea bed
 * sounds whenever any fragment is up. Layer events print nothing — the
 * scenes carry their own prose twins. Unknown patterns (e.g. the day-15
 * 'lullaby') are ignored, exactly as the web mixer ignores them.
 */

import { spawn, type ChildProcess } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import type { EngineEvent } from '@not-here/engine';
import {
  ACT3_ENSEMBLE_LAYER_GAINS,
  ACT3_FRAGMENT_ORDER,
  cueCaption,
  type Act3LayerId,
} from '@not-here/music';
import { dim, italic } from './render.ts';

export interface AudioSinkOptions {
  /** Never spawn a player; the '♪ <caption>' line still prints. */
  readonly silent?: boolean;
}

export interface AudioSink {
  /** Interpret events; returns display lines for the caller to print. */
  readonly handle: (events: readonly EngineEvent[]) => readonly string[];
  /** Kill any player still running. */
  readonly stop: () => void;
}

const ENSEMBLE_LAYER_IDS: readonly string[] = [
  'sea',
  ...ACT3_FRAGMENT_ORDER,
];

const isEnsembleLayer = (pattern: string): pattern is Act3LayerId =>
  (ENSEMBLE_LAYER_IDS as readonly string[]).includes(pattern);

export const createAudioSink = (
  auditionsDir: string,
  options: AudioSinkOptions = {},
): AudioSink => {
  // Process-handle tracking is inherently stateful; confined to this closure.
  let current: ChildProcess | undefined;
  const layers = new Map<Act3LayerId, ChildProcess>();

  const stop = (): void => {
    if (current !== undefined) {
      try {
        current.kill();
      } catch {
        // Already exited; nothing to reap.
      }
      current = undefined;
    }
  };

  const killLayer = (id: Act3LayerId): void => {
    const child = layers.get(id);
    if (child === undefined) return;
    // Remove from the map first so the 'exit' handler won't respawn it.
    layers.delete(id);
    try {
      child.kill();
    } catch {
      // Already exited; nothing to reap.
    }
  };

  const stopAllLayers = (): void => {
    for (const id of [...layers.keys()]) killLayer(id);
  };

  const noteLine = (cue: string): string => dim(`♪ ${cueCaption(cue)}`);

  /** Best-effort playback; the caption line prints regardless. */
  const playCue = (cue: string): void => {
    const file = join(auditionsDir, `${cue}.wav`);
    if (options.silent === true || !existsSync(file)) return;
    stop();
    try {
      const child = spawn('afplay', [file], { detached: true, stdio: 'ignore' });
      child.on('error', () => {
        // afplay missing or unspawnable — the caption already printed.
        current = undefined;
      });
      child.unref();
      current = child;
    } catch {
      // Spawn refused synchronously — degrade to caption-only.
    }
  };

  /** Start a layer loop if not already playing; no-op when silent/missing. */
  const startLayer = (id: Act3LayerId): void => {
    if (layers.has(id)) return;
    if (options.silent === true) return;
    const file = join(auditionsDir, `act3-ensemble-${id}.wav`);
    if (!existsSync(file)) return;
    const gain = ACT3_ENSEMBLE_LAYER_GAINS[id];
    try {
      const child = spawn('afplay', ['-v', String(gain), file], {
        detached: true,
        stdio: 'ignore',
      });
      layers.set(id, child);
      child.on('error', () => {
        // afplay missing or unspawnable — drop the layer silently.
        if (layers.get(id) === child) layers.delete(id);
      });
      child.on('exit', () => {
        // afplay plays once; respawn to loop, unless the layer was killed
        // on purpose (map entry removed or replaced).
        if (layers.get(id) !== child) return;
        layers.delete(id);
        startLayer(id);
      });
      child.unref();
    } catch {
      // Spawn refused synchronously — the ensemble just stays thinner.
    }
  };

  /** music.layer: raise or lower one ensemble layer. */
  const applyLayer = (pattern: string, gain: number): void => {
    if (!isEnsembleLayer(pattern)) return;
    if (gain > 0) {
      // Mutual exclusion with the scene cue (the web mixer's rule): the
      // ensemble's arrival stands the cue down.
      stop();
      startLayer(pattern);
    } else {
      killLayer(pattern);
    }
  };

  /** music.chord: the active set is the first n fragments of the cascade. */
  const applyChord = (fragments: number): void => {
    const count = Math.max(
      0,
      Math.min(ACT3_FRAGMENT_ORDER.length, Math.floor(fragments)),
    );
    if (count > 0) stop(); // the ensemble replaces the scene cue
    const wanted = new Set<Act3LayerId>(ACT3_FRAGMENT_ORDER.slice(0, count));
    if (count > 0) wanted.add('sea');
    for (const id of wanted) startLayer(id);
    for (const id of [...layers.keys()]) {
      if (!wanted.has(id)) killLayer(id);
    }
  };

  const handle = (events: readonly EngineEvent[]): readonly string[] =>
    events.flatMap((event): string[] => {
      if (event.kind === 'music.cue') {
        // A scene cue replaces the ensemble — the layers stand down.
        stopAllLayers();
        playCue(event.cue);
        return [noteLine(event.cue)];
      }
      if (event.kind === 'music.stop') {
        stopAllLayers();
        stop();
        return [];
      }
      if (event.kind === 'music.layer') {
        applyLayer(event.pattern, event.gain);
        return [];
      }
      if (event.kind === 'music.chord') {
        applyChord(event.fragments);
        return [];
      }
      if (event.kind === 'tell.visual') return [italic(event.text)];
      return [];
    });

  return {
    handle,
    stop: () => {
      stopAllLayers();
      stop();
    },
  };
};
