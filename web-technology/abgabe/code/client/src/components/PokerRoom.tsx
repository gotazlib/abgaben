// Der Pokertisch eines beigetretenen Teilnehmers. Benutzt von SessionPage.
// Hält den Zustand des Tisches (Lifting State Up): lädt ihn per Polling vom Server,
// schickt die Aktionen (Karte, Deck, Aufdecken, Neue Runde) und gibt alles per Props weiter.
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { CardValue, DeckType, SessionState } from '@scrum-poker/shared'
import { castVote, changeDeck, getErrorMessage, getSession, resetRound, revealCards } from '../api'
import CardDeck from './CardDeck'
import DeckSwitcher from './DeckSwitcher'
import ErrorMessage from './ErrorMessage'
import LoadingIndicator from './LoadingIndicator'
import PokerTable from './PokerTable'
import RoundResult from './RoundResult'
import SessionNotFound from './SessionNotFound'
import ShareLinkButton from './ShareLinkButton'

// Jeder Poll zählt auf dem Server als Heartbeat. Das Intervall muss darum deutlich
// unter dem Server-Timeout von 15 s liegen, sonst würden wir vom Tisch entfernt.
const POLL_INTERVAL_MS = 1500

interface PokerRoomProps {
  sessionId: string
  participantId: string
  onRejoin: () => void
}

export default function PokerRoom({ sessionId, participantId, onRejoin }: PokerRoomProps) {
  const navigate = useNavigate()

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
          clearInterval(intervalId)
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
    const intervalId = setInterval(loadSession, POLL_INTERVAL_MS)
    loadSession()

    // Cleanup beim Verlassen: sonst liefe das Polling weiter und würde uns als
    // Teilnehmer am Leben halten; späte Antworten werden dank ignore verworfen.
    return () => {
      ignore = true
      clearInterval(intervalId)
    }
  }, [sessionId, participantId])

  // Schickt eine Aktion und zeigt die Antwort des Servers sofort an, statt auf den
  // nächsten Poll zu warten. Ein Fehler wird zur Meldung, der Tisch bleibt bedienbar.
  // Der Request läuft schon, wenn runAction ihn bekommt (z. B. runAction(revealCards(…))).
  async function runAction(request: Promise<SessionState>) {
    setIsBusy(true)
    setActionError(null)
    try {
      const newSession = await request
      setSession(newSession)
    } catch (error) {
      setActionError(getErrorMessage(error))
    }
    setIsBusy(false)
  }

  if (notFound) {
    return <SessionNotFound />
  }
  if (session === null) {
    // Noch keine Antwort da: entweder lädt es noch, oder der erste Poll ist fehlgeschlagen
    if (pollError !== null) {
      return <ErrorMessage message={pollError} />
    }
    return <LoadingIndicator label="Tisch wird geladen …" />
  }

  const me = session.participants.find((participant) => participant.id === participantId)
  if (me === undefined) {
    // Der Server hat uns entfernt, z. B. nach mehr als 15 s ohne Poll (Standby, kein Netz)
    return (
      <div role="alert">
        <h2>Du bist nicht mehr am Tisch</h2>
        <p>Die Verbindung war zu lange unterbrochen, darum wurdest du aus der Session entfernt.</p>
        <button type="button" className="button" onClick={onRejoin}>
          Wieder beitreten
        </button>
      </div>
    )
  }

  const myVote = me.vote
  const votedParticipants = session.participants.filter((participant) => participant.hasVoted)
  const voteCount = votedParticipants.length

  // Die Mitte des Tisches: vor dem Aufdecken der Stand, danach das Ergebnis
  let roundStatus = (
    <p>
      {voteCount} von {session.participants.length} haben gewählt
    </p>
  )
  if (session.revealed) {
    roundStatus = <RoundResult participants={session.participants} deck={session.deck} />
  }

  function handleCardClick(value: CardValue) {
    // Ein zweiter Klick auf die gewählte Karte zieht die Stimme zurück (null)
    let newVote: CardValue | null = value
    if (value === myVote) {
      newVote = null
    }
    runAction(castVote(sessionId, participantId, newVote))
  }

  function handleDeckChange(deck: DeckType) {
    runAction(changeDeck(sessionId, deck))
  }

  function handleReveal() {
    runAction(revealCards(sessionId))
  }

  function handleReset() {
    runAction(resetRound(sessionId))
  }

  // aria-busy: sagt Screenreadern, dass gerade eine Aktion läuft (Karten sind dann ausgegraut)
  return (
    <div className="poker-room" aria-busy={isBusy}>
      <div className="poker-room__toolbar">
        <DeckSwitcher deck={session.deck} disabled={isBusy} onChange={handleDeckChange} />
        <div className="poker-room__actions">
          <ShareLinkButton />
          {/* Navigiert nur: SessionPage verschwindet, und das Cleanup ihres
              Join-Effekts schickt den Leave-Request (genau einmal) */}
          <button type="button" className="button button--secondary" onClick={() => navigate('/')}>
            Verlassen
          </button>
        </div>
      </div>

      {pollError !== null && <ErrorMessage message={`${pollError} Neuer Versuch läuft …`} />}
      {actionError !== null && <ErrorMessage message={actionError} />}

      <PokerTable participants={session.participants} ownId={participantId} revealed={session.revealed}>
        {roundStatus}
        {/* Ladezustand der Aktionen (F29): Buttons und Karten sind dann zusätzlich gesperrt */}
        {isBusy && <p>Wird gesendet …</p>}
        <div className="round-controls">
          {!session.revealed && (
            <button type="button" className="button" disabled={voteCount === 0 || isBusy} onClick={handleReveal}>
              Karten aufdecken
            </button>
          )}
          <button type="button" className="button button--secondary" disabled={isBusy} onClick={handleReset}>
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
