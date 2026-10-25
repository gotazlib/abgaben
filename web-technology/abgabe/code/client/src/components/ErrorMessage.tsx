// Rote Fehlermeldung. Benutzt von der Startseite und vom Pokertisch.
import './ErrorMessage.css'

type Props = {
  message: string
}

export function ErrorMessage({ message }: Props) {
  // role="alert": Screenreader lesen die Meldung vor, sobald sie erscheint
  return (
    <p className="error-message" role="alert">
      {message}
    </p>
  )
}
