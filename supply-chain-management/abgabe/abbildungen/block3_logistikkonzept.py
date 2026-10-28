"""Erzeugt das Logistikkonzept-Haus (Block 3).

Aufruf (aus dem Ordner leistungsnachweis-grofu/):
    python abbildungen/block3_logistikkonzept.py
Schreibt abbildungen/block3-logistikkonzept.svg und .png (benötigt cairosvg).
"""

from pathlib import Path

ZIEL = Path(__file__).resolve().parent
NAME = "block3-logistikkonzept"
B, H = 1400, 820
FONT = "Liberation Sans, Arial, sans-serif"
BLAU, ORANGE, GRUEN, GRAU = "#1F4E79", "#C55A11", "#548235", "#7F7F7F"

teile = []


def text(x, y, t, groesse=16, farbe="#1b1b1b", gewicht="normal"):
    teile.append(f'<text x="{x}" y="{y}" text-anchor="middle" font-size="{groesse}" '
                 f'font-weight="{gewicht}" fill="{farbe}">{t}</text>')


def block(x, y, w, h, titel, zeilen, fill, stroke, titelfarbe="#1b1b1b"):
    teile.append(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="8" fill="{fill}" '
                 f'stroke="{stroke}" stroke-width="2"/>')
    text(x + w / 2, y + 32, titel, 17, titelfarbe, "bold")
    for i, z in enumerate(zeilen):
        text(x + w / 2, y + 64 + i * 23, z, 14.5)


# Dach: Leitbild und Ziele
teile.append(f'<polygon points="60,230 700,40 1340,230" fill="{BLAU}"/>')
text(700, 135, "Leitbild «Fluss statt Bestand»", 26, "white", "bold")
text(700, 170, "Bestandspotenzial 30–40 %  ·  Liefertreue ≥ 95 %  ·  Lieferzeit auf Wettbewerbsniveau", 16, "white")
text(700, 198, "Kosten und Personal senken durch Automatisierung und Make-or-Buy", 16, "white")

# Säulen
saeulen = [
    ("Pull-Steuerung", "(Kanban + S&amp;OP)", ["SFG, regelmässige Teile", "Supermärkte ≤ 1 AT", "S&amp;OP rollierend (APO)", "Kapazität + Material"]),
    ("Segmentierte", "Fertigung", ["Inseln (SFG)", "Takt (Endgeräte)", "Montagezelle (Anlagen)", "CODP je Produkt"]),
    ("Einstufige", "Bereitstellung", ["1 Zentrallager", "Milkrun", "C-Teile lokal direkt", "Lager 2 entfällt"]),
    ("Automatisierung", "mit Augenmass", ["Ware-zur-Person", "AKL/HRL, Taktlinie", "manuell, wo Varianten", "Flexibilität brauchen"]),
    ("Partnernetz", "(Make-or-Buy)", ["C-Teile-Management", "3PL Zoll/Transport", "Kit-Kanban, dann", "Modular Sourcing"]),
]
w, gap, x0 = 236, 21, 70
for i, (titel, titel2, zeilen) in enumerate(saeulen):
    x = x0 + i * (w + gap)
    teile.append(f'<rect x="{x}" y="250" width="{w}" height="300" rx="8" fill="#DEEAF6" '
                 f'stroke="{BLAU}" stroke-width="2"/>')
    text(x + w / 2, 285, titel, 18, BLAU, "bold")
    text(x + w / 2, 310, titel2, 18, BLAU, "bold")
    for j, z in enumerate(zeilen):
        text(x + w / 2, 370 + j * 40, z, 15.5)

# Fundament
fund = [("Standardisierung", "Behälter, Regelkreise, Arbeitsplätze"),
        ("Daten und EDI", "≈ 96 % der Positionen EDI-fähig"),
        ("Qualität und KVP", "QSV, Poka-Yoke, Kaizen"),
        ("Kennzahlen-Cockpit", "Umschlag, Reichweite, DLZ, Liefertreue")]
fw = 298
for i, (t1, t2) in enumerate(fund):
    x = 70 + i * (fw + 24)
    block(x, 575, fw, 105, t1, [t2], "#E2EFDA", GRUEN, GRUEN)

teile.append(f'<rect x="60" y="700" width="1280" height="56" rx="6" fill="#F2F2F2" stroke="{GRAU}"/>')
text(700, 735, "Umsetzung in drei Phasen (Roadmap im Gesamtkonzept) · Risiken: Kanban-Störanfälligkeit, "
     "Lieferantenabhängigkeit, Importroute", 15, "#333")
text(700, 795, "Lean (Endgeräte) · reaktiv (Anlagenbau) · agil über modulare Standard-SFG", 15, ORANGE, "bold")

svg = f'''<svg xmlns="http://www.w3.org/2000/svg" width="{B}" height="{H}" viewBox="0 0 {B} {H}"
 font-family="{FONT}">
<rect width="{B}" height="{H}" fill="white"/>
{chr(10).join(teile)}
</svg>'''

(ZIEL / f"{NAME}.svg").write_text(svg, encoding="utf-8")
try:
    import cairosvg
    cairosvg.svg2png(bytestring=svg.encode("utf-8"), write_to=str(ZIEL / f"{NAME}.png"), scale=1.6)
except ImportError:
    print("cairosvg fehlt: nur SVG geschrieben")
print("geschrieben:", ZIEL / f"{NAME}.svg")
