# Systemkontext und Kontextdiagramm ArenaOne

Artefakt **R3** (Fahrplan 3.2), Phase **Ermitteln**. Stand: 28.10.2026 (Spezifikation v0.7), **Hypothese vor PVA 5**.
Aufbau nach [`vorlagen/kontextdiagramm.md`](vorlagen/kontextdiagramm.md). Systembegriff (Folie 20): eine zusammengehörige, von ihrer Umgebung abgrenzbare Menge von Komponenten – das Kontextdiagramm zieht diese Grenze. Quellenkürzel wie in der [Analyse](analyse-arenaone.md).

> **Kernprozess ohne Self-Service:** Kundschaft, Vereine und Trainer erreichen das System im Kernprozess über den Empfang (Telefon, E-Mail, Schalter) und erhalten vom System nur Nachrichten. Ihre direkten, gestrichelten Flüsse gelten nur in der **Variante Self-Service** (Should, offen bis PVA 5, OP-02 / V-01).
>
> Akteure und Ausschlüsse stammen aus der Präsentation (`F4`, `F5`). Gestrichelte Umsysteme (Website, Zahlung, Buchhaltung, Zutritt) sind **unsere Annahme** – ob es sie gibt und ob das System mit ihnen Daten austauscht, ist offen (Fragen V-21, V-26, V-31).

## A. Abgrenzung

| Gehört zum System (wird spezifiziert) | Gehört zum Kontext (beeinflusst das System, wird nicht gebaut) | Ausserhalb, nicht relevant |
|---|---|---|
| Ressourcen (Plätze, Hallen, Hallenteile) und ihre Verfügbarkeit (`F4`) | Kunden: Privatkunden, Vereine, Firmen, Trainingsgruppen (`F2`, `F5`) | Finanz- und Lohnbuchhaltung (`F4`) |
| Reservationen, Änderungen, Stornierungen (`F4`) | Empfang, Trainer, Geschäftsleitung, IT (`F5`) | Personalplanung (`F4`) |
| Serien / wiederkehrende Buchungen (`F4`) | Betrieb der Anlage (Sperrzeiten) (`A`) | Gastronomie (`F4`) |
| Buchungsregeln je Kundengruppe, Berechtigungen (`F5`) | Website von ArenaOne (`A`) | vollständiges CRM, Marketing (`F4`) |
| Warteliste (offen, `F5`) | Zahlungsanbieter (`A`, offen L-02) | technische Architektur, Produktwahl (`N4`, `N5`) |
| Benachrichtigungen (`F5`) | Buchhaltung als Empfänger von Daten (`A`) | |
| Übersichten und Auswertungen für die GL (`F5`) | E-Mail/SMS-Versand (`A`) | |
| minimale Kundendaten für die Buchung (`A`, Grenze zum CRM offen) | DSG (Randbedingung) | |

## B. Kontextdiagramm

Quelle: [`modelle/kontextdiagramm.mmd`](modelle/kontextdiagramm.mmd) · Bild: [`modelle/kontextdiagramm.png`](modelle/kontextdiagramm.png)

![Kontextdiagramm ArenaOne (Hypothese)](modelle/kontextdiagramm.png)


Legende: Rechteck = Person/Rolle, Parallelogramm = Umsystem, Kreis = betrachtetes System; gestrichelt = Existenz oder Umfang der Schnittstelle offen, bei Kundschaft, Vereinen und Trainern = Variante Self-Service. Die Pfeile von Kundschaft und Vereinen zum Empfang liegen ausserhalb des Systems; sie zeigen, wie Anfragen im Kernprozess hereinkommen. Beschriftung «A / B»: vor dem Schrägstrich, was ans System geht, danach, was das System liefert. Die Pfeile zeigen **fachliche** Daten, keine technischen Protokolle. Die vollständige Liste je Richtung steht in der Schnittstellenliste.

Das Bild wird aus der Mermaid-Quelle erzeugt (neu rendern nach jeder Änderung an `modelle/kontextdiagramm.mmd`).

### Schnittstellenliste

| ID | Partner | Richtung | Fachliche Daten | Menge (Annahme) | Quelle | offen |
|---|---|---|---|---|---|---|
| IF-01 | Privatkunden | ← (Kern) / ↔ (Variante) | Kern: Bestätigung, Erinnerung per E-Mail. Variante Self-Service: Verfügbarkeit, Reservation, Änderung, Storno | `[x]` Buchungen/Woche | `F4`, `F5` | Self-Service ja/nein (V-01) |
| IF-02 | Vereine & Firmen | ← (Kern) / ↔ (Variante) | Kern: Terminliste, Bestätigungen (Serienwünsche über den Empfang). Variante: Serienantrag online | `[x]` Serien/Saison | `F3`, `F5` | Vereine und Firmen getrennt? (V-05); Self-Service (V-01) |
| IF-03 | Trainer | ↔ (nur Variante) | Platzbedarf für Lektionen, eigene Platzzeiten | `[x]` Trainer | `F5` | dürfen Trainer selbst buchen? (V-23) |
| IF-04 | Empfang | ↔ | Kernprozess: Reservationen, Serienanträge, Warteliste im Auftrag der Kundschaft; Gesamtübersicht | täglich, Hauptnutzer | `F2`, `F5` | |
| IF-05 | Geschäftsleitung | ↔ | Regeln, Kontingente, Auswertungen | monatlich (`A`) | `F5` | welche Kennzahlen? (V-17) |
| IF-06 | Betrieb der Anlage | ↔ | Sperrzeiten, Belegungsplan | wöchentlich (`A`) | `A` | |
| IF-07 | IT / Administration | → | Stammdaten, Rollen | selten | `F5` | intern oder extern? (V-26) |
| IF-08 | Zahlungsanbieter | ↔ | Zahlung, Bestätigung | – | `A`, `B` | gibt es Online-Zahlung? (V-21) |
| IF-09 | Buchhaltung | → | abrechnungsrelevante Buchungen | – | `A` | Grenze zur Finanzbuchhaltung (V-21) |
| IF-10 | Website | → | Einstieg zur Buchung (nur Variante Self-Service) | – | `A` | V-01 |
| IF-11 | Nachrichtenversand | → | Bestätigung, Erinnerung, Warteliste | – | `F5` + `A` | Kanal E-Mail / SMS (V-15) |
| IF-12 | Zutritt / Licht | → | Berechtigung je Buchung | – | `A`, `B` | im Scope? (V-31) |

Prüffragen für später: Hat jede Schnittstelle mindestens eine Anforderung? Ist jeder Akteur in der [Stakeholder-Analyse](stakeholder-analyse.md)? Ist jede Datenart im [Glossar](glossar.md)?

## C. Teilsysteme (Folie 17/18)

ArenaOne baut ein **neues** System, es wird keine bestehende Lösung geändert (`F2`: heute Telefon, E-Mail, Empfang, interne Listen). Das Teilsystem-Bild ist deshalb nur zur Abgrenzung nützlich: Was ist neu, was bleibt, wie es ist?

| Teil | neu / geändert / unverändert | Bemerkung |
|---|---|---|
| Buchungs- und Belegungssystem | **neu** (grün) | Gegenstand der Spezifikation |
| interne Listen | werden abgelöst | Datenübernahme (H-17) |
| Telefon, E-Mail, Empfang als Kanäle | **geändert** (blau mit grünem Einschlag) | bleiben bestehen, buchen aber ins System (H-02) |
| Website ArenaOne | unverändert oder geändert – offen | nur Einstieg zur Buchung? |
| Finanzbuchhaltung | unverändert (blau) | nicht im Scope |
