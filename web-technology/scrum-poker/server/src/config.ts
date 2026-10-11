// Can be changed with the environment variable PORT (the E2E tests use another port)
export const PORT = Number(process.env.PORT ?? 3001)

// How often the server looks for inactive participants
export const CLEANUP_INTERVAL_MS = 5_000

// A participant who has not polled for this long counts as gone.
// The client polls every 1.5 seconds, so 15 seconds tolerates a few lost requests.
export const PARTICIPANT_TIMEOUT_MS = 15_000
