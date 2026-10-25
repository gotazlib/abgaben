# Anforderungsspezifikation – [Projekt von Gruppe 2]

Vorlage für Artefakt **R6** (Kernabgabe, Bewertung 30 %: Format, Inhalt, Schwierigkeitsgrad). Stand: 18.10.2026.

**So ist die Vorlage aufgebaut:** Jedes Kapitel enthält einen **Ausfüllhinweis** (was hinein gehört, mit Folien-Verweis) und ein **Beispiel** aus einem durchgespielten Mini-Projekt. Das Mini-Projekt ist frei erfunden – *Velowerkstatt «Speiche», Online-Terminbuchung* – und dient nur dazu, Format und Schwierigkeitsgrad sichtbar zu machen. Beim Befüllen: Platzhalter `[…]` ersetzen, Ausfüllhinweise und Beispiele löschen, Datei als `anforderungsspezifikation.md` speichern.

**Grundlage des Formats:** Die Gliederung folgt vorerst IEEE 830 (Einleitung – allgemeine Beschreibung – spezifische Anforderungen), die Anforderungsattribute dem Volere-Stil – Arbeitsannahme aus `notizen/kurs-konzepte.md` Abschnitt 14, weil die Spezifikationsvorlagen erst in Block 2 («IEEE 830, Volere», Roadmap Folie 2) behandelt werden. Begriffe, Klassifikation, Priorisierung und Qualitätsmerkmale stammen aus Block 1. Nach Block 2 Gliederung an die Dozentenvorlage anpassen.

| Feld | Inhalt |
|---|---|
| Auftraggeber (Stakeholder-Rolle) | Gruppe 2: `[Namen]` |
| Requirements Engineers | Gruppe 9: Görkem Taspinar, Ardian Ibrahimaj |
| Version / Status | `[v0.1 Entwurf / v0.5 im Review / v1.0 freigegeben]` |
| Freigabe durch Auftraggeber | `[Name, Datum]` |
| Modul | Requirements Engineering, HWZ BWI-A24-5, Dr. Joachim Steinwendner |

## 1. Einleitung

### 1.1 Zweck des Dokuments

`[Wozu dient die Spezifikation, für wen ist sie geschrieben?]`

> **Ausfüllhinweis:** Die Spezifikation ist die «Zusammenstellung aller Anforderungen an ein System» (Folie 24) aus Anwendersicht – inhaltlich ein **Lastenheft** (*Was? Wofür?*, Folie 26). Sie beschreibt nicht, *wie* das System gebaut wird (keine Architektur, kein Design, Folie 14). Kurz halten: kein Roman, keine wissenschaftliche Arbeit (Folie 14).

> **Beispiel (Velowerkstatt):** Dieses Dokument beschreibt die Anforderungen an eine Online-Terminbuchung der Velowerkstatt «Speiche». Es richtet sich an die Inhaberin (Auftraggeberin), das Werkstatt-Team und an einen künftigen Software-Lieferanten, der auf dieser Grundlage ein Angebot erstellt.

### 1.2 Geltungsbereich und Abgrenzung

`[Was gehört zum System, was ausdrücklich nicht?]`

> **Ausfüllhinweis:** Abgrenzung aus dem Kontextdiagramm (Kapitel 2.3) übernehmen. Ausdrücklich Ausgeschlossenes nennen – ein gutes Produkt hat «keine Merkmale, die vom Kunden nicht gewünscht sind» (Folie 13).

> **Beispiel (Velowerkstatt):** Im Umfang: Buchen, Verschieben und Stornieren von Reparaturterminen durch Kund:innen; Pflege der buchbaren Zeitfenster durch die Werkstatt. **Nicht im Umfang:** Online-Bezahlung, Ersatzteil-Lager, Verkauf von Velos.

### 1.3 Referenzen

`[Projektvorstellung Gruppe 2 (PVA 2), Interviewprotokolle, Gesetze, Normen – vollständige Angaben im Quellenverzeichnis]`

### 1.4 Aufbau des Dokuments

Kapitel 2–4 beschreiben Ausgangslage, Ziele und Stakeholder, Kapitel 5–7 die Anforderungen, Kapitel 8–11 Priorisierung, Nachverfolgbarkeit, Validierung und Änderungsmanagement, Kapitel 12–13 Glossar und offene Punkte.

## 2. Ausgangslage und Systemkontext

### 2.1 Ist-Zustand und Probleme

`[Heutiger Ablauf, Probleme mit Zahlen, soweit bekannt]`

> **Ausfüllhinweis:** Trennung Anwendungsgebiet (Prozess, Ist → Soll) und Lösungsgebiet (System) wie auf Folie 12. Probleme möglichst mit Zahlen belegen; diese Zahlen werden später zu Zielwerten.

> **Beispiel (Velowerkstatt):** Termine werden heute telefonisch vereinbart. Laut Inhaberin (Interview, Annahme der Stakeholder-Rolle) gehen pro Woche rund 60 Anrufe ein, etwa ein Drittel während der Reparaturarbeit; Montag und Samstag sind überbucht, Mittwoch halb leer.

### 2.2 Soll-Zustand (Überblick)

`[Wie soll der Ablauf künftig aussehen – in Sätzen, ohne Lösungsdetails]`

### 2.3 Systemkontext

`[Kontextdiagramm aus vorlagen/kontextdiagramm.md als Bild + Schnittstellenliste]`

> **Ausfüllhinweis:** Jede Schnittstelle braucht mindestens eine Anforderung (Kapitel 5–7). Wird eine bestehende Lösung geändert: Teilsysteme neu / geändert / unverändert nach Folie 17/18 kennzeichnen.

> **Beispiel (Velowerkstatt):** Akteure: Kund:in (bucht), Werkstatt-Team (pflegt Zeitfenster, sieht Tagesliste), Inhaberin (Auswertungen). Umsystem: E-Mail-Versand (Bestätigungen). Kein Umsystem für Kalender oder Kasse.

## 3. Ziele

`[Zielhierarchie: Geschäftsziele → Prozess- und Produktziele, je messbar]`

> **Ausfüllhinweis:** Ziel = «ein erwünschter Zustand» (Folie 35), Anforderung = eine konkrete, zu erreichende Eigenschaft, die für ein Ziel notwendig ist. Zielmodell nach Folie 37: Geschäftsziele *determinieren* und *werden verfeinert in* Prozess-, Produkt- und Projektziele. Projektziele (Kosten, Termine) sind Projektanforderungen, keine Systemanforderungen (Folie 38) – kurz nennen, aber getrennt halten. Jedes Ziel bekommt eine ID; jede Anforderung verweist auf mindestens ein Ziel (Kapitel 9).

| ID | Ebene (Folie 37) | Ziel | Messgrösse / Zielwert | Quelle |
|---|---|---|---|---|
| `[GZ-1]` | Geschäftsziel | | | |
| `[PZ-1]` | Prozessziel | | | |
| `[PDZ-1]` | Produktziel | | | |
| `[PJ-1]` | Projektziel (Kosten/Termine) | | | |

> **Beispiel (Velowerkstatt):**
>
> | ID | Ebene | Ziel | Messgrösse / Zielwert | Quelle |
> |---|---|---|---|---|
> | GZ-1 | Geschäftsziel | Werkstatt gleichmässiger auslasten | Auslastung Mi ≥ 70 % (heute ca. 50 %) nach 6 Monaten | Inhaberin |
> | PZ-1 | Prozessziel | Termine ohne Telefon vereinbaren | Anteil Online-Buchungen ≥ 60 % nach 6 Monaten | Inhaberin |
> | PDZ-1 | Produktziel | Kund:innen sehen freie Zeitfenster und buchen selbst | – (wird durch FA-01 … FA-03 konkretisiert) | Interview |
> | PJ-1 | Projektziel | Betrieb ab Saisonstart | produktiv bis `[Datum]` | Inhaberin |

## 4. Stakeholder und Benutzer

`[Stakeholder-Liste aus vorlagen/stakeholder-analyse.md, gekürzt: Rolle, Interesse, Entscheidungsbefugnis; Benutzergruppen mit Anzahl und Nutzungshäufigkeit]`

> **Ausfüllhinweis:** Entscheidungsbefugnis ausdrücklich nennen (Folie 47: «Wer entscheidet bei Widerspruch?»). Benutzergruppen mit Merkmalen beschreiben, die Anforderungen beeinflussen (Häufigkeit, Vorkenntnisse, Gerät).

> **Beispiel (Velowerkstatt):** Kund:innen (ca. 40 Buchungen/Woche, Gelegenheitsnutzer, meist Smartphone); Werkstatt-Team (3 Personen, täglich, PC in der Werkstatt); Inhaberin (gibt frei, entscheidet bei Konflikten).

## 5. Funktionale Anforderungen

> **Ausfüllhinweis – Format jeder Anforderung:**
>
> - **Klassifikation** nach Folie 38: funktionale Anforderungen beschreiben *Funktionen, Verhalten und Daten*.
> - **Formulierung** mit einer **Satzschablone** (eine Anforderung pro Satz, aktiv, mit Verbindlichkeit). Arbeitsvorlage bis Block 4 («Sprache – natürlich vs. formal»): *«Das System muss / soll / wird `<wem?>` die Möglichkeit bieten, `<Objekt>` zu `<Prozesswort>`.»* (Schablone nach Rupp & die SOPHISTen, 2014). Verbindlichkeit passend zur Priorität: *muss* = Muss, *soll* = Soll, *wird* = Wunsch.
> - Alternativ oder ergänzend **User Story** mit **Akzeptanzkriterien** («Als `<Rolle>` möchte ich `<Funktion>`, damit `<Nutzen>`»). User Stories sind in Block 1 nicht eingeführt (Folie 23 warnt: «grobe Stories» allein genügen nicht) – deshalb immer mit prüfbaren Akzeptanzkriterien.
> - **Attribute** (Volere-Stil): ID, Titel, Beschreibung, Begründung, Quelle, Ziel-Bezug, Priorität (Muss/Soll/Wunsch, Folie 43), Facetten (Repräsentation, Erfüllung, Rolle, Folie 40–42), Abnahmekriterium, Status, Version.
> - Prüfen gegen Folie 45: jede Anforderung **eindeutig**, **prüfbar**, **adäquat** (der Kunde braucht das wirklich).
> - Gliederung nach Funktionsbereichen oder Abläufen; Use Cases/UML ergänzen, sobald Block 5 behandelt ist.

### 5.1 `[Funktionsbereich 1]`

| Attribut | FA-`[nn]` |
|---|---|
| Titel | |
| Beschreibung (Satzschablone) | Das System muss `[wem]` die Möglichkeit bieten, `[Objekt]` zu `[Prozesswort]`. |
| Begründung | |
| Quelle | `[SH-…, Interview PVA 5 Nr. …]` |
| Ziel-Bezug | `[PZ-…]` |
| Priorität | `[Muss / Soll / Wunsch]` |
| Facetten | Repräsentation `[operational/quantitativ/qualitativ/deklarativ]` · Erfüllung `[hart/weich]` · Rolle `[Vorschrift/Tatsache/Annahme]` |
| Abnahmekriterium | `[überprüfbare Bedingung]` |
| Status / Version | `[entworfen / abgestimmt / freigegeben]` / `[v0.x]` |

> **Beispiel (Velowerkstatt) – 5.1 Termin buchen:**
>
> | Attribut | FA-01 |
> |---|---|
> | Titel | Reparaturtermin buchen |
> | Beschreibung | Das System muss Kund:innen die Möglichkeit bieten, für eine gewählte Leistung einen freien Termin aus den nächsten 21 Tagen zu buchen. |
> | Begründung | Telefonanrufe während der Reparaturarbeit reduzieren |
> | Quelle | Inhaberin, Interview Nr. 4 |
> | Ziel-Bezug | PZ-1, PDZ-1 |
> | Priorität | Muss |
> | Facetten | operational · hart · Vorschrift |
> | Abnahmekriterium | Nach der Buchung ist das Zeitfenster für andere Kund:innen nicht mehr buchbar und in der Tagesliste (FA-03) sichtbar. |
> | Status / Version | abgestimmt / v0.3 |
>
> **Schlecht → gut formuliert (zeigt den Schwierigkeitsgrad):**
>
> | ✗ ursprüngliche Aussage | Problem (Folie 45/47) | ✓ spezifiziert |
> |---|---|---|
> | «Kunden sollen einfach online einen Termin machen können.» | nicht eindeutig (welcher Zeitraum?), nicht prüfbar («einfach»), Funktion und Qualität vermischt | FA-01 (Funktion) + QA-01 (Bedienbarkeit, messbar) |
> | «Wir brauchen einen grossen grünen Buchen-Knopf.» | Lösungs- statt Anforderungsdenken | Bedürfnis dahinter: Buchung auch für Erstnutzer schnell möglich → QA-01 |
> | «Das System zeigt die Termine.» | unvollständig: wem? welche? | FA-03 |
>
> **Weitere Anforderungen im Beispiel (Kurzform):**
>
> | ID | Beschreibung | Prio | Facetten | Ziel |
> |---|---|---|---|---|
> | FA-02 | Das System muss dem Werkstatt-Team die Möglichkeit bieten, einzelne Zeitfenster für die Buchung zu sperren und wieder freizugeben. | Muss | operational · hart · Vorschrift | GZ-1 |
> | FA-04 | Das System soll Kund:innen 24 Stunden vor dem Termin eine Erinnerung per E-Mail senden. | Soll | operational · hart · Vorschrift | GZ-1 |
> | FA-05 | Das System wird der Inhaberin die Möglichkeit bieten, die Auslastung pro Wochentag als Monatsübersicht anzuzeigen. | Wunsch | operational · hart · Vorschrift | GZ-1 |

### 5.2 `[Funktionsbereich 2]` – als User Story mit Akzeptanzkriterien

| Attribut | FA-`[nn]` |
|---|---|
| User Story | Als `[Rolle]` möchte ich `[Funktion]`, damit `[Nutzen]`. |
| Akzeptanzkriterien | 1. Gegeben `[Ausgangslage]`, wenn `[Aktion]`, dann `[Ergebnis]`. 2. … |
| Quelle / Ziel / Priorität / Facetten / Status | wie oben |

> **Beispiel (Velowerkstatt) – 5.2 Tagesliste:**
>
> | Attribut | FA-03 |
> |---|---|
> | User Story | Als Mechaniker:in möchte ich am Vorabend alle Termine des nächsten Arbeitstags mit Leistung und Velotyp sehen, damit ich Ersatzteile vorbereiten kann. |
> | Akzeptanzkriterien | 1. Gegeben drei Buchungen für morgen, wenn ich die Tagesliste öffne, dann sehe ich alle drei, nach Uhrzeit sortiert, mit Leistung und Velotyp. 2. Gegeben eine stornierte Buchung, dann erscheint sie nicht in der Liste. 3. Gegeben ein gesperrtes Zeitfenster (FA-02), dann ist es als «gesperrt» markiert. |
> | Quelle / Ziel / Priorität | Werkstatt-Team, Workshop / PDZ-1 / Muss |
> | Facetten | operational · hart · Vorschrift |

## 6. Qualitätsanforderungen

> **Ausfüllhinweis:** Nach Folie 38 gehören dazu **Leistungsanforderungen** (Antwortzeit, Durchsatz, Mengen) und **besondere Qualitäten** (z. B. Bedienbarkeit, Verfügbarkeit, Sicherheit). «Schnell», «sicher», «benutzerfreundlich» ohne Mass sind unbrauchbar (Folie 47). Deshalb **qualitative** Aussagen (Folie 41: «hohe Verfügbarkeit») in **quantitative** überführen (Folie 41: «Antwortzeit < 0,5 s»): *Messgrösse + Zielwert + Bedingung + Messmethode*. Weiche Anforderungen (graduell erfüllbar, Folie 41) brauchen einen Schwellenwert, ab dem sie als erfüllt gelten. Was genau «nicht-funktional» heisst, vertieft Block 6 – danach prüfen.

| ID | Qualität | Anforderung | Messgrösse | Zielwert | Bedingung | Messmethode | Prio | Ziel |
|---|---|---|---|---|---|---|---|---|
| QA-`[nn]` | `[Leistung / Bedienbarkeit / Verfügbarkeit / Sicherheit / …]` | | | | | | | |

> **Beispiel (Velowerkstatt):**
>
> | ID | Qualität | Anforderung | Messgrösse | Zielwert | Bedingung | Messmethode | Prio | Ziel |
> |---|---|---|---|---|---|---|---|---|
> | QA-01 | Bedienbarkeit | Erstnutzer:innen können ohne Hilfe einen Termin buchen. | Zeit vom Öffnen bis zur Bestätigung | ≤ 3 min für 9 von 10 Testpersonen | Smartphone, erste Nutzung | Test mit 10 Personen vor Abnahme | Muss | PZ-1 |
> | QA-02 | Leistung | Die freien Zeitfenster werden rasch angezeigt. | Antwortzeit | ≤ 2 s in 95 % der Aufrufe | bis 20 gleichzeitige Nutzer | Lasttest | Soll | PDZ-1 |
> | QA-03 | Verfügbarkeit | Die Buchung ist ausserhalb der Öffnungszeiten erreichbar. | Verfügbarkeit pro Monat | ≥ 99 % | ohne angekündigte Wartung | Monitoring-Bericht | Soll | PZ-1 |
>
> *Vorher (qualitativ, nicht prüfbar):* «Die Buchung muss einfach und schnell sein.» → *nachher:* QA-01 und QA-02.

## 7. Randbedingungen, Annahmen und Abhängigkeiten

> **Ausfüllhinweis:** **Randbedingungen** schränken den Lösungsraum ein (Folie 38; Beispiel deklarativ, Folie 41: «Das System soll auf einer Linux-Plattform laufen»): Gesetze, Normen, interne Vorgaben, vorgegebene Technik, Budget. Mit der Facette **Rolle** (Folie 42) trennen: **Vorschrift** (Forderung an das System), **Tatsache** (Fakt in der Umgebung), **Annahme** (über das Verhalten von Akteuren). Gesetze und Normen nur mit geprüfter Quelle (HWZ-Zitierleitfaden); fiktive Angaben der Stakeholder-Rolle als *Annahme* kennzeichnen.

| ID | Randbedingung / Annahme | Rolle (Vorschrift / Tatsache / Annahme) | Quelle | Auswirkung auf Anforderungen |
|---|---|---|---|---|
| RB-`[nn]` | | | | |

> **Beispiel (Velowerkstatt):**
>
> | ID | Randbedingung / Annahme | Rolle | Quelle | Auswirkung |
> |---|---|---|---|---|
> | RB-01 | Die Bearbeitung der Personendaten (Name, E-Mail, Telefon) muss dem Bundesgesetz über den Datenschutz (DSG) entsprechen. | Vorschrift | DSG, SR 235.1 | Datenumfang minimal halten, Löschfrist festlegen (offener Punkt OP-2) |
> | RB-02 | Die Buchung muss in den aktuellen Versionen der gängigen Smartphone- und Desktop-Browser funktionieren; keine App-Installation. | Vorschrift | Inhaberin | – |
> | RB-03 | Die Werkstatt ist Dienstag bis Samstag geöffnet. | Tatsache (im Beispiel fiktiv) | Inhaberin | buchbare Tage in FA-01 |
> | RB-04 | Kund:innen haben eine E-Mail-Adresse und geben sie bei der Buchung an. | Annahme | Workshop | Voraussetzung für FA-04; falls falsch → SMS prüfen (siehe CR-01) |

## 8. Priorisierung

> **Ausfüllhinweis:** Jede Anforderung hat eine Priorität nach Folie 43: **Muss** (unverzichtbar), **Soll** (wichtig, aber bei zu hohen Kosten verzichtbar), **Wunsch** (schön zu haben). Priorisiert der Auftraggeber, nicht das RE-Team. Für viele Soll-Anforderungen optional eine grobe **wertbasierte** Einschätzung Nutzen vs. Kosten (Folie 44). Die Prioritäten bestimmen den Inhalt eines ersten Release (Folie 43: «nützlich bei Releaseplanung»).

| Priorität | Anzahl | Anforderungen |
|---|---|---|
| Muss | `[n]` | |
| Soll | | |
| Wunsch | | |

> **Beispiel (Velowerkstatt):** Muss: FA-01, FA-02, FA-03, QA-01, RB-01, RB-02 → Release 1. Soll: FA-04, QA-02, QA-03 → Release 1, falls im Budget. Wunsch: FA-05 → später. Wertbasierte Einschätzung für FA-04: Nutzen 4 (weniger vergessene Termine), Kosten 2 → behalten.

## 9. Nachverfolgbarkeit

> **Ausfüllhinweis:** Jede Anforderung lässt sich **rückwärts** zu Quelle und Ziel und **vorwärts** zu Abnahmekriterium bzw. Testfall verfolgen. Das macht Lücken sichtbar: ein Ziel ohne Anforderung = unvollständig; eine Anforderung ohne Ziel = evtl. nicht gewünscht (Folie 13, 45). «Rückverfolgen» ist eine Aufgabe des Verwaltens (Folie 27); Traceability wird in Block 7 vertieft.

| Ziel | Anforderung | Quelle | Abnahme / Testfall | Status |
|---|---|---|---|---|
| | | | | |

> **Beispiel (Velowerkstatt):**
>
> | Ziel | Anforderung | Quelle | Abnahme / Testfall | Status |
> |---|---|---|---|---|
> | PZ-1, PDZ-1 | FA-01 | Interview Nr. 4 | Abnahmekriterium FA-01 | abgestimmt |
> | GZ-1 | FA-02 | Workshop | T-02 Zeitfenster sperren | abgestimmt |
> | PDZ-1 | FA-03 | Workshop | Akzeptanzkriterien 1–3 | abgestimmt |
> | PZ-1 | QA-01 | Interview Nr. 7 | Test mit 10 Personen | entworfen |
> | GZ-1 | FA-05 | Inhaberin | – | Wunsch, zurückgestellt |
>
> *Befund aus der Matrix:* GZ-1 (Auslastung Mittwoch) wird nur indirekt unterstützt → offener Punkt OP-1: Soll die Buchung schwach ausgelastete Tage vorschlagen?

## 10. Validierung

> **Ausfüllhinweis:** Zwei Schritte des Kreislaufs (Folie 28): **Prüfen & Abstimmen** (Qualität, Konsistenz, Akzeptanz) und **Validieren** («Hält die Spec im System?»). Prüfmassstab sind die **Qualitätsmerkmale** von Folie 45 und die **Problemliste** von Folie 47. Fehler früh finden ist am billigsten (Folie 33/34). Validierungstechniken werden in der Roadmap nicht eigens genannt; bis dahin: Review durch Gruppe 2 und Szenario-Durchgang.

### 10.1 Checkliste Qualitätsmerkmale (Folie 45)

| Merkmal | Frage | erfüllt? | Befund / Massnahme |
|---|---|---|---|
| adäquat | Beschreibt die Spezifikation, was der Auftraggeber will bzw. braucht? | | |
| vollständig | Hat jedes Ziel, jede Schnittstelle, jeder Akteur Anforderungen? | | |
| widerspruchsfrei | Widersprechen sich Anforderungen? | | |
| verständlich | Versteht Gruppe 2 jede Anforderung ohne Erklärung? | | |
| eindeutig | Lässt jede Anforderung nur eine Auslegung zu (Glossar)? | | |
| prüfbar | Hat jede Anforderung ein Abnahmekriterium bzw. einen Messwert? | | |
| risikogerecht | Ist die Detailtiefe dort hoch, wo das Risiko hoch ist (Folie 23)? | | |

### 10.2 Problemliste (Folie 47) und Befunde

| # | Befund | Problemtyp (Folie 47) | betroffene IDs | Massnahme | erledigt in Version |
|---|---|---|---|---|---|
| | | | | | |

> **Beispiel (Velowerkstatt):**
>
> | # | Befund | Problemtyp | IDs | Massnahme | erledigt |
> |---|---|---|---|---|---|
> | V-1 | «Einfach zu bedienen» ohne Mass | unmessbare NFR | QA-01 | Messgrösse und Test definiert | v0.3 |
> | V-2 | FA-01 erlaubt Buchung am selben Tag, das Team braucht aber einen Tag Vorlauf für Ersatzteile (FA-03) | inkonsistente Anforderungen | FA-01, FA-03 | Inhaberin entscheidet: frühestens nächster Öffnungstag | v0.4 |
> | V-3 | «Termin» meint bei Kund:innen die Uhrzeit, beim Team die ganze Reparatur | uneinheitliche Terminologie | alle | Glossar: «Termin» = gebuchtes Zeitfenster; «Auftrag» = Reparatur | v0.4 |

### 10.3 Freigabe

| Version | geprüft durch | Ergebnis | Datum |
|---|---|---|---|
| `[v0.5]` | Gruppe 2 `[Name]` | `[Änderungen nötig / freigegeben]` | |

## 11. Änderungsmanagement und Versionshistorie

> **Ausfüllhinweis:** Verwalten heisst laut Folie 27/28 freigeben, ändern, rückverfolgen bzw. versionieren, verfolgen, ändern. Jede Änderung nach einer Freigabe läuft über einen Änderungsantrag mit Entscheid des Auftraggebers – instabile Anforderungen waren ein Grund für das Scheitern von Insieme (Folie 9). Wenn eine Anforderung noch nicht entscheidbar ist, bleibt sie bewusst «t. b. d.» (Folie 16) und steht in Kapitel 13.

### 11.1 Änderungsanträge

| ID | Antrag | von | Datum | betroffene IDs | Auswirkung | Entscheid (wer) | Version |
|---|---|---|---|---|---|---|---|
| CR-`[nn]` | | | | | | | |

> **Beispiel (Velowerkstatt):** CR-01 – Inhaberin wünscht zusätzlich SMS-Erinnerung, weil nicht alle Kund:innen E-Mails lesen (stellt Annahme RB-04 in Frage). Auswirkung: FA-04 erweitern, Kosten für SMS-Versand. Entscheid Inhaberin: SMS als Wunsch, E-Mail bleibt Soll. Umgesetzt in v0.5.

### 11.2 Versionshistorie

| Version | Datum | Änderung | Autor |
|---|---|---|---|
| 0.1 | `[Datum]` | Gliederung, Ziele und erste Anforderungen aus der Projektvorstellung PVA 2 | Ardian Ibrahimaj |
| 0.3 | | Ergebnisse Interview PVA 5 eingearbeitet | |
| 0.5 | | Zwischenstand PVA 6 und Prüfung Folie 45/47; zum Review an Gruppe 2 | |
| 1.0 | | Freigabe durch Gruppe 2 | |

## 12. Glossar

`[Fachbegriffe aus vorlagen/glossar.md, Teil A]`

> **Beispiel (Velowerkstatt):** **Termin** – gebuchtes Zeitfenster von 30 Minuten für die Abgabe des Velos. **Auftrag** – die Reparatur selbst, kann über mehrere Tage gehen. **Zeitfenster** – vom Werkstatt-Team freigegebene, buchbare Halbstunde. **Leistung** – Art der Reparatur aus einer festen Liste (z. B. Service, Platten, Bremsen).

## 13. Offene Punkte

| ID | Frage | an wen | bis | Status |
|---|---|---|---|---|
| OP-`[nn]` | | | | |

> **Beispiel (Velowerkstatt):** OP-1 Sollen schwach ausgelastete Tage bei der Buchung vorgeschlagen werden (GZ-1)? – Inhaberin – offen. OP-2 Wie lange werden Kundendaten nach dem Termin aufbewahrt (RB-01)? – Inhaberin – offen.

## Quellenverzeichnis

Nach HWZ-Zitierleitfaden. Projektspezifische Quellen ergänzen.

- Steinwendner, J. (2026). *Requirements Engineering – Grundlagen und Einführung* (Foliensatz Block 1). HWZ Hochschule für Wirtschaft Zürich.
- Steinwendner, J. (2026). *Merkblatt Gruppenarbeit HS26*. HWZ Hochschule für Wirtschaft Zürich.
- IEEE (1998). *IEEE Std 830-1998: IEEE Recommended Practice for Software Requirements Specifications*. IEEE.
- Robertson, S. & Robertson, J. (2012). *Mastering the Requirements Process* (3. Aufl.). Addison-Wesley. (Volere-Vorlage)
- Rupp, C. & die SOPHISTen (2014). *Requirements-Engineering und -Management* (6. Aufl.). Hanser. (Satzschablone)
- Bundesgesetz über den Datenschutz (Datenschutzgesetz, DSG) vom 25. September 2020, SR 235.1. (nur im Beispiel)
- `[Gruppe 2 (2026). Projektvorstellung PVA 2: …]`
- `[Interviewprotokolle, Workshop-Protokolle mit Datum]`
