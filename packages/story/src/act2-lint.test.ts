/**
 * Act 2 invariant lint — mechanical sweeps over EVERY authored Act 2 surface
 * (scene paragraphs, choice labels, locked labels, dialogue rule texts).
 * Scope: DAY8–DAY19 scene arrays + the five Act 2 dialogue rule files ONLY.
 * Whole-game invariants (touch, 07:40) live in game-lint.test.ts.
 *
 * Enforced here, per design/act2-beats.md §Testing:
 *
 *  a. Title discipline — spoken 'not here' exactly TWICE (Barb's one
 *     warning, Night 11; Sam at the potluck, Night 13); written exactly
 *     ONCE inside @doc blocks (Priya's Day-9 intake page).
 *  b. Naming — 'Wren' exactly twice in prose (the potluck orchard man,
 *     defended verdict; Dianne on Day 16, gated on lullaby-taken) and once
 *     in @doc (the salutation of Dianne's unsent reply draft, Night 17).
 *     Dianne never names the player outside the lullaby-taken gate.
 *  c. Prose economy — warn over 120 words; fail over 150.
 *  d. Detune twinning — every music.detune has its prose twin in the SAME
 *     scene, pinned per scene in PROSE_TWINS (accessibility invariant).
 *  e. Day ladder — time.set covers days 9..20 exactly once each, owned by
 *     the dN-morning scenes and act2-end (day 8 is act1-end's; act1-lint
 *     pins it).
 *  f. Presence decay — the canonical NIGHT_DECAY block from act2-shared is
 *     spread BY REFERENCE into every night that owns the count, once per
 *     night, and never re-authored anywhere else.
 *  g. The EBUS card resurfaces in Act 2 with its double ring intact.
 *  h. The Return Pass — exactly four scenes carry recontext: true.
 *  i. Locked-option surface — no authored '·' glyph; a lockedLabel aches,
 *     never parrots.
 */

import { describe, expect, it } from 'vitest';

/** The story package's tsconfig lib omits DOM/Node; vitest supplies console. */
declare const console: { readonly warn: (message: string) => void };
import type { Effect, Scene } from '@not-here/engine';
import type { DialogueRule } from '@not-here/memory';
import { RULES as RULES_D89 } from './dialogue-days89.ts';
import { RULES as RULES_D1011 } from './dialogue-days1011.ts';
import { RULES as RULES_D1213 } from './dialogue-days1213.ts';
import { RULES as RULES_D1416 } from './dialogue-days1416.ts';
import { RULES as RULES_D1719 } from './dialogue-days1719.ts';
import { hornOn, hornStopped, NIGHT_DECAY } from './scenes/act2-shared.ts';
import { DAY8_SCENES } from './scenes/day8.ts';
import { DAY9_SCENES } from './scenes/day9.ts';
import { DAY10_SCENES } from './scenes/day10.ts';
import { DAY11_SCENES } from './scenes/day11.ts';
import { DAY12_SCENES } from './scenes/day12.ts';
import { DAY13_SCENES } from './scenes/day13.ts';
import { DAY14_SCENES } from './scenes/day14.ts';
import { DAY15_SCENES } from './scenes/day15.ts';
import { DAY16_SCENES } from './scenes/day16.ts';
import { DAY17_SCENES } from './scenes/day17.ts';
import { DAY18_SCENES } from './scenes/day18.ts';
import { DAY19_SCENES } from './scenes/day19.ts';
import {
  collectTexts,
  proseTexts,
  sceneEffectArrays,
  sceneProse,
  wordCount,
  type Sourced,
} from './lint-shared.ts';

const ACT2_SCENES: readonly Scene[] = [
  ...DAY8_SCENES,
  ...DAY9_SCENES,
  ...DAY10_SCENES,
  ...DAY11_SCENES,
  ...DAY12_SCENES,
  ...DAY13_SCENES,
  ...DAY14_SCENES,
  ...DAY15_SCENES,
  ...DAY16_SCENES,
  ...DAY17_SCENES,
  ...DAY18_SCENES,
  ...DAY19_SCENES,
];

const ACT2_RULES: readonly DialogueRule[] = [
  ...RULES_D89,
  ...RULES_D1011,
  ...RULES_D1213,
  ...RULES_D1416,
  ...RULES_D1719,
];

/** Every authored Act 2 text surface, with a source label for failures. */
const ALL_TEXTS: readonly Sourced[] = collectTexts(ACT2_SCENES, ACT2_RULES);

/** Prose only: paragraphs and lines, minus document artifacts and tokens. */
const PROSE_TEXTS: readonly Sourced[] = proseTexts(ALL_TEXTS);

const sceneById = (id: string): Scene => {
  const scene = ACT2_SCENES.find((s) => s.id === id);
  if (!scene) throw new Error(`act2-lint: missing scene ${id}`);
  return scene;
};

// ——— a. Title discipline ———

describe('a. title discipline — two spoken uses, one written use, pinned', () => {
  const TITLE = /not\s+here/gi;
  const hits = ALL_TEXTS.flatMap(({ source, text }) => {
    const count = (text.match(TITLE) ?? []).length;
    return count > 0 ? [{ source, text, count, doc: text.startsWith('@doc:') }] : [];
  });

  it("outside @doc blocks: exactly twice — Barb's one warning, then Sam at the potluck", () => {
    const spoken = hits.filter((h) => !h.doc);
    expect(spoken.map((h) => ({ source: h.source, count: h.count }))).toEqual([
      { source: 'd11-warning', count: 1 },
      { source: 'd13-verdict', count: 1 },
    ]);
    // Pin both to their beats: Frank, said to the register; Sam, standing.
    expect(spoken[0]?.text).toContain('My Frank came back, one winter.');
    expect(spoken[0]?.text).toContain('he was not here');
    expect(spoken[1]?.text).toContain('“That is not my sister. She’s not here.');
  });

  it("inside @doc blocks: exactly once — the corner shorthand of Priya's intake page", () => {
    const written = hits.filter((h) => h.doc);
    expect(written.map((h) => ({ source: h.source, count: h.count }))).toEqual([
      { source: 'd9-clinic', count: 1 },
    ]);
    expect(written[0]?.text).toContain('pt. not here for exam.');
  });
});

// ——— b. Naming ———

describe("b. naming — 'Wren' twice in prose, once in @doc, and Dianne's is gated", () => {
  const hits = ALL_TEXTS.filter(({ text }) => /\bWren\b/.test(text));
  const prose = hits.filter(({ text }) => !text.startsWith('@doc:'));
  const doc = hits.filter(({ text }) => text.startsWith('@doc:'));

  it('prose: exactly twice — the orchard man at the verdict, Dianne on Day 16', () => {
    expect(prose.map((h) => h.source)).toEqual(['d13-verdict', 'd16-morning']);
    expect(prose[0]?.text).toContain('“That’s Wren, son. Sit down.”');
    expect(prose[1]?.text).toContain('“Morning, Wren,”');
  });

  it('@doc: exactly once — the salutation of Dianne’s unsent reply draft', () => {
    expect(doc.map((h) => h.source)).toEqual(['d17-reveal-2']);
    expect(doc[0]?.text.startsWith('@doc:\nWren —')).toBe(true);
  });

  it("Dianne's paragraph carries the lullaby-taken gate — her only use, ever", () => {
    const morning = sceneById('d16-morning');
    if (morning.prose.kind !== 'inline') throw new Error('d16-morning is not inline');
    const block = morning.prose.paragraphs.find((p) => /\bWren\b/.test(p.text));
    expect(block).toBeDefined();
    expect(JSON.stringify(block?.when)).toContain('"lullaby-taken"');
  });

  it("the orchard man's line is gated on the defended verdict", () => {
    const verdict = sceneById('d13-verdict');
    if (verdict.prose.kind !== 'inline') throw new Error('d13-verdict is not inline');
    const block = verdict.prose.paragraphs.find((p) => /\bWren\b/.test(p.text));
    expect(block).toBeDefined();
    expect(JSON.stringify(block?.when)).toContain('"defended"');
  });

  it('no Act 2 Dianne dialogue rule ever says the name', () => {
    for (const rule of ACT2_RULES) {
      if (rule.speaker !== 'dianne') continue;
      expect(/\bWren\b/.test(rule.text), `Dianne names the player in rule:${rule.id}`).toBe(false);
    }
  });
});

// ——— c. Prose economy ———

describe('c. prose economy — 30–90 word beats; warn >120, fail >150', () => {
  const over120 = PROSE_TEXTS.map((t) => ({ ...t, words: wordCount(t.text) })).filter(
    (t) => t.words > 120,
  );

  it('no paragraph exceeds 150 words', () => {
    const over150 = over120.filter((t) => t.words > 150);
    expect(
      over150.map((t) => `${t.source} (${t.words}w)`),
      'trim these paragraphs — they are past the hard cap',
    ).toEqual([]);
  });

  it('warn-list: paragraphs over 120 words', () => {
    if (over120.length > 0) {
      console.warn(
        `[act2-lint] ${over120.length} paragraph(s) over 120 words:\n` +
          over120.map((t) => `  ${t.source}: ${t.words} words`).join('\n'),
      );
    }
    expect(over120.length).toBeGreaterThanOrEqual(0); // reporting only
  });
});

// ——— d. Detune twinning ———

/**
 * Prose is the canonical visual twin (fix-03; act1-lint carries the same
 * table for Act 1). Every Act 2 scene that emits a music.detune appears
 * here with the twin substrings its prose must carry. Twins are per-branch
 * — only one renders per run — so the check reads raw scene text.
 * Pinned from the author manifests and verified against the files.
 *
 * pt2-fix-01: nights 8–11 each hear the flatness in their own words —
 * night 8 keeps the establishing Act-1 descriptors; nights 9, 10, and 11
 * pin fresh images plus the character-keyed fragment identities, so the
 * twin still surfaces nightly without pinning exact-phrase sameness
 * across the ritual's four evenings.
 */
const PROSE_TWINS: Readonly<Record<string, readonly string[]>> = {
  'd8-evening': ['a shade flat', 'a quarter-turn flat', 'a quarter-tone flat'],
  'd9-evening': ['a hair under true', 'piano notes', 'idle, road, idle'],
  'd10-evening': ['a breath flat', 'music-box register', 'upright-piano notes', 'the horn’s fifth bar'],
  'd11-evening': ['a finger’s width flat', 'music-box phrase'],
  'd16-evening': ['a quarter-tone flat', 'a shade flat'],
  'd17-evening': ['a shade flat', 'a quarter-tone flat'],
};

describe('d. detune twinning — every lie has its visual twin', () => {
  it('each music.detune emit is twinned: adjacent tell.visual, or pinned prose', () => {
    for (const scene of ACT2_SCENES) {
      for (const effects of sceneEffectArrays(scene)) {
        effects.forEach((effect, i) => {
          if (effect.op !== 'emit' || effect.event.kind !== 'music.detune') return;
          const next = effects[i + 1];
          const adjacent = next?.op === 'emit' && next.event.kind === 'tell.visual';
          if (adjacent) return;
          const twins = PROSE_TWINS[scene.id];
          expect(
            twins,
            `music.detune in ${scene.id} (index ${i}) has no adjacent tell.visual and no PROSE_TWINS entry`,
          ).toBeDefined();
          for (const twin of twins ?? []) {
            expect(
              sceneProse(scene).includes(twin),
              `${scene.id}: prose twin "${twin}" missing`,
            ).toBe(true);
          }
        });
      }
    }
  });

  it('no scene carries a redundant toast twin — the prose owns it', () => {
    for (const scene of ACT2_SCENES) {
      if (PROSE_TWINS[scene.id] === undefined) continue;
      const tells = sceneEffectArrays(scene)
        .flat()
        .filter((e) => e.op === 'emit' && e.event.kind === 'tell.visual');
      expect(tells, `${scene.id} re-emits its prose twin as a toast`).toEqual([]);
    }
  });

  it('pt2-fix-01: the ritual nights never share a flatness image (8–11)', () => {
    // Same fact, four ways of hearing it: each evening's descriptor for the
    // detuned motif is its own, so the nightly ritual never reads verbatim.
    const RITUAL_IMAGES: Readonly<Record<string, readonly string[]>> = {
      'd8-evening': ['a shade flat', 'a quarter-turn flat', 'a quarter-tone flat'],
      'd9-evening': ['a hair under true'],
      'd10-evening': ['a breath flat'],
      'd11-evening': ['a finger’s width flat'],
    };
    const nights = Object.keys(RITUAL_IMAGES);
    for (const owner of nights) {
      for (const phrase of RITUAL_IMAGES[owner] ?? []) {
        expect(
          sceneProse(sceneById(owner)).includes(phrase),
          `${owner}: missing its own flatness image "${phrase}"`,
        ).toBe(true);
        for (const other of nights) {
          if (other === owner) continue;
          expect(
            sceneProse(sceneById(other)).includes(phrase),
            `${other} reuses ${owner}'s flatness image "${phrase}"`,
          ).toBe(false);
        }
      }
    }
  });

  it('the retellings keep detuning through the act (the lint is not vacuous)', () => {
    const emitters = new Set(
      ACT2_SCENES.filter((scene) =>
        sceneEffectArrays(scene)
          .flat()
          .some((e) => e.op === 'emit' && e.event.kind === 'music.detune'),
      ).map((s) => s.id),
    );
    expect([...emitters].sort()).toEqual(Object.keys(PROSE_TWINS).sort());
  });
});

// ——— e. The day ladder ———

describe('e. day ladder — time.set covers days 9..20, each exactly once', () => {
  it('each morning owns its day; act2-end owns day 20; day 8 stays act1-end’s', () => {
    const owners = new Map<number, string[]>();
    for (const scene of ACT2_SCENES) {
      for (const effects of sceneEffectArrays(scene)) {
        for (const effect of effects) {
          if (effect.op !== 'time.set' || effect.day === undefined) continue;
          owners.set(effect.day, [...(owners.get(effect.day) ?? []), scene.id]);
        }
      }
    }
    expect(Object.fromEntries([...owners.entries()].sort((a, b) => a[0] - b[0]))).toEqual({
      9: ['d9-morning'],
      10: ['d10-morning'],
      11: ['d11-morning'],
      12: ['d12-morning'],
      13: ['d13-morning'],
      14: ['d14-morning'],
      15: ['d15-morning'],
      16: ['d16-morning'],
      17: ['d17-morning'],
      18: ['d18-morning'],
      19: ['d19-morning'],
      20: ['act2-end'],
    });
  });
});

// ——— f. Presence decay — the canonical block, spread by reference ———

/**
 * The scenes that own each night's count. One per night, except: Night 13
 * splits on the verdict (both variants carry it); Night 15's set piece
 * (d15-night, the harvest) defers to d15-night-2; Night 17's letter route
 * (d17-letter) is entered INSTEAD of d17-night, so both carry it. The Ash
 * scenes and the reveal interstitials set no day and own no count.
 */
const DECAY_NIGHTS: readonly string[] = [
  'd8-night',
  'd9-night',
  'd10-night',
  'd11-night',
  'd12-night',
  'd13-night-defended',
  'd13-night-exiled',
  'd14-night',
  'd15-night-2',
  'd16-night',
  'd17-night',
  'd17-letter',
  'd18-night',
  'd19-night',
];

describe('f. presence decay — NIGHT_DECAY spread verbatim, once per night', () => {
  it('every counting night includes the exact shared effect objects in onEnter', () => {
    for (const id of DECAY_NIGHTS) {
      const onEnter = sceneById(id).onEnter ?? [];
      for (const effect of NIGHT_DECAY) {
        expect(
          onEnter.includes(effect),
          `${id}: onEnter does not spread NIGHT_DECAY by reference`,
        ).toBe(true);
      }
    }
  });

  it('the block is never re-authored: only the pinned nights advance the rotation', () => {
    const writers = ACT2_SCENES.filter((scene) =>
      sceneEffectArrays(scene)
        .flat()
        .some((e) => e.op === 'flag.set' && e.key === 'decay:next'),
    ).map((s) => s.id);
    expect(writers.sort()).toEqual([...DECAY_NIGHTS].sort());
  });
});

// ——— f2. Night cue grammar — the stopped track is silent, every night ———

/**
 * act2-beats §The two tracks: horn-stopped means NO music under any night
 * scene — and evening cues loop, so silence requires an explicit music.stop.
 * Every counting night must pair the horn-on foghorn-312 emit with a
 * horn-stopped music.stop (either an explicit hornStopped when, or the
 * else-branch of the hornOn when).
 */
describe('f2. night cues — foghorn-312 on horn-on, music.stop on horn-stopped', () => {
  const isStop = (e: Effect): boolean => e.op === 'emit' && e.event.kind === 'music.stop';
  const isHorn = (e: Effect): boolean =>
    e.op === 'emit' && e.event.kind === 'music.cue' && e.event.cue === 'foghorn-312';
  const condIs = (cond: unknown, expected: unknown): boolean =>
    JSON.stringify(cond) === JSON.stringify(expected);

  it('every counting night stops the loop on the stopped track', () => {
    for (const id of DECAY_NIGHTS) {
      const onEnter = sceneById(id).onEnter ?? [];
      const stops = onEnter.some(
        (e) =>
          e.op === 'when' &&
          ((condIs(e.cond, hornStopped) && e.then.some(isStop)) ||
            (condIs(e.cond, hornOn) && (e.else ?? []).some(isStop))),
      );
      expect(stops, `${id}: no music.stop on the horn-stopped track`).toBe(true);
    }
  });

  it('every counting night calls the horn on the horn-on track', () => {
    for (const id of DECAY_NIGHTS) {
      const onEnter = sceneById(id).onEnter ?? [];
      const horn = onEnter.some(
        (e) => e.op === 'when' && condIs(e.cond, hornOn) && e.then.some(isHorn),
      );
      expect(horn, `${id}: no foghorn-312 on the horn-on track`).toBe(true);
    }
  });
});

// ——— g. The EBUS card resurfaces ———

describe('g. the EBUS card — the clock is still on screen in Act 2', () => {
  const cardParagraphs = ACT2_SCENES.flatMap((scene) => {
    if (scene.prose.kind !== 'inline') return [];
    return scene.prose.paragraphs.flatMap((p) =>
      p.text.includes('EBUS — WINTER SCHEDULE') ? [{ source: scene.id, block: p }] : [],
    );
  });

  it('appears at least once (the re-taped card, potluck morning)', () => {
    expect(cardParagraphs.length).toBeGreaterThanOrEqual(1);
    expect(cardParagraphs.map((c) => c.source)).toContain('d13-morning');
  });

  it('every copy circles the 28th twice', () => {
    for (const { source, block } of cardParagraphs) {
      expect(block.text.includes('(( Fri 28 Nov'), `no ring on the card in ${source}`).toBe(true);
    }
  });
});

// ——— h. The Return Pass ———

describe('h. the Return Pass — exactly four recontext scenes', () => {
  it('recontext: true appears on exactly the four Day-18 beats', () => {
    const marked = ACT2_SCENES.filter((s) => s.recontext === true).map((s) => s.id);
    expect(marked.sort()).toEqual(['d18-beach', 'd18-corkboard', 'd18-kettle', 'd18-wharf']);
  });
});

// ——— i. Locked-option surface ———

describe('i. locked labels — one glyph (the renderer’s), real ache', () => {
  const lockedLabels = ACT2_SCENES.flatMap((scene) =>
    scene.choices.flatMap((c) =>
      c.lockedLabel !== undefined
        ? [{ source: `${scene.id}#${c.id}`, label: c.label, lockedLabel: c.lockedLabel }]
        : [],
    ),
  );

  it('no lockedLabel starts with the renderer’s glyph', () => {
    for (const { source, lockedLabel } of lockedLabels) {
      expect(lockedLabel.startsWith('·'), `double glyph in ${source}: ${lockedLabel}`).toBe(false);
    }
  });

  it('no lockedLabel parrots its open label verbatim', () => {
    for (const { source, label, lockedLabel } of lockedLabels) {
      expect(lockedLabel === label, `no ache in ${source}: ${lockedLabel}`).toBe(false);
    }
  });
});

// ——— j. Clue #5 — "you always hummed the end different" ———

describe('j. clue #5 — the end hummed different, three voices, pinned', () => {
  // twist-recontext-table row 5: said by three characters across Acts 1–2.
  // Act 2 carries all three: Wade at the gauge (Day 8, horn-on, fifth-bar
  // branch), Dianne over the humming (Night 15, every route), Barb reading
  // the register back (Day 19, every route — reported, in Dianne's name).
  const PHRASE = /hummed the end different/;

  it('exactly three plants, one per speaker scene', () => {
    const hits = ALL_TEXTS.filter(({ text }) => PHRASE.test(text));
    expect(hits.map((h) => h.source).sort()).toEqual([
      'd15-night',
      'd19-evening',
      'd8-wharf-2',
    ]);
  });

  it('at least two of the three are unconditional (every route hears it twice)', () => {
    const unconditional = [sceneById('d15-night'), sceneById('d19-evening')].map((scene) => {
      if (scene.prose.kind !== 'inline') throw new Error(`${scene.id}: not inline`);
      return scene.prose.paragraphs.find((p) => PHRASE.test(p.text));
    });
    for (const block of unconditional) {
      expect(block).toBeDefined();
      expect(block?.when).toBeUndefined();
    }
  });
});
