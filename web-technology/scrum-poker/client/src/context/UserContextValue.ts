import { createContext } from 'react'

// This file only creates the context object. Provider (UserContext.tsx) and
// hook (useUser.ts) live in their own files, because React Fast Refresh
// works only for files that export nothing but components.

export const NAME_STORAGE_KEY = 'scrum-poker:name'

export interface UserContextValue {
  name: string
  setName: (name: string) => void
}

// undefined = no <UserProvider> above, useUser() reports that as an error
export const UserContext = createContext<UserContextValue | undefined>(undefined)
