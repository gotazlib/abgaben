// Ladeanzeige als Text, solange eine Anfrage an den Server läuft.
// Benutzt von der Startseite und vom Pokertisch.
import './LoadingIndicator.css'

type Props = {
  label: string
}

export function LoadingIndicator({ label }: Props) {
  // role="status": Screenreader lesen den Text vor, ohne den Benutzer zu unterbrechen
  return (
    <p className="loading-indicator" role="status">
      {label}
    </p>
  )
}
