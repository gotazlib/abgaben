#!/usr/bin/env bash
# Erzeugt scrum-poker-abgabe.zip mit dem ganzen Projektordner, so wie er im Git
# committet ist: ohne node_modules, dist und andere ignorierte Dateien, aber mit
# DOKUMENTATION.md/.pdf/.docx, docs/ und Screenshots.
#
#   ./scripts/make-submission.sh
#
# Das ZIP liegt danach im Projektordner und wird nicht committet (.gitignore).
set -euo pipefail

cd "$(dirname "$0")/.."
PROJECT_DIR=$(git rev-parse --show-prefix)   # z. B. goerkem/web-technology/scrum-poker/
PROJECT_DIR=${PROJECT_DIR%/}
ZIP=scrum-poker-abgabe.zip

# git archive nimmt den committeten Stand. Nicht committete Änderungen fehlen
# im ZIP, darum vorher warnen.
if [ -n "$(git status --porcelain -- .)" ]; then
  echo "Achtung: Es gibt nicht committete Änderungen. Sie sind NICHT im ZIP:" >&2
  git status --short -- . >&2
fi

for file in DOKUMENTATION.md DOKUMENTATION.pdf DOKUMENTATION.docx DOKUMENTATION.html docs/FACHGESPRAECH.md docs/FACHGESPRAECH.pdf docs/FACHGESPRAECH.html; do
  if ! git cat-file -e "HEAD:$PROJECT_DIR/$file" 2>/dev/null; then
    echo "Fehlt im Commit: $file" >&2
    exit 1
  fi
done

rm -f "$ZIP"
# Aus der Repo-Wurzel aufrufen: In einem Unterordner würde git archive nur den
# gleichnamigen Unterpfad innerhalb von HEAD:$PROJECT_DIR nehmen (und der ist leer).
git -C "$(git rev-parse --show-toplevel)" archive --format=zip --prefix=scrum-poker/ \
  --output="$PWD/$ZIP" "HEAD:$PROJECT_DIR"

echo "Erstellt: $ZIP ($(du -h "$ZIP" | cut -f1), $(git ls-tree -r --name-only HEAD -- . | wc -l) Dateien, Stand $(git rev-parse --short HEAD))"
