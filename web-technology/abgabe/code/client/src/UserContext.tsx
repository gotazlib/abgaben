// Context für den Namen des Benutzers. main.tsx legt den UserProvider um die ganze App,
// HomePage und SessionPage lesen den Namen mit useContext(UserContext).
// Der Name wird im localStorage gespeichert und ist nach einem Reload wieder da.

import { createContext, useState, type ReactNode } from 'react'

const NAME_STORAGE_KEY = 'scrum-poker:name'

interface UserContextValue {
  name: string
  setName: (name: string) => void
}

// Der Startwert gilt nur ohne UserProvider darüber (kommt in der App nicht vor)
// eslint-disable-next-line react-refresh/only-export-components -- der Context ist keine Komponente, gehört aber zum Provider in diese Datei
export const UserContext = createContext<UserContextValue>({ name: '', setName: () => {} })

interface UserProviderProps {
  children: ReactNode
}

export function UserProvider({ children }: UserProviderProps) {
  // Die Funktion in useState läuft nur beim ersten Render: localStorage wird nur einmal gelesen
  const [name, setNameState] = useState(() => localStorage.getItem(NAME_STORAGE_KEY) ?? '')

  // Jede Änderung sofort speichern, damit der Name auch nach einem Reload noch da ist
  function setName(newName: string) {
    setNameState(newName)
    localStorage.setItem(NAME_STORAGE_KEY, newName)
  }

  // Seit React 19 ist der Context selbst der Provider (kein <UserContext.Provider> mehr nötig)
  return <UserContext value={{ name, setName }}>{children}</UserContext>
}
