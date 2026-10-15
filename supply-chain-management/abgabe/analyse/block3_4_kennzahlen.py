"""Berechnungen für Block 3 (Produktionslogistik) und Block 4 (Lagerlogistik).

Aufruf (aus dem Ordner leistungsnachweis-grofu/):
    python analyse/block3_4_kennzahlen.py

Liest material/Daten-ABC-Analyse-Grofu.xls (Blatt «RM + ABC») und schreibt
    analyse/block3_nutzwertanalyse.csv
    analyse/block3_lieferzeitmodell.csv
    analyse/block4_lagervarianten.csv
    analyse/block4_kommissioniervarianten.csv
    analyse/block4_kennzahlen.csv
Alle Fallstudienwerte sind unten als Konstanten mit Seitenangabe hinterlegt,
eigene Annahmen sind als ANNAHME markiert.
"""

from pathlib import Path

import pandas as pd

BASIS = Path(__file__).resolve().parent.parent
XLS = BASIS / "material" / "Daten-ABC-Analyse-Grofu.xls"
OUT = BASIS / "analyse"

# --- Fallstudie (HWZ, o. J.) -------------------------------------------------
TEILE_PRO_JAHR = 14e9          # S. 6: Durchsatz 14 Mrd. Teile/Jahr
PICKFAKTOR = 1_000             # S. 6: 1 Pick = Ø 1'000 Teile
PICKS_HOCHLEISTUNG = 500       # S. 6: Picks pro Person und Schicht
ARBEITSTAGE = 280              # S. 6: Arbeitstage Indien
PERSONAL_IST = 600             # S. 6: Ist-Personal Kommissionierung
PALETTENPLAETZE_L1 = 12_000    # S. 3
BEHAELTER_L1 = 30_000          # S. 3
L2_SOLL_AT = 3                 # S. 3: Soll-Reichweite Lager 2
L1_L2_TRANSFER_AT = 2          # S. 3: Auslagerung, Shuttle, Einlagerung
SENDUNGEN_L4_TAG = 400         # S. 4
BESTANDSSENKUNG = (0.30, 0.40)  # S. 5
LIEFERTREUE_IST = 0.55         # S. 6

# --- Eigene Annahmen ---------------------------------------------------------
AT_PRO_WOCHE = ARBEITSTAGE / 52
# ANNAHME (abgestimmt mit Aufgabe 2): «mehrere Wochen» = 2 bis 4 Wochen
L2_IST_AT_SPANNE = (2 * AT_PRO_WOCHE, 4 * AT_PRO_WOCHE)   # 10,8 bis 21,5 AT
UMSCHLAG_GESAMT_IST = 3.5      # aus Ist-Analyse Aufgabe 2 (Reichweite Ø 79 AT)
SUPERMARKT_AT = 1              # ANNAHME: Linienpuffer Supermarkt max. 1 AT


def abc_daten():
    """ABC-Blatt laden; die 3 Summen-/Leerzeilen am Blattende werden entfernt."""
    roh = pd.read_excel(XLS, sheet_name="RM + ABC").iloc[:, :10]
    roh.columns = ["rm", "anteil", "kum", "abc", "lieferant", "lief_abc",
                   "bestellungen", "edi", "stueck", "herkunft"]
    gueltig = roh[roh["lieferant"].notna() & roh["abc"].isin(["A", "B", "C"])]
    return roh, gueltig


def nutzwertanalyse():
    """Block 3: Ablaufprinzip je Segment (Review Cosmo: keine «Hybrid»-Variante,
    die Kombination ist das Ergebnis). Punkte 1 (schlecht) bis 5 (sehr gut) nach
    den Merkmalen in Hutzler & Fuchs (2021, S. 44-47)."""
    segmente = {
        "Anlagenbau-Module (Einzel-/Kleinserie, MtO/ATO)": (
            {"Durchlaufzeit/Liefertreue": 0.40, "Variantenflexibilität": 0.35,
             "Qualität": 0.15, "Investition": 0.10},
            {"Werkstatt": [1, 5, 3, 5], "Insel/Montagezelle": [4, 4, 4, 3],
             "Fliess/Takt": [5, 1, 5, 1]}),
        "Endgeräte Eigenlabel/OEM (Grossserie, MtS bzw. Abruf)": (
            {"Produktivität/Automatisierung": 0.35, "Durchlaufzeit": 0.25,
             "Bestand/Kapitalbedarf": 0.20, "Investition": 0.20},
            {"Werkstatt": [2, 1, 1, 5], "Insel/Montagezelle": [3, 4, 4, 3],
             "Fliess/Takt": [5, 5, 4, 1]}),
        "SFG neues Werk (Serien-/Sortenfertigung, Teilefamilien)": (
            {"Durchlaufzeit": 0.30, "Bestand/Kapitalbedarf": 0.25,
             "Teilefamilien-Flexibilität": 0.25, "Qualität": 0.20},
            {"Werkstatt": [1, 1, 5, 3], "Insel/Montagezelle": [4, 4, 4, 4],
             "Fliess/Takt": [5, 4, 1, 5]}),
    }
    zeilen = []
    for segment, (kriterien, punkte) in segmente.items():
        gewichte = list(kriterien.values())
        for variante, p in punkte.items():
            zeilen.append({"Segment": segment, "Variante": variante,
                           "Kriterien": "; ".join(f"{k} {int(g * 100)} %" for k, g in kriterien.items()),
                           "Punkte": " / ".join(map(str, p)),
                           "Nutzwert": round(sum(g * x for g, x in zip(gewichte, p)), 2),
                           "Sensitivität gleiche Gewichte": round(sum(p) / len(p), 2)})
    df = pd.DataFrame(zeilen)
    df.to_csv(OUT / "block3_nutzwertanalyse.csv", index=False)
    return df


def lieferzeitmodell():
    """Grobe Modellrechnung Lieferzeit Anlagenbau (Annahmen A18, A19)."""
    endmontage, transport, sfg_fertigung = 2, 2, 3          # AT, Annahme A18
    vorlauf = (L1_L2_TRANSFER_AT + L2_IST_AT_SPANNE[0], L1_L2_TRANSFER_AT + L2_IST_AT_SPANNE[1])
    ohne_fehlteil = endmontage + transport
    mit_fehlteil = tuple(v + sfg_fertigung + endmontage + transport for v in vorlauf)
    zeilen = []
    for anteil in (0.45, 0.20):                             # Annahme A19
        ist = tuple((1 - anteil) * ohne_fehlteil + anteil * m for m in mit_fehlteil)
        soll = ohne_fehlteil
        zeilen.append({"Anteil Aufträge mit fehlendem SFG": anteil,
                       "Ist von (AT)": round(ist[0], 1), "Ist bis (AT)": round(ist[1], 1),
                       "Soll (AT)": soll,
                       "Verkürzung von": round(1 - soll / ist[0], 2),
                       "Verkürzung bis": round(1 - soll / ist[1], 2)})
    df = pd.DataFrame(zeilen)
    df.to_csv(OUT / "block3_lieferzeitmodell.csv", index=False)
    return df


def lagervarianten():
    """Block 4: Varianten der Lagerstruktur, gleiche Skala 1-5."""
    kriterien = {
        "Bestand/Lagerumschlag": 0.25,
        "Fläche": 0.20,
        "Durchlaufzeit": 0.25,
        "Versorgungssicherheit": 0.15,
        "Investition/Umsetzung": 0.15,
    }
    punkte = {
        "L1 Zweistufig, Lager 2 auf Soll begrenzt": [2, 2, 2, 4, 5],
        "L2 Einstufig: Zentrallager + Supermarkt": [5, 5, 5, 4, 3],
        "L3 Fremdlager/3PL für Lager 1": [3, 4, 3, 2, 2],
    }
    gewichte = list(kriterien.values())
    df = pd.DataFrame([
        {"Variante": v, **dict(zip(kriterien, p)),
         "Nutzwert": round(sum(g * x for g, x in zip(gewichte, p)), 2),
         "Sensitivität gleiche Gewichte": round(sum(p) / len(p), 2)}
        for v, p in punkte.items()
    ])
    df.to_csv(OUT / "block4_lagervarianten.csv", index=False)
    return df


def kommissioniervarianten():
    """Block 4: Kommissionierung Eigenbetrieb vs. 3PL (Make-or-Buy, Skript S. 60)."""
    kriterien = {
        "Personalbedarf/Produktivität": 0.25,
        "Integration in Pull-Steuerung": 0.25,
        "Kapitalbedarf": 0.15,
        "Flexibilität (Menge/Varianten)": 0.15,
        "Abhängigkeit/Know-how-Risiko": 0.20,
    }
    punkte = {
        "K1 Mann-zur-Ware manuell (Ist, Eigenbetrieb)": [1, 2, 5, 4, 4],
        "K2 Ware-zur-Person automatisiert, Eigenbetrieb": [5, 5, 2, 3, 4],
        "K3 Ware-zur-Person, Betrieb durch 3PL": [5, 3, 4, 3, 2],
    }
    gewichte = list(kriterien.values())
    df = pd.DataFrame([
        {"Variante": v, **dict(zip(kriterien, p)),
         "Nutzwert": round(sum(g * x for g, x in zip(gewichte, p)), 2),
         "Sensitivität gleiche Gewichte": round(sum(p) / len(p), 2)}
        for v, p in punkte.items()
    ])
    df.to_csv(OUT / "block4_kommissioniervarianten.csv", index=False)
    return df


def kennzahlen(gueltig, roh):
    picks = TEILE_PRO_JAHR / PICKFAKTOR
    manntage = picks / PICKS_HOCHLEISTUNG
    personal_soll = manntage / ARBEITSTAGE
    leistung_ist = picks / (PERSONAL_IST * ARBEITSTAGE)

    umschlag = lambda at: ARBEITSTAGE / at  # Umschlag = AT/Jahr ÷ Reichweite

    stueck_summe = roh["stueck"].max()  # Summenzeile am Blattende
    n = len(gueltig)
    abc = gueltig.groupby("abc").agg(pos=("rm", "count"),
                                     wert=("anteil", "sum"),
                                     bestellungen=("bestellungen", "sum"),
                                     stueck=("stueck", "sum"))
    werte = {
        "Picks pro Jahr": picks,
        "Manntage Hochleistungssystem": manntage,
        "Personal Soll Kommissionierung": personal_soll,
        "Picks pro Person und Tag (Ist)": leistung_ist,
        "Personalfreisetzung Kommissionierung": PERSONAL_IST - personal_soll,
        "Lagerumschlag Lager 2 Ist, Spanne von": umschlag(L2_IST_AT_SPANNE[1]),
        "Lagerumschlag Lager 2 Ist, Spanne bis": umschlag(L2_IST_AT_SPANNE[0]),
        "Lagerumschlag Lager 2 Soll (3 AT)": umschlag(L2_SOLL_AT),
        "Lagerumschlag Supermarkt Ziel (1 AT)": umschlag(SUPERMARKT_AT),
        "Bestandsabbau Lager 2 auf 3 AT, von": 1 - L2_SOLL_AT / L2_IST_AT_SPANNE[0],
        "Bestandsabbau Lager 2 auf 3 AT, bis": 1 - L2_SOLL_AT / L2_IST_AT_SPANNE[1],
        "Gesamtumschlag Ziel bei -30 % Bestand": UMSCHLAG_GESAMT_IST / 0.70,
        "Gesamtumschlag Ziel bei -40 % Bestand": UMSCHLAG_GESAMT_IST / 0.60,
        "Steigerung Gesamtumschlag bei -30 % Bestand": 1 / (1 - BESTANDSSENKUNG[0]) - 1,
        "Steigerung Gesamtumschlag bei -40 % Bestand": 1 / (1 - BESTANDSSENKUNG[1]) - 1,
        "Materialvorlauf Ist ab Lager 1, von (AT)": L1_L2_TRANSFER_AT + L2_IST_AT_SPANNE[0],
        "Materialvorlauf Ist ab Lager 1, bis (AT)": L1_L2_TRANSFER_AT + L2_IST_AT_SPANNE[1],
        "Verkürzung Material-DLZ auf 1 AT, von": 1 - SUPERMARKT_AT / (L1_L2_TRANSFER_AT + L2_IST_AT_SPANNE[0]),
        "Verkürzung Material-DLZ auf 1 AT, bis": 1 - SUPERMARKT_AT / (L1_L2_TRANSFER_AT + L2_IST_AT_SPANNE[1]),
        "Rohmaterialien (bereinigt)": n,
        "Stück pro Jahr laut Summenzeile": stueck_summe,
        "Bestellungen gesamt": abc["bestellungen"].sum(),
    }
    for k in "ABC":
        werte[f"{k}: Positionen"] = abc.loc[k, "pos"]
        werte[f"{k}: Anteil Positionen"] = abc.loc[k, "pos"] / n
        werte[f"{k}: Anteil Wert"] = abc.loc[k, "wert"]
        werte[f"{k}: Anteil Stück"] = abc.loc[k, "stueck"] / abc["stueck"].sum()
        werte[f"{k}: Anteil Bestellungen"] = abc.loc[k, "bestellungen"] / abc["bestellungen"].sum()
    df = pd.DataFrame({"Kennzahl": werte.keys(), "Wert": werte.values()})
    df.to_csv(OUT / "block4_kennzahlen.csv", index=False)
    return df


if __name__ == "__main__":
    roh, gueltig = abc_daten()
    print(f"Datenbereinigung: {len(roh)} Zeilen gelesen, {len(gueltig)} gültige Rohmaterialien")
    pd.set_option("display.width", 200)
    print(nutzwertanalyse().to_string(index=False))
    print(lieferzeitmodell().to_string(index=False))
    print(lagervarianten().to_string(index=False))
    print(kommissioniervarianten().to_string(index=False))
    print(kennzahlen(gueltig, roh).to_string(index=False))
