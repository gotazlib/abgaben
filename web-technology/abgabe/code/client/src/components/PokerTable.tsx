import type { ReactNode } from 'react'
import type { Participant } from '@scrum-poker/shared'
import ParticipantSeat from './ParticipantSeat'
import './PokerTable.css'

interface PokerTableProps {
  participants: Participant[]
  ownId: string
  revealed: boolean
  // Shown in the middle of the table (status, result, buttons)
  children: ReactNode
}

export default function PokerTable({ participants, ownId, revealed, children }: PokerTableProps) {
  // Half of the people sit above the table, the other half below it
  const half = Math.ceil(participants.length / 2)

  function renderSeats(seated: Participant[]) {
    return seated.map((participant) => (
      <ParticipantSeat
        key={participant.id}
        participant={participant}
        isOwn={participant.id === ownId}
        revealed={revealed}
      />
    ))
  }

  return (
    <section className="poker-table" aria-label="Pokertisch">
      <ul className="poker-table__seats">{renderSeats(participants.slice(0, half))}</ul>
      <div className="poker-table__felt">{children}</div>
      <ul className="poker-table__seats">{renderSeats(participants.slice(half))}</ul>
    </section>
  )
}
