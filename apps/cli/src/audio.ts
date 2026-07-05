/**
 * Event handler for EngineEvent[] on the terminal. music.cue plays the
 * matching audition WAV via afplay when present (killing the previous
 * player first) and ALWAYS returns the dim '♪ <caption>' line — the caption
 * channel is accessibility, not a fallback, so deaf players get it whether
 * or not audio is sounding. Captions are diegetic (see @not-here/music
 * captions.ts); a raw cue id never reaches the screen. music.stop kills the
 * current player and prints nothing: the silence is the score.
 * tell.visual prints in italics. Never crashes when afplay is missing.
 */

import { spawn, type ChildProcess } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import type { EngineEvent } from '@not-here/engine';
import { cueCaption } from '@not-here/music';
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

export const createAudioSink = (
  auditionsDir: string,
  options: AudioSinkOptions = {},
): AudioSink => {
  // Process-handle tracking is inherently stateful; confined to this closure.
  let current: ChildProcess | undefined;

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

  const handle = (events: readonly EngineEvent[]): readonly string[] =>
    events.flatMap((event): string[] => {
      if (event.kind === 'music.cue') {
        playCue(event.cue);
        return [noteLine(event.cue)];
      }
      if (event.kind === 'music.stop') {
        stop();
        return [];
      }
      if (event.kind === 'tell.visual') return [italic(event.text)];
      return [];
    });

  return { handle, stop };
};
