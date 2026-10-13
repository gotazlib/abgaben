// Gemeinsamer «Vertrag» zwischen Client und Server: Types, Decks, Namensprüfung und Durchschnitt.
// Client und Server importieren diese Datei über den Paketnamen '@scrum-poker/shared'.
// So gibt es jede Regel und jeden Type nur einmal.

// Decks und Karten

export type DeckType = 'fibonacci' | 'tshirt'

export type CardValue = string

export interface Deck {
  label: string
  cards: CardValue[]
}

// Der Type sorgt dafür, dass jedes Deck ein label und eine Kartenliste hat
export const DECKS: { fibonacci: Deck; tshirt: Deck } = {
  fibonacci: {
    label: 'Fibonacci',
    cards: ['0', '1', '2', '3', '5', '8', '13', '21', '?', '☕'],
  },
  tshirt: {
    label: 'T-Shirt',
    cards: ['XS', 'S', 'M', 'L', 'XL', '?'],
  },
}

// Alle Decks als Liste: für die Auswahl im Client und die Prüfung im Server
export const DECK_TYPES: DeckType[] = ['fibonacci', 'tshirt']

// T-Shirt-Grössen haben keinen Zahlenwert. Damit wir trotzdem einen Durchschnitt
// rechnen können, bekommt jede Grösse eine Zahl ähnlich wie bei Fibonacci.
export const TSHIRT_VALUES: Record<string, number> = {
  XS: 1,
  S: 2,
  M: 3,
  L: 5,
  XL: 8,
}

// Name

export const MAX_NAME_LENGTH = 30

// Gibt die Fehlermeldung zurück, oder null, wenn der Name gültig ist.
// Leerzeichen am Anfang und Ende zählen nicht ("  Anna " ist gültig, "   " nicht).
export function validateName(name: string): string | null {
  const trimmedName = name.trim()
  if (trimmedName === '') {
    return 'Bitte gib deinen Namen ein.'
  }
  if (trimmedName.length > MAX_NAME_LENGTH) {
    return `Der Name darf höchstens ${MAX_NAME_LENGTH} Zeichen lang sein.`
  }
  return null
}

// Zustand einer Session, so wie der Client ihn sieht

export interface Participant {
  id: string
  name: string
  hasVoted: boolean
  // Vor dem Aufdecken immer null, ausser bei der eigenen Stimme.
  // Erst nach dem Aufdecken sehen alle die Karten.
  vote: CardValue | null
}

export interface SessionState {
  id: string
  deck: DeckType
  revealed: boolean
  participants: Participant[]
}

// Ein Eintrag in der Session-Liste auf der Home-Seite
export interface SessionSummary {
  id: string
  participantCount: number
  // Datum als Text (ISO 8601), weil JSON keinen Datumstyp kennt
  createdAt: string
}

// Bodies der REST-API (nur die mit eigener Form; sonst wird SessionState geschickt)

// Antwort auf POST /api/sessions
export interface CreateSessionResponse {
  id: string
}

// Body von POST /api/sessions/:sessionId/participants
export interface JoinSessionRequest {
  name: string
  // Gespeicherte ID nach einem Reload: kennt der Server sie noch, geht es mit ihr weiter.
  // null oder weggelassen = neu beitreten
  participantId?: string | null
}

// Antwort auf POST /api/sessions/:sessionId/participants
export interface JoinSessionResponse {
  participantId: string
}

// Body von PUT /api/sessions/:sessionId/participants/:participantId/vote
export interface CastVoteRequest {
  // null zieht die Stimme zurück
  value: CardValue | null
}

// Body von PUT /api/sessions/:sessionId/deck
export interface ChangeDeckRequest {
  deck: DeckType
}

// Body jeder Fehlerantwort (4xx und 5xx)
export interface ErrorResponse {
  error: string
}

// Ergebnis einer Runde

export interface RoundResult {
  // null, wenn niemand eine Karte mit Zahlenwert gewählt hat
  average: number | null
  // Text für die Anzeige, z. B. "4.5" oder "M"
  averageLabel: string | null
  consensus: boolean
  voteCount: number
}

// Zahlenwert einer Karte, oder null, wenn die Karte keine Zahl ist ("?", "☕")
function toNumber(card: CardValue, deck: DeckType): number | null {
  if (deck === 'tshirt') {
    const value = TSHIRT_VALUES[card]
    if (value === undefined) {
      return null
    }
    return value
  }
  const value = Number(card)
  if (Number.isNaN(value)) {
    return null
  }
  return value
}

// Sucht die T-Shirt-Grösse, deren Zahl am nächsten beim Durchschnitt liegt
function closestTshirtSize(average: number): string {
  let bestSize = 'XS'
  let bestDistance = Infinity
  for (const size in TSHIRT_VALUES) {
    const distance = Math.abs(TSHIRT_VALUES[size] - average)
    // "<=" nimmt bei Gleichstand die grössere Grösse (4 liegt genau zwischen M=3 und L=5).
    // Beim Schätzen ist Aufrunden die sicherere Wahl.
    if (distance <= bestDistance) {
      bestSize = size
      bestDistance = distance
    }
  }
  return bestSize
}

// Berechnet Durchschnitt und Konsens aus den Stimmen einer aufgedeckten Runde
export function computeResult(votes: CardValue[], deck: DeckType): RoundResult {
  // Konsens: mindestens zwei Stimmen, und alle sind gleich
  let consensus = votes.length >= 2
  for (const vote of votes) {
    if (vote !== votes[0]) {
      consensus = false
    }
  }

  // Nur Karten mit Zahlenwert zählen für den Durchschnitt
  let sum = 0
  let numberCount = 0
  for (const vote of votes) {
    const value = toNumber(vote, deck)
    if (value !== null) {
      sum = sum + value
      numberCount = numberCount + 1
    }
  }

  if (numberCount === 0) {
    return { average: null, averageLabel: null, consensus, voteCount: votes.length }
  }

  // Auf eine Nachkommastelle runden, z. B. 4.333 -> 4.3
  const average = Math.round((sum / numberCount) * 10) / 10
  let averageLabel = String(average)
  if (deck === 'tshirt') {
    averageLabel = closestTshirtSize(average)
  }
  return { average, averageLabel, consensus, voteCount: votes.length }
}
