// Startpunkt der React-App: hängt die App in das <div id="root"> von index.html.

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
// Zuerst die globalen Styles, danach die der Seiten (über App). Bei gleich starken
// Regeln gewinnt die spätere, so kann z. B. HomePage.css den Button «Löschen» rot machen.
import './styles/global.css'
import App from './App'
import { UserProvider } from './UserContext'

// StrictMode führt Effekte in der Entwicklung absichtlich zweimal aus. So fällt
// sofort auf, wenn ein useEffect kein korrektes Cleanup hat.
// Der UserProvider liegt um den Router, damit jede Seite den Namen lesen kann.
// Das ! sagt TypeScript: Das <div id="root"> gibt es sicher (es steht in index.html).
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <UserProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </UserProvider>
  </StrictMode>,
)
