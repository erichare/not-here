import type { LocationId, ScenePresentation } from '@not-here/engine';

interface Painting { readonly src: string; readonly alt: string; readonly focus?: string }
const art = (id: string, alt: string, focus?: string): Painting => ({ src: `/art/${id}.jpg`, alt, ...(focus ? { focus } : {}) });
export const LOCATION_ART: Readonly<Record<LocationId, Painting>> = {
  kettle: art('kettle', 'Amber lamps over a worn diner counter. Two mugs sit beside the open register; the lake is blue beyond the glass.'),
  shore: art('shore', 'An empty gravel shore, the old ferry pilings, and a road through bare orchards toward one lit window.'),
  general: art('general', 'A kept bedroom above the store. A faded quilt, guitar and empty corkboard face the lake window.'),
  motel: art('motel', 'A modest motel room: made bed, worn chair, baseboard heater and a plain key. A lamp warms the lake-facing window.'),
  wharf: art('wharf', 'Compressor gauges and coiled hose frame the open shed door. Wet wharf boards lead toward a small brass horn.'),
  clinic: art('clinic', 'Paper on an examination couch. A closed notebook and mug sit by the desk lamp under cold fluorescent light.'),
  boathouse: art('boathouse', 'Boat timber and curled shavings cover Sam’s workbench. A guitar leans nearby; a dinghy floats beyond the open door.'),
  hall: art('hall', 'Stacked chairs, folded trestle tables and an upright piano wait in an ordinary hall. The serving hatch glows amber.'),
  shelter: art('shelter', 'A timber and glass bus shelter beside the wet highway. Bare orchard rows descend toward the lake.', '45% 50%'),
};
const STAGED_ART: Record<NonNullable<ScenePresentation['staging']>, Painting> = {
  'memory-loss': art('memory-loss', 'Dianne’s hand rests beside the blue quilt patch. The stitching is still there; her tracing has stopped.'),
  potluck: art('potluck', 'The same hall, now occupied. Mismatched casseroles and mugs surround a waiting place at the table.'),
  letter: art('letter', 'Two differently worn pages lie in the open till drawer. Their complete text is available in the passage.'),
  arrival: art('arrival', 'The bus door stands open. A canvas holdall and a guitar case with a taped catch rest beside the shelter.'),
};
/** A scene's important composition wins over general relationship decoration. */
export const sceneArt = (presentation?: ScenePresentation): Painting => {
  if (presentation?.staging) return STAGED_ART[presentation.staging];
  if (presentation?.composition === 'kettle-work') return art('kettle-work', 'The familiar counter, a small screwdriver by its loose hinge, and a mug waiting beside the register.');
  return LOCATION_ART[presentation?.location ?? 'shore'];
};
