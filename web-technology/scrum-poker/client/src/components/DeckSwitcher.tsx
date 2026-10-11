import { DECKS, type DeckType } from '@scrum-poker/shared'
import './DeckSwitcher.css'

interface DeckSwitcherProps {
  deck: DeckType
  disabled: boolean
  onChange: (deck: DeckType) => void
}

// Object.keys() returns string[], so we list the deck types ourselves
const DECK_TYPES: DeckType[] = ['fibonacci', 'tshirt']

export default function DeckSwitcher({ deck, disabled, onChange }: DeckSwitcherProps) {
  return (
    <fieldset className="deck-switcher">
      <legend className="deck-switcher__legend">Deck</legend>
      <div className="deck-switcher__options">
        {DECK_TYPES.map((type) => (
          <button
            key={type}
            type="button"
            className="deck-switcher__option"
            aria-pressed={type === deck}
            disabled={disabled}
            onClick={() => {
              if (type !== deck) onChange(type)
            }}
          >
            {DECKS[type].label}
          </button>
        ))}
      </div>
      <p className="deck-switcher__hint">Ein Wechsel startet für alle eine neue Runde.</p>
    </fieldset>
  )
}
