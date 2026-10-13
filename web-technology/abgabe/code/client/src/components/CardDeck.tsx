// Die eigenen Handkarten unten am Tisch. Benutzt von PokerRoom.
// Hat keinen eigenen State: Welche Karte gewählt ist, kommt per Props vom Server-Zustand.
import { DECKS, type CardValue, type DeckType } from '@scrum-poker/shared'

interface CardDeckProps {
  deck: DeckType
  // Eigene Stimme, null = keine Karte gewählt
  selected: CardValue | null
  disabled: boolean
  onCardClick: (value: CardValue) => void
}

export default function CardDeck({ deck, selected, disabled, onCardClick }: CardDeckProps) {
  return (
    <section className="card-deck" aria-labelledby="card-deck-title">
      <h2 id="card-deck-title" className="card-deck__title">
        Deine Karten
      </h2>
      <div className="card-deck__cards">
        {DECKS[deck].cards.map((value) => (
          // Ein echter <button>: geht mit Tastatur und Screenreader.
          // aria-pressed sagt, ob es die gewählte Karte ist.
          <button
            key={value}
            type="button"
            className={value === selected ? 'playing-card playing-card--selected' : 'playing-card'}
            aria-pressed={value === selected}
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
