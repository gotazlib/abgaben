import { useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { CardValue, DeckType, SessionState } from '@scrum-poker/shared'
import { ApiError, castVote, changeDeck, getSession, resetRound, revealCards } from '../api/client'
import { POLL_INTERVAL_MS } from '../config'
import { usePolling } from '../hooks/usePolling'
import CardDeck from './CardDeck'
import DeckSwitcher from './DeckSwitcher'
import ErrorMessage from './ErrorMessage'
import LoadingIndicator from './LoadingIndicator'
import PokerTable from './PokerTable'
import RoundControls from './RoundControls'
import RoundResult from './RoundResult'
import SessionNotFound from './SessionNotFound'
import ShareLinkButton from './ShareLinkButton'
import './PokerRoom.css'

interface PokerRoomProps {
  sessionId: string
  participantId: string
  onRejoin: () => void
}

type Action = 'vote' | 'deck' | 'reveal' | 'reset'

// The poker table of one joined participant. The server state is the single
// source of truth: own card, deck and "revealed" are all read from `session`.
export default function PokerRoom({ sessionId, participantId, onRejoin }: PokerRoomProps) {
  // useCallback keeps the function identity, otherwise usePolling would restart on every render
  const fetchSession = useCallback(
    (signal: AbortSignal) => getSession(sessionId, participantId, signal),
    [sessionId, participantId],
  )
  // Every poll with our participantId is also our heartbeat for the server
  const { data: session, error, setData } = usePolling(fetchSession, POLL_INTERVAL_MS)
  const navigate = useNavigate()

  // Which action is waiting for the server (for the loading state of the buttons)
  const [pendingAction, setPendingAction] = useState<Action | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  // Sends an action and shows the returned state right away instead of
  // waiting for the next poll. Errors never escape: they become a message.
  async function runAction(action: Action, send: () => Promise<SessionState>) {
    setPendingAction(action)
    setActionError(null)
    try {
      setData(await send())
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Aktion fehlgeschlagen.')
    } finally {
      setPendingAction(null)
    }
  }

  if (error instanceof ApiError && error.status === 404) {
    return <SessionNotFound />
  }
  if (!session) {
    // Before the first answer: still loading, or the first poll failed
    return error ? <ErrorMessage message={error.message} /> : <LoadingIndicator label="Tisch wird geladen …" />
  }

  const me = session.participants.find((participant) => participant.id === participantId)
  if (!me) {
    // The server removed us, e.g. after more than 15 s without polling (sleep mode, no network)
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
  const busy = pendingAction !== null
  const voteCount = session.participants.filter((participant) => participant.hasVoted).length

  function handleCardClick(value: CardValue) {
    // Clicking the chosen card again takes the vote back
    const newVote = value === myVote ? null : value
    void runAction('vote', () => castVote(sessionId, participantId, newVote))
  }

  function handleDeckChange(deck: DeckType) {
    void runAction('deck', () => changeDeck(sessionId, deck))
  }

  // aria-busy: tells screen readers that an action is being sent (the cards are greyed out meanwhile)
  return (
    <div className="poker-room" aria-busy={busy}>
      <div className="poker-room__toolbar">
        <DeckSwitcher deck={session.deck} disabled={busy} onChange={handleDeckChange} />
        <div className="poker-room__actions">
          <ShareLinkButton />
          {/* Only navigates: SessionPage unmounts, and the cleanup of its
              join effect sends the leave request (exactly once) */}
          <button type="button" className="button button--secondary" onClick={() => navigate('/')}>
            Verlassen
          </button>
        </div>
      </div>
      {/* The last known state stays visible, polling simply tries again */}
      {error && <ErrorMessage message={`${error.message} Neuer Versuch läuft …`} />}
      {actionError && <ErrorMessage message={actionError} />}

      <PokerTable participants={session.participants} ownId={participantId} revealed={session.revealed}>
        {session.revealed ? (
          <RoundResult participants={session.participants} deck={session.deck} />
        ) : (
          <p>
            {voteCount} von {session.participants.length} haben gewählt
          </p>
        )}
        <RoundControls
          revealed={session.revealed}
          canReveal={voteCount > 0}
          busy={busy}
          revealing={pendingAction === 'reveal'}
          resetting={pendingAction === 'reset'}
          onReveal={() => void runAction('reveal', () => revealCards(sessionId))}
          onReset={() => void runAction('reset', () => resetRound(sessionId))}
        />
      </PokerTable>

      <CardDeck
        deck={session.deck}
        selected={myVote}
        disabled={session.revealed || busy}
        onCardClick={handleCardClick}
      />
    </div>
  )
}
