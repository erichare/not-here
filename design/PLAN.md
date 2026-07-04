# NOT HERE — Port Lorn: Design & Build Plan

## Context

Greenfield game in `/Users/erichare/GitHub/not-here` (currently just a README). The creator wants a branching narrative game: browser + terminal from one engine, Undertale-tier adaptive music, authored branching with limited-but-real LLM use, an ensemble cast that remembers the player's actions, a fair-but-surprising central twist, and player stats that drive replay.

A 13-agent creative investigation (workflow wf_45ef6a21-3b8) produced 4 competing pitches judged by a 3-judge panel, plus research on mechanics, music tech, memory systems, LLM integration, architecture, and emotional design. Full outputs preserved at `/private/tmp/claude-501/-Users-erichare-GitHub-not-here/d3fb9780-f5ed-4f3f-ac05-df5948b6252a/tasks/nh/` — **copy these into the repo as `design/` docs in Phase 0 before the scratchpad is cleaned.** The creator then answered 24 scoping questions. Every decision below is locked by those answers.

## The Game (locked decisions)

**NOT HERE** — Port Lorn, a fog-locked ferry town on a tidal causeway, British coast, spring 1971. Second-person present tense. One 3–5 hour playthrough, built to be replayed.

**Premise:** You walk out of the fog seven years after "drowning." The town welcomes you home as Wren Halloway — but your mother never says your name, the dog looks through you, and nobody ever touches you first. **The twist:** Wren never drowned; she left, and the town chose "drowned" over "left us." You are a fog-construct assembled from five people's curated memories of her, condensed by the town's guilt-panic three weeks ago when a letter arrived: the real Wren is coming home on the spring ferry — a date circled on the post-office pinboard from Day 1. Every memory you absorb erases the true one from its giver.

**Tone:** truly dark permitted (quiet horror, erasure, dissolution) inside a warm domestic texture. No gore, nothing gratuitous; content note on the landing page (grief, memory loss, sibling death, ambiguous self-dissolution). All 7 endings at full pitched strength.

**Cast (6):** Dora Halloway (mother; burned the goodbye note), Elias Pike (lighthouse keeper; plays Wren's unfinished tune on the foghorn at 3:12 AM nightly as penance), Ivy Anand (doctor, Wren's almost-lover; trying to prove you're fake and hoping she's wrong), Sam Halloway (brother; saw Wren leave, sworn to silence at 11), Maud Kettle (landlady; keeper of the diegetic save-file ledger; recognized what you are immediately — warns you exactly once), Tam Osei (causeway driver; logged "one passenger, name withheld by request").

**Stats — "in what way are you here?":** FLESH (body: can the dog see you, can you hold the fiddle), NAME (record: does paper hold you), ECHO (memory: Wren's remembered life — every harvest visibly costs the giver), UNDERTOW (self: everything that is NOT Wren; the only road to the truest endings), + CHORD meter (song fragments gathered; literally drives the adaptive mixer) and STATIC (fog's claim; detunes/bitcrushes the score, corrupts glyphs, rises on lies). No stat raisable without cost to a named person. Display is diegetic only: a "consult the ledger" verb renders stats as Maud's handwritten observations.

**Structure:** 23 days / 3 acts, day/night scene-slot triage (Presence Economy — hard scarcity: ~4 of 6 confession paths reachable per run; missed scenes resolve as authored biased secondhand retellings, their motifs playing faint/detuned). Hard branches: the Foghorn Choice (Night 7 — let Elias keep calling, or stop him and start nightly presence decay), the Wake verdict (computed from witnessed FLESH+NAME), the Letter (open/burn/never-find). Fading is real: presence collapse mid-Act-3 triggers Unwitnessed (the game continues without you for four minutes). Generous autosave (reload lands 1–2 nights back).

**Endings (7):** The Sixth Bar (compose your own bar, return the town its real grief, step into the fog), Wren Again (pass perfectly — quiet horror), Two Wrens (hidden; requires refusing the two memory-harvests that erase; the real Wren takes your hand — first touch in the game), The Stranger on the Shingle (leave on Tam's 4 AM bus under your own name), The Long Winter (Maud's counsel; one winter, a chosen good death), Unwitnessed (dissolution mid-game), Ash (burn the ledger; the town forgets Wren entirely).

**Music — the score IS the mystery:** One broken six-bar melody in D dorian ("The Foghorn Song"), bar 6 a rest. Every character owns a fragment (Dora: bars 1–2 music-box lullaby; Elias: foghorn drone + bar 3; Ivy: bar 4 *inverted* — her confession un-inverts it live; Sam: bar 5 whistled fast; Maud: only the accompaniment chords; Tam: pitchless rhythm ostinato). Each Act-3 confession returns that fragment to the mix. Grafts adopted: the player's pub-interview answers seed a musical fingerprint hidden in the main theme from the title screen; lie-detune (a lying character's stem drops a quarter-tone, CLARITY/EAR-gated); tempo-as-dread at the dock. Palette: chiptune-folk hybrid (triangle music box, FM harmonium/foghorn, pulse fiddle, noise-channel sea).

**Prose-grammar clue discipline:** "you take her hand" — no one ever touches you first, enforced silently for the whole game, broken exactly once per ending where it matters. Dora provably never says your name. The ferry date is on screen from Day 1.

**LLM touchpoints (all 4; classification/formatting only; LLM never writes canonical state; outputs cached in saves, never regenerated):**
1. **Pub Interview** (character creation) — free text → stat weights + 3 self-truth tags from a fixed 24-tag taxonomy, echoed verbatim later. Fallback: multiple-choice interview.
2. **Sixth Bar judging** (3 moments) — free-text attempt → enum borrowed/new (ECHO vs UNDERTOW). Fallback: notated variants pre-tagged.
3. **Ivy's Interrogation** (one scene) — answer checked against fact-ledger → PASS/CONTRADICTION/EVASION. Fallback: dialogue-tree trap.
4. **The Last Letter** (3 endings) — LLM copy-edits the player's letter to period register, content unchanged. Fallback: authored letters.
Access: three-driver AIAdapter — tiny edge proxy (creator-funded, monthly spend cap degrading to deterministic), BYOK, offline. The no-key game must be complete and good.

**NG+ / cross-run (full diegetic):** Maud's ledger persists as a real plain-text file beside the saves (she reacts if it's been edited); prior save-names surface faintly; a child hums your previous run's composed sixth bar; browser and terminal share the save file and Maud acknowledges "you found both doors."

**Accessibility (full visual parity):** every audio tell has a first-class visual twin — ASCII notation marginalia, prose tells ("the piano sours"), a listening-notes ledger page. Deaf/silent players can reach all 7 endings. Reduced-flicker mode for glyph-rot.

## Architecture

pnpm monorepo, TypeScript throughout:

```
packages/engine   — pure deterministic core: advance(state, input) → {state', output, events}
                    zero platform deps; seeded RNG; save schema versioning + choiceLog replay migration
packages/memory   — witnessed-facts ledger: immutable fact log, per-character witness sets
                    (who knows what, from whom, distorted how), relationship axes DERIVED from
                    known facts (never stored), salience-scored dialogue rule matcher with
                    guaranteed fallbacks; gossip propagation (pass 2)
packages/music    — score-as-data: JSON songs (motifs, patterns, instruments, layers, reactive
                    rules); one synth engine (pulse ×2, triangle, noise, 2-op FM + envelopes,
                    vibrato, echo — frozen spec) rendering against any BaseAudioContext;
                    motif transforms (inversion, mode-swap, detune) as arithmetic
packages/story    — scene graph + ink fragments: TS engine owns graph/state/saves/music events;
                    inkjs embedded purely for prose realization in prose-heavy scenes
                    (creator's choice: "use inkjs for prose"); codegen'd SceneId/flag/stat/cue
                    unions so every reference is compile-time checked
packages/ai       — AIAdapter: none | BYOK | proxy drivers; structured-output calls only
apps/web          — Vite; CRT ledger aesthetic (phosphor monospace, fog negative space,
                    glyph-rot) + minimal ink-sketch vignettes at act boundaries
apps/cli          — Ink (React CLI); same engine, thinner music tier
apps/proxy        — single edge function holding prompts server-side, spend-capped
```

Terminal audio ladder: node-web-audio-api (real-time, identical adaptivity) → offline-rendered WAV per cue via afplay/ffplay → silence + "♪" notation. **Week-1 spike decides the primary tier.**

Music events (enter scene → cue, stat change → layer change, lie → detune) are emitted by the same engine state machine on both platforms.

## Build phases

**Phase 0 — Foundations + risk spikes (first)**
- Scaffold monorepo; copy investigation outputs into `design/` (pitch, grafts, research digests) as the canonical bible; write `design/twist-recontext-table.md` (the twist is locked BEFORE scenes are written — every clue's pre- and post-reveal reading)
- Spike A: node-web-audio-api on macOS (binaries, latency) → pick terminal audio tier
- Spike B: synth engine + render the six-bar Foghorn Song to WAV → creator auditions the main theme (composition quality is the #1 risk; nothing proceeds until the theme gives chills)
- Spike C: FOMO calibration — paper-prototype one day's slot triage with a "without-you" retelling

**Phase 1 — Vertical slice: Night 1 (the milestone that proves everything)**
- Arrival on the shingle → walk into town → the Anchor & Lantern → Pub Interview (LLM + fallback) → first day slots (Dora, Maud scenes) → first 3:12 AM foghorn
- Real music: main theme + Dora and Maud motifs, adaptive layers responding to CHORD/STATIC
- Both platforms playable from the same save; diegetic ledger stat view; memory ledger driving at least one visible callback ("you washed the dishes")
- Engine test harness: graph reachability, 10k random-walk soak, snapshot state transitions

**Phase 2 — Act 1 complete (Days 1–7 + Foghorn Choice)**
- All six cast intros, day-slot economy tuned, witnessed-facts + salience dialogue at full fidelity, gossip propagation, lie-detune with visual twin, autosave

**Phase 3 — Acts 2–3 story graph**
- The Wake set piece, the Letter branch, confession scenes ×6 with musical fragment returns, all 7 endings + golden path per ending as CI gate; Sixth Bar and Ivy Interrogation LLM moments

**Phase 4 — Score completion**
- Full motif bible → all cues composed (JSON → WAV audition loop with creator as final taste authority), stingers, the dock's tempo-as-dread, per-ending finales, terminal thin-mix pass

**Phase 5 — NG+, polish, ship**
- Cross-run ledger file, prior-bar folklore, both-doors acknowledgment; glyph-rot + fog rendering; accessibility pass (notation twins everywhere, reduced-flicker); content note; deploy web (static + edge proxy), publish `npx not-here`; itch.io page deferred unless requested

## Verification

- **Story integrity (CI):** graph reachability (all 7 endings, no orphan scenes), 10k-run seeded random-walk simulation, one hand-authored golden path per ending replayed as a test, save-migration replay tests
- **The two invariants tested mechanically:** no scene text where an NPC initiates touch (lint over prose AST/tags, allowlist for the endings that break it deliberately); Dora's dialogue provably contains zero uses of the player-facing name until the lullaby-taken flag
- **Music:** every cue offline-renders without clipping; audition WAVs regenerated on score change; lie-detune events always paired with a visual-twin event (lint)
- **LLM:** each touchpoint has a recorded-fixture test (classification enums stable), fallback path playtested end-to-end with no API key; proxy spend cap kill-switch tested
- **Feel:** creator plays the Night 1 slice in both builds before Phase 2 begins; the main theme is approved by ear before any other music is written
