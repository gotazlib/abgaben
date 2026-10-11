# Scrum Poker

Gruppenarbeit im HWZ-Modul «Web Technology»: eine Planning-Poker-App. Mehrere Personen treten einer
Session bei, schätzen verdeckt mit Karten (Fibonacci oder T-Shirt-Grössen), decken gemeinsam auf und
sehen Durchschnitt und Konsens.

- **Client:** React + TypeScript (Vite), React Router, Context API, Polling über `fetch`
- **Server:** Node.js + Express + TypeScript, Daten nur im Arbeitsspeicher (in-memory)
- **Shared:** gemeinsame TypeScript-Types und die Berechnung des Rundenergebnisses

> **Öffentliche Abgabe:** <https://github.com/gotazlib/abgaben/tree/main/web-technology/scrum-poker>
> (Kopie dieses Projektordners plus Ordner `abgabe/` mit PDF, DOCX, HTML und ZIP, siehe
> [Abgabe](#abgabe)). Dieses Repository `school` bleibt privat.

> **Ausführliche Dokumentation:** [DOKUMENTATION.md](DOKUMENTATION.md) (auch als
> [PDF](DOKUMENTATION.pdf), als Word-Datei in der HWZ-Vorlage und als eigenständige
> [HTML-Datei](DOKUMENTATION.html)) – Funktionsweise mit Screenshots, Komponenten und State, Routen,
> REST-API, Datenfluss, Fehlerzustände, Karteileichen-Strategie, Durchschnitt bei T-Shirt-Grössen,
> Responsive Design, Tests, ausführliche Inbetriebnahme mit Troubleshooting und KI-Einsatz.
> Vorbereitung aufs Fachgespräch: [docs/FACHGESPRAECH.md](docs/FACHGESPRAECH.md).

## Voraussetzungen

- **Node.js ≥ 22.12** (aktuelle LTS-Version empfohlen). Vite 8 und Vitest 5 laufen nicht mehr auf
  Node 20, darum liegt die Mindestversion höher als ursprünglich geplant.
- **pnpm 10** (z. B. `corepack enable`, dann wird die Version aus `packageManager` in
  `package.json` verwendet, oder `npm install -g pnpm`)

## Inbetriebnahme

Alle Befehle im Ordner `goerkem/web-technology/scrum-poker/` ausführen.

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
| `pnpm test:e2e`  | End-to-End-Tests mit Playwright in Chromium (siehe unten)                      |
| `pnpm docs:pdf`  | PDFs und HTML-Dateien der Doku neu erzeugen (`scripts/build-pdf.sh`)           |
| `pnpm docs:html` | nur die eigenständigen HTML-Dateien neu erzeugen                               |

Die Ports lassen sich mit Umgebungsvariablen ändern: `PORT` für den Server, `CLIENT_PORT` und
`API_PORT` für Vite. Die E2E-Tests nutzen damit 3101/5273 und laufen auch neben `pnpm dev`.

Die E2E-Tests brauchen einmalig einen Browser: `pnpm exec playwright install chromium` (unter
Linux bei fehlenden Systembibliotheken `--with-deps`). Was sie prüfen, steht in
[DOKUMENTATION.md, Kapitel 12](DOKUMENTATION.md#12-tests).

Der Server wird nicht in JavaScript übersetzt: `tsx` führt den TypeScript-Code direkt aus
(`pnpm --filter @scrum-poker/server start`). Für ein Projekt ohne Deployment reicht das und spart
einen Build-Schritt.

## Projektstruktur

pnpm-Workspace mit drei Paketen:

```
scrum-poker/
├── package.json            Skripte für alle Pakete (dev, build, test, lint, typecheck)
├── pnpm-workspace.yaml     Liste der Pakete
├── eslint.config.js        ESLint für alle Pakete (Vite-Setup + typescript-eslint, kein `any`)
├── DOKUMENTATION.md/.pdf/.docx/.html  Projektdokumentation (Abgabe; .docx in der HWZ-Vorlage)
├── playwright.config.ts    E2E-Tests: startet Server (Port 3101) und Client (Port 5273)
├── e2e/                    Playwright-Tests mit zwei Browsern
├── docs/
│   ├── FACHGESPRAECH.md/.pdf/.html  Lernleitfaden fürs Fachgespräch
│   └── screenshots/        Screenshots (Desktop, Tablet, Mobile)
├── scripts/                make-submission.sh (Abgabe-ZIP), build-pdf.sh (PDF + HTML aus Markdown),
│                           build-docx.sh (Word-Datei aus Markdown),
│                           publish-abgaben.sh (Kopie ins öffentliche Repo gotazlib/abgaben)
├── shared/                 @scrum-poker/shared
│   └── src/
│       ├── index.ts        Types (Session, Participant, Request/Response), DECKS, computeResult()
│       └── computeResult.test.ts
├── server/                 @scrum-poker/server
│   └── src/
│       ├── index.ts        startet den Server und den Aufräum-Timer
│       ├── app.ts          Express-App ohne listen() (für die Tests), 404- und Error-Handler
│       ├── config.ts       Port, Intervall und Timeout als benannte Konstanten
│       ├── routes/
│       │   └── sessions.ts Router: HTTP ⇄ Store, Statuscodes
│       ├── store.ts        In-memory Map und alle Zustandsänderungen (ohne Express)
│       ├── validation.ts   Prüfung der Request-Bodies
│       ├── sendError.ts    einheitliche Fehlerantwort { error }
│       └── app.test.ts     Tests aller Routen (supertest)
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

## Abgabe

- **ZIP:** `./scripts/make-submission.sh` erzeugt `scrum-poker-abgabe.zip` (committeter Stand des
  Projektordners inklusive Dokumentation und PDFs, ohne `node_modules`/`dist`). Das ZIP ist nicht im
  Git.
- **Git-Link (öffentlich):** <https://github.com/gotazlib/abgaben/tree/main/web-technology/scrum-poker>.
  Dieses Repository (`school`) ist privat:
  <https://github.com/gotazlib/school/tree/main/goerkem/web-technology/scrum-poker>.
- Nach einer Änderung an der Doku die PDFs und HTML-Dateien neu erzeugen: `./scripts/build-pdf.sh`
  (bzw. `pnpm docs:pdf`). Die HTML-Dateien (`DOKUMENTATION.html`, `docs/FACHGESPRAECH.html`) sind
  je eine einzige Datei: CSS inline, Screenshots als base64, Mermaid-Diagramme als SVG, keine
  externen Requests. Herunterladen und offline im Browser öffnen genügt.
- **Bearbeitbare Version: [DOKUMENTATION.docx](DOKUMENTATION.docx).** Nach dem Bearbeiten in Word
  Inhaltsverzeichnis aktualisieren und als PDF speichern. Die Datei nutzt die HWZ-Vorlage (Titelblatt,
  Formatvorlagen, Kopf-/Fusszeilen). Gelb markiert sind die Stellen, die die Gruppe noch ausfüllen
  oder prüfen muss (Gruppenmitglieder, Datum, Studiengang, KI-Einsatz).
- Neu erzeugen aus `DOKUMENTATION.md`: `pnpm docs:docx` (braucht pandoc ≥ 3, Python 3 und Chromium,
  siehe `scripts/build-docx.sh`). **Achtung:** Das überschreibt `DOKUMENTATION.docx` und damit alle
  Änderungen, die in Word gemacht wurden.

### Veröffentlichen im Repo gotazlib/abgaben

Das öffentliche Repo [gotazlib/abgaben](https://github.com/gotazlib/abgaben) enthält eine Kopie dieses
Projektordners (ohne Git-Historie) und den Ordner `abgabe/` mit allen Abgabedateien
(DOKUMENTATION.pdf/.docx/.html, FACHGESPRAECH.pdf/.html, ZIP, Screenshots). Nach einer Änderung:

```bash
./scripts/build-pdf.sh                          # Doku neu erzeugen, dann alles committen
git clone https://github.com/gotazlib/abgaben.git ../abgaben   # einmalig, irgendwo ausserhalb
./scripts/publish-abgaben.sh ../abgaben         # kopiert den committeten Stand
cd ../abgaben && git add -A && git commit -m "Scrum Poker aktualisiert" && git push
```

Das Script nimmt wie `make-submission.sh` nur den committeten Stand (`git archive`), also nie
`node_modules`, `dist`, `test-results` oder lokale Dateien wie `.env`. Danach sucht es in allen
kopierten Dateien (auch in DOCX-/ZIP-Inhalten und PDF-Metadaten) nach E-Mail-Adressen, absoluten
Home-Pfaden und Tokens und bricht bei einem Fund ab. Im Clone von `abgaben` nur mit der
noreply-Adresse committen (`git config user.email "199140688+gotazlib@users.noreply.github.com"`).
