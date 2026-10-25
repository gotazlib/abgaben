'use strict';
/* Hilfsfunktionen: Datum/Zeit (lokale Zeit als "YYYY-MM-DDTHH:MM"), HTML, CSV, Download */
const U = {};

U.pad = n => String(n).padStart(2, '0');
U.dateStr = d => `${d.getFullYear()}-${U.pad(d.getMonth() + 1)}-${U.pad(d.getDate())}`;
U.timeStr = d => `${U.pad(d.getHours())}:${U.pad(d.getMinutes())}`;
U.dt = d => U.dateStr(d) + 'T' + U.timeStr(d);
U.parse = s => {
  const [d, t = '00:00'] = String(s).split('T');
  const [y, m, dd] = d.split('-').map(Number);
  const [h, mi] = t.split(':').map(Number);
  return new Date(y, m - 1, dd, h || 0, mi || 0);
};
U.addMin = (s, min) => U.dt(new Date(U.parse(s).getTime() + min * 60000));
U.addDays = (dateS, n) => { const d = U.parse(dateS); d.setDate(d.getDate() + n); return U.dateStr(d); };
U.addMonths = (dateS, n) => { const d = U.parse(dateS); d.setMonth(d.getMonth() + n); return U.dateStr(d); };
U.toMin = t => { const [h, m] = String(t).split(':').map(Number); return h * 60 + (m || 0); };
U.fromMin = m => U.pad(Math.floor(m / 60)) + ':' + U.pad(m % 60);
U.now = () => U.dt(new Date());
U.today = () => U.dateStr(new Date());
U.diffMin = (a, b) => Math.round((U.parse(b) - U.parse(a)) / 60000);
U.overlap = (s1, e1, s2, e2) => s1 < e2 && s2 < e1;
U.weekday = dateS => U.parse(dateS).getDay(); // 0 = Sonntag
U.datePart = s => String(s).slice(0, 10);
U.timePart = s => String(s).slice(11, 16);
U.WT = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
U.WT_LANG = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
U.fmtDate = s => { const d = U.parse(s); return `${U.WT[d.getDay()]} ${U.pad(d.getDate())}.${U.pad(d.getMonth() + 1)}.${d.getFullYear()}`; };
U.fmtDT = s => `${U.fmtDate(s)}, ${U.timePart(s)}`;
U.fmtRange = (s, e) => U.datePart(s) === U.datePart(e)
  ? `${U.fmtDate(s)}, ${U.timePart(s)}–${U.timePart(e)}`
  : `${U.fmtDT(s)} – ${U.fmtDT(e)}`;
U.fmtTs = iso => { const d = new Date(iso); return `${U.pad(d.getDate())}.${U.pad(d.getMonth() + 1)}.${d.getFullYear()} ${U.pad(d.getHours())}:${U.pad(d.getMinutes())}:${U.pad(d.getSeconds())}`; };
U.fmtH = min => (Math.round(min / 6) / 10).toLocaleString('de-CH', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
U.fmtPct = x => isFinite(x) ? (Math.round(x * 1000) / 10).toLocaleString('de-CH', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + ' %' : '–';

U.esc = v => String(v == null ? '' : v)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

let _idc = 0;
U.id = p => `${p}-${Date.now().toString(36)}${(++_idc).toString(36)}${Math.random().toString(36).slice(2, 5)}`;

/* CSV mit Semikolon und BOM, damit Excel (Schweiz) die Datei direkt öffnet (FA-31). */
U.csv = rows => '﻿' + rows.map(r => r.map(c => {
  const s = String(c == null ? '' : c);
  return /[;"\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
}).join(';')).join('\r\n');

U.download = (name, content, mime = 'text/csv;charset=utf-8') => {
  const blob = new Blob([content], { type: mime });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = name;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
};

/* deterministischer Zufall für Demo-Daten */
U.rng = seed => () => { seed = (seed * 1664525 + 1013904223) % 4294967296; return seed / 4294967296; };
