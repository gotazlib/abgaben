# RE-Vorgehensplan – Gruppe 9 als Requirements Engineers für Gruppe 2 (ArenaOne)

Artefakt **R1** aus dem Fahrplan (Abschnitt 3.2). Stand: 28.10.2026 (Spezifikation v0.7), **befüllt** auf Grundlage der Projektvorstellung von Gruppe 2 (Analyse: [`analyse-arenaone.md`](analyse-arenaone.md)).
Begriffe und Folien-Nummern wie in `notizen/kurs-konzepte.md` (Folie = Seite in `material/RE_Block1.pdf`). Quellenkürzel `F`/`N`/`A`/`B`/`S` wie in der Analyse, Abschnitt «Quellenkürzel».

> **Stand 28.10.2026 – erledigt:** Ermittlung vorbereitet (Analyse, Stakeholder, Kontext, Ziele, Fragenliste, Leitfaden mit 12 Muss-Fragen, Probelauf als Simulation), Spezifikation **v0.7** (Kernprozess ohne Self-Service, intern und im KI-Versuch geprüft), Präsentationen PVA 6 und PVA 9/10 gebaut, KI-Experiment (R13) durchgeführt, Bestätigungsliste für Gruppe 2 vorbereitet.
> **Offen:** Interview PVA 5 mit Gruppe 2 (hat noch nicht stattgefunden), Bestätigung von Protokoll und Annahmen durch Gruppe 2 (Abschnitt 6a), Spezifikation v0.8, Review und Freigabe v1.0, Probelauf der Präsentation. Ausserdem unbekannt: Daten der PVA (`[Datum PVA n]`), Namen und Kontaktkanal der Ansprechpersonen bei Gruppe 2 (`[G2: …]`).

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
| 1 Ermitteln – Stakeholder, Quellen, Bedürfnisse | **Ermitteln** | gewinnen, analysieren | [Analyse der Präsentation](analyse-arenaone.md), [Stakeholder-Analyse](stakeholder-analyse.md), [Kontextdiagramm](kontextdiagramm.md), [Zielhierarchie](zielhierarchie.md), [Fragenliste](fragenliste-gruppe2.md), [Interviewleitfaden](interviewleitfaden-pva5.md), Protokoll PVA 5 (offen) |
| 2 Dokumentieren – schriftlich, modellhaft, eindeutig | **Dokumentieren** | dokumentieren | [Anforderungsspezifikation](anforderungsspezifikation-arenaone.md) (Kernabgabe), [Glossar](glossar.md), Modelle (Kontextdiagramm, Use-Case-Diagramm, Aktivitätsdiagramm Soll-Prozess) |
| 3 Prüfen & Abstimmen – Qualität, Konsistenz, Akzeptanz | **Validieren** (Teil 1) | validieren | interne Prüfung gegen Folie 45/47 (erledigt, PB-01 bis PB-17), Abstimmung mit Gruppe 2 über Protokoll und [Bestätigungsliste](annahmen-bestaetigung-gruppe2.md) (offen) |
| 4 Verwalten – versionieren, verfolgen, ändern | **Verwalten** | freigeben, ändern, rückverfolgen | Versionen v0.5 … v1.0, Änderungsliste, Nachverfolgbarkeit Ziel → Anforderung → Quelle |
| 5 Validieren – «Hält die Spec im System?» | **Validieren** (Teil 2) | validieren | Szenarien mit Gruppe 2 durchspielen (z. B. «Verein bucht Wintersaison», «Absage 2 h vorher»); KI-App als Test der Spezifikation (R13, erledigt mit v0.5) |

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
| **Benchmark** (Playtomic, GotCourts, eTermin) | erledigt 25.10.2026, kurz | Fragen finden, an die Gruppe 2 vielleicht nicht gedacht hat (Zahlung, Warteliste, Erinnerungen) | gegen «unvollständige» und «versteckte» Anforderungen (Folie 47); Benchmark liefert nur **Fragen**, keine Anforderungen (Kundenorientierung, Folie 21) |
| **Schriftliche Vorab-Fragen** | vor PVA 5 (vorbereitet, noch nicht verschickt) | Zahlen und Fakten, die man nachschlagen muss (Anzahl Plätze, Öffnungszeiten), damit das Interview Zeit für Regeln und Konflikte hat | → [`fragenliste-gruppe2.md`](fragenliste-gruppe2.md) |
| **Probelauf: simuliertes Interview** (Rollenspiel im Team) | erledigt 25.10.2026 | Leitfaden testen (Zeit, Reihenfolge, Lücken), Gesprächsführung üben, erwartbare Konflikte vorab durchdenken | → [`simuliertes-interview-pva5.md`](simuliertes-interview-pva5.md). **Ersetzt nicht die Ermittlung mit Gruppe 2**; Antworten daraus haben die Quelle `S` und gelten bis zur Bestätigung als Annahme |
| **Interview** (teilstrukturiert, nach Stakeholder-Rollen) | PVA 5 | Regeln, Abläufe, Ausnahmen, Qualitätsziele mit Mass, Prioritäten | Leitfaden [`interviewleitfaden-pva5.md`](interviewleitfaden-pva5.md) mit 12 Muss-Fragen und Zeitplan je Block; gezielt nach versteckten und unmessbaren Anforderungen fragen (Folie 47) |
| **Szenario-Walkthrough** (statt Beobachtung, da ArenaOne fiktiv ist) | PVA 5, letzter Teil, oder online danach | einen typischen Tag am Empfang und eine Vereinsserie Schritt für Schritt durchspielen | «Integration von Erstellung und Prüfung» (Folie 46); [`vorlagen/workshop-beobachtung.md`](vorlagen/workshop-beobachtung.md) |
| **Schriftliche Bestätigung** (Protokoll + [Bestätigungsliste](annahmen-bestaetigung-gruppe2.md)) | eine Woche nach PVA 5 | jede Annahme (`A`) und Simulationsantwort (`S`) mit vorgeschlagenem Wert bestätigen, ändern oder streichen lassen | Interviewaussagen sind flüchtig und Gruppe 2 erfindet ArenaOne beim Antworten; schriftlich bestätigt wird daraus eine belastbare Quelle (Prüfen & Abstimmen, Folie 28) |
| **Review der Spezifikation** durch Gruppe 2 | nach v0.8 | Akzeptanz, Korrekturen, Freigabe | Prüfen & Abstimmen, Validieren (Folie 28); Fehler früh finden (Folie 33/34) |

## 6. Ablauf entlang der PVA

Termine laut Merkblatt fett; die übrigen Zeilen sind unsere Planung. Daten sind noch nicht bekannt.

| Wann | Kreislauf-Phase | Aktivitäten RE-Team | Ergebnis (Fahrplan-ID) | verantwortlich | Stand |
|---|---|---|---|---|---|
| **PVA 2** | Ermitteln | Projektvorstellung von Gruppe 2 erhalten | Präsentation in `material/` | – | ✅ erledigt |
| bis 25.10.2026 | Ermitteln | Dokumentenanalyse, Benchmark, RE-Plan, Stakeholder-Analyse, Kontextdiagramm, Zielhierarchie, Glossar, Leitfaden, Fragenliste, simuliertes Interview (Probelauf) | R1–R5 | Gruppe 9 | ✅ erledigt |
| 25.10.2026 | Dokumentieren, Prüfen | Spezifikation v0.5 (vollständig, unbestätigt), interne Prüfung mit Prüfskript (PB-01 bis PB-09) | R6, R7, R8 | Gruppe 9 | ✅ erledigt |
| 25.10.2026 | Validieren (Test) | KI-Experiment: App aus v0.5, Auswertung, Befunde PB-10 bis PB-16 → Spezifikation v0.6 | R13 | Gruppe 9 | ✅ erledigt |
| 25.10.2026 | Präsentieren | Decks PVA 6 (3 Folien) und PVA 9/10 (20 min + Diskussion + Backup) gebaut, interne Abnahme | R9–R12 | Gruppe 9 | ✅ erledigt, Probelauf offen |
| 28.10.2026 | Dokumentieren, Prüfen | Spezifikation **v0.7**: Kernprozess ohne Self-Service, Online-Selbstbuchung als Variante (PB-17); Leitfaden auf 12 Muss-Fragen gekürzt; Bestätigungsliste vorbereitet; Decks auf v0.7 | R5–R12 | Gruppe 9 | ✅ erledigt |
| vor PVA 5 | Ermitteln | Kanal und Ansprechpersonen bei Gruppe 2 klären, Vorab-Fragen (Fragenliste Teil A) schicken | Antworten auf Vorab-Fragen | Görkem | ⏳ offen |
| **PVA 5** `[Datum PVA 5]` | Ermitteln | **Interview mit Gruppe 2** (45 min, 12 Muss-Fragen, [Leitfaden](interviewleitfaden-pva5.md)); Protokoll am selben Tag | Protokoll, offene Punkte | Görkem führt, Ardian protokolliert | ⏳ offen |
| PVA 5 + 1 Woche | Prüfen & Abstimmen | **Bestätigungsschritt** (Abschnitt 6a): Protokoll und Bestätigungsliste an Gruppe 2, Rücklauf | bestätigtes Protokoll, ausgefüllte Liste | Görkem | ⏳ offen |
| PVA 5 → 6 | Dokumentieren, Verwalten | Antworten einarbeiten: Spezifikation **v0.8** (jede `A`/`S`-Quelle bestätigt, geändert oder gestrichen; Entscheid Self-Service), Prüfskript, Decks neu bauen | R6 v0.8 | Ardian | ⏳ offen |
| **PVA 6** `[Datum PVA 6]` | (Standortbestimmung) | **Kurzvorstellung Zwischenstand gemeinsam mit Gruppe 2**: Phase im Kreislauf, was das Interview bestätigt oder widerlegt hat ([`zwischenstand-pva6.md`](zwischenstand-pva6.md)) | R9 | Görkem (spricht), Ardian (Folien) | ⏳ Folien auf v0.7, nach Interview nachführen |
| PVA 6 → 8 | Validieren, Verwalten | Review der v0.8 durch Gruppe 2, Szenarien durchspielen, Konflikte von der GL entscheiden lassen, **Freigabe v1.0**; danach Änderungen nur über Änderungsanträge | R6 v1.0, R7, R8 | Ardian, Görkem | ⏳ offen |
| PVA 8 | – | Lösungspräsentation auf v1.0 neu bauen (Runde 2 sichtbar), Probelauf mit Stoppuhr, Diskussion mit Gruppe 2 absprechen | R10–R12 | beide | ⏳ offen |
| **PVA 9/10** `[Datum PVA 9/10]` | – | **ca. 20 min Präsentation, ca. 15 min Diskussion moderieren, Spezifikation einreichen** | Abgabe | beide | ⏳ offen |

## 6a. Bestätigungsschritt nach dem Interview

Das Interview liefert Aussagen, keine bestätigten Anforderungen. Bevor wir eine Quelle `A` oder `S` durch «Interview PVA 5» ersetzen, bestätigt Gruppe 2 schriftlich. Der Ablauf steht gleich auch im [Leitfaden](interviewleitfaden-pva5.md), Abschnitt 6:

1. **Protokoll** (Tag des Interviews, Ardian): Vorlage im Leitfaden, Abschnitt 5, inklusive Abgleich «Simulation sagte – Gruppe 2 sagt». Ablage `protokolle/interview-pva5.md` – nur das echte Protokoll, keine Simulation.
2. **Annahmen- und Werteliste an Gruppe 2** (Tag danach, Görkem): [`annahmen-bestaetigung-gruppe2.md`](annahmen-bestaetigung-gruppe2.md), erzeugt mit `werkzeuge/erstelle_bestaetigungsliste.py` aus der Spezifikation. Sie enthält jede Stelle mit Quelle `A` oder `S` und dem vorgeschlagenen Wert (Grundsatzentscheide wie Self-Service, Parameter PA-01 bis PA-11, Ziele und Zielwerte, Randbedingungen, Anforderungen), je Zeile leer: «bestätigt ja / nein / geändert» und «neuer Wert». Was im Interview schon beantwortet wurde, tragen wir als Vorschlag ein; Gruppe 2 bestätigt. Dazu die schriftlichen Fragen (Leitfaden 3.3) und das Protokoll. Rücklauf: eine Woche.
3. **Spezifikation v0.8** (nach Rücklauf, Ardian): jede Zeile umsetzen – «ja» → Quelle «Interview PVA 5» bzw. «Bestätigung Gruppe 2», «nein» → streichen (Historie), «geändert» → neuer Wert; Entscheid zur Variante Self-Service (Must / Should / Won't). Prüfskript laufen lassen, Versionshistorie.
4. **Präsentationen aktualisieren** (Görkem): Zwischenstand PVA 6 (Phase «Validieren läuft», Folie 3 «was das Interview bestätigt oder widerlegt hat») und Lösung PVA 9/10 (Runde 2 auf Folie 3, Versionen, Zahlen) mit `werkzeuge/build-praesentation-arenaone.js` neu bauen.
5. **Review und Freigabe v1.0** durch die Geschäftsleitung von Gruppe 2; danach Änderungsanträge (Spezifikation Kapitel 11).

Unbeantwortete Zeilen bleiben `A`/`S` und sind auch in v1.0 als unbestätigt sichtbar.

## 7. Werkzeuge und Ablage

| Zweck | Werkzeug | Ort |
|---|---|---|
| Arbeitsstände, Versionen | Git-Repository (privat) | `re-gruppe2/` |
| Präsentation von Gruppe 2 | Original + PDF, nur intern | `re-gruppe2/material/` |
| Spezifikation | Markdown als Quelle, daraus PDF und Word (HWZ-Vorlage); Prüfskript `werkzeuge/pruefe_spezifikation.py` | [`anforderungsspezifikation-arenaone.md`](anforderungsspezifikation-arenaone.md) |
| Modelle | Mermaid (Kontext, Soll-Prozess) bzw. SVG (Use Cases), als PNG exportiert | `re-gruppe2/modelle/` |
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
| R5 | Interviewleitfaden, Fragenliste, Probelauf | [`interviewleitfaden-pva5.md`](interviewleitfaden-pva5.md) (12 Muss-Fragen, Zeitplan), [`fragenliste-gruppe2.md`](fragenliste-gruppe2.md), [`simuliertes-interview-pva5.md`](simuliertes-interview-pva5.md) | fertig; echtes Protokoll nach PVA 5 |
| – | Glossar | [`glossar.md`](glossar.md) | Entwurf, Begriffe von Gruppe 2 bestätigen lassen |
| R6 | Anforderungsspezifikation | [`anforderungsspezifikation-arenaone.md`](anforderungsspezifikation-arenaone.md) (+ DOCX, PDF) | **v0.7** (28.10.2026), Annahmen noch zu validieren; v0.8 nach PVA 5, v1.0 nach Freigabe |
| R7, R8 | Validierung, Versionen, Nachverfolgbarkeit | in der Spezifikation, Kapitel 9–11; [Bestätigungsliste](annahmen-bestaetigung-gruppe2.md) | interne Prüfung erledigt (PB-01 bis PB-17); Validierung mit Gruppe 2 offen |
| R9 | Zwischenstand PVA 6 | [`zwischenstand-pva6.md`](zwischenstand-pva6.md), 3 Folien | auf v0.7; nach dem Interview nachführen |
| R10–R12 | Präsentation, Diskussion, Q&A | [`praesentation-pva9-10/`](praesentation-pva9-10/) | Deck (25 Folien), Moderation, Fragenkatalog fertig auf v0.7; Probelauf offen |
| R13 | optional: KI-App | [`ki-app/`](ki-app/README.md) | erledigt 25.10.2026 (mit v0.5) |

Die leeren Vorlagen in [`vorlagen/`](vorlagen/) bleiben als Muster stehen; die befüllten Fassungen liegen direkt in `re-gruppe2/`.

## 9. Risiken für unsere RE-Arbeit

| Risiko | Gegenmassnahme |
|---|---|
| ArenaOne ist fiktiv; Gruppe 2 erfindet Antworten und widerspricht sich später | Protokoll und Bestätigungsliste schriftlich bestätigen lassen (Abschnitt 6a); Widersprüche als offene Punkte mit Entscheider (GL) |
| Antworten aus dem simulierten Interview werden versehentlich als Kundenaussage behandelt | Quelle `S` in jeder Tabelle; Spezifikation zeigt den Status «Simulation – zu validieren»; im echten Interview gezielt nachfragen |
| Benchmark-Funktionen schleichen sich als Anforderungen ein | Quelle `B` reicht nie allein; im Interview nur als Frage |
| Zeit in PVA 5 reicht nicht | Vorab-Fragenliste; nur 12 Muss-Fragen sicher stellen, Zeitplan je Block, Rest schriftlich mit der Bestätigungsliste |
| Nur zwei Personen: Ausfall einer Person | beide kennen alle Artefakte; alles im Repository, nichts nur im Kopf |
| Format der Spezifikation weicht von der Dozentenvorlage ab | IEEE 830 + Volere-Attribute als Arbeitsannahme, nach Block 2 anpassen |
| PVA-Daten unbekannt | Rückwärtsplanung, sobald Datum PVA 9/10 bekannt |
