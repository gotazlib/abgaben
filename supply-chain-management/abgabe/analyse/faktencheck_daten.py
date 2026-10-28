#!/usr/bin/env python3
"""Unabhängige Nachrechnung der ABC-Kernzahlen (Faktencheck Oktober 2026).

Liest die Original-Excel direkt (ohne abc_analyse.py) und prüft die Zahlen,
die im Text verwendet werden, plus die Abweichungen zwischen dem RM-Blatt und
dem Lieferantenblatt. Ergebnis und Bewertung: notizen/faktencheck-2026-10.md.

Aufruf (aus dem Ordner leistungsnachweis-grofu/):
    python analyse/faktencheck_daten.py [Pfad/zur/Daten-ABC-Analyse-Grofu.xls]

Benötigt: pandas, xlrd. Gibt nur Aggregate aus (keine Zeilen der Datei).
"""

from __future__ import annotations

import sys
from pathlib import Path

import numpy as np
import pandas as pd
import xlrd

DATEI = Path(sys.argv[1] if len(sys.argv) > 1 else "material/Daten-ABC-Analyse-Grofu.xls")
FALLSTUDIE_STUECK = 14e9          # HWZ, o. J., S. 6: «Durchsatz/ Jahr: 14 Mrd. Teile»
SENDUNGEN_TAG = 400               # HWZ, o. J., S. 4: «Täglich gehen ca. 400 Sendungen ein»


def pct(x: float, n: int = 1) -> str:
    return f"{100 * x:.{n}f} %".replace(".", ",")


def lesen() -> tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame, pd.Series]:
    buch = xlrd.open_workbook(DATEI)
    rm_blatt = buch.sheet_by_name("RM + ABC")
    spalten = "rm anteil kum abc lieferant lief_abc bestellungen edi stueck herkunft".split()
    roh = pd.DataFrame([[rm_blatt.cell_value(r, c) for c in range(10)]
                        for r in range(1, rm_blatt.nrows)], columns=spalten)
    # Datenzeilen = Zeilen mit Lieferantennummer; der Rest sind Summen-/Leerzeilen am Blattende
    ist_daten = roh["lieferant"].astype(str).str.strip() != ""
    rm, rest = roh[ist_daten].copy(), roh[~ist_daten]
    for c in ["rm", "lieferant"]:
        rm[c] = rm[c].str.strip()
    for c in ["anteil", "bestellungen", "stueck"]:
        rm[c] = rm[c].astype(float)
    rm["herkunft"] = rm["herkunft"].map({"Local": "Local", "Oseas": "Overseas"})

    v_blatt = buch.sheet_by_name("Vendors + ABC")
    v = pd.DataFrame([[v_blatt.cell_value(r, c) for c in range(5)] for r in range(1, v_blatt.nrows)],
                     columns="lieferant volumen kum kum_anteil abc".split())
    v_summe = v.iloc[-1]
    v = v.iloc[:-1].copy()
    v["lieferant"] = v["lieferant"].str.strip()
    v["volumen"] = v["volumen"].astype(float)
    return rm, rest, v, v_summe


def main() -> None:
    rm, rest, v, v_summe = lesen()
    T = rm["anteil"].sum()
    aus: list[str] = []
    a = aus.append

    a("1. RM-Blatt: Grundgesamtheit und Summenzeilen")
    a(f"- Datenzeilen: {len(rm)}; ausgeschlossene Zeilen am Blattende: {len(rest)}")
    a(f"- Summenzeile Stückzahl = Summe der Datenzeilen: {np.isclose(rest['stueck'].replace('', 0).astype(float).max(), rm['stueck'].sum())}")
    a(f"- Summe Wertanteile {T:.6f}; doppelte Materialnummern {rm['rm'].duplicated().sum()}; "
      f"absteigend sortiert {bool((rm['anteil'].diff().dropna() <= 1e-15).all())}")

    a("\n2. ABC 70/20/10 (kumuliert inkl. Position)")
    kum = rm["anteil"].cumsum()
    eigen = np.where(kum <= 0.7 + 1e-12, "A", np.where(kum <= 0.9 + 1e-12, "B", "C"))
    a(f"- Abweichungen eigene Klasse vs. Datei: {(eigen != rm['abc']).sum()}")
    nA, nB = (rm["abc"] == "A").sum(), (rm["abc"] == "B").sum()
    a(f"- Grenze A: letzte A-Position kumuliert {kum.iloc[nA - 1]:.5f}, erste B {kum.iloc[nA]:.5f}")
    a(f"- Grenze B: letzte B-Position kumuliert {kum.iloc[nA + nB - 1]:.5f}, erste C {kum.iloc[nA + nB]:.5f}")
    for k, g in rm.groupby("abc"):
        a(f"- {k}: {len(g)} Materialien ({pct(len(g) / len(rm))}), Wert {pct(g['anteil'].sum() / T)}, "
          f"Bestellungen {int(g['bestellungen'].sum())} ({pct(g['bestellungen'].sum() / rm['bestellungen'].sum())}), "
          f"Stück {pct(g['stueck'].sum() / rm['stueck'].sum(), 2)}, Lieferanten {g['lieferant'].nunique()}")
    a(f"- Total: Bestellungen {int(rm['bestellungen'].sum())}, Stück {rm['stueck'].sum():,.0f}, "
      f"Lieferanten {rm['lieferant'].nunique()}")

    a("\n3. Mehrfachzählung der Lieferanten in der ABC-Tabelle")
    klassen = rm.groupby("lieferant")["abc"].agg(lambda s: "".join(sorted(set(s))))
    a(f"- Summe Lieferanten je Klasse: {sum(rm.groupby('abc')['lieferant'].nunique())}")
    a(f"- Lieferanten nach Anzahl Klassen: {klassen.str.len().value_counts().sort_index().to_dict()}")
    a(f"- Kombinationen: {klassen.value_counts().to_dict()}")

    a("\n4. Herkunft")
    for h, g in rm.groupby("herkunft"):
        a(f"- {h}: Materialien {len(g)} ({pct(len(g) / len(rm))}), Wert {pct(g['anteil'].sum() / T)}, "
          f"Bestellungen {int(g['bestellungen'].sum())} ({pct(g['bestellungen'].sum() / rm['bestellungen'].sum())}), "
          f"Stück {pct(g['stueck'].sum() / rm['stueck'].sum())}, Lieferanten (mit mind. 1 Material) {g['lieferant'].nunique()}")
    haupt = rm.groupby("lieferant")["herkunft"].agg(lambda s: s.mode().iloc[0])
    a(f"- Lieferanten nach Hauptherkunft: {haupt.value_counts().to_dict()} "
      f"(Overseas {pct((haupt == 'Overseas').mean())}); mit beiden Herkünften: "
      f"{(rm.groupby('lieferant')['herkunft'].nunique() > 1).sum()}")
    lok_c = rm[(rm["abc"] == "C") & (rm["herkunft"] == "Local")]
    a(f"- Lokale C-Teile: {len(lok_c)} Materialien, Anteil an der Stückzahl {pct(lok_c['stueck'].sum() / rm['stueck'].sum(), 2)}")
    a(f"- EDI-fähig: {pct((rm['edi'] == 'Y').mean())} der Materialien, {pct(rm.loc[rm['edi'] == 'Y', 'anteil'].sum() / T)} des Werts")

    a("\n5. Stückzahl Daten vs. Fallstudie")
    s = rm["stueck"].sum()
    a(f"- Daten {s / 1e9:.3f} Mrd. vs. Fallstudie 14 Mrd.: {pct(s / FALLSTUDIE_STUECK - 1, 2)}; "
      f"Personalbedarf mit Datenstückzahl {s / 1000 / 500 / 280:.1f}")
    a(f"- 14 Mrd. × Anteil lokale C-Teile = {FALLSTUDIE_STUECK * lok_c['stueck'].sum() / s / 1e3 / 1e6:.2f} Mio. Picks "
      f"(nur unter der Annahme Stückanteil = Pickanteil)")

    a("\n6. Sendungen Lager 4 je Overseas-Bestellung")
    ov = rm[rm["herkunft"] == "Overseas"]
    for tage in (280, 365):
        a(f"- {tage} Tage: {SENDUNGEN_TAG * tage} Sendungen / {int(ov['bestellungen'].sum())} Bestellungen = "
          f"{SENDUNGEN_TAG * tage / ov['bestellungen'].sum():.2f}; je Overseas-Material {SENDUNGEN_TAG * tage / len(ov):.1f}")
    a(f"- Overseas-Bestellungen je Arbeitstag (280): {ov['bestellungen'].sum() / 280:.1f}")

    a("\n7. Lieferantenblatt vs. RM-Blatt")
    a(f"- Lieferantenblatt: {len(v)} Zeilen, doppelt {v['lieferant'].duplicated().sum()}, "
      f"Summenzeile = Summe: {np.isclose(float(v_summe['volumen']), v['volumen'].sum())}; Klassen {v['abc'].value_counts().to_dict()}")
    a(f"- Spalte «%» = eigene kumulierte Summe: {np.allclose(v['kum_anteil'].astype(float), v['volumen'].cumsum() / v['volumen'].sum())}")
    nur_v = v[~v["lieferant"].isin(set(rm["lieferant"]))]
    a(f"- Nur im Lieferantenblatt: {len(nur_v)} Lieferanten, {pct(nur_v['volumen'].sum() / v['volumen'].sum(), 2)} des Volumens, "
      f"Klassen {nur_v['abc'].value_counts().to_dict()}; nur im RM-Blatt: {len(set(rm['lieferant']) - set(v['lieferant']))}")
    lief_abc_rm = rm.groupby("lieferant")["lief_abc"].agg(lambda s: s.unique().tolist())
    j = v.set_index("lieferant")[["abc"]].join(lief_abc_rm, how="inner")
    a(f"- Spalte «ABC For Vendor» im RM-Blatt = Klasse im Lieferantenblatt: "
      f"{sum(len(x) == 1 and x[0] == k for k, x in zip(j['abc'], j['lief_abc']))} von {len(j)}")
    agg = rm.groupby("lieferant").agg(n=("rm", "size"), bestellungen=("bestellungen", "sum"),
                                      stueck=("stueck", "sum"), wert=("anteil", "sum"))
    vg = v.set_index("lieferant")["volumen"]
    J = (vg / vg.sum()).rename("v").to_frame().join(agg, how="inner")
    rel = (J["wert"] / J["wert"].sum()) / J["v"]
    a(f"- Gemeinsame Lieferanten {len(J)}: Abweichung > 5 % bei {(abs(rel - 1) > 0.05).sum()}, "
      f"innerhalb Faktor 2 nur {((rel >= 0.5) & (rel <= 2)).sum()}")
    for c in ["wert", "bestellungen", "n", "stueck"]:
        a(f"  Rangkorrelation Volumen Lieferantenblatt vs. {c}: {J['v'].rank().corr(J[c].rank()):.2f}")
    for name, werte in [("Lieferantenblatt", np.sort(vg.values)[::-1]), ("RM-Neuberechnung", np.sort(agg['wert'].values)[::-1])]:
        k = np.cumsum(werte) / werte.sum()
        a(f"- {name}: Lieferanten bis 70 % {int((k <= 0.7 + 1e-12).sum())}, Top 1 {pct(k[0])}, Top 10 {pct(k[9])}")
    J = J.join(haupt.rename("herkunft"))
    anteile = J.groupby("herkunft")[["v", "wert"]].sum()
    a(f"- Overseas-Anteil (Hauptherkunft): Lieferantenblatt {pct(anteile.loc['Overseas', 'v'] / anteile['v'].sum())}, "
      f"RM-Blatt {pct(anteile.loc['Overseas', 'wert'] / anteile['wert'].sum())}")

    print("\n".join(aus))


if __name__ == "__main__":
    main()
