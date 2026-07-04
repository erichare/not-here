/** DAY 5 — STUB SKELETON. The Act 1 content fleet replaces this file
 * per design/act1-beats.md. Scene ids and goto topology are the contract. */

import { defineScene, type Scene } from '@not-here/engine';

export const DAY5_SCENES: readonly Scene[] = [
  defineScene({
  id: 'd5-morning',
  prose: { kind: 'inline', paragraphs: [{ text: '[[STUB d5-morning — replaced by Act 1 content fleet]]' }] },
  choices: [
    { id: 'to-ride', label: '[stub] The ride.', goto: 'd5-ride' },
    { id: 'to-hall', label: '[stub] The hall.', goto: 'd5-hall' },
  ],
}),
  defineScene({
  id: 'd5-ride',
  prose: { kind: 'inline', paragraphs: [{ text: '[[STUB d5-ride — replaced by Act 1 content fleet]]' }] },
  choices: [{ id: 'next', label: '[stub] Continue.', goto: 'd5-evening' }],
}),
  defineScene({
  id: 'd5-hall',
  prose: { kind: 'inline', paragraphs: [{ text: '[[STUB d5-hall — replaced by Act 1 content fleet]]' }] },
  choices: [{ id: 'next', label: '[stub] Continue.', goto: 'd5-evening' }],
}),
  defineScene({
  id: 'd5-evening',
  prose: { kind: 'inline', paragraphs: [{ text: '[[STUB d5-evening — replaced by Act 1 content fleet]]' }] },
  choices: [{ id: 'next', label: '[stub] Continue.', goto: 'd5-night' }],
}),
  defineScene({
  id: 'd5-night',
  prose: { kind: 'inline', paragraphs: [{ text: '[[STUB d5-night — replaced by Act 1 content fleet]]' }] },
  choices: [{ id: 'next', label: '[stub] Continue.', goto: 'd6-morning' }],
}),
];
