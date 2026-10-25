// Startpunkt der React-App (aus der Projektvorlage): hängt die App in das <div id="root">
// von index.html.

// index.css zuerst: Die Styles der Komponenten kommen danach und gewinnen bei gleich
// starken Regeln (z. B. macht SessionListItem.css den Button «Löschen» rot).
import './index.css'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './components/App.tsx'
import { UserProvider } from './components/UserProvider.tsx'

// StrictMode führt Effekte in der Entwicklung absichtlich zweimal aus. So fällt
// sofort auf, wenn ein useEffect kein korrektes Cleanup hat.
// Der UserProvider liegt um die App, damit jede Komponente den Namen lesen kann.
// Das ! sagt TypeScript: Das <div id="root"> gibt es sicher (es steht in index.html).
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <UserProvider>
      <App />
    </UserProvider>
  </StrictMode>,
)
