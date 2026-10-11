#!/usr/bin/env bash
# Erzeugt DOKUMENTATION.docx (bearbeitbare Word-Version in der HWZ-Vorlage) aus
# DOKUMENTATION.md. Nach jeder Änderung an der Doku erneut ausführen:
#
#   pnpm docs:docx        (oder ./scripts/build-docx.sh)
#
# Weg: Mermaid-Diagramme → PNG (Headless-Chromium, scripts/pdf/mermaid-png.mjs),
# Markdown → Roh-Word mit pandoc und scripts/docx/filter.lua, dann setzt
# scripts/docx/build_docx.py den Inhalt in die HWZ-Vorlage ein (Titelblatt,
# Inhaltsverzeichnis, Formatvorlagen, Kopf-/Fusszeilen).
#
# Benötigt: pandoc ≥ 3 (https://pandoc.org/installing.html), Python 3, Node.js
# und Chromium (npx playwright install --with-deps chromium).
# Optional für die Seitenzahlen im Inhaltsverzeichnis: LibreOffice und PyMuPDF.
# Umgebungsvariablen: PANDOC (Pfad zu pandoc), PYTHON (Standard: python3), SOFFICE,
# HWZ_VORLAGE (andere .docx-Vorlage).
set -euo pipefail

cd "$(dirname "$0")/.."
PDF_TOOLS=scripts/pdf
PANDOC=${PANDOC:-pandoc}
PYTHON=${PYTHON:-python3}
VORLAGE=${HWZ_VORLAGE:-../../descriptive-data-analytics/projekte/semesterarbeit-hs2025/vorlage/hwz_vorlage_semesterarbeit.docx}

if ! command -v "$PANDOC" >/dev/null 2>&1; then
  echo "pandoc nicht gefunden. Installieren (https://pandoc.org/installing.html) oder PANDOC=/pfad/zu/pandoc setzen." >&2
  exit 1
fi
if [ ! -f "$VORLAGE" ]; then
  echo "HWZ-Vorlage nicht gefunden: $VORLAGE (HWZ_VORLAGE setzen)" >&2
  exit 1
fi
if [ ! -d "$PDF_TOOLS/node_modules" ]; then
  echo "Installiere Werkzeuge in $PDF_TOOLS …"
  npm install --prefix "$PDF_TOOLS" --no-audit --no-fund --silent
fi

TMP=$(mktemp -d)
trap 'rm -rf "$TMP"' EXIT

node "$PDF_TOOLS/mermaid-png.mjs" DOKUMENTATION.md "$TMP/mermaid"
"$PYTHON" scripts/docx/build_docx.py DOKUMENTATION.md "$VORLAGE" DOKUMENTATION.docx \
  "$TMP/mermaid" "$PANDOC" scripts/docx/filter.lua

# Optional: Seitenzahlen im Inhaltsverzeichnis vorab eintragen (sonst setzt Word
# sie beim Öffnen bzw. mit «Felder aktualisieren»). Braucht LibreOffice und PyMuPDF.
SOFFICE=${SOFFICE:-$(command -v soffice || command -v libreoffice || true)}
if [ -n "$SOFFICE" ] && "$PYTHON" -c 'import pymupdf' 2>/dev/null; then
  "$PYTHON" scripts/docx/seitenzahlen.py DOKUMENTATION.docx "$SOFFICE"
else
  echo "Hinweis: Seitenzahlen im Inhaltsverzeichnis setzt Word beim Öffnen (LibreOffice/PyMuPDF für die Vorschau nicht gefunden)."
fi
