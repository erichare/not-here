# Retheme Spec — Lorn Bay (LOCKED 2026-07-04)

> Creator direction after playing the slice: keep the music, mood, twists, and
> structure; move the world. Modern day. Okanagan Valley, British Columbia.
> Modern names. Female protagonist (explicit). Less flourish, less "old-timey."
> This spec is the single source of truth for the rewrite; the game bible and
> twist table are being rewritten to match. Where this spec and older docs
> conflict, this spec wins.

## World

**Lorn Bay, BC** — invented community on the west side of Okanagan Lake,
year-round population ~300, forty minutes from Penticton ("town"). Summer place:
paddleboards, tasting rooms, a packed beach in July. In November it is fog,
frost fans, and eleven lit windows. The lake fog inversion sits on the water for
weeks. **Now: early November, present day.** Day 1 = Nov 6. The circled date =
**Friday, Nov 28** (Day 23).

Texture nouns (use these, not marine-Britain ones): the bench, the orchard
rows, frost fans roaring at 3 AM on cold nights, the Kettle Valley Rail Trail
above town, the packinghouse, quagga-mussel boat-wash signs, the snowline
coming down the hills a little every night (countdown made visible), one bar
of cell signal ("the bench eats it"), the highway you can hear when the wind
turns.

**Season logic:** seven years ago this November, Wren Cole "drowned" — canoe
found overturned past the breakwater, body never recovered (the lake is deep
and cold; it keeps what it takes; everyone knows a story like it). Every
November the town holds a memorial potluck at the community hall. Three weeks
ago, Dianne got a letter with no return address. Wren is alive, and she is
coming home on the Friday bus, Nov 28.

## Name map (mechanical rename, all code + content + comments)

| Old | New | Role translation |
|-----|-----|------------------|
| Wren Halloway | **Wren Cole** | the vanished woman; canoe, not fiddle → she played **guitar**; the song is hers |
| Dora Halloway / `dora` | **Dianne Cole** / `dianne` | runs **Lorn Bay General** (store + Canada Post counter + community corkboard) |
| Sam Halloway / `sam` | **Sam Cole** / `sam` | 18; hunts proof with his phone |
| Maud Kettle / `maud` | **Barb Kettle** / `barb` | runs **the Kettle** — diner + six motel units; keeps the register/tab book by hand |
| Elias Pike / `elias` | **Wade Pike** / `wade` | caretaker of the **old ferry wharf**; last engineer of the lake ferry; sounds the horn |
| Ivy Anand / `ivy` | **Dr. Priya Anand** / `priya` | runs the two-day-a-week clinic; came back for it |
| Tam Osei / `tam` | **Tam Osei** / `tam` | drives the regional bus; Penticton runs; drove Wren out at 4 AM |
| Cobble (dog) | **Moose** | Barb's ancient lab-cross; waits at the diner door for Tam's last run |
| Port Lorn | **Lorn Bay** | "the Bay" in dialogue |
| Kettle & Anchor | **the Kettle** ("Barb's" to locals) | diner room + motel rooms out back |
| post office | **Lorn Bay General** | Canada Post counter, corkboard, the till drawer |
| lighthouse | **old ferry wharf** + breakwater light | ferry ran until the highway went through; wharf preserved, horn maintained |
| pub interview | **the counter interview** | Barb, decaf pot, five strange questions, same mechanics |
| Anniversary Wake | **the memorial potluck** (community hall, out-of-tune upright piano) |
| spring ferry | **the Friday EBUS from Vancouver via Penticton** | Tam does the pickup — the man who drove her out is booked to drive her home |

Engine `CharacterId` becomes: `'dianne' | 'wade' | 'priya' | 'sam' | 'barb' | 'tam'`.
Fact tags/flags rename accordingly (`helped-maud` → `helped-barb`,
`went-to-dora` → `went-to-dianne`, etc.). Cue `dora-theme` → `dianne-theme`
(score exports FRAGMENT_DORA → FRAGMENT_DIANNE etc.; music itself unchanged —
the creator loves it; only names/comments move).

## The horn (unchanged heart, new body)

The lake ferry's compressed-air horn still stands at the end of the old wharf.
Wade keeps it fed from the compressor shed — district pays him to maintain the
breakwater light; nobody pays him for the horn. Every night at **3:12 AM** it
plays five bars of Wren's song out over the water — sound carries for miles on
a fog inversion — and stops where the sixth bar should be. Nobody in Lorn Bay
wakes for it anymore. The score keeps the title **"The Foghorn Song."**

## Modern-mystery doctrine (the digital absence)

Phones exist. They make it worse:

1. **You have no phone.** Nobody offers you one. Nobody remarks on it.
2. **Photos of you disagree.** Every phone photo of you looks fine to whoever
   took it and subtly wrong to everyone else — each person's camera catches
   *their* Wren. (Modern upgrade of clue #6.)
3. **Your voice doesn't record.** Sam's clips play back with room tone where
   you spoke. He shows no one. Who would believe the file wasn't doctored?
   (Sibling of the dog-clue; ties to the score's missing voice.)
4. **Wren's accounts went dark seven years ago.** A memorial page exists;
   Dianne has never once posted to it. Three weeks ago she stopped opening it.
5. **Signal is thin in the Bay** ("the bench eats it") — real interior-BC
   normal, not a conspiracy; the town runs on the corkboard and the diner.

## Clue translations (twist table stays 12 rows; new readings)

| # | Old | New (Lorn Bay) |
|---|-----|----------------|
| 1 | dry salt in seams | you wake on the gravel beach "soaked" — but no lake smell, no milfoil in your cuffs, hair dry at the roots, **no cold in you** on a November night that would kill a swimmer in forty minutes |
| 2 | nobody touches you first | unchanged |
| 3 | Dora never says your name | Dianne: "love," "hon," "my girl" — never "Wren" |
| 4 | dog walks through your space | Moose, unchanged (never growls; fails to register) |
| 5 | sixth bar is a rest | unchanged; three people say "you always hummed the end different" |
| 6 | mismatched face in photos | **phone photos disagree** (doctrine #2); Dianne's physical albums are put away |
| 7 | circled ferry date | **EBUS winter schedule card** beneath the Kettle register on Night 1, then on the General's corkboard, Friday Nov 28 circled twice, pen pressed through — on screen from Day 1 |
| 8 | drowning stories differ | which beach the canoe drifted to, what the weather was, who called it in — all slightly different per teller |
| 9 | ledger fades overnight | Barb's register: unchanged (she double-inks) |
| 10 | Elias keeps playing | Wade keeps the horn fed; knows what it called |
| 11 | title-screen fingerprint | unchanged (counter-interview answers) |
| 12 | Sam's trap questions | plus the recordings (doctrine #3) |

## Artifacts (@doc: blocks)

- The **EBUS card** replaces the ferry timetable (same beat, same scene).
- Barb's **register page**, Tam's **mileage log** ("one passenger, cash, no
  name — 04:10"), Priya's **clinic intake form** with fields she couldn't fill,
  the **memorial potluck flyer** (community hall, "seven years"), Dianne's
  **unburned letter** (Act 2).

## Prose register adjustments

Same spareness, fewer antique rhythms. Kill: "second post," "dray," "spiled,"
"half at the bar," shillings, paraffin (heater stays — rural BC has them — but
lose the lavender-postmistress cadence). Keep: weather as fact, absence as
lens, nobody remarking that anything is strange. Modern dialogue contractions.
Tim Hortons exists but Lorn Bay is too small for one; Barb's coffee is the
coffee. Money is debit taps and a tab book. The store till is where letters
hide.

## Protagonist

Female, explicit, unchanged mechanics. The town calls her by Wren's name;
the save-name is never spoken. She has Wren's hands, most of her face, five
bars of her song.

## Character sketches (new deliverable)

Seven SVG cards, "ink profile + prop," amber line (#e8b45a) on transparent,
consistent stroke style, sketchy not polished — drawings in the margin of
Barb's book:
- **Dianne** — three-quarter profile, reading glasses pushed up; prop: the
  circled schedule card / pen ring pressed through
- **Barb** — profile at the counter; prop: the register, one line double-inked
- **Wade** — profile under a hood, weather-cut; prop: the horn's brass valve
- **Sam** — young profile, hood up; prop: the raised phone
- **Priya** — profile, hair tied back; prop: the notebook and pen
- **Tam** — profile with cap; prop: the folded mileage log
- **Wren** — an empty frame, five short pen strokes where a face would start
