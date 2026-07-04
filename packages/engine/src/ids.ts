/**
 * Branded ID types. Codegen (Phase 1) will narrow these to unions of actual
 * content IDs so every scene/flag/stat/cue reference is compile-time checked.
 */

export type SceneId = string & { readonly __brand?: 'SceneId' };
export type ChoiceId = string & { readonly __brand?: 'ChoiceId' };
export type CueId = string & { readonly __brand?: 'CueId' };
export type FactTag = string & { readonly __brand?: 'FactTag' };

export type CharacterId = 'dora' | 'elias' | 'ivy' | 'sam' | 'maud' | 'tam';

export type StatId = 'flesh' | 'name' | 'echo' | 'undertow';

export type SlotId = 'morning' | 'afternoon' | 'evening' | 'night';

export const CHARACTERS: readonly CharacterId[] = [
  'dora', 'elias', 'ivy', 'sam', 'maud', 'tam',
];

export const STATS: readonly StatId[] = ['flesh', 'name', 'echo', 'undertow'];

export const SLOTS: readonly SlotId[] = ['morning', 'afternoon', 'evening', 'night'];
