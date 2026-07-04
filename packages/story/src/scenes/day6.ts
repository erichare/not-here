/** DAY 6 — STUB SKELETON. The Act 1 content fleet replaces this file
 * per design/act1-beats.md. Scene ids and goto topology are the contract. */

import { defineScene, type Scene } from '@not-here/engine';

export const DAY6_SCENES: readonly Scene[] = [
  defineScene({
  id: 'd6-morning',
  prose: { kind: 'inline', paragraphs: [{ text: '[[STUB d6-morning — replaced by Act 1 content fleet]]' }] },
  choices: [
    { id: 'to-hall', label: '[stub] The hall.', goto: 'd6-hall' },
    { id: 'to-ticket', label: '[stub] The ticket office.', goto: 'd6-ticket-office' },
  ],
}),
  defineScene({
  id: 'd6-hall',
  prose: { kind: 'inline', paragraphs: [{ text: '[[STUB d6-hall — replaced by Act 1 content fleet]]' }] },
  choices: [{ id: 'next', label: '[stub] Continue.', goto: 'd6-evening' }],
}),
  defineScene({
  id: 'd6-ticket-office',
  prose: { kind: 'inline', paragraphs: [{ text: '[[STUB d6-ticket-office — replaced by Act 1 content fleet]]' }] },
  choices: [{ id: 'next', label: '[stub] Continue.', goto: 'd6-evening' }],
}),
  defineScene({
  id: 'd6-evening',
  prose: { kind: 'inline', paragraphs: [{ text: '[[STUB d6-evening — replaced by Act 1 content fleet]]' }] },
  choices: [{ id: 'next', label: '[stub] Continue.', goto: 'd6-recording' }],
}),
  defineScene({
  id: 'd6-recording',
  prose: { kind: 'inline', paragraphs: [{ text: '[[STUB d6-recording — replaced by Act 1 content fleet]]' }] },
  choices: [{ id: 'next', label: '[stub] Continue.', goto: 'd7-morning' }],
}),
];
