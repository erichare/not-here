/**
 * Act 2 shared conditions and the presence-decay engine
 * (design/act2-beats.md §Presence decay, §Contract).
 *
 * Every Act 2 night scene (Days 8–19) spreads NIGHT_DECAY into its onEnter.
 * The block is authored ONCE here so the rotation, the offset consumption,
 * and the flag hygiene cannot drift between day files. The decay tell is
 * prose, not a toast: night scenes gate ONE diegetic line per decayed stat
 * on the decayedFlesh / decayedName / decayedEcho conditions below.
 */

import type { Cond, Effect } from '@not-here/engine';

// ——— The two tracks (set Night 7; every night branches on them) ———

export const hornOn: Cond = { op: 'flag', key: 'horn-on' };
export const hornStopped: Cond = { op: 'flag', key: 'horn-stopped' };

// ——— Verdict and route staging (set at the potluck and after) ———

export const defendedVerdict: Cond = {
  op: 'flag',
  key: 'potluck:verdict',
  value: 'defended',
};
export const exiledVerdict: Cond = {
  op: 'flag',
  key: 'potluck:verdict',
  value: 'exiled',
};
export const knowsTruth: Cond = { op: 'flag', key: 'knows-truth' };
export const locksHouse: Cond = { op: 'flag', key: 'dianne:locks-house' };
export const lullabyTaken: Cond = { op: 'flag', key: 'lullaby-taken' };
export const letterMemoryTaken: Cond = { op: 'flag', key: 'letter-memory-taken' };

// ——— Decay tells (which stat paid tonight; 'none' = an offset consumed) ———

export const decayedFlesh: Cond = { op: 'flag', key: 'decay:tonight', value: 'flesh' };
export const decayedName: Cond = { op: 'flag', key: 'decay:tonight', value: 'name' };
export const decayedEcho: Cond = { op: 'flag', key: 'decay:tonight', value: 'echo' };

/** Any of the day's offsets — being fed, named, or remembered — was earned. */
const anyOffset: Cond = {
  op: 'any',
  of: [
    { op: 'flag', key: 'today:fed' },
    { op: 'flag', key: 'today:named' },
    { op: 'flag', key: 'today:remembered' },
  ],
};

/**
 * The canonical nightly decay block (horn-stopped track only). Rotation:
 * unset/'flesh' → flesh, 'name' → name, 'echo' → echo; the stat that pays
 * is recorded in decay:tonight for the prose tell, and the rotation
 * advances only when a stat actually pays. Offsets are cleared every
 * night on BOTH tracks so no stale credit survives a day boundary.
 */
export const NIGHT_DECAY: readonly Effect[] = [
  {
    op: 'when',
    cond: hornStopped,
    then: [
      {
        op: 'when',
        cond: anyOffset,
        then: [{ op: 'flag.set', key: 'decay:tonight', value: 'none' }],
        else: [
          {
            op: 'when',
            cond: { op: 'flag', key: 'decay:next', value: 'name' },
            then: [
              { op: 'stat.add', stat: 'name', value: -1 },
              { op: 'flag.set', key: 'decay:tonight', value: 'name' },
              { op: 'flag.set', key: 'decay:next', value: 'echo' },
            ],
            else: [
              {
                op: 'when',
                cond: { op: 'flag', key: 'decay:next', value: 'echo' },
                then: [
                  { op: 'stat.add', stat: 'echo', value: -1 },
                  { op: 'flag.set', key: 'decay:tonight', value: 'echo' },
                  { op: 'flag.set', key: 'decay:next', value: 'flesh' },
                ],
                else: [
                  { op: 'stat.add', stat: 'flesh', value: -1 },
                  { op: 'flag.set', key: 'decay:tonight', value: 'flesh' },
                  { op: 'flag.set', key: 'decay:next', value: 'name' },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
  { op: 'flag.set', key: 'today:fed', value: false },
  { op: 'flag.set', key: 'today:named', value: false },
  { op: 'flag.set', key: 'today:remembered', value: false },
];

/**
 * A missed-scene motif detune (same helper Act 1's day files carry).
 * Its visual twin is a prose paragraph in the SAME scene — the act2 lint
 * pins the pairing; never emit a duplicate tell.visual alongside it.
 */
export const detune = (pattern: string): Effect => ({
  op: 'emit',
  event: { kind: 'music.detune', pattern, cents: -50 },
});
