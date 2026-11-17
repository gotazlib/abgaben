"""Browser-Rundgang durch die App (Branch staging) mit Playwright.

Läuft gegen einen laufenden Dev-Server mit frischer DB und legt Screenshots in screenshots/ ab.
Aufruf:
    pip install playwright && playwright install chromium
    python manage.py migrate && python manage.py runserver
    BASE=http://127.0.0.1:8000 python e2e_rundgang.py
"""
import json
import os
import time
from pathlib import Path

from playwright.sync_api import sync_playwright

BASE = os.environ.get("BASE", "http://127.0.0.1:8000")
HIER = Path(__file__).parent
OUT = HIER / "screenshots"
OUT.mkdir(exist_ok=True)
PW = "Sicheres-Passwort-2026"
SUFFIX = str(int(time.time()))[-5:]  # damit das Skript mehrmals gegen dieselbe DB laufen kann
ergebnisse = []


def check(name, ok, detail=""):
    ergebnisse.append({"test": name, "ok": bool(ok), "detail": detail})
    print(("PASS " if ok else "FAIL ") + name + (f"  ({detail})" if detail else ""))


def shot(page, name):
    page.screenshot(path=str(OUT / f"{name}.png"), full_page=True)


def registrieren(page, user, pw1=PW, pw2=PW):
    page.goto(f"{BASE}/accounts/register/")
    page.fill("input[name=username]", user)
    page.fill("input[name=password1]", pw1)
    page.fill("input[name=password2]", pw2)
    page.click("main button[type=submit]")


def logout(page):
    page.click("nav button:has-text('Logout')")


with sync_playwright() as p:
    browser = p.chromium.launch(executable_path=os.environ.get("CHROME") or None)
    ctx = browser.new_context(viewport={"width": 1280, "height": 900})
    page = ctx.new_page()
    anna, bruno = f"anna{SUFFIX}", f"bruno{SUFFIX}"

    page.goto(BASE + "/")
    check("Startseite leitet ohne Login zum Login", "/accounts/login/" in page.url, page.url)
    shot(page, "01-login")

    registrieren(page, anna, "1234", "1234")
    fehler = page.locator(".invalid-feedback, .alert-danger, .errorlist").all_inner_texts()
    check("Schwaches Passwort wird abgelehnt", "/register/" in page.url and bool(fehler), " | ".join(fehler)[:200])
    shot(page, "02-register-schwaches-passwort")

    registrieren(page, anna)
    check("Registrierung loggt ein und führt zu WG-Start", "/wg/start/" in page.url, page.url)
    shot(page, "03-wg-start")

    page.fill("input[name=name]", "x" * 101)
    check("WG-Name auf 100 Zeichen begrenzt", len(page.input_value("input[name=name]")) == 100)

    name = "<b>Sonnenweg</b> 12"
    page.fill("input[name=name]", name)
    page.click("form[action$='/wg/erstellen/'] button")
    check("Sonderzeichen im WG-Namen werden als Text angezeigt", name in page.inner_text("h1"))
    shot(page, "04-wg-detail-admin")
    code = page.inner_text("code").strip()
    check("Einladungscode hat 8 Zeichen", len(code) == 8, code)
    check("Code ohne verwechselbare Zeichen (0/O, 1/l/I)", not (set(code) & set("0O1lI")), code)
    check("Kopieren-Button oder Einladungslink vorhanden",
          page.locator("button:has-text('Kopieren'), a:has-text('Einladungslink')").count() > 0)

    nav = page.inner_text("nav")
    check("Navigation enthält Ämtliplan (F2)", "plan" in nav.lower(), nav.replace("\n", " / "))
    check("Navigation enthält Ausgaben (F3)", any(w in nav for w in ("Ausgaben", "Finanzen", "Saldo")))
    for pfad in ["/aemtli/", "/finanzen/"]:
        r = page.goto(BASE + pfad)
        check(f"Seite {pfad} vorhanden", r.status == 200, f"HTTP {r.status}")
    page.goto(BASE + "/wg/")
    logout(page)

    registrieren(page, bruno)
    page.fill("input[name=code]", code.lower())
    page.click("form[action$='/wg/beitreten/'] button")
    klein_ok = page.url.rstrip("/").endswith("/wg")
    check("Beitritt mit Code in Kleinbuchstaben", klein_ok, "Code klein eingetippt")
    shot(page, "05-beitritt-code-kleinbuchstaben")
    if not klein_ok:
        page.goto(BASE + "/wg/start/")
        page.fill("input[name=code]", code)
        page.click("form[action$='/wg/beitreten/'] button")
    check("Bruno ist beigetreten", bruno in page.inner_text("main"), page.url)
    check("Mitglied sieht keine Admin-Buttons", page.locator("text=Code erneuern").count() == 0)
    shot(page, "06-wg-detail-mitglied")
    r = page.goto(BASE + "/wg/loeschen/")
    check("Mitglied bekommt 403 bei WG löschen", r.status == 403, f"HTTP {r.status}")
    shot(page, "07-403-seite")
    page.goto(BASE + "/wg/")
    logout(page)

    page.goto(f"{BASE}/accounts/login/")
    page.fill("input[name=username]", anna)
    page.fill("input[name=password]", "falsch")
    page.click("main button[type=submit]")
    check("Falsches Passwort zeigt Fehlermeldung", "/login/" in page.url and page.locator(".alert-danger, .errorlist, .invalid-feedback").count() > 0)
    shot(page, "08-login-falsch")
    page.fill("input[name=username]", anna)
    page.fill("input[name=password]", PW)
    page.click("main button[type=submit]")

    page.click("button:has-text('Rolle wechseln')")
    check("Rolle wechseln: Bruno wird Admin", page.locator(f"li:has-text('{bruno}') .badge").inner_text() == "Admin")
    page.click("button:has-text('Rolle wechseln')")
    page.click("a:has-text('Entfernen')")
    shot(page, "09-entfernen-bestaetigung")
    check("Entfernen fragt nach Bestätigung", "/entfernen/" in page.url)
    page.click("main button[type=submit]")
    check("Bruno wurde entfernt", bruno not in page.inner_text("main ul"))

    alt = page.inner_text("code").strip()
    page.click("button:has-text('Code erneuern')")
    neu = page.inner_text("code").strip()
    check("Code erneuern fragt vorher nach", alt == neu or "/code-erneuern/" in page.url, f"{alt} -> {neu} ohne Rückfrage")

    mob = browser.new_context(viewport={"width": 375, "height": 740}, storage_state=ctx.storage_state())
    mp = mob.new_page()
    mp.goto(BASE + "/wg/")
    breite = mp.evaluate("document.documentElement.scrollWidth")
    check("Mobile 375px ohne horizontales Scrollen", breite <= 375, f"scrollWidth {breite}")
    shot(mp, "10-mobile-detail")
    mp.click(".navbar-toggler")
    mp.wait_for_timeout(500)
    shot(mp, "11-mobile-menue")
    mob.close()

    page.goto(BASE + "/wg/")
    page.click("a:has-text('WG löschen')")
    shot(page, "12-loeschen-bestaetigung")
    page.click("main button[type=submit]")
    check("WG löschen führt zurück zu WG-Start", "/wg/start/" in page.url, page.url)

    ohne_label = page.evaluate("""[...document.querySelectorAll('main input:not([type=hidden])')]
        .filter(i => !(i.labels && i.labels.length)).map(i => i.name)""")
    check("Alle Eingabefelder haben ein <label>", not ohne_label, str(ohne_label))
    browser.close()

(HIER / "e2e_ergebnisse.json").write_text(json.dumps(ergebnisse, ensure_ascii=False, indent=2) + "\n")
print(f"\n{sum(e['ok'] for e in ergebnisse)}/{len(ergebnisse)} Prüfungen bestanden")
