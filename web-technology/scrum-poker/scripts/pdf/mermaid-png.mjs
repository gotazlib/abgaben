// Rendert alle Mermaid-Diagramme einer Markdown-Datei als PNG (für die Word-Datei).
// Aufruf über ../build-docx.sh, siehe dort.
//
//   node mermaid-png.mjs <eingabe.md> <ausgabe-ordner>
//
// Dateiname = SHA-1 des Diagramm-Codes. Der Lua-Filter (../docx/filter.lua)
// findet das Bild zu einem Code-Block über denselben Hash.

import { createHash } from 'node:crypto'
import { mkdirSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { launchChromium } from './chromium.mjs'

const here = dirname(fileURLToPath(import.meta.url))
const [input, outDir] = process.argv.slice(2)
if (!input || !outDir) {
  console.error('Aufruf: node mermaid-png.mjs <eingabe.md> <ausgabe-ordner>')
  process.exit(1)
}

const markdown = readFileSync(input, 'utf8').replace(/\r\n/g, '\n')
const diagrams = [...markdown.matchAll(/^```mermaid\n([\s\S]*?)\n```$/gm)].map((m) => m[1])
mkdirSync(outDir, { recursive: true })

const browser = await launchChromium()
try {
  // Faktor 3: bleibt scharf, auch wenn Word das Bild auf Seitenbreite zieht
  const page = await browser.newPage({ deviceScaleFactor: 3, viewport: { width: 1600, height: 900 } })
  await page.setContent('<!doctype html><html><body style="margin:0;background:#fff"><div id="out" style="display:inline-block;padding:8px"></div></body></html>')
  await page.addScriptTag({ path: join(here, 'node_modules/mermaid/dist/mermaid.min.js') })
  await page.evaluate(() => {
    window.mermaid.initialize({
      startOnLoad: false,
      theme: 'neutral',
      fontFamily: 'Arial, Liberation Sans, DejaVu Sans, sans-serif',
      // natürliche Grösse statt auf die Seitenbreite gestaucht
      flowchart: { useMaxWidth: false },
      sequence: { useMaxWidth: false },
    })
  })

  for (const [index, code] of diagrams.entries()) {
    const hash = createHash('sha1').update(code).digest('hex')
    await page.evaluate(async ({ code, id }) => {
      const { svg } = await window.mermaid.render(id, code)
      document.getElementById('out').innerHTML = svg
    }, { code, id: `diagramm${index}` })
    await page.locator('#out').screenshot({ path: join(outDir, `${hash}.png`) })
  }
  console.log(`${diagrams.length} Mermaid-Diagramme gerendert`)
} finally {
  await browser.close()
}
