'use strict';
/* UI-Grundgerüst: Router, Navigation, Dialoge, Meldungen, Aktionen */
const UI = { st: {}, dialogOpen: false, pendingRender: false };
const V = {}; // Ansichten (views.js)

UI.$ = (sel, root = document) => root.querySelector(sel);
UI.$$ = (sel, root = document) => [...root.querySelectorAll(sel)];
UI.opts = (list, sel, ph) => (ph != null ? `<option value="">${U.esc(ph)}</option>` : '') +
  list.map(([v, t, dis]) => `<option value="${U.esc(v)}"${String(v) === String(sel) ? ' selected' : ''}${dis ? ' disabled' : ''}>${U.esc(t)}</option>`).join('');
UI.form = f => {
  const o = {};
  [...f.elements].forEach(el => {
    if (!el.name) return;
    if (el.type === 'checkbox') {
      if (el.dataset.multi != null) { (o[el.name] = o[el.name] || []); if (el.checked) o[el.name].push(el.value); }
      else o[el.name] = el.checked;
    } else if (el.type === 'radio') { if (el.checked) o[el.name] = el.value; }
    else if (el.multiple) o[el.name] = [...el.selectedOptions].map(x => x.value);
    else o[el.name] = el.value;
  });
  return o;
};

UI.toast = (msg, type = 'ok', ms = 4500) => {
  const t = document.createElement('div');
  t.className = 'toast ' + type;
  t.setAttribute('role', type === 'err' ? 'alert' : 'status');
  t.innerHTML = msg;
  const box = UI.$('#toasts');
  while (box.children.length >= 3) box.firstChild.remove();
  box.appendChild(t);
  setTimeout(() => t.classList.add('out'), ms);
  setTimeout(() => t.remove(), ms + 400);
};

/* Dialog. buttons: [{label, cls, onClick(dlg) -> false hält den Dialog offen}] */
UI.modal = ({ title, body, buttons = [], onOpen, wide }) => {
  const dlg = UI.$('#dlg');
  dlg.className = wide ? 'wide' : '';
  dlg.innerHTML = `<form method="dialog" class="dlg-inner" novalidate>
      <header><h2>${U.esc(title)}</h2><button type="button" class="icon-btn" data-close aria-label="Schliessen">✕</button></header>
      <div class="dlg-body">${body}</div>
      <footer>${buttons.map((b, i) => `<button type="button" class="btn ${b.cls || ''}" data-btn="${i}">${U.esc(b.label)}</button>`).join('')}</footer>
    </form>`;
  const close = () => { if (dlg.open) dlg.close(); };
  UI.$$('[data-btn]', dlg).forEach(el => el.addEventListener('click', () => {
    const b = buttons[Number(el.dataset.btn)];
    if (!b.onClick || b.onClick(dlg) !== false) close();
  }));
  UI.$('[data-close]', dlg).addEventListener('click', close);
  dlg.querySelector('form').addEventListener('submit', e => e.preventDefault());
  UI.dialogOpen = true;
  if (!dlg.open) dlg.showModal();
  if (onOpen) onOpen(dlg);
  return close;
};
UI.closeModal = () => { const d = UI.$('#dlg'); if (d.open) d.close(); };

UI.fehlerHtml = e => {
  let h = `<p class="err-msg">${U.esc(e.message)}</p>`;
  if (e.konflikte && e.konflikte.length) h += `<p><b>Kollision mit:</b></p><ul>${e.konflikte.map(k => `<li>${U.esc(k)}</li>`).join('')}</ul>`;
  return h;
};
UI.fehler = e => {
  console.warn(e);
  UI.toast(U.esc(e.message), 'err', 7000);
};

UI.ctx = db => ({ user: Session.user(db) });
/* Führt eine ändernde Aktion in einer Transaktion aus. Wirft nicht; gibt {ok, r, e} zurück. */
UI.run = (fn, opt = {}) => {
  try {
    const r = Store.tx(db => fn(db, UI.ctx(db)));
    if (opt.ok) UI.toast(typeof opt.ok === 'function' ? opt.ok(r) : opt.ok, 'ok');
    if (opt.render !== false) UI.render();
    return { ok: true, r };
  } catch (e) {
    if (!opt.silent) UI.fehler(e);
    return { ok: false, e };
  }
};

/* ---------- Routing ---------- */
UI.ROUTES = [
  { id: 'verfuegbarkeit', titel: 'Verfügbarkeit', perm: 'verfuegbarkeit', nav: true },
  { id: 'meine', titel: 'Meine Reservationen', perm: 'eigene', nav: true },
  { id: 'belegung', titel: 'Gesamtbelegung', perm: 'belegung', nav: true },
  { id: 'serien', titel: 'Serien', perm: ['serieBeantragen', 'serieBestaetigen'], nav: true },
  { id: 'kunden', titel: 'Kunden', perm: 'kundenVerwalten', nav: true },
  { id: 'sperrzeiten', titel: 'Sperrzeiten', perm: 'sperren', nav: true },
  { id: 'regeln', titel: 'Regeln', perm: 'regeln', nav: true },
  { id: 'auswertung', titel: 'Auswertungen', perm: 'auswertung', nav: true },
  { id: 'admin', titel: 'Administration', perm: 'admin', nav: true },
  { id: 'protokoll', titel: 'Protokoll', perm: 'protokoll', nav: true },
  { id: 'nachrichten', titel: 'Nachrichten', perm: 'angemeldet', nav: true },
  { id: 'druck', titel: 'Druckliste', perm: 'belegung' },
  { id: 'login', titel: 'Anmelden', perm: 'offen' },
  { id: 'registrieren', titel: 'Registrieren', perm: 'offen' },
  { id: 'hilfe', titel: 'Hilfe', perm: 'offen' },
];
UI.darf = (user, route) => {
  if (route.perm === 'offen') return true;
  if (route.perm === 'angemeldet') return !!user && (can(user, 'eigene') || can(user, 'nachrichtenAlle'));
  const ps = Array.isArray(route.perm) ? route.perm : [route.perm];
  return ps.some(p => can(user, p));
};
UI.startRoute = user => {
  if (!user) return 'verfuegbarkeit';
  if (can(user, 'imAuftrag')) return can(user, 'auswertung') && !(user.rollen || []).includes('empfang') ? 'auswertung' : 'belegung';
  if (can(user, 'eigene')) return 'verfuegbarkeit';
  if (can(user, 'admin')) return 'admin';
  if (can(user, 'sperren')) return 'sperrzeiten';
  return 'nachrichten';
};
UI.parseHash = () => {
  const h = location.hash.replace(/^#\/?/, '');
  const [path, q] = h.split('?');
  const params = {};
  (q || '').split('&').filter(Boolean).forEach(kv => { const [k, v] = kv.split('='); params[decodeURIComponent(k)] = decodeURIComponent(v || ''); });
  return { path: path || '', params };
};
UI.go = (path, params) => {
  const q = params ? '?' + Object.entries(params).map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join('&') : '';
  const target = '#/' + path + q;
  if (location.hash === target) UI.render(); else location.hash = target;
};

UI.renderNav = (db, user) => {
  const cur = UI.parseHash().path;
  const items = UI.ROUTES.filter(r => r.nav && UI.darf(user, r));
  let badge = '';
  const offene = db.serien.filter(s => s.status === 'beantragt').length;
  UI.$('#nav').innerHTML = items.map(r => {
    badge = r.id === 'serien' && can(user, 'serieBestaetigen') && offene ? ` <span class="badge">${offene}</span>` : '';
    if (r.id === 'meine' && user) {
      const ang = db.warteliste.filter(w => w.status === 'angeboten' && w.angebotBis > U.now() && user.kundeIds.includes(w.kundeId)).length;
      if (ang) badge = ` <span class="badge">${ang}</span>`;
    }
    return `<a href="#/${r.id}" class="${cur === r.id ? 'active' : ''}">${U.esc(r.titel)}${badge}</a>`;
  }).join('') + `<a href="#/hilfe" class="${cur === 'hilfe' ? 'active' : ''}">Hilfe</a>`;
  UI.$('#userbox').innerHTML = user
    ? `<span class="who" title="${U.esc(user.rollen.map(r => ROLLEN[r]).join(', '))}">${U.esc(user.name)}<small>${U.esc(user.rollen.map(r => ROLLEN[r]).join(', '))}</small></span><button class="btn small ghost" id="logout">Abmelden</button>`
    : `<a class="btn small" href="#/login">Anmelden</a> <a class="btn small ghost" href="#/registrieren">Registrieren</a>`;
  const lo = UI.$('#logout');
  if (lo) lo.onclick = () => {
    Store.tx(d => L.log(d, { user: Session.user(d) }, 'Abmeldung', 'user', user.id, '', ''));
    Session.clear(); UI.toast('Sie sind abgemeldet.'); UI.go('verfuegbarkeit');
  };
};

UI.render = () => {
  if (UI.dialogOpen) { UI.pendingRender = true; return; }
  UI.pendingRender = false;
  let db = Store.get();
  if (L.tick(db)) Store.write(db);
  const user = Session.user(db);
  if (Session.get() && !user) Session.clear();
  const { path, params } = UI.parseHash();
  let route = UI.ROUTES.find(r => r.id === path);
  if (!route) { location.replace('#/' + UI.startRoute(user)); return; }
  UI.renderNav(db, user);
  document.body.classList.toggle('nav-open', false);
  const main = UI.$('#main');
  if (!UI.darf(user, route)) {
    if (!user) { UI.go('login', { weiter: path }); return; }
    main.innerHTML = `<section class="card"><h1>Keine Berechtigung</h1><p>Ihre Rolle (${U.esc(user.rollen.map(r => ROLLEN[r]).join(', ') || 'keine')}) darf diese Funktion nicht verwenden (QA-13).</p><a class="btn" href="#/${UI.startRoute(user)}">Zur Startseite</a></section>`;
    return;
  }
  document.title = `${route.titel} – ArenaOne`;
  try { V[route.id](main, db, user, params); }
  catch (e) { console.error(e); main.innerHTML = `<section class="card"><h1>Fehler</h1><pre>${U.esc(e.stack || e.message)}</pre></section>`; }
};

UI.init = () => {
  const dlg = UI.$('#dlg');
  dlg.addEventListener('close', () => { UI.dialogOpen = false; dlg.innerHTML = ''; if (UI.pendingRender) UI.render(); });
  window.addEventListener('hashchange', UI.render);
  // FA-03 / QA-09: Änderungen aus anderen Sitzungen (Tabs) sofort übernehmen
  window.addEventListener('storage', e => { if (e.key === Store.KEY) UI.render(); });
  UI.$('#menu-btn').addEventListener('click', () => document.body.classList.toggle('nav-open'));
  setInterval(() => { const db = Store.get(); if (L.tick(db)) { Store.write(db); UI.render(); } }, 20000);
  if (!Store.available) UI.toast('Der Browser-Speicher ist blockiert. Daten gehen beim Neuladen verloren.', 'err', 9000);
  UI.render();
};

/* ---------- gemeinsame Bausteine ---------- */
UI.anlagenOpts = (db, sel, opt = {}) => {
  const list = db.anlagen.filter(a => (a.aktiv || opt.inaktiv) && (!opt.sportart || a.sportart === opt.sportart));
  return SPORTARTEN.map(sp => {
    const xs = list.filter(a => a.sportart === sp);
    return xs.length ? `<optgroup label="${sp}">${xs.map(a => `<option value="${a.id}"${a.id === sel ? ' selected' : ''}>${U.esc(a.name)}${a.aktiv ? '' : ' (deaktiviert)'}</option>`).join('')}</optgroup>` : '';
  }).join('');
};
UI.dauerOpts = (db, max, sel) => {
  const p = db.params, out = [];
  for (let m = p.minDauer; m <= Math.max(max, p.minDauer); m += p.raster) out.push([m, `${m} Min.${m % 60 === 0 ? ' (' + m / 60 + ' h)' : ''}`]);
  return UI.opts(out, sel || p.minDauer);
};
UI.zeitOpts = (db, anlageId, dateS, sel, dauer, pruef) => {
  const a = L.anlage(db, anlageId);
  const o = a && L.oeffnung(a, dateS);
  if (!o) return '<option value="">geschlossen</option>';
  const out = [];
  for (let m = U.toMin(o.von); m + (dauer || db.params.minDauer) <= U.toMin(o.bis); m += db.params.raster) {
    const t = U.fromMin(m);
    const info = pruef ? pruef(dateS + 'T' + t) : '';
    out.push([t, t + (info ? ' – ' + info : '')]);
  }
  return UI.opts(out, sel);
};
UI.kanalBadge = k => `<span class="tag kanal">${U.esc(KANAL[k] || k)}</span>`;
UI.statusTag = (txt, cls) => `<span class="tag ${cls || ''}">${U.esc(txt)}</span>`;
UI.kundenOpts = (db, kunden, sel) => UI.opts(kunden.map(k => [k.id, `${L.kundeName(k)} – ${L.gruppeName(db, k.gruppeId)}${k.email ? '' : ' – keine E-Mail'}`]), sel);
UI.emailHinweis = ohneEmail => ohneEmail ? '<br><b>Hinweis: keine E-Mail hinterlegt</b> – Bestätigung bitte mündlich geben.' : '<br>Bestätigung per E-Mail versandt.';
