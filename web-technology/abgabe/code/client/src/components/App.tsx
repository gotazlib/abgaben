// Wurzelkomponente (wie in der Projektvorlage): Kopfzeile und darunter entweder die
// Startseite oder der Pokertisch. Benutzt von main.tsx.

import { useState } from 'react'
import { HomePage } from './HomePage.tsx'
import { PokerTablePage } from './PokerTablePage.tsx'
import './App.css'

export function App() {
  // Ansichtswechsel mit State: null = Startseite, sonst die ID der Session am Tisch
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null)

  function leaveSession() {
    setActiveSessionId(null)
  }

  let page = <HomePage onJoin={setActiveSessionId} />
  if (activeSessionId !== null) {
    page = <PokerTablePage sessionId={activeSessionId} onLeave={leaveSession} />
  }

  return (
    <>
      <header className="app-header">
        <p className="app-title">Scrum Poker</p>
      </header>
      <main className="layout">{page}</main>
    </>
  )
}
