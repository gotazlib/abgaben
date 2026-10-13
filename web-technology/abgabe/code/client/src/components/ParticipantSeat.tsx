// Ein Platz am Tisch: kleine Karte und Name. Benutzt von PokerTable.
// Vor dem Aufdecken sieht man nur, OB jemand gewählt hat (Rückseite), nicht WAS.
import type { Participant } from '@scrum-poker/shared'

interface ParticipantSeatProps {
  participant: Participant
  isOwn: boolean
  revealed: boolean
}

// Text für Screenreader, denn die Karte selbst ist nur Dekoration
function describeStatus(participant: Participant, revealed: boolean): string {
  if (!participant.hasVoted && !revealed) {
    return 'wählt noch'
  }
  if (!participant.hasVoted) {
    return 'hat nicht gewählt'
  }
  if (!revealed) {
    return 'hat gewählt'
  }
  return `Karte ${participant.vote}`
}

export default function ParticipantSeat({ participant, isOwn, revealed }: ParticipantSeatProps) {
  // Die eigene Stimme kennen wir schon vor dem Aufdecken, sie bleibt aber wie die anderen verdeckt
  let cardClass = 'seat__card seat__card--empty'
  let cardText = ''
  if (participant.hasVoted && !revealed) {
    cardClass = 'seat__card seat__card--covered'
  }
  if (participant.hasVoted && revealed) {
    cardClass = 'seat__card seat__card--revealed'
    cardText = participant.vote ?? ''
  }

  return (
    <li className={isOwn ? 'seat seat--own' : 'seat'}>
      <div className={cardClass} aria-hidden="true">
        {cardText}
      </div>
      <span className="seat__name">
        {participant.name}
        {isOwn && <span className="seat__badge">Du</span>}
      </span>
      <span className="visually-hidden">{describeStatus(participant, revealed)}</span>
    </li>
  )
}
