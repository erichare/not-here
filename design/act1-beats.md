# Act 1 Beat Sheet — Days 3–7 (LOCKED for Phase 2)

> Days 1–2 are shipped. This sheet is the structure for the rest of Act 1;
> content agents execute it, they do not restructure it. Voice per
> spike-fomo.md; economy per decisions.md (30–90 words/beat); invariants per
> game-bible.md. Title rule: Act 1's one "not here" line is already spent
> (Dianne's phone call, Day 2). No new dialogue uses of the phrase this act.

## Day 3 — the three-way morning (Presence Economy at full width)

Morning hub offers THREE simultaneous scenes (first time; Barb names all
three over coffee, no menu UI):

- **A. Dianne is airing Wren's room.** First time in seven years. The quilt
  story = **first ECHO harvest offer** (small, tutorial-scale): she tells you
  who made the quilt; you may "remember it with her" (ECHO +1). **Cost shown
  next visit: she can no longer remember who made it.** Act 1's warning shot,
  played quiet. Also in the room: the **chord sheet** `@doc:` artifact —
  hand-ruled chart, five systems filled, sixth empty, headed *not here
  (unfinished)*. Nobody names the song aloud (title rule 3).
- **B. Sam at the boat shed**, re-caulking the canoe nobody uses, loudly,
  alone. **Trap test #1**: he misquotes a private joke of Wren's to see if
  you correct him with detail nobody gave you. Correct him (needs ECHO≥3,
  which a Day-3 player can barely have) → he goes white and leaves — trap
  sprung. Say nothing / admit you don't know → a long look; `fact:
  sam-test-1-passed` (UNDERTOW path seed).
- **C. Priya's clinic hours** ("she's asked after you." Everyone agrees you
  should go. Everyone.) Intake questions; she writes everything down; the
  notebook fact-thread opens. If skipped, the note-under-the-door retelling
  fires that night (spike-fomo canon, retranslated).

Evening: two without-you retellings (Maud→Barb telling B; C arrives as the
note). Night 3: horn; if 'window-first' habit, you see a figure on the wharf.

## Day 4 — Wade, and the first audible lie

- **A. The wharf.** Wade intro: the compressor shed, the breakwater light,
  he will NOT show you the horn room. Asked "Did you know her well?" — "Not
  well." — **the first lie-detune**: his stem sours a quarter-tone under the
  line. Visual twin (always): the marginal note *— something in the room
  goes a quarter-turn flat.* No stat gate on hearing the FIRST one; later
  detunes gate on ECHO≥4 ("you know the song too well now to miss it").
- **B. Barb's errand** (domesticity: the walk-in shelving, Moose beat #2 —
  he stares at the door while you hold it open, waits for it to close).
- **C. Dianne follow-up**: the albums are "up at the house being sorted."
  Shelf gap where they stood. (Photo-clue soft plant.)

Evening (fixed, regardless of morning): **Sam lays two phones side by side
on the diner counter** — his and a friend's, same moment at the potluck
prep, both "of you." He says nothing. Whoever looks, looks away first.
(Clue #6 planted in public.) Night 4: horn.

## Day 5 — Tam's ride

- **A. Ride-along to Penticton** (the 07:40 run): the idling engine under
  everything (his rhythm-fragment, diegetic), how he watches you in the
  mirror when Sam's name comes up. He asks one question the whole drive:
  "You planning to stay past the 28th?" — and doesn't fill the silence.
- **B. The hall**: potluck prep begins; the flyer `@doc:` artifact goes up
  everywhere (SEVEN YEARS — COMMUNITY HALL — BRING A DISH); the out-of-tune
  upright gets uncovered (Priya's inverted bar 4, first plant — someone
  picks out three wrong notes and stops).
- Evening: first **gossip visibility**: a character references a fact they
  didn't witness ("heard you had quite the morning" — sourced correctly via
  propagation). Night 5: horn.

## Day 6 — the recording

- **A. The hall again** (prep; Priya cornering you politely — notebook
  thread advances) or **B. Wade again** (if pursued: the old ticket office,
  where a cot and a kettle say someone half-lives there).
- **Night 6 (fixed, the act's dark beat): Sam, alone, in the lot at 2 AM,**
  plays you a clip on his phone: the diner, last Tuesday, your voice's turn
  in the conversation — and the file plays **room tone where you spoke.**
  "Who'd believe I didn't fake it?" He isn't threatening you. He's asking
  you what you are. Choices: deny / say nothing / say "I don't know" (the
  honest one; UNDERTOW +2, `fact: told-sam-dont-know` — the seed of the
  game's most guarded friendship).

## Day 7 — breath, then the branch

- Single morning slot (quiet): Barb, the book briefly open on the counter —
  you see your blank NAME column line from Night 1, still blank. She closes
  it without hurry. No comment. (Register thread, beat 2.)
- Evening: short. The fog comes in early. Everyone goes home early. Barb:
  "Sleep well tonight." It is not clear she believes you will.
- **NIGHT 7 — THE FOGHORN CHOICE.** At 3:12 you are already awake. The game
  walks you down to the wharf (no choice offered — the one railroad in the
  act; the fog parts along the boards). The horn room stands open. Wade at
  the valves, playing her song into the fog, **the first time you hear it
  at full volume, not through a wall** (cue: horn-close). He sees you. He
  doesn't stop. Choice:
  - **"Keep playing."** — complicity; presence stats stay fed; Wade's
    confession path opens early; `flag horn-on`.
  - **"Stop."** (You reach past him and close the valve — YOU touch the
    horn; nobody touches you.) The silence afterward is the loudest thing
    in the act. `flag horn-stopped`: from Night 8, **presence decay** —
    one presence stat −1 per night (rotating flesh→name→echo), offset only
    by being fed/named/remembered that day. Wade locks the horn room. The
    Stranger path opens.
  - Locked third option, visible: *· Ask him what the sixth bar is.*
    (lockedLabel always shown; gate: impossible in Act 1 — the ache.)
- Act ends on the walk back up: one line either way about the quality of
  the silence / the sound behind you. `time.set day 8`, ACT 2 title card,
  slice-end-act1 ending marker (replaces slice-end).

## Mechanics introduced this act
- Three-way morning hubs with authored retellings for BOTH missed slots
- ECHO harvest #1 with visible next-visit cost (Dianne/quilt)
- Lie-detune + mandatory visual twin (Wade Day 4; engine 'emit' effect)
- Gossip propagation at day boundaries (engine postDay hook; edges: barb↔tam,
  barb↔dianne, sam→priya, tam→sam; 'private:' never moves)
- Presence decay after horn-stopped (nightly 'when' effects in night scenes)
- STATIC +2 whenever the player chooses a marked lie option (tag choices)

## Cues used (composed in Phase 2)
wade-theme, priya-theme, sam-theme, tam-theme, wrens-room, hall-upright,
horn-close; plus existing title/shingle/pub-warm/dianne-theme/foghorn-312.
