/**
 * Event handler for EngineEvent[] on the terminal. music.cue plays the
 * matching audition WAV via afplay when present (killing the previous
 * player first); otherwise a single dim '♪ <cue>' line — the tier-3
 * fallback. tell.visual prints in italics. Never crashes when afplay is
 * missing: spawn failures fall back to the note line.
 */

import { spawn, type ChildProcess } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import type { EngineEvent } from '@not-here/engine';
import { dim, italic } from './render.ts';

export interface AudioSinkOptions {
  /** Force the '♪ <cue>' fallback and never spawn a player. */
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
  writeAsync: (line: string) => void,
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

  const noteLine = (cue: string): string => dim(`♪ ${cue}`);

  /** Returns a fallback line to print, or undefined when audio is playing. */
  const playCue = (cue: string): string | undefined => {
    const file = join(auditionsDir, `${cue}.wav`);
    if (options.silent === true || !existsSync(file)) return noteLine(cue);
    stop();
    try {
      const child = spawn('afplay', [file], { detached: true, stdio: 'ignore' });
      child.on('error', () => {
        // afplay missing or unspawnable — degrade to the note line.
        current = undefined;
        writeAsync(noteLine(cue));
      });
      child.unref();
      current = child;
      return undefined;
    } catch {
      return noteLine(cue);
    }
  };

  const handle = (events: readonly EngineEvent[]): readonly string[] =>
    events.flatMap((event): string[] => {
      if (event.kind === 'music.cue') {
        const line = playCue(event.cue);
        return line === undefined ? [] : [line];
      }
      if (event.kind === 'tell.visual') return [italic(event.text)];
      return [];
    });

  return { handle, stop };
};
