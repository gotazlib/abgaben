import { computeResult, type DeckType, type Participant } from '@scrum-poker/shared'
import './RoundResult.css'

interface RoundResultProps {
  participants: Participant[]
  deck: DeckType
}

// Calculated from the revealed votes on every render. It is not kept in a
// state, because it would only be a copy of what the server already sends.
export default function RoundResult({ participants, deck }: RoundResultProps) {
  const votes = participants.map((participant) => participant.vote).filter((vote) => vote !== null)
  const result = computeResult(votes, deck)
  const skipped = votes.filter((vote) => vote === '?' || vote === '☕').length

  return (
    <div className="round-result">
      {result.consensus && (
        <p className="round-result__consensus">
          Konsens! Alle haben {votes[0]} gewählt.
        </p>
      )}
      <dl className="round-result__figures">
        <div>
          <dt>Durchschnitt</dt>
          <dd className="round-result__average">{result.averageLabel ?? '–'}</dd>
        </div>
        <div>
          <dt>Stimmen</dt>
          <dd>{result.voteCount}</dd>
        </div>
      </dl>
      {deck === 'tshirt' && result.average !== null && (
        <p className="round-result__note">
          Grössen als Zahlen (XS=1, S=2, M=3, L=5, XL=8): Durchschnitt {result.average}, die nächste
          Grösse ist {result.averageLabel}.
        </p>
      )}
      {result.average === null && result.voteCount > 0 && (
        <p className="round-result__note">Kein Durchschnitt: Es gibt keine Karte mit Zahlenwert.</p>
      )}
      {skipped > 0 && (
        <p className="round-result__note">
          {skipped} {skipped === 1 ? 'Stimme' : 'Stimmen'} mit «?» oder «☕» zählen nicht zum Durchschnitt.
        </p>
      )}
    </div>
  )
}
