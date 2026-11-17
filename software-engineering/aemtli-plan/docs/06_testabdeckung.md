# Testabdeckung: Akzeptanzkriterien ↔ automatisierte Tests

> Stand 13.10.2026. Alle 25 Tests in `wg/tests.py` laufen grün (`python manage.py test`, Python 3.14.4).
> Notation: US-F1-02/3 = Akzeptanzkriterium 3 der Story US-F1-02.

## F1: vorhandene Tests

| Test in `wg/tests.py` | deckt ab |
|---|---|
| `RegistrierungLoginTests.test_registrieren_loggt_ein` | US-F1-01/1 |
| `RegistrierungLoginTests.test_login_noetig` | US-F1-01/4 |
| `WGErstellenTests.test_ersteller_ist_admin_und_code_vorhanden` | US-F1-02/1, US-F1-02/2 |
| `WGErstellenTests.test_leerer_name_wird_abgelehnt` | US-F1-02/3 |
| `WGErstellenTests.test_zweite_wg_nicht_moeglich` | US-F1-02/4 |
| `WGErstellenTests.test_home_ohne_wg_leitet_zu_start` | US-F1-02/5 |
| `BeitrittTests.test_beitritt_mit_gueltigem_code` | US-F1-03/1 |
| `BeitrittTests.test_beitritt_mit_ungueltigem_code` | US-F1-03/2 |
| `BeitrittTests.test_alter_code_nach_erneuern_ungueltig` | US-F1-05/1 |
| `BeitrittTests.test_mitglied_kann_code_nicht_erneuern` | US-F1-05/2 |
| `VerwaltungTests.test_admin_entfernt_mitglied` | US-F1-04/1 |
| `VerwaltungTests.test_rolle_wechseln` | US-F1-04/2 (nur Mitglied → Admin) |
| `VerwaltungTests.test_letzter_admin_bleibt` | US-F1-04/3 |
| `VerwaltungTests.test_mitglied_darf_nicht_entfernen` | US-F1-04/4 (nur Entfernen) |
| `VerwaltungTests.test_fremde_wg_nicht_verwaltbar` | US-F1-04/5 |
| `VerwaltungTests.test_detail_zeigt_mitglieder` | US-F1-03/4 |
| `VerlassenTests.test_mitglied_verlaesst_wg` | US-F1-06/1 |
| `VerlassenTests.test_nach_verlassen_neu_beitreten` | US-F1-06/1 |
| `VerlassenTests.test_einziger_admin_kann_nicht_verlassen` | US-F1-06/2 |
| `VerlassenTests.test_admin_kann_nach_rollenweitergabe_verlassen` | US-F1-06/2 |
| `VerlassenTests.test_letzte_person_loescht_wg` | US-F1-06/3 |
| `VerlassenTests.test_verlassen_braucht_bestaetigung` | US-F1-06/5 |
| `LoeschenTests.test_admin_loescht_wg` | US-F1-08/1, US-F1-08/2 |
| `LoeschenTests.test_loeschen_braucht_bestaetigung` | US-F1-08/3 |
| `LoeschenTests.test_mitglied_darf_nicht_loeschen` | US-F1-08/4 |

## F1: fehlende Tests

| Kriterium | Was fehlt |
|---|---|
| US-F1-01/2 | Ein vergebener Benutzername wird abgelehnt. |
| US-F1-01/3 | Ungleiche Passwörter werden abgelehnt. |
| US-F1-01/5 | Nach dem Abmelden sind keine WG-Daten mehr sichtbar. |
| US-F1-03/3 | Wer schon in einer WG ist, kann keiner zweiten beitreten. |
| US-F1-04/2 | Die Richtung Admin → Mitglied ist nicht getestet. |
| US-F1-04/4 | Ein Mitglied darf keine Rollen ändern. |
| US-F1-04/6 | Ein entferntes Mitglied kann neu beitreten. |
| US-F1-05/3 | Nach dem Erneuern des Codes bleiben alle Mitglieder in der WG. |
| US-F1-06/4 | Wird mit F3 getestet. |
| US-F1-07/1–3 | Keine Tests, weil die Funktion noch fehlt. |

## F2, F3, F4

Hier gibt es noch keine Tests. Pro Akzeptanzkriterium ist mindestens ein Test geplant. Bei F3 kommen Tests für die Berechnungsbeispiele dazu: 10.00/3, 20.00/3 und 48.60/4. Ausserdem soll geprüft werden, dass die Summe aller Saldi genau 0.00 ergibt.
