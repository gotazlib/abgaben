import { DECKS, type CardValue, type DeckType } from '@scrum-poker/shared'
import PlayingCard from './PlayingCard'
import './CardDeck.css'

interface CardDeckProps {
  deck: DeckType
  // Own vote, null = no card chosen
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
          <PlayingCard
            key={value}
            value={value}
            selected={value === selected}
            disabled={disabled}
            onClick={() => onCardClick(value)}
          />
        ))}
      </div>
    </section>
  )
}
