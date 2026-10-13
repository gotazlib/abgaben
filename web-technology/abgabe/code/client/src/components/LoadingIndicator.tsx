// Ladeanzeige mit drehendem Kreis und Text, solange eine Anfrage an den Server läuft.
// Benutzt von der Home-Seite und vom Pokertisch. Styles in global.css.

interface LoadingIndicatorProps {
  label: string
}

export default function LoadingIndicator({ label }: LoadingIndicatorProps) {
  // role="status": Screenreader lesen den Text vor, ohne den Benutzer zu unterbrechen
  return (
    <p className="loading-indicator" role="status">
      <span className="loading-indicator__spinner" aria-hidden="true" />
      {label}
    </p>
  )
}
