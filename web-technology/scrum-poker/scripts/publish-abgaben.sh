#!/usr/bin/env bash
# Kopiert das Projekt in einen lokalen Clone des öffentlichen Repos gotazlib/abgaben:
#
#   web-technology/scrum-poker/          Projekt-Quellcode (committeter Stand)
#   web-technology/scrum-poker/abgabe/   alles, was abgegeben wird: PDFs, DOCX, HTMLs,
#                                        Abgabe-ZIP und Screenshots
#
# Aufruf (nach einer Änderung an Code oder Doku, alles committet):
#
#   ./scripts/build-pdf.sh                       # PDFs und HTMLs neu erzeugen, committen
#   ./scripts/publish-abgaben.sh ../../../../abgaben
#   cd <clone> && git add -A && git commit -m "…" && git push
#
# Das Script committet und pusht nicht selbst. Es nimmt wie make-submission.sh den
# committeten Stand (git archive): node_modules, dist, test-results usw. sind nie dabei,
# und auch keine lokalen Dateien wie .env. Git-Historie wird keine übernommen.
set -euo pipefail

if [ $# -ne 1 ]; then
  echo "Aufruf: $0 <pfad-zum-clone-von-gotazlib/abgaben>" >&2
  exit 1
fi

cd "$(dirname "$0")/.."
PROJECT=$PWD
CLONE=$(cd "$1" && pwd)

if [ ! -d "$CLONE/.git" ]; then
  echo "Kein Git-Clone: $CLONE" >&2
  exit 1
fi
if ! git -C "$CLONE" remote get-url origin 2>/dev/null | grep -q 'gotazlib/abgaben'; then
  echo "$CLONE ist kein Clone von gotazlib/abgaben (origin passt nicht)." >&2
  exit 1
fi

TARGET=$CLONE/web-technology/scrum-poker
ABGABE=$TARGET/abgabe

# 1. Abgabe-ZIP aus dem committeten Stand (warnt selbst bei nicht committeten Änderungen)
./scripts/make-submission.sh

# 2. Projektordner ersetzen. Gelöschte Dateien verschwinden so auch in der Kopie.
PROJECT_DIR=$(git rev-parse --show-prefix)
PROJECT_DIR=${PROJECT_DIR%/}
rm -rf "$TARGET"
mkdir -p "$TARGET"
git -C "$(git rev-parse --show-toplevel)" archive --format=tar "HEAD:$PROJECT_DIR" | tar -x -C "$TARGET"

# 3. Ordner abgabe/: alle Abgabedateien auf einen Blick
mkdir -p "$ABGABE/screenshots"
cp DOKUMENTATION.pdf DOKUMENTATION.html "$ABGABE/"
cp docs/FACHGESPRAECH.pdf docs/FACHGESPRAECH.html "$ABGABE/"
cp scrum-poker-abgabe.zip "$ABGABE/"
cp docs/screenshots/*.png "$ABGABE/screenshots/"
if [ -f DOKUMENTATION.docx ]; then
  cp DOKUMENTATION.docx "$ABGABE/"
elif [ -f docs/DOKUMENTATION.docx ]; then
  cp docs/DOKUMENTATION.docx "$ABGABE/"
else
  echo "Hinweis: DOKUMENTATION.docx fehlt, nicht kopiert." >&2
fi

# 4. Datenschutz-Prüfung: Das Ziel-Repo ist öffentlich. Gesucht wird in allen Dateien,
#    auch in den Metadaten von DOCX (ZIP, darum entpackt) und PDF.
CHECK=$(mktemp -d)
trap 'rm -rf "$CHECK"' EXIT
cp -r "$TARGET" "$CHECK/files"
find "$CHECK/files" \( -name '*.docx' -o -name '*.zip' \) -print0 |
  while IFS= read -r -d '' archive; do
    python3 -c 'import sys, zipfile; zipfile.ZipFile(sys.argv[1]).extractall(sys.argv[2])' \
      "$archive" "$archive.unzipped"
  done
# Bilder sind ausgenommen: In ihren Binärdaten «findet» das Muster zufällige Treffer.
FOUND=$(grep -rIaEo \
  --exclude='*.png' --exclude='*.jpg' --exclude='*.jpeg' --exclude='*.gif' --exclude='*.webp' \
  -e '[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}' \
  -e '/home/[A-Za-z0-9_-]+' -e '/Users/[A-Za-z0-9_-]+' \
  -e 'gh[pousr]_[A-Za-z0-9]{20,}' -e 'github_pat_[A-Za-z0-9_]{20,}' \
  "$CHECK/files" |
  sed "s#^$CHECK/files/##" |
  grep -vE '@(example\.(com|org)|users\.noreply\.github\.com)|@[a-z0-9-]+/[a-z0-9-]+|@(media|import|keyframes|font-face|supports|layer|page)' |
  grep -vE ':[^:]*@[0-9]+\.[0-9]+' || true)
ENV_FILES=$(find "$CHECK/files" -name '.env*' -o -name '*.pem' -o -name '*.key' | sed "s#^$CHECK/files/##")
if [ -n "$FOUND$ENV_FILES" ]; then
  echo "Datenschutz-Prüfung: bitte ansehen, bevor gepusht wird:" >&2
  printf '%s\n' "$FOUND" "$ENV_FILES" | sort -u | sed '/^$/d' >&2
  exit 1
fi

echo "Kopiert nach $TARGET (Stand $(git rev-parse --short HEAD)). Datenschutz-Prüfung ohne Befund."
echo "Weiter: cd $CLONE && git status && git add -A && git commit && git push"
