import type { CardValue } from '@scrum-poker/shared'
import './PlayingCard.css'

interface PlayingCardProps {
  value: CardValue
  selected: boolean
  disabled: boolean
  onClick: () => void
}

// One card in the hand. A real <button>, so it works with keyboard and screen
// readers; aria-pressed tells them whether the card is the chosen one.
export default function PlayingCard({ value, selected, disabled, onClick }: PlayingCardProps) {
  return (
    <button
      type="button"
      className={selected ? 'playing-card playing-card--selected' : 'playing-card'}
      aria-pressed={selected}
      disabled={disabled}
      onClick={onClick}
    >
      {value}
    </button>
  )
}
