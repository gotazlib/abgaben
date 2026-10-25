// Types des Servers: wie er Sessions speichert und was er an den Client schickt.
// Der Client hat dieselben Types für die Antworten in client/src/types/poker.ts.

export type DeckType = 'fibonacci' | 'tshirt'

export type CardValue = string

// Teilnehmer, wie der Client ihn sieht. Vor dem Aufdecken ist vote immer null,
// ausser bei der eigenen Stimme.
export type Participant = {
  id: string
  name: string
  hasVoted: boolean
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

export type CreateSessionResponse = {
  id: string
}

export type JoinSessionRequest = {
  name: string
}

export type JoinSessionResponse = {
  participantId: string
}

export type CastVoteRequest = {
  // null zieht die Stimme zurück
  value: CardValue | null
}

export type ChangeDeckRequest = {
  deck: DeckType
}
