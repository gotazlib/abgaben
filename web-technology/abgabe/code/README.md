# Scrum Poker

Gruppenarbeit im HWZ-Modul «Web Technology»: eine Planning-Poker-App. Mehrere Personen treten einer
Session bei, schätzen verdeckt mit Karten (Fibonacci oder T-Shirt-Grössen), decken gemeinsam auf und
sehen Durchschnitt und Konsens.

- **Client (`client/`):** React + TypeScript mit Vite, aufgebaut wie die Projektvorlage
  «scrum-poker-hwz» aus dem Kurs. Ansichtswechsel zwischen Startseite und Pokertisch über State,
  Name im Context und mit `useLocalStorage` gespeichert, Polling über `fetch`.
- **Server (`server/`):** Node.js + Express + TypeScript, Daten nur im Arbeitsspeicher (in-memory).

> **Ausführliche Dokumentation:** [DOKUMENTATION.html](https://gotazlib.github.io/abgaben/web-technology/abgabe/DOKUMENTATION.html) (eigenständige HTML-Datei,
> auch als [PDF](https://gotazlib.github.io/abgaben/web-technology/abgabe/DOKUMENTATION.pdf); beide liegen in der Abgabe neben diesem Code-Ordner) – Funktionsweise mit Screenshots, Komponenten und State, Ansichtswechsel,
> REST-API, Datenfluss, Fehlerzustände, Karteileichen-Strategie, Durchschnitt bei T-Shirt-Grössen,
> Responsive Design, wie wir geprüft haben, ausführliche Inbetriebnahme mit Troubleshooting und
> KI-Einsatz.

> **Vorbereitung aufs Fachgespräch:** [docs/FACHGESPRAECH.md](docs/FACHGESPRAECH.md) (auch als PDF
> und HTML) – Rundgang durch alle Dateien, Musterantworten, Demo-Drehbuch und Übungsaufgaben.

## Voraussetzungen

- **Node.js 24** (LTS, wie im Kurs). Der Server führt seine `.ts`-Dateien direkt mit Node aus,
  ohne Zusatzwerkzeug; dafür ist Node 24 vorausgesetzt (`engines` in `package.json`).
- **pnpm 12** (z. B. `npm install -g pnpm@12`)

## Inbetriebnahme

Client und Server sind zwei eigene Projekte. Es braucht darum **zwei Terminals**, beide im
Projektordner starten.

1. Server (Terminal 1):
   ```bash
   cd server
   pnpm install
   pnpm dev
   ```
   Die API läuft auf <http://localhost:3000/api>, z. B. <http://localhost:3000/api/sessions>.
2. Client (Terminal 2):
   ```bash
   cd client
   pnpm install
   pnpm dev
   ```
3. Im Browser öffnen: <http://localhost:5173>
   - Der Client ruft nur relative URLs wie `/api/sessions` auf. Der Vite-Dev-Server leitet sie per
     Proxy an Port 3000 weiter (`client/vite.config.ts`, wie in der Projektvorlage). Browser und
     API haben dadurch denselben Ursprung, **CORS ist nicht nötig**.

Weitere Befehle, jeweils im Ordner `client/` bzw. `server/`:

| Befehl              | `client/`                                              | `server/`                                    |
| ------------------- | ------------------------------------------------------ | -------------------------------------------- |
| `pnpm dev`          | Vite-Dev-Server mit Hot Reload (Port 5173)             | Server mit `node --watch` (Port 3000)        |
| `pnpm build`        | Typprüfung (`tsc -b`) und Produktions-Build nach `dist/` | nur Typprüfung (`tsc -b`)                  |
| `pnpm lint`         | Code mit oxlint prüfen                                 | Code mit oxlint prüfen                       |
| `pnpm format`       | Code mit Prettier formatieren                          | Code mit Prettier formatieren                |
| `pnpm format:check` | prüfen, ob alles formatiert ist                        | prüfen, ob alles formatiert ist              |
| `pnpm preview`      | lokale Vorschau des Builds                             | –                                            |
| `pnpm start`        | –                                                      | Server ohne Watch                            |

**Produktivbetrieb ohne Vite:** `pnpm build` in `client/`, danach in `server/`
`NODE_ENV=production pnpm start`. Express liefert dann auch den gebauten Client aus `client/dist`
aus, alles läuft unter <http://localhost:3000>. Den Port des Servers ändert die Umgebungsvariable
`PORT`.

Geprüft wird mit `pnpm lint`, `pnpm format:check` und `pnpm build` in beiden Ordnern und durch
Ausprobieren in zwei Browserfenstern, siehe
[Dokumentation, Kapitel 12](https://gotazlib.github.io/abgaben/web-technology/abgabe/DOKUMENTATION.html#12-wie-wir-geprüft-haben).

## Projektstruktur

```
scrum-poker/
├── README.md
├── docs/                       FACHGESPRAECH.md/.pdf/.html: Leitfaden fürs Fachgespräch
├── client/                     React-App, aufgebaut wie die Projektvorlage
│   ├── package.json            Scripts dev, build, lint, preview, format, format:check
│   ├── index.html              einzige HTML-Seite, lädt src/main.tsx
│   ├── vite.config.ts          Proxy /api → localhost:3000
│   ├── tsconfig*.json          TypeScript (strict)
│   ├── .prettierrc             Prettier ohne Semikolons, einfache Anführungszeichen
│   ├── public/                 favicon.svg
│   └── src/
│       ├── main.tsx            StrictMode → UserProvider → App
│       ├── index.css           globale Styles (Box-Modell, Schrift, Buttons)
│       ├── components/         App (Ansichtswechsel), HomePage, PokerTablePage, PokerRoom und
│       │                       die übrigen Komponenten, jede mit eigener CSS-Datei
│       ├── hooks/              useLocalStorage.ts (Name im localStorage)
│       ├── context/            UserContext.ts (Context für den Namen)
│       ├── api/                sessions.ts: eine Funktion pro API-Route, einzige Stelle mit fetch()
│       ├── types/              poker.ts: Types der App und der REST-API
│       └── utils/              poker.ts: Decks, validateName(), computeResult()
└── server/                     Express-API, eigenes Node-Projekt
    ├── package.json            Scripts dev, start, build, lint, format, format:check
    ├── tsconfig.json
    └── src/
        ├── index.ts            startet den Server und den Aufräum-Timer
        ├── app.ts              Express-App: JSON, Routen, 404- und Fehler-Handler,
        │                       in Produktion zusätzlich client/dist
        ├── config.ts           Port, Intervall, Timeout und Produktionsmodus als Konstanten
        ├── routes/sessions.ts  alle Routen unter /api/sessions
        ├── store.ts            Array im Arbeitsspeicher und alle Änderungen daran (ohne Express)
        ├── validation.ts       Prüfung der Request-Bodies
        ├── rules.ts            Karten pro Deck und Namensregel (gleich wie client/src/utils/poker.ts)
        └── types.ts            Types (gleich wie client/src/types/poker.ts)
```
