# Spike C — FOMO Calibration Prototype

> Question under test: when the Presence Economy forces the player to miss 2 of 3
> simultaneous scenes, does absence produce content that feels *poignant* rather
> than *punishing*? Below is one full day-slot written out: the attended scene in
> brief, and both "without-you" retellings in full prose. The retellings are the
> product being evaluated. This is also the first prose in the game's voice —
> second person, present tense, spare. It sets the register.

## The slot: Day 3, afternoon

The tide is out until five. Three things are true at once:

- **A. Dora is airing Wren's room.** First time in seven years, Maud says. The
  window's open from the street.
- **B. Sam is at the boathouse,** re-caulking a dinghy nobody uses, loudly,
  alone.
- **C. Ivy holds surgery hours,** and has "asked after you." A checkup. Everyone
  agrees you should go. Everyone.

The player attends **A** (say). B and C resolve without them — each as an
authored variant, delivered that evening as a biased secondhand account. The
engine records `attended:dora-room`, `missed:sam-boathouse`, `missed:ivy-surgery`
into the fact ledger; NPCs witness attendance per the memory model.

## Attended scene (A, compressed for the spike)

Wren's room, sheets on the line, dust in the light. Dora talks to the wardrobe
instead of you. Choice cluster around the fiddle case under the bed — touch it
(FLESH), ask about it (ECHO offer: *she'll tell you the story of the fiddle, and
you feel the room lean in when she does*), or say nothing (the quiet option; Dora
notices, files it away as mercy). One line to plant clue #8: "She hated this
counterpane," Dora says, then stops, because she isn't sure anymore whether that
was this daughter or the other one. The ECHO offer here is a small one — a
practice harvest before the game teaches you what harvesting costs.

## Without-you retelling 1: the boathouse (Maud tells it, evening, the pub)

> Maud sets your plate down and doesn't leave.
>
> "Sam had himself an afternoon," she says. "Down the boathouse, hammering at
> that dinghy of Pike's like it owed him rent. Tam looked in on him — someone had
> to, the noise of it — and got a mouthful for his trouble. 'She's not coming
> back in a boat,' Sam tells him. Just like that. Tam, of all people."
>
> She wipes the same stretch of bar twice.
>
> "He's got it in his head the caulk was rotten because nobody's touched the
> thing since. Since. Well." The cloth stops. "It's good he's working at
> something, is what I said to Tam. Better a boat than the other thing."
>
> She doesn't say what the other thing is. She double-inks something in the
> ledger before she puts it away.
>
> *Under the pub's room tone, very faint, a whistled phrase — bar five, sped up,
> a boy's tempo — detuned a quarter-tone flat. It surfaces twice and is gone.*

**What the player gets from missing it:** Sam said something to *Tam* — the first
signal those two share something (they both kept the promise; clue #12 adjacency).
"She's not coming back in a boat" reads as grief now, as *literal knowledge*
after the reveal. Maud's editing — "Since. Well." — models the town's whole
method: the retelling is warm, and it is wrong by omission, the same way the
drowning story is wrong. And the detuned bar-five motif under the scene is the
Living Score doing its job: the day has a hole in it, and the hole has a sound.

**What the player lost, honestly:** attending B would have opened Sam's first
trap-test three days early and set `witnessed:sam-caulk-hands`. The retelling
tells you the trap exists ("got a mouthful") without giving you the pass. Missing
content narrows *route*, not *comprehension*.

## Without-you retelling 2: the surgery (a note under your door, night)

> A folded page, tucked under the door of your room. Ivy's hand — small,
> straight, no loops. It is not addressed to anyone.
>
> "You did not come to surgery. Noted. — I.A.
>
> For the record: swelling of the left wrist, seven years unresolved. Wren
> fractured it on the church gate the winter she was nineteen. It healed badly.
> It aches before weather.
>
> Whenever you're ready."
>
> That is all. You find yourself holding your left wrist. You could not say
> which winter, or which gate, or whether it aches. It doesn't. That is the
> point of the note.
>
> *No music. The room tone thins by one layer while you read, and does not come
> back until you put the page down.*

**What the player gets from missing it:** Ivy's scene came to *you*, transformed —
the surgery would have been an interview; the note is an ambush. It plants clue
#6-adjacent evidence (your body lacks Wren's history) as a physical sensation the
player performs on themselves — *you check your own wrist*. Declining Ivy is
recorded ("Noted.") and her notebook thread advances anyway: the antagonist-shaped
character does not wait for you. Missing her scene is scarier than attending it,
which is exactly Ivy.

**What the player lost:** the surgery scene contains the one early chance to see
her cross-referencing notebook open (foreshadows the Wake evidence). The note
version withholds it. Route narrowed; dread increased.

## Findings (the calibration rules)

1. **A missed scene must hand the player something attendance wouldn't.** Both
   retellings carry information that only exists *because* you weren't there:
   Maud's editing, Ivy's note-as-ambush. Absence is a lens, not a subtraction.
2. **Retellings are wrong the way the town is wrong.** Every secondhand account
   is edited by its teller's grief — same device as the mismatched drowning
   stories. The mechanic rehearses the twist continuously without pointing at it.
3. **The hole has a sound.** Each missed scene's motif surfaces faint and detuned
   under the evening scene, ≤ twice, never explained. (Visual twin in silent
   play: a marginal note in the ledger view — "someone was whistling, earlier.")
4. **Tutorialize with warmth.** The game's FIRST retelling (Day 2, Maud retelling
   a Tam scene) must be pure gift — funny, warm, zero loss — so the player learns
   retellings are content before the economy starts costing them.
5. **Never show a menu of what was missed.** The player learns what happened
   elsewhere only diegetically. No "2 scenes missed" UI. The ledger, later, is
   the only place absence is legible — which makes Maud's book worth consulting
   and worth fearing (and makes burning it in Act 2 mean something).
6. **Costs are route-costs, not comprehension-costs.** A player who misses
   everything still understands the story; they lose *approaches* (Sam's early
   trust, Ivy's notebook preview), not *the plot*.

**Verdict: the mechanic holds.** Absence produced the two best pieces of prose in
the spike. Proceed with the Presence Economy as designed. These two retellings
are canon and should ship (Day 3 content).
