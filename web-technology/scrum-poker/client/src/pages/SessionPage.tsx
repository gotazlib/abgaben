import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { ApiError, joinSession, leaveSession } from '../api/client'
import ErrorMessage from '../components/ErrorMessage'
import LoadingIndicator from '../components/LoadingIndicator'
import SessionNameForm from '../components/SessionNameForm'
import PokerRoom from '../components/PokerRoom'
import SessionNotFound from '../components/SessionNotFound'
import { useUser } from '../context/useUser'
import { validateName } from '../utils/validateName'

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

    // StrictMode mounts, unmounts and mounts again in development, so this
    // effect starts two joins. The flag tells each join whether its effect
    // was cleaned up in the meantime. If so, the participant it created is
    // no longer needed and leaves at once: no duplicate, no orphan.
    let cancelled = false
    let joinedId: string | null = null

    // Closing or reloading the tab does not unmount any component, so the
    // cleanup below would not run and we would stay at the table as a ghost
    // until the heartbeat timeout. 'pagehide' fires in exactly these cases.
    function leave() {
      if (joinedId) {
        // Leaving is idempotent on the server (always 204). If it fails, the
        // heartbeat timeout removes us anyway, so the error can be ignored.
        void leaveSession(sessionId, joinedId).catch(() => {})
        joinedId = null
      }
    }
    window.addEventListener('pagehide', leave)

    joinSession(sessionId, trimmedName)
      .then((response) => {
        if (cancelled) {
          void leaveSession(sessionId, response.participantId).catch(() => {})
          return
        }
        joinedId = response.participantId
        setParticipantId(response.participantId)
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setJoinError(err instanceof Error ? err : new Error(String(err)))
        }
      })

    return () => {
      cancelled = true
      window.removeEventListener('pagehide', leave)
      leave()
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
