/**
 * Line input for the terminal front-end. One abstraction, two temperaments:
 *
 *  - piped (interactive: false): every buffered line is honoured in order —
 *    the deterministic replay workflow feeds a whole run in one chunk and
 *    depends on nothing being dropped or reprompted.
 *  - terminal (interactive: true): type-ahead is honoured too, EXCEPT that
 *    the caller may discard the queue when a screen carries a major ('!')
 *    choice — a fork must be answered by someone who has seen it
 *    (pt2-fix-02: queued keystrokes were eating the Day 6 and Day 11 forks
 *    sight-unseen).
 */

import { stdout } from 'node:process';
import { warm } from './render.ts';

export interface LineSource {
  /** True when the source is a live terminal — type-ahead may be blind. */
  readonly interactive: boolean;
  /** Next input line; undefined once stdin closes (EOF, ctrl-d). */
  readonly next: (prompt: string) => Promise<string | undefined>;
  /**
   * Drop lines typed before the current screen drew. No-op on a piped
   * source: replay input is never discarded.
   */
  readonly discardTypeAhead: () => void;
}

/** The events createLineSource needs; readline.Interface satisfies this. */
export interface LineEvents {
  on(event: 'line', listener: (line: string) => void): unknown;
  on(event: 'close', listener: () => void): unknown;
}

export interface LineSourceOptions {
  readonly interactive: boolean;
  /** Where prompts print when the source has to wait (default stdout). */
  readonly writePrompt?: (prompt: string) => void;
}

/**
 * Buffered line reader. rl.question drops lines that arrive while no
 * question is pending — fatal for piped input, which lands in one chunk —
 * so every 'line' event is queued and consumed in order instead.
 */
export const createLineSource = (
  rl: LineEvents,
  options: LineSourceOptions,
): LineSource => {
  const writePrompt =
    options.writePrompt ??
    ((prompt: string): void => {
      stdout.write(prompt);
    });
  const queue: string[] = [];
  const waiters: ((line: string | undefined) => void)[] = [];
  let closed = false;
  rl.on('line', (line) => {
    const waiter = waiters.shift();
    if (waiter !== undefined) waiter(line);
    else queue.push(line);
  });
  rl.on('close', () => {
    closed = true;
    for (const waiter of waiters.splice(0)) waiter(undefined);
  });
  return {
    interactive: options.interactive,
    next: (prompt: string): Promise<string | undefined> => {
      const buffered = queue.shift();
      if (buffered !== undefined) return Promise.resolve(buffered);
      if (closed) return Promise.resolve(undefined);
      writePrompt(prompt);
      return new Promise((resolve) => {
        waiters.push(resolve);
      });
    },
    discardTypeAhead: (): void => {
      // Piped replays keep every line; only a live terminal forfeits
      // blind type-ahead (pt2-fix-02).
      if (options.interactive) queue.splice(0);
    },
  };
};

/**
 * The prompt for a screen: on a live terminal a major screen carries the
 * same warm '!' its choices do, so the fork announces itself even at the
 * prompt line. Piped output keeps the plain prompt exactly (pt2-fix-02).
 */
export const promptFor = (major: boolean, interactive: boolean): string =>
  major && interactive ? warm('! > ') : warm('> ');
