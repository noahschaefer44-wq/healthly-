/* Healthly – Screens 3: Vorrat, Einkauf, Wochenplan, Fortschritt, Profil */
(function () {
  const H = window.HD, S = H.S, A = H.actions, I = H.inputs;
  const { esc, nf, r0, toast, fail } = H;
  const MEAL = H.MEAL, ing = H.ing;

  /* ---------- Vorrat ---------- */
  const STAT = { expired: ['badc', 'abgelaufen'], today: ['badc', 'heute'], soon: ['warnc', ''], ok: ['', ''], none: ['', ''] };
  const pantryLine = x => {
    const st = H.expiryStatus(x, H.todayISO()), s = STAT[st];
    const qty = x.quantity != null ? `${nf(x.quantity)} ${x.unit || ''}` : 'Menge egal';
    return `<div class="card row between card-i" style="padding:14px 16px" data-a="pantry-edit" data-id="${x.id}"><div><b>${esc(x.name)}</b><div class="small muted">${qty}</div></div>${x.expires_on ? `<span class="chip ${s[0]}">${s[1] || H.fmtDate(x.expires_on)}</span>` : ''}</div>`;
  };
  H.screens.pantry = () => {
    H.acFree = true;
    const today = H.todayISO(), items = S.pantry.filter(x => x.kind !== 'leftover'), left = S.pantry.filter(x => x.kind === 'leftover');
    const exp = items.filter(x => ['expired', 'today', 'soon'].includes(H.expiryStatus(x, today))).sort((a, b) => a.expires_on.localeCompare(b.expires_on));
    const groups = Object.keys(H.CATS).map(k => [k, items.filter(x => (x.ingredient_id ? ing(x.ingredient_id).cat : 'other') === k)]).filter(g => g[1].length);
    return {
      html: H.shell(`<section class="hero"><h1>Vorrat 🥕</h1><p>Was du hast, bestimmt, was wir vorschlagen.</p>
        <div style="position:relative"><input class="field" data-f="ac" data-ac="pantry" placeholder="Zutat hinzufügen …" autocomplete="off"><div class="ac hidden" data-acbox></div></div>
        <div class="chips" style="margin-top:12px">${['egg', 'milk', 'tomato', 'onion', 'pasta', 'rice', 'chicken', 'cheese', 'bell_pepper', 'banana', 'potato', 'carrot'].map(id => `<button class="chip" data-a="pantry-quick" data-id="${id}">+ ${esc(ing(id).name)}</button>`).join('')}</div></section>
        ${left.length ? `<section class="section"><h2>Reste im Kühlschrank 🍱</h2><div class="grid g2">${left.map(x => `<div class="card"><h3>${esc(x.name)}</h3><p>${nf(x.servings || 1)} Portion${(x.servings || 1) === 1 ? '' : 'en'}${x.expires_on ? ' · bis ' + H.fmtDate(x.expires_on) : ''}</p><div class="row"><button class="btn btn-sm btn-soft" data-a="eat-left" data-id="${x.id}">Gegessen</button><button class="btn btn-sm btn-danger" data-a="pantry-del" data-id="${x.id}">Wegwerfen</button></div></div>`).join('')}</div></section>` : ''}
        ${exp.length ? `<section class="section"><h2>Läuft bald ab ⏰</h2><div class="chips">${exp.map(x => `<span class="chip ${H.expiryStatus(x, today) === 'soon' ? 'warnc' : 'badc'}">${esc(x.name)} · ${H.fmtDate(x.expires_on)}</span>`).join('')}</div><a class="btn btn-soft btn-sm" style="margin-top:12px" href="#/discover?use_up=${exp.filter(x => x.ingredient_id).map(x => x.ingredient_id).join(',')}">Rezepte dafür finden</a></section>` : ''}
        <section class="section"><h2>Alles daheim</h2>${groups.length ? groups.map(g => `<details open style="margin-bottom:12px"><summary style="cursor:pointer;font-weight:800;margin-bottom:8px">${H.CATS[g[0]][1]} ${H.CATS[g[0]][0]} <span class="badge">${g[1].length}</span></summary><div class="grid g2">${g[1].map(pantryLine).join('')}</div></details>`).join('') : H.empty('🥕', 'Dein Vorrat ist leer', 'Füg ein paar Sachen hinzu, dann zaubere ich was draus.')}</section>
        <section class="section"><h3>Grundvorrat</h3><p class="small">Das hast du immer da und es taucht nie auf der Einkaufsliste auf.</p><div class="chips">${H.STAPLES.map(id => `<button class="chip ${S.profile.staples.includes(id) ? 'on' : ''}" data-a="staple" data-id="${id}">${esc(ing(id).name)}</button>`).join('')}</div>
          <a class="btn btn-primary btn-block" style="margin-top:22px" href="#/discover?pantry=max_missing_2">Was kann ich kochen? 🍳</a></section>`, 'pantry', { fab: true }),
      after: root => H.animate(root)
    };
  };
  A.staple = el => {
    const id = el.dataset.id, cur = S.profile.staples, on = !cur.includes(id);
    H.setProf({ staples: on ? [...cur, id] : cur.filter(x => x !== id) }, false); H.clearCaches(); el.classList.toggle('on', on);
  };
  H.acPick.pantry = id => pantrySheet({ ingredient_id: id, name: ing(id).name });
  A['ac-free'] = el => {
    const t = el.dataset.ac, name = el.dataset.name;
    if (t === 'pantry') pantrySheet({ ingredient_id: null, name });
    if (t === 'shop') addShop(name, null);
  };
  function pantrySheet(it) {
    const i = it.ingredient_id ? ing(it.ingredient_id) : null, units = i ? H.unitOptions(i.id) : ['g'];
    const exp = it.id ? it.expires_on : (i ? H.suggestExpiry(i.id, H.todayISO()) : null);
    S.ui.pit = it;
    H.openSheet(`<div class="sheet-head"><h2>${esc(it.name)}</h2><button class="iconbtn" data-a="close-sheet" aria-label="Schließen">✕</button></div>
      <div class="form"><div class="grid g2 keep"><label class="label">Menge (optional)<input class="field" id="pi-q" type="number" min="0" step="any" inputmode="decimal" value="${it.quantity != null ? it.quantity : ''}"></label>
      <label class="label">Einheit<select class="field" id="pi-u">${units.map(u => `<option ${u === (it.unit || units[0]) ? 'selected' : ''}>${u}</option>`).join('')}</select></label></div>
      <label class="label">Haltbar bis (optional)<input class="field" id="pi-d" type="date" value="${exp || ''}"></label>
      <div class="row wrap"><button class="btn btn-primary" style="flex:1" data-a="pantry-save">Speichern</button>${it.id ? '<button class="btn btn-danger" data-a="pantry-del" data-id="' + it.id + '">Löschen</button>' : ''}</div></div>`);
  }
  A['pantry-edit'] = el => { const x = S.pantry.find(q => q.id === el.dataset.id); if (x) pantrySheet(x); };
  A['pantry-quick'] = async el => {
    const id = el.dataset.id;
    try { await H.api.upsertPantryItem({ ingredient_id: id, name: ing(id).name, category: ing(id).cat, quantity: null, unit: null, expires_on: H.suggestExpiry(id, H.todayISO()), kind: 'item', recipe_id: null, servings: null }); S.pantry = await H.api.listPantry(); toast(ing(id).name + ' hinzugefügt'); H.rerender(); } catch (e) { fail(e); }
  };
  A['pantry-save'] = async () => {
    const it = S.ui.pit, q = parseFloat(H.$('#pi-q').value), u = H.$('#pi-u').value, d = H.$('#pi-d').value || null;
    try {
      let item = { id: it.id, ingredient_id: it.ingredient_id, name: it.name, category: it.category || (it.ingredient_id ? ing(it.ingredient_id).cat : 'other'), quantity: q > 0 ? q : null, unit: q > 0 ? u : null, expires_on: d, kind: 'item', recipe_id: null, servings: null };
      if (!it.id && it.ingredient_id) {
        const ex = S.pantry.find(x => x.ingredient_id === it.ingredient_id && x.kind !== 'leftover');
        if (ex) {
          const both = ex.quantity != null && item.quantity != null;
          item = { ...ex, quantity: both ? H.toGrams(it.ingredient_id, ex.quantity, ex.unit) + H.toGrams(it.ingredient_id, item.quantity, item.unit) : null, unit: both ? (H.isLiquid(it.ingredient_id) ? 'ml' : 'g') : null, expires_on: d || ex.expires_on };
        }
      }
      await H.api.upsertPantryItem(item); S.pantry = await H.api.listPantry(); H.closeSheet(); toast('Gespeichert ✓'); H.rerender();
    } catch (e) { fail(e); }
  };
  A['pantry-del'] = async el => { try { await H.api.deletePantryItem(el.dataset.id); S.pantry = await H.api.listPantry(); H.closeSheet(); H.rerender(); } catch (e) { fail(e); } };

  /* ---------- Einkaufsliste ---------- */
  const shopLabel = x => (x.ingredient_id && x.quantity ? H.fmtQty(x.ingredient_id, x.quantity) : x.quantity ? `${nf(x.quantity)} ${x.unit || ''}` : '');
  H.screens.shopping = () => {
    H.acFree = true;
    const open = S.shopping.filter(x => !x.checked).length, done = S.shopping.length - open;
    const order = [...Object.keys(H.CATS)];
    const catOf = x => (x.ingredient_id && ing(x.ingredient_id) ? ing(x.ingredient_id).cat : 'other');
    const groups = order.map(k => [k, S.shopping.filter(x => catOf(x) === k).sort((a, b) => a.checked - b.checked || a.name.localeCompare(b.name))]).filter(g => g[1].length);
    return {
      html: H.shell(`<section class="hero"><h1>Einkaufsliste 🛒</h1>
        <div style="position:relative"><input class="field" id="shopin" data-f="ac" data-ac="shop" placeholder="Artikel hinzufügen …" autocomplete="off"><div class="ac hidden" data-acbox></div></div>
        ${S.shopping.length ? `<p style="margin:14px 0 6px"><b>${done}</b> von ${S.shopping.length} erledigt</p>${H.bar(done / S.shopping.length, '')}` : ''}
        <div class="row wrap" style="margin-top:14px"><button class="btn btn-sm" data-a="shop-share">Teilen</button><button class="btn btn-sm" data-a="plan-shop">Aus Wochenplan</button><button class="btn btn-sm" data-a="shop-pantry" ${done ? '' : 'disabled'}>Erledigte in den Vorrat</button><button class="btn btn-sm btn-danger" data-a="shop-clear" ${done ? '' : 'disabled'}>Erledigte löschen</button></div></section>
        <section class="section">${groups.length ? groups.map(g => `<div class="card" style="margin-bottom:12px" data-stagger><h3>${H.CATS[g[0]][1]} ${H.CATS[g[0]][0]} <span class="badge">${g[1].length}</span></h3>${g[1].map(x => `<div class="shop ${x.checked ? 'done' : ''}" data-a="shop-check" data-id="${x.id}" role="checkbox" aria-checked="${!!x.checked}" tabindex="0">${H.checkbox(x.checked)}<span class="nm"><b>${esc(x.name)}</b> <span class="muted">${esc(shopLabel(x))}</span>${x.recipe_ids && x.recipe_ids.length ? `<div class="small muted">für ${x.recipe_ids.slice(0, 2).map(id => esc((H.recipeById(id) || {}).title || '')).filter(Boolean).join(', ')}</div>` : ''}</span><button class="iconbtn" style="width:36px;height:36px" data-a="shop-del" data-id="${x.id}" aria-label="Löschen">✕</button></div>`).join('')}</div>`).join('') : H.empty('🛒', 'Alles besorgt', 'Deine Einkaufsliste ist leer. Füge Zutaten aus Rezepten hinzu oder plane deine Woche.')}</section>`, 'shopping', { fab: true }),
      after: root => H.animate(root)
    };
  };
  async function addShop(name, id) {
    try {
      const inc = { ingredient_id: id, name: id ? ing(id).name : name, quantity: null, unit: null, category: id ? ing(id).cat : 'other', checked: false, source: 'manual', recipe_ids: [] };
      if (S.shopping.some(x => !x.checked && (id ? x.ingredient_id === id : x.name.toLowerCase() === name.toLowerCase()))) { toast('Steht schon auf der Liste.'); return; }
      await H.api.upsertShoppingItem(inc); S.shopping = await H.api.listShopping(); H.rerender();
    } catch (e) { fail(e); }
  }
  H.acPick.shop = id => addShop(ing(id).name, id);
  H.submitShop = () => { const el = H.$('#shopin'); if (el && el.value.trim()) { const v = el.value.trim(), m = H.INGREDIENTS.find(i => i.name.toLowerCase() === v.toLowerCase()); addShop(v, m ? m.id : null); } };
  A['shop-check'] = async el => {
    const x = S.shopping.find(q => q.id === el.dataset.id); if (!x) return;
    x.checked = !x.checked; el.classList.toggle('done', x.checked); el.setAttribute('aria-checked', x.checked); el.querySelector('.check').classList.toggle('on', x.checked); H.haptic('light');
    try { await H.api.upsertShoppingItem(x); } catch (e) { fail(e); }
    clearTimeout(S.ui.shopT); S.ui.shopT = setTimeout(() => { if (location.hash.startsWith('#/shopping')) { S.ui.noAnim = true; H.rerender(); if (S.shopping.length && S.shopping.every(q => q.checked)) H.confetti(); } }, 700);
  };
  A['shop-del'] = async el => { try { await H.api.deleteShoppingItem(el.dataset.id); S.shopping = await H.api.listShopping(); H.rerender(); } catch (e) { fail(e); } };
  A['shop-clear'] = async () => { try { await H.api.clearCheckedShopping(); S.shopping = await H.api.listShopping(); H.rerender(); } catch (e) { fail(e); } };
  A['shop-pantry'] = async () => {
    try {
      const done = S.shopping.filter(x => x.checked);
      for (const x of done) {
        const id = x.ingredient_id, ex = id && S.pantry.find(p => p.ingredient_id === id && p.kind !== 'leftover');
        const grams = id && x.quantity ? x.quantity : null;
        const item = ex && ex.quantity != null && grams ? { ...ex, quantity: H.toGrams(id, ex.quantity, ex.unit) + grams, unit: H.isLiquid(id) ? 'ml' : 'g', expires_on: H.suggestExpiry(id, H.todayISO()) }
          : ex ? ex : { ingredient_id: id, name: x.name, category: x.category, quantity: grams, unit: grams ? (H.isLiquid(id) ? 'ml' : 'g') : null, expires_on: id ? H.suggestExpiry(id, H.todayISO()) : null, kind: 'item', recipe_id: null, servings: null };
        await H.api.upsertPantryItem(item);
      }
      await H.api.clearCheckedShopping(); S.pantry = await H.api.listPantry(); S.shopping = await H.api.listShopping(); toast(`${done.length} Artikel im Vorrat`); H.rerender();
    } catch (e) { fail(e); }
  };
  A['shop-share'] = async () => {
    const byCat = Object.keys(H.CATS).map(k => [k, S.shopping.filter(x => !x.checked && (x.ingredient_id && ing(x.ingredient_id) ? ing(x.ingredient_id).cat : 'other') === k)]).filter(g => g[1].length);
    const txt = 'Einkaufsliste\n' + byCat.map(g => `\n${H.CATS[g[0]][0]}\n` + g[1].map(x => `• ${x.name}${shopLabel(x) ? ' ' + shopLabel(x) : ''}`).join('\n')).join('\n');
    if (!byCat.length) { toast('Die Liste ist leer.'); return; }
    try { if (navigator.share) await navigator.share({ title: 'Healthly Einkaufsliste', text: txt }); else { await navigator.clipboard.writeText(txt); toast('Liste kopiert'); } } catch (e) { /* abgebrochen */ }
  };
  A['plan-shop'] = async () => {
    const entries = S.planByWeek[S.weekStart] || (await H.api.listMealPlan(S.weekStart));
    if (!entries.length) { toast('Plane zuerst deine Woche.'); return; }
    try {
      const inc = H.listFromPlan(entries, S.pantry, S.profile, H.recipeById);
      if (!inc.length) { toast('Du hast schon alles für die Woche da.'); return; }
      const ups = H.mergeShopping(S.shopping, inc); for (const u of ups) await H.api.upsertShoppingItem(u);
      S.shopping = await H.api.listShopping(); toast(`${inc.length} Zutaten auf der Liste`); H.haptic('success'); H.rerender();
    } catch (e) { fail(e); }
  };

  /* ---------- Wochenplan ---------- */
  const SLOTS = ['breakfast', 'lunch', 'dinner', 'snack'];
  const sortE = (a, b) => SLOTS.indexOf(a.meal_type) - SLOTS.indexOf(b.meal_type) || (a.slot || 0) - (b.slot || 0);
  async function loadWeek() { S.planByWeek[S.weekStart] = await H.api.listMealPlan(S.weekStart); }
  H.screens.plan = () => {
    const wk = S.weekStart, entries = S.planByWeek[wk], p = S.profile, t = H.targets(), hh = p.household_size || 1, mp = p.meal_pattern;
    if (!entries) return { html: H.shell('<div class="skel"></div>', 'plan'), after: async () => { try { await loadWeek(); H.rerender(); } catch (e) { fail(e); } } };
    const today = H.todayISO(), days = Array.from({ length: 7 }, (_, i) => H.addDays(wk, i));
    if (!S.ui.planDay || !days.includes(S.ui.planDay)) S.ui.planDay = days.includes(today) ? today : days[0];
    const kcalOf = e => { const r = H.recipeById(e.recipe_id); return r ? H.nutrientsOf(H.checkRecipe(r, p).ings, r.servings).per.kcal * (e.servings / hh) : 0; };
    const protOf = e => { const r = H.recipeById(e.recipe_id); return r ? H.nutrientsOf(H.checkRecipe(r, p).ings, r.servings).per.protein * (e.servings / hh) : 0; };
    const slotHtml = (date, meal, arr) => {
      const en = arr.filter(e => e.meal_type === meal).sort(sortE), cap = meal === 'snack' ? mp.snacks : 1;
      const enabled = meal === 'snack' ? mp.snacks > 0 : mp[meal];
      if (!enabled && !en.length) return '';
      return `<div class="slot"><div class="t">${MEAL[meal][1]} ${MEAL[meal][0]}</div>${en.map(e => { const r = H.recipeById(e.recipe_id); if (!r) return ''; return `<div style="margin-bottom:8px"><a href="#/recipe/${r.id}?servings=${e.servings}"><b>${r.emoji} ${esc(r.title)}</b></a>${e.is_leftover ? ' <span class="badge y">Rest 🍱</span>' : ''}<div class="small muted">${r0(kcalOf(e))} kcal · ${nf(e.servings)} Port.</div>
        <div class="row wrap" style="gap:6px;margin-top:6px"><button class="iconbtn" style="width:34px;height:34px;font-size:15px" data-a="plan-serv" data-id="${e.id}" data-d="-0.5" aria-label="Weniger">−</button><button class="iconbtn" style="width:34px;height:34px;font-size:15px" data-a="plan-serv" data-id="${e.id}" data-d="0.5" aria-label="Mehr">+</button><button class="iconbtn" style="width:34px;height:34px;font-size:15px" data-a="plan-lock" data-id="${e.id}" aria-label="${e.locked ? 'Entsperren' : 'Sperren'}">${e.locked ? '🔒' : '🔓'}</button>${e.is_leftover ? '' : `<button class="iconbtn" style="width:34px;height:34px;font-size:15px" data-a="plan-swap" data-id="${e.id}" aria-label="Tauschen">🔄</button>`}<button class="iconbtn" style="width:34px;height:34px;font-size:15px" data-a="plan-del" data-id="${e.id}" aria-label="Entfernen">🗑</button></div></div>`; }).join('')}
        ${en.length < cap ? `<button class="btn btn-sm btn-soft" data-a="plan-pick" data-date="${date}" data-meal="${meal}">+ Rezept wählen</button>` : ''}</div>`;
    };
    const d0 = H.parseISO(days[0]), d6 = H.parseISO(days[6]), fmt = d => new Intl.DateTimeFormat('de-DE', { day: 'numeric', month: 'short' }).format(d);
    return {
      html: H.shell(`<section class="hero"><div class="row between"><button class="iconbtn" data-a="plan-week" data-d="-7" aria-label="Vorherige Woche">‹</button><div class="center"><p class="muted" style="margin:0">Wochenplan</p><h1 style="margin:0">KW ${H.isoWeek(wk)}</h1><span class="small muted">${fmt(d0)} – ${fmt(d6)}</span></div><button class="iconbtn" data-a="plan-week" data-d="7" aria-label="Nächste Woche">›</button></div>
        <div class="row wrap" style="margin-top:16px"><button class="btn btn-primary" data-a="plan-auto">✨ Woche automatisch planen</button><button class="btn" data-a="plan-remix" ${entries.length ? '' : 'disabled'}>🔀 Neu mischen</button><button class="btn" data-a="plan-shop" ${entries.length ? '' : 'disabled'}>🛒 Einkaufsliste</button></div></section>
        <div class="daypills" style="margin-top:16px">${days.map(d => `<button class="dpill ${d === S.ui.planDay ? 'on' : ''} ${d === today ? 'today' : ''}" data-a="plan-day" data-d="${d}">${H.fmtDate(d).split(' ')[0]}<b>${H.parseISO(d).getDate()}</b></button>`).join('')}</div>
        <section class="section week">${days.map(d => { const arr = entries.filter(e => e.date === d), k = arr.reduce((a, e) => a + kcalOf(e), 0), pr = arr.reduce((a, e) => a + protOf(e), 0), inRange = k >= t.kcal * 0.9 && k <= t.kcal * 1.1;
          return `<div class="card day ${d === S.ui.planDay ? 'show' : ''}" data-day="${d}"><h3>${H.fmtDate(d)}</h3>${SLOTS.map(m => slotHtml(d, m, arr)).join('')}
          <div class="small" style="margin-top:10px"><div class="row between"><span>${r0(k)} / ${t.kcal} kcal</span><span>${r0(pr)} / ${t.protein_g} g Protein</span></div>${H.bar(k / t.kcal, arr.length ? (inRange ? '' : 'warn') : '')}</div></div>`; }).join('')}</section>`, 'plan'),
      after: root => H.animate(root)
    };
  };
  A['plan-day'] = el => { S.ui.planDay = el.dataset.d; H.$$('.dpill').forEach(b => b.classList.toggle('on', b === el)); H.$$('.day').forEach(d => d.classList.toggle('show', d.dataset.day === el.dataset.d)); };
  A['plan-week'] = async el => { S.weekStart = H.addDays(S.weekStart, +el.dataset.d); S.ui.planDay = null; try { await loadWeek(); H.rerender(); } catch (e) { fail(e); } };
  async function doPlan(seed) {
    try {
      const entries = H.planWeek({ profile: S.profile, pantry: S.pantry, favorites: S.favorites, ratings: S.ratings, blocked: S.blocked, foodLog: S.foodLog, existing: S.planByWeek[S.weekStart] || [], weekStart: S.weekStart, seed, filters: {} });
      if (!entries.length) { toast('Mit deinen Einstellungen finde ich keine passenden Rezepte. Lockere Zeit oder Geräte.', { err: true }); return; }
      S.planByWeek[S.weekStart] = await H.api.replaceMealPlanWeek(S.weekStart, entries); toast('Woche geplant ✨'); H.haptic('success'); S.ui.staggerPlan = true; H.rerender();
    } catch (e) { fail(e); }
  }
  A['plan-auto'] = () => doPlan(S.ui.seed);
  A['plan-remix'] = () => { S.ui.seed++; doPlan(S.ui.seed); };
  const entry = id => (S.planByWeek[S.weekStart] || []).find(e => e.id === id);
  async function upd(e) { await H.api.upsertMealPlanEntry(e); await loadWeek(); H.rerender(); }
  A['plan-lock'] = async el => { try { const e = entry(el.dataset.id); await upd({ ...e, locked: !e.locked }); } catch (er) { fail(er); } };
  A['plan-serv'] = async el => { try { const e = entry(el.dataset.id), v = Math.max(0.5, Math.min(16, e.servings + +el.dataset.d)); await upd({ ...e, servings: v }); } catch (er) { fail(er); } };
  A['plan-del'] = async el => {
    try {
      const e = entry(el.dataset.id); await H.api.deleteMealPlanEntry(e.id);
      for (const l of (S.planByWeek[S.weekStart] || []).filter(x => x.source_id === e.id)) await H.api.deleteMealPlanEntry(l.id);
      await loadWeek(); H.rerender();
    } catch (er) { fail(er); }
  };
  A['plan-swap'] = async el => {
    try {
      const e = entry(el.dataset.id), same = (S.planByWeek[S.weekStart] || []).filter(x => x.date === e.date).map(x => x.recipe_id);
      const c = H.suggest(H.ctx({ meal_type: e.meal_type === 'snack' ? null : e.meal_type, limit: 40 })).filter(x => !same.includes(x.recipe.id) && (e.meal_type === 'snack' ? x.recipe.meal_types.some(m => ['snack', 'dessert', 'drink'].includes(m)) : !x.recipe.meal_types.every(m => ['dessert', 'drink'].includes(m))));
      if (!c.length) { toast('Keine Alternative gefunden.'); return; }
      const pick = c[Math.floor(Math.random() * Math.min(4, c.length))];
      for (const l of (S.planByWeek[S.weekStart] || []).filter(x => x.source_id === e.id)) await H.api.deleteMealPlanEntry(l.id);
      await upd({ ...e, recipe_id: pick.recipe.id });
    } catch (er) { fail(er); }
  };
  function pickHtml(date, meal, q) {
    const list = H.suggest(H.ctx({ meal_type: meal === 'snack' ? null : meal, query: q, limit: 60 })).filter(x => (meal === 'snack' ? x.recipe.meal_types.some(m => ['snack', 'dessert', 'drink'].includes(m)) : !x.recipe.meal_types.every(m => ['dessert', 'drink'].includes(m)))).slice(0, 12);
    return list.length ? list.map(x => `<button class="btn btn-block" style="justify-content:flex-start;margin-bottom:8px;min-height:56px;text-align:left" data-a="plan-pick-go" data-id="${x.recipe.id}" data-date="${date}" data-meal="${meal}">${x.recipe.emoji}&nbsp;<span style="flex:1">${esc(x.recipe.title)}<br><small class="muted">${r0(x.kcal)} kcal · ${x.recipe.prep_min + x.recipe.cook_min} Min · ${x.match_percent}% da</small></span></button>`).join('') : '<p class="muted">Nichts gefunden.</p>';
  }
  A['plan-pick'] = el => {
    const { date, meal } = el.dataset; S.ui.pick = { date, meal };
    H.openSheet(`<div class="sheet-head"><h2>${MEAL[meal][0]} am ${H.fmtDate(date)}</h2><button class="iconbtn" data-a="close-sheet" aria-label="Schließen">✕</button></div><input class="field" data-f="plansearch" placeholder="Suchen …" type="search" style="margin-bottom:12px"><div id="pickres">${pickHtml(date, meal, '')}</div>`);
  };
  I.plansearch = H.debounce(el => { const p = S.ui.pick; H.$('#pickres').innerHTML = pickHtml(p.date, p.meal, el.value); }, 150);
  A['plan-pick-go'] = async el => {
    try {
      const { date, meal, id } = el.dataset;
      await H.api.upsertMealPlanEntry({ date, meal_type: meal, slot: 0, recipe_id: id, servings: S.profile.household_size || 1, is_leftover: false, locked: false });
      await loadWeek(); H.closeSheet(); H.rerender();
    } catch (e) { fail(e); }
  };

  /* ---------- Fortschritt ---------- */
  const streak = () => {
    const days = new Set(S.foodLog.map(e => e.date)); let d = H.todayISO(), n = 0;
    if (!days.has(d)) d = H.addDays(d, -1);
    while (days.has(d)) { n++; d = H.addDays(d, -1); }
    return n;
  };
  function weightChart() {
    const r = S.ui.wRange || 30, from = H.addDays(H.todayISO(), -r), ws = S.weights.filter(w => w.date >= from).sort((a, b) => a.date.localeCompare(b.date));
    if (ws.length < 2) return '<div class="empty" style="padding:24px"><p>Trage mindestens zwei Gewichte ein, dann siehst du hier deinen Verlauf.</p></div>';
    const tw = S.profile.target_weight_kg, vals = ws.map(w => w.kg).concat(tw ? [tw] : []);
    const min = Math.min(...vals) - 1, max = Math.max(...vals) + 1, W = 600, Hh = 190, px = 36, x = d => px + (H.daysBetween(from, d) / r) * (W - px - 12), y = v => 160 - ((v - min) / (max - min)) * 140;
    const avg = ws.map((w, i) => { const s = ws.slice(Math.max(0, i - 6), i + 1); return [w.date, s.reduce((a, b) => a + b.kg, 0) / s.length]; });
    return `<svg class="chart" viewBox="0 0 ${W} ${Hh}" role="img" aria-label="Gewichtsverlauf">${tw ? `<line x1="${px}" x2="${W - 12}" y1="${y(tw)}" y2="${y(tw)}" stroke="var(--warning)" stroke-dasharray="6 6"/><text x="${W - 14}" y="${y(tw) - 5}" text-anchor="end" font-size="11" fill="var(--warning)">Ziel ${nf(tw)} kg</text>` : ''}
      <text x="4" y="24" font-size="11" fill="currentColor">${nf(max)}</text><text x="4" y="160" font-size="11" fill="currentColor">${nf(min)}</text>
      <polyline points="${avg.map(a => `${x(a[0])},${y(a[1])}`).join(' ')}" fill="none" stroke="var(--primary)" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
      ${ws.map(w => `<circle cx="${x(w.date)}" cy="${y(w.kg)}" r="4" fill="var(--bg-elev)" stroke="var(--primary)" stroke-width="2"><title>${H.fmtDate(w.date)}: ${nf(w.kg)} kg</title></circle>`).join('')}</svg>`;
  }
  H.screens.progress = () => {
    const t = H.targets(), today = H.todayISO(), days = Array.from({ length: 7 }, (_, i) => H.addDays(today, i - 6));
    const per = days.map(d => H.sumLog(S.foodLog.filter(e => e.date === d))), maxV = Math.max(t.kcal * 1.2, ...per.map(x => x.kcal));
    const micro = H.weeklyMicroStatus(S.foodLog.filter(e => H.daysBetween(e.date, today) < 7), t);
    const last = S.weights.slice().sort((a, b) => b.date.localeCompare(a.date))[0], st = streak();
    let tip = '';
    if (micro) {
      const k = Object.keys(micro).filter(x => x !== 'vit_d').sort((a, b) => micro[a] - micro[b])[0];
      if (micro[k] < 70) { const best = H.suggest(H.ctx({ limit: 60 })).sort((a, b) => H.nutrientsOf(b.ings, b.recipe.servings).per[k] - H.nutrientsOf(a.ings, a.recipe.servings).per[k])[0]; if (best) tip = `<a class="note info" style="display:block;margin-top:12px" href="#/recipe/${best.recipe.id}">💡 ${H.MICRO_LABEL[k]} ist niedrig. Probier ${esc(best.recipe.title)}.</a>`; }
    }
    return {
      html: H.shell(`<section class="hero"><h1>Fortschritt 📈</h1><div class="row wrap"><input class="field" id="wkg" type="number" step="0.1" min="30" max="300" inputmode="decimal" placeholder="Heutiges Gewicht in kg" value="${last ? last.kg : ''}" style="flex:1;min-width:180px"><button class="btn btn-primary" data-a="weight-save">Heute wiegen</button></div></section>
        <section class="section grid g2"><div class="card"><div class="row between"><h2 style="margin:0">Gewicht</h2><div class="seg" style="width:160px"><button class="${(S.ui.wRange || 30) === 30 ? 'on' : ''}" data-a="wrange" data-v="30">30 Tage</button><button class="${S.ui.wRange === 90 ? 'on' : ''}" data-a="wrange" data-v="90">90 Tage</button></div></div>${weightChart()}<p class="small muted">Die Linie zeigt den gleitenden 7-Tage-Durchschnitt.</p></div>
        <div class="card"><h2>Kalorien, letzte 7 Tage</h2><svg class="chart" viewBox="0 0 600 190" role="img" aria-label="Kalorien der letzten 7 Tage"><line x1="20" x2="590" y1="${160 - (t.kcal / maxV) * 140}" y2="${160 - (t.kcal / maxV) * 140}" stroke="var(--warning)" stroke-dasharray="6 6"/>${per.map((v, i) => { const h = (v.kcal / maxV) * 140; return `<rect x="${34 + i * 80}" y="${160 - h}" width="46" height="${h}" rx="10" fill="${v.kcal > t.kcal * 1.1 ? 'var(--warning)' : 'var(--primary)'}"><title>${H.fmtDate(days[i])}: ${r0(v.kcal)} kcal</title></rect><text x="${57 + i * 80}" y="178" text-anchor="middle" font-size="11" fill="currentColor">${H.fmtDate(days[i]).split(' ')[0]}</text>`; }).join('')}</svg>
        <p class="small muted">Ziel: ${t.kcal} kcal · Ø Protein ${r0(per.reduce((a, b) => a + b.protein, 0) / 7)} g pro Tag</p></div></section>
        <section class="section card"><h2>Mikronährstoffe, 7-Tage-Schnitt</h2>${micro ? Object.keys(micro).sort((a, b) => micro[a] - micro[b]).map(k => `<div class="macro" style="margin:10px 0"><div class="row"><span>${H.MICRO_LABEL[k]}${k === 'vit_d' ? ' <span class="muted small">(kaum über Essen erreichbar, vor allem Sonne)</span>' : ''}</span><b style="margin-left:auto">${micro[k]} %</b></div>${H.bar(micro[k] / 100, micro[k] < 70 ? 'low' : micro[k] > 130 ? 'warn' : '')}</div>`).join('') + tip : '<p>Trage Mahlzeiten ein, dann siehst du hier, woran es dir fehlt.</p>'}</section>
        <section class="card"><h3>🔥 Streak</h3><p style="margin:0">${st ? `${st} ${st === 1 ? 'Tag' : 'Tage'} in Folge eingetragen` : 'Trage heute eine Mahlzeit ein, um deine Serie zu starten.'}</p></section>`, 'progress'),
      after: root => H.animate(root)
    };
  };
  A.wrange = el => { S.ui.wRange = +el.dataset.v; H.rerender(); };
  A['weight-save'] = async () => {
    const kg = parseFloat(H.$('#wkg').value);
    if (!(kg >= 30 && kg <= 300)) { toast('Bitte ein gültiges Gewicht eingeben.', { err: true }); return; }
    try { await H.api.logWeight(H.todayISO(), kg); S.weights = await H.api.listWeight(H.addDays(H.todayISO(), -400), H.todayISO()); H.setProf({ weight_kg: kg }); toast('Gewicht gespeichert · Ziele aktualisiert'); H.rerender(); } catch (e) { fail(e); }
  };

  /* ---------- Profil ---------- */
  const GOAL = { lose: 'Abnehmen', gain: 'Zunehmen', muscle: 'Muskelaufbau', maintain: 'Gewicht halten', healthy: 'Gesünder essen', energy: 'Mehr Energie' };
  H.screens.profile = (params) => {
    const s = params[0], p = S.profile;
    if (s) return profileSection(s);
    return {
      html: H.shell(`<section class="hero"><div class="row"><div class="logo" style="width:72px;height:72px;font-size:30px;font-weight:800">${esc((p.display_name || 'H')[0].toUpperCase())}</div><div><h1 style="margin:0">${esc(p.display_name)}</h1><p style="margin:0">${esc(S.user.email)}</p><span class="chip goodc" style="margin-top:6px">${GOAL[p.goal] || ''}</span></div></div></section>
        <section class="section card">${[['goal', '🎯', 'Ziel & Körperdaten'], ['targets', '⭕', 'Nährwertziele'], ['diet', '🥗', 'Ernährung & Allergien'], ['taste', '❤️', 'Vorlieben & Abneigungen'], ['kitchen', '🍳', 'Küche & Grundvorrat'], ['routine', '🕐', 'Alltag & Aktivität'], ['favorites', '♥', 'Favoriten'], ['blocked', '🚫', 'Ausgeblendete Rezepte'], ['appearance', '◐', 'Darstellung']].map(x => `<a class="row between" style="padding:14px 0;border-bottom:1px solid var(--border)" href="#/profile/${x[0]}"><span>${x[1]} <b>${x[2]}</b></span><span class="muted">›</span></a>`).join('')}</section>
        <section class="section"><div class="row wrap"><button class="btn" data-a="logout">Abmelden</button><button class="btn btn-danger" data-a="delete-account">Account löschen</button></div>
        <p class="small muted" style="margin-top:14px">Richtwerte nach DGE bzw. gängigen Formeln, keine medizinische Beratung. Prüfe bei Allergien immer die Verpackung.<br>Healthly 1.0</p></section>`, 'profile')
    };
  };
  function profileSection(s) {
    const p = S.profile, B = H.BODY, wrap = (title, inner) => ({ html: H.shell(`${H.back('#/profile', 'Profil')}<h1>${title}</h1>${inner}`, 'profile'), after: root => H.animate(root) });
    if (s === 'goal') return wrap('Ziel & Körperdaten', `${B.goal(p)}<h3 style="margin-top:24px">Körperdaten</h3>${B.body(p)}${['lose', 'gain'].includes(p.goal) ? `<h3 style="margin-top:24px">Tempo & Zielgewicht</h3>${B.pace(p)}` : ''}<p class="note info" style="margin-top:18px">Änderungen werden automatisch gespeichert und deine Ziele neu berechnet.</p>`);
    if (s === 'targets') { const t = H.targets(), i = (p.targets || {}).info || {}; return wrap('Nährwertziele', `<div class="grid g3 keep"><div class="card center"><div class="bignum">${t.kcal}</div><p>kcal</p></div><div class="card center"><div class="bignum">${t.protein_g}</div><p>g Protein</p></div><div class="card center"><div class="bignum">${t.fiber_g}</div><p>g Ballast.</p></div></div>
      <div class="card section"><p>${p.targets_override ? 'Du hast Werte manuell angepasst.' : 'Automatisch aus deinen Angaben berechnet.'} Grundumsatz ${i.bmr || ''} kcal, Aktivität ×${nf(i.pal || 1.55)}.</p><div class="row wrap"><button class="btn btn-primary" data-a="targets-edit">Anpassen</button><button class="btn" data-a="targets-reset">Zurücksetzen</button></div></div>
      <div class="card"><h3>Mikronährstoffe</h3>${Object.keys(t.micros).map(k => `<div class="row between small" style="padding:4px 0"><span>${H.MICRO_LABEL[k]}</span><b>${nf(t.micros[k])} ${['vit_d', 'vit_b12', 'folate', 'vit_a'].includes(k) ? 'µg' : 'mg'}</b></div>`).join('')}</div>`); }
    if (s === 'diet') return wrap('Ernährung & Allergien', `${B.diet(p)}<h3 style="margin-top:24px">Allergien & Unverträglichkeiten</h3>${B.allergy(p)}`);
    if (s === 'taste') return wrap('Vorlieben & Abneigungen', `${B.likes(p)}<h3 style="margin-top:24px">Das magst du nicht</h3>${B.dislikes(p)}`);
    if (s === 'kitchen') return wrap('Küche & Grundvorrat', B.kitchen(p));
    if (s === 'routine') return wrap('Alltag & Aktivität', `<h3>Aktivität</h3>${B.activity(p)}<h3 style="margin-top:24px">Alltag</h3>${B.routine(p)}`);
    if (s === 'favorites') { const favs = H.RECIPES.filter(r => S.favorites.includes(r.id)); return wrap('Favoriten ♥', favs.length ? `<div class="grid gauto">${favs.map(r => H.recipeCard(H.sugFor(r))).join('')}</div>` : H.empty('♡', 'Noch keine Favoriten', 'Tippe auf das Herz bei einem Rezept.', '<a class="btn btn-primary" href="#/discover">Rezepte entdecken</a>')); }
    if (s === 'blocked') { const bl = H.RECIPES.filter(r => S.blocked.includes(r.id)); return wrap('Ausgeblendete Rezepte', bl.length ? `<div class="grid">${bl.map(r => `<div class="card row between"><b>${r.emoji} ${esc(r.title)}</b><button class="btn btn-sm" data-a="block" data-id="${r.id}">Wieder zeigen</button></div>`).join('')}</div>` : H.empty('👍', 'Nichts ausgeblendet', 'Rezepte, die du nicht mehr sehen willst, erscheinen hier.')); }
    if (s === 'appearance') { const u = H.uiPrefs(); return wrap('Darstellung', `<div class="card"><div class="seg">${[['light', '☀️ Hell'], ['dark', '🌙 Dunkel'], ['system', '⚙️ System']].map(x => `<button class="${(u.theme || 'system') === x[0] ? 'on' : ''}" data-a="set-theme" data-v="${x[0]}">${x[1]}</button>`).join('')}</div><label class="row" style="margin-top:20px"><span class="switch"><input type="checkbox" data-f="reduce" ${u.reduce ? 'checked' : ''}><span></span></span><span>Animationen reduzieren</span></label></div>`); }
    location.replace('#/profile'); return '';
  }
  A['set-theme'] = el => { H.setTheme(el.dataset.v); H.$$('[data-a=set-theme]').forEach(b => b.classList.toggle('on', b === el)); };
  I.reduce = el => { H.savePrefs({ reduce: el.checked }); H.applyPrefs(); };
  A.logout = async () => { await H.api.signOut(); H.resetState(); location.hash = '#/welcome'; };
  A['delete-account'] = () => H.openSheet(`<div class="sheet-head"><h2>Account löschen?</h2></div><p>Alle deine Daten werden endgültig gelöscht. Tippe zur Bestätigung <b>LÖSCHEN</b>.</p><input class="field" id="delconf" autocomplete="off"><div class="row wrap" style="margin-top:14px"><button class="btn btn-danger" data-a="delete-go">Endgültig löschen</button><button class="btn" data-a="close-sheet">Abbrechen</button></div>`);
  A['delete-go'] = async () => {
    if (H.$('#delconf').value.trim() !== 'LÖSCHEN') { toast('Bitte genau LÖSCHEN eintippen.', { err: true }); return; }
    try { await H.api.deleteAccount(); H.resetState(); H.closeSheet(); toast('Account gelöscht'); location.hash = '#/welcome'; } catch (e) { fail(e); }
  };

  /* Schnellmenü */
  A.quick = () => H.openSheet(`<div class="sheet-head"><h2>Schnell hinzufügen</h2><button class="iconbtn" data-a="close-sheet" aria-label="Schließen">✕</button></div><div class="grid"><a class="btn" data-a="go" data-to="#/pantry">🥕 Zutat in den Vorrat</a><a class="btn" data-a="go" data-to="#/shopping">🛒 Artikel auf die Liste</a><button class="btn" data-a="log-quick">🍽️ Mahlzeit eintragen</button><a class="btn" data-a="go" data-to="#/progress">⚖️ Gewicht eintragen</a></div>`);
})();
