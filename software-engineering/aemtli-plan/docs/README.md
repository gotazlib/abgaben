# Anforderungsdokumentation Ämtli

> Basis-Entwurf vom 13.10.2026. Alle Inhalte sind vorläufig und müssen noch im Team überprüft werden.

| Datei | Inhalt |
|---|---|
| [01_vision.md](01_vision.md) | Vision nach Pitch-Formel |
| [02_personas.md](02_personas.md) | Lena, Marco, Sara |
| [03_szenarien.md](03_szenarien.md) | S1–S5 und Zuordnung zu Personas und Features |
| [04_features_userstories.md](04_features_userstories.md) | F1–F4: Stories, Akzeptanzkriterien, Qualitätsmerkmale, Randbedingungen |
| [05_kontextabgrenzung.md](05_kontextabgrenzung.md) | Nutzer und Umsysteme |
| [06_testabdeckung.md](06_testabdeckung.md) | Zuordnung von Tests zu Akzeptanzkriterien und fehlende Tests |
| [07_domaenenmodell.md](07_domaenenmodell.md) | Domänenmodell (UML) |
| [entscheidungslog.md](entscheidungslog.md) | Fachliche Entscheide E-01 bis E-23 |
| [ki-einsatz.md](ki-einsatz.md) | Laufendes Log des KI-Einsatzes (Pflicht in der Abgabe) |

## Checkliste: Mindestanforderungen laut Bewertungsbogen

- [x] Vision nach Pitch-Formel
- [x] Mindestens 2 Personas mit Name, persönlichen und beruflichen Infos, Erfahrung/Bildung und Interesse am Projekt (es sind 3)
- [x] Mindestens 3 Szenarien, jede Persona kommt in mindestens einem vor (es sind 5, Sara kommt in S4 und S5 vor)
- [x] Jedes Feature hat mindestens 2 User Stories mit Akzeptanzkriterien (F1: 7, F2: 5, F3: 5, F4: 3; jeweils 3–7 Kriterien)
- [x] Pro Feature die 2 wichtigsten Qualitätsmerkmale mit Begründung und Zielkonflikt
- [x] Randbedingungen: organisatorisch, technisch, juristisch
- [x] Kontextabgrenzung mit Nutzern und Umsystemen
- [x] Domänenmodell (Entwurf in [07_domaenenmodell.md](07_domaenenmodell.md)) als UML ohne Attribute, mit Assoziationsnamen und Multiplizitäten, inklusive F4
- [ ] Alle Inhalte im Team geprüft und die Entscheide vom Status «vorläufig» auf «bestätigt» gesetzt

## Offene Punkte

1. **Personas prüfen:** 2–3 echte WG-Bewohnende kurz befragen, z.B. mit diesen Fragen: Wie verteilt ihr Ämtli heute? Wie rechnet ihr gemeinsame Ausgaben ab? Was nervt dabei am meisten? Die Personas danach anpassen und das Vorgehen im KI-Einsatz-Log festhalten.
2. **Entscheide E-01 bis E-23** (ausser E-18) im Team einzeln bestätigen oder ändern.
3. **Domänenmodell:** Den Entwurf im Team prüfen und klären, ob Mermaid als UML-Darstellung reicht oder ein UML-Tool verlangt ist.
4. ~~Repo aufräumen~~ (erledigt am 13.10.2026)
5. **Haupt-README** um die umgesetzten Features und manuelle End-to-End-Tests ergänzen. Das ist eine Abgabepflicht.

## Vorschlag zur Aufteilung der Arbeit (5 Personen)

Alle arbeiten in jeder Phase mit. Die Hauptverantwortung ist so verteilt:

| Person | Rolle | Doku | App |
|---|---|---|---|
| 1 | Product Owner | Vision, Personas, Szenarien, Interviews, Priorisierung des Backlogs | Abnahme der Stories, manuelle End-to-End-Tests im README |
| 2 | Technical Lead | Randbedingungen, Domänenmodell (UML) | Architektur, Abschluss von F1 (US-F1-06, US-F1-07), Code-Reviews |
| 3 | QA Lead | Prüfbarkeit der Akzeptanzkriterien, Testabdeckung | Fehlende F1-Tests, Testkonzept, Testlauf auf frischem Laptop vor der Abgabe |
| 4 | Entwicklung F2 | Stories F2 verfeinern | Ämtliplan mit Rotation und Tests (Demo 2) |
| 5 | Entwicklung F3 | Stories F3 und Berechnungsregeln verfeinern | Ausgaben, Saldo, Ausgleich und Tests |

Ray ist Lead der Gruppe und übernimmt zusätzlich eine dieser Rollen. Das KI-Einsatz-Log und das Entscheidungslog führen alle. Zuständig für die Pflege ist der Product Owner. F4 setzt wer Zeit hat erst um, wenn F1 bis F3 fertig sind.
