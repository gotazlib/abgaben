// Speicher aller Sessions im Arbeitsspeicher (eine Map) und die Funktionen, die ihn ändern.
// Benutzt von routes/sessions.ts (Routen) und index.ts (Aufräum-Timer).
// Diese Datei kennt Express nicht. Nach einem Neustart des Servers sind alle Daten weg.

import { randomUUID } from 'node:crypto'
import type { CardValue, DeckType, Participant, SessionState, SessionSummary } from '@scrum-poker/shared'
import { PARTICIPANT_TIMEOUT_MS } from './config'

// Teilnehmer, wie der Server ihn speichert: anders als der öffentliche Type `Participant`
// mit der echten Stimme und dem Zeitpunkt der letzten Anfrage (Heartbeat).
export interface StoredParticipant {
  id: string
  name: string
  vote: CardValue | null
  // Zeitpunkt in Millisekunden (Date.now())
  lastSeen: number
}

export interface Session {
  id: string
  deck: DeckType
  revealed: boolean
  createdAt: Date
  participants: StoredParticipant[]
}

// Schlüssel ist die Session-ID
const sessions = new Map<string, Session>()

// Wandelt eine Session in das um, was der Client sehen darf (F23: Stimmen verdeckt).
// Vor dem Aufdecken wird pro Person nur `hasVoted` geschickt, der Wert bleibt null.
// Ausnahme: die eigene Stimme der fragenden Person (viewerId). Der Client braucht sie,
// um die gewählte Karte zu markieren, und für diese Person ist sie kein Geheimnis.
export function toSessionState(session: Session, viewerId: string | null): SessionState {
  const participants: Participant[] = []
  for (const participant of session.participants) {
    let vote: CardValue | null = null
    if (session.revealed || participant.id === viewerId) {
      vote = participant.vote
    }
    participants.push({
      id: participant.id,
      name: participant.name,
      hasVoted: participant.vote !== null,
      vote,
    })
  }
  return {
    id: session.id,
    deck: session.deck,
    revealed: session.revealed,
    participants,
  }
}

export function listSessions(): SessionSummary[] {
  const summaries: SessionSummary[] = []
  for (const session of sessions.values()) {
    summaries.push({
      id: session.id,
      participantCount: session.participants.length,
      createdAt: session.createdAt.toISOString(),
    })
  }
  return summaries
}

export function createSession(): Session {
  // 6 Zeichen sind kurz genug für einen Link. Weil sich eine so kurze ID
  // wiederholen kann, wird so lange neu gewürfelt, bis sie noch frei ist.
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

// undefined, wenn es die Session nicht gibt
export function getSession(sessionId: string): Session | undefined {
  return sessions.get(sessionId)
}

export function deleteSession(sessionId: string): void {
  sessions.delete(sessionId)
}

// Nur für die Tests: jeder Test beginnt mit einem leeren Speicher
export function clearSessions(): void {
  sessions.clear()
}

// undefined, wenn die Person nicht (mehr) in der Session ist
export function findParticipant(session: Session, participantId: string): StoredParticipant | undefined {
  return session.participants.find((participant) => participant.id === participantId)
}

export function addParticipant(session: Session, name: string): StoredParticipant {
  const participant: StoredParticipant = {
    id: randomUUID(),
    name,
    vote: null,
    lastSeen: Date.now(),
  }
  session.participants.push(participant)
  return participant
}

export function removeParticipant(session: Session, participantId: string): void {
  session.participants = session.participants.filter((participant) => participant.id !== participantId)
  // Vielleicht war die Person, die gegangen ist, die letzte ohne Stimme
  revealIfEveryoneVoted(session)
}

// Strategie gegen Karteileichen (Tab geschlossen, Netz weg, ...):
// Beim Schliessen eines Tabs kommt nicht sicher ein "Verlassen"-Request an. Darum fragt
// jeder Tisch die Session regelmässig ab, und jede Abfrage zählt als Lebenszeichen
// (lastSeen). index.ts ruft diese Funktion alle paar Sekunden auf und entfernt alle,
// die sich zu lange nicht gemeldet haben. Leere Sessions bleiben: die löschen die Benutzer.
export function removeInactiveParticipants(): void {
  const now = Date.now()
  for (const session of sessions.values()) {
    const inactiveParticipants = session.participants.filter(
      (participant) => now - participant.lastSeen > PARTICIPANT_TIMEOUT_MS,
    )
    for (const participant of inactiveParticipants) {
      removeParticipant(session, participant.id)
    }
  }
}

// value = null zieht die Stimme zurück
export function castVote(session: Session, participant: StoredParticipant, value: CardValue | null): void {
  participant.vote = value
  revealIfEveryoneVoted(session)
}

// Automatisch aufdecken: Haben alle gewählt, gibt es nichts mehr zu warten
function revealIfEveryoneVoted(session: Session): void {
  if (session.participants.length === 0) {
    return
  }
  for (const participant of session.participants) {
    if (participant.vote === null) {
      return
    }
  }
  session.revealed = true
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
  // Stimmen aus dem alten Deck passen nicht ins neue, darum beginnt eine neue Runde
  resetRound(session)
}
