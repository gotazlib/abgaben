// Auswahl des Decks (Fibonacci, T-Shirt). Benutzt von PokerRoom.
// Jeder am Tisch darf wechseln; das Deck ist Server-Zustand und gilt für alle.
import { DECK_TYPES, DECKS } from '../utils/poker.ts'
import type { DeckType } from '../types/poker.ts'
import type { ChangeEvent } from 'react'
import './DeckSwitcher.css'

type Props = {
  deck: DeckType
  disabled: boolean
  onChange: (deck: DeckType) => void
}

export function DeckSwitcher({ deck, disabled, onChange }: Props) {
  // onChange vom <select> kommt nur, wenn ein anderes Deck gewählt wurde
  function updateDeck(event: ChangeEvent<HTMLSelectElement>) {
    // event.target.value ist ein string. Wir suchen den passenden DeckType aus der Liste,
    // so weiss TypeScript, dass es wirklich ein Deck ist.
    for (const deckType of DECK_TYPES) {
      if (deckType === event.target.value) {
        onChange(deckType)
      }
    }
  }

  return (
    <div className="deck-switcher">
      <label htmlFor="deck-select" className="deck-switcher__label">
        Deck
      </label>
      <select
        id="deck-select"
        className="deck-switcher__select"
        value={deck}
        disabled={disabled}
        onChange={updateDeck}
      >
        {DECK_TYPES.map((deckType) => (
          <option key={deckType} value={deckType}>
            {DECKS[deckType].label}
          </option>
        ))}
      </select>
      <p className="deck-switcher__hint">
        Ein Wechsel startet für alle eine neue Runde.
      </p>
    </div>
  )
}
