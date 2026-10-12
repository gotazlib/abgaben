# Scrum Poker

Gruppenarbeit im HWZ-Modul «Web Technology»: eine Planning-Poker-App. Mehrere Personen treten einer
Session bei, schätzen verdeckt mit Karten (Fibonacci oder T-Shirt-Grössen), decken gemeinsam auf und
sehen Durchschnitt und Konsens.

- **Client:** React + TypeScript (Vite), React Router, Context API, Polling über `fetch`
- **Server:** Node.js + Express + TypeScript, Daten nur im Arbeitsspeicher (in-memory)
- **Shared:** gemeinsame TypeScript-Types und die Berechnung des Rundenergebnisses

> **Live-Version: <https://scrumpoker.tasgor.ch>**

> **Ausführliche Dokumentation:** [DOKUMENTATION.html](https://gotazlib.github.io/abgaben/web-technology/abgabe/DOKUMENTATION.html) (eigenständige HTML-Datei,
> auch als [PDF](https://gotazlib.github.io/abgaben/web-technology/abgabe/DOKUMENTATION.pdf); beide liegen in der Abgabe neben diesem Code-Ordner) – Funktionsweise mit Screenshots, Komponenten und State, Routen,
> REST-API, Datenfluss, Fehlerzustände, Karteileichen-Strategie, Durchschnitt bei T-Shirt-Grössen,
> Responsive Design, Tests, ausführliche Inbetriebnahme mit Troubleshooting und KI-Einsatz.

> **Vorbereitung aufs Fachgespräch:** [docs/FACHGESPRAECH.md](docs/FACHGESPRAECH.md) (auch als PDF
> und HTML) – Rundgang durch alle Dateien, Musterantworten, Demo-Drehbuch und Übungsaufgaben.

## Voraussetzungen

- **Node.js ≥ 22.12** (aktuelle LTS-Version empfohlen). Vite 8 und Vitest 5 laufen nicht mehr auf
  Node 20, darum liegt die Mindestversion höher als ursprünglich geplant.
- **pnpm 10** (z. B. `corepack enable`, dann wird die Version aus `packageManager` in
  `package.json` verwendet, oder `npm install -g pnpm`)

## Inbetriebnahme

Alle Befehle im Projektordner ausführen.

1. Abhängigkeiten installieren:
   ```bash
   pnpm install
   ```
2. Server und Client gemeinsam starten:
   ```bash
   pnpm dev
   ```
3. Im Browser öffnen: <http://localhost:5173>
   - Die API läuft auf <http://localhost:3001/api>, z. B. <http://localhost:3001/api/sessions>.
   - Der Client ruft nur relative URLs wie `/api/sessions` auf. Der Vite-Dev-Server leitet sie per
     Proxy an Port 3001 weiter. Browser und API haben dadurch denselben Ursprung, **CORS ist nicht
     nötig**.

Weitere Befehle:

| Befehl           | Was er macht                                                                   |
| ---------------- | ------------------------------------------------------------------------------ |
| `pnpm dev`       | Startet Server (`tsx watch`, Port 3001) und Client (Vite, Port 5173) zusammen |
| `pnpm test`      | Alle Tests (Vitest) in `shared`, `server` und `client`                         |
| `pnpm typecheck` | TypeScript-Prüfung aller Pakete (`strict: true`)                               |
| `pnpm lint`      | ESLint, schlägt schon bei einer Warnung fehl                                   |
| `pnpm build`     | Produktions-Build des Clients (`client/dist`) und Typprüfung des Servers       |
| `pnpm start`     | Server ohne Watch; mit `NODE_ENV=production` liefert er auch `client/dist` aus |
| `pnpm test:e2e`  | End-to-End-Tests mit Playwright in Chromium (siehe unten)                      |

Die Ports lassen sich mit Umgebungsvariablen ändern: `PORT` für den Server, `CLIENT_PORT` und
`API_PORT` für Vite. Die E2E-Tests nutzen damit 3101/5273 und laufen auch neben `pnpm dev`.

Die E2E-Tests brauchen einmalig einen Browser: `pnpm exec playwright install chromium` (unter
Linux bei fehlenden Systembibliotheken `--with-deps`). Was sie prüfen, steht in
[Dokumentation, Kapitel 12](https://gotazlib.github.io/abgaben/web-technology/abgabe/DOKUMENTATION.html#12-tests).

Der Server wird nicht in JavaScript übersetzt: `tsx` führt den TypeScript-Code direkt aus
(`pnpm start`). Das spart einen Build-Schritt, auch im Betrieb unter <https://scrumpoker.tasgor.ch>:
Dort liefert derselbe Prozess mit `NODE_ENV=production` zusätzlich den gebauten Client aus.

## Projektstruktur

pnpm-Workspace mit drei Paketen:

```
scrum-poker/
├── package.json            Skripte für alle Pakete (dev, build, test, lint, typecheck)
├── pnpm-workspace.yaml     Liste der Pakete
├── eslint.config.js        ESLint für alle Pakete (Vite-Setup + typescript-eslint, kein `any`)
├── playwright.config.ts    E2E-Tests: startet Server (Port 3101) und Client (Port 5273)
├── e2e/                    Playwright-Tests mit zwei Browsern
├── docs/                   FACHGESPRAECH.md/.pdf/.html: Leitfaden fürs Fachgespräch
├── shared/                 @scrum-poker/shared
│   └── src/
│       ├── index.ts        Types (Session, Participant, Request/Response), DECKS, computeResult()
│       └── computeResult.test.ts
├── server/                 @scrum-poker/server
│   └── src/
│       ├── index.ts        startet den Server und den Aufräum-Timer
│       ├── app.ts          Express-App ohne listen() (für die Tests), 404- und Error-Handler,
│       │                   in Produktion zusätzlich client/dist mit SPA-Fallback
│       ├── config.ts       Port, Intervall, Timeout und Produktionsmodus als benannte Konstanten
│       ├── routes/
│       │   └── sessions.ts Router: HTTP ⇄ Store, Statuscodes
│       ├── store.ts        In-memory Map und alle Zustandsänderungen (ohne Express)
│       ├── validation.ts   Prüfung der Request-Bodies
│       ├── sendError.ts    einheitliche Fehlerantwort { error }
│       ├── app.test.ts     Tests aller Routen (supertest)
│       └── static.test.ts  Tests des Produktionsmodus (statische Dateien, SPA-Fallback)
└── client/                 @scrum-poker/client
    ├── vite.config.ts      Proxy /api → :3001, Vitest mit jsdom
    └── src/
        ├── main.tsx        UserProvider → BrowserRouter → App
        ├── App.tsx         Routen
        ├── config.ts       Polling-Intervalle
        ├── api/            client.ts: eine typisierte Funktion pro API-Route, ApiError
        ├── components/     Layout, Bausteine der Seiten (je mit eigener .css-Datei)
        ├── context/        UserContext (Name, in localStorage gespeichert) und useUser()
        ├── hooks/          usePolling (generisches Polling mit Cleanup, refresh() und setData())
        ├── pages/          HomePage, SessionPage, NotFoundPage
        ├── styles/         global.css (CSS-Variablen, mobile first)
        ├── test/           Setup für Vitest + React Testing Library
        └── utils/          validateName (gleiche Regeln wie der Server)
```
