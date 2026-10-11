import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { ApiError, getSession, joinSession, leaveSession } from '../api/client'
import ErrorMessage from '../components/ErrorMessage'
import LoadingIndicator from '../components/LoadingIndicator'
import SessionNameForm from '../components/SessionNameForm'
import PokerRoom from '../components/PokerRoom'
import SessionNotFound from '../components/SessionNotFound'
import { useUser } from '../context/useUser'
import { validateName } from '../utils/validateName'

// sessionStorage belongs to one tab: it survives a reload, but not closing the
// tab, and a second tab gets its own participant.
function participantStorageKey(sessionId: string): string {
  return `scrum-poker:participant:${sessionId}`
}

// Continues as the saved participant if the server still knows them,
// otherwise joins as a new participant. Returns the participantId.
async function resumeOrJoin(sessionId: string, savedId: string | null, name: string): Promise<string> {
  if (savedId) {
    // Polling with the id also counts as heartbeat, so the seat is kept
    const session = await getSession(sessionId, savedId)
    if (session.participants.some((participant) => participant.id === savedId)) {
      return savedId
    }
  }
  const { participantId } = await joinSession(sessionId, name)
  return participantId
}

export default function SessionPage() {
  const { sessionId = '' } = useParams()
  const { name } = useUser()

  // A shared link opened in a new browser has no name yet: then we ask for it
  // first instead of joining with an empty name.
  const trimmedName = name.trim()
  const hasName = validateName(name) === null

  const [participantId, setParticipantId] = useState<string | null>(null)
  const [joinError, setJoinError] = useState<Error | null>(null)
  // Increasing this number runs the join effect again ("Erneut versuchen", "Wieder beitreten")
  const [joinAttempt, setJoinAttempt] = useState(0)

  // Join when the page opens, leave when it closes (navigating away, leave button
  // in PokerRoom). Leaving only here guarantees exactly one leave request.
  useEffect(() => {
    if (!hasName) return

    // A reload does not unmount React, so the cleanup below does not run and we
    // are still at the table on the server. The id saved in sessionStorage lets
    // the reloaded page continue as the same participant (same seat, same vote).
    const storageKey = participantStorageKey(sessionId)
    const savedId = sessionStorage.getItem(storageKey)

    // StrictMode mounts, unmounts and mounts again in development, so this
    // effect starts two joins. The flag tells each join whether its effect
    // was cleaned up in the meantime. If so, a newly created participant is
    // no longer needed and leaves at once: no duplicate, no orphan. The saved
    // participant stays, because the second mount continues with it.
    let cancelled = false
    let joinedId: string | null = null

    resumeOrJoin(sessionId, savedId, trimmedName)
      .then((id) => {
        if (cancelled) {
          if (id !== savedId) {
            void leaveSession(sessionId, id).catch(() => {})
          }
          return
        }
        joinedId = id
        sessionStorage.setItem(storageKey, id)
        setParticipantId(id)
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setJoinError(err instanceof Error ? err : new Error(String(err)))
        }
      })

    return () => {
      cancelled = true
      if (joinedId) {
        // Leaving is idempotent on the server (always 204). If it fails, the
        // heartbeat timeout removes us anyway, so the error can be ignored.
        void leaveSession(sessionId, joinedId).catch(() => {})
        sessionStorage.removeItem(storageKey)
      }
      setParticipantId(null)
      setJoinError(null)
    }
  }, [sessionId, trimmedName, hasName, joinAttempt])

  function renderContent() {
    if (!hasName) {
      return <SessionNameForm />
    }
    if (joinError instanceof ApiError && joinError.status === 404) {
      return <SessionNotFound />
    }
    if (joinError) {
      return <ErrorMessage message={joinError.message} onRetry={() => setJoinAttempt((n) => n + 1)} />
    }
    if (!participantId) {
      return <LoadingIndicator label="Trete der Session bei …" />
    }
    // key: a new participant (after rejoining) starts with a fresh poker room
    return (
      <PokerRoom
        key={participantId}
        sessionId={sessionId}
        participantId={participantId}
        onRejoin={() => setJoinAttempt((n) => n + 1)}
      />
    )
  }

  return (
    <section>
      <h1>Session {sessionId}</h1>
      {renderContent()}
    </section>
  )
}
