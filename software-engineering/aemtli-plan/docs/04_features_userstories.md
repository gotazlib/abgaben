# Features und User Stories

> Status: Entwurf vom 13.10.2026. Die fachlichen Entscheide dahinter stehen im [Entscheidungslog](entscheidungslog.md) (E-xx).

**Begriffe:** Eine *Woche* dauert von Montag 00:00 bis Sonntag 23:59. *Admin* ist ein Mitglied mit Verwaltungsrechten in seiner WG. Beträge sind in CHF.

| Feature | Stories | Umsetzung |
|---|---|---|
| F1 WG und Mitbewohner | US-F1-01 bis US-F1-08 | Demo 1 (12.11.) |
| F2 Ämtliplan mit Rotation | US-F2-01 bis US-F2-06 | Demo 2 (15.12.) |
| F3 Gemeinsame Ausgaben | US-F3-01 bis US-F3-05 | Abgabe (15.01.) |
| F4 Einkaufsliste | US-F4-01 bis US-F4-03 | nur spezifiziert, Bonus |

---

## F1: WG erstellen und Mitbewohner einladen

### Funktionalität
Personen erstellen ein Konto, gründen eine WG oder treten ihr mit einem Einladungscode bei. Admins verwalten Mitglieder, Rollen und den Code. Stories: US-F1-01 bis US-F1-08.

### User Stories

**US-F1-01 Konto erstellen und anmelden**
Als neue Mitbewohnerin möchte ich ein Konto erstellen und mich anmelden, damit nur ich meine WG-Daten sehe und verändere.
1. Wenn ich einen freien Benutzernamen und zweimal dasselbe gültige Passwort eingebe, dann wird mein Konto erstellt und ich bin angemeldet.
2. Wenn der Benutzername schon vergeben ist, dann wird kein Konto erstellt und ich sehe eine Fehlermeldung.
3. Wenn die beiden Passwörter nicht übereinstimmen, dann wird kein Konto erstellt und ich sehe eine Fehlermeldung.
4. Wenn ich nicht angemeldet bin und eine WG-Seite aufrufe, dann werde ich zur Anmeldung geführt.
5. Wenn ich mich abmelde, dann sehe ich keine WG-Daten mehr, bis ich mich wieder anmelde.

**US-F1-02 WG gründen**
Als Lena möchte ich eine WG gründen, damit wir unseren Haushalt an einem Ort organisieren können.
1. Wenn ich noch in keiner WG bin und einen Namen eingebe, dann wird die WG gegründet und ich bin ihre Admin.
2. Wenn eine WG gegründet wird, dann erhält sie automatisch einen Einladungscode.
3. Wenn ich keinen Namen eingebe, dann wird keine WG gegründet und ich sehe eine Fehlermeldung.
4. Wenn ich bereits in einer WG bin, dann kann ich keine weitere WG gründen.
5. Wenn ich angemeldet, aber in keiner WG bin, dann werde ich zur Auswahl «WG gründen oder beitreten» geführt.

**US-F1-03 Mit Code beitreten**
Als Sara möchte ich mit einem Einladungscode einer WG beitreten, damit ich ohne Aufwand dazugehöre.
1. Wenn ich einen gültigen Code eingebe, dann bin ich Mitglied dieser WG mit der Rolle «Mitglied».
2. Wenn ich einen ungültigen Code eingebe, dann trete ich keiner WG bei und sehe eine Fehlermeldung.
3. Wenn ich bereits in einer WG bin, dann kann ich keiner weiteren WG beitreten.
4. Wenn ich beigetreten bin, dann sehe ich alle Mitbewohnenden der WG mit ihrer Rolle.

**US-F1-04 Mitglieder verwalten**
Als Admin möchte ich Mitglieder entfernen und Rollen vergeben, damit die Mitgliederliste der echten WG entspricht.
1. Wenn ich ein Mitglied entferne, dann gehört es nicht mehr zur WG.
2. Wenn ich die Rolle eines Mitglieds wechsle, dann wird es Admin; wenn ich die Rolle eines Admins wechsle, dann wird er Mitglied.
3. Wenn ich der einzige Admin bin, dann kann ich mich weder entfernen noch zum Mitglied machen.
4. Wenn ein normales Mitglied versucht, jemanden zu entfernen oder eine Rolle zu ändern, dann wird das verweigert.
5. Wenn ich versuche, ein Mitglied einer anderen WG zu verwalten, dann wird das verweigert.
6. Wenn ein Mitglied entfernt wurde, dann bleibt sein Konto bestehen, und es kann einer WG neu beitreten.

**US-F1-05 Einladungscode erneuern**
Als Lena möchte ich den Einladungscode erneuern, damit niemand Fremdes mit einem weitergegebenen Code beitreten kann.
1. Wenn ich als Admin den Code erneuere, dann hat die WG einen neuen Code und der alte ist ungültig.
2. Wenn ein normales Mitglied versucht, den Code zu erneuern, dann wird das verweigert.
3. Wenn der Code erneuert wird, dann bleiben alle bisherigen Mitglieder in der WG.

**US-F1-06 WG verlassen**
Als Mitbewohner möchte ich die WG verlassen, damit ich nach dem Auszug nicht mehr eingeplant werde.
1. Wenn ich die WG verlasse, dann bin ich nicht mehr Mitglied und kann eine WG gründen oder beitreten.
2. Wenn ich der einzige Admin bin und es weitere Mitglieder gibt, dann kann ich die WG erst verlassen, wenn ich die Admin-Rolle weitergegeben habe.
3. Wenn ich als letzte Person die WG verlasse, dann wird die WG mit allen ihren Daten gelöscht.
4. Wenn ich die WG verlasse, dann bleiben meine bisherigen Ausgaben und Zahlungen für die anderen sichtbar.
5. Wenn ich die WG verlassen will, dann muss ich das zuerst bestätigen.

**US-F1-07 WG umbenennen** *(Lücke, noch nicht umgesetzt)*
Als Admin möchte ich den Namen der WG ändern, damit er nach einem Umzug noch stimmt.
1. Wenn ich als Admin einen neuen Namen speichere, dann sehen alle Mitglieder den neuen Namen.
2. Wenn ich keinen Namen eingebe, dann bleibt der alte Name bestehen und ich sehe eine Fehlermeldung.
3. Wenn ein normales Mitglied versucht, den Namen zu ändern, dann wird das verweigert.

**US-F1-08 WG löschen**
Als Admin möchte ich die ganze WG löschen, damit nach der Auflösung der WG keine Daten zurückbleiben.
1. Wenn ich als Admin die WG lösche, dann gibt es sie mit allen ihren Daten nicht mehr.
2. Wenn die WG gelöscht wurde, dann bleiben die Konten aller ehemaligen Mitglieder bestehen, und alle können eine WG gründen oder beitreten.
3. Wenn ich die WG löschen will, dann muss ich das zuerst bestätigen, und ich sehe, wie viele Personen betroffen sind.
4. Wenn ein normales Mitglied versucht, die WG zu löschen, dann wird das verweigert.

### Lücken zwischen Stories und Code (Stand 13.10.2026)

| Story | Lücke |
|---|---|
| US-F1-06 / 4 | Kann erst mit F3 geprüft werden, weil es noch keine Ausgaben gibt. Sonst seit dem 13.10.2026 umgesetzt. |
| US-F1-07 | «WG umbenennen» fehlt vollständig. |
| US-F1-04 / 2 | Das Wechseln vom Admin zum Mitglied ist umgesetzt, aber nicht getestet. |
| US-F1-04 | Entfernen geschieht ohne Rückfrage. Eine Bestätigung wäre sinnvoll, ist aber kein Akzeptanzkriterium. |
| US-F1-03 / 3 | Ist umgesetzt, aber nicht getestet. |

Welche Tests welches Kriterium abdecken, steht in [06_testabdeckung.md](06_testabdeckung.md).

### Qualitätsmerkmale
1. **Sicherheit (Zugriffsschutz):** Wer nicht zur WG gehört, darf keine Daten sehen oder verändern. In F1 werden Zugang und Rollen festgelegt, auf denen F2 und F3 aufbauen.
2. **Benutzbarkeit beim Einstieg:** Zum Beitreten soll ein Code reichen, ohne E-Mail-Bestätigung und ohne Admin-Freigabe. Sonst brechen neue Mitbewohnende wie Sara ab.

**Zielkonflikt:** Ein einfacher Code ist bequem, aber wer ihn kennt, kommt hinein. Wir nehmen das in Kauf und mildern es ab: Der Code ist zufällig und schwer zu erraten, Admins können ihn erneuern und Unbekannte entfernen. Eine Freigabe jedes Beitritts durch einen Admin wäre sicherer, haben wir aber verworfen (E-03).

---

## F2: Ämtliplan mit Rotation und Abhaken

### Funktionalität
Admins legen die Ämtli der WG fest. Jede Woche werden sie automatisch reihum neu zugeteilt. Jede Person sieht ihr Ämtli und hakt es ab. Stories: US-F2-01 bis US-F2-06.

### User Stories

**US-F2-01 Ämtli verwalten**
Als Lena (Admin) möchte ich Ämtli erfassen, ändern und löschen, damit der Plan unserem Haushalt entspricht.
1. Wenn ich als Admin ein Ämtli mit Namen erfasse, dann erscheint es ab der laufenden Woche im Plan.
2. Wenn ich keinen Namen eingebe, dann wird kein Ämtli erfasst und ich sehe eine Fehlermeldung.
3. Wenn es in der WG schon ein Ämtli mit diesem Namen gibt, dann wird das neue abgelehnt.
4. Wenn ich ein Ämtli umbenenne, dann sehen alle den neuen Namen.
5. Wenn ich ein Ämtli lösche, dann erscheint es nicht mehr im Plan der laufenden und der kommenden Wochen.
6. Wenn ein normales Mitglied versucht, ein Ämtli zu erfassen, zu ändern oder zu löschen, dann wird das verweigert.

**US-F2-02 Mein Ämtli der Woche sehen**
Als Marco möchte ich sofort sehen, was ich diese Woche erledigen muss, damit ich nichts vergesse.
1. Wenn ich angemeldet bin, dann sehe ich als Erstes meine Ämtli der laufenden Woche.
2. Wenn mir diese Woche kein Ämtli zugeteilt ist, dann sehe ich den Hinweis, dass ich frei habe.
3. Wenn ich den Plan öffne, dann sehe ich für die laufende Woche alle Ämtli mit der zuständigen Person und ihrem Status.
4. Wenn ein Ämtli erledigt ist, dann ist das auch ohne Farben erkennbar, z.B. an einem Text oder Symbol.
5. Wenn ich den Plan öffne, dann sehe ich, welche Daten die laufende Woche umfasst.

**US-F2-03 Ämtli abhaken**
Als Marco möchte ich mein Ämtli als erledigt markieren, damit die anderen sehen, dass es gemacht ist.
1. Wenn ich mein Ämtli der laufenden Woche abhake, dann sehen alle, dass es erledigt ist, und von wem.
2. Wenn ich mich vertan habe, dann kann ich das Abhaken in der laufenden Woche rückgängig machen.
3. Wenn ich versuche, das Ämtli einer anderen Person abzuhaken, dann wird das verweigert.
4. Wenn eine Woche vorbei ist, dann kann ihr Status nicht mehr geändert werden.

**US-F2-04 Automatische Wochenrotation**
Als Lena möchte ich, dass die Ämtli jede Woche automatisch weitergegeben werden, damit niemand immer dasselbe machen muss und niemand den Plan pflegen muss.
1. Wenn eine neue Woche beginnt, dann ist jedes Ämtli einer Person zugeteilt, ohne dass jemand etwas tun muss.
2. Wenn eine neue Woche beginnt, dann erhält jedes Ämtli die nächste Person in einer festen Reihenfolge der Mitglieder.
3. Wenn es gleich viele Ämtli wie Mitglieder gibt, dann hat jede Person pro Woche genau ein Ämtli, und nach so vielen Wochen, wie es Mitglieder gibt, hat jede Person jedes Ämtli genau einmal gemacht.
4. Wenn es mehr Ämtli als Mitglieder gibt, dann haben einzelne Personen mehrere Ämtli; wenn es weniger gibt, dann haben einzelne Personen frei.
5. Wenn jemand neu beitritt, dann wird er ab der nächsten Woche eingeplant.
6. Wenn jemand die WG verlässt oder entfernt wird, dann wird er ab der nächsten Woche nicht mehr eingeplant, und seine offenen Ämtli der laufenden Woche entfallen.
7. Wenn ein Ämtli in einer Woche nicht erledigt wurde, dann rotiert es trotzdem normal weiter.

**US-F2-05 Verlauf sehen**
Als Lena möchte ich sehen, wer in den letzten Wochen was erledigt hat, damit die Verteilung nachvollziehbar und fair bleibt.
1. Wenn ich den Verlauf öffne, dann sehe ich für die letzten 4 Wochen jedes Ämtli mit der zuständigen Person und ob es erledigt wurde.
2. Wenn ich den Verlauf öffne, dann sehe ich pro Person, wie viele ihrer zugeteilten Ämtli sie in diesen 4 Wochen erledigt hat.
3. Wenn die WG jünger als 4 Wochen ist, dann sehe ich nur die vorhandenen Wochen.

**US-F2-06 Ämtli der Woche umteilen**
Als Lena (Admin) möchte ich ein Ämtli der laufenden Woche einer anderen Person geben, damit es erledigt wird, wenn jemand in den Ferien oder krank ist.
1. Wenn ich als Admin bei einem offenen Ämtli der laufenden Woche eine andere Person wähle, dann ist diese Person dafür zuständig und sieht es bei ihren Ämtli.
2. Wenn eine neue Woche beginnt, dann gilt wieder die normale Rotation, als wäre nicht umgeteilt worden.
3. Wenn ein normales Mitglied versucht umzuteilen, dann wird das verweigert.
4. Ich kann nur aktive Mitglieder der eigenen WG auswählen.
5. Erledigte Ämtli und Ämtli vergangener Wochen können nicht umgeteilt werden.
6. Wenn das Ämtli einer ausgetretenen Person entfallen ist, dann kann ich es einer anderen Person geben.

### Qualitätsmerkmale
1. **Benutzbarkeit:** Marco nutzt die App müde, auf einem kleinen, älteren Handy und mit Rot-Grün-Schwäche. Er braucht sein Ämtli auf einen Blick und muss mit einem Klick abhaken können.
2. **Korrektheit und Nachvollziehbarkeit der Rotation:** Fairness ist der Kern der Vision. Die Zuteilung muss vorhersehbar sein, und alle müssen sie nachvollziehen können.

**Zielkonflikt:** Eine starre Rotation ist fair und nachvollziehbar, aber unflexibel, z.B. bei Ferien, Krankheit oder Tauschwünschen. Flexibilität mit Tauschen oder Aussetzen würde die Bedienung und die Regeln komplizierter machen. Wir entscheiden uns für die starre Rotation (E-05, E-08).

---

## F3: Gemeinsame Ausgaben und Saldo

### Funktionalität
Mitglieder erfassen, wer wie viel für wen bezahlt hat. Die App berechnet die Anteile, den Saldo pro Person und einen Vorschlag, wer wem wie viel überweisen soll. Rückzahlungen werden festgehalten. Stories: US-F3-01 bis US-F3-05.

### Berechnungsregeln (E-09 bis E-12)
- Eine Ausgabe wird **gleichmässig** auf die beteiligten Personen aufgeteilt. Die zahlende Person ist immer beteiligt.
- Die Anteile der anderen Beteiligten werden **auf 5 Rappen gerundet**, wobei ab 2.5 Rappen aufgerundet wird. Die zahlende Person trägt den Rest, sodass die Summe der Anteile genau dem Betrag entspricht.
  - CHF 10.00 auf 3 Personen: 3.35 + 3.35, die zahlende Person trägt 3.30.
  - CHF 20.00 auf 3 Personen: 6.65 + 6.65, die zahlende Person trägt 6.70.
  - CHF 48.60 auf 4 Personen: 12.15 + 12.15 + 12.15, die zahlende Person trägt 12.15.
- **Saldo** einer Person = was sie für andere bezahlt hat − was andere für sie bezahlt haben ± Rückzahlungen. Ein positiver Saldo bedeutet, dass die Person Geld zugut hat. Die Summe aller Saldi ist immer genau 0.00.

### User Stories

**US-F3-01 Ausgabe erfassen**
Als Lena möchte ich eine Ausgabe mit Betrag und beteiligten Personen erfassen, damit sie fair aufgeteilt wird.
1. Wenn ich Beschreibung, Betrag, Datum und die beteiligten Personen eingebe, dann wird die Ausgabe gespeichert und erscheint in der Ausgabenliste der WG.
2. Wenn ich nichts anderes auswähle, dann bin ich die zahlende Person und alle Mitglieder sind beteiligt.
3. Wenn der Betrag 0, negativ oder mit mehr als 2 Nachkommastellen angegeben ist, dann wird die Ausgabe abgelehnt.
4. Wenn ich CHF 10.00 für 3 Personen erfasse und selbst bezahlt habe, dann betragen die Anteile der anderen je 3.35 und mein Anteil 3.30.
5. Wenn eine Ausgabe gespeichert ist, dann entspricht die Summe aller Anteile genau dem Betrag.
6. Wenn ich eine andere zahlende Person auswähle, dann ist diese automatisch beteiligt.
7. Wenn ich die Ausgabe erfasse, dann kann ich nur Mitglieder meiner WG auswählen.

**US-F3-02 Ausgabe bearbeiten und löschen**
Als Lena möchte ich eine falsch erfasste Ausgabe korrigieren oder löschen, damit der Saldo stimmt.
1. Wenn ich eine Ausgabe ändere, die ich erfasst habe, dann werden Anteile und Saldi neu berechnet.
2. Wenn ich eine Ausgabe lösche, dann muss ich das zuerst bestätigen, und danach zählt sie nicht mehr zum Saldo.
3. Wenn ich Admin bin, dann darf ich jede Ausgabe der WG ändern und löschen.
4. Wenn ein normales Mitglied versucht, die Ausgabe einer anderen Person zu ändern oder zu löschen, dann wird das verweigert.

**US-F3-03 Saldo sehen**
Als Marco möchte ich sehen, wie viel ich im Plus oder Minus bin, damit ich weiss, ob ich jemandem etwas schulde.
1. Wenn ich die Abrechnung öffne, dann sehe ich den Saldo jedes Mitglieds.
2. Wenn Lena CHF 30.00 für Lena, Marco und Sara bezahlt hat und sonst nichts erfasst ist, dann ist Lenas Saldo +20.00, und Marco und Sara haben je −10.00.
3. Wenn ich die Saldi aller Mitglieder zusammenzähle, dann ergibt das genau 0.00.
4. Wenn eine Person an keiner Ausgabe beteiligt ist und nichts bezahlt hat, dann ist ihr Saldo 0.00.
5. Wenn ein Saldo positiv oder negativ ist, dann ist das auch ohne Farben erkennbar, z.B. am Vorzeichen oder an «bekommt» bzw. «schuldet».

**US-F3-04 Ausgleichsvorschlag «wer schuldet wem»**
Als Marco möchte ich sehen, wem ich wie viel überweisen soll, damit wir mit möglichst wenigen Überweisungen ausgeglichen sind.
1. Wenn ich die Abrechnung öffne, dann sehe ich eine Liste mit Einträgen der Form «A überweist B CHF x».
2. Wenn alle vorgeschlagenen Überweisungen ausgeführt sind, dann ist der Saldo jedes Mitglieds 0.00.
3. Wenn die WG n Mitglieder mit einem Saldo ungleich 0.00 hat, dann umfasst der Vorschlag höchstens n − 1 Überweisungen.
4. Wenn eine Person laut Vorschlag überweist, dann erhält sie im selben Vorschlag nichts.
5. Wenn alle Saldi 0.00 sind, dann sehe ich «Alles ausgeglichen».

**US-F3-05 Rückzahlung festhalten**
Als Marco möchte ich festhalten, dass ich Lena Geld überwiesen habe, damit mein Saldo wieder stimmt.
1. Wenn ich eine Rückzahlung von mir an Lena über CHF 10.00 festhalte, dann steigt mein Saldo um 10.00 und Lenas Saldo sinkt um 10.00.
2. Wenn ich als Empfängerin oder Empfänger mich selbst auswähle, dann wird die Rückzahlung abgelehnt.
3. Wenn der Betrag 0 oder negativ ist, dann wird die Rückzahlung abgelehnt.
4. Wenn eine Rückzahlung gespeichert ist, dann sehen alle Mitglieder sie mit Datum, zahlender und empfangender Person.
5. Wenn ich eine Rückzahlung löschen will, dann darf ich das nur, wenn ich sie festgehalten habe oder Admin bin.

### Qualitätsmerkmale
1. **Korrektheit:** Es geht um Geld. Ein einziger falscher Rappen zerstört das Vertrauen in die App. Die Summe der Anteile muss immer genau dem Betrag entsprechen, und die Summe aller Saldi muss immer genau 0.00 ergeben.
2. **Nachvollziehbarkeit:** Alle müssen sehen können, wie ihr Saldo zustande kommt, also welche Ausgaben und Rückzahlungen dazu beitragen. Sonst entsteht wieder Streit.

**Zielkonflikt:** Die Rundung auf 5 Rappen macht die Beträge alltagstauglich, verteilt sie aber nicht exakt gleich: Die zahlende Person trägt bis zu wenigen Rappen mehr oder weniger. Exakte Rappenbeträge wären mathematisch genauer, aber schlechter zu überweisen. Ein zweiter Konflikt: Ausgaben müssen bearbeitbar sein, damit Fehler korrigiert werden können. Jede nachträgliche Änderung macht den Saldo aber schwerer nachvollziehbar. Deshalb dürfen nur die erfassende Person und Admins Ausgaben ändern (E-13).

---

## F4: Gemeinsame Einkaufsliste *(nur spezifiziert, Bonus)*

### Funktionalität
Die WG führt eine gemeinsame Einkaufsliste. Gekaufte Artikel werden abgehakt und als Ausgabe in F3 übernommen. Stories: US-F4-01 bis US-F4-03.

### User Stories

**US-F4-01 Artikel hinzufügen und entfernen**
Als Sara möchte ich Artikel auf die gemeinsame Einkaufsliste setzen, damit niemand vergisst, sie zu kaufen.
1. Wenn ich einen Artikel mit Namen hinzufüge, dann sehen ihn alle Mitglieder auf der Einkaufsliste.
2. Wenn ich keinen Namen eingebe, dann wird kein Artikel hinzugefügt.
3. Wenn ich eine Menge angebe, z.B. «2 Liter», dann wird sie beim Artikel angezeigt.
4. Wenn ein Mitglied einen Artikel entfernt, dann verschwindet er für alle von der Liste.

**US-F4-02 Artikel abhaken**
Als Marco möchte ich im Laden abhaken, was ich gekauft habe, damit niemand dasselbe doppelt kauft.
1. Wenn ich einen Artikel abhake, dann sehen alle, dass er gekauft ist.
2. Wenn ich mich vertan habe, dann kann ich das Abhaken rückgängig machen.
3. Wenn ich die Liste öffne, dann sind gekaufte und offene Artikel klar getrennt, auch ohne Farben.

**US-F4-03 Einkauf in Ausgabe umwandeln**
Als Marco möchte ich aus den gekauften Artikeln direkt eine Ausgabe machen, damit ich nichts doppelt erfassen muss.
1. Wenn ich gekaufte Artikel auswähle und den Gesamtbetrag eingebe, dann entsteht eine Ausgabe mit mir als zahlender Person, und die Artikel stehen in ihrer Beschreibung.
2. Wenn die Ausgabe entstanden ist, dann verschwinden die verwendeten Artikel von der Einkaufsliste.
3. Wenn ich keinen gültigen Betrag eingebe, dann entsteht keine Ausgabe, und die Artikel bleiben auf der Liste.
4. Wenn die Ausgabe entsteht, dann gelten dieselben Regeln für Aufteilung und Rundung wie bei US-F3-01.

### Qualitätsmerkmale
1. **Benutzbarkeit unterwegs:** Die Liste wird im Laden mit einer Hand auf dem Handy genutzt. Hinzufügen und Abhaken müssen mit sehr wenigen Eingaben gehen.
2. **Korrektheit der Übernahme:** Eine aus der Liste erzeugte Ausgabe muss sich genau wie eine von Hand erfasste verhalten.

**Zielkonflikt:** Für schnelle Bedienung gibt es pro Artikel keine Preise, für genaue Abrechnung wären Preise nötig. Wir erfassen deshalb nur den Gesamtbetrag beim Umwandeln (E-14).

---

## Randbedingungen (für alle Features)

**Organisatorisch**
- 5 Personen, Teilzeitstudium. Feste Termine: Demo 1 am 12.11. (F1), Demo 2 am 15.12. (F2), Abgabe am 15.01.2027 um 23:59, Präsentation am 26.01.
- Agiles, iteratives Vorgehen mit Rollen Product Owner, Technical Lead und QA Lead.
- F4 wird nur umgesetzt, wenn F1–F3 vollständig und getestet sind.

**Technisch**
- Python, Django und SQLite. Kein Django-Admin: Jedes Erfassen, Ändern und Löschen braucht eigene Seiten und Formulare.
- Muss nach der Anleitung im README auf einem frischen Laptop laufen, ohne externe Dienste.
- Mindestens 3 Features mit Schreiboperationen und mindestens 5 Entitäten in der Domäne.
- Akzeptanzkriterien werden als automatisierte Tests umgesetzt, die zu 100 % grün laufen.

**Juristisch (Schweizer Datenschutzgesetz, DSG)**
- Es werden nur Daten erfasst, die für die Funktion nötig sind: Benutzername, Passwort, WG-Zugehörigkeit, Ämtli und Ausgaben. Echte Namen, E-Mail-Adressen oder Kontodaten werden nicht erfasst.
- Passwörter werden nie im Klartext gespeichert.
- Ausgaben sind Personendaten. Nur Mitglieder derselben WG dürfen sie sehen.
- Die App wickelt keine Zahlungen ab. Rückzahlungen werden nur festgehalten, das Geld fliesst ausserhalb der App.
- Für Demos und Tests verwenden wir nur erfundene Daten.
