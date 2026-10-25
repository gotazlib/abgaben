'use strict';
/* Demo-Daten beim ersten Start. Alle Daten relativ zum heutigen Datum. Namen und Adressen sind erfunden. */
const Seed = {};

Seed.params = () => ({
  raster: 30,                // PA-01
  minDauer: 60,              // PA-01
  stornofristStd: 24,        // PA-04
  annahmefristMin: 30,       // PA-05
  erinnerungStd: 24,         // PA-06
  aufbewahrungMonate: 24,    // PA-07
  spitzenlast: 100,          // PA-09 (nur dokumentiert, in einer Browser-App nicht prüfbar)
  kontingentMaxAnteil: 50,   // PA-10
  abendVon: '17:00', abendBis: '22:00', // PA-10 «werktags 17–22 Uhr»
});

Seed.oeffnung = () => ({ // PA-08: Mo–Fr 07–23, Sa/So 08–20
  0: ['08:00', '20:00'], 1: ['07:00', '23:00'], 2: ['07:00', '23:00'], 3: ['07:00', '23:00'],
  4: ['07:00', '23:00'], 5: ['07:00', '23:00'], 6: ['08:00', '20:00'],
});

Seed.create = () => {
  const today = U.today();
  const rnd = U.rng(20261025);
  const pick = arr => arr[Math.floor(rnd() * arr.length)];
  const nowIso = new Date().toISOString();

  const anlagen = [
    ['A-p1', 'Padelplatz 1', 'Padel'], ['A-p2', 'Padelplatz 2', 'Padel'], ['A-p3', 'Padelplatz 3', 'Padel'],
    ['A-t1', 'Tennisplatz 1', 'Tennis'], ['A-t2', 'Tennisplatz 2', 'Tennis'], ['A-t3', 'Tennisplatz 3', 'Tennis'],
    ['A-b1', 'Badmintonplatz 1', 'Badminton'], ['A-b2', 'Badmintonplatz 2', 'Badminton'], ['A-b3', 'Badmintonplatz 3', 'Badminton'], ['A-b4', 'Badmintonplatz 4', 'Badminton'],
    ['A-m1', 'Mehrzweckhalle 1 (ganz)', 'Mehrzweckhalle'],
    ['A-m1a', 'Mehrzweckhalle 1 – Hallenteil A', 'Mehrzweckhalle', 'A-m1'],
    ['A-m1b', 'Mehrzweckhalle 1 – Hallenteil B', 'Mehrzweckhalle', 'A-m1'],
    ['A-m1c', 'Mehrzweckhalle 1 – Hallenteil C', 'Mehrzweckhalle', 'A-m1'],
    ['A-m2', 'Mehrzweckhalle 2', 'Mehrzweckhalle'],
  ].map(([id, name, sportart, parentId]) => ({ id, name, sportart, parentId: parentId || null, aktiv: true, oeffnung: Seed.oeffnung() }));

  const gruppen = [ // FA-24: die vier Gruppen von Folie 2; Werte PA-02, PA-03; max. Dauer Annahme A-12
    { id: 'G-privat', name: 'Privat', vorlaufTage: 14, maxDauerMin: 120, maxOffen: 3, anlagenIds: null },
    { id: 'G-verein', name: 'Verein', vorlaufTage: 90, maxDauerMin: 240, maxOffen: null, anlagenIds: null },
    { id: 'G-firma', name: 'Firma', vorlaufTage: 90, maxDauerMin: 480, maxOffen: null, anlagenIds: null },
    { id: 'G-training', name: 'Trainingsgruppe', vorlaufTage: 90, maxDauerMin: 180, maxOffen: null, anlagenIds: null },
  ];

  const K = (id, name, gruppeId, email, telefon, extra) => Object.assign({ id, name, organisation: '', gruppeId, email: email || '', telefon: telefon || '', smsOptIn: false, erinnerungenAus: false, erstellt: U.addDays(today, -400) }, extra || {});
  const kunden = [
    K('K-anna', 'Anna Muster', 'G-privat', 'anna.muster@example.ch', '079 111 22 33'),
    K('K-marco', 'Marco Rossi', 'G-privat', 'marco.rossi@example.ch', ''),
    K('K-lea', 'Lea Brunner', 'G-privat', 'lea.brunner@example.ch', '078 444 55 66', { smsOptIn: true }),
    K('K-hans', 'Hans Meier', 'G-privat', '', '044 555 66 77'),
    K('K-tcs', 'Peter Graf', 'G-verein', 'kontakt@tc-seefeld.example.ch', '044 222 33 44', { organisation: 'TC Seefeld' }),
    K('K-bcz', 'Lisa Steiner', 'G-verein', 'info@bc-zuerich.example.ch', '', { organisation: 'Badminton Club Zürich' }),
    K('K-nova', 'Thomas Huber', 'G-firma', 'events@novatech.example.ch', '044 777 88 99', { organisation: 'Novatech AG' }),
    K('K-kids', 'Laura Keller', 'G-training', 'laura.keller@example.ch', '079 999 00 11', { organisation: 'Padel-Kids Laura' }),
    K('K-alt', 'Beat Alt', 'G-privat', 'beat.alt@example.ch', '', { erstellt: U.addDays(today, -1100) }),
  ];
  const vornamen = ['Sandro', 'Mia', 'Luca', 'Nora', 'Jonas', 'Elena', 'David', 'Sara', 'Noah', 'Lina', 'Reto', 'Chiara', 'Fabian', 'Jana'];
  const nachnamen = ['Baumann', 'Frei', 'Gerber', 'Kunz', 'Lehmann', 'Moser', 'Schmid', 'Suter', 'Vogel', 'Weber', 'Widmer', 'Zürcher', 'Bühler', 'Egli'];
  const pool = vornamen.map((v, i) => {
    const n = nachnamen[i];
    const mitMail = i % 5 !== 3;
    return K('K-p' + i, `${v} ${n}`, 'G-privat', mitMail ? `${v}.${n}@example.ch`.toLowerCase().replace('ü', 'ue') : '', mitMail ? '' : `079 3${i}0 ${10 + i} ${20 + i}`);
  });
  kunden.push(...pool);

  const kpw = 'demo1234', spw = 'arenaone-demo';
  const Us = (id, login, name, rollen, kundeIds, pw) => ({ id, login, name, rollen, kundeIds: kundeIds || [], passwort: pw, aktiv: true });
  const users = [
    Us('U-anna', 'anna', 'Anna Muster', ['kunde'], ['K-anna'], kpw),
    Us('U-marco', 'marco', 'Marco Rossi', ['kunde'], ['K-marco'], kpw),
    Us('U-lea', 'lea', 'Lea Brunner', ['kunde'], ['K-lea'], kpw),
    Us('U-beat', 'beat', 'Beat Alt', ['kunde'], ['K-alt'], kpw),
    Us('U-peter', 'peter', 'Peter Graf', ['orgkontakt'], ['K-tcs'], kpw),
    Us('U-sandra', 'sandra', 'Sandra Graf', ['orgkontakt'], ['K-tcs'], kpw),
    Us('U-lisa', 'lisa', 'Lisa Steiner', ['orgkontakt'], ['K-bcz'], kpw),
    Us('U-thomas', 'thomas', 'Thomas Huber', ['orgkontakt'], ['K-nova'], kpw),
    Us('U-laura', 'laura', 'Laura Keller', ['trainer'], ['K-kids'], kpw),
    Us('U-empfang', 'empfang', 'Sara Keller (Empfang)', ['empfang'], [], spw),
    Us('U-gl', 'gl', 'Daniel Frei (Geschäftsleitung)', ['gl'], [], spw),
    Us('U-admin', 'admin', 'Nina Weber (Administration)', ['admin'], [], spw),
    Us('U-betrieb', 'betrieb', 'Urs Hauser (Betrieb)', ['betrieb'], [], spw),
  ];

  const db = {
    version: 1, params: Seed.params(), gruppen, anlagen, kunden, users,
    reservationen: [], serien: [], sperrzeiten: [], warteliste: [], nachrichten: [], protokoll: [],
    kontingente: [{ id: 'C-1', anlageId: 'A-m1', gruppeId: 'G-verein', wochentage: [1, 2, 3, 4], von: '18:00', bis: '21:00' }],
    meta: { erstellt: nowIso, letzterLoeschlauf: today },
  };

  const related = id => L.related(db, id);
  const frei = (aid, s, e) => !db.reservationen.some(r => r.status === 'aktiv' && related(aid).includes(r.anlageId) && U.overlap(s, e, r.start, r.ende))
    && !db.sperrzeiten.some(z => related(aid).includes(z.anlageId) && U.overlap(s, e, z.start, z.ende));
  const nowS = U.now();
  const add = (aid, kid, s, dauer, kanal, extra) => {
    const e = U.addMin(s, dauer);
    if (!frei(aid, s, e)) return null;
    const k = kunden.find(x => x.id === kid);
    const erstelltD = U.parse(U.addMin(s, -Math.round((1 + rnd() * 7) * 24 * 60)));
    const r = Object.assign({
      id: U.id('R'), anlageId: aid, kundeId: kid, gruppeId: k.gruppeId, start: s, ende: e, status: 'aktiv', kanal,
      serieId: null, viaWarteliste: false, kurzfristig: false, erstellt: erstelltD.toISOString(), erinnert: s < U.addMin(nowS, 24 * 60),
    }, extra || {});
    db.reservationen.push(r);
    db.protokoll.push({ id: U.id('P'), zeit: r.erstellt, userId: null, userName: kanal === 'online' ? k.name : 'Sara Keller (Empfang)', aktion: r.viaWarteliste ? 'Reservation über Warteliste' : 'Reservation erfasst', objektTyp: 'reservation', objektId: r.id, kanal: KANAL[kanal], details: `${anlagen.find(a => a.id === aid).name}, ${U.fmtRange(s, e)} (Demo-Daten)` });
    return r;
  };
  const stornoLog = r => db.protokoll.push({ id: U.id('P'), zeit: r.storniertAm, userId: null, userName: 'Sara Keller (Empfang)', aktion: r.kurzfristig ? 'Reservation kurzfristig storniert' : 'Reservation storniert', objektTyp: 'reservation', objektId: r.id, kanal: 'Telefon', details: 'Demo-Daten' });

  /* Sperrzeiten */
  db.sperrzeiten.push({ id: 'Z-1', anlageId: 'A-p3', start: U.addDays(today, 1) + 'T07:00', ende: U.addDays(today, 1) + 'T12:00', grund: 'Unterhalt', notiz: 'Netz und Belag prüfen', erstellt: nowIso, erstelltVon: 'U-betrieb' });
  let sa = U.addDays(today, 7); while (U.weekday(sa) !== 6) sa = U.addDays(sa, 1);
  db.sperrzeiten.push({ id: 'Z-2', anlageId: 'A-m2', start: sa + 'T08:00', ende: sa + 'T20:00', grund: 'Turnier', notiz: 'Regionales Unihockey-Turnier', erstellt: nowIso, erstelltVon: 'U-empfang' });

  /* Bestätigte Serien (FA-16 bis FA-20) */
  const serie = (id, kid, aid, wd, beginn, dauer, von, bis) => {
    const s = { id, kundeId: kid, anlageId: aid, wochentag: wd, beginn, dauerMin: dauer, von, bis, status: 'bestaetigt', grund: '', ausgelassen: [], kanal: 'email', beantragtVon: null, beantragtAm: nowIso, entschiedenVon: 'U-empfang', entschiedenAm: nowIso };
    db.serien.push(s);
    L.serieTermine(s).forEach(d => { if (!add(aid, kid, d + 'T' + beginn, dauer, 'email', { serieId: id })) s.ausgelassen.push({ datum: d, grund: 'Konflikt (Demo-Daten)' }); });
    return s;
  };
  serie('S-1', 'K-tcs', 'A-t2', 2, '18:00', 120, U.addDays(today, -45), U.addDays(today, 200));
  serie('S-2', 'K-kids', 'A-p1', 3, '16:00', 90, U.addDays(today, -30), U.addDays(today, 120));
  serie('S-3', 'K-bcz', 'A-m1', 1, '19:00', 120, U.addDays(today, -40), U.addDays(today, 150));

  /* gezielte Demo-Reservationen */
  const tm = U.addDays(today, 1);
  add('A-p2', 'K-marco', tm + 'T19:00', 60, 'online');
  add('A-t1', 'K-anna', U.addDays(today, 2) + 'T18:00', 60, 'online');
  add('A-b3', 'K-lea', U.addDays(today, 3) + 'T20:00', 90, 'online');
  add('A-t3', 'K-hans', U.addDays(today, 1) + 'T10:00', 60, 'telefon');
  let fr = U.addDays(today, 4); while (U.weekday(fr) !== 5) fr = U.addDays(fr, 1);
  add('A-m2', 'K-nova', fr + 'T17:00', 180, 'email');
  // Konflikte für den offenen Serienantrag (Do 19:00–21:00 Badmintonplatz 2)
  let doN = U.addDays(today, 1); while (U.weekday(doN) !== 4) doN = U.addDays(doN, 1);
  add('A-b2', 'K-p1', doN + 'T19:30', 60, 'telefon');
  add('A-b2', 'K-p4', U.addDays(doN, 7) + 'T20:00', 60, 'schalter');
  // alte Reservation für den Löschlauf (QA-11)
  add('A-t1', 'K-alt', U.addDays(today, -800) + 'T10:00', 60, 'telefon');

  /* Zufällige Belegung: 35 Tage zurück bis 13 Tage voraus */
  const hauptAnlagen = anlagen.filter(a => a.id !== 'A-m1');
  for (let off = -35; off <= 13; off++) {
    const d = U.addDays(today, off);
    const wd = U.weekday(d);
    const we = wd === 0 || wd === 6;
    hauptAnlagen.forEach(a => {
      const o = L.oeffnung(a, d);
      for (let m = U.toMin(o.von); m + 60 <= U.toMin(o.bis); m += 60) {
        const h = m / 60;
        let p = we ? 0.45 : (h >= 17 && h < 22 ? 0.7 : (h < 9 ? 0.15 : 0.3));
        if (a.sportart === 'Mehrzweckhalle') p *= 0.5;
        if (off > 0) p *= 0.75 - off * 0.03;
        if (rnd() > p) continue;
        const s = d + 'T' + U.fromMin(m);
        const dauer = pick([60, 60, 90, 120]);
        const e = U.addMin(s, dauer);
        if (U.timePart(e) > o.bis || U.datePart(e) !== d) continue;
        if (L.kontingentBlock(db, a.id, s, e, 'G-privat')) continue;
        if (U.weekday(d) === 4 && a.id === 'A-b2' && off > 0 && U.overlap(U.timePart(s), U.timePart(e), '19:00', '21:00')) continue;
        if (a.id === 'A-p2' && d === tm && U.overlap(U.timePart(s), U.timePart(e), '18:00', '21:00')) continue;
        const kid = rnd() < 0.85 ? pick(pool).id : pick(['K-nova', 'K-kids', 'K-tcs']);
        const kanal = pick(['online', 'online', 'telefon', 'telefon', 'email', 'schalter']);
        const r = add(a.id, kid, s, dauer, kanal);
        if (!r) continue;
        if (off < 0 && rnd() < 0.12) {
          r.status = 'storniert';
          r.kurzfristig = rnd() < 0.4;
          r.storniertAm = U.parse(U.addMin(s, r.kurzfristig ? -180 : -3 * 24 * 60)).toISOString();
          stornoLog(r);
          if (rnd() < 0.4 && frei(a.id, s, e)) add(a.id, pick(pool).id, s, dauer, 'online', { viaWarteliste: true });
        }
      }
    });
  }

  /* Offener Serienantrag mit Konflikten (FA-17) */
  db.serien.push({ id: 'S-4', kundeId: 'K-bcz', anlageId: 'A-b2', wochentag: 4, beginn: '19:00', dauerMin: 120, von: doN, bis: U.addDays(doN, 7 * 20), status: 'beantragt', grund: '', ausgelassen: [], kanal: 'online', beantragtVon: 'U-lisa', beantragtAm: nowIso, bemerkung: 'Wintertraining Junioren' });
  db.protokoll.push({ id: U.id('P'), zeit: nowIso, userId: 'U-lisa', userName: 'Lisa Steiner', aktion: 'Serie beantragt', objektTyp: 'serie', objektId: 'S-4', kanal: 'Online', details: 'Demo-Daten' });

  /* Warteliste: Anna wartet auf Padelplatz 2 morgen 19:00 (belegt durch Marco) */
  db.warteliste.push({ id: 'W-1', anlageId: 'A-p2', kundeId: 'K-anna', userId: 'U-anna', start: tm + 'T19:00', ende: tm + 'T20:00', status: 'wartend', erstellt: nowIso });

  db.protokoll.push({ id: U.id('P'), zeit: nowIso, userId: null, userName: 'System', aktion: 'Demo-Daten erzeugt', objektTyp: 'system', objektId: '', kanal: 'System', details: `${db.reservationen.length} Reservationen, ${db.serien.length} Serien` });
  db.protokoll.sort((a, b) => a.zeit.localeCompare(b.zeit));
  return db;
};
