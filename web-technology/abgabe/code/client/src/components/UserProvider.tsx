// Stellt den Namen für die ganze App bereit. main.tsx legt den UserProvider um die App.
// Der Name wird im localStorage gespeichert und ist nach einem Reload wieder da.

import type { ReactNode } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage.ts'
import { UserContext } from '../context/UserContext.ts'

type Props = {
  children: ReactNode
}

export function UserProvider({ children }: Props) {
  const nameStorage = useLocalStorage('scrum-poker:name')

  // Seit React 19 ist der Context selbst der Provider (kein <UserContext.Provider> mehr nötig)
  return (
    <UserContext
      value={{ name: nameStorage.value, setName: nameStorage.setValue }}
    >
      {children}
    </UserContext>
  )
}
