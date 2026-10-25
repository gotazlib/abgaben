// Context für den Namen des Benutzers. Der UserProvider (UserProvider.tsx) füllt ihn,
// HomePage und PokerTablePage lesen den Namen mit useContext(UserContext).

import { createContext } from 'react'

type UserContextValue = {
  name: string
  setName: (name: string) => void
}

// Der Startwert gilt nur ohne UserProvider darüber (kommt in der App nicht vor)
export const UserContext = createContext<UserContextValue>({
  name: '',
  setName: () => {},
})
