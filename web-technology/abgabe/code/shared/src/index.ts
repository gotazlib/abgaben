// Types and logic shared by client and server.
// Both sides import from '@scrum-poker/shared', so the API contract exists only once.

// ---------------------------------------------------------------------------
// Decks and cards
// ---------------------------------------------------------------------------

export type DeckType = 'fibonacci' | 'tshirt'

export type CardValue = string

export interface Deck {
  label: string
  cards: readonly CardValue[]
}

export const DECKS: Record<DeckType, Deck> = {
  fibonacci: {
    label: 'Fibonacci',
    cards: ['0', '1', '2', '3', '5', '8', '13', '21', '?', '☕'],
  },
  tshirt: {
    label: 'T-Shirt',
    cards: ['XS', 'S', 'M', 'L', 'XL', '?'],
  },
}

// T-shirt sizes have no numeric value, so we map them onto Fibonacci-like
// numbers to be able to calculate an average.
export const TSHIRT_VALUES: Record<string, number> = {
  XS: 1,
  S: 2,
  M: 3,
  L: 5,
  XL: 8,
}

export const MAX_NAME_LENGTH = 30

// ---------------------------------------------------------------------------
// Session state as the client sees it
// ---------------------------------------------------------------------------

export interface Participant {
  id: string
  name: string
  hasVoted: boolean
  // Only set after the cards are revealed. Before that it is null, except for
  // your own vote (GET with ?participantId=… and the response to your vote)
  vote: CardValue | null
}

export interface SessionState {
  id: string
  deck: DeckType
  revealed: boolean
  participants: Participant[]
}

export interface SessionSummary {
  id: string
  participantCount: number
  // ISO 8601 date string, because JSON has no date type
  createdAt: string
}

// ---------------------------------------------------------------------------
// Requests and responses of the REST API
// ---------------------------------------------------------------------------

// GET /api/sessions
export type ListSessionsResponse = SessionSummary[]

// POST /api/sessions
export interface CreateSessionResponse {
  id: string
}

// GET /api/sessions/:sessionId
export type GetSessionResponse = SessionState

// POST /api/sessions/:sessionId/participants
export interface JoinSessionRequest {
  name: string
}
export interface JoinSessionResponse {
  participantId: string
}

// PUT /api/sessions/:sessionId/participants/:participantId/vote
export interface CastVoteRequest {
  // null takes the vote back
  value: CardValue | null
}
export type CastVoteResponse = SessionState

// PUT /api/sessions/:sessionId/deck
export interface ChangeDeckRequest {
  deck: DeckType
}
export type ChangeDeckResponse = SessionState

// POST /api/sessions/:sessionId/reveal
export type RevealCardsResponse = SessionState

// POST /api/sessions/:sessionId/reset
export type ResetRoundResponse = SessionState

// Body of every error response (4xx and 5xx)
export interface ApiErrorBody {
  error: string
}

// ---------------------------------------------------------------------------
// Result of a round
// ---------------------------------------------------------------------------

export interface RoundResult {
  // null if nobody voted with a numeric card
  average: number | null
  // Text to display, e.g. "4.5" or "M"
  averageLabel: string | null
  consensus: boolean
  voteCount: number
}

function toNumber(card: CardValue, deck: DeckType): number | null {
  if (deck === 'tshirt') {
    return TSHIRT_VALUES[card] ?? null
  }
  // "?" and "☕" are not numbers and therefore do not count
  const value = Number(card)
  return Number.isNaN(value) ? null : value
}

function closestTshirtSize(value: number): string {
  let bestSize = 'XS'
  let bestDistance = Infinity
  for (const [size, sizeValue] of Object.entries(TSHIRT_VALUES)) {
    const distance = Math.abs(sizeValue - value)
    // "<=" picks the bigger size on a tie (e.g. 4 lies between M=3 and L=5).
    // When estimating, rounding up is the safer choice.
    if (distance <= bestDistance) {
      bestSize = size
      bestDistance = distance
    }
  }
  return bestSize
}

export function computeResult(votes: CardValue[], deck: DeckType): RoundResult {
  const numbers = votes
    .map((vote) => toNumber(vote, deck))
    .filter((value) => value !== null)

  const consensus = votes.length >= 2 && votes.every((vote) => vote === votes[0])

  if (numbers.length === 0) {
    return { average: null, averageLabel: null, consensus, voteCount: votes.length }
  }

  const sum = numbers.reduce((total, value) => total + value, 0)
  // Round to one decimal place, e.g. 4.333 -> 4.3
  const average = Math.round((sum / numbers.length) * 10) / 10
  const averageLabel = deck === 'tshirt' ? closestTshirtSize(average) : String(average)

  return { average, averageLabel, consensus, voteCount: votes.length }
}
