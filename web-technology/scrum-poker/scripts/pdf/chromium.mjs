// Startet Headless-Chromium für render.mjs (PDF) und mermaid-png.mjs (Word-Datei).

import { existsSync, readdirSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'
import { chromium } from 'playwright-core'

// Nimmt den Chromium von `npx playwright install chromium`. Passt dessen Version
// nicht genau zu playwright-core, wird der neuste vorhandene Chromium verwendet
// (zuerst die Headless-Shell, sie ist für page.pdf() am robustesten).
// CHROMIUM_PATH überschreibt beides.
function findChromium() {
  if (process.env.CHROMIUM_PATH) return process.env.CHROMIUM_PATH
  const cache = process.env.PLAYWRIGHT_BROWSERS_PATH ?? join(homedir(), '.cache/ms-playwright')
  if (!existsSync(cache)) return undefined
  const revision = (name) => Number(name.split('-').at(-1))
  const dirs = readdirSync(cache)
  const shells = dirs.filter((name) => /^chromium_headless_shell-\d+$/.test(name)).sort((a, b) => revision(b) - revision(a))
  const browsers = dirs.filter((name) => /^chromium-\d+$/.test(name)).sort((a, b) => revision(b) - revision(a))
  const binaries = [
    'chrome-headless-shell-linux64/chrome-headless-shell',
    'chrome-headless-shell-mac-arm64/chrome-headless-shell',
    'chrome-headless-shell-mac-x64/chrome-headless-shell',
    'chrome-headless-shell-win64/chrome-headless-shell.exe',
    'chrome-linux64/chrome',
    'chrome-linux/chrome',
    'chrome-win64/chrome.exe',
  ]
  for (const name of [...shells, ...browsers]) {
    for (const binary of binaries) {
      const path = join(cache, name, binary)
      if (existsSync(path)) return path
    }
  }
  return undefined
}

// Robuste Startoptionen, auch in Containern und VMs ohne GPU
const args = ['--disable-gpu', '--disable-dev-shm-usage']

export async function launchChromium() {
  try {
    return await chromium.launch({ args })
  } catch {
    const executablePath = findChromium()
    if (!executablePath) {
      console.error('Kein Chromium gefunden. Bitte zuerst: npx playwright install --with-deps chromium')
      process.exit(1)
    }
    return chromium.launch({ executablePath, args })
  }
}
