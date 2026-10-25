# RE-Vorgehensplan – Gruppe 9 als Requirements Engineers für Gruppe 2 (ArenaOne)

Artefakt **R1** aus dem Fahrplan (Abschnitt 3.2). Stand: 25.10.2026, **befüllt** auf Grundlage der Projektvorstellung von Gruppe 2 (Analyse: [`analyse-arenaone.md`](analyse-arenaone.md)).
Begriffe und Folien-Nummern wie in `notizen/kurs-konzepte.md` (Folie = Seite in `material/RE_Block1.pdf`). Quellenkürzel `F`/`N`/`A`/`B`/`S` wie in der Analyse, Abschnitt «Quellenkürzel».

> **Noch offen:** Daten der PVA (`[Datum PVA n]`, nichts davon ist bekannt), Namen und Kontaktkanal der Ansprechpersonen bei Gruppe 2 (`[G2: …]`).

## 1. Auftrag und Projekt

| Punkt | Inhalt |
|---|---|
| Auftraggeber | Gruppe 2 in der Rolle als Stakeholder: **ArenaOne Sportzentrum AG**, fiktives mittelgrosses Sportzentrum im Raum Zürich (`F2`, `N1`) |
| Projekt | **Buchungs- und Belegungsmanagement für Sportplätze und Hallen** (Padel, Tennis, Badminton, Mehrzweckhallen) (`F1`, `F2`) |
| Auftrag ans RE-Team | «Anforderungen ermitteln · dokumentieren · validieren · verwalten» (`F5`); die konkrete Lösung soll im RE-Prozess ermittelt werden, nicht vorgegeben (`N1`, `N5`) |
| Ziel laut Auftraggeber | Buchungs- und Belegungsprozess vereinfachen, Transparenz über verfügbare Kapazitäten erhöhen, administrativen Aufwand reduzieren, Kapazitäten besser nutzen (`F4`) |
| Umfang | im Scope: Verfügbarkeiten, Reservationen, Änderungen, Stornierungen, wiederkehrende Buchungen; nicht im Scope: Finanz- und Lohnbuchhaltung, Personalplanung, Gastronomie, vollständiges CRM, technische Architektur (`F4`, `N4`) |
| Ansprechpersonen | `[G2: Namen/Rollen in Gruppe 2, Kanal (E-Mail, Teams, WhatsApp)]` – an PVA 5 spätestens klären |
| Unterlagen | Präsentation PVA 2: `material/Praesentation_ArenaOne.pptx` (+ PDF), privat |
| Neues System oder Änderung? | **Neu**: heute gibt es kein Buchungssystem, sondern Telefon, E-Mail, Empfang und interne Listen (`F2`). Das Teilsystem-Vorgehen nach Folie 17/18 ist deshalb nur am Rand nötig (Abgrenzung zu bestehender Website, Telefon, Buchhaltung – siehe [Kontextdiagramm](kontextdiagramm.md), Abschnitt C) |
| Art der Spezifikation | Anforderungsspezifikation aus Anwendersicht, inhaltlich ein **Lastenheft** (*Was? Wofür?*, Folie 26). Gruppe 2 will danach Make-or-Buy beurteilen (`N5`) – die Spezifikation muss also auch als Grundlage für den Vergleich mit Standardprodukten (z. B. Playtomic, GotCourts, eTermin) taugen, ohne eines vorzugeben |

## 2. Prozessmodell: der RE-Kreislauf

Wir arbeiten nach dem **Kreislauf von Folie 28** und ordnen die vier Phasen des Merkblatts darin ein. Der Kreislauf ist «kein linearer Fluss»: Wir durchlaufen ihn mindestens zweimal – einmal vor PVA 5 (Hypothesen aus der Präsentation, Probelauf mit dem simulierten Interview) und einmal nach PVA 5 (echte Antworten von Gruppe 2).

| Kreislauf (Folie 28) | Merkblatt-Phase | Aufgaben laut Folie 27 | Ergebnis für ArenaOne |
|---|---|---|---|
| 1 Ermitteln – Stakeholder, Quellen, Bedürfnisse | **Ermitteln** | gewinnen, analysieren | [Analyse der Präsentation](analyse-arenaone.md), [Stakeholder-Analyse](stakeholder-analyse.md), [Kontextdiagramm](kontextdiagramm.md), [Zielhierarchie](zielhierarchie.md), [Fragenliste](fragenliste-gruppe2.md), [Interviewleitfaden](interviewleitfaden-pva5.md), Protokoll PVA 5 |
| 2 Dokumentieren – schriftlich, modellhaft, eindeutig | **Dokumentieren** | dokumentieren | Anforderungsspezifikation (Kernabgabe), [Glossar](glossar.md), Modelle (Kontext, später Use Cases) |
| 3 Prüfen & Abstimmen – Qualität, Konsistenz, Akzeptanz | **Validieren** (Teil 1) | validieren | interne Prüfung gegen Folie 45/47, Abstimmung mit Gruppe 2 |
| 4 Verwalten – versionieren, verfolgen, ändern | **Verwalten** | freigeben, ändern, rückverfolgen | Versionen v0.1 … v1.0, Änderungsliste, Nachverfolgbarkeit Ziel → Anforderung → Quelle |
| 5 Validieren – «Hält die Spec im System?» | **Validieren** (Teil 2) | validieren | Szenarien mit Gruppe 2 durchspielen (z. B. «Verein bucht Wintersaison», «Absage 2 h vorher»), optional KI-App als Test (R13) |

Massstab für den Umfang ist **risikogerecht** (Folie 22/23): «Wie viel müssen wir tun, damit das Risiko eine Grösse annimmt, die wir bereit sind zu akzeptieren?» Für ArenaOne heisst das (Abschnitt 4): genau spezifizieren, wo Konflikte und Regeln stecken (Kundengruppen, Serien, Stornos, Ressourcen in Mehrzweckhallen), knapp, wo es Standard ist (Anmelden, Bestätigungs-E-Mail).

## 3. Rollen in unserem RE-Team

Gruppe 9 besteht aus **zwei Personen**. Jede Person muss trotzdem den ganzen Prozess erklären können (Bewertung «Zusammenhänge verstehen» 40 %).

| Rolle | Person | Verantwortung |
|---|---|---|
| **RE-Lead, Moderation, Präsentation** | Görkem Taspinar | Kontakt zu Gruppe 2, führt das Interview in PVA 5, entscheidet bei Uneinigkeit im Team, Zwischenstand PVA 6, Präsentation und Moderation der Diskussion PVA 9/10, Zeitplan |
| **Spezifikation, Qualität** | Ardian Ibrahimaj | protokolliert das Interview und achtet auf Messbarkeit, Glossar, Anforderungsspezifikation, Versionen und Änderungsliste, Prüfung gegen Qualitätsmerkmale (Folie 45) und Problemliste (Folie 47), Validierung mit Gruppe 2 |

**Präsentation PVA 9/10:** Sprechanteile ungefähr hälftig (Görkem ca. 10 min, Ardian ca. 9,5 min) – Görkem: Titel, Auftrag, Vorgehen, Stakeholder und Kontext, Ziele, Lessons Learned, Überleitung; Ardian: funktionale Anforderungen, Qualitätsanforderungen, Priorisierung, Validierung und Verwaltung. Die Diskussion moderiert Görkem, Ardian führt die Zeit und beantwortet Detailfragen zur Spezifikation (Gliederung).

## 4. Risikoeinschätzung

Entscheidungsbaum Folie 22: Anforderungen schon bekannt? → Risiko tolerabel gering, dass der Kunde das System nicht akzeptiert? → sonst Spezifikation notwendig. Einschätzung nach Dokumentenanalyse (vor PVA 5).

| Bereich | bekannt? | Risiko bei Missverständnis | Spezifikationstiefe | Begründung |
|---|---|---|---|---|
| Belegungsübersicht, Einzelreservation | teilweise (`F3`, `F4`) | mittel | genau bei Doppelbuchung/Ressourcenbegriff, sonst knapp | Kern des Systems; Doppelbuchungen sind ein genanntes Problem |
| Kundengruppen, Regeln, Berechtigungen | nein (von Gruppe 2 offen gelassen, `F5`) | **hoch** | **genau** | Zielkonflikte zwischen Gruppen, wirkt auf Akzeptanz und Umsatz |
| Serien (Vereine, Trainings) | nein (`F5`) | **hoch** | **genau** | Ausnahmen (Ferien, einzelne Absage) sind typische versteckte Anforderungen |
| Stornierung, Warteliste | nein (`F5`) | **hoch** | **genau** | Geld (Stornogebühr?) und Kapazitätsnutzung |
| Benachrichtigungen | nein (`F5`) | gering | knapp | Standardfunktion |
| Auswertungen für die GL | nein (`F5`) | mittel | Kennzahlen genau, Darstellung knapp | messbare Ziele hängen daran |
| Daten (Kundendaten, Aufbewahrung) | nein | mittel | genau bei Abgrenzung zum CRM und beim Datenschutz | Scope-Grenze «vollständiges CRM» ist unscharf (L-03) |
| Schnittstellen (Website, Zahlung, Buchhaltung, Zutritt) | nein | mittel | Grenze genau, Inhalt knapp | Zahlung ist nicht geklärt (L-02) |
| Qualität (Verfügbarkeit, Antwortzeit, Bedienbarkeit, Mobilgeräte) | nein | mittel | messbare Fit-Kriterien | sonst «unmessbare NFR» (Folie 47) |
| Rechtliche Randbedingungen (DSG) | ja (Gesetz) | mittel | knapp, mit Quelle | Vorschrift, nicht verhandelbar |

## 5. Ermittlungstechniken mit Begründung

> Ermittlungstechniken werden laut Roadmap (Folie 2) in Block 3 behandelt. Die Auswahl ist mit Block 1 begründet; nach Block 3 Namen und Vorgehen an die Folien angleichen.

| Technik | Wann | Wozu | Begründung (Block 1) |
|---|---|---|---|
| **Dokumentenanalyse** der Präsentation PVA 2 | erledigt 25.10.2026 | Ziele, Scope, Probleme, offene Fragen, Lücken | Quellen sind Teil von «Ermitteln» (Folie 28); im Interview nichts abfragen, was schon auf den Folien steht → [`analyse-arenaone.md`](analyse-arenaone.md) |
| **Benchmark** (Playtomic, GotCourts, eTermin) | erledigt, kurz | Fragen finden, an die Gruppe 2 vielleicht nicht gedacht hat (Zahlung, Warteliste, Erinnerungen) | gegen «unvollständige» und «versteckte» Anforderungen (Folie 47); Benchmark liefert nur **Fragen**, keine Anforderungen (Kundenorientierung, Folie 21) |
| **Schriftliche Vorab-Fragen** | vor PVA 5 | Zahlen und Fakten, die man nachschlagen muss (Anzahl Plätze, Öffnungszeiten), damit das Interview Zeit für Regeln und Konflikte hat | → [`fragenliste-gruppe2.md`](fragenliste-gruppe2.md) |
| **Probelauf: simuliertes Interview** (Rollenspiel im Team) | vor PVA 5 | Leitfaden testen (Zeit, Reihenfolge, Lücken), Gesprächsführung üben, erwartbare Konflikte vorab durchdenken | → [`simuliertes-interview-pva5.md`](simuliertes-interview-pva5.md). **Ersetzt nicht die Ermittlung mit Gruppe 2**; Antworten daraus haben die Quelle `S` und gelten bis zur Bestätigung als Annahme |
| **Interview** (teilstrukturiert, nach Stakeholder-Rollen) | PVA 5 | Regeln, Abläufe, Ausnahmen, Qualitätsziele mit Mass, Prioritäten | Leitfaden [`interviewleitfaden-pva5.md`](interviewleitfaden-pva5.md); gezielt nach versteckten und unmessbaren Anforderungen fragen (Folie 47) |
| **Szenario-Walkthrough** (statt Beobachtung, da ArenaOne fiktiv ist) | PVA 5, letzter Teil, oder online danach | einen typischen Tag am Empfang und eine Vereinsserie Schritt für Schritt durchspielen | «Integration von Erstellung und Prüfung» (Folie 46); [`vorlagen/workshop-beobachtung.md`](vorlagen/workshop-beobachtung.md) |
| **Review der Spezifikation** durch Gruppe 2 | nach v0.5 | Akzeptanz, Korrekturen, Freigabe | Prüfen & Abstimmen, Validieren (Folie 28); Fehler früh finden (Folie 33/34) |

## 6. Ablauf entlang der PVA

Termine laut Merkblatt fett; die übrigen Zeilen sind unsere Planung. Daten sind noch nicht bekannt.

| Wann | Kreislauf-Phase | Aktivitäten RE-Team | Ergebnis (Fahrplan-ID) | verantwortlich |
|---|---|---|---|---|
| **PVA 2** | Ermitteln | Projektvorstellung von Gruppe 2 erhalten | Präsentation in `material/` | – (erledigt) |
| bis 25.10.2026 | Ermitteln | Dokumentenanalyse, Benchmark, RE-Plan, Stakeholder-Analyse, Kontextdiagramm, Zielhierarchie, Glossar, Leitfaden, Fragenliste, simuliertes Interview | R1–R5 (Entwurf) | Görkem, Ardian |
| vor PVA 5 | Ermitteln | Fragenliste an Gruppe 2 schicken, Kanal und Ansprechpersonen klären; Leitfaden nach dem Probelauf kürzen | Antworten auf Vorab-Fragen | Görkem |
| vor PVA 5 | Dokumentieren | Spezifikation v0.1: Gliederung, Ziele, Hypothesen als Entwurf (Quelle `F`/`A`/`B`/`S` sichtbar) | R6 v0.1 | Ardian |
| **PVA 5** `[Datum PVA 5]` | Ermitteln | **Interview mit Gruppe 2** (Leitfaden, ca. 45 min), Szenario-Walkthrough, Prioritäten; Protokoll am selben Tag | Protokoll, offene Punkte | Görkem führt, Ardian protokolliert und prüft Messbarkeit |
| PVA 5 → 6 | Dokumentieren, Prüfen & Abstimmen | Protokoll an Gruppe 2 zur Bestätigung; Hypothesen und Simulation gegen das echte Protokoll abgleichen (bestätigt / geändert / verworfen); Spezifikation v0.3; interne Prüfung gegen Folie 45 | R6 v0.3 | Ardian |
| **PVA 6** `[Datum PVA 6]` | (Standortbestimmung) | **Kurzvorstellung Zwischenstand gemeinsam mit Gruppe 2**: Phase im Kreislauf, erste Erkenntnisse ([`zwischenstand-pva6.md`](zwischenstand-pva6.md)) | R9 | Görkem (spricht), Ardian (Folien) |
| PVA 6 → 7 | Prüfen & Abstimmen, Verwalten | Rückmeldungen einarbeiten, v0.5 an Gruppe 2 zum Review; Änderungsliste | R6 v0.5, R8 | Ardian |
| PVA 7 | Validieren | Review-Befunde bearbeiten, Szenarien gegen die Spezifikation prüfen, Konflikte von der GL (Gruppe 2) entscheiden lassen | R7 | Ardian, Görkem |
| PVA 8 | Verwalten, Validieren | Freigabe v1.0, Nachverfolgbarkeit vervollständigen; optional KI-App (R13); Präsentation und Diskussion vorbereiten, Probelauf mit Stoppuhr | R6 v1.0, R10, R11, R12 | beide |
| **PVA 9/10** `[Datum PVA 9/10]` | – | **ca. 20 min Präsentation, ca. 15 min Diskussion moderieren, Spezifikation einreichen** | Abgabe | beide |

## 7. Werkzeuge und Ablage

| Zweck | Werkzeug | Ort |
|---|---|---|
| Arbeitsstände, Versionen | Git-Repository (privat) | `re-gruppe2/` |
| Präsentation von Gruppe 2 | Original + PDF, nur intern | `re-gruppe2/material/` |
| Spezifikation | Markdown als Quelle, daraus PDF und Word | `anforderungsspezifikation-vorlage.md` → `anforderungsspezifikation.md` |
| Modelle | Mermaid im Markdown, als PNG exportiert | `re-gruppe2/modelle/` |
| Austausch mit Gruppe 2 | `[G2: Kanal]`; Entscheide schriftlich bestätigen lassen | Protokolle in `re-gruppe2/protokolle/` (nur echte Protokolle, keine Simulation) |
| Präsentation | PowerPoint (PPTX) + PDF | `re-gruppe2/praesentation-pva9-10/` |
| Qualitätsprüfung | Checklisten Folie 45 und 47, [Merkblatt-Checkliste](merkblatt-checkliste.md) | Spezifikation Kapitel 10 |

## 8. Artefakte (Übersicht)

| ID | Artefakt | Datei | Status |
|---|---|---|---|
| R1 | RE-Plan | dieses Dokument | befüllt |
| – | Merkblatt-Checkliste | [`merkblatt-checkliste.md`](merkblatt-checkliste.md) | fertig |
| – | Analyse der Präsentation | [`analyse-arenaone.md`](analyse-arenaone.md) | fertig |
| R2 | Stakeholder-Analyse | [`stakeholder-analyse.md`](stakeholder-analyse.md) | Hypothese, Validierung PVA 5 |
| R3 | Systemkontext / Kontextdiagramm | [`kontextdiagramm.md`](kontextdiagramm.md), [`modelle/kontextdiagramm.png`](modelle/kontextdiagramm.png) | Hypothese |
| R4 | Zielhierarchie | [`zielhierarchie.md`](zielhierarchie.md) | Hypothese, Zielwerte = Annahmen |
| R5 | Interviewleitfaden, Fragenliste, Probelauf | [`interviewleitfaden-pva5.md`](interviewleitfaden-pva5.md), [`fragenliste-gruppe2.md`](fragenliste-gruppe2.md), [`simuliertes-interview-pva5.md`](simuliertes-interview-pva5.md) | fertig; echtes Protokoll nach PVA 5 |
| – | Glossar | [`glossar.md`](glossar.md) | Entwurf, Begriffe von Gruppe 2 bestätigen lassen |
| R6 | Anforderungsspezifikation | [`anforderungsspezifikation-vorlage.md`](anforderungsspezifikation-vorlage.md) (+ DOCX) | Vorlage; v0.1 als Nächstes |
| R7, R8 | Validierung, Versionen, Nachverfolgbarkeit | in der Spezifikation, Kapitel 9–11 | ab v0.3 |
| R9 | Zwischenstand PVA 6 | [`zwischenstand-pva6.md`](zwischenstand-pva6.md) | Gerüst |
| R10–R12 | Präsentation, Diskussion, Q&A | [`praesentation-pva9-10/`](praesentation-pva9-10/) | Gerüst / generisch |
| R13 | optional: KI-App | – | offen (O7) |

Die leeren Vorlagen in [`vorlagen/`](vorlagen/) bleiben als Muster stehen; die befüllten Fassungen liegen direkt in `re-gruppe2/`.

## 9. Risiken für unsere RE-Arbeit

| Risiko | Gegenmassnahme |
|---|---|
| ArenaOne ist fiktiv; Gruppe 2 erfindet Antworten und widerspricht sich später | Protokoll schriftlich bestätigen lassen; Widersprüche als offene Punkte mit Entscheider (GL) |
| Antworten aus dem simulierten Interview werden versehentlich als Kundenaussage behandelt | Quelle `S` in jeder Tabelle; Spezifikation zeigt den Status «Simulation – zu validieren»; im echten Interview gezielt nachfragen |
| Benchmark-Funktionen schleichen sich als Anforderungen ein | Quelle `B` reicht nie allein; im Interview nur als Frage |
| Zeit in PVA 5 reicht nicht | Vorab-Fragenliste; Interview nach Prioritäten (★) |
| Nur zwei Personen: Ausfall einer Person | beide kennen alle Artefakte; alles im Repository, nichts nur im Kopf |
| Format der Spezifikation weicht von der Dozentenvorlage ab | IEEE 830 + Volere-Attribute als Arbeitsannahme, nach Block 2 anpassen |
| PVA-Daten unbekannt | Rückwärtsplanung, sobald Datum PVA 9/10 bekannt |
