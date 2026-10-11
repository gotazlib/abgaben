#!/usr/bin/env bash
# Erzeugt aus den Markdown-Dateien die PDFs und die eigenständigen HTML-Dateien:
#   DOKUMENTATION.pdf / DOKUMENTATION.html
#   docs/FACHGESPRAECH.pdf / docs/FACHGESPRAECH.html
# Nach jeder Änderung an der Doku erneut ausführen:
#
#   ./scripts/build-pdf.sh          PDF und HTML   (pnpm docs:pdf)
#   ./scripts/build-pdf.sh html     nur HTML       (pnpm docs:html)
#   ./scripts/build-pdf.sh pdf      nur PDF
#
# Weg: Markdown → HTML mit Druck-CSS (scripts/pdf/print.css) → Headless-Chromium
# (Playwright). Mermaid-Diagramme werden im Browser zu SVG gerendert. Daraus entsteht
# das PDF (page.pdf()) und die HTML-Datei: eine einzige Datei mit CSS inline, Bildern
# als base64 und Diagrammen als SVG, ohne externe Requests (offline lesbar).
# Die Werkzeuge liegen in scripts/pdf/ und gehören nicht zur App (eigenes
# package.json, eigenes node_modules).
#
# Fehlt Chromium:  npx playwright install --with-deps chromium
set -euo pipefail

MODE=${1:-all}
case "$MODE" in
  all) EXT=(pdf html) ;;
  pdf | html) EXT=("$MODE") ;;
  *)
    echo "Aufruf: $0 [all|pdf|html]" >&2
    exit 1
    ;;
esac

cd "$(dirname "$0")/.."
TOOLS=scripts/pdf

if [ ! -d "$TOOLS/node_modules" ]; then
  echo "Installiere PDF-Werkzeuge in $TOOLS …"
  npm install --prefix "$TOOLS" --no-audit --no-fund --silent
fi

node "$TOOLS/render.mjs" DOKUMENTATION.md "${EXT[@]/#/DOKUMENTATION.}" "Scrum Poker – Projektdokumentation"
node "$TOOLS/render.mjs" docs/FACHGESPRAECH.md "${EXT[@]/#/docs/FACHGESPRAECH.}" "Scrum Poker – Leitfaden Fachgespräch"
