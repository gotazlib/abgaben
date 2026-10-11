// All routes below /api/sessions.
// The handlers only translate between HTTP and the store: read the request,
// validate it, call a store function and choose the status code.

import { Router, type Response } from 'express'
import type {
  CreateSessionResponse,
  JoinSessionResponse,
  ListSessionsResponse,
  SessionState,
} from '@scrum-poker/shared'
import {
  addParticipant,
  castVote,
  changeDeck,
  createSession,
  deleteSession,
  findParticipant,
  getSession,
  listSessions,
  markAsSeen,
  removeParticipant,
  resetRound,
  revealCards,
  toSessionState,
  type Session,
} from '../store'
import { sendError } from '../sendError'
import { validateDeckBody, validateJoinBody, validateVoteBody } from '../validation'

export const sessionsRouter = Router()

// viewerId: the participant who asks, gets to see their own vote before the reveal
function sendSession(res: Response, session: Session, viewerId?: string): void {
  const body: SessionState = toSessionState(session, viewerId)
  res.json(body)
}

// Returns the session, or sends a 404 and returns undefined.
// Usage: `const session = findSessionOr404(...); if (!session) return`
function findSessionOr404(sessionId: string, res: Response): Session | undefined {
  const session = getSession(sessionId)
  if (!session) {
    sendError(res, 404, 'Session nicht gefunden.')
  }
  return session
}

sessionsRouter.get('/', (_req, res) => {
  const body: ListSessionsResponse = listSessions()
  res.json(body)
})

sessionsRouter.post('/', (_req, res) => {
  const session = createSession()
  const body: CreateSessionResponse = { id: session.id }
  res.status(201).json(body)
})

sessionsRouter.delete('/:sessionId', (req, res) => {
  if (!findSessionOr404(req.params.sessionId, res)) return
  deleteSession(req.params.sessionId)
  res.status(204).end()
})

sessionsRouter.get('/:sessionId', (req, res) => {
  const session = findSessionOr404(req.params.sessionId, res)
  if (!session) return

  // Polling with a participantId doubles as heartbeat (see removeInactiveParticipants).
  // An unknown participantId is not an error: the client sees in the
  // participant list that it is no longer part of the session.
  const { participantId } = req.query
  if (typeof participantId === 'string') {
    const participant = findParticipant(session, participantId)
    if (participant) {
      markAsSeen(participant, Date.now())
    }
  }
  sendSession(res, session, typeof participantId === 'string' ? participantId : undefined)
})

sessionsRouter.post('/:sessionId/participants', (req, res) => {
  const session = findSessionOr404(req.params.sessionId, res)
  if (!session) return

  const result = validateJoinBody(req.body)
  if (!result.ok) {
    sendError(res, 400, result.error)
    return
  }
  const participant = addParticipant(session, result.value.name, Date.now())
  const body: JoinSessionResponse = { participantId: participant.id }
  res.status(201).json(body)
})

sessionsRouter.delete('/:sessionId/participants/:participantId', (req, res) => {
  const session = findSessionOr404(req.params.sessionId, res)
  if (!session) return

  // Idempotent: leaving twice (or after the timeout removed you) is not an error
  removeParticipant(session, req.params.participantId)
  res.status(204).end()
})

sessionsRouter.put('/:sessionId/participants/:participantId/vote', (req, res) => {
  const session = findSessionOr404(req.params.sessionId, res)
  if (!session) return

  const participant = findParticipant(session, req.params.participantId)
  if (!participant) {
    sendError(res, 404, 'Teilnehmer nicht gefunden.')
    return
  }
  if (session.revealed) {
    sendError(res, 409, 'Die Karten sind schon aufgedeckt.')
    return
  }
  const result = validateVoteBody(req.body, session.deck)
  if (!result.ok) {
    sendError(res, 400, result.error)
    return
  }
  castVote(session, participant, result.value.value)
  sendSession(res, session, participant.id)
})

sessionsRouter.put('/:sessionId/deck', (req, res) => {
  const session = findSessionOr404(req.params.sessionId, res)
  if (!session) return

  const result = validateDeckBody(req.body)
  if (!result.ok) {
    sendError(res, 400, result.error)
    return
  }
  changeDeck(session, result.value.deck)
  sendSession(res, session)
})

sessionsRouter.post('/:sessionId/reveal', (req, res) => {
  const session = findSessionOr404(req.params.sessionId, res)
  if (!session) return

  revealCards(session)
  sendSession(res, session)
})

sessionsRouter.post('/:sessionId/reset', (req, res) => {
  const session = findSessionOr404(req.params.sessionId, res)
  if (!session) return

  resetRound(session)
  sendSession(res, session)
})
