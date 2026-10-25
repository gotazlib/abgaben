// Der Pokertisch eines beigetretenen Teilnehmers. Benutzt von PokerTablePage.
// Hält den Zustand des Tisches (Lifting State Up): lädt ihn per Polling vom Server,
// schickt die Aktionen (Karte, Deck, Aufdecken, Neue Runde) und gibt alles per Props weiter.
import { useEffect, useState } from 'react'
import type { CardValue, DeckType, SessionState } from '../types/poker.ts'
import {
  castVote,
  changeDeck,
  getErrorMessage,
  getSession,
  resetRound,
  revealCards,
} from '../api/sessions.ts'
import { CardDeck } from './CardDeck.tsx'
import { DeckSwitcher } from './DeckSwitcher.tsx'
import { ErrorMessage } from './ErrorMessage.tsx'
import { LoadingIndicator } from './LoadingIndicator.tsx'
import { PokerTable } from './PokerTable.tsx'
import { RoundResult } from './RoundResult.tsx'
import { SessionNotFound } from './SessionNotFound.tsx'
import './PokerRoom.css'

// Jeder Poll zählt auf dem Server als Heartbeat. Das Intervall muss darum deutlich
// unter dem Server-Timeout von 15 s liegen, sonst würden wir vom Tisch entfernt.
const POLL_INTERVAL_MS = 1500

type Props = {
  sessionId: string
  participantId: string
  onLeave: () => void
}

export function PokerRoom({ sessionId, participantId, onLeave }: Props) {
  // Der Server ist die einzige Quelle der Wahrheit: eigene Karte, Deck und
  // «aufgedeckt» werden alle aus `session` gelesen und nicht doppelt gespeichert.
  const [session, setSession] = useState<SessionState | null>(null)
  const [pollError, setPollError] = useState<string | null>(null)
  const [notFound, setNotFound] = useState(false)
  // true, solange eine Aktion dieses Benutzers beim Server läuft (Ladezustand)
  const [isBusy, setIsBusy] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)

  // Polling: sofort laden, dann alle 1.5 s. So sehen wir die Änderungen der anderen.
  useEffect(() => {
    let ignore = false

    async function loadSession() {
      try {
        const loadedSession = await getSession(sessionId, participantId)
        if (ignore) {
          return
        }
        if (loadedSession === null) {
          // Die Session wurde gelöscht: gleicher Fehlerzustand wie bei einer unbekannten ID.
          // Polling stoppen, sonst käme alle 1.5 s ein unnötiger Request mit 404.
          window.clearInterval(intervalId)
          setNotFound(true)
          return
        }
        setSession(loadedSession)
        setPollError(null)
      } catch (error) {
        if (!ignore) {
          // Der letzte bekannte Stand bleibt sichtbar, der nächste Poll versucht es wieder
          setPollError(getErrorMessage(error))
        }
      }
    }

    // Erst den Timer anlegen, dann sofort einmal laden: so kennt loadSession die intervalId
    const intervalId = window.setInterval(loadSession, POLL_INTERVAL_MS)
    loadSession()

    // Cleanup beim Verlassen: sonst liefe das Polling weiter und würde uns als
    // Teilnehmer am Leben halten; späte Antworten werden dank ignore verworfen.
    return () => {
      ignore = true
      window.clearInterval(intervalId)
    }
  }, [sessionId, participantId])

  // Führt eine Aktion aus (eine Funktion als Parameter, z. B. () => revealCards(sessionId))
  // und zeigt die Antwort des Servers sofort an, statt auf den nächsten Poll zu warten.
  // Ein Fehler wird zur Meldung, der Tisch bleibt bedienbar.
  async function runAction(action: () => Promise<SessionState>) {
    setIsBusy(true)
    setActionError(null)
    try {
      const newSession = await action()
      setSession(newSession)
    } catch (error) {
      setActionError(getErrorMessage(error))
    }
    setIsBusy(false)
  }

  if (notFound) {
    return <SessionNotFound onBack={onLeave} />
  }
  if (session === null) {
    // Noch keine Antwort da: entweder lädt es noch, oder der erste Poll ist fehlgeschlagen
    if (pollError !== null) {
      return <ErrorMessage message={pollError} />
    }
    return <LoadingIndicator label="Tisch wird geladen …" />
  }

  const me = session.participants.find(
    (participant) => participant.id === participantId,
  )
  if (me === undefined) {
    // Der Server hat uns entfernt, z. B. nach mehr als 15 s ohne Poll (Standby, kein Netz)
    return (
      <div role="alert">
        <h2>Du bist nicht mehr am Tisch</h2>
        <p>
          Die Verbindung war zu lange unterbrochen, darum wurdest du aus der
          Session entfernt.
        </p>
        <button type="button" className="button" onClick={onLeave}>
          Zurück zur Übersicht
        </button>
      </div>
    )
  }

  const myVote = me.vote
  const votedParticipants = session.participants.filter(
    (participant) => participant.hasVoted,
  )
  const voteCount = votedParticipants.length

  // Die Mitte des Tisches: vor dem Aufdecken der Stand, danach das Ergebnis
  let roundStatus = (
    <p>
      {voteCount} von {session.participants.length} haben gewählt
    </p>
  )
  if (session.revealed) {
    roundStatus = (
      <RoundResult participants={session.participants} deck={session.deck} />
    )
  }

  function handleCardClick(value: CardValue) {
    // Ein zweiter Klick auf die gewählte Karte zieht die Stimme zurück (null)
    let newVote: CardValue | null = value
    if (value === myVote) {
      newVote = null
    }
    runAction(() => castVote(sessionId, participantId, newVote))
  }

  function handleDeckChange(deck: DeckType) {
    runAction(() => changeDeck(sessionId, deck))
  }

  function handleReveal() {
    runAction(() => revealCards(sessionId))
  }

  function handleReset() {
    runAction(() => resetRound(sessionId))
  }

  return (
    <div className="poker-room">
      <div className="poker-room__toolbar">
        <DeckSwitcher
          deck={session.deck}
          disabled={isBusy}
          onChange={handleDeckChange}
        />
        {/* Wechselt nur die Ansicht: PokerTablePage verschwindet, und das Cleanup ihres
            Join-Effekts schickt den Leave-Request (genau einmal) */}
        <button
          type="button"
          className="button button--secondary"
          onClick={onLeave}
        >
          Verlassen
        </button>
      </div>

      {pollError !== null && (
        <ErrorMessage message={`${pollError} Neuer Versuch läuft …`} />
      )}
      {actionError !== null && <ErrorMessage message={actionError} />}

      <PokerTable
        participants={session.participants}
        ownId={participantId}
        revealed={session.revealed}
      >
        {roundStatus}
        {/* Ladezustand der Aktionen (F29): Buttons und Karten sind dann zusätzlich gesperrt */}
        {isBusy && <p>Wird gesendet …</p>}
        <div className="round-controls">
          {!session.revealed && (
            <button
              type="button"
              className="button"
              disabled={voteCount === 0 || isBusy}
              onClick={handleReveal}
            >
              Karten aufdecken
            </button>
          )}
          <button
            type="button"
            className="button button--secondary"
            disabled={isBusy}
            onClick={handleReset}
          >
            Neue Runde
          </button>
        </div>
      </PokerTable>

      <CardDeck
        deck={session.deck}
        selected={myVote}
        disabled={session.revealed || isBusy}
        onCardClick={handleCardClick}
      />
    </div>
  )
}
