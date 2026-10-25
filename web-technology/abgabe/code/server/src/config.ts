// Einstellungen des Servers an einem Ort. Benutzt von index.ts, app.ts und store.ts.

// Standard-Port 3000: Dorthin leitet der Vite-Proxy des Clients /api weiter.
// Auf dem Live-Server und in den E2E-Tests kommt er aus der Umgebungsvariable PORT.
let port = 3000
if (process.env.PORT !== undefined) {
  port = Number(process.env.PORT)
}
export const PORT = port

// Wie oft der Server nach inaktiven Teilnehmern sucht
export const CLEANUP_INTERVAL_MS = 5000

// Wer sich so lange nicht gemeldet hat, gilt als weg.
// Der Tisch fragt alle 1.5 Sekunden nach, 15 Sekunden verkraften also einige verlorene Anfragen.
export const PARTICIPANT_TIMEOUT_MS = 15000

// Im Produktivbetrieb (NODE_ENV=production) liefert der Server auch den gebauten Client
// aus client/dist aus, ohne Vite. Der Pfad ist relativ zum Ordner server/, dort startet
// pnpm den Server.
export const CLIENT_DIST = '../client/dist'
export const SERVE_CLIENT = process.env.NODE_ENV === 'production'
