# NOT HERE — implementation and sample review

Status: revised story implemented; the creator approved the sample on September 7 and its art and music have now been expanded. This is not a claim that every human acceptance criterion has passed.

## Delivered

- Revised canon, character intentions, chronological chapter blueprint, clue placements and explicit ending contracts. Earlier canon is preserved under design/original.
- A separate revised browser/CLI edition. The beach opening, chosen name, ordinary closing/repair scenes, earlier letters, bounded Wren exchange and final-act preparations lead to all seven playable endings.
- A zero-confession hopeful route, own-name departure, voluntary finite life, optional original music, deliberate impersonation, informed Ash, and warned collapse with saved rewind. Theft facts are not repaired by ending selection.
- Nine painted locations, four major-scene compositions, a work-related Kettle variant, and Wren’s arrival portrait. Existing ink cast sketches recur. Typed locations, light, artifacts, observations and staging are shared story data.
- Notebook, spatial town map and current visit opportunities, recent pages, accessible document text, default instant prose, optional paced paragraphs, text size and keyboard controls. Reduced motion retains art.
- Independent music, ambience, effects and voice buses. The voice bus is ready but has no recorded performances. Nine deterministic environmental beds include designed cutlery, heater, paper, printer, wood, rope, sanding, compressor and engine detail. These are synthetic Foley, not field recordings.
- The approved acoustic direction extends through fourteen new later-scene/ending arrangements and seven new ensemble stems; explicit confession identities; ordinary-scene missed motifs, memory-loss musical changes and static filtering. One-shot musical moments can finish across page changes. Saved playback restores inherited cues or silence. Authored quarter-tone variants keep ensemble loops aligned.
- Interview fingerprint begins after the answers; later title screens offer a listening gesture. Original audio and original UI remain usable in their edition.
- Original save slots retained with browser export; revised story slots and rewind are separate. An unresumable revised path is identified and can be exported before starting again.

## Review the sample

Run `pnpm render:audio`, then `pnpm --filter @not-here/app-web dev`. To inspect the built version, run `pnpm build`, then from apps/web use `pnpm exec vite preview --host 127.0.0.1 --port 5175`.

The review route goes from the beach to the Kettle, through Barb’s questions, then to the General on Day 3. Read the quilt choice before choosing; try its refusal and transfer on separate runs. The sample does not take away the alternative visits to Sam or Priya.

Paintings: [shore](../assets/locations/shore.png), [Kettle](../assets/locations/kettle.png), [General bedroom](../assets/locations/general.png). These are built-in image-generation candidates. [Full prompts, references and provenance](asset-provenance.md).

Auditions: [Kettle](../auditions/v2-kettle.wav), [room](../auditions/v2-room.wav), [shore](../auditions/v2-shore.wav), [room after the lullaby is lost](../auditions/v2-room-hollow.wav). They are synthesized acoustic sketches, not recorded guitar or piano performances. Please judge warmth, space, repetition and whether the uncanny layer feels earned.

The fifteen browser paintings/portraits total 7,189,317 bytes; each story page fetches its own composition, while the review gallery uses lazy image loading. The 23 AAC revised cues total 5,747,557 bytes versus 116,193,600 bytes for their WAV masters. WAV fallback and original-edition audio are still included in the build, so total build size remains larger than a revised playthrough’s downloads. All thirteen acoustic ensemble variants remain lossless 15-second WAV loops. Decoded music cache is bounded to twelve entries and 48 MiB; active/crossfading sources hold additional buffers. Real-device peak-memory and fatigue measurements remain acceptance work.

## Verification record

- Full suite: **1,128 passing tests across 59 files**. This includes the existing original-edition regression suite and new revised-story, audio, DOM and CLI tests.
- TypeScript checks pass for the workspace. Production browser build passes. Diff whitespace check passes.
- Every ending has an actual-choice route from the beach. No injected state is used as proof of reachability.
- Separate route checks cover compassionate, exploitative, avoidant and mixed choices. A hopeful route with zero confessions is asserted in both engine and CLI tests.
- Audio tests cover exact keeper identities, ordinary-scene tells, same-cue continuity, one-shot transitions, rapid A/B/A requests, missing files, silence, independent gains, fingerprint timing and playback restoration.
- DOM tests cover immediate text, reduced motion with art, keyboard suppression inside modal/name controls, observations without time, notebook/transcripts, captions and original-save preservation.
- Browser sample inspected on desktop and at 390×844, including naming, the first transfer, readable document text, silence and reduced motion. Native screenshot capture was used to inspect the phone viewport. A real screen-reader session and touch-device testing are still needed.
- CLI subprocess tests complete a zero-confession hopeful route and collapse/rewind, while preserving an original-save sentinel.

## Measured pacing, not promised duration

`pnpm story:metrics` follows authored routes and reports words between meaningful decisions, not just paragraph sizes. The current sample through the first memory consequence is about 2,650–2,700 prose words. The detailed route is about 21,700 words and 83 meaningful decisions; curated routes are about 16,000–16,400 words and 63–68 meaningful decisions. The observed median between decisions is roughly 184–222 words; the longest measured gap is 699 words.

Reading alone is approximately 74–121 minutes at 180–220 words/minute, depending on route. This excludes deliberation, optional observations, rereading and listening. No timed blind-playtest duration is claimed. The 25–35-minute sample and 3–4-hour first playthrough remain targets to validate, with particular attention to the shorter preparation routes and long decision gaps.

## September 7 expansion verification

- Source and delivery assets, final prompts, references and hashes: [provenance](asset-provenance.md) and [manifest](production-asset-manifest.json). Built-in image generation only.
- [Art and listening room](../apps/web/public/art-review.html) is served at `/art-review.html`. It does not advance the story or modify saves. Starting a new audition pauses the previous one; nothing autoplays.
- Tests cover all nine shipped paintings, finite room sounds and clean loop boundaries, no premature Wren portrait, conditional quilt-loss art, caption/one-shot coverage, the empty sixth bar in ensemble stems, compressed-codec fallback, exact acoustic fragment files and cache eviction.
- All thirteen synchronized acoustic stems/variants measured at exactly 480,000 frames, 32 kHz, 15 seconds.
- Browser playback verified AAC in the listening room and pause-on-next-audition behavior. Original save paths remain untouched.
- Browser story check reached the motel, quilt-loss consequence, potluck, letter reveal and bus through UI choices. The arrival painting and Wren portrait loaded, the bus composition persisted through the conversation, and the hopeful ending completed. The browser reported no console errors on that run.
- At 390×844, silent play and reduced motion retained the quilt painting. A caption-overlap issue was corrected: major-scene captions now sit below the painting on phones. Verified no horizontal overflow and no caption covering the artwork. Viewport overrides were reset afterward.

## Remaining production acceptance

1. Further cast expression/posture variants need character-specific design review; Wren’s single new portrait has not yet received a separate likeness review. Do not multiply her poses before that review.
2. Sparse spoken lines have no recorded performances. The soundtrack and environmental sounds are authored synthesis in the approved direction; field recordings and human instrumental performances are optional future replacements. Audition fatigue and emotional transitions with listeners.
3. Blind-playtest the human mystery and cast. Ask what Wren wants, who caused which harm, why the player cares about one resident, and what the quilt decision costs. Tune prose and scene curation from observed behavior.
4. Complete actual screen-reader and touch-device testing, deployment-specific delivery profiling, peak-memory measurements, and timed first-playthrough acceptance.

The sample-approval gate has been passed. The requested asset expansion is implemented. Human listening, likeness review and playtest judgments remain distinct from automated behavior checks.
