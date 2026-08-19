#!/usr/bin/env python3
"""One-page audition brief: the three sixth-bar candidates for NOT HERE."""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(sys.executable).parent.parent.parent))

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.patches import Rectangle

from reportlab.lib.pagesizes import A4
from reportlab.lib.units import cm
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.colors import HexColor
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image,
)

WS = Path("/Users/erichare/GitHub/not-here")
FIG = WS / "sixthbar-figure.png"
PDF = WS / "sixth-bar-audition-brief.pdf"

# ---------------------------------------------------------------- figure ----
# Bar 5 (Sam's run), beats 24-29 of the verse; candidates live in bar 6.
BAR5 = [(0, 1, 74), (1, 1, 76), (2, 1, 77), (3, 1, 79), (4, 1, 81), (5, 1, 76)]
CANDS = [
    ("'never'  —  E5(2) G5(2) B4(1), then air", [(0, 2, 76), (2, 2, 79), (4, 1, 71)], "#8c4a32"),
    ("'forgot'  —  D5(2) E5(1) F5(1), then silence", [(0, 2, 74), (2, 1, 76), (3, 1, 77)], "#5a5a6e"),
    ("'door'  —  F5(1) E5(1) D5(4), held to the end", [(0, 1, 77), (1, 1, 76), (2, 4, 74)], "#2e5d43"),
]
NAMES = {71: "B4", 74: "D5", 76: "E5", 77: "F5", 79: "G5", 81: "A5"}

fig, axes = plt.subplots(3, 1, figsize=(9.2, 3.25), sharex=True, sharey=True)
for ax, (label, notes, color) in zip(axes, CANDS):
    # bar 5 context in grey
    for t, d, p in BAR5:
        ax.add_patch(Rectangle((t, p - 0.35), d * 0.92, 0.7, facecolor="#c9c9c9", edgecolor="none"))
    # candidate in colour, offset one bar (6 beats) to the right
    for t, d, p in notes:
        ax.add_patch(Rectangle((t + 6, p - 0.35), d * 0.92, 0.7, facecolor=color, edgecolor="none"))
        ax.text(t + 6 + d / 2, p, NAMES[p], ha="center", va="center", fontsize=7.5,
                color="white", fontweight="bold")
    ax.axvline(6, color="#333333", lw=1.2)
    ax.text(0.1, 83.5, label, fontsize=9, color=color, fontweight="bold", va="bottom")
    ax.set_xlim(-0.2, 12.2)
    ax.set_ylim(70.2, 84.5)
    ax.set_yticks([71, 74, 76, 77, 79, 81])
    ax.set_yticklabels(["B4", "D5", "E5", "F5", "G5", "A5"], fontsize=7)
    ax.tick_params(axis="x", labelsize=7)
    for s in ("top", "right", "left"):
        ax.spines[s].set_visible(False)
    ax.grid(axis="y", color="#e5e5e5", lw=0.6)
    ax.set_axisbelow(True)
axes[0].text(11.9, 83.5, "bar 5 — Sam's run, hanging on E5", fontsize=8, color="#777777",
             ha="right", va="bottom", style="italic")
axes[-1].set_xlabel("beats (bar 5 | bar 6 — the rest where the sixth bar goes)", fontsize=8)
fig.suptitle("The three candidate sixth bars, each shown after bar 5's hanging E",
             fontsize=11, fontweight="bold", y=0.985)
fig.tight_layout(rect=(0, 0, 1, 0.96))
fig.savefig(FIG, dpi=170, bbox_inches="tight")
plt.close(fig)

# ------------------------------------------------------------------ pdf ----
INK = HexColor("#333333")
MUTE = HexColor("#666666")
ACCENT = HexColor("#2e5d43")

styles = getSampleStyleSheet()
H1 = ParagraphStyle("H1", parent=styles["Title"], fontName="Helvetica-Bold",
                    fontSize=17, leading=20, textColor=INK, alignment=0, spaceAfter=2)
SUB = ParagraphStyle("SUB", parent=styles["Normal"], fontName="Helvetica-Oblique",
                     fontSize=10, leading=13, textColor=MUTE, spaceAfter=8)
H2 = ParagraphStyle("H2", parent=styles["Heading2"], fontName="Helvetica-Bold",
                    fontSize=11.5, leading=14, textColor=ACCENT, spaceBefore=6, spaceAfter=2)
BODY = ParagraphStyle("BODY", parent=styles["Normal"], fontName="Helvetica",
                      fontSize=9, leading=12, textColor=INK, spaceAfter=4)
CAP = ParagraphStyle("CAP", parent=styles["Normal"], fontName="Helvetica-Oblique",
                     fontSize=8, leading=10, textColor=MUTE, spaceBefore=2, spaceAfter=6)
CELL = ParagraphStyle("CELL", parent=BODY, fontSize=8.4, leading=11, spaceAfter=0)
CELLB = ParagraphStyle("CELLB", parent=CELL, fontName="Helvetica-Bold")

doc = SimpleDocTemplate(str(PDF), pagesize=A4, topMargin=1.4 * cm, bottomMargin=1.0 * cm,
                        leftMargin=1.8 * cm, rightMargin=1.8 * cm,
                        title="NOT HERE — The Sixth Bar: Audition Brief",
                        author="Kimi Work", subject="Sixth-bar candidate comparison")

story = []
story.append(Paragraph("NOT HERE — The Sixth Bar: Audition Brief", H1))
story.append(Paragraph(
    "Three candidate variants for the Act 3 composition finale · prepared for the listening "
    "session required by design/act3-plan.md §Cues, item 1 — no scene prose hardens around a "
    "variant until it is approved.", SUB))

story.append(Paragraph("Where this sits", H2))
story.append(Paragraph(
    "The Foghorn Song is six bars in D dorian, 6/8; bar 6 has always been a rest. Bar 5 — Sam's "
    "run — ends hanging on <b>E, the 2nd degree</b>, over Barb's Am chord: it wants D and has never "
    "got it. In the finale the player composes the sixth bar, and the no-key game selects the "
    "notated variant by the Night-1 intake answer (<font face='Courier'>n1:goodbye</font>) — the "
    "interview literally composes your bar. Per Ruling 3, the only sixth bar ever rendered in any "
    "ending is the player's; Wren's own ending stays unheard. Each candidate renders solo on guitar "
    "and in context — bars 1–5 as shipped, the candidate answering in bar 6 over the sea and the "
    "horn's low D drone.", BODY))

story.append(Image(str(FIG), width=17.4 * cm, height=6.3 * cm))
story.append(Paragraph(
    "Figure 1 — Pitch content of each candidate (coloured) following bar 5 (grey). Beats are "
    "eighth notes; the bar line marks the rest where the sixth bar goes.", CAP))

story.append(Paragraph("The candidates side by side", H2))
rows = [
    [Paragraph("Variant", CELLB), Paragraph("Night-1 answer", CELLB),
     Paragraph("What the bar does", CELLB), Paragraph("Dramatic reading", CELLB),
     Paragraph("Audition files", CELLB)],
    [Paragraph("<b>'door'</b>", CELL), Paragraph("“I said it to the door.”", CELL),
     Paragraph("F5–E5–<b>D5 held four beats</b>. The only variant that resolves: it finishes bar 1's "
               "D–E–F–E arch with the first D the melody has ever been given.", CELL),
     Paragraph("You said goodbye to something, once. Your bar gets to cadence — completion as "
               "self-erasure; the gift that only costs everything.", CELL),
     Paragraph("<font face='Courier'>sixthbar-door.wav</font> (5.9 s)<br/>"
               "<font face='Courier'>sixthbar-door-context.wav</font> (28.5 s)", CELL)],
    [Paragraph("<b>'never'</b>", CELL), Paragraph("“No. I never do.”", CELL),
     Paragraph("E5–G5–B4, then air. Climbs the ii triad — the chord that most wants to lead home — "
               "and abandons it on the dorian question-note. No D anywhere; no cadence.", CELL),
     Paragraph("For the one who never says goodbye: the bar ends without cadence, with air left "
               "in it — the same refusal the horn has made for seven years.", CELL),
     Paragraph("<font face='Courier'>sixthbar-never.wav</font> (5.9 s)<br/>"
               "<font face='Courier'>sixthbar-never-context.wav</font> (28.5 s)", CELL)],
    [Paragraph("<b>'forgot'</b>", CELL), Paragraph("“I don't remember leaving it.”", CELL),
     Paragraph("D5–E5–F5, then two silent beats. Quotes bar 1's opening at pitch, then the memory "
               "fails on its peak note — the F cut to a single fading beat, and nothing after.", CELL),
     Paragraph("For the one who can't remember leaving: the tune starts to come back and doesn't. "
               "The break is the biography.", CELL),
     Paragraph("<font face='Courier'>sixthbar-forgot.wav</font> (5.9 s)<br/>"
               "<font face='Courier'>sixthbar-forgot-context.wav</font> (28.5 s)", CELL)],
]
tbl = Table(rows, colWidths=[1.7 * cm, 3.1 * cm, 5.6 * cm, 4.4 * cm, 3.6 * cm])
tbl.setStyle(TableStyle([
    ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
    ("LINEABOVE", (0, 0), (-1, 0), 1.5, HexColor("#000000")),
    ("LINEBELOW", (0, 0), (-1, 0), 0.75, HexColor("#000000")),
    ("LINEBELOW", (0, -1), (-1, -1), 1.5, HexColor("#000000")),
    ("TOPPADDING", (0, 0), (-1, -1), 4),
    ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
    ("LEFTPADDING", (0, 0), (-1, -1), 5),
    ("RIGHTPADDING", (0, 0), (-1, -1), 5),
    ("VALIGN", (0, 0), (-1, -1), "TOP"),
]))
story.append(tbl)

story.append(Paragraph("What to listen for", H2))
story.append(Paragraph(
    "<b>1. The hand-off.</b> In each context render, bar 5's hanging E should feel like a question "
    "the candidate answers — or pointedly refuses to. 'door' should land like a held breath let go; "
    "'never' like a sentence interrupted politely; 'forgot' like a radio losing the station.<br/>"
    "<b>2. The voice.</b> The candidate enters on guitar against the town's music box — it should "
    "read as <i>a person answering a music box</i>, not a new verse of the same tune.<br/>"
    "<b>3. The drone.</b> The horn holds its low D under all of bar 6. Only 'door' agrees with it; "
    "'never' and 'forgot' should audibly withhold that agreement.<br/>"
    "<b>4. Tempo feel.</b> 144 bpm eighth-note pulse — slow, tidal. If a candidate feels rushed "
    "against the sea swells, the fault is the render, not the notes.", BODY))

story.append(Paragraph(
    "<b>Decision requested:</b> approve each variant (or send it back) so Act 3 prose can harden "
    "around the selected bars. These three are the complete deterministic fallback under the LLM "
    "judge (Ruling 8) — every intake has exactly one bar; the no-key game remains the whole game. "
    "Sources: <font face='Courier'>packages/music/scores/sixthbar-candidates.ts</font> and "
    "<font face='Courier'>foghorn-song.ts</font>; renders in <font face='Courier'>auditions/</font>.", BODY))

doc.build(story)
print(f"wrote {PDF}")
