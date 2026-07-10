# Act 2 Beat Sheet — The Seams, Days 8–19 (LOCKED for Phase 3)

> Act 1 is shipped through the Foghorn Choice. This sheet is the structure for
> Act 2; content agents execute it, they do not restructure it. Voice per
> spike-fomo.md and shipped Act 1 (day3.ts and day7.ts are the exemplars);
> economy per decisions.md (30–90 words/beat, set pieces excepted, 150-word
> hard cap always); invariants per game-bible.md §Prose grammar; clue duties
> per twist-recontext-table.md. Setting per retheme-lorn-bay.md.
>
> **Music constraint: no new cues.** The creator auditions everything by ear;
> Act 2 reuses the existing cue set only (title, shingle, pub-warm,
> dianne-theme, wade-theme, priya-theme, sam-theme, tam-theme, wrens-room,
> hall-upright, horn-close, foghorn-312) plus music.layer / music.detune /
> music.stop events on those cues.

Dates: Day N = Nov (N+5). Day 8 = Nov 13. Potluck = Night 13 (Nov 18).
The Letter = Night 17 (Nov 22). Act ends Night 19 (Nov 24); Day 20 begins
Act 3, four days out from the Friday bus.

## Title discipline this act (pinned by act2-lint)

Spoken "not here": **exactly twice** — Barb's one warning (Night 11) and Sam
at the potluck (Night 13), per design/title-thread.md. (The ladder outranks
the at-most-once rule; the counts are pinned so scarcity stays load-bearing.)
Written "not here" in @doc blocks: **exactly once** — Priya's intake page,
Day 9: `pt. not here for exam.` Wade's horn speech from the ladder is Act 3
confession material — do not spend it here.

"Wren" this act: **exactly twice in prose** — (1) one of the orchard men at
the potluck verdict ("That's Wren, son. Sit down."), (2) Dianne, morning of
Day 16, gated on `lullaby-taken` — her first and only use, and it lands like
a door closing. **Once in @doc** — the salutation of Dianne's unsent reply
draft (Night 17). Nowhere else. The letter itself is signed "— W."

## The two tracks (from the Foghorn Choice)

Every night scene this act branches on `horn-on` / `horn-stopped`. The tracks
share days; they differ at night and in Wade.

- **horn-on:** the horn plays nightly (foghorn-312 under night scenes); the
  town sleeps; presence stats stay fed; Wade's confession path is open early
  (`wade-confession-seed`). Complicity is the texture: something is feeding
  you, and you know who pays.
- **horn-stopped:** no music under any night scene (the act's silence is
  scored by its absence); Wade has locked the compressor shed; **presence
  decay** runs nightly (below). The Stranger path seeds through Sam.

### Presence decay (horn-stopped only) — the canonical night block

Every night scene Days 8–19 carries this onEnter logic, verbatim in shape:

1. When `horn-stopped` AND none of `today:fed` / `today:named` /
   `today:remembered` are set: subtract 1 from the stat named by flag
   `decay:next` (unset or `'flesh'` → flesh, then `'name'` → name, then
   `'echo'` → echo, rotating), set `decay:tonight` to the stat that paid,
   advance `decay:next`.
2. When an offset flag was set that day: no decay; set `decay:tonight` to
   `'none'` (the offset was consumed — say nothing about it; the player
   learns the economy by living it).
3. Always clear all three `today:*` flags at night, both tracks.

The decay night carries ONE gated prose tell, rotating with `decay:tonight`
(diegetic, never a meter): flesh — the blankets weigh less than they should;
name — morning ink gone pale on yesterday's tab; echo — a memory you reach
for has a stair missing. Barb's book tiers do the rest automatically.

**Survivability rule:** every day 8–19 must offer at least one reachable
offset (a meal cooked for you = `today:fed`; being vouched for, written
double-inked, or signed for = `today:named`; someone sharing or using a
memory of Wren with you = `today:remembered`). A player managing the decay
eats attention that other threads wanted — that is the mechanic working.
Tests pin a managed walkthrough (no stat below 1 by Day 19) and an
unmanaged one (visible collapse trajectory; Unwitnessed itself is Act 3's).

## Contract — cross-file state (all clusters honor this)

Flags owned by Act 2:
- `decay:next`, `decay:tonight`, `today:fed`, `today:named`,
  `today:remembered` (above)
- `pressed-dianne` (number 0–3; increments only at marked press choices,
  Days 8/10/11/14; the choice that makes it 3 also sets
  `dianne:locks-house`) — after which no scene enters Dianne's house or
  store after hours without a knock beat, and unannounced-entry choices
  disappear (hidden `when`, no lockedLabel)
- `heeded-barbs-warning` (Night 11 choice), `knows-truth` (early truth via
  Barb, or the Letter opened), `early-truth` (Barb route only)
- `potluck:verdict` = `'defended'` | `'exiled'`; `potluck:sam` =
  `'defended'` | `'silent'` | `'given'` (what YOU did when they turned on him)
- `lullaby-taken` (Night 15), `letter-memory-taken` (Day 17)
- `found-mail-slip` (Day 17), `letter-opened`, `letter-burned`
- `d16:sam-named` (the Stranger seed: you told Sam the name you'd travel under)
- `barb:counsel-seeded` (Day 19, trust-gated; Long Winter's Act 3 hook)

Facts (witnesses as noted):
- `defended-sam` (all six witness — the axis table already weights it for
  tam and sam), `sacrificed-sam` (all six), `potluck-verdict-defended` /
  `potluck-verdict-exiled` (all six)
- `private:lullaby-taken` about dianne + a paired `private:memory-taken`
  about dianne (the generic tag carries the axis math; the specific one
  gates Two Wrens) — same pattern for `private:letter-memory-taken` about
  priya + paired `private:memory-taken` about priya
- `fog-priya-caught-seam` (Day 14, if you spend Dianne's quilt memory at
  her; fear +2 arrives via the existing `fog-*` rule)
- `contradiction` witnessed by priya (Day 14, if you improve on your own
  Day-3 words — the red circle)
- `truth-told` continues to accrue where earned (trust +1 rule exists)

Scene id boundaries (gotos across clusters): `d8-morning` … `d19-night` →
`act2-end`. The unsealed `act1-end` scene already owns `time.set day 8`
(Act 1's ladder test pins it), so `d8-morning` sets slot only; each
dN-morning for N = 9..19 owns `time.set day N`; `act2-end` owns
`time.set day 20` and carries the ACT THREE card + `ending: 'act2-end'`.
The act2 ladder pin is therefore days 9..20, each exactly once.

Wiring owned by integration (not by content clusters): `d7` act1-end scene
is unsealed — keeps the ACT TWO card and `time.set day 8`, loses
`ending: 'act1-end'`, gains one choice (`label: 'Morning comes anyway.'`,
goto `d8-morning`); content.ts registers DAY8–DAY19 scene arrays + Act 2
dialogue rules; derived resolvers gain
`witness: (s) => s.stats.flesh + s.stats.name`; act1-lint rescopes to an
`ACT1_SCENES` export (its pins are act-local; touch and the 07:40
exclusivity move to a whole-game lint), act2-lint pins this act.

## Day 8 — the morning after (the split establishes)

Morning hub, three-way (Barb names them over coffee, no menu language):
- **A. Dianne needs the stockroom shelves** moved before the frost gets the
  back room. Domestic, warm; she cooks lunch (`today:fed`). **Press
  opportunity #1** (a marked choice, quiet: "Where did the canoe come
  ashore, again?" — she answers a beach the Day-4 evening version
  contradicts; clue #8 in motion). Attendance is tracked: skip A twice
  running (Days 8+10) and the bible's line fires later — "you were out at
  the wharf when Dianne needed the stockroom shelves."
- **B. The wharf.** Track-split: horn-on — Wade shows you the compressor
  duty cycle, the gauge, how much air five bars cost (he talks about the
  horn the way other men talk about a wife's grave; `today:remembered` if
  you let him tell you what she did to the fifth bar). horn-stopped — the
  shed is padlocked, Wade is hauling breakwater-light batteries alone and
  lets you carry nothing; one exchange, both hands full: "District pays for
  the light." That's all he says, all day.
- **C. Sam's wall.** The boat shed, inside: a lake map over the workbench,
  three X's where the canoe came ashore in three tellings, a column of
  printed screenshots (the memorial page, post dates), a phone on a tripod
  aimed at the door. He shows you because showing you is a test too. The
  room-tone clip from Night 6 sits in a folder named GARBAGE.

Evening: Kettle; without-you retellings for both missed slots (calibration
rules apply — absence hands the player something attendance wouldn't; each
missed motif surfaces faint and detuned ≤ twice, prose is the twin). Night 8:
first decay night (stopped) / the horn, and being fed by it, named as such
(on — one line, the complicity settling in like weather).

## Day 9 — Thursday (the clinic keeps its own book)

Morning hub:
- **A. Clinic hours.** Priya's follow-up. She transcribes Day 3 into the
  chart while you watch — the intake page as @doc: `ID: not provided. DOB:
  not provided. Patient presents as: —` and, corner shorthand, small enough
  to miss: `pt. not here for exam.` (the act's one written title use). The
  wrist thread continues; her questions have begun to be about memory
  ("What's the first thing you remember about this room?" — the honest
  answer is Day 3).
- **B. Barb's walk-in,** re-shelving for winter (`today:fed` — she feeds
  the help; Moose beat: he takes his post facing the door you're holding
  and waits for it to close).
- **C. Tam's 07:10 run** to Penticton. Second ride. He asks nothing the
  whole drive out; on the way back, one question: "Sam still at that wall
  of his?" — and watches the mirror, not the road, while you answer.

Night 9: decay/horn per track.

## Day 10 — the ash tin

Morning hub:
- **A. Dianne's house** (knock beat if locked). The woodstove is going; on
  the shelf above it, a tobacco tin gone matte with heat. If you're left
  alone with the stove — she goes for stovewood — a marked choice opens the
  tin: ash packed to felt, seven winters old, and one unburned corner of
  lined paper, blue ballpoint, four words' worth: **"—n't look for me."**
  (Clue: the goodbye note existed; fair, undatable, devastating only in
  hindsight. Taking the corner is not offered. You put the lid back.)
  **Press opportunity #2** if you ask what she burns in November.
- **B. The hall** — potluck committee. The dish list goes up; someone has
  written a casserole beside a blank where a name would go
  (`today:named` if you let Barb ink the blank herself later — she
  double-inks it; the NAME column ache made small and domestic).
- **C. The shed again** — Sam adds tonight's date to the map margin; he's
  begun logging your days too ("Tuesday you were at the wharf 40 min").

Night 10.

## Day 11 — the albums, and the one warning

Morning hub (two-way; the day narrows toward its night):
- **A. Dianne's albums** are back downstairs, "sorted." Seven Novembers of
  prints; the sleeve for the year she drowned is not thin — it is empty,
  and re-labelled in newer ink. **Press opportunity #3** ("Who sorted
  these?") — pressing here makes 3: she goes pleasant and closed, and that
  evening the house starts locking (`dianne:locks-house`; the game never
  remarks on it).
- **B. The Canada Post counter.** Dianne's parcel backlog; a marked,
  stat-gated choice: sign the receipt line yourself (`when` name ≥ 4;
  lockedLabel: "The pen is right there. The line is not for you yet.") —
  success: `today:named`, and the register keeps it overnight.

**Night 11 — BARB'S ONE WARNING (fixed, both tracks).** After close, chairs
up, one lamp. Unprompted, to the register, not to you: "My Frank came back,
one winter. Sat where you're sitting. He was here — and he was not here.
And the second one wore the first one out." She never explains. She never
repeats it. Choice: ask what he was (`heeded-barbs-warning`; she doesn't
answer tonight — "Finish your coffee.") / say nothing / make it a joke
(STATIC +2; the marked lie is to yourself). No dialogue rule ever
references this scene again — the one-warning rule is mechanical.

## Day 12 — prep (the temperature reads)

Fixed day, no hub: the hall, tables, the urn, the upright uncovered.
FLESH gate on carrying tables (bible's canonical gate — lockedLabel aches:
"Take the other end. Your hands know the weight they don't have.").
The verdict is legible here before it is computed: who hands you things
(they've been fed/named by you — mirror the actual stats in small blocking:
if witness is high, Dianne's shelf-paper is passed to you without looking;
if low, dishes route around you). Sam is absent from prep; his shed light
burns all evening and nobody mentions it, which is how the town mentions it.

Someone picks out bar 4 on the upright, wrong way up as always, and stops.

**Early truth (route, Night 12 only — ruled 2026-07-10):** if undertow ≥ 6
AND `pressed-dianne` = 3 AND `heeded-barbs-warning` — that night at the
counter Barb answers Night 11's question: what Frank was, what winter did
to him, what she chose and what it cost her to watch him thin. Sets
`knows-truth` + `early-truth`. The window is deliberately this one night:
knowing at the potluck is the route's payoff, and all three presses are
reachable by Day 11 on a committed run. Press #4 (Day 14) is staging-only —
it moves the locks, never the truth.
From here the act plays dramatic-irony inverted (you know; they don't know
you know) — post-potluck scenes carry knows-truth variant paragraphs, never
more than one per scene.

**Night 12 (fixed):** the clinic window, lit late, seen from the lot: Sam's
phone flat on Priya's desk between them, her notebook open, neither talking.
You are not in the room; the scene is watching a gossip edge with your own
eyes (sam→priya). What crossed: the room-tone clip. What she wrote: not
belief — a page number. (Retelling rules apply: being outside it IS the
content.)

## Day 13 — THE MEMORIAL POTLUCK (midpoint set piece)

Morning (single slot, quiet, mirrors Day 7): the Kettle. Barb: "There's an
iron in the back if you want it." The register lies closed. The EBUS card
by the till has been re-taped — the ring on the 28th showing through the
new tape like a bruise through a sleeve.

**Evening — the hall (set piece; multi-scene; cue hall-upright, then
nothing).** Casseroles, name-taped dishes, the seven-years banner nobody
reads aloud. Moose comes to the door with the crowd and will not cross the
threshold past you; he waits in the cold, and someone says he's gotten old.
Speeches: Dianne thanks the town for seven years of— she says "of showing
up," and sits down. Then Sam stands.

**"That is not my sister. She's not here. She never came back — whatever
this is, it's not her being here."** Into casserole silence. He is eighteen
and shaking and the only person in the room telling the truth (the player
may know that by now — knows-truth variant: one line, the worst one:
*He is right. Every face in the room knows something it will not let
itself say, and yours is one of them.*)

**The verdict is computed, not chosen:** derived `witness` (= flesh + name)
≥ 9 → **defended**. The town answers Sam with its body: chairs scrape
TOWARD you; one of the orchard men says "That's Wren, son. Sit down" — and
the room votes on what is real one act before it learns the answer.
Otherwise → **exiled**: nobody moves toward you; Barb looks at the register
she didn't bring; the room does the small-town thing where a verdict is
reached without anyone saying a word of it.

**Your choice inside the verdict — what you do about Sam** (both verdicts,
stakes major):
- **Defend him** ("Don't. He's allowed. Out of everyone — he's allowed."):
  fact `defended-sam` (all witness; Tam's trust moves; Sam's does) —
  UNDERTOW +1. On the defended-verdict track this splits the town's
  comfort open a seam and costs you nothing visible tonight. It will cost
  Sam anyway (below); you bought the right to carry it with him.
- **Say nothing:** `potluck:sam = 'silent'`. The room handles him. Watching
  is its own information.
- **Give the town its night** ("Sit down, Sam." — in her cadence, the one
  the memories carry): fact `sacrificed-sam` (all witness), ECHO +1,
  STATIC +4. The cruelest cheap heat in the act; write it so it works and
  costs.

**Aftermath split (night 13):**
- **Defended (verdict):** the walk home warm at your back — and Sam alone
  in the lot by the propane tank, hood up, the town having chosen its
  comfortable ghost over its honest son. He is ostracized from tonight
  (empty stool at the Kettle, his dish untouched on the gym table, "a cost
  you carry" — the bible's phrase; if you defended him too, he looks at
  you once, and the look is the whole friendship offer arriving early).
- **Exiled (verdict):** you don't go back to your unit. It isn't said; it
  is arranged — Barb has the key to nothing to give you; the walk goes the
  other way, down to the wharf, and the ticket office door is open, cot
  made, kettle filled. Wade did it before the potluck ended. He knew the
  count before the town did. From Day 14 the exile staging holds: mornings
  start at the wharf, the Kettle is a walk through town that watches, a
  thermos appears on the piling before first light, no note.

## Day 14 — the notebook comes to you

Morning: aftermath temperature per verdict (defended: the town overwarm,
overcorrecting, feeding you — `today:fed` is easy all week and that ease
should feel like what it is; exiled: the walk up for coffee is the day's
whole spine — Barb serves you like nothing happened, which is the kindest
lie in the act).

**Fixed scene, both stagings — Priya comes to YOU** (clinic manner, house
call; at the Kettle corner table or the ticket-office doorway, bag in
hand). The engine-tracked interrogation, deterministic tree (the LLM
touchpoint layers on later; this version is canon and complete):
- She reads your own Day-3 words back from the notebook, verbatim,
  quotation marks audible. Options are built from what you actually said
  (conditional choices on `lied-at-intake` / `intake-honest-wrist`, the
  Day-6 answer, the Day-9 room answer):
  - **Repeat yourself word-perfect** → she closes the notebook a page
    early; a trust tier softens (fact `truth-told` witnessed by priya —
    "consistency is all I ever ask of anyone").
  - **Improve on it** (the natural, human polish) → the red pen, drawn
    slow: fact `contradiction` (trust −3 by the standing rule). "That's
    better than what you said. That's the problem with it."
  - **Reach for what isn't yours** — a choice offered only if
    `private:memory-taken` (the quilt): use Dianne's story to warm her.
    She catches the seam whole: **"You weren't there for that. Dianne
    was. So how do you carry it?"** — fact `fog-priya-caught-seam` (her
    fear moves; the notebook gets its first entry about what you might BE
    rather than who you aren't).
- Exit line either way, at the door, not unkind: "I'm not trying to catch
  you. I'm trying to be wrong." (Her whole character in nine words; spend
  them here.)

Press opportunity #4 exists this day only on the defended track (Dianne at
the store, wrapping the potluck dishes to go back — asking her what Sam
meant is a press).

## Day 15 — the lullaby

Day: Dianne. Defended: supper at the house (locks-house variant: she
brings it to the Kettle's back table instead — the house stays hers at
night now). Exiled: she comes down to the wharf at dusk with a dish of
leftovers and her coat wrong for the wind, ashamed of the town and unable
to say so — the dish is the apology (`today:fed` on every variant).

**Night 15 — THE HARVEST (set piece, small).** Over the washing-up (or the
dish, on the wharf boards), Dianne hums. Bars 1–2, the lullaby, the
music-box line (cue dianne-theme, lullaby layer up). She catches herself —
doesn't stop — and offers it the way the quilt was offered: "You remember
this one, hon." The room leans in. The bargain has clean edges now and the
scene says so (Day-3 callback, one line).
- **Take it** ("I remember."): ECHO +2; facts `private:lullaby-taken`
  about dianne + paired `private:memory-taken` about dianne; flag
  `lullaby-taken`; emit music.layer lullaby → 0 under the last paragraph
  (visual twin in prose: *she hums the next phrase and it isn't there —
  she goes around it, the way you go around a missing stair, and doesn't
  notice*). She has given you the last of the private ones.
- **Refuse it** — let her keep the end of it ("Hum it again. I like
  hearing it be yours."): UNDERTOW +1; Two Wrens stays open; she finishes
  the tune alone, and for four bars the kitchen is seven years ago and
  nobody in it is dead.

## Day 16 — the name, the log, the question

**Morning (fixed):** if `lullaby-taken` — Dianne, over the first coffee,
easy as weather: **"Morning, Wren."** One word too late to take back. It
does not feel like winning. It feels like a door latching in another room
(pin the paragraph to the flag; this is her only use, ever, pre-endings).
She does not hum at the sink anymore; the scene notices once, five words.

Day hub (two-way):
- **A. Tam.** If `defended-sam` is known to him: the depot bench, and he
  unfolds the mileage log unprompted — @doc: the ruled page, seven Novembers
  back: **`one passenger, cash, no name — 04:10`**. He says only: "I keep
  my columns." The single paper proof she lived, put in your hands because
  of what you did for her brother. (CHORD stays untouched — his fragment
  returns in Act 3; this is the trust that makes it returnable.)
  If `sacrificed-sam`: the corkboard carries it instead — @doc, BC Transit
  letterhead, *route service adjustment*, Penticton run suspended to
  month-end. Tam is gone until Act 3. Evening beat, five words of it:
  Moose waits at the diner door anyway, for the last run that isn't coming.
- **B. Sam.** Gated scene (undertow ≥ 5 AND `told-sam-dont-know`): the
  breakwater, low tide, the game's most guarded friendship arriving:
  **"You're not her. Fine. Then who are you? Because I could use somebody
  who isn't pretending."** He asks what name you'd travel under if you
  ever went — and writes nothing down, which from Sam is sacrament
  (`d16:sam-named`; the Stranger ending's seat gets its name here).
  Without the gate: the shed, the wall, colder — he logs your visit while
  you stand there.

Night 16.

## Day 17 — the trail ends at the till drawer

Morning hub (two-way; missing B is how the ambush route stays honest):
- **A. Clinic.** Priya and the envelope she has carried for seven years —
  Wren's real goodbye letter, the one she never answered. She doesn't show
  you the pages. She reads one line aloud, from memory, eyes open: "'I
  can't stay where everyone has already decided who I am.'" Then, the
  second harvest offer (the fog's, not hers — the room leans in the way it
  leaned at the quilt): **take her memory of receiving it.** ECHO +2;
  facts `private:letter-memory-taken` about priya + paired
  `private:memory-taken`; flag `letter-memory-taken`; cost written on
  screen next scene: she is KIND to you — the displaced guilt has lost its
  object; the last testimony of WHY Wren left now lives only in the thing
  the fog built. Refusing (UNDERTOW +1) keeps Two Wrens open and gets you
  one true thing: "She wrote to me because I was the safe one. I have
  spent seven years being the safe one." (`today:remembered` either way.)
- **B. The mail run.** Barb sends you across with the Kettle's outgoing
  bundle; in Dianne's counter clutter, a Canada Post delivery slip, three
  weeks old — signature required, *received: D. Cole*, sender: none. The
  drawer under the till has a key that has never left the register's side
  until this month (`found-mail-slip`).

**Night 17 — THE LETTER (hard branch set piece; fires only on
`found-mail-slip`).** The General after hours (locks-house variant: it's
Sam who lets you in with the stockroom spare, if `d16:sam-named` — the
alliance buying the truth-route; otherwise the side door Dianne has never
once locked because the town doesn't, until this month, and tonight it
catches — half-turned — and gives). The till drawer. Inside: the envelope
with no return address, opened once and put away; under it, a lined page
in Dianne's hand, folded twice, never sent.

- **Open them (stakes major)** → **THE REVEAL, knowing route.** Wren's
  letter as @doc, short, alive, unmistakably a person and not a memory of
  one — sign-off per title-thread: *"Tell Sam he can stop keeping it. I
  was never here anyway — that was the whole trouble. — W."* Then
  Dianne's unsent reply-draft as @doc, salutation **"Wren —"**, and the
  double edge in her own hand — the draft breaks off mid-line where the
  truth of the house got too close; final legible line guidance: she asks
  her daughter to hurry, *"before I get too good at the other one."*
  Bars 1–5 play complete for the first time in the game (cue: title —
  the title screen has been the reveal all along), then music.stop where
  the sixth should be; hold the rest four seconds; distant horn
  (horn-on track) or the fog against the glass (stopped). Flags
  `letter-opened` + `knows-truth`. The scene is read alone, at night, and
  the player and the protagonist learn what they are in the same breath.
  Post-scene: the walk back up re-renders NOTHING tonight — the Return
  Pass waits for daylight (Day 18).
- **Burn it unread (stakes major)** → the stove is four steps away and
  already lit for the morning. Both papers. Flag `letter-burned`; STATIC
  +10. *The fire takes it the way the lake takes things — completely, and
  as if it had been waiting.* The tin on the shelf gains company; the
  reveal will ambush at the bus stop, Nov 28, mid-ending, live.
- **The other book (stakes major; hidden unless STATIC ≥ 16)** → not this
  drawer, not this paper: cross the dark lot to the Kettle, where the
  register sleeps under the counter. → **ASH (ending, Act 2's dark
  exit).** Two scenes: the burning (music.stop; the double-inked pages go
  last, fighting; the NAME column's blank line is the first to catch, as
  if it had less holding it down) and the morning after — the town wakes
  with no Wren in it at all: the potluck banner says SEVEN YEARS above a
  hall nobody can say the reason for; **Dianne holds the guitar out to
  Sam and asks whose it is; Sam — promise voided, with nothing left to
  keep it about — doesn't know.** You are still here. Nobody ever calls
  you anything again. `ending: 'ash'` — full strength, no rescue line.

If Day 17 slot B was missed: no Night-17 scene fires; the letter is never
found; the ambush route proceeds innocent (no flag; Act 3 distinguishes
burned-knowing from never-found by `letter-burned`'s absence).

## Day 18 — the Return Pass (knowing route) / the lighter fog (burned)

- **knows-truth (letter or early-truth):** the act's quietest day is a
  re-reading. Four short scenes or beats, each tagged `recontext: true`,
  each re-rendering EXACTLY one line with its post-reveal reading, never
  explained (twist-table §Post-reveal Return Pass; act2-lint requires all
  four): the gravel beach (no cold in you, and now you know why), the
  Kettle (the register, and what Barb's double ink has been holding
  together), the General's corkboard (the circled card — a countdown you
  can finally read: ten days), the wharf (Wade's back as he plays, or the
  locked shed and the man who knew first). One line each. The prose does
  not gasp; it puts things down gently where they were always standing.
- **letter-burned:** the fog is lighter and you tell yourself that means
  something. STATIC tells surface in Barb's book tier language. One beat
  at the stove tin if the player revisits Dianne's: the lid doesn't sit
  flush anymore. Nothing else changes, which is the horror of it.
- Evening (both): Dianne at the store wrapping the potluck dishes to send
  back — knowing route, one unbroken domestic minute where you watch her
  tape a parcel and understand every day of the last three weeks; the act
  does not let you confront her (Act 3's cascade owns confession).

## Day 19 — the read-back, and the card

Morning: single quiet slot. The snowline is at the orchard fence. Nine
days. (The countdown made visible is the weather now; no one remarks.)

**Evening — THE REGISTER READ-BACK (set piece, both stagings; exiled: Barb
walks it down to the ticket office under her coat and reads by the stove —
Barb coming to you is the act's one unbent kindness).** She opens the book
and reads your winter back, in her hand, in her order: conditional
paragraphs over the run's real record — the Night-1 goodbye answer (in the
player's verbatim words via the choice log where surfaced), the quilt and
what it costs Dianne now (or that you let it stay hers), the trap in the
boat shed, what you gave Sam at 2 AM, the valve (either verb), the potluck
(both verdicts get their line; `potluck:sam` gets its own), the lullaby or
its refusal, last Thursday's clinic. Include one entry the player will
have genuinely forgotten (the Day-2/Day-4 small kindness or refusal —
whichever the flags hold) — "you'd forgotten that" is the scene's proof
that the book is truer than you are. She reads nothing about the letter;
if it burned, there is a smell she does not mention. She closes the book
with her palm flat over the NAME column (Act 3 owns what's under her
hand), and if her trust is high: "Winters end, you know. Best ones end on
purpose." (`barb:counsel-seeded`; the Long Winter's door, one sentence,
never pushed.)

**Night 19 — act close.** Both tracks, one paragraph each, mirroring the
Act 1 close: horn-on — five bars, the stop; and inside the held sixth,
for one breath, a pressure that might be a note of your own arriving early
(UNDERTOW players hear their haunting begin; no choice offered yet).
horn-stopped — the silence has finished eating and sits back; the count
does not tick tonight, which is somehow worse (decay still applies
mechanically). Then the card: **ACT THREE**, `time.set day 20`,
`ending: 'act2-end'` (the current build terminates here; Act 3 replaces it).

## Mechanics introduced this act
- Presence decay engine (nightly, horn-stopped; offsets `today:*`;
  rotation + diegetic tells; survivability rule)
- `witness` derived resolver (flesh + name) and the computed potluck verdict
- The press-counter → `dianne:locks-house` staging change
- Two-verdict staging (defended town / wharf exile) carried by every scene
  Day 14+
- The two erasing harvests with paired private facts (Two Wrens gating)
- Early-truth route (dramatic irony inverted; ≤1 knows-truth variant
  paragraph per scene)
- Return Pass recontext scenes (`recontext: true`, exactly four, one line each)
- An in-act ending (Ash) with STATIC-gated visibility
- Retellings continue on every hub day (spike-fomo rules 1–6 binding)

## Cues used (existing only — no new music)
pub-warm, foghorn-312 (horn-on nights), dianne-theme (+ lullaby layer to 0
post-harvest), wade-theme, priya-theme, sam-theme, tam-theme, hall-upright
(potluck), wrens-room (albums), horn-close (Day 8 wharf, horn-on), title
(the reveal), shingle (Day 18 beach), music.stop (the valve's children:
Ash, the reveal's held rest, stopped-track nights are cueless).

## Testing (Phase 3 gates for this act)
- act2-lint: touch sweep (zero NPC-initiated, no exceptions), title counts
  pinned (2 spoken / 1 written), 'Wren' counts pinned (2 prose — one
  potluck, one flag-gated Dianne — 1 @doc), Dianne-never-names guard
  (her 'Wren' paragraph must carry the lullaby-taken gate), prose economy
  (warn 120 / fail 150), detune twinning with PROSE_TWINS extension, day
  ladder 9..20 exactly once each, decay block present in every night scene
  8–19, EBUS card re-surfaced ≥ once with the double ring, all four
  recontext scenes exist, locked-label rules (glyph, ache)
- Walkthrough tests per cluster (like day34/day56/day7 tests): both
  potluck verdicts forced and pinned; both Sam choices; managed vs
  unmanaged decay trajectories; lullaby/letter-memory take and refuse;
  letter open / burn / never-find flag outcomes; Ash reachable only at
  STATIC ≥ 16 and terminal; act2-end reached on every non-Ash route
- Whole-game lint keeps: 07:40 exclusivity, touch, duplicate scene ids,
  goto resolution (content.test.ts already sweeps)
