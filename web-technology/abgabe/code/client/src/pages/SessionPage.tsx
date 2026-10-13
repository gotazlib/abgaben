// Seite /sessions/:sessionId (Route in App.tsx). Tritt der Session beim Öffnen bei und
// verlässt sie beim Schliessen der Seite. Entscheidet, was angezeigt wird: Namensformular,
// «nicht gefunden», Fehler, Laden oder der Pokertisch (PokerRoom).
import { useContext, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { validateName } from '@scrum-poker/shared'
import { getErrorMessage, joinSession, leaveSession } from '../api'
import ErrorMessage from '../components/ErrorMessage'
import LoadingIndicator from '../components/LoadingIndicator'
import PokerRoom from '../components/PokerRoom'
import SessionNameForm from '../components/SessionNameForm'
import SessionNotFound from '../components/SessionNotFound'
import { UserContext } from '../UserContext'
import './SessionPage.css'

export default function SessionPage() {
  const { sessionId = '' } = useParams()
  const { name } = useContext(UserContext)

  // Wer einen geteilten Link in einem neuen Browser öffnet, hat noch keinen Namen.
  // Dann fragen wir zuerst danach, statt mit leerem Namen beizutreten.
  const hasName = validateName(name) === null
  const trimmedName = name.trim()

  const [participantId, setParticipantId] = useState<string | null>(null)
  const [notFound, setNotFound] = useState(false)
  const [joinError, setJoinError] = useState<string | null>(null)
  // Hochzählen startet den Join-Effekt neu («Erneut versuchen», «Wieder beitreten»)
  const [joinAttempt, setJoinAttempt] = useState(0)

  // Beitreten beim Öffnen der Seite, Verlassen im Cleanup beim Schliessen
  // (wegnavigieren, Button «Verlassen» in PokerRoom). Nur hier wird verlassen,
  // darum geht genau ein Leave-Request an den Server.
  useEffect(() => {
    if (!hasName) {
      return
    }

    // sessionStorage gehört zu einem Tab: Es überlebt einen Reload, aber nicht das
    // Schliessen des Tabs. Ein Reload ruft kein Cleanup auf, wir sitzen also auf dem
    // Server noch am Tisch. Mit der gespeicherten ID setzt der Server uns fort
    // (gleicher Platz, gleiche Stimme), statt einen zweiten Teilnehmer anzulegen (F28).
    const storageKey = `scrum-poker:participant:${sessionId}`
    const savedId = sessionStorage.getItem(storageKey)

    // ignore-Flag wie in der React-Doku: Wurde der Effekt schon aufgeräumt, bevor die
    // Antwort kam, wird sie ignoriert. Das passiert z. B. im StrictMode, der den Effekt
    // in der Entwicklung zweimal startet.
    let ignore = false
    let joinedId: string | null = null

    async function join() {
      try {
        const newId = await joinSession(sessionId, trimmedName, savedId)
        if (ignore) {
          // Ein neu angelegter Teilnehmer wird nicht mehr gebraucht und geht gleich
          // wieder, sonst sässe er doppelt am Tisch. Ein fortgesetzter bleibt sitzen,
          // denn der zweite Effekt macht mit ihm weiter.
          if (newId !== null && newId !== savedId) {
            leaveSession(sessionId, newId).catch(() => {})
          }
          return
        }
        if (newId === null) {
          setNotFound(true)
          return
        }
        joinedId = newId
        sessionStorage.setItem(storageKey, newId)
        setParticipantId(newId)
      } catch (error) {
        if (!ignore) {
          setJoinError(getErrorMessage(error))
        }
      }
    }

    join()

    // Cleanup: läuft beim Verlassen der Seite und bevor der Effekt neu startet
    return () => {
      ignore = true
      if (joinedId !== null) {
        // Verlassen ist auf dem Server idempotent. Schlägt es fehl, entfernt uns der
        // Heartbeat-Timeout trotzdem, darum wird der Fehler ignoriert.
        leaveSession(sessionId, joinedId).catch(() => {})
        sessionStorage.removeItem(storageKey)
      }
      setParticipantId(null)
      setNotFound(false)
      setJoinError(null)
    }
  }, [sessionId, trimmedName, hasName, joinAttempt])

  function joinAgain() {
    setJoinAttempt(joinAttempt + 1)
  }

  function renderContent() {
    if (!hasName) {
      return <SessionNameForm />
    }
    if (notFound) {
      return <SessionNotFound />
    }
    if (joinError !== null) {
      return <ErrorMessage message={joinError} onRetry={joinAgain} />
    }
    if (participantId === null) {
      return <LoadingIndicator label="Trete der Session bei …" />
    }
    // key: Nach einem neuen Beitritt (neue ID) startet PokerRoom mit leerem State
    return <PokerRoom key={participantId} sessionId={sessionId} participantId={participantId} onRejoin={joinAgain} />
  }

  return (
    <section>
      <h1>Session {sessionId}</h1>
      {renderContent()}
    </section>
  )
}
