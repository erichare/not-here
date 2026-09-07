/** Reading budgets are observations, not measured player duration. No saves or state injection. */
import { advance, initialState } from '../packages/engine/src/index.ts';
import { buildRevisedContent, REVISED_OPENING_SCENE } from '../packages/story/src/revised.ts';

const content = buildRevisedContent();
const profiles: Record<string, Record<string, string>> = {
  detailed: {},
  compassionate: { 'd3-room': 'let-it-stay', 'd20-morning': 'prepare-future', 'r20-prepare': 'make-place' },
  avoidant: { 'r14-letter': 'leave-letter', 'd20-morning': 'prepare-future', 'r20-prepare': 'prepare-leaving', 'r22-future': 'leave-town' },
  exploitative: { 'd20-morning': 'prepare-future', 'r20-prepare': 'protect-place', 'r23-arrival': 'claim-place', 'r23-claim': 'sustain-lie' },
  mixed: { 'd3-room': 'let-it-stay', 'd7-hornroom': 'stop', 'r20-warning': 'decline-help', 'd20-morning': 'prepare-future', 'r20-prepare': 'keep-away', 'r22-warning': 'stay-visible' },
};
for (const [profile, picks] of Object.entries(profiles)) {
  let step = advance(content, initialState(42, REVISED_OPENING_SCENE), { kind: 'enter' });
  let words = 0, pages = 0, decisions = 0, accumulated = 0, firstMemoryWords = 0;
  const between: number[] = [];
  for (; pages < 500; pages++) {
    const count = step.view.paragraphs.join(' ').split(/\s+/).filter(Boolean).length;
    words += count; accumulated += count;
    if (step.state.sceneId === 'd3-room-2') firstMemoryWords = words;
    if (step.view.ending) break;
    const previousDay = step.state.day;
    if (step.view.input === 'name') step = advance(content, step.state, { kind: 'name', name: 'Alex' });
    const choices = step.view.choices.filter(c => !c.locked);
    if (choices.length > 1 || choices.some(c => c.stakes === 'major') || step.view.input) { decisions++; between.push(accumulated); accumulated = 0; }
    const next = choices.find(c => c.id === picks[step.state.sceneId]) ?? choices[0];
    if (!next) throw new Error(`No exit at ${step.state.sceneId}`);
    step = advance(content, step.state, { kind: 'choose', choiceId: next.id });
    if (step.state.day < previousDay) throw new Error(`Calendar moved backward at ${step.state.sceneId}`);
  }
  if (!step.view.ending) throw new Error(`Route ${profile} did not finish`);
  between.sort((a, b) => a - b);
  console.log(JSON.stringify({ profile, ending: step.view.ending, proseWords: words, pages: pages + 1, meaningfulDecisions: decisions,
    wordsBetweenDecisions: { median: between[Math.floor(between.length / 2)], p90: between[Math.floor(between.length * .9)], max: Math.max(...between) },
    arrivalThroughFirstMemoryConsequenceWords: firstMemoryWords,
    readingOnlyMinutesAt180to220wpm: [Math.round(words / 220), Math.round(words / 180)],
    timingCaveat: 'Excludes choice deliberation, observations, rereading and listening; requires timed human playtest.' }));
}
