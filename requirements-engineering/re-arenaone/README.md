# ArenaOne – Requirements Engineering für Gruppe 2

Gruppenarbeit Requirements Engineering HS26, HWZ Hochschule für Wirtschaft Zürich, BWI-A24-5, Dozent Dr. Joachim Steinwendner.
**Gruppe 9: Görkem Taspinar und Ardian Ibrahimaj** in der Rolle als Requirements Engineers für Gruppe 2.

Auftraggeber ist Gruppe 2 in der Rolle der **ArenaOne Sportzentrum AG**, eines fiktiven Sportzentrums im Raum Zürich (Padel, Tennis, Badminton, Mehrzweckhallen). Heute laufen Reservationen über Telefon, E-Mail, Empfang und interne Listen; gesucht sind die Anforderungen an ein zentrales Buchungs- und Belegungssystem.

> **Stand: Spezifikation v0.6 – Annahmen noch in PVA 5 zu validieren.** Das Interview mit Gruppe 2 hat noch nicht stattgefunden. Belegt ist nur, was in der Projektvorstellung von Gruppe 2 steht. Alles andere ist als Annahme (`A`), Benchmark (`B`) oder **Simulation** (`S`) gekennzeichnet. Das [simulierte Interview](simuliertes-interview-pva5.md) ist ein Rollenspiel zur Vorbereitung und ersetzt nicht die Ermittlung mit Gruppe 2; nichts daraus ist eine Aussage von Gruppe 2.

## Abgabe

| Dokument | Lesen | Dateien |
|---|---|---|
| **Anforderungsspezifikation** (Lastenheft, 35 funktionale und 16 Qualitätsanforderungen, 9 Use Cases) | [Webseite](anforderungsspezifikation-arenaone.html) | [PDF](anforderungsspezifikation-arenaone.pdf) · [Word](anforderungsspezifikation-arenaone.docx) · [Markdown](anforderungsspezifikation-arenaone.md) |
| **Lösungspräsentation PVA 9/10** (20 min, Sprechernotizen in der PPTX) | [PDF](praesentation-pva9-10/RE_ArenaOne_Loesung.pdf) | [PowerPoint](praesentation-pva9-10/RE_ArenaOne_Loesung.pptx) |
| Diskussion PVA 9/10: Leitfragen und Moderationsplan (15 min) | [Webseite](praesentation-pva9-10/diskussion-moderation.html) | [PDF](praesentation-pva9-10/diskussion-moderation.pdf) · [Markdown](praesentation-pva9-10/diskussion-moderation.md) |
| Zwischenstand PVA 6 | [Webseite](zwischenstand-pva6.html) · [Folien (PDF)](praesentation-pva9-10/RE_ArenaOne_Zwischenstand_PVA6.pdf) | [PowerPoint](praesentation-pva9-10/RE_ArenaOne_Zwischenstand_PVA6.pptx) · [PDF](zwischenstand-pva6.pdf) · [Markdown](zwischenstand-pva6.md) |

## Ermittlung und Planung

| Dokument | Lesen | Dateien |
|---|---|---|
| RE-Vorgehensplan | [Webseite](re-plan.html) | [PDF](re-plan.pdf) · [Markdown](re-plan.md) |
| Analyse der Projektvorstellung (Ziele, Scope, Lücken, Hypothesen, Benchmark) | [Webseite](analyse-arenaone.html) | [PDF](analyse-arenaone.pdf) · [Markdown](analyse-arenaone.md) |
| Stakeholder-Analyse | [Webseite](stakeholder-analyse.html) | [PDF](stakeholder-analyse.pdf) · [Markdown](stakeholder-analyse.md) |
| Kontextdiagramm (Hypothese) | [Webseite](kontextdiagramm.html) | [PDF](kontextdiagramm.pdf) · [Bild](modelle/kontextdiagramm.png) · [Markdown](kontextdiagramm.md) |
| Zielhierarchie | [Webseite](zielhierarchie.html) | [PDF](zielhierarchie.pdf) · [Markdown](zielhierarchie.md) |
| Glossar | [Webseite](glossar.html) | [PDF](glossar.pdf) · [Markdown](glossar.md) |
| Interviewleitfaden PVA 5 mit Protokollvorlage | [Webseite](interviewleitfaden-pva5.html) | [PDF](interviewleitfaden-pva5.pdf) · [Markdown](interviewleitfaden-pva5.md) |
| Fragenliste an Gruppe 2 | [Webseite](fragenliste-gruppe2.html) | [PDF](fragenliste-gruppe2.pdf) · [Markdown](fragenliste-gruppe2.md) |
| **Simuliertes Interview** (Rollenspiel zur Vorbereitung, kein Protokoll) | [Webseite](simuliertes-interview-pva5.html) | [PDF](simuliertes-interview-pva5.pdf) · [Markdown](simuliertes-interview-pva5.md) |
| Merkblatt-Checkliste (jede Vorgabe mit Artefakt und Stand) | [Webseite](merkblatt-checkliste.html) | [PDF](merkblatt-checkliste.pdf) · [Markdown](merkblatt-checkliste.md) |
| Modelle (Kontext- und Use-Case-Diagramm) | [Use-Case-Diagramm](modelle/use-case-diagramm-arenaone.png) | [Ordner](https://github.com/gotazlib/abgaben/tree/main/requirements-engineering/re-arenaone/modelle) |
| Leere Vorlagen und Spezifikationsvorlage | [Spezifikationsvorlage](anforderungsspezifikation-vorlage.html) | [Ordner vorlagen](https://github.com/gotazlib/abgaben/tree/main/requirements-engineering/re-arenaone/vorlagen) |

## KI-Experiment (optionale Aufgabe des Merkblatts)

Ein KI-Agent bekam nur die Spezifikation v0.5 und sollte daraus ohne Rückfragen eine App bauen. Jede Stelle, an der er raten musste, zeigt eine Lücke der Spezifikation; die Befunde sind in v0.6 eingearbeitet.

| | |
|---|---|
| **App ausprobieren** (läuft im Browser, Daten bleiben im Browser) | [ki-app/app/](ki-app/app/index.html) – Kundschaft `anna` / `demo1234`, Mitarbeitende `empfang`, `gl`, `admin` / `arenaone-demo` |
| Auswertung: Hatte der Agent alle nötigen Requirements? | [Webseite](ki-app/analyse.html) · [PDF](ki-app/analyse.pdf) · [Markdown](ki-app/analyse.md) |
| Versuchsaufbau, Auftrag an den Agenten, KI-Deklaration | [Webseite](ki-app/README.html) · [PDF](ki-app/README.pdf) |
| Protokoll des Agenten, seine Annahmen und Fragen | [Protokoll](ki-app/agent-protokoll.html) · [Annahmen](ki-app/app/ANNAHMEN.html) |
| Screenshots und Testskript | [Screenshots](https://github.com/gotazlib/abgaben/tree/main/requirements-engineering/re-arenaone/ki-app/screenshots) · [Test](https://github.com/gotazlib/abgaben/tree/main/requirements-engineering/re-arenaone/ki-app/test) |

Die App ist ein Test der Spezifikation, kein Lösungsvorschlag für ArenaOne.

## Nicht veröffentlicht

- die Projektvorstellung von Gruppe 2 (fremde Gruppenarbeit) – zitiert als «Gruppe 2 (2026), Folie n»,
- Kursunterlagen der HWZ,
- interne Arbeitsnotizen, Prüfprotokolle und Werkzeuge der Gruppe.

Verweise in den Dokumenten auf solche Dateien sind hier als Text ohne Link stehen geblieben.

Zurück zu [Requirements Engineering](../README.md).
