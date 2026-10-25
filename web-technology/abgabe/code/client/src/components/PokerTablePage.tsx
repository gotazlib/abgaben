// Seite mit dem Pokertisch einer Session. Benutzt von App.tsx, sobald eine Session aktiv ist.
// Tritt der Session beim Öffnen bei und verlässt sie beim Schliessen der Seite. Entscheidet,
// was angezeigt wird: «nicht gefunden», Fehler, Laden oder der Pokertisch (PokerRoom).
import { useContext, useEffect, useState } from 'react'
import { getErrorMessage, joinSession, leaveSession } from '../api/sessions.ts'
import { ErrorMessage } from './ErrorMessage.tsx'
import { LoadingIndicator } from './LoadingIndicator.tsx'
import { PokerRoom } from './PokerRoom.tsx'
import { SessionNotFound } from './SessionNotFound.tsx'
import { UserContext } from '../context/UserContext.ts'

type Props = {
  sessionId: string
  // Zurück zur Startseite (setzt den State in App zurück)
  onLeave: () => void
}

export function PokerTablePage({ sessionId, onLeave }: Props) {
  // Der Name ist hier immer gültig: Ohne gültigen Namen sind auf der Startseite
  // «Erstellen» und «Beitreten» gesperrt.
  const { name } = useContext(UserContext)

  const [participantId, setParticipantId] = useState<string | null>(null)
  const [notFound, setNotFound] = useState(false)
  const [joinError, setJoinError] = useState<string | null>(null)

  // Beitreten beim Öffnen der Seite (Mount), Verlassen im Cleanup beim Schliessen (Unmount).
  // Der Button «Verlassen» in PokerRoom ruft nur onLeave auf: App zeigt dann die Startseite,
  // diese Seite verschwindet, und das Cleanup schickt genau einen Leave-Request.
  useEffect(() => {
    // ignore-Flag wie in der React-Doku: Wurde der Effekt schon aufgeräumt, bevor die
    // Antwort kam, wird sie ignoriert. Das passiert im StrictMode, der den Effekt
    // in der Entwicklung zweimal startet.
    let ignore = false
    let joinedId: string | null = null

    async function join() {
      try {
        const newId = await joinSession(sessionId, name.trim())
        if (ignore) {
          // Dieser Teilnehmer wird nicht mehr gebraucht und geht gleich wieder,
          // sonst sässe er doppelt am Tisch
          if (newId !== null) {
            leaveSession(sessionId, newId).catch(() => {})
          }
          return
        }
        if (newId === null) {
          setNotFound(true)
          return
        }
        joinedId = newId
        setParticipantId(newId)
      } catch (error) {
        if (!ignore) {
          setJoinError(getErrorMessage(error))
        }
      }
    }

    join()

    return () => {
      ignore = true
      if (joinedId !== null) {
        // Verlassen ist auf dem Server idempotent. Schlägt es fehl, entfernt uns der
        // Heartbeat-Timeout trotzdem, darum wird der Fehler ignoriert.
        leaveSession(sessionId, joinedId).catch(() => {})
      }
    }
  }, [sessionId, name])

  function renderContent() {
    if (notFound) {
      return <SessionNotFound onBack={onLeave} />
    }
    if (joinError !== null) {
      return (
        <>
          <ErrorMessage message={joinError} />
          <button
            type="button"
            className="button button--secondary"
            onClick={onLeave}
          >
            Zurück zur Übersicht
          </button>
        </>
      )
    }
    if (participantId === null) {
      return <LoadingIndicator label="Trete der Session bei …" />
    }
    return (
      <PokerRoom
        sessionId={sessionId}
        participantId={participantId}
        onLeave={onLeave}
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
