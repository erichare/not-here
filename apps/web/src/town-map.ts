import type { LocationId } from '@not-here/engine';
import { LOCATIONS } from '@not-here/story';
import './town-map.css';

const MAP_WIDTH = 1000;
const MAP_HEIGHT = 720;
const MAX_ZOOM = 3;
const SVG_NS = 'http://www.w3.org/2000/svg';

// Coordinates match the numbered landmarks in public/art/lorn-bay-map.svg.
const LANDMARKS = [
  { id: 'shelter', x: 215, y: 190 },
  { id: 'clinic', x: 345, y: 300 },
  { id: 'hall', x: 440, y: 320 },
  { id: 'wharf', x: 597, y: 350 },
  { id: 'general', x: 410, y: 427 },
  { id: 'motel', x: 340, y: 510 },
  { id: 'kettle', x: 447, y: 536 },
  { id: 'shore', x: 530, y: 606 },
  { id: 'boathouse', x: 535, y: 142 },
] as const satisfies readonly { id: LocationId; x: number; y: number }[];

const element = <K extends keyof HTMLElementTagNameMap>(tag: K, className: string, text?: string): HTMLElementTagNameMap[K] => {
  const node = document.createElement(tag);
  node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
};

const control = (label: string, text: string, action: () => void): HTMLButtonElement => {
  const node = element('button', 'atlas-control', text);
  node.type = 'button';
  node.setAttribute('aria-label', label);
  node.addEventListener('click', action);
  return node;
};

export const createTownMap = (currentLocation?: LocationId): HTMLElement => {
  const atlas = element('section', 'town-atlas');
  atlas.setAttribute('aria-label', 'Lorn Bay map');
  let zoom = 1;

  const viewport = element('div', 'atlas-viewport');
  viewport.tabIndex = 0;
  viewport.setAttribute('role', 'region');
  viewport.setAttribute('aria-label', 'Map view. Use arrow keys to scroll when zoomed.');
  const canvas = element('div', 'atlas-canvas');
  canvas.style.width = '100%';
  const artwork = element('img', 'atlas-artwork');
  artwork.src = '/art/lorn-bay-map.svg';
  artwork.alt = 'A map of Lorn Bay beside Okanagan Lake, showing the highway, local roads, and nine numbered landmarks.';
  artwork.width = MAP_WIDTH;
  artwork.height = MAP_HEIGHT;
  artwork.draggable = false;
  const overlay = document.createElementNS(SVG_NS, 'svg');
  overlay.classList.add('atlas-overlay');
  overlay.setAttribute('viewBox', `0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`);
  overlay.setAttribute('aria-hidden', 'true');
  const ring = (className: string): SVGCircleElement => {
    const circle = document.createElementNS(SVG_NS, 'circle');
    circle.classList.add(className);
    circle.setAttribute('r', '23');
    overlay.append(circle);
    return circle;
  };
  const current = LANDMARKS.find(landmark => landmark.id === currentLocation);
  if (current) {
    const marker = ring('atlas-current-marker');
    marker.setAttribute('cx', String(current.x));
    marker.setAttribute('cy', String(current.y));
    marker.dataset.location = current.id;
  }
  const focused = ring('atlas-focused-marker');
  focused.style.display = 'none';
  canvas.append(artwork, overlay);
  viewport.append(canvas);

  const toolbar = element('div', 'atlas-toolbar');
  toolbar.setAttribute('role', 'group');
  toolbar.setAttribute('aria-label', 'Map zoom');
  const zoomText = element('output', 'atlas-zoom', '100%');
  zoomText.setAttribute('aria-live', 'polite');
  zoomText.setAttribute('aria-label', 'Map magnification');
  const hint = element('p', 'atlas-hint', 'Choose a place in the key to take a closer look.');
  const zoomTo = (next: number, center?: { x: number; y: number }) => {
    const oldZoom = zoom;
    const centerX = center ? center.x / MAP_WIDTH : (viewport.scrollLeft + viewport.clientWidth / 2) / (viewport.clientWidth * oldZoom || 1);
    const centerY = center ? center.y / MAP_HEIGHT : (viewport.scrollTop + viewport.clientHeight / 2) / (viewport.clientWidth * oldZoom * MAP_HEIGHT / MAP_WIDTH || 1);
    zoom = Math.min(MAX_ZOOM, Math.max(1, next));
    canvas.style.width = `${zoom * 100}%`;
    atlas.dataset.zoom = String(zoom);
    zoomText.value = `${zoom * 100}%`;
    zoomOut.disabled = zoom === 1;
    zoomIn.disabled = zoom === MAX_ZOOM;
    viewport.scrollLeft = zoom === 1 ? 0 : centerX * viewport.clientWidth * zoom - viewport.clientWidth / 2;
    viewport.scrollTop = zoom === 1 ? 0 : centerY * viewport.clientWidth * zoom * MAP_HEIGHT / MAP_WIDTH - viewport.clientHeight / 2;
    hint.textContent = zoom === 1
      ? 'Choose a place in the key to take a closer look.'
      : 'Scroll or swipe the map to explore. Fit map returns to the whole view.';
    if (zoom === 1) {
      focused.style.display = 'none';
      delete focused.dataset.location;
    }
  };
  const zoomOut = control('Zoom out', '−', () => zoomTo(zoom - .5));
  const zoomIn = control('Zoom in', '+', () => zoomTo(zoom + .5));
  const reset = control('Fit whole map', 'Fit map', () => zoomTo(1));
  zoomOut.disabled = true;
  atlas.dataset.zoom = '1';
  toolbar.append(zoomOut, zoomText, zoomIn, reset);

  const legend = element('ol', 'atlas-key');
  legend.setAttribute('aria-label', 'Map key. Select a place to locate it on the map.');
  for (const [index, landmark] of LANDMARKS.entries()) {
    const item = element('li', 'atlas-key-item');
    const locate = element('button', 'atlas-key-place');
    locate.type = 'button';
    locate.dataset.location = landmark.id;
    locate.setAttribute('aria-label', `Find ${LOCATIONS[landmark.id].title} on the map`);
    const number = element('span', 'atlas-key-number', String(index + 1));
    number.setAttribute('aria-hidden', 'true');
    const label = element('span', 'atlas-key-label', LOCATIONS[landmark.id].title);
    if (landmark.id === currentLocation) {
      locate.setAttribute('aria-current', 'location');
      label.append(element('span', 'atlas-key-current', 'You are here'));
    }
    locate.append(number, label);
    locate.addEventListener('click', () => {
      zoomTo(Math.max(2, zoom), landmark);
      focused.setAttribute('cx', String(landmark.x));
      focused.setAttribute('cy', String(landmark.y));
      focused.dataset.location = landmark.id;
      focused.style.display = '';
      viewport.scrollIntoView({ block: 'center' });
      viewport.focus({ preventScroll: true });
    });
    item.append(locate);
    legend.append(item);
  }
  atlas.append(toolbar, viewport, hint, legend);
  return atlas;
};
