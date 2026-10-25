// Regeln des Spiels: Decks, Namensprüfung und Durchschnitt (die Types dazu stehen in
// types/poker.ts). Der Server ist ein eigenes Projekt und prüft Namen und Karten mit
// denselben Regeln in server/src/rules.ts. Wer hier etwas ändert, muss es dort auch tun.

import type {
  CardValue,
  Deck,
  DeckType,
  RoundResult,
  TshirtSize,
} from '../types/poker.ts'

// Decks und Karten

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

// Alle Decks als Liste, z. B. für die Auswahl im DeckSwitcher (der Server hat eine eigene in rules.ts)
export const DECK_TYPES: DeckType[] = ['fibonacci', 'tshirt']

// T-Shirt-Grössen haben keinen Zahlenwert. Damit wir trotzdem einen Durchschnitt
// rechnen können, bekommt jede Grösse eine Zahl ähnlich wie bei Fibonacci.
export const TSHIRT_SIZES: TshirtSize[] = [
  { size: 'XS', value: 1 },
  { size: 'S', value: 2 },
  { size: 'M', value: 3 },
  { size: 'L', value: 5 },
  { size: 'XL', value: 8 },
]

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

// Zahlenwert einer Karte, oder null, wenn die Karte keine Zahl ist ("?", "☕")
function toNumber(card: CardValue, deck: DeckType): number | null {
  if (deck === 'tshirt') {
    const tshirt = TSHIRT_SIZES.find((tshirt) => tshirt.size === card)
    if (tshirt === undefined) {
      return null
    }
    return tshirt.value
  }
  // "?" und "☕" ergeben NaN (Not a Number)
  const value = Number(card)
  if (Number.isNaN(value)) {
    return null
  }
  return value
}

// Sucht die T-Shirt-Grösse, deren Zahl am nächsten beim Durchschnitt liegt
function closestTshirtSize(average: number): string {
  // Wir starten mit der ersten Grösse und schauen, ob eine andere näher liegt
  let best = TSHIRT_SIZES[0]
  for (const tshirt of TSHIRT_SIZES) {
    // "<=" nimmt bei Gleichstand die grössere Grösse (4 liegt genau zwischen M=3 und L=5).
    // Beim Schätzen ist Aufrunden die sicherere Wahl.
    if (Math.abs(tshirt.value - average) <= Math.abs(best.value - average)) {
      best = tshirt
    }
  }
  return best.size
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
    return {
      average: null,
      averageLabel: null,
      consensus,
      voteCount: votes.length,
    }
  }

  // Auf eine Nachkommastelle runden, z. B. 4.333 -> 4.3
  const average = Math.round((sum / numberCount) * 10) / 10
  let averageLabel = String(average)
  if (deck === 'tshirt') {
    averageLabel = closestTshirtSize(average)
  }
  return { average, averageLabel, consensus, voteCount: votes.length }
}
