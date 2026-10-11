"""Trägt die Seitenzahlen ins Inhalts- und Abbildungsverzeichnis von
DOKUMENTATION.docx ein. Optionaler Schritt von scripts/build-docx.sh.

Die Verzeichnisse sind Word-Felder. Word rechnet die Seitenzahlen beim Öffnen
selbst neu (Felder aktualisieren). Damit die Datei aber auch vorher, in der
Vorschau oder in LibreOffice, richtige Zahlen zeigt, wird sie hier einmal mit
LibreOffice in ein PDF umgewandelt und die Seite jeder Überschrift und jeder
Abbildung nachgeschlagen.

  python3 seitenzahlen.py <datei.docx> <soffice>

Benötigt LibreOffice und PyMuPDF (pip install pymupdf).
"""

import os
import re
import shutil
import subprocess
import sys
import tempfile
import zipfile

import pymupdf


def normal(text):
    return re.sub(r'\s+', '', text).lower()


def seitentexte(pdf):
    """Pro Seite der Text ohne Leerzeichen; Verzeichniszeilen (Punktführer) fehlen."""
    seiten = []
    for seite in pymupdf.open(pdf):
        zeilen = []
        for block in seite.get_text('dict')['blocks']:
            for zeile in block.get('lines', []):
                text = ''.join(s['text'] for s in zeile['spans'])
                if '....' not in text:
                    zeilen.append(text)
        seiten.append(normal(''.join(zeilen)))
    return seiten


def main(docx, soffice):
    with zipfile.ZipFile(docx) as z:
        doc = z.read('word/document.xml').decode('utf-8')

    # Verzeichniseinträge: Textmarke → gesuchter Text (Nummer + Titel bzw. «Abbildung n:»)
    eintraege = []
    for marke, inhalt in re.findall(r'<w:hyperlink w:anchor="(_Toc[^"]+)"[^>]*>(.*?)</w:hyperlink>', doc, re.S):
        texte = re.findall(r'<w:t(?:\s[^>]*)?>([^<]*)</w:t>', inhalt)[:-1]       # ohne Seitenzahl
        suche = normal(''.join(texte))
        if suche.startswith('abbildung'):
            suche = suche[:suche.index(':') + 1]
        eintraege.append((marke, suche))

    with tempfile.TemporaryDirectory() as tmp:
        kopie = os.path.join(tmp, 'dokument.docx')
        shutil.copy(docx, kopie)
        subprocess.run([soffice, f'-env:UserInstallation=file://{tmp}/profil', '--headless',
                        '--convert-to', 'pdf', '--outdir', tmp, kopie],
                       check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        seiten = seitentexte(os.path.join(tmp, 'dokument.pdf'))

    # Überschriften und Abbildungen getrennt der Reihe nach suchen
    seitenzahl, start, erste = {}, {}, None
    for marke, suche in eintraege:
        art = suche.startswith('abbildung')
        for i in range(start.get(art, erste or 0), len(seiten)):
            if suche in seiten[i]:
                erste = i if erste is None else erste            # Kapitel 1 = Seite 1
                seitenzahl[marke] = i - erste + 1
                start[art] = i
                break
        else:
            print(f'Seitenzahlen: «{suche}» nicht gefunden', file=sys.stderr)

    def ersetzen(m):
        return m.group(1) + str(seitenzahl.get(m.group(2), m.group(3))) + m.group(4)
    doc = re.sub(r'(PAGEREF (_Toc\w+) \\h </w:instrText>.*?<w:t xml:space="preserve">)([^<]*)(</w:t>)',
                 ersetzen, doc, flags=re.S)

    with tempfile.NamedTemporaryFile(delete=False, dir=os.path.dirname(os.path.abspath(docx))) as f:
        neu = f.name
    with zipfile.ZipFile(docx) as zi, zipfile.ZipFile(neu, 'w', zipfile.ZIP_DEFLATED) as zo:
        for item in zi.infolist():
            daten = doc.encode('utf-8') if item.filename == 'word/document.xml' else zi.read(item.filename)
            zo.writestr(item, daten)
    os.replace(neu, docx)
    print(f'Seitenzahlen eingetragen: {len(seitenzahl)} von {len(eintraege)} Verzeichniseinträgen')


if __name__ == '__main__':
    main(*sys.argv[1:3])
