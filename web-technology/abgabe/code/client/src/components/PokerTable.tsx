// Der Tisch mit den Plätzen aller Teilnehmer. Benutzt von PokerRoom.
// Die Hälfte sitzt oben, die andere Hälfte unten; was in der Mitte steht
// (Stand, Ergebnis, Buttons), gibt PokerRoom als children mit.
import type { ReactNode } from 'react'
import type { Participant } from '../types/poker.ts'
import { ParticipantSeat } from './ParticipantSeat.tsx'
import './PokerTable.css'

type Props = {
  participants: Participant[]
  ownId: string
  revealed: boolean
  children: ReactNode
}

export function PokerTable({ participants, ownId, revealed, children }: Props) {
  // Bei ungerader Anzahl sitzt oben eine Person mehr
  const half = Math.ceil(participants.length / 2)
  const topRow = participants.slice(0, half)
  const bottomRow = participants.slice(half)

  return (
    <section className="poker-table">
      <ul className="poker-table__seats">
        {topRow.map((participant) => (
          <ParticipantSeat
            key={participant.id}
            participant={participant}
            isOwn={participant.id === ownId}
            revealed={revealed}
          />
        ))}
      </ul>
      <div className="poker-table__felt">{children}</div>
      {/* Bei nur einer Person bleibt die untere Reihe leer und wird gar nicht gezeigt */}
      {bottomRow.length > 0 && (
        <ul className="poker-table__seats">
          {bottomRow.map((participant) => (
            <ParticipantSeat
              key={participant.id}
              participant={participant}
              isOwn={participant.id === ownId}
              revealed={revealed}
            />
          ))}
        </ul>
      )}
    </section>
  )
}
