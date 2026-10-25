'use strict';
/* Ansichten für Empfang, Betrieb, Geschäftsleitung und Administration */

UI.naechsteRasterzeit = db => {
  const d = new Date();
  const m = d.getHours() * 60 + d.getMinutes();
  const r = db.params.raster;
  return U.fromMin(Math.min(Math.ceil((m + 1) / r) * r, 22 * 60));
};

/* ---------- FA-05 Reservation im Auftrag erfassen (QA-02: schnelle Erfassung) ---------- */
V.erfassenDialog = (pre = {}) => {
  const db = Store.get();
  const st = {
    anlageId: pre.anlageId || (db.anlagen.find(a => a.aktiv) || {}).id,
    datum: pre.start ? U.datePart(pre.start) : U.today(),
    zeit: pre.start ? U.timePart(pre.start) : UI.naechsteRasterzeit(db),
    dauer: pre.dauer || db.params.minDauer,
  };
  if (!pre.start) { // erstes freies Zeitfenster vorschlagen (QA-02)
    const frei = L.slots(db, st.anlageId, st.datum, null).find(x => x.status === 'frei' || x.status === 'kontingent');
    if (frei) st.zeit = U.timePart(frei.start);
  }
  const kundenListe = (d, q) => {
    q = (q || '').toLowerCase();
    return d.kunden.filter(k => !q || [k.name, k.organisation, k.email, k.telefon].join(' ').toLowerCase().includes(q))
      .sort((a, b) => L.kundeName(a).localeCompare(L.kundeName(b))).slice(0, 60);
  };
  const zeitOpts = d => UI.zeitOpts(d, st.anlageId, st.datum, st.zeit, st.dauer, s => L.conflicts(d, st.anlageId, s, U.addMin(s, st.dauer)).length ? 'belegt' : '');
  UI.modal({
    title: 'Reservation im Auftrag erfassen', wide: true,
    body: `<div class="row">
        <div><label>Kunde suchen <input type="search" name="ksuche" placeholder="Name, Organisation, Telefon oder E-Mail" autocomplete="off"></label>
          <select name="kunde" size="5" class="kundesel">${UI.kundenOpts(db, kundenListe(db, ''), pre.kundeId)}</select>
          <label class="check"><input type="checkbox" name="neu"> Neue Kundin / neuen Kunden erfassen</label></div>
        <fieldset class="neuk" hidden><legend>Neues Kundenkonto (FA-07)</legend>
          <label>Name <input name="kname"></label>
          <label>Organisation (bei Verein/Firma) <input name="korg"></label>
          <label>Kundengruppe <select name="kgruppe">${UI.opts(db.gruppen.map(g => [g.id, g.name]), 'G-privat')}</select></label>
          <div class="row"><label>E-Mail <input type="email" name="kemail"></label><label>Telefon <input name="ktel"></label></div>
        </fieldset>
      </div>
      <div class="row">
        <label>Anlage <select name="anlage">${UI.anlagenOpts(db, st.anlageId)}</select></label>
        <label>Datum <input type="date" name="datum" value="${st.datum}"></label>
      </div>
      <div class="row">
        <label>Beginn <select name="zeit">${zeitOpts(db)}</select></label>
        <label>Dauer <select name="dauer">${UI.dauerOpts(db, 8 * 60, st.dauer)}</select></label>
      </div>
      <fieldset class="kanal"><legend>Kanal</legend>${[['telefon', 'Telefon'], ['email', 'E-Mail'], ['schalter', 'Schalter']].map(([v, t]) => `<label class="check"><input type="radio" name="kanal" value="${v}" ${v === (pre.kanal && pre.kanal !== 'online' ? pre.kanal : 'telefon') ? 'checked' : ''}> ${t}</label>`).join('')}</fieldset>
      <div id="hint"></div>
      <label class="check" id="ovl" hidden><input type="checkbox" name="override"> Buchungsregel übersteuern (wird mit Begründung im Verlauf protokolliert)</label>
      <div id="bmsg"></div>`,
    onOpen: dlg => {
      const f = dlg.querySelector('form');
      const hint = () => {
        const d = Store.get();
        const neu = f.neu.checked;
        const k = neu ? { id: '_neu', gruppeId: f.kgruppe.value } : L.kunde(d, f.kunde.value);
        const s = st.datum + 'T' + f.zeit.value, e = U.addMin(s, Number(f.dauer.value));
        let h = '';
        if (f.zeit.value) {
          const konf = L.conflicts(d, st.anlageId, s, e);
          const pr = k ? L.pruefeRegeln(d, k, st.anlageId, s, e) : { hart: [], regel: [] };
          if (konf.length) h += `<div class="alert err">Nicht frei: ${konf.map(x => U.esc(L.konfliktText(d, x))).join('<br>')}</div>`;
          if (pr.hart.length) h += `<div class="alert err">${pr.hart.map(U.esc).join('<br>')}</div>`;
          if (pr.regel.length) h += `<div class="alert warn">Buchungsregel: ${pr.regel.map(U.esc).join('<br>')}</div>`;
          UI.$('#ovl', dlg).hidden = !pr.regel.length;
          if (!konf.length && !pr.hart.length && !pr.regel.length && k) h = '<div class="alert ok">Zeitfenster frei, Regeln erfüllt.</div>';
          if (k && !neu && !k.email) h += '<div class="alert warn">Keine E-Mail hinterlegt – Bestätigung mündlich geben.</div>';
        }
        UI.$('#hint', dlg).innerHTML = h;
      };
      const upd = () => {
        st.anlageId = f.anlage.value; st.datum = f.datum.value; st.dauer = Number(f.dauer.value); st.zeit = f.zeit.value;
        f.zeit.innerHTML = zeitOpts(Store.get());
        hint();
      };
      f.ksuche.addEventListener('input', () => {
        const sel = f.kunde.value;
        f.kunde.innerHTML = UI.kundenOpts(Store.get(), kundenListe(Store.get(), f.ksuche.value), sel);
        if (!f.kunde.value && f.kunde.options.length) f.kunde.selectedIndex = 0;
        hint();
      });
      f.ksuche.addEventListener('keydown', e => { if (e.key === 'ArrowDown') { e.preventDefault(); f.kunde.focus(); } });
      f.neu.addEventListener('change', () => { UI.$('.neuk', dlg).hidden = !f.neu.checked; f.kunde.disabled = f.neu.checked; hint(); });
      ['anlage', 'datum', 'dauer'].forEach(n => f[n].addEventListener('change', upd));
      [f.zeit, f.kunde, f.kgruppe].forEach(el => el.addEventListener('change', () => { st.zeit = f.zeit.value; hint(); }));
      hint();
      (pre.kundeId ? f.anlage : f.ksuche).focus();
    },
    buttons: [{ label: 'Abbrechen', cls: 'ghost' }, {
      label: 'Reservation speichern', cls: 'primary', onClick: dlg => {
        const f = UI.form(dlg.querySelector('form'));
        const start = f.datum + 'T' + f.zeit;
        const res = UI.run((d, ctx) => {
          let kid = f.kunde;
          if (f.neu) kid = L.kundeSpeichern(d, ctx, { name: f.kname, organisation: f.korg, gruppeId: f.kgruppe, email: f.kemail, telefon: f.ktel }).id;
          if (!kid) throw Fehler('Bitte eine Kundin bzw. einen Kunden wählen oder neu erfassen (FA-07).');
          return L.reservieren(d, ctx, { anlageId: f.anlage, kundeId: kid, start, ende: U.addMin(start, Number(f.dauer)), kanal: f.kanal, override: !!f.override });
        }, { silent: true });
        if (res.ok) {
          const d = Store.get();
          UI.toast(`Gespeichert: ${U.esc(L.anlage(d, res.r.res.anlageId).name)}, ${U.fmtRange(res.r.res.start, res.r.res.ende)}, ${U.esc(L.kundeKurz(L.kunde(d, res.r.res.kundeId)))} (${KANAL[f.kanal]}).${UI.emailHinweis(res.r.ohneEmail)}`, 'ok', 6000);
          return;
        }
        if (res.e.uebersteuerbar) UI.$('#ovl', dlg).hidden = false;
        V.fehlerMitAlternativen(dlg, res.e, f.kunde, f.kanal);
        return false;
      },
    }],
  });
};

/* ---------- FA-02 Gesamtbelegung (Tag/Woche) ---------- */
V.belegung = (main, db, user) => {
  const st = UI.st;
  st.bDate = st.bDate || U.today();
  st.bView = st.bView || 'tag';
  const staff = can(user, 'imAuftrag');
  const trainerOnly = !staff && (user.rollen || []).includes('trainer');
  const eigeneIds = user.kundeIds || [];
  const sichtbar = r => staff || eigeneIds.includes(r.kundeId);
  const sport = st.bSport || '';
  const tagAnlagen = d => db.anlagen.filter(a => (!sport || a.sportart === sport) && (a.aktiv || db.reservationen.some(r => r.anlageId === a.id && r.status === 'aktiv' && U.datePart(r.start) === d)));

  const toolbar = `<div class="toolbar">
      <div class="seg"><button data-view="tag" class="${st.bView === 'tag' ? 'on' : ''}">Tag</button><button data-view="woche" class="${st.bView === 'woche' ? 'on' : ''}">Woche</button></div>
      <div class="datenav"><button class="btn small ghost" data-d="-1">◀</button><input type="date" id="bdate" value="${st.bDate}"><button class="btn small ghost" data-d="1">▶</button><button class="btn small ghost" data-heute>Heute</button></div>
      <select id="bsport">${UI.opts(SPORTARTEN.map(s => [s, s]), sport, 'alle Sportarten')}</select>
      ${staff ? '<button class="btn primary" id="neu">+ Reservation (Telefon/E-Mail/Schalter)</button>' : ''}
      <a class="btn ghost" href="#/druck">Druckliste 7 Tage</a>
    </div>`;
  let body = '';
  if (st.bView === 'tag') {
    const d = st.bDate;
    const anl = tagAnlagen(d);
    const opens = anl.map(a => L.oeffnung(a, d)).filter(Boolean);
    const vonM = opens.length ? Math.min(...opens.map(o => U.toMin(o.von))) : 7 * 60;
    const bisM = opens.length ? Math.max(...opens.map(o => U.toMin(o.bis))) : 23 * 60;
    const span = bisM - vonM;
    const pos = t => ((U.toMin(t) - vonM) / span * 100).toFixed(3);
    const wid = (s, e) => ((U.toMin(e) - U.toMin(s)) / span * 100).toFixed(3);
    const clip = (s, e) => {
      const ts = U.datePart(s) < d ? '00:00' : U.timePart(s);
      const te = U.datePart(e) > d ? '24:00' : U.timePart(e);
      const a = U.fromMin(Math.max(U.toMin(ts), vonM)), b = U.fromMin(Math.min(U.toMin(te), bisM));
      return U.toMin(b) > U.toMin(a) ? [a, b] : null;
    };
    const ticks = [];
    for (let m = Math.ceil(vonM / 60) * 60; m <= bisM; m += 60) ticks.push(`<span style="left:${pos(U.fromMin(m))}%">${U.fromMin(m)}</span>`);
    const wd = U.weekday(d);
    const rows = anl.map(a => {
      const o = L.oeffnung(a, d);
      const rel = L.related(db, a.id);
      let blocks = '';
      if (!o) blocks += `<div class="blk closed" style="left:0;width:100%">geschlossen</div>`;
      else {
        if (U.toMin(o.von) > vonM) blocks += `<div class="blk closed" style="left:0;width:${wid(U.fromMin(vonM), o.von)}%"></div>`;
        if (U.toMin(o.bis) < bisM) blocks += `<div class="blk closed" style="left:${pos(o.bis)}%;width:${wid(o.bis, U.fromMin(bisM))}%"></div>`;
      }
      db.kontingente.filter(k => k.anlageId === a.id && k.wochentage.includes(wd)).forEach(k => {
        blocks += `<div class="blk kont" style="left:${pos(k.von)}%;width:${wid(k.von, k.bis)}%" title="Kontingent ${U.esc(L.gruppeName(db, k.gruppeId))}"><small>Kontingent ${U.esc(L.gruppeName(db, k.gruppeId))}</small></div>`;
      });
      db.sperrzeiten.filter(s => rel.includes(s.anlageId) && U.overlap(s.start, s.ende, d + 'T00:00', U.addDays(d, 1) + 'T00:00')).forEach(s => {
        const c = clip(s.start, s.ende); if (!c) return;
        blocks += `<div class="blk sperre${s.anlageId !== a.id ? ' ghost' : ''}" style="left:${pos(c[0])}%;width:${wid(c[0], c[1])}%" data-sperre="${s.id}" title="Sperrzeit: ${U.esc(s.grund)} ${U.esc(s.notiz)}"><b>Sperrzeit</b> ${U.esc(s.grund)}</div>`;
      });
      db.reservationen.filter(r => r.status === 'aktiv' && rel.includes(r.anlageId) && U.datePart(r.start) === d).forEach(r => {
        const c = clip(r.start, r.ende); if (!c) return;
        const k = L.kunde(db, r.kundeId);
        const ghost = r.anlageId !== a.id;
        const vis = sichtbar(r);
        const name = vis ? L.kundeKurz(k) : 'belegt';
        blocks += `<div class="blk res ${r.serieId ? 'serie' : 'einzel'}${ghost ? ' ghost' : ''}${vis ? '' : ' fremd'}" style="left:${pos(c[0])}%;width:${wid(c[0], c[1])}%" ${vis ? `data-res="${r.id}"` : ''}
          title="${U.esc(`${U.timePart(r.start)}–${U.timePart(r.ende)} ${name}${vis ? ' · ' + (r.serieId ? 'Serie' : 'Einzel') + ' · ' + KANAL[r.kanal] : ''}${ghost ? ' (über ' + L.anlage(db, r.anlageId).name + ')' : ''}`)}">
          <b>${U.esc(name)}</b>${vis ? ` <small>${U.timePart(r.start)}–${U.timePart(r.ende)} · ${r.serieId ? 'Serie' : 'Einzel'} · ${KANAL[r.kanal]}${k && !k.email ? ' · keine E-Mail' : ''}</small>` : ''}</div>`;
      });
      return `<div class="tl-row"><div class="tl-name">${U.esc(a.name)}${a.aktiv ? '' : ' <span class="tag">deaktiviert</span>'}</div><div class="tl-track" data-anlage="${a.id}">${blocks}</div></div>`;
    }).join('');
    body = `<div class="tl-wrap"><div class="tl"><div class="tl-row tl-head"><div class="tl-name">${U.fmtDate(d)}</div><div class="tl-track ticks">${ticks.join('')}</div></div>${rows}</div></div>
      <div class="legend"><span class="blk-l einzel">Einzelreservation</span><span class="blk-l serie">Serientermin</span><span class="blk-l sperre">Sperrzeit</span><span class="blk-l kont">Kontingent</span><span class="blk-l ghost">über ganze Halle / Hallenteil</span></div>
      ${staff ? '<p class="muted small">Klick auf eine freie Stelle erfasst eine Reservation zu dieser Zeit; Klick auf eine Reservation zeigt Details, Verlauf und Aktionen.</p>' : ''}
      ${trainerOnly ? '<p class="muted small">Als Trainerin/Trainer sehen Sie Namen nur bei Ihren eigenen Gruppen (QA-13).</p>' : ''}`;
    st._tl = { vonM, span };
  } else {
    let mo = st.bDate; while (U.weekday(mo) !== 1) mo = U.addDays(mo, -1);
    const tage = [...Array(7)].map((_, i) => U.addDays(mo, i));
    const anl = db.anlagen.filter(a => (!sport || a.sportart === sport) && (a.aktiv || db.reservationen.some(r => r.anlageId === a.id && r.status === 'aktiv' && tage.includes(U.datePart(r.start)))));
    body = `<div class="tl-wrap"><table class="tbl week"><thead><tr><th>Anlage</th>${tage.map(t => `<th><a href="#" data-tag="${t}">${U.fmtDate(t)}</a></th>`).join('')}</tr></thead><tbody>
      ${anl.map(a => `<tr><th>${U.esc(a.name)}${a.aktiv ? '' : ' <span class="tag">deaktiviert</span>'}</th>${tage.map(t => {
        const items = [];
        db.sperrzeiten.filter(s => s.anlageId === a.id && U.overlap(s.start, s.ende, t + 'T00:00', U.addDays(t, 1) + 'T00:00')).forEach(s => items.push([U.timePart(s.start), `<div class="wi sperre" data-sperre="${s.id}">${U.datePart(s.start) < t ? '00:00' : U.timePart(s.start)}–${U.datePart(s.ende) > t ? '24:00' : U.timePart(s.ende)} Sperrzeit: ${U.esc(s.grund)}</div>`]));
        db.reservationen.filter(r => r.status === 'aktiv' && r.anlageId === a.id && U.datePart(r.start) === t).forEach(r => {
          const vis = sichtbar(r);
          items.push([U.timePart(r.start), `<div class="wi ${r.serieId ? 'serie' : 'einzel'}" ${vis ? `data-res="${r.id}"` : ''}>${U.timePart(r.start)}–${U.timePart(r.ende)} ${vis ? U.esc(L.kundeKurz(L.kunde(db, r.kundeId))) + ` <small>${KANAL[r.kanal]}</small>` : 'belegt'}</div>`]);
        });
        return `<td>${items.sort((x, y) => x[0].localeCompare(y[0])).map(x => x[1]).join('')}</td>`;
      }).join('')}</tr>`).join('')}</tbody></table></div>`;
  }
  main.innerHTML = `<section class="card"><h1>Gesamtbelegung</h1>${toolbar}${body}</section>`;

  UI.$$('[data-view]', main).forEach(b => b.onclick = () => { st.bView = b.dataset.view; UI.render(); });
  UI.$$('[data-d]', main).forEach(b => b.onclick = () => { st.bDate = U.addDays(st.bDate, Number(b.dataset.d) * (st.bView === 'woche' ? 7 : 1)); UI.render(); });
  UI.$('[data-heute]', main).onclick = () => { st.bDate = U.today(); UI.render(); };
  UI.$('#bdate', main).onchange = e => { if (e.target.value) { st.bDate = e.target.value; UI.render(); } };
  UI.$('#bsport', main).onchange = e => { st.bSport = e.target.value; UI.render(); };
  UI.$$('[data-tag]', main).forEach(a => a.onclick = e => { e.preventDefault(); st.bDate = a.dataset.tag; st.bView = 'tag'; UI.render(); });
  const neu = UI.$('#neu', main); if (neu) neu.onclick = () => V.erfassenDialog({ start: st.bView === 'tag' && st.bDate !== U.today() ? st.bDate + 'T18:00' : undefined });
  UI.$$('[data-res]', main).forEach(b => b.onclick = e => { e.stopPropagation(); V.resDetail(b.dataset.res); });
  UI.$$('[data-sperre]', main).forEach(b => b.onclick = e => { e.stopPropagation(); V.sperreDetail(b.dataset.sperre); });
  if (staff && st.bView === 'tag') UI.$$('.tl-track[data-anlage]', main).forEach(t => t.onclick = e => {
    if (e.target !== t && !e.target.classList.contains('kont')) return;
    const rect = t.getBoundingClientRect();
    const m = st._tl.vonM + (e.clientX - rect.left) / rect.width * st._tl.span;
    const r = Store.get().params.raster;
    V.erfassenDialog({ anlageId: t.dataset.anlage, start: st.bDate + 'T' + U.fromMin(Math.floor(m / r) * r) });
  });
};

V.sperreDetail = id => {
  const db = Store.get();
  const user = Session.user(db);
  const s = L.find(db.sperrzeiten, id);
  if (!s) return;
  const verlauf = db.protokoll.filter(p => p.objektId === s.id);
  UI.modal({
    title: 'Sperrzeit',
    body: `<dl class="kv"><dt>Anlage</dt><dd>${U.esc(L.anlage(db, s.anlageId).name)}</dd><dt>Zeitraum</dt><dd>${U.fmtRange(s.start, s.ende)}</dd><dt>Grund</dt><dd>${U.esc(s.grund)} ${U.esc(s.notiz)}</dd></dl>
      <h3>Verlauf</h3><ul class="small">${verlauf.map(p => `<li>${U.fmtTs(p.zeit)} – ${U.esc(p.aktion)} – ${U.esc(p.userName)}</li>`).join('') || '<li>Demo-Daten</li>'}</ul>`,
    buttons: [{ label: 'Schliessen', cls: 'ghost' }].concat(can(user, 'sperren') && s.ende > U.now() ? [{ label: 'Sperrzeit aufheben', cls: 'danger', onClick: () => { UI.run((d, ctx) => L.sperreAufheben(d, ctx, id), { ok: 'Sperrzeit aufgehoben.' }); } }] : []),
  });
};

/* ---------- QA-06 Druckliste der nächsten sieben Tage ---------- */
V.druck = (main, db, user) => {
  const tage = [...Array(7)].map((_, i) => U.addDays(U.today(), i));
  const staff = can(user, 'imAuftrag');
  const own = user.kundeIds || [];
  main.innerHTML = `<section class="card print-area">
    <div class="head-row no-print"><h1>Druckliste Belegung</h1><div><a class="btn ghost" href="#/belegung">Zurück</a> <button class="btn primary" id="print">Drucken (A4 quer)</button></div></div>
    <p class="print-only"><b>ArenaOne – Belegung ${U.fmtDate(tage[0])} bis ${U.fmtDate(tage[6])}</b> (Notbetrieb, erstellt ${U.fmtTs(new Date().toISOString())})</p>
    ${tage.map(t => {
      const rows = [];
      db.anlagen.forEach(a => {
        db.sperrzeiten.filter(s => s.anlageId === a.id && U.overlap(s.start, s.ende, t + 'T00:00', U.addDays(t, 1) + 'T00:00')).forEach(s => rows.push([a.name, U.timePart(s.start), `${U.timePart(s.start)}–${U.timePart(s.ende)}`, `SPERRZEIT: ${s.grund}`, '', '']));
        db.reservationen.filter(r => r.status === 'aktiv' && r.anlageId === a.id && U.datePart(r.start) === t).forEach(r => {
          const k = L.kunde(db, r.kundeId);
          const vis = staff || own.includes(r.kundeId);
          rows.push([a.name, U.timePart(r.start), `${U.timePart(r.start)}–${U.timePart(r.ende)}`, vis ? L.kundeName(k) : 'belegt', vis && k ? [k.telefon, k.email].filter(Boolean).join(', ') : '', r.serieId ? 'Serie' : 'Einzel']);
        });
      });
      rows.sort((x, y) => x[0].localeCompare(y[0], 'de', { numeric: true }) || x[1].localeCompare(y[1]));
      return `<h2 class="pday">${U.WT_LANG[U.weekday(t)]}, ${U.fmtDate(t)}</h2><table class="tbl small print"><thead><tr><th>Anlage</th><th>Zeit</th><th>Kunde / Organisation</th><th>Kontakt</th><th>Art</th></tr></thead><tbody>
        ${rows.map(r => `<tr><td>${U.esc(r[0])}</td><td>${r[2]}</td><td>${U.esc(r[3])}</td><td>${U.esc(r[4])}</td><td>${r[5]}</td></tr>`).join('') || '<tr><td colspan="5">keine Einträge</td></tr>'}</tbody></table>`;
    }).join('')}</section>`;
  UI.$('#print', main).onclick = () => window.print();
};

/* ---------- Serien (FA-16 bis FA-18, FA-20) ---------- */
V.serien = (main, db, user) => {
  const staff = can(user, 'serieBestaetigen');
  const antrag = can(user, 'serieBeantragen');
  const orgKunden = (staff ? db.kunden : UI.meineKunden(db, user)).filter(k => k.organisation);
  const sichtbar = s => staff || (user.kundeIds || []).includes(s.kundeId);
  const offene = db.serien.filter(s => s.status === 'beantragt' && sichtbar(s));
  const andere = db.serien.filter(s => s.status !== 'beantragt' && sichtbar(s)).sort((a, b) => b.von.localeCompare(a.von));
  const anon = t => staff ? t : t.replace(/^Reservation .*/, 'belegt');

  const antragKarte = s => {
    const termine = L.serieKonflikte(db, s);
    const konf = termine.filter(t => t.gruende.length);
    const anteil = L.abendAnteil(db, s.anlageId, { mitSerien: true, extraSerie: s });
    const grenze = db.params.kontingentMaxAnteil / 100;
    const von = L.user(db, s.beantragtVon);
    return `<article class="card antrag">
      <h3>${U.esc(L.kundeName(L.kunde(db, s.kundeId)))}: ${U.WT_LANG[s.wochentag]} ${s.beginn} Uhr, ${s.dauerMin} Min., ${U.esc(L.anlage(db, s.anlageId).name)}</h3>
      <p>${U.fmtDate(s.von)} bis ${U.fmtDate(s.bis)} · <b>${termine.length} Termine</b>, davon <b>${konf.length} mit Konflikt</b> · beantragt ${von ? 'von ' + U.esc(von.name) : ''} am ${U.fmtTs(s.beantragtAm)} · Kanal ${KANAL[s.kanal]}${s.bemerkung ? ' · «' + U.esc(s.bemerkung) + '»' : ''}</p>
      ${staff ? `<p class="${anteil > grenze ? 'alert warn' : 'muted small'}">Abendstunden dieser Anlage (werktags ${db.params.abendVon}–${db.params.abendBis}) durch Serien und Kontingente nach Bestätigung: ${U.fmtPct(anteil)} (Höchstanteil PA-10: ${db.params.kontingentMaxAnteil} %)${anteil > grenze ? ' – über dem Höchstanteil, Entscheid der Geschäftsleitung (OP-09).' : ''}</p>` : ''}
      ${konf.length ? `<table class="tbl small"><thead><tr><th>Konflikttermin</th><th>Kollision (FA-17)</th></tr></thead><tbody>${konf.map(t => `<tr><td class="nowrap">${U.fmtDate(t.start)}, ${U.timePart(t.start)}–${U.timePart(t.ende)}</td><td>${t.gruende.map(g => U.esc(anon(g))).join('<br>')}</td></tr>`).join('')}</tbody></table>` : '<p class="alert ok">Keine Konflikte.</p>'}
      ${staff ? `<div class="btns"><button class="btn primary" data-ok="${s.id}" data-m="ganz" ${konf.length ? 'disabled title="Nicht möglich: es gibt Konflikttermine"' : ''}>Ganz bestätigen</button>
        <button class="btn" data-ok="${s.id}" data-m="ohne" ${konf.length === termine.length ? 'disabled' : ''}>Ohne Konflikttermine bestätigen (${termine.length - konf.length})</button>
        <button class="btn danger" data-no="${s.id}">Ablehnen</button></div>` : '<p class="muted small">Wartet auf Bestätigung durch den Empfang. Bis dahin ist keine Zeit reserviert.</p>'}
    </article>`;
  };

  main.innerHTML = `
    ${offene.length || staff ? `<section class="card"><h1>Offene Serienanträge${offene.length ? ` <span class="badge">${offene.length}</span>` : ''}</h1>${offene.map(antragKarte).join('') || '<p class="muted">Keine offenen Anträge.</p>'}</section>` : ''}
    ${antrag ? `<section class="card"><h2>Serie beantragen</h2>
      ${orgKunden.length ? `<form id="sf">
        <div class="row"><label>Organisation <select name="kundeId">${UI.kundenOpts(db, orgKunden)}</select></label>
          <label>Anlage <select name="anlageId">${UI.anlagenOpts(db, 'A-t1')}</select></label></div>
        <div class="row"><label>Erster Termin <input type="date" name="von" value="${U.addDays(U.today(), 7)}" required></label>
          <label>Letzter Termin <input type="date" name="bis" value="${U.addDays(U.today(), 7 + 7 * 20)}" required></label></div>
        <div class="row"><label>Wochentag <select name="wochentag">${UI.opts([1, 2, 3, 4, 5, 6, 0].map(w => [w, U.WT_LANG[w]]), U.weekday(U.addDays(U.today(), 7)))}</select></label>
          <label>Beginn <input type="time" name="beginn" value="18:00" step="${db.params.raster * 60}" required></label>
          <label>Dauer <select name="dauerMin">${UI.dauerOpts(db, 240, 120)}</select></label></div>
        ${staff ? `<label>Kanal <select name="kanal">${UI.opts([['telefon', 'Telefon'], ['email', 'E-Mail'], ['schalter', 'Schalter']], 'email')}</select></label>` : ''}
        <label>Bemerkung (optional) <input name="bemerkung" maxlength="120"></label>
        <div class="btns"><button type="button" class="btn" id="spruef">Termine und Konflikte prüfen</button><button class="btn primary">Antrag stellen</button></div>
        <div id="sprev"></div></form>` : '<p class="muted">Serien sind für Organisationen (Verein, Firma, Trainingsgruppe). Ihrem Konto ist keine Organisation zugeordnet.</p>'}
    </section>` : ''}
    <section class="card"><h2>Serien</h2>
      <table class="tbl resp"><thead><tr><th>Serie</th><th>Anlage</th><th>Zeitraum</th><th>Status</th><th>Termine</th></tr></thead><tbody>
      ${andere.map(s => {
        const n = db.reservationen.filter(r => r.serieId === s.id && r.status === 'aktiv' && r.start > U.now()).length;
        return `<tr><td data-l="Serie">${U.esc(L.serieName(db, s))}</td><td data-l="Anlage">${U.esc(L.anlage(db, s.anlageId).name)}</td><td data-l="Zeitraum">${U.fmtDate(s.von)} – ${U.fmtDate(s.bis)}</td>
          <td data-l="Status">${s.status === 'bestaetigt' ? UI.statusTag('bestätigt', 'ok') : UI.statusTag('abgelehnt', 'err')}${s.grund ? ' ' + U.esc(s.grund) : ''}${s.ausgelassen.length ? ` <span class="muted small">${s.ausgelassen.length} ausgelassen</span>` : ''}</td>
          <td><button class="btn small ghost" data-serie="${s.id}">${n} kommende</button></td></tr>`;
      }).join('') || '<tr><td colspan="5">Keine Serien.</td></tr>'}</tbody></table></section>`;

  UI.$$('[data-serie]', main).forEach(b => b.onclick = () => V.serieDetail(b.dataset.serie));
  UI.$$('[data-ok]', main).forEach(b => b.onclick = () => UI.run((d, ctx) => L.serieBestaetigen(d, ctx, b.dataset.ok, b.dataset.m === 'ganz' ? 'ganz' : 'ohne'),
    { ok: r => `Serie bestätigt: ${r.reserviert} Termine reserviert, ${r.ausgelassen} ausgelassen. Terminliste versandt.${r.ohneEmail ? ' <b>Keine E-Mail hinterlegt.</b>' : ''}` }));
  UI.$$('[data-no]', main).forEach(b => b.onclick = () => UI.modal({
    title: 'Serienantrag ablehnen', body: '<label>Grund (wird der Antragstellerin mitgeteilt) <textarea name="grund" rows="3" required></textarea></label>',
    buttons: [{ label: 'Abbrechen', cls: 'ghost' }, { label: 'Ablehnen', cls: 'danger', onClick: dlg => UI.run((d, ctx) => L.serieAblehnen(d, ctx, b.dataset.no, UI.$('[name=grund]', dlg).value), { ok: 'Antrag abgelehnt, Grund mitgeteilt.' }).ok ? undefined : false }],
  }));
  const f = UI.$('#sf', main);
  if (f) {
    f.von.onchange = () => { if (f.von.value) f.wochentag.value = U.weekday(f.von.value); };
    const daten = () => { const d = UI.form(f); if (!d.kanal) d.kanal = 'online'; return d; };
    UI.$('#spruef', main).onclick = () => {
      const d = daten();
      const tmp = { kundeId: d.kundeId, anlageId: d.anlageId, wochentag: Number(d.wochentag), beginn: d.beginn, dauerMin: Number(d.dauerMin), von: d.von, bis: d.bis };
      const t = L.serieKonflikte(Store.get(), tmp);
      const k = t.filter(x => x.gruende.length);
      UI.$('#sprev', main).innerHTML = `<p><b>${t.length} Termine</b>, davon ${k.length} mit Konflikt.</p>${k.length ? `<ul class="small">${k.map(x => `<li>${U.fmtDate(x.start)}: ${x.gruende.map(g => U.esc(anon(g))).join('; ')}</li>`).join('')}</ul>` : ''}`;
    };
    f.onsubmit = e => {
      e.preventDefault();
      UI.run((d, ctx) => L.serieBeantragen(d, ctx, daten()), { ok: 'Antrag gespeichert. Er erscheint beim Empfang als offener Antrag; bis zur Bestätigung ist keine Zeit reserviert.' });
    };
  }
};

/* ---------- Kundenkonten (FA-07, FA-08) ---------- */
V.kunden = (main, db) => {
  const q = (UI.st.kSuche || '').toLowerCase();
  const list = db.kunden.filter(k => !q || [k.name, k.organisation, k.email, k.telefon].join(' ').toLowerCase().includes(q))
    .sort((a, b) => L.kundeName(a).localeCompare(L.kundeName(b)));
  const now = U.now();
  main.innerHTML = `<section class="card"><div class="head-row"><h1>Kunden</h1><button class="btn primary" id="kneu">+ Kundenkonto</button></div>
    <input type="search" id="ksuche" placeholder="Suchen nach Name, Organisation, Telefon, E-Mail" value="${U.esc(UI.st.kSuche || '')}">
    <table class="tbl resp"><thead><tr><th>Name / Organisation</th><th>Gruppe</th><th>E-Mail</th><th>Telefon</th><th>kommende Res.</th><th></th></tr></thead><tbody>
    ${list.map(k => `<tr><td data-l="Name">${U.esc(L.kundeName(k))}</td><td data-l="Gruppe">${U.esc(L.gruppeName(db, k.gruppeId))}</td><td data-l="E-Mail">${U.esc(k.email) || '<span class="tag warn">keine E-Mail</span>'}</td><td data-l="Telefon">${U.esc(k.telefon)}</td>
      <td data-l="kommend">${db.reservationen.filter(r => r.kundeId === k.id && r.status === 'aktiv' && r.ende > now).length}</td>
      <td class="nowrap"><button class="btn small ghost" data-edit="${k.id}">Bearbeiten</button> <button class="btn small" data-res="${k.id}">Reservieren</button></td></tr>`).join('')}
    </tbody></table></section>`;
  const s = UI.$('#ksuche', main);
  s.oninput = () => { UI.st.kSuche = s.value; clearTimeout(UI._kt); UI._kt = setTimeout(() => { UI.render(); const n = UI.$('#ksuche'); n.focus(); n.setSelectionRange(n.value.length, n.value.length); }, 250); };
  UI.$('#kneu', main).onclick = () => V.kundeDialog(null);
  UI.$$('[data-edit]', main).forEach(b => b.onclick = () => V.kundeDialog(b.dataset.edit));
  UI.$$('[data-res]', main).forEach(b => b.onclick = () => V.erfassenDialog({ kundeId: b.dataset.res }));
};
V.kundeDialog = id => {
  const db = Store.get();
  const k = id ? L.kunde(db, id) : { name: '', organisation: '', gruppeId: 'G-privat', email: '', telefon: '', smsOptIn: false, erinnerungenAus: false };
  const kundenUser = db.users.filter(u => (u.rollen || []).some(r => PERM.eigene.includes(r)));
  const kommend = id ? db.reservationen.filter(r => r.kundeId === id && r.status === 'aktiv' && r.ende > U.now()).sort((a, b) => a.start.localeCompare(b.start)).slice(0, 10) : [];
  UI.modal({
    title: id ? 'Kundenkonto bearbeiten' : 'Neues Kundenkonto', wide: true,
    body: `<div class="row"><label>Name (Person bzw. Kontaktperson) <input name="name" value="${U.esc(k.name)}" required></label>
        <label>Organisation (nur Verein/Firma/Trainingsgruppe) <input name="organisation" value="${U.esc(k.organisation)}"></label></div>
      <div class="row"><label>Kundengruppe <select name="gruppeId">${UI.opts(db.gruppen.map(g => [g.id, g.name]), k.gruppeId)}</select></label></div>
      <div class="row"><label>E-Mail <input type="email" name="email" value="${U.esc(k.email)}"></label><label>Telefon <input name="telefon" value="${U.esc(k.telefon)}"></label></div>
      <label class="check"><input type="checkbox" name="smsOptIn" ${k.smsOptIn ? 'checked' : ''}> SMS-Benachrichtigung gewünscht</label>
      <label class="check"><input type="checkbox" name="erinnerungenAus" ${k.erinnerungenAus ? 'checked' : ''}> Keine Erinnerungen für Serientermine</label>
      <fieldset><legend>Berechtigte Personen mit Login (FA-08)</legend><div class="checks">${kundenUser.map(u => `<label class="check"><input type="checkbox" name="berechtigte" data-multi value="${u.id}" ${(u.kundeIds || []).includes(id) ? 'checked' : ''}> ${U.esc(u.name)} <span class="muted small">(${U.esc(u.login)})</span></label>`).join('')}</div></fieldset>
      <p class="muted small">Weitere Personendaten werden nicht erfasst (QA-10).</p>
      ${kommend.length ? `<h3>Kommende Reservationen</h3><ul class="small">${kommend.map(r => `<li>${U.fmtRange(r.start, r.ende)}, ${U.esc(L.anlage(db, r.anlageId).name)}${r.serieId ? ' (Serie)' : ''}</li>`).join('')}</ul>` : ''}`,
    buttons: [{ label: 'Abbrechen', cls: 'ghost' }, {
      label: 'Speichern', cls: 'primary', onClick: dlg => {
        const d = UI.form(dlg.querySelector('form'));
        d.id = id; d.berechtigte = d.berechtigte || [];
        return UI.run((x, ctx) => L.kundeSpeichern(x, ctx, d), { ok: 'Kundenkonto gespeichert.' }).ok ? undefined : false;
      },
    }],
  });
};

/* ---------- Sperrzeiten (FA-27, FA-28, FA-23) ---------- */
V.sperrzeiten = (main, db) => {
  const now = U.now();
  const kommende = db.sperrzeiten.filter(s => s.ende > now).sort((a, b) => a.start.localeCompare(b.start));
  const vergangene = db.sperrzeiten.filter(s => s.ende <= now).sort((a, b) => b.start.localeCompare(a.start)).slice(0, 20);
  const def = U.addDays(U.today(), 1);
  const row = s => `<tr><td>${U.esc(L.anlage(db, s.anlageId).name)}</td><td>${U.fmtRange(s.start, s.ende)}</td><td>${U.esc(s.grund)}</td><td>${U.esc(s.notiz)}</td><td>${s.ende > now ? `<button class="btn small danger" data-auf="${s.id}">Aufheben</button>` : ''}</td></tr>`;
  main.innerHTML = `<section class="card"><h1>Anlage sperren</h1>
    <form id="zf">
      <div class="row"><label>Anlage <select name="anlageId">${UI.anlagenOpts(db, 'A-p1')}</select></label>
        <label>Grund <select name="grund">${UI.opts(SPERRGRUENDE.map(g => [g, g]), 'Unterhalt')}</select></label></div>
      <div class="row"><label>Beginn <input type="datetime-local" name="start" value="${def}T07:00" step="${db.params.raster * 60}" required></label>
        <label>Ende <input type="datetime-local" name="ende" value="${def}T12:00" step="${db.params.raster * 60}" required></label></div>
      <label>Notiz (optional, wird Betroffenen mitgeteilt) <input name="notiz" maxlength="120"></label>
      <div class="btns"><button class="btn">Betroffene Reservationen prüfen</button></div>
      <div id="zbetr"></div>
    </form></section>
    <section class="card"><h2>Aktuelle und kommende Sperrzeiten</h2><table class="tbl small"><thead><tr><th>Anlage</th><th>Zeitraum</th><th>Grund</th><th>Notiz</th><th></th></tr></thead><tbody>${kommende.map(row).join('') || '<tr><td colspan="5">Keine.</td></tr>'}</tbody></table>
    <details><summary>Vergangene</summary><table class="tbl small"><tbody>${vergangene.map(row).join('') || '<tr><td>Keine.</td></tr>'}</tbody></table></details></section>`;
  const f = UI.$('#zf', main);
  const box = UI.$('#zbetr', main);
  ['anlageId', 'start', 'ende'].forEach(n => f[n].addEventListener('change', () => { box.innerHTML = ''; }));
  f.onsubmit = e => {
    e.preventDefault();
    const d = UI.form(f);
    const x = Store.get();
    if (!d.start || !d.ende || d.ende <= d.start) { UI.toast('Bitte einen gültigen Zeitraum angeben (Ende nach Beginn).', 'err'); return; }
    const betr = L.sperreBetroffene(x, d.anlageId, d.start, d.ende);
    const temp = { id: '_neu', anlageId: d.anlageId, start: d.start, ende: d.ende, grund: d.grund };
    box.innerHTML = `<h3>${betr.length ? betr.length + ' betroffene Reservation(en) – für jede «stornieren» oder «verschieben» wählen (FA-28)' : 'Keine Reservation betroffen.'}</h3>
      ${betr.map(r => {
        const alts = L.sperreAlternativen(x, r, temp);
        const k = L.kunde(x, r.kundeId);
        return `<div class="betr" data-r="${r.id}"><div><b>${U.esc(L.anlage(x, r.anlageId).name)}</b>, ${U.fmtRange(r.start, r.ende)} – ${U.esc(L.kundeName(k))}${r.serieId ? ' (Serientermin)' : ''}${k && !k.email ? ' <span class="tag warn">keine E-Mail</span>' : ''}</div>
          <label class="check"><input type="radio" name="e_${r.id}" value="storno"> stornieren</label>
          <label class="check"><input type="radio" name="e_${r.id}" value="move" ${alts.length ? '' : 'disabled'}> verschieben auf</label>
          <select name="alt_${r.id}" ${alts.length ? '' : 'disabled'}>${alts.length ? alts.map(a => `<option value='${JSON.stringify({ anlageId: a.anlageId, start: a.start, ende: a.ende })}'>${U.esc(L.anlage(x, a.anlageId).name)}, ${U.timePart(a.start)}–${U.timePart(a.ende)}</option>`).join('') : '<option>keine freie Alternative am selben Tag</option>'}</select></div>`;
      }).join('')}
      <div class="btns"><button type="button" class="btn primary" id="zsave" ${betr.length ? 'disabled' : ''}>Sperrzeit speichern${betr.length ? ' und Betroffene informieren' : ''}</button></div>`;
    const save = UI.$('#zsave', box);
    const pruef = () => { save.disabled = !betr.every(r => box.querySelector(`[name="e_${r.id}"]:checked`)); };
    UI.$$('input[type=radio]', box).forEach(i => i.addEventListener('change', pruef));
    UI.$$('select[name^=alt_]', box).forEach(s => s.addEventListener('change', () => { const r = box.querySelector(`[name="e_${s.name.slice(4)}"][value=move]`); if (r && !r.disabled) { r.checked = true; pruef(); } }));
    save.onclick = () => {
      const ent = {};
      betr.forEach(r => {
        const v = box.querySelector(`[name="e_${r.id}"]:checked`).value;
        ent[r.id] = v === 'storno' ? 'storno' : JSON.parse(box.querySelector(`[name="alt_${r.id}"]`).value);
      });
      UI.run((db2, ctx) => L.sperreSpeichern(db2, ctx, d, ent), {
        ok: r => `Sperrzeit gespeichert.${r.info.length ? ` ${r.info.length} Betroffene informiert.` : ''}${r.info.filter(i => i.ohneEmail).map(i => `<br><b>Keine E-Mail:</b> ${U.esc(i.kunde)} bitte telefonisch informieren.`).join('')}`,
      });
    };
  };
  UI.$$('[data-auf]', main).forEach(b => b.onclick = () => UI.run((d, ctx) => L.sperreAufheben(d, ctx, b.dataset.auf), { ok: 'Sperrzeit aufgehoben.' }));
};

/* ---------- Regeln, Kundengruppen, Kontingente, Parameter (FA-24 bis FA-26) ---------- */
V.regeln = (main, db) => {
  const p = db.params;
  const hauptAnl = db.anlagen.filter(a => a.aktiv);
  main.innerHTML = `
    <section class="card"><h1>Kundengruppen und Buchungsregeln</h1>
      <p class="muted small">Änderungen gelten für neue Reservationen; bestehende Reservationen bleiben gültig (FA-25). Leeres Feld «offen» = ohne Begrenzung.</p>
      <div class="tl-wrap"><table class="tbl"><thead><tr><th>Kundengruppe</th><th>Vorlauf (Tage)</th><th>max. Dauer (Min.)</th><th>gleichzeitig offene Einzelres.</th><th>reservierbare Anlagen</th><th></th></tr></thead><tbody>
      ${db.gruppen.map(g => `<tr data-g="${g.id}"><td><input name="name" value="${U.esc(g.name)}"></td><td><input type="number" min="0" name="vorlaufTage" value="${g.vorlaufTage}" class="num"></td>
        <td><input type="number" min="${p.minDauer}" step="${p.raster}" name="maxDauerMin" value="${g.maxDauerMin}" class="num"></td><td><input type="number" min="0" name="maxOffen" value="${g.maxOffen == null ? '' : g.maxOffen}" class="num"></td>
        <td><button class="btn small ghost" data-anl="${g.id}">${g.anlagenIds ? g.anlagenIds.length + ' von ' + db.anlagen.length : 'alle'}</button></td><td><button class="btn small" data-save="${g.id}">Speichern</button></td></tr>`).join('')}
      <tr data-g=""><td><input name="name" placeholder="neue Kundengruppe"></td><td><input type="number" min="0" name="vorlaufTage" value="14" class="num"></td><td><input type="number" name="maxDauerMin" value="120" class="num"></td><td><input type="number" name="maxOffen" value="" class="num"></td><td>alle</td><td><button class="btn small primary" data-save="">Anlegen</button></td></tr>
      </tbody></table></div></section>
    <section class="card"><h2>Kontingente (FA-26)</h2>
      <p class="muted small">Ein Kontingent reserviert ein wiederkehrendes Zeitband einer Anlage für eine Kundengruppe; andere Gruppen sehen diese Zeiten nicht als frei. Höchstens ${p.kontingentMaxAnteil} % der Abendstunden (werktags ${p.abendVon}–${p.abendBis}) je Anlage (PA-10).</p>
      <table class="tbl small"><thead><tr><th>Anlage</th><th>Gruppe</th><th>Wochentage</th><th>Zeitband</th><th>Abendanteil Anlage</th><th></th></tr></thead><tbody>
      ${db.kontingente.map(k => `<tr><td>${U.esc(L.anlage(db, k.anlageId).name)}</td><td>${U.esc(L.gruppeName(db, k.gruppeId))}</td><td>${k.wochentage.map(w => U.WT[w]).join(', ')}</td><td>${k.von}–${k.bis}</td><td>${U.fmtPct(L.abendAnteil(db, k.anlageId))}</td><td><button class="btn small danger" data-kdel="${k.id}">Aufheben</button></td></tr>`).join('') || '<tr><td colspan="6">Keine Kontingente.</td></tr>'}
      </tbody></table>
      <form id="kf" class="row wrap">
        <label>Anlage <select name="anlageId">${UI.anlagenOpts(db, 'A-m2')}</select></label>
        <label>Kundengruppe <select name="gruppeId">${UI.opts(db.gruppen.map(g => [g.id, g.name]), 'G-verein')}</select></label>
        <fieldset><legend>Wochentage</legend><div class="checks">${[1, 2, 3, 4, 5, 6, 0].map(w => `<label class="check"><input type="checkbox" name="wochentage" data-multi value="${w}" ${w >= 1 && w <= 4 ? 'checked' : ''}> ${U.WT[w]}</label>`).join('')}</div></fieldset>
        <label>von <input type="time" name="von" value="18:00" step="${p.raster * 60}"></label><label>bis <input type="time" name="bis" value="21:00" step="${p.raster * 60}"></label>
        <button class="btn primary">Kontingent festlegen</button>
      </form></section>
    <section class="card"><h2>Parameter (Kapitel 7.3)</h2>
      <form id="pf" class="params">
        <label>PA-01 Zeitraster (Min.) <select name="raster">${UI.opts([[15, '15'], [30, '30'], [60, '60']], p.raster)}</select></label>
        <label>PA-01 Mindestdauer (Min.) <input type="number" name="minDauer" value="${p.minDauer}" min="15" step="15"></label>
        <label>PA-04 Stornofrist (Std. vor Beginn) <input type="number" name="stornofristStd" value="${p.stornofristStd}" min="0"></label>
        <label>PA-05 Annahmefrist Warteliste (Min.) <input type="number" name="annahmefristMin" value="${p.annahmefristMin}" min="1"></label>
        <label>PA-06 Erinnerungsfrist (Std. vor Beginn) <input type="number" name="erinnerungStd" value="${p.erinnerungStd}" min="0"></label>
        <label>PA-07 Aufbewahrung inaktiver Konten (Monate) <input type="number" name="aufbewahrungMonate" value="${p.aufbewahrungMonate}" min="1"></label>
        <label>PA-09 Spitzenlast (Personen, nur Doku) <input type="number" name="spitzenlast" value="${p.spitzenlast}" min="1"></label>
        <label>PA-10 Höchstanteil Abendstunden (%) <input type="number" name="kontingentMaxAnteil" value="${p.kontingentMaxAnteil}" min="0" max="100"></label>
        <label>PA-10 Abend von <input type="time" name="abendVon" value="${p.abendVon}"></label>
        <label>PA-10 Abend bis <input type="time" name="abendBis" value="${p.abendBis}"></label>
        <p class="muted small">PA-02 (Vorlauf) und PA-03 (offene Reservationen) stehen oben je Kundengruppe; PA-08 (Öffnungszeiten) pflegt die Administration je Anlage.</p>
        <button class="btn primary">Parameter speichern</button>
      </form></section>`;

  UI.$$('[data-save]', main).forEach(b => b.onclick = () => {
    const tr = b.closest('tr');
    const d = { id: tr.dataset.g || null };
    UI.$$('input', tr).forEach(i => { d[i.name] = i.value; });
    const g = d.id ? L.gruppe(db, d.id) : null;
    d.anlagenIds = g ? g.anlagenIds || db.anlagen.map(a => a.id) : db.anlagen.map(a => a.id);
    UI.run((x, ctx) => L.gruppeSpeichern(x, ctx, d), { ok: 'Kundengruppe gespeichert.' });
  });
  UI.$$('[data-anl]', main).forEach(b => b.onclick = () => {
    const g = L.gruppe(db, b.dataset.anl);
    UI.modal({
      title: `Reservierbare Anlagen «${g.name}»`,
      body: `<div class="checks col">${db.anlagen.map(a => `<label class="check"><input type="checkbox" name="anl" data-multi value="${a.id}" ${!g.anlagenIds || g.anlagenIds.includes(a.id) ? 'checked' : ''}> ${U.esc(a.name)}</label>`).join('')}</div>`,
      buttons: [{ label: 'Abbrechen', cls: 'ghost' }, {
        label: 'Übernehmen', cls: 'primary', onClick: dlg => {
          const ids = UI.form(dlg.querySelector('form')).anl || [];
          return UI.run((x, ctx) => L.gruppeSpeichern(x, ctx, Object.assign({}, g, { anlagenIds: ids })), { ok: 'Reservierbare Anlagen gespeichert.' }).ok ? undefined : false;
        },
      }],
    });
  });
  UI.$$('[data-kdel]', main).forEach(b => b.onclick = () => UI.run((x, ctx) => L.kontingentLoeschen(x, ctx, b.dataset.kdel), { ok: 'Kontingent aufgehoben.' }));
  UI.$('#kf', main).onsubmit = e => { e.preventDefault(); const d = UI.form(e.target); UI.run((x, ctx) => L.kontingentSpeichern(x, ctx, d), { ok: 'Kontingent festgelegt.' }); };
  UI.$('#pf', main).onsubmit = e => { e.preventDefault(); const d = UI.form(e.target); UI.run((x, ctx) => L.paramsSpeichern(x, ctx, d), { ok: 'Parameter gespeichert.' }); };
};

/* ---------- Auswertungen (FA-29 bis FA-31) ---------- */
V.auswertung = (main, db) => {
  const st = UI.st;
  st.aVon = st.aVon || U.addDays(U.today(), -30);
  st.aBis = st.aBis || U.addDays(U.today(), -1);
  const f = { sportart: st.aSport || '', anlageId: st.aAnlage || '' };
  const { res } = L.auslastung(db, st.aVon, st.aBis, f);
  const sto = L.stornoStats(db, st.aVon, st.aBis, f);
  const q = o => o && o.reservierbar ? o.reserviert / o.reservierbar : NaN;
  const bar = x => `<span class="bar"><span style="width:${isFinite(x) ? Math.min(100, x * 100) : 0}%"></span></span>`;
  const tabAnl = Object.entries(res.anlagen).map(([id, o]) => { const a = L.anlage(db, id); return [a.name, a.sportart, U.fmtH(o.reservierbar), U.fmtH(o.reserviert), q(o)]; });
  const tabSp = Object.entries(res.sportart).map(([k, o]) => [k, U.fmtH(o.reservierbar), U.fmtH(o.reserviert), q(o)]);
  const tabGr = Object.entries(res.gruppe).map(([gid, o]) => [L.gruppeName(db, gid), U.fmtH(o.reserviert), res.total.reservierbar ? o.reserviert / res.total.reservierbar : NaN]);
  const tabWt = [1, 2, 3, 4, 5, 6, 0].filter(w => res.wochentag[w]).map(w => [U.WT_LANG[w], U.fmtH(res.wochentag[w].reservierbar), U.fmtH(res.wochentag[w].reserviert), q(res.wochentag[w])]);
  const tabH = Object.keys(res.stunde).map(Number).sort((a, b) => a - b).map(h => [`${U.pad(h)}–${U.pad(h + 1)} Uhr`, U.fmtH(res.stunde[h].reservierbar), U.fmtH(res.stunde[h].reserviert), q(res.stunde[h])]);
  const tabSt = Object.entries(sto.gruppen).map(([gid, o]) => [L.gruppeName(db, gid), o.reservationen, o.storniert, o.kurzfristig, o.neuVergeben]);
  st._csv = [
    ['ArenaOne Auswertung', `${st.aVon} bis ${st.aBis}`, f.sportart || 'alle Sportarten', f.anlageId ? L.anlage(db, f.anlageId).name : 'alle Anlagen'], [],
    ['Auslastung je Anlage'], ['Anlage', 'Sportart', 'reservierbare Std.', 'reservierte Std.', 'Auslastung %'], ...tabAnl.map(r => [r[0], r[1], r[2], r[3], U.fmtPct(r[4])]), [],
    ['Auslastung je Sportart'], ['Sportart', 'reservierbare Std.', 'reservierte Std.', 'Auslastung %'], ...tabSp.map(r => [r[0], r[1], r[2], U.fmtPct(r[3])]), [],
    ['Auslastung je Kundengruppe'], ['Kundengruppe', 'reservierte Std.', 'Anteil an reservierbarer Zeit %'], ...tabGr.map(r => [r[0], r[1], U.fmtPct(r[2])]), [],
    ['Auslastung je Wochentag'], ['Wochentag', 'reservierbare Std.', 'reservierte Std.', 'Auslastung %'], ...tabWt.map(r => [r[0], r[1], r[2], U.fmtPct(r[3])]), [],
    ['Auslastung je Stunde'], ['Stunde', 'reservierbare Std.', 'reservierte Std.', 'Auslastung %'], ...tabH.map(r => [r[0], r[1], r[2], U.fmtPct(r[3])]), [],
    ['Stornierungen je Kundengruppe'], ['Kundengruppe', 'Reservationen', 'Stornierungen', 'davon kurzfristig', 'über Warteliste neu vergeben'], ...tabSt, ['Total', sto.total.reservationen, sto.total.storniert, sto.total.kurzfristig, sto.total.neuVergeben],
  ];
  const tbl = (head, rows, pctCol) => `<table class="tbl small"><thead><tr>${head.map(h => `<th>${h}</th>`).join('')}</tr></thead><tbody>${rows.map(r => `<tr>${r.map((c, i) => `<td${i === pctCol ? ' class="nowrap"' : ''}>${i === pctCol ? U.fmtPct(c) + ' ' + bar(c) : U.esc(c)}</td>`).join('')}</tr>`).join('') || `<tr><td colspan="${head.length}">keine Daten</td></tr>`}</tbody></table>`;
  main.innerHTML = `<section class="card"><h1>Auswertungen</h1>
    <form id="af" class="toolbar">
      <label class="inline">von <input type="date" name="von" value="${st.aVon}"></label><label class="inline">bis <input type="date" name="bis" value="${st.aBis}"></label>
      <select name="sport">${UI.opts(SPORTARTEN.map(s => [s, s]), f.sportart, 'alle Sportarten')}</select>
      <select name="anlage"><option value="">alle Anlagen</option>${UI.anlagenOpts(db, f.anlageId, { inaktiv: true })}</select>
      <button class="btn">Anzeigen</button><button type="button" class="btn ghost" id="csv">CSV exportieren</button>
    </form>
    <p class="muted small">Auslastung = reservierte Stunden ÷ reservierbare Stunden (Öffnungszeit ohne Sperrzeiten), FA-29. Eine Reservation der ganzen Mehrzweckhalle belegt auch ihre Hallenteile.</p>
    <div class="kpis"><div><b>${U.fmtPct(q(res.total))}</b><span>Auslastung gesamt</span></div><div><b>${U.fmtH(res.total.reserviert)}</b><span>reservierte Std.</span></div><div><b>${sto.total.storniert}</b><span>Stornierungen</span></div><div><b>${sto.total.kurzfristig}</b><span>davon kurzfristig</span></div><div><b>${sto.total.neuVergeben}</b><span>über Warteliste neu vergeben</span></div></div>
  </section>
  <div class="two">
    <section class="card"><h2>Je Anlage</h2>${tbl(['Anlage', 'Sportart', 'reservierbar (Std.)', 'reserviert (Std.)', 'Auslastung'], tabAnl, 4)}</section>
    <div><section class="card"><h2>Je Sportart</h2>${tbl(['Sportart', 'reservierbar', 'reserviert', 'Auslastung'], tabSp, 3)}</section>
      <section class="card"><h2>Je Kundengruppe</h2>${tbl(['Kundengruppe', 'reserviert (Std.)', 'Anteil an reservierbarer Zeit'], tabGr, 2)}</section>
      <section class="card"><h2>Stornierungen (FA-30)</h2>${tbl(['Kundengruppe', 'Reservationen', 'Stornierungen', 'davon kurzfristig', 'neu vergeben (Warteliste)'], tabSt.concat([['Total', sto.total.reservationen, sto.total.storniert, sto.total.kurzfristig, sto.total.neuVergeben]]))}</section></div>
    <section class="card"><h2>Je Wochentag</h2>${tbl(['Wochentag', 'reservierbar', 'reserviert', 'Auslastung'], tabWt, 3)}</section>
    <section class="card"><h2>Je Stunde</h2>${tbl(['Zeitband', 'reservierbar', 'reserviert', 'Auslastung'], tabH, 3)}</section>
  </div>`;
  UI.$('#af', main).onsubmit = e => {
    e.preventDefault();
    const d = UI.form(e.target);
    if (!d.von || !d.bis || d.bis < d.von) { UI.toast('Zeitraum ungültig.', 'err'); return; }
    st.aVon = d.von; st.aBis = d.bis; st.aSport = d.sport; st.aAnlage = d.anlage; UI.render();
  };
  UI.$('#csv', main).onclick = () => U.download(`arenaone-auswertung_${st.aVon}_${st.aBis}.csv`, U.csv(st._csv));
};

/* ---------- Administration (FA-32, FA-33, FA-34, QA-11, QA-12, QA-16) ---------- */
V.admin = (main, db, user) => {
  const tab = UI.st.adminTab || 'anlagen';
  const tabs = [['anlagen', 'Anlagen'], ['benutzer', 'Benutzer und Rollen'], ['uebernahme', 'Übernahme alter Listen'], ['auskunft', 'Datenauskunft'], ['datenschutz', 'Löschlauf und Sicherung']];
  let body = '';
  if (tab === 'anlagen') {
    body = `<div class="head-row"><h2>Anlagen und Öffnungszeiten</h2><button class="btn primary" id="aneu">+ Anlage</button></div>
      <table class="tbl resp"><thead><tr><th>Bezeichnung</th><th>Sportart</th><th>Teil von</th><th>Öffnungszeiten</th><th>Status</th><th></th></tr></thead><tbody>
      ${db.anlagen.map(a => `<tr><td data-l="Anlage">${U.esc(a.name)}</td><td data-l="Sportart">${a.sportart}</td><td data-l="Teil von">${a.parentId ? U.esc(L.anlage(db, a.parentId).name) : ''}</td>
        <td data-l="Öffnung" class="small">${[1, 2, 3, 4, 5, 6, 0].map(w => { const o = a.oeffnung[w]; return `${U.WT[w]} ${o && o[0] ? o[0] + '–' + o[1] : 'zu'}`; }).join(' · ')}</td>
        <td data-l="Status">${a.aktiv ? UI.statusTag('aktiv', 'ok') : UI.statusTag('deaktiviert', 'err')}</td><td><button class="btn small ghost" data-a="${a.id}">Bearbeiten</button></td></tr>`).join('')}</tbody></table>`;
  } else if (tab === 'benutzer') {
    body = `<div class="head-row"><h2>Benutzer und Rollen</h2><button class="btn primary" id="uneu">+ Benutzer</button></div>
      <table class="tbl resp"><thead><tr><th>Name</th><th>Login</th><th>Rollen</th><th>Kundenkonten</th><th>Status</th><th></th></tr></thead><tbody>
      ${db.users.map(u => `<tr><td data-l="Name">${U.esc(u.name)}</td><td data-l="Login">${U.esc(u.login)}</td><td data-l="Rollen">${u.rollen.map(r => `<span class="tag">${ROLLEN[r]}</span>`).join(' ') || '<span class="muted">keine</span>'}</td>
        <td data-l="Konten" class="small">${u.kundeIds.map(id => U.esc(L.kundeKurz(L.kunde(db, id)))).join(', ')}</td><td data-l="Status">${u.aktiv !== false ? 'aktiv' : 'gesperrt'}</td><td><button class="btn small ghost" data-u="${u.id}">Bearbeiten</button></td></tr>`).join('')}</tbody></table>`;
  } else if (tab === 'uebernahme') {
    const bsp = `${L.IMPORT_KOPF}\n# E = Einzelreservation, S = Serie (wöchentlich am Wochentag des ersten Datums)\nE;Tennisplatz 1;${U.addDays(U.today(), 5)};;10:00;11:00;Ruth Ammann;;Privat;;044 123 45 67\nE;Padelplatz 1;${U.addDays(U.today(), 6)};;12:00;13:30;Anna Muster;;Privat;anna.muster@example.ch;\nS;Mehrzweckhalle 2;${U.addDays(U.today(), 8)};${U.addDays(U.today(), 8 + 7 * 12)};18:00;20:00;Karin Roth;Volleyball Riesbach;Verein;info@vbc-riesbach.example.ch;\nS;Tennisplatz 2;${(() => { let d = U.addDays(U.today(), 1); while (U.weekday(d) !== 2) d = U.addDays(d, 1); return d; })()};${U.addDays(U.today(), 60)};19:00;20:00;Peter Graf;TC Seefeld;Verein;;`;
    body = `<h2>Bestehende Reservationen übernehmen (FA-34)</h2>
      <p class="muted">Liste aus Excel als CSV (Semikolon) einfügen. Zuerst Probelauf: Konflikte zwischen den alten Listen und mit bereits erfassten Reservationen werden als Liste ausgegeben statt überschrieben.</p>
      <textarea id="imp" rows="9" class="mono">${U.esc(bsp)}</textarea>
      <div class="btns"><button class="btn" id="probe">Probelauf</button><button class="btn primary" id="import">Übernehmen</button></div><div id="impres"></div>`;
  } else if (tab === 'auskunft') {
    body = `<h2>Auskunft und Datenherausgabe (QA-12)</h2>
      <p class="muted">Gibt alle zu einer Person gespeicherten Daten aus – ohne Daten anderer Personen.</p>
      <div class="row"><label>Kundenkonto <select id="ak">${UI.kundenOpts(db, db.kunden.slice().sort((a, b) => L.kundeName(a).localeCompare(L.kundeName(b))))}</select></label></div>
      <div class="btns"><button class="btn" id="akjson">JSON herunterladen</button><button class="btn" id="akcsv">CSV herunterladen</button></div>`;
  } else {
    body = `<h2>Löschung inaktiver Konten (QA-11)</h2>
      <p>Konten ohne Reservation in den letzten ${db.params.aufbewahrungMonate} Monaten (PA-07) werden gelöscht, ihre Reservationen anonymisiert (bleiben in Auswertungen). Der Lauf startet automatisch einmal täglich beim ersten Aufruf der App («nächtlicher Lauf»). Letzter Lauf: ${U.fmtDate(db.meta.letzterLoeschlauf)}.</p>
      <p>Aktuell betroffen: ${(() => { const g = U.addMonths(U.today(), -db.params.aufbewahrungMonate); return db.kunden.filter(k => { const l = db.reservationen.filter(r => r.kundeId === k.id).reduce((m, r) => U.datePart(r.ende) > m ? U.datePart(r.ende) : m, k.erstellt || ''); return l < g; }).map(k => U.esc(L.kundeName(k))).join(', ') || 'niemand'; })()}</p>
      <button class="btn danger" id="lauf">Löschlauf jetzt ausführen</button>
      <h2>Datensicherung (QA-16)</h2>
      <p class="muted">In dieser Browser-Demo liegt alles im lokalen Speicher. Sicherung als Datei herunterladen und bei Bedarf wiederherstellen.</p>
      <div class="btns"><button class="btn" id="backup">Sicherung herunterladen</button><label class="btn ghost">Sicherung wiederherstellen <input type="file" id="restore" accept="application/json" hidden></label></div>
      <h2>Demo</h2><button class="btn danger" id="reset">Demo-Daten neu erzeugen</button>`;
  }
  main.innerHTML = `<section class="card"><h1>Administration</h1><div class="seg tabs">${tabs.map(([k, t]) => `<button data-tab="${k}" class="${k === tab ? 'on' : ''}">${t}</button>`).join('')}</div></section><section class="card">${body}</section>`;
  UI.$$('[data-tab]', main).forEach(b => b.onclick = () => { UI.st.adminTab = b.dataset.tab; UI.render(); });

  if (tab === 'anlagen') {
    UI.$('#aneu', main).onclick = () => V.anlageDialog(null);
    UI.$$('[data-a]', main).forEach(b => b.onclick = () => V.anlageDialog(b.dataset.a));
  }
  if (tab === 'benutzer') {
    UI.$('#uneu', main).onclick = () => V.userDialog(null);
    UI.$$('[data-u]', main).forEach(b => b.onclick = () => V.userDialog(b.dataset.u));
  }
  if (tab === 'uebernahme') {
    const zeig = (r, probe) => {
      UI.$('#impres', main).innerHTML = `<div class="alert ${r.konflikte.length || r.fehler.length ? 'warn' : 'ok'}"><b>${probe ? 'Probelauf' : 'Übernommen'}:</b> ${r.reservationen} Einzelreservationen, ${r.serien} Serien mit ${r.termine} Terminen, ${r.neueKunden} neue Kundenkonten, ${r.konflikte.length} Konflikte, ${r.fehler.length} fehlerhafte Zeilen.</div>
        ${r.konflikte.length ? `<h3>Konflikte (nicht übernommen)</h3><table class="tbl small"><thead><tr><th>Zeile</th><th>Eintrag</th><th>Kollision</th></tr></thead><tbody>${r.konflikte.map(k => `<tr><td>${k.zeile}</td><td class="mono">${U.esc(k.eintrag)}</td><td>${U.esc(k.grund)}</td></tr>`).join('')}</tbody></table><button class="btn small" id="kcsv">Konfliktliste als CSV</button>` : ''}
        ${r.fehler.length ? `<h3>Fehlerhafte Zeilen</h3><ul class="small">${r.fehler.map(k => `<li>Zeile ${k.zeile}: ${U.esc(k.grund)} <code>${U.esc(k.eintrag)}</code></li>`).join('')}</ul>` : ''}`;
      const kc = UI.$('#kcsv', main);
      if (kc) kc.onclick = () => U.download('uebernahme-konflikte.csv', U.csv([['Zeile', 'Eintrag', 'Kollision'], ...r.konflikte.map(k => [k.zeile, k.eintrag, k.grund])]));
    };
    UI.$('#probe', main).onclick = () => {
      try { const d = Store.get(); const clone = JSON.parse(JSON.stringify(d)); zeig(L.importieren(clone, UI.ctx(d), UI.$('#imp', main).value), true); }
      catch (e) { UI.fehler(e); }
    };
    UI.$('#import', main).onclick = () => {
      const text = UI.$('#imp', main).value;
      const r = UI.run((d, ctx) => L.importieren(d, ctx, text), { render: false });
      if (r.ok) { zeig(r.r, false); UI.toast('Übernahme abgeschlossen.'); }
    };
  }
  if (tab === 'auskunft') {
    const hol = () => UI.run((d, ctx) => L.datenauskunft(d, ctx, UI.$('#ak', main).value), { render: false });
    UI.$('#akjson', main).onclick = () => { const r = hol(); if (r.ok) U.download(`datenauskunft-${r.r.stammdaten.name.replace(/\s+/g, '_')}.json`, JSON.stringify(r.r, null, 2), 'application/json'); };
    UI.$('#akcsv', main).onclick = () => {
      const r = hol(); if (!r.ok) return;
      const a = r.r;
      const rows = [['Datenauskunft ArenaOne', a.erstellt], [], ['Stammdaten'], ...Object.entries(a.stammdaten).map(([k, v]) => [k, v]), [],
        ['Benutzerkonten'], ['Name', 'Benutzername', 'Rollen'], ...a.benutzerkonten.map(u => [u.name, u.benutzername, u.rollen.join(', ')]), [],
        ['Reservationen'], ['Anlage', 'Beginn', 'Ende', 'Status', 'Kanal', 'Serie', 'kurzfristig storniert'], ...a.reservationen.map(x => [x.anlage, x.beginn, x.ende, x.status, x.kanal, x.serie ? 'ja' : 'nein', x.kurzfristigStorniert ? 'ja' : 'nein']), [],
        ['Serien'], ['Anlage', 'Wochentag', 'Beginn', 'Dauer', 'von', 'bis', 'Status'], ...a.serien.map(s => [s.anlage, s.wochentag, s.beginn, s.dauerMin, s.von, s.bis, s.status]), [],
        ['Warteliste'], ['Anlage', 'Beginn', 'Ende', 'Status'], ...a.warteliste.map(w => [w.anlage, w.beginn, w.ende, w.status]), [],
        ['Nachrichten'], ['Zeit', 'Kanal', 'An', 'Betreff', 'Text'], ...a.nachrichten.map(n => [n.zeit, n.kanal, n.an, n.betreff, n.text])];
      U.download(`datenauskunft-${a.stammdaten.name.replace(/\s+/g, '_')}.csv`, U.csv(rows));
    };
  }
  if (tab === 'datenschutz') {
    UI.$('#lauf', main).onclick = () => UI.run((d, ctx) => L.loeschlauf(d, ctx), { ok: n => `Löschlauf ausgeführt: ${n} Konto/Konten gelöscht.` });
    UI.$('#backup', main).onclick = () => {
      Store.tx(d => L.log(d, UI.ctx(d), 'Datensicherung erstellt', 'system', '', '', ''));
      U.download(`arenaone-sicherung-${U.today()}.json`, JSON.stringify(Store.get()), 'application/json');
    };
    UI.$('#restore', main).onchange = e => {
      const file = e.target.files[0]; if (!file) return;
      const rd = new FileReader();
      rd.onload = () => {
        try {
          const d = JSON.parse(rd.result);
          if (d.version !== 1 || !Array.isArray(d.reservationen)) throw new Error('Keine gültige ArenaOne-Sicherung.');
          L.log(d, { user }, 'Datensicherung wiederhergestellt', 'system', '', '', file.name);
          Store.write(d); UI.toast('Sicherung wiederhergestellt.'); UI.render();
        } catch (err) { UI.fehler(err); }
      };
      rd.readAsText(file);
    };
    UI.$('#reset', main).onclick = () => UI.modal({
      title: 'Demo-Daten neu erzeugen', body: '<p>Alle Daten werden ersetzt.</p>',
      buttons: [{ label: 'Abbrechen', cls: 'ghost' }, { label: 'Neu erzeugen', cls: 'danger', onClick: () => { Store.reset(); Session.clear(); UI.toast('Demo-Daten neu erzeugt. Bitte neu anmelden.'); setTimeout(() => UI.go('login'), 0); } }],
    });
  }
};

V.anlageDialog = id => {
  const db = Store.get();
  const a = id ? L.anlage(db, id) : { name: '', sportart: 'Badminton', parentId: null, aktiv: true, oeffnung: Seed.oeffnung() };
  const hallen = db.anlagen.filter(x => x.sportart === 'Mehrzweckhalle' && !x.parentId && x.id !== id);
  UI.modal({
    title: id ? 'Anlage bearbeiten' : 'Neue Anlage', wide: true,
    body: `<div class="row"><label>Bezeichnung <input name="name" value="${U.esc(a.name)}" required></label>
        <label>Sportart <select name="sportart">${UI.opts(SPORTARTEN.map(s => [s, s]), a.sportart)}</select></label>
        <label>Hallenteil von <select name="parentId">${UI.opts(hallen.map(h => [h.id, h.name]), a.parentId, '– keine (eigenständig) –')}</select></label></div>
      <fieldset><legend>Reservierbare Zeiten (leer = geschlossen)</legend><div class="oeff">
      ${[1, 2, 3, 4, 5, 6, 0].map(w => { const o = a.oeffnung[w] || []; return `<label>${U.WT_LANG[w]}</label><input type="time" name="v${w}" value="${o[0] || ''}" step="1800"><input type="time" name="b${w}" value="${o[1] || ''}" step="1800">`; }).join('')}</div></fieldset>
      <label class="check"><input type="checkbox" name="aktiv" ${a.aktiv ? 'checked' : ''}> aktiv (reservierbar). Deaktivierte Anlagen erscheinen nicht mehr in der Verfügbarkeit; bestehende Reservationen bleiben in der Gesamtübersicht sichtbar.</label>`,
    buttons: [{ label: 'Abbrechen', cls: 'ghost' }, {
      label: 'Speichern', cls: 'primary', onClick: dlg => {
        const f = UI.form(dlg.querySelector('form'));
        const oeffnung = {};
        [0, 1, 2, 3, 4, 5, 6].forEach(w => { oeffnung[w] = f['v' + w] && f['b' + w] ? [f['v' + w], f['b' + w]] : null; });
        return UI.run((d, ctx) => L.anlageSpeichern(d, ctx, { id, name: f.name, sportart: f.sportart, parentId: f.parentId, aktiv: f.aktiv, oeffnung }), { ok: 'Anlage gespeichert.' }).ok ? undefined : false;
      },
    }],
  });
};

V.userDialog = id => {
  const db = Store.get();
  const u = id ? L.user(db, id) : { name: '', login: '', rollen: ['kunde'], kundeIds: [], aktiv: true };
  UI.modal({
    title: id ? 'Benutzer bearbeiten' : 'Neuer Benutzer', wide: true,
    body: `<div class="row"><label>Name <input name="name" value="${U.esc(u.name)}"></label><label>Benutzername <input name="login" value="${U.esc(u.login)}"></label>
      <label>${id ? 'Neues Passwort (leer = unverändert)' : 'Passwort'} <input type="password" name="passwort" autocomplete="new-password"></label></div>
      <fieldset><legend>Rollen (QA-13)</legend><div class="checks">${Object.entries(ROLLEN).map(([k, t]) => `<label class="check"><input type="checkbox" name="rollen" data-multi value="${k}" ${u.rollen.includes(k) ? 'checked' : ''}> ${t}</label>`).join('')}</div>
      <p class="muted small">Mitarbeiterrollen (Empfang, Geschäftsleitung, Administration, Betrieb) verlangen ein Passwort mit mindestens 12 Zeichen und einen zweiten Faktor bei der Anmeldung.</p></fieldset>
      <label>Zugeordnete Kundenkonten (für Kundin, Vereins-/Firmenkontakt, Trainer) <select name="kundeIds" multiple size="6">${UI.opts(db.kunden.map(k => [k.id, L.kundeName(k)]), null)}</select></label>
      <label class="check"><input type="checkbox" name="aktiv" ${u.aktiv !== false ? 'checked' : ''}> Konto aktiv</label>`,
    onOpen: dlg => { const s = UI.$('[name=kundeIds]', dlg); [...s.options].forEach(o => { o.selected = u.kundeIds.includes(o.value); }); },
    buttons: [{ label: 'Abbrechen', cls: 'ghost' }, {
      label: 'Speichern', cls: 'primary', onClick: dlg => {
        const f = UI.form(dlg.querySelector('form'));
        f.id = id; f.rollen = f.rollen || [];
        return UI.run((d, ctx) => L.userSpeichern(d, ctx, f), { ok: 'Benutzer gespeichert. Rollenänderungen gelten ab dem nächsten Seitenaufruf.' }).ok ? undefined : false;
      },
    }],
  });
};

/* ---------- Gesamtprotokoll (QA-15) ---------- */
V.protokoll = (main, db) => {
  const q = (UI.st.pSuche || '').toLowerCase();
  const list = db.protokoll.slice().reverse().filter(p => !q || [p.aktion, p.userName, p.details, p.kanal].join(' ').toLowerCase().includes(q)).slice(0, 400);
  main.innerHTML = `<section class="card"><h1>Protokoll</h1><p class="muted small">Wer hat wann über welchen Kanal was ausgelöst (QA-15). Einträge lassen sich nicht ändern. Angezeigt: neueste 400.</p>
    <input type="search" id="psuche" placeholder="Filtern…" value="${U.esc(UI.st.pSuche || '')}">
    <div class="tl-wrap"><table class="tbl small"><thead><tr><th>Zeitpunkt</th><th>Aktion</th><th>Benutzer</th><th>Kanal</th><th>Details</th></tr></thead><tbody>
    ${list.map(p => `<tr><td class="nowrap">${U.fmtTs(p.zeit)}</td><td>${p.objektTyp === 'reservation' && p.objektId ? `<a href="#" data-res="${p.objektId}">${U.esc(p.aktion)}</a>` : U.esc(p.aktion)}</td><td>${U.esc(p.userName)}</td><td>${U.esc(p.kanal)}</td><td>${U.esc(p.details)}</td></tr>`).join('')}</tbody></table></div></section>`;
  const s = UI.$('#psuche', main);
  s.oninput = () => { UI.st.pSuche = s.value; clearTimeout(UI._pt); UI._pt = setTimeout(() => { UI.render(); const n = UI.$('#psuche'); n.focus(); n.setSelectionRange(n.value.length, n.value.length); }, 300); };
  UI.$$('[data-res]', main).forEach(a => a.onclick = e => { e.preventDefault(); V.resDetail(a.dataset.res); });
};
