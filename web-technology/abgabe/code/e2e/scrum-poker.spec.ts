import { expect, test, type Page } from '@playwright/test'
import type { SessionState } from '@scrum-poker/shared'

// Collects everything the browser console reports as error or warning
// (React warnings, uncaught exceptions, ...). Every test expects it to be empty.
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

// The browser itself logs every HTTP error answer ("Failed to load resource: ...
// 404"). In the error tests these answers are expected, so only they are ignored.
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
  // Two contexts = two independent browsers (own localStorage)
  const anna = await (await browser.newContext()).newPage()
  const ben = await (await browser.newContext()).newPage()
  const annaProblems = collectConsoleProblems(anna)
  const benProblems = collectConsoleProblems(ben)

  // Anna creates a session and lands at the table
  await enterName(anna, 'Anna')
  await anna.getByRole('button', { name: 'Neue Session erstellen' }).click()
  await expect(anna).toHaveURL(/\/sessions\/\w+$/)
  const sessionUrl = anna.url()
  const sessionId = sessionUrl.split('/').pop()
  await expect(seatOf(anna, 'Anna')).toContainText('Du')

  // Ben opens the shared link in a new browser without a name
  await ben.goto(sessionUrl)
  await ben.getByLabel('Name').fill('Ben')
  await ben.getByRole('button', { name: 'Beitreten' }).click()
  await expect(seatOf(ben, 'Ben')).toContainText('Du')
  await expect(seatOf(anna, 'Ben')).toBeVisible()

  // Anna votes: Ben only sees that she has voted, not her card
  await anna.getByRole('button', { name: '5', exact: true }).click()
  await expect(seatOf(ben, 'Anna')).toContainText('hat gewählt')
  const poll = await ben.waitForResponse(
    (response) => response.url().includes(`/api/sessions/${sessionId}?`) && response.request().method() === 'GET',
  )
  const stateForBen = (await poll.json()) as SessionState
  const annaForBen = stateForBen.participants.find((participant) => participant.name === 'Anna')
  expect(annaForBen).toMatchObject({ hasVoted: true, vote: null })

  // Ben votes the same card: everybody has voted, so the cards are revealed for both
  await ben.getByRole('button', { name: '5', exact: true }).click()
  for (const page of [anna, ben]) {
    await expect(page.getByText('Konsens! Alle haben 5 gewählt.')).toBeVisible()
    await expect(seatOf(page, 'Anna')).toContainText('Karte 5')
  }

  // New round, then Ben switches to T-shirt sizes, which reaches Anna via the server
  await anna.getByRole('button', { name: 'Neue Runde' }).click()
  await expect(ben.getByText('0 von 2 haben gewählt')).toBeVisible()
  await ben.getByRole('button', { name: 'T-Shirt' }).click()
  await expect(anna.getByRole('button', { name: 'XL', exact: true })).toBeVisible()

  // A reload in the middle of a round keeps Ben at the table as the same person:
  // no second "Ben", and the round is not revealed although Ben is the only one missing
  await anna.getByRole('button', { name: 'L', exact: true }).click()
  await expect(ben.getByText('1 von 2 haben gewählt')).toBeVisible()
  await ben.reload()
  await expect(seatOf(ben, 'Ben')).toContainText('Du')
  await expect(seatOf(anna, 'Ben')).toHaveCount(1)
  await expect(anna.getByText('1 von 2 haben gewählt')).toBeVisible()
  await expect(seatOf(anna, 'Anna')).toContainText('hat gewählt')

  // Revealing by hand before everybody voted, also visible for the other person
  await ben.getByRole('button', { name: 'Karten aufdecken' }).click()
  await expect(seatOf(anna, 'Anna')).toContainText('Karte L')
  await expect(anna.locator('.round-result__average')).toHaveText('L')

  // Leaving navigates home and lowers the number of participants
  await ben.getByRole('button', { name: 'Verlassen' }).click()
  await expect(ben).toHaveURL(/\/$/)
  await expect(ben.getByLabel('Dein Name')).toHaveValue('Ben')
  await expect(ben.getByText(`Session ${sessionId}`)).toBeVisible()
  await expect(ben.getByText('1 Person')).toBeVisible()

  // Joining from the list and going back with the browser button also leaves
  await ben.getByRole('button', { name: 'Beitreten' }).click()
  await expect(seatOf(anna, 'Ben')).toHaveCount(1)
  await ben.goBack()
  await expect(seatOf(anna, 'Ben')).toHaveCount(0)

  // Deleting the session while Anna sits at the table shows her a message
  ben.on('dialog', (dialog) => void dialog.accept())
  await ben.getByRole('button', { name: 'Löschen' }).click()
  await expect(ben.getByText('Noch keine offenen Sessions')).toBeVisible()
  await expect(anna.getByText('Diese Session existiert nicht (mehr)')).toBeVisible()

  // The 404 of Anna's last poll is expected, nothing else may appear
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

  // Closing the tab sends no request. Ben stops polling, so the server removes
  // him after PARTICIPANT_TIMEOUT_MS (15 s) plus at most one cleanup interval (5 s).
  await ben.close({ runBeforeUnload: true })
  await expect(seatOf(anna, 'Ben')).toHaveCount(0, { timeout: 25_000 })
})

test('shows errors instead of an empty page', async ({ page }) => {
  const problems = collectConsoleProblems(page)

  // Invalid name: visible message, creating is not possible
  await enterName(page, '   ')
  await expect(page.getByText('Bitte gib deinen Namen ein.')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Neue Session erstellen' })).toBeDisabled()

  // Unknown session
  await enterName(page, 'Anna')
  await page.goto('/sessions/unknown')
  await expect(page.getByText('Diese Session existiert nicht (mehr)')).toBeVisible()

  // Unknown address
  await page.goto('/does/not/exist')
  await expect(page.getByRole('heading', { name: 'Seite nicht gefunden' })).toBeVisible()

  // Server not reachable: every API request fails. A function and not '**/api/**',
  // because that pattern would also block the module /src/api/client.ts
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
