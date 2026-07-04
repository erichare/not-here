/** DAY 3 — STUB SKELETON. The Act 1 content fleet replaces this file
 * per design/act1-beats.md. Scene ids and goto topology are the contract. */

import { defineScene, type Scene } from '@not-here/engine';

export const DAY3_SCENES: readonly Scene[] = [
  defineScene({
  id: 'd3-morning',
  prose: { kind: 'inline', paragraphs: [{ text: '[[STUB d3-morning — replaced by Act 1 content fleet]]' }] },
  choices: [
    { id: 'to-room', label: '[stub] The room.', goto: 'd3-room' },
    { id: 'to-shed', label: '[stub] The shed.', goto: 'd3-shed' },
    { id: 'to-clinic', label: '[stub] The clinic.', goto: 'd3-clinic' },
  ],
}),
  defineScene({
  id: 'd3-room',
  prose: { kind: 'inline', paragraphs: [{ text: '[[STUB d3-room — replaced by Act 1 content fleet]]' }] },
  choices: [{ id: 'next', label: '[stub] Continue.', goto: 'd3-room-2' }],
}),
  defineScene({
  id: 'd3-room-2',
  prose: { kind: 'inline', paragraphs: [{ text: '[[STUB d3-room-2 — replaced by Act 1 content fleet]]' }] },
  choices: [{ id: 'next', label: '[stub] Continue.', goto: 'd3-evening' }],
}),
  defineScene({
  id: 'd3-shed',
  prose: { kind: 'inline', paragraphs: [{ text: '[[STUB d3-shed — replaced by Act 1 content fleet]]' }] },
  choices: [{ id: 'next', label: '[stub] Continue.', goto: 'd3-evening' }],
}),
  defineScene({
  id: 'd3-clinic',
  prose: { kind: 'inline', paragraphs: [{ text: '[[STUB d3-clinic — replaced by Act 1 content fleet]]' }] },
  choices: [{ id: 'next', label: '[stub] Continue.', goto: 'd3-evening' }],
}),
  defineScene({
  id: 'd3-evening',
  prose: { kind: 'inline', paragraphs: [{ text: '[[STUB d3-evening — replaced by Act 1 content fleet]]' }] },
  choices: [{ id: 'next', label: '[stub] Continue.', goto: 'd3-night' }],
}),
  defineScene({
  id: 'd3-night',
  prose: { kind: 'inline', paragraphs: [{ text: '[[STUB d3-night — replaced by Act 1 content fleet]]' }] },
  choices: [{ id: 'next', label: '[stub] Continue.', goto: 'd4-morning' }],
}),
];
