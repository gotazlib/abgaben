import { expect, test, type Page } from '@playwright/test'
import type { SessionState } from '@scrum-poker/shared'

// End-to-End-Tests (Playwright) im echten Browser gegen den echten Server. Nachweis für den
// ganzen Ablauf: zwei Personen am Tisch, Reload, Verlassen, Löschen, Fehlerfälle, Responsive.

// Sammelt alles, was die Browser-Konsole als Fehler oder Warnung meldet
// (React-Warnungen, unbehandelte Exceptions, …). Jeder Test erwartet eine leere Liste.
function collectConsoleProblems(page: Page): string[] {
  const problems: string[] = []
  page.on('console', (message) => {
    if (message.type() === 'error' || message.type() === 'warning') {
      problems.push(message.text())
    }
  })
  page.on('pageerror', (error) => problems.push(error.message))
  return problems
}

// Der Browser meldet jede HTTP-Fehlerantwort selbst («Failed to load resource: …
// 404»). In den Fehler-Tests sind diese Antworten erwartet, darum werden nur sie ignoriert.
function withoutFailedRequests(problems: string[]): string[] {
  return problems.filter((problem) => !problem.startsWith('Failed to load resource'))
}

function seatOf(page: Page, name: string) {
  return page.getByRole('region', { name: 'Pokertisch' }).getByRole('listitem').filter({ hasText: name })
}

async function enterName(page: Page, name: string) {
  await page.goto('/')
  await page.getByLabel('Dein Name').fill(name)
}

test('two people estimate together', async ({ browser }) => {
  // Zwei Kontexte = zwei unabhängige Browser (je eigener localStorage)
  const anna = await (await browser.newContext()).newPage()
  const ben = await (await browser.newContext()).newPage()
  const annaProblems = collectConsoleProblems(anna)
  const benProblems = collectConsoleProblems(ben)

  // Anna erstellt eine Session und landet am Tisch
  await enterName(anna, 'Anna')
  await anna.getByRole('button', { name: 'Neue Session erstellen' }).click()
  await expect(anna).toHaveURL(/\/sessions\/\w+$/)
  const sessionUrl = anna.url()
  const sessionId = sessionUrl.split('/').pop()
  await expect(seatOf(anna, 'Anna')).toContainText('Du')

  // Ben öffnet den geteilten Link in einem neuen Browser ohne Namen
  await ben.goto(sessionUrl)
  await ben.getByLabel('Name').fill('Ben')
  await ben.getByRole('button', { name: 'Beitreten' }).click()
  await expect(seatOf(ben, 'Ben')).toContainText('Du')
  await expect(seatOf(anna, 'Ben')).toBeVisible()

  // Anna wählt: Ben sieht nur, dass sie gewählt hat, nicht ihre Karte
  await anna.getByRole('button', { name: '5', exact: true }).click()
  await expect(seatOf(ben, 'Anna')).toContainText('hat gewählt')
  const poll = await ben.waitForResponse(
    (response) => response.url().includes(`/api/sessions/${sessionId}?`) && response.request().method() === 'GET',
  )
  const stateForBen = (await poll.json()) as SessionState
  const annaForBen = stateForBen.participants.find((participant) => participant.name === 'Anna')
  expect(annaForBen).toMatchObject({ hasVoted: true, vote: null })

  // Ben wählt dieselbe Karte: alle haben gewählt, also wird für beide aufgedeckt
  await ben.getByRole('button', { name: '5', exact: true }).click()
  for (const page of [anna, ben]) {
    await expect(page.getByText('Konsens! Alle haben 5 gewählt.')).toBeVisible()
    await expect(seatOf(page, 'Anna')).toContainText('Karte 5')
  }

  // Neue Runde, dann wechselt Ben auf T-Shirt-Grössen; Anna sieht es über den Server
  await anna.getByRole('button', { name: 'Neue Runde' }).click()
  await expect(ben.getByText('0 von 2 haben gewählt')).toBeVisible()
  await ben.getByRole('button', { name: 'T-Shirt' }).click()
  await expect(anna.getByRole('button', { name: 'XL', exact: true })).toBeVisible()

  // Ein Reload mitten in der Runde lässt Ben als dieselbe Person am Tisch: kein zweiter
  // «Ben», und die Runde wird nicht aufgedeckt, obwohl nur noch Ben fehlt
  await anna.getByRole('button', { name: 'L', exact: true }).click()
  await expect(ben.getByText('1 von 2 haben gewählt')).toBeVisible()
  await ben.reload()
  await expect(seatOf(ben, 'Ben')).toContainText('Du')
  await expect(seatOf(anna, 'Ben')).toHaveCount(1)
  await expect(anna.getByText('1 von 2 haben gewählt')).toBeVisible()
  await expect(seatOf(anna, 'Anna')).toContainText('hat gewählt')

  // Von Hand aufdecken, bevor alle gewählt haben; auch die andere Person sieht es
  await ben.getByRole('button', { name: 'Karten aufdecken' }).click()
  await expect(seatOf(anna, 'Anna')).toContainText('Karte L')
  await expect(anna.locator('.round-result__average')).toHaveText('L')

  // Verlassen führt nach Home und senkt die Teilnehmerzahl
  await ben.getByRole('button', { name: 'Verlassen' }).click()
  await expect(ben).toHaveURL(/\/$/)
  await expect(ben.getByLabel('Dein Name')).toHaveValue('Ben')
  await expect(ben.getByText(`Session ${sessionId}`)).toBeVisible()
  await expect(ben.getByText('1 Person')).toBeVisible()

  // Beitreten aus der Liste und Zurück-Button des Browsers verlässt ebenfalls
  await ben.getByRole('button', { name: 'Beitreten' }).click()
  await expect(seatOf(anna, 'Ben')).toHaveCount(1)
  await ben.goBack()
  await expect(seatOf(anna, 'Ben')).toHaveCount(0)

  // Wird die Session gelöscht, während Anna am Tisch sitzt, sieht sie eine Meldung
  ben.on('dialog', (dialog) => void dialog.accept())
  await ben.getByRole('button', { name: 'Löschen' }).click()
  await expect(ben.getByText('Noch keine offenen Sessions')).toBeVisible()
  await expect(anna.getByText('Diese Session existiert nicht (mehr)')).toBeVisible()

  // Der 404 von Annas letztem Poll ist erwartet, sonst darf nichts erscheinen
  expect(withoutFailedRequests(annaProblems)).toEqual([])
  expect(benProblems).toEqual([])
})

test('closing the tab removes the participant after the heartbeat timeout', async ({ browser }) => {
  const anna = await (await browser.newContext()).newPage()
  const ben = await (await browser.newContext()).newPage()

  await enterName(anna, 'Anna')
  await anna.getByRole('button', { name: 'Neue Session erstellen' }).click()
  await expect(anna).toHaveURL(/\/sessions\/\w+$/)
  await enterName(ben, 'Ben')
  await ben.goto(anna.url())
  await expect(seatOf(anna, 'Ben')).toBeVisible()

  // Das Schliessen des Tabs schickt keinen Request. Ben pollt nicht mehr, darum entfernt ihn
  // der Server nach PARTICIPANT_TIMEOUT_MS (15 s) plus höchstens einem Aufräum-Intervall (5 s).
  await ben.close({ runBeforeUnload: true })
  await expect(seatOf(anna, 'Ben')).toHaveCount(0, { timeout: 25_000 })
})

test('shows errors instead of an empty page', async ({ page }) => {
  const problems = collectConsoleProblems(page)

  // Ungültiger Name: sichtbare Meldung, Erstellen nicht möglich
  await enterName(page, '   ')
  await expect(page.getByText('Bitte gib deinen Namen ein.')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Neue Session erstellen' })).toBeDisabled()

  // Unbekannte Session
  await enterName(page, 'Anna')
  await page.goto('/sessions/unknown')
  await expect(page.getByText('Diese Session existiert nicht (mehr)')).toBeVisible()

  // Unbekannte Adresse
  await page.goto('/does/not/exist')
  await expect(page.getByRole('heading', { name: 'Seite nicht gefunden' })).toBeVisible()

  // Server nicht erreichbar: jede API-Anfrage schlägt fehl. Geprüft wird der Pfad
  // (beginnt mit /api/), damit die Quelldatei /src/api.ts weiter geladen wird.
  await page.route((url) => url.pathname.startsWith('/api/'), (route) => route.abort())
  await page.goto('/')
  await expect(page.getByText(/Server nicht erreichbar/)).toBeVisible()
  await page.getByRole('button', { name: 'Neue Session erstellen' }).click()
  await expect(page.getByText(/Session konnte nicht erstellt werden/)).toBeVisible()

  expect(withoutFailedRequests(problems)).toEqual([])
})

for (const width of [360, 768, 1280]) {
  test(`no horizontal scrolling at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 800 })
    await enterName(page, 'Anna')
    const hasHorizontalScroll = () =>
      page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)
    expect(await hasHorizontalScroll()).toBe(false)

    await page.getByRole('button', { name: 'Neue Session erstellen' }).click()
    await page.getByRole('button', { name: '13', exact: true }).click()
    await expect(seatOf(page, 'Anna')).toContainText('Karte 13')
    expect(await hasHorizontalScroll()).toBe(false)
  })
}
