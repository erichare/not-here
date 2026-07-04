# Decision Log

All decisions below were made by the creator (Eric) on 2026-07-04 via 24 scoping
questions, after reviewing 4 judged pitches and 6 research tracks. Do not relitigate
without asking.

## Story
- **Concept:** Port Lorn (fog-construct premise), winner of 2/3 judge panels.
  Grafts adopted from other pitches: title-screen fingerprint, lie-detune, hard
  scarcity, plain-text cross-run ledger, both-doors acknowledgment, prose-grammar
  clue discipline, one-warning rule, verbatim player-words echo.
- **Tone:** let it get truly dark (quiet-horror endings at full strength).
  Reaffirmed 2026-07-04 in the creator's words: dark, shocking, emotional content
  is "okay and encouraged" — do not soften on instinct. **The mystery is central:**
  every scene must advance, rehearse, or pay off the mystery (the recontext table
  is the spine, not a garnish). When in doubt between a safe beat and a devastating
  one, write the devastating one and let the warmth around it do the carrying.
- **Prose economy (creator directive, 2026-07-04):** enough to paint pictures,
  never novel-wordy. Budget: 1–3 short paragraphs per beat, ~30–90 words between
  choice points; longer only for set pieces (the Wake, the reveal, endings).
  Cut adjectives before nouns; one concrete image per paragraph beats three.
  The content lint warns on beats > 120 words.
- **Image flourishes (creator directive, 2026-07-04):** favor small visual
  artifacts over prose description wherever possible — letters, notes, tickets,
  the tide table, ledger pages rendered AS documents (bordered/indented text
  objects, same in both builds); ledger ruling-lines and tide-mark dividers as
  scene ornaments; ASCII notation marginalia for motifs; in the web build, small
  ink-line SVG vignettes at act boundaries and for keepsake objects (the fiddle,
  the circled timetable, the folded coat).
- **Setting:** 1970s British coast as pitched. *(Superseded 2026-07-04 — see
  Setting pivot below. Kept for history.)*
- **Setting pivot (2026-07-04):** after playing the vertical slice, the creator
  moved the world: modern day, Okanagan Valley, BC — invented community of
  **Lorn Bay** on Okanagan Lake. Modern names (Wren Cole, Dianne, Barb, Wade,
  Priya, Sam, Tam; the dog is Moose), female protagonist explicit, the horn at
  the old ferry wharf, the memorial potluck (was the Wake), the Friday EBUS
  Nov 28 (was the spring ferry), and a first-class **digital-absence doctrine**
  (no phone for you; photos disagree; your voice doesn't record). Music, mood,
  twist logic, stats, endings, and structure unchanged; ending 4 retitled
  "The Stranger on the Gravel" (leaves on Tam's 4:10 AM run). Prose register:
  spare and modern, no antique cadence. Locked spec and single source of truth:
  `retheme-lorn-bay.md` — it wins every conflict with older docs. Game bible and
  twist table rewritten to match on the same date.
- **Length:** 3–5 hours per playthrough.

## Structure
- **Endings:** all 7 as pitched (Sixth Bar, Wren Again, Two Wrens, Stranger,
  Long Winter, Unwitnessed, Ash).
- **Fail states:** fading is real — presence collapse mid-game is a genuine ending;
  generous autosave (reload lands 1–2 nights back).
- **Scarcity:** hard — ~4 of 6 confession paths per run; without-you retellings.
- **NG+:** full diegetic (plain-text ledger file on disk, prior-run surfacing,
  sixth-bar folklore, cross-platform acknowledgment).

## Mechanics
- **Stats:** all five as pitched — FLESH / NAME / ECHO / UNDERTOW + CHORD meter
  (and STATIC).
- **Time:** day/night scene slots (Presence Economy); nights are fixed beats.
- **Stat display:** diegetic ledger view only; no bare numbers.
- **Music mechanics:** full listening gameplay (lie-detune, buried layers,
  missed-scene motifs, sixth-bar composition finale) — with full visual parity.

## Music
- **Tech:** score-as-data engine. JSON note data; one TS synth (pulse ×2, triangle,
  noise, 2-op FM + envelopes/vibrato/echo — spec frozen) rendering via browser
  AudioContext and node-web-audio-api in terminal.
- **Palette:** chiptune-folk hybrid.
- **Terminal audio:** full ladder — real-time synth → offline WAV via afplay/ffplay
  → silence + notation. Week-1 spike decides primary tier.
- **Composition:** Claude composes, creator auditions; creator is final taste
  authority; nothing ships unheard. Main theme approved by ear before any other
  music is written.

## LLM
- **Touchpoints:** all four (Pub Interview, Sixth Bar judging, Ivy's Interrogation,
  Last Letter epilogue).
- **Access:** proxy (creator-funded, spend-capped) + BYOK + offline. LLM outputs
  cached in saves, never regenerated. No-key game must be complete and good.

## Tech
- **Stack:** pnpm monorepo, TS throughout; custom scene-graph engine owns
  graph/state/saves/music; **inkjs embedded for prose realization** in prose-heavy
  scenes (creator's explicit choice over pure-DSL).
- **Browser look:** CRT ledger aesthetic + minimal ink-sketch vignettes at act
  boundaries.

## Delivery
- **First milestone:** vertical slice of Night 1 in BOTH builds with real music.
- **Distribution:** static web + `npx not-here`. (itch.io/Steam deferred.)
- **Accessibility:** full visual parity; all endings reachable silent;
  reduced-flicker mode.
- **Content:** all endings as pitched; content note on landing page (grief, memory
  loss, sibling death, ambiguous self-dissolution). No gore, nothing gratuitous.

## Spike outcomes (fill in as they land)
- **Spike A (terminal audio tier): PASSED 2026-07-04.** node-web-audio-api works on
  macOS arm64 / Node 26: offline render correct, realtime AudioContext runs
  (48kHz). **Primary terminal tier = real-time playback via node-web-audio-api.**
  Architecture: the pure TS renderer (packages/music/src/render.ts) is canonical —
  patterns render to sample buffers, played as AudioBufferSourceNodes with
  per-pattern GainNodes for live vertical layering (identical code paths in
  browser AudioContext and node-web-audio-api). Lie-detune tell = pre-rendered
  detuned stem variant crossfaded in (deterministic; avoids playbackRate tempo
  drift). Fallback tier 2 = offline WAV + afplay/ffplay (already proven by the
  audition pipeline); tier 3 = silence + "♪" notation.
- Spike B (main theme approval): iteration 1 rendered and sent to creator
  2026-07-04 (auditions/foghorn-song-title.wav) — awaiting ears.
- **Spike C (FOMO calibration): PASSED 2026-07-04.** See `spike-fomo.md` — two
  without-you retellings written in full (Day 3: Sam's boathouse via Maud, Ivy's
  surgery via the note under the door); both produce content attendance wouldn't.
  Six calibration rules extracted; the Day-3 retellings are canon and ship.
