// Umschalter zwischen den Decks (Fibonacci, T-Shirt). Benutzt von PokerRoom.
// Jeder am Tisch darf wechseln; das Deck ist Server-Zustand und gilt für alle.
import { DECKS, DECK_TYPES, type DeckType } from '@scrum-poker/shared'

interface DeckSwitcherProps {
  deck: DeckType
  disabled: boolean
  onChange: (deck: DeckType) => void
}

export default function DeckSwitcher({ deck, disabled, onChange }: DeckSwitcherProps) {
  function handleClick(deckType: DeckType) {
    // Ein Klick auf das aktuelle Deck würde die Runde unnötig zurücksetzen
    if (deckType !== deck) {
      onChange(deckType)
    }
  }

  return (
    <fieldset className="deck-switcher">
      <legend className="deck-switcher__legend">Deck</legend>
      <div className="deck-switcher__options">
        {DECK_TYPES.map((deckType) => (
          <button
            key={deckType}
            type="button"
            className="deck-switcher__option"
            aria-pressed={deckType === deck}
            disabled={disabled}
            onClick={() => handleClick(deckType)}
          >
            {DECKS[deckType].label}
          </button>
        ))}
      </div>
      <p className="deck-switcher__hint">Ein Wechsel startet für alle eine neue Runde.</p>
    </fieldset>
  )
}
