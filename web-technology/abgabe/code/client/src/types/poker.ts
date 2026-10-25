// Types für Decks, Karten, Teilnehmer und den Zustand einer Session, dazu die Bodies der
// REST-API. Der Server hat dieselben Types in server/src/types.ts.

export type DeckType = 'fibonacci' | 'tshirt'

export type CardValue = string

export type Deck = {
  label: string
  cards: CardValue[]
}

// Eine T-Shirt-Grösse mit der Zahl, die für den Durchschnitt zählt
export type TshirtSize = {
  size: string
  value: number
}

// Zustand einer Session, so wie der Client ihn sieht

export type Participant = {
  id: string
  name: string
  hasVoted: boolean
  // Vor dem Aufdecken immer null, ausser bei der eigenen Stimme.
  // Erst nach dem Aufdecken sehen alle die Karten.
  vote: CardValue | null
}

export type SessionState = {
  id: string
  deck: DeckType
  revealed: boolean
  participants: Participant[]
}

// Ein Eintrag in der Session-Liste auf der Home-Seite
export type SessionSummary = {
  id: string
  participantCount: number
}

// Bodies der REST-API (nur die mit eigener Form; sonst wird SessionState geschickt)

// Antwort auf POST /api/sessions
export type CreateSessionResponse = {
  id: string
}

// Body von POST /api/sessions/:sessionId/participants
export type JoinSessionRequest = {
  name: string
}

// Antwort auf POST /api/sessions/:sessionId/participants
export type JoinSessionResponse = {
  participantId: string
}

// Body von PUT /api/sessions/:sessionId/participants/:participantId/vote
export type CastVoteRequest = {
  // null zieht die Stimme zurück
  value: CardValue | null
}

// Body von PUT /api/sessions/:sessionId/deck
export type ChangeDeckRequest = {
  deck: DeckType
}

// Ergebnis einer Runde

export type RoundResult = {
  // null, wenn niemand eine Karte mit Zahlenwert gewählt hat
  average: number | null
  // Text für die Anzeige, z. B. "4.5" oder "M"
  averageLabel: string | null
  consensus: boolean
  voteCount: number
}
