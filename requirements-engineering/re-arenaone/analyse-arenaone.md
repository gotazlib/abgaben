# Analyse der Projektvorstellung ArenaOne (Gruppe 2)

Dokumentenanalyse der Präsentation, die Gruppe 2 in PVA 2 als Stakeholder gehalten hat. Ermittlungstechnik «Dokumentenanalyse» aus dem [RE-Plan](re-plan.md), Abschnitt 5. Stand: 25.10.2026.

**Grundlage:** `material/Praesentation_ArenaOne.pptx` (5 Folien mit Sprechernotizen; PDF-Rendering daneben). Die Datei ist fremde Gruppenarbeit und bleibt privat in diesem Repository.

> **Wichtig:** Das Interview mit Gruppe 2 (PVA 5) hat **noch nicht stattgefunden**. Bestätigt ist nur, was auf den Folien oder in den Sprechernotizen steht. Alles andere in diesem Dokument ist eine **Annahme** oder stammt aus dem **Benchmark** und muss in PVA 5 validiert werden.

**Quellenkürzel** (gelten für alle Ermittlungsdokumente in `re-gruppe2/`):

| Kürzel | Bedeutung |
|---|---|
| `F2` | Präsentation Gruppe 2, Folie 2 (sichtbarer Folieninhalt) |
| `N5` | Präsentation Gruppe 2, Sprechernotiz zu Folie 5 (vorgetragen bzw. vorbereitet, nicht auf der Folie) |
| `A` | Annahme von uns (Gruppe 9) – nicht von Gruppe 2 bestätigt |
| `B` | Benchmark (Playtomic, GotCourts, eTermin) – zeigt, was üblich ist, ist aber **keine** Anforderung von Gruppe 2 |
| `S` | **Simulation**: Antwort aus unserem [simulierten Interview](simuliertes-interview-pva5.md) (Rollenspiel zur Vorbereitung, von uns gespielt) – **ersetzt nicht die Ermittlung mit Gruppe 2** und gilt bis zur Bestätigung wie eine Annahme |

## 1. Inhalt der Präsentation in Kürze

| Folie | Titel | Kernaussage |
|---|---|---|
| 1 | Titel | ArenaOne Sportzentrum AG – Buchungs- und Belegungsmanagement für Sportplätze und Hallen. Notiz: ArenaOne ist **fiktiv**; im Fokus steht das Geschäftsproblem, nicht eine fertige App. |
| 2 | Unternehmen & Ausgangslage | Mittelgrosses Sportzentrum im Raum Zürich; Padel, Tennis, Badminton, Mehrzweckhallen; Kundschaft Privatpersonen, Vereine, Firmen, Trainingsgruppen; der Empfang koordiniert einen grossen Teil der Reservationen. Heute vier Eingangskanäle (Telefon, E-Mail, Empfang, interne Listen) → Abstimmungs- und Administrationsaufwand. «Es fehlt eine zentrale und einheitliche Buchungs- und Belegungsverwaltung.» |
| 3 | Kernproblem & Herausforderungen | Kein zentraler, einheitlicher Prozess. Sechs Herausforderungen: (1) hoher manueller Aufwand, (2) fehlende Gesamtübersicht, (3) Fehl-/Doppelbuchungen, (4) kurzfristige Stornierungen – frei werdende Kapazität schwer neu zu vermitteln, (5) unterschiedliche Kundengruppen mit verschiedenen Bedürfnissen und Buchungsmustern, (6) wiederkehrende Reservationen müssen anders behandelt werden als Einzelbuchungen. |
| 4 | Projektziel & Scope | Ziel: Buchungs- und Belegungsprozess vereinfachen, Transparenz über verfügbare Kapazitäten erhöhen, administrativen Aufwand reduzieren, Kapazitäten besser nutzen. Nutzen: komfortabler für Kunden, bessere Anlagennutzung, weniger Fehler und Rückfragen, einfachere Koordination. **Im Scope:** Verfügbarkeiten, Reservationen, Änderungen, Stornierungen, wiederkehrende Buchungen, Bedürfnisse von Kunden und Betrieb. **Nicht im Scope:** Finanz- und Lohnbuchhaltung, Personalplanung, Gastronomie, vollständiges CRM. Technische Lösung noch nicht festgelegt (Notiz: auch technische Architektur nicht Teil). |
| 5 | Stakeholder & offene Fragen | Stakeholder: Privatkunden, Vereine & Firmen, Empfang, Trainer, Geschäftsleitung, IT. Offene Fragen: Buchung (wie, wie weit im Voraus), Regeln (Berechtigungen je Kundengruppe und Rolle), Stornierung (kurzfristige Absagen, Warteliste?), Serien (Vereins-/Trainingsbuchungen), Information (Benachrichtigungen), Steuerung (Übersichten, Auswertungen für die Geschäftsleitung). Auftrag: Anforderungen ermitteln, dokumentieren, validieren, verwalten. Notiz: Make-or-Buy ist möglich, aber erst nach bekannten Anforderungen; wichtigste Stakeholder sind Kunden und Empfang, für Priorisierung zusätzlich die Geschäftsleitung. |

## 2. Ausgangslage

- ArenaOne Sportzentrum AG ist ein **fiktives** (`N1`), mittelgrosses Sportzentrum im Raum Zürich (`F2`).
- Angebot: Padel, Tennis, Badminton, Mehrzweckhallen (`F2`). Wie viele Plätze und Hallen es gibt, ob Tennis auch draussen gespielt wird und wie die Öffnungszeiten sind, ist nicht gesagt.
- Kundschaft: Privatpersonen, Vereine, Firmen, Trainingsgruppen (`F2`).
- Reservationen kommen heute über **Telefon, E-Mail, den Empfang und interne Listen** (`F2`, `N2`). Das «funktioniert grundsätzlich» (`N2`), kostet aber Abstimmungsaufwand und verhindert einen schnellen Überblick.
- Der **Empfang** koordiniert einen grossen Teil der Reservationen (`F2`) – er ist heute der Engpass und das «System».

## 3. Problem

Kernproblem laut Gruppe 2 (`F3`, wörtlich): «ArenaOne hat heute keinen zentralen und einheitlichen Prozess für die Buchung und Belegung seiner Sportplätze und Hallen.» Gruppe 2 betont, das Problem sei **nicht** «wir brauchen eine App» (`N3`). Daraus folgen die sechs Herausforderungen von Folie 3. Wir lesen sie als Wirkungskette:

```
mehrere Eingangskanäle, keine zentrale Belegung
  → keine Gesamtübersicht (2)
      → Fehl-/Doppelbuchungen (3), Rückfragen
      → frei werdende Zeiten nach Storno werden nicht neu vergeben (4) → Kapazität bleibt ungenutzt
  → jede Buchung, Änderung, Absage wird von Hand geprüft und nachgeführt (1)
  verschärft durch: verschiedene Kundengruppen mit eigenen Regeln (5), Serien statt Einzeltermine (6)
```

## 4. Ziele (wie von Gruppe 2 formuliert)

| Ziel / Nutzen | Quelle | Bemerkung (RE-Sicht, Folie 35/37) |
|---|---|---|
| Buchungs- und Belegungsprozess vereinfachen | `F4` | Prozessziel, nicht messbar formuliert |
| Transparenz über verfügbare Kapazitäten erhöhen | `F4` | Produkt-/Prozessziel; für wen (Kunden, Empfang, GL)? |
| administrativen Aufwand reduzieren | `F4` | Prozessziel; Ausgangswert fehlt |
| vorhandene Kapazitäten besser nutzen | `F4` | Geschäftsziel (Auslastung → Umsatz); Ausgangswert fehlt |
| komfortablerer Buchungsprozess für Kunden | `F4` | lässt offen, ob Kunden selbst buchen sollen |
| weniger Fehler und Rückfragen im Tagesgeschäft | `F4` | messbar machbar (Doppelbuchungen pro Monat, Rückfragen pro Tag) |
| einfachere Koordination für Mitarbeitende | `F4` | weich; Messgrösse z. B. Zeit pro Buchung am Empfang |

Die Zielhierarchie mit unseren Vorschlägen für Messgrössen steht in [`zielhierarchie.md`](zielhierarchie.md). **Alle Zielwerte dort sind Annahmen.**

## 5. Scope

| im Scope (`F4`) | nicht im Scope (`F4`, `N4`) | von uns unklar eingestuft (→ Fragenliste) |
|---|---|---|
| Verfügbarkeiten | Finanz- und Lohnbuchhaltung | **Preise, Tarife, Bezahlung** (nicht erwähnt; Buchhaltung ist ausgeschlossen, Zahlung aber nicht) |
| Reservationen | Personalplanung | **Trainer-Einsatz** (Trainer sind Stakeholder, Personalplanung ist ausgeschlossen) |
| Änderungen | Gastronomie | **Kundendaten / Kundenkonto** («vollständiges CRM» ausgeschlossen – wie viel Kundenverwaltung braucht die Buchung trotzdem?) |
| Stornierungen | vollständiges CRM | **Zutritt, Licht, Hallenteilung** (Steuerung der Anlage) |
| wiederkehrende Buchungen | technische Architektur (`N4`) | **Warteliste** (als Frage genannt, `F5`) |
| Bedürfnisse von Kunden und Betrieb | | **Benachrichtigungen, Auswertungen** (als Fragen genannt, `F5`) |

## 6. Stakeholder

Genannt (`F5`): Privatkunden, Vereine & Firmen, Empfang, Trainer, Geschäftsleitung, IT. Laut `N5` sind Kunden und Empfang direkt betroffen, die Geschäftsleitung ist für Priorisierung und Wirtschaftlichkeit zentral.
Von uns ergänzt (Annahme `A`): Platzwart/Hauswart bzw. Betrieb der Anlage, Trainingsgruppen als eigene Kundengruppe (auf `F2` genannt, auf `F5` fehlend), Datenschutz (DSG als Randbedingung), Vereinsverantwortliche als Kontaktperson einer Serie, Gäste/Mitspielende ohne eigenes Konto.
Ausführlich mit Einfluss/Interesse: [`stakeholder-analyse.md`](stakeholder-analyse.md).

## 7. Offene Fragen von Gruppe 2 selbst (`F5`)

| Thema | Frage laut Folie 5 | unsere Fragen dazu (Fragenliste) |
|---|---|---|
| Buchung | Wie und wie weit im Voraus soll gebucht werden? | V-01 bis V-04 |
| Regeln | Welche Regeln und Berechtigungen gelten für welche Kundengruppen und Rollen? | V-05 bis V-08 |
| Stornierung | Wie werden kurzfristige Absagen behandelt – sind Wartelisten sinnvoll? | V-09 bis V-11 |
| Serien | Wie funktionieren regelmässige Vereins- oder Trainingsbuchungen? | V-12 bis V-14 |
| Information | Welche Benachrichtigungen und Informationen sind erforderlich? | V-15, V-16 |
| Steuerung | Welche Übersichten und Auswertungen benötigt die Geschäftsleitung? | V-17, V-18 |

Gruppe 2 lässt diese Punkte laut `N5` **bewusst offen**, damit wir sie ermitteln. Das heisst für uns: Hier dürfen wir nichts vorwegnehmen, sondern müssen fragen – und die Antworten als Entscheide von Gruppe 2 dokumentieren.

## 8. Lücken, Widersprüche, Unklarheiten

Geprüft gegen die Problemliste von Folie 47 (Block 1).

| # | Befund | Art (Folie 47) | Warum es zählt | Frage |
|---|---|---|---|---|
| L-01 | **Keine Zahlen**: Anzahl Plätze/Hallen, Buchungen pro Woche, Öffnungszeiten, Mitarbeitende am Empfang, Anteil Doppelbuchungen, Auslastung | unmessbare Ziele / NFR | ohne Ausgangswerte sind die Ziele von `F4` nicht prüfbar (Folie 45 «prüfbar») | V-19, V-20 |
| L-02 | **Bezahlung und Preise** fehlen ganz; Finanzbuchhaltung ist ausgeschlossen, die Zahlung bei der Buchung nicht | unvollständig | Online-Zahlung, Rechnung an Firmen/Vereine, Stornogebühren ändern den Umfang stark | V-21 |
| L-03 | «vollständiges CRM» ausgeschlossen, aber **Kundengruppen mit eigenen Regeln** sind im Scope → irgendeine Kundenverwaltung (Konto, Gruppe, Kontakt) ist nötig | potenziell inkonsistent | Grenze zwischen «Kundenkonto für Buchung» und «CRM» festlegen, sonst Streit bei der Abnahme | V-22 |
| L-04 | **Trainer** sind Stakeholder, Personalplanung ist ausgeschlossen. Buchen Trainer selbst? Wird ein Trainer einer Buchung zugeordnet? | unklare Abgrenzung | Trainerstunde = Platz + Person; wenn Person dazugehört, berührt das die Personalplanung | V-23 |
| L-05 | «Komfortablerer Buchungsprozess für Kunden» – **buchen Kunden selbst (Self-Service) oder weiterhin über den Empfang?** | Lösungs- vs. Anforderungsdenken (nicht entschieden) | grösste Weiche für den ganzen Umfang (Kundenoberfläche, Registrierung, Regeln) | V-01 |
| L-06 | Kundengruppen: `F2` nennt vier (Privat, Vereine, Firmen, Trainingsgruppen), `F5` fasst «Vereine & Firmen» zusammen und nennt Trainingsgruppen nicht | uneinheitliche Terminologie | Vereine (Serien, Saison) und Firmen (Events, Rechnung) buchen vermutlich verschieden | V-05 |
| L-07 | **Mehrzweckhallen**: ganze Halle oder Teile (z. B. Hallendrittel)? Ein Hallenfeld kann mehrere Badmintonfelder enthalten | versteckte Anforderung | bestimmt, was eine «Ressource» ist und wann eine Doppelbuchung vorliegt | V-24 |
| L-08 | «interne Listen» – Papier, Excel, Kalender? Was davon muss übernommen werden (bestehende Serien, Vereinsverträge)? | unvollständig | Datenübernahme beim Start | V-25 |
| L-09 | Stakeholder «IT»: hat ein mittelgrosses Sportzentrum eine eigene IT oder einen externen Dienstleister? | unklare Verantwortung | wer betreibt das System, wer entscheidet Make-or-Buy | V-26 |
| L-10 | Wer **gibt die Spezifikation frei** und entscheidet bei Konflikten zwischen Kundengruppen? (`N5` nennt GL für Priorisierung) | unklare Verantwortung | ohne Entscheider bleiben Zielkonflikte offen | V-27 |
| L-11 | **Datenschutz** wird nicht erwähnt, obwohl Personendaten (Name, Telefon, E-Mail, Buchungsverlauf) bearbeitet werden | versteckte Anforderung | Randbedingung DSG (siehe Abschnitt 11) | V-28 |
| L-12 | **Saison und Wetter** (Aussenplätze? Hallenumbau Sommer/Winter?) nicht erwähnt | versteckte Anforderung | Sperrzeiten, wetterbedingte Absagen, Saisonserien | V-29 |
| L-13 | «Bedürfnisse von Kunden und Betrieb» steht als Scope-Punkt – das ist kein Gegenstand, sondern der Auftrag selbst | unscharfe Abgrenzung | nicht als Scope-Element verwenden; durch konkrete Funktionsbereiche ersetzen | – (in Spezifikation bereinigen) |
| L-14 | Ziele ohne Zeitpunkt und ohne Zielwert | unmessbar | Zielhierarchie braucht Messgrösse und Termin | V-19 |

## 9. Risiken

### 9.1 Risiken im Projekt ArenaOne (fachlich)

| # | Risiko | Wirkung | Gegenmassnahme in der Spezifikation |
|---|---|---|---|
| R-P1 | Regeln für Kundengruppen widersprechen sich (Vereine wollen feste Primetime-Slots, Privatkunden wollen dieselben Zeiten frei buchen) | Akzeptanzproblem, Konflikte am Empfang | Konflikt explizit machen, Entscheid durch GL dokumentieren (Kontingente als Hypothese H-07) |
| R-P2 | Übergangsphase: alte Kanäle (Telefon, E-Mail) laufen parallel weiter | Doppelbuchungen bleiben, wenn nicht alle Kanäle ins gleiche System buchen | Anforderung «jede Buchung, egal über welchen Kanal, wird im System erfasst» (H-02) |
| R-P3 | Stornoregeln zu streng oder zu lasch | Umsatzverlust oder verärgerte Kundschaft | Stornofrist und Folgen als messbare Regel mit GL-Entscheid |
| R-P4 | Self-Service überfordert Teile der Kundschaft (z. B. ältere Vereinsmitglieder) | weiter viele Anrufe am Empfang | Empfang bucht stellvertretend (H-03), Bedienbarkeits-NFR |
| R-P5 | Datenübernahme der bestehenden Serien vergessen | Chaos am ersten Tag | Anforderung zur Übernahme der laufenden Serien (H-17) |

### 9.2 Risiken für unsere RE-Arbeit

| # | Risiko | Gegenmassnahme |
|---|---|---|
| R-R1 | ArenaOne ist fiktiv (`N1`); Gruppe 2 erfindet Antworten spontan und widerspricht sich später | Antworten protokollieren, Protokoll schriftlich bestätigen lassen; Widersprüche als offene Punkte führen |
| R-R2 | Wir übernehmen unbemerkt Funktionen aus Playtomic & Co. als «Anforderungen» | jede Anforderung mit Quelle; `B` allein reicht nie für «bestätigt»; Benchmark nur als Frage verwenden |
| R-R3 | Interviewzeit in PVA 5 reicht nicht für sechs offene Themen | Fragenliste vorab schicken; im Interview nur priorisierte Fragen; Rest schriftlich |
| R-R4 | Gruppe 2 hat bewusst keine Zahlen geliefert; Ziele bleiben unmessbar | gezielt nach Grössenordnungen fragen; wenn Gruppe 2 keine Zahlen festlegen will: als Annahme mit Begründung kennzeichnen und von Gruppe 2 freigeben lassen |
| R-R5 | PVA-Daten unbekannt, Zeitplan kippt | Platzhalter im RE-Plan, Rückwärtsplanung ab PVA 9/10 sobald Datum bekannt |

## 10. Erste Anforderungshypothesen

**Alle Hypothesen sind unbestätigt.** Sie dienen als Gesprächsgrundlage für PVA 5 und werden erst nach Bestätigung durch Gruppe 2 zu Anforderungen in der Spezifikation (mit neuer ID `FA-…`/`QA-…`/`RB-…`). Priorität = unser Vorschlag, zu validieren.

| ID | Hypothese (Anforderung im Entwurf) | Art (Folie 38) | abgeleitet aus | Quelle | Prio-Vorschlag | prüfen mit |
|---|---|---|---|---|---|---|
| H-01 | Das System zeigt die Belegung aller Plätze und Hallen in einer gemeinsamen Übersicht (Tag/Woche, je Anlage). | funktional | Herausforderung 2 | `F3`, `F4` | Muss | V-24 |
| H-02 | Jede Reservation, egal über welchen Kanal sie eingeht (Telefon, E-Mail, Empfang, online), wird im System erfasst; ausserhalb des Systems gibt es keine verbindliche Reservation. | funktional / Randbedingung (organisatorisch) | Herausforderungen 1–3 | `F2`, `F3` + `A` | Muss | V-01 |
| H-03 | Mitarbeitende am Empfang können Reservationen für Kunden erfassen, ändern und stornieren. | funktional | Empfang koordiniert | `F2`, `N5` | Muss | V-01 |
| H-04 | Das System verhindert, dass dieselbe Ressource zur selben Zeit zweimal reserviert wird. | funktional (hart) | Herausforderung 3 | `F3` | Muss | V-24 |
| H-05 | Kunden können freie Zeiten selbst sehen und online reservieren. | funktional | Nutzen «komfortabler für Kunden» | `F4` + `A` (Self-Service nicht gesagt) | Soll (offen) | V-01 |
| H-06 | Für jede Kundengruppe gelten eigene Buchungsregeln (z. B. Buchungsvorlauf, maximale Dauer, Anzahl offener Buchungen). | funktional | Herausforderung 5, Frage «Regeln» | `F3`, `F5` | Muss | V-02, V-05 |
| H-07 | Die Geschäftsleitung kann Zeitfenster für bestimmte Kundengruppen reservieren (Kontingente, z. B. Vereinstraining am Abend). | funktional | Herausforderung 5/6 | `A` | Soll | V-06 |
| H-08 | Eine wiederkehrende Reservation (Serie) wird einmal erfasst (Wochentag, Zeit, Ressource, Zeitraum) und erzeugt alle Einzeltermine; Konflikte werden vor dem Speichern angezeigt. | funktional | Herausforderung 6, Frage «Serien» | `F3`, `F5`; Konfliktanzeige `B` (Playtomic) | Muss | V-12, V-13 |
| H-09 | Ein einzelner Termin einer Serie kann abgesagt oder verschoben werden, ohne die Serie zu ändern. | funktional | Herausforderung 6 | `A` | Muss | V-14 |
| H-10 | Eine Stornierung gibt die Zeit sofort wieder als frei frei. | funktional | Herausforderung 4 | `F3` | Muss | V-09 |
| H-11 | Für ausgebuchte Zeiten können sich Kunden auf eine Warteliste setzen und werden benachrichtigt, wenn die Zeit frei wird. | funktional | Herausforderung 4, Frage «Stornierung» | `F5` (als Frage), `B` (eTermin) | Soll (offen) | V-11 |
| H-12 | Für kurzfristige Stornierungen gilt eine Frist; was bei späterer Absage passiert, ist je Kundengruppe festgelegt. | funktional / Randbedingung (Geschäftsregel) | Frage «Stornierung» | `F5` + `A` | Muss | V-09, V-10 |
| H-13 | Kunden erhalten eine Bestätigung bei Reservation, Änderung und Stornierung. | funktional | Frage «Information» | `F5` + `A` | Muss | V-15 |
| H-14 | Kunden erhalten vor dem Termin eine Erinnerung. | funktional | Frage «Information», Herausforderung 4 | `B` (eTermin) | Wunsch | V-15 |
| H-15 | Die Geschäftsleitung sieht eine Auslastungsauswertung je Anlage, Zeitfenster und Kundengruppe. | funktional | Ziel «Kapazitäten besser nutzen», Frage «Steuerung» | `F4`, `F5` | Soll | V-17 |
| H-16 | Die Geschäftsleitung (oder Administration) kann Anlagen sperren (Unterhalt, Turnier, Wetter). | funktional | Gesamtübersicht | `A` | Muss | V-29 |
| H-17 | Laufende Serien und bestehende Reservationen aus den heutigen Listen werden vor dem Start übernommen. | Projekt-/Prozessanforderung | interne Listen | `F2` + `A` | Muss | V-25 |
| H-18 | Rollen und Berechtigungen: Kunde, Vereins-/Firmenverantwortliche, Trainer, Empfang, Geschäftsleitung, Administration. | funktional (Berechtigung) | Frage «Regeln» | `F5` + `A` | Muss | V-07, V-08 |
| H-19 | Eine Reservation am Empfang ist in höchstens `[x]` Sekunden erfasst. | Leistung / Qualität | Ziel «Aufwand reduzieren» | `A` | Soll | V-20 |
| H-20 | Die Belegungsübersicht ist während der Öffnungszeiten verfügbar (Zielwert `[x] %`); auch auf dem Smartphone nutzbar. | Qualität | «jederzeit zentral ersichtlich» | `F3` + `A` | Muss | V-30 |
| H-21 | Personendaten werden nach DSG bearbeitet (Zweckbindung, Auskunft, Löschung nach Frist). | Randbedingung (Vorschrift) | Personendaten im System | `A` (DSG, siehe 11) | Muss | V-28 |
| H-23 | Der Empfang kann die Tagesbelegung ausdrucken bzw. offline einsehen, falls das System ausfällt. | Qualität (Ausfallsicherheit) | Rückfall bei Ausfall | `S` (Simulation) + `A` | Soll | V-30 |
| H-22 | Das System ist nicht für Finanz-/Lohnbuchhaltung, Personalplanung, Gastronomie und CRM zuständig. | Abgrenzung | Scope | `F4` | – | – |

## 11. Randbedingungen, die schon jetzt gelten

| Randbedingung | Rolle (Folie 42) | Quelle |
|---|---|---|
| Technische Lösung ist offen; Make-or-Buy wird nach der Spezifikation beurteilt → wir schreiben ein **Lastenheft** (Was/Wofür, Folie 26), keine Produktwahl | Tatsache | `F4`, `N5` |
| Scope-Ausschlüsse (Finanz-/Lohnbuchhaltung, Personalplanung, Gastronomie, vollständiges CRM, technische Architektur) | Vorschrift (des Auftraggebers) | `F4`, `N4` |
| Schweizer Datenschutzrecht: Bundesgesetz über den Datenschutz (DSG) vom 25. September 2020, SR 235.1, in Kraft seit 1. September 2023 | Vorschrift | Fedlex, SR 235.1 – Anwendung auf ArenaOne mit Gruppe 2 klären |
| Standort Raum Zürich, Sprache Deutsch (weitere Sprachen?) | Tatsache / offen | `F2` + `A` |

## 12. Benchmark (kurz)

Die drei Lösungen zeigen, was am Markt üblich ist. Sie liefern **Fragen**, keine Anforderungen: Ob ArenaOne etwas davon braucht, entscheidet Gruppe 2.

| Lösung | Schwerpunkt | was für unsere Fragen interessant ist |
|---|---|---|
| **Playtomic** (Spieler-App + «Playtomic Manager» für Clubs) | Padel und Tennis, internationale Plattform | Belegungskalender je Platz und Sportart; wiederkehrende Reservationen mit Enddatum, Konfliktmeldung bei belegten Zeiten; Online-Zahlung; Kunden mit Guthaben («Wallet»); Mitglieder-Preiskategorien; Mitarbeitende mit Lese- oder Schreibrechten |
| **GotCourts** (GotCourts AG, Schweiz) | Tennisplätze für Clubs, Anlagen, Trainer, Spielende | Buchung per Web und Smartphone, auch für Nicht-Mitglieder; Clubs zahlen ein Abo je nach Anzahl Plätze; Anlagen setzen eigene Preise je Nutzergruppe (Beispiel ASVZ: gestaffelte Stundenpreise nach Zugehörigkeit) |
| **eTermin** (eTermin GmbH, Wallisellen) | allgemeine Online-Terminbuchung, nicht sportspezifisch | Buchen, Umbuchen und Stornieren online; Ressourcen- und Mitarbeiterpläne; Erinnerungen per E-Mail und SMS; Warteliste; Online-Zahlung; Einbindung in die eigene Website |

Folgerungen für die Ermittlung: (1) Ob ArenaOne eine sportspezifische Plattform (Playtomic, GotCourts) oder ein allgemeines Buchungswerkzeug (eTermin) braucht, hängt von Antworten zu Serien, Hallenteilung und Kundengruppen ab – genau deshalb dort genau spezifizieren (risikogerecht, Folie 23). (2) Zahlung und Preise sind bei allen drei zentral; bei ArenaOne fehlen sie (L-02). (3) Die Benchmarks dürfen im Interview nur als Frage auftauchen («Andere Anlagen bieten X – ist das für Sie ein Thema?»), nie als Vorschlag.

### Quellen Benchmark (abgerufen am 25.10.2026)

- Playtomic (o. J.). *Recurring booking*. https://help.playtomic.com/en/articles/5689381-recurring-booking
- Playtomic (o. J.). *Brief introduction to Playtomic Manager*. https://helpmanager.playtomic.com/hc/en-gb/articles/20535516949009-Brief-introduction-to-Playtomic-Manager
- Playtomic (o. J.). *Schedule basics*. https://helpmanager.playtomic.com/hc/en-gb/articles/20560058451985-Schedule-basics
- startupticker.ch (o. J.). *GotCourts AG – Company profile*. https://www.startupticker.ch/en/company/gotcourts-ag
- ASVZ (o. J.). *Stundenpreise Tennisplätze ganzes Jahr* [PDF]. https://www.asvz.ch/sites/default/files/imce/documents/_SPORTARTEN/Tennis/Stundenpreise%20Tennispl%C3%A4tze%20ganzes%20Jahr.pdf
- Softguide (o. J.). *eTermin*. https://www.softguide.de/programm/etermin
- IT Reseller (2016). *eTermin sahnt Innovationspreis-IT Schweiz ab*. https://www.itreseller.ch/Artikel/81931/eTermin_sahnt_Innovationspreis-IT_Schweiz_ab.html

Die Angaben stammen aus Herstellerhilfen und Drittquellen; vor Verwendung in der Spezifikation oder Präsentation auf den Herstellerseiten nachprüfen.

## 13. Nächste Schritte

1. Fragenliste [`fragenliste-gruppe2.md`](fragenliste-gruppe2.md) an Gruppe 2 schicken (Kanal klären, O9), Antworten vor PVA 5 einarbeiten.
2. Interview PVA 5 mit dem [Leitfaden](interviewleitfaden-pva5.md) führen; Hypothesen H-01 … H-22 bestätigen, verwerfen oder ändern.
3. Danach Spezifikation v0.1 → v0.3 aus der [Vorlage](anforderungsspezifikation-vorlage.md); Hypothesen mit Status «bestätigt» werden Anforderungen, der Rest wandert in «Offene Punkte».
