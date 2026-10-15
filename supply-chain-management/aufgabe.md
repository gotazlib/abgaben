# Aufgabe und Bewertung

Leistungsnachweis im Fach **Supply Chain Management** an der HWZ Hochschule für Wirtschaft Zürich
(Dozent Michael Fuchs). Diese Seite fasst die Fallstudie, den Auftrag und die Bewertungskriterien
**in eigenen Worten** zusammen, damit die veröffentlichte Arbeit nachvollziehbar ist. Die
Originalunterlagen (Fallstudie, Beurteilungsraster, Kursskript, Rohdaten) sind urheberrechtlich
geschützt und darum nicht veröffentlicht.

*Nach: HWZ, Fallstudie Grofu AG V3.0 / Beurteilungsraster SCM, Dozent Michael Fuchs.*

Zur Arbeit selbst: [Übersicht Supply Chain Management](README.md).

## 1 Die Fallstudie Grofu AG in Kürze

**Unternehmen.** Die Grofu AG ist ein international tätiger Konzern, der in über 50 Ländern
Infrastruktur baut, vor allem Anlagen für Solartechnik sowie Energie- und Datenübertragung. Über
übernommene Zulieferer fertigt er elektronische Komponenten selbst. Die Tochter *Grofu AG Indien
Ltd.* (mehrere Tausend Mitarbeitende, über 1 Mrd. $ Umsatz pro Jahr) produziert im Norden Indiens,
rund 218 km von der pakistanischen Grenze entfernt, Systemkomponenten für Anlagen in Indien und
vor allem im Nahen Osten. Weil das bisherige Werk an seine Kapazitätsgrenze stiess, baut das
indische Management ein neues Werk – allerdings hat es zuerst gebaut und erst danach mit der
Prozessplanung begonnen. Die Holding verlangt nun ein Konzept für die Inbound-Logistik und danach
eine Potenzialanalyse der weltweiten Distribution. Kunden fordern schnellere und pünktlichere
Lieferungen, mehr Flexibilität und bessere Kommunikation; der Preisvorteil der Fertigung in Indien
genügt nicht mehr.

**Materialfluss heute.**

- Materialstufen: Rohmaterial (RM) → Halbfabrikate/Komponenten (SFG) → Fertigprodukte (FG).
  SFG werden auf Lager produziert (Make-to-Stock), geplant mit SAP APO auf Basis des jährlichen
  Verkaufsbudgets und von Vergangenheitsdaten.
- Aus Kapazitätsgründen kauft Grofu zusätzlich SFG und FG bei anderen Herstellern in Indien zu.
  Outsourcing-Partner erhalten kommissionierte Rohmaterial-Lose, montieren vor und liefern
  Komponenten zurück.
- **Lager 1:** automatisches Rohwarenlager mit 12 000 Palettenplätzen und 30 000 Behältern.
- **Lager 2:** Produktionslager vor der Fertigung; gedacht für 3 Tage Bedarf, tatsächlich liegt
  dort Material für mehrere Wochen. Nachschub aus Lager 1 wird 3 Tage vor der Produktion
  disponiert (Push), braucht etwa 2 Arbeitstage und fährt per täglichem LKW-Shuttle.
- **Lager 3:** Zukaufteile für den Versand; laut Auftrag bei der Materialflussplanung nicht zu
  berücksichtigen.
- **Lager 4 (Karatschi, Pakistan):** Importware wird am nächstgelegenen Seehafen zwischengelagert,
  konsolidiert und nach der Zollabwicklung an Lager 1 geliefert – rund 400 Sendungen pro Tag. Die
  Zollanmeldung und die eigentliche Verzollung lassen sich trennen, etwa über ein Zollfreilager
  (Bonded Warehouse), aus dem erst bei der Entnahme verzollt wird. Die Grenzformalitäten zwischen
  den beiden Ländern gelten als äusserst komplex.

**Kennzahlen und Ziele der Holding.**

| Thema | Ausgangslage / Ziel |
| --- | --- |
| Bestände | Senkungspotenzial ca. 30–40 % |
| Lieferzeit | heute ca. 30–50 % länger als beim Wettbewerb; Materialfluss deutlich beschleunigen |
| Kosten | spürbare Kostensenkung inkl. Personalabbau, möglichst viel automatisieren; Investitionen pauschal budgetiert |
| Kommissionierung | 14 Mrd. Teile bzw. 14 Mio. Picks pro Jahr; mit Hochleistungssystemen (500 Picks pro Person und Schicht, 280 Arbeitstage) wären ca. 100 Personen nötig, heute sind es 600 |
| Liefertreue Anlagenbau | 55 % (schon ein Tag Verzug kostet viel, Konventionalstrafen) |
| Frachtkosten OEM-Geschäft | Luftfracht zu den 4 Distributionszentren der Kunden; entspricht 84 % des Nettogewinns im Segment |

**Strategische Vorgaben.**

1. Das neue Werk wird ein eigenständiges Unternehmen und «eigener Zulieferer» für Teile mit
   schützenswertem Know-how oder hohem Schwierigkeitsgrad – geschätzt rund 30 % der heute
   produzierten Teile.
2. Die Inbound-Prozesse werden nach LEAN gestaltet: wenig Handling, kurze Wege, keine
   Verschwendung von Fläche, Zeit und Personal, weniger Lieferantenkontakte und Administration,
   platz- und zeitsparende Technik, Standardisierung.
3. Prozesse ohne Wertschöpfung oder ausserhalb der Kernkompetenz werden mit einer
   Make-or-Buy-Analyse kritisch geprüft.
4. Für die weltweite Distribution ist eine Potenzialmatrix zu erstellen, die Distributionswege je
   Markt nach Lieferzeit, Kosten, Flexibilität und Supply-Chain-Risiken bewertet. Ist-Daten dazu
   gibt es bewusst keine.

**Kundensegmente.** (1) Anlagenbau im Projektgeschäft: sehr kundenspezifisch, auftragsbezogene
Fertigung, Luftfracht zum Montageort, Durchlaufzeit erfolgskritisch. (2) Endgeräte unter eigenem
Label für den Fachhandel weltweit, stark standardisiert. (3) Endgeräte als OEM für zwei weltweit
tätige Elektronikkonzerne.

Zur Fallstudie gehören ausserdem Daten für eine ABC-Analyse des Rohmaterials (Wertanteile,
Lieferanten, Bestellungen, EDI-Fähigkeit, Stückzahlen, Herkunft lokal/Übersee). Die Auswertung
dazu ist Teil der Arbeit (Ordner `abgabe/analyse/`).

## 2 Auftrag

Verlangt ist eine **kursbegleitende, praxisorientierte Zusammenfassung** mit zwei Teilen:
einer persönlichen Reflexion der Kursinhalte (eigene Erkenntnisse) und dem Transfer auf die
Fallstudie Grofu in vier Blöcken.

| Block | Inhalt |
| --- | --- |
| 1 – Supply Chain | Den gesamten Materialfluss mit SCM-Ansätzen und -Methoden neu denken und optimieren, ohne sich in Details zu verlieren. |
| 2 – Operative Beschaffung | Konkrete Beiträge der Beschaffung zu tiefen Beschaffungskosten, Qualitätssicherung, hohem Servicegrad und geringem Kapitalbedarf. |
| 3 – Produktionslogistik | Soll-Zustand entwerfen, passende Produktionsform/Fertigungsart wählen und als Flussdiagramm darstellen; Massnahmen gegen Verschwendung sowie für Qualität, Servicegrad und geringen Kapitalbedarf; Logistikstrategie bzw. -konzept beschreiben. |
| 4 – Lagerlogistik | Ausgangslage, Soll-Zustand und Massnahmen, um den Lagerumschlag zu erhöhen, die Lagerfläche zu verkleinern und die Durchlaufzeit zu verkürzen; Kennzahlen, mit denen sich die Verbesserung messen lässt. |

**Formale Anforderungen.**

- Umfang als Richtwert 15–20 A4-Seiten, ohne Verzeichnisse und Anhang.
- Quellen vollständig angeben, Zitate nach den Zitierrichtlinien der HWZ kennzeichnen.
- Erlaubte Hilfsmittel: Kursunterlagen, Online-Recherche, Fachliteratur und KI-Werkzeuge
  (deren Einsatz ist offenzulegen).
- Einzel- oder Gruppenarbeit mit höchstens drei Personen.
- Abgabe als PDF an den Dozenten innerhalb von zwei Wochen nach Kursende.

## 3 Bewertungskriterien

Bewertet wird mit maximal **75 Leistungspunkten (LLP)**: 25 für die Dokumentation, 50 für den
fachlichen Inhalt. Die Leitfragen sind hier sinngemäss und gekürzt wiedergegeben.

| Nr. | Kriterium | Leitfrage (sinngemäss) | max. LLP |
| --- | --- | --- | ---: |
| 1.1 | Argumentation und Dokumentation | Sind Argumente und Begründungen lückenlos und leicht nachvollziehbar, und sind alle verlangten Punkte behandelt? | 10 |
| 1.2 | Vor- und Nachteile | Werden Vor- und Nachteile logisch hergeleitet – im besten Fall mit neuen Ansätzen und Erkenntnissen statt nur Standardargumenten? | 5 |
| 1.3 | Darstellung | Sind Aufbau und Abbildungen übersichtlich, nach gängigen Standards gestaltet und klar auf den Text bezogen? | 5 |
| 1.4 | Sprache | Ist die Arbeit verständlich und korrekt geschrieben, mit passenden Fachbegriffen? | 5 |
| 2.1 | Lösungsansätze | Sind die Lösungsansätze offen und neuartig, aus mehreren Blickwinkeln verglichen und mit eigenen Analyseergebnissen verknüpft? | 10 |
| 2.2 | Entscheidungen | Stützen sich Entscheide auf genügend Fakten, werden Auswirkungen sowie Vor- und Nachteile abgewogen, ohne das Ergebnis vorwegzunehmen? | 10 |
| 2.3 | Gehalt und Richtigkeit | Sind die Lösungen realistisch und inhaltlich gehaltvoll? | 20 |
| 2.4 | Argumentation | Entwickelt die Arbeit einen eigenen Standpunkt auf aktuellem Wissensstand, und ist sie schlüssig und widerspruchsfrei? | 10 |
| | **Total** | | **75** |

---

*Zusammenfassung und Kriterientabelle sind eigene Formulierungen nach: HWZ, Fallstudie Grofu AG
V3.0 / Beurteilungsraster SCM, Dozent Michael Fuchs. Massgeblich sind allein die Originalunterlagen.*
