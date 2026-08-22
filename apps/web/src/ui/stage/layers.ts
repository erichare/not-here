/**
 * Stage layers — the procedural sets, authored in code: CSS gradients for
 * sky, fog and lamp pools; one inline SVG silhouette per set. Every set is
 * drawn in a 1600×1000 box (16:10 — the desktop frame) and placed with
 * preserveAspectRatio slice: the desktop shows it whole, the phone crops to
 * the right-hand end so the light stays in frame. Nothing here animates by
 * JS; the beam, the fog and the pools are CSS keyframes on composited
 * layers (see styles/stage.css). No bitmaps, no canvas.
 */

import type { PlaceId } from '../../model/places.ts';

export type SetVariant =
  | 'wharf' // exterior, from the shore
  | 'hornroom' // the wharf, horn lit — you are in the room at its end
  | 'unit' // the wharf through the unit's window (night)
  | 'beach' // low camera, the gravel
  | 'kettle'
  | 'general'
  | 'house'
  | 'clinic'
  | 'shed'
  | 'hall'
  | 'room'
  | 'depot'
  | 'shelter'
  | 'road'
  | 'card'
  | 'ambient';

/** Which set a place is drawn with. */
export const variantFor = (place: PlaceId): SetVariant => {
  switch (place) {
    case 'wharf':
      return 'wharf';
    case 'hornroom':
      return 'hornroom';
    case 'unit':
      return 'unit';
    case 'beach':
      return 'beach';
    case 'kettle':
      return 'kettle';
    case 'general':
    case 'house':
    case 'clinic':
    case 'shed':
    case 'hall':
    case 'room':
    case 'depot':
    case 'shelter':
    case 'road':
    case 'card':
      return place;
    default:
      return 'ambient';
  }
};

const PAR = (phone: boolean): string => (phone ? 'xMaxYMax slice' : 'xMidYMax slice');

/** The eleven lit windows along the town hill — six amber, five cold. */
const WINDOWS: readonly (readonly [number, number, 'a' | 'c'])[] = [
  [40, 350, 'a'],
  [95, 360, 'c'],
  [150, 376, 'a'],
  [205, 396, 'c'],
  [260, 418, 'a'],
  [315, 442, 'c'],
  [370, 466, 'a'],
  [420, 488, 'c'],
  [470, 512, 'a'],
  [520, 532, 'c'],
  [575, 550, 'a'],
];

const PILINGS = [930, 1010, 1090, 1170, 1250, 1330, 1410, 1490] as const;

/** The wharf: far shore, water, the town hill with its windows, the deck, the shed, the horn room, the light. */
export const wharfSvg = (phone: boolean, night: boolean): string => {
  const windows = WINDOWS.map(
    ([x, y, k]) =>
      `<rect x="${x}" y="${y}" width="${k === 'a' ? 7 : 5}" height="${k === 'a' ? 6 : 4}" fill="${
        k === 'a' ? 'rgba(232,180,90,.6)' : 'rgba(163,180,195,.45)'
      }"/>`,
  ).join('');
  const piles = PILINGS.map((x) => `<rect x="${x}" y="532" width="8" height="130" fill="url(#nh-pile)"/>`).join('');
  return `<svg class="set-svg" viewBox="0 0 1600 1000" preserveAspectRatio="${PAR(phone)}" aria-hidden="true" focusable="false">
  <defs>
    <linearGradient id="nh-water" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="rgb(120,140,160)" stop-opacity=".09"/><stop offset=".35" stop-color="#0a0f15" stop-opacity=".92"/><stop offset="1" stop-color="#05080c"/></linearGradient>
    <linearGradient id="nh-pile" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#04060a"/><stop offset="1" stop-color="#04060a" stop-opacity="0"/></linearGradient>
    <radialGradient id="nh-refl" cx=".5" cy="0" r="1"><stop offset="0" stop-color="rgb(190,210,226)" stop-opacity=".12"/><stop offset="1" stop-color="rgb(190,210,226)" stop-opacity="0"/></radialGradient>
    <radialGradient id="nh-pane"><stop offset="0" stop-color="#ffd98f" stop-opacity=".95"/><stop offset="1" stop-color="#e8b45a" stop-opacity=".7"/></radialGradient>
    <radialGradient id="nh-open" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="rgb(146,168,188)" stop-opacity=".07"/><stop offset="1" stop-color="rgb(146,168,188)" stop-opacity="0"/></radialGradient>
  </defs>
  <path d="M0 560 C 200 520, 420 542, 640 526 C 860 512, 1100 540, 1300 522 C 1450 510, 1540 534, 1600 522 L1600 560 Z" fill="#0c1118" opacity="${night ? '.35' : '1'}"/>
  <rect x="0" y="560" width="1600" height="440" fill="url(#nh-water)"/>
  <g class="sheen">
    <g><rect x="-300" y="598" width="2200" height="3" fill="rgb(150,170,190)" opacity=".05"/></g>
    <g><rect x="-300" y="640" width="2200" height="2" fill="rgb(150,170,190)" opacity=".04"/></g>
    <g><rect x="-300" y="690" width="2200" height="3" fill="rgb(150,170,190)" opacity=".035"/></g>
  </g>
  <ellipse cx="1540" cy="562" rx="24" ry="170" fill="url(#nh-refl)"/>
  <ellipse class="fog-opens" cx="1420" cy="520" rx="260" ry="120" fill="url(#nh-open)"/>
  <path d="M0 330 C 120 340, 250 380, 400 440 C 520 490, 590 530, 660 560 L0 560 Z" fill="#04060a"/>
  <g class="windows">${windows}</g>
  <g fill="#04060a">
    <rect x="880" y="520" width="680" height="12"/>${piles}
    <rect x="880" y="482" width="110" height="40"/><polygon points="876,482 935,466 994,482"/>
    <rect x="1380" y="456" width="90" height="66"/><polygon points="1374,456 1425,438 1476,456"/>
    <polygon points="1470,470 1532,460 1532,486 1470,482"/>
    <rect x="1539" y="412" width="5" height="110"/>
  </g>
  <rect x="925" y="492" width="14" height="16" fill="#0b1016"/>
  <rect class="pane" x="1395" y="482" width="12" height="12" fill="url(#nh-pane)"/>
  <rect class="lamp-head" x="1533" y="406" width="14" height="10" fill="#dfe8f0" opacity=".9"/>
  <path d="M0 940 C 200 930, 420 942, 640 936 C 900 928, 1200 942, 1600 934 L1600 1000 L0 1000 Z" fill="#05070a"/>
</svg>`;
};

/** The Kettle: the window, the mug shelf, the counter with its stools, the pie case, the heater, Moose at the door. */
export const kettleSvg = (phone: boolean): string => {
  const mugs = [1120, 1160, 1200, 1240, 1280]
    .map((x) => `<rect x="${x}" y="442" width="30" height="28" rx="3"/>`)
    .join('');
  const stools = [440, 600, 760];
  return `<svg class="set-svg" viewBox="0 0 1600 1000" preserveAspectRatio="${PAR(phone)}" aria-hidden="true" focusable="false">
  <defs>
    <linearGradient id="nh-pane-m" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1f2a34"/><stop offset="1" stop-color="#151d25"/></linearGradient>
    <radialGradient id="nh-fog-w" cx=".3" cy=".2" r=".9"><stop offset="0" stop-color="rgb(160,180,196)" stop-opacity=".16"/><stop offset="1" stop-color="rgb(160,180,196)" stop-opacity="0"/></radialGradient>
    <linearGradient id="nh-case" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="rgb(200,215,225)" stop-opacity=".07"/><stop offset="1" stop-color="rgb(200,215,225)" stop-opacity=".02"/></linearGradient>
  </defs>
  <rect class="window-pane" x="40" y="300" width="360" height="230" fill="url(#nh-pane-m)"/>
  <rect x="40" y="300" width="360" height="230" fill="url(#nh-fog-w)"/>
  <rect x="217" y="300" width="6" height="230" fill="#05070a"/><rect x="40" y="412" width="360" height="6" fill="#05070a"/>
  <rect x="38" y="298" width="364" height="234" fill="none" stroke="rgba(163,180,195,.12)" stroke-width="2"/>
  <rect x="1110" y="472" width="210" height="3" fill="rgba(163,180,195,.10)"/>
  <g fill="#0a0d11" stroke="rgba(163,180,195,.10)" stroke-width="1">${mugs}</g>
  <rect x="0" y="620" width="1600" height="380" fill="#070a0e"/>
  <rect x="0" y="620" width="1600" height="4" fill="#0b0f14"/>
  <rect class="counter-light" x="360" y="619" width="420" height="1" fill="rgba(232,180,90,.26)"/>
  <rect x="860" y="548" width="220" height="72" fill="url(#nh-case)" stroke="rgba(163,180,195,.14)" stroke-width="1.5"/>
  <rect x="860" y="584" width="220" height="1" fill="rgba(163,180,195,.10)"/>
  <g fill="#03050a" stroke="rgba(232,180,90,.14)" stroke-width="1">${stools.map((x) => `<rect x="${x - 36}" y="680" width="72" height="12" rx="4"/>`).join('')}</g>
  <g fill="#05070b">${stools.map((x) => `<rect x="${x - 3}" y="692" width="6" height="90"/>`).join('')}</g>
  <rect x="1240" y="570" width="80" height="40" fill="#0a0c0f"/><g stroke="rgba(232,130,60,.3)" stroke-width="1"><path d="M1246 580 H1314 M1246 590 H1314 M1246 600 H1314"/></g>
  <ellipse cx="560" cy="616" rx="46" ry="8" fill="#0d1116" stroke="rgba(163,180,195,.16)" stroke-width="1"/>
  <rect x="616" y="598" width="28" height="20" rx="3" fill="#06080b"/><path d="M644 603 C 652 602, 654 614, 644 614" fill="none" stroke="#06080b" stroke-width="3"/>
  <g class="steam" stroke="rgba(200,210,220,.12)" stroke-width="2" fill="none"><path d="M624 592 C 620 584, 628 580, 624 572"/><path d="M630 594 C 626 586, 634 582, 630 574"/><path d="M636 592 C 632 584, 640 580, 636 572"/></g>
  <rect x="1330" y="330" width="170" height="300" fill="none" stroke="rgba(163,180,195,.14)" stroke-width="2"/>
  <rect x="1332" y="332" width="166" height="296" fill="rgba(163,180,195,.02)"/>
  <path class="moose" d="M1326 630 C 1334 608, 1366 594, 1404 596 C 1440 598, 1458 590, 1480 596 C 1494 588, 1512 592, 1516 604 C 1520 612, 1524 620, 1526 630 Z" fill="#04060a"/>
  <path d="M1508 596 C 1514 588, 1520 590, 1522 598" fill="#04060a"/>
</svg>`;
};

/** The generic places: one prop each, drawn small, right of centre so the column stays clear. */
const PROPS: Readonly<Partial<Record<SetVariant, string>>> = {
  general: `<rect x="1210" y="300" width="340" height="250" fill="rgba(217,211,196,.07)" stroke="rgba(217,211,196,.12)" stroke-width="2"/>
  <g fill="rgba(217,211,196,.12)"><rect x="1236" y="330" width="70" height="52" transform="rotate(-3 1271 356)"/><rect x="1330" y="322" width="88" height="60" transform="rotate(2 1374 352)"/><rect x="1448" y="340" width="76" height="96" transform="rotate(-1.5 1486 388)"/><rect x="1256" y="418" width="110" height="70" transform="rotate(1 1311 453)"/></g>
  <g fill="rgba(42,47,54,.9)"><circle cx="1271" cy="332" r="2.5"/><circle cx="1374" cy="324" r="2.5"/><circle cx="1486" cy="342" r="2.5"/><circle cx="1311" cy="420" r="2.5"/></g>
  <circle cx="1486" cy="388" r="9" fill="none" stroke="rgba(59,90,140,.7)" stroke-width="1.4"/><circle cx="1487" cy="389" r="8" fill="none" stroke="rgba(59,90,140,.5)" stroke-width="1"/>
  <rect x="0" y="640" width="1600" height="360" fill="#060910"/>
  <rect x="1000" y="639" width="600" height="1" fill="rgba(163,180,195,.12)"/>
  <rect x="1100" y="606" width="60" height="34" fill="#0a0d12" stroke="rgba(163,180,195,.10)" stroke-width="1"/>
  <g fill="#090c11" stroke="rgba(163,180,195,.08)" stroke-width="1"><rect x="1240" y="660" width="120" height="70" rx="4"/><rect x="1380" y="660" width="120" height="70" rx="4"/></g>`,
  house: `<rect x="1180" y="330" width="200" height="180" fill="#0f151c" stroke="rgba(163,180,195,.10)" stroke-width="2"/>
  <rect x="1278" y="330" width="4" height="180" fill="#05070a"/><rect x="1180" y="418" width="200" height="4" fill="#05070a"/>
  <rect x="0" y="660" width="1600" height="340" fill="#06090d"/>
  <rect x="120" y="560" width="160" height="100" fill="#0b0d10" stroke="rgba(163,180,195,.08)" stroke-width="1"/>
  <rect class="stove-slot" x="150" y="612" width="100" height="14" fill="rgba(214,120,54,.55)"/>
  <rect x="190" y="400" width="20" height="160" fill="#0a0c0f"/>`,
  clinic: `<rect x="1200" y="250" width="170" height="330" fill="#121a22" stroke="rgba(163,180,195,.12)" stroke-width="2"/>
  <rect x="0" y="640" width="1600" height="360" fill="#070a0e"/>
  <rect x="1000" y="639" width="600" height="1" fill="rgba(163,180,195,.12)"/>
  <rect x="1380" y="560" width="180" height="80" fill="#0a0d11" stroke="rgba(163,180,195,.08)" stroke-width="1"/>
  <rect x="1450" y="440" width="40" height="120" fill="#0a0d11"/><rect x="1420" y="425" width="100" height="16" rx="3" fill="#0c1015" stroke="rgba(163,180,195,.10)" stroke-width="1"/>`,
  shed: `<rect x="0" y="660" width="1600" height="340" fill="#06080b"/>
  <rect x="1180" y="300" width="260" height="340" fill="rgba(217,211,196,.10)" transform="rotate(-2 1310 470)"/>
  <rect x="1230" y="330" width="160" height="130" fill="rgba(217,211,196,.06)" transform="rotate(-2 1310 470)"/>
  <g stroke="rgba(217,211,196,.14)" stroke-width="1"><path d="M1200 520 H1420 M1200 545 H1400 M1200 570 H1410 M1200 595 H1340"/></g>
  <rect x="1100" y="560" width="44" height="100" fill="#080b0f"/><rect x="1090" y="552" width="64" height="10" fill="#0c1015"/>`,
  hall: `<rect x="0" y="640" width="1600" height="360" fill="#060809"/>
  <path d="M1120 560 L1560 520 L1560 640 L1120 640 Z" fill="#04060a"/>
  <path d="M1120 560 L1560 520" stroke="rgba(163,180,195,.14)" stroke-width="2"/>
  <g fill="#0a0c0f"><rect x="1140" y="640" width="20" height="90"/><rect x="1530" y="640" width="20" height="90"/></g>
  <circle class="hall-bulb" cx="800" cy="150" r="8" fill="rgba(232,200,140,.55)"/><rect x="798" y="0" width="4" height="142" fill="#0a0c0f"/>`,
  room: `<rect x="0" y="660" width="1600" height="340" fill="#070a0e"/>
  <rect x="1220" y="300" width="180" height="220" fill="#0f151c" stroke="rgba(163,180,195,.10)" stroke-width="2"/>
  <path d="M1220 300 L1220 520 L1260 520 C 1250 450, 1255 370, 1262 300 Z" fill="rgba(163,180,195,.06)"/>
  <rect x="1160" y="330" width="240" height="300" fill="rgba(217,211,196,.05)" transform="rotate(-1 1280 480)"/>
  <path d="M1460 660 C 1455 600, 1452 520, 1462 440 C 1468 400, 1480 390, 1486 420 C 1490 500, 1486 600, 1490 660 Z" fill="#04060a"/>
  <ellipse cx="1478" cy="640" rx="36" ry="22" fill="#04060a"/>`,
  depot: `<rect x="0" y="640" width="1600" height="360" fill="#05080c"/>
  <path d="M1200 640 L1600 640 L1600 380 L1230 400 Z" fill="#04060a"/>
  <rect x="1240" y="430" width="300" height="120" fill="#0a0e13"/>
  <g class="headlights"><ellipse cx="1260" cy="600" rx="34" ry="14" fill="rgba(230,240,250,.18)"/><ellipse cx="1540" cy="600" rx="34" ry="14" fill="rgba(230,240,250,.18)"/></g>
  <rect x="0" y="700" width="1600" height="2" fill="rgba(163,180,195,.08)"/>`,
  shelter: `<rect x="0" y="640" width="1600" height="360" fill="#05070a"/>
  <rect x="0" y="700" width="1600" height="3" fill="rgba(163,180,195,.10)"/>
  <rect x="1240" y="380" width="260" height="260" fill="none" stroke="rgba(163,180,195,.14)" stroke-width="3"/>
  <rect x="1240" y="380" width="260" height="20" fill="#0a0d11"/>
  <rect x="1370" y="120" width="6" height="260" fill="#0a0c0f"/><rect x="1340" y="110" width="66" height="14" rx="3" fill="#0c1015"/>`,
  road: `<rect x="0" y="660" width="1600" height="340" fill="#070a0e"/>
  <path d="M0 660 C 400 640, 800 650, 1600 630 L1600 700 L0 700 Z" fill="#0a0d11"/>
  <g fill="#04060a">${[900, 1000, 1100, 1200, 1300, 1400, 1500].map((x) => `<rect x="${x}" y="${560 - (x - 900) / 10}" width="6" height="${100 + (x - 900) / 10}"/>`).join('')}</g>`,
  beach: '',
  card: '',
  ambient: '',
};

export const propSvg = (variant: SetVariant, phone: boolean): string => {
  const prop = PROPS[variant];
  if (prop === undefined || prop.length === 0) return '';
  return `<svg class="set-svg" viewBox="0 0 1600 1000" preserveAspectRatio="${PAR(phone)}" aria-hidden="true" focusable="false">${prop}</svg>`;
};

/** The variants drawn with the wharf set (plus its framing class). */
export const isWharfVariant = (variant: SetVariant): boolean =>
  variant === 'wharf' || variant === 'hornroom' || variant === 'unit' || variant === 'beach';
