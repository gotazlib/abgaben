# Bestätigungsliste für Gruppe 2 – Annahmen und Werte der Spezifikation ArenaOne

Artefakt zu R7 (Validieren). **Erzeugt aus der [Spezifikation v0.7](anforderungsspezifikation-arenaone.md)** mit `werkzeuge/erstelle_bestaetigungsliste.py` – nicht von Hand ändern, solange die Liste nicht verschickt ist. **Noch leer:** Die Spalten «bestätigt» und «neuer Wert» füllt Gruppe 2 nach dem Interview PVA 5 aus.

> **Wozu:** Was in der Spezifikation nicht aus der Projektvorstellung von Gruppe 2 stammt, ist eine Annahme von uns (`A`) oder eine Antwort aus unserem simulierten Interview (`S`, Rollenspiel zur Vorbereitung, keine Aussage von Gruppe 2). Diese Liste fasst alle diese Stellen mit dem Wert zusammen, den wir vorschlagen. Gruppe 2 kreuzt je Zeile an: **ja** (stimmt so), **nein** (streichen) oder **geändert** (neuen Wert eintragen). Erst danach ist eine Anforderung «vom Auftraggeber bestätigt».

**So geht es weiter** (Ablauf im [RE-Plan](re-plan.md), Abschnitt 6a): Interview PVA 5 → Protokoll an Gruppe 2 → diese Liste an Gruppe 2 (zusammen mit dem Protokoll, Rücklauf bis `[Datum, eine Woche nach PVA 5]`) → Antworten einarbeiten, Spezifikation v0.8 → Review und Freigabe v1.0 → Präsentationen (PVA 6 Zwischenstand, PVA 9/10 Lösung) neu bauen.

Ausgefüllt von: `[Rolle bei Gruppe 2]` · am: `[Datum]` · Rückgabe über: `[Kanal]`

## A. Grundsatzentscheide (zuerst beantworten)

Diese Antworten verändern den Umfang am stärksten. Die Begründung steht in der Spezifikation, Kapitel 2.2 und 8.

| ID | Annahme / vorgeschlagener Wert | Quelle | bestätigt (ja / nein / geändert) | neuer Wert / Bemerkung |
|---|---|---|---|---|
| OP-02 | **Self-Service:** Kernprozess über den Empfang (Must); Online-Selbstbuchung als Variante, Priorität Should (FA-04, FA-09, FA-10, FA-36, FA-37, QA-01, QA-03). Alternativen: Must (gehört zu Release 1) oder Won't (später) | `F4` + `A`; `S` (S-03) | | |
| PRIO | **Priorisierung (MoSCoW):** Vorschlag 31 Must, 20 Should, 2 Could, 5 Won't (WO-01 bis WO-05) – Abweichungen je ID in Teil E eintragen | `A` (Kapitel 8) | | |
| GZ-1 vs. GZ-3, K-01 | **Zielkonflikt, Entscheid der Geschäftsleitung:** feste Vereinsserien zur Primetime erhöhen die Auslastung, nehmen Privatkunden aber Abendzeiten | Kapitel 3; offen als OP-09 | | |
| K-02 | **Zielkonflikt, Entscheid der Geschäftsleitung:** strenge Stornoregeln sichern Umsatz, Vereine und Privatkunden wollen Kulanz (in der Simulation offen, W-2) | Kapitel 3; offen als OP-05 | | |
| GZ-2 vs. GZ-3, K-03 | **Zielkonflikt, Entscheid der Geschäftsleitung:** Self-Service entlastet den Empfang, schliesst aber Kundschaft ohne digitale Gewohnheit aus; deshalb Kernprozess über den Empfang, Self-Service nur als Variante | Kapitel 3; offen als OP-02 | | |
| K-04 | **Zielkonflikt, Entscheid der Geschäftsleitung:** Trainer wollen selbst verschieben, der Empfang will Kontrolle über begehrte Zeiten | Kapitel 3; offen als OP-08 | | |
| K-05 | **Zielkonflikt, Entscheid der Geschäftsleitung:** viele Kundendaten für Auswertungen vs. Datensparsamkeit und «kein CRM» | Kapitel 3; offen als OP-14 | | |

## B. Parameter (Werte für Fristen, Mengen, Zeiten)

Kapitel 7.3. Ändert sich ein Wert, bleibt die Anforderung gleich.

| ID | Annahme / vorgeschlagener Wert | Quelle | bestätigt (ja / nein / geändert) | neuer Wert / Bemerkung |
|---|---|---|---|---|
| PA-01 | Zeitraster und Mindestdauer einer Reservation: **30-Minuten-Raster, mind. 60 Minuten** (verwendet in FA-01, FA-04, FA-05) | `A` | | |
| PA-02 | Buchungsvorlauf (für Einzelreservationen; Serien siehe OP-03): **Privat 14 Tage, Verein/Firma/Trainingsgruppe 90 Tage** (verwendet in FA-04, FA-05, FA-25) | `A` | | |
| PA-03 | gleichzeitig offene Einzelreservationen: **Privat 3, übrige Gruppen ohne Begrenzung** (verwendet in FA-25) | `A` | | |
| PA-04 | Stornofrist (kostenlos, ohne Vermerk): **24 Stunden vor Beginn** (verwendet in FA-09, FA-10, FA-11) | `S` (S-05), `B` | | |
| PA-05 | Annahmefrist Warteliste: **30 Minuten, höchstens bis Beginn** (verwendet in FA-15) | `A` (Vergabe «wer zuerst bucht»: `S`, S-07) | | |
| PA-06 | Erinnerungsfrist: **24 Stunden vor Beginn («am Vortag»)** (verwendet in FA-22) | `S` (S-08), `B` | | |
| PA-07 | Aufbewahrung inaktiver Kundenkonten: **24 Monate nach der letzten Reservation** (verwendet in QA-11) | `A` (in der Simulation hat «noch niemand festgelegt», W-6) | | |
| PA-08 | Betriebszeit für Verfügbarkeitsmessung (= Öffnungszeiten): **Mo–Fr 07:00–23:00, Sa/So 08:00–20:00 Uhr** (verwendet in QA-05) | `S` (S-12) | | |
| PA-09 | gleichzeitig aktive Personen (Kundschaft und Mitarbeitende) in der Spitze: **100** (verwendet in QA-07, QA-08) | `A` | | |
| PA-10 | Höchstanteil der Abendstunden (werktags 17–22 Uhr) für Kontingente und Serien: **50 % je Anlage** (verwendet in FA-26) | `S` (S-04; «Hälfte oder ein Drittel» offen) | | |
| PA-11 | maximale Dauer einer Reservation: **Privat 120 Minuten, übrige Gruppen 240 Minuten** (verwendet in FA-25) | `A` (fehlte bis v0.5, KI-Versuch A-12) | | |

## C. Ziele, Messgrössen und Zielwerte

Kapitel 3. Die Ziele stammen aus der Präsentation; Messgrössen sind unser Vorschlag, `[x]` legt die Geschäftsleitung fest.

| ID | Annahme / vorgeschlagener Wert | Quelle | bestätigt (ja / nein / geändert) | neuer Wert / Bemerkung |
|---|---|---|---|---|
| GZ-1 | Vorhandene Kapazitäten besser nutzen – Messgrösse: Auslastung je Anlage in den Öffnungszeiten; Zielwert: von `[x] %` auf `[x] %` innert 12 Monaten (Simulation: geschätzt 55–60 % → 70 %, S-15) | Ziel `F4`, Messgrösse `A` | | |
| GZ-2 | Administrativen Aufwand reduzieren – Messgrösse: Arbeitszeit am Empfang für Reservationen pro Woche; Zielwert: − `[x] %` | Ziel `F4`, Messgrösse `A` | | |
| GZ-3 | Komfortablerer Buchungsprozess für Kunden – Messgrösse: Zufriedenheit mit der Reservation (Kurzumfrage 1–5); Zielwert: ≥ `[x]` | Ziel `F4`, Messgrösse `A` | | |
| PZ-1 | Ein zentraler, einheitlicher Buchungsprozess für alle Kanäle – Messgrösse: Anteil verbindlicher Reservationen im System; Zielwert: 100 % ab Einführung | Ziel `F3`, Messgrösse `A` | | |
| PZ-2 | Frei werdende Zeiten werden neu vergeben – Messgrösse: Anteil stornierter Zeiten, die wieder reserviert werden; Zielwert: ≥ `[x] %` | Ziel `F3` (4), Messgrösse `A` | | |
| PZ-3 | Weniger Fehler und Rückfragen im Tagesgeschäft – Messgrösse: Doppelbuchungen pro Monat; Rückfragen am Empfang pro Tag; Zielwert: 0; − `[x] %` | Ziel `F4`, Messgrösse `A` | | |
| PZ-4 | Serien und Kundengruppen nach klaren Regeln – Messgrösse: Konflikte, die nach dokumentierter Regel entschieden werden; Zielwert: `[x] %` | Ziel `F3` (5, 6), `F5`, Messgrösse `A` | | |

## D. Randbedingungen und Annahmen

| ID | Annahme / vorgeschlagener Wert | Quelle | bestätigt (ja / nein / geändert) | neuer Wert / Bemerkung |
|---|---|---|---|---|
| RB-01 | Die Bearbeitung von Personendaten muss dem Bundesgesetz über den Datenschutz (DSG, SR 235.1) entsprechen, insbesondere den Grundsätzen (Art. 6), dem Datenschutz durch Technik und durch datenschutzfreundliche Voreinstellungen (Art. 7), der Datensicherheit (Art. 8), der Informationspflicht (Art. 19) sowie dem Auskunftsrecht und dem Recht auf Datenherausgabe (Art. 25, Art. 28). | DSG; `A` (Gruppe 2 nennt Datenschutz nicht, OP-17) | | |
| RB-04 | Ab Einführung ist nur eine im System gespeicherte Reservation verbindlich; Telefon, E-Mail und Schalter bleiben als Kanäle bestehen, erfassen aber im System. | `F2`, `F3` + `A` (H-02) | | |
| RB-05 | Ein Teil der Kundschaft (z. B. ältere Vereinsmitglieder) wird nicht online reservieren. | `A` (Risiko R-P4 der Analyse) | | |

## E. Anforderungen mit Annahme oder Simulation

Kapitel 6 und 7. Je Anforderung der Teil der Quelle, der auf `A` oder `S` beruht; Wortlaut und Akzeptanzkriterium in der Spezifikation. «Variante» = gilt nur mit Self-Service (Teil A).

| ID | Annahme / vorgeschlagener Wert | Quelle | bestätigt (ja / nein / geändert) | neuer Wert / Bemerkung |
|---|---|---|---|---|
| FA-02 | **Gesamtbelegung für den Empfang anzeigen** (Vorschlag Must) – `S` (S-01: «eine Übersicht, auf der alle dasselbe sehen») | `F2`, `F3` (2), H-01; `S` (S-01: «eine Übersicht, auf der alle dasselbe sehen») | | |
| FA-04 | **Einzelreservation online vornehmen** (Vorschlag Should · Variante Self-Service) – `F4` (Nutzen «komfortabler für Kunden») + `A` (Self-Service nicht ausdrücklich gefordert, OP-02), H-05; `S` (S-03: wichtig, zum Start verzichtbar) | `F4` (Nutzen «komfortabler für Kunden») + `A` (Self-Service nicht ausdrücklich gefordert, OP-02), H-05; `S` (S-03: wichtig, zum Start verzichtbar) | | |
| FA-05 | **Reservation im Auftrag erfassen** (Vorschlag Must) – `S` (S-02) | `F2` (Empfang koordiniert, vier Kanäle), `N5`, H-03; `S` (S-02) | | |
| FA-06 | **Doppelbuchung verhindern** (Vorschlag Must) – `S` (S-01) | `F3` (3), H-04; `S` (S-01) | | |
| FA-07 | **Kundenkonto führen** (Vorschlag Must) – `F3` (5) + `A` (Grenze zum CRM, `F4`; OP-14); `S` (S-10) | `F3` (5) + `A` (Grenze zum CRM, `F4`; OP-14); `S` (S-10) | | |
| FA-08 | **Organisationen mit mehreren Berechtigten** (Vorschlag Should) – `F2`, `F5` (Vereine und Firmen) + `A` | `F2`, `F5` (Vereine und Firmen) + `A` | | |
| FA-09 | **Eigene Reservation verschieben** (Vorschlag Should · Variante Self-Service) – `F4` («Änderungen»), H-05 + `A`; `S` (S-11: Trainer wollen selbst verschieben) | `F4` («Änderungen»), H-05 + `A`; `S` (S-11: Trainer wollen selbst verschieben) | | |
| FA-10 | **Eigene Reservation stornieren** (Vorschlag Should · Variante Self-Service) – Frist `S` (S-05); Selbstbedienung `A` (OP-02) | `F3` (4), `F4` («Stornierungen»), H-12; Frist `S` (S-05); Selbstbedienung `A` (OP-02) | | |
| FA-11 | **Reservationen im Auftrag ändern und stornieren** (Vorschlag Must) – Frist `S` (S-05) | `F2`, H-03; Frist `S` (S-05) | | |
| FA-14 | **Warteliste benachrichtigen** (Vorschlag Should) – `F5` («Stornierung», «Information»), H-11 + `A` | `F5` («Stornierung», «Information»), H-11 + `A` | | |
| FA-15 | **Nachrücken nach dem Prinzip «wer zuerst bestätigt»** (Vorschlag Should) – `S` (S-07, von der GL selbst als unsicher bezeichnet), `A` (OP-06: Reihenfolge nach Eintrag oder «wer zuerst») | `S` (S-07, von der GL selbst als unsicher bezeichnet), `A` (OP-06: Reihenfolge nach Eintrag oder «wer zuerst») | | |
| FA-16 | **Serienantrag erfassen** (Vorschlag Must) – `S` (S-01, S-11) | `F3` (6), `F5` (Serien), H-08; `S` (S-01, S-11) | | |
| FA-17 | **Konflikte einer Serie anzeigen** (Vorschlag Must) – Abnahmeszenario `S` (S-16) | `F3` (3, 6), H-08, `B` (Playtomic: Konfliktmeldung bei Serien); Abnahmeszenario `S` (S-16) | | |
| FA-18 | **Serie bestätigen** (Vorschlag Must) – `F3` (6) + `A` (Bestätigung durch den Empfang, OP-03); `S` (S-06: neue Abendzeiten steuert die GL) | `F3` (6) + `A` (Bestätigung durch den Empfang, OP-03); `S` (S-06: neue Abendzeiten steuert die GL) | | |
| FA-19 | **Einzeltermin einer Serie absagen** (Vorschlag Must) – `S` (S-06) | `F3` (6), H-09; `S` (S-06) | | |
| FA-20 | **Serienzugehörigkeit erkennen** (Vorschlag Should) – `F3` (6) + `A` | `F3` (6) + `A` | | |
| FA-21 | **Bestätigung senden** (Vorschlag Must) – `F5` («Information») + `A` (Kanal E-Mail, OP-07), H-13 | `F5` («Information») + `A` (Kanal E-Mail, OP-07), H-13 | | |
| FA-22 | **Erinnerung vor dem Termin** (Vorschlag Should) – `S` (S-08: Erinnerung am Vortag) | `F5` («Information»), `B` (eTermin), H-14; `S` (S-08: Erinnerung am Vortag) | | |
| FA-23 | **Betroffene bei Sperrzeit informieren** (Vorschlag Should) – `A` (H-16), `F5` («Information») | `A` (H-16), `F5` («Information») | | |
| FA-25 | **Buchungsregeln je Kundengruppe festlegen** (Vorschlag Must) – Regelarten `A` | `F5` («Welche Regeln … gelten für welche Kundengruppen?»), H-06; Regelarten `A` | | |
| FA-26 | **Kontingente festlegen** (Vorschlag Should) – `A` (H-07, Konflikt K-01, OP-09); `S` (S-04: höchstens die Hälfte der Abendstunden für Serien) | `A` (H-07, Konflikt K-01, OP-09); `S` (S-04: höchstens die Hälfte der Abendstunden für Serien) | | |
| FA-27 | **Anlage sperren** (Vorschlag Must) – `A` (H-16), `F3` (2) | `A` (H-16), `F3` (2) | | |
| FA-28 | **Betroffene Reservationen bei Sperrzeit anzeigen** (Vorschlag Must) – `A` (H-16), `F3` (3) | `A` (H-16), `F3` (3) | | |
| FA-29 | **Auslastung auswerten** (Vorschlag Should) – Kennzahlen `S` (S-09) | `F5` (Steuerung), `F4` (Ziel «Kapazitäten besser nutzen»), H-15; Kennzahlen `S` (S-09) | | |
| FA-30 | **Stornierungen auswerten** (Vorschlag Should) – `F3` (4), `F5` (Steuerung) + `A`; `S` (S-09) | `F3` (4), `F5` (Steuerung) + `A`; `S` (S-09) | | |
| FA-31 | **Auswertungen exportieren** (Vorschlag Could) – `S` (S-09: «Einmal im Monat reicht, als Tabelle für den Verwaltungsrat»), `A` | `S` (S-09: «Einmal im Monat reicht, als Tabelle für den Verwaltungsrat»), `A` | | |
| FA-32 | **Anlagen und Öffnungszeiten pflegen** (Vorschlag Must) – `F2` (Angebot), `F5` (IT) + `A` | `F2` (Angebot), `F5` (IT) + `A` | | |
| FA-34 | **Bestehende Reservationen übernehmen** (Vorschlag Must) – `F2` («interne Listen») + `A` (H-17, OP-15) | `F2` («interne Listen») + `A` (H-17, OP-15) | | |
| FA-36 | **Verfügbarkeit online anzeigen** (Vorschlag Should · Variante Self-Service) – `F3` (2), `F4` («Verfügbarkeiten», «komfortabler für Kunden») + `A` (Self-Service nicht ausdrücklich gefordert, OP-02), H-01, H-05 | `F3` (2), `F4` («Verfügbarkeiten», «komfortabler für Kunden») + `A` (Self-Service nicht ausdrücklich gefordert, OP-02), H-01, H-05 | | |
| FA-37 | **Serie online beantragen** (Vorschlag Should · Variante Self-Service) – `F3` (6), `F5` (Serien) + `A` (OP-02, OP-08), H-08; `S` (S-06, S-11) | `F3` (6), `F5` (Serien) + `A` (OP-02, OP-08), H-08; `S` (S-06, S-11) | | |
| QA-01 | **Erstreservation ohne Hilfe** (Vorschlag Should · Variante Self-Service) – `F4` (Nutzen «komfortabler»), `A` | `F4` (Nutzen «komfortabler»), `A` | | |
| QA-02 | **Schnelle Erfassung am Empfang** (Vorschlag Must) – `F3` (1), `A` (H-19); `S` (S-02: 40–60 Anrufe pro Tag) | `F3` (1), `A` (H-19); `S` (S-02: 40–60 Anrufe pro Tag) | | |
| QA-03 | **Nutzung auf Smartphone und PC** (Vorschlag Should · Variante Self-Service) – `A` (H-20, «auch auf dem Smartphone nutzbar»); `S` (S-14: keine eigene App) | `A` (H-20, «auch auf dem Smartphone nutzbar»); `S` (S-14: keine eigene App) | | |
| QA-04 | **Sprache** (Vorschlag Must) – `F2` (Raum Zürich) + `A` | `F2` (Raum Zürich) + `A` | | |
| QA-05 | **Verfügbarkeit** (Vorschlag Must) – `F3` (2, «nicht jederzeit zentral ersichtlich») + `A` (H-20); 30-Minuten-Grenze `S` (S-12) | `F3` (2, «nicht jederzeit zentral ersichtlich») + `A` (H-20); 30-Minuten-Grenze `S` (S-12) | | |
| QA-06 | **Weiterarbeit bei Ausfall** (Vorschlag Should) – `S` (S-13), H-23 | `S` (S-13), H-23 | | |
| QA-07 | **Antwortzeit Verfügbarkeit** (Vorschlag Must) – `A` | `A` | | |
| QA-08 | **Antwortzeit Reservation** (Vorschlag Should) – `A` | `A` | | |
| QA-10 | **Datensparsamkeit** (Vorschlag Must) – RB-01 (DSG Art. 6 Verhältnismässigkeit, Art. 7 datenschutzfreundliche Voreinstellungen), `A`; Datenumfang `S` (S-10), Konflikt K-05 | RB-01 (DSG Art. 6 Verhältnismässigkeit, Art. 7 datenschutzfreundliche Voreinstellungen), `A`; Datenumfang `S` (S-10), Konflikt K-05 | | |
| QA-11 | **Löschung inaktiver Konten** (Vorschlag Must) – RB-01 (DSG Art. 6), `A` (Frist, OP-17) | RB-01 (DSG Art. 6), `A` (Frist, OP-17) | | |
| QA-13 | **Rollen und Berechtigungen** (Vorschlag Must) – `F5` (Regeln und Berechtigungen), H-18 + `A` (Matrix) | `F5` (Regeln und Berechtigungen), H-18 + `A` (Matrix) | | |
| QA-14 | **Anmeldung** (Vorschlag Must) – RB-01 (DSG Art. 8 Datensicherheit), `A` | RB-01 (DSG Art. 8 Datensicherheit), `A` | | |
| QA-15 | **Änderungen nachvollziehen** (Vorschlag Must) – `F3` (1, 3; Rückfragen), `A` | `F3` (1, 3; Rückfragen), `A` | | |
| QA-16 | **Verschlüsselte Übertragung und Datensicherung** (Vorschlag Must) – RB-01 (DSG Art. 8 Datensicherheit), `A` | RB-01 (DSG Art. 8 Datensicherheit), `A` | | |

*72 Zeilen, erzeugt aus Spezifikation v0.7.*
