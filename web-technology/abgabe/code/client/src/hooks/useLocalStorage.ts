// Custom Hook wie in der Hooks-Übung: ein Text-State, der bei jeder Änderung im
// localStorage gespeichert und beim Laden der Seite von dort gelesen wird.
// Benutzt von UserProvider.tsx für den Namen.

import { useState } from 'react'

type ReturnValue = {
  value: string
  setValue: (value: string) => void
}

export function useLocalStorage(key: string): ReturnValue {
  // Die Funktion in useState läuft nur beim ersten Render: localStorage wird nur einmal gelesen
  const [value, setStateValue] = useState(() => {
    const savedValue = localStorage.getItem(key)
    if (savedValue === null) {
      return ''
    }
    return savedValue
  })

  // Jede Änderung sofort speichern, damit der Wert auch nach einem Reload noch da ist
  function setValue(newValue: string) {
    setStateValue(newValue)
    localStorage.setItem(key, newValue)
  }

  return { value, setValue }
}
