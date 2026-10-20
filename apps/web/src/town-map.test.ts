// @vitest-environment jsdom
import { afterEach, expect, it, vi } from 'vitest';
import { LOCATIONS } from '@not-here/story';
import { createTownMap } from './town-map.ts';

afterEach(() => { document.body.replaceChildren(); });

const mount = (current?: Parameters<typeof createTownMap>[0]) => {
  const map = createTownMap(current);
  document.body.append(map);
  return map;
};

const click = (map: HTMLElement, label: string) => {
  map.querySelector<HTMLButtonElement>(`button[aria-label="${label}"]`)!.click();
};

it('offers every mapped location in an accessible key and marks only the current place', () => {
  const map = mount('kettle');
  const locations = [...map.querySelectorAll<HTMLButtonElement>('.atlas-key-place')];
  expect(locations).toHaveLength(Object.keys(LOCATIONS).length);
  for (const location of Object.values(LOCATIONS)) expect(map.textContent).toContain(location.title);
  expect(map.querySelectorAll('[aria-current="location"]')).toHaveLength(1);
  expect(map.querySelector('[aria-current="location"]')?.textContent).toContain('The KettleYou are here');
  const marker = map.querySelector('.atlas-current-marker')!;
  expect(marker.getAttribute('cx')).toBe('447');
  expect(marker.getAttribute('cy')).toBe('536');
  expect(map.querySelector('img')?.getAttribute('src')).toBe('/art/lorn-bay-map.svg');
  expect(map.querySelector('.atlas-overlay')?.getAttribute('aria-hidden')).toBe('true');
});

it('does not invent a current location when the scene has none', () => {
  const map = mount();
  expect(map.querySelector('[aria-current]')).toBeNull();
  expect(map.querySelector('.atlas-current-marker')).toBeNull();
});

it('bounds zoom between the fitted map and three times its width, and resets the scroll position', () => {
  const map = mount('shore');
  const viewport = map.querySelector<HTMLElement>('.atlas-viewport')!;
  expect(map.querySelector<HTMLButtonElement>('[aria-label="Zoom out"]')!.disabled).toBe(true);
  expect(viewport.tabIndex).toBe(0);
  for (let i = 0; i < 8; i++) click(map, 'Zoom in');
  expect(map.dataset.zoom).toBe('3');
  expect(map.querySelector<HTMLElement>('.atlas-canvas')!.style.width).toBe('300%');
  expect(map.querySelector<HTMLButtonElement>('[aria-label="Zoom in"]')!.disabled).toBe(true);
  expect(map.querySelector('.atlas-hint')!.textContent).toContain('Scroll or swipe');
  viewport.scrollLeft = 170;
  viewport.scrollTop = 200;
  click(map, 'Fit whole map');
  expect(map.dataset.zoom).toBe('1');
  expect(map.querySelector('output')!.textContent).toBe('100%');
  expect(viewport.scrollLeft).toBe(0);
  expect(viewport.scrollTop).toBe(0);
  for (let i = 0; i < 8; i++) click(map, 'Zoom out');
  expect(map.dataset.zoom).toBe('1');
});

it('locates a landmark without changing the reader’s current place', () => {
  const map = mount('shore');
  const viewport = map.querySelector<HTMLElement>('.atlas-viewport')!;
  viewport.scrollIntoView = vi.fn();
  const focus = vi.spyOn(viewport, 'focus');
  Object.defineProperties(viewport, { clientWidth: { value: 500 }, clientHeight: { value: 360 } });
  click(map, 'Find Sam’s Boathouse on the map');
  expect(map.dataset.zoom).toBe('2');
  expect(viewport.scrollLeft).toBe(285);
  expect(map.querySelector<SVGCircleElement>('.atlas-focused-marker')!.dataset.location).toBe('boathouse');
  expect(map.querySelector('[aria-current="location"]')?.getAttribute('data-location')).toBe('shore');
  expect(viewport.scrollIntoView).toHaveBeenCalledExactlyOnceWith({ block: 'center' });
  expect(focus).toHaveBeenCalledExactlyOnceWith({ preventScroll: true });
  expect(document.activeElement).toBe(viewport);
  click(map, 'Fit whole map');
  expect(map.querySelector<SVGCircleElement>('.atlas-focused-marker')!.style.display).toBe('none');
});
