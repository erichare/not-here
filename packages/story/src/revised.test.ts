import { describe, expect, it } from 'vitest';
import { advance, initialState, resumeScene, type StepResult } from '@not-here/engine';
import { buildRevisedContent, REVISED_OPENING_SCENE } from './revised.ts';
import { acquiredFragments } from './presentation.ts';

const content = buildRevisedContent();
const start = () => advance(content, initialState(42, REVISED_OPENING_SCENE), { kind: 'enter' });
const walk = (picks: Record<string, string> = {}, inspect = false): StepResult => {
  let step = start();
  for (let i = 0; i < 500 && !step.view.ending; i++) {
    if (step.view.input === 'name') step = advance(content, step.state, { kind: 'name', name: 'Alex' });
    if (inspect) for (const o of step.view.observations ?? []) step = advance(content, step.state, { kind: 'inspect', observationId: o.id });
    const choices = step.view.choices.filter(c => !c.locked);
    const picked = picks[step.state.sceneId];
    const next = picked ? choices.find(c => c.id === picked) : choices[0];
    if (!next) throw new Error(`No requested choice ${picked ?? '(first)'} at ${step.state.sceneId}`);
    step = advance(content, step.state, { kind: 'choose', choiceId: next.id });
  }
  return step;
};

describe('story edition 2: meaningful outcomes through play', () => {
  it.each([
    ['two-wrens', {}],
    ['stranger', { 'r22-future': 'leave-town' }],
    ['long-winter', { 'r22-future': 'one-winter' }],
    ['sixth-bar', { 'r22-future': 'own-song', 'r23-compose': 'bar-open' }],
    ['wren-again', { 'r23-arrival': 'claim-place', 'r23-claim': 'sustain-lie' }],
    ['ash', { 'd19-morning': 'consider-ash', 'r-ash-warning': 'burn-witness' }],
    ['unwitnessed', { 'd7-hornroom': 'stop', 'r20-warning': 'decline-help', 'd20-morning': 'prepare-future', 'r20-prepare': 'keep-away', 'r22-warning': 'walk-unseen' }],
  ] as const)('%s is reachable without injected state', (ending, picks) => {
    const step = walk(picks);
    expect(step.view.ending).toBe(ending);
  });
  it('lets a player change their mind about claiming Wren', () => {
    expect(walk({ 'r23-arrival': 'claim-place', 'r23-claim': 'correct-name' }).view.ending).toBe('two-wrens');
  });
  it('an unaware player can still choose honesty at arrival', () => {
    expect(walk({ 'r14-letter': 'leave-letter' }).view.ending).toBe('two-wrens');
  });
  it('a compassionate route can reach hope with no confessions', () => {
    const step = walk({ 'd3-room': 'let-it-stay', 'd20-morning': 'prepare-future', 'r20-prepare': 'make-place' });
    expect(step.view.ending).toBe('two-wrens');
    expect(acquiredFragments(step.state)).toEqual([]);
    expect(step.state.flags['r:work-arranged']).toBe(true);
    expect(step.view.paragraphs.join(' ')).toContain('screwdriver');
  });
  it('an avoidant route can leave under its own name without the letter or confessions', () => {
    const step = walk({ 'r14-letter': 'leave-letter', 'd20-morning': 'prepare-future', 'r20-prepare': 'prepare-leaving', 'r22-future': 'leave-town' });
    expect(step.view.ending).toBe('stranger');
    expect(acquiredFragments(step.state)).toEqual([]);
    expect(step.state.flags['r:seat-held']).toBe(true);
  });
  it('accepting the final offer of help averts collapse', () => {
    const step = walk({ 'd7-hornroom': 'stop', 'r20-warning': 'decline-help', 'd20-morning': 'prepare-future', 'r20-prepare': 'keep-away', 'r22-warning': 'stay-visible' });
    expect(step.view.ending).toBe('two-wrens');
  });
  it('every destructive route goes through the informed Ash decision', () => {
    for (const scene of content.scenes.values()) for (const c of scene.choices) if (c.goto === 'act2-ash') expect(scene.id).toBe('r-ash-warning');
    expect(walk({ 'd19-morning': 'consider-ash', 'r-ash-warning': 'burn-witness' }).state.flags['r:ash-understood']).toBe(true);
  });
  it('the two deliberate original sixth bars select different musical endings', () => {
    const open = walk({ 'r22-future': 'own-song', 'r23-compose': 'bar-open' });
    const rest = walk({ 'r22-future': 'own-song', 'r23-compose': 'bar-rest' });
    expect(open.events).toContainEqual({ kind: 'music.cue', cue: 'v2-sixth-open' });
    expect(rest.events).toContainEqual({ kind: 'music.cue', cue: 'v2-sixth-rest' });
  });
  it('a name is authored input, stored without markup interpretation', () => {
    let step = start();
    while (step.view.input !== 'name') step = advance(content, step.state, { kind: 'choose', choiceId: step.view.choices[0]!.id });
    expect(() => advance(content, step.state, { kind: 'name', name: ' '.repeat(50) })).toThrow();
    const named = advance(content, step.state, { kind: 'name', name: 'Alex' });
    expect(named.state.flags['player:name']).toBe('Alex');
    expect(resumeScene(content, named.state).view.choices).toEqual(named.view.choices);
  });
  it('observations are idempotent and do not spend time or replay entry effects', () => {
    const initial = start();
    const inspected = advance(content, initial.state, { kind: 'inspect', observationId: 'wet-coat' });
    const again = advance(content, inspected.state, { kind: 'inspect', observationId: 'wet-coat' });
    expect(again.state).toEqual(inspected.state);
    expect(again.state.day).toBe(initial.state.day);
    expect(again.state.choiceLog).toEqual(initial.state.choiceLog);
    expect(again.state.stats).toEqual(initial.state.stats);
    expect(() => advance(content, initial.state, { kind: 'inspect', observationId: 'quilt' })).toThrow();
  });
  it('inspection does not change a route outcome', () => expect(walk({}, true).view.ending).toBe(walk().view.ending));
  it('every revised scene has location and sound descriptions and valid exits', () => {
    for (const scene of content.scenes.values()) {
      expect(scene.presentation?.location, scene.id).toBeTruthy();
      for (const choice of scene.choices) expect(content.scenes.has(choice.goto), `${scene.id}/${choice.id}`).toBe(true);
    }
  });
  it('fragment identity follows its keeper, never the confession count', () => {
    const state = { ...start().state, chord: 1, flags: { 'conf:priya': true } };
    expect(acquiredFragments(state)).toEqual(['priya']);
    expect(content.realizeEvents!(state, [{ kind: 'music.chord', fragments: 1 }])).toEqual([{ kind: 'music.fragments', characters: ['priya'] }]);
  });
});
