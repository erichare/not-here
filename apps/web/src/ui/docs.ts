/**
 * Paper objects. A `@doc:` paragraph becomes a figure of bone paper: boxed
 * printed matter loses its box-drawing frame for a real paper edge and
 * stays monospace (the columns are the content); loose pages are set in
 * the right hand. The `(( … ))` ring becomes Dianne's blue pen, drawn over
 * text that keeps its width. Verbatim text, no wrap.
 */

import { detectDoc, ringSpans, type DocModel } from '../model/docs.ts';
import { el } from './dom.ts';

export const renderDoc = (text: string): HTMLElement => {
  const doc = detectDoc(text);
  const figure = el('figure', `paper paper--${doc.form} hand--${doc.hand}${doc.boxed ? ' paper--boxed' : ''}`);
  figure.setAttribute('role', 'img');
  figure.setAttribute('aria-label', accessibleLabel(doc));
  const pre = el('pre', 'paper-text');
  doc.lines.forEach((line, index) => {
    const row = el('span', 'paper-line');
    if (doc.handTitle && index === 0) row.classList.add('paper-title');
    for (const span of ringSpans(line)) {
      if (span.kind === 'text') {
        row.append(document.createTextNode(span.text));
        continue;
      }
      const ring = el('span', 'ring');
      const open = el('span', 'ring-paren', span.text.slice(0, 2));
      const close = el('span', 'ring-paren', span.text.slice(-2));
      ring.append(open, document.createTextNode(span.text.slice(2, -2)), close);
      row.append(ring);
    }
    pre.append(row);
    if (index < doc.lines.length - 1) pre.append(document.createTextNode('\n'));
  });
  figure.append(pre);
  return figure;
};

/** Screen readers get the verbatim text; the figure label names the paper. */
const accessibleLabel = (doc: DocModel): string => {
  switch (doc.form) {
    case 'card':
      return 'a bus schedule card';
    case 'register':
      return 'a page of the register';
    case 'log':
      return 'a page of the mileage log';
    case 'notice':
      return 'a printed notice';
    case 'flyer':
      return 'a flyer';
    case 'list':
      return 'a sign-up sheet';
    case 'map':
      return 'a hand-drawn map';
    case 'chord':
      return 'a chord chart';
    case 'intake':
      return 'a clinic page';
    case 'letter':
    case 'reply':
      return 'a letter';
    case 'note':
      return 'a note';
    case 'jotting':
      return 'a page of notes';
    case 'scrap':
      return 'a burnt scrap of paper';
    default:
      return 'a document';
  }
};
