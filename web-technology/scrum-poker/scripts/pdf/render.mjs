// Markdown → HTML (mit Druck-CSS) → PDF und/oder eigenständige HTML-Datei, gerendert
// mit Headless-Chromium (Playwright). Aufruf über ../build-pdf.sh, siehe dort.
//
//   node render.mjs <eingabe.md> <ausgabe.pdf|ausgabe.html>… [<titel für die Fusszeile>]
//
// Die HTML-Ausgabe ist eine einzige Datei ohne externe Requests: CSS inline, Bilder als
// base64-Data-URL, Mermaid-Diagramme als fertiges SVG. Sie lässt sich herunterladen und
// offline im Browser öffnen.

import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, extname, join, relative, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { Marked } from 'marked'
import { launchChromium } from './chromium.mjs'

const here = dirname(fileURLToPath(import.meta.url))
const projectDir = resolve(here, '../..')
// Öffentliche Kopie des Projekts (scripts/publish-abgaben.sh). Das Repo school ist
// privat, Links dorthin könnte die Dozentin nicht öffnen.
const REPO_BLOB = 'https://github.com/gotazlib/abgaben/blob/main/web-technology/scrum-poker'

const [input, ...rest] = process.argv.slice(2)
const isOutput = (arg) => ['.pdf', '.html'].includes(extname(arg).toLowerCase())
const outputs = rest.filter(isOutput)
const footerTitle = rest.find((arg) => !isOutput(arg)) ?? ''
if (!input || outputs.length === 0) {
  console.error('Aufruf: node render.mjs <eingabe.md> <ausgabe.pdf|ausgabe.html>… [titel]')
  process.exit(1)
}
const inputPath = resolve(input)
const inputDir = dirname(inputPath)

// ---------------------------------------------------------------------------
// Markdown → HTML
// ---------------------------------------------------------------------------

function escapeHtml(text) {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

// Anker wie auf GitHub: «7. Lade- und Fehlerzustände» → «7-lade--und-fehlerzustände».
// So funktionieren die Inhaltsverzeichnisse in den Markdown-Dateien auch im PDF/HTML.
const usedSlugs = new Map()
function slug(text) {
  const base = text
    .replace(/<[^>]*>/g, '')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s_-]/gu, '')
    .replace(/\s/g, '-')
  const count = usedSlugs.get(base) ?? 0
  usedSlugs.set(base, count + 1)
  return count ? `${base}-${count}` : base
}

const MIME = { '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.gif': 'image/gif', '.svg': 'image/svg+xml', '.webp': 'image/webp' }

// Bilder als Data-URL einbetten: Das HTML braucht so keine Dateien daneben.
function inlineImage(href) {
  if (/^[a-z]+:/i.test(href)) return href
  const path = resolve(inputDir, decodeURI(href))
  const mime = MIME[extname(path).toLowerCase()]
  if (!mime || !existsSync(path)) throw new Error(`Bild nicht gefunden oder unbekanntes Format: ${href}`)
  return `data:${mime};base64,${readFileSync(path).toString('base64')}`
}

// Relative Links auf Dateien im Projekt zeigen im PDF auf GitHub (im PDF gibt es
// keine Dateien daneben). Anker (#…) und absolute URLs bleiben unverändert.
function rewriteHref(href) {
  if (/^([a-z]+:|#)/i.test(href)) return href
  const [path, hash] = href.split('#')
  const fromProject = relative(projectDir, resolve(inputDir, path)).split('\\').join('/')
  return `${REPO_BLOB}/${fromProject}${hash ? `#${hash}` : ''}`
}

const marked = new Marked({ gfm: true })
marked.use({
  renderer: {
    code({ text, lang }) {
      if (lang === 'mermaid') return `<pre class="mermaid">${escapeHtml(text)}</pre>\n`
      return `<pre><code>${escapeHtml(text)}</code></pre>\n`
    },
    heading({ tokens, depth }) {
      const inner = this.parser.parseInline(tokens)
      return `<h${depth} id="${escapeHtml(slug(inner))}">${inner}</h${depth}>\n`
    },
    image({ href, title, text }) {
      const titleAttr = title ? ` title="${escapeHtml(title)}"` : ''
      return `<img src="${inlineImage(href)}" alt="${escapeHtml(text)}"${titleAttr}>`
    },
    link({ href, title, tokens }) {
      const inner = this.parser.parseInline(tokens)
      const titleAttr = title ? ` title="${escapeHtml(title)}"` : ''
      return `<a href="${escapeHtml(rewriteHref(href))}"${titleAttr}>${inner}</a>`
    },
  },
})

let markdown = readFileSync(inputPath, 'utf8')
// Platzhalter für die Gruppe sind im Markdown HTML-Kommentare. Im PDF sollen sie
// sichtbar sein, sonst gehen sie beim Ausdrucken vergessen.
markdown = markdown.replace(
  /<!--\s*(TODO Gruppe:[\s\S]*?)-->/g,
  (_match, text) => `<div class="todo">${escapeHtml(text.trim())}</div>`,
)
const body = marked.parse(markdown)
const title = (markdown.match(/^#\s+(.+)$/m) ?? [, 'Dokument'])[1]

const css = readFileSync(join(here, 'print.css'), 'utf8')
const html = `<!doctype html>
<html lang="de">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(title)}</title>
<style id="print-css">${css}</style>
</head>
<body>
<main id="content">
${body}
</main>
</body>
</html>`

// Für das PDF ist die HTML-Datei nur ein Zwischenschritt.
const tempDir = mkdtempSync(join(tmpdir(), 'scrum-poker-pdf-'))
const htmlPath = join(tempDir, 'print.html')
writeFileSync(htmlPath, html)

// ---------------------------------------------------------------------------
// HTML → PDF
// ---------------------------------------------------------------------------

const browser = await launchChromium()

try {
  const page = await browser.newPage()
  await page.goto(pathToFileURL(htmlPath).href, { waitUntil: 'load' })

  // Mermaid-Diagramme im Browser zu SVG rendern
  if (await page.locator('pre.mermaid').count()) {
    await page.addScriptTag({ path: join(here, 'node_modules/mermaid/dist/mermaid.min.js') })
    await page.evaluate(async () => {
      window.mermaid.initialize({
        startOnLoad: false,
        theme: 'neutral',
        fontFamily: 'DejaVu Sans, Arial, sans-serif',
      })
      await window.mermaid.run({ querySelector: 'pre.mermaid' })
    })
  }
  await page.evaluate(() => document.fonts.ready)

  for (const output of outputs.filter((file) => extname(file).toLowerCase() === '.pdf')) {
    await writePdf(page, output)
  }
  for (const output of outputs.filter((file) => extname(file).toLowerCase() === '.html')) {
    await writeHtml(page, output)
  }
} finally {
  await browser.close()
  rmSync(tempDir, { recursive: true, force: true })
}

async function writePdf(page, output) {
  await page.pdf({
    path: output,
    format: 'A4',
    printBackground: true,
    margin: { top: '18mm', bottom: '20mm', left: '18mm', right: '18mm' },
    displayHeaderFooter: true,
    headerTemplate: '<span></span>',
    footerTemplate: `<div style="width:100%;font-size:8px;color:#666;padding:0 18mm;display:flex;justify-content:space-between;font-family:sans-serif">
      <span>${escapeHtml(footerTitle || title)}</span>
      <span>Seite <span class="pageNumber"></span> von <span class="totalPages"></span></span></div>`,
  })
  console.log(`PDF erstellt: ${relative(process.cwd(), output)}`)
}

// Eigenständige HTML-Datei: das fertig gerenderte DOM (Mermaid schon als SVG) plus
// Bildschirm-CSS und ein Inhaltsverzeichnis als Seitenleiste. Kein JavaScript.
async function writeHtml(page, output) {
  const screenCss = readFileSync(join(here, 'html.css'), 'utf8')
  const source = relative(projectDir, inputPath).split('\\').join('/')
  const document = await page.evaluate(
    ({ screenCss, source }) => {
      const doc = window.document.cloneNode(true)
      doc.querySelectorAll('script').forEach((node) => node.remove())

      const style = doc.createElement('style')
      style.id = 'screen-css'
      style.textContent = screenCss
      doc.head.append(style)

      // Tabellen nur mit Screenshots → Galerie aus <figure>, die auf schmalen Bildschirmen
      // umbricht. Der Spaltenkopf wird zur Bildunterschrift.
      // Andere Tabellen scrollen auf dem Handy horizontal statt die Seite zu sprengen.
      for (const table of doc.querySelectorAll('#content table')) {
        const cells = [...table.querySelectorAll('tbody td')]
        if (cells.length && cells.every((cell) => cell.querySelector('img'))) {
          const captions = [...table.querySelectorAll('thead th')].map((th) => th.innerHTML)
          const gallery = doc.createElement('div')
          gallery.className = 'gallery'
          for (const row of table.querySelectorAll('tbody tr')) {
            ;[...row.cells].forEach((cell, index) => {
              const figure = doc.createElement('figure')
              figure.append(...cell.childNodes)
              if (captions[index]) {
                const caption = doc.createElement('figcaption')
                caption.innerHTML = captions[index]
                figure.append(caption)
              }
              gallery.append(figure)
            })
          }
          table.replaceWith(gallery)
          continue
        }
        // Leerer Tabellenkopf (Markdown-Tabelle «| | |» als Formular) bleibt weg
        const head = table.querySelector('thead')
        if (head && !head.textContent.trim()) head.remove()
        const wrap = doc.createElement('div')
        wrap.className = 'table-wrap'
        table.replaceWith(wrap)
        wrap.append(table)
      }

      // Inhaltsverzeichnis aus den Überschriften (Ebene 2 und 3)
      const nav = doc.createElement('nav')
      nav.className = 'toc'
      nav.setAttribute('aria-label', 'Inhaltsverzeichnis')
      const details = doc.createElement('details')
      details.open = true
      const summary = doc.createElement('summary')
      summary.textContent = 'Inhalt'
      details.append(summary)
      const list = doc.createElement('ul')
      let sublist = null
      for (const heading of doc.querySelectorAll('#content h2, #content h3')) {
        const item = doc.createElement('li')
        const link = doc.createElement('a')
        link.href = `#${heading.id}`
        link.textContent = heading.textContent
        item.append(link)
        if (heading.tagName === 'H2' || !list.lastElementChild) {
          list.append(item)
          sublist = null
        } else {
          if (!sublist) {
            sublist = doc.createElement('ul')
            list.lastElementChild.append(sublist)
          }
          sublist.append(item)
        }
      }
      details.append(list)
      nav.append(details)
      doc.body.prepend(nav)

      const footer = doc.createElement('footer')
      footer.className = 'generated'
      footer.textContent = `Erzeugt aus ${source} mit scripts/build-pdf.sh.`
      doc.querySelector('#content').append(footer)

      return '<!doctype html>\n' + doc.documentElement.outerHTML
    },
    { screenCss, source },
  )
  writeFileSync(output, document)
  console.log(`HTML erstellt: ${relative(process.cwd(), output)} (${Math.round(document.length / 1024)} KB)`)
}
