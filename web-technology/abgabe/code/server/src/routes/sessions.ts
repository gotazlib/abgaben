// Alle Routen unter /api/sessions (eingebunden in app.ts).
// Jede Route liest sich von oben nach unten: Session holen → wenn es sie nicht gibt 404 →
// Body prüfen (400) → Store ändern → mit Statuscode und JSON antworten.
// Express gibt req.body den Typ any. Erst nach der Prüfung in validation.ts weisen wir den
// Body einer Variable mit unserem Type zu (z. B. JoinSessionRequest), vorher nicht.

import { Router } from 'express'
import type {
  CastVoteRequest,
  ChangeDeckRequest,
  CreateSessionResponse,
  JoinSessionRequest,
  JoinSessionResponse,
} from '../types.ts'
import {
  addParticipant,
  castVote,
  changeDeck,
  createSession,
  deleteSession,
  findParticipant,
  getSession,
  listSessions,
  removeParticipant,
  resetRound,
  revealCards,
  toSessionState,
} from '../store.ts'
import { getDeckError, getJoinError, getVoteError } from '../validation.ts'

export const sessionsRouter = Router()

const SESSION_NOT_FOUND = 'Session nicht gefunden.'

// GET /api/sessions: Liste aller Sessions für die Home-Seite
sessionsRouter.get('/', (_req, res) => {
  res.json(listSessions())
})

// POST /api/sessions: neue Session erstellen, der Server vergibt die ID
sessionsRouter.post('/', (_req, res) => {
  const session = createSession()
  const body: CreateSessionResponse = { id: session.id }
  res.status(201).json(body)
})

// DELETE /api/sessions/:sessionId: Session löschen, auch wenn noch Leute drin sind
sessionsRouter.delete('/:sessionId', (req, res) => {
  const session = getSession(req.params.sessionId)
  if (!session) {
    res.status(404).json({ error: SESSION_NOT_FOUND })
    return
  }
  deleteSession(session.id)
  res.status(204).end()
})

// GET /api/sessions/:sessionId?participantId=…: Zustand der Session (Polling des Tisches)
sessionsRouter.get('/:sessionId', (req, res) => {
  const session = getSession(req.params.sessionId)
  if (!session) {
    res.status(404).json({ error: SESSION_NOT_FOUND })
    return
  }

  let viewerId: string | null = null
  if (typeof req.query.participantId === 'string') {
    viewerId = req.query.participantId
  }

  // Heartbeat: Jede Abfrage mit participantId beweist, dass der Tab noch offen ist
  // (siehe removeInactiveParticipants im Store). Eine unbekannte ID ist kein Fehler:
  // Der Client sieht in der Liste selbst, dass er nicht mehr dabei ist.
  if (viewerId !== null) {
    const participant = findParticipant(session, viewerId)
    if (participant) {
      participant.lastSeen = Date.now()
    }
  }
  res.json(toSessionState(session, viewerId))
})

// POST /api/sessions/:sessionId/participants: beitreten, der Server vergibt die participantId
sessionsRouter.post('/:sessionId/participants', (req, res) => {
  const session = getSession(req.params.sessionId)
  if (!session) {
    res.status(404).json({ error: SESSION_NOT_FOUND })
    return
  }
  const error = getJoinError(req.body)
  if (error !== null) {
    res.status(400).json({ error })
    return
  }
  // Ab hier ist der Body geprüft und hat die erwartete Form
  const joinRequest: JoinSessionRequest = req.body

  const participant = addParticipant(session, joinRequest.name.trim())
  const body: JoinSessionResponse = { participantId: participant.id }
  res.status(201).json(body)
})

// DELETE /api/sessions/:sessionId/participants/:participantId: Session verlassen
sessionsRouter.delete('/:sessionId/participants/:participantId', (req, res) => {
  const session = getSession(req.params.sessionId)
  if (!session) {
    res.status(404).json({ error: SESSION_NOT_FOUND })
    return
  }
  // Idempotent: Zweimal verlassen (oder nach dem Timeout) ist kein Fehler
  removeParticipant(session, req.params.participantId)
  res.status(204).end()
})

// PUT /api/sessions/:sessionId/participants/:participantId/vote: Karte wählen oder zurückziehen
sessionsRouter.put(
  '/:sessionId/participants/:participantId/vote',
  (req, res) => {
    const session = getSession(req.params.sessionId)
    if (!session) {
      res.status(404).json({ error: SESSION_NOT_FOUND })
      return
    }
    const participant = findParticipant(session, req.params.participantId)
    if (!participant) {
      res.status(404).json({ error: 'Teilnehmer nicht gefunden.' })
      return
    }
    // 409 Conflict: Die Anfrage passt nicht zum aktuellen Zustand der Runde
    if (session.revealed) {
      res.status(409).json({ error: 'Die Karten sind schon aufgedeckt.' })
      return
    }
    const error = getVoteError(req.body, session.deck)
    if (error !== null) {
      res.status(400).json({ error })
      return
    }
    const voteRequest: CastVoteRequest = req.body

    castVote(session, participant, voteRequest.value)
    // Die Antwort zeigt der wählenden Person ihre eigene Stimme, die der anderen nicht
    res.json(toSessionState(session, participant.id))
  },
)

// PUT /api/sessions/:sessionId/deck: Deck wechseln (startet eine neue Runde)
sessionsRouter.put('/:sessionId/deck', (req, res) => {
  const session = getSession(req.params.sessionId)
  if (!session) {
    res.status(404).json({ error: SESSION_NOT_FOUND })
    return
  }
  const error = getDeckError(req.body)
  if (error !== null) {
    res.status(400).json({ error })
    return
  }
  const deckRequest: ChangeDeckRequest = req.body

  changeDeck(session, deckRequest.deck)
  res.json(toSessionState(session, null))
})

// POST /api/sessions/:sessionId/reveal: Karten für alle aufdecken
sessionsRouter.post('/:sessionId/reveal', (req, res) => {
  const session = getSession(req.params.sessionId)
  if (!session) {
    res.status(404).json({ error: SESSION_NOT_FOUND })
    return
  }
  revealCards(session)
  res.json(toSessionState(session, null))
})

// POST /api/sessions/:sessionId/reset: neue Runde, alle Stimmen löschen
sessionsRouter.post('/:sessionId/reset', (req, res) => {
  const session = getSession(req.params.sessionId)
  if (!session) {
    res.status(404).json({ error: SESSION_NOT_FOUND })
    return
  }
  resetRound(session)
  res.json(toSessionState(session, null))
})
