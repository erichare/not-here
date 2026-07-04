/**
 * Salience-scored dialogue rule matcher — the Left 4 Dead / Firewatch model.
 *
 * Writers author only the specific reactions they care about; specificity
 * ranking plus a guaranteed zero-condition fallback per (speaker, slot)
 * absorb every other combination. Nobody writes the cross-product.
 */

import { evaluate } from '@not-here/engine';
import type {
  CharacterId,
  Cond,
  DerivedResolvers,
  FactTag,
  WorldState,
} from '@not-here/engine';

export interface DialogueRule {
  readonly id: string;
  readonly speaker: CharacterId;
  /** Reactive slot, e.g. 'greeting', 'wake-verdict', 'idle'. */
  readonly slot: string;
  /** Engine condition that must pass for this rule to be eligible. */
  readonly when?: Cond;
  /** Tags the speaker must KNOW a matching fact for (witnessed or gossiped). */
  readonly requires?: readonly FactTag[];
  readonly text: string;
  /** Writer-tuned bonus added to specificity for priority nudging. */
  readonly salience?: number;
}

/** Count the leaf conditions in a Cond tree ('always' constrains nothing). */
const condCount = (cond: Cond): number => {
  switch (cond.op) {
    case 'always':
      return 0;
    case 'all':
    case 'any':
      return cond.of.reduce((n, c) => n + condCount(c), 0);
    case 'not':
      return condCount(cond.of);
    default:
      return 1;
  }
};

/** A fallback rule has no conditions at all — it always passes. */
export const isFallback = (rule: DialogueRule): boolean =>
  rule.when === undefined && (rule.requires === undefined || rule.requires.length === 0);

/** specificity = leaf-condition count + required-tag count + salience bonus. */
export const specificity = (rule: DialogueRule): number =>
  (rule.when === undefined ? 0 : condCount(rule.when)) +
  (rule.requires?.length ?? 0) +
  (rule.salience ?? 0);

const speakerKnowsTag = (
  state: WorldState,
  speaker: CharacterId,
  tag: FactTag,
): boolean => {
  const known = new Set(state.knownBy[speaker]);
  return state.facts.some((f) => f.tag === tag && known.has(f.id));
};

const rulePasses = (
  rule: DialogueRule,
  state: WorldState,
  derived: DerivedResolvers,
): boolean => {
  if (rule.when !== undefined && !evaluate(rule.when, state, derived)) return false;
  return (rule.requires ?? []).every((tag) => speakerKnowsTag(state, rule.speaker, tag));
};

/** Highest specificity wins; ties break to the lexicographically smaller id. */
const pickBest = (candidates: readonly DialogueRule[]): DialogueRule =>
  candidates.reduce((best, rule) => {
    const a = specificity(best);
    const b = specificity(rule);
    if (b > a) return rule;
    if (b < a) return best;
    return rule.id < best.id ? rule : best;
  });

/**
 * Select the line a speaker says in a slot, given world state.
 *
 * - Only rules whose `when` passes AND whose `requires` tags the speaker
 *   actually knows are eligible.
 * - The most specific eligible rule wins (deterministic tie-break by id).
 * - A zero-condition fallback MUST exist per (speaker, slot); it is chosen
 *   last — only when no conditional rule passes.
 *
 * Throws a clear error naming the (speaker, slot) if no fallback exists,
 * even when a conditional rule currently passes — the gap is a content bug
 * that would otherwise surface only in some future save.
 */
export const selectLine = (
  rules: readonly DialogueRule[],
  speaker: CharacterId,
  slot: string,
  state: WorldState,
  derived: DerivedResolvers,
): DialogueRule => {
  const pool = rules.filter((r) => r.speaker === speaker && r.slot === slot);
  const fallbacks = pool.filter(isFallback);
  if (fallbacks.length === 0) {
    throw new Error(
      `No fallback dialogue rule for (speaker "${speaker}", slot "${slot}") — ` +
        'every (speaker, slot) pair must include a rule with no when/requires.',
    );
  }
  const passing = pool.filter(
    (rule) => !isFallback(rule) && rulePasses(rule, state, derived),
  );
  return passing.length > 0 ? pickBest(passing) : pickBest(fallbacks);
};
