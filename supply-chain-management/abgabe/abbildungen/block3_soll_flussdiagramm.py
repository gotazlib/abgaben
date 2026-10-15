"""Erzeugt das Flussdiagramm Soll-Produktionslogistik (Block 3, Werksebene).

Aufruf (aus dem Ordner leistungsnachweis-grofu/):
    python abbildungen/block3_soll_flussdiagramm.py
Schreibt abbildungen/block3-soll-flussdiagramm.svg und .png (benötigt cairosvg).
"""

from pathlib import Path

ZIEL = Path(__file__).resolve().parent
NAME = "block3-soll-flussdiagramm"
B, H = 1700, 1075
FONT = "Liberation Sans, Arial, sans-serif"

# Farben
# Farbschema laut PLAN.md §5
MAT = "#1F4E79"      # Grofu/Materialfluss (Dunkelblau)
INFO = "#548235"     # Informations-/Kanban-Fluss = Soll-Steuerung (Grün)
EIGEN = "#DEEAF6"    # eigener Prozess
EXTERN = "#F2F2F2"   # Partner/extern
CODP = "#C55A11"     # Entkopplungspunkt (Orange = Hervorhebung)
GRAU = "#7F7F7F"

teile = []


def box(x, y, w, h, zeilen, fill=EIGEN, stroke=MAT, fett=0, gross=15, dash=None):
    d = f' stroke-dasharray="{dash}"' if dash else ""
    teile.append(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="10" '
                 f'fill="{fill}" stroke="{stroke}" stroke-width="2"{d}/>')
    zeilenhoehe = gross + 5
    start = y + h / 2 - (len(zeilen) - 1) * zeilenhoehe / 2 + gross / 3
    for i, z in enumerate(zeilen):
        gewicht = "bold" if i < fett else "normal"
        groesse = gross if i < fett or fett == 0 else gross - 2
        teile.append(f'<text x="{x + w / 2}" y="{start + i * zeilenhoehe}" '
                     f'text-anchor="middle" font-size="{groesse}" font-weight="{gewicht}" '
                     f'fill="#1b1b1b">{z}</text>')


def pfeil(punkte, farbe=MAT, dash=None, breite=2.5, label=None, lx=0, ly=0):
    d = f' stroke-dasharray="{dash}"' if dash else ""
    marker = "pfeil-info" if farbe == INFO else "pfeil"
    pfad = " ".join(f"{'M' if i == 0 else 'L'}{x},{y}" for i, (x, y) in enumerate(punkte))
    teile.append(f'<path d="{pfad}" fill="none" stroke="{farbe}" stroke-width="{breite}"'
                 f'{d} marker-end="url(#{marker})"/>')
    if label:
        teile.append(f'<text x="{lx}" y="{ly}" font-size="13" fill="{farbe}" '
                     f'font-style="italic">{label}</text>')


def text(x, y, t, groesse=14, farbe="#1b1b1b", anker="middle", gewicht="normal"):
    teile.append(f'<text x="{x}" y="{y}" text-anchor="{anker}" font-size="{groesse}" '
                 f'font-weight="{gewicht}" fill="{farbe}">{t}</text>')


# --- Spaltenköpfe ---------------------------------------------------------
spalten = [(20, 250, "Beschaffung"), (290, 270, "Wareneingang und Lager"),
           (580, 240, "Produktionsversorgung"), (840, 300, "SFG-Fertigung (neues Werk)"),
           (1160, 300, "Endmontage FG"), (1480, 200, "Versand")]
for x, w, t in spalten:
    teile.append(f'<rect x="{x}" y="70" width="{w}" height="36" fill="{MAT}" rx="4"/>')
    text(x + w / 2, 94, t, 16, "white", gewicht="bold")
    teile.append(f'<rect x="{x}" y="112" width="{w}" height="760" fill="#FAFAFA" '
                 f'stroke="#e1e5ea"/>')


# --- Beschaffung ------------------------------------------------------------
box(35, 140, 220, 95, ["Lieferanten lokal", "≈ 97 % des Einkaufswerts",
                       "JIT/Kanban für A/B-X-Teile"], fett=1)
box(35, 265, 220, 105, ["Lieferanten Übersee", "inkl. Übersee-C-Teile,", "gesammelt über",
                        "Zollverschluss (V3)"], fett=1)
box(35, 400, 220, 95, ["C-Teile lokal", "C-Teile-Management,", "Konsignation (65 % Pos.)"],
    fill=EXTERN, stroke=GRAU, fett=1)
box(35, 525, 220, 95, ["Outsourcing-Partner", "kurzfristig Kit-Kanban,", "dann Modular Sourcing"],
    fill=EXTERN, stroke=GRAU, fett=1)
box(35, 650, 220, 95, ["andere SFG/FG-Hersteller", "auf Kapazitätsspitzen", "reduziert"],
    fill="white", stroke=GRAU, fett=1, dash="6 4", gross=13)

# --- Wareneingang / Zentrallager ------------------------------------------
box(305, 150, 240, 100, ["Wareneingang", "QSV + Skip-Lot-Prüfung,", "Scan/EDI-Lieferavis"],
    fett=1)
box(305, 300, 240, 190, ["Lager 1 = Zentrallager", "(automatisiert)",
                         "HRL Paletten + AKL Behälter", "Zollverschluss-Bereich",
                         "ABC/Zugriffs-Platzvergabe", "Ware-zur-Person-", "Kommissionierung"],
    fett=2, gross=14)
box(305, 540, 240, 105, ["Lager 2 (Produktionslager)", "entfällt: kein LKW-Shuttle,",
                         "keine 2. Lagerstufe"], fill="white", stroke=GRAU, fett=1, dash="6 4")

# --- Produktionsversorgung ----------------------------------------------------
box(595, 300, 210, 110, ["Milkrun (Routenzug)", "feste Takte je Schicht,", "Behälter-Kanban"],
    fett=1)
box(595, 460, 210, 110, ["Supermärkte", "an Inseln und Linie,", "Reichweite ≤ 1 AT"], fett=1)
box(595, 620, 210, 95, ["C-Teile lokal direkt", "2-Behälter-Kanban", "an den Verbauort"],
    fill=EXTERN, stroke=GRAU, fett=1)

# --- SFG-Fertigung ------------------------------------------------------------
for i, (t1, t2) in enumerate([("Fertigungsinsel 1", "Teilefamilie 1 (Know-how-Teile)"),
                              ("Fertigungsinsel 2", "Teilefamilie 2 (Schwierigteile)"),
                              ("Fertigungsinsel n", "weitere Teilefamilien")]):
    box(860, 150 + i * 120, 260, 95, [t1, t2, "Gruppenfertigung, Kanban"], fett=1, gross=14)
box(860, 545, 260, 120, ["SFG-Supermarkt", "Entkopplungspunkt (CODP)", "standardisierte SFG",
                         "Bestand nach X/Y/Z"], fill="#FBE5D6", stroke=CODP, fett=2)
text(965, 690, "vorgelagert: prognose-/", 13, CODP)
text(965, 707, "verbrauchsgesteuert", 13, CODP)
text(965, 727, "nachgelagert: auftrags-", 13, CODP)
text(965, 744, "gesteuert", 13, CODP)

# --- Endmontage -----------------------------------------------------------------
box(1180, 150, 260, 120, ["Taktlinie Endgeräte", "Eigenlabel: MtS mit Kanban,", "OEM: gegen EDI-Abruf",
                          "Heijunka-Glättung"], fett=1)
box(1180, 320, 260, 130, ["Montagezelle Anlagenmodule", "MtO / ATO, Express-Spur,",
                          "reservierte Kapazität,", "Poka-Yoke + Endprüfung"], fett=1)
box(1180, 500, 200, 95, ["Qualitätsregelkreis", "SPC an Inseln/Linie,", "8D-Rückmeldung"],
    fett=1, gross=14)

# --- Versand ---------------------------------------------------------------------
box(1495, 150, 170, 140, ["Versand", "konsolidiert", "OEM-DCs + Fachhandel", "+ Zukaufteile (Lager 3)",
                         "→ Kap. Distribution"], fill=EXTERN, stroke=GRAU, fett=2, gross=14)
box(1495, 320, 170, 130, ["Versand", "Luftfracht", "Anlagenmodule", "zum Montageort",
                         "+ Zukaufteile (Lager 3)"], fill=EXTERN, stroke=GRAU, fett=2, gross=14)

# --- Materialfluss ---------------------------------------------------------------
pfeil([(255, 187), (305, 195)])
pfeil([(255, 317), (280, 317), (280, 230), (305, 230)])
pfeil([(425, 250), (425, 300)])
pfeil([(545, 355), (595, 355)])
pfeil([(700, 410), (700, 460)])
pfeil([(255, 470), (285, 470), (285, 680), (595, 680)])
pfeil([(805, 500), (835, 500), (835, 197), (860, 197)])
pfeil([(835, 317), (860, 317)])
pfeil([(835, 437), (860, 437)])
pfeil([(805, 667), (835, 667), (835, 500)], breite=2)
pfeil([(255, 572), (268, 572), (268, 820), (1080, 820), (1080, 665)], breite=2,
      label="einfache SFG zurück", lx=560, ly=812)
pfeil([(1120, 605), (1150, 605), (1150, 210), (1180, 210)])
pfeil([(1150, 385), (1180, 385)])
pfeil([(1440, 210), (1495, 210)])
pfeil([(1440, 385), (1495, 380)])
# Inseln -> SFG-Supermarkt (Sammelschiene)
teile.append(f'<path d="M1135,197 L1135,535" stroke="{MAT}" stroke-width="2.5" fill="none"/>')
for y in (197, 317, 437):
    teile.append(f'<path d="M1120,{y} L1135,{y}" stroke="{MAT}" stroke-width="2.5"/>')
pfeil([(1135, 520), (1135, 535), (1060, 535), (1060, 545)])

# --- Informationsfluss (Pull) ------------------------------------------------
box(860, 900, 580, 70, ["Kundenaufträge / EDI-Abrufe → Planung (APO nur Grobplanung, Heijunka)",
                        "Kanban-Signale laufen entgegen dem Materialfluss"],
    fill="#E2EFDA", stroke=INFO, fett=1, gross=14)
pfeil([(1410, 900), (1410, 455)], INFO, "7 5", 2)
pfeil([(1440, 935), (1580, 935), (1580, 450)], INFO, "7 5", 2)
pfeil([(860, 935), (700, 935), (700, 720)], INFO, "7 5", 2, "Kanban", 710, 888)
pfeil([(595, 325), (547, 325)], INFO, "7 5", 2, "Abruf", 552, 318)
pfeil([(305, 200), (290, 200), (290, 130), (150, 130), (150, 140)], INFO, "7 5", 2,
      "EDI-Abruf", 165, 126)

# --- Legende --------------------------------------------------------------------
lx, ly = 30, 900
teile.append(f'<rect x="{lx}" y="{ly}" width="780" height="160" fill="white" stroke="#ccc" rx="6"/>')
text(lx + 15, ly + 25, "Legende", 15, anker="start", gewicht="bold")
pfeil([(lx + 15, ly + 50), (lx + 85, ly + 50)])
text(lx + 95, ly + 55, "Materialfluss", 14, anker="start")
pfeil([(lx + 15, ly + 80), (lx + 85, ly + 80)], INFO, "7 5", 2)
text(lx + 95, ly + 85, "Informationsfluss / Kanban (Pull)", 14, anker="start")
for i, (f, s, t) in enumerate([(EIGEN, MAT, "Grofu-eigener Prozess"),
                                (EXTERN, GRAU, "Partner / extern"),
                                ("white", GRAU, "entfällt bzw. wird abgebaut"),
                                ("#FBE5D6", CODP, "Entkopplungspunkt (CODP)")]):
    x = lx + 330 + (i % 2) * 220
    y = ly + 40 + (i // 2) * 45
    teile.append(f'<rect x="{x}" y="{y}" width="30" height="22" fill="{f}" stroke="{s}" '
                 f'stroke-width="2" rx="4"/>')
    text(x + 38, y + 16, t, 13, anker="start")
text(lx + 15, ly + 128, "AT = Arbeitstag; QSV = Qualitätssicherungsvereinbarung; Pos. = Positionen (Materialnummern)", 12, "#444", "start")
text(lx + 15, ly + 146, "MtS/MtO/ATO = Make-to-Stock/Make-to-Order/Assemble-to-Order; "
     "HRL/AKL = Hochregal-/Automatisches Kleinteilelager", 12, "#444", "start")

OBEN_SCHNITT = 55  # Titel setzt der Build, daher oberen Rand abschneiden
svg = f'''<svg xmlns="http://www.w3.org/2000/svg" width="{B}" height="{H - OBEN_SCHNITT}" viewBox="0 {OBEN_SCHNITT} {B} {H - OBEN_SCHNITT}"
 font-family="{FONT}">
<defs>
 <marker id="pfeil" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
  <path d="M0,0 L10,5 L0,10 z" fill="{MAT}"/></marker>
 <marker id="pfeil-info" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
  <path d="M0,0 L10,5 L0,10 z" fill="{INFO}"/></marker>
</defs>
<rect width="{B}" height="{H}" fill="white"/>
{chr(10).join(teile)}
</svg>'''

(ZIEL / f"{NAME}.svg").write_text(svg, encoding="utf-8")
try:
    import cairosvg
    cairosvg.svg2png(bytestring=svg.encode("utf-8"), write_to=str(ZIEL / f"{NAME}.png"), scale=1.5)
except ImportError:
    print("cairosvg fehlt: nur SVG geschrieben")
print("geschrieben:", ZIEL / f"{NAME}.svg")
