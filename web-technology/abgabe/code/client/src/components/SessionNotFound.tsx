// Meldung für eine unbekannte oder gelöschte Session. Benutzt von PokerTablePage (Beitreten
// schlägt fehl) und PokerRoom (Session während des Pollings gelöscht): gleicher Fehlerzustand.
import './SessionNotFound.css'

type Props = {
  onBack: () => void
}

export function SessionNotFound({ onBack }: Props) {
  return (
    <div className="session-not-found" role="alert">
      <h2>Diese Session existiert nicht (mehr)</h2>
      <p>Vielleicht wurde sie gerade gelöscht.</p>
      <button
        type="button"
        className="button button--secondary"
        onClick={onBack}
      >
        Zurück zur Übersicht
      </button>
    </div>
  )
}
