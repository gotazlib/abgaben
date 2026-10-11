# Web Technology

| | |
| --- | --- |
| **Fach** | Web Technology, HWZ |
| **Dozent** | Tobias Büchel |
| **Aufgabe** | Scrum Poker App (Gruppenarbeit, Leistungsnachweis mit Fachgespräch) |

## Scrum Poker App

Eine Planning-Poker-App: Mehrere Personen treten einer Session bei, schätzen verdeckt mit Karten
(Fibonacci oder T-Shirt-Grössen), decken gemeinsam auf und sehen Durchschnitt und Konsens.
Client mit React + TypeScript (Vite), Server mit Node.js + Express + TypeScript, Daten nur im
Arbeitsspeicher.

### Abgabedateien

Alle in [`scrum-poker/abgabe/`](scrum-poker/abgabe/):

| Datei | Inhalt |
| --- | --- |
| [DOKUMENTATION.pdf](scrum-poker/abgabe/DOKUMENTATION.pdf) | Projektdokumentation |
| [DOKUMENTATION.docx](scrum-poker/abgabe/DOKUMENTATION.docx) | Projektdokumentation, bearbeitbar (Word, HWZ-Vorlage) |
| [DOKUMENTATION.html](scrum-poker/abgabe/DOKUMENTATION.html) | Projektdokumentation als eigenständige HTML-Datei ([im Browser ansehen](https://gotazlib.github.io/abgaben/web-technology/scrum-poker/abgabe/DOKUMENTATION.html)) |
| [FACHGESPRAECH.pdf](scrum-poker/abgabe/FACHGESPRAECH.pdf) | Leitfaden fürs Fachgespräch |
| [FACHGESPRAECH.html](scrum-poker/abgabe/FACHGESPRAECH.html) | Leitfaden als eigenständige HTML-Datei ([im Browser ansehen](https://gotazlib.github.io/abgaben/web-technology/scrum-poker/abgabe/FACHGESPRAECH.html)) |
| [scrum-poker-abgabe.zip](scrum-poker/abgabe/scrum-poker-abgabe.zip) | Quellcode als ZIP, ohne `node_modules` |
| [screenshots/](scrum-poker/abgabe/screenshots/) | Screenshots der App (Desktop, Tablet, Mobile) |

### Quellcode

Der komplette Projektordner liegt in [`scrum-poker/`](scrum-poker/) (gleicher Inhalt wie im ZIP):
[`client/`](scrum-poker/client/), [`server/`](scrum-poker/server/), [`shared/`](scrum-poker/shared/),
[`e2e/`](scrum-poker/e2e/), [`scripts/`](scrum-poker/scripts/), [`docs/`](scrum-poker/docs/).
Die Markdown-Quellen der Doku: [DOKUMENTATION.md](scrum-poker/DOKUMENTATION.md),
[docs/FACHGESPRAECH.md](scrum-poker/docs/FACHGESPRAECH.md). Details im
[README des Projekts](scrum-poker/README.md).

### App starten

Voraussetzungen: **Node.js ≥ 22.12** und **pnpm 10** (`corepack enable` genügt).

```bash
cd web-technology/scrum-poker     # oder den entpackten Ordner aus dem ZIP
pnpm install
pnpm dev
```

Danach im Browser <http://localhost:5173> öffnen (API auf <http://localhost:3001/api>). Zum
Ausprobieren zwei Browserfenster nebeneinander öffnen und derselben Session beitreten.

Weitere Befehle: `pnpm test` (Unit- und API-Tests), `pnpm typecheck`, `pnpm lint`, `pnpm build`,
`pnpm test:e2e` (Playwright, einmalig `pnpm exec playwright install chromium`).

Zurück zur [Übersicht](../README.md).
