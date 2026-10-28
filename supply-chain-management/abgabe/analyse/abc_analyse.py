#!/usr/bin/env python3
"""ABC-Analyse der Rohmaterialien (RM) der Grofu AG Indien Ltd.

Reproduzierbare Auswertung der Datei material/Daten-ABC-Analyse-Grofu.xls
für den Leistungsnachweis Supply Chain Management (HWZ).

Aufruf (aus dem Ordner leistungsnachweis-grofu/):
    python analyse/abc_analyse.py [Pfad/zur/Daten-ABC-Analyse-Grofu.xls]

Benötigt: pandas, xlrd (für .xls), matplotlib.

Erzeugt
  analyse/*.csv            Ergebnis-Tabellen (Trennzeichen ';', Dezimalpunkt)
  analyse/abc_bericht.txt  Datenbeschreibung, Datenqualität und Kernzahlen
  abbildungen/abb-*.png    Diagramme für das Kapitel Ist-Analyse

Vorgehen und Grenzen (Details im Kapitel Ist-Analyse):
  * Die Datei enthält je Rohmaterial den Anteil am jährlichen Einkaufsvolumen
    («% of Sales»), den Lieferanten, die Anzahl Bestellungen p. a., die
    EDI-Fähigkeit des Lieferanten, die eingekaufte Stückzahl p. a. und die
    Herkunft (Local / Overseas). Absolute Geldbeträge, Bestände und Perioden-
    verbräuche fehlen. Deshalb
      - wird die ABC-Analyse auf den Wertanteil gerechnet (Einkaufsvolumen),
      - ist eine echte XYZ-Analyse (Variationskoeffizient) NICHT möglich;
        ersatzweise wird die Bestellhäufigkeit p. a. als Hilfsgrösse für die
        Regelmässigkeit des Bedarfs verwendet (klar als Hilfsgrösse benannt),
      - wird der Bestand modellhaft als Losgrössenbestand (Bestellmenge / 2)
        geschätzt; Sicherheitsbestände sind darin nicht enthalten.
  * Klassengrenzen 70 / 20 / 10 % des Wertes: Das Skript nennt für A-Artikel
    ca. 70-80 %, für B 15-20 %, für C 5-10 % (Skript SCM HWZ, S. 35); die
    Datei selbst verwendet 70 / 90 / 100 % kumuliert. Wir übernehmen diese
    Grenze, damit die Ergebnisse mit den Klassen in der Datei übereinstimmen,
    und prüfen 80 / 15 / 5 als Sensitivität.
"""

from __future__ import annotations

import os
import sys
from pathlib import Path

import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt  # noqa: E402
from matplotlib import font_manager  # noqa: E402
import numpy as np  # noqa: E402
import pandas as pd  # noqa: E402

sys.path.insert(0, str(Path(__file__).resolve().parent))
import fallstudie_kennzahlen  # noqa: E402

BASIS = Path(__file__).resolve().parent.parent  # leistungsnachweis-grofu/
AUS = BASIS / "analyse"
ABB = BASIS / "abbildungen"
STANDARD_XLS = BASIS / "material" / "Daten-ABC-Analyse-Grofu.xls"

ARBEITSTAGE = 280  # Arbeitstage pro Jahr in Indien laut Fallstudie (S. 6)
GRENZEN = {"A": 0.70, "B": 0.90}  # kumulierter Wertanteil (70/20/10)
GRENZEN_SENS = {"A": 0.80, "B": 0.95}  # Sensitivität 80/15/5
QUELLE = "Quelle: eigene Darstellung, Daten: Grofu AG (Daten-ABC-Analyse-Grofu.xls)"

# Farben laut PLAN.md §5: Dunkelblau = Grofu/Material, Orange = Hervorhebung/
# Problem, Grün = Soll/Verbesserung, Grau = neutral. AQUA heisst historisch so.
BLAU, ORANGE, AQUA, GRAU = "#1F4E79", "#C55A11", "#7F7F7F", "#A6A6A6"
KLASSENFARBE = {"A": BLAU, "B": ORANGE, "C": AQUA}
TEXT, TEXT2, GITTER = "#0b0b0b", "#4d4d4d", "#e4e3df"

# Schrift Liberation Sans (metrisch gleich Arial), falls vorhanden; sonst DejaVu.
for _ordner in [os.environ.get("GROFU_FONTDIR", ""), "/usr/share/fonts/truetype/liberation"]:
    for _f in Path(_ordner).glob("LiberationSans-*.ttf") if _ordner else []:
        font_manager.fontManager.addfont(str(_f))

plt.rcParams.update({
    "font.family": ["Liberation Sans", "DejaVu Sans"],
    "font.size": 9,
    "axes.edgecolor": TEXT2,
    "axes.labelcolor": TEXT,
    "axes.titlesize": 10.5,
    "axes.titleweight": "bold",
    "axes.spines.top": False,
    "axes.spines.right": False,
    "xtick.color": TEXT2,
    "ytick.color": TEXT2,
    "figure.dpi": 100,
    "savefig.dpi": 200,
})


def pct(x: float, nachkomma: int = 1) -> str:
    """Prozentformat mit Dezimalkomma wie im Text, z. B. 0.0381 -> '3,8 %'."""
    return f"{x * 100:.{nachkomma}f}".replace(".", ",") + "\u00a0%"


def zahl(x: float) -> str:
    """Tausendertrennung mit geschütztem Leerschlag wie im Text, z. B. 23643 -> '23 643'."""
    return f"{x:,.0f}".replace(",", "\u00a0")


# Achsenbeschriftung in Prozent mit Dezimalkomma und Leerschlag («20 %»)
PROZENT = matplotlib.ticker.FuncFormatter(lambda v, _: f"{v * 100:.0f}\u00a0%")


def quelle(fig) -> None:
    """Titel und Quelle setzt der Word-Build als Beschriftung (PLAN.md §5);
    in den Bildern steht deshalb keine Quellenzeile. Mit GROFU_QUELLE_IM_BILD=1
    lässt sie sich für Einzelansichten einblenden."""
    if os.environ.get("GROFU_QUELLE_IM_BILD"):
        fig.text(0.01, 0.005, QUELLE, fontsize=7, color=TEXT2, ha="left", va="bottom")


# --------------------------------------------------------------------------
# 1. Einlesen
# --------------------------------------------------------------------------

def einlesen(pfad: Path) -> tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame, list[str]]:
    """Liest beide Blätter ein und trennt Datenzeilen von Summen-/Leerzeilen."""
    xls = pd.ExcelFile(pfad)
    roh = xls.parse("RM + ABC")
    # Die ersten 10 Spalten enthalten die Daten; Spalten O/P (Index 14/15)
    # enthalten die Klassengrenzen-Tabelle 0.7 A / 0.9 B / 1.0 C.
    grenz_tab = roh.iloc[:3, 14:16].dropna().values.tolist()
    rm = roh.iloc[:, :10].copy()
    rm.columns = ["rm", "anteil", "kumuliert", "abc_datei", "lieferant",
                  "lieferant_abc_datei", "bestellungen", "edi", "stueck", "herkunft"]

    # Datenzeilen = Zeilen mit Lieferant. Am Ende stehen Summen-/Hilfszeilen
    # (z. B. Summe Stückzahl 14.7 Mrd., Anzahl «Local» 18'342, Maximum 141).
    gueltig = rm["lieferant"].notna()
    rest = rm[~gueltig]
    rm = rm[gueltig].copy()
    rm["rm"] = rm["rm"].astype(int)
    rm["lieferant"] = rm["lieferant"].astype(int)
    rm["herkunft"] = rm["herkunft"].map({"Local": "Local", "Oseas": "Overseas"})

    lf = xls.parse("Vendors + ABC").iloc[:, :5].copy()
    lf.columns = ["lieferant", "volumen", "kumuliert", "kum_anteil", "abc_datei"]
    lf = lf[lf["lieferant"].notna()].copy()
    lf["lieferant"] = lf["lieferant"].astype(int)

    notizen = [f"Klassengrenzen-Tabelle in der Datei (kumuliert): {grenz_tab}",
               f"Entfernte Summen-/Leerzeilen am Ende des Blatts 'RM + ABC': {len(rest)}"]
    for _, z in rest.iterrows():
        werte = {k: v for k, v in z.items() if pd.notna(v) and k not in ("anteil", "kumuliert")}
        notizen.append(f"  - {werte}")
    return rm, lf, rest, notizen


# --------------------------------------------------------------------------
# 2. Datenbeschreibung und Datenqualität
# --------------------------------------------------------------------------

def datenqualitaet(rm: pd.DataFrame, lf: pd.DataFrame) -> pd.DataFrame:
    zeilen = []

    def add(pruefung, ergebnis, bewertung):
        zeilen.append({"Prüfung": pruefung, "Ergebnis": ergebnis, "Bewertung": bewertung})

    add("Datensätze Rohmaterial (nach Bereinigung)", zahl(len(rm)), "Grundgesamtheit")
    add("Fehlende Werte in Datenspalten", int(rm.isna().sum().sum()), "keine")
    add("Doppelte Materialnummern", int(rm["rm"].duplicated().sum()), "keine")
    add("Summe der Wertanteile", f"{rm['anteil'].sum():.6f}", "= 1, vollständig")
    add("Sortierung absteigend nach Wertanteil",
        bool((rm["anteil"].diff().dropna() <= 1e-12).all()), "ja, Voraussetzung ABC erfüllt")
    add("Materialien mit Wertanteil 0", int((rm["anteil"] == 0).sum()),
        "Rundung/Kleinstwerte, bleiben in Klasse C")
    neu = klassieren(rm["anteil"], GRENZEN)
    add("Abweichung eigene ABC-Klasse vs. Datei", int((neu != rm["abc_datei"]).sum()),
        "Klassen der Datei reproduziert")
    st = rm["stueck"]
    add("Stückzahl p. a.: Median / Maximum", f"{zahl(st.median())} / {zahl(st.max())}",
        "stark rechtsschief (Kleinteile in Grossmengen)")
    add("Ausreisser Stückzahl > 100 Mio. p. a.", int((st > 1e8).sum()),
        "plausibel (Kleinstteile), nicht entfernt")
    bo = rm["bestellungen"]
    add("Bestellungen p. a.: Median / Maximum", f"{bo.median():.0f} / {bo.max():.0f}",
        "Maximum 141 bei einem C-Teil: plausibel, nicht entfernt")
    add("Lieferanten im RM-Blatt / im Lieferantenblatt",
        f"{rm['lieferant'].nunique()} / {len(lf)}",
        "19 Lieferanten nur im Lieferantenblatt")
    # Abgleich Lieferantenvolumen: Anteil im RM-Blatt × Gesamtvolumen Lieferantenblatt
    gesamt = lf["volumen"].sum()
    rm_lf = rm.groupby("lieferant")["anteil"].sum() * gesamt
    vgl = pd.concat([rm_lf.rename("rm"), lf.set_index("lieferant")["volumen"]], axis=1).dropna()
    abw = (vgl["rm"] - vgl["volumen"]).abs() > 0.05 * vgl["volumen"]
    add("Lieferanten mit > 5 % Volumenabweichung RM- vs. Lieferantenblatt",
        int(abw.sum()), "Blätter beruhen nicht auf identischer Basis (z. B. SFG/FG-Zukauf?)")
    add("Einheit der Wertgrösse", "nicht angegeben",
        "Auswertung daher in Wertanteilen (%) statt Geldbeträgen")
    add("Perioden-/Zeitreihendaten", "nicht vorhanden", "keine XYZ-Analyse möglich")
    add("Bestandsdaten", "nicht vorhanden", "Bestand nur modellhaft (Losgrössenbestand)")
    return pd.DataFrame(zeilen)


# --------------------------------------------------------------------------
# 3. ABC-Analyse
# --------------------------------------------------------------------------

def klassieren(anteil: pd.Series, grenzen: dict) -> pd.Series:
    """Klasse nach kumuliertem Wertanteil; Artikel, der die Grenze überschreitet,
    fällt bereits in die nächste Klasse (wie in der Datei)."""
    kum = anteil.sort_values(ascending=False).cumsum()
    k = pd.Series("C", index=kum.index)
    k[kum <= grenzen["B"] + 1e-12] = "B"
    k[kum <= grenzen["A"] + 1e-12] = "A"
    return k.reindex(anteil.index)


def klassen_tabelle(rm: pd.DataFrame, spalte: str = "abc") -> pd.DataFrame:
    g = rm.groupby(spalte).agg(
        materialien=("rm", "size"), wertanteil=("anteil", "sum"),
        bestellungen=("bestellungen", "sum"), stueck=("stueck", "sum"),
        lieferanten=("lieferant", "nunique"),
        overseas=("herkunft", lambda s: (s == "Overseas").sum()))
    g["anteil_materialien"] = g["materialien"] / g["materialien"].sum()
    g["anteil_bestellungen"] = g["bestellungen"] / g["bestellungen"].sum()
    g["anteil_stueck"] = g["stueck"] / g["stueck"].sum()
    g["bestellungen_je_material"] = g["bestellungen"] / g["materialien"]
    summe = g.sum(numeric_only=True)
    summe["bestellungen_je_material"] = summe["bestellungen"] / summe["materialien"]
    summe["lieferanten"] = rm["lieferant"].nunique()  # nicht additiv
    g.loc["Total"] = summe
    return g[["materialien", "anteil_materialien", "wertanteil", "bestellungen",
              "anteil_bestellungen", "bestellungen_je_material", "stueck",
              "anteil_stueck", "lieferanten", "overseas"]]


def lieferanten_abc(rm: pd.DataFrame) -> pd.DataFrame:
    """ABC der Lieferanten auf Basis der RM-Daten (konsistent mit Material-ABC)."""
    v = rm.groupby("lieferant").agg(
        wertanteil=("anteil", "sum"), materialien=("rm", "size"),
        bestellungen=("bestellungen", "sum"),
        herkunft=("herkunft", lambda s: s.mode().iloc[0]),
        edi=("edi", lambda s: s.mode().iloc[0])).sort_values("wertanteil", ascending=False)
    v["kumuliert"] = v["wertanteil"].cumsum()
    v["abc"] = klassieren(v["wertanteil"], GRENZEN)
    return v


# --------------------------------------------------------------------------
# 4. Hilfsgrösse Bestellhäufigkeit (Ersatz für XYZ) und Bestandsmodell
# --------------------------------------------------------------------------

FREQ_KLASSEN = ["1×", "2–3×", "4–11×", "≥ 12×"]


def freq_klasse(bestellungen: pd.Series) -> pd.Series:
    return pd.cut(bestellungen, [0, 1, 3, 11, np.inf], labels=FREQ_KLASSEN)


def bestandsmodell(rm: pd.DataFrame, ziel_n: dict) -> pd.DataFrame:
    """Losgrössenbestand je Material = Jahreswert / (2 × Anlieferungen p. a.).

    Annahmen: gleichmässiger Verbrauch, eine Anlieferung je Bestellung, kein
    Sicherheitsbestand. Ergebnis in % des jährlichen Einkaufsvolumens.
    ziel_n: Mindestzahl Anlieferungen p. a. je Klasse im Soll (None = wie Ist).
    """
    d = rm.copy()
    d["bestand_ist"] = d["anteil"] / (2 * d["bestellungen"])
    soll_n = d.apply(lambda r: max(r["bestellungen"], ziel_n.get(r["abc"]) or 0), axis=1)
    d["bestand_soll"] = d["anteil"] / (2 * soll_n)
    g = d.groupby("abc").agg(wertanteil=("anteil", "sum"), bestand_ist=("bestand_ist", "sum"),
                             bestand_soll=("bestand_soll", "sum"))
    g.loc["Total"] = g.sum()
    g["reichweite_ist_at"] = g["bestand_ist"] / g["wertanteil"] * ARBEITSTAGE
    g["reichweite_soll_at"] = g["bestand_soll"] / g["wertanteil"] * ARBEITSTAGE
    g["umschlag_ist"] = g["wertanteil"] / g["bestand_ist"]
    g["umschlag_soll"] = g["wertanteil"] / g["bestand_soll"]
    g["senkung"] = 1 - g["bestand_soll"] / g["bestand_ist"]
    g["anteil_am_gesamtbestand_ist"] = g["bestand_ist"] / g.loc["Total", "bestand_ist"]
    return g


# --------------------------------------------------------------------------
# 5. Abbildungen
# --------------------------------------------------------------------------

def abb_lorenz(rm: pd.DataFrame, pfad: Path) -> None:
    d = rm.sort_values("anteil", ascending=False)
    x = np.arange(1, len(d) + 1) / len(d)
    y_wert = d["anteil"].cumsum().values
    y_best = (d["bestellungen"].cumsum() / d["bestellungen"].sum()).values
    nA = (d["abc"] == "A").sum() / len(d)
    nB = (d["abc"] != "C").sum() / len(d)

    fig, ax = plt.subplots(figsize=(6.3, 3.9))
    ax.axvspan(0, nA, color=BLAU, alpha=0.07, lw=0)
    ax.axvspan(nA, nB, color=ORANGE, alpha=0.07, lw=0)
    ax.plot(x, y_wert, color=BLAU, lw=2, label="kumulierter Wertanteil (Einkaufsvolumen)")
    ax.plot(x, y_best, color=ORANGE, lw=2, label="kumulierter Anteil Bestellungen")
    ax.plot([0, 1], [0, 1], color=GRAU, lw=1, ls=":", label="Gleichverteilung")
    for xv in (nA, nB):
        ax.axvline(xv, color=TEXT2, lw=0.8, ls="--")
    ax.annotate(f"A: {pct(nA)} der Materialien\n= 70 % des Wertes", xy=(nA, 0.70),
                xytext=(0.17, 0.50), fontsize=8, color=TEXT,
                arrowprops=dict(arrowstyle="-", color=TEXT2, lw=0.8))
    ax.annotate(f"A+B: {pct(nB)}\n= 90 % des Wertes", xy=(nB, 0.90),
                xytext=(0.30, 0.72), fontsize=8, color=TEXT,
                arrowprops=dict(arrowstyle="-", color=TEXT2, lw=0.8))
    ax.text(nA / 2, 0.03, "A", ha="center", fontsize=9, weight="bold", color=BLAU)
    ax.text((nA + nB) / 2, 0.03, "B", ha="center", fontsize=9, weight="bold", color=ORANGE)
    ax.text(0.55, 0.03, "C", ha="center", fontsize=9, weight="bold", color=AQUA)
    ax.set_xlim(0, 1)
    ax.set_ylim(0, 1.02)
    ax.xaxis.set_major_formatter(PROZENT)
    ax.yaxis.set_major_formatter(PROZENT)
    ax.set_xlabel(f"Anteil der Rohmaterialien (n = {zahl(len(d))}, absteigend nach Wert)")
    ax.set_ylabel("kumulierter Anteil")
    ax.grid(axis="y", color=GITTER, lw=0.6)
    ax.legend(loc="center right", bbox_to_anchor=(1, 0.32), frameon=False, fontsize=8)
    fig.tight_layout(rect=(0, 0, 1, 1))
    quelle(fig)
    fig.savefig(pfad)
    plt.close(fig)


def abb_klassenprofil(tab: pd.DataFrame, pfad: Path) -> None:
    """Je Klasse: Anteil an Materialien, Wert, Bestellungen, Stück (100 %-Balken)."""
    kennz = [("anteil_materialien", "Materialien"), ("wertanteil", "Einkaufswert"),
             ("anteil_bestellungen", "Bestellungen"), ("anteil_stueck", "Stückzahl")]
    t = tab.loc[["A", "B", "C"]]
    fig, ax = plt.subplots(figsize=(6.3, 2.9))
    y = np.arange(len(kennz))[::-1]
    links = np.zeros(len(kennz))
    for k in ["A", "B", "C"]:
        werte = np.array([t.loc[k, s] for s, _ in kennz])
        ax.barh(y, werte, left=links, color=KLASSENFARBE[k], height=0.6,
                edgecolor="white", linewidth=1.5, label=f"Klasse {k}")
        for yi, w, l in zip(y, werte, links):
            if w >= 0.08:
                ax.text(l + w / 2, yi, pct(w), ha="center",
                        va="center", fontsize=8, color="white", weight="bold")
        links += werte
    ax.set_yticks(y, [b for _, b in kennz])
    ax.set_xlim(0, 1)
    ax.xaxis.set_major_formatter(PROZENT)
    ax.legend(ncol=3, loc="upper center", bbox_to_anchor=(0.5, -0.13), frameon=False, fontsize=8)
    ax.spines["left"].set_visible(False)
    ax.tick_params(axis="y", length=0)
    fig.tight_layout(rect=(0, 0, 1, 1))
    quelle(fig)
    fig.savefig(pfad)
    plt.close(fig)


def abb_herkunft(herk: pd.DataFrame, pfad: Path) -> None:
    kennz = ["Materialien", "Einkaufswert", "Bestellungen", "Stückzahl", "Lieferanten"]
    fig, ax = plt.subplots(figsize=(6.3, 2.7))
    y = np.arange(len(kennz))[::-1]
    lo = herk.loc["Local", kennz].values.astype(float)
    ov = herk.loc["Overseas", kennz].values.astype(float)
    ax.barh(y, lo, color=BLAU, height=0.6, edgecolor="white", linewidth=1.5, label="Local (Indien)")
    ax.barh(y, ov, left=lo, color=ORANGE, height=0.6, edgecolor="white", linewidth=1.5,
            label="Overseas (Import via Karatschi)")
    for yi, a, b in zip(y, lo, ov):
        ax.text(a / 2, yi, pct(a, 0), ha="center", va="center", color="white", fontsize=8, weight="bold")
        ax.text(a + b + 0.01 if b < 0.06 else a + b / 2, yi, pct(b, 1),
                ha="left" if b < 0.06 else "center", va="center",
                color=TEXT if b < 0.06 else "white", fontsize=8, weight="bold")
    ax.set_yticks(y, kennz)
    ax.set_xlim(0, 1.08)
    ax.set_xticks([0, 0.25, 0.5, 0.75, 1])
    ax.xaxis.set_major_formatter(PROZENT)
    ax.legend(ncol=2, loc="upper center", bbox_to_anchor=(0.5, -0.14), frameon=False, fontsize=8)
    ax.spines["left"].set_visible(False)
    ax.tick_params(axis="y", length=0)
    fig.tight_layout(rect=(0, 0, 1, 1))
    quelle(fig)
    fig.savefig(pfad)
    plt.close(fig)


STRATEGIEHINWEIS = {
    # (ABC, Häufigkeitsklasse) -> Strategiehinweis der ABC-Bestellfrequenz-Matrix.
    # Die Bestellhäufigkeit ist KEINE XYZ-Analyse: Ob JIT/Kanban passt, hängt von
    # Verbrauchsregelmässigkeit, WBZ, Versorgungssicherheit, Lieferqualität und
    # Abrufmenge ab -> erst nach XYZ- und Kritikalitätsanalyse (Roadmap Phase 1).
    # Begriffe aus dem Skript (Hutzler & Fuchs, 2021): JIT S. 37-38, Kanban S. 48,
    # Konsignationslager S. 36, C-Teile-Management S. 38, Pooling S. 40,
    # Single Sourcing S. 36; Zuordnung zu den Feldern = eigene Ableitung.
    ("A", "≥ 12×"): "Rahmenvertrag; JIT/\nKanban prüfen (XYZ)",
    ("A", "4–11×"): "Rahmenvertrag,\nAbrufe erhöhen",
    ("A", "2–3×"): "Abruffrequenz\nerhöhen (Bestand!)",
    ("A", "1×"): "Einzel-/Projekt-\nbedarf, auftragsbez.",
    ("B", "≥ 12×"): "Abruf; Kanban\nprüfen (XYZ)",
    ("B", "4–11×"): "Single Sourcing,\nmonatl. Abruf",
    ("B", "2–3×"): "Pooling,\nAbrufe bündeln",
    ("B", "1×"): "auftragsbezogen",
    ("C", "≥ 12×"): "C-Teile-Mgmt.,\nKonsignation",
    ("C", "4–11×"): "C-Teile-Management\n(Systemlieferant)",
    ("C", "2–3×"): "Pooling,\nVorratsbeschaffung",
    ("C", "1×"): "Sortiment\nbereinigen",
}


def abb_matrix(matrix_n: pd.DataFrame, matrix_w: pd.DataFrame, pfad: Path) -> None:
    fig, ax = plt.subplots(figsize=(6.3, 4.2))
    zeilen, spalten = ["A", "B", "C"], FREQ_KLASSEN[::-1]
    w = matrix_w.loc[zeilen, spalten].values
    cmap = matplotlib.colors.LinearSegmentedColormap.from_list("blau", ["#f1f6fd", "#2a78d6"])
    ax.imshow(np.sqrt(w), cmap=cmap, aspect="auto", vmin=0, vmax=np.sqrt(w.max()))
    for i, z in enumerate(zeilen):
        for j, s in enumerate(spalten):
            dunkel = np.sqrt(w[i, j] / w.max()) > 0.6
            farbe = "white" if dunkel else TEXT
            ax.text(j, i - 0.2, f"{pct(w[i, j])} des Wertes\n{zahl(matrix_n.loc[z, s])} Materialien",
                    ha="center", va="center", fontsize=7.2, color=farbe, weight="bold",
                    linespacing=1.15)
            ax.text(j, i + 0.22, STRATEGIEHINWEIS[(z, s)], ha="center", va="center",
                    fontsize=7, color=farbe, linespacing=1.1)
    ax.set_xticks(range(4), [f"{s} p. a." for s in spalten])
    ax.set_yticks(range(3), [f"{z}-Material" for z in zeilen])
    ax.set_xlabel("Bestellhäufigkeit p. a. (Bestellfrequenz, keine XYZ-Analyse)")
    for s in ax.spines.values():
        s.set_visible(False)
    ax.set_xticks(np.arange(-0.5, 4), minor=True)
    ax.set_yticks(np.arange(-0.5, 3), minor=True)
    ax.grid(which="minor", color="white", lw=2)
    ax.tick_params(which="both", length=0)
    fig.tight_layout(rect=(0, 0, 1, 1))
    quelle(fig)
    fig.savefig(pfad)
    plt.close(fig)


def abb_lieferanten(lf: pd.DataFrame, v: pd.DataFrame, pfad: Path) -> None:
    """Lieferanten-Lorenzkurve: Blatt «Vendors + ABC» und die Neuberechnung aus dem
    RM-Blatt; Wertbasis der beiden Blätter unterschiedlich und nicht aufklärbar."""
    lf = lf.sort_values("volumen", ascending=False)
    x1 = np.arange(1, len(lf) + 1) / len(lf)
    y1 = (lf["volumen"].cumsum() / lf["volumen"].sum()).values
    x2 = np.arange(1, len(v) + 1) / len(v)
    nA = (lf["abc_datei"] == "A").sum()
    nB = (lf["abc_datei"] == "B").sum()
    fig, ax = plt.subplots(figsize=(6.3, 3.4))
    ax.plot(x1, y1, color=BLAU, lw=2, label=f"Blatt «Vendors + ABC» (n = {len(lf)})")
    ax.plot(x2, v["kumuliert"].values, color=ORANGE, lw=2, ls="--",
            label=f"Neuberechnung aus RM-Blatt (n = {len(v)})")
    ax.plot([0, 1], [0, 1], color=GRAU, lw=1, ls=":", label="Gleichverteilung")
    for n in (nA, nA + nB):
        ax.axvline(n / len(lf), color=TEXT2, lw=0.8, ls="--")
    ax.text(nA / len(lf) + 0.01, 0.42, f"{nA} A-Lieferanten\n({pct(nA / len(lf))})\n= 70 % des Wertes",
            fontsize=8)
    ax.text((nA + nB) / len(lf) + 0.01, 0.62,
            f"{len(lf) - nA - nB} C-Lieferanten ({pct((len(lf) - nA - nB) / len(lf))})\n= 10 % des Wertes",
            fontsize=8)
    ax.set_xlim(0, 1)
    ax.set_ylim(0, 1.02)
    ax.xaxis.set_major_formatter(PROZENT)
    ax.yaxis.set_major_formatter(PROZENT)
    ax.set_xlabel("Anteil der Lieferanten (absteigend nach Einkaufsvolumen)")
    ax.set_ylabel("kumulierter Wertanteil")
    ax.grid(axis="y", color=GITTER, lw=0.6)
    ax.legend(loc="lower right", frameon=False, fontsize=8)
    fig.tight_layout(rect=(0, 0, 1, 1))
    quelle(fig)
    fig.savefig(pfad)
    plt.close(fig)


def abb_bestand(b: pd.DataFrame, pfad: Path) -> None:
    fig, ax = plt.subplots(figsize=(6.3, 2.5))
    kl = ["A", "B", "C"]
    y = np.arange(2)[::-1]
    for zeile, spalte in zip(y, ["bestand_ist", "bestand_soll"]):
        links = 0.0
        for k in kl:
            w = b.loc[k, spalte] / b.loc["Total", "bestand_ist"]
            ax.barh(zeile, w, left=links, color=KLASSENFARBE[k], height=0.55,
                    edgecolor="white", linewidth=1.5, label=f"Klasse {k}" if zeile == y[0] else None)
            if w > 0.06:
                ax.text(links + w / 2, zeile, pct(w, 0), ha="center", va="center",
                        color="white", fontsize=8, weight="bold")
            links += w
        ax.text(links + 0.01, zeile, f"{pct(links, 0)}", va="center", fontsize=8.5, weight="bold")
    ax.set_yticks(y, ["Ist", "Soll (Szenario)"])
    ax.set_xlim(0, 1.1)
    ax.set_xticks([0, 0.25, 0.5, 0.75, 1])
    ax.xaxis.set_major_formatter(PROZENT)
    ax.set_xlabel("Losgrössenbestand, Ist = 100 %")
    ax.legend(ncol=3, loc="upper center", bbox_to_anchor=(0.5, -0.32), frameon=False, fontsize=8)
    ax.spines["left"].set_visible(False)
    ax.tick_params(axis="y", length=0)
    fig.tight_layout(rect=(0, 0, 1, 1))
    quelle(fig)
    fig.savefig(pfad)
    plt.close(fig)


# --------------------------------------------------------------------------
# Hauptprogramm
# --------------------------------------------------------------------------

def main() -> None:
    pfad = Path(sys.argv[1]) if len(sys.argv) > 1 else STANDARD_XLS
    AUS.mkdir(exist_ok=True)
    ABB.mkdir(exist_ok=True)
    rm, lf, _, notizen = einlesen(pfad)
    bericht: list[str] = ["ABC-Analyse Grofu AG – Bericht (erzeugt von analyse/abc_analyse.py)", ""]
    bericht += ["1. Datenbeschreibung", f"Datei: {pfad.name}",
                "Blätter: 'RM + ABC' (Rohmaterialien), 'Vendors + ABC' (Lieferanten), 'Tabelle3' (leer)",
                "Spalten RM: Materialnr., Wertanteil ('% of Sales'), kumuliert, ABC, Lieferant, "
                "Lieferanten-ABC, Bestellungen p. a., EDI-Fähigkeit, Stück p. a., Herkunft",
                "Materialarten: nur Rohmaterial (RM); SFG/FG und Lagerort sind nicht enthalten."]
    bericht += notizen + [""]

    # Datenqualität
    dq = datenqualitaet(rm, lf)
    dq.to_csv(AUS / "datenqualitaet.csv", sep=";", index=False)
    bericht += ["2. Datenqualität"] + [f"- {r['Prüfung']}: {r['Ergebnis']} ({r['Bewertung']})"
                                       for _, r in dq.iterrows()] + [""]

    # ABC Material
    rm["abc"] = klassieren(rm["anteil"], GRENZEN)
    rm["abc_8015"] = klassieren(rm["anteil"], GRENZEN_SENS)
    tab = klassen_tabelle(rm)
    tab.to_csv(AUS / "abc_klassen.csv", sep=";", float_format="%.6g")
    sens = klassen_tabelle(rm, "abc_8015")[["materialien", "anteil_materialien", "wertanteil"]]
    sens.to_csv(AUS / "abc_sensitivitaet_80-15-5.csv", sep=";", float_format="%.6g")
    bericht += ["3. ABC-Analyse Rohmaterial (Grenzen 70/20/10 % des Wertes)"]
    for k in ["A", "B", "C", "Total"]:
        t = tab.loc[k]
        bericht.append(
            f"- {k}: {zahl(t.materialien)} Materialien ({pct(t.anteil_materialien)}), "
            f"Wert {pct(t.wertanteil)}, Bestellungen {zahl(t.bestellungen)} ({pct(t.anteil_bestellungen)}), "
            f"Ø {t.bestellungen_je_material:.2f} Bestellungen/Material, Stück {t.stueck / 1e9:.3f} Mrd. "
            f"({pct(t.anteil_stueck, 2)}), Lieferanten {int(t.lieferanten)}, Overseas-Materialien {int(t.overseas)}")
    bericht.append("Sensitivität 80/15/5: " + ", ".join(
        f"{k} {zahl(sens.loc[k, 'materialien'])} ({pct(sens.loc[k, 'anteil_materialien'])})"
        for k in ["A", "B", "C"]))
    bericht.append("")

    # Herkunft
    herk = rm.groupby("herkunft").agg(Materialien=("rm", "size"), Einkaufswert=("anteil", "sum"),
                                      Bestellungen=("bestellungen", "sum"), Stückzahl=("stueck", "sum"))
    v = lieferanten_abc(rm)
    herk["Lieferanten"] = v.groupby("herkunft").size()
    herk_abs = herk.copy()
    herk = herk / herk.sum()
    herk_abs.join(herk.add_suffix(" (Anteil)")).to_csv(AUS / "abc_herkunft.csv", sep=";", float_format="%.6g")
    abc_herk = pd.crosstab(rm["abc"], rm["herkunft"], values=rm["anteil"], aggfunc="sum").fillna(0)
    abc_herk_n = pd.crosstab(rm["abc"], rm["herkunft"])
    abc_herk_n.join(abc_herk, lsuffix=" Materialien", rsuffix=" Wertanteil").to_csv(
        AUS / "abc_x_herkunft.csv", sep=";", float_format="%.6g")
    bericht += ["4. Herkunft (Local = Indien, Overseas = Import über Lager 4 Karatschi)"]
    for h in ["Local", "Overseas"]:
        bericht.append(f"- {h}: " + ", ".join(
            f"{c} {zahl(herk_abs.loc[h, c]) if c != 'Einkaufswert' else ''}({pct(herk.loc[h, c])})"
            for c in herk.columns))
    bericht.append(f"- Overseas-Materialien nach Klasse: {abc_herk_n['Overseas'].to_dict()}")
    edi = rm.groupby("edi").agg(n=("rm", "size"), w=("anteil", "sum"))
    bericht.append(f"- EDI-fähige Lieferanten: {pct(edi.loc['Y', 'n'] / len(rm))} der Materialien, "
                   f"{pct(edi.loc['Y', 'w'])} des Wertes")
    bericht.append("")

    # Lieferanten
    v.to_csv(AUS / "lieferanten_abc.csv", sep=";", float_format="%.6g")
    lk = v.groupby("abc").agg(lieferanten=("wertanteil", "size"), wertanteil=("wertanteil", "sum"),
                              materialien=("materialien", "sum"), bestellungen=("bestellungen", "sum"))
    lk["anteil_lieferanten"] = lk["lieferanten"] / lk["lieferanten"].sum()
    lk.to_csv(AUS / "lieferanten_klassen.csv", sep=";", float_format="%.6g")
    bericht += ["5. Lieferanten-ABC – Neuberechnung aus RM-Daten (nur Plausibilitätsprüfung, 70/20/10)"]
    for k, t in lk.iterrows():
        bericht.append(f"- {k}: {int(t.lieferanten)} Lieferanten ({pct(t.anteil_lieferanten)}), "
                       f"Wert {pct(t.wertanteil)}, Materialien {zahl(t.materialien)}, "
                       f"Bestellungen {zahl(t.bestellungen)}")
    bericht.append(f"- Lieferanten mit nur 1 Materialnummer: {(v['materialien'] == 1).sum()}; "
                   f"mit Wertanteil < 0.01 %: {(v['wertanteil'] < 1e-4).sum()}")
    lf_k = lf.groupby("abc_datei").size().to_dict()
    lf_w = (lf.groupby("abc_datei")["volumen"].sum() / lf["volumen"].sum()).round(3).to_dict()
    bericht.append(f"- Lesart Lieferantenblatt 'Vendors + ABC' ({len(lf)} Lieferanten, andere Wertbasis): "
                   f"Anzahl {lf_k}, Wertanteil {lf_w}")
    lf.to_csv(AUS / "lieferanten_abc_datei.csv", sep=";", index=False, float_format="%.6g")
    bericht.append(f"- Overseas-Lieferanten: {(v['herkunft'] == 'Overseas').sum()} von {len(v)}")
    bericht.append("")

    # Bestellhäufigkeit (Ersatz-XYZ)
    rm["freq"] = freq_klasse(rm["bestellungen"])
    m_n = pd.crosstab(rm["abc"], rm["freq"]).reindex(columns=FREQ_KLASSEN, fill_value=0)
    m_w = pd.crosstab(rm["abc"], rm["freq"], values=rm["anteil"], aggfunc="sum").reindex(
        columns=FREQ_KLASSEN).fillna(0)
    m_n.join(m_w, lsuffix=" Materialien", rsuffix=" Wertanteil").to_csv(
        AUS / "abc_x_bestellhaeufigkeit.csv", sep=";", float_format="%.6g")
    bericht += ["6. ABC × Bestellhäufigkeit p. a. (Hilfsgrösse, keine XYZ-Analyse)",
                "Materialien:", m_n.to_string(), "Wertanteil:", m_w.round(4).to_string(), ""]

    # Bestandsmodell
    ziel = {"A": 24, "B": 12, "C": None}  # Soll: A zweiwöchentlich, B monatlich, C wie Ist
    b = bestandsmodell(rm, ziel)
    b.to_csv(AUS / "bestand_szenario.csv", sep=";", float_format="%.6g")
    bericht += ["7. Bestandsmodell (Losgrössenbestand = Jahreswert / (2 × Anlieferungen); "
                "Soll: A mind. 24, B mind. 12 Anlieferungen p. a., C unverändert)"]
    for k, t in b.iterrows():
        bericht.append(f"- {k}: Bestand Ist {pct(t.bestand_ist, 2)} des Jahresvolumens "
                       f"(Anteil am Gesamtbestand {pct(t.anteil_am_gesamtbestand_ist)}), "
                       f"Reichweite Ist {t.reichweite_ist_at:.0f} AT -> Soll {t.reichweite_soll_at:.0f} AT, "
                       f"Umschlag {t.umschlag_ist:.1f} -> {t.umschlag_soll:.1f}, Senkung {pct(t.senkung)}")
    # Varianten zur Einordnung
    for name, z in [("A 12 / B 6", {"A": 12, "B": 6}), ("A 52 / B 12", {"A": 52, "B": 12}),
                    ("A 24 / B 12 / C 4", {"A": 24, "B": 12, "C": 4})]:
        bericht.append(f"- Variante {name}: Senkung {pct(bestandsmodell(rm, z).loc['Total', 'senkung'])}")
    # Zielkonflikt: mehr Anlieferungen (Transport/Handling) gegen weniger Losgrössenbestand
    anl_soll = rm.apply(lambda r: max(r["bestellungen"], ziel.get(r["abc"]) or 0), axis=1)
    anl = pd.DataFrame({"ist": rm.groupby("abc")["bestellungen"].sum(),
                        "soll": anl_soll.groupby(rm["abc"]).sum()})
    bericht.append(f"- Anlieferungen p. a. Ist -> Soll (A >= 24, B >= 12): {anl.astype(int).to_dict('index')}, "
                   f"total {int(anl['ist'].sum())} -> {int(anl['soll'].sum())}")
    # Übertrag auf den Gesamtbestand: Der Losgrössenbestand ist nur ein Teil des
    # Bestands (daneben Sicherheits-, Puffer- und Überbestände, z. B. in Lager 2).
    # Sein Anteil ist in den Daten nicht enthalten -> ANNAHME, als Bandbreite.
    varianten = {"konservativ (A 12 / B 6)": {"A": 12, "B": 6}, "Szenario (A 24 / B 12)": ziel}
    sens_b = pd.DataFrame(
        {name: {f"{int(a * 100)} %": a * bestandsmodell(rm, z).loc["Total", "senkung"]
                for a in (0.3, 0.4, 0.5, 0.6)} for name, z in varianten.items()})
    sens_b.index.name = "Anteil Losgrössenbestand am Gesamtbestand (Annahme)"
    sens_b.to_csv(AUS / "bestand_sensitivitaet.csv", sep=";", float_format="%.4f")
    bericht += ["- Senkung des GESAMTbestands (Annahme: Anteil Losgrössenbestand am Gesamtbestand):",
                sens_b.map(lambda x: pct(x, 0)).to_string()]
    # Bestandsbrücke in % des Jahresvolumens: nur der Losgrössenbestand sinkt; der übrige
    # Bestand (Sicherheits-, Puffer-, Prozessbestand inkl. Lager 2) bleibt unverändert,
    # damit nichts doppelt angerechnet wird. Untergrenze = konservativ bei 40 %,
    # Obergrenze = Szenario bei 50 % Losgrössenanteil (Annahme A21).
    bruecke = {}
    for fall, anteil, z in [("Untergrenze", 0.4, varianten["konservativ (A 12 / B 6)"]),
                            ("Obergrenze", 0.5, ziel)]:
        bm = bestandsmodell(rm, z).loc["Total"]
        gesamt_ist = bm["bestand_ist"] / anteil
        gesamt_soll = gesamt_ist - (bm["bestand_ist"] - bm["bestand_soll"])
        bruecke[fall] = {"anteil_losgroesse": anteil, "losgroesse_ist": bm["bestand_ist"],
                         "losgroesse_soll": bm["bestand_soll"], "uebriger_bestand": gesamt_ist - bm["bestand_ist"],
                         "gesamt_ist": gesamt_ist, "gesamt_soll": gesamt_soll,
                         "index_soll": 100 * gesamt_soll / gesamt_ist, "senkung": 1 - gesamt_soll / gesamt_ist,
                         "umschlag_ist": 1 / gesamt_ist, "umschlag_soll": 1 / gesamt_soll}
    bruecke = pd.DataFrame(bruecke)
    bruecke.index.name = "Grösse (Bestände in Anteil Jahresvolumen)"
    bruecke.to_csv(AUS / "bestand_bruecke.csv", sep=";", float_format="%.4f")
    bericht += ["- Bestandsbrücke (Untergrenze konservativ/40 %, Obergrenze Szenario/50 %):", bruecke.to_string()]
    bericht.append("")

    # Abbildungen
    abb_lorenz(rm, ABB / "abb-abc-lorenzkurve.png")
    abb_klassenprofil(tab, ABB / "abb-abc-klassenprofil.png")
    abb_herkunft(herk, ABB / "abb-abc-herkunft.png")
    abb_matrix(m_n, m_w, ABB / "abb-abc-bestellhaeufigkeit-matrix.png")
    abb_lieferanten(lf, v, ABB / "abb-lieferanten-abc.png")
    abb_bestand(b, ABB / "abb-bestand-szenario.png")

    # Verbindliche Zahlenbasis für alle Kapitel (PLAN.md §6): analyse/kennzahlen.csv
    Q = "Daten-ABC-Analyse-Grofu.xls, eigene Berechnung"
    kz = []

    def k(bereich, name, wert, einheit, berechnung, quelle=Q):
        kz.append({"Bereich": bereich, "Kennzahl": name,
                   "Wert": round(float(wert), 4) if not isinstance(wert, str) else wert,
                   "Einheit": einheit, "Berechnung": berechnung, "Quelle": quelle})

    T = tab.loc["Total"]
    k("Daten", "Rohmaterialien (RM-Positionen)", T.materialien, "Anzahl", "Datenzeilen ohne Summenzeilen")
    k("Daten", "Bestellungen p. a. total", T.bestellungen, "Anzahl", "Summe Spalte Number of Orders")
    k("Daten", "Stückzahl p. a. total", T.stueck, "Stück", "Summe Purchased Number of Pieces p.a.")
    k("Daten", "Lieferanten im RM-Blatt", T.lieferanten, "Anzahl", "eindeutige Vendor-Nummern")
    k("Daten", "Lieferanten im Blatt Vendors + ABC", len(lf), "Anzahl", "Zeilen Lieferantenblatt")
    for kl in ["A", "B", "C"]:
        t = tab.loc[kl]
        k("ABC Material", f"{kl}: Materialien", t.materialien, "Anzahl", "Grenzen 70/90 % kumuliert")
        k("ABC Material", f"{kl}: Anteil Materialien", t.anteil_materialien, "Anteil", "Materialien / total")
        k("ABC Material", f"{kl}: Wertanteil", t.wertanteil, "Anteil", "Summe % of Sales")
        k("ABC Material", f"{kl}: Anteil Bestellungen", t.anteil_bestellungen, "Anteil", "Bestellungen / total")
        k("ABC Material", f"{kl}: Bestellungen je Material p. a.", t.bestellungen_je_material, "Anzahl",
          "Bestellungen / Materialien")
        k("ABC Material", f"{kl}: Anteil Stückzahl", t.anteil_stueck, "Anteil", "Stück / total")
        k("ABC Material", f"{kl}: Lieferanten", t.lieferanten, "Anzahl", "eindeutige Vendor-Nummern")
    for kl in ["A", "B", "C"]:
        k("Sensitivität 80/15/5", f"{kl}: Materialien", sens.loc[kl, "materialien"], "Anzahl",
          "Grenzen 80/95 % kumuliert")
    for kl in ["A", "B", "C"]:
        n = int((lf["abc_datei"] == kl).sum())
        k("ABC Lieferanten (Lieferantenblatt)", f"{kl}: Lieferanten", n, "Anzahl", "Spalte ABC im Blatt Vendors + ABC")
        k("ABC Lieferanten (Lieferantenblatt)", f"{kl}: Anteil Lieferanten", n / len(lf), "Anteil", "n / 620")
        k("ABC Lieferanten (Lieferantenblatt)", f"{kl}: Wertanteil",
          lf.loc[lf["abc_datei"] == kl, "volumen"].sum() / lf["volumen"].sum(), "Anteil", "Sales / total")
    for kl in ["A", "B", "C"]:
        k("ABC Lieferanten (Prüfung RM-Blatt)", f"{kl}: Lieferanten", lk.loc[kl, "lieferanten"], "Anzahl",
          "Neuberechnung aus RM-Wertanteilen, 70/90 %")
        k("ABC Lieferanten (Prüfung RM-Blatt)", f"{kl}: Wertanteil", lk.loc[kl, "wertanteil"], "Anteil",
          "Neuberechnung aus RM-Wertanteilen")
    k("Lieferanten", "Lieferanten mit nur 1 Materialnummer", (v["materialien"] == 1).sum(), "Anzahl", "RM-Blatt")
    k("Lieferanten", "Lieferanten mit Wertanteil < 0.01 %", (v["wertanteil"] < 1e-4).sum(), "Anzahl", "RM-Blatt")
    for h in ["Local", "Overseas"]:
        for c, e in [("Materialien", "Anzahl"), ("Bestellungen", "Anzahl"), ("Stückzahl", "Stück"),
                     ("Lieferanten", "Anzahl")]:
            k("Herkunft", f"{h}: {c}", herk_abs.loc[h, c], e, "RM-Blatt, Spalte Origin")
        for c in ["Materialien", "Einkaufswert", "Bestellungen", "Stückzahl", "Lieferanten"]:
            k("Herkunft", f"{h}: Anteil {c}", herk.loc[h, c], "Anteil", "Anteil am Total")
    k("Herkunft", "Overseas-Materialien in Klasse A", abc_herk_n.loc["A", "Overseas"], "Anzahl", "ABC × Origin")
    k("Herkunft", "Overseas-Materialien in Klasse C", abc_herk_n.loc["C", "Overseas"], "Anzahl", "ABC × Origin")
    k("EDI", "EDI-fähig: Anteil Materialien", edi.loc["Y", "n"] / len(rm), "Anteil", "Vendor EDI Ability = Y")
    k("EDI", "EDI-fähig: Anteil Wert", edi.loc["Y", "w"], "Anteil", "Vendor EDI Ability = Y")
    for f_ in FREQ_KLASSEN:
        k("Bestellhäufigkeit", f"Materialien mit {f_} Bestellungen p. a.", m_n[f_].sum(), "Anzahl",
          "Hilfsgrösse statt XYZ")
    for kl in ["A", "B", "C", "Total"]:
        t = b.loc[kl]
        k("Bestandsmodell", f"{kl}: Losgrössenbestand Ist", t.bestand_ist, "Anteil Jahresvolumen",
          "Σ Wertanteil / (2 × Bestellungen)", Q + ", Annahme A20")
        k("Bestandsmodell", f"{kl}: Reichweite Ist", t.reichweite_ist_at, "AT", "Bestand / Wert × 280 AT",
          Q + ", Annahme A20")
        k("Bestandsmodell", f"{kl}: Umschlag Ist", t.umschlag_ist, "pro Jahr", "Wert / Bestand", Q + ", Annahme A20")
        k("Bestandsmodell", f"{kl}: Reichweite Soll (A ≥ 24, B ≥ 12 Abrufe)", t.reichweite_soll_at, "AT",
          "wie Ist mit Soll-Abrufen", Q + ", Annahme A20")
        k("Bestandsmodell", f"{kl}: Umschlag Soll", t.umschlag_soll, "pro Jahr", "Wert / Bestand Soll",
          Q + ", Annahme A20")
        k("Bestandsmodell", f"{kl}: Senkung Losgrössenbestand", t.senkung, "Anteil", "1 − Soll/Ist",
          Q + ", Annahme A20")
    k("Bestandsmodell", "A: Anteil am Losgrössenbestand Ist", b.loc["A", "anteil_am_gesamtbestand_ist"],
      "Anteil", "Bestand A / Bestand total", Q + ", Annahme A20")
    k("Bestandsmodell", "Senkung Losgrössenbestand konservativ (A 12 / B 6)",
      bestandsmodell(rm, {"A": 12, "B": 6}).loc["Total", "senkung"], "Anteil", "1 − Soll/Ist",
      Q + ", Annahme A20")
    for kl in ("A", "B"):
        k("Bestandsmodell", f"{kl}: Anlieferungen p. a. Ist", anl.loc[kl, "ist"], "Anzahl",
          "Summe Bestellungen (eine Anlieferung je Bestellung)", Q + ", Annahme A20")
        k("Bestandsmodell", f"{kl}: Anlieferungen p. a. Soll (A ≥ 24, B ≥ 12)", anl.loc[kl, "soll"], "Anzahl",
          "Summe max(Bestellungen, Mindestabrufe)", Q + ", Annahme A20")
    for anteil in sens_b.index:
        for var in sens_b.columns:
            k("Bestandsmodell", f"Senkung Gesamtbestand, {var}, Losgrössenanteil {anteil}",
              sens_b.loc[anteil, var], "Anteil", "Losgrössenanteil × Senkung Losgrössenbestand",
              Q + ", Annahmen A20/A21")
    fall = fallstudie_kennzahlen.berechnen({
        "stueck_pa": T.stueck, "bestellungen_overseas": herk_abs.loc["Overseas", "Bestellungen"],
        "anteil_stueck_c": tab.loc["C", "anteil_stueck"]})
    fallstudie_kennzahlen.schreiben()
    for z in fall:
        z = dict(z)
        z["Quelle"] = z["Quelle"].replace("Fallstudie", "HWZ, o. J.,")
        kz.append(z)
    pd.DataFrame(kz).to_csv(AUS / "kennzahlen.csv", sep=";", index=False)

    (AUS / "abc_bericht.txt").write_text("\n".join(bericht) + "\n", encoding="utf-8")
    print("\n".join(bericht))


if __name__ == "__main__":
    main()
