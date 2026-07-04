/**
 * Derived resolvers — the door through which the memory package's axes reach
 * the engine's condition language ({ op: 'derived.gte', key: 'trust:priya' }).
 *
 * Keys: '<axis>:<character>' for every axis × every cast member.
 */

import { CHARACTERS } from '@not-here/engine';
import type {
  CharacterId,
  DerivedResolver,
  DerivedResolvers,
  WorldState,
} from '@not-here/engine';
import { AXES, axisValue, DEFAULT_AXIS_WEIGHTS } from './axes.ts';
import type { AxisId, AxisWeightRule } from './axes.ts';

/** Canonical resolver key for an axis on a character, e.g. 'warmth:dianne'. */
export const derivedKey = (axis: AxisId, who: CharacterId): string => `${axis}:${who}`;

/**
 * Build the full resolver map: 'trust:<char>', 'warmth:<char>', 'fear:<char>'
 * for all six characters. Pass a custom weight table to rebalance without
 * touching code.
 */
export const makeResolvers = (
  weights: readonly AxisWeightRule[] = DEFAULT_AXIS_WEIGHTS,
): DerivedResolvers =>
  Object.fromEntries(
    CHARACTERS.flatMap((who) =>
      AXES.map((axis): readonly [string, DerivedResolver] => [
        derivedKey(axis, who),
        (state: WorldState) => axisValue(state, who, axis, weights),
      ]),
    ),
  );
