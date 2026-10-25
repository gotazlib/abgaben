# Diskussion PVA 9/10 – Leitfragen und Moderationsplan (ca. 15 min)

Artefakt **R11** (Fahrplan). Bewertung «Diskussion führen» 10 %: **Interaktivität, Diskussion anregen, Moderation** (Merkblatt S. 3).

Grundidee: Die Diskussion soll nicht «Fragen an uns» sein (das prüft der Dozent ohnehin unter «Zusammenhänge verstehen»), sondern das Publikum **selbst denken lassen** – an einem konkreten Fall aus unserer [ArenaOne-Spezifikation](../anforderungsspezifikation-arenaone.md) und mit Kursbegriffen aus Block 1.

**Folien:** 16–18 in [`RE_ArenaOne_Loesung.pptx`](RE_ArenaOne_Loesung.pptx) (Blitzumfrage FA-04, Konflikt K-01, Simulation als Quelle). Frage 4–6 ohne eigene Folie, mündlich.

## Rollen

| Rolle | Person | Aufgabe |
|---|---|---|
| Moderation | Görkem Taspinar | eröffnet, stellt Fragen, gibt das Wort, fasst zusammen, holt Stille ab |
| Zeit + Visualisierung, fachlicher Back-up | Ardian Ibrahimaj | Zeitzeichen (5 / 2 / 0 min), notiert Stichworte sichtbar (Whiteboard/Folie); beantwortet Detailfragen zur Spezifikation kurz, bringt Beispiele aus den Anforderungen |
| Gruppe 2 (Auftraggeber) | `[G2: wer spricht für ArenaOne]` | vorab fragen, ob sie bei Frage 2 (Primetime) und Frage 3 (Simulation) aus Sicht von ArenaOne einsteigen |

## Ablauf (15 min)

| Min. | Phase | Was passiert | Methode für Interaktivität |
|---|---|---|---|
| 0–1 | Einstieg | Ziel der Diskussion, Regeln (kurz, konkret, alle dürfen) | Moderation |
| 1–3 | **Aktivierung** | Blitzumfrage zu Frage 1 (Folie 16: FA-04 Muss, Soll oder Wunsch?) | Handzeichen; Ardian zählt und notiert das Ergebnis sichtbar |
| 3–8 | **Vertiefung 1** | Frage 2 (Folie 17: Vereine oder Privatkunden am Dienstagabend) | Murmelrunde 1 min mit Sitznachbar, dann 3–4 Wortmeldungen |
| 8–12 | **Vertiefung 2** | Frage 3 (Folie 18: Darf eine simulierte Antwort in die Spezifikation?), alternativ Frage 4 oder 5 | offene Runde, Moderation ruft gezielt auch Stille auf, Gruppe 2 kommentiert |
| 12–14 | Zusammenfassung | 3 Kernaussagen aus den Notizen vorlesen | Visualisierung |
| 14–15 | Abschluss | Dank, Übergabe an Dozent | – |

Je nach Verlauf **2–3 Fragen** nutzen, nicht alle.

## Leitfragen mit ArenaOne-Beispielen

| # | Frage | Beispiel aus der Spezifikation | Kursbezug | Woran man eine gute Antwort erkennt / Impuls zum Nachhaken |
|---|---|---|---|---|
| 1 | **Blitzumfrage:** «Kundinnen und Kunden reservieren selbst online – Muss, Soll oder Wunsch? Handzeichen!» (Folie 16) | FA-04 ist bei uns **Should**: Gruppe 2 nennt «komfortabler für Kunden» (F4), verlangt Self-Service aber nicht; FA-02, FA-05, FA-06 lösen das Kernproblem auch ohne. Probelauf: «wichtig, aber zum Start verzichtbar» (S-03) | Priorisierung, Folie 43; wertbasiert, Folie 44 | Unterschiedliche Meinungen sind das Ziel → «Warum Muss? Was kostet es, wenn es fehlt?» Dann: «Wer sollte das entscheiden – wir oder der Auftraggeber?» (Antwort: die GL von ArenaOne; wir bereiten vor, OP-02) |
| 2 | «Vereine wollen feste Abendzeiten, Privatkunden auch. Schreiben wir eine Regel in die Spezifikation – oder ist das ein Entscheid der Geschäftsleitung?» (Folie 17) | Zielkonflikt K-01 (GZ-1 Auslastung vs. GZ-3 Komfort); FA-26 Kontingente mit Parameter PA-10 = 50 % der Abendstunden – Wert aus dem Probelauf (S-04: «Hälfte oder ein Drittel»), nicht von Gruppe 2 | Zielhierarchie (Folie 37), Annahme vs. Vorschrift (Folie 42), Priorisierung durch den Auftraggeber (Folie 43) | Gute Antwort trennt **Fähigkeit** (das System kann Kontingente, FA-26) vom **Wert** (wie viel, PA-10 – entscheidet die GL). Nachhaken: «Was passiert, wenn wir den Wert festlegen und er falsch ist?» |
| 3 | «Unser Probelauf nannte eine Stornofrist von 24 Stunden. Darf diese Zahl in die Spezifikation?» (Folie 18) | PA-04 = 24 h mit Quelle `S` (S-05) und `B`; Verein will Ausnahmen (W-2) → OP-05. Kein Wert aus der Simulation steht als Kundenaussage im Dokument | Annahmen (Folie 42), Lösungs- statt Anforderungsdenken (Folie 47), kundenorientiert (Folie 21) | Pro: gezielte Frage im Interview, Wert sofort prüfbar. Contra: Ankereffekt – der Auftraggeber übernimmt unsere Zahl. Nachhaken bei Gruppe 2: «Hätte euch die Zahl beeinflusst?» |
| 4 | «Wo ist die Grenze zwischen Anforderung und Lösung? Ist ‹eine eigene App› eine Anforderung?» | WO-04 (keine eigene App in Release 1) und QA-03 (alle Kundenfunktionen im Browser ab 360 px): Wir spezifizieren das Bedürfnis (auf dem Smartphone reservieren), nicht die Technik. RB-03: Lösung ist offen, Make-or-Buy danach | Lastenheft vs. Pflichtenheft (Folie 26), RE ist nicht Design (Folie 14) | Bedürfnis hinter dem Lösungswunsch erkennen; Ausnahme: vorgegebene Lösung als **Randbedingung**. Nachhaken: «Und wenn ArenaOne auf einer App besteht?» → Randbedingung mit Begründung |
| 5 | «Wie viel Spezifikation ist genug? Hätte ArenaOne mit fünf User Stories auskommen können?» | Wir sind genau bei Serien (FA-16 bis FA-20), Rollen (QA-13-Matrix) und Storno (FA-09 bis FA-12, PA-04), knapp bei Export (FA-31, Could) und Benachrichtigungen | risikogerecht (Folie 22/23), Wirtschaftlichkeit (Folie 34) | «Aufwand umgekehrt proportional zum Risiko»; das Beispiel «Einzeltermin einer Serie absagen» (FA-19) zeigt, was eine grobe Story («Vereine buchen Serien») übersieht. Provokation: Folie 23 nennt «grobe Stories genügen» einen falschen Ansatz – stimmt das in agilen Projekten? |
| 6 | «Ein KI-Agent bekam nur unsere Spezifikation – wo musste er raten?» (Folie 13 als Bezug) | KI-Experiment M8 (`re-gruppe2/ki-app/analyse.md`); Befunde: Der Agent musste 25 Regeln selbst festlegen, z. B. ob der Empfang Buchungsregeln übersteuern darf (OP-18) und ob ein frei gewordenes Zeitfenster während der Annahmefrist für alle frei ist (OP-06); er fand sechs Widersprüche, etwa unser Kontingent-Beispiel in FA-26 gegen PA-10 | Merkblatt (optionale KI-App), Block 8 «Quality Gates» | Lücken = versteckte Anforderungen, Annahmen, Begriffe. Nachhaken: «Ist eine Spezifikation, die ein Agent versteht, automatisch gut für Menschen?» |
| 7 | Abschluss für alle: «Ihr wart RE und gleichzeitig Auftraggeber. Was macht ihr als Auftraggeber anders, seit ihr selbst RE wart?» | wir selbst: als Auftraggeber (Bank-Projekt) geben wir Zahlen nur auf Nachfrage (Reserve-Deck), als RE für ArenaOne haben uns genau diese Zahlen gefehlt (OP-01) | Drei Welten (Folie 11), Kundenorientierung (Folie 21, 46) | Perspektivenwechsel; persönliche Erfahrungen. Gut als Abschlussfrage, weil alle mitreden können |

## Moderationstechniken (Spickzettel)

- **Stille aushalten** (5 s zählen), dann umformulieren oder an eine Person richten: «`[Name]`, du hast vorhin genickt – wie siehst du das?»
- **Vielredner:innen** freundlich begrenzen: «Danke, wir nehmen noch zwei andere Stimmen dazu.»
- **Abschweifen:** «Spannend – das nehmen wir auf den Parkplatz (Notiz) und gehen zurück zur Frage.»
- **Kritik an unserer Spezifikation** positiv aufnehmen: «Guter Punkt, das wäre ein Änderungsantrag – wie würdet ihr ihn priorisieren?» (Verbindung zu Verwalten, Folie 27/28; Spezifikation Kapitel 11.2). Ardian notiert ihn als CR-Kandidat.
- **Rückfrage zu einer ID** (z. B. «Was genau sagt QA-02?»): Ardian antwortet in einem Satz, Moderation springt bei Bedarf zur Backup-Folie (19–21 Anforderungslisten, 22 Berechtigungsmatrix, 23 offene Punkte).
- **Zusammenfassen** in eigenen Worten und Kursbegriffen; jeder Beitrag wird sichtbar notiert.

## Vorbereitung

- [x] Für Frage 1–3 echte Beispiele aus der Spezifikation ausgewählt und je auf einer Folie (16–18)
- [x] Umfrage als Handzeichen festgelegt (kein Tool nötig); Ardian zählt und notiert
- [ ] Mit Gruppe 2 absprechen, ob sie bei Frage 2 und 3 aus Sicht von ArenaOne einsteigen
- [ ] Nach PVA 5 prüfen, ob die Beispiele noch stimmen (FA-04 Priorität, PA-04, PA-10 können sich ändern) – sonst Folien 16–18 anpassen
- [x] Frage 6 mit den echten Ergebnissen des KI-Experiments füllen (25 geratene Regeln, 6 Widersprüche, [Auswertung](../ki-app/analyse.md))
- [ ] Probelauf: 15 min mit Stoppuhr, Zeitzeichen üben
