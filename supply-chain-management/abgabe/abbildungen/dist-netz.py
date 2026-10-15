"""Abbildung Distribution: Soll-Distributionsnetz je Segment (Empfehlung aus der Potenzialmatrix).

Aufruf: python dist-netz.py  ->  dist-netz.png (+ .svg) im selben Ordner.
Schrift: Liberation Sans, falls vorhanden (Umgebungsvariable FONT_DIR mit den .ttf), sonst DejaVu Sans.
"""
import os
from pathlib import Path

import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib import font_manager
from matplotlib.lines import Line2D
from matplotlib.patches import FancyArrowPatch, FancyBboxPatch

BLAU, ORANGE, GRUEN, GRAU = "#1F4E79", "#C55A11", "#548235", "#7F7F7F"
HELLBLAU, HELLGRUEN, HELLGRAU = "#DDE7F0", "#E2EFDA", "#EDEDED"

font_dir = os.environ.get("FONT_DIR")
if font_dir:
    for f in Path(font_dir).glob("LiberationSans*.ttf"):
        font_manager.fontManager.addfont(str(f))
plt.rcParams["font.family"] = ["Liberation Sans", "DejaVu Sans"]
plt.rcParams["font.size"] = 8

fig, ax = plt.subplots(figsize=(10, 5.2))
ax.set_xlim(0, 100)
ax.set_ylim(0, 52)
ax.axis("off")

# Stil je Verkehrsträger
LUFT = dict(color=ORANGE, ls="-")
SEE = dict(color=BLAU, ls="-")
SEAAIR = dict(color=BLAU, ls="--")
LKW = dict(color=GRAU, ls="-")


def box(x, y, w, h, text, fc=HELLBLAU, ec=BLAU, bold=False, lw=1.2):
    ax.add_patch(FancyBboxPatch((x, y), w, h, boxstyle="round,pad=0.4,rounding_size=1.2", fc=fc, ec=ec, lw=lw))
    ax.text(x + w / 2, y + h / 2, text, ha="center", va="center", fontsize=8,
            weight="bold" if bold else "normal", linespacing=1.25)


def arrow(p1, p2, style, label=None, lpos=0.5, dy=0.9, rad=0.0):
    ax.add_patch(FancyArrowPatch(p1, p2, arrowstyle="-|>", mutation_scale=11, lw=1.5,
                                 connectionstyle=f"arc3,rad={rad}", **style))
    if label:
        x = p1[0] + (p2[0] - p1[0]) * lpos
        y = p1[1] + (p2[1] - p1[1]) * lpos + dy
        ax.text(x, y, label, ha="center", va="bottom", fontsize=6.8, color=style["color"])


# Spaltenköpfe
for x, t in [(9, "Werk Indien"), (37, "Umschlag / Hub"), (62, "Zielregion"), (88, "Kunde")]:
    ax.text(x, 50.5, t, ha="center", fontsize=9.5, weight="bold", color=BLAU)

box(1, 20, 16, 12, "Werk Indien\nVersand\nFertigware", bold=True, lw=1.8)
box(26, 34, 22, 6, "Flughafen Indien\n(Abflugslot ab Auftragsfreigabe)")
box(26, 21, 22, 6, "Indischer Westhafen\n(Mundra / Nhava Sheva)")
box(26, 8, 22, 6, "Jebel Ali → Al Maktoum\n(Sea-Air-Umschlag Dubai)")
box(53, 24, 18, 6, "Regionallager\nNaher Osten", fc=HELLGRUEN, ec=GRUEN)

box(77, 40, 22, 7, "Anlagenbau: Montageort\nweltweit (MtO)")
box(77, 28, 22, 7, "Eigenlabel: Fachhandel\nNaher Osten / weltweit")
box(77, 14, 22, 7, "OEM: 4 Distributions-\nzentren der Kunden")
box(77, 3, 22, 6, "Kunden in Indien")

# Anlagenbau
arrow((17.5, 30), (25.6, 37), LUFT)
arrow((48.5, 38), (76.6, 43.5), LUFT, "Luftfracht direkt, Express (W1)", lpos=0.4, dy=2.0)
# Eigenlabel
arrow((17.5, 26), (25.6, 24), SEE)
arrow((48.5, 25.5), (52.6, 26.5), SEE)
ax.text(49.6, 29.2, "See (W5)", fontsize=6.8, color=BLAU, ha="center")
arrow((71.5, 28), (76.6, 30.5), dict(color=GRUEN, ls="-"))
ax.text(74, 25.6, "ab Bestand", fontsize=6.8, color=GRUEN, ha="center")
arrow((48.5, 36), (76.6, 32.5), LUFT, "Eilaufträge / ausserhalb Region", lpos=0.5, dy=1.5)
# OEM
arrow((48.5, 22), (76.6, 17.5), SEE, "Seefracht Grundlast (W3)", lpos=0.62, dy=-2.8)
arrow((17.5, 22), (25.6, 11), SEAAIR)
arrow((48.5, 11), (76.6, 16), SEAAIR, "Sea-Air für Spitzen (W4)", lpos=0.6, dy=-2.8)
# Indien
ax.plot([9, 9, 60], [19.6, 4.6, 4.6], color=GRAU, lw=1.5)
arrow((60, 4.6), (76.6, 5.4), LKW)
ax.text(62, 2.4, "LKW direkt (einstufig)", fontsize=6.8, color=GRAU, ha="center")

legend = [Line2D([0], [0], color=ORANGE, lw=1.6, label="Luftfracht"),
          Line2D([0], [0], color=BLAU, lw=1.6, label="Seefracht"),
          Line2D([0], [0], color=BLAU, lw=1.6, ls="--", label="Sea-Air"),
          Line2D([0], [0], color=GRUEN, lw=1.6, label="Auslieferung ab Regionallager"),
          Line2D([0], [0], color=GRAU, lw=1.6, label="Strasse")]
ax.legend(handles=legend, loc="upper center", bbox_to_anchor=(0.5, 0.02), frameon=False, fontsize=7, ncol=5)

out = Path(__file__).with_suffix("")
fig.savefig(f"{out}.png", dpi=220, bbox_inches="tight")
fig.savefig(f"{out}.svg", bbox_inches="tight")
print("geschrieben:", f"{out}.png")
