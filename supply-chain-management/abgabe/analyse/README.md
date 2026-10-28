# analyse/ – Bereich D (Daten)

> **Öffentliche Fassung:** Die Originaldaten (`material/Daten-ABC-Analyse-Grofu.xls`, Kursunterlage der HWZ), die zeilengenauen Lieferanten-Auszüge (`lieferanten_abc*.csv`) und die internen Notizen (`../notizen/`) sind nicht veröffentlicht. Die Annahmen stehen im Anhang des Leistungsnachweises.

**Verbindliche Zahlenbasis für alle Kapitel: `kennzahlen.csv`** (Bereich; Kennzahl; Wert; Einheit; Berechnung; Quelle).
Anteile sind als Dezimalzahl gespeichert (0.0381 = 3,8 %). Annahmen-IDs (A1, A20–A26) siehe `../notizen/annahmen.md`.

## Neu erzeugen

```bash
# aus leistungsnachweis-grofu/, Python ≥ 3.10 mit pandas, xlrd, matplotlib
python analyse/abc_analyse.py            # liest material/Daten-ABC-Analyse-Grofu.xls
python abbildungen/ist_materialfluss.py  # Ist-Materialfluss (SVG; PNG mit cairosvg)
```

Optional `GROFU_FONTDIR=<Ordner mit LiberationSans-*.ttf>` für die Schrift Liberation Sans (sonst DejaVu Sans).
`abc_analyse.py` ruft `fallstudie_kennzahlen.py` auf (Fallstudien-Rechnungen, nur Standardbibliothek).

## Dateien

| Datei | Inhalt |
|---|---|
| `kennzahlen.csv` | alle Kennzahlen (Daten + Fallstudie), **für F1/F2 verbindlich** |
| `abc_bericht.txt` | Datenbeschreibung, Datenqualität, Kernzahlen im Klartext |
| `datenqualitaet.csv` | Prüfungen (Nullwerte, Duplikate, Summenzeilen, Ausreisser, Blattabgleich) |
| `abc_klassen.csv` | ABC-Klassen (70/20/10): Materialien, Wert, Bestellungen, Stück, Lieferanten |
| `abc_sensitivitaet_80-15-5.csv` | Klassengrenzen 80/15/5 als Sensitivität |
| `abc_herkunft.csv`, `abc_x_herkunft.csv` | Local vs. Overseas, Kreuztabelle ABC × Herkunft |
| `abc_x_bestellhaeufigkeit.csv` | ABC × Bestellhäufigkeit (Hilfsgrösse statt XYZ, Annahme A25) |
| `lieferanten_abc_datei.csv` | Lieferanten-ABC laut Blatt «Vendors + ABC» (eine von zwei Lesarten, Annahme A24) |
| `lieferanten_abc.csv`, `lieferanten_klassen.csv` | Neuberechnung aus dem RM-Blatt (Plausibilisierung, Annahme A24) |
| `bestand_szenario.csv`, `bestand_sensitivitaet.csv`, `bestand_bruecke.csv` | Bestandsmodell und Bestandsbrücke (Annahmen A20/A21) |
| `kennzahlen_fallstudie.csv` | nur die Fallstudien-Rechnungen (Teilmenge von `kennzahlen.csv`) |
| `block3_*.csv`, `block4_*.csv`, `gesamt_amortisation_beispiel.csv` | aus `block3_4_kennzahlen.py`: Nutzwertanalysen, Lieferzeit-Szenarien, Auftragsvollständigkeit (0,98^n), Personal Referenz vs. Szenario, Rechenbeispiel Amortisation |
