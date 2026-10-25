# Scrum Poker – Spickzettel

Teil 04: das Wichtigste auf drei Seiten, für den Abend davor und die letzten Minuten vor dem
Gespräch. Details: Teil 01 (Client), 02 (Server), 03 (Fragen).

## Architektur in einem Satz

**React-Client** (Vite, Port 5173) → `fetch('/api/…')` → **Vite-Proxy** → **Express-Server** (Node,
Port 3000) → **Array im Arbeitsspeicher**. Im Produktivbetrieb liefert Express auch den gebauten
Client aus `client/dist` (Folie 02/4, 02/6). Die wichtigsten Dateien (Client unter `client/src/`,
Server unter `server/src/`):

| Datei | Was dort liegt |
| --- | --- |
| `App.tsx` | State `activeSessionId`: `null` → `HomePage`, sonst `PokerTablePage` (Pflicht §3.1, 07/6, 09/36) |
| `UserProvider.tsx` | Context mit dem Namen, gespeichert mit `useLocalStorage` (§3.2, 09/32) |
| `PokerTablePage.tsx` | Beitreten im `useEffect`, Verlassen im Cleanup, `ignore`-Flag gegen StrictMode |
| `PokerRoom.tsx` | Tisch-State (Lifting State Up), Polling 1.5 s = Heartbeat, `runAction` für Klicks |
| `api/sessions.ts` | einzige Stelle mit `fetch`, eine Funktion pro Route, Fehler → `Error` mit Meldung |
| `utils/poker.ts` | Decks, `validateName`, `computeResult` (Durchschnitt, Konsens) |
| `app.ts` (Server) | `express.json()` → Router `/api/sessions` → (static) → 404 → Error-Handler |
| `routes/sessions.ts` | jede Route: Session holen → 404 → Body prüfen → 400 → Store → Antwort |
| `store.ts` | Array `sessions`, Geheimhaltung in `toSessionState`, Aufräumen der Karteileichen |
| `validation.ts` | Body ist `unknown`, Prüfung mit `typeof` und `in` |

## Datenfluss: Klick auf Karte «5»

`CardDeck` `onCardClick('5')` → `PokerRoom.handleCardClick` → `runAction` (`isBusy` an) →
`api/sessions.ts castVote` → `PUT /api/sessions/:id/participants/:pid/vote` mit `{ "value": "5" }`
→ Proxy → `express.json()` → Route prüft Session (404), Person (404), aufgedeckt (409), Karte
(400) → `store.castVote` → alle gewählt? aufdecken → `toSessionState` (fremde Stimmen `null`) →
200 JSON → `setSession` → React rendert neu. Die anderen sehen die verdeckte Karte beim nächsten
Poll (≤ 1.5 s).

## REST-API

| Methode | Pfad (unter `/api/sessions`) | Erfolg | Fehler |
| --- | --- | --- | --- |
| GET | `/` Liste | 200 | – |
| POST | `/` erstellen | 201 `{ id }` | – |
| DELETE | `/:sessionId` | 204 | 404 |
| GET | `/:sessionId?participantId=…` Zustand + Heartbeat | 200 | 404 |
| POST | `/:sessionId/participants` beitreten `{ name }` | 201 `{ participantId }` | 400, 404 |
| DELETE | `/:sessionId/participants/:participantId` verlassen | 204 (idempotent) | 404 |
| PUT | `/:sessionId/participants/:participantId/vote` `{ value }` | 200 | 400, 404, 409 |
| PUT | `/:sessionId/deck` `{ deck }` | 200 | 400, 404 |
| POST | `/:sessionId/reveal`, `/:sessionId/reset` | 200 | 404 |

GET liest · POST erstellt/löst aus · PUT setzt einen Wert (idempotent) · DELETE entfernt.
2xx geklappt · 4xx Fehler des Clients · 5xx Fehler des Servers. Fehler immer `{ "error": "…" }`.

## Begriffe zum Mitnehmen

| Begriff | In einem Satz | Folie |
| --- | --- | --- |
| Props / State | Props von oben, nur lesbar · State gehört der Komponente, Setter löst Rendern aus | 08/16, 08/22 |
| Lifting State Up | State in den ersten gemeinsamen Elternteil, Callbacks nach oben | 08/25-27 |
| Conditional Rendering | `&&`, Ternary oder `if` mit `return` | 08/7, 08/37 |
| `key` | stabile ID pro Listeneintrag, nicht der Index | 08/31 |
| `useEffect` + Cleanup | Code nach dem Rendern, Cleanup beim Unmount (Intervall stoppen, Session verlassen) | 09/11-15 |
| StrictMode | startet Effekte in der Entwicklung doppelt, damit fehlende Cleanups auffallen | 08/24, 09/3 |
| `ignore`-Flag | späte Antworten nach dem Cleanup nicht mehr in den State schreiben | (React-Doku) |
| Polling | `window.setInterval` im Effekt, `clearInterval` im Cleanup | 09/29-30 |
| Custom Hook | `useLocalStorage`: Funktion `use…`, die Hooks benutzt | 09/26, 09/32 |
| Lazy Initial Value | `useState(() => …)` läuft nur beim ersten Render | 09/8 |
| Context | Name für alle Komponenten ohne Props-Kette (verlangt, nicht in Folien) | – |
| Literal-Union | `'fibonacci' \| 'tshirt'` erlaubt nur diese Werte | 06/23 |
| `import type` | nur Types, fällt beim Ausführen weg (Pflicht mit `verbatimModuleSyntax`) | 07/12 |
| Middleware | Funktion in der Kette von `app.use`: bearbeitet die Anfrage oder gibt sie weiter (`express.json()`) | – |
| Heartbeat | jeder Poll setzt `lastSeen`, wer 15 s still ist, fliegt (≤ 20 s) | – (Polling 09/30) |
| In-Memory | Daten nur im Array, nach Neustart weg | – |
| Type Stripping | Node 24 löscht Types beim Laden, Server braucht keinen Build | – |
| Mobile First | Grundregeln fürs Handy, `@media (min-width: 768px)` für grösser | 05/7 |
| Box-Modell | `box-sizing: border-box`: `width` inkl. Padding und Rahmen | 04/19-21 |

## Befehle

| Wo | Befehl | Wozu |
| --- | --- | --- |
| beide | `pnpm install` | Pakete installieren (einmal, nach jedem Pull) |
| `server/`, dann `client/` | `pnpm dev` (zwei Terminals) | API auf Port 3000, App auf <http://localhost:5173> |
| beide | `pnpm lint` · `pnpm format:check` · `pnpm build` | oxlint · Prettier · Typprüfung (Client: auch Build) |
| `client/`, dann `server/` | `pnpm build`, dann `NODE_ENV=production pnpm start` | alles über Port 3000 ohne Vite |
| Terminal | `curl localhost:3000/api/sessions` | API ohne Browser testen |

Versionen: **Node 24, pnpm 12** (`node -v`, `pnpm -v`, Folie 03/17).

## Live-Demo mit zwei Browserfenstern (≈ 3 Minuten)

Vorbereitung: beide `pnpm dev` laufen. Fenster **A** normal (Name «Anna»), Fenster **B** privat
(eigener `localStorage`), nebeneinander, Zoom 125 %. DevTools in A offen (Network).

| # | Fenster | Aktion | Satz dazu |
| --- | --- | --- | --- |
| 1 | A | Name steht schon da | «Kommt aus dem `localStorage` über `useLocalStorage`.» |
| 2 | B | Name leer → Meldung, Buttons grau → «Ben» | «`validateName` sperrt, der Server prüft dieselbe Regel.» |
| 3 | A | «Neue Session erstellen» | «`POST` → 201, dann `onJoin`, `App` setzt den State → `PokerTablePage`.» |
| 4 | B | Session erscheint (≤ 3 s) → «Beitreten» | «Liste pollt alle 3 s, Beitreten setzt denselben State.» |
| 5 | A | Karte **5** | «`PUT …/vote`. Ben sieht nur eine verdeckte Karte, der Wert verlässt den Server nicht.» |
| 6 | B | Karte **8** | «Alle haben gewählt → Server deckt auf. Durchschnitt 6.5.» |
| 7 | A | «Neue Runde», beide **3** | «Konsens wird hervorgehoben.» |
| 8 | B | Deck **T-Shirt**, A: S, B: L | «Deck-Wechsel = neue Runde. S=2, L=5 → 3.5 → M.» |
| 9 | A | Network-Tab zeigen | «Alle 1.5 s ein GET mit `participantId`: Polling und Heartbeat.» |
| 10 | B | F5 | «Nach Reload nur noch der Name. Bens alter Platz verschwindet bei Anna nach ≤ 20 s.» |
| 11 | A | «Verlassen» | «`onLeave` → State `null`, `PokerTablePage` verschwindet, Cleanup schickt DELETE.» |

**Wenn etwas hängt:** Seite neu laden. Server abgestürzt: im Terminal `pnpm dev` neu starten und
die Meldung «Server nicht erreichbar.» als Teil der Fehlerbehandlung erklären.

## Fünf Sätze für schwierige Momente

«Ich zeige Ihnen die Stelle im Code.» · «Das steht nicht in den Folien, die Aufgabenstellung
verlangt es, wir verstehen es so: …» · «Die KI hat das so geschrieben, ich erkläre es Zeile für
Zeile.» · «Darf ich kurz nachsehen?» (`Ctrl+Shift+F`, `F12`) · «Das würden wir heute anders
machen, nämlich …» (Teil 03, B.4)
