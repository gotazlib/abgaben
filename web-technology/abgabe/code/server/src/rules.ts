// Regeln, die der Server prüft: welche Karten es pro Deck gibt und wie ein Name aussehen darf.
// Gleiche Regeln wie im Client (client/src/utils/poker.ts). Wer hier etwas ändert,
// muss es dort auch tun.

import type { CardValue, DeckType } from './types.ts'

// Karten pro Deck, für die Prüfung einer Stimme
export const DECK_CARDS: { fibonacci: CardValue[]; tshirt: CardValue[] } = {
  fibonacci: ['0', '1', '2', '3', '5', '8', '13', '21', '?', '☕'],
  tshirt: ['XS', 'S', 'M', 'L', 'XL', '?'],
}

export const DECK_TYPES: DeckType[] = ['fibonacci', 'tshirt']

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
