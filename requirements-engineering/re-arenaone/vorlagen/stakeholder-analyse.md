# Vorlage: Stakeholder-Liste und Stakeholder-Analyse

Artefakt **R2** (Fahrplan 3.2), Phase **Ermitteln** (Folie 28: «Stakeholder, Quellen, Bedürfnisse»).

> **Hinweis:** Die Stakeholder-Analyse kommt im Kurs erst in Block 3 («Ermittlung – Stakeholder & Kontext», Roadmap Folie 2). Spalten und Raster unten sind eine Arbeitsvorlage (gängige Praxis der RE-Literatur). Nach Block 3 an die Vorlage des Dozenten angleichen. Die Spalte **Entscheidungsbefugnis** ist bewusst drin: Folie 47 nennt «unklare Verantwortung – wer entscheidet bei Widerspruch?» als typisches Problem.

## Ausfüllhinweise

1. Zuerst **breit sammeln** (alle, die vom System betroffen sind, es nutzen, bezahlen, betreiben, prüfen oder regulieren), dann bewerten.
2. Pro Stakeholder notieren, **woher** die Information stammt (Projektvorstellung, Interview, Annahme). Bei einem virtuellen Unternehmen spricht Gruppe 2 für alle Rollen – trotzdem jede Rolle einzeln betrachten.
3. Nicht nur Personen: auch **Dokumente und Systeme** sind Quellen von Anforderungen (Gesetze, Normen, interne Weisungen, bestehende Systeme) → Abschnitt C.
4. Stakeholder-Ziele später in die Zielhierarchie der Spezifikation übernehmen (Folie 37).

## A. Stakeholder-Liste

| ID | Stakeholder (Rolle) | Vertreten durch | Beziehung zum System | Interessen / Ziele | Erwartete Probleme heute | Einfluss (h/m/g) | Interesse (h/m/g) | Entscheidungsbefugnis | Erreichbarkeit / Kanal | Quelle |
|---|---|---|---|---|---|---|---|---|---|---|
| SH-01 | `[Auftraggeber / Geschäftsleitung]` | `[G2: Person/Rolle]` | finanziert, gibt frei | `[…]` | `[…]` | h | h | gibt Spezifikation frei, entscheidet Konflikte | `[…]` | PVA 2 |
| SH-02 | `[Hauptnutzer:innen]` | | nutzen das System täglich | | | | | | | |
| SH-03 | `[weitere Nutzergruppe]` | | | | | | | | | |
| SH-04 | `[Betrieb / IT]` | | betreibt, wartet | | | | | | | |
| SH-05 | `[Datenschutz / Recht / Compliance]` | | prüft Vorgaben | | | | | Veto bei Rechtsverletzung | | |
| SH-06 | `[Kund:innen / externe Nutzer]` | | indirekt betroffen | | | | | | | |
| SH-07 | `[Lieferant / Umsystem-Verantwortliche]` | | Schnittstelle | | | | | | | |

## B. Einfluss-Interesse-Raster

Einordnung für die Planung der Ermittlung (wen wir wie intensiv einbinden).

| | **Interesse gering** | **Interesse hoch** |
|---|---|---|
| **Einfluss hoch** | zufriedenstellen, informiert halten: `[SH-…]` | **eng einbinden** (Interview, Review, Freigabe): `[SH-…]` |
| **Einfluss gering** | beobachten: `[SH-…]` | informieren, Anliegen aufnehmen: `[SH-…]` |

## C. Weitere Anforderungsquellen

| ID | Quelle | Art (Gesetz, Norm, Weisung, Dokument, bestehendes System) | Relevanz | verifiziert? |
|---|---|---|---|---|
| Q-01 | `[z. B. Datenschutzgesetz (DSG)]` | Gesetz | `[welche Daten betroffen]` | `[Quelle/Link prüfen]` |
| Q-02 | `[Projektvorstellung Gruppe 2, PVA 2]` | Dokument | Ausgangslage, Ziele | ja |
| Q-03 | `[bestehendes System X]` | System | Schnittstelle, Datenbestand | |

Regel: Gesetze und Normen nur mit geprüfter Quelle aufführen (HWZ-Zitierleitfaden). Fiktive Angaben von Gruppe 2 in der Spezifikation als **Annahme** kennzeichnen (Facette «Rolle», Folie 40/42).

## D. Offene Punkte zu Stakeholdern

| # | Frage | an wen | bis | Antwort |
|---|---|---|---|---|
| 1 | `[Wer entscheidet, wenn Nutzergruppe A und B Widersprüchliches wollen?]` | SH-01 | `[Datum]` | |
