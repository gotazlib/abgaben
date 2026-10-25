// Ein Platz am Tisch: kleine Karte und Name. Benutzt von PokerTable.
// Vor dem Aufdecken sieht man nur, OB jemand gewählt hat (Rückseite), nicht WAS.
import type { Participant } from '../types/poker.ts'
import './ParticipantSeat.css'

type Props = {
  participant: Participant
  isOwn: boolean
  revealed: boolean
}

export function ParticipantSeat({ participant, isOwn, revealed }: Props) {
  // Die eigene Stimme kennen wir schon vor dem Aufdecken, sie bleibt aber wie die anderen verdeckt
  let cardClass = 'seat__card seat__card--empty'
  let cardText = ''
  if (participant.hasVoted && !revealed) {
    cardClass = 'seat__card seat__card--covered'
  }
  // Nach dem Aufdecken schickt der Server alle Stimmen mit
  if (revealed && participant.vote !== null) {
    cardClass = 'seat__card seat__card--revealed'
    cardText = participant.vote
  }

  return (
    <li className={isOwn ? 'seat seat--own' : 'seat'}>
      <div className={cardClass}>{cardText}</div>
      <span className="seat__name">
        {participant.name}
        {isOwn && <span className="seat__badge">Du</span>}
      </span>
    </li>
  )
}
