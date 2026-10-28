# Interviewleitfaden PVA 5 – ArenaOne (Gruppe 2)

Artefakt **R5** (Fahrplan 3.2), Phase **Ermitteln**. Stand: 28.10.2026 (Spezifikation v0.7). Auf ArenaOne zugeschnitten aus der [generischen Vorlage](vorlagen/interviewleitfaden-pva5.md).
Teilstrukturiertes Interview: Die Fragen sind ein Gerüst, die Reihenfolge folgt dem Gespräch. Fragen-IDs `V-…` wie in der [Fragenliste](fragenliste-gruppe2.md); Hypothesen `H-…` und Lücken `L-…` wie in der [Analyse](analyse-arenaone.md).

> **Probelauf:** Zum Leitfaden gibt es ein [simuliertes Interview](simuliertes-interview-pva5.md) als Rollenspiel-Skript zum Durchspielen im Team. Die Antworten dort sind **erfunden** – Simulation zur Vorbereitung, ersetzt nicht die Ermittlung mit Gruppe 2. Was das Skript für den Ablauf zeigt, steht in Abschnitt 4.

## 0. Organisation

| Punkt | Inhalt |
|---|---|
| Datum / Ort / Dauer | `[Datum PVA 5]`, `[Raum/online]`, **45 min geplant** (Annahme; Dauer vorher mit Dozent und Gruppe 2 klären) |
| Gruppe 2 (Stakeholder-Rolle) | `[G2: wer spricht für Geschäftsleitung, Empfang, Verein/Firma, Trainer, Privatkunde, IT]` – vorab erfragt (Fragenliste Teil A, Punkt 9) |
| Gruppe 9 (RE) | **Görkem Taspinar**: führt das Interview, achtet auf die Zeit · **Ardian Ibrahimaj**: protokolliert, fragt bei unmessbaren Aussagen nach dem Mass, notiert Glossarbegriffe |
| Unterlagen dabei | Präsentation Gruppe 2 (PDF), [Kontextdiagramm](kontextdiagramm.md), [Stakeholder-Matrix](stakeholder-analyse.md), [Zielhierarchie](zielhierarchie.md), [Glossar](glossar.md), Antworten auf die Vorab-Fragen, dieser Leitfaden |
| Einverständnis | Wir protokollieren; Protokoll und Bestätigungsliste gehen zur Bestätigung an Gruppe 2 (Abschnitt 6) |

## 1. Zeitplan: 12 Muss-Fragen in 45 Minuten

37 Fragen passen nicht in 45 Minuten (Probelauf: Block B allein lief über die Zeit, P-1). Deshalb stellen wir im Interview nur die **12 Muss-Fragen M1–M12** sicher. Auswahlkriterium: grösster Einfluss auf den Umfang, auf die Must-Anforderungen und auf die offenen Punkte OP-xx der [Spezifikation v0.7](anforderungsspezifikation-arenaone.md) – vor allem Self-Service, Zahlung, Stornoregeln, Kundengruppen und Serien («Abos»), Rollen und Rechte, Mengengerüst. Alle anderen Fragen sind **«falls Zeit»** oder gehen **schriftlich** an Gruppe 2 (Abschnitt 3.2 und 3.3; Markierung auch in der [Fragenliste](fragenliste-gruppe2.md)).

| Minute | Block | spricht für Gruppe 2 | Muss-Fragen | Ziel des Blocks |
|---|---|---|---|---|
| 0–2 | Einstieg | alle | – | Zweck, Ablauf, Rollen; Protokoll und Bestätigungsliste ankündigen |
| 2–10 | **A Umfang und Ziele** | Geschäftsleitung | M1 Self-Service · M2 Zahlung · M3 Ziele und Entscheider | die zwei Scope-Fragen zuerst, weil sie alles Weitere verändern (P-4) |
| 10–14 | **B Mengengerüst** | Empfang, Geschäftsleitung | M4 | Vorab-Antworten bestätigen statt neu erfragen |
| 14–21 | **C Serien** | Verein/Firma, Trainer | M5 · M6 | Ablauf der Saisonplanung, Ausnahmen |
| 21–31 | **D Regeln** | Geschäftsleitung | M7 Kundengruppen · M8 Storno · M9 Kontingente · M10 Warteliste | Buchungsregeln und Zielkonflikte K-01, K-02 |
| 31–36 | **E Rollen und Rechte** | Empfang, Trainer, Geschäftsleitung | M11 | wer im System was darf (QA-13) |
| 36–41 | **F Priorisierung** | Geschäftsleitung | M12 | Muss/Soll/Wunsch, Abnahmebeispiel |
| 41–45 | Abschluss | alle | – | Kernaussagen vorlesen, Widersprüche an die GL, **Bestätigungsschritt** vereinbaren (Abschnitt 6) |

Regel für die Zeit (Görkem führt die Uhr): Ist ein Block um mehr als eine Minute über der Zeit, wird die laufende Muss-Frage zu Ende gestellt, Nachfragen gehen in den Parkplatz des Protokolls. «Falls Zeit»-Fragen nur, wenn ein Block vor seiner Endzeit fertig ist. Fallen trotzdem Muss-Fragen weg, kommen sie zuoberst auf die schriftliche Nachfrage.

## 2. Gesprächsregeln für uns

- **Offen fragen** («Wie läuft …?», «Was passiert, wenn …?»), nicht suggestiv. Benchmark-Funktionen nur als Frage: «Andere Anlagen bieten eine Warteliste – ist das für euch ein Thema?»
- **Lösungen in Bedürfnisse übersetzen** (Folie 47): Sagt jemand «Wir brauchen eine App», fragen wir: «Was soll danach anders sein?»
- **Adjektive messbar machen**: «schnell», «einfach», «jederzeit» → sofort nach Wert, Messgrösse und Bedingung fragen (Ardian).
- **Begriffe klären**: Gruppe 2 sagt «Buchung» und «Reservation» – im Gespräch fragen, ob es dasselbe ist, und den Hauptbegriff festhalten ([Glossar](glossar.md)).
- **Widersprüche zwischen Rollen** nicht im Gespräch auflösen, sondern notieren und am Ende der Geschäftsleitung zur Entscheidung vorlegen (Folie 47: unklare Verantwortung).
- Jeden Block mit «Habe ich richtig verstanden, dass …?» abschliessen.

## 3. Fragen

### 3.1 Muss-Fragen (im Interview auf jeden Fall stellen)

★ **M1–M12**. Spalte «ändert in der Spezifikation» = was je nach Antwort umgebaut wird.

| # | Block | Muss-Frage | Fragen-ID | offener Punkt | ändert in der Spezifikation |
|---|---|---|---|---|---|
| **M1** | A | **Self-Service:** Wie soll künftig reserviert werden – reservieren Kundinnen und Kunden selbst online, bleibt alles beim Empfang, oder beides? Muss das am ersten Tag gehen, oder reicht es später? (Nicht suggerieren: unser Kernprozess läuft über den Empfang, Online ist nur Variante.) | V-01 | OP-02 | Variante Self-Service (FA-04, FA-09, FA-10, FA-36, FA-37, QA-01, QA-03) wird Must, bleibt Should oder wird Won't |
| **M2** | A | **Zahlung:** Gehört Bezahlen zur Reservation – online, vor Ort, Rechnung an Vereine und Firmen? Oder ist das ausserhalb des Projekts? | V-21 | OP-04 | WO-01, IF-08, IF-09; evtl. neue FA zur Rechnung |
| **M3** | A | **Ziele und Entscheider:** Welches der vier Ziele auf eurer Folie 4 ist das wichtigste, und woran merkt ihr in einem Jahr, dass es sich gelohnt hat? Wer entscheidet bei Konflikten und gibt die Spezifikation frei? | V-19, V-27 | OP-01 | Zielwerte `[x]` in Kapitel 3; Freigabe v1.0 |
| **M4** | B | **Mengengerüst:** Stimmen die Vorab-Zahlen – Anlagen je Sportart, Hallenteilung, Reservationen pro Woche, davon Serien, Anrufe/E-Mails pro Tag, Doppelbuchungen pro Monat? (Ohne Vorab-Antworten: nur Grössenordnung, Rest schriftlich, P-3.) | V-20, V-24 | OP-01, OP-13 | PA-08, PA-09, QA-07, FA-06 (Hallenteile) |
| **M5** | C | **Serien:** Wie reserviert ein Verein heute seine Saison – wer meldet sich, wann, wie lange läuft eine Serie, und wer bestätigt sie? | V-12 | OP-03 | FA-16 bis FA-18, PA-02 für Serien |
| **M6** | C | **Ausnahmen in Serien:** Was passiert, wenn ein Training ausfällt (Ferien, Feiertag, Turnier)? Wie früh wird abgesagt, und soll die frei gewordene Zeit anderen angeboten werden? | V-13, V-14 | OP-03 | FA-19, FA-12, FA-14 |
| **M7** | D | **Kundengruppen und Regeln:** Welche Kundengruppen gibt es genau (Folie 2 nennt vier, Folie 5 drei), und was gilt je Gruppe – wie weit im Voraus, wie lange, wie viele offene Reservationen? Gibt es Abos oder Mitgliedschaften? | V-05, V-02 | OP-02 | FA-24, FA-25, PA-02, PA-03, PA-11 |
| **M8** | D | **Stornoregeln:** Bis wann kann man ohne Folgen stornieren, und was passiert danach (Gebühr, Verwarnung, nichts) – gleich für alle Gruppen? Zählt eine Absage durch ArenaOne als kurzfristig? | V-09, V-10 | OP-05 | PA-04, FA-10, FA-11, FA-30; Konflikt K-02 |
| **M9** | D | **Vorrang am Abend:** Sollen Vereine zu bestimmten Zeiten Vorrang haben? Wie viel der Abendzeiten dürfen Serien höchstens belegen? | V-06 | OP-09 | FA-26, PA-10; Konflikt K-01 |
| **M10** | D | **Warteliste:** Wollt ihr eine Warteliste? Wenn ja: bekommt der Erste automatisch den Platz, oder erhalten alle eine Nachricht? | V-11 | OP-06 | FA-13 bis FA-15, PA-05 |
| **M11** | E | **Rollen und Rechte:** Was dürfen Empfang, Trainer, Vereinsverantwortliche und Geschäftsleitung im System? Reservieren Trainer selbst? Darf der Empfang am Telefon die Buchungsregeln übersteuern? | V-07, V-23, V-33 | OP-08, OP-18 | QA-13 (Berechtigungsmatrix), FA-05, FA-08 |
| **M12** | F | **Priorisierung:** Welche drei Dinge müssen am ersten Tag funktionieren (Muss), was wäre schön, aber verzichtbar (Folie 43)? Habt ihr ein Beispiel, das wir als Abnahmetest nehmen dürfen? | – | alle | MoSCoW Kapitel 8, Akzeptanzkriterien |

Jeden Block mit «Habe ich richtig verstanden, dass …?» abschliessen; Ardian notiert je Muss-Frage die Antwort in der Bestätigungsliste-Spalte «neuer Wert» vor (Abschnitt 6).

### 3.2 Falls Zeit (sonst schriftlich nachfragen)

In dieser Reihenfolge, wenn ein Block früher fertig ist:

| Block | Frage | Fragen-ID |
|---|---|---|
| B | Erzählt uns eine typische Reservation von gestern – vom Anruf bis zum Eintrag. Wo wird sie notiert? Was funktioniert heute gut und darf nicht verloren gehen? (Beispiel nach 3 min zusammenfassen, P-1) | V-25, L-08 |
| B | Wann ist zuletzt eine Doppelbuchung passiert, und wie kam es dazu? | H-04 |
| E | Legen sich Privatkunden selbst ein Konto an, oder erfasst der Empfang alle? Wer bestimmt, wer für einen Verein reservieren darf? | V-35, V-08 |
| C | Wie unterscheidet sich eine Firma von einem Verein beim Reservieren (Anlass, mehrere Anlagen, Rechnung)? | V-05 |
| D | Welche Auswertungen braucht die Geschäftsleitung, und wie oft? | V-17 |
| A | Welche Nachrichten sollen Kunden bekommen (Bestätigung, Erinnerung), und welche nerven? E-Mail oder SMS? | V-15 |
| G | Wann muss das System laufen, und was passiert bei einem Ausfall am Samstagmorgen? Auf welchen Geräten wird gearbeitet? | V-30 |
| D | Welche Kundendaten braucht ihr – wo fängt das ausgeschlossene «CRM» an? | V-22, V-04 |
| G | Wie werden Anlagen für Unterhalt, Turniere oder wetterbedingt gesperrt? | V-29 |

### 3.3 Schriftlich nachreichen (nicht im Interview)

Gehen nach dem Interview zusammen mit der [Bestätigungsliste](annahmen-bestaetigung-gruppe2.md) an Gruppe 2, ebenso jede Frage aus 3.2, die nicht gestellt wurde: V-03 (Zeitraster je Sportart), V-16 (interne Information), V-18 (Form der Auswertungen), V-26 (Betrieb, IT), V-28 (Personendaten, Aufbewahrung), V-31 (Zutritt/Licht), V-32 (Termin, Budget), V-34 (Rolle «Betrieb der Anlage»), V-36 (belegte Zeiten sichtbar?), V-37 (Ersatz bei Sperrzeit). Die Vorab-Fragen aus Teil A der Fragenliste (Anlagen, Öffnungszeiten, Mengen, IT, Kanal) gehen schon **vor** PVA 5 raus.

## 4. Erkenntnisse aus dem Probelauf (simuliertes Interview)

Die Simulation sagt nichts Verlässliches über ArenaOne, sie testet nur den Leitfaden. Was wir daraus für das echte Interview ändern (beim Durchspielen im Team überprüfen und ergänzen):

| # | Beobachtung in der Simulation | Konsequenz für PVA 5 |
|---|---|---|
| P-1 | Block B (Empfang) läuft schnell über die Zeit, weil das «Beispiel von gestern» viele Nebenthemen öffnet | Beispiel nach 3 min zusammenfassen; Nebenthemen in den Parkplatz (Protokoll, offene Punkte) |
| P-2 | Konflikte (Vereine vs. Privatkunden, Stornoregeln) kommen schon in Block C und E hoch | nur notieren, nicht diskutieren – Entscheid in Block F bei der Geschäftsleitung |
| P-3 | Ohne Vorab-Zahlen dauert Block A doppelt so lange | Vorab-Fragen rechtzeitig schicken; falls keine Antwort: Zahlen schriftlich nachfordern statt im Interview schätzen lassen |
| P-4 | Bezahlung taucht in fast jedem Block auf, obwohl sie nicht auf den Folien steht | V-21 früh (Einstieg) klären, damit klar ist, ob Zahlung zum Scope gehört |

## 5. Protokollvorlage (nur für das echte Interview)

| Feld | Inhalt |
|---|---|
| Datum, Dauer | `[Datum PVA 5]`, `[min]` |
| Teilnehmende | Gruppe 2: `[Rollen, Namen nur intern]` · Gruppe 9: Görkem Taspinar, Ardian Ibrahimaj |
| Protokoll | Ardian Ibrahimaj |
| Version / bestätigt durch Gruppe 2 am | v0.1 / `[Datum]` |

### Erkenntnisse

| # | Aussage (möglichst wörtlich) | Rolle | Thema | Rolle der Aussage (Vorschrift / Tatsache / Annahme, Folie 42) | Hypothese bestätigt / geändert / verworfen | → Anforderung / Ziel |
|---|---|---|---|---|---|---|
| 1 | | | | | | |

### Abgleich mit der Simulation

| Thema | Simulation sagte (`S`) | Gruppe 2 sagt | Folge für die Spezifikation |
|---|---|---|---|
| | | | |

### Neue Glossarbegriffe · Offene Punkte

| Begriff / Frage | Bedeutung / verantwortlich | bis |
|---|---|---|
| | | |

## 6. Nach dem Interview: Bestätigungsschritt

Ein Interview allein bestätigt noch keine Anforderung: Was wir verstanden haben, muss Gruppe 2 schriftlich bestätigen (Folie 28, «Prüfen & Abstimmen»). Ablauf, auch im [RE-Plan](re-plan.md), Abschnitt 6a:

| Schritt | wann | was | wer | Ergebnis |
|---|---|---|---|---|
| 1 | Tag des Interviews | Protokoll nach Abschnitt 5 ins Reine schreiben, Abgleich «Simulation sagte – Gruppe 2 sagt» ausfüllen | Ardian | `protokolle/interview-pva5.md` (v0.1) |
| 2 | am Tag danach | Antworten in die [Bestätigungsliste](annahmen-bestaetigung-gruppe2.md) als Vorschlag übernehmen (Spalte «neuer Wert»); Liste und Protokoll an Gruppe 2 mit Rücklauffrist (Vorschlag: eine Woche) und den Fragen aus 3.3 | Görkem | Versand an Gruppe 2 |
| 3 | bis Frist | Gruppe 2 kreuzt je Zeile «ja / nein / geändert» an und bestätigt das Protokoll | Gruppe 2 | ausgefüllte Liste, Protokoll v1.0 |
| 4 | nach Rücklauf | Spezifikation **v0.8**: jede `A`- und `S`-Quelle bestätigt (Quelle «Interview PVA 5»), geändert oder gestrichen; Entscheid zur Variante Self-Service umsetzen; Prüfskript laufen lassen | Ardian | Spezifikation v0.8 |
| 5 | vor PVA 6 | Zwischenstand-Folien neu bauen (Phase «Validieren läuft», was das Interview bestätigt oder widerlegt hat) | Görkem | Deck PVA 6 |
| 6 | bis PVA 8 | Review der v0.8 durch Gruppe 2, Freigabe **v1.0**; Lösungspräsentation PVA 9/10 neu bauen (Zahlen, Versionen, Runde 2) | beide | Spezifikation v1.0, Deck PVA 9/10 |

Bleibt eine Zeile unbeantwortet, bleibt ihre Quelle `A` bzw. `S` und die Anforderung ist in v1.0 weiterhin als unbestätigt markiert – nichts wird stillschweigend als bestätigt übernommen.
