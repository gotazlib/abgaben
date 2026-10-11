// Checks request bodies. A body comes from outside and can contain anything,
// so it arrives here as `unknown` and is only typed after it was checked.

import {
  DECKS,
  MAX_NAME_LENGTH,
  type CastVoteRequest,
  type ChangeDeckRequest,
  type DeckType,
  type JoinSessionRequest,
} from '@scrum-poker/shared'

export type ValidationResult<T> = { ok: true; value: T } | { ok: false; error: string }

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isDeckType(value: unknown): value is DeckType {
  // Object.hasOwn instead of `in`: `'toString' in DECKS` would be true as well
  return typeof value === 'string' && Object.hasOwn(DECKS, value)
}

export function validateJoinBody(body: unknown): ValidationResult<JoinSessionRequest> {
  if (!isObject(body) || typeof body.name !== 'string') {
    return { ok: false, error: 'Name fehlt.' }
  }
  const name = body.name.trim()
  if (name === '') {
    return { ok: false, error: 'Name darf nicht leer sein.' }
  }
  if (name.length > MAX_NAME_LENGTH) {
    return { ok: false, error: `Name darf höchstens ${MAX_NAME_LENGTH} Zeichen lang sein.` }
  }
  return { ok: true, value: { name } }
}

export function validateVoteBody(body: unknown, deck: DeckType): ValidationResult<CastVoteRequest> {
  if (!isObject(body) || !('value' in body)) {
    return { ok: false, error: 'Wert fehlt.' }
  }
  const { value } = body
  if (value === null) {
    return { ok: true, value: { value: null } }
  }
  if (typeof value !== 'string' || !DECKS[deck].cards.includes(value)) {
    return { ok: false, error: 'Diese Karte gibt es im aktuellen Deck nicht.' }
  }
  return { ok: true, value: { value } }
}

export function validateDeckBody(body: unknown): ValidationResult<ChangeDeckRequest> {
  if (!isObject(body) || !isDeckType(body.deck)) {
    return { ok: false, error: 'Unbekanntes Deck.' }
  }
  return { ok: true, value: { deck: body.deck } }
}
