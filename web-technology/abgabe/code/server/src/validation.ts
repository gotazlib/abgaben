// Prüft die Request-Bodies, bevor eine Route den Store ändert. Benutzt von routes/sessions.ts.
// Ein Body kommt von aussen und kann alles enthalten (auch Unsinn per curl), darum ist er hier
// `unknown` und wird Schritt für Schritt mit typeof geprüft.
// Jede Funktion gibt die Fehlermeldung zurück, oder null, wenn der Body in Ordnung ist.

import { DECKS, DECK_TYPES, validateName, type DeckType } from '@scrum-poker/shared'

// Erwartet { name: string, participantId?: string | null }
export function getJoinError(body: unknown): string | null {
  if (typeof body !== 'object' || body === null || !('name' in body)) {
    return 'Name fehlt.'
  }
  if (typeof body.name !== 'string') {
    return 'Name muss ein Text sein.'
  }
  // Gleiche Regel wie im Client, darum dieselbe Funktion aus shared
  const nameError = validateName(body.name)
  if (nameError !== null) {
    return nameError
  }
  // participantId ist freiwillig (nur nach einem Reload dabei)
  if ('participantId' in body) {
    const participantId = body.participantId
    if (participantId !== null && typeof participantId !== 'string') {
      return 'participantId muss ein Text sein.'
    }
  }
  return null
}

// Erwartet { value: string | null }, und die Karte muss im aktuellen Deck vorkommen
export function getVoteError(body: unknown, deck: DeckType): string | null {
  if (typeof body !== 'object' || body === null || !('value' in body)) {
    return 'Wert fehlt.'
  }
  // null zieht die Stimme zurück und ist erlaubt
  if (body.value === null) {
    return null
  }
  if (typeof body.value !== 'string' || !DECKS[deck].cards.includes(body.value)) {
    return 'Diese Karte gibt es im aktuellen Deck nicht.'
  }
  return null
}

// Erwartet { deck: 'fibonacci' | 'tshirt' }
export function getDeckError(body: unknown): string | null {
  if (typeof body !== 'object' || body === null || !('deck' in body)) {
    return 'Deck fehlt.'
  }
  for (const deckType of DECK_TYPES) {
    if (body.deck === deckType) {
      return null
    }
  }
  return 'Unbekanntes Deck.'
}
