// Typed functions for every route of the REST API.
// Components never call fetch() themselves, they use these functions.

import type {
  ApiErrorBody,
  CardValue,
  CastVoteRequest,
  CastVoteResponse,
  ChangeDeckRequest,
  ChangeDeckResponse,
  CreateSessionResponse,
  DeckType,
  GetSessionResponse,
  JoinSessionRequest,
  JoinSessionResponse,
  ListSessionsResponse,
  ResetRoundResponse,
  RevealCardsResponse,
} from '@scrum-poker/shared'

// Thrown for every failed request. `status` is the HTTP status code,
// or 0 if the server could not be reached at all.
export class ApiError extends Error {
  readonly status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  body?: unknown
  signal?: AbortSignal
  // Lets the request finish even if the page is closed or reloaded meanwhile
  keepalive?: boolean
}

async function readErrorMessage(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as Partial<ApiErrorBody>
    if (typeof body.error === 'string') {
      return body.error
    }
  } catch {
    // The body was not JSON, so we fall back to a message based on the status
  }
  // The Vite proxy answers 502 (Bad Gateway) when the Express server is not running
  if (response.status === 502 || response.status === 503 || response.status === 504) {
    return 'Server nicht erreichbar.'
  }
  return `Anfrage fehlgeschlagen (HTTP ${response.status}).`
}

// Sends the request and turns every kind of failure into an ApiError
async function send(path: string, { method = 'GET', body, signal, keepalive }: RequestOptions): Promise<Response> {
  let response: Response
  try {
    response = await fetch(`/api${path}`, {
      method,
      signal,
      keepalive,
      headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    })
  } catch (error) {
    // A cancelled request is not a network problem: pass it on unchanged,
    // so that the caller can recognise and ignore it.
    if (signal?.aborted) {
      throw error
    }
    // fetch() only rejects if no response arrived at all (offline, server down)
    throw new ApiError(0, 'Server nicht erreichbar.')
  }

  if (!response.ok) {
    throw new ApiError(response.status, await readErrorMessage(response))
  }
  return response
}

// Like send(), but also reads the JSON response
async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const response = await send(path, options)
  // We trust the server to answer with the agreed type from @scrum-poker/shared
  return (await response.json()) as T
}

function sessionPath(sessionId: string): string {
  return `/sessions/${encodeURIComponent(sessionId)}`
}

function participantPath(sessionId: string, participantId: string): string {
  return `${sessionPath(sessionId)}/participants/${encodeURIComponent(participantId)}`
}

export function listSessions(signal?: AbortSignal): Promise<ListSessionsResponse> {
  return request<ListSessionsResponse>('/sessions', { signal })
}

export function createSession(): Promise<CreateSessionResponse> {
  return request<CreateSessionResponse>('/sessions', { method: 'POST' })
}

export async function deleteSession(sessionId: string): Promise<void> {
  await send(sessionPath(sessionId), { method: 'DELETE' })
}

// With a participantId, the request also counts as heartbeat for that participant
export function getSession(
  sessionId: string,
  participantId?: string,
  signal?: AbortSignal,
): Promise<GetSessionResponse> {
  const query = participantId ? `?participantId=${encodeURIComponent(participantId)}` : ''
  return request<GetSessionResponse>(`${sessionPath(sessionId)}${query}`, { signal })
}

export function joinSession(sessionId: string, name: string): Promise<JoinSessionResponse> {
  const body: JoinSessionRequest = { name }
  return request<JoinSessionResponse>(`${sessionPath(sessionId)}/participants`, { method: 'POST', body })
}

// keepalive: leaving also works while the tab is being closed (see SessionPage)
export async function leaveSession(sessionId: string, participantId: string): Promise<void> {
  await send(participantPath(sessionId, participantId), { method: 'DELETE', keepalive: true })
}

// value = null takes the vote back
export function castVote(
  sessionId: string,
  participantId: string,
  value: CardValue | null,
): Promise<CastVoteResponse> {
  const body: CastVoteRequest = { value }
  return request<CastVoteResponse>(`${participantPath(sessionId, participantId)}/vote`, { method: 'PUT', body })
}

export function changeDeck(sessionId: string, deck: DeckType): Promise<ChangeDeckResponse> {
  const body: ChangeDeckRequest = { deck }
  return request<ChangeDeckResponse>(`${sessionPath(sessionId)}/deck`, { method: 'PUT', body })
}

export function revealCards(sessionId: string): Promise<RevealCardsResponse> {
  return request<RevealCardsResponse>(`${sessionPath(sessionId)}/reveal`, { method: 'POST' })
}

export function resetRound(sessionId: string): Promise<ResetRoundResponse> {
  return request<ResetRoundResponse>(`${sessionPath(sessionId)}/reset`, { method: 'POST' })
}
