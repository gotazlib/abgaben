// In-memory storage of all sessions.
// This file knows nothing about Express: it only holds the data and changes it.
// All data is lost when the server restarts, which is fine for this project.

import { randomUUID } from 'node:crypto'
import type { CardValue, DeckType, SessionState, SessionSummary } from '@scrum-poker/shared'
import { PARTICIPANT_TIMEOUT_MS } from './config'

// Internal view of a participant: unlike the public `Participant` type it
// holds the real vote and the time of the last request (heartbeat).
export interface StoredParticipant {
  id: string
  name: string
  vote: CardValue | null
  lastSeen: number
}

export interface Session {
  id: string
  deck: DeckType
  revealed: boolean
  createdAt: Date
  participants: StoredParticipant[]
}

const sessions = new Map<string, Session>()

// ---------------------------------------------------------------------------
// Mapping to the public types
// ---------------------------------------------------------------------------

// Converts a session into what the client is allowed to see.
// Before the reveal, votes are only sent whether someone has voted. The one
// exception is the viewer's own vote: the client needs it to highlight the
// chosen card, and it is no secret for the person who chose it.
export function toSessionState(session: Session, viewerId?: string): SessionState {
  return {
    id: session.id,
    deck: session.deck,
    revealed: session.revealed,
    participants: session.participants.map((participant) => ({
      id: participant.id,
      name: participant.name,
      hasVoted: participant.vote !== null,
      vote: session.revealed || participant.id === viewerId ? participant.vote : null,
    })),
  }
}

export function listSessions(): SessionSummary[] {
  return Array.from(sessions.values(), (session) => ({
    id: session.id,
    participantCount: session.participants.length,
    createdAt: session.createdAt.toISOString(),
  }))
}

// ---------------------------------------------------------------------------
// Sessions
// ---------------------------------------------------------------------------

export function createSession(): Session {
  // 6 characters are short enough to share as a link. Because such a short
  // ID can repeat, we generate a new one until it is unused.
  let id = randomUUID().slice(0, 6)
  while (sessions.has(id)) {
    id = randomUUID().slice(0, 6)
  }

  const session: Session = {
    id,
    deck: 'fibonacci',
    revealed: false,
    createdAt: new Date(),
    participants: [],
  }
  sessions.set(id, session)
  return session
}

export function getSession(sessionId: string): Session | undefined {
  return sessions.get(sessionId)
}

export function deleteSession(sessionId: string): void {
  sessions.delete(sessionId)
}

// Only used by the tests, so that every test starts with an empty store
export function clearSessions(): void {
  sessions.clear()
}

// ---------------------------------------------------------------------------
// Participants
// ---------------------------------------------------------------------------

export function findParticipant(
  session: Session,
  participantId: string,
): StoredParticipant | undefined {
  return session.participants.find((participant) => participant.id === participantId)
}

export function addParticipant(session: Session, name: string, now: number): StoredParticipant {
  const participant: StoredParticipant = { id: randomUUID(), name, vote: null, lastSeen: now }
  session.participants.push(participant)
  return participant
}

export function removeParticipant(session: Session, participantId: string): void {
  session.participants = session.participants.filter(
    (participant) => participant.id !== participantId,
  )
  // The person who left may have been the last one still missing
  revealIfEveryoneVoted(session)
}

// Called on every poll of a participant: proves that the browser tab is still open
export function markAsSeen(participant: StoredParticipant, now: number): void {
  participant.lastSeen = now
}

// Strategy against "ghost" participants (closed tab, lost network, ...):
// Nobody can rely on a "leave" request being sent when a tab closes. Instead,
// every participant polls the session regularly and the poll counts as a
// heartbeat. A timer removes everyone whose last heartbeat is too old.
// Empty sessions are kept on purpose: they are deleted explicitly by the users.
export function removeInactiveParticipants(now: number): void {
  for (const session of sessions.values()) {
    const inactive = session.participants.filter(
      (participant) => now - participant.lastSeen > PARTICIPANT_TIMEOUT_MS,
    )
    for (const participant of inactive) {
      removeParticipant(session, participant.id)
    }
  }
}

// ---------------------------------------------------------------------------
// Round
// ---------------------------------------------------------------------------

export function castVote(session: Session, participant: StoredParticipant, value: CardValue | null): void {
  participant.vote = value
  revealIfEveryoneVoted(session)
}

// Auto-reveal: as soon as everybody has voted there is nothing left to wait for
function revealIfEveryoneVoted(session: Session): void {
  const everyoneVoted =
    session.participants.length > 0 &&
    session.participants.every((participant) => participant.vote !== null)
  if (everyoneVoted) {
    session.revealed = true
  }
}

export function revealCards(session: Session): void {
  session.revealed = true
}

export function resetRound(session: Session): void {
  session.revealed = false
  for (const participant of session.participants) {
    participant.vote = null
  }
}

export function changeDeck(session: Session, deck: DeckType): void {
  if (session.deck === deck) {
    return
  }
  session.deck = deck
  // Votes from the old deck would be invalid in the new one, so a new round starts
  resetRound(session)
}
