import { useEffect, useState } from 'react'

export default function ShareLinkButton() {
  const [copied, setCopied] = useState(false)

  // Hide the "Kopiert!" feedback again after two seconds
  useEffect(() => {
    if (!copied) return
    const timeoutId = setTimeout(() => setCopied(false), 2000)
    return () => clearTimeout(timeoutId)
  }, [copied])

  async function handleClick() {
    const url = window.location.href
    try {
      // navigator.clipboard only exists on https or localhost
      await navigator.clipboard.writeText(url)
      setCopied(true)
    } catch {
      // Fallback: show the link so that it can be copied by hand
      window.prompt('Link zum Kopieren:', url)
    }
  }

  return (
    <button type="button" className="button button--secondary" onClick={() => void handleClick()}>
      {/* aria-live: screen readers also hear the feedback */}
      <span aria-live="polite">{copied ? 'Kopiert!' : 'Link kopieren'}</span>
    </button>
  )
}
