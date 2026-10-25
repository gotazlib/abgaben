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

## Lernmaterial fürs Fachgespräch

Im Ordner [`fachgespraech/`](fachgespraech/README.md) (nicht im Code-ZIP), jeder Teil als HTML,
PDF und Markdown, Übersicht auch [als Webseite](https://gotazlib.github.io/abgaben/web-technology/fachgespraech/):

| Teil | Inhalt |
| --- | --- |
| [00 Ordnerstruktur](fachgespraech/00-ordnerstruktur.md) ([HTML](https://gotazlib.github.io/abgaben/web-technology/fachgespraech/00-ordnerstruktur.html), [PDF](fachgespraech/00-ordnerstruktur.pdf)) | welche Datei wo liegt, Konfiguration Zeile für Zeile |
| [01 Client Zeile für Zeile](fachgespraech/01-client-zeile-fuer-zeile.md) ([HTML](https://gotazlib.github.io/abgaben/web-technology/fachgespraech/01-client-zeile-fuer-zeile.html), [PDF](fachgespraech/01-client-zeile-fuer-zeile.pdf)) | jede Datei unter `client/`: React, Hooks, CSS |
| [02 Server Zeile für Zeile](fachgespraech/02-server-zeile-fuer-zeile.md) ([HTML](https://gotazlib.github.io/abgaben/web-technology/fachgespraech/02-server-zeile-fuer-zeile.html), [PDF](fachgespraech/02-server-zeile-fuer-zeile.pdf)) | jede Datei unter `server/`, REST, Ablauf eines Requests |
| [03 Fragenkatalog](fachgespraech/03-fragenkatalog.md) ([HTML](https://gotazlib.github.io/abgaben/web-technology/fachgespraech/03-fragenkatalog.html), [PDF](fachgespraech/03-fragenkatalog.pdf)) | 120 Fragen mit Musterantworten |
| [04 Spickzettel](fachgespraech/04-spickzettel.md) ([HTML](https://gotazlib.github.io/abgaben/web-technology/fachgespraech/04-spickzettel.html), [PDF](fachgespraech/04-spickzettel.pdf)) | drei Seiten zum Wiederholen |

Kurz: Node.js 24 und pnpm 12. Im Code-Ordner zwei Terminals: `cd server && pnpm install && pnpm dev`
und `cd client && pnpm install && pnpm dev`, dann Browser auf <http://localhost:5173>.

Zurück zur [Übersicht](../README.md).
