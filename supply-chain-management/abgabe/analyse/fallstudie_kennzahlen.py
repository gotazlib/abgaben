#!/usr/bin/env python3
"""Kennzahlen-Rechnungen aus der Fallstudie Grofu AG (Business Case V 3.0).

Aufruf (aus dem Ordner leistungsnachweis-grofu/):
    python analyse/fallstudie_kennzahlen.py

Nur Standardbibliothek. Schreibt analyse/kennzahlen_fallstudie.csv und gibt
die Rechnungen aus. Jede Zeile nennt Formel und Quelle; Annahmen sind als
«Annahme» gekennzeichnet. Seitenangaben = Fallstudie (HWZ, o. J.).
Zahlen aus der Datei Daten-ABC-Analyse-Grofu.xls stammen aus abc_analyse.py.
"""

import csv
from pathlib import Path

AUS = Path(__file__).resolve().parent / "kennzahlen_fallstudie.csv"

# --- Vorgaben der Fallstudie ----------------------------------------------
TEILE_PA = 14e9            # Durchsatz Teile/Jahr (S. 6)
PICKFAKTOR = 1_000         # 1 Pick = Ø 1'000 Teile (S. 6)
PICKS_PERSON_TAG = 500     # Hochleistungs-Kommissioniersystem (S. 6)
ARBEITSTAGE = 280          # Indien (S. 6)
PERSONAL_IST = 600         # Kommissionierpersonal Ist (S. 6)
LAGER2_SOLL_AT = 3         # Sollreichweite Lager 2 (S. 3)
LAGER1_2_AT = 2            # Auslagerung L1 + Transport + Einlagerung L2 (S. 3)
SENDUNGEN_TAG_L4 = 400     # Eingänge Lager 4 Karatschi pro Tag (S. 4)
PALETTEN_L1, BEHAELTER_L1 = 12_000, 30_000  # Kapazität Lager 1 (S. 3)
LIEFERTREUE = 0.55         # Anlagenbau-Module (S. 6)
LIEFERZEIT_UEBER_WB = (0.30, 0.50)  # über Wettbewerb (S. 5)
BESTAND_ZIEL = (0.30, 0.40)          # Bestandssenkung (S. 5)
FRACHT_ANTEIL_GEWINN = 0.84          # OEM-Segment (S. 7)

# --- Daten aus Daten-ABC-Analyse-Grofu.xls -----------------------------------
# Standardwerte = Ergebnis von abc_analyse.py; abc_analyse.py übergibt die frisch
# berechneten Werte an berechnen() und schreibt daraus analyse/kennzahlen.csv.
DATEN_STANDARD = {"stueck_pa": 14_747_833_023, "bestellungen_overseas": 14_533,
                  "anteil_stueck_c": 0.9983}

# --- Annahmen (in den Unterlagen nicht beziffert) ---------------------------
WOCHE_AT = ARBEITSTAGE / 52           # ≈ 5.4 Arbeitstage je Woche
LAGER2_IST_WOCHEN = (2, 4)            # «mehrere Produktionswochen» (S. 3)

zeilen: list[dict] = []


def k(bereich, kennzahl, wert, einheit, formel, quelle):
    zeilen.append({"Bereich": bereich, "Kennzahl": kennzahl,
                   "Wert": round(wert, 3) if isinstance(wert, float) else wert,
                   "Einheit": einheit, "Berechnung": formel, "Quelle": quelle})


def berechnen(d: dict | None = None) -> list[dict]:
    """Berechnet alle Kennzahlen; d = Werte aus der Datei (sonst Standardwerte)."""
    d = {**DATEN_STANDARD, **(d or {})}
    zeilen.clear()
    # 1. Kommissionierung
    picks = TEILE_PA / PICKFAKTOR
    manntage = picks / PICKS_PERSON_TAG
    personal_soll = manntage / ARBEITSTAGE
    leistung_ist = picks / (PERSONAL_IST * ARBEITSTAGE)
    k("Kommissionierung", "Picks pro Jahr", picks, "Picks", "14 Mrd. Teile / 1'000", "Fallstudie S. 6")
    k("Kommissionierung", "Picks pro Arbeitstag", picks / ARBEITSTAGE, "Picks/AT", "Picks / 280 AT", "eigene Berechnung")
    k("Kommissionierung", "Manntage Soll", manntage, "Manntage", "Picks / 500 Picks je Person und Tag", "Fallstudie S. 6")
    k("Kommissionierung", "Personalbedarf Soll", personal_soll, "Personen", "Manntage / 280 AT", "Fallstudie S. 6")
    k("Kommissionierung", "Personal Ist", PERSONAL_IST, "Personen", "-", "Fallstudie S. 6")
    k("Kommissionierung", "Leistung Ist", leistung_ist, "Picks/Person/Tag", "Picks / (600 × 280)", "eigene Berechnung")
    k("Kommissionierung", "Produktivitätsfaktor Soll/Ist", PICKS_PERSON_TAG / leistung_ist, "Faktor",
      "500 / Leistung Ist", "eigene Berechnung")
    k("Kommissionierung", "Personalreduktion", PERSONAL_IST - personal_soll, "Personen", "600 − 100",
      "eigene Berechnung")
    k("Kommissionierung", "Personalreduktion relativ", 1 - personal_soll / PERSONAL_IST, "Anteil",
      "1 − 100 / 600", "eigene Berechnung")
    k("Kommissionierung", "Personalbedarf Soll mit Datei-Stückzahl",
      d["stueck_pa"] / PICKFAKTOR / PICKS_PERSON_TAG / ARBEITSTAGE, "Personen",
      "14.75 Mrd. / 1'000 / 500 / 280", "Daten-ABC-Analyse-Grofu.xls, eigene Berechnung")
    k("Kommissionierung", "Anteil C-Teile an der Stückzahl (≈ Pickvolumen)", d["anteil_stueck_c"], "Anteil",
      "Stück C / Stück total", "Daten-ABC-Analyse-Grofu.xls")

    # 2. Lager 2 (Produktionslager)
    for w in LAGER2_IST_WOCHEN:
        ist_at = w * WOCHE_AT
        k("Lager 2", f"Reichweite Ist bei {w} Wochen (Annahme)", ist_at, "AT", f"{w} × 280/52",
          "Annahme A1 zu «mehrere Produktionswochen» (Fallstudie S. 3)")
        k("Lager 2", f"Bestandssenkung Lager 2 auf Soll bei {w} Wochen", 1 - LAGER2_SOLL_AT / ist_at,
          "Anteil", "1 − 3 AT / Reichweite Ist", "eigene Berechnung")
        k("Lager 2", f"Umschlagshäufigkeit Ist bei {w} Wochen", ARBEITSTAGE / ist_at, "pro Jahr",
          "280 AT / Reichweite Ist", "eigene Berechnung")
    k("Lager 2", "Umschlagshäufigkeit Soll", ARBEITSTAGE / LAGER2_SOLL_AT, "pro Jahr", "280 AT / 3 AT",
      "eigene Berechnung")
    k("Lager 2", "Puffer nach Ankunft in Lager 2", LAGER2_SOLL_AT - LAGER1_2_AT, "AT",
      "3 AT Vorlauf − 2 AT Umlagerung", "Fallstudie S. 3, eigene Berechnung")
    k("Lager 2", "Anteil Umlagerungszeit am Soll-Vorlauf", LAGER1_2_AT / LAGER2_SOLL_AT, "Anteil",
      "2 AT / 3 AT", "eigene Berechnung")

    # 3. Lager 4 Karatschi / Import
    for tage, text in [(ARBEITSTAGE, "280 AT"), (365, "365 Tage")]:
        k("Lager 4", f"Sendungen pro Jahr ({text}, Annahme Betriebstage)", SENDUNGEN_TAG_L4 * tage,
          "Sendungen", f"400 × {tage}", "Fallstudie S. 4, Annahme A22")
        k("Lager 4", f"Sendungen je Overseas-Bestellung ({text})", SENDUNGEN_TAG_L4 * tage / d["bestellungen_overseas"],
          "Sendungen/Bestellung", "Sendungen p. a. / 14'533", "Fallstudie S. 4 + Daten, Annahme A22")

    # 4. Lager 1
    k("Lager 1", "Kapazität Paletten / Behälter", f"{PALETTEN_L1} / {BEHAELTER_L1}", "Plätze", "-", "Fallstudie S. 3")

    # 5. Service und Ziele
    k("Service", "Verspätete Lieferungen", 1 - LIEFERTREUE, "Anteil", "1 − 55 %", "Fallstudie S. 6")
    for z in LIEFERZEIT_UEBER_WB:
        k("Service", f"Nötige Lieferzeitverkürzung bei {int(z * 100)} % über Wettbewerb", 1 - 1 / (1 + z),
          "Anteil", f"1 − 1/{1 + z:.1f}", "Fallstudie S. 5, eigene Berechnung")
    k("Distribution", "Frachtkosten in % des Nettogewinns (OEM)", FRACHT_ANTEIL_GEWINN, "Anteil", "-",
      "Fallstudie S. 7")
    k("Distribution", "Ergebnis vor Frachtkosten je 1 Einheit Nettogewinn (OEM)", 1 + FRACHT_ANTEIL_GEWINN,
      "Faktor", "1 + 0.84", "eigene Berechnung")
    k("Distribution", "Gewinnhebel: Gewinnsteigerung bei 10 % Frachtkostensenkung", 0.1 * FRACHT_ANTEIL_GEWINN,
      "Anteil", "10 % × 84 %", "eigene Berechnung")
    for z in BESTAND_ZIEL:
        k("Bestand", f"Zielbestand nach Senkung um {int(z * 100)} %", 1 - z, "Anteil von Ist",
          f"1 − {z}", "Fallstudie S. 5")
    return list(zeilen)


def schreiben(pfad: Path = AUS) -> None:
    with pfad.open("w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=list(zeilen[0]), delimiter=";")
        w.writeheader()
        w.writerows(zeilen)


if __name__ == "__main__":
    berechnen()
    schreiben()
    for z in zeilen:
        print(f"{z['Bereich']:<17} {z['Kennzahl']:<62} {z['Wert']!s:>14} {z['Einheit']}")
