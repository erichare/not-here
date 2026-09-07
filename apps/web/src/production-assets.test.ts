import { expect, it } from 'vitest';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { advance, initialState } from '@not-here/engine';
import { buildRevisedContent, REVISED_OPENING_SCENE } from '@not-here/story';
import { LOCATION_ART, sceneArt } from './scene-art.ts';
import { ENVIRONMENTS, renderEnvironment } from './environment-audio.ts';

it('ships a painting and designed sound for all nine locations', () => {
  expect(Object.keys(LOCATION_ART)).toHaveLength(9);
  for (const [location, art] of Object.entries(LOCATION_ART)) {
    expect(existsSync(fileURLToPath(new URL(`../public${art.src}`, import.meta.url))), art.src).toBe(true);
    expect(ENVIRONMENTS[location]).toBeDefined();
    const sound = renderEnvironment(location, 8000);
    expect(sound).toHaveLength(24 * 8000);
    expect(sound.every(Number.isFinite)).toBe(true);
    expect(Math.abs(sound[0]!)).toBe(0); expect(Math.abs(sound.at(-1)!)).toBe(0);
  }
});
it('keeps Wren’s definitive portrait behind her physical arrival and the original edition separate', () => {
  const content = buildRevisedContent();
  let step = advance(content, initialState(42, REVISED_OPENING_SCENE), { kind: 'enter' });
  while (!step.view.ending) {
    if (step.state.day < 23) expect(step.view.presentation?.character).not.toBe('wren');
    if (step.view.input === 'name') step = advance(content, step.state, { kind: 'name', name: 'Alex' });
    step = advance(content, step.state, { kind: 'choose', choiceId: step.view.choices.find(c => !c.locked)!.id });
  }
  expect(step.view.ending).toBe('two-wrens');
  expect(step.view.presentation?.character).toBe('wren');
});
it('holds the bus composition through the conversation, and the drawer through the letter sequence', () => {
  const content = buildRevisedContent();
  for (const id of ['r23-arrival', 'r23-honesty', 'r23-claim']) {
    const scene = content.scenes.get(id)!;
    expect(sceneArt(content.realizePresentation!(scene, initialState(42, id))).src).toBe('/art/arrival.jpg');
  }
  for (const id of ['r14-letter', 'r14-reveal', 'r14-reply']) {
    const scene = content.scenes.get(id)!;
    expect(sceneArt(content.realizePresentation!(scene, initialState(42, id))).src).toBe('/art/letter.jpg');
  }
});
it('uses a loss painting only after taking the quilt, and puts important staging before work decoration', () => {
  const content = buildRevisedContent();
  const start = initialState(42, 'd3-room');
  const offered = advance(content, start, { kind: 'enter' });
  const refusal = advance(content, offered.state, { kind: 'choose', choiceId: 'let-it-stay' });
  expect(refusal.view.presentation?.staging).not.toBe('memory-loss');
  const taken = advance(content, offered.state, { kind: 'choose', choiceId: 'remember-with-her' });
  expect(sceneArt(taken.view.presentation).src).toBe('/art/memory-loss.jpg');
  expect(sceneArt({ ...taken.view.presentation!, composition: 'kettle-work' }).src).toBe('/art/memory-loss.jpg');
});
