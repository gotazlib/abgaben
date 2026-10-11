import type { Participant } from '@scrum-poker/shared'
import './ParticipantSeat.css'

interface ParticipantSeatProps {
  participant: Participant
  isOwn: boolean
  revealed: boolean
}

// Text for screen readers, because the card itself is only decoration
function describeStatus(participant: Participant, revealed: boolean): string {
  if (!participant.hasVoted) {
    return revealed ? 'hat nicht gewählt' : 'wählt noch'
  }
  return revealed ? `Karte ${participant.vote}` : 'hat gewählt'
}

export default function ParticipantSeat({ participant, isOwn, revealed }: ParticipantSeatProps) {
  return (
    <li className={isOwn ? 'seat seat--own' : 'seat'}>
      <div className="seat__card" aria-hidden="true">
        {participant.hasVoted ? (
          // Two faces on top of each other. Revealing turns the card around (see CSS).
          <div className={revealed ? 'seat__flip seat__flip--revealed' : 'seat__flip'}>
            <div className="seat__face seat__face--back" />
            {/* Our own vote is known before the reveal, but stays covered like the others */}
            <div className="seat__face seat__face--front">{revealed ? participant.vote : ''}</div>
          </div>
        ) : (
          <div className="seat__empty" />
        )}
      </div>
      <span className="seat__name">
        {participant.name}
        {isOwn && <span className="seat__badge">Du</span>}
      </span>
      <span className="visually-hidden">{describeStatus(participant, revealed)}</span>
    </li>
  )
}
