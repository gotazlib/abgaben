// Startpunkt des Servers (pnpm dev / pnpm start): startet den Aufräum-Timer und die App.

import { app } from './app.ts'
import { CLEANUP_INTERVAL_MS, PORT } from './config.ts'
import { removeInactiveParticipants } from './store.ts'

// Strategie gegen Karteileichen: Alle 5 Sekunden werden Teilnehmer entfernt,
// die sich zu lange nicht gemeldet haben (Details in store.ts).
setInterval(removeInactiveParticipants, CLEANUP_INTERVAL_MS)

app.listen(PORT, () => {
  console.log(`Scrum Poker API läuft auf http://localhost:${PORT}`)
})
