import { useEffect, useState, type ReactNode } from 'react'
import { NAME_STORAGE_KEY, UserContext } from './UserContextValue'

interface UserProviderProps {
  children: ReactNode
}

export function UserProvider({ children }: UserProviderProps) {
  // Lazy initial state: localStorage is read only on the first render
  const [name, setName] = useState(() => localStorage.getItem(NAME_STORAGE_KEY) ?? '')

  useEffect(() => {
    localStorage.setItem(NAME_STORAGE_KEY, name)
  }, [name])

  // Since React 19 the context itself is the provider (<UserContext.Provider> is no longer needed)
  return <UserContext value={{ name, setName }}>{children}</UserContext>
}
