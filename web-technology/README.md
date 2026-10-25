# Web Technology

| | |
| --- | --- |
| **Fach** | Web Technology, HWZ |
| **Dozent** | Tobias Büchel |
| **Aufgabe** | Scrum Poker App (Gruppenarbeit) |

Eine Planning-Poker-App: Mehrere Personen treten einer Session bei, schätzen verdeckt mit Karten,
decken gemeinsam auf und sehen Durchschnitt und Konsens. Client mit React + TypeScript (Vite,
aufgebaut wie die Projektvorlage des Kurses), Server mit Node.js + Express + TypeScript.

## Abgabe

Alles im Ordner [`abgabe/`](abgabe/):

| Datei | Inhalt |
| --- | --- |
| [DOKUMENTATION.html](abgabe/DOKUMENTATION.html) | Projektdokumentation, eigenständige HTML-Datei, offline lesbar ([im Browser ansehen](https://gotazlib.github.io/abgaben/web-technology/abgabe/DOKUMENTATION.html)) |
| [DOKUMENTATION.pdf](abgabe/DOKUMENTATION.pdf) | Projektdokumentation als PDF |
| [FACHGESPRAECH.html](abgabe/FACHGESPRAECH.html) | Leitfaden fürs Fachgespräch, eigenständige HTML-Datei ([im Browser ansehen](https://gotazlib.github.io/abgaben/web-technology/abgabe/FACHGESPRAECH.html)) |
| [FACHGESPRAECH.pdf](abgabe/FACHGESPRAECH.pdf) | Leitfaden fürs Fachgespräch als PDF |
| [scrum-poker-code.zip](abgabe/scrum-poker-code.zip) | Quellcode ohne `node_modules` |
| [code/](abgabe/code/) | derselbe Quellcode zum Durchklicken, Start-Anleitung im [README](abgabe/code/README.md) |

Kurz: Node.js 24 und pnpm 12. Im Code-Ordner zwei Terminals: `cd server && pnpm install && pnpm dev`
und `cd client && pnpm install && pnpm dev`, dann Browser auf <http://localhost:5173>.

Zurück zur [Übersicht](../README.md).
