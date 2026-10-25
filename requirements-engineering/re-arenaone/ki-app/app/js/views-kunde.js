'use strict';
/* Ansichten für Kundschaft und gemeinsame Dialoge */

UI.meineKunden = (db, user) => user ? db.kunden.filter(k => (user.kundeIds || []).includes(k.id)) : [];
UI.aktKunde = (db, user) => {
  const ks = UI.meineKunden(db, user);
  if (!ks.length) return null;
  return ks.find(k => k.id === UI.st.kundeId) || ks[0];
};

/* ---------- FA-01 Verfügbarkeit ---------- */
V.verfuegbarkeit = (main, db, user) => {
  const st = UI.st;
  st.vDate = st.vDate || U.today();
  st.vSport = st.vSport || 'Padel';
  const eigene = can(user, 'eigene');
  const staff = can(user, 'imAuftrag');
  const kunde = eigene ? UI.aktKunde(db, user) : null;
  const g = kunde ? L.gruppe(db, kunde.gruppeId) : null;
  const anlagen = db.anlagen.filter(a => a.aktiv && a.sportart === st.vSport && (!g || !g.anlagenIds || g.anlagenIds.includes(a.id)));
  const ks = UI.meineKunden(db, user);
  const legende = `<div class="legend"><span class="slot frei">frei</span><span class="slot belegt">belegt${eigene ? ' (Warteliste möglich)' : ''}</span><span class="slot gesperrt">gesperrt</span><span class="slot kontingent">Kontingent anderer Gruppe</span><span class="slot angeboten">der Warteliste angeboten</span></div>`;
  main.innerHTML = `
    <section class="card">
      <h1>Verfügbarkeit</h1>
      <p class="muted">Freie Zeitfenster (Beginn, Mindestdauer ${db.params.minDauer} Minuten).${user ? '' : ' Zum Reservieren bitte <a href="#/login?weiter=verfuegbarkeit">anmelden</a>.'}${staff ? ' Klick auf ein freies Zeitfenster öffnet die Erfassung im Auftrag.' : ''}</p>
      <div class="toolbar">
        <div class="seg" role="tablist">${SPORTARTEN.map(s => `<button class="${s === st.vSport ? 'on' : ''}" data-sport="${s}">${s}</button>`).join('')}</div>
        <div class="datenav">
          <button class="btn small ghost" data-d="-1" aria-label="Vortag">◀</button>
          <input type="date" id="vdate" value="${st.vDate}" min="${U.today()}">
          <button class="btn small ghost" data-d="1" aria-label="Folgetag">▶</button>
        </div>
        ${ks.length > 1 ? `<label class="inline">Reservieren für <select id="vkunde">${UI.kundenOpts(db, ks, kunde.id)}</select></label>` : ''}
      </div>
      ${g ? `<p class="muted small">Regeln «${U.esc(g.name)}»: bis ${g.vorlaufTage} Tage im Voraus, höchstens ${g.maxDauerMin} Minuten${g.maxOffen != null ? `, höchstens ${g.maxOffen} offene Einzelreservationen` : ''}; kostenlos stornieren bis ${db.params.stornofristStd} h vor Beginn.</p>` : ''}
      ${legende}
    </section>
    <div class="grid-cards">${anlagen.map(a => {
      const slots = L.slots(db, a.id, st.vDate, kunde).filter(s => s.status !== 'vergangen');
      const frei = slots.filter(s => s.status === 'frei').length;
      return `<section class="card anlage"><h3>${U.esc(a.name)} <span class="muted small">${frei} frei</span></h3>
        <div class="slots">${slots.length ? slots.map(s => {
          const klick = s.status === 'frei' || (s.status === 'belegt' && eigene);
          return `<button class="slot ${s.status}" ${klick ? '' : 'disabled'} data-a="${a.id}" data-s="${s.start}" data-st="${s.status}" title="${U.timePart(s.start)} ${s.status}">${U.timePart(s.start)}</button>`;
        }).join('') : '<p class="muted">Keine Zeitfenster (geschlossen oder vorbei).</p>'}</div></section>`;
    }).join('') || '<section class="card"><p>Keine reservierbaren Anlagen.</p></section>'}</div>`;

  UI.$$('[data-sport]', main).forEach(b => b.onclick = () => { st.vSport = b.dataset.sport; UI.render(); });
  UI.$$('[data-d]', main).forEach(b => b.onclick = () => { const n = U.addDays(st.vDate, Number(b.dataset.d)); if (n >= U.today()) { st.vDate = n; UI.render(); } });
  UI.$('#vdate', main).onchange = e => { if (e.target.value) { st.vDate = e.target.value; UI.render(); } };
  const vk = UI.$('#vkunde', main); if (vk) vk.onchange = () => { st.kundeId = vk.value; UI.render(); };
  UI.$$('.slot[data-a]', main).forEach(b => b.onclick = () => {
    const anlageId = b.dataset.a, start = b.dataset.s;
    if (!user) { UI.toast('Bitte melden Sie sich zum Reservieren an.'); UI.go('login', { weiter: 'verfuegbarkeit' }); return; }
    if (staff && !eigene) { V.erfassenDialog({ anlageId, start }); return; }
    if (!eigene) return;
    if (b.dataset.st === 'belegt') V.wartelisteDialog(anlageId, start, kunde.id);
    else V.buchenDialog(anlageId, start, kunde.id);
  });
};

/* ---------- FA-04 Einzelreservation online ---------- */
V.buchenDialog = (anlageId, start, kundeId, dauerVor) => {
  const db = Store.get();
  const a = L.anlage(db, anlageId), k = L.kunde(db, kundeId), g = L.gruppe(db, k.gruppeId);
  const o = L.oeffnung(a, U.datePart(start));
  const maxBisClose = U.toMin(o.bis) - U.toMin(U.timePart(start));
  const opts = [];
  for (let m = db.params.minDauer; m <= Math.min(g.maxDauerMin, maxBisClose); m += db.params.raster) {
    const frei = L.conflicts(db, anlageId, start, U.addMin(start, m)).length === 0;
    opts.push([m, `${m} Minuten (bis ${U.timePart(U.addMin(start, m))})${frei ? '' : ' – belegt'}`, !frei]);
  }
  UI.modal({
    title: 'Reservation bestätigen',
    body: `<dl class="kv"><dt>Anlage</dt><dd>${U.esc(a.name)}</dd><dt>Datum</dt><dd>${U.fmtDate(start)}</dd><dt>Beginn</dt><dd>${U.timePart(start)} Uhr</dd><dt>Für</dt><dd>${U.esc(L.kundeName(k))}</dd></dl>
      <label>Dauer <select name="dauer">${UI.opts(opts, dauerVor || db.params.minDauer)}</select></label>
      <p class="muted small">Kostenlose Stornierung bis ${db.params.stornofristStd} Stunden vor Beginn. Danach gilt die Stornierung als kurzfristig.</p>
      <div id="bmsg"></div>`,
    buttons: [{ label: 'Abbrechen', cls: 'ghost' }, {
      label: 'Verbindlich reservieren', cls: 'primary', onClick: dlg => {
        const dauer = Number(UI.$('[name=dauer]', dlg).value);
        const res = UI.run((d, ctx) => L.reservieren(d, ctx, { anlageId, kundeId, start, ende: U.addMin(start, dauer), kanal: 'online' }), { silent: true });
        if (res.ok) { UI.toast(`Reservation gespeichert: ${U.esc(a.name)}, ${U.fmtRange(res.r.res.start, res.r.res.ende)}.${UI.emailHinweis(res.r.ohneEmail)}`); return; }
        V.fehlerMitAlternativen(dlg, res.e, kundeId, 'online');
        return false;
      },
    }],
  });
};

/* Zeigt Fehler und – bei Konflikt – freie Alternativen am selben Tag (FA-06, UC-02 4b) */
V.fehlerMitAlternativen = (dlg, e, kundeId, kanal) => {
  const db = Store.get();
  const box = UI.$('#bmsg', dlg) || UI.$('.dlg-body', dlg);
  let h = `<div class="alert err">${UI.fehlerHtml(e)}`;
  if (e.alternativen && e.alternativen.length) {
    h += `<p><b>Freie Alternativen am selben Tag:</b></p><div class="alts">${e.alternativen.map(x => `<button type="button" class="btn small" data-alt='${JSON.stringify(x)}'>${U.esc(L.anlage(db, x.anlageId).name)}, ${U.timePart(x.start)}–${U.timePart(x.ende)}</button>`).join('')}</div>`;
  } else if (e.alternativen) h += '<p>Am selben Tag gibt es keine freie Alternative mit dieser Dauer.</p>';
  h += '</div>';
  box.innerHTML = h;
  UI.$$('[data-alt]', box).forEach(b => b.onclick = () => {
    const x = JSON.parse(b.dataset.alt);
    if (kanal === 'online') V.buchenDialog(x.anlageId, x.start, kundeId, U.diffMin(x.start, x.ende));
    else V.erfassenDialog({ anlageId: x.anlageId, start: x.start, dauer: U.diffMin(x.start, x.ende), kundeId, kanal });
  });
};

/* ---------- FA-13 Warteliste ---------- */
V.wartelisteDialog = (anlageId, start, kundeId) => {
  const db = Store.get();
  const a = L.anlage(db, anlageId), k = L.kunde(db, kundeId), g = L.gruppe(db, k.gruppeId);
  const o = L.oeffnung(a, U.datePart(start));
  const max = Math.min(g.maxDauerMin, U.toMin(o.bis) - U.toMin(U.timePart(start)));
  UI.modal({
    title: 'Zeitfenster belegt',
    body: `<p>${U.esc(a.name)}, ${U.fmtDate(start)}, ${U.timePart(start)} Uhr ist bereits reserviert.</p>
      <p>Sie können sich auf die Warteliste setzen. Wird die Zeit frei, erhalten alle Eingetragenen gleichzeitig eine Nachricht; wer zuerst bestätigt (innert ${db.params.annahmefristMin} Minuten), erhält die Reservation.</p>
      <label>Gewünschte Dauer <select name="dauer">${UI.dauerOpts(db, max)}</select></label>`,
    buttons: [{ label: 'Abbrechen', cls: 'ghost' }, {
      label: 'Auf Warteliste eintragen', cls: 'primary', onClick: dlg => {
        const dauer = Number(UI.$('[name=dauer]', dlg).value);
        const r = UI.run((d, ctx) => L.wartelisteEintragen(d, ctx, { anlageId, kundeId, start, ende: U.addMin(start, dauer) }), { ok: 'Sie stehen auf der Warteliste. Ihre Einträge finden Sie unter «Meine Reservationen».' });
        return r.ok ? undefined : false;
      },
    }],
  });
};

/* ---------- FA-10 / FA-11 Stornieren ---------- */
V.stornoDialog = resId => {
  const db = Store.get();
  const user = Session.user(db);
  const r = L.find(db.reservationen, resId);
  const staff = can(user, 'imAuftrag');
  const kurz = L.istKurzfristig(db, r);
  UI.modal({
    title: 'Reservation stornieren',
    body: `<p><b>${U.esc(L.anlage(db, r.anlageId).name)}</b>, ${U.fmtRange(r.start, r.ende)}${r.serieId ? '<br><span class="muted">Einzeltermin einer Serie – nur dieser Termin wird storniert (FA-19).</span>' : ''}</p>
      ${kurz ? `<div class="alert warn"><b>Kurzfristige Stornierung:</b> Die Stornofrist (${db.params.stornofristStd} Stunden vor Beginn) ist abgelaufen. Die Reservation wird als «kurzfristig storniert» markiert. Ob eine Gebühr anfällt, ist noch nicht festgelegt.</div>` : `<p class="muted">Die Stornofrist ist eingehalten.</p>`}
      ${staff ? `<label>Kanal der Anfrage <select name="kanal">${UI.opts([['telefon', 'Telefon'], ['email', 'E-Mail'], ['schalter', 'Schalter']], 'telefon')}</select></label><label>Grund (optional) <input name="grund" maxlength="120"></label>` : ''}`,
    buttons: [{ label: 'Zurück', cls: 'ghost' }, {
      label: kurz ? 'Trotzdem stornieren' : 'Stornieren', cls: 'danger', onClick: dlg => {
        const kanal = staff ? UI.$('[name=kanal]', dlg).value : 'online';
        const grund = staff ? UI.$('[name=grund]', dlg).value : '';
        const res = UI.run((d, ctx) => L.stornieren(d, ctx, resId, { kanal, grund }), { ok: x => `Reservation storniert${x.kurzfristig ? ' (kurzfristig)' : ''}.${UI.emailHinweis(x.ohneEmail)}` });
        return res.ok ? undefined : false;
      },
    }],
  });
};

/* ---------- FA-09 / FA-11 / FA-19 Verschieben ---------- */
V.verschiebenDialog = resId => {
  const db = Store.get();
  const user = Session.user(db);
  const r = L.find(db.reservationen, resId);
  const staff = can(user, 'imAuftrag');
  const kunde = L.kunde(db, r.kundeId);
  const dauer = U.diffMin(r.start, r.ende);
  const a0 = L.anlage(db, r.anlageId);
  const state = { anlageId: r.anlageId, datum: U.datePart(r.start), zeit: U.timePart(r.start), dauer };
  const zeitOpts = d => UI.zeitOpts(d, state.anlageId, state.datum, state.zeit, state.dauer, s => {
    const e = U.addMin(s, state.dauer);
    if (s === r.start && state.anlageId === r.anlageId) return 'aktuell';
    return L.istFrei(d, state.anlageId, s, e, kunde, { ignoreResId: r.id, ignoreRegeln: staff, serie: !!r.serieId }) ? '' : 'nicht frei';
  });
  UI.modal({
    title: 'Reservation verschieben',
    body: `<p>Bisher: <b>${U.esc(a0.name)}</b>, ${U.fmtRange(r.start, r.ende)}</p>
      <div class="row">
        <label>Anlage <select name="anlage">${UI.anlagenOpts(db, r.anlageId, { sportart: staff ? null : a0.sportart })}</select></label>
        <label>Datum <input type="date" name="datum" value="${state.datum}" min="${U.today()}"></label>
      </div>
      <div class="row">
        <label>Beginn <select name="zeit">${zeitOpts(db)}</select></label>
        <label>Dauer <select name="dauer">${UI.dauerOpts(db, L.gruppe(db, kunde ? kunde.gruppeId : 'G-privat') ? Math.max(L.gruppe(db, kunde.gruppeId).maxDauerMin, dauer) : dauer, dauer)}</select></label>
      </div>
      ${staff ? `<label>Kanal <select name="kanal">${UI.opts([['telefon', 'Telefon'], ['email', 'E-Mail'], ['schalter', 'Schalter']], 'telefon')}</select></label>
        <label class="check"><input type="checkbox" name="override"> Buchungsregel der Kundengruppe übersteuern (wird protokolliert)</label>` : ''}
      <div id="bmsg"></div>`,
    onOpen: dlg => {
      const upd = () => {
        state.anlageId = UI.$('[name=anlage]', dlg).value; state.datum = UI.$('[name=datum]', dlg).value;
        state.dauer = Number(UI.$('[name=dauer]', dlg).value); state.zeit = UI.$('[name=zeit]', dlg).value;
        UI.$('[name=zeit]', dlg).innerHTML = zeitOpts(Store.get());
      };
      ['anlage', 'datum', 'dauer'].forEach(n => UI.$(`[name=${n}]`, dlg).addEventListener('change', upd));
    },
    buttons: [{ label: 'Abbrechen', cls: 'ghost' }, {
      label: 'Verschieben', cls: 'primary', onClick: dlg => {
        const f = UI.form(dlg.querySelector('form'));
        const start = f.datum + 'T' + f.zeit;
        const ziel = { anlageId: f.anlage, start, ende: U.addMin(start, Number(f.dauer)) };
        const res = UI.run((d, ctx) => L.verschieben(d, ctx, resId, ziel, { kanal: f.kanal || 'online', override: !!f.override }), { silent: true, ok: x => `Reservation verschoben.${UI.emailHinweis(x.ohneEmail)}` });
        if (res.ok) return;
        UI.$('#bmsg', dlg).innerHTML = `<div class="alert err">${UI.fehlerHtml(res.e)}${res.e.uebersteuerbar ? '<p>Als Empfang können Sie die Regel mit dem Häkchen oben übersteuern.</p>' : ''}</div>`;
        return false;
      },
    }],
  });
};

/* ---------- Detail einer Reservation mit Verlauf (QA-15) ---------- */
V.resDetail = resId => {
  const db = Store.get();
  const user = Session.user(db);
  const r = L.find(db.reservationen, resId);
  if (!r) return;
  const k = L.kunde(db, r.kundeId);
  const s = r.serieId ? L.find(db.serien, r.serieId) : null;
  const staff = can(user, 'imAuftrag');
  const darf = L.darfReservation(user, r);
  const sichtbar = staff || darf;
  const verlauf = db.protokoll.filter(p => p.objektId === r.id);
  const offen = r.status === 'aktiv' && r.ende > U.now();
  const btns = [{ label: 'Schliessen', cls: 'ghost' }];
  if (s && sichtbar) btns.unshift({ label: 'Alle Termine der Serie', onClick: () => { V.serieDetail(s.id); return false; } });
  if (offen && darf && (staff || r.start > U.now())) {
    if (staff || !L.istKurzfristig(db, r)) btns.push({ label: 'Verschieben', onClick: () => { V.verschiebenDialog(r.id); return false; } });
    btns.push({ label: 'Stornieren', cls: 'danger', onClick: () => { V.stornoDialog(r.id); return false; } });
  }
  UI.modal({
    title: 'Reservation', wide: true,
    body: `<dl class="kv">
        <dt>Anlage</dt><dd>${U.esc(L.anlage(db, r.anlageId).name)}</dd>
        <dt>Zeit</dt><dd>${U.fmtRange(r.start, r.ende)}</dd>
        <dt>Kunde</dt><dd>${sichtbar ? U.esc(L.kundeName(k)) + ` <span class="muted">(${U.esc(L.gruppeName(db, r.gruppeId))})</span>` : 'belegt'}</dd>
        ${sichtbar && k ? `<dt>Kontakt</dt><dd>${U.esc(k.email || '')} ${U.esc(k.telefon || '')} ${k.email ? '' : '<span class="tag warn">keine E-Mail</span>'}</dd>` : ''}
        <dt>Art</dt><dd>${s ? 'Einzeltermin der Serie «' + U.esc(L.serieName(db, s)) + '»' : 'Einzelreservation'}${r.viaWarteliste ? ' – über Warteliste vergeben' : ''}</dd>
        <dt>Kanal</dt><dd>${UI.kanalBadge(r.kanal)}</dd>
        <dt>Status</dt><dd>${r.status === 'aktiv' ? UI.statusTag('reserviert', 'ok') : UI.statusTag(r.kurzfristig ? 'kurzfristig storniert' : 'storniert', 'err')} ${r.stornoGrund ? U.esc(r.stornoGrund) : ''}</dd>
      </dl>
      ${sichtbar ? `<h3>Verlauf</h3><table class="tbl small"><thead><tr><th>Zeitpunkt</th><th>Aktion</th><th>Benutzer</th><th>Kanal</th><th>Details</th></tr></thead><tbody>
        ${verlauf.map(p => `<tr><td>${U.fmtTs(p.zeit)}</td><td>${U.esc(p.aktion)}</td><td>${U.esc(p.userName)}</td><td>${U.esc(p.kanal)}</td><td>${U.esc(p.details)}</td></tr>`).join('') || '<tr><td colspan="5">–</td></tr>'}
      </tbody></table><p class="muted small">Verlaufseinträge lassen sich nicht ändern (QA-15).</p>` : ''}`,
    buttons: btns,
  });
};

/* ---------- FA-20 Serie mit allen Terminen, FA-19 Einzeltermin absagen ---------- */
V.serieDetail = serieId => {
  const db = Store.get();
  const user = Session.user(db);
  const s = L.find(db.serien, serieId);
  const termine = db.reservationen.filter(r => r.serieId === s.id).sort((a, b) => a.start.localeCompare(b.start));
  const darf = !!user && (can(user, 'imAuftrag') || (user.kundeIds || []).includes(s.kundeId));
  UI.modal({
    title: 'Serie ' + L.serieName(db, s), wide: true,
    body: `<dl class="kv"><dt>Organisation</dt><dd>${U.esc(L.kundeName(L.kunde(db, s.kundeId)))}</dd><dt>Anlage</dt><dd>${U.esc(L.anlage(db, s.anlageId).name)}</dd>
      <dt>Rhythmus</dt><dd>${U.WT_LANG[s.wochentag]}, ${s.beginn} Uhr, ${s.dauerMin} Minuten</dd><dt>Zeitraum</dt><dd>${U.fmtDate(s.von)} bis ${U.fmtDate(s.bis)}</dd>
      <dt>Status</dt><dd>${U.esc(s.status)}${s.grund ? ' – ' + U.esc(s.grund) : ''}</dd></dl>
      ${s.ausgelassen.length ? `<p><b>Ausgelassene Termine:</b> ${s.ausgelassen.map(x => `${U.fmtDate(x.datum)} (${U.esc(x.grund)})`).join('; ')}</p>` : ''}
      <table class="tbl small"><thead><tr><th>Termin</th><th>Anlage</th><th>Status</th><th></th></tr></thead><tbody>
      ${termine.map(r => {
        const offen = r.status === 'aktiv' && r.start > U.now();
        return `<tr><td>${U.fmtRange(r.start, r.ende)}</td><td>${U.esc(L.anlage(db, r.anlageId).name)}</td><td>${r.status === 'aktiv' ? (r.start < U.now() ? 'vorbei' : 'reserviert') : (r.kurzfristig ? 'kurzfristig abgesagt' : 'abgesagt')}</td>
        <td class="nowrap">${offen && darf ? `<button type="button" class="btn small ghost" data-mv="${r.id}">verschieben</button> <button type="button" class="btn small danger" data-st="${r.id}">absagen</button>` : ''}</td></tr>`;
      }).join('') || '<tr><td colspan="4">Noch keine Termine (Antrag nicht bestätigt).</td></tr>'}
      </tbody></table>`,
    onOpen: dlg => {
      UI.$$('[data-st]', dlg).forEach(b => b.onclick = () => V.stornoDialog(b.dataset.st));
      UI.$$('[data-mv]', dlg).forEach(b => b.onclick = () => V.verschiebenDialog(b.dataset.mv));
    },
    buttons: [{ label: 'Schliessen', cls: 'ghost' }],
  });
};

/* ---------- Meine Reservationen (FA-09, FA-10, FA-13, FA-15) ---------- */
V.meine = (main, db, user) => {
  const ks = UI.meineKunden(db, user);
  const ids = ks.map(k => k.id);
  const now = U.now();
  const mehr = ks.length > 1;
  const kommend = db.reservationen.filter(r => ids.includes(r.kundeId) && r.status === 'aktiv' && r.ende > now).sort((a, b) => a.start.localeCompare(b.start));
  const vergangen = db.reservationen.filter(r => ids.includes(r.kundeId) && (r.status !== 'aktiv' || r.ende <= now)).sort((a, b) => b.start.localeCompare(a.start)).slice(0, 30);
  const wl = db.warteliste.filter(w => ids.includes(w.kundeId)).sort((a, b) => b.erstellt.localeCompare(a.erstellt));
  const wlOffen = wl.filter(w => ['wartend', 'angeboten'].includes(w.status));
  const serien = db.serien.filter(s => ids.includes(s.kundeId));
  const zeile = r => {
    const s = r.serieId ? L.find(db.serien, r.serieId) : null;
    const kurz = L.istKurzfristig(db, r);
    const laeuft = r.start <= now;
    return `<tr>
      <td data-l="Termin"><b>${U.fmtDate(r.start)}</b><br>${U.timePart(r.start)}–${U.timePart(r.ende)}</td>
      <td data-l="Anlage">${U.esc(L.anlage(db, r.anlageId).name)}</td>
      ${mehr ? `<td data-l="Für">${U.esc(L.kundeKurz(L.kunde(db, r.kundeId)))}</td>` : ''}
      <td data-l="Art">${s ? '<a href="#" data-serie="' + s.id + '">Serie</a>' : 'Einzel'}${kurz && !laeuft ? ' <span class="tag warn" title="Stornofrist abgelaufen">nach Stornofrist</span>' : ''}</td>
      <td class="nowrap">${laeuft ? '<span class="muted">läuft</span>' : `${kurz ? '' : `<button class="btn small ghost" data-mv="${r.id}">Verschieben</button>`} <button class="btn small danger" data-st="${r.id}">Stornieren</button>`}</td></tr>`;
  };
  const wlStatus = { wartend: 'wartet', angeboten: 'frei geworden – jetzt bestätigen!', vergeben: 'erhalten', 'nicht erhalten': 'an andere Person vergeben', abgelaufen: 'abgelaufen', ausgetragen: 'ausgetragen', geschlossen: 'geschlossen (vergeben)' };
  main.innerHTML = `
    <section class="card"><div class="head-row"><h1>Meine Reservationen</h1><a class="btn primary" href="#/verfuegbarkeit">Neue Reservation</a></div>
      ${kommend.length ? `<table class="tbl resp"><thead><tr><th>Termin</th><th>Anlage</th>${mehr ? '<th>Für</th>' : ''}<th>Art</th><th></th></tr></thead><tbody>${kommend.map(zeile).join('')}</tbody></table>` : '<p>Keine kommenden Reservationen.</p>'}
      <p class="muted small">Verschieben ist bis ${db.params.stornofristStd} Stunden vor Beginn möglich, danach nur über den Empfang. Stornieren geht bis zum Beginn; nach der Stornofrist gilt es als kurzfristig.</p>
    </section>
    <section class="card"><h2>Warteliste</h2>
      ${wlOffen.length ? `<ul class="list">${wlOffen.map(w => `<li class="${w.status === 'angeboten' ? 'hl' : ''}">
        <div><b>${U.esc(L.anlage(db, w.anlageId).name)}</b>, ${U.fmtRange(w.start, w.ende)}<br><span class="muted">${wlStatus[w.status]}${w.status === 'angeboten' ? ' – Angebot gültig bis ' + U.timePart(w.angebotBis) + ' Uhr' : ''}</span></div>
        <div class="nowrap">${w.status === 'angeboten' ? `<button class="btn small primary" data-ann="${w.id}">Angebot annehmen</button>` : ''} <button class="btn small ghost" data-aus="${w.id}">Austragen</button></div></li>`).join('')}</ul>` : '<p class="muted">Keine offenen Wartelisteneinträge. Bei belegten Zeitfenstern in der Verfügbarkeit können Sie sich eintragen.</p>'}
      ${wl.length > wlOffen.length ? `<details><summary>Erledigte Einträge (${wl.length - wlOffen.length})</summary><ul class="list">${wl.filter(w => !wlOffen.includes(w)).map(w => `<li><div>${U.esc(L.anlage(db, w.anlageId).name)}, ${U.fmtRange(w.start, w.ende)} – <span class="muted">${wlStatus[w.status] || w.status}</span></div></li>`).join('')}</ul></details>` : ''}
    </section>
    ${serien.length || can(user, 'serieBeantragen') ? `<section class="card"><div class="head-row"><h2>Serien</h2>${can(user, 'serieBeantragen') ? '<a class="btn small" href="#/serien">Serie beantragen</a>' : ''}</div>
      ${serien.length ? `<ul class="list">${serien.map(s => `<li><div><b>${U.esc(L.serieName(db, s))}</b> auf ${U.esc(L.anlage(db, s.anlageId).name)}<br><span class="muted">${U.fmtDate(s.von)} bis ${U.fmtDate(s.bis)} – ${U.esc(s.status)}${s.grund ? ': ' + U.esc(s.grund) : ''}</span></div><button class="btn small ghost" data-serie="${s.id}">Termine</button></li>`).join('')}</ul>` : '<p class="muted">Keine Serien.</p>'}</section>` : ''}
    <section class="card"><details><summary>Vergangene und stornierte Reservationen</summary>
      <table class="tbl resp small"><thead><tr><th>Termin</th><th>Anlage</th><th>Status</th></tr></thead><tbody>
      ${vergangen.map(r => `<tr><td>${U.fmtRange(r.start, r.ende)}</td><td>${U.esc(L.anlage(db, r.anlageId).name)}</td><td>${r.status === 'aktiv' ? 'vorbei' : (r.kurzfristig ? 'kurzfristig storniert' : 'storniert')}</td></tr>`).join('') || '<tr><td colspan="3">–</td></tr>'}
      </tbody></table></details></section>
    <section class="card"><h2>Meine Daten</h2>
      <p class="muted small">Wir speichern nur Name, Kundengruppe, E-Mail, Telefon und bei Organisationen den Namen der Organisation (QA-10). Keine Werbung, kein Newsletter.</p>
      ${ks.map(k => `<form class="kform" data-k="${k.id}">
        <h3>${U.esc(L.kundeName(k))} <span class="muted small">Gruppe ${U.esc(L.gruppeName(db, k.gruppeId))}</span></h3>
        <div class="row">
          <label>Name <input name="name" value="${U.esc(k.name)}" required></label>
          ${k.organisation ? `<label>Organisation <input name="organisation" value="${U.esc(k.organisation)}"></label>` : ''}
        </div>
        <div class="row">
          <label>E-Mail <input type="email" name="email" value="${U.esc(k.email)}"></label>
          <label>Telefon <input name="telefon" value="${U.esc(k.telefon)}"></label>
        </div>
        <label class="check"><input type="checkbox" name="smsOptIn" ${k.smsOptIn ? 'checked' : ''}> Bestätigungen und Erinnerungen zusätzlich per SMS (FA-35)</label>
        ${k.organisation ? `<label class="check"><input type="checkbox" name="erinnerungenAus" ${k.erinnerungenAus ? 'checked' : ''}> Keine Erinnerungen für Serientermine</label>` : ''}
        <button class="btn small">Speichern</button></form>`).join('')}
    </section>`;

  UI.$$('[data-st]', main).forEach(b => b.onclick = () => V.stornoDialog(b.dataset.st));
  UI.$$('[data-mv]', main).forEach(b => b.onclick = () => V.verschiebenDialog(b.dataset.mv));
  UI.$$('[data-serie]', main).forEach(b => b.onclick = e => { e.preventDefault(); V.serieDetail(b.dataset.serie); });
  UI.$$('[data-aus]', main).forEach(b => b.onclick = () => UI.run((d, ctx) => L.wartelisteAustragen(d, ctx, b.dataset.aus), { ok: 'Wartelisteneintrag gelöscht.' }));
  UI.$$('[data-ann]', main).forEach(b => b.onclick = () => {
    const res = UI.run((d, ctx) => L.angebotAnnehmen(d, ctx, b.dataset.ann), { render: true });
    if (res.ok) UI.toast(res.r.ok ? 'Sie haben die Reservation erhalten. Bestätigung per E-Mail versandt.' : U.esc(res.r.msg), res.r.ok ? 'ok' : 'err', 6000);
  });
  UI.$$('form.kform', main).forEach(f => f.onsubmit = e => {
    e.preventDefault();
    const d = UI.form(f);
    d.id = f.dataset.k;
    const k = L.kunde(db, d.id);
    d.organisation = d.organisation != null ? d.organisation : k.organisation;
    UI.run((x, ctx) => L.kundeSpeichern(x, ctx, d), { ok: 'Daten gespeichert.' });
  });
};

/* ---------- Anmeldung (QA-14) ---------- */
V.login = (main, db, user, params) => {
  if (user) { UI.go(params.weiter || UI.startRoute(user)); return; }
  const demo = db.users.filter(u => u.aktiv !== false).map(u => `<tr><td><button class="btn small ghost" data-fill="${U.esc(u.login)}" data-pw="${U.esc(u.passwort)}">${U.esc(u.login)}</button></td><td>${U.esc(u.name)}</td><td>${U.esc(u.rollen.map(r => ROLLEN[r]).join(', '))}</td></tr>`).join('');
  main.innerHTML = `<div class="two">
    <section class="card narrow"><h1>Anmelden</h1>
      <form id="lf">
        <label>Benutzername <input name="login" autocomplete="username" required></label>
        <label>Passwort <input type="password" name="pw" autocomplete="current-password" required></label>
        <div id="f2" hidden><div class="alert info" id="smscode"></div><label>Bestätigungscode (zweiter Faktor) <input name="code" inputmode="numeric" maxlength="6"></label></div>
        <button class="btn primary">Anmelden</button>
        <p class="small">Noch kein Konto? <a href="#/registrieren">Registrieren</a> (Privatkundschaft). Vereine und Firmen erfasst der Empfang.</p>
      </form></section>
    <section class="card"><h2>Demo-Konten</h2><p class="muted small">Klick füllt die Anmeldung aus. Kundschaft: Passwort <code>demo1234</code>; Mitarbeitende: <code>arenaone-demo</code> (≥ 12 Zeichen) plus zweiter Faktor.</p>
      <table class="tbl small"><thead><tr><th>Login</th><th>Name</th><th>Rolle</th></tr></thead><tbody>${demo}</tbody></table></section></div>`;
  const f = UI.$('#lf', main);
  let pending = null;
  UI.$$('[data-fill]', main).forEach(b => b.onclick = () => { f.login.value = b.dataset.fill; f.pw.value = b.dataset.pw; f.login.focus(); });
  f.onsubmit = e => {
    e.preventDefault();
    const d = Store.get();
    const u = d.users.find(x => x.login.toLowerCase() === f.login.value.trim().toLowerCase() && x.aktiv !== false);
    if (!u || u.passwort !== f.pw.value) { UI.toast('Benutzername oder Passwort falsch.', 'err'); return; }
    if (isStaff(u)) {
      if (!pending || pending.userId !== u.id) {
        pending = { userId: u.id, code: String(Math.floor(100000 + Math.random() * 900000)) };
        UI.$('#f2', main).hidden = false;
        UI.$('#smscode', main).innerHTML = `Simulierte SMS an die hinterlegte Nummer: Ihr ArenaOne-Code lautet <b>${pending.code}</b>`;
        f.code.focus();
        return;
      }
      if (f.code.value.trim() !== pending.code) { UI.toast('Bestätigungscode falsch.', 'err'); return; }
    }
    Session.set({ userId: u.id });
    Store.tx(x => L.log(x, { user: u }, 'Anmeldung', 'user', u.id, '', isStaff(u) ? 'mit zweitem Faktor' : ''));
    UI.toast(`Willkommen, ${U.esc(u.name)}.`);
    UI.go(params.weiter && UI.darf(u, UI.ROUTES.find(r => r.id === params.weiter) || {}) ? params.weiter : UI.startRoute(u));
  };
};

V.registrieren = main => {
  main.innerHTML = `<section class="card narrow"><h1>Registrieren</h1>
    <p class="muted">Für Privatkundinnen und -kunden. Vereine, Firmen und Trainingsgruppen erfasst der Empfang.</p>
    <form id="rf">
      <label>Vor- und Nachname <input name="name" required></label>
      <label>E-Mail <input type="email" name="email" required></label>
      <label>Telefon (freiwillig) <input name="telefon"></label>
      <label>Benutzername <input name="login" required autocomplete="username"></label>
      <label>Passwort (mind. 8 Zeichen) <input type="password" name="passwort" required autocomplete="new-password"></label>
      <details class="dse"><summary>Datenschutzerklärung (Kurzfassung)</summary>
        <p>ArenaOne Sportzentrum AG bearbeitet Ihren Namen, Ihre E-Mail-Adresse, Ihre Telefonnummer (freiwillig) und Ihre Reservationen ausschliesslich, um Reservationen zu verwalten und Sie darüber zu informieren (Bestätigung, Erinnerung, Warteliste). Es gibt keine Werbung und keinen Newsletter. Konten ohne Reservation in den letzten ${Store.get().params.aufbewahrungMonate} Monaten werden gelöscht; Reservationen bleiben anonym für Auswertungen. Sie können jederzeit Auskunft über Ihre Daten verlangen (Art. 19, 25 und 28 DSG).</p></details>
      <label class="check"><input type="checkbox" name="datenschutz"> Ich habe die Datenschutzerklärung zur Kenntnis genommen.</label>
      <button class="btn primary">Konto erstellen</button>
    </form></section>`;
  UI.$('#rf', main).onsubmit = e => {
    e.preventDefault();
    const d = UI.form(e.target);
    const r = UI.run(db => L.registrieren(db, d), { render: false });
    if (r.ok) { Session.set({ userId: r.r.id }); UI.toast('Konto erstellt. Sie sind angemeldet.'); UI.go('verfuegbarkeit'); }
  };
};

/* ---------- Simulierter Postausgang (E-Mail/SMS) ---------- */
V.nachrichten = (main, db, user) => {
  const alle = can(user, 'nachrichtenAlle');
  const list = db.nachrichten.filter(n => alle || (user.kundeIds || []).includes(n.kundeId)).slice().reverse();
  const q = (UI.st.nSuche || '').toLowerCase();
  const gef = list.filter(n => !q || (n.betreff + n.an + n.text).toLowerCase().includes(q)).slice(0, 200);
  main.innerHTML = `<section class="card"><h1>Nachrichten</h1>
    <p class="muted">Simulierter Versand: E-Mails und SMS werden in dieser Demo nicht wirklich verschickt, sondern hier abgelegt.${alle ? ' Sie sehen den gesamten Postausgang.' : ''}</p>
    <input type="search" id="nsuche" placeholder="Suchen…" value="${U.esc(UI.st.nSuche || '')}">
    <ul class="msgs">${gef.map(n => `<li><details><summary><span class="tag">${n.kanal}</span> <b>${U.esc(n.betreff)}</b> <span class="muted small">an ${U.esc(n.an)} · ${U.fmtTs(n.zeit)}</span></summary>
      <pre class="mail">${U.esc(n.text)}</pre>${n.link && !alle ? `<a class="btn small" href="${n.link}">Zu «Meine Reservationen»</a>` : ''}</details></li>`).join('') || '<li class="muted">Keine Nachrichten.</li>'}</ul></section>`;
  const s = UI.$('#nsuche', main);
  s.oninput = () => { UI.st.nSuche = s.value; clearTimeout(UI._nt); UI._nt = setTimeout(() => { UI.render(); const n = UI.$('#nsuche'); n.focus(); n.setSelectionRange(n.value.length, n.value.length); }, 300); };
};

V.hilfe = (main, db) => {
  main.innerHTML = `<section class="card"><h1>Hilfe</h1>
  <p>Diese Demo des Buchungs- und Belegungssystems ArenaOne läuft vollständig im Browser. Alle Daten liegen im lokalen Speicher dieses Browsers (localStorage); andere Geräte sehen sie nicht.</p>
  <h2>Ausprobieren</h2><ol>
    <li><b>Ohne Anmeldung</b>: Verfügbarkeit ansehen (FA-01).</li>
    <li><b>anna</b> (Privat): reservieren, verschieben, stornieren; sie steht auf der Warteliste für Padelplatz 2 morgen 19:00.</li>
    <li><b>marco</b>: seine Reservation Padelplatz 2 morgen 19:00 stornieren → Anna erhält unter «Nachrichten» ein Angebot und kann es unter «Meine Reservationen» annehmen.</li>
    <li><b>empfang</b>: Gesamtbelegung, Reservation im Auftrag (Kanal Telefon/E-Mail/Schalter), offenen Serienantrag des Badminton Club Zürich mit Konflikten bestätigen, Anlage sperren.</li>
    <li><b>gl</b>: Kundengruppen, Buchungsregeln, Kontingente, Parameter, Auswertungen mit CSV-Export.</li>
    <li><b>admin</b>: Anlagen, Benutzer und Rollen, Übernahme alter Listen, Datenauskunft, Löschlauf, Datensicherung.</li>
    <li>Zwei Browser-Tabs mit verschiedenen Benutzern öffnen: Änderungen erscheinen im anderen Tab sofort (FA-03).</li>
  </ol>
  <h2>Zurücksetzen</h2><p>Demo-Daten neu erzeugen: <button class="btn small danger" id="reset">Alle Daten zurücksetzen</button></p></section>`;
  UI.$('#reset', main).onclick = () => UI.modal({
    title: 'Daten zurücksetzen', body: '<p>Alle Änderungen gehen verloren und die Demo-Daten werden neu erzeugt.</p>',
    buttons: [{ label: 'Abbrechen', cls: 'ghost' }, { label: 'Zurücksetzen', cls: 'danger', onClick: () => { Store.reset(); Session.clear(); UI.toast('Demo-Daten neu erzeugt.'); setTimeout(() => UI.go('verfuegbarkeit'), 0); } }],
  });
};
