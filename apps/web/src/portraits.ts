import type { ScenePresentation } from '@not-here/engine';

export type PortraitCharacter = NonNullable<ScenePresentation['character']>;

export interface CharacterPortrait {
  readonly name: string;
  readonly src: string;
  readonly alt: string;
}

export const PORTRAITS = {
  barb: {
    name: 'Barb',
    src: '/art/portraits/barb.jpg',
    alt: 'Painted portrait of Barb, with silver-streaked hair, a work shirt, and an apron.',
  },
  dianne: {
    name: 'Dianne',
    src: '/art/portraits/dianne.jpg',
    alt: 'Painted portrait of Dianne, with swept-back hair graying at the temples, reading glasses, and a cardigan.',
  },
  sam: {
    name: 'Sam',
    src: '/art/portraits/sam.jpg',
    alt: 'Painted portrait of Sam, a young adult with dark hair and a hoodie.',
  },
  priya: {
    name: 'Priya',
    src: '/art/portraits/priya.jpg',
    alt: 'Painted portrait of Priya, with tied-back hair and a simple cardigan.',
  },
  wade: {
    name: 'Wade',
    src: '/art/portraits/wade.jpg',
    alt: 'Painted portrait of Wade, an older man with a weathered face, stubble, and a hooded coat.',
  },
  tam: {
    name: 'Tam',
    src: '/art/portraits/tam.jpg',
    alt: 'Painted portrait of Tam, with a broad, kind face and a cap.',
  },
  wren: {
    name: 'Wren',
    src: '/art/portraits/wren.jpg',
    alt: 'Painted portrait of Wren, with short dark hair, an olive coat, a rust-colored sweater, and a canvas shoulder strap.',
  },
} as const satisfies Readonly<Record<PortraitCharacter, CharacterPortrait>>;

export const portraitFor = (character?: string): CharacterPortrait | null =>
  character && Object.hasOwn(PORTRAITS, character)
    ? PORTRAITS[character as PortraitCharacter]
    : null;
