# Act 3 Plan — The Homecoming, Days 20–23 (LOCKED 2026-07-17)

> **Status: LOCKED.** act1-beats.md, act2-beats.md, and this document are all locked.
> Synthesis of four independent design drafts (payoff-architecture,
> confession-first, endings-back, systems-finale) scored by a three-judge panel, with
> every graft the judges required folded in, hardened by two adversarial audits, and
> locked 2026-07-17 when Eric ruled all eleven questions in **Rulings** at the end.
> Music still ships nothing unheard: the sixth-bar candidates are rendered
> (auditions/sixthbar-*.wav) and await ears; every new cue stays behind a flag
> until auditioned.

Act 3 covers Days 20–23 (Nov 25–28; Day 23 is the twice-ringed Friday) plus the
endings. The thesis, from the winning draft:

**Act 3 inverts the harvest.** For two acts the town fed the player curated memories
of Wren; in the last four days, six people finally hand over the memories they kept
*from* her — the guilt — and the player's verbs at each confession (TAKE / ANSWER /
STAY SILENT / REFUSE) decide whether confession is theft, absolution, or witness.
Each person who says the thing aloud releases their fragment back into the air, so
the song reassembles at exactly the rate the seven-year lie disassembles. Sam, the
honest son, opens the cascade on Night 20; Wade, the man who made you, closes it at
3:12 on Night 22 with the unspent "not here" horn speech. Then Friday: the door
hisses, and every ending is the same question — whose absence does Lorn Bay finally
admit — answered by arithmetic the player has been doing since Night 1.

---

## Canon corrections this plan is built on (verified against shipped code)

- **The green door is at the back of the TICKET OFFICE** (day6.ts:184), not the horn
  room. Behind it: **the folded coat** — Wren's coat, found folded on the wharf at
  dawn seven years ago, kept behind that lock since; proof she staged the lake.
  (Already on decisions.md's approved ink-vignette list. On exile staging it has
  been six feet from the player's cot since Day 13.) The horn room separately holds
  the valve ledger and seven years of Wade's own crossed-out pencil sixth bars.
- **Wren's departure is already pinned to Nov 18** by the shipped Day-16 mileage-log
  @doc (the 4:10 entry, the potluck anniversary — the rhyme the sleuth persona
  caught). All confession content must agree with a Nov 18 departure; never write
  "last week of November."
- **The bible's hum-lock mechanic is phantom**: no `hummed-original-sixth-bar` flag
  exists in Acts 1–2 (only `d3:hummed-chart` and `hummed-bar-four`). Nothing in this
  plan gates on it. Ruled 2026-07-17 (Ruling 9): dropped from the bible.
- **Already fixed in the tree (pt2 wave, 2026-07-16) — do not re-solve**: the
  act-boundary save hold (`act2-end` saves survive relaunch; regression tests in
  apps/cli), Barb's margins through Act 2, trust:barb reachability (axes rows +
  through-play tests). Act 3's only duty: keep those tests green and extend them.
- **Weekday hygiene**: by the locked calendar Nov 28 is a Friday. Act 3 prose names
  no weekday except Friday; audit shipped Act 2 prose for stray weekday references
  before the finale hard-commits "Friday" on screen.

## Title and name discipline this act (pinned by act3-lint)

- Spoken "not here" pre-endings: **exactly one** — Wade's horn speech (the whole
  quoted block counts as one ladder use, including Wren's line quoted inside it).
- "Wren" in Act 3 prose: **zero before Day 23.** The bus stop owns the name. The
  Sixth Bar's greeting is the game's first player-adjacent use; Wren, Again's
  "nobody here by that name" is the last.
- The glyph-rot attractor and the register's NAME column are the title-ladder's
  mechanical stage — exempt from the dialogue count, pinned to exist.
- The Two Wrens hand is the touch-invariant's single sanctioned break (scene-id
  whitelist in the whole-game lint); every other ending is swept clean of contact.

## The two tracks, at endgame pitch

The Foghorn Choice still splits everything. **Horn-on**: the drone continues, decay
stays off, Wade's confession arrives warm (wade-confession-seed), complicity is the
carrier — and Unwitnessed is foreclosed (the fog keeps what it is paid for).
**Horn-stopped**: NIGHT_DECAY (act2-shared.ts, verbatim — the grammar is lint-pinned,
do not fork it) spreads into Nights 20–22; Wade must be earned; the Stranger's door
exists; silence is where the sixth bar can be composed.

**Offsets migrate INSIDE the cascade** (named ruling, locked 2026-07-17 — Ruling 5): from Day
20, today:fed / today:named / today:remembered live inside confession-adjacent
scenes — attending the truth feeds you; managing decay and pursuing the mystery
become the same spend. Survivability rule holds every day (≥1 reachable offset)
with ONE authored exception on refusal-pattern runs (below).

## Contract — what Act 3 reads and writes

READS (all must branch): knows-truth / early-truth; letter-opened / letter-burned /
neither (never-find → bus-stop ambush); potluck:verdict, potluck:sam; lullaby-taken,
letter-memory-taken; d16:sam-named; barb:counsel-seeded; horn-on/stopped + decay
flags; d18:kettle-day (read at Dianne's Day-20 opener: "Twice in two days, and now a
third." — gated notExiled: on exiled runs Day 19 was not staged at the Kettle,
so the "twice" arithmetic only holds for non-exiled; reword or gate); the
FED-PATTERN SUBSTRATE (see below); n1:goodbye (never/forgot/door — the sixth-bar
variant key); the Night-1 truth-tags; told-sam-dont-know; defended-sam;
sacrificed-sam; dianne:locks-house (Dianne's confession staging);
wade-confession-seed (the crown's horn-on staging); staticMeter.

**The fed-pattern substrate (specced here so the Day-22 dark read is not the
project's third dead gate — today:fed is a boolean cleared nightly by
NIGHT_DECAY and nothing shipped counts meals):** the pattern is
`refused-first-meal AND NOT ate-first-meal` (both shipped Night-1 facts) `AND no
a3:fed-* fact present` — where every Act 3 fed site adds one distinct countable
fact (a3:fed-d20, a3:fed-d21, a3:fed-d22m) alongside setting today:fed. Presence
checks over named facts, no counters, all shipped machinery. Pinned in the
testing list.

WRITES: conf:sam/dianne/priya/tam/barb/wade; chord (0→6 via chord.add); dianne:ready,
priya:ready, tam:ready; wade:door-thawing (stopped track); wade:taught-valves
(the crown; Sixth Bar prerequisite); the lever flags — DEFINED as set by the
confession that names the next keeper: lever:wade ← conf:sam, lever:priya ←
conf:dianne, lever:tam ← conf:priya (aliases in prose, real flags in code);
sixthbar:1/2/3 and bar6:final ∈ {borrowed, new, unset}; sam:friday (read by the
Day-23 shelter staging table); long-winter:chosen; pack-the-name (evaluated
ONCE, after Night 22's decay resolves — see the Stranger); fed-the-absence;
a3:fed-d20/d21/d22m (the substrate above); helped-barb-ice (new axes row, trust
+1, witnessedBy ['barb'], knowers-restricted — the FIFTH rung; note the rung
arithmetic: barb:counsel-seeded is WRITTEN at d19-evening from the four shipped
rungs, so the Long Winter seed needs two of the FOUR by Day 19 — the fifth rung
rescues Barb's N21 confession gate, and her confession RE-RUNS the seed check
(counsel-seeded also set at N21 when trust:barb ≥ 7), which is what makes the
Day-21 ice rung matter for the ending; testing item (f) proves it through the
N21 path); fog-told-priya-what-you-are (fear +2 via the standing fog-* rule);
a3:sat-with-moose (must land Day 20/21 evening to gate Tam's Day-22 afternoon;
any evening still serves the Stranger); standing-place. "Ostracized-Sam
profiles" in the Wren-Again staging is DEFINED as sacrificed-sam AND NOT
conf:sam. (helped-sam-wall: cut — no beat earns it; the wall is down before the
player arrives.)

---

## Day 20 — Nov 25: The House Prepares

**Morning (fixed, both stagings).** The corkboard's EBUS card is GONE — a darker
rectangle in the cork where it hung (Nov 28 advancement #1: the countdown has gone
private; knows-truth gets one line — she is hiding it FROM you, which means she
knows what seeing it does). sacrificed-sam runs ONLY (the suspension is shipped
only on that route — day16.ts:188, "No Tam till December" day16.ts:333): a new
@doc under the thumbtacks, BC Transit letterhead, Penticton service RESUMED
effective the 26th — with one line reconciling the early resumption against
"till December" (the district relented; nobody says for what). All other routes:
the service never stopped, and the card's absence carries the beat alone. On the
walk past the General, Dianne
is airing Wren's room again — second time in seven years. Sam's potluck bill lands
onstage the same walk: the shed's plywood wall is down — map, X's, GARBAGE folder,
gone; a duffel where the tripod stood. Nobody mentions it, which is how the town
mentions it. (potluck:sam='given': packed and zipped; 'defended': half-packed;
'silent': wall down, map folded in his jacket.)

**Day hub (2 of 3; missed slots fire without-you retellings — Act 3 retellings are
confession-shaped and slightly wrong, clue-#8 grammar; missed slots SEED but never
complete confessions):**
- **A. Dianne — the room.** Turning the mattress; the guitar comes down off the wall
  into your hands or doesn't (FLESH ≥ 5, lockedLabel ache). Sets dianne:ready.
  knows-truth: a press choice exists ("Who is the room for?") — she doesn't answer;
  the act's confessions are given, never extracted.
- **B. Wade — the wharf.** horn-on: he is painting the green door — the interior
  back door of the ticket office, onstage at last; on exiled staging that room is
  the player's dwelling, so he asks leave at YOUR threshold to paint a door
  inside it ("your door now" — and doesn't explain the padlock). He lets you hold
  the can; today:remembered if you let him tell you what she did to bar five. horn-stopped: silence-standing #1 —
  you carry one battery end and he allows it, first time (wade:door-thawing step 1).
- **C. Priya — the clinic, packing for winter closure.** letter-memory-taken runs:
  she finds the envelope in her own files mid-packing, opened, addressed in a hand
  she knows, and cannot remember reading it — goes still for one paragraph, files it
  in her bag, not the box (seeds her Day-22 devastating variant; the harvest cost
  paid onstage). Otherwise: one question, notebook CLOSED, first time — "Are you
  staying past Friday?" Sets priya:ready.

**Evening (fixed).** The Kettle plans Friday out loud as logistics — who meets the
coach, whether the shelter light works — and never says why. Barb serves you inside
the planning like furniture. **Warm unpriced beat of the day** (tonal-ceiling rule,
one per day, Days 20–22): the coach manifest gets read out and a name on it makes
the room laugh — one beat that costs nothing and prices nothing.

**Night 20 (fixed).** **SAM'S CONFESSION** — 2 AM, the gutted shed, mirror of Night
6. Fires on (told-sam-dont-know OR d16:sam-named OR derived trust:sam ≥ 7 via
defended-sam) AND potluck:sam ≠ 'given' — an OR-door so no single Day-6 choice
dead-gates the cascade. THE FACT: she woke him climbing past his window with a
pack; from the breakwater he watched her paddle out dark toward the highway shore
(the staged canoe — the murder-board's three landfalls finally one story); she saw
him, came back within voice-reach, and made an eleven-year-old promise: "Don't tell
them where I went. Let them decide." THE GUILT: **he waved.** He thought it was an
adventure and he waved her off. Moose line (plant #1 paid): "The dog walked her to
the pull-in. Came back alone. He's been seeing her off every night since." On
knows-truth routes a marked choice spends the letter's own sentence — "You can stop
keeping it." — as the release. chord.add +1: bar 5 enters the ensemble in the
whistle voice; he whistles it once, first time since he was eleven (giver-hears-it
line, one per fragment). Verbs: ANSWER (undertow +1, fact truth-told witnessed by
sam) / STAY SILENT (he reads it as the fog's answer) / TAKE is not offered — Sam
hands you nothing. Sets conf:sam.
On 'given' runs the scene does not fire: the shed light burns and you are outside
it, the window between you — Act 3's coldest without-you beat; repair opens Day 22.
NIGHT_DECAY runs (all Act 3 nights, stopped track); the **unpayable-night rule**
arms tonight (see Unwitnessed).

## Day 21 — Nov 26: The Ask

**Morning hub (2 of 3):**
- **A. Tam at the depot** — the 07:10 idles (sacrificed-sam runs: first run
  back since the suspension; all others: his regular morning). NOT
  sacrificed-sam: he nods you aboard, asks nothing outbound, says one thing on the
  return: "Friday I've got a pickup. Vancouver coach connection." (the innocent
  route's honest Nov-28 pulse; ambush-safe wording). Sets tam:ready.
  sacrificed-sam: he is civil to everyone and does not see you — tam:ready then
  requires Priya's hook (lever:tam — her confession names his mileage math; she
  outranks his grudge) or the Moose mercy gate (below).
- **B. Barb — the Kettle morning.** The pie-case compressor has quit; hauling ice
  from the walk-in all morning = fact **helped-barb-ice** (witnessedBy ['barb'],
  trust +1, knowers-restricted — the fifth rung).
- **C. The guitar — Wren's room alone** (gate: FLESH ≥ 5 AND dianne:ready). Your
  hands know chords they were never taught. **Sixth-bar composition moment 1 of 3**
  (flag sixthbar:1) — see Mechanics: composition.

**Evening (set piece).** **DIANNE'S CONFESSION** — defended staging: her kitchen
after supper; on locks-house runs she UNLOCKS the door for you while you watch, the
reversal being the tell. Exiled staging: she comes down to the ticket office at
dusk, Day-15 mirror, coat still wrong for the wind, and confesses on the wharf
boards with the dish going cold between you. Gate: dianne:ready OR knows-truth
(she confesses to the one who already knows — deliberately the most reachable
confession); if neither held by Day 21, her confession itself can fire at the Day
22 morning catch-up slot (Kettle back table staging) so no single Day-20 slot
pick dead-gates chord = 6. Her deepest tier requires knows-truth: **"I needed to
get the words right before Friday."** — the rehearsal admission said kindly to the
rehearsal's face. THE FACT (all routes): she found the goodbye note by six that
morning, read it once standing at the cold stove, lit the stove, and had told the
neighbors "the canoe's gone" before the kettle boiled. There was never a search she
believed in. THE GUILT: "I would rather have had a drowned girl than a left one.
Then the fog agreed with me." On lullaby-taken: the confession is WORSE — she tries
to hum what she is confessing about and goes around the missing stair mid-sentence
without noticing; the scene marks it once; her fragment returns to the ensemble
and not to her (chord.add +1 either way; on refused routes she hums bars 1–2 whole
as she says it, and for four bars nobody in the kitchen is dead).
**Folded inside it, THE ASK — the Day-13 debt cashed at face value:** defended
verdict — Dianne (knows-truth: knowing exactly what she is asking) asks you to
stand with her at the shelter Friday; the orchard man who said "That's Wren, son"
touches his hat on the porch as you leave, and the potluck vote becomes an
obligation with a date on it. Exiled verdict — Wade brings word down instead,
unasked and ashamed: the town would rather Friday didn't have you in it. Either way
the trap the town built at the potluck is said aloud; "Tonight is not when this
costs" is done being deferred. Verbs at the confession: TAKE her memory of the
burning (ECHO +2, priced dark: she forgets the note existed — the tin goes
senseless to her) / ANSWER / STAY SILENT. Sets conf:dianne. **Warm unpriced beat:**
Sam's duffel arrives at the ticket office before the scene — he sent it ahead, to
wherever you are.

**Night 21.** **BARB'S CONFESSION** (gate: derived trust:barb ≥ 7 OR knows-truth —
the truth shared is its own door). After close at the Kettle, one lamp; exiled
staging: carried down the hill under her coat, the Act 2 kindness rhymed once —
the second time is the confession. **The register opened to the NAME column at
last** (title-thread payoff, @doc): forty years of winter guests, every NAME line
in her hand reading the same two words, back to a line that reads only "Frank."
Yours still blank. THE FACT, past the Night-11/12 stonewall (the Frank balance):
not what Frank WAS — she paid that at Night 12 for early-truth runs — but how his
winter ENDED: she woke one March morning unable to remember his laugh — the second
one had worn the first one out, exactly as warned — and so SHE ended it: poured one
mug instead of two, stopped double-inking, and he was gone by noon. And the
confession under that — knows-truth tier ONLY (on innocent trust-gated runs this
line is the cascade's bluntest ambush leak and is withheld): she has already
caught herself once this week reaching for
the true Wren's face and finding yours. **BARB'S SIXTH QUESTION** closes the scene:
"Five, I asked you, first night. Here's six: what'll you do Friday?" — five
questions : five bars :: sixth question : sixth bar; the answer echoes verbatim at
the wharf on Day 23 (Night-1 intake IOU paid structurally). chord.add +1 — her
chords enter: the score finally gets its harmony. Sets conf:barb;
barb:counsel-seeded upgrades to the live Night-22 door only through this scene.
If neither gate holds: a two-line non-scene — the book stays under the counter, she
double-inks something you can't read; her fragment stays hers (missable, priced).

## Day 22 — Nov 27: Last Clinic, Last Supper, Last 3:12

**Morning hub (2 of 3 — the act's tightest slot math, relieved by Tam's afternoon
placement):**
- **A. PRIYA'S CONFESSION** — the clinic's last open day; exam room half in boxes:
  the town's medicine leaving as its truth arrives. Gate: priya:ready OR
  lever:priya (Dianne's hook — each confession names the next keeper; the lever
  chain is the cascade's redundancy: Sam names Wade's 3:12, Dianne names Priya's
  letter, Priya names Tam's columns. The chain does NOT loop back to Sam — Tam
  confesses after Sam's only windows, so chord = 6 hinges on the Night-20
  OR-door and, on 'given' runs, the Day-22 repair; the walkthrough tests treat
  those as the load-bearing doors they are). THE FACT:
  Wren's real goodbye letter came to HER — "I can't stay where everyone has already
  decided who I am" — and between its lines was a door: a poste-restante address in
  Vancouver, good for six months. She never answered; she let the address expire on
  her desk while she built the version of herself that would have answered. Seven
  years of forensic hostility was displaced cowardice. She closes the intake chart
  with an X — the Night-1 form finally completed. If letter-memory NOT taken: she
  reads the letter aloud entire, and bar 4 UN-INVERTS live mid-scene (pre-rendered
  crossfade — music spec, requires approval). If letter-memory-taken: the
  inversion — she has nothing left to confess; the scene requires YOU to confess
  what you took (marked choice, stakes major; fact fog-told-priya-what-you-are,
  fear +2) before the fragment returns. chord.add +1. Sets conf:priya.
- **B. Free morning slot** — last approach for any missed confession
  (Dianne's confession itself can fire here / the guitar / Wade-stopped
  silence-standing #2); the catch-up slot, priced against the day's quiet. A
  stopped-track run that needs BOTH Dianne's catch-up and the second
  silence-standing takes Wade through lever:wade instead (Sam's Night-20
  confession names the 3:12) — the levers exist so slot scarcity prices runs,
  never forecloses them.
- **C. SAM REPAIR** (only on potluck:sam='given'; gate undertow ≥ 6): he lets you
  into the gutted shed and confesses at half-voice with no verbs offered but
  silence — you take his accusation standing; bar 5 returns detuned a quarter-tone
  ("the run comes back wrong-footed, like it learned to whistle in another town");
  conf:sam set. Non-given runs, slot C: Sam and the duffel — he deletes the eleven
  room-tone files in front of you, one by one: "I don't need proof anymore. I know
  what I know." (the instruments surrender to the person; clue #12 closed) — and
  asks whether he should be at the shelter Friday; your answer sets sam:friday.

**Afternoon (fixed beat).** **TAM'S CONFESSION** — the depot bay, the empty bus,
engine idling, the ostinato diegetic under the whole scene; he confesses across the
aisle, not the counter: driver and passenger, the only relation he trusts. Gate:
free and unprompted on defended-sam (Act 2's trust made returnable); else tam:ready
or lever:tam (Priya's hook — she names his mileage math, and she outranks his
grudge); on sacrificed-sam without a lever, the depot is empty and the chalk is
in another hand. **Alternate mercy gate** (decoupled from the potluck): fact
a3:sat-with-moose — you sat the cold vigil at the diner door with the old dog on
any Act 3 evening; Tam saw. THE FACT: seven Novembers ago, Nov 18, 4:10 AM, a
nineteen-year-old with a pack flagged the Penticton run in the dark, paid cash,
gave no name — and he knew exactly whose daughter she was, and drove. His kindness
was the getaway car. The log renders @doc, both pages: "one passenger, cash, no
name — 04:10" and, in the same column seven Novembers later, Friday's booking in.
"I keep my columns. Both directions now." **The mirror line, verbatim:** "I kept
checking would you take her seat. Every ride. You never once didn't." (Day-9
mirror-watching plant closed.) chord.add +1 — the pitchless ostinato enters the
ensemble as its PULSE. Sets conf:tam. Placing Tam here, off the morning economy, is
the cascade's designed relief valve that keeps chord = 6 honest against slot
scarcity.

**Evening (fixed).** **THE LAST SUPPER** — on the way in, the front room: the
photo albums are BACK on the shelf, the empty sleeve refilled from a shoebox —
paper returning before the person (twist row #6 paid: the albums were put away
because paper would settle the question; the question no longer needs
unsettling; knows-truth gets one line, innocent routes get the fact plain).
Dianne cooks Friday's homecoming meal a day early, "to have it right," and the
table is set for a count that doesn't include you. knows-truth: you watch her fold the third napkin and understand the
arithmetic. Innocent: the count reads as grief's bad math. **Food-refusal dark read
fires on pattern runs** (refused-first-meal AND ≤ 3 lifetime today:fed): no place
is set for you AT ALL — the town has quietly agreed the guest doesn't eat, the way
it agreed not to notice anything — and from tonight the today:fed offset is
withdrawn from all remaining scenes (named ruling — a deliberate bend of the
survivability rule on the game's last nights). Its visible face, next morning:
**the empty-stool plate** — Barb sets the plate in front of the empty stool
instead, no comment (fact fed-the-absence). On eating-pattern runs: the fullest
plate of the run, and one line makes the cook's portion visible. **Warm unpriced
beat:** Barb takes the good chair — sits down, in her own diner, at your table,
for the length of one coffee. Sixth-bar moment 2 on the walk home: the hall
upright under one hand — and it is freshly tuned, though nobody sent a tuner
(Nov 28 advancement: the town tunes the piano for a Friday nobody names). Flag
sixthbar:2.

**Night 22 (fixed — the crown).** **WADE'S CONFESSION AT 3:12** — the last 3:12
before Friday; the act funnels here. horn-on: the horn room stands open
(wade-confession-seed), he is expecting you, the drone under everything.
horn-stopped: HE comes to YOU — a knock at the ticket office or your unit at 3:10,
because tonight he cannot stand the silence he agreed to — and the confession
happens at the dead horn with the valve still shut, the speech landing over
silence: the darker staging of the same crown. Gates: horn-on — attendance;
horn-stopped — silence-standing ≥ 2 (Days 20–22 wharf slots) OR lever:wade (Sam's
hook). THE FACT, all of it, the held asset spent at full value: (1) the argument —
she came to HIM that last night, the only adult she trusted with leaving, and
asked for the truck to Penticton; he said no; go home to bed. (2) 3:12 — he heard
the horn and knew it was her hands on the valves: five bars, her goodbye said to
the whole sleeping town in the only language she had left — and he lay in bed and
let it finish. (3) Seven years of 3:12 as penance and calling: the horn room's
ledger, and seven years of crossed-out pencil sixth bars, every attempt his, every
attempt wrong — "It wasn't mine to finish." (arms the composition finale's
'borrowed' trap). Then **the horn speech from title-thread.md, verbatim, at full
value** — the act's one spoken "not here." The bleed-through anchor lands inside
it: **"Some nights the lake hums back what I put in. Wrong by a hair. Copies
always are."** (19 days of detuned motifs, anchored — and the player named to
their face, gently, without the word.) Coda: he walks you to the ticket office and
unlocks the green door — the folded coat (exiled runs: it has been six feet from
your cot for nine days). chord.add +1: bar 3 and the drone return; on horn-on runs
foghorn-312 regains its melodic conviction (music spec). Sets conf:wade +
wade:taught-valves (Sixth Bar prerequisite). Clue #5 ("hummed the end different")
begins its payoff here: Wade's Day-7 "She never finished it" was HIS truth — she
never finished it *aloud, for the town*. What she hummed different was hers. The
endings own the rest of that payoff.
**After:** the shortest scene in the game — the walk up at 4 AM. "Friday is
already today." Then the night's two doors, in order:
**THE LONG WINTER'S DOOR** (barb:counsel-seeded AND conf:barb): a stakes:'major'
choice surfaces once, tonight only — "Winters end on purpose. End it tonight."
→ the ending plays from here (below). Refusing it, or never seeing it, falls
through to —
**THE STRANGER'S OFFER** (horn-stopped AND d16:sam-named AND undertow ≥ 6):
quiet, once — "The 4:10 exists. Sam knows the name." Marked choice
**pack-the-name** → Day 23, 04:10. Declining is permanent.
Then Friday. Final decay night.

## Day 23 — Nov 28: The Friday Bus (set piece; prose-economy exception)

**03:12** — the horn takes its five bars (horn-on) or the silence takes its hour.
The tempo-as-dread cue enters here and holds its fixed pulse to the last screen
(music spec, requires approval).

**04:10 (conditional)** — **THE STRANGER departs** if pack-the-name (gates below).
Tam's headlights on frost at the pull-in. Sam is there, hood up, holding nothing,
which from Sam is everything — and at the bus door **Sam speaks the save-name
aloud**: the first resident ever to say your name, and the last. Tam's log takes
its second entry in seven years: **"one passenger, cash. Name given."** Moose
watches the headlights, not you, to the end — even now, at your most real, the
tail never moves; the shape of leaving is the one shape he has waited seven years
for, and it is finally attached to somebody he can see. **Packed-but-failed**
(pack-the-name taken, compound gate failed after Night 22's decay resolved —
the gate is evaluated exactly once, post-decay): one authored 4:10 line — the
run goes out and your legs do not carry you the last thirty feet of gravel; the
name stays where you put it. On declined-offer runs
(horn-stopped + d16:sam-named, chose not to pack): one line at 4:10 — you hear the
run go out, empty; the road not taken made audible. Never-find routes: nothing;
they sleep.

**Morning** — the town readies itself without saying why. Barb's register lies
open on the counter to November 28, the line started and left blank, the pen out
beside it. Dianne wears the coat that was wrong for the wind on Day 15, right for
today. **Missed-confession staging** (absence-as-citizen at the finale): each
unconfessed keeper carries their object visibly and silently into Friday — Priya's
envelope square in her coat pocket, Tam's log on the dash, Wade's shed padlocked
with the key in it. The fragments that never returned stand at the shelter as
things instead of music.

**Dawn — THE STANDING-PLACE CHOICE** (quiet, unmarked, the act's last
invisible-in-prospect decision): *walk up to the pull-in / stay on the boards /
down to the horn.* It reads as where you want to watch from. It decides which gate
you face. Never silent priority: when Sixth Bar and Two Wrens both hold, this
choice disambiguates.

**07:40 — the door hisses.** A four-second mechanical rest, both builds, no input
accepted: **bar 6 rendered as interface.** Then the RESOLUTION LADDER (first match
wins — every rung pinned by a through-play walkthrough test, zero injected state):

1. **THE SIXTH BAR** — at the horn + bar6:final = 'new' + chord = 6 + undertow ≥ 7
   + staticMeter < 30 + knows-truth + wade:taught-valves.
2. **TWO WRENS** — on the boards (standing-place), chose "Step forward." when
   she appears at the rail + letter-opened
   (specifically; early-truth alone does not qualify) + chord = 6 + NO
   private:lullaby-taken + NO private:letter-memory-taken + derived witness
   (flesh + name) ≥ 10 + staticMeter < 30.
3. **WREN, AGAIN** — the computed catch-all, in three stagings (canonical pass /
   knowing / thin), with the **ambush overlays** firing inside whichever staging
   lands (below).

(The Stranger and Long Winter resolve before 07:40; Unwitnessed is metabolic, at
night, never at the bus stop; Ash never reaches Day 20. Coverage is total and no
rung is a fail-state for a modal innocent run — the panel's hard requirement.)

**MOOSE'S BEAT** (all shelter endings — the two-act IOU paid, and the dog LIVES;
ruling recorded against the death-scene draft): the old dog gets up off the cold
concrete, crosses the crowd, and goes straight to the woman on the bus step — no
hesitation, the first creature in Lorn Bay to greet her — because there was never
anything to smell but this. In Wren, Again it is the horror's last turn: the only
witness who knows her is the one nobody heeds ("he's gotten old"), and he is
called back, and goes. In Two Wrens he stands between you and her, leaning on
both (touch ruled 2026-07-17 — Ruling 4: the lean is sanctioned and gets its
own explicit line).

**The never-find AMBUSH** (canon: live, mid-ending): as she steps down, the
recontext detonates in **four to six clues, ONE line each** (word-budgeted,
dedicated lint; the twist-table's second column fired live between the door-hiss
and the town's answer): no cold in you; the circled card; the dog; the photos; the
name never said; the sixth bar she finished. **The burned route gets its own
distinct live reveal** (shipped day17 canon promises burned runs an ambush too):
shorter, complicity-flavored — the stove smell on your sleeves; you chose this
door — two to three lines inside the landing staging.

---

## The seven endings

**1. THE SIXTH BAR (true).** You are at the valves as the bus crests the hill —
the town at the shelter, you below with your hands where she once put hers. Bars
1–5 on the horn, complete, every returned voice in the mix — then YOUR bar, once,
new, over the water: the first sixth bar the lake has ever heard. Above you the
door hisses; a woman steps down into the sound of her own song finished, and the
town turns from you to her because the song told them to — and you go with the
last note, at the wharf's edge, on your own terms: the fog takes its material
back, but **the horn keeps your bar** (the bible's dissolution beat, restored;
Ruling 1 signed 2026-07-17 — ships as drafted here, no tell-the-town line
precedes it). Final screen carries the co-credit the title-thread specifies:
*"NOT HERE" — Wren Cole & —*. Register line: **"not here. was, though."** A
'borrowed' verdict at the finale is played anyway and fails gently — the horn
gives the fog's material back to the fog, and resolution falls through the
ladder. *Target: devastating grace — completion as
self-erasure; the gift that only costs everything. Earned by: the sleuth.*

**2. TWO WRENS (hidden).** Staged on the wharf boards per title-thread (the
standing-place "stay on the boards" route — she leaves the town's arms and comes
DOWN to you): she reads the bus stop in one look — her mother's face doing
arithmetic, the dog leaning on a stranger, the second silhouette below — and she
is her mother's daughter about it: she doesn't ask the town. She crosses and
TAKES YOUR HAND — the game's first unprompted touch, the single sanctioned break,
twenty-three days of invariant detonated in one gesture — and says the thread's
designated line, the title's only affirmation: **"You're here."** Register image: your
NAME line still blank, and beneath it **a second ruled line added where no line
was.** The book has made room. *Target: uncanny hope — wholeness that shouldn't
be possible, earned by every refusal the game priced against you. Earned by: the
open-heart.*

**3. WREN, AGAIN (catch-all, three stagings + overlays).** The door hisses. A
woman steps down — road-worn, seven years older than every photograph, real —
and the town looks at her, and past her, and back at you. Nobody moves toward
her. Moose does. She reads the shelter in one long minute: her mother's hand
hovering at YOUR sleeve, not landing (the touch invariant holds — the hover IS
the horror). "There's nobody here by that name," someone says, kindly, and the
town waves at you while the bus pulls away with her behind the glass — six bars
of breath-fog on the window, and no sound (clue #5's last payoff; see music
ruling). Register line: **"Wren."** — the book finally perjured, because the town
made it true. **Exile's-twin staging** (exiled-verdict runs): Sam reaches her
first — the only one who never believed in you — and leaves WITH her on the same
bus; the potluck verdict made permanent. On ostracized-Sam profiles he is not at
the shelter at all: three hundred yards from the one thing he waited seven years
for. *Target: quiet horror — the pass as damnation; being loved as the wrong
person, forever, with witnesses. Earned by: the skimmer, the vulture.*

**4. THE STRANGER ON THE GRAVEL.** Gates: horn-stopped + d16:sam-named + undertow
≥ 6 + (conf:sam OR told-sam-dont-know) + (NOT sacrificed-sam OR conf:tam OR
a3:sat-with-moose) + flesh ≥ 1 AND name ≥ 1 AND echo ≥ 1 (a thing the fog has
already half-reclaimed cannot cross out of it; collapse forecloses escape) +
Night-22 marked choice pack-the-name, executed 04:10. You leave in her seat, in
the dark, before the town wakes, under the name you gave Sam. Register: the
save-name — **and the entry HOLDS overnight.** The title escaped, once. Coda
(requires Eric's ruling — the player/protagonist epistemic break): one exterior
beat, that evening, the shelter WITHOUT you — the door hisses, a woman steps down
into a town's arms — the reveal delivered to the player three hours after the
protagonist stopped being able to receive it. Fallback if the break is refused:
end on the headlights. *Target: cold self-authorship — freedom priced in
never-knowing. Earned by: the flinch.*

**5. THE LONG WINTER.** Gates: barb:counsel-seeded + conf:barb + the Night-22
door taken + staticMeter < 60 (at ≥ 60 the door does not surface at all — the
fog has too much of you to let you end on purpose; no undefined
taken-at-high-static state exists). The game's only ending selected by declining its
finale — it never sees Nov 28. You choose the last night the way she taught: on
purpose. The goodbyes are small and unannounced — a shelf squared at the General,
the thermos returned to the piling — because Barb's rule is that the second one
mustn't wear the first one out. On refuser runs: the first food you have ever
accepted — one bite, for her, and the prose lets it be enormous. At 3:12 Wade
plays you out (what exactly sounds is the open music ruling), and Barb writes the
NAME column at last, in her steady hand, double-inked: the save-name. It is not
"not here." *Target: elegy — grief done correctly, once, by the two people in
town who know how. Earned by: the open-heart on Barb's road.*

**6. UNWITNESSED (metabolic only — no bus-stop variant).** Checked Nights 20–22
immediately after NIGHT_DECAY resolves: horn-stopped AND two of flesh/name/echo
at 0 (the unpayable night; horn-on runs cannot decay — complicity forecloses
this ending by design; offsets scarcer inside the cascade and withdrawn entirely
on food-refusal-pattern runs after Day 22). The night scene starts and your
prompt is dead. The game continues without you for four minutes — **authored
beats with input disabled, never wall-clock** (CLI/web determinism): Barb tells
Tam the unit's free Friday if the bus brings anyone; Dianne asks after nobody;
the crib pegs move; someone's chair is taken by a coat. A register entry stops
mid-word, and Barb's steady hand finishes it: **"— not here."** Generous
autosave: reload lands 1–2 nights back — NOT shipped today (the CLI keeps one
slot and treats non-boundary endings as finished runs); this is a new Act 3 CLI
work item (night-boundary checkpoint or a rewind list including Unwitnessed)
with its own regression test. *Target: erasure by
neglect — presence was always other people's work, and you let them stop. Earned
by: the wanderer, unmanaged.*

**7. ASH (shipped — Act 2's dark exit, inherited).** No changes. Act 3's only
duties: Day-23 content never contradicts it, the whole-game lint keeps its
terminality, the ladder tests exclude it, and the endings screen counts it among
the seven.

---

## Mechanics introduced this act

**The chord (0→6).** Each confession fires chord.add +1 and returns its fragment
to the night ensemble (act3-ensemble mixer — music spec): Sam bar 5 (whistle),
Dianne bars 1–2 (music box; absent-to-her on lullaby-taken), Priya bar 4
(un-inverts live), Tam the pitchless pulse, Barb the chords/harmony, Wade bar 3 +
the drone. Every fragment return gets exactly ONE giver-hears-it prose line,
lint-pinned. chord = 6 is required by both true endings against real scarcity —
see Testing for the two mandatory through-play proofs.

**Composition (the sixth bar).** Three seeded moments (Day 21 guitar / Day 22
upright / Night 20–22 silence on the stopped track), flags sixthbar:1–3,
bar6:final ∈ {borrowed,new}. Judged by LLM touchpoint (classification only, enum
borrowed/new) with a complete deterministic fallback: **three notated variants
keyed to n1:goodbye**, which partitions perfectly (never / forgot / door, one
always set, already read at day19.ts:60-62 — the truth-tags do NOT partition:
q5 sets one of never-says-goodbye / doesnt-remember-leaving / keeps-promises,
and wants-to-be-seen comes only from q2/q3, so keying on tags leaves some
intakes barless): 'never' → a bar that ends without cadence; 'forgot' → a bar
that quotes bar 1 and stops mid-figure; 'door' → the only variant that resolves
to D. The intake literally composes your bar (clue #11 made mechanical; the
no-key game remains the whole game — every intake has exactly one bar). All three variants REQUIRE ERIC'S AUDITION before any scene prose hardens
around them. Wade's crossed-out bars arm the 'borrowed' trap.

**Glyph-rot (Act 3 owns it; fx.glyphrot event exists).** Typographic only, full
CLI/web parity, silent-play parity; deterministic from hash(sceneId, choiceId,
staticTier) — never live RNG, so save/resume re-prints are byte-identical. Tiers
keyed to the SHIPPED staticTierFor boundaries (16 inked / 30 hissing / 60
walking — one system on two surfaces with Barb's book language): inked — rot
claims lockedLabels first (the already-unchoosable ache, fogged); hissing — one
author-tagged mask-choice per scene renders with 2–3 letters displaced toward the
attractor, and the player's own quoted-back words rot one tier higher than live
labels; walking — the tagged label arrives fully converged: **n o t   h e r e**,
and choosing it is a marked surrender (STATIC +2, the scene's most passive exit;
the player character says the title aloud). Never NPC dialogue, never narration.
Fairness caps (act3-lint): rot never changes effects or targets; at most one
attractor per choice list; ≤2-choice lists cap below the attractor; stakes:'major'
labels cap at tier 1 and keep the first word; every rot-tagged choice has a live
sibling (no soft-locks); the FIRST tier-3 convergence fires as an authored beat.
STATIC sources this act: marked lies in confessions +2; forcing a confession with
harvested material +4; looking away at the door-hiss +2; TAKE verbs +0 — taking
is priced in facts and warmth, not fog. **The fog likes taking.**

**Barb's book endgame.** MARGIN_LINES extends through Days 20–23 (the pt2 pattern
continues); the gossip graph's closing is PROSE-ONLY (margin lines and evening
texture — GOSSIP_EDGES is a static list and mechanically closing edges is new
engine support this plan does not require) as confession becomes terminal
speech — "Dianne's kept her own counsel this week. some tabs stop." — one margin
per closed edge; Day 23 runs no postDay. **Every ending writes the NAME column**,
and the NG+ plain-text ledger's last line IS the ending, diegetically (the
closure table in the endings above).

**Decay endgame.** NIGHT_DECAY verbatim from act2-shared.ts, Nights 20–22; fresh
tells every night (the zero-repeat record extends — three new per night);
offsets inside the cascade; the unpayable-night check in night onEnter AFTER
decay resolves; the two named survivability bends (post-D22 refusal withdrawal;
offsets-inside-confessions) are rulings, not silent authoring.

## Cues (existing first; every new item requires Eric's approval — nothing ships unheard)

Ship all Act 3 scenes wired to EXISTING cues + music.layer/detune/stop first;
every new cue behind a flag until auditioned, so the approval loop never blocks
tests. Audition order, week 1: (1) the three sixth-bar candidate variants — the
act's only genuinely new melodic material; scene prose hardens around them;
(2) act3-ensemble chord.add mixer behavior (fragments re-entering nightly);
(3) Priya's bar-4 live un-invert crossfade; (4) the bus-stop tempo-as-dread fixed
pulse; (5) Wren, Again's title arrangement with the melody detuned a quarter-tone
under the town's waving (the lie-detune turned on the whole town at once);
(6) the Long Winter 3:12 (pending the sixth-bar rendering ruling); (7) the
horn-on crown's foghorn-312 regained-conviction variant (a new rendering of an
existing cue — auditioned with item 2's mixer work).

## What Act 3 must not do (rulings carried forward)

- Early-truth via Barb is Night 12 ONLY; Act 3 never re-opens that door.
- Priya's "But then I wasn't here either." stays; her Act 3 scene rhymes with it,
  never repeats it.
- Clue #5 is planted exactly 3× in Act 2 (pinned); Act 3 PAYS it (Wade's crown,
  the breath-fog window) and never re-plants it.
- Wade's horn speech: spent exactly once, Night 22, verbatim from title-thread.md.
- Nobody touches the player first except the Two Wrens hand (whitelisted).
- Dianne's name budget: "Wren" zero before Day 23.
- The town never remarks on the wrongness — including at the bus stop, where the
  not-remarking becomes the horror.
- The never-find route's reveal ambushes at the bus stop, mid-ending, live; the
  burned route gets its distinct shorter ambush. Neither route's Days 20–22 leak
  the reveal (Tam's "pickup," the tuner, the returned albums are pulses, not
  spoilers — ambush-safe wording throughout).
- No weekday named except Friday. Departure content consistent with Nov 18.
- act2-end is UNSEALED the way act1-end was (the shipped precedent): keep the
  card and its time.set, drop `ending:`, gain a goto into d20-morning (act2-end
  owns `time.set day 20`; d20-morning sets slot only). Once unsealed, the CLI's
  ACT_BOUNDARY_ENDINGS hold path (pt2-fix-01) retires for 'act2-end' — held
  saves resume straight into Day 20 with all contract flags intact, which is
  what the hold existed to protect.

## Testing (act3 gates)

- **act3-lint**: title/name budgets above; glyph-rot rules (attractor spelling
  with canonical letter-spacing, caps, live-sibling, tier thresholds, pinned
  rot-tag count); ambush ≤ 6 clues × one line; giver-hears-it exactly one line
  per fragment; per-night-fresh decay tells, zero repeats; the touch whitelist.
- **chord = 6 schedulability, one concrete schedule per track** (verified at
  plan time, to be pinned as the two walkthrough tests): *horn-on defended* —
  D20 A+B (dianne:ready, Wade paint), Sam free N20, Dianne D21-eve, Barb N21
  (trust rungs or knows-truth), Priya D22-A (ready or lever:priya), Tam free
  afternoon (defended-sam), Wade N22 free (wade-confession-seed). *Horn-stopped*
  — D20 A+B (ready + silence-standing #1), Sam N20 (OR-door), D21 A+B (tam:ready
  + helped-barb-ice), Dianne D21-eve, Barb N21, D22 A+B (Priya + silence-standing
  #2 or lever:wade), Tam afternoon, Wade N22 earned. Enum hygiene: potluck:sam
  value strings per shipped day13.ts — verify exact names at authoring time.
- **Twist-table coverage** (verified at plan time): all 12 rows paid — #1/#7
  ambush lines, #2 the whitelisted hand, #3 the name budget + Day-23 uses, #4/
  Moose's beat, #5 Wade's crown + the breath-fog window ("she finished it after
  she left" — canon's post-reveal column), #6 the albums returning once the
  question no longer needs unsettling, #8 Sam's staged-canoe fact + Act 3
  retelling grammar, #9/#10 the NAME column and the crown, #11 the truth-tag
  sixth-bar variants, #12 Sam deleting the files. act3-lint pins the four
  recontext scenes' Day-23 equivalents (the ambush inserts).
- **Ladder reachability, through play, zero injected state** (the trust:barb
  lesson, now standing policy): one pinned walkthrough per ending rung, PLUS
  (a) chord = 6 on a horn-on witness-high shape; (b) chord = 6 on a horn-stopped
  undertow-high shape; (c) a typical mixed run proving chord lands 3–5;
  (d) Unwitnessed reachable on an unmanaged stopped run and UNREACHABLE horn-on;
  (e) the Stranger's full gate; (f) Long Winter through the five-rung trust
  arithmetic (existing day1719 tests extend); (g) Wren, Again catch-all absorbs a
  mid-profile innocent run (the anti-fail-state assertion); (h) Ash runs never
  reach Day 20; (i) the fed-pattern substrate: a refuser run reaches the Day-22
  dark read through the two Night-1 facts + absent a3:fed-*, and one Act 3 meal
  defuses it; (j) the Unwitnessed rewind (new CLI work item) round-trips. Note
  for the walkthrough authors: the Stranger's "(conf:sam OR told-sam-dont-know)"
  conjunct is implied by d16:sam-named (which gates on told-sam-dont-know) —
  keep the redundancy in code as defense, but the tests must not treat them as
  independent doors.
- **Undertow reachability lint**: the authored Act 3 undertow gains (ANSWER
  verbs, standing with Sam, composition moments — 2–3 reachable +1s) arrive at
  ≥ 7 through play on a committed run; gates are honest only while those gains
  survive content passes.
- **Save-boundary regression** (shipped, keep green): relaunch at act2-end
  preserves every contract flag; extend with an Act 3 assertion once day20
  exists (the held save opens Day 20 with flags intact).
- **Determinism**: glyph-rot byte-identical across save/resume; the four-second
  rest and Unwitnessed's four minutes are authored beats, never wall-clock;
  ~500-run zero-crash record is the bar.

## IOU payoff table (playtest ledger — every item dispositioned)

| IOU | Disposition |
|---|---|
| Wade's green door + motive | PAID: door onstage D20 (painting), opened at the crown's coda — the folded coat; motive complete in the three-part fact (refused truck / 3:12 heard and allowed / seven years of penance bars) |
| Travel-name content | PAID on Stranger (Sam speaks the save-name at the 4:10; log: "Name given."); DELIBERATE DEFAULT elsewhere — the dash in Sixth Bar's co-credit; ruling below |
| Frank, beyond the confession | PAID N21: how his winter ended — she ended it; the forty-year NAME column; Long Winter is its mechanic |
| Bleed-through sound rules | PAID: Wade's anchor line ("the lake hums back… Copies always are.") + chord mechanics make the rule literal |
| Nov 28 advanced | PAID daily: D20 card gone + service resumed; D21 Tam's pickup + the tuner; D22 albums returned + the booking @doc; D23 the person |
| Day-13 debt | PAID D21 evening (THE ASK, both verdicts) + D20 morning (Sam's bill onstage); first sliver was D14 (shipped) |
| Night-1 intake answers | PAID: truth-tags compose the sixth-bar variants (clue #11); n1:goodbye branches the Stranger/Long Winter last lines; Barb's sixth question; Priya closes the chart |
| Moose | PAID at the shelter (crosses to her first), the Stranger 4:10 (watches the headlights), Wren-Again (unheeded witness); ALIVE — ruling recorded |
| Sam's potluck cost | PAID D20 (the wall down / the duffel, variant per potluck:sam) + structurally: 'given' prices out his confession (and chord=6) unless the D22 repair lands |
| Food-refusal dark read | PAID D22 supper (no place set; offsets withdrawn — named ruling) + the empty-stool plate (fed-the-absence) |
| Day-5 "I remember why it matters" | DELIBERATELY DEFAULTED, on record: the claim was accepted without content in Act 1 and Act 3 does not retroactively invent its why; the register read-back already quoted it as the player's own unpaid word |
| "Barb is fenced off" (vulture: never a take-target) | DELIBERATELY DEFAULTED, on record: her confession offers no TAKE, ever. The reason is structural, not squeamish — Barb's memory IS the register; the book is the town's witness and the game's save file, and letting the fog eat its keeper would unmake the mechanic the endings all write into. The fog never gets the person holding the pen. (Confirmed 2026-07-17 — Ruling 11.) |

## Rulings — locked by Eric, 2026-07-17 (nothing here is open)

All eleven questions were put to the creator on 2026-07-17 and ruled in one
sitting. The plan is canon as amended by these rulings. Do not relitigate
without asking.

1. **The Wren, Again partition — PROMOTED.** Wren, Again is the 07:40 computed
   catch-all with three stagings; the bus-stop fallthrough Unwitnessed is
   DELETED (Unwitnessed stays metabolic/night-only). Ending authoring is
   unblocked. (All four drafts and all three judges had converged here.)
2. **The Stranger's coda — SANCTIONED** as an ending-only epistemic break, same
   class as the Two Wrens touch: the player sees the shelter three hours after
   the protagonist left.
3. **Sixth-bar rendering — PLAYER'S BAR ONLY.** The only sixth bar ever
   RENDERED in any ending is the player's; Wren's stays forever unheard (Wren,
   Again: breath-fog on glass, no sound). Long Winter's 3:12 must be re-staged
   as something other than Wade audibly playing a sixth bar — the attempt, not
   the song. Its cue audition (Cues item 6) follows this rule.
4. **Two Wrens' hand — WHITELIST CONFIRMED; MOOSE LEANS.** The touch whitelist
   stands as drafted, and Moose's contact in the same ending is sanctioned with
   its own explicit line (a dog leaning on both).
5. **Survivability bends — BOTH CONFIRMED** as named rulings: post-D22
   withdrawal of today:fed on refusal-pattern runs, and offsets migrating
   inside confession scenes.
6. **Travel-name = the save-name — CONFIRMED.** The name typed at the title
   screen, spoken once, by Sam. No new input UI; no canon change; the
   title-screen input retroactively becomes diegetic.
7. **potluck:sam = 'given' pricing — CONFIRMED.** The cadence-theft forecloses
   both true endings unless the D22 repair (undertow ≥ 6) lands. Act 2 cruelty
   may cost the true endings.
8. **LLM composition judge — APPROVED** (classification only, enum
   borrowed/new, deterministic notated fallback; the no-key game is complete).
9. **Hum-lock — DROPPED from the bible.** Canon now matches shipped code; no
   hum gate exists anywhere and this plan gates nothing on it. game-bible.md
   amended 2026-07-17.
10. **Moose LIVES.** The ruling against the death-beat draft stands, on record:
    the act's darkness is spent on the people, not the dog.
11. **Barb stays UNTAKEABLE.** Her confession never offers TAKE; the fence
    ships as structure, reason on record in the IOU table. The fog never gets
    the person holding the pen.
