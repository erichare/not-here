/** DAY 4 — STUB SKELETON. The Act 1 content fleet replaces this file
 * per design/act1-beats.md. Scene ids and goto topology are the contract. */

import { defineScene, type Scene } from '@not-here/engine';

export const DAY4_SCENES: readonly Scene[] = [
  defineScene({
  id: 'd4-morning',
  prose: { kind: 'inline', paragraphs: [{ text: '[[STUB d4-morning — replaced by Act 1 content fleet]]' }] },
  choices: [
    { id: 'to-wharf', label: '[stub] The wharf.', goto: 'd4-wharf' },
    { id: 'to-errand', label: '[stub] The errand.', goto: 'd4-errand' },
    { id: 'to-dianne', label: '[stub] The General.', goto: 'd4-dianne' },
  ],
}),
  defineScene({
  id: 'd4-wharf',
  prose: { kind: 'inline', paragraphs: [{ text: '[[STUB d4-wharf — replaced by Act 1 content fleet]]' }] },
  choices: [{ id: 'next', label: '[stub] Continue.', goto: 'd4-wharf-2' }],
}),
  defineScene({
  id: 'd4-wharf-2',
  prose: { kind: 'inline', paragraphs: [{ text: '[[STUB d4-wharf-2 — replaced by Act 1 content fleet]]' }] },
  choices: [{ id: 'next', label: '[stub] Continue.', goto: 'd4-evening' }],
}),
  defineScene({
  id: 'd4-errand',
  prose: { kind: 'inline', paragraphs: [{ text: '[[STUB d4-errand — replaced by Act 1 content fleet]]' }] },
  choices: [{ id: 'next', label: '[stub] Continue.', goto: 'd4-evening' }],
}),
  defineScene({
  id: 'd4-dianne',
  prose: { kind: 'inline', paragraphs: [{ text: '[[STUB d4-dianne — replaced by Act 1 content fleet]]' }] },
  choices: [{ id: 'next', label: '[stub] Continue.', goto: 'd4-evening' }],
}),
  defineScene({
  id: 'd4-evening',
  prose: { kind: 'inline', paragraphs: [{ text: '[[STUB d4-evening — replaced by Act 1 content fleet]]' }] },
  choices: [{ id: 'next', label: '[stub] Continue.', goto: 'd4-night' }],
}),
  defineScene({
  id: 'd4-night',
  prose: { kind: 'inline', paragraphs: [{ text: '[[STUB d4-night — replaced by Act 1 content fleet]]' }] },
  choices: [{ id: 'next', label: '[stub] Continue.', goto: 'd5-morning' }],
}),
];
