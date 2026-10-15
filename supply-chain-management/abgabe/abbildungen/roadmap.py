"""Erzeugt die Umsetzungs-Roadmap (Gesamtkonzept, Kapitel 09), kompakt.

Aufruf (aus dem Ordner leistungsnachweis-grofu/):
    python abbildungen/roadmap.py
Schreibt abbildungen/roadmap.svg und .png (benötigt cairosvg).
Zeitachse in Monaten ab Projektstart; Dauern sind Planannahmen (Annahme A16).
"""

from pathlib import Path

ZIEL = Path(__file__).resolve().parent
NAME = "roadmap"
FONT = "Liberation Sans, Arial, sans-serif"
BLAU, ORANGE, GRUEN, GRAU = "#1F4E79", "#C55A11", "#548235", "#7F7F7F"

MONATE = 36
LINKS, OBEN, BREITE_ACHSE = 150, 80, 1220
B = LINKS + BREITE_ACHSE + 20
ZEILE = 30

phasen = [(0, 6, "Phase 1: Stabilisieren", "#E2EFDA"),
          (6, 18, "Phase 2: Pull einführen, neues Werk", "#DEEAF6"),
          (18, 36, "Phase 3: Automatisieren und vernetzen", "#FBE5D6")]

# Arbeitsstrang -> Balken-Reihen; Balken = (Text, Start, Ende, Farbe)
straenge = [
    ("Steuerung", [[("Baseline", 0, 4, GRUEN), ("Kennzahlen-Cockpit im Regelbetrieb", 4, 36, GRAU)],
                   [("EDI-Abrufe, Kanban-Signale, Pick-ABC", 3, 15, BLAU)]]),
    ("Lager", [[("Lager 2 ≤ 3 AT", 0, 6, GRUEN), ("Supermärkte + Milkrun", 6, 18, BLAU),
                ("Ware-zur-Person modular", 18, 30, BLAU)],
               [("Lager 2 stufenweise abbauen", 12, 24, ORANGE)]]),
    ("Produktion", [[("MtO-Zelle", 2, 10, GRUEN), ("Taktlinie Endgeräte", 18, 30, BLAU)],
                    [("Fertigungsinseln neues Werk", 6, 20, BLAU)]]),
    ("Beschaffung", [[("A/B-Abrufe, QSV", 0, 12, GRUEN), ("Lieferantenbasis reduzieren", 12, 36, GRAU)],
                     [("C-Teile-Management, Konsignation", 6, 24, BLAU)]]),
    ("Import/Zoll", [[("Karatschi, solange offen", 0, 6, GRUEN), ("Bonded Hub Westhafen (V2)", 6, 18, BLAU),
                      ("Zollverschluss im Werk (V3)", 18, 30, BLAU)]]),
    ("Distribution", [[("Umsetzung gemäss Potenzialmatrix", 6, 30, BLAU)]]),
]
meilensteine = [(4, "M1 Baseline"), (12, "M2 Supermarkt &lt; 3 AT"),
                (24, "M3 Lager 2 geschlossen"), (30, "M4 Kommissionierung 100 FTE")]
legende = [(GRUEN, "Sofortmassnahme"), (BLAU, "Aufbau/Umbau"),
           (ORANGE, "Abbau nach Kriterium"), (GRAU, "Daueraufgabe")]

reihen = sum(len(r) for _, r in straenge)
UNTEN = OBEN + reihen * ZEILE + len(straenge) * 8
H = UNTEN + 75


def mx(m):
    return LINKS + m / MONATE * BREITE_ACHSE


teile = []
t = teile.append
for a, e, name, farbe in phasen:
    t(f'<rect x="{mx(a)}" y="8" width="{mx(e) - mx(a)}" height="30" fill="{farbe}" stroke="{GRAU}"/>')
    t(f'<text x="{(mx(a) + mx(e)) / 2}" y="29" text-anchor="middle" font-size="15" '
      f'font-weight="bold">{name}</text>')
for m in range(0, MONATE + 1, 6):
    t(f'<text x="{mx(m)}" y="58" text-anchor="middle" font-size="13" fill="#444">{m}</text>')
    t(f'<line x1="{mx(m)}" y1="64" x2="{mx(m)}" y2="{UNTEN}" stroke="#BBBBBB" stroke-dasharray="3 3"/>')
t(f'<text x="15" y="58" font-size="13" fill="#444">Monat</text>')
ym = UNTEN + 10
for m, _ in meilensteine:  # Linien hinter die Balken legen
    t(f'<line x1="{mx(m)}" y1="64" x2="{mx(m)}" y2="{ym}" stroke="{ORANGE}" stroke-width="2"/>')

y = OBEN - 12
for strang, balkenreihen in straenge:
    t(f'<line x1="10" y1="{y - 2}" x2="{B - 10}" y2="{y - 2}" stroke="#DDDDDD"/>')
    t(f'<text x="15" y="{y + 20}" font-size="15" font-weight="bold" fill="{BLAU}">{strang}</text>')
    for reihe in balkenreihen:
        for text, a, e, farbe in reihe:
            t(f'<rect x="{mx(a) + 1}" y="{y + 3}" width="{mx(e) - mx(a) - 2}" height="23" rx="4" fill="{farbe}"/>')
            t(f'<text x="{(mx(a) + mx(e)) / 2}" y="{y + 19}" text-anchor="middle" font-size="13" '
              f'fill="white" font-weight="bold">{text}</text>')
        y += ZEILE
    y += 8

for m, name in meilensteine:
    x = mx(m)
    t(f'<polygon points="{x},{ym - 8} {x + 8},{ym} {x},{ym + 8} {x - 8},{ym}" fill="{ORANGE}"/>')
    t(f'<text x="{x}" y="{ym + 26}" text-anchor="middle" font-size="13" fill="{ORANGE}" '
      f'font-weight="bold">{name}</text>')
for i, (farbe, name) in enumerate(legende):
    x = 15 + i * 200
    t(f'<rect x="{x}" y="{H - 21}" width="24" height="13" rx="3" fill="{farbe}"/>')
    t(f'<text x="{x + 30}" y="{H - 10}" font-size="12.5">{name}</text>')

svg = f'''<svg xmlns="http://www.w3.org/2000/svg" width="{B}" height="{H}" viewBox="0 0 {B} {H}"
 font-family="{FONT}">
<rect width="{B}" height="{H}" fill="white"/>
{chr(10).join(teile)}
</svg>'''

(ZIEL / f"{NAME}.svg").write_text(svg, encoding="utf-8")
try:
    import cairosvg
    cairosvg.svg2png(bytestring=svg.encode("utf-8"), write_to=str(ZIEL / f"{NAME}.png"), scale=2)
except ImportError:
    print("cairosvg fehlt: nur SVG geschrieben")
print("geschrieben:", ZIEL / f"{NAME}.svg")
