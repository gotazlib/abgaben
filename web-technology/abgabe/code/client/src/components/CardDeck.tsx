// Die eigenen Handkarten unten am Tisch. Benutzt von PokerRoom.
// Hat keinen eigenen State: Welche Karte gewählt ist, kommt per Props vom Server-Zustand.
import { DECKS } from '../utils/poker.ts'
import type { CardValue, DeckType } from '../types/poker.ts'
import './CardDeck.css'

type Props = {
  deck: DeckType
  // Eigene Stimme, null = keine Karte gewählt
  selected: CardValue | null
  disabled: boolean
  onCardClick: (value: CardValue) => void
}

export function CardDeck({ deck, selected, disabled, onCardClick }: Props) {
  return (
    <section className="card-deck">
      <h2 className="card-deck__title">Deine Karten</h2>
      <div className="card-deck__cards">
        {DECKS[deck].cards.map((value) => (
          // Ein echter <button>: geht auch mit der Tastatur
          <button
            key={value}
            type="button"
            className={
              value === selected
                ? 'playing-card playing-card--selected'
                : 'playing-card'
            }
            disabled={disabled}
            onClick={() => onCardClick(value)}
          >
            {value}
          </button>
        ))}
      </div>
    </section>
  )
}
