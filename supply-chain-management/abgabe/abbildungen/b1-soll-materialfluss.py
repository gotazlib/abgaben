"""Abbildung Block 1: Soll-Materialfluss Inbound auf Netzwerkebene (Zielbild V3).

Aufruf: python b1-soll-materialfluss.py  ->  b1-soll-materialfluss.png (+ .svg) im selben Ordner.
Schrift: Liberation Sans, falls vorhanden (Umgebungsvariable FONT_DIR mit den .ttf), sonst DejaVu Sans.
"""
import os
from pathlib import Path

import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib import font_manager
from matplotlib.patches import FancyArrowPatch, FancyBboxPatch

BLAU, ORANGE, GRUEN, GRAU = "#1F4E79", "#C55A11", "#548235", "#7F7F7F"
HELLBLAU, HELLGRUEN, HELLGRAU = "#DDE7F0", "#E2EFDA", "#EDEDED"

font_dir = os.environ.get("FONT_DIR")
if font_dir:
    for f in Path(font_dir).glob("LiberationSans*.ttf"):
        font_manager.fontManager.addfont(str(f))
plt.rcParams["font.family"] = ["Liberation Sans", "DejaVu Sans"]
plt.rcParams["font.size"] = 8

fig, ax = plt.subplots(figsize=(10, 6.2))
ax.set_xlim(0, 100)
ax.set_ylim(0, 62)
ax.axis("off")


def box(x, y, w, h, text, fc=HELLBLAU, ec=BLAU, lw=1.2, ls="-", bold=False, color="black", size=7.6):
    ax.add_patch(FancyBboxPatch((x, y), w, h, boxstyle="round,pad=0.3,rounding_size=1.0",
                                fc=fc, ec=ec, lw=lw, ls=ls))
    ax.text(x + w / 2, y + h / 2, text, ha="center", va="center", fontsize=size,
            weight="bold" if bold else "normal", color=color, linespacing=1.2)


def arrow(x1, y1, x2, y2, color=BLAU, ls="-", lw=1.4, rad=0.0):
    ax.add_patch(FancyArrowPatch((x1, y1), (x2, y2), arrowstyle="-|>", mutation_scale=10,
                                 color=color, lw=lw, ls=ls, connectionstyle=f"arc3,rad={rad}"))


def label(x, y, text, color=BLAU, size=6.6, ha="center"):
    ax.text(x, y, text, fontsize=size, color=color, ha=ha, va="center",
            bbox=dict(boxstyle="square,pad=0.15", fc="white", ec="none"))


# Spaltenköpfe und Trennlinien
for x, t in [(10, "Lieferanten"), (32, "Import / Zoll"), (63, "Werk Grofu Indien"), (91.5, "Versand")]:
    ax.text(x, 61, t, ha="center", va="center", fontsize=9.5, weight="bold", color=BLAU)
for x in (21, 43.5, 83):
    ax.plot([x, x], [2, 59.5], color=HELLGRAU, lw=1)

# Informationsfluss
box(2, 54.5, 96, 3.2, "Supply-Chain-Control-Tower: EDI-Abrufe, rollierender Forecast, Zoll- und Sendungsstatus in Echtzeit",
    fc="white", ec=GRAU, ls="--", size=7.2)

# Lieferanten
box(1, 40, 18, 8, "Lokale A/B-Lieferanten\nRahmenvertrag, QSV,\nJIT-/Kanban-Abrufe", fc=HELLGRUEN, ec=GRUEN)
box(1, 27, 18, 8, "C-Teile-Management\n(lokal, Konsignation,\nAbrechnung nach Verbrauch)", fc=HELLGRUEN, ec=GRUEN)
box(1, 13, 18, 8, "Übersee-Lieferanten\nKonsolidierung\nam Ursprung", fc=HELLBLAU, ec=BLAU)

# Import / Zoll
box(23.5, 15, 18, 7, "Indischer Westhafen\n(zu prüfen, z. B. Mundra)\nnur Anmeldung", fc=HELLBLAU, ec=BLAU)
box(23.5, 27, 18, 6, "Übergang V2:\nFTWZ-Hub eines 3PL", fc="white", ec=BLAU, ls="--")
box(23.5, 3, 18, 6.5, "Lager 4 Karatschi\nnur Rückfallebene", fc=HELLGRAU, ec=GRAU, ls="--", color=GRAU)

# Werk
box(45.5, 33, 15, 14, "Zentrallager\n(automatisiert,\nWare zur Person)\n\nZollbereich MOOWR:\nZoll bei Entnahme,\nbei Export erlassen",
    fc=HELLBLAU, ec=BLAU, lw=1.8)
box(64, 40, 17, 7, "Neues Werk «eigener Zu-\nlieferbetrieb»: Fertigungs-\ninseln (Know-how-SFG)", size=7.0)
box(64, 29, 17, 6, "Supermarkt SFG\n= Entkopplungspunkt", fc=HELLGRUEN, ec=GRUEN, lw=1.6, bold=True)
box(64, 16, 17, 8, "Endmontage\nTaktlinie (Eigenlabel, OEM)\nMtO-Zelle (Anlagenbau)", size=7.0)
box(45.5, 20, 15, 7.5, "Outsourcing-Partner\nKit-Kanban, später\nModular Sourcing", size=7.0)
box(45.5, 11, 15, 5.5, "andere Hersteller:\nnur Kapazitätsspitzen", fc=HELLGRAU, ec=ORANGE, ls="--", color=ORANGE, size=7.2)
box(45.5, 3, 15, 5, "Lager 2: aufgelöst", fc=HELLGRAU, ec=ORANGE, ls="--", color=ORANGE)

# Versand
box(85, 38, 14, 7, "Anlagenbau:\nLuftfracht direkt")
box(85, 27, 14, 7, "Eigenlabel:\nRegionallager NO")
box(85, 16, 14, 7, "OEM: See /\nSea-Air zu 4 DCs")
ax.text(92, 13, "Details: Distribution", ha="center", fontsize=6.6, color=GRAU, style="italic")

# Flüsse Lieferanten -> Werk
arrow(19.3, 44, 45.2, 43, GRUEN)                                   # A/B ins Zentrallager
ax.plot([19.3, 22.2, 22.2], [31, 31, 51.5], color=GRUEN, lw=1.4)    # lokale C-Teile direkt an den Verbauort
ax.plot([22.2, 72.5], [51.5, 51.5], color=GRUEN, lw=1.4)
arrow(72.5, 51.5, 72.5, 47.4, GRUEN)
label(33, 51.5, "lokale C-Teile direkt an den Verbauort (Inseln, Endmontage)", GRUEN)
arrow(19.3, 17, 23.2, 18, BLAU)                                    # Übersee -> Hafen
arrow(41.8, 19.5, 45.2, 34.5, BLAU)                                # Hafen -> Zentrallager (Zollverschluss)
label(32.5, 12.6, "Bahn/LKW unter Zollverschluss", BLAU)
arrow(27, 22.3, 27, 26.7, BLAU, ls="--")                           # Hafen -> FTWZ (Übergang)
arrow(41.8, 30.5, 45.2, 37, BLAU, ls="--")                         # FTWZ -> Zentrallager
arrow(19.3, 14, 23.2, 7, GRAU, ls="--")                            # Rückfallebene
ax.plot([41.8, 42.8, 42.8], [6, 6, 33.8], color=GRAU, ls="--", lw=1.4)
arrow(42.8, 33.8, 45.2, 34.2, GRAU, ls="--")

# Flüsse im Werk
arrow(60.8, 44, 63.7, 44, BLAU)                                    # Zentrallager -> Inseln (Milkrun)
label(62.2, 46.6, "Milkrun", BLAU, size=6.2)
arrow(60.8, 35, 63.7, 21, BLAU, rad=-0.15)                         # Zentrallager -> Endmontage (Milkrun)
arrow(72.5, 39.7, 72.5, 35.3, GRUEN, lw=1.6)                       # Inseln -> Supermarkt
arrow(60.8, 24, 63.7, 30.5, BLAU)                                  # Outsourcing -> Supermarkt
arrow(60.8, 14, 63.7, 29.3, ORANGE, ls="--")                       # andere Hersteller -> Supermarkt
arrow(72.5, 28.7, 72.5, 24.3, GRUEN, lw=1.6)                       # Supermarkt -> Endmontage (Kanban)
label(75.3, 26.5, "Kanban", GRUEN, size=6.2)
arrow(81.3, 22, 84.7, 41, BLAU)
arrow(81.3, 20, 84.7, 30, BLAU)
arrow(81.3, 18.5, 84.7, 19.5, BLAU)

# Legende
items = [(GRUEN, "-", "Soll: Lieferanten-/Kanbanfluss"), (BLAU, "-", "Soll: Material-/Zollfluss"),
         (BLAU, "--", "Übergangslösung V2"), (GRAU, "--", "Rückfallebene"), (ORANGE, "--", "reduziert / aufgelöst")]
for i, (c, ls, t) in enumerate(items):
    x = [1, 23, 43, 61, 78][i]
    ax.plot([x, x + 3], [0.3, 0.3], color=c, ls=ls, lw=1.6)
    ax.text(x + 3.6, 0.3, t, va="center", fontsize=6.6)

out = Path(__file__).with_suffix("")
fig.savefig(f"{out}.png", dpi=220, bbox_inches="tight")
fig.savefig(f"{out}.svg", bbox_inches="tight")
print("geschrieben:", f"{out}.png")
