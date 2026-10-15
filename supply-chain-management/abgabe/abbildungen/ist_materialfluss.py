#!/usr/bin/env python3
"""Ist-Materialfluss der Grofu AG Indien Ltd. als SVG und PNG.

Grundlage: Fallstudie Grofu AG (Kap. 2-4) und das vorhandene Diagramm
material/Lager-Grofu.png; Kennzahlen aus analyse/abc_analyse.py und
analyse/fallstudie_kennzahlen.py. Rote Nummern = Schwachstellen (Legende unten).

Aufruf (aus dem Ordner leistungsnachweis-grofu/):
    python abbildungen/ist_materialfluss.py
Benötigt: cairosvg (für das PNG); das SVG entsteht auch ohne.
"""

from pathlib import Path
from xml.sax.saxutils import escape

HIER = Path(__file__).resolve().parent
W, H = 1600, 1012
OBEN = 42  # oberer Rand wird abgeschnitten (Titel setzt der Build)

BLAU, BLAU_HELL, ORANGE, GRUEN = "#1F4E79", "#DEEAF6", "#C55A11", "#548235"  # Farben laut PLAN.md §5
ROT, TEXT, TEXT2, GRAU, LINIE = "#C55A11", "#0b0b0b", "#4d4d4d", "#7F7F7F", "#3d3c39"  # Schwachstellen = Orange

teile: list[str] = []


def text(x, y, zeilen, size=13, weight="normal", color=TEXT, anchor="middle", lh=1.25):
    if isinstance(zeilen, str):
        zeilen = [zeilen]
    y0 = y - (len(zeilen) - 1) * size * lh / 2
    for i, z in enumerate(zeilen):
        w = weight
        if z.startswith("**"):
            z, w = z[2:], "bold"
        z = z.replace(" %", "\u00a0%")  # Zahlenformat wie im Text: «2,7 %»
        teile.append(f'<text x="{x}" y="{y0 + i * size * lh:.1f}" font-size="{size}" '
                     f'font-weight="{w}" fill="{color}" text-anchor="{anchor}" '
                     f'dominant-baseline="middle">{escape(z)}</text>')


def box(x, y, w, h, zeilen, fill=BLAU_HELL, stroke=BLAU, dash=False, size=13, color=TEXT):
    d = ' stroke-dasharray="6 4"' if dash else ""
    teile.append(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="10" fill="{fill}" '
                 f'stroke="{stroke}" stroke-width="2"{d}/>')
    text(x + w / 2, y + h / 2, zeilen, size=size, color=color)
    return (x, y, w, h)


def pfeil(punkte, color=LINIE, dash=False, width=2.2, marker="pf"):
    d = ' stroke-dasharray="7 5"' if dash else ""
    pts = " ".join(f"{x},{y}" for x, y in punkte)
    teile.append(f'<polyline points="{pts}" fill="none" stroke="{color}" stroke-width="{width}"'
                 f'{d} marker-end="url(#{marker})"/>')


def nummer(x, y, n):
    teile.append(f'<circle cx="{x}" cy="{y}" r="13" fill="{ROT}" stroke="white" stroke-width="2"/>')
    text(x, y + 1, str(n), size=13, weight="bold", color="white")


def bereich(x, y, w, h, titel, fill):
    teile.append(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="14" fill="{fill}" stroke="none"/>')
    text(x + 14, y + 20, titel, size=14, weight="bold", color=TEXT2, anchor="start")


# --- Bereiche --------------------------------------------------------------
bereich(10, 50, 235, 760, "Lieferanten", "#f4f4f2")
bereich(255, 50, 235, 310, "Pakistan (Karatschi)", "#FDF2EA")
bereich(500, 50, 795, 760, "Grofu AG Indien Ltd. – Werk Nordindien", "#F2F7FC")
bereich(1305, 50, 285, 760, "Kunden", "#f4f4f2")

# Grenze
teile.append(f'<line x1="495" y1="60" x2="495" y2="350" stroke="{ROT}" stroke-width="2.5" '
             f'stroke-dasharray="10 6"/>')
text(486, 262, ["Grenze PK–IN,", "Zollabwicklung"], size=11, color=ROT, anchor="end")

# --- Knoten ------------------------------------------------------------------
ov = box(25, 110, 205, 120, ["**Lieferanten Overseas", "259 Lieferanten¹", "5 301 RM (22 %)",
                              "2,7 % des Wertes"])
lo = box(25, 420, 205, 120, ["**Lieferanten Indien", "342 Lieferanten¹", "18 342 RM (78 %)",
                              "97,3 % des Wertes"])
ah = box(25, 640, 205, 110, ["**Andere Hersteller", "in Indien", "(Zukauf SFG und FG)"],
         fill="#E2EFDA", stroke=GRUEN)
l4 = box(270, 110, 205, 120, ["**Lager 4 Karatschi", "Konsolidierung,", "Zollanmeldung,",
                               "~400 Sendungen/Tag"], fill="#FBE5D6", stroke=ORANGE)
l1 = box(520, 190, 215, 120, ["**Lager 1 Rohwarenlager", "autom. Paletten-/", "Behälterlager",
                               "12 000 Pal. · 30 000 Beh."])
l2 = box(800, 190, 215, 120, ["**Lager 2", "Produktionslager", "Soll 3 AT,", "Ist mehrere Wochen"])
sfg = box(1065, 190, 215, 120, ["**Produktion SFG", "Lagerfertigung (MtS),", "Forecast (APO)",
                                 "aus Jahresbudget"])
op = box(800, 430, 215, 110, ["**Outsourcing-Partner", "Vormontage aus", "kommissionierten RM-Losen"],
         fill="#fff6dc", stroke="#c98500")
fg = box(1065, 430, 215, 110, ["**Montage FG", "SFG → Fertigwaren", "(Systemkomponenten)"])
ve = box(1065, 650, 215, 100, ["**Versand", "FG + Zukaufteile", "Luftfracht"])
l3 = box(800, 655, 215, 90, ["Lager 3 Zukaufteile", "(laut Auftrag nicht", "betrachtet)"],
         fill="#f4f4f2", stroke=GRAU, dash=True, color=TEXT2)
k_in = box(1325, 140, 245, 110, ["**Anlagenbau-Kunden", "Indien / weltweit", "auftragsbezogen,",
                                  "Liefertreue 55 %"])
k_no = box(1325, 330, 245, 110, ["**Kunden Naher Osten", "(Hauptmarkt)", "Systemkomponenten"])
k_oem = box(1325, 520, 245, 110, ["**OEM-Kunden", "4 Distributionszentren", "Fracht = 84 % des",
                                   "Nettogewinns"])
k_fh = box(1325, 690, 245, 90, ["**Fachhandel weltweit", "(Eigenlabel, Standard)"])

# Kommissionier-Band
teile.append(f'<rect x="520" y="335" width="495" height="46" rx="8" fill="white" stroke="{BLAU}" '
             f'stroke-width="1.5" stroke-dasharray="4 3"/>')
text(767, 358, "Kommissionierung: 14 Mio. Picks/Jahr – 600 Personen statt 100 (Soll)", size=12.5)

# --- Pfeile -------------------------------------------------------------------
pfeil([(230, 170), (268, 170)], color=ORANGE)                                   # Overseas -> L4
text(250, 152, "See", size=10.5, color=TEXT2)
pfeil([(475, 170), (560, 170), (560, 188)], color=ORANGE)                       # L4 -> L1
text(515, 155, "LKW + Verzollung", size=10.5, color=TEXT2, anchor="start")
pfeil([(230, 480), (507, 480), (507, 290), (518, 290)])                         # Local -> L1
text(350, 466, "LKW", size=10.5, color=TEXT2)
pfeil([(735, 250), (798, 250)], width=3)                                        # L1 -> L2
text(767, 218, ["LKW-", "Shuttle", "~2 AT"], size=10.5, color=TEXT2)
pfeil([(1015, 250), (1063, 250)], width=3)                                      # L2 -> SFG
pfeil([(627, 310), (627, 333)])                                                 # L1 -> Band (Picks)
pfeil([(627, 381), (627, 485), (798, 485)], color="#c98500")                    # RM-Lose -> OP
text(712, 470, "RM-Lose", size=10.5, color=TEXT2)
pfeil([(1015, 485), (1063, 485)], color="#c98500")                              # OP -> FG
text(1040, 470, "SFG", size=10.5, color=TEXT2)
pfeil([(1172, 310), (1172, 428)], width=3)                                      # SFG -> FG
pfeil([(1172, 540), (1172, 648)], width=3)                                      # FG -> Versand
pfeil([(1015, 700), (1063, 700)], color=GRAU, dash=True)                        # L3 -> Versand
pfeil([(560, 381), (560, 610), (128, 610), (128, 638)], color=GRUEN, dash=True)  # RM-Beistellung
text(345, 596, "RM-Beistellung (Qualität)", size=10.5, color=TEXT2)
pfeil([(230, 720), (520, 720), (520, 790), (1172, 790), (1172, 752)], color=GRUEN)  # FG -> Versand
text(780, 776, "Zukauf FG", size=10.5, color=TEXT2)
pfeil([(230, 665), (760, 665), (760, 590), (1120, 590), (1120, 542)], color=GRUEN)  # SFG -> FG
text(870, 576, "Zukauf SFG", size=10.5, color=TEXT2)
for ziel in (k_in, k_no, k_oem, k_fh):                                           # Versand -> Kunden
    yz = ziel[1] + ziel[3] / 2
    pfeil([(1280, 700), (1300, 700), (1300, yz), (1323, yz)], color=LINIE, width=1.8)
text(1293, 618, "Luft-", size=10.5, color=TEXT2, anchor="end")
text(1293, 632, "fracht", size=10.5, color=TEXT2, anchor="end")

# --- Schwachstellen -------------------------------------------------------------
nummer(228, 112, 1)
nummer(473, 112, 2)
nummer(733, 192, 3)
nummer(767, 285, 4)
nummer(1013, 192, 5)
nummer(1013, 337, 6)
nummer(1013, 432, 7)
nummer(1568, 522, 8)

legende = [
    ("1", "Import über komplexe Grenze: nur 2,7 % des Wertes, aber 22 % der Materialien, 23 % der Bestellungen, 43 % der Lieferanten"),
    ("2", "Lager 4 als Single Point of Failure: Zwischenlager, Zoll zweistufig, 7,7–10 Sendungen je Bestellung"),
    ("3", "Doppelte Lagerstufe L1 + L2: Ein-/Auslagerung mehrfach, Doppelhandling, Flächenbedarf"),
    ("4", "Umlagerung am selben Standort dauert ~2 AT: nur 1 AT echter Puffer → Planer lagern früher ein"),
    ("5", "Lager 2: Soll 3 AT, Ist mehrere Wochen (Reichweite × 3,6–7); MtS auf Forecast erzeugt Bestände"),
    ("6", "Kommissionierung manuell: 83 statt 500 Picks je Person und Tag (Faktor 6)"),
    ("7", "Outsourcing und Fremdhersteller: RM-Lose hin und zurück, Schnittstellen, Qualitätsrisiko"),
    ("8", "Distribution: Luftfracht, Liefertreue 55 %, Frachtkosten 84 % des Nettogewinns (OEM)"),
]
text(20, 838, "Schwachstellen (Verschwendung, Doppelhandling, Bestände)", size=14, weight="bold",
     anchor="start")
text(20, 992, "¹ Lieferanten nach Hauptherkunft zugeordnet (ein Lieferant liefert Local und Overseas).",
     size=11, color=TEXT2, anchor="start")
for i, (n, t) in enumerate(legende):
    x = 30 if i < 4 else 815
    y = 870 + (i % 4) * 30
    nummer(x, y, n)
    text(x + 22, y + 1, t, size=12, anchor="start")
svg = (f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H - OBEN}" '
       f'viewBox="0 {OBEN} {W} {H - OBEN}" '
       f'font-family="Liberation Sans, Arial, DejaVu Sans, sans-serif">'
       '<defs>'
       + "".join(
           f'<marker id="{mid}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" '
           f'orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="{c}"/></marker>'
           for mid, c in [("pf", LINIE)])
       + f'</defs><rect y="{OBEN}" width="{W}" height="{H}" fill="white"/>' + "".join(teile) + "</svg>")
# Pfeilspitzen in Linienfarbe: Marker je Farbe
farben = {LINIE: "pf", ORANGE: "pfo", GRUEN: "pfg", GRAU: "pfgr", "#c98500": "pfy"}
defs = "".join(
    f'<marker id="{m}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" '
    f'orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="{c}"/></marker>'
    for c, m in farben.items())
svg = svg.replace(svg[svg.index("<defs>"):svg.index("</defs>")], "<defs>" + defs)
for c, m in farben.items():
    svg = svg.replace(f'stroke="{c}" stroke-width="2.2" marker-end="url(#pf)"',
                      f'stroke="{c}" stroke-width="2.2" marker-end="url(#{m})"')
    svg = svg.replace(f'stroke="{c}" stroke-width="2.2" stroke-dasharray="7 5" marker-end="url(#pf)"',
                      f'stroke="{c}" stroke-width="2.2" stroke-dasharray="7 5" marker-end="url(#{m})"')

(HIER / "abb-ist-materialfluss.svg").write_text(svg, encoding="utf-8")
try:
    import cairosvg
    cairosvg.svg2png(bytestring=svg.encode(), write_to=str(HIER / "abb-ist-materialfluss.png"),
                     output_width=W * 2, output_height=(H - OBEN) * 2)
    print("PNG geschrieben")
except ImportError:
    print("cairosvg fehlt – nur SVG geschrieben")
