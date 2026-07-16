/**
 * LineSource behavior in both temperaments (pt2-fix-02): a piped source
 * honours every buffered line in order (the deterministic replay contract);
 * an interactive source forfeits blind type-ahead when the caller discards
 * it at a major screen, and its prompt carries the fork's '!'.
 */

import { describe, expect, it } from 'vitest';
import { createLineSource, promptFor, type LineEvents } from './input.ts';
import { stripAnsi, warm } from './render.ts';

/** Minimal fake readline: tests drive 'line'/'close' by hand. */
const fakeLines = () => {
  const listeners = new Map<string, ((line: string) => void)[]>();
  const events: LineEvents = {
    on: (event: string, listener: (line: string) => void) => {
      listeners.set(event, [...(listeners.get(event) ?? []), listener]);
      return events;
    },
  };
  return {
    events,
    line: (text: string): void => {
      for (const listener of listeners.get('line') ?? []) listener(text);
    },
    close: (): void => {
      for (const listener of listeners.get('close') ?? []) (listener as () => void)();
    },
  };
};

const source = (interactive: boolean) => {
  const fake = fakeLines();
  const prompts: string[] = [];
  const input = createLineSource(fake.events, {
    interactive,
    writePrompt: (prompt) => prompts.push(prompt),
  });
  return { fake, prompts, input };
};

describe('createLineSource — piped (interactive: false)', () => {
  it('resolves buffered lines in order without printing a prompt', async () => {
    const { fake, prompts, input } = source(false);
    fake.line('1');
    fake.line('2');
    await expect(input.next('> ')).resolves.toBe('1');
    await expect(input.next('> ')).resolves.toBe('2');
    expect(prompts).toEqual([]);
  });

  it('discardTypeAhead is a no-op — replay input is never dropped', async () => {
    const { fake, input } = source(false);
    fake.line('1');
    fake.line('q');
    input.discardTypeAhead();
    await expect(input.next('> ')).resolves.toBe('1');
    await expect(input.next('> ')).resolves.toBe('q');
  });

  it('resolves undefined once closed, and for waiters pending at close', async () => {
    const { fake, input } = source(false);
    const pending = input.next('> ');
    fake.close();
    await expect(pending).resolves.toBeUndefined();
    await expect(input.next('> ')).resolves.toBeUndefined();
  });
});

describe('createLineSource — terminal (interactive: true)', () => {
  it('honours type-ahead when nobody discards it', async () => {
    const { fake, input } = source(true);
    fake.line('3');
    await expect(input.next('> ')).resolves.toBe('3');
  });

  it('discardTypeAhead drops queued lines; the next answer must be fresh', async () => {
    const { fake, prompts, input } = source(true);
    fake.line('1'); // typed blind, before the major screen drew
    fake.line('2');
    input.discardTypeAhead();
    const pending = input.next('! > ');
    expect(prompts).toEqual(['! > ']); // it had to ask
    fake.line('2'); // the conscious answer
    await expect(pending).resolves.toBe('2');
  });

  it('discards only what was queued — a pending waiter still gets its line', async () => {
    const { fake, input } = source(true);
    const pending = input.next('> ');
    input.discardTypeAhead();
    fake.line('1');
    await expect(pending).resolves.toBe('1');
  });
});

describe('promptFor — the major screens announce themselves (pt2-fix-02)', () => {
  it('a major screen on a live terminal carries the warm !', () => {
    expect(promptFor(true, true)).toBe(warm('! > '));
    expect(stripAnsi(promptFor(true, true))).toBe('! > ');
  });

  it('piped input keeps the plain prompt exactly, major or not', () => {
    expect(promptFor(true, false)).toBe(warm('> '));
    expect(promptFor(false, false)).toBe(warm('> '));
  });

  it('an ordinary screen keeps the plain prompt', () => {
    expect(promptFor(false, true)).toBe(warm('> '));
  });
});
