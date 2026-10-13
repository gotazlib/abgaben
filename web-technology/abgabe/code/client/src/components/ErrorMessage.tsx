// Rote Fehlermeldung, optional mit Button «Erneut versuchen».
// Benutzt von der Home-Seite und vom Pokertisch. Styles in global.css.

interface ErrorMessageProps {
  message: string
  onRetry?: () => void
}

export default function ErrorMessage({ message, onRetry }: ErrorMessageProps) {
  // role="alert": Screenreader lesen die Meldung vor, sobald sie erscheint
  return (
    <div className="error-message" role="alert">
      <p className="error-message__text">{message}</p>
      {onRetry !== undefined && (
        <button type="button" className="error-message__retry" onClick={onRetry}>
          Erneut versuchen
        </button>
      )}
    </div>
  )
}
