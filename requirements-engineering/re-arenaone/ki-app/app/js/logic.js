'use strict';
/* Fachlogik ArenaOne. Alle ändernden Funktionen laufen innerhalb von Store.tx(db => ...).
   Fehler werden als Exception geworfen; dann wird nichts gespeichert. */

const KANAL = { online: 'Online', telefon: 'Telefon', email: 'E-Mail', schalter: 'Schalter', uebernahme: 'Übernahme', system: 'System' };
const SPERRGRUENDE = ['Unterhalt', 'Turnier', 'Anlass', 'Wetter'];
const SPORTARTEN = ['Padel', 'Tennis', 'Badminton', 'Mehrzweckhalle'];

function Fehler(msg, extra) { const e = new Error(msg); Object.assign(e, extra || {}); return e; }

const L = {};

/* ---------- Zugriff ---------- */
L.find = (arr, id) => arr.find(x => x.id === id);
L.anlage = (db, id) => L.find(db.anlagen, id);
L.kunde = (db, id) => L.find(db.kunden, id);
L.gruppe = (db, id) => L.find(db.gruppen, id);
L.user = (db, id) => L.find(db.users, id);
L.kundeName = k => k ? (k.organisation ? `${k.organisation}${k.name ? ' (' + k.name + ')' : ''}` : k.name) : 'anonymisiert';
L.kundeKurz = k => k ? (k.organisation || k.name) : 'anonymisiert';
L.gruppeName = (db, id) => { const g = L.gruppe(db, id); return g ? g.name : '–'; };

L.req = (ctx, perm) => {
  if (ctx.system) return;
  if (!can(ctx.user, perm)) throw Fehler('Keine Berechtigung für diese Funktion (QA-13).');
};
L.eigeneKunde = (ctx, kundeId) => {
  if (ctx.system) return;
  if (!ctx.user || !(ctx.user.kundeIds || []).includes(kundeId)) throw Fehler('Diese Reservation gehört nicht zu Ihrem Konto (QA-13).');
};

/* ---------- Protokoll (QA-15): nur anhängen, nie ändern ---------- */
L.log = (db, ctx, aktion, objektTyp, objektId, kanal, details) => {
  db.protokoll.push({
    id: U.id('P'), zeit: new Date().toISOString(),
    userId: ctx.user ? ctx.user.id : null, userName: ctx.user ? ctx.user.name : 'System',
    aktion, objektTyp, objektId, kanal: KANAL[kanal] || kanal || '', details: details || '',
  });
};

/* ---------- Nachrichtenversand (simuliert: Postausgang) FA-21 bis FA-23, FA-35 ---------- */
L.senden = (db, kunde, betreff, text, opt = {}) => {
  if (!kunde) return { email: false };
  let email = false;
  if (kunde.email) {
    db.nachrichten.push({ id: U.id('N'), zeit: new Date().toISOString(), kanal: 'E-Mail', an: kunde.email, kundeId: kunde.id, betreff, text, link: opt.link || '' });
    email = true;
  }
  if (opt.sms && kunde.smsOptIn && kunde.telefon) {
    db.nachrichten.push({ id: U.id('N'), zeit: new Date().toISOString(), kanal: 'SMS', an: kunde.telefon, kundeId: kunde.id, betreff, text: opt.smsText || betreff, link: '' });
  }
  return { email };
};
L.resText = (db, r) => {
  const a = L.anlage(db, r.anlageId);
  return `Anlage: ${a ? a.name : '?'}\nDatum: ${U.fmtDate(r.start)}\nZeit: ${U.timePart(r.start)}–${U.timePart(r.ende)} Uhr`;
};
L.bestaetigung = (db, r, art) => {
  const k = L.kunde(db, r.kundeId);
  const a = L.anlage(db, r.anlageId);
  return L.senden(db, k, `ArenaOne: ${art}`, `Guten Tag\n\nArt der Aktion: ${art}\n${L.resText(db, r)}\n\nIhre Reservationen verwalten: «Meine Reservationen».\n\nFreundliche Grüsse\nArenaOne Sportzentrum AG`, {
    sms: true, link: '#/meine',
    smsText: `ArenaOne – ${art}: ${a ? a.name : ''}, ${U.fmtDate(r.start)}, ${U.timePart(r.start)}–${U.timePart(r.ende)}`,
  });
};

/* ---------- Anlagen, Öffnungszeiten, Konflikte ---------- */
/* Mehrzweckhalle ganz reserviert = alle Hallenteile belegt (Glossar, FA-06) und umgekehrt (Annahme A-04). */
L.related = (db, anlageId) => {
  const a = L.anlage(db, anlageId);
  if (!a) return [anlageId];
  const ids = new Set([a.id]);
  if (a.parentId) ids.add(a.parentId);
  db.anlagen.forEach(x => { if (x.parentId === a.id) ids.add(x.id); });
  return [...ids];
};
L.oeffnung = (anlage, dateS) => {
  const o = anlage && anlage.oeffnung && anlage.oeffnung[U.weekday(dateS)];
  return o && o[0] && o[1] ? { von: o[0], bis: o[1] } : null;
};
L.conflicts = (db, anlageId, start, ende, opt = {}) => {
  const rel = L.related(db, anlageId);
  const out = [];
  db.reservationen.forEach(r => {
    if (r.status === 'aktiv' && rel.includes(r.anlageId) && r.id !== opt.ignoreResId && U.overlap(start, ende, r.start, r.ende)) out.push({ typ: 'reservation', obj: r });
  });
  db.sperrzeiten.forEach(s => {
    if (rel.includes(s.anlageId) && s.id !== opt.ignoreSperreId && U.overlap(start, ende, s.start, s.ende)) out.push({ typ: 'sperre', obj: s });
  });
  return out;
};
L.konfliktText = (db, k) => {
  if (k.typ === 'sperre') return `Sperrzeit (${k.obj.grund}) ${U.fmtRange(k.obj.start, k.obj.ende)}, ${L.anlage(db, k.obj.anlageId).name}`;
  const r = k.obj;
  return `Reservation ${U.fmtRange(r.start, r.ende)}, ${L.anlage(db, r.anlageId).name}, ${L.kundeKurz(L.kunde(db, r.kundeId))}${r.serieId ? ' (Serie)' : ''}`;
};

/* Kontingent (FA-26): Zeitband ist für eine andere Kundengruppe reserviert. gruppeId null = anonym. */
L.kontingentBlock = (db, anlageId, start, ende, gruppeId) => {
  const rel = L.related(db, anlageId);
  const wd = U.weekday(U.datePart(start));
  const ts = U.timePart(start);
  const te = U.datePart(ende) > U.datePart(start) ? '24:00' : U.timePart(ende);
  return db.kontingente.find(k => rel.includes(k.anlageId) && k.gruppeId !== gruppeId && k.wochentage.includes(wd) && U.overlap(ts, te, k.von, k.bis)) || null;
};
L.kontingentText = (db, k) => `${k.wochentage.map(w => U.WT[w]).join(', ')} ${k.von}–${k.bis}, ${L.anlage(db, k.anlageId).name}, für «${L.gruppeName(db, k.gruppeId)}»`;

/* Laufendes Wartelisten-Angebot hält ein Zeitfenster bis zur Annahmefrist frei (FA-12, FA-15) */
L.offerBlock = (db, anlageId, start, ende, kundeId) => {
  const now = U.now();
  const rel = L.related(db, anlageId);
  const offers = db.warteliste.filter(w => w.status === 'angeboten' && w.angebotBis > now && rel.includes(w.anlageId) && U.overlap(start, ende, w.start, w.ende));
  if (!offers.length) return null;
  if (kundeId && offers.some(w => w.kundeId === kundeId)) return null;
  return offers[0];
};

/* Buchungsregeln (FA-25). hart = nie übersteuerbar, regel = Kundengruppenregel (Empfang darf übersteuern, Annahme A-13) */
L.pruefeRegeln = (db, kunde, anlageId, start, ende, opt = {}) => {
  const p = db.params, hart = [], regel = [];
  const a = L.anlage(db, anlageId);
  const g = kunde ? L.gruppe(db, kunde.gruppeId) : null;
  const dauer = U.diffMin(start, ende);
  if (!a || !a.aktiv) hart.push('Die Anlage ist deaktiviert und nicht reservierbar.');
  if (start <= U.now()) hart.push('Der Beginn liegt in der Vergangenheit.');
  if (dauer <= 0) hart.push('Das Ende muss nach dem Beginn liegen.');
  if (U.toMin(U.timePart(start)) % p.raster !== 0 || dauer % p.raster !== 0) hart.push(`Beginn und Dauer müssen im ${p.raster}-Minuten-Raster liegen (PA-01).`);
  if (dauer < p.minDauer) hart.push(`Die Mindestdauer beträgt ${p.minDauer} Minuten (PA-01).`);
  if (a) {
    const o = L.oeffnung(a, U.datePart(start));
    if (!o || U.datePart(ende) !== U.datePart(start) || U.timePart(start) < o.von || U.timePart(ende) > o.bis) {
      hart.push(o ? `Ausserhalb der reservierbaren Zeiten (${o.von}–${o.bis} Uhr).` : 'Die Anlage ist an diesem Tag geschlossen.');
    }
  }
  if (g) {
    if (g.anlagenIds && !g.anlagenIds.includes(anlageId)) regel.push(`Diese Anlage ist für die Kundengruppe «${g.name}» nicht reservierbar.`);
    if (!opt.serie) {
      const grenze = U.addDays(U.today(), g.vorlaufTage);
      if (U.datePart(start) > grenze) regel.push(`Buchungsvorlauf «${g.name}»: höchstens ${g.vorlaufTage} Tage im Voraus (bis ${U.fmtDate(grenze)}).`);
      if (g.maxOffen != null && g.maxOffen !== '') {
        const now = U.now();
        const offen = db.reservationen.filter(r => r.kundeId === kunde.id && r.status === 'aktiv' && !r.serieId && r.ende > now && r.id !== opt.ignoreResId).length;
        if (offen >= Number(g.maxOffen)) regel.push(`Höchstens ${g.maxOffen} gleichzeitig offene Einzelreservationen für «${g.name}» (bereits ${offen}).`);
      }
    }
    if (g.maxDauerMin && dauer > g.maxDauerMin) regel.push(`Maximale Dauer einer Reservation für «${g.name}»: ${g.maxDauerMin} Minuten.`);
  }
  const kb = L.kontingentBlock(db, anlageId, start, ende, kunde ? kunde.gruppeId : null);
  if (kb) regel.push(`Das Zeitband ist als Kontingent reserviert: ${L.kontingentText(db, kb)}.`);
  return { hart, regel };
};

/* Ist [s,e] für diese Kundin frei und regelkonform? */
L.istFrei = (db, anlageId, s, e, kunde, opt = {}) => {
  const pr = L.pruefeRegeln(db, kunde, anlageId, s, e, opt);
  if (pr.hart.length) return false;
  if (!opt.ignoreRegeln && pr.regel.length) return false;
  if (L.conflicts(db, anlageId, s, e, opt).length) return false;
  if (L.offerBlock(db, anlageId, s, e, kunde && kunde.id)) return false;
  return true;
};

/* Zeitfenster eines Tages für die Verfügbarkeitsanzeige (FA-01) */
L.slots = (db, anlageId, dateS, kunde) => {
  const a = L.anlage(db, anlageId);
  const o = L.oeffnung(a, dateS);
  if (!o) return [];
  const p = db.params, now = U.now(), out = [];
  for (let m = U.toMin(o.von); m + p.minDauer <= U.toMin(o.bis); m += p.raster) {
    const s = dateS + 'T' + U.fromMin(m);
    const e = U.addMin(s, p.minDauer);
    let status = 'frei';
    if (s <= now) status = 'vergangen';
    else {
      const k = L.conflicts(db, anlageId, s, e);
      if (k.some(x => x.typ === 'sperre')) status = 'gesperrt';
      else if (k.length) status = 'belegt';
      else if (L.kontingentBlock(db, anlageId, s, e, kunde ? kunde.gruppeId : null)) status = 'kontingent';
      else if (L.offerBlock(db, anlageId, s, e, kunde && kunde.id)) status = 'angeboten';
    }
    out.push({ start: s, ende: e, status });
  }
  return out;
};

/* Freie Alternativen am selben Tag (FA-06, UC-02 4b) */
L.alternativen = (db, anlageId, start, ende, kunde, opt = {}) => {
  const a = L.anlage(db, anlageId);
  if (!a) return [];
  const dauer = U.diffMin(start, ende);
  const d = U.datePart(start);
  const p = db.params;
  const out = [];
  const o2 = Object.assign({ ignoreRegeln: !!opt.ignoreRegeln }, opt);
  db.anlagen.filter(x => x.aktiv && x.sportart === a.sportart && x.id !== anlageId).forEach(x => {
    if (L.istFrei(db, x.id, start, ende, kunde, o2)) out.push({ anlageId: x.id, start, ende });
  });
  const o = L.oeffnung(a, d);
  if (o) {
    const cand = [];
    for (let m = U.toMin(o.von); m + dauer <= U.toMin(o.bis); m += p.raster) {
      const s = d + 'T' + U.fromMin(m);
      if (s === start) continue;
      const e = U.addMin(s, dauer);
      if (L.istFrei(db, anlageId, s, e, kunde, o2)) cand.push({ anlageId, start: s, ende: e, dist: Math.abs(U.diffMin(start, s)) });
    }
    cand.sort((x, y) => x.dist - y.dist).slice(0, 5).forEach(c => out.push({ anlageId: c.anlageId, start: c.start, ende: c.ende }));
  }
  return out.slice(0, opt.max || 8);
};

/* ---------- Reservieren (FA-04, FA-05, FA-06) ---------- */
L.reservieren = (db, ctx, d) => {
  const kunde = L.kunde(db, d.kundeId);
  if (!kunde) throw Fehler('Eine Reservation lässt sich nur mit einem Kundenkonto speichern (FA-07).');
  const imAuftrag = !ctx.system && d.kanal !== 'online';
  if (!ctx.system) {
    if (imAuftrag) L.req(ctx, 'imAuftrag');
    else { L.req(ctx, 'eigene'); L.eigeneKunde(ctx, kunde.id); }
  }
  const pr = ctx.system ? { hart: [], regel: [] } : L.pruefeRegeln(db, kunde, d.anlageId, d.start, d.ende, { serie: !!d.serieId });
  if (pr.hart.length) throw Fehler(pr.hart.join(' '), { regeln: pr.hart });
  if (pr.regel.length && !(imAuftrag && d.override) && !ctx.system) {
    throw Fehler('Die Buchungsregel lässt diese Reservation nicht zu: ' + pr.regel.join(' '), { regeln: pr.regel, uebersteuerbar: imAuftrag });
  }
  const konf = L.conflicts(db, d.anlageId, d.start, d.ende);
  if (konf.length) {
    throw Fehler('Das Zeitfenster ist nicht mehr frei. Es wurde keine Reservation gespeichert (FA-06).', {
      konflikte: konf.map(k => L.konfliktText(db, k)),
      alternativen: L.alternativen(db, d.anlageId, d.start, d.ende, kunde, { ignoreRegeln: imAuftrag }),
    });
  }
  if (!d.viaWarteliste && !ctx.system) {
    const ob = L.offerBlock(db, d.anlageId, d.start, d.ende, kunde.id);
    if (ob) throw Fehler(`Das Zeitfenster wird bis ${U.timePart(ob.angebotBis)} Uhr Personen auf der Warteliste angeboten.`, {
      alternativen: L.alternativen(db, d.anlageId, d.start, d.ende, kunde, { ignoreRegeln: imAuftrag }),
    });
  }
  const r = {
    id: U.id('R'), anlageId: d.anlageId, kundeId: kunde.id, gruppeId: kunde.gruppeId,
    start: d.start, ende: d.ende, status: 'aktiv', kanal: d.kanal, serieId: d.serieId || null,
    viaWarteliste: !!d.viaWarteliste, kurzfristig: false, erstellt: new Date().toISOString(),
    erinnert: U.diffMin(U.now(), d.start) <= db.params.erinnerungStd * 60,
  };
  db.reservationen.push(r);
  const ueb = (imAuftrag && d.override && pr.regel.length) ? ' – Buchungsregel übersteuert: ' + pr.regel.join(' ') : '';
  L.log(db, ctx, d.viaWarteliste ? 'Reservation über Warteliste' : 'Reservation erfasst', 'reservation', r.id, d.kanal,
    `${L.anlage(db, r.anlageId).name}, ${U.fmtRange(r.start, r.ende)}${ueb}`);
  const m = d.silent ? { email: !!kunde.email } : L.bestaetigung(db, r, 'Reservation bestätigt');
  return { res: r, ohneEmail: !m.email };
};

L.istKurzfristig = (db, r) => U.now() > U.addMin(r.start, -db.params.stornofristStd * 60);

/* ---------- Stornieren (FA-10, FA-11, FA-12) ---------- */
L.stornieren = (db, ctx, resId, opt = {}) => {
  const r = L.find(db.reservationen, resId);
  if (!r || r.status !== 'aktiv') throw Fehler('Die Reservation existiert nicht oder ist bereits storniert.');
  const staff = ctx.system || can(ctx.user, 'imAuftrag') || opt.durchSperre;
  if (!staff) {
    L.req(ctx, 'eigene'); L.eigeneKunde(ctx, r.kundeId);
    if (r.start <= U.now()) throw Fehler('Eine Reservation lässt sich nur vor ihrem Beginn stornieren.');
  } else if (r.ende <= U.now()) throw Fehler('Die Reservation ist bereits vorbei.');
  r.status = 'storniert';
  r.storniertAm = new Date().toISOString();
  r.storniertVon = ctx.user ? ctx.user.id : null;
  r.stornoGrund = opt.grund || '';
  r.kurzfristig = !opt.durchArenaOne && L.istKurzfristig(db, r);
  L.log(db, ctx, r.kurzfristig ? 'Reservation kurzfristig storniert' : 'Reservation storniert', 'reservation', r.id, opt.kanal || (staff ? 'system' : 'online'),
    `${L.anlage(db, r.anlageId).name}, ${U.fmtRange(r.start, r.ende)}${r.stornoGrund ? ' – ' + r.stornoGrund : ''}`);
  const m = opt.silent ? { email: !!(L.kunde(db, r.kundeId) || {}).email } : L.bestaetigung(db, r, r.kurzfristig ? 'Stornierung bestätigt (kurzfristige Stornierung)' : 'Stornierung bestätigt');
  L.freigeben(db, ctx, r.anlageId, r.start, r.ende);
  return { kurzfristig: r.kurzfristig, ohneEmail: !m.email };
};

/* ---------- Verschieben (FA-09, FA-11, FA-19) ---------- */
L.verschieben = (db, ctx, resId, ziel, opt = {}) => {
  const r = L.find(db.reservationen, resId);
  if (!r || r.status !== 'aktiv') throw Fehler('Die Reservation existiert nicht oder ist storniert.');
  const staff = ctx.system || can(ctx.user, 'imAuftrag') || opt.durchSperre;
  const kunde = L.kunde(db, r.kundeId);
  if (!staff) {
    L.req(ctx, 'eigene'); L.eigeneKunde(ctx, r.kundeId);
    if (L.istKurzfristig(db, r)) throw Fehler(`Die Stornofrist (${db.params.stornofristStd} Stunden vor Beginn) ist abgelaufen. Verschieben ist nur noch über den Empfang möglich (FA-09).`);
  }
  const pr = L.pruefeRegeln(db, kunde, ziel.anlageId, ziel.start, ziel.ende, { serie: !!r.serieId, ignoreResId: r.id });
  if (pr.hart.length) throw Fehler(pr.hart.join(' '));
  if (pr.regel.length && !(staff && opt.override)) throw Fehler('Die Buchungsregel lässt das neue Zeitfenster nicht zu: ' + pr.regel.join(' '), { regeln: pr.regel, uebersteuerbar: staff });
  const konf = L.conflicts(db, ziel.anlageId, ziel.start, ziel.ende, { ignoreResId: r.id });
  if (konf.length) throw Fehler('Das neue Zeitfenster ist nicht frei (FA-06).', { konflikte: konf.map(k => L.konfliktText(db, k)) });
  if (L.offerBlock(db, ziel.anlageId, ziel.start, ziel.ende, r.kundeId)) throw Fehler('Das neue Zeitfenster wird gerade der Warteliste angeboten.');
  const alt = { anlageId: r.anlageId, start: r.start, ende: r.ende };
  r.anlageId = ziel.anlageId; r.start = ziel.start; r.ende = ziel.ende;
  r.erinnert = U.diffMin(U.now(), r.start) <= db.params.erinnerungStd * 60;
  L.log(db, ctx, 'Reservation verschoben', 'reservation', r.id, opt.kanal || (staff ? 'system' : 'online'),
    `von ${L.anlage(db, alt.anlageId).name}, ${U.fmtRange(alt.start, alt.ende)} auf ${L.anlage(db, r.anlageId).name}, ${U.fmtRange(r.start, r.ende)}${opt.grund ? ' – ' + opt.grund : ''}`);
  const m = opt.silent ? { email: !!(kunde || {}).email } : L.bestaetigung(db, r, 'Reservation verschoben');
  L.freigeben(db, ctx, alt.anlageId, alt.start, alt.ende);
  return { ohneEmail: !m.email };
};

/* ---------- Warteliste (FA-13 bis FA-15) ---------- */
L.freigeben = (db, ctx, anlageId, start, ende) => {
  const rel = L.related(db, anlageId);
  const now = U.now(), p = db.params;
  db.warteliste.filter(w => w.status === 'wartend' && rel.includes(w.anlageId) && U.overlap(w.start, w.ende, start, ende) && w.start > now
    && L.conflicts(db, w.anlageId, w.start, w.ende).length === 0).forEach(w => {
    const lim = U.addMin(now, p.annahmefristMin);
    w.status = 'angeboten'; w.angebotAm = now; w.angebotBis = lim < w.start ? lim : w.start;
    const a = L.anlage(db, w.anlageId);
    L.senden(db, L.kunde(db, w.kundeId), 'ArenaOne Warteliste: Zeitfenster frei',
      `Guten Tag\n\nDas Zeitfenster, für das Sie auf der Warteliste stehen, ist frei geworden:\nAnlage: ${a.name}\nDatum: ${U.fmtDate(w.start)}\nZeit: ${U.timePart(w.start)}–${U.timePart(w.ende)} Uhr\n\nWer zuerst bestätigt, erhält die Reservation. Angebot gültig bis ${U.fmtDT(w.angebotBis)} Uhr.\nLink zur Reservation: «Meine Reservationen» → Warteliste → «Angebot annehmen».`,
      { link: '#/meine' });
    L.log(db, ctx, 'Warteliste benachrichtigt', 'warteliste', w.id, 'system', `${a.name}, ${U.fmtRange(w.start, w.ende)}`);
  });
};

L.wartelisteEintragen = (db, ctx, d) => {
  L.req(ctx, 'eigene'); L.eigeneKunde(ctx, d.kundeId);
  const kunde = L.kunde(db, d.kundeId);
  const konf = L.conflicts(db, d.anlageId, d.start, d.ende);
  if (konf.some(k => k.typ === 'sperre')) throw Fehler('Die Anlage ist in diesem Zeitraum gesperrt; eine Warteliste gibt es dafür nicht.');
  if (!konf.length) throw Fehler('Das Zeitfenster ist frei. Für freie Zeitfenster gibt es keine Warteliste – bitte direkt reservieren (FA-13).');
  const pr = L.pruefeRegeln(db, kunde, d.anlageId, d.start, d.ende);
  const errs = pr.hart.concat(pr.regel);
  if (errs.length) throw Fehler(errs.join(' '));
  if (db.warteliste.some(w => w.kundeId === d.kundeId && w.anlageId === d.anlageId && w.start === d.start && ['wartend', 'angeboten'].includes(w.status)))
    throw Fehler('Sie stehen für dieses Zeitfenster bereits auf der Warteliste.');
  const w = { id: U.id('W'), anlageId: d.anlageId, kundeId: d.kundeId, userId: ctx.user.id, start: d.start, ende: d.ende, status: 'wartend', erstellt: new Date().toISOString() };
  db.warteliste.push(w);
  L.log(db, ctx, 'Auf Warteliste eingetragen', 'warteliste', w.id, 'online', `${L.anlage(db, w.anlageId).name}, ${U.fmtRange(w.start, w.ende)}`);
  return w;
};
L.wartelisteAustragen = (db, ctx, id) => {
  const w = L.find(db.warteliste, id);
  if (!w || !['wartend', 'angeboten'].includes(w.status)) throw Fehler('Eintrag nicht gefunden.');
  L.req(ctx, 'eigene'); L.eigeneKunde(ctx, w.kundeId);
  w.status = 'ausgetragen';
  L.log(db, ctx, 'Von Warteliste ausgetragen', 'warteliste', w.id, 'online', '');
};
L.angebotAnnehmen = (db, ctx, id) => {
  const w = L.find(db.warteliste, id);
  if (!w) throw Fehler('Eintrag nicht gefunden.');
  L.req(ctx, 'eigene'); L.eigeneKunde(ctx, w.kundeId);
  if (w.status !== 'angeboten' || w.angebotBis <= U.now()) {
    if (w.status === 'angeboten') w.status = 'abgelaufen';
    return { ok: false, msg: 'Das Angebot ist abgelaufen oder die Zeit wurde bereits vergeben.' };
  }
  try {
    const res = L.reservieren(db, ctx, { anlageId: w.anlageId, kundeId: w.kundeId, start: w.start, ende: w.ende, kanal: 'online', viaWarteliste: true });
    w.status = 'vergeben';
    const rel = L.related(db, w.anlageId);
    db.warteliste.filter(x => x.id !== w.id && ['wartend', 'angeboten'].includes(x.status) && rel.includes(x.anlageId) && U.overlap(x.start, x.ende, w.start, w.ende)).forEach(x => {
      const war = x.status;
      x.status = war === 'angeboten' ? 'nicht erhalten' : 'geschlossen';
      L.senden(db, L.kunde(db, x.kundeId), 'ArenaOne Warteliste: Zeit vergeben',
        `Guten Tag\n\nDas Zeitfenster ${L.anlage(db, x.anlageId).name}, ${U.fmtRange(x.start, x.ende)} wurde bereits an eine andere Person vergeben. Ihr Wartelisteneintrag ist geschlossen.\n\nFreundliche Grüsse\nArenaOne Sportzentrum AG`);
    });
    return { ok: true, res: res.res };
  } catch (e) {
    w.status = 'nicht erhalten';
    return { ok: false, msg: e.message };
  }
};

/* ---------- Serien (FA-16 bis FA-20) ---------- */
L.serieTermine = s => {
  const out = [];
  let d = s.von;
  let guard = 0;
  while (U.weekday(d) !== Number(s.wochentag) && guard++ < 7) d = U.addDays(d, 1);
  while (d <= s.bis) { out.push(d); d = U.addDays(d, 7); }
  return out;
};
L.serieStart = (s, d) => d + 'T' + s.beginn;
L.serieKonflikte = (db, s) => {
  const kunde = L.kunde(db, s.kundeId);
  const a = L.anlage(db, s.anlageId);
  const now = U.now();
  return L.serieTermine(s).map(d => {
    const start = L.serieStart(s, d), ende = U.addMin(start, s.dauerMin);
    const gruende = [];
    if (start <= now) gruende.push('liegt in der Vergangenheit');
    const o = L.oeffnung(a, d);
    if (!o || U.timePart(start) < o.von || U.timePart(ende) > o.bis || U.datePart(ende) !== d) gruende.push('ausserhalb der Öffnungszeit');
    L.conflicts(db, s.anlageId, start, ende).forEach(k => gruende.push(L.konfliktText(db, k)));
    const kb = L.kontingentBlock(db, s.anlageId, start, ende, kunde ? kunde.gruppeId : null);
    if (kb) gruende.push('Kontingent ' + L.kontingentText(db, kb));
    return { datum: d, start, ende, gruende };
  });
};
L.serieName = (db, s) => `${L.kundeKurz(L.kunde(db, s.kundeId))}: ${U.WT[s.wochentag]} ${s.beginn}–${U.timePart(U.addMin('2000-01-01T' + s.beginn, s.dauerMin))}`;

L.serieBeantragen = (db, ctx, d) => {
  L.req(ctx, 'serieBeantragen');
  const staff = ctx.system || can(ctx.user, 'serieBestaetigen');
  if (!staff) L.eigeneKunde(ctx, d.kundeId);
  const kunde = L.kunde(db, d.kundeId);
  if (!kunde) throw Fehler('Kundenkonto fehlt.');
  if (!kunde.organisation) throw Fehler('Serien sind für Organisationen (Verein, Firma, Trainingsgruppe) vorgesehen (UC-05, Annahme A-15).');
  const a = L.anlage(db, d.anlageId);
  if (!a || !a.aktiv) throw Fehler('Bitte eine aktive Anlage wählen.');
  const p = db.params, g = L.gruppe(db, kunde.gruppeId);
  const dauer = Number(d.dauerMin);
  if (!d.beginn || U.toMin(d.beginn) % p.raster) throw Fehler(`Beginn im ${p.raster}-Minuten-Raster angeben.`);
  if (!dauer || dauer < p.minDauer || dauer % p.raster) throw Fehler(`Dauer mindestens ${p.minDauer} Minuten im ${p.raster}-Minuten-Raster.`);
  if (g && g.maxDauerMin && dauer > g.maxDauerMin) throw Fehler(`Maximale Dauer für «${g.name}»: ${g.maxDauerMin} Minuten.`);
  if (g && g.anlagenIds && !g.anlagenIds.includes(a.id)) throw Fehler(`Diese Anlage ist für «${g.name}» nicht reservierbar.`);
  if (!d.von || !d.bis || d.bis < d.von) throw Fehler('Erster und letzter Termin angeben (letzter nach erstem).');
  const s = {
    id: U.id('S'), kundeId: kunde.id, anlageId: a.id, wochentag: Number(d.wochentag), beginn: d.beginn, dauerMin: dauer,
    von: d.von, bis: d.bis, status: 'beantragt', grund: '', ausgelassen: [], kanal: d.kanal || 'online',
    beantragtVon: ctx.user ? ctx.user.id : null, beantragtAm: new Date().toISOString(), bemerkung: d.bemerkung || '',
  };
  if (!L.serieTermine(s).length) throw Fehler('Im gewählten Zeitraum liegt kein Termin an diesem Wochentag.');
  db.serien.push(s);
  L.log(db, ctx, 'Serie beantragt', 'serie', s.id, s.kanal, `${a.name}, ${U.WT_LANG[s.wochentag]} ${s.beginn}, ${dauer} Min., ${U.fmtDate(s.von)} bis ${U.fmtDate(s.bis)}`);
  L.senden(db, kunde, 'ArenaOne: Serienantrag eingegangen',
    `Guten Tag\n\nIhr Antrag für eine Serie ist eingegangen und wird vom Empfang geprüft:\nAnlage: ${a.name}\n${U.WT_LANG[s.wochentag]}, ${s.beginn} Uhr, ${dauer} Minuten\n${U.fmtDate(s.von)} bis ${U.fmtDate(s.bis)}\n\nBis zur Bestätigung ist noch keine Zeit reserviert.\n\nFreundliche Grüsse\nArenaOne Sportzentrum AG`);
  return s;
};

/* PA-10: Anteil der Abendstunden (werktags) einer Anlage, der durch Kontingente (und optional Serien) belegt ist */
L.abendAnteil = (db, anlageId, opt = {}) => {
  const p = db.params;
  const av = U.toMin(p.abendVon), ab = U.toMin(p.abendBis);
  const total = 5 * (ab - av);
  if (total <= 0) return 0;
  const cells = { 1: new Set(), 2: new Set(), 3: new Set(), 4: new Set(), 5: new Set() };
  const add = (wd, von, bis) => {
    if (!cells[wd]) return;
    for (let m = Math.max(av, von); m < Math.min(ab, bis); m += 1) cells[wd].add(m);
  };
  const ks = db.kontingente.filter(k => k.anlageId === anlageId && k.id !== opt.ignoreKontingentId).concat(opt.extraKontingent ? [opt.extraKontingent] : []);
  ks.forEach(k => k.wochentage.forEach(wd => add(wd, U.toMin(k.von), U.toMin(k.bis))));
  if (opt.mitSerien) {
    const today = U.today();
    db.serien.filter(s => s.anlageId === anlageId && s.status === 'bestaetigt' && s.bis >= today).concat(opt.extraSerie ? [opt.extraSerie] : [])
      .forEach(s => add(s.wochentag, U.toMin(s.beginn), U.toMin(s.beginn) + s.dauerMin));
  }
  let used = 0;
  Object.values(cells).forEach(c => { used += c.size; });
  return used / total;
};

L.serieBestaetigen = (db, ctx, id, modus) => {
  L.req(ctx, 'serieBestaetigen');
  const s = L.find(db.serien, id);
  if (!s || s.status !== 'beantragt') throw Fehler('Der Antrag ist nicht mehr offen.');
  const termine = L.serieKonflikte(db, s);
  const konf = termine.filter(t => t.gruende.length);
  if (modus === 'ganz' && konf.length) throw Fehler(`Die Serie hat ${konf.length} Konflikttermin(e). «Ganz bestätigen» würde Doppelbuchungen erzeugen; bitte «ohne Konflikttermine» wählen (FA-06, FA-18).`);
  const ok = termine.filter(t => !t.gruende.length);
  if (!ok.length) throw Fehler('Kein Einzeltermin ist frei; die Serie kann nur abgelehnt werden.');
  const kunde = L.kunde(db, s.kundeId);
  ok.forEach(t => {
    db.reservationen.push({
      id: U.id('R'), anlageId: s.anlageId, kundeId: s.kundeId, gruppeId: kunde ? kunde.gruppeId : null, start: t.start, ende: t.ende,
      status: 'aktiv', kanal: s.kanal, serieId: s.id, viaWarteliste: false, kurzfristig: false, erstellt: new Date().toISOString(),
      erinnert: U.diffMin(U.now(), t.start) <= db.params.erinnerungStd * 60,
    });
  });
  s.status = 'bestaetigt';
  s.ausgelassen = konf.map(t => ({ datum: t.datum, grund: t.gruende.join('; ') }));
  s.entschiedenVon = ctx.user ? ctx.user.id : null;
  s.entschiedenAm = new Date().toISOString();
  db.reservationen.filter(r => r.serieId === s.id).forEach(r => L.log(db, ctx, 'Einzeltermin aus Serie erzeugt', 'reservation', r.id, s.kanal, `${L.anlage(db, r.anlageId).name}, ${U.fmtRange(r.start, r.ende)}`));
  L.log(db, ctx, konf.length ? 'Serie ohne Konflikttermine bestätigt' : 'Serie bestätigt', 'serie', s.id, 'system', `${ok.length} Termine reserviert, ${konf.length} ausgelassen`);
  const a = L.anlage(db, s.anlageId);
  const liste = ok.map(t => `- ${U.fmtDate(t.start)}, ${U.timePart(t.start)}–${U.timePart(t.ende)}`).join('\n');
  const ausg = konf.length ? `\n\nNicht reserviert (ausgelassen):\n${konf.map(t => `- ${U.fmtDate(t.start)}: ${t.gruende.join('; ')}`).join('\n')}` : '';
  const m = L.senden(db, kunde, 'ArenaOne: Serie bestätigt – Terminliste',
    `Guten Tag\n\nIhre Serie auf ${a.name} ist bestätigt.\n\nReservierte Termine (${ok.length}):\n${liste}${ausg}\n\nFreundliche Grüsse\nArenaOne Sportzentrum AG`);
  return { reserviert: ok.length, ausgelassen: konf.length, ohneEmail: !m.email };
};
L.serieAblehnen = (db, ctx, id, grund) => {
  L.req(ctx, 'serieBestaetigen');
  const s = L.find(db.serien, id);
  if (!s || s.status !== 'beantragt') throw Fehler('Der Antrag ist nicht mehr offen.');
  if (!grund || !grund.trim()) throw Fehler('Eine Ablehnung verlangt einen Grund (FA-18).');
  s.status = 'abgelehnt'; s.grund = grund.trim(); s.entschiedenVon = ctx.user ? ctx.user.id : null; s.entschiedenAm = new Date().toISOString();
  L.log(db, ctx, 'Serie abgelehnt', 'serie', s.id, 'system', s.grund);
  const m = L.senden(db, L.kunde(db, s.kundeId), 'ArenaOne: Serienantrag abgelehnt',
    `Guten Tag\n\nIhr Serienantrag (${L.anlage(db, s.anlageId).name}, ${U.WT_LANG[s.wochentag]} ${s.beginn} Uhr, ${U.fmtDate(s.von)} bis ${U.fmtDate(s.bis)}) wurde abgelehnt.\nGrund: ${s.grund}\n\nFreundliche Grüsse\nArenaOne Sportzentrum AG`);
  return { ohneEmail: !m.email };
};
/* Berechtigt für einen Serientermin: Empfang/GL oder Berechtigte der Organisation (FA-19) */
L.darfReservation = (user, r) => !!user && (can(user, 'imAuftrag') || (can(user, 'eigene') && (user.kundeIds || []).includes(r.kundeId)));

/* ---------- Sperrzeiten (FA-27, FA-28, FA-23) ---------- */
L.sperreBetroffene = (db, anlageId, start, ende) => {
  const rel = L.related(db, anlageId);
  return db.reservationen.filter(r => r.status === 'aktiv' && rel.includes(r.anlageId) && U.overlap(start, ende, r.start, r.ende) && r.ende > U.now())
    .sort((a, b) => a.start.localeCompare(b.start));
};
L.sperreAlternativen = (db, r, sperre) => {
  // Alternativen ausserhalb der neuen Sperrzeit: Prüfung mit der Sperrzeit als temporärem Eintrag
  db.sperrzeiten.push(sperre);
  try {
    return L.alternativen(db, r.anlageId, r.start, r.ende, L.kunde(db, r.kundeId), { ignoreRegeln: true, ignoreResId: r.id, max: 6 })
      ;
  } finally { db.sperrzeiten.pop(); }
};
L.sperreSpeichern = (db, ctx, d, entscheide) => {
  L.req(ctx, 'sperren');
  const a = L.anlage(db, d.anlageId);
  if (!a) throw Fehler('Bitte eine Anlage wählen.');
  if (!d.start || !d.ende || d.ende <= d.start) throw Fehler('Der Sperrzeitraum ist ungültig (Ende nach Beginn).');
  if (!SPERRGRUENDE.includes(d.grund)) throw Fehler('Bitte einen Grund wählen (Unterhalt, Turnier, Anlass, Wetter).');
  const betroffene = L.sperreBetroffene(db, d.anlageId, d.start, d.ende);
  const fehlend = betroffene.filter(r => !entscheide || !entscheide[r.id]);
  if (fehlend.length) throw Fehler(`Für ${fehlend.length} betroffene Reservation(en) ist noch nicht «stornieren» oder «verschieben» gewählt (FA-28).`);
  const s = { id: U.id('Z'), anlageId: d.anlageId, start: d.start, ende: d.ende, grund: d.grund, notiz: d.notiz || '', erstellt: new Date().toISOString(), erstelltVon: ctx.user ? ctx.user.id : null };
  db.sperrzeiten.push(s);
  L.log(db, ctx, 'Sperrzeit erfasst', 'sperre', s.id, 'system', `${a.name}, ${U.fmtRange(s.start, s.ende)}, Grund: ${s.grund}${s.notiz ? ' (' + s.notiz + ')' : ''}`);
  const info = [];
  betroffene.forEach(r => {
    const e = entscheide[r.id];
    const kunde = L.kunde(db, r.kundeId);
    const vorher = `${L.anlage(db, r.anlageId).name}, ${U.fmtRange(r.start, r.ende)}`;
    let folge;
    if (e === 'storno') {
      L.stornieren(db, ctx, r.id, { durchArenaOne: true, durchSperre: true, silent: true, grund: 'Sperrzeit: ' + s.grund });
      folge = 'Ihre Reservation wurde deshalb storniert. Gerne bieten wir Ihnen am Empfang einen Ersatztermin an.';
    } else {
      L.verschieben(db, ctx, r.id, e, { durchSperre: true, override: true, silent: true, grund: 'Sperrzeit: ' + s.grund });
      folge = `Ersatz: Ihre Reservation wurde verschoben auf ${L.anlage(db, e.anlageId).name}, ${U.fmtRange(e.start, e.ende)}. Passt der Ersatz nicht, können Sie stornieren.`;
    }
    const m = L.senden(db, kunde, 'ArenaOne: Ihre Reservation ist von einer Sperrzeit betroffen',
      `Guten Tag\n\nIhre Reservation ${vorher} ist von einer Sperrzeit betroffen.\nGrund der Sperrzeit: ${s.grund}${s.notiz ? ' – ' + s.notiz : ''}\n\n${folge}\n\nFreundliche Grüsse\nArenaOne Sportzentrum AG`, { sms: false });
    info.push({ kunde: L.kundeKurz(kunde), ohneEmail: !m.email });
  });
  return { sperre: s, info };
};
L.sperreAufheben = (db, ctx, id) => {
  L.req(ctx, 'sperren');
  const i = db.sperrzeiten.findIndex(s => s.id === id);
  if (i < 0) throw Fehler('Sperrzeit nicht gefunden.');
  const s = db.sperrzeiten[i];
  db.sperrzeiten.splice(i, 1);
  L.log(db, ctx, 'Sperrzeit aufgehoben', 'sperre', s.id, 'system', `${L.anlage(db, s.anlageId).name}, ${U.fmtRange(s.start, s.ende)}, ${s.grund}`);
  L.freigeben(db, ctx, s.anlageId, s.start, s.ende);
};

/* ---------- Kundenkonten (FA-07, FA-08, QA-10) ---------- */
L.validiereKunde = (db, d) => {
  if (!d.name || !d.name.trim()) throw Fehler('Name ist ein Pflichtfeld.');
  if (!L.gruppe(db, d.gruppeId)) throw Fehler('Bitte genau eine Kundengruppe wählen.');
  const email = (d.email || '').trim(), tel = (d.telefon || '').trim();
  if (!email && !tel) throw Fehler('Mindestens eine Kontaktangabe (E-Mail oder Telefon) ist nötig (FA-07).');
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw Fehler('Die E-Mail-Adresse ist ungültig.');
  if (d.smsOptIn && !tel) throw Fehler('Für SMS-Benachrichtigungen ist eine Mobilnummer nötig.');
};
L.kundeSpeichern = (db, ctx, d) => {
  const staff = ctx.system || can(ctx.user, 'kundenVerwalten');
  let k = d.id ? L.kunde(db, d.id) : null;
  if (!staff) {
    if (!k) throw Fehler('Keine Berechtigung (QA-13).');
    L.eigeneKunde(ctx, k.id);
    d.gruppeId = k.gruppeId; // Kundengruppe legt der Betrieb fest
  }
  L.validiereKunde(db, d);
  const felder = { name: d.name.trim(), organisation: (d.organisation || '').trim(), gruppeId: d.gruppeId, email: (d.email || '').trim(), telefon: (d.telefon || '').trim(), smsOptIn: !!d.smsOptIn, erinnerungenAus: !!d.erinnerungenAus };
  if (k) { Object.assign(k, felder); L.log(db, ctx, 'Kundenkonto geändert', 'kunde', k.id, '', ''); }
  else {
    k = Object.assign({ id: U.id('K'), erstellt: U.today() }, felder);
    db.kunden.push(k);
    L.log(db, ctx, 'Kundenkonto erfasst', 'kunde', k.id, '', '');
  }
  if (staff && Array.isArray(d.berechtigte)) {
    db.users.forEach(u => {
      if (!(u.rollen || []).some(r => PERM.eigene.includes(r))) return;
      const has = u.kundeIds.includes(k.id);
      const soll = d.berechtigte.includes(u.id);
      if (soll && !has) u.kundeIds.push(k.id);
      if (!soll && has) u.kundeIds = u.kundeIds.filter(x => x !== k.id);
    });
  }
  return k;
};
L.registrieren = (db, d) => {
  if (!d.datenschutz) throw Fehler('Bitte die Datenschutzerklärung zur Kenntnis nehmen (RB-01).');
  if (!d.login || db.users.some(u => u.login.toLowerCase() === d.login.toLowerCase())) throw Fehler('Benutzername fehlt oder ist schon vergeben.');
  if (!d.passwort || d.passwort.length < 8) throw Fehler('Passwort: mindestens 8 Zeichen.');
  const privat = db.gruppen.find(g => g.id === 'G-privat') || db.gruppen[0];
  L.validiereKunde(db, Object.assign({}, d, { gruppeId: privat.id }));
  if (!d.email) throw Fehler('Für die Online-Registrierung ist eine E-Mail-Adresse nötig (Bestätigungen, FA-21).');
  const k = { id: U.id('K'), name: d.name.trim(), organisation: '', gruppeId: privat.id, email: d.email.trim(), telefon: (d.telefon || '').trim(), smsOptIn: false, erinnerungenAus: false, erstellt: U.today() };
  db.kunden.push(k);
  const u = { id: U.id('U'), name: k.name, login: d.login.trim(), passwort: d.passwort, rollen: ['kunde'], kundeIds: [k.id], aktiv: true };
  db.users.push(u);
  L.log(db, { user: u }, 'Registrierung', 'kunde', k.id, 'online', '');
  return u;
};

/* ---------- Regeln, Kundengruppen, Kontingente, Parameter (FA-24 bis FA-26, Kap. 7.3) ---------- */
L.gruppeSpeichern = (db, ctx, d) => {
  L.req(ctx, 'regeln');
  if (!d.name || !d.name.trim()) throw Fehler('Die Kundengruppe braucht einen Namen.');
  if (db.gruppen.some(g => g.name.toLowerCase() === d.name.trim().toLowerCase() && g.id !== d.id)) throw Fehler('Eine Kundengruppe mit diesem Namen gibt es schon.');
  const v = Number(d.vorlaufTage), md = Number(d.maxDauerMin);
  if (!(v >= 0)) throw Fehler('Buchungsvorlauf in Tagen angeben.');
  if (!(md >= db.params.minDauer)) throw Fehler(`Maximale Dauer mindestens ${db.params.minDauer} Minuten.`);
  const mo = d.maxOffen === '' || d.maxOffen == null ? null : Number(d.maxOffen);
  if (mo != null && !(mo >= 0)) throw Fehler('Anzahl offener Reservationen: Zahl oder leer (= unbegrenzt).');
  const felder = { name: d.name.trim(), vorlaufTage: v, maxDauerMin: md, maxOffen: mo, anlagenIds: d.anlagenIds && d.anlagenIds.length < db.anlagen.length ? d.anlagenIds : null };
  let g = d.id ? L.gruppe(db, d.id) : null;
  if (g) { Object.assign(g, felder); L.log(db, ctx, 'Buchungsregeln geändert', 'gruppe', g.id, '', `${g.name}: Vorlauf ${v} Tage, max. ${md} Min., offen ${mo == null ? 'unbegrenzt' : mo}`); }
  else { g = Object.assign({ id: U.id('G') }, felder); db.gruppen.push(g); L.log(db, ctx, 'Kundengruppe angelegt', 'gruppe', g.id, '', g.name); }
  return g;
};
L.kontingentSpeichern = (db, ctx, d) => {
  L.req(ctx, 'regeln');
  if (!L.anlage(db, d.anlageId) || !L.gruppe(db, d.gruppeId)) throw Fehler('Anlage und Kundengruppe wählen.');
  if (!d.wochentage || !d.wochentage.length) throw Fehler('Mindestens einen Wochentag wählen.');
  if (!d.von || !d.bis || d.bis <= d.von) throw Fehler('Zeitband ungültig.');
  const k = { id: U.id('C'), anlageId: d.anlageId, gruppeId: d.gruppeId, wochentage: d.wochentage.map(Number), von: d.von, bis: d.bis };
  const anteil = L.abendAnteil(db, d.anlageId, { extraKontingent: k });
  if (anteil > db.params.kontingentMaxAnteil / 100 + 1e-9) throw Fehler(`Mit diesem Kontingent wären ${U.fmtPct(anteil)} der Abendstunden (werktags ${db.params.abendVon}–${db.params.abendBis}) der Anlage vergeben; erlaubt sind höchstens ${db.params.kontingentMaxAnteil} % (PA-10).`);
  db.kontingente.push(k);
  L.log(db, ctx, 'Kontingent festgelegt', 'kontingent', k.id, '', L.kontingentText(db, k));
  return k;
};
L.kontingentLoeschen = (db, ctx, id) => {
  L.req(ctx, 'regeln');
  const i = db.kontingente.findIndex(k => k.id === id);
  if (i < 0) throw Fehler('Kontingent nicht gefunden.');
  L.log(db, ctx, 'Kontingent aufgehoben', 'kontingent', id, '', L.kontingentText(db, db.kontingente[i]));
  db.kontingente.splice(i, 1);
};
L.paramsSpeichern = (db, ctx, d) => {
  L.req(ctx, 'regeln');
  const n = k => { const v = Number(d[k]); if (!(v >= 0)) throw Fehler(`Ungültiger Wert für ${k}.`); return v; };
  const p = {
    raster: n('raster'), minDauer: n('minDauer'), stornofristStd: n('stornofristStd'), annahmefristMin: n('annahmefristMin'),
    erinnerungStd: n('erinnerungStd'), aufbewahrungMonate: n('aufbewahrungMonate'), kontingentMaxAnteil: n('kontingentMaxAnteil'),
    abendVon: d.abendVon, abendBis: d.abendBis, spitzenlast: n('spitzenlast'),
  };
  if (![15, 30, 60].includes(p.raster)) throw Fehler('Zeitraster: 15, 30 oder 60 Minuten.');
  if (p.minDauer < p.raster || p.minDauer % p.raster) throw Fehler('Die Mindestdauer muss ein Vielfaches des Rasters sein.');
  if (p.kontingentMaxAnteil > 100) throw Fehler('Höchstanteil höchstens 100 %.');
  Object.assign(db.params, p);
  L.log(db, ctx, 'Parameter geändert', 'parameter', 'params', '', JSON.stringify(p));
};

/* ---------- Stammdaten, Benutzer (FA-32, FA-33) ---------- */
L.anlageSpeichern = (db, ctx, d) => {
  L.req(ctx, 'admin');
  if (!d.name || !d.name.trim()) throw Fehler('Bezeichnung fehlt.');
  if (!SPORTARTEN.includes(d.sportart)) throw Fehler('Sportart wählen.');
  if (d.parentId) {
    const p = L.anlage(db, d.parentId);
    if (!p || p.parentId || p.id === d.id) throw Fehler('Ein Hallenteil muss zu einer ganzen Mehrzweckhalle gehören.');
  }
  for (const [wd, o] of Object.entries(d.oeffnung || {})) if (o && o[0] && o[1] && o[1] <= o[0]) throw Fehler(`Öffnungszeit ${U.WT[wd]}: Ende vor Beginn.`);
  let a = d.id ? L.anlage(db, d.id) : null;
  const felder = { name: d.name.trim(), sportart: d.sportart, parentId: d.parentId || null, oeffnung: d.oeffnung, aktiv: d.aktiv !== false };
  if (a) {
    const war = a.aktiv;
    Object.assign(a, felder);
    L.log(db, ctx, war && !a.aktiv ? 'Anlage deaktiviert' : (!war && a.aktiv ? 'Anlage aktiviert' : 'Anlage geändert'), 'anlage', a.id, '', a.name);
  } else {
    a = Object.assign({ id: U.id('A') }, felder);
    db.anlagen.push(a);
    L.log(db, ctx, 'Anlage erfasst', 'anlage', a.id, '', a.name);
  }
  return a;
};
L.userSpeichern = (db, ctx, d) => {
  L.req(ctx, 'admin');
  const rollen = (d.rollen || []).filter(r => ROLLEN[r]);
  if (!d.name || !d.login) throw Fehler('Name und Benutzername angeben.');
  if (db.users.some(u => u.login.toLowerCase() === d.login.toLowerCase() && u.id !== d.id)) throw Fehler('Benutzername schon vergeben.');
  let u = d.id ? L.user(db, d.id) : null;
  const staff = rollen.some(r => STAFF_ROLLEN.includes(r));
  if (d.passwort) {
    if (staff && d.passwort.length < 12) throw Fehler('Mitarbeitende brauchen ein Passwort mit mindestens 12 Zeichen (QA-14).');
    if (d.passwort.length < 8) throw Fehler('Passwort: mindestens 8 Zeichen.');
  } else if (!u) throw Fehler('Passwort angeben.');
  else if (staff && u.passwort.length < 12) throw Fehler('Für Mitarbeiterrollen muss ein neues Passwort mit mindestens 12 Zeichen gesetzt werden (QA-14).');
  if (u && u.id === (ctx.user && ctx.user.id) && !rollen.includes('admin')) throw Fehler('Sie können sich die Rolle «Administration» nicht selbst entziehen.');
  const felder = { name: d.name.trim(), login: d.login.trim(), rollen, kundeIds: d.kundeIds || [], aktiv: d.aktiv !== false };
  if (d.passwort) felder.passwort = d.passwort;
  if (u) {
    const alt = u.rollen.join(', ');
    Object.assign(u, felder);
    L.log(db, ctx, 'Benutzer geändert', 'user', u.id, '', `${u.login}: Rollen ${alt || '–'} → ${u.rollen.join(', ') || '–'}`);
  } else {
    u = Object.assign({ id: U.id('U') }, felder);
    db.users.push(u);
    L.log(db, ctx, 'Benutzer erfasst', 'user', u.id, '', `${u.login}: ${u.rollen.join(', ')}`);
  }
  return u;
};

/* ---------- Auswertungen (FA-29, FA-30) ---------- */
L.auswertungAnlagen = (db, von, bis, f = {}) => db.anlagen.filter(a => (!f.sportart || a.sportart === f.sportart) && (!f.anlageId || a.id === f.anlageId)
  && (a.aktiv || db.reservationen.some(r => r.anlageId === a.id && U.datePart(r.start) >= von && U.datePart(r.start) <= bis)));

L.auslastung = (db, von, bis, f = {}) => {
  const raster = db.params.raster;
  const anlagen = L.auswertungAnlagen(db, von, bis, f);
  const byDate = {};
  db.reservationen.forEach(r => { if (r.status !== 'aktiv') return; const d = U.datePart(r.start); (byDate[d] = byDate[d] || []).push(r); });
  const res = { anlagen: {}, sportart: {}, gruppe: {}, wochentag: {}, stunde: {}, total: { reservierbar: 0, reserviert: 0 } };
  const inc = (obj, key, field, v) => { obj[key] = obj[key] || { reservierbar: 0, reserviert: 0 }; obj[key][field] += v; };
  for (let d = von; d <= bis; d = U.addDays(d, 1)) {
    const wd = U.weekday(d);
    anlagen.forEach(a => {
      const o = L.oeffnung(a, d);
      if (!o) return;
      const rel = L.related(db, a.id);
      const rs = (byDate[d] || []).filter(r => rel.includes(r.anlageId));
      const ss = db.sperrzeiten.filter(s => rel.includes(s.anlageId) && U.overlap(s.start, s.ende, d + 'T00:00', U.addDays(d, 1) + 'T00:00'));
      for (let m = U.toMin(o.von); m < U.toMin(o.bis); m += raster) {
        const cs = d + 'T' + U.fromMin(m), ce = U.addMin(cs, raster);
        if (ss.some(s => U.overlap(cs, ce, s.start, s.ende))) continue;
        const h = Math.floor(m / 60);
        inc(res.anlagen, a.id, 'reservierbar', raster); inc(res.sportart, a.sportart, 'reservierbar', raster);
        inc(res.wochentag, wd, 'reservierbar', raster); inc(res.stunde, h, 'reservierbar', raster);
        res.total.reservierbar += raster;
        const r = rs.find(x => U.overlap(cs, ce, x.start, x.ende));
        if (r) {
          inc(res.anlagen, a.id, 'reserviert', raster); inc(res.sportart, a.sportart, 'reserviert', raster);
          inc(res.wochentag, wd, 'reserviert', raster); inc(res.stunde, h, 'reserviert', raster);
          inc(res.gruppe, r.gruppeId || '–', 'reserviert', raster);
          res.total.reserviert += raster;
        }
      }
    });
  }
  return { res, anlagen };
};
L.stornoStats = (db, von, bis, f = {}) => {
  const anl = new Set(L.auswertungAnlagen(db, von, bis, f).map(a => a.id));
  const out = {};
  const tot = { storniert: 0, kurzfristig: 0, neuVergeben: 0, reservationen: 0 };
  const inc = (g, k) => { out[g] = out[g] || { storniert: 0, kurzfristig: 0, neuVergeben: 0, reservationen: 0 }; out[g][k]++; tot[k]++; };
  db.reservationen.forEach(r => {
    const d = U.datePart(r.start);
    if (d < von || d > bis || !anl.has(r.anlageId)) return;
    const g = r.gruppeId || '–';
    inc(g, 'reservationen');
    if (r.status === 'storniert') { inc(g, 'storniert'); if (r.kurzfristig) inc(g, 'kurzfristig'); }
    if (r.viaWarteliste) inc(g, 'neuVergeben');
  });
  return { gruppen: out, total: tot };
};

/* ---------- Datenschutz (QA-11, QA-12) ---------- */
L.loeschlauf = (db, ctx) => {
  const grenze = U.addMonths(U.today(), -db.params.aufbewahrungMonate);
  const geloescht = [];
  db.kunden.slice().forEach(k => {
    const rs = db.reservationen.filter(r => r.kundeId === k.id);
    const letzte = rs.reduce((m, r) => (U.datePart(r.ende) > m ? U.datePart(r.ende) : m), k.erstellt || '0000-00-00');
    const offeneSerie = db.serien.some(s => s.kundeId === k.id && s.bis >= U.today() && s.status !== 'abgelehnt');
    if (letzte >= grenze || offeneSerie) return;
    rs.forEach(r => { r.kundeId = null; r.anonymisiert = true; });
    db.serien.forEach(s => { if (s.kundeId === k.id) s.kundeId = null; });
    db.warteliste = db.warteliste.filter(w => w.kundeId !== k.id);
    db.nachrichten = db.nachrichten.filter(n => n.kundeId !== k.id);
    db.users.slice().forEach(u => {
      if (!u.kundeIds.includes(k.id)) return;
      u.kundeIds = u.kundeIds.filter(x => x !== k.id);
      if (!u.kundeIds.length && u.rollen.every(r => r === 'kunde')) {
        db.users = db.users.filter(x => x.id !== u.id);
        db.protokoll.forEach(p => { if (p.userId === u.id) { p.userId = null; p.userName = 'gelöschtes Konto'; } });
      }
    });
    db.kunden = db.kunden.filter(x => x.id !== k.id);
    geloescht.push(k.id);
  });
  db.meta.letzterLoeschlauf = U.today();
  L.log(db, ctx, 'Löschlauf inaktive Konten', 'system', '', 'system', `${geloescht.length} Konto/Konten gelöscht (letzte Reservation vor ${U.fmtDate(grenze)}), Reservationen anonymisiert`);
  return geloescht.length;
};
L.datenauskunft = (db, ctx, kundeId) => {
  L.req(ctx, 'admin');
  const k = L.kunde(db, kundeId);
  if (!k) throw Fehler('Kundenkonto nicht gefunden.');
  L.log(db, ctx, 'Datenauskunft erstellt', 'kunde', k.id, '', '');
  const anl = id => (L.anlage(db, id) || {}).name;
  return {
    erstellt: new Date().toISOString(),
    stammdaten: { name: k.name, organisation: k.organisation, kundengruppe: L.gruppeName(db, k.gruppeId), email: k.email, telefon: k.telefon, smsOptIn: k.smsOptIn, erinnerungenAus: k.erinnerungenAus, erfasstAm: k.erstellt },
    benutzerkonten: db.users.filter(u => u.kundeIds.includes(k.id)).map(u => ({ name: u.name, benutzername: u.login, rollen: u.rollen })),
    reservationen: db.reservationen.filter(r => r.kundeId === k.id).map(r => ({ anlage: anl(r.anlageId), beginn: r.start, ende: r.ende, status: r.status, kanal: KANAL[r.kanal], serie: !!r.serieId, kurzfristigStorniert: r.kurzfristig })),
    serien: db.serien.filter(s => s.kundeId === k.id).map(s => ({ anlage: anl(s.anlageId), wochentag: U.WT_LANG[s.wochentag], beginn: s.beginn, dauerMin: s.dauerMin, von: s.von, bis: s.bis, status: s.status })),
    warteliste: db.warteliste.filter(w => w.kundeId === k.id).map(w => ({ anlage: anl(w.anlageId), beginn: w.start, ende: w.ende, status: w.status })),
    nachrichten: db.nachrichten.filter(n => n.kundeId === k.id).map(n => ({ zeit: n.zeit, kanal: n.kanal, an: n.an, betreff: n.betreff, text: n.text })),
  };
};

/* ---------- Übernahme bestehender Reservationen (FA-34) ---------- */
L.IMPORT_KOPF = 'typ;anlage;datum;letzter_termin;beginn;ende;kunde;organisation;kundengruppe;email;telefon';
L.importieren = (db, ctx, text) => {
  L.req(ctx, 'admin');
  const zeilen = text.split(/\r?\n/).map(z => z.trim()).filter(z => z && !z.startsWith('#'));
  if (zeilen.length && zeilen[0].toLowerCase().startsWith('typ;')) zeilen.shift();
  const out = { reservationen: 0, serien: 0, termine: 0, neueKunden: 0, konflikte: [], fehler: [] };
  const sys = { system: true, user: ctx.user };
  zeilen.forEach((z, i) => {
    const nr = i + 1;
    const c = z.split(';').map(x => x.trim());
    const [typ, anlName, datum, bisDatum, beginn, ende, name, org, grpName, email, tel] = c;
    try {
      const a = db.anlagen.find(x => x.name.toLowerCase() === (anlName || '').toLowerCase());
      if (!a) throw Fehler(`Anlage «${anlName}» unbekannt`);
      if (!/^\d{4}-\d{2}-\d{2}$/.test(datum || '')) throw Fehler('Datum im Format JJJJ-MM-TT angeben');
      if (!/^\d{2}:\d{2}$/.test(beginn || '') || !/^\d{2}:\d{2}$/.test(ende || '') || ende <= beginn) throw Fehler('Beginn/Ende im Format HH:MM, Ende nach Beginn');
      const g = db.gruppen.find(x => x.name.toLowerCase() === (grpName || '').toLowerCase());
      if (!g) throw Fehler(`Kundengruppe «${grpName}» unbekannt`);
      let k = db.kunden.find(x => x.name.toLowerCase() === (name || '').toLowerCase() && (x.organisation || '').toLowerCase() === (org || '').toLowerCase());
      if (!k) {
        L.validiereKunde(db, { name, gruppeId: g.id, email, telefon: tel });
        k = { id: U.id('K'), name, organisation: org || '', gruppeId: g.id, email: email || '', telefon: tel || '', smsOptIn: false, erinnerungenAus: false, erstellt: U.today() };
        db.kunden.push(k); out.neueKunden++;
        L.log(db, sys, 'Kundenkonto übernommen', 'kunde', k.id, 'uebernahme', '');
      }
      const t = (typ || '').toUpperCase();
      if (t === 'E') {
        const start = datum + 'T' + beginn, e = datum + 'T' + ende;
        const konf = L.conflicts(db, a.id, start, e);
        if (konf.length) { out.konflikte.push({ zeile: nr, eintrag: z, grund: konf.map(k2 => L.konfliktText(db, k2)).join('; ') }); return; }
        L.reservieren(db, sys, { anlageId: a.id, kundeId: k.id, start, ende: e, kanal: 'uebernahme', silent: true });
        out.reservationen++;
      } else if (t === 'S') {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(bisDatum || '') || bisDatum < datum) throw Fehler('Letzter Termin fehlt oder liegt vor dem ersten');
        const s = { id: U.id('S'), kundeId: k.id, anlageId: a.id, wochentag: U.weekday(datum), beginn, dauerMin: U.toMin(ende) - U.toMin(beginn), von: datum, bis: bisDatum, status: 'bestaetigt', grund: '', ausgelassen: [], kanal: 'uebernahme', beantragtVon: null, beantragtAm: new Date().toISOString() };
        db.serien.push(s); out.serien++;
        L.serieTermine(s).forEach(d => {
          const st = d + 'T' + beginn, en = d + 'T' + ende;
          const konf = L.conflicts(db, a.id, st, en);
          if (konf.length) { s.ausgelassen.push({ datum: d, grund: 'Konflikt bei Übernahme' }); out.konflikte.push({ zeile: nr, eintrag: `${z} → Termin ${d}`, grund: konf.map(k2 => L.konfliktText(db, k2)).join('; ') }); return; }
          L.reservieren(db, sys, { anlageId: a.id, kundeId: k.id, start: st, ende: en, kanal: 'uebernahme', serieId: s.id, silent: true });
          out.termine++;
        });
        L.log(db, sys, 'Serie übernommen', 'serie', s.id, 'uebernahme', `${a.name}, ${U.WT_LANG[s.wochentag]} ${beginn}–${ende}, ${datum} bis ${bisDatum}`);
      } else throw Fehler('Typ muss E (Einzelreservation) oder S (Serie) sein');
    } catch (e) { out.fehler.push({ zeile: nr, eintrag: z, grund: e.message }); }
  });
  L.log(db, ctx, 'Übernahme bestehender Reservationen', 'system', '', 'uebernahme', `${out.reservationen} Einzelreservationen, ${out.serien} Serien (${out.termine} Termine), ${out.konflikte.length} Konflikte, ${out.fehler.length} Fehler`);
  return out;
};

/* ---------- Hintergrundlauf: Angebotsfristen, Erinnerungen, nächtlicher Löschlauf ---------- */
L.tick = db => {
  const now = U.now();
  const sys = { system: true, user: null };
  let changed = false;
  db.warteliste.forEach(w => {
    if (w.status === 'angeboten' && w.angebotBis <= now) { w.status = 'abgelaufen'; changed = true; L.log(db, sys, 'Wartelisten-Angebot abgelaufen', 'warteliste', w.id, 'system', ''); }
    else if (w.status === 'wartend' && w.start <= now) { w.status = 'abgelaufen'; changed = true; }
  });
  const fristMin = db.params.erinnerungStd * 60;
  db.reservationen.forEach(r => {
    if (r.status !== 'aktiv' || r.erinnert || r.start <= now) return;
    if (U.diffMin(now, r.start) > fristMin) return;
    r.erinnert = true; changed = true;
    const k = L.kunde(db, r.kundeId);
    if (!k || (r.serieId && k.erinnerungenAus)) return;
    const a = L.anlage(db, r.anlageId);
    L.senden(db, k, 'ArenaOne: Erinnerung an Ihre Reservation',
      `Guten Tag\n\nWir erinnern Sie an Ihre Reservation:\n${L.resText(db, r)}\n\nKönnen Sie nicht kommen? Bitte stornieren Sie unter «Meine Reservationen», damit andere die Zeit nutzen können.\n\nFreundliche Grüsse\nArenaOne Sportzentrum AG`,
      { sms: true, link: '#/meine', smsText: `ArenaOne Erinnerung: ${a.name}, ${U.fmtDate(r.start)}, ${U.timePart(r.start)} Uhr. Stornieren: Meine Reservationen` });
  });
  if (db.meta.letzterLoeschlauf !== U.today()) { L.loeschlauf(db, sys); changed = true; }
  return changed;
};
