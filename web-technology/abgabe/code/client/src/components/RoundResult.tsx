// Ergebnis nach dem Aufdecken: Durchschnitt, Anzahl Stimmen, Konsens. Benutzt von PokerRoom.
// Wird bei jedem Rendern aus den aufgedeckten Stimmen berechnet und nicht in einem State
// gehalten, denn es wäre nur eine Kopie dessen, was der Server schon schickt (T13).
import { computeResult } from '../utils/poker.ts'
import type { CardValue, DeckType, Participant } from '../types/poker.ts'
import './RoundResult.css'

type Props = {
  participants: Participant[]
  deck: DeckType
}

export function RoundResult({ participants, deck }: Props) {
  // Stimmen einsammeln; wer nicht gewählt hat, zählt nicht
  const votes: CardValue[] = []
  let skippedCount = 0
  for (const participant of participants) {
    if (participant.vote !== null) {
      votes.push(participant.vote)
      if (participant.vote === '?' || participant.vote === '☕') {
        skippedCount = skippedCount + 1
      }
    }
  }
  const result = computeResult(votes, deck)

  // Ohne Karte mit Zahlenwert gibt es keinen Durchschnitt, dann zeigen wir einen Strich
  let averageText = '–'
  if (result.averageLabel !== null) {
    averageText = result.averageLabel
  }

  let skippedText = skippedCount + ' Stimmen mit «?» oder «☕» zählen'
  if (skippedCount === 1) {
    skippedText = '1 Stimme mit «?» oder «☕» zählt'
  }

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
          <dd className="round-result__average">{averageText}</dd>
        </div>
        <div>
          <dt>Stimmen</dt>
          <dd>{result.voteCount}</dd>
        </div>
      </dl>
      {deck === 'tshirt' && result.average !== null && (
        <p className="round-result__note">
          Grössen als Zahlen (XS=1, S=2, M=3, L=5, XL=8): Durchschnitt{' '}
          {result.average}, die nächste Grösse ist {result.averageLabel}.
        </p>
      )}
      {result.average === null && result.voteCount > 0 && (
        <p className="round-result__note">
          Kein Durchschnitt: Es gibt keine Karte mit Zahlenwert.
        </p>
      )}
      {skippedCount > 0 && (
        <p className="round-result__note">
          {skippedText} nicht zum Durchschnitt.
        </p>
      )}
    </div>
  )
}
