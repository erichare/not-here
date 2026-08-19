# Act 3 Audition Session — Checklist

Per `design/act3-plan.md` §Cues: *"Ship all Act 3 scenes wired to EXISTING cues + music.layer/detune/stop first; every new cue behind a flag until auditioned."* Audition order below is the plan's week-1 order. Status verified against the tree on 2026-08-19.

Legend: ✅ ready to audition · 🟡 partially prepped · 🔴 not started · ⛔ blocked

---

## 1. The three sixth-bar candidate variants — ✅ READY

*The act's only genuinely new melodic material; scene prose hardens around them.*

- **Score:** complete — `packages/music/scores/sixthbar-candidates.ts` (never / forgot / door, keyed to `n1:goodbye`; solo + in-context arrangements).
- **Renders:** ✅ on disk — `auditions/sixthbar-{never,forgot,door}.wav` (5.9 s solo) and `-context.wav` (28.5 s, bars 1–5 as shipped + candidate in bar 6 over sea and drone).
- **Prep:** audition brief delivered — `sixth-bar-audition-brief.pdf` (notation, harmonic analysis, listening prompts).
- **Action:** listen, approve or send back each variant. **Everything downstream keys off this.**

## 2. act3-ensemble chord.add mixer — ✅ READY TO AUDITION

*Fragments re-entering nightly as confessions land (Sam bar 5 → Dianne bars 1–2 → Barb chords → Priya bar 4 → Tam pulse → Wade bar 3 + drone — cascade order per act3-plan).*

- **Score:** ✅ `packages/music/scores/act3-ensemble.ts` — 7 loop-synced layers (sea bed + 6 fragments, one verse of 6/8 at 144), `ACT3_FRAGMENT_ORDER` cascade, authored per-layer gain map, `act3EnsembleAtChord(n)` staging. Bar 6 stays a rest (the sixth bar belongs to the finale).
- **Mixers:** ✅ web (`apps/web/src/mixer.ts` pure state + `audio.ts` per-layer looped sources through GainNodes, 2 s ramps, scene-cue mutual exclusion, `music.detune` rides `source.detune`) and CLI (`apps/cli/src/audio.ts` per-layer afplay loops with `-v` gain, respawn-on-exit). Both ignore unknown patterns (day-15 `lullaby` untouched). Tested: `mixer.test.ts`, `act3-ensemble.test.ts`, CLI ensemble suite — 38 new tests green, no regressions.
- **Renders:** ✅ on disk — `auditions/act3-ensemble-<layer>.wav` (7 × 15.00 s loops, sample-exact), `act3-ensemble.wav` (full mix loop), `act3-ensemble-progression.wav` (105 s chord 0→6 reel, 1 s crossfades).
- **Story wiring:** ✅ confessions fire `chord.add` (→ `music.chord`, the giver-hears-it moment) and the three plain night doors (`d20-night` / `d21-night` / `d22-night`) re-assert the count at 3:12 — horn on + fragments banked → the ensemble replaces the solo `foghorn-312`; horn-stopped nights keep their silence. Tested in `day20.test.ts`, `day21.test.ts`, `day22.test.ts`.
- **Action:** listen to the progression reel (or a live run), approve the cascade balance.

## 3. Priya's bar-4 live un-invert crossfade — 🔴 NOT STARTED

*On letter-memory-NOT-taken runs, bar 4 un-inverts live mid-scene (plan: pre-rendered crossfade, requires approval).*

- **Exists:** `cuePriyaTheme` ships the inverted turn (`turn-inverted` pattern, `cues-act1.ts:183`).
- **Gap:** no un-inverted variant of bar 4 exists, and the renderer has no crossfade capability — `render.ts` renders static note data; a crossfade is a new feature (or a pre-rendered A/B pair the mixer blends).
- **Action:** author the right-side-up bar 4, decide crossfade mechanism (renderer feature vs. pre-rendered blend), render for audition.

## 4. Bus-stop tempo-as-dread fixed pulse — 🔴 NOT STARTED

*Enters at Day-23 03:12 and holds its fixed pulse to the last screen (plan: requires approval).*

- **Exists:** Tam's pitchless ostinato material in `cueTamTheme` to derive from.
- **Gap:** no cue authored; nothing in `scores/`.
- **Action:** author the cue, render, audition. Note the plan's determinism rule: the pulse is an authored beat, never wall-clock.

## 5. Wren, Again title arrangement — 🟡 MECHANIC READY, CUE NOT AUTHORED

*The title arrangement with the melody detuned a quarter-tone under the town's waving — the lie-detune turned on the whole town at once.*

- **Exists:** per-note `detune` (cents) is fully supported in the renderer (`types.ts:76`, `midiToHz`) and already shipped as the lie-detune tell (`cues-act1.ts:292–294`); the title arrangement (`foghorn-song.ts`) exists to derive from. Story-side, `act3-lint` already enforces detune/prose twinning.
- **Gap:** the −50 cent variant arrangement itself is not authored.
- **Action:** author the detuned-title variant, render, audition.

## 6. The Long Winter 3:12 — ⛔ BLOCKED

*Pending the sixth-bar rendering ruling.*

- **Ruling 3 (locked):** the only sixth bar ever rendered is the player's — Long Winter's 3:12 must be re-staged as **the attempt, not the song**. Its cue audition follows item 1's approval.
- **Action:** after item 1 lands, re-stage the scene beat, then author and render the cue.

## 7. horn-on crown: foghorn-312 regained-conviction variant — 🟡 BASE EXISTS, VARIANT NOT AUTHORED

*A new rendering of an existing cue — auditioned with item 2's mixer work.*

- **Exists:** `cueFoghorn312` shipped and rendered (`auditions/foghorn-312.wav`).
- **Gap:** the regained-conviction variant (post-`conf:wade`, melodic conviction restored) is not authored.
- **Action:** author the variant; audition together with item 2 since the crown's mix depends on the ensemble mixer.

---

## Session shape suggested by dependency order

1. **Item 1 first, alone** — it gates item 6 and hardens Act 3 prose. (Brief: `sixth-bar-audition-brief.pdf`.)
2. **Items 2 + 7 together** — the crown variant is meaningless without the ensemble mix it sits in. Item 2's mixer and renders are ready; item 7's variant still needs authoring.
3. **Items 3, 4, 5** — independent once authored; item 5 is closest to ready (renderer support already shipped).
4. **Item 6 last** — after item 1's ruling is applied to the re-staged beat.

## Supporting machinery already shipped (no action needed)

- `music.stop` silence semantics — hall goes silent when Sam stands; horn-stopped nights are cueless (tested, `day1213.test.ts`).
- `music.detune` emits with prose twins — lint-enforced (`act3-lint.test.ts`), e.g. −50 cents on Tam/Barb fragments in Day 21.
- Caption parity — every audio tell has a first-class visual twin (`captions.ts`); all auditions above need their visual twins pinned before prose hardens.
