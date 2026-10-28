# Zwischenstand PVA 6 – Kurzvorstellung ArenaOne

Artefakt **R9** (RE-Rolle) aus dem Fahrplan; der Stakeholder-Beitrag S5 liegt in `stakeholder/` (Teil C).

> **Vorgabe Merkblatt (S. 2):** «Zu diesem Termin treten die Gruppenpaarungen gemeinsam auf, wobei man in der Rolle als Stakeholder erzählt, wie es vorangeht, und dann in der Rolle als Requirements Engineer, in welcher Phase des RE-Prozesses man sich befindet. Dieser Termin dient auch zum Erfahrungsaustausch.»
>
> Wir treten **zweimal** auf: (1) mit **Gruppe 2** – sie als Stakeholder, wir als RE (Teil A und B); (2) mit **Gruppe 3** – wir als Stakeholder, Gruppe 3 als RE (Teil C). Dauer ist im Merkblatt nicht festgelegt – Annahme **ca. 5 min pro Paarung**, vom Dozenten bestätigen lassen. Folien verlangt das Merkblatt nicht («Kurzvorstellung»); wir haben trotzdem drei vorbereitet, weil sich Zahlen und Kreislauf so schneller zeigen lassen.

## Teil A – Gruppe 2 als Stakeholder (ca. 1,5 min, spricht Gruppe 2)

Vorab mit Gruppe 2 abstimmen, damit sich die Teile nicht wiederholen. Vorschlag für ihre Stichworte:

- Projekt in einem Satz: ArenaOne Sportzentrum AG will Buchung und Belegung von Plätzen und Hallen zentral und einheitlich organisieren (Folie 3 ihrer Präsentation).
- Wie es vorangeht aus Auftraggebersicht: `[z. B. Interview in PVA 5, Protokoll bestätigt, offene Entscheide]`
- Was sie vom RE-Team bisher bekommen haben: `[Fragenliste V-01…V-37, Interviewprotokoll PVA 5, Bestätigungsliste, Spezifikation v0.8 zum Review]` – nur nennen, was tatsächlich verschickt wurde.

## Teil B – Gruppe 9 als RE (ca. 3 min)

**Folien:** [`praesentation-pva9-10/RE_ArenaOne_Zwischenstand_PVA6.pptx`](praesentation-pva9-10/RE_ArenaOne_Zwischenstand_PVA6.pptx) ([PDF](praesentation-pva9-10/RE_ArenaOne_Zwischenstand_PVA6.pdf)), 3 Folien mit Sprechernotizen, gebaut mit `werkzeuge/build-praesentation-arenaone.js` (Zahlen aus der Spezifikation).

> **Stand der Folien: Spezifikation v0.7 (28.10.2026), vor dem Interview PVA 5.** PVA 6 liegt nach PVA 5. Vor dem Auftritt nach dem Bestätigungsschritt ([RE-Plan](re-plan.md), Abschnitt 6a) Folie 1 (Phase «Validieren» läuft, Version v0.8) und die Zahlen auf Folie 2 an den dann gültigen Stand anpassen und neu bauen; was das Interview und die [Bestätigungsliste](annahmen-bestaetigung-gruppe2.md) bestätigt oder widerlegt haben, gehört auf Folie 3.

| Folie | Inhalt | Zeit | Sprecher | Stichworte |
|---|---|---|---|---|
| B1 | **Wo wir im RE-Kreislauf stehen** (Folie 28, Phasen markiert) | 1:00 | Görkem Taspinar | Runde 1 ohne Gruppe 2 abgeschlossen: Analyse der Präsentation, Stakeholder, Kontext, Ziele, simuliertes Interview (Probelauf, ersetzt nicht die Ermittlung), Spezifikation v0.7 intern geprüft; als Nächstes Validierung mit Gruppe 2 |
| B2 | **53 Anforderungen – jede mit Quelle** | 1:00 | Ardian Ibrahimaj | 12 Stakeholder, 9 Use Cases, 37 funktionale (20 Must) und 16 Qualitätsanforderungen, 6 Randbedingungen, 11 Parameter, 22 offene Punkte; Herkunft: 41 mit Folie/Notiz von Gruppe 2 belegt, 12 ohne Folienbezug |
| B3 | **Die grössten Fragen betreffen Regeln, nicht Funktionen** | 1:00 | Görkem Taspinar | Erkenntnisse: Self-Service ist nicht verlangt (OP-02) – darum läuft der Kernprozess über den Empfang, Online-Selbstbuchung ist eine Variante (Should); Serien haben versteckte Anforderungen (FA-19, Folie 47), Konflikte entscheidet die GL (K-01, K-02); nächste Schritte bis PVA 9/10: Bestätigungsliste, v0.8, Review, Priorisierung durch die GL, Szenarien, Freigabe v1.0 |

Zahlen und Phasen auf Stand **Spezifikation v0.7** ([Kapitel 9](anforderungsspezifikation-arenaone.md#9-nachverfolgbarkeit)); keine davon ist von Gruppe 2 bestätigt.

### Leitfragen für den Erfahrungsaustausch (falls Zeit)

- Was hat euch als RE-Team geholfen, an messbare Qualitätsziele zu kommen?
- Wie geht ihr damit um, wenn der Auftraggeber Lösungen statt Bedürfnisse nennt?
- Wie haltet ihr Kontakt zwischen den PVA?

## Teil C – Gruppe 9 als Stakeholder für Gruppe 3

Ausgearbeitet in der Stakeholder-Rolle: `stakeholder/praesentation-stakeholder.md`, Abschnitt «PVA 6 – Wie es vorangeht» (Folien 1–2 von `stakeholder/praesentation-stakeholder.pptx`). Hier nicht doppelt pflegen.

## Checkliste vor PVA 6

- [ ] Protokoll und Bestätigungsliste von Gruppe 2 zurück, Spezifikation v0.8 eingearbeitet, PPTX neu gebaut (Zahlen B2 kommen aus der Matrix)
- [ ] Folie 1: Phase «Validieren» und Version angepasst; Folie 3: was das Interview bestätigt oder widerlegt hat
- [ ] Folien mit Gruppe 2 und mit Gruppe 3 abgestimmt (Reihenfolge, wer spricht)
- [x] Kreislauf-Grafik mit markierter Phase vorbereitet (Folie B1)
- [ ] Zeit geprobt (3 min)
