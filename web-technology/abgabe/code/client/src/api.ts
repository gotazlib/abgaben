// Alle Aufrufe an den Server (REST-API unter /api). Benutzt von HomePage, SessionListItem,
// SessionPage und PokerRoom. Komponenten rufen fetch() nie selbst auf, sondern nur diese Funktionen.

import type {
  CardValue,
  CastVoteRequest,
  ChangeDeckRequest,
  CreateSessionResponse,
  DeckType,
  ErrorResponse,
  JoinSessionRequest,
  JoinSessionResponse,
  SessionState,
  SessionSummary,
} from '@scrum-poker/shared'

const SERVER_UNREACHABLE = 'Server nicht erreichbar.'

// Schickt eine Anfrage an den Server. Ein Objekt als body wird als JSON gesendet.
// fetch() wirft nur, wenn gar keine Antwort kommt (offline, Server gestoppt).
async function send(method: string, path: string, body?: object): Promise<Response> {
  const options: RequestInit = { method }
  if (body !== undefined) {
    options.headers = { 'Content-Type': 'application/json' }
    options.body = JSON.stringify(body)
  }
  try {
    return await fetch('/api' + path, options)
  } catch {
    throw new Error(SERVER_UNREACHABLE)
  }
}

// Macht aus einer Fehlerantwort einen Error mit einer Meldung für die Anzeige
async function createError(response: Response): Promise<Error> {
  // Der Vite-Proxy antwortet mit 502, wenn der Express-Server nicht läuft
  if (response.status === 502 || response.status === 503 || response.status === 504) {
    return new Error(SERVER_UNREACHABLE)
  }
  try {
    // Wir vertrauen dem eigenen Server: Fehler kommen als { error: '…' }
    const body = (await response.json()) as ErrorResponse
    if (typeof body.error === 'string') {
      return new Error(body.error)
    }
  } catch {
    // Kein JSON in der Antwort: unten eine allgemeine Meldung
  }
  return new Error('Anfrage fehlgeschlagen (HTTP ' + response.status + ').')
}

// GET /api/sessions: alle offenen Sessions für die Liste auf der Home-Seite
export async function listSessions(): Promise<SessionSummary[]> {
  const response = await send('GET', '/sessions')
  if (!response.ok) {
    throw await createError(response)
  }
  return (await response.json()) as SessionSummary[]
}

// POST /api/sessions: legt eine Session an und gibt ihre ID zurück
export async function createSession(): Promise<string> {
  const response = await send('POST', '/sessions')
  if (!response.ok) {
    throw await createError(response)
  }
  const body = (await response.json()) as CreateSessionResponse
  return body.id
}

// DELETE /api/sessions/:id
export async function deleteSession(sessionId: string): Promise<void> {
  const response = await send('DELETE', '/sessions/' + sessionId)
  // 404: jemand anderes hat sie schon gelöscht, das Ziel ist also erreicht
  if (response.status === 404) {
    return
  }
  if (!response.ok) {
    throw await createError(response)
  }
}

// GET /api/sessions/:id?participantId=…: aktueller Zustand des Tisches.
// Zählt beim Server gleichzeitig als «ich bin noch da» (Heartbeat).
// null heisst: Diese Session gibt es nicht (mehr).
export async function getSession(sessionId: string, participantId: string): Promise<SessionState | null> {
  const response = await send('GET', '/sessions/' + sessionId + '?participantId=' + participantId)
  if (response.status === 404) {
    return null
  }
  if (!response.ok) {
    throw await createError(response)
  }
  return (await response.json()) as SessionState
}

// POST /api/sessions/:id/participants: tritt der Session bei und gibt die participantId zurück.
// Mit savedParticipantId (nach einem Reload) macht der Server mit demselben Teilnehmer weiter.
// null heisst: Diese Session gibt es nicht (mehr).
export async function joinSession(
  sessionId: string,
  name: string,
  savedParticipantId: string | null,
): Promise<string | null> {
  const body: JoinSessionRequest = { name, participantId: savedParticipantId }
  const response = await send('POST', '/sessions/' + sessionId + '/participants', body)
  if (response.status === 404) {
    return null
  }
  if (!response.ok) {
    throw await createError(response)
  }
  const answer = (await response.json()) as JoinSessionResponse
  return answer.participantId
}

// DELETE /api/sessions/:id/participants/:participantId: verlässt die Session
export async function leaveSession(sessionId: string, participantId: string): Promise<void> {
  const response = await send('DELETE', '/sessions/' + sessionId + '/participants/' + participantId)
  if (!response.ok) {
    throw await createError(response)
  }
}

// PUT /api/sessions/:id/participants/:participantId/vote: Karte wählen (value = null zieht die Stimme zurück)
export async function castVote(sessionId: string, participantId: string, value: CardValue | null): Promise<SessionState> {
  const body: CastVoteRequest = { value }
  const response = await send('PUT', '/sessions/' + sessionId + '/participants/' + participantId + '/vote', body)
  if (!response.ok) {
    throw await createError(response)
  }
  return (await response.json()) as SessionState
}

// PUT /api/sessions/:id/deck: Deck für alle wechseln
export async function changeDeck(sessionId: string, deck: DeckType): Promise<SessionState> {
  const body: ChangeDeckRequest = { deck }
  const response = await send('PUT', '/sessions/' + sessionId + '/deck', body)
  if (!response.ok) {
    throw await createError(response)
  }
  return (await response.json()) as SessionState
}

// POST /api/sessions/:id/reveal: Karten für alle aufdecken
export async function revealCards(sessionId: string): Promise<SessionState> {
  const response = await send('POST', '/sessions/' + sessionId + '/reveal')
  if (!response.ok) {
    throw await createError(response)
  }
  return (await response.json()) as SessionState
}

// POST /api/sessions/:id/reset: neue Runde, alle Stimmen werden gelöscht
export async function resetRound(sessionId: string): Promise<SessionState> {
  const response = await send('POST', '/sessions/' + sessionId + '/reset')
  if (!response.ok) {
    throw await createError(response)
  }
  return (await response.json()) as SessionState
}

// Text für die Anzeige aus einem catch. Im catch ist der Fehler vom Typ unknown,
// darum prüfen wir, ob es wirklich ein Error ist.
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }
  return 'Unbekannter Fehler.'
}
