"""Setzt DOKUMENTATION.md in die HWZ-Word-Vorlage ein (DOKUMENTATION.docx).

Hilfswerkzeug, nicht Teil der App. Aufruf über scripts/build-docx.sh.
Nur Python-Standardbibliothek. Vorbild: werkzeuge/erstelle_arbeit.py der
DDA-Semesterarbeit (gleiche Vorlage).

Ablauf:
  1. pandoc wandelt das Markdown mit filter.lua in ein Roh-Word-Dokument um.
  2. Aus der Vorlage bleiben Titelblatt, Inhaltsverzeichnis-Abschnitt,
     Formatvorlagen, Nummerierung, Kopf- und Fusszeilen. Der Beispielinhalt der
     Vorlage (Ehrenwörtliche Erklärung, Kapitel 1–7) wird durch den neuen
     Inhalt ersetzt.
  3. Titelblatt: Titel, Modul, Dozent, Studiengang; Platzhalter gelb.
  4. Marker aus filter.lua ersetzen (Beschriftungen, Bildraster), Tabellen
     mit Rahmen und berechneten Spaltenbreiten, Code grau hinterlegt.
  5. Inhalts- und Abbildungsverzeichnis als Word-Felder mit Seitenverweisen.
     Word aktualisiert sie beim Öffnen (updateFields).
"""

import os
import re
import struct
import subprocess
import sys
import tempfile
import zipfile
from xml.sax.saxutils import escape

TITEL = 'Scrum Poker App – Projektdokumentation'
MODUL = 'Web Technology'
DOZENT = 'Tobias Büchel'
STUDIENGANG = 'BWI-A24'

TAG = re.compile(r'<(/?)([A-Za-z0-9]+:[A-Za-z0-9]+)(?:\s[^>]*?)?(/?)>')
LANG = '<w:lang w:val="de-CH"/>'
GELB = '<w:highlight w:val="yellow"/>'

TEXTBREITE = 11907 - 2 * 1418          # Seitenbreite minus Ränder der Vorlage (Twips)
EMU_PRO_TWIP = 635
EMU_PRO_CM = 360000

ABSATZ_PPR = '<w:pPr><w:spacing w:before="0" w:after="160" w:line="276" w:lineRule="auto"/></w:pPr>'
LISTE_SPACING = '<w:spacing w:before="0" w:after="60" w:line="264" w:lineRule="auto"/>'
ZELLE_SPACING = '<w:spacing w:before="40" w:after="40" w:line="240" w:lineRule="auto"/>'

NEUE_STILE = (
    # Code-Blöcke: Monospace, grau hinterlegt, feiner Rahmen
    '<w:style w:type="paragraph" w:customStyle="1" w:styleId="SourceCode">'
    '<w:name w:val="Quellcode"/><w:basedOn w:val="Normal"/><w:qFormat/>'
    '<w:pPr><w:keepLines/><w:pBdr>'
    + ''.join(f'<w:{s} w:val="single" w:sz="4" w:space="4" w:color="D9D9D9"/>'
              for s in ('top', 'left', 'bottom', 'right'))
    + '</w:pBdr><w:shd w:val="clear" w:color="auto" w:fill="F2F2F2"/>'
    '<w:spacing w:before="120" w:after="240" w:line="240" w:lineRule="auto"/>'
    '<w:ind w:left="113" w:right="113"/></w:pPr>'
    '<w:rPr><w:rFonts w:ascii="Consolas" w:hAnsi="Consolas" w:cs="Consolas"/><w:noProof/>'
    '<w:sz w:val="18"/><w:szCs w:val="18"/></w:rPr></w:style>'
    # Code im Fliesstext
    '<w:style w:type="character" w:customStyle="1" w:styleId="VerbatimChar">'
    '<w:name w:val="Code (Zeichen)"/><w:basedOn w:val="DefaultParagraphFont"/><w:qFormat/>'
    '<w:rPr><w:rFonts w:ascii="Consolas" w:hAnsi="Consolas" w:cs="Consolas"/><w:noProof/>'
    '<w:sz w:val="20"/><w:shd w:val="clear" w:color="auto" w:fill="F2F2F2"/></w:rPr></w:style>'
)


# ---------------------------------------------------------------------------
# kleine XML-Helfer (wie in erstelle_arbeit.py)
# ---------------------------------------------------------------------------

def teile(xml):
    """Zerlegt XML in die Elemente der obersten Ebene (Verschachtelung beachtet)."""
    ergebnis, tiefe, start = [], 0, None
    for m in TAG.finditer(xml):
        schliessend, selbst = m.group(1) == '/', m.group(3) == '/'
        if tiefe == 0 and not schliessend:
            start = m.start()
        if selbst:
            if tiefe == 0:
                ergebnis.append(xml[start:m.end()])
            continue
        tiefe += -1 if schliessend else 1
        if tiefe == 0:
            ergebnis.append(xml[start:m.end()])
    return ergebnis


def text_von(xml):
    return ''.join(re.findall(r'<w:t(?:\s[^>]*)?>([^<]*)</w:t>', xml))


def run(text, rpr=''):
    return f'<w:r><w:rPr>{rpr}{LANG}</w:rPr><w:t xml:space="preserve">{escape(text)}</w:t></w:r>'


def feld(instr, ergebnis, rpr=''):
    return (f'<w:r><w:rPr>{rpr}</w:rPr><w:fldChar w:fldCharType="begin"/></w:r>'
            f'<w:r><w:rPr>{rpr}</w:rPr><w:instrText xml:space="preserve"> {instr} </w:instrText></w:r>'
            f'<w:r><w:rPr>{rpr}</w:rPr><w:fldChar w:fldCharType="separate"/></w:r>'
            f'{run(ergebnis, rpr)}'
            f'<w:r><w:rPr>{rpr}</w:rPr><w:fldChar w:fldCharType="end"/></w:r>')


def textfeld(alias, inhalt_runs, nummer):
    """Inhaltssteuerelement (Nur-Text), in Word anklickbar und bearbeitbar."""
    return (f'<w:sdt><w:sdtPr><w:alias w:val="{escape(alias)}"/><w:tag w:val="{escape(alias)}"/>'
            f'<w:id w:val="{nummer}"/><w:text/></w:sdtPr><w:sdtContent>{inhalt_runs}</w:sdtContent></w:sdt>')


def absatz_inhalt_ersetzen(xml, enthaelt, neuer_inhalt):
    """Ersetzt im Absatz, dessen Text `enthaelt` enthält, alles nach dem pPr."""
    for p in re.findall(r'<w:p>.*?</w:p>|<w:p .*?</w:p>', xml, re.S):
        if enthaelt in text_von(p):
            ppr = re.search(r'<w:pPr>.*?</w:pPr>', p, re.S)
            neu = '<w:p>' + (ppr.group(0) if ppr else '') + neuer_inhalt + '</w:p>'
            return xml.replace(p, neu, 1)
    raise ValueError(f'Absatz mit «{enthaelt}» nicht in der Vorlage gefunden')


# Word verlangt die Kindelemente von pPr und rPr in der Reihenfolge des Schemas
# (ECMA-376). Die Ersetzungen oben fügen Eigenschaften vorne an, darum hier sortieren.
PPR_REIHENFOLGE = ('pStyle keepNext keepLines pageBreakBefore framePr widowControl numPr '
                   'suppressLineNumbers pBdr shd tabs suppressAutoHyphens kinsoku wordWrap '
                   'overflowPunct topLinePunct autoSpaceDE autoSpaceDN bidi adjustRightInd snapToGrid '
                   'spacing ind contextualSpacing mirrorIndents suppressOverlap jc textDirection '
                   'textAlignment textboxTightWrap outlineLvl divId cnfStyle rPr sectPr pPrChange').split()
RPR_REIHENFOLGE = ('rStyle rFonts b bCs i iCs caps smallCaps strike dstrike outline shadow emboss '
                   'imprint noProof snapToGrid vanish webHidden color spacing w kern position sz szCs '
                   'highlight u effect bdr shd fitText vertAlign rtl cs em lang eastAsianLayout '
                   'specVanish oMath').split()


def sortiere_eigenschaften(xml):
    def sortieren(inhalt, reihenfolge):
        gesehen, kinder = set(), []
        for kind in teile(inhalt):
            name = re.match(r'<w:(\w+)', kind).group(1)
            if name in gesehen:                     # doppelte Eigenschaft: erste gilt
                continue
            gesehen.add(name)
            kinder.append((reihenfolge.index(name), kind))
        return ''.join(k for _, k in sorted(kinder, key=lambda x: x[0]))
    xml = re.sub(r'<w:rPr>(.*?)</w:rPr>',
                 lambda m: '<w:rPr>' + sortieren(m.group(1), RPR_REIHENFOLGE) + '</w:rPr>', xml, flags=re.S)
    return re.sub(r'<w:pPr>((?:(?!<w:pPr>).)*?)</w:pPr>',
                  lambda m: '<w:pPr>' + sortieren(m.group(1), PPR_REIHENFOLGE) + '</w:pPr>', xml, flags=re.S)


def png_groesse(daten):
    breite, hoehe = struct.unpack('>II', daten[16:24])
    return breite, hoehe


# ---------------------------------------------------------------------------
# Titelblatt
# ---------------------------------------------------------------------------

def titelblatt(xml):
    xml = re.sub(r' w:rsid\w*="[^"]*"', '', xml)
    xml = re.sub(r'<w:proofErr [^>]*/>', '', xml)
    rpr = '<w:rFonts w:cs="Arial"/>'
    xml = absatz_inhalt_ersetzen(xml, 'Semesterarbeit',
                                 run(TITEL, rpr + '<w:b/><w:bCs/><w:sz w:val="36"/><w:szCs w:val="36"/>'))
    xml = absatz_inhalt_ersetzen(xml, 'Data Analytics', run(MODUL, rpr))
    xml = absatz_inhalt_ersetzen(xml, 'Walter Patrick',
                                 textfeld('Dozent', run(DOZENT, rpr), 41001))
    xml = absatz_inhalt_ersetzen(xml, 'vorgelegt von',
                                 run('vorgelegt von:', rpr))
    xml = absatz_inhalt_ersetzen(xml, 'Görkem Taspinar', textfeld(
        'Gruppenmitglieder', run('[Gruppenmitglieder: Vor- und Nachnamen eintragen]', rpr + GELB), 41002))
    xml = absatz_inhalt_ersetzen(xml, 'Matrikelnummer:', run('Matrikelnummern:', rpr))
    xml = absatz_inhalt_ersetzen(xml, '24-187-437', textfeld(
        'Matrikelnummern', run('[Matrikelnummern eintragen oder Zeile löschen]', rpr + GELB), 41003))
    xml = absatz_inhalt_ersetzen(xml, 'BWI A-24', textfeld(
        'Studiengang – bitte prüfen', run(f'{STUDIENGANG} (bitte prüfen)', rpr + GELB), 41004))
    xml = absatz_inhalt_ersetzen(xml, 'Zug', textfeld(
        'Ort, Datum', run('[Ort, Datum eintragen]', rpr + GELB), 41005))
    assert 'TIME' not in xml
    return xml


# ---------------------------------------------------------------------------
# Inhalt
# ---------------------------------------------------------------------------

class Inhalt:
    def __init__(self, rid_map, medien):
        self.rid_map = rid_map          # alte rId → neue rId
        self.medien = medien            # neue rId → Bilddaten
        self.ueberschriften = []        # (Ebene, Nummer, Text, Textmarke)
        self.abbildungen = []           # (Text, Textmarke)
        self.nummern = [0, 0, 0]
        self.textmarke = 0

    def neue_textmarke(self, prefix):
        self.textmarke += 1
        return f'_{prefix}{self.textmarke:05d}', 50000 + self.textmarke

    # --- Absätze ------------------------------------------------------------

    def runs_aufbereiten(self, p):
        p = re.sub(r'r:(embed|id)="([^"]+)"', lambda m: f'r:{m.group(1)}="{self.rid_map[m.group(2)]}"', p)
        p = re.sub(r'<w:bookmark(Start|End)[^>]*/>', '', p)
        p = p.replace('<w:rStyle w:val="Platzhalter" />', GELB)
        # Sprache Deutsch (Schweiz) für die Rechtschreibprüfung
        p = re.sub(r'<w:r>(?!<w:rPr>)', f'<w:r><w:rPr>{LANG}</w:rPr>', p)
        p = re.sub(r'(<w:r><w:rPr>(?:(?!</w:rPr>).)*?)</w:rPr>',
                   lambda m: m.group(0) if LANG in m.group(1) else m.group(1) + LANG + '</w:rPr>', p)
        return p

    def ueberschrift(self, p, ebene):
        text = text_von(p).strip()
        self.nummern[ebene - 1] += 1
        for i in range(ebene, 3):
            self.nummern[i] = 0
        nummer = '.'.join(str(n) for n in self.nummern[:ebene])
        name, bid = self.neue_textmarke('Toc')
        self.ueberschriften.append((ebene, nummer, text, name))
        p = re.sub(r'<w:bookmark(Start|End)[^>]*/>', '', p)
        p = re.sub(r'(</w:pPr>)', rf'\1<w:bookmarkStart w:id="{bid}" w:name="{name}"/>', p, count=1)
        return p.replace('</w:p>', f'<w:bookmarkEnd w:id="{bid}"/></w:p>')

    def beschriftung(self, text, zentriert=False):
        nummer = len(self.abbildungen) + 1
        name, bid = self.neue_textmarke('TocAbb')
        self.abbildungen.append((f'Abbildung {nummer}: {text}', name))
        jc = '<w:jc w:val="center"/>' if zentriert else ''
        return (f'<w:p><w:pPr><w:pStyle w:val="Caption"/><w:spacing w:before="60" w:after="240"/>{jc}</w:pPr>'
                f'<w:bookmarkStart w:id="{bid}" w:name="{name}"/>'
                f'{run("Abbildung ")}{feld("SEQ Abbildung \\* ARABIC", str(nummer))}{run(": " + text)}'
                f'<w:bookmarkEnd w:id="{bid}"/></w:p>')

    def bild(self, p, max_breite, max_hoehe):
        """Bildgrösse: so breit wie möglich, Seitenverhältnis bleibt."""
        rid = re.search(r'r:embed="([^"]+)"', p).group(1)
        px_b, px_h = png_groesse(self.medien[rid])
        breite = max_breite
        hoehe = breite * px_h / px_b
        if hoehe > max_hoehe:
            hoehe = max_hoehe
            breite = hoehe * px_b / px_h
        cx, cy = int(breite), int(hoehe)
        p = re.sub(r'<wp:extent cx="\d+" cy="\d+"\s*/>', f'<wp:extent cx="{cx}" cy="{cy}"/>', p)
        p = re.sub(r'<a:ext cx="\d+" cy="\d+"\s*/>', f'<a:ext cx="{cx}" cy="{cy}"/>', p)
        p = re.sub(r'<w:pPr>.*?</w:pPr>', '', p, count=1)
        return re.sub(r'^<w:p>', '<w:p><w:pPr><w:keepNext/><w:spacing w:before="120" w:after="0"/>'
                                 '<w:jc w:val="center"/></w:pPr>', p)

    def absatz(self, p):
        p = self.runs_aufbereiten(p)
        stil = re.search(r'<w:pStyle w:val="([^"]+)"', p)
        stil = stil.group(1) if stil else ''
        if stil in ('Heading1', 'Heading2', 'Heading3'):
            return self.ueberschrift(p, int(stil[-1]))
        if stil == 'SourceCode':
            return re.sub(r'<w:rStyle w:val="VerbatimChar"\s*/>', '', p)
        if '<w:drawing>' in p:
            return self.bild(p, TEXTBREITE * EMU_PRO_TWIP, 20 * EMU_PRO_CM)
        if '<w:numPr>' in p:
            p = re.sub(r'<w:pStyle w:val="[^"]*"\s*/>', '', p)
            return p.replace('<w:pPr>', '<w:pPr>' + LISTE_SPACING, 1)
        if '<w:pPr>' in p:
            return re.sub(r'<w:pPr>.*?</w:pPr>', ABSATZ_PPR, p, count=1)
        return p.replace('<w:p>', '<w:p>' + ABSATZ_PPR, 1)

    # --- Tabellen -----------------------------------------------------------

    def tabelle(self, t):
        t = self.runs_aufbereiten(t)
        zeilen = re.findall(r'<w:tr>.*?</w:tr>|<w:tr .*?</w:tr>', t, re.S)
        kopf_leer = not text_von(zeilen[0]).strip()
        if kopf_leer:                                       # «| | |» ohne Kopfzeile
            zeilen = zeilen[1:]

        # Lange Pfade ohne Leerzeichen dürfen nach «/» umbrechen
        def umbruch(m):
            text = m.group(2)
            if len(text) > 18:
                text = re.sub(r'(?<=/)(?=\S)', '\u200b', text)
            return m.group(1) + text + '</w:t>'
        zeilen = [re.sub(r'(<w:t(?:\s[^>]*)?>)([^<]*)</w:t>', umbruch, z) for z in zeilen]

        zellen = [re.findall(r'<w:tc>.*?</w:tc>', z, re.S) for z in zeilen]
        spalten = max(len(z) for z in zellen)
        breiten = spaltenbreiten(zellen, spalten, not kopf_leer)

        rahmen = ''.join(f'<w:{s} w:val="single" w:sz="4" w:space="0" w:color="808080"/>'
                         for s in ('top', 'left', 'bottom', 'right', 'insideH', 'insideV'))
        tblpr = (f'<w:tblPr><w:tblStyle w:val="TableGrid"/><w:tblW w:w="{sum(breiten)}" w:type="dxa"/>'
                 f'<w:tblBorders>{rahmen}</w:tblBorders><w:tblLayout w:type="fixed"/>'
                 '<w:tblCellMar><w:left w:w="85" w:type="dxa"/><w:right w:w="85" w:type="dxa"/></w:tblCellMar>'
                 '<w:tblLook w:val="04A0" w:firstRow="1" w:lastRow="0" w:firstColumn="0" w:lastColumn="0" '
                 'w:noHBand="0" w:noVBand="1"/></w:tblPr>')
        grid = '<w:tblGrid>' + ''.join(f'<w:gridCol w:w="{b}"/>' for b in breiten) + '</w:tblGrid>'

        neue_zeilen = []
        for i, z in enumerate(zellen):
            kopf = i == 0 and not kopf_leer
            tcs = []
            for j, c in enumerate(z):
                inhalt = re.sub(r'^<w:tc>\s*<w:tcPr\s*/>|^<w:tc>\s*<w:tcPr>.*?</w:tcPr>', '', c, flags=re.S)
                inhalt = inhalt[:-len('</w:tc>')]
                inhalt = re.sub(r'<w:pStyle w:val="Compact"\s*/>', '', inhalt)
                inhalt = inhalt.replace('<w:p><w:pPr>', '<w:p><w:pPr>' + ZELLE_SPACING)
                inhalt = re.sub(r'<w:p>(?!<w:pPr>)', '<w:p><w:pPr>' + ZELLE_SPACING + '</w:pPr>', inhalt)
                schrift = '<w:sz w:val="18"/><w:szCs w:val="18"/>' + ('<w:b/><w:bCs/>' if kopf else '')
                inhalt = inhalt.replace('<w:rPr>', '<w:rPr>' + schrift)
                schatten = '<w:shd w:val="clear" w:color="auto" w:fill="D9D9D9"/>' if kopf else ''
                tcs.append(f'<w:tc><w:tcPr><w:tcW w:w="{breiten[j]}" w:type="dxa"/>{schatten}</w:tcPr>{inhalt}</w:tc>')
            trpr = '<w:trPr><w:cantSplit/><w:tblHeader/></w:trPr>' if kopf else '<w:trPr><w:cantSplit/></w:trPr>'
            neue_zeilen.append(f'<w:tr>{trpr}{"".join(tcs)}</w:tr>')
        return f'<w:tbl>{tblpr}{grid}{"".join(neue_zeilen)}</w:tbl>'

    def bildraster(self, spalten, zellen):
        """Screenshots nebeneinander: Tabelle ohne Rahmen, Beschriftung pro Bild."""
        breite = TEXTBREITE // spalten
        max_hoehe = (8 if spalten >= 3 else 7) * EMU_PRO_CM
        tcs = []
        for zelle in zellen:
            inhalt = ''
            for t in zelle:
                txt = text_von(t).strip()
                if txt.startswith('@@CAP|'):
                    inhalt += self.beschriftung(txt.strip('@').split('|', 2)[2], zentriert=True)
                else:
                    t = self.runs_aufbereiten(t)
                    inhalt += self.bild(t, (breite - 2 * 115) * EMU_PRO_TWIP, max_hoehe)
            tcs.append(f'<w:tc><w:tcPr><w:tcW w:w="{breite}" w:type="dxa"/></w:tcPr>{inhalt}</w:tc>')
        while len(tcs) % spalten:
            tcs.append(f'<w:tc><w:tcPr><w:tcW w:w="{breite}" w:type="dxa"/></w:tcPr><w:p/></w:tc>')
        zeilen = ''.join('<w:tr><w:trPr><w:cantSplit/></w:trPr>' + ''.join(tcs[i:i + spalten]) + '</w:tr>'
                         for i in range(0, len(tcs), spalten))
        ohne = ''.join(f'<w:{s} w:val="nil"/>' for s in ('top', 'left', 'bottom', 'right', 'insideH', 'insideV'))
        return (f'<w:tbl><w:tblPr><w:tblW w:w="{breite * spalten}" w:type="dxa"/><w:jc w:val="center"/>'
                f'<w:tblBorders>{ohne}</w:tblBorders><w:tblLayout w:type="fixed"/>'
                '<w:tblCellMar><w:left w:w="115" w:type="dxa"/><w:right w:w="115" w:type="dxa"/></w:tblCellMar>'
                '<w:tblLook w:val="0000"/></w:tblPr>'
                f'<w:tblGrid>{"".join(f"<w:gridCol w:w={chr(34)}{breite}{chr(34)}/>" for _ in range(spalten))}</w:tblGrid>'
                f'{zeilen}</w:tbl>')

    # --- alles --------------------------------------------------------------

    def umwandeln(self, teile_liste):
        ergebnis, i = [], 0
        while i < len(teile_liste):
            t = teile_liste[i]
            txt = text_von(t).strip()
            if txt.startswith('@@BILDER|'):
                spalten = int(txt.strip('@').split('|')[1])
                zellen, zelle = [], []
                i += 1
                while text_von(teile_liste[i]).strip() != '@@BILDER_ENDE@@':
                    if text_von(teile_liste[i]).strip() == '@@ZELLE@@':
                        zellen.append(zelle)
                        zelle = []
                    else:
                        zelle.append(teile_liste[i])
                    i += 1
                zellen.append(zelle)
                ergebnis.append(self.bildraster(spalten, zellen))
            elif txt.startswith('@@CAP|'):
                ergebnis.append(self.beschriftung(txt.strip('@').split('|', 2)[2], zentriert=True))
            elif t.startswith('<w:tbl'):
                ergebnis.append(self.tabelle(t))
            else:
                p = self.absatz(t)
                # Abstand zwischen einer Tabelle und dem folgenden Text
                if ergebnis and ergebnis[-1].startswith('<w:tbl') and 'w:before="0"' in p[:200]:
                    p = p.replace('w:before="0"', 'w:before="200"', 1)
                ergebnis.append(p)
            i += 1
        return ergebnis


def spaltenbreiten(zellen, spalten, mit_kopf):
    """Spaltenbreiten (Twips) aus der Textlänge: Jede Spalte bekommt mindestens
    Platz für ihr längstes Wort, der Rest wird nach Textmenge verteilt.
    Breite pro Zeichen (9 pt): Text 95, fett 105, Code (Monospace) 110 Twips."""
    rand = 2 * 85 + 60
    mins, wunsch = [0] * spalten, [0] * spalten
    for i, zeile in enumerate(zellen):
        for j, zelle in enumerate(zeile):
            laenge, laengstes = 0, 0
            for r in re.findall(r'<w:r>.*?</w:r>', zelle, re.S):
                text = text_von(r)
                breite = 110 if 'VerbatimChar' in r else 105 if (i == 0 and mit_kopf) else 95
                laenge += len(text) * breite
                woerter = re.split(r'[\s\u200b]+', text)
                laengstes = max(laengstes, max((len(w) for w in woerter), default=0) * breite)
            mins[j] = max(mins[j], min(22 * 110, laengstes))
            wunsch[j] = max(wunsch[j], min(laenge, 70 * 95))
    mins = [max(m, 3 * 95) + rand for m in mins]
    wunsch = [max(w + rand, m) for w, m in zip(wunsch, mins)]
    if sum(wunsch) <= TEXTBREITE:
        faktor = TEXTBREITE / sum(wunsch)
        breiten = [w * faktor for w in wunsch]
    elif sum(mins) >= TEXTBREITE:
        breiten = [m * TEXTBREITE / sum(mins) for m in mins]
    else:
        rest = TEXTBREITE - sum(mins)
        extra = [w - m for w, m in zip(wunsch, mins)]
        breiten = [m + rest * e / sum(extra) for m, e in zip(mins, extra)]
    breiten = [int(b) for b in breiten]
    breiten[-1] += TEXTBREITE - sum(breiten)
    return breiten


def verzeichnis(eintraege, instr):
    """Verzeichnis als Word-Feld. Jeder Eintrag verlinkt die Textmarke und holt
    die Seitenzahl mit PAGEREF; Word und LibreOffice rechnen sie selbst aus."""
    absaetze = []
    for i, (stil, nummer, text, marke) in enumerate(eintraege):
        anfang = ''
        if i == 0:
            anfang = ('<w:r><w:fldChar w:fldCharType="begin"/></w:r>'
                      f'<w:r><w:instrText xml:space="preserve"> {instr} </w:instrText></w:r>'
                      '<w:r><w:fldChar w:fldCharType="separate"/></w:r>')
        tabs = '<w:tab w:val="right" w:leader="dot" w:pos="9062"/>'
        einzug = {'TOC1': 0, 'TOC2': 221, 'TOC3': 442}.get(stil, 0)
        abstand = '<w:spacing w:before="0" w:after="60"/>' if stil == 'TableofFigures' else ''
        nummer_xml = ''
        if nummer:
            tabs = f'<w:tab w:val="left" w:pos="{einzug + 220 + 220 * nummer.count(".")}"/>' + tabs
            nummer_xml = run(nummer) + '<w:r><w:tab/></w:r>'
        absaetze.append(
            f'<w:p><w:pPr><w:pStyle w:val="{stil}"/><w:tabs>{tabs}</w:tabs>{abstand}</w:pPr>{anfang}'
            f'<w:hyperlink w:anchor="{marke}" w:history="1">{nummer_xml}{run(text)}<w:r><w:tab/></w:r>'
            f'{feld(f"PAGEREF {marke} \\h", "1")}</w:hyperlink></w:p>')
    absaetze.append('<w:p><w:r><w:fldChar w:fldCharType="end"/></w:r></w:p>')
    return absaetze


def feldende_index(teile_liste, start):
    tiefe = 0
    for i in range(start, len(teile_liste)):
        for typ in re.findall(r'w:fldCharType="(begin|end)"', teile_liste[i]):
            tiefe += 1 if typ == 'begin' else -1
            if tiefe == 0:
                return i
    raise ValueError('Feldende nicht gefunden')


def nummerierung_zusammenfuehren(vorlage, roh, benutzt):
    """Listen-Definitionen von pandoc (numId ab 1000) in die Vorlage übernehmen."""
    nums = {m.group(1): m.group(0) for m in
            re.finditer(r'<w:num [^>]*?w:numId="(\d+)"[^>]*>.*?</w:num>', roh, re.S)}
    abstrakt = {m.group(1): m.group(0) for m in
                re.finditer(r'<w:abstractNum [^>]*?w:abstractNumId="(\d+)"[^>]*>.*?</w:abstractNum>', roh, re.S)}
    vorhandene = set(re.findall(r'w:abstractNumId="(\d+)"', vorlage))
    neue_nums, neue_abstrakt = '', ''
    for num_id in sorted(benutzt, key=int):
        if int(num_id) < 1000:
            continue
        num = nums[num_id]
        aid = re.search(r'<w:abstractNumId w:val="(\d+)"', num).group(1)
        if aid not in vorhandene:
            neue_abstrakt += abstrakt[aid]
            vorhandene.add(aid)
        neue_nums += num
    erste_num = re.search(r'<w:num [^>]*>', vorlage).start()
    vorlage = vorlage[:erste_num] + neue_abstrakt + vorlage[erste_num:]
    ende = vorlage.rindex('</w:num>') + len('</w:num>')
    return vorlage[:ende] + neue_nums + vorlage[ende:]


def main(md, vorlage, ausgabe, mermaid_dir, pandoc, lua_filter):
    with tempfile.TemporaryDirectory() as tmp:
        roh = os.path.join(tmp, 'roh.docx')
        subprocess.run([pandoc, md, '-f', 'gfm', '-o', roh, '--no-highlight',
                        '--lua-filter', lua_filter, '-M', f'mermaid-dir={mermaid_dir}',
                        '--reference-doc', vorlage,
                        '--resource-path', os.path.dirname(os.path.abspath(md))],
                       check=True)
        zr, zv = zipfile.ZipFile(roh), zipfile.ZipFile(vorlage)
        roh_doc = zr.read('word/document.xml').decode('utf-8')
        roh_rels = zr.read('word/_rels/document.xml.rels').decode('utf-8')
        v_doc = zv.read('word/document.xml').decode('utf-8')
        v_rels = zv.read('word/_rels/document.xml.rels').decode('utf-8')

        # --- Beziehungen (Bilder, Links) des neuen Inhalts übernehmen ---------
        roh_body = roh_doc[roh_doc.index('<w:body>') + 8:roh_doc.index('</w:body>')]
        neue_teile = [t for t in teile(roh_body) if not t.startswith('<w:sectPr')]
        benutzt = set(re.findall(r'r:(?:embed|id)="([^"]+)"', ''.join(neue_teile)))
        rid_map, neue_rels, neue_medien, bilddaten = {}, [], {}, {}
        for i, rid in enumerate(sorted(benutzt), 1):
            rel = re.search(rf'<Relationship [^>]*Id="{rid}"[^>]*/>', roh_rels).group(0)
            neu = f'rIdInhalt{i}'
            rid_map[rid] = neu
            rel = rel.replace(f'Id="{rid}"', f'Id="{neu}"')
            if '/image"' in rel:
                ziel = re.search(r'Target="([^"]+)"', rel).group(1)
                neues_ziel = f'media/inhalt_{i}{os.path.splitext(ziel)[1]}'
                neue_medien['word/' + neues_ziel] = bilddaten[neu] = zr.read('word/' + ziel)
                rel = rel.replace(f'Target="{ziel}"', f'Target="{neues_ziel}"')
            neue_rels.append(rel)

        # --- Vorlage zerlegen --------------------------------------------------
        v_body_start = v_doc.index('<w:body>') + 8
        v_body_ende = v_doc.index('</w:body>')
        v_teile = teile(v_doc[v_body_start:v_body_ende])

        def index_von(pred):
            return next(i for i, t in enumerate(v_teile) if pred(t))

        titel = index_von(lambda t: t.startswith('<w:tbl') and 'Semesterarbeit' in text_von(t))
        sdt_index = index_von(lambda t: t.startswith('<w:sdt') and 'TOC \\o' in t)
        toc_ende = next(i for i in range(sdt_index, len(v_teile)) if '<w:sectPr' in v_teile[i])
        assert v_teile[-1].startswith('<w:sectPr'), 'Schluss-Abschnitt nicht gefunden'

        # --- neuen Inhalt aufbereiten -----------------------------------------
        inhalt_obj = Inhalt(rid_map, bilddaten)
        inhalt = inhalt_obj.umwandeln(neue_teile)
        letztes_kapitel = inhalt_obj.nummern[0]

        # Abbildungsverzeichnis am Schluss (wie in der Vorlage)
        inhalt.append(inhalt_obj.ueberschrift(
            '<w:p><w:pPr><w:pStyle w:val="Heading1"/></w:pPr>' + run('Abbildungsverzeichnis') + '</w:p>', 1))
        inhalt += verzeichnis([('TableofFigures', '', text, marke) for text, marke in inhalt_obj.abbildungen],
                              'TOC \\h \\z \\c "Abbildung"')
        assert inhalt_obj.nummern[0] == letztes_kapitel + 1

        # --- Inhaltsverzeichnis der Vorlage ersetzen ---------------------------
        sdt = v_teile[sdt_index]
        sdt_kopf = sdt[:sdt.index('<w:sdtContent>') + len('<w:sdtContent>')]
        sdt_teile = teile(sdt[len(sdt_kopf):sdt.rindex('</w:sdtContent>')])
        toc_start = next(i for i, t in enumerate(sdt_teile) if 'TOC \\o' in t)
        toc_feld_ende = feldende_index(sdt_teile, toc_start)
        toc = verzeichnis([(f'TOC{e}', n, t, m) for e, n, t, m in inhalt_obj.ueberschriften],
                          'TOC \\o "1-3" \\h \\z \\u')
        neues_sdt = (sdt_kopf + ''.join(sdt_teile[:toc_start] + toc + sdt_teile[toc_feld_ende + 1:])
                     + '</w:sdtContent></w:sdt>')

        # --- Abschnitt für den Inhalt: Seitenzahlen ab 1, Kopfzeile mit Kapitel ---
        schluss = v_teile[-1]
        kopf_kapitel = re.search(r'<w:headerReference w:type="first" r:id="([^"]+)"', schluss).group(1)
        fuss_seite = re.search(r'<w:footerReference w:type="first" r:id="([^"]+)"', schluss).group(1)
        schluss = re.sub(r'<w:(header|footer)Reference [^>]*/>', '', schluss)
        schluss = re.sub(r'<w:titlePg\s*/>', '', schluss)
        schluss = re.sub(r'(<w:sectPr[^>]*>)', rf'\1<w:headerReference w:type="default" r:id="{kopf_kapitel}"/>'
                                               rf'<w:footerReference w:type="default" r:id="{fuss_seite}"/>', schluss)
        schluss = schluss.replace('<w:cols ', '<w:pgNumType w:start="1"/><w:cols ', 1)

        # --- zusammensetzen ----------------------------------------------------
        neu = (v_teile[:titel] + [sortiere_eigenschaften(titelblatt(v_teile[titel]))]
               + v_teile[titel + 1:sdt_index] + [sortiere_eigenschaften(neues_sdt)]
               + v_teile[sdt_index + 1:toc_ende + 1] + [sortiere_eigenschaften(t) for t in inhalt]
               + [schluss])
        body = ''.join(neu)

        # Textmarken ohne Gegenstück entfernen
        starts = set(re.findall(r'<w:bookmarkStart w:id="(\d+)"', body))
        enden = set(re.findall(r'<w:bookmarkEnd w:id="(\d+)"', body))
        for bid in starts - enden:
            body = re.sub(rf'<w:bookmarkStart w:id="{bid}"[^>]*/>', '', body)
        for bid in enden - starts:
            body = re.sub(rf'<w:bookmarkEnd w:id="{bid}"[^>]*/>', '', body)

        # Bild-IDs eindeutig machen, Alt-Text = Dateiname weg
        zaehler_bild = iter(range(1001, 100000))
        body = re.sub(r'(<wp:docPr [^>]*?)id="\d+"', lambda m: f'{m.group(1)}id="{next(zaehler_bild)}"', body)
        body = re.sub(r'(<pic:cNvPr [^>]*?)descr="[^"]*"', r'\1descr=""', body)

        doc = v_doc[:v_body_start] + body + v_doc[v_body_ende:]
        kopf = re.search(r'<w:document[^>]*>', doc).group(0)
        fehlend = ''
        for prefix, uri in re.findall(r'xmlns:(a|pic)="([^"]+)"', roh_doc):
            if f'xmlns:{prefix}=' not in kopf:
                fehlend += f' xmlns:{prefix}="{uri}"'
        doc = doc.replace(kopf, kopf[:-1] + fehlend + '>', 1)

        # nicht mehr verwendete Teile der Vorlage entfernen (Grafiken, Unterschrift)
        weg = []
        for rel in re.findall(r'<Relationship [^>]*/>', v_rels):
            rid = re.search(r'Id="([^"]+)"', rel).group(1)
            ziel = re.search(r'Target="([^"]+)"', rel).group(1)
            unbenutzt = f'"{rid}"' not in doc
            if unbenutzt and ('/image"' in rel or '/hyperlink"' in rel or ziel.startswith('ink/')):
                v_rels = v_rels.replace(rel, '')
                if 'TargetMode="External"' not in rel:
                    weg.append('word/' + ziel)
        v_rels = v_rels.replace('</Relationships>', ''.join(neue_rels) + '</Relationships>')

        content_types = zv.read('[Content_Types].xml').decode('utf-8')
        for teil in weg:
            content_types = re.sub(rf'<Override PartName="/{re.escape(teil)}"[^>]*/>', '', content_types)

        settings = zv.read('word/settings.xml').decode('utf-8')
        if '<w:updateFields' not in settings:
            settings = settings.replace('<w:hdrShapeDefaults', '<w:updateFields w:val="true"/><w:hdrShapeDefaults', 1)

        styles = zv.read('word/styles.xml').decode('utf-8').replace('</w:styles>', NEUE_STILE + '</w:styles>')
        numbering = nummerierung_zusammenfuehren(
            zv.read('word/numbering.xml').decode('utf-8'), zr.read('word/numbering.xml').decode('utf-8'),
            set(re.findall(r'<w:numId w:val="(\d+)"', ''.join(inhalt))))

        core = zv.read('docProps/core.xml').decode('utf-8')
        core = re.sub(r'<dc:title>[^<]*</dc:title>', f'<dc:title>{escape(TITEL)}</dc:title>', core)
        core = re.sub(r'<(dc:creator|cp:lastModifiedBy)>[^<]*</\1>', r'<\1></\1>', core)

        # Kopfzeile: Kapitelname über die Ebene statt über den deutschen
        # Stilnamen, damit es in jeder Word-Sprache und in LibreOffice klappt
        kopf_datei = 'word/' + re.search(rf'Id="{kopf_kapitel}"[^>]*Target="([^"]+)"|Target="([^"]+)"[^>]*Id="{kopf_kapitel}"',
                                          v_rels).group(1)

        ersetzt = {
            'word/document.xml': doc, 'word/_rels/document.xml.rels': v_rels,
            'word/settings.xml': settings, 'word/styles.xml': styles, 'word/numbering.xml': numbering,
            'docProps/core.xml': core, '[Content_Types].xml': content_types,
        }
        kopf_xml = zv.read(kopf_datei).decode('utf-8')
        ersetzt[kopf_datei] = re.sub(r'STYLEREF\s+"[^"]*"', 'STYLEREF 1', kopf_xml)

        with zipfile.ZipFile(ausgabe, 'w', zipfile.ZIP_DEFLATED) as zo:
            for item in zv.infolist():
                if item.filename in weg:
                    continue
                daten = ersetzt.get(item.filename)
                zo.writestr(item, daten.encode('utf-8') if daten is not None else zv.read(item.filename))
            for name, daten in neue_medien.items():
                zo.writestr(name, daten)

    print(f'{ausgabe}: {len(inhalt_obj.ueberschriften)} Überschriften, '
          f'{len(inhalt_obj.abbildungen)} Abbildungen, '
          f'{sum(1 for t in inhalt if t.startswith("<w:tbl"))} Tabellen')


if __name__ == '__main__':
    main(*sys.argv[1:7])
