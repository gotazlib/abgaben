import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

// Can be changed with the environment variable PORT (the E2E tests use another port)
export const PORT = Number(process.env.PORT ?? 3001)

// How often the server looks for inactive participants
export const CLEANUP_INTERVAL_MS = 5_000

// A participant who has not polled for this long counts as gone.
// The client polls every 1.5 seconds, so 15 seconds tolerates a few lost requests.
export const PARTICIPANT_TIMEOUT_MS = 15_000

// In production (NODE_ENV=production) the server also delivers the built client
// from client/dist, so browser and API share one origin without Vite.
// CLIENT_DIST is only overridden by the tests.
export const CLIENT_DIST =
  process.env.CLIENT_DIST ?? fileURLToPath(new URL('../../client/dist', import.meta.url))
export const SERVE_CLIENT = process.env.NODE_ENV === 'production' && existsSync(CLIENT_DIST)
