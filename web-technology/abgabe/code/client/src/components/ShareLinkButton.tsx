// Button «Link kopieren» in der Werkzeugleiste des Tisches. Benutzt von PokerRoom.
// Kopiert die aktuelle Adresse, damit andere über den Link direkt beitreten können.
import { useEffect, useState } from 'react'

export default function ShareLinkButton() {
  const [copied, setCopied] = useState(false)

  // Die Rückmeldung «Kopiert!» nach zwei Sekunden wieder ausblenden.
  // Cleanup: Wird der Button vorher entfernt, darf der Timer nicht mehr feuern.
  useEffect(() => {
    if (!copied) {
      return
    }
    const timeoutId = setTimeout(() => setCopied(false), 2000)
    return () => clearTimeout(timeoutId)
  }, [copied])

  async function handleClick() {
    // Nur gelesen, nicht zum Navigieren (dafür gibt es useNavigate und Link)
    const url = window.location.href
    try {
      // navigator.clipboard gibt es nur unter https oder auf localhost
      await navigator.clipboard.writeText(url)
      setCopied(true)
    } catch {
      // Notlösung: den Link anzeigen, damit man ihn von Hand kopieren kann
      window.prompt('Link zum Kopieren:', url)
    }
  }

  return (
    <button type="button" className="button button--secondary" onClick={handleClick}>
      {/* aria-live: Screenreader hören die Rückmeldung auch */}
      <span aria-live="polite">{copied ? 'Kopiert!' : 'Link kopieren'}</span>
    </button>
  )
}
