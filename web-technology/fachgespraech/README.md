# Fachgespräch Web Technology – Lernmaterial

Am **8. Dezember 2026** wird jedes Gruppenmitglied einzeln zu beliebigen Stellen im Code befragt
(Folie 01/5). Wer eine Zeile nicht erklären kann, riskiert die Note 1.0. Dieser Ordner hilft,
**jede Codezeile** zu verstehen und in eigenen Worten zu erklären. Er vertieft den bestehenden
[Leitfaden](../abgabe/code/docs/FACHGESPRAECH.md) (Musterantworten, Demo-Drehbuch, Übungen) und ersetzt ihn nicht.

Alle Teile gibt es als Markdown, PDF und HTML (die HTML-Datei ist offline lesbar). Der Ordner kommt
**nicht ins Code-ZIP**. Zusammen mit der Abgabe steht er öffentlich im Repo `gotazlib/abgaben`
unter `web-technology/fachgespraech/`.

## Die Teile

| Teil | Datei | Inhalt | Umfang |
| --- | --- | --- | --- |
| 00 | [00-ordnerstruktur.md](00-ordnerstruktur.md) ([PDF](00-ordnerstruktur.pdf), [HTML](00-ordnerstruktur.html)) | Welche Datei wo liegt und wozu, zwei Projekte `client/` und `server/` | kurz |
| 01 | [01-client-zeile-fuer-zeile.md](01-client-zeile-fuer-zeile.md) ([PDF](01-client-zeile-fuer-zeile.pdf), [HTML](01-client-zeile-fuer-zeile.html)) | jede Datei unter `client/` Zeile für Zeile: React, Hooks, CSS | lang |
| 02 | [02-server-zeile-fuer-zeile.md](02-server-zeile-fuer-zeile.md) ([PDF](02-server-zeile-fuer-zeile.pdf), [HTML](02-server-zeile-fuer-zeile.html)) | jede Datei unter `server/` Zeile für Zeile, Begriffe, REST, Ablauf eines Requests, Sequenzdiagramme | lang |
| 03 | [03-fragenkatalog.md](03-fragenkatalog.md) ([PDF](03-fragenkatalog.pdf), [HTML](03-fragenkatalog.html)) | 120 wahrscheinliche Fragen mit Musterantworten, nach Folien-Themen und Frageformen | mittel |
| 04 | [04-spickzettel.md](04-spickzettel.md) ([PDF](04-spickzettel.pdf), [HTML](04-spickzettel.html)) | drei Seiten: Architektur, Datenfluss, API, Begriffe, Befehle, Live-Demo | kurz |

Jeder Block in Teil 01 und 02 hat dieselbe Form: **Code** mit echten Zeilennummern, **Was macht
das?**, **Warum so?**, **Folie** und eine **Prüfungsfrage**. Verweise wie
`server/src/store.ts:39-62` sind Datei und Zeile ab dem Projektordner; «09/30» heisst Foliensatz 09,
Folie 30.

## Lernreihenfolge

1. **Spickzettel (04)** einmal lesen: Worum geht es, welche Teile gibt es?
2. **App starten** (zwei Terminals, siehe Spickzettel «Befehle») und in zwei Browserfenstern alles
   einmal durchklicken. Wer die App benutzt hat, versteht den Code schneller.
3. **Ordnerstruktur (00)**: Wo liegt was?
4. **Eigener Bereich** in Teil 01 oder 02 Zeile für Zeile, mit dem Code daneben im Editor
   (Aufteilung wie im [Leitfaden](../abgabe/code/docs/FACHGESPRAECH.md#aufteilung-für-die-gruppe)).
5. **Die anderen Bereiche** in Teil 01 und 02. Im Gespräch kann jede Frage an jede Person gehen.
6. **Fragenkatalog (03)** zu zweit als Quiz, zuerst Teil A, dann Teil B.
7. **Übungen** aus dem Leitfaden (Teil E): Code ändern, beobachten, zurücksetzen.
8. **Demo** nach dem Spickzettel mit Stoppuhr proben.

**Tipp für Teil 02:** Zuerst Kapitel 4 «Ablauf eines Requests» lesen. Danach versteht man, warum
jede Datei so aufgebaut ist.

## Lernplan bis zum 8. Dezember 2026

Pro Woche etwa 3–4 Abende à 1–1.5 Stunden. Am Ende jeder Woche ein gemeinsames Treffen, in dem
alle sich gegenseitig abfragen.

| Woche | Datum | Was | Ziel am Ende der Woche |
| --- | --- | --- | --- |
| 1 | 26. Okt. – 1. Nov. | Node 24 und pnpm 12 installieren, App starten, Spickzettel (04), Ordnerstruktur (00). Bereiche aufteilen. | Alle haben die App laufen und können die Architektur in drei Sätzen erklären. |
| 2 | 2. – 8. Nov. | **Eigener Bereich** Zeile für Zeile (Server-Person: Teil 02 Kapitel 1–6; Client-Personen: ihre Dateien in Teil 01). Prüfungsfragen zu jedem Block laut beantworten. | Ich kann meine Dateien Zeile für Zeile vorlesen und begründen. |
| 3 | 9. – 15. Nov. | Jede Person erklärt den anderen ihren Bereich (je 30 Min. mit Code auf dem Bildschirm). Danach die **fremden Bereiche** selbst lesen. | Ich kann jede Datei in einem Satz beschreiben und den Klick auf eine Karte vom Button bis zum Store verfolgen. |
| 4 | 16. – 22. Nov. | Fragenkatalog **Teil A** (Folien-Themen) zu zweit. Übungen 1–10 aus Teil E des Leitfadens. Folien 02, 03, 06–09 dazu nachlesen. | Ich beantworte die Fragen zu den Folien ohne Unterlagen. |
| 5 | 23. – 29. Nov. | Fragenkatalog **Teil B** (Projekt, Entscheidungen, KI). Übungen 11–20 aus Teil E. **Bis Ende November: Git-Repo-Link an den Dozenten** (01/5) und die offenen Stellen der Dokumentation (Kapitel 15, Gruppenmitglieder) ausfüllen. | Ich kann jede Entscheidung begründen («Warum State statt Router?») und ehrlich über die KI-Nutzung sprechen. |
| 6 | 30. Nov. – 6. Dez. | **Generalprobe:** Demo mit Stoppuhr, gegenseitig zu zufälligen Zeilen befragen («Was passiert hier? Was ginge kaputt, wenn man die Zeile löscht?»). Schwache Stellen in Teil 01/02 nachlesen. | Jede Person erklärt jede beliebige Zeile in unter einer Minute. |
| – | 7. Dez. | Checkliste «Am Vortag» aus dem Leitfaden (Teil D.2), Spickzettel nochmals lesen, früh schlafen. | Laptop bereit, Demo läuft. |
| – | **8. Dez.** | **Fachgespräch** | |

Danach: Abgabe bis **22. Dezember 2026** (01/5).

