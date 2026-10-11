// How often an open session page asks the server for the current state.
// Must stay well below the server's participant timeout (15 s), because
// every poll also counts as "I am still here" (heartbeat).
export const POLL_INTERVAL_MS = 1_500

// How often the home page refreshes the list of open sessions
export const SESSION_LIST_POLL_INTERVAL_MS = 3_000
