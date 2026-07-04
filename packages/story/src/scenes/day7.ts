/** DAY 7 — STUB SKELETON. The Act 1 content fleet replaces this file
 * per design/act1-beats.md. Scene ids and goto topology are the contract. */

import { defineScene, type Scene } from '@not-here/engine';

export const DAY7_SCENES: readonly Scene[] = [
  defineScene({
  id: 'd7-morning',
  prose: { kind: 'inline', paragraphs: [{ text: '[[STUB d7-morning — replaced by Act 1 content fleet]]' }] },
  choices: [{ id: 'next', label: '[stub] Continue.', goto: 'd7-evening' }],
}),
  defineScene({
  id: 'd7-evening',
  prose: { kind: 'inline', paragraphs: [{ text: '[[STUB d7-evening — replaced by Act 1 content fleet]]' }] },
  choices: [{ id: 'next', label: '[stub] Continue.', goto: 'd7-walk' }],
}),
  defineScene({
  id: 'd7-walk',
  prose: { kind: 'inline', paragraphs: [{ text: '[[STUB d7-walk — replaced by Act 1 content fleet]]' }] },
  choices: [{ id: 'next', label: '[stub] Continue.', goto: 'd7-hornroom' }],
}),
  defineScene({
  id: 'd7-hornroom',
  prose: { kind: 'inline', paragraphs: [{ text: '[[STUB d7-hornroom — replaced by Act 1 content fleet]]' }] },
  choices: [{ id: 'next', label: '[stub] Continue.', goto: 'd7-after' }],
}),
  defineScene({
  id: 'd7-after',
  prose: { kind: 'inline', paragraphs: [{ text: '[[STUB d7-after — replaced by Act 1 content fleet]]' }] },
  choices: [{ id: 'next', label: '[stub] Continue.', goto: 'act1-end' }],
}),
  defineScene({
  id: 'act1-end',
  prose: { kind: 'inline', paragraphs: [{ text: '[[STUB act1-end]]' }] },
  choices: [],
  ending: 'act1-end',
}),
];
