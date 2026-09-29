/* Healthly – UI-Helfer, State, Aktionen */
(function () {
  const H = window.HD;
  const S = H.S = {
    user: null, profile: null, pantry: [], shopping: [], favorites: [], ratings: {}, blocked: [],
    foodLog: [], plan: [], weekStart: H.mondayISO(), weights: [],
    ui: { filters: {}, shown: 12, recServ: {}, nutriTab: 'per', seed: 1, planDay: null, openMicros: false, pantryQ: '', shopQ: '' },
    cook: null
  };
  H.actions = {}; H.inputs = {}; H.cleanups = [];

  const $ = (s, e) => (e || document).querySelector(s);
  const $$ = (s, e) => [...(e || document).querySelectorAll(s)];
  const esc = v => String(v == null ? '' : v).replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const nf = H.fmtNum;
  const r0 = n => Math.round(n);
  const debounce = (fn, ms) => { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; };

  /* Toast */
  function toast(msg, o) {
    o = o || {};
    const box = $('#toasts'), el = document.createElement('div');
    el.className = 'toast' + (o.err ? ' err' : '');
    el.innerHTML = `<span>${esc(msg)}</span>${o.undo ? '<button type="button">Rückgängig</button>' : ''}`;
    if (o.undo) el.querySelector('button').onclick = () => { o.undo(); el.remove(); };
    box.append(el);
    setTimeout(() => el.remove(), o.undo ? 6000 : 3200);
  }
  const fail = e => { console.error(e); toast(errText(e), { err: true }); };
  function errText(e) {
    const m = (e && e.message) || '';
    return { invalid_credentials: 'E-Mail oder Passwort stimmt nicht.', email_exists: 'Diese E-Mail ist schon registriert.', not_signed_in: 'Bitte melde dich an.' }[m] || 'Das hat nicht geklappt. Bitte versuche es nochmal.';
  }

  /* Sheets */
  let sheetEl = null, lastFocus = null;
  function openSheet(inner, onOpen) {
    closeSheet();
    lastFocus = document.activeElement;
    const o = document.createElement('div');
    o.className = 'overlay';
    o.innerHTML = `<div class="sheet" role="dialog" aria-modal="true">${inner}</div>`;
    o.addEventListener('mousedown', e => { if (e.target === o) closeSheet(); });
    document.body.append(o);
    sheetEl = o;
    const first = o.querySelector('input:not([type=checkbox]),select,button');
    if (first && !matchMedia('(pointer:coarse)').matches) first.focus();
    if (onOpen) onOpen(o.querySelector('.sheet'));
    return o.querySelector('.sheet');
  }
  function closeSheet() {
    if (sheetEl) { sheetEl.remove(); sheetEl = null; if (lastFocus && lastFocus.focus) try { lastFocus.focus(); } catch (e) { /* egal */ } }
  }
  const sheetRoot = () => (sheetEl ? sheetEl.querySelector('.sheet') : null);
  addEventListener('keydown', e => { if (e.key === 'Escape') closeSheet(); });
  function confirmSheet(title, text, yes, cb, danger) {
    openSheet(`<div class="sheet-head"><h2>${esc(title)}</h2></div><p>${esc(text)}</p><div class="row wrap" style="margin-top:14px"><button class="btn ${danger ? 'btn-danger' : 'btn-primary'}" data-a="confirm-yes">${esc(yes)}</button><button class="btn" data-a="close-sheet">Abbrechen</button></div>`);
    H.actions['confirm-yes'] = () => { closeSheet(); cb(); };
  }

  /* Konfetti */
  function confetti() {
    if (document.documentElement.classList.contains('reduce-motion') || matchMedia('(prefers-reduced-motion:reduce)').matches) return;
    const c = document.createElement('canvas');
    c.style.cssText = 'position:fixed;inset:0;z-index:99;pointer-events:none;width:100%;height:100%';
    c.width = innerWidth; c.height = innerHeight; document.body.append(c);
    const g = c.getContext('2d'), cols = ['#43C27F', '#A8E6CF', '#FFB38A', '#F2B84B', '#7FB93F'];
    const ps = Array.from({ length: 130 }, () => ({ x: innerWidth / 2, y: innerHeight * 0.35, vx: (Math.random() - 0.5) * 14, vy: Math.random() * -11 - 3, s: 4 + Math.random() * 7, r: Math.random() * 6, vr: (Math.random() - 0.5) * 0.4, c: cols[Math.floor(Math.random() * cols.length)], round: Math.random() > 0.5 }));
    let f = 0;
    (function step() {
      g.clearRect(0, 0, c.width, c.height);
      ps.forEach(p => { p.x += p.vx; p.y += p.vy; p.vy += 0.28; p.vx *= 0.99; p.r += p.vr; g.save(); g.translate(p.x, p.y); g.rotate(p.r); g.fillStyle = p.c; if (p.round) { g.beginPath(); g.arc(0, 0, p.s / 2, 0, 6.3); g.fill(); } else g.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2); g.restore(); });
      if (f++ < 150) requestAnimationFrame(step); else c.remove();
    })();
  }
  function countUp(el, to, dur) {
    if (!el) return;
    const t0 = performance.now(), fast = matchMedia('(prefers-reduced-motion:reduce)').matches;
    (function s(t) {
      const k = fast ? 1 : Math.min(1, (t - t0) / (dur || 900)), e = 1 - Math.pow(1 - k, 3);
      el.textContent = Math.round(to * e).toLocaleString('de-DE');
      if (k < 1) requestAnimationFrame(s);
    })(t0);
  }
  const haptic = (k) => { try { navigator.vibrate && navigator.vibrate(k === 'error' ? [60, 40, 60] : k === 'success' ? [20, 30, 20] : 10); } catch (e) { /* egal */ } };

  /* Ringe & Balken (Werte werden nach dem Rendern animiert) */
  function ring(value, max, big, small, id) {
    const p = max > 0 ? value / max : 0, C = 314.16, over = p > 1;
    return `<div class="ring" data-ring="${Math.min(1, p)}" ${id ? `id="${id}"` : ''}><svg viewBox="0 0 120 120"><circle class="bg" cx="60" cy="60" r="50"/><circle class="fg ${over ? 'over' : ''}" cx="60" cy="60" r="50" style="stroke-dashoffset:${C}"/></svg><div class="mid"><b>${big}</b><span>${small || ''}</span></div></div>`;
  }
  function bar(pct, cls) { const v = Math.max(0, Math.min(1, pct)); return `<div class="bar ${cls || ''}"><i data-bar="${v}"></i></div>`; }
  function animate(root) {
    requestAnimationFrame(() => requestAnimationFrame(() => {
      $$('[data-ring]', root).forEach(r => { r.querySelector('.fg').style.strokeDashoffset = 314.16 * (1 - +r.dataset.ring); });
      $$('[data-bar]', root).forEach(b => { b.style.transform = `scaleX(${b.dataset.bar})`; });
    }));
    $$('[data-stagger]', root).forEach((e, i) => e.style.setProperty('--i', Math.min(i, 12)));
    $$('[data-count]', root).forEach(e => countUp(e, +e.dataset.count));
  }
  const checkSvg = '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';
  const checkbox = on => `<span class="check ${on ? 'on' : ''}">${checkSvg}</span>`;

  /* Theme */
  const UIKEY = 'healthly:ui';
  function uiPrefs() { try { return JSON.parse(localStorage.getItem(UIKEY)) || {}; } catch (e) { return {}; } }
  function savePrefs(p) { try { localStorage.setItem(UIKEY, JSON.stringify({ ...uiPrefs(), ...p })); } catch (e) { /* egal */ } }
  function applyPrefs() {
    const p = uiPrefs();
    document.documentElement.dataset.theme = p.theme || 'system';
    document.documentElement.classList.toggle('reduce-motion', !!p.reduce);
  }
  function setTheme(t) { savePrefs({ theme: t }); applyPrefs(); }

  /* Datum-Anzeige */
  const fmtDate = iso => new Intl.DateTimeFormat('de-DE', { weekday: 'short', day: '2-digit', month: '2-digit' }).format(H.parseISO(iso));
  const fmtLong = iso => new Intl.DateTimeFormat('de-DE', { weekday: 'long', day: 'numeric', month: 'long' }).format(H.parseISO(iso));
  const isoWeek = iso => { const d = H.parseISO(iso); d.setDate(d.getDate() + 4 - (d.getDay() || 7)); const y = new Date(d.getFullYear(), 0, 1); return Math.ceil(((d - y) / 86400000 + 1) / 7); };

  /* Profil-Helfer */
  const saveProfileSoon = debounce(async () => { try { await H.api.saveProfile(S.profile); } catch (e) { fail(e); } }, 250);
  function setProf(patch, recalc) {
    S.profile = { ...S.profile, ...patch };
    if (recalc !== false) S.profile.targets = H.calcTargets(S.profile);
    saveProfileSoon();
  }
  const targets = () => H.effectiveTargets(S.profile);

  /* Rezept-Helfer */
  const recipeById = id => H.RECIPES.find(r => r.id === id);
  const ing = id => H.ING.get(id);
  const catLabel = k => (H.CATS[k] || H.CATS.other);
  const todayLog = () => S.foodLog.filter(e => e.date === H.todayISO());
  const ctx = filters => ({ profile: S.profile, pantry: S.pantry, favorites: S.favorites, ratings: S.ratings, blocked: S.blocked, foodLog: S.foodLog, filters: filters || {} });
  function sugFor(r) {
    const v = H.recipeView(r, S.profile, r.servings, S.pantry);
    return { recipe: r, match_percent: v.match.pct, missing: v.match.missing, kcal: v.nutrition.per.kcal, protein: v.nutrition.per.protein, ok: v.res.ok, swaps: v.res.swaps };
  }
  function recipeCard(s) {
    const r = s.recipe, fav = S.favorites.includes(r.id), pct = s.match_percent;
    const mcls = pct >= 80 ? 'g' : pct >= 50 ? 'y' : '';
    const miss = s.missing || [];
    return `<article class="card rc card-i" data-stagger data-a="open-recipe" data-id="${esc(r.id)}">
      <div class="rc-art" style="background:linear-gradient(135deg,${r.gradient[0]},${r.gradient[1]})"><span>${r.emoji}</span>
        <b class="badge ${mcls}">${pct}% da</b>
        <button class="iconbtn heart" type="button" data-a="fav" data-id="${esc(r.id)}" aria-label="Favorit" aria-pressed="${fav}">${fav ? '♥' : '♡'}</button></div>
      <div class="rc-body"><div class="rc-title">${esc(r.title)}</div>
        <div class="rc-meta"><span>⏱ ${r.prep_min + r.cook_min} Min</span><span>🔥 ${r0(s.kcal)} kcal</span><span>💪 ${r0(s.protein)} g</span></div>
        ${s.swaps && Object.keys(s.swaps).length ? `<div class="small good">🔁 ${esc(ing(Object.values(s.swaps)[0]).name)} statt ${esc(ing(Object.keys(s.swaps)[0]).name)}</div>` : ''}
        ${miss.length ? `<div class="small muted">fehlt: ${miss.slice(0, 2).map(x => esc(ing(x.ing).name)).join(', ')}${miss.length > 2 ? ` +${miss.length - 2}` : ''}</div>` : ''}</div></article>`;
  }
  const empty = (em, title, text, btn) => `<div class="empty"><span class="em">${em}</span><h2>${esc(title)}</h2><p>${esc(text)}</p>${btn || ''}</div>`;
  const ings = q => { q = q.trim().toLowerCase().replace(/ä/g, 'a').replace(/ö/g, 'o').replace(/ü/g, 'u').replace(/ß/g, 'ss'); if (!q) return []; const nz = s => s.toLowerCase().replace(/ä/g, 'a').replace(/ö/g, 'o').replace(/ü/g, 'u').replace(/ß/g, 'ss'); return H.INGREDIENTS.map(i => { const n = nz(i.name), idx = n.indexOf(q); return { i, s: idx === 0 ? 0 : idx > 0 ? 1 : 9 }; }).filter(x => x.s < 9).sort((a, b) => a.s - b.s || a.i.name.localeCompare(b.i.name)).slice(0, 6).map(x => x.i); };

  H.checkSvg = checkSvg;
  Object.assign(H, { $, $$, esc, sleep, nf, r0, debounce, toast, fail, errText, openSheet, closeSheet, sheetRoot, confirmSheet, confetti, countUp, haptic, ring, bar, animate, checkbox, uiPrefs, savePrefs, applyPrefs, setTheme, fmtDate, fmtLong, isoWeek, setProf, targets, saveProfileSoon, recipeById, ing, catLabel, todayLog, ctx, sugFor, recipeCard, empty, searchIng: ings });
})();
