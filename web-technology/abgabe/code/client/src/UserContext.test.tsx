// Tests für UserContext.tsx: Der Name kommt aus dem localStorage und wird dort sofort gespeichert.

import { act, render, screen } from '@testing-library/react'
import { useContext } from 'react'
import { describe, expect, it } from 'vitest'
import { UserContext, UserProvider } from './UserContext'

// Kleine Testkomponente, die den Namen aus dem Context anzeigt und ändert
function NameDisplay() {
  const { name, setName } = useContext(UserContext)
  return (
    <>
      <p>Name: {name}</p>
      <button onClick={() => setName('Ben')}>Change</button>
    </>
  )
}

describe('UserContext', () => {
  it('reads the initial name from localStorage', () => {
    localStorage.setItem('scrum-poker:name', 'Anna')

    render(
      <UserProvider>
        <NameDisplay />
      </UserProvider>,
    )

    expect(screen.getByText('Name: Anna')).toBeInTheDocument()
  })

  it('writes a changed name to localStorage', () => {
    render(
      <UserProvider>
        <NameDisplay />
      </UserProvider>,
    )

    act(() => {
      screen.getByRole('button', { name: 'Change' }).click()
    })

    expect(screen.getByText('Name: Ben')).toBeInTheDocument()
    expect(localStorage.getItem('scrum-poker:name')).toBe('Ben')
  })
})
