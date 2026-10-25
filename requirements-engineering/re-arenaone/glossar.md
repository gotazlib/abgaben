# Glossar ArenaOne

Begleitet die Anforderungsspezifikation. Stand: 25.10.2026, **Entwurf vor PVA 5** – keiner der Begriffe ist von Gruppe 2 bestätigt. Regeln und Zweck wie in der [Vorlage](vorlagen/glossar.md): ein Begriff = eine Bedeutung; Synonyme werden genannt, in der Spezifikation steht nur der Hauptbegriff (Folie 47: uneinheitliche Terminologie).

> **Befund aus der Präsentation:** Gruppe 2 verwendet «Buchung» und «Reservation» abwechselnd (`F2`–`F5`), ebenso «Stornierung» und «Absage» (`F5`) sowie «Serie», «wiederkehrende Buchung» und «wiederkehrende Reservation». Wir schlagen unten je einen Hauptbegriff vor und lassen ihn in PVA 5 bestätigen.

Quellenkürzel wie in der [Analyse](analyse-arenaone.md): `F` = Folie, `N` = Sprechernotiz, `A` = Annahme, `B` = Benchmark, `S` = Simulation (Rollenspiel zur Vorbereitung, ersetzt nicht die Ermittlung mit Gruppe 2).

## A. Fachbegriffe ArenaOne

| Begriff (Hauptbegriff) | Definition (Vorschlag) | Synonyme (in der Spezifikation nicht verwenden) | Abgrenzung / Beispiel | Quelle | bestätigt |
|---|---|---|---|---|---|
| **Anlage** | Oberbegriff für alles, was reserviert werden kann: Platz oder Halle bzw. Hallenteil | Ressource, Sportanlage, Court | Ein Tennisplatz ist eine Anlage; die Garderobe nicht | `F4` («Sportanlagen») + `A` | nein |
| **Platz** | Anlage für eine Sportart mit festem Spielfeld: Padel-, Tennis- oder Badmintonplatz | Court, Feld | Badmintonplätze können in einer Mehrzweckhalle liegen (siehe Hallenteil) | `F2` + `A` | nein |
| **Mehrzweckhalle** | Halle für verschiedene Sportarten, als Ganzes oder in Teilen reservierbar | Halle, Turnhalle | ob Teilung möglich ist: offen (V-24) | `F2` | nein |
| **Hallenteil** | abgetrennter Teil einer Mehrzweckhalle, der einzeln reserviert werden kann | Hallendrittel, Hallenfeld | Wenn die ganze Halle reserviert ist, sind alle Hallenteile belegt | `A` | nein |
| **Reservation** | verbindliche Belegung einer Anlage für einen Zeitraum durch einen Kunden | Buchung, Platzbuchung | Eine Anfrage per E-Mail ist noch keine Reservation, erst der Eintrag im System (Hypothese H-02) | `F2`–`F5` | nein |
| **Einzelreservation** | Reservation für genau einen Zeitraum | Einzelbuchung | Gegenstück zur Serie | `F3` | nein |
| **Serie** | Reservation, die sich in festem Rhythmus wiederholt (z. B. jeden Dienstag 19–21 Uhr von September bis März) und aus mehreren Einzelterminen besteht | wiederkehrende Buchung, wiederkehrende Reservation, Abo, Dauerreservation, «Hallenabo» (Wort eines Vereins in der Simulation, `S`) | Vereinstraining, Trainingsgruppe | `F3`, `F4`, `F5` | nein |
| **Einzeltermin** | ein einzelnes Vorkommen einer Serie | Serientermin | kann abgesagt werden, ohne die Serie zu beenden (H-09) | `A` | nein |
| **Verfügbarkeit** | Zeiträume, in denen eine Anlage frei und reservierbar ist (Öffnungszeit minus Reservationen minus Sperrzeiten) | freie Zeiten, Kapazität | | `F4` | nein |
| **Belegung** | alle Reservationen und Sperrzeiten einer Anlage über einen Zeitraum | Belegungsplan, Kalender | Gegenstück zur Verfügbarkeit | `F1`, `F2` | nein |
| **Gesamtübersicht** | Ansicht der Belegung aller Anlagen gleichzeitig | Belegungsübersicht, Übersicht | | `F3` | nein |
| **Änderung** | Anpassung einer bestehenden Reservation (Zeit, Anlage, Dauer, Person) | Umbuchung, Verschiebung | Eine Änderung ist keine Stornierung mit Neureservation (offen, ob Stornoregeln gelten) | `F4` | nein |
| **Stornierung** | Aufhebung einer Reservation durch Kunde oder ArenaOne; die Zeit wird wieder verfügbar | Absage, Storno | | `F3`, `F4`, `F5` | nein |
| **kurzfristige Stornierung** | Stornierung nach Ablauf der Stornofrist | späte Absage | Frist ist offen (V-09) | `F3`, `F5` | nein |
| **Stornofrist** | Zeitpunkt vor Beginn, bis zu dem ohne Folgen storniert werden kann | | Wert offen, z. B. `[x]` Stunden | `A` | nein |
| **No-Show** | Kunde erscheint ohne Stornierung nicht | Nichterscheinen | offen, ob ArenaOne das erfasst | `A` | nein |
| **Doppelbuchung** | zwei Reservationen für dieselbe Anlage im selben Zeitraum | Überbuchung | | `F3` | nein |
| **Fehlbuchung** | Reservation mit falscher Anlage, Zeit oder Person | | | `F3` | nein |
| **Warteliste** | Liste von Kunden, die eine bereits belegte Zeit wollen und benachrichtigt werden, wenn sie frei wird | Nachrückliste | ob gewünscht: offen (`F5`) | `F5` | nein |
| **Kanal** | Weg, auf dem eine Reservationsanfrage eingeht: Telefon, E-Mail, Empfang, (künftig) online | Eingangskanal | | `F2` | nein |
| **Empfang** | Mitarbeitende am Schalter, die Reservationen entgegennehmen und koordinieren | Rezeption, Front Desk | | `F2`, `F5` | nein |
| **Kunde** | Person oder Organisation, die eine Reservation macht | Nutzer, User, Spieler | Oberbegriff für die Kundengruppen | `F2` | nein |
| **Kundengruppe** | Kategorie von Kunden mit eigenen Regeln: Privatkunde, Verein, Firma, Trainingsgruppe | Kundensegment, Kundenart | ob Vereine und Firmen eine Gruppe sind: offen (V-05) | `F2`, `F3`, `F5` | nein |
| **Privatkunde** | Einzelperson, die für sich und Mitspielende reserviert | Einzelkunde | | `F2`, `F5` | nein |
| **Verein** | Sportverein, der meist Serien für Training und Wettkampf reserviert | Club | | `F2`, `F5` | nein |
| **Firma** | Unternehmen, das für Anlässe oder Mitarbeitende reserviert | Firmenkunde | | `F2`, `F5` | nein |
| **Trainingsgruppe** | feste Gruppe, die regelmässig mit einem Trainer trainiert | Kursgruppe | zu klären: gebucht vom Trainer, vom Verein oder von ArenaOne? | `F2` | nein |
| **Trainer** | Person, die Lektionen oder Trainings auf einer Anlage gibt | Coach, Trainerin | angestellt oder extern: offen | `F5` | nein |
| **Kundenkonto** | minimale Daten eines Kunden, die für Reservationen nötig sind (Name, Kontakt, Kundengruppe) | Profil, Account | kein vollständiges CRM (`F4`) | `F4` + `A` | nein |
| **Buchungsregel** | Vorgabe, die festlegt, wer was wie reservieren darf (Vorlauf, Dauer, Anzahl, Zeitfenster) | Regel, Policy | je Kundengruppe und Rolle (`F5`) | `F5` | nein |
| **Buchungsvorlauf** | wie weit im Voraus eine Kundengruppe reservieren darf | Vorlaufzeit, Buchungsfenster | | `F5` | nein |
| **Kontingent** | für eine Kundengruppe reservierte Zeitfenster (z. B. Vereine Mo–Do 18–21 Uhr) | Blockzeit | Hypothese H-07 | `A` | nein |
| **Primetime** | stark nachgefragte Zeitfenster (abends, Wochenende) | Hauptzeit, Spitzenzeit | genaue Zeiten offen | `A` | nein |
| **Sperrzeit** | Zeitraum, in dem eine Anlage nicht reservierbar ist (Unterhalt, Turnier, Umbau, Wetter) | Blockierung | | `A` | nein |
| **Auslastung** | Anteil der reservierten Zeit an der verfügbaren Öffnungszeit einer Anlage | Belegungsquote | Messgrösse für GZ-1 | `F4` + `A` | nein |
| **Benachrichtigung** | Nachricht des Systems an Kunden oder Mitarbeitende (Bestätigung, Erinnerung, Wartelisten-Info, Änderung) | Information, Notification | Kanal offen (E-Mail/SMS) | `F5` | nein |
| **Padel** | Rückschlagspiel im Doppel auf einem umwandeten Platz; wird bei ArenaOne angeboten | Padel-Tennis | | `F2` | – (allgemein) |

## B. RE-Begriffe (Block 1)

Siehe [Vorlage, Abschnitt B](vorlagen/glossar.md#b-re-begriffe-die-wir-in-spezifikation-und-präsentation-verwenden-aus-block-1). Zusätzlich für dieses Projekt:

| Begriff | Bedeutung bei uns |
|---|---|
| Hypothese (`H-…`) | Anforderungsentwurf vor PVA 5, nicht bestätigt; wird nach dem Interview Anforderung, geändert oder verworfen |
| Simulation (`S`) | Antwort aus unserem simulierten Interview (Rollenspiel zur Vorbereitung) – keine Kundenaussage, ersetzt nicht die Ermittlung mit Gruppe 2 |
| Benchmark (`B`) | Vergleich mit Playtomic, GotCourts, eTermin – liefert Fragen, keine Anforderungen |
