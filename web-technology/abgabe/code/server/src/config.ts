// Einstellungen des Servers an einem Ort. Benutzt von index.ts, app.ts und store.ts.

import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

// Port, änderbar mit der Umgebungsvariable PORT (die E2E-Tests nehmen einen anderen)
export const PORT = Number(process.env.PORT ?? 3001)

// Wie oft der Server nach inaktiven Teilnehmern sucht
export const CLEANUP_INTERVAL_MS = 5_000

// Wer sich so lange nicht gemeldet hat, gilt als weg.
// Der Tisch fragt alle 1.5 Sekunden nach, 15 Sekunden verkraften also einige verlorene Anfragen.
export const PARTICIPANT_TIMEOUT_MS = 15_000

// Im Produktivbetrieb (NODE_ENV=production) liefert der Server auch den gebauten Client
// aus client/dist aus, ohne Vite. CLIENT_DIST überschreiben nur die Tests.
export const CLIENT_DIST =
  process.env.CLIENT_DIST ?? fileURLToPath(new URL('../../client/dist', import.meta.url))
export const SERVE_CLIENT = process.env.NODE_ENV === 'production' && existsSync(CLIENT_DIST)
