# Testbericht Ämtli – Branch `staging`

Stand: 17.11.2026, getestet auf Commit `4343dcd` («cleaned up the repo») von [R4yl1n/Aemtli_Plan](https://github.com/R4yl1n/Aemtli_Plan/tree/staging). Python 3.12, Django 6.1.1, Chromium (Playwright), frische SQLite-DB.

Massstab ist die Anforderungsdoku in [`../docs/`](../docs/README.md) (Stories, Akzeptanzkriterien, Entscheide E-01 bis E-25, Randbedingungen). Erstellt mit KI-Unterstützung, siehe [KI-Einsatz](../docs/ki-einsatz.md), Eintrag vom 17.11.2026.

## Inhalt

| Datei | Zweck |
|---|---|
| `BERICHT.md` | Dieser Bericht |
| `e2e_rundgang.py` | Browser-Rundgang mit Playwright (24 Prüfungen), wiederholbar |
| `e2e_ergebnisse.json` | Rohresultate des Rundgangs |
| `screenshots/` | 12 Screenshots (Desktop 1280 px, Handy 375 px) |

## 1. Zusammenfassung

| Prüfung | Ergebnis |
|---|---|
| `python manage.py test` | ✅ 44/44 grün (alle in `wg/tests.py`) |
| Testabdeckung (`coverage`, ohne Migrationen) | ✅ 98 % |
| `python manage.py check` / `makemigrations --check` | ✅ ohne Befund |
| `check --deploy` mit `DJANGO_DEBUG=0` | ❌ 1 Fehler, 6 Warnungen (Abschnitt 5) |
| Browser-Rundgang | ⚠️ 16/24 bestanden |
| Akzeptanzkriterien F1 (Demo 1, 12.11.) | ⚠️ 7 von 8 Stories umgesetzt, US-F1-07 fehlt |

**Fazit:** F1 ist sauber umgesetzt und gut getestet. Dass F2 und F3 auf `staging` fehlen, ist laut Zeitplan in Ordnung (F2 bis Demo 2 am 15.12., F3 bis zur Abgabe am 15.01.). Wichtiger sind: **US-F1-07 «WG umbenennen» fehlt**, **die Doku ist an mehreren Stellen nicht mehr auf dem Stand des Codes** (Abschnitt 3), und der laut KI-Log fertige F2-Branch `feature/aemtli-plan` ist **nicht auf GitHub**, also für das Team nicht sichtbar.

## 2. Browser-Rundgang

| # | Prüfung | Ergebnis | Bezug | Detail |
|---|---|---|---|---|
| 1 | Ohne Login → Login-Seite | ✅ | US-F1-01/4 | `/accounts/login/?next=/` |
| 2 | Schwaches Passwort abgelehnt | ✅ | US-F1-01/1 | Meldungen auf Deutsch |
| 3 | Registrierung loggt ein → WG-Start | ✅ | US-F1-01/1, F1-02/5 | |
| 4 | WG-Name max. 100 Zeichen | ✅ | | `maxlength` |
| 5 | HTML im WG-Namen wird als Text angezeigt | ✅ | QM Sicherheit | kein XSS |
| 6 | Einladungscode 8 Zeichen | ✅ | US-F1-02/2 | z. B. `L5xf1fU0` |
| 7 | Code ohne verwechselbare Zeichen | ❌ | QM Benutzbarkeit | `L5xf1fU0` enthält `1` und `0` |
| 8 | Kopieren-Button / Einladungslink | ❌ | QM Benutzbarkeit | Code muss abgetippt werden |
| 9–12 | Navigation und Seiten für F2/F3 | ❌ | F2, F3 | 404 – erwartet bis Demo 2 / Abgabe |
| 13 | Beitritt mit Code in Kleinbuchstaben | ❌ | QM Benutzbarkeit | «Ungültiger Einladungscode» |
| 14 | Beitritt mit korrektem Code | ✅ | US-F1-03/1 | |
| 15 | Mitglied sieht keine Admin-Buttons | ✅ | US-F1-04/4 | |
| 16 | Mitglied erhält 403 bei «WG löschen» | ✅ | US-F1-08/4 | Seite ohne Layout (4.3) |
| 17 | Falsches Passwort → Fehlermeldung | ✅ | | |
| 18 | Rolle wechseln in beide Richtungen | ✅ | US-F1-04/2 | |
| 19–20 | Entfernen mit Bestätigung | ✅ | US-F1-04/1 | |
| 21 | «Code erneuern» fragt nach | ❌ | US-F1-05 | sofort ersetzt, alter Code ungültig |
| 22 | Handy 375 px ohne horizontales Scrollen | ✅ | QM Benutzbarkeit | |
| 23 | WG löschen → WG-Start | ✅ | US-F1-08/1–3 | Bestätigung zeigt Anzahl Betroffene |
| 24 | Alle Eingabefelder mit `<label>` | ✅ | Persona Marco | |

## 3. Abgleich mit der Anforderungsdoku

### 3.1 Stories F1

| Story | Stand Code `staging` |
|---|---|
| US-F1-01 Konto | ✅ umgesetzt und getestet |
| US-F1-02 WG gründen | ✅ |
| US-F1-03 Beitreten | ✅ (auch /3 inzwischen getestet) |
| US-F1-04 Verwalten | ✅ inkl. Admin → Mitglied, Entfernen jetzt mit Bestätigung |
| US-F1-05 Code erneuern | ✅ funktional; ohne Rückfrage (4.3) |
| US-F1-06 Verlassen | ⚠️ /3 weicht ab, siehe 3.2 |
| **US-F1-07 Umbenennen** | ❌ **fehlt** (keine View, keine URL, kein Test) |
| US-F1-08 Löschen | ✅ |

### 3.2 Doku und Code widersprechen sich

| Stelle in der Doku | Doku sagt | Code macht | Vorschlag |
|---|---|---|---|
| US-F1-06/3, E-04 | Verlässt die letzte Person die WG, wird sie gelöscht. | WG bleibt ohne Mitglieder bestehen, Code wird ersetzt (Rays Entscheid vom 31.10., im KI-Log). | Story und E-04 nachführen, neuen Entscheid E-26 eintragen. |
| E-19 | «Die Mitgliedschaft wird beim Austritt gelöscht.» | Soft-Delete über `ausgetreten_am`. | Begründung in E-19 anpassen. |
| `06_testabdeckung.md` | Stand 13.10., 25 Tests, Python 3.14.4; Testnamen wie `test_letzte_person_loescht_wg`, `test_letzter_admin_bleibt`. | 44 Tests; diese Namen gibt es nicht mehr. Mehrere als «fehlend» gelistete Tests existieren inzwischen (z. B. US-F1-03/3, US-F1-04/2). | Tabelle neu erstellen. |
| `04_features_userstories.md`, «Lücken» | US-F1-04: Entfernen ohne Rückfrage. | Entfernen hat eine Bestätigungsseite. | Zeile streichen. |
| E-02 | Alle Mitglieder sehen den Code. | ✅ stimmt. | – |
| KI-Log 10.11. | F2 auf `feature/aemtli-plan`, Feld `intervall_wochen` entfernt, 93 Tests. | Branch nicht auf GitHub; `staging` hat noch `intervall_wochen` und 44 Tests. | Branch pushen und PR gegen `staging` öffnen, damit das Team reviewen kann. |

### 3.3 Vorbereitung F3 (Modell)

`finanzen/models.py` enthält nur `Ausgabe(wg, zahler, beschreibung)`. Für E-09 bis E-13, E-15 und E-21 fehlen:

- `betrag = DecimalField(max_digits=10, decimal_places=2)` (nie `FloatField` für Geld; E-10 verlangt 5-Rappen-Rundung),
- `datum`, `erfasst_von` (für E-13 «nur erfassende Person und Admins dürfen ändern»),
- die Beteiligten (E-09), z. B. `ManyToManyField` oder Modell `Anteil(ausgabe, user, betrag)`,
- Modell `Rueckzahlung` (E-12).

`on_delete=CASCADE` bei `Ausgabe.zahler` und `AemtliZuteilung.user` löscht Historie mit, falls je ein Konto gelöscht wird. Laut E-19 und US-F1-06/4 soll sie erhalten bleiben → `PROTECT`.

## 4. Verbesserungsvorschläge

### 4.1 Hoch

1. **US-F1-07 umsetzen** (Formular wie `WGForm`, View mit `@nur_wg_admin`, 3 Tests für die 3 Kriterien).
2. **Doku nachführen** (3.2), vor allem `06_testabdeckung.md`: Die Testabdeckung ist laut README eine Abgabepflicht.
3. **F2-Branch pushen**, damit Code und KI-Log übereinstimmen.
4. **Haupt-README** um umgesetzte Features und manuelle End-to-End-Tests ergänzen (offener Punkt 5 der Doku). Der Rundgang `e2e_rundgang.py` kann als Vorlage dienen.

### 4.2 Mittel – Einladungscode (`wg/models.py:264`)

- `random.choices` ist nicht für Sicherheitszwecke gedacht → `secrets.choice`. Der Zielkonflikt in F1 setzt voraus, dass der Code «zufällig und schwer zu erraten» ist.
- Docstring sagt «32-stellig, uuid4», erzeugt werden 8 Zeichen; `import uuid` ist ungenutzt.
- Gross-/Kleinschreibung zählt, verwechselbare Zeichen kommen vor (Prüfungen 7 und 13). Vorschlag:
  ```python
  ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"  # ohne 0/O, 1/I/L
  def neuer_einladungscode():
      return "".join(secrets.choice(ALPHABET) for _ in range(8))
  ```
  und in `BeitrittForm.clean` mit `.strip().upper()` normalisieren.
- Bei einer Kollision (`unique=True`) kein neuer Versuch → seltener `IntegrityError`. Schleife mit max. 5 Versuchen.
- Keine Begrenzung von Fehlversuchen beim Beitritt und Login (optional, z. B. Zähler in der Session).

### 4.3 Mittel – Bedienung

- **Kopieren-Button** (`navigator.clipboard.writeText`) oder Einladungslink `/wg/start/?code=…`, der das Feld vorbefüllt.
- **«Code erneuern» mit Bestätigung** wie bei den anderen folgenreichen Aktionen.
- **Eigene `403.html`/`404.html`** mit `{% extends "base.html" %}` und Link zurück zur WG; heute erscheint nur «403 Forbidden» ohne Navigation (`screenshots/07-403-seite.png`).
- Einladungscode in Pink auf Weiss: Kontrast für Persona Marco prüfen (WCAG AA 4.5:1).

### 4.4 Niedrig – Code- und Repo-Pflege

- **Doppelte Commits auf `staging`:** sieben Commits (u. a. «cleaned up the repo», «Einladungcode verkürzt», «Benutzer-Modell reparieren») liegen je zweimal in der Historie, weil Rebase und Merge gemischt wurden. Künftig nur eines von beiden; die Historie jetzt nicht mehr umschreiben.
- Registrierungs-Tests liegen in `wg/tests.py`, gehören nach `accounts/tests.py`; `aemtli/tests.py` und `finanzen/tests.py` sind leere Vorlagen.
- `aemtli_plan/settings.py:65–66`: Komma nach `'DIRS'` auf eigener Zeile.
- `aemtli/models.py`, `finanzen/models.py`: kein Zeilenumbruch am Dateiende, keine Docstrings (anders als `wg/`).

## 5. Betrieb (`check --deploy`)

| Meldung | Bedeutung | Vorschlag |
|---|---|---|
| `mail.E001` | `MAILERS` nutzt das Konsolen-Backend | Für die Abgabe ok (E-16: keine E-Mail) |
| `security.W020` | `ALLOWED_HOSTS` leer | aus Umgebungsvariable `DJANGO_ALLOWED_HOSTS` lesen, Standard `localhost,127.0.0.1` |
| `security.W009` | Fallback-`SECRET_KEY` `django-insecure-…` | bei `DEBUG=0` ohne Schlüssel abbrechen |
| `security.W004/W008/W012/W016` | HSTS, SSL-Redirect, Secure-Cookies | nur hinter HTTPS, gebündelt unter `if not DEBUG:` |

Für die Abgabe zählt laut Randbedingungen «läuft auf einem frischen Laptop»; das ist mit den Standardwerten erfüllt.

## 6. Was gut ist

- Rechteprüfung zentral über Decorators (`wg/permissions.py`), von F2/F3 wiederverwendbar.
- «Höchstens eine aktive WG» (E-01) als DB-Constraint, mit `transaction.atomic()` gegen Doppelklick und eigenen Tests.
- Soft-Delete der Mitgliedschaft erhält die Historie (US-F1-06/4).
- GET ändert nie Daten; Änderungen nur per POST mit CSRF; Bestätigungsseiten vor destruktiven Aktionen.
- Bootstrap lokal (E-18), mobil ohne horizontales Scrollen, alle Felder beschriftet, Meldungen auf Deutsch.
- Kein Django-Admin (Randbedingung) eingehalten.

## 7. Reproduzieren

Im Repo `Aemtli_Plan`, Branch `staging`:

```bash
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt coverage playwright
playwright install chromium

python manage.py test
coverage run manage.py test && coverage report --omit='*/migrations/*'
DJANGO_DEBUG=0 python manage.py check --deploy

python manage.py migrate
python manage.py runserver            # zweites Terminal:
BASE=http://127.0.0.1:8000 python e2e_rundgang.py
```
