import { app } from './app'
import { CLEANUP_INTERVAL_MS, PORT } from './config'
import { removeInactiveParticipants } from './store'

setInterval(() => removeInactiveParticipants(Date.now()), CLEANUP_INTERVAL_MS)

app.listen(PORT, () => {
  console.log(`Scrum Poker API running on http://localhost:${PORT}`)
})
