# Merkblatt-Checkliste – RE-Rolle für Gruppe 2 (ArenaOne)

Quelle: `material/Merkblatt Gruppenarbeit HS26.pdf` (3 Seiten, vollständig gelesen am 25.10.2026). Seitenangabe = Seite im PDF.
Zweck: Jede Vorgabe des Merkblatts, die unsere Rolle als **Requirements Engineers für Gruppe 2** betrifft, ist hier einmal aufgeführt – mit dem Artefakt, das sie erfüllt, und dem Stand. Die Stakeholder-Rolle (wir als Auftraggeber für Gruppe 3) steht am Ende nur als Kurzverweis, weil sie im Fahrplan Abschnitt 3.1 geführt wird.

Status: ✅ erledigt · 🟡 in Arbeit / Entwurf · ⏳ noch nicht fällig oder wartet auf Input · ❓ offen beim Besitzer

## A. Rahmen und Ziele (Merkblatt S. 1)

| # | Anforderung laut Merkblatt | Seite | Geplantes Artefakt (Fahrplan-ID) | Status |
|---|---|---|---|---|
| M1 | Gruppenarbeit mit 2–3 Personen | 1 | Rollenverteilung im [RE-Plan](re-plan.md), Abschnitt 3: zwei Personen, Görkem Taspinar (RE-Lead, Moderation, Präsentation) und Ardian Ibrahimaj (Spezifikation, Qualität) | ✅ |
| M2 | Zwei Rollen einnehmen: Stakeholder **und** Requirements Engineer | 1 | Stakeholder: `stakeholder/` · RE: `re-gruppe2/` | ✅ beide Rollen angelegt |
| M3 | Die typischen Phasen eines RE-Projekts durchleben: **Ermitteln, Dokumentieren, Validieren, Verwalten** | 1 | RE-Plan Abschnitt 2 (Kreislauf Folie 28 mit den vier Phasen), Spezifikation R6, Validierung R7, Versionen/Traceability R8 | 🟡 Ermitteln vorbereitet (Analyse, Leitfaden mit 12 Muss-Fragen, Probelauf); Dokumentieren: [Spezifikation v0.7](anforderungsspezifikation-arenaone.md) mit interner Prüfung, Traceability und Versionshistorie; Verwalten: Quellen, Parameter, Versionen v0.5 → v0.6 → v0.7 (28.10.2026) · ⏳ Validieren mit Gruppe 2 ab PVA 5 (Interview, dann [Bestätigungsliste](annahmen-bestaetigung-gruppe2.md)) |
| M4 | Gruppenarbeit gezielt zur Vertiefung und zum Ausbau von Handlungskompetenzen nutzen, **frühzeitig den Stakeholder definieren** | 1 | Stakeholder-Analyse [`stakeholder-analyse.md`](stakeholder-analyse.md) (R2) | 🟡 Hypothese steht, Validierung in PVA 5 |
| M5 | **Plan für die Rolle als Requirements Engineer** erstellen | 1 | [`re-plan.md`](re-plan.md) (R1) | ✅ befüllt, Namen eingesetzt (Termine als Platzhalter `[Datum PVA n]`) |
| M6 | **Rechtzeitig** mit Beschaffung, Bewertung und Verwendung relevanter Informationen beginnen | 1 | [`analyse-arenaone.md`](analyse-arenaone.md) (Dokumentenanalyse der Präsentation), [`fragenliste-gruppe2.md`](fragenliste-gruppe2.md) (Vorab-Fragen vor PVA 5) | ✅ Analyse fertig · ⏳ Fragenliste an Gruppe 2 schicken |
| M7 | Arbeit **abschliessen, Ergebnisse präsentieren und einreichen** | 1 | R6 (Spezifikation v1.0), R10 (Präsentation), Abgabe | ⏳ PVA 9/10; Abgabeform offen (O4) |
| M8 | *optional:* aus der Anforderungsspezifikation mit **KI-Agenten eine Applikation** erstellen und analysieren, ob der Agent alle nötigen Requirements hat | 1 | R13 [`ki-app/`](ki-app/README.md), [Auswertung](ki-app/analyse.md) | ✅ durchgeführt (25.10.2026): App aus v0.5, Abdeckungsmatrix, 32 Annahmen als Lücken ausgewertet, Spezifikation v0.6, Folie 13 + Backup 25 |

## B. Termine und Aktivitäten (Merkblatt S. 2, Abschnitt 3 und 4)

| # | Anforderung laut Merkblatt | Seite | Geplantes Artefakt (Fahrplan-ID) | Status |
|---|---|---|---|---|
| M9 | PVA 2: Requirements Engineer – **Zuordnung zu Stakeholder einer Gruppe** | 2 | Zuordnung Gruppe 9 → Gruppe 2 (Ring-PDF), Präsentation von Gruppe 2 privat abgelegt unter `material/Praesentation_ArenaOne.pptx` (+ PDF) | ✅ |
| M10 | Die RE-Gruppe soll mit der Stakeholder-Beschreibung aus PVA 2 **ihre Arbeit aufnehmen** können | 2 | Dokumentenanalyse [`analyse-arenaone.md`](analyse-arenaone.md) | ✅ |
| M11 | PVA 5: **direkter Austausch** zwischen Auftraggeber und RE | 2 | [`interviewleitfaden-pva5.md`](interviewleitfaden-pva5.md) (R5, auf ArenaOne zugeschnitten, 12 Muss-Fragen mit Zeitplan je Block), Protokollvorlage, [`fragenliste-gruppe2.md`](fragenliste-gruppe2.md) | 🟡 Leitfaden fertig, Probelauf als [simuliertes Interview](simuliertes-interview-pva5.md) (Rollenspiel, kein Protokoll) · ⏳ echtes Interview, Protokoll, Bestätigung durch Gruppe 2 ([RE-Plan](re-plan.md) 6a) |
| M12 | PVA 6: **Kurzvorstellung Zwischenstand** – die Paarungen treten gemeinsam auf; Stakeholder erzählt, wie es vorangeht; RE sagt, **in welcher Phase des RE-Prozesses** man ist | 2 | [`zwischenstand-pva6.md`](zwischenstand-pva6.md) (R9) + 3 Folien [`RE_ArenaOne_Zwischenstand_PVA6.pptx`](praesentation-pva9-10/RE_ArenaOne_Zwischenstand_PVA6.pptx) (Folien verlangt das Merkblatt nicht), mit Gruppe 2 abstimmen | 🟡 Folien und Notizen auf Stand v0.7 · ⏳ nach PVA 5 aktualisieren |
| M13 | PVA 6 dient auch dem **Erfahrungsaustausch** | 2 | R9: Folie B3 «Erkenntnisse und nächste Schritte» mit Frage an alle, Leitfragen in `zwischenstand-pva6.md` | 🟡 vorbereitet |
| M14 | PVA 9/10: als RE **den Prozess und vor allem die gesammelten Anforderungen** in geeigneter Weise präsentieren, **ca. 20 min** | 2 | R10 [`RE_ArenaOne_Loesung.pptx`](praesentation-pva9-10/RE_ArenaOne_Loesung.pptx) + Gliederung: Prozess auf Folie 2–5, Anforderungen auf Folie 6–12 (10 von 20 min), Zeitbudget 20:00 | 🟡 Folien fertig auf Stand v0.7 (Abnahme: abnahme.md) · ⏳ nach PVA 5 neu bauen, Probelauf |
| M15 | PVA 9/10: als RE eine **Diskussion moderieren, ca. 15 min** | 2 | R11 [`praesentation-pva9-10/diskussion-moderation.md`](praesentation-pva9-10/diskussion-moderation.md), Diskussionsfolien 16–18 | ✅ Ablauf und 7 Leitfragen mit ArenaOne-Beispielen · ⏳ mit Gruppe 2 absprechen |
| M16 | PVA 9/10: **Anforderungsspezifikation** (einreichen) | 2 | R6 [`anforderungsspezifikation-arenaone.md`](anforderungsspezifikation-arenaone.md) + PDF + DOCX (HWZ-Vorlage) | 🟡 v0.7 (Annahmen noch in PVA 5 zu validieren) · ⏳ v0.8 nach Interview und Bestätigungsliste, v1.0 nach Freigabe, Abgabeform offen (O4) |
| M17 | Daten der PVA | 2 | Merkblatt nennt **nur PVA-Nummern**, keine Daten → Platzhalter `[Datum PVA n]` im RE-Plan | ❓ O2 |

## C. Bewertung (Merkblatt S. 3)

| # | Kriterium (Gewicht) | Was bewertet wird | Seite | Womit wir es abdecken | Status |
|---|---|---|---|---|---|
| M18 | **Präsentation (20 %)** | Struktur, Aufbau, **Zeit einhalten** | 3 | R10 nach dem RE-Kreislauf gegliedert, Kernaussage als Folientitel, Zeitbudget je Folie in den Sprechernotizen (Summe 20:00), Probelauf mit Stoppuhr in PVA 8 | 🟡 Folien fertig · ⏳ Probelauf |
| M19 | **Zusammenhänge verstehen (40 %)** | durch **Fragen von Studierenden und Dozierendem** | 3 | R12 `fragen-zusammenhaenge.md` (29 Fragen, jede mit ArenaOne-Beispiel); Folie 15 «Kursinhalte» im Deck; jedes Teammitglied kann den ganzen Prozess erklären | 🟡 Block 1 + Projektbeispiele fertig, Blöcke 2–8 vorläufig · ⏳ mit Folien der Blöcke abgleichen |
| M20 | **Diskussion führen (10 %)** | Interaktivität, Diskussion anregen, Moderation | 3 | R11: Blitzumfrage (FA-04), Murmelrunde zu K-01 (Vereine vs. Privatkunden zur Primetime), offene Runde zur Simulation als Quelle; Rollen Moderation/Zeit verteilt | ✅ vorbereitet · ⏳ Probelauf |
| M21 | **Anforderungsspezifikation (30 %)** | **Format, Inhalt, Schwierigkeitsgrad** | 3 | Format: IEEE 830 / Volere (Block 2 abwarten); Inhalt: Ziele, Stakeholder, Kontext, funktionale + messbare nicht-funktionale Anforderungen, Randbedingungen, Glossar; Schwierigkeitsgrad: Traceability, Validierung, Modelle (Use Cases ab Block 5), optional KI-App | 🟡 v0.7 deckt alles ab (9 Use Cases mit Diagramm, Aktivitätsdiagramm Soll-Prozess mit Kernprozess und Variante Self-Service, 37 FA + 16 QA mit Satzschablone und Akzeptanzkriterium, MoSCoW, Traceability-Matrix, Prüfung je Anforderung per Skript, KI-App als Test der Spezifikation) · ⏳ Format nach Block 2 prüfen, Inhalt in PVA 5 validieren |

## D. Grundlagen (Merkblatt S. 3)

| # | Vorgabe | Seite | Umsetzung | Status |
|---|---|---|---|---|
| M22 | **Studien- und Prüfungsordnung** gilt | 3 | Regeln zu Gruppenarbeit und Hilfsmitteln (auch KI) dort nachlesen | ❓ Dokument liegt uns nicht vor – Besitzer bitte prüfen (O10) |
| M23 | **HWZ-Zitierleitfaden** gilt | 3 | Quellenverzeichnis in der Spezifikation; Benchmarks (Playtomic, GotCourts, eTermin) mit URL und Abrufdatum zitieren; Präsentation von Gruppe 2 als Quelle «Gruppe 2 (2026), Folie x» | 🟡 in [`analyse-arenaone.md`](analyse-arenaone.md) umgesetzt |

**KI-Deklaration:** Das Merkblatt verlangt keine. Ob die Studien- und Prüfungsordnung oder der Zitierleitfaden eine Deklaration von KI-Hilfsmitteln verlangt, ist offen (O10). Bis das geklärt ist, gilt für uns: KI-Unterstützung wird in der Spezifikation ehrlich im Abschnitt «Vorgehen» erwähnt, falls die Vorgaben das verlangen; nichts wird als Kundenaussage ausgegeben, was nicht von Gruppe 2 stammt.

## E. Was das Merkblatt **nicht** regelt (deshalb offen)

| Thema | Folge für uns | offen als |
|---|---|---|
| Datum der PVA 5, 6, 9, 10 | Zeitplan mit Platzhaltern | O2 |
| An welchem Abschlusstermin (PVA 9 oder 10) wir präsentieren | Planung Probelauf | O4 |
| Abgabeform der Spezifikation (Moodle, PDF/Word, Umfang, Frist) | Markdown als Quelle, PDF und Word erzeugbar | O4 |
| Vorgegebene Gliederung der Spezifikation | Arbeitsannahme IEEE 830 + Volere-Attribute bis Block 2 | O6 |
| Dauer der Kurzvorstellung PVA 6 | Annahme ca. 5 min pro Paarung | O2 |
| Austausch ausserhalb der PVA | Kanal mit Gruppe 2 vereinbaren | O9 |

## F. Kurzverweis Stakeholder-Rolle (gegenüber Gruppe 3)

PVA 2 Projekt vorgestellt (S1 ✅), PVA 5 Interview durch Gruppe 3 (S2 ✅ vorbereitet), PVA 6 gemeinsamer Auftritt (S5 ⏳), PVA 9/10 RE-Prozess aus Stakeholder-Sicht zusammenfassen, ca. 5 min (S6 ⏳). Details: Fahrplan 3.1.
