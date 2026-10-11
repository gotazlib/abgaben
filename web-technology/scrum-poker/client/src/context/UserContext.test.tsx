import { act, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { UserProvider } from './UserContext'
import { NAME_STORAGE_KEY } from './UserContextValue'
import { useUser } from './useUser'

function NameDisplay() {
  const { name, setName } = useUser()
  return (
    <>
      <p>Name: {name}</p>
      <button onClick={() => setName('Ben')}>Change</button>
    </>
  )
}

describe('UserContext', () => {
  it('reads the initial name from localStorage', () => {
    localStorage.setItem(NAME_STORAGE_KEY, 'Anna')

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
    expect(localStorage.getItem(NAME_STORAGE_KEY)).toBe('Ben')
  })

  it('throws a clear error outside of the provider', () => {
    // React logs the thrown error to the console; silence it for this test
    const originalError = console.error
    console.error = () => {}
    try {
      expect(() => render(<NameDisplay />)).toThrow('useUser() must be used inside <UserProvider>.')
    } finally {
      console.error = originalError
    }
  })
})
