/* Abnahmenahe Tests der Fachlogik ohne Browser: node tests/logik-test.js */
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const mem = {};
const ctx = { console, Date, Math, JSON, setTimeout, localStorage: { getItem: k => mem[k] ?? null, setItem: (k, v) => { mem[k] = String(v); } }, sessionStorage: { getItem: () => null, setItem() {}, removeItem() {} } };
vm.createContext(ctx);
const files = ['util.js', 'store.js', 'logic.js', 'seed.js'];
const exportLine = '\n;globalThis.__x = { U, Store, Session, L, Seed, can, PERM, ROLLEN, Fehler };';
vm.runInContext(files.map(f => fs.readFileSync(path.join(__dirname, '..', 'js', f), 'utf8')).join('\n') + exportLine, ctx);
const { U, Store, L, can } = ctx.__x;
let ok = 0, fail = 0;
const t = (name, fn) => { try { fn(); ok++; console.log('  ok  ', name); } catch (e) { fail++; console.log('  FAIL', name, '\n       ', e.message); } };
const eq = (a, b, m) => { if (a !== b) throw new Error(`${m || ''} erwartet ${JSON.stringify(b)}, erhalten ${JSON.stringify(a)}`); };
const throws = (fn, re) => { try { fn(); } catch (e) { if (re && !re.test(e.message)) throw new Error('falsche Meldung: ' + e.message); return e; } throw new Error('keine Exception'); };
const as = (db, login) => ({ user: db.users.find(u => u.login === login) });
const fresh = () => Store.reset();
const futureDay = (n, wd) => { let d = U.addDays(U.today(), n); if (wd != null) while (U.weekday(d) !== wd) d = U.addDays(d, 1); return d; };
const freiesFenster = (db, aid, d, dauer = 60) => { for (let m = 8 * 60; m < 19 * 60; m += 30) { const s = d + 'T' + U.fromMin(m); if (!L.conflicts(db, aid, s, U.addMin(s, dauer)).length && !L.kontingentBlock(db, aid, s, U.addMin(s, dauer), 'G-privat')) return s; } throw new Error('kein freies Fenster'); };

console.log('Seed');
t('Seed erzeugt Daten ohne Doppelbuchungen', () => {
  const db = fresh();
  const act = db.reservationen.filter(r => r.status === 'aktiv');
  act.forEach(r => { const k = L.conflicts(db, r.anlageId, r.start, r.ende, { ignoreResId: r.id }).filter(x => x.typ === 'reservation'); if (k.length) throw new Error('Überschneidung ' + r.id); });
  if (act.length < 200) throw new Error('zu wenige Reservationen: ' + act.length);
});

console.log('FA-01/FA-27 Verfügbarkeit');
t('Sperrzeit erscheint nicht als frei', () => {
  const db = fresh();
  const s = L.slots(db, 'A-p3', U.addDays(U.today(), 1), null);
  const g = s.filter(x => x.start < U.addDays(U.today(), 1) + 'T12:00');
  if (!g.every(x => x.status === 'gesperrt')) throw new Error(JSON.stringify(g.map(x => x.status)));
});
t('Kontingent für Vereine: Privatkundin sieht Zeit nicht frei, Verein schon', () => {
  const db = fresh();
  const d = futureDay(2, 2); // Dienstag
  const priv = L.slots(db, 'A-m1a', d, L.kunde(db, 'K-anna')).find(x => U.timePart(x.start) === '18:30');
  const ver = L.slots(db, 'A-m1a', d, L.kunde(db, 'K-tcs')).find(x => U.timePart(x.start) === '18:30');
  eq(priv.status, 'kontingent'); if (ver.status === 'kontingent') throw new Error('Verein blockiert');
});

console.log('FA-04/FA-06/FA-25 Reservieren');
t('Privatreservation gespeichert, Bestätigung versandt (FA-21)', () => {
  const db = fresh();
  const d = U.addDays(U.today(), 3); const s = freiesFenster(db, 'A-b1', d);
  const n0 = db.nachrichten.length;
  const r = L.reservieren(db, as(db, 'marco'), { anlageId: 'A-b1', kundeId: 'K-marco', start: s, ende: U.addMin(s, 60), kanal: 'online' });
  eq(r.res.status, 'aktiv'); eq(db.nachrichten.length, n0 + 1); eq(db.nachrichten.at(-1).kanal, 'E-Mail');
  eq(L.slots(db, 'A-b1', d, null).find(x => x.start === s).status, 'belegt');
});
t('Doppelbuchung abgelehnt mit Alternativen', () => {
  const db = fresh();
  const d = U.addDays(U.today(), 3); const s = freiesFenster(db, 'A-b1', d);
  L.reservieren(db, as(db, 'marco'), { anlageId: 'A-b1', kundeId: 'K-marco', start: s, ende: U.addMin(s, 60), kanal: 'online' });
  const e = throws(() => L.reservieren(db, as(db, 'empfang'), { anlageId: 'A-b1', kundeId: 'K-hans', start: s, ende: U.addMin(s, 60), kanal: 'telefon' }), /nicht mehr frei/);
  if (!e.alternativen || !e.alternativen.length) throw new Error('keine Alternativen');
});
t('Ganze Mehrzweckhalle reserviert -> Hallenteil belegt', () => {
  const db = fresh();
  const d = futureDay(3, 6); const s = d + 'T09:00';
  db.reservationen = db.reservationen.filter(r => !(['A-m1', 'A-m1a', 'A-m1b', 'A-m1c'].includes(r.anlageId) && U.datePart(r.start) === d));
  L.reservieren(db, as(db, 'empfang'), { anlageId: 'A-m1', kundeId: 'K-nova', start: s, ende: U.addMin(s, 120), kanal: 'email' });
  throws(() => L.reservieren(db, as(db, 'empfang'), { anlageId: 'A-m1b', kundeId: 'K-hans', start: s, ende: U.addMin(s, 60), kanal: 'telefon' }), /nicht mehr frei/);
});
t('FA-25: Vorlauf Privat 14 -> 7, Reservation in 10 Tagen abgelehnt, Verein nicht', () => {
  const db = fresh();
  L.gruppeSpeichern(db, as(db, 'gl'), Object.assign({}, L.gruppe(db, 'G-privat'), { vorlaufTage: 7, maxOffen: 3 }));
  const d = U.addDays(U.today(), 10); const s = freiesFenster(db, 'A-t3', d);
  throws(() => L.reservieren(db, as(db, 'marco'), { anlageId: 'A-t3', kundeId: 'K-marco', start: s, ende: U.addMin(s, 60), kanal: 'online' }), /Buchungsvorlauf/);
  L.reservieren(db, as(db, 'peter'), { anlageId: 'A-t3', kundeId: 'K-tcs', start: s, ende: U.addMin(s, 60), kanal: 'online' });
});
t('PA-03: höchstens 3 offene Einzelreservationen Privat', () => {
  const db = fresh();
  const d = U.addDays(U.today(), 5);
  for (let i = 0; i < 2; i++) { const s = freiesFenster(db, 'A-b4', d); L.reservieren(db, as(db, 'anna'), { anlageId: 'A-b4', kundeId: 'K-anna', start: s, ende: U.addMin(s, 60), kanal: 'online' }); }
  const s = freiesFenster(db, 'A-b4', d);
  throws(() => L.reservieren(db, as(db, 'anna'), { anlageId: 'A-b4', kundeId: 'K-anna', start: s, ende: U.addMin(s, 60), kanal: 'online' }), /Höchstens 3/);
});
t('Empfang darf Regel übersteuern, protokolliert', () => {
  const db = fresh();
  const d = U.addDays(U.today(), 20); const s = freiesFenster(db, 'A-t3', d);
  const e = throws(() => L.reservieren(db, as(db, 'empfang'), { anlageId: 'A-t3', kundeId: 'K-hans', start: s, ende: U.addMin(s, 60), kanal: 'telefon' }), /Buchungsvorlauf/);
  eq(e.uebersteuerbar, true);
  const r = L.reservieren(db, as(db, 'empfang'), { anlageId: 'A-t3', kundeId: 'K-hans', start: s, ende: U.addMin(s, 60), kanal: 'telefon', override: true });
  eq(r.ohneEmail, true, 'Hans hat keine E-Mail');
  if (!db.protokoll.at(-1).details.includes('übersteuert')) throw new Error('nicht protokolliert');
  eq(db.protokoll.at(-1).kanal, 'Telefon');
});
t('QA-13: Kundin kann nicht im Auftrag oder für fremde Konten buchen', () => {
  const db = fresh();
  const d = U.addDays(U.today(), 3); const s = freiesFenster(db, 'A-b1', d);
  throws(() => L.reservieren(db, as(db, 'anna'), { anlageId: 'A-b1', kundeId: 'K-anna', start: s, ende: U.addMin(s, 60), kanal: 'telefon' }), /Berechtigung/);
  throws(() => L.reservieren(db, as(db, 'anna'), { anlageId: 'A-b1', kundeId: 'K-marco', start: s, ende: U.addMin(s, 60), kanal: 'online' }), /gehört nicht/);
  throws(() => L.reservieren(db, as(db, 'admin'), { anlageId: 'A-b1', kundeId: 'K-marco', start: s, ende: U.addMin(s, 60), kanal: 'telefon' }), /Berechtigung/);
});

console.log('FA-10/FA-12/FA-14/FA-15 Stornieren und Warteliste');
t('Marco storniert -> Anna (Warteliste) wird benachrichtigt und erhält Zeit', () => {
  const db = fresh();
  const r = db.reservationen.find(x => x.kundeId === 'K-marco' && x.status === 'aktiv' && x.start > U.now());
  const n0 = db.nachrichten.length;
  const res = L.stornieren(db, as(db, 'marco'), r.id, {});
  const w = db.warteliste.find(x => x.id === 'W-1');
  eq(w.status, 'angeboten');
  if (!db.nachrichten.slice(n0).some(n => n.kundeId === 'K-anna' && /Warteliste/.test(n.betreff))) throw new Error('keine Nachricht an Anna');
  // Dritte Person darf während Angebotsfrist nicht buchen
  throws(() => L.reservieren(db, as(db, 'lea'), { anlageId: r.anlageId, kundeId: 'K-lea', start: r.start, ende: r.ende, kanal: 'online' }), /Warteliste/);
  const a = L.angebotAnnehmen(db, as(db, 'anna'), 'W-1');
  eq(a.ok, true); eq(a.res.viaWarteliste, true); eq(w.status, 'vergeben');
  eq(res.kurzfristig, L.istKurzfristig(db, r));
});
t('Zwei Wartende: wer zuerst bestätigt, erhält die Zeit; die andere wird informiert', () => {
  const db = fresh();
  const r = db.reservationen.find(x => x.kundeId === 'K-marco' && x.status === 'aktiv' && x.start > U.now());
  L.wartelisteEintragen(db, as(db, 'lea'), { anlageId: r.anlageId, kundeId: 'K-lea', start: r.start, ende: r.ende });
  L.stornieren(db, as(db, 'marco'), r.id, {});
  const lea = db.warteliste.find(w => w.kundeId === 'K-lea');
  eq(lea.status, 'angeboten');
  eq(L.angebotAnnehmen(db, as(db, 'lea'), lea.id).ok, true);
  eq(db.warteliste.find(w => w.id === 'W-1').status, 'nicht erhalten');
  eq(L.angebotAnnehmen(db, as(db, 'anna'), 'W-1').ok, false);
});
t('Keine Warteliste für freie Zeitfenster', () => {
  const db = fresh();
  const d = U.addDays(U.today(), 3); const s = freiesFenster(db, 'A-b1', d);
  throws(() => L.wartelisteEintragen(db, as(db, 'anna'), { anlageId: 'A-b1', kundeId: 'K-anna', start: s, ende: U.addMin(s, 60) }), /frei/);
});
t('Kurzfristige Stornierung wird markiert; Kunde kann nach Frist nicht verschieben', () => {
  const db = fresh();
  // Reservation in ~3 Stunden direkt anlegen
  let st = U.addMin(U.now(), 180); st = st.slice(0, 11) + U.fromMin(Math.floor(U.toMin(st.slice(11)) / 30) * 30);
  const r = { id: 'R-test', anlageId: 'A-t1', kundeId: 'K-anna', gruppeId: 'G-privat', start: st, ende: U.addMin(st, 60), status: 'aktiv', kanal: 'online', serieId: null, erinnert: true };
  db.reservationen = db.reservationen.filter(x => !(x.anlageId === 'A-t1' && U.overlap(x.start, x.ende, r.start, r.ende)));
  db.reservationen.push(r);
  throws(() => L.verschieben(db, as(db, 'anna'), 'R-test', { anlageId: 'A-t1', start: U.addDays(st.slice(0, 10), 2) + 'T10:00', ende: U.addDays(st.slice(0, 10), 2) + 'T11:00' }), /Stornofrist/);
  const res = L.stornieren(db, as(db, 'anna'), 'R-test', {});
  eq(res.kurzfristig, true);
});

console.log('FA-16 bis FA-19 Serien');
t('Antrag belegt nichts; Konflikte angezeigt; Bestätigung ohne Konflikttermine', () => {
  const db = fresh();
  const s = db.serien.find(x => x.id === 'S-4');
  const n0 = db.reservationen.length;
  const k = L.serieKonflikte(db, s).filter(t => t.gruende.length);
  if (k.length < 2) throw new Error('erwartet mind. 2 Konflikte, ' + k.length);
  throws(() => L.serieBestaetigen(db, as(db, 'empfang'), 'S-4', 'ganz'), /Konflikttermin/);
  const r = L.serieBestaetigen(db, as(db, 'empfang'), 'S-4', 'ohne');
  eq(db.reservationen.length, n0 + r.reserviert); eq(r.ausgelassen, k.length);
  if (!/ausgelassen/.test(db.nachrichten.at(-1).text)) throw new Error('Terminliste ohne ausgelassene Daten');
});
t('Ablehnung braucht Grund', () => {
  const db = fresh();
  throws(() => L.serieAblehnen(db, as(db, 'empfang'), 'S-4', ' '), /Grund/);
  L.serieAblehnen(db, as(db, 'gl'), 'S-4', 'Kontingent erschöpft');
  eq(db.serien.find(s => s.id === 'S-4').status, 'abgelehnt');
});
t('Einzeltermin absagen ändert übrige Termine nicht; Sandra (2. Berechtigte) darf', () => {
  const db = fresh();
  const termine = db.reservationen.filter(r => r.serieId === 'S-1' && r.status === 'aktiv' && r.start > U.now());
  L.stornieren(db, as(db, 'sandra'), termine[1].id, {});
  eq(db.reservationen.filter(r => r.serieId === 'S-1' && r.status === 'aktiv' && r.start > U.now()).length, termine.length - 1);
  throws(() => L.stornieren(db, as(db, 'lisa'), termine[2].id, {}), /gehört nicht/);
});
t('Trainerin beantragt Serie für Trainingsgruppe', () => {
  const db = fresh();
  const d = futureDay(10, 5);
  L.serieBeantragen(db, as(db, 'laura'), { kundeId: 'K-kids', anlageId: 'A-p2', wochentag: 5, beginn: '15:00', dauerMin: 90, von: d, bis: U.addDays(d, 70) });
  throws(() => L.serieBeantragen(db, as(db, 'anna'), { kundeId: 'K-anna', anlageId: 'A-p2', wochentag: 5, beginn: '15:00', dauerMin: 90, von: d, bis: U.addDays(d, 70) }), /Berechtigung/);
});

console.log('FA-26 Kontingente / PA-10');
t('Kontingent über 50 % der Abendstunden abgelehnt (FA-26-Beispiel Mo–Fr 18–21 = 60 %)', () => {
  const db = fresh();
  throws(() => L.kontingentSpeichern(db, as(db, 'gl'), { anlageId: 'A-m2', gruppeId: 'G-verein', wochentage: [1, 2, 3, 4, 5], von: '18:00', bis: '21:00' }), /PA-10/);
  L.kontingentSpeichern(db, as(db, 'gl'), { anlageId: 'A-m2', gruppeId: 'G-verein', wochentage: [1, 2, 3, 4], von: '18:00', bis: '21:00' });
});

console.log('FA-27/FA-28/FA-23 Sperrzeiten');
t('Sperrzeit verlangt Entscheid je Betroffenem und informiert sie', () => {
  const db = fresh();
  const d = U.addDays(U.today(), 2);
  const betr = L.sperreBetroffene(db, 'A-t2', d + 'T07:00', d + 'T23:00');
  if (!betr.length) { L.reservieren(db, as(db, 'empfang'), { anlageId: 'A-t2', kundeId: 'K-hans', start: freiesFenster(db, 'A-t2', d), ende: U.addMin(freiesFenster(db, 'A-t2', d), 60), kanal: 'telefon' }); }
  const b2 = L.sperreBetroffene(db, 'A-t2', d + 'T07:00', d + 'T23:00');
  throws(() => L.sperreSpeichern(db, as(db, 'betrieb'), { anlageId: 'A-t2', start: d + 'T07:00', ende: d + 'T23:00', grund: 'Wetter' }, {}), /FA-28/);
  const ent = {}; b2.forEach(r => { ent[r.id] = 'storno'; });
  const n0 = db.nachrichten.length;
  const r = L.sperreSpeichern(db, as(db, 'betrieb'), { anlageId: 'A-t2', start: d + 'T07:00', ende: d + 'T23:00', grund: 'Wetter' }, ent);
  eq(r.info.length, b2.length);
  if (b2.some(x => x.status !== 'storniert' || x.kurzfristig)) throw new Error('nicht storniert oder fälschlich kurzfristig');
  if (db.nachrichten.length - n0 < b2.filter(x => (L.kunde(db, x.kundeId) || {}).email).length) throw new Error('nicht alle informiert');
  eq(L.slots(db, 'A-t2', d, null).filter(s => s.status !== 'gesperrt' && s.status !== 'vergangen').length, 0);
});
t('Sperrzeit: verschieben auf Alternative', () => {
  const db = fresh();
  const d = U.addDays(U.today(), 3); const s = freiesFenster(db, 'A-b1', d);
  const rr = L.reservieren(db, as(db, 'empfang'), { anlageId: 'A-b1', kundeId: 'K-hans', start: s, ende: U.addMin(s, 60), kanal: 'telefon' }).res;
  const sp = { anlageId: 'A-b1', start: s, ende: U.addMin(s, 60), grund: 'Unterhalt' };
  const alts = L.sperreAlternativen(db, rr, Object.assign({ id: '_' }, sp));
  if (!alts.length) throw new Error('keine Alternativen');
  const ent = {}; L.sperreBetroffene(db, 'A-b1', sp.start, sp.ende).forEach(r => { ent[r.id] = r.id === rr.id ? alts[0] : 'storno'; });
  L.sperreSpeichern(db, as(db, 'empfang'), sp, ent);
  eq(rr.anlageId, alts[0].anlageId); eq(rr.start, alts[0].start); eq(rr.status, 'aktiv');
});

console.log('FA-29/FA-30 Auswertungen');
t('Auslastung = reserviert / reservierbar, Handrechnung für einen Tag', () => {
  const db = fresh();
  const d = U.addDays(U.today(), -3);
  const { res } = L.auslastung(db, d, d, { anlageId: 'A-t1' });
  const a = L.anlage(db, 'A-t1'); const o = L.oeffnung(a, d);
  const reservierbar = U.toMin(o.bis) - U.toMin(o.von);
  let reserviert = 0;
  db.reservationen.filter(r => r.status === 'aktiv' && r.anlageId === 'A-t1' && U.datePart(r.start) === d).forEach(r => { reserviert += U.diffMin(r.start, r.ende); });
  eq(res.anlagen['A-t1'].reservierbar, reservierbar); eq(res.anlagen['A-t1'].reserviert, reserviert);
});
t('Stornostatistik zählt storniert / kurzfristig / neu vergeben', () => {
  const db = fresh();
  const von = U.addDays(U.today(), -35), bis = U.addDays(U.today(), -1);
  const s = L.stornoStats(db, von, bis);
  const m = db.reservationen.filter(r => U.datePart(r.start) >= von && U.datePart(r.start) <= bis);
  eq(s.total.storniert, m.filter(r => r.status === 'storniert').length);
  eq(s.total.kurzfristig, m.filter(r => r.kurzfristig).length);
  eq(s.total.neuVergeben, m.filter(r => r.viaWarteliste).length);
  if (!s.total.storniert || !s.total.neuVergeben) throw new Error('Demo-Daten ohne Stornierungen/Wartelisten-Vergaben');
});

console.log('QA-11/QA-12/FA-33/FA-34/FA-22');
t('Löschlauf löscht Beat Alt, anonymisiert Reservation', () => {
  const db = fresh();
  const r = db.reservationen.find(x => x.kundeId === 'K-alt');
  const n = L.loeschlauf(db, { system: true, user: null });
  eq(n, 1); eq(r.kundeId, null); eq(L.kunde(db, 'K-alt'), undefined);
  if (db.users.some(u => u.login === 'beat')) throw new Error('Login nicht gelöscht');
});
t('Datenauskunft enthält nur eigene Daten', () => {
  const db = fresh();
  const a = L.datenauskunft(db, as(db, 'admin'), 'K-anna');
  eq(a.stammdaten.name, 'Anna Muster');
  eq(a.reservationen.length, db.reservationen.filter(r => r.kundeId === 'K-anna').length);
  throws(() => L.datenauskunft(db, as(db, 'empfang'), 'K-anna'), /Berechtigung/);
});
t('Rolle Empfang entziehen -> keine Erfassung im Auftrag', () => {
  const db = fresh();
  const u = db.users.find(x => x.login === 'empfang');
  L.userSpeichern(db, as(db, 'admin'), { id: u.id, name: u.name, login: u.login, rollen: ['betrieb'], kundeIds: [] });
  eq(can(u, 'imAuftrag'), false);
  throws(() => L.userSpeichern(db, as(db, 'admin'), { name: 'X', login: 'x', passwort: 'kurz12345', rollen: ['empfang'] }), /12 Zeichen/);
});
t('Übernahme: Konflikte als Liste, nicht überschrieben', () => {
  const db = fresh();
  const tm = U.addDays(U.today(), 1);
  const txt = `E;Padelplatz 2;${tm};;19:00;20:00;Ruth Ammann;;Privat;;044 1\nE;Padelplatz 2;${tm};;07:00;08:00;Ruth Ammann;;Privat;;044 1\nE;Padelplatz 2;${tm};;07:30;08:30;Otto Test;;Privat;o@example.ch;\nX;foo`;
  const r = L.importieren(db, as(db, 'admin'), txt);
  eq(r.reservationen, 1); eq(r.konflikte.length, 2); eq(r.fehler.length, 1); eq(r.neueKunden, 2);
});
t('Erinnerung 24 h vorher, nicht bei abgeschalteter Org-Erinnerung', () => {
  const db = fresh();
  db.reservationen.forEach(r => { r.erinnert = false; });
  L.kunde(db, 'K-tcs').erinnerungenAus = true;
  const n0 = db.nachrichten.length;
  L.tick(db);
  const neu = db.nachrichten.slice(n0).filter(n => /Erinnerung/.test(n.betreff));
  if (!neu.length) throw new Error('keine Erinnerungen');
  if (neu.some(n => n.kundeId === 'K-tcs')) throw new Error('Erinnerung trotz Abschaltung');
  if (!db.nachrichten.slice(n0).some(n => n.kanal === 'SMS') && db.reservationen.some(r => r.kundeId === 'K-lea' && r.status === 'aktiv' && r.start > U.now() && U.diffMin(U.now(), r.start) <= 1440)) throw new Error('keine SMS für Lea');
});

console.log(`\n${ok} bestanden, ${fail} fehlgeschlagen`);
process.exit(fail ? 1 : 0);
