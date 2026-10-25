# ArenaOne – Buchungs- und Belegungssystem (Demo)

Statische Web-App (HTML, CSS, JavaScript) nach der Anforderungsspezifikation ArenaOne v0.5. Sie hat keinen Build-Schritt, keinen Server und keine externen Bibliotheken. Alle Daten liegen im `localStorage` des Browsers; beim ersten Start werden Demo-Daten erzeugt.

## Starten

- **Lokal:** `index.html` im Browser öffnen (funktioniert auch per `file://`). Oder `python3 -m http.server` im Ordner starten und `http://localhost:8000` öffnen.
- **GitHub Pages:** Ordnerinhalt in ein Repository legen und Pages auf diesen Ordner einstellen. Es braucht keine Konfiguration.
- **Anmelden:** Die Demo-Konten stehen auf der Anmeldeseite (ein Klick füllt die Felder aus).
  - Kundschaft: `anna`, `marco`, `lea`, `peter`/`sandra` (TC Seefeld), `lisa` (Badminton Club), `thomas` (Firma), `laura` (Trainerin), Passwort `demo1234`.
  - Mitarbeitende: `empfang`, `gl`, `admin`, `betrieb`, Passwort `arenaone-demo`. Der zweite Faktor wird als simulierte SMS angezeigt.
- **Zurücksetzen:** «Hilfe» → «Alle Daten zurücksetzen».
- **Logik-Tests:** `node tests/logik-test.js` (28 Prüfungen entlang der Akzeptanzkriterien).

## Umgesetzt

| Bereich | Anforderungen |
|---|---|
| Verfügbarkeit nach Datum und Sportart, auch ohne Anmeldung | FA-01, FA-03, QA-14 |
| Gesamtbelegung Tag/Woche (Zeitachse) mit Kanal, Art und Sperrzeiten; Druckliste für 7 Tage (A4 quer) | FA-02, FA-20, QA-06 |
| Online-Reservation, Reservation im Auftrag mit Kanal, Doppelbuchungsschutz mit Alternativen, Kundenkonten | FA-04 bis FA-08 |
| Verschieben und Stornieren (Stornofrist, «kurzfristig»), sofortige Freigabe | FA-09 bis FA-12 |
| Warteliste: alle benachrichtigen, wer zuerst bestätigt, Annahmefrist | FA-13 bis FA-15 |
| Serien: Antrag, Konfliktliste, Bestätigung ganz oder ohne Konflikttermine, Ablehnung mit Grund, Einzeltermine absagen/verschieben | FA-16 bis FA-20 |
| Bestätigungen, Erinnerungen, Sperrzeit-Infos, SMS-Option (Versand simuliert, Seite «Nachrichten») | FA-21 bis FA-23, FA-35 |
| Kundengruppen, Buchungsregeln, Kontingente mit PA-10-Grenze, alle Parameter PA-01 bis PA-10 | FA-24 bis FA-26, Kap. 7.3 |
| Sperrzeiten mit Pflichtentscheid je betroffener Reservation | FA-27, FA-28 |
| Auswertungen (Anlage, Sportart, Kundengruppe, Wochentag, Stunde; Stornierungen), CSV-Export | FA-29 bis FA-31 |
| Anlagen und Öffnungszeiten, Benutzer und Rollen, Übernahme alter Listen (CSV mit Probelauf) | FA-32 bis FA-34 |
| Rollen und Berechtigungsmatrix, Anmeldung, Verlauf/Protokoll, Datensparsamkeit, Löschlauf, Datenauskunft, Deutsch, Smartphone ab 360 px | QA-02 bis QA-04, QA-10 bis QA-15 |

## Nicht oder nur teilweise umgesetzt

- **QA-05, QA-07, QA-08, QA-09 (Betrieb, Last, Antwortzeiten):** In einer reinen Browser-App gibt es keinen gemeinsamen Server. Mehrere Sitzungen sind nur Tabs desselben Browsers; sie werden über das `storage`-Ereignis sofort abgeglichen.
- **QA-16:** HTTPS liefert GitHub Pages. Die Datensicherung ist nur ein manueller JSON-Download und -Upload, ohne tägliche Automatik.
- **QA-14:** Anmeldung und zweiter Faktor sind simuliert; Passwörter liegen im Browser – das ist keine echte Sicherheit.
- **FA-21 bis FA-23, FA-35:** Es werden keine echten E-Mails oder SMS versandt (Postausgang-Simulation).
- **QA-01, QA-02:** Sie sind auf schnelle Bedienung ausgelegt (Kundensuche, erstes freies Zeitfenster vorgewählt), aber nicht mit Testpersonen gemessen.
- **WO-01 bis WO-05:** Sie sind bewusst nicht umgesetzt (Won't in v1).

Alle Annahmen und Fragen an die Auftraggeberin: [ANNAHMEN.md](ANNAHMEN.md).

## Aufbau

```
index.html          Seite und Skript-Reihenfolge
css/style.css       Layout, Smartphone, Druck
js/util.js          Datum/Zeit, CSV, Download
js/store.js         localStorage, Sitzung, Rollen und Berechtigungsmatrix (QA-13)
js/logic.js         Fachlogik (Regeln, Konflikte, Warteliste, Serien, Sperrzeiten, Auswertungen, Datenschutz)
js/seed.js          Demo-Daten
js/ui.js            Router, Navigation, Dialoge
js/views-kunde.js   Verfügbarkeit, Meine Reservationen, Anmeldung, Nachrichten
js/views-betrieb.js Gesamtbelegung, Serien, Kunden, Sperrzeiten, Regeln, Auswertungen, Administration
tests/logik-test.js Node-Tests der Fachlogik
```
