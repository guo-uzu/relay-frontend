/* Relay design mockups: shared mock data + behaviour.
   Static prototype only. In the real app this logic lives in the backend
   (search/filter) and in TanStack Query/Table/Form (state + UI). */
(function (global) {
  'use strict';

  /* ---------- i18n (EN / ES) ---------- */
  const I18N = {
    en: {
      'nav.dashboard': 'Dashboard', 'nav.data': 'Data', 'nav.team': 'Team', 'nav.signOut': 'Sign out',
      'lang.label': 'Language',
      'auth.headline': 'Your spreadsheets, searchable by the whole team.',
      'auth.sub': 'Connect a Google Sheet, import it once, and find any row in seconds.',
      'auth.signIn': 'Sign in', 'auth.signUp': 'Create account', 'auth.email': 'Email', 'auth.password': 'Password',
      'auth.name': 'Full name', 'auth.noAccount': 'New to Relay?', 'auth.haveAccount': 'Already have an account?',
      'dash.today': 'Today', 'dash.summary': '{n} actions today',
      'dash.recent': 'Latest changes', 'dash.recentHint': 'The last 15 actions across your sheets',
      'dash.activity': 'Last 30 days', 'dash.actors': 'Most active this week', 'dash.freshness': 'Sheet freshness',
      'dash.checking': 'Checking every 30 s', 'dash.tz': 'Days follow your time zone ({tz})',
      'dash.stale': 'Stale', 'dash.fresh': 'Up to date', 'dash.never': 'Never imported',
      'dash.reimport': 'Re-import', 'dash.import': 'Import', 'dash.seats': '{used} of {max} seats used',
      'dash.sheets': 'Sheets', 'dash.rows': 'Rows', 'dash.week': 'Last 7 days', 'dash.members': 'Members',
      'dash.new': 'New', 'dash.col.row': 'Row', 'dash.col.who': 'Who', 'dash.col.action': 'Action',
      'dash.col.change': 'Change', 'dash.col.when': 'When', 'dash.col.source': 'Source',
      'source.sheet': 'Google Sheets', 'source.platform': 'Relay',
      'act.added': 'Added', 'act.edited': 'Edited', 'act.deleted': 'Deleted', 'act.imported': 'Imported', 'act.connected': 'Connected',
      'ev.edited': 'changed {column} in row {row}', 'ev.added': 'added row {row}', 'ev.deleted': 'deleted row {row}',
      'ev.imported': 'imported {n} rows from {sheet}', 'ev.connected': 'connected {sheet}',
      'sheets.rowsN': '{n} rows', 'sheets.importedAgo': 'Imported {t}',
      'table.search': 'Search and press Enter', 'table.all': 'Match all', 'table.any': 'Match any',
      'table.filters': 'Filters', 'table.addFilter': 'Add filter', 'table.column': 'Column', 'table.operator': 'Operator',
      'table.value': 'Value', 'table.rulesAll': 'All rules', 'table.rulesAny': 'Any rule', 'table.addRow': 'Add row',
      'table.range': '{from}–{to} of {n}', 'table.empty': 'No rows match these terms.',
      'table.clear': 'Clear search and filters', 'table.prev': 'Previous', 'table.next': 'Next',
      'table.removeTerm': 'Remove {term}', 'table.removeRule': 'Remove filter', 'table.searchLabel': 'Search terms',
      'op.contains': 'contains', 'op.equals': 'is', 'op.startsWith': 'starts with', 'op.gt': 'greater than',
      'op.lt': 'less than', 'op.isEmpty': 'is empty',
      'addrow.title': 'Add a row to {sheet}', 'addrow.hint': 'Fill in at least one column. The row is added to the end of the Google Sheet.',
      'addrow.submit': 'Add row', 'addrow.cancel': 'Cancel', 'addrow.error': 'Fill in at least one column.',
      'addrow.done': 'Row added to {sheet}',
      'team.title': 'Team', 'team.subtitle': 'Only admins can see this page.', 'team.invite': 'Invite member',
      'team.email': 'Email', 'team.role': 'Role', 'team.owner': 'Owner', 'team.admin': 'Admin', 'team.member': 'Member',
      'team.remove': 'Remove', 'team.pending': 'Pending invitations', 'team.cancel': 'Cancel invite',
      'team.send': 'Send invite', 'team.you': 'You', 'team.expires': 'Expires {t}', 'team.members': 'Members',
    },
    es: {
      'nav.dashboard': 'Panel', 'nav.data': 'Datos', 'nav.team': 'Equipo', 'nav.signOut': 'Cerrar sesión',
      'lang.label': 'Idioma',
      'auth.headline': 'Tus hojas de cálculo, con búsqueda para todo el equipo.',
      'auth.sub': 'Conecta una hoja de Google, impórtala una vez y encuentra cualquier fila en segundos.',
      'auth.signIn': 'Iniciar sesión', 'auth.signUp': 'Crear cuenta', 'auth.email': 'Correo electrónico', 'auth.password': 'Contraseña',
      'auth.name': 'Nombre completo', 'auth.noAccount': '¿Primera vez en Relay?', 'auth.haveAccount': '¿Ya tienes cuenta?',
      'dash.today': 'Hoy', 'dash.summary': '{n} acciones hoy',
      'dash.recent': 'Últimos cambios', 'dash.recentHint': 'Las últimas 15 acciones en tus hojas',
      'dash.activity': 'Últimos 30 días', 'dash.actors': 'Más activos esta semana', 'dash.freshness': 'Estado de las hojas',
      'dash.checking': 'Revisando cada 30 s', 'dash.tz': 'Los días siguen tu zona horaria ({tz})',
      'dash.stale': 'Desactualizada', 'dash.fresh': 'Al día', 'dash.never': 'Sin importar',
      'dash.reimport': 'Volver a importar', 'dash.import': 'Importar', 'dash.seats': '{used} de {max} lugares en uso',
      'dash.sheets': 'Hojas', 'dash.rows': 'Filas', 'dash.week': 'Últimos 7 días', 'dash.members': 'Miembros',
      'dash.new': 'Nuevo', 'dash.col.row': 'Fila', 'dash.col.who': 'Quién', 'dash.col.action': 'Acción',
      'dash.col.change': 'Cambio', 'dash.col.when': 'Cuándo', 'dash.col.source': 'Origen',
      'source.sheet': 'Google Sheets', 'source.platform': 'Relay',
      'act.added': 'Agregado', 'act.edited': 'Editado', 'act.deleted': 'Eliminado', 'act.imported': 'Importado', 'act.connected': 'Conectado',
      'ev.edited': 'cambió {column} en la fila {row}', 'ev.added': 'agregó la fila {row}', 'ev.deleted': 'eliminó la fila {row}',
      'ev.imported': 'importó {n} filas de {sheet}', 'ev.connected': 'conectó {sheet}',
      'sheets.rowsN': '{n} filas', 'sheets.importedAgo': 'Importada {t}',
      'table.search': 'Busca y presiona Enter', 'table.all': 'Todos los términos', 'table.any': 'Cualquier término',
      'table.filters': 'Filtros', 'table.addFilter': 'Agregar filtro', 'table.column': 'Columna', 'table.operator': 'Operador',
      'table.value': 'Valor', 'table.rulesAll': 'Todas las reglas', 'table.rulesAny': 'Cualquier regla', 'table.addRow': 'Agregar fila',
      'table.range': '{from}–{to} de {n}', 'table.empty': 'Ninguna fila coincide con estos términos.',
      'table.clear': 'Limpiar búsqueda y filtros', 'table.prev': 'Anterior', 'table.next': 'Siguiente',
      'table.removeTerm': 'Quitar {term}', 'table.removeRule': 'Quitar filtro', 'table.searchLabel': 'Términos de búsqueda',
      'op.contains': 'contiene', 'op.equals': 'es igual a', 'op.startsWith': 'empieza con', 'op.gt': 'mayor que',
      'op.lt': 'menor que', 'op.isEmpty': 'está vacío',
      'addrow.title': 'Agregar una fila a {sheet}', 'addrow.hint': 'Llena al menos una columna. La fila se agrega al final de la hoja de Google.',
      'addrow.submit': 'Agregar fila', 'addrow.cancel': 'Cancelar', 'addrow.error': 'Llena al menos una columna.',
      'addrow.done': 'Fila agregada a {sheet}',
      'team.title': 'Equipo', 'team.subtitle': 'Solo los administradores ven esta página.', 'team.invite': 'Invitar miembro',
      'team.email': 'Correo electrónico', 'team.role': 'Rol', 'team.owner': 'Propietario', 'team.admin': 'Administrador', 'team.member': 'Miembro',
      'team.remove': 'Quitar', 'team.pending': 'Invitaciones pendientes', 'team.cancel': 'Cancelar invitación',
      'team.send': 'Enviar invitación', 'team.you': 'Tú', 'team.expires': 'Vence {t}', 'team.members': 'Miembros',
    },
  };

  /* ---------- deterministic mock data ---------- */
  const MIN = 60e3, H = 36e5, D = 864e5;
  const NOW = Date.now();
  const ago = (ms) => new Date(NOW - ms).toISOString();
  function mulberry32(a) { return function () { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  const rnd = mulberry32(42);
  const pick = (a) => a[Math.floor(rnd() * a.length)];

  const headers = ['Cliente', 'Producto', 'Cantidad', 'Estado', 'Fecha', 'Notas'];
  const clients = ['Abarrotes Lupita', 'Café Tlalpan', 'Hotel Mirador', 'Taquería El Güero', 'Panadería La Espiga', 'Restaurante Maíz', 'Cocina Económica Rosa', 'Mercado San Ángel', 'Cafetería Ñandú', 'Tienda Don Beto'];
  const products = ['Harina de trigo 25 kg', 'Aceite vegetal 20 L', 'Azúcar estándar 50 kg', 'Frijol negro 10 kg', 'Café molido 1 kg', 'Tortillas de maíz 5 kg', 'Queso Oaxaca 2 kg', 'Chile guajillo 3 kg'];
  const notes = ['', '', 'Entregar en la mañana', 'Factura requerida', 'Cliente nuevo', 'Cobrar contra entrega', ''];
  const status = () => { const r = rnd(); return r < 0.4 ? 'pagado' : r < 0.7 ? 'pendiente' : r < 0.92 ? 'entregado' : 'cancelado'; };
  const rows = Array.from({ length: 48 }, (_, i) => [
    pick(clients), pick(products), String(pick([2, 4, 5, 6, 8, 10, 12, 20, 24, 40])), status(),
    '2026-10-' + String(1 + Math.floor((i * 26) / 48)).padStart(2, '0'), pick(notes),
  ]);

  const SHEET = 'Pedidos octubre';
  const ACTIONS = ['added', 'edited', 'deleted', 'imported', 'connected'];
  const events = [
    { m: 2, source: 'sheet', action: 'edited', actor: 'ana@distnorte.mx', row: 41, column: 'Estado', old: 'pendiente', new: 'pagado' },
    { m: 9, source: 'platform', action: 'added', actor: 'alex@distnorte.mx', row: 49, new: 'Café Tlalpan, Café molido 1 kg' },
    { m: 14, source: 'sheet', action: 'edited', actor: 'luis.m@distnorte.mx', row: 17, column: 'Cantidad', old: '10', new: '12' },
    { m: 31, source: 'sheet', action: 'added', actor: 'marta@distnorte.mx', row: 48, new: 'Hotel Mirador, Aceite vegetal 20 L' },
    { m: 47, source: 'platform', action: 'imported', actor: 'alex@distnorte.mx', sheetName: 'Inventario bodega', n: 612 },
    { m: 62, source: 'sheet', action: 'edited', actor: 'ana@distnorte.mx', row: 33, column: 'Notas', old: '', new: 'Factura requerida' },
    { m: 95, source: 'sheet', action: 'deleted', actor: 'luis.m@distnorte.mx', row: 22, old: 'Tienda Don Beto, Frijol negro 10 kg' },
    { m: 140, source: 'sheet', action: 'edited', actor: 'ana@distnorte.mx', row: 12, column: 'Estado', old: 'pendiente', new: 'entregado' },
    { m: 185, source: 'sheet', action: 'edited', actor: 'marta@distnorte.mx', row: 5, column: 'Fecha', old: '2026-10-03', new: '2026-10-04' },
    { m: 230, source: 'platform', action: 'connected', actor: 'alex@distnorte.mx', sheetName: 'Rutas de reparto' },
    { m: 290, source: 'sheet', action: 'edited', actor: 'luis.m@distnorte.mx', row: 29, column: 'Producto', old: 'Azúcar estándar 50 kg', new: 'Azúcar estándar 25 kg' },
    { m: 340, source: 'sheet', action: 'added', actor: 'ana@distnorte.mx', row: 47, new: 'Panadería La Espiga, Harina de trigo 25 kg' },
    { m: 410, source: 'sheet', action: 'edited', actor: 'marta@distnorte.mx', row: 38, column: 'Estado', old: 'pendiente', new: 'cancelado' },
    { m: 480, source: 'sheet', action: 'edited', actor: 'luis.m@distnorte.mx', row: 9, column: 'Cantidad', old: '5', new: '6' },
    { m: 530, source: 'sheet', action: 'edited', actor: 'ana@distnorte.mx', row: 26, column: 'Estado', old: 'pagado', new: 'entregado' },
  ].map((e, i) => Object.assign({ id: 'ev' + i, sheetName: SHEET }, e, { at: ago(e.m * MIN) }));

  const incoming = [
    { source: 'sheet', action: 'edited', actor: 'luis.m@distnorte.mx', row: 14, column: 'Estado', old: 'pendiente', new: 'pagado' },
    { source: 'sheet', action: 'added', actor: 'marta@distnorte.mx', row: 50, new: 'Cafetería Ñandú, Café molido 1 kg' },
    { source: 'sheet', action: 'edited', actor: 'ana@distnorte.mx', row: 6, column: 'Cantidad', old: '8', new: '10' },
  ];

  const series = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(NOW - (29 - i) * D); const wk = d.getDay() === 0 || d.getDay() === 6 ? 0.25 : 1;
    return { date: d.toLocaleDateString('en-CA'), added: Math.round((4 + rnd() * 10) * wk), edited: Math.round((9 + rnd() * 22) * wk), deleted: Math.round(rnd() * 3 * wk), imported: Math.round(rnd() * 2.4 * wk), connected: rnd() < 0.08 ? 1 : 0 };
  });
  Object.assign(series[29], { added: 12, edited: 21, deleted: 1, imported: 2, connected: 1 });

  const data = {
    tz: Intl.DateTimeFormat().resolvedOptions().timeZone,
    org: { name: 'Distribuidora Norte', plan: 'free', seatsMax: 5 },
    me: { name: 'Alejandro Ruiz', email: 'alex@distnorte.mx', role: 'owner' },
    sheetName: SHEET, headers, rows, events, series,
    sheets: [
      { id: 's1', name: SHEET, rowCount: rows.length, importedAt: ago(3 * H) },
      { id: 's2', name: 'Inventario bodega', rowCount: 612, importedAt: ago(47 * MIN) },
      { id: 's3', name: 'Clientes', rowCount: 210, importedAt: ago(9 * D) },
      { id: 's4', name: 'Rutas de reparto', rowCount: 0, importedAt: null },
    ],
    actors: [{ email: 'ana@distnorte.mx', count: 54 }, { email: 'luis.m@distnorte.mx', count: 31 }, { email: 'marta@distnorte.mx', count: 22 }, { email: 'alex@distnorte.mx', count: 9 }],
    members: [
      { id: 'm1', name: 'Alejandro Ruiz', email: 'alex@distnorte.mx', role: 'owner' },
      { id: 'm2', name: 'Ana Torres', email: 'ana@distnorte.mx', role: 'admin' },
      { id: 'm3', name: 'Luis Mendoza', email: 'luis.m@distnorte.mx', role: 'member' },
    ],
    invitations: [{ id: 'i1', email: 'marta@distnorte.mx', role: 'member', expiresAt: new Date(NOW + 6 * D).toISOString() }],
  };

  /* ---------- state, i18n helpers ---------- */
  const state = {
    lang: localStorage.getItem('rl-lang') || ((navigator.language || 'en').slice(0, 2) === 'es' ? 'es' : 'en'),
    table: { terms: ['cafe', 'pagado'], mode: 'and', filters: [], fmode: 'and', sort: null, page: 1, size: 10, flash: null, showFilters: false },
  };

  const listeners = {};
  const on = (n, fn) => ((listeners[n] = listeners[n] || []).push(fn), fn);
  const emit = (n, p) => (listeners[n] || []).forEach((fn) => fn(p));

  function t(key, vars) {
    let s = (I18N[state.lang] && I18N[state.lang][key]) || I18N.en[key] || key;
    if (vars) for (const k in vars) s = s.replaceAll('{' + k + '}', vars[k]);
    return s;
  }
  function setLang(l) { state.lang = l; localStorage.setItem('rl-lang', l); document.documentElement.lang = l; emit('lang'); }
  document.documentElement.lang = state.lang;

  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  // Accent- and case-insensitive: the backend must fold the same way, or matches are found but not highlighted.
  const fold = (s) => String(s ?? '').split('').map((c) => c.normalize('NFD')[0]).join('').toLowerCase();

  function highlight(text, terms) {
    text = text == null ? '' : String(text);
    const q = (terms || []).map(fold).filter(Boolean);
    if (!text || !q.length) return esc(text);
    const f = fold(text); const ranges = [];
    for (const term of q) { let i = 0; while ((i = f.indexOf(term, i)) > -1) { ranges.push([i, i + term.length]); i += term.length; } }
    if (!ranges.length) return esc(text);
    ranges.sort((a, b) => a[0] - b[0]);
    const merged = [ranges[0].slice()];
    for (const r of ranges.slice(1)) { const l = merged[merged.length - 1]; if (r[0] <= l[1]) l[1] = Math.max(l[1], r[1]); else merged.push(r.slice()); }
    let out = '', p = 0;
    for (const [a, b] of merged) { out += esc(text.slice(p, a)) + '<mark class="rl-mark">' + esc(text.slice(a, b)) + '</mark>'; p = b; }
    return out + esc(text.slice(p));
  }

  /* ---------- time ---------- */
  function rel(iso) {
    const rtf = new Intl.RelativeTimeFormat(state.lang, { numeric: 'auto' });
    const s = (new Date(iso).getTime() - Date.now()) / 1000, a = Math.abs(s);
    if (a < 45) return rtf.format(0, 'second');
    if (a < 3600) return rtf.format(Math.round(s / 60), 'minute');
    if (a < 86400) return rtf.format(Math.round(s / 3600), 'hour');
    return rtf.format(Math.round(s / 86400), 'day');
  }
  const clock = (iso) => new Intl.DateTimeFormat(state.lang, { hour: 'numeric', minute: '2-digit' }).format(new Date(iso));
  const dayLabel = (iso) => new Intl.DateTimeFormat(state.lang, { weekday: 'short', day: 'numeric', month: 'short' }).format(new Date(iso));
  const num = (n) => new Intl.NumberFormat(state.lang).format(n);
  const total = (o) => ACTIONS.reduce((s, a) => s + (o[a] || 0), 0);

  /* ---------- events ---------- */
  function describe(ev) {
    const vars = { column: ev.column, row: ev.row, sheet: ev.sheetName, n: ev.n };
    return { text: t('ev.' + ev.action, vars), detail: ev.action === 'edited' ? { old: ev.old, new: ev.new } : ev.action === 'added' ? { new: ev.new } : ev.action === 'deleted' ? { old: ev.old } : null };
  }
  const initials = (email) => { const p = email.split('@')[0].split(/[._]/); return (p.length > 1 ? p[0][0] + p[1][0] : p[0].slice(0, 2)).toUpperCase(); };
  const recent = () => data.events.slice(0, 15);
  function pushEvent(ev) {
    const full = Object.assign({ id: 'ev' + Math.random().toString(36).slice(2, 7), sheetName: SHEET, at: new Date().toISOString() }, ev);
    data.events.unshift(full); data.events.length = Math.min(data.events.length, 30);
    const today = data.series[data.series.length - 1]; today[ev.action] = (today[ev.action] || 0) + 1;
    emit('event', full); return full;
  }
  let inc = 0, liveTimer = null;
  function simulateLive(ms) {
    clearInterval(liveTimer);
    liveTimer = setInterval(() => { if (document.hidden) return; pushEvent(incoming[inc++ % incoming.length]); }, ms || 9000);
  }

  /* ---------- icons ---------- */
  const ICONS = {
    dashboard: '<rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/>',
    table: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 10h18M9 4v16"/>',
    users: '<circle cx="9" cy="8" r="3.2"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6"/><path d="M16 5.2a3.2 3.2 0 0 1 0 5.6M18 14.4c1.8.8 3 2.6 3 5.6"/>',
    mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3.5 6.5 8.5 6.5 8.5-6.5"/>',
    plus: '<path d="M12 5v14M5 12h14"/>', check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
    logout: '<path d="M10 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h4M15 8l4 4-4 4M19 12H9"/>',
    bolt: '<path d="M13 3 5 13.5h6L10 21l8-10.5h-6z"/>', filter: '<path d="M4 6h16M7 12h10M10 18h4"/>',
    refresh: '<path d="M20 11a8 8 0 0 0-14.5-4M4 4v4h4M4 13a8 8 0 0 0 14.5 4M20 20v-4h-4"/>', x: '<path d="m6 6 12 12M18 6 6 18"/>',
  };
  const icon = (n, size) => '<svg class="rl-i" viewBox="0 0 24 24" width="' + (size || 18) + '" height="' + (size || 18) + '" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + ICONS[n] + '</svg>';

  /* ---------- toast + transition + router ---------- */
  function toast(msg) {
    let box = document.getElementById('rl-toasts');
    if (!box) { box = document.createElement('div'); box.id = 'rl-toasts'; box.setAttribute('role', 'status'); box.setAttribute('aria-live', 'polite'); document.body.appendChild(box); }
    const el = document.createElement('div'); el.className = 'rl-toast'; el.innerHTML = icon('check', 16) + '<span>' + esc(msg) + '</span>';
    box.appendChild(el);
    setTimeout(() => { el.dataset.out = ''; setTimeout(() => el.remove(), 260); }, 3200);
  }
  const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  const transition = (fn) => (document.startViewTransition && !reduced() ? document.startViewTransition(fn) : fn());
  function router(render, fallback) {
    let current = null;
    const go = (first) => {
      const s = (location.hash.replace(/^#\/?/, '') || fallback).split('?')[0];
      if (s === current) return; current = s;
      first ? render(s) : transition(() => render(s));
    };
    addEventListener('hashchange', () => go(false));
    on('lang', () => render(current));
    go(true);
  }
  document.addEventListener('click', (e) => { const b = e.target.closest('[data-lang]'); if (b) setLang(b.dataset.lang); });
  const langToggle = () => '<div class="rl-seg" role="group" aria-label="' + esc(t('lang.label')) + '">' + ['en', 'es'].map((l) => '<button type="button" data-lang="' + l + '" aria-pressed="' + (state.lang === l) + '">' + l.toUpperCase() + '</button>').join('') + '</div>';

  /* ---------- search + table (shared, themed by CSS variables) ---------- */
  const OPS = ['contains', 'equals', 'startsWith', 'gt', 'lt', 'isEmpty'];
  function cmp(a, b) { const x = parseFloat(a), y = parseFloat(b); return !isNaN(x) && !isNaN(y) && String(x) === a.trim() && String(y) === b.trim() ? x - y : String(a).localeCompare(String(b), state.lang); }
  function ruleOk(row, r) {
    const v = row[headers.indexOf(r.column)] ?? '', fv = fold(v), q = fold(r.value);
    switch (r.op) {
      case 'contains': return fv.includes(q); case 'equals': return fv === q; case 'startsWith': return fv.startsWith(q);
      case 'gt': return cmp(v, r.value) > 0; case 'lt': return cmp(v, r.value) < 0; case 'isEmpty': return v.trim() === '';
    } return true;
  }
  function query() {
    const T = state.table, q = T.terms.map(fold);
    let list = rows.map((r, i) => ({ r, n: i + 2 })).filter(({ r }) => {
      const cells = r.map(fold);
      let okT = true;
      if (q.length) { const hit = q.map((x) => cells.some((c) => c.includes(x))); okT = T.mode === 'and' ? hit.every(Boolean) : hit.some(Boolean); }
      let okF = true;
      if (T.filters.length) { const res = T.filters.map((f) => ruleOk(r, f)); okF = T.fmode === 'and' ? res.every(Boolean) : res.some(Boolean); }
      return okT && okF;
    });
    if (T.sort) { const { col, dir } = T.sort; list = list.slice().sort((a, b) => cmp(a.r[col], b.r[col]) * (dir === 'asc' ? 1 : -1)); }
    return list;
  }
  function seg(attr, cur, items) { return '<div class="rl-seg" role="group">' + items.map(([v, label]) => '<button type="button" ' + attr + '="' + v + '" aria-pressed="' + (cur === v) + '">' + esc(label) + '</button>').join('') + '</div>'; }

  function mountTable(root, opts) {
    opts = opts || {}; const T = state.table;
    root.innerHTML =
      '<div class="rl-toolbar">' +
        '<div class="rl-search" data-rl="searchbox"><div class="rl-chips" data-rl="chips"></div>' +
        '<input class="rl-input" data-rl="term" type="text" autocomplete="off" spellcheck="false" aria-label="' + esc(t('table.searchLabel')) + '" placeholder="' + esc(t('table.search')) + '"></div>' +
        '<div data-rl="mode">' + seg('data-mode', T.mode, [['and', t('table.all')], ['or', t('table.any')]]) + '</div>' +
        '<button type="button" class="rl-btn" data-rl="toggle-filters" aria-expanded="' + T.showFilters + '">' + icon('filter', 16) + '<span>' + esc(t('table.filters')) + '</span><b class="rl-count" data-rl="fcount"></b></button>' +
        '<button type="button" class="rl-btn rl-btn-primary" data-rl="add-row">' + icon('plus', 16) + '<span>' + esc(t('table.addRow')) + '</span></button>' +
      '</div>' +
      '<form class="rl-filters" data-rl="filter-form"' + (T.showFilters ? '' : ' hidden') + '>' +
        '<label>' + esc(t('table.column')) + '<select class="rl-select" name="column">' + headers.map((h) => '<option>' + esc(h) + '</option>').join('') + '</select></label>' +
        '<label>' + esc(t('table.operator')) + '<select class="rl-select" name="op">' + OPS.map((o) => '<option value="' + o + '">' + esc(t('op.' + o)) + '</option>').join('') + '</select></label>' +
        '<label>' + esc(t('table.value')) + '<input class="rl-field-input" name="value" autocomplete="off"></label>' +
        '<button class="rl-btn" type="submit">' + esc(t('table.addFilter')) + '</button>' +
        '<div data-rl="fmode">' + seg('data-fmode', T.fmode, [['and', t('table.rulesAll')], ['or', t('table.rulesAny')]]) + '</div>' +
        '<div class="rl-chips" data-rl="rules"></div>' +
      '</form>' +
      '<div class="rl-tablewrap" data-rl="results"></div>' +
      '<div class="rl-pager"><span data-rl="range" aria-live="polite"></span><span class="rl-pager-btns"><button type="button" class="rl-btn" data-page="-1">' + esc(t('table.prev')) + '</button><button type="button" class="rl-btn" data-page="1">' + esc(t('table.next')) + '</button></span></div>' +
      '<dialog class="rl-dialog' + (opts.drawer ? ' rl-dialog--drawer' : '') + '" data-rl="dialog" aria-labelledby="rl-dlg-title"><form data-rl="row-form" novalidate>' +
        '<header><h2 id="rl-dlg-title">' + esc(t('addrow.title', { sheet: data.sheetName })) + '</h2><p>' + esc(t('addrow.hint')) + '</p></header>' +
        '<div class="rl-fields">' + headers.map((h, i) => '<label>' + esc(h) + '<input class="rl-field-input" name="c' + i + '" autocomplete="off"' + (h === 'Fecha' ? ' placeholder="2026-10-26"' : '') + '></label>').join('') + '</div>' +
        '<p class="rl-error" data-rl="row-error" role="alert" hidden>' + esc(t('addrow.error')) + '</p>' +
        '<footer><button type="button" class="rl-btn" data-rl="close-dialog">' + esc(t('addrow.cancel')) + '</button><button class="rl-btn rl-btn-primary" type="submit">' + esc(t('addrow.submit')) + '</button></footer>' +
      '</form></dialog>';

    const $ = (s) => root.querySelector(s);
    const dlg = $('[data-rl=dialog]');

    function update() {
      const list = query(), pages = Math.max(1, Math.ceil(list.length / T.size));
      T.page = Math.min(T.page, pages);
      const slice = list.slice((T.page - 1) * T.size, T.page * T.size);
      $('[data-rl=chips]').innerHTML = T.terms.map((x, i) => '<span class="rl-chip">' + esc(x) + '<button type="button" data-rm-term="' + i + '" aria-label="' + esc(t('table.removeTerm', { term: x })) + '">' + icon('x', 12) + '</button></span>').join('');
      $('[data-rl=rules]').innerHTML = T.filters.map((f, i) => '<span class="rl-chip rl-chip-rule"><b>' + esc(f.column) + '</b> ' + esc(t('op.' + f.op)) + ' ' + esc(f.value || '') + '<button type="button" data-rm-rule="' + i + '" aria-label="' + esc(t('table.removeRule')) + '">' + icon('x', 12) + '</button></span>').join('');
      $('[data-rl=fcount]').textContent = T.filters.length ? T.filters.length : '';
      $('[data-rl=mode]').innerHTML = seg('data-mode', T.mode, [['and', t('table.all')], ['or', t('table.any')]]);
      $('[data-rl=fmode]').innerHTML = seg('data-fmode', T.fmode, [['and', t('table.rulesAll')], ['or', t('table.rulesAny')]]);
      const th = headers.map((h, i) => {
        const s = T.sort && T.sort.col === i ? T.sort.dir : '';
        return '<th scope="col"' + (s ? ' aria-sort="' + (s === 'asc' ? 'ascending' : 'descending') + '"' : '') + '><button type="button" class="rl-th" data-sort="' + i + '">' + esc(h) + '<span class="rl-sort" aria-hidden="true">' + (s === 'asc' ? '▲' : s === 'desc' ? '▼' : '') + '</span></button></th>';
      }).join('');
      const body = slice.map(({ r, n }) => '<tr' + (T.flash === n ? ' class="rl-row-new"' : '') + '><td class="rl-rn">' + n + '</td>' + r.map((c, i) => {
        const h = headers[i];
        if (h === 'Estado') return '<td><span class="rl-pill" data-v="' + esc(c) + '">' + highlight(c, T.terms) + '</span></td>';
        return '<td' + (h === 'Cantidad' ? ' class="rl-num"' : h === 'Fecha' ? ' class="rl-date"' : '') + '>' + highlight(c, T.terms) + '</td>';
      }).join('') + '</tr>').join('');
      $('[data-rl=results]').innerHTML = list.length
        ? '<table class="rl-table"><thead><tr><th scope="col" class="rl-rn">#</th>' + th + '</tr></thead><tbody>' + body + '</tbody></table>'
        : '<div class="rl-empty"><p>' + esc(t('table.empty')) + '</p><button type="button" class="rl-btn" data-rl="clear">' + esc(t('table.clear')) + '</button></div>';
      $('[data-rl=range]').textContent = list.length ? t('table.range', { from: (T.page - 1) * T.size + 1, to: Math.min(T.page * T.size, list.length), n: list.length }) : '0';
      root.querySelector('[data-page="-1"]').disabled = T.page <= 1;
      root.querySelector('[data-page="1"]').disabled = T.page >= pages;
      T.flash = null;
    }

    const addTerm = (v) => { v = v.trim().replace(/,$/, ''); if (v && !T.terms.map(fold).includes(fold(v))) { T.terms.push(v); T.page = 1; } };
    root.addEventListener('keydown', (e) => {
      if (!e.target.matches('[data-rl=term]')) return;
      if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTerm(e.target.value); e.target.value = ''; update(); }
      else if (e.key === 'Backspace' && !e.target.value && T.terms.length) { T.terms.pop(); update(); }
    });
    root.addEventListener('click', (e) => {
      const b = e.target.closest('button'); if (!b) return;
      if (b.dataset.rmTerm != null) { T.terms.splice(+b.dataset.rmTerm, 1); T.page = 1; }
      else if (b.dataset.rmRule != null) { T.filters.splice(+b.dataset.rmRule, 1); T.page = 1; }
      else if (b.dataset.mode) T.mode = b.dataset.mode;
      else if (b.dataset.fmode) T.fmode = b.dataset.fmode;
      else if (b.dataset.sort != null) { const c = +b.dataset.sort; T.sort = !T.sort || T.sort.col !== c ? { col: c, dir: 'asc' } : T.sort.dir === 'asc' ? { col: c, dir: 'desc' } : null; }
      else if (b.dataset.page) T.page += +b.dataset.page;
      else if (b.dataset.rl === 'clear') { T.terms = []; T.filters = []; T.page = 1; }
      else if (b.dataset.rl === 'toggle-filters') { T.showFilters = !T.showFilters; $('[data-rl=filter-form]').hidden = !T.showFilters; b.setAttribute('aria-expanded', T.showFilters); return; }
      else if (b.dataset.rl === 'add-row') { $('[data-rl=row-error]').hidden = true; dlg.showModal(); dlg.querySelector('input').focus(); return; }
      else if (b.dataset.rl === 'close-dialog') { dlg.close(); return; }
      else return;
      update();
    });
    dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close(); });
    $('[data-rl=filter-form]').addEventListener('submit', (e) => {
      e.preventDefault(); const f = new FormData(e.target), op = f.get('op'), value = String(f.get('value') || '').trim();
      if (!value && op !== 'isEmpty') return;
      T.filters.push({ column: f.get('column'), op, value }); T.page = 1; e.target.elements.value.value = ''; update();
    });
    $('[data-rl=filter-form]').elements.op.addEventListener('change', (e) => { e.target.form.elements.value.disabled = e.target.value === 'isEmpty'; });
    $('[data-rl=row-form]').addEventListener('submit', (e) => {
      e.preventDefault(); const f = new FormData(e.target), cells = headers.map((_, i) => String(f.get('c' + i) || '').trim());
      if (!cells.some(Boolean)) { $('[data-rl=row-error]').hidden = false; return; }
      rows.push(cells); data.sheets[0].rowCount = rows.length; T.sort = null; T.page = Math.ceil(query().length / T.size) || 1; T.flash = rows.length + 1;
      e.target.reset(); dlg.close(); update(); toast(t('addrow.done', { sheet: data.sheetName }));
      pushEvent({ source: 'platform', action: 'added', actor: data.me.email, row: rows.length + 1, new: cells.filter(Boolean).slice(0, 2).join(', ') });
    });
    update();
  }

  global.RL = { data, state, t, setLang, on, emit, esc, fold, highlight, rel, clock, dayLabel, num, total, ACTIONS, describe, initials, recent, pushEvent, simulateLive, icon, toast, transition, router, langToggle, mountTable };
})(window);
