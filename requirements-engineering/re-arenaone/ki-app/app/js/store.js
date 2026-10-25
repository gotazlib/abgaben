'use strict';
/* Datenhaltung im Browser (localStorage), Sitzung, Rollen und Berechtigungen (QA-13) */
const Store = {
  KEY: 'arenaone-db-v1',
  mem: null, // Ersatz, falls localStorage blockiert ist
  available: true,
  read() {
    try { const s = localStorage.getItem(this.KEY); return s ? JSON.parse(s) : null; }
    catch (e) { this.available = false; return this.mem ? JSON.parse(JSON.stringify(this.mem)) : null; }
  },
  write(db) {
    try { localStorage.setItem(this.KEY, JSON.stringify(db)); }
    catch (e) { this.available = false; this.mem = JSON.parse(JSON.stringify(db)); }
  },
  /* Liest den aktuellen Stand immer frisch, damit parallele Sitzungen (Tabs) einander sehen (FA-03, FA-06). */
  get() {
    let db = this.read();
    if (!db || db.version !== 1) { db = Seed.create(); this.write(db); }
    return db;
  },
  /* Transaktion: frisch laden, ändern, speichern. Doppelbuchungsprüfung läuft immer auf dem frischen Stand. */
  tx(fn) {
    const db = this.get();
    const result = fn(db);
    this.write(db);
    return result;
  },
  reset() { const db = Seed.create(); this.write(db); return db; },
};

const Session = {
  KEY: 'arenaone-session',
  get() { try { return JSON.parse(sessionStorage.getItem(this.KEY) || 'null'); } catch (e) { return this._m || null; } },
  set(s) { try { sessionStorage.setItem(this.KEY, JSON.stringify(s)); } catch (e) { this._m = s; } },
  clear() { try { sessionStorage.removeItem(this.KEY); } catch (e) { this._m = null; } },
  user(db) {
    const s = this.get();
    if (!s) return null;
    const u = db.users.find(x => x.id === s.userId && x.aktiv !== false);
    return u || null;
  },
};

const ROLLEN = {
  kunde: 'Kundin/Kunde',
  orgkontakt: 'Vereins-/Firmenkontakt',
  trainer: 'Trainerin/Trainer',
  empfang: 'Empfang',
  gl: 'Geschäftsleitung',
  admin: 'Administration',
  betrieb: 'Betrieb der Anlage',
};
const STAFF_ROLLEN = ['empfang', 'gl', 'admin', 'betrieb'];

/* Berechtigungsmatrix QA-13 (plus Annahmen A-08, A-09, A-10 in ANNAHMEN.md) */
const PERM = {
  verfuegbarkeit: ['kunde', 'orgkontakt', 'trainer', 'empfang', 'gl'],  // FA-01 (ohne Anmeldung ebenfalls, QA-14)
  belegung: ['trainer', 'empfang', 'gl'],                                 // FA-02 (Trainer nur eigene Gruppen)
  eigene: ['kunde', 'orgkontakt', 'trainer'],                             // FA-04, FA-09, FA-10, FA-13
  imAuftrag: ['empfang', 'gl'],                                           // FA-05, FA-11
  kundenVerwalten: ['empfang', 'gl'],                                     // FA-07 (Annahme A-11)
  serieBeantragen: ['orgkontakt', 'trainer', 'empfang'],                  // FA-16
  serieBestaetigen: ['empfang', 'gl'],                                    // FA-18
  sperren: ['empfang', 'gl', 'betrieb'],                                  // FA-27 (Betrieb: Annahme A-08)
  regeln: ['gl'],                                                         // FA-24 bis FA-26, Parameter
  auswertung: ['gl'],                                                     // FA-29 bis FA-31
  admin: ['admin'],                                                       // FA-32, FA-33, FA-34, QA-12
  protokoll: ['gl', 'admin'],                                             // QA-15 Gesamtprotokoll (Annahme A-27)
  nachrichtenAlle: ['empfang', 'gl'],                                     // simulierter Postausgang
};

function can(user, perm) {
  if (perm === 'verfuegbarkeit' && !user) return true; // QA-14: FA-01 ohne Anmeldung
  if (!user) return false;
  return (user.rollen || []).some(r => PERM[perm].includes(r));
}
function isStaff(user) { return !!user && (user.rollen || []).some(r => STAFF_ROLLEN.includes(r)); }
