import type { SessionSummary } from '@scrum-poker/shared'
import SessionListItem from './SessionListItem'
import './SessionList.css'

interface SessionListProps {
  sessions: SessionSummary[]
  canJoin: boolean
  onDeleted: () => void
}

export default function SessionList({ sessions, canJoin, onDeleted }: SessionListProps) {
  // Newest first. Copy before sorting, because sort() changes the array itself
  // and `sessions` belongs to the state of usePolling. ISO dates sort correctly as text.
  const sortedSessions = [...sessions].sort((a, b) => b.createdAt.localeCompare(a.createdAt))

  return (
    <ul className="session-list">
      {sortedSessions.map((session) => (
        <SessionListItem key={session.id} session={session} canJoin={canJoin} onDeleted={onDeleted} />
      ))}
    </ul>
  )
}
