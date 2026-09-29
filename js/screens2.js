/* Healthly – Screens 2: Entdecken, Rezept, Kochmodus */
(function () {
  const H = window.HD, S = H.S, A = H.actions, I = H.inputs;
  const { esc, nf, r0, toast, fail } = H;
  const MEAL = H.MEAL;
  const F = () => S.ui.filters;

  /* ---------- Entdecken ---------- */
  const TAGS = [['quick', 'Schnell'], ['meal_prep', 'Meal Prep'], ['one_pot', 'One Pot'], ['no_cook', 'Ohne Kochen'], ['budget', 'Günstig'], ['high_protein', 'High Protein'], ['low_calorie', 'Leicht']];
  const activeCount = () => { const f = F(); return (f.max_time ? 1 : 0) + (f.pantry_mode && f.pantry_mode !== 'any' ? 1 : 0) + (f.difficulty ? 1 : 0) + (f.cuisine ? 1 : 0) + (f.tags || []).length + (f.use_up || []).length + (f.utensils ? 1 : 0); };
  const list = () => H.suggest(H.ctx({ ...F(), limit: 300 }));
  function syncHash() {
    const f = F(), q = new URLSearchParams();
    if (f.meal_type) q.set('meal', f.meal_type);
    if (f.max_time) q.set('max_time', f.max_time);
    if (f.pantry_mode && f.pantry_mode !== 'any') q.set('pantry', f.pantry_mode);
    if ((f.use_up || []).length) q.set('use_up', f.use_up.join(','));
    history.replaceState(null, '', '#/discover' + (q.toString() ? '?' + q : ''));
  }
  function resultsHtml() {
    const all = list(), n = S.ui.shown, part = all.slice(0, n);
    if (!all.length) return H.empty('🤔', 'Nichts gefunden', 'Lockere die Filter, dann finden wir bestimmt etwas.', '<button class="btn btn-soft" data-a="f-reset">Filter zurücksetzen</button>');
    return `<div class="grid gauto">${part.map(H.recipeCard).join('')}</div>${all.length > n ? `<div class="center" style="margin-top:16px"><button class="btn" data-a="f-more">Mehr anzeigen (${all.length - n})</button></div>` : ''}`;
  }
  function drawResults() {
    const box = H.$('#results'); if (!box) return;
    box.innerHTML = resultsHtml(); H.animate(box);
    const c = H.$('#dcount'); if (c) c.textContent = list().length;
    const fc = H.$('#fcount'); if (fc) fc.textContent = activeCount() ? `Filter (${activeCount()})` : 'Filter';
  }
  H.screens.discover = (params, query) => {
    const f = F();
    if ([...query.keys()].length) {
      f.meal_type = query.get('meal') || null; f.max_time = +query.get('max_time') || null; f.pantry_mode = query.get('pantry') || null;
      f.use_up = query.get('use_up') ? query.get('use_up').split(',') : [];
    }
    S.ui.shown = 12;
    const meals = [[null, 'Alle', ''], ['breakfast', 'Frühstück', '🌅'], ['lunch', 'Mittag', '☀️'], ['dinner', 'Abend', '🌙'], ['snack', 'Snack', '🍎'], ['dessert', 'Dessert', '🍰'], ['drink', 'Drinks', '🥤']];
    return {
      html: H.shell(`<section class="hero"><h1>Entdecken 🔍</h1>
        <div class="row"><input class="field" id="dsearch" data-f="dsearch" placeholder="Rezept, Küche oder Zutat suchen" value="${esc(f.query || '')}" type="search"><button class="btn btn-soft" id="fcount" data-a="f-open">${activeCount() ? `Filter (${activeCount()})` : 'Filter'}</button></div>
        <div class="chips" style="margin-top:12px" id="mealchips">${meals.map(m => `<button class="chip ${(f.meal_type || null) === m[0] ? 'on' : ''}" data-a="f-meal" data-v="${m[0] || ''}">${m[2]} ${m[1]}</button>`).join('')}</div></section>
        <section class="section"><div class="section-head"><h2><span id="dcount">${list().length}</span> Ideen</h2></div><div id="results">${resultsHtml()}</div></section>`, 'discover'),
      after: root => H.animate(root)
    };
  };
  A['f-meal'] = el => { F().meal_type = el.dataset.v || null; S.ui.shown = 12; H.$$('#mealchips .chip').forEach(c => c.classList.toggle('on', c === el)); syncHash(); drawResults(); };
  A['f-more'] = () => { S.ui.shown += 12; drawResults(); };
  A['f-reset'] = () => { S.ui.filters = { query: F().query || '', meal_type: F().meal_type || null }; syncHash(); drawResults(); H.closeSheet(); };
  I.dsearch = H.debounce(el => { F().query = el.value; S.ui.shown = 12; drawResults(); }, 150);
  A['f-open'] = () => {
    const f = F(), p = S.profile, uts = f.utensils || p.utensils, cuis = [...new Set(H.RECIPES.map(r => r.cuisine))];
    const chip = (k, v, l, on) => `<button class="chip ${on ? 'on' : ''}" data-a="f-set" data-k="${k}" data-v="${v}">${l}</button>`;
    const pantryItems = S.pantry.filter(x => x.ingredient_id && x.kind !== 'leftover');
    H.openSheet(`<div class="sheet-head"><h2>Filter</h2><button class="iconbtn" data-a="close-sheet" aria-label="Schließen">✕</button></div>
      <h3>Dauer</h3><div class="chips">${[10, 15, 20, 30, 45, 60].map(m => chip('max_time', m, '≤ ' + m + ' Min', f.max_time === m)).join('')}${chip('max_time', '', 'Egal', !f.max_time)}</div>
      <h3 style="margin-top:20px">Vorrat</h3><div class="seg">${[['any', 'Egal'], ['max_missing_2', 'Max. 2 fehlen'], ['only_pantry', 'Nur was ich habe']].map(x => `<button class="${(f.pantry_mode || 'any') === x[0] ? 'on' : ''}" data-a="f-set" data-k="pantry_mode" data-v="${x[0]}">${x[1]}</button>`).join('')}</div>
      <h3 style="margin-top:20px">Schwierigkeit</h3><div class="chips">${[['easy', 'Einfach'], ['medium', 'Mittel'], ['hard', 'Anspruchsvoll']].map(x => chip('difficulty', x[0], x[1], f.difficulty === x[0])).join('')}${chip('difficulty', '', 'Egal', !f.difficulty)}</div>
      <h3 style="margin-top:20px">Küche</h3><div class="chips">${cuis.map(c => chip('cuisine', c, H.CUISINE_LABEL[c] || c, f.cuisine === c)).join('')}${chip('cuisine', '', 'Alle', !f.cuisine)}</div>
      <h3 style="margin-top:20px">Eigenschaften</h3><div class="chips">${TAGS.map(t => `<button class="chip ${(f.tags || []).includes(t[0]) ? 'on' : ''}" data-a="f-tag" data-v="${t[0]}">${t[1]}</button>`).join('')}</div>
      <h3 style="margin-top:20px">Geräte für diese Suche</h3><div class="chips">${H.UTENSILS.map(u => `<button class="chip ${uts.includes(u[0]) ? 'on' : ''}" data-a="f-ut" data-v="${u[0]}">${u[1]} ${u[2]}</button>`).join('')}</div><button class="btn btn-ghost btn-sm" data-a="f-ut-reset">Auf Profil zurücksetzen</button>
      ${pantryItems.length ? `<h3 style="margin-top:20px">Das muss weg (Resteverwertung)</h3><div class="chips">${pantryItems.sort((a, b) => (a.expires_on || 'z').localeCompare(b.expires_on || 'z')).map(x => `<button class="chip ${(f.use_up || []).includes(x.ingredient_id) ? 'on' : ''}" data-a="f-use" data-v="${x.ingredient_id}">${esc(x.name)}</button>`).join('')}</div>` : ''}
      <div class="row wrap" style="margin-top:22px"><button class="btn btn-primary" style="flex:1" data-a="close-sheet"><span id="fsheetcount">${list().length}</span>&nbsp;Rezepte anzeigen</button><button class="btn" data-a="f-reset">Zurücksetzen</button></div>`);
  };
  const afterF = el => {
    S.ui.shown = 12; syncHash(); drawResults();
    const c = H.$('#fsheetcount'); if (c) c.textContent = list().length;
    return el;
  };
  A['f-set'] = el => {
    const k = el.dataset.k, v = el.dataset.v;
    F()[k] = k === 'max_time' ? (+v || null) : (v || null);
    const scope = el.parentElement; scope.querySelectorAll('[data-k="' + k + '"]').forEach(b => b.classList.toggle('on', b === el));
    afterF();
  };
  A['f-tag'] = el => { const f = F(); f.tags = f.tags || []; const on = !f.tags.includes(el.dataset.v); f.tags = on ? [...f.tags, el.dataset.v] : f.tags.filter(x => x !== el.dataset.v); el.classList.toggle('on', on); afterF(); };
  A['f-use'] = el => { const f = F(); f.use_up = f.use_up || []; const on = !f.use_up.includes(el.dataset.v); f.use_up = on ? [...f.use_up, el.dataset.v] : f.use_up.filter(x => x !== el.dataset.v); el.classList.toggle('on', on); afterF(); };
  A['f-ut'] = el => { const f = F(); f.utensils = [...(f.utensils || S.profile.utensils)]; const on = !f.utensils.includes(el.dataset.v); f.utensils = on ? [...f.utensils, el.dataset.v] : f.utensils.filter(x => x !== el.dataset.v); el.classList.toggle('on', on); afterF(); };
  A['f-ut-reset'] = () => { F().utensils = null; H.closeSheet(); A['f-open'](); afterF(); };

  /* ---------- Favoriten ---------- */
  A.fav = async el => {
    try {
      const id = el.dataset.id, on = await H.api.toggleFavorite(id);
      S.favorites = await H.api.listFavorites();
      H.$$(`[data-a=fav][data-id="${id}"]`).forEach(b => { b.textContent = on ? '♥' : '♡'; b.setAttribute('aria-pressed', on); });
      H.haptic('light'); toast(on ? 'Als Favorit gespeichert' : 'Favorit entfernt');
    } catch (e) { fail(e); }
  };
  A['open-recipe'] = el => { location.hash = '#/recipe/' + el.dataset.id; };

  /* ---------- Rezept ---------- */
  const servFor = (r, q) => +q.get('servings') || S.ui.recServ[r.id] || Math.max(0.5, S.profile.household_size || 1);
  let curQuery = new URLSearchParams();
  H.screens.recipe = (params, query) => {
    const r = H.recipeById(params[0]);
    if (!r) return { html: H.shell(H.empty('🍽️', 'Rezept nicht gefunden', 'Vielleicht wurde es entfernt.', '<a class="btn btn-primary" href="#/discover">Zu den Rezepten</a>'), 'discover') };
    curQuery = query;
    const sv = servFor(r, query); S.ui.recServ[r.id] = sv;
    const rv = H.recipeView(r, S.profile, sv, S.pantry), sug = H.suggest(H.ctx({ query: '', limit: 300 })).find(x => x.recipe.id === r.id);
    const t = H.targets(), n = rv.nutrition, per = n.per, shown = S.ui.nutriTab === 'total' ? H.scaleN(per, sv) : per, f = S.ui.nutriTab === 'total' ? sv : 1;
    const fav = S.favorites.includes(r.id), info = H.recipeInfo(r);
    const swapTxt = Object.entries(rv.res.swaps).map(([a, b]) => `${esc(H.ing(b).name)} statt ${esc(H.ing(a).name)}`).concat(rv.res.dropped.map(d => `ohne ${esc(H.ing(d).name)}`));
    const bad = rv.res.ok ? [] : r.ingredients.filter(x => H.problem(H.ing(x.ing), S.profile)).map(x => H.ing(x.ing).name);
    const missing = rv.match.missing.length;
    const done = S.ui.ingDone || (S.ui.ingDone = {});
    const ALG = { gluten: 'Gluten', crustaceans: 'Krebstiere', eggs: 'Eier', fish: 'Fisch', peanuts: 'Erdnüsse', soy: 'Soja', milk: 'Milch', nuts: 'Schalenfrüchte', celery: 'Sellerie', mustard: 'Senf', sesame: 'Sesam' };
    const pctRow = (label, v, target, cls, unit, cap) => `<div class="macro" style="margin:8px 0"><div class="row"><span>${label}</span><b style="margin-left:auto">${nf(v)} ${unit} <span class="muted small">(${target ? r0((per[cap] / target) * 100) : 0} % Tagesziel)</span></b></div>${H.bar(target ? per[cap] / target : 0, cls)}</div>`;
    const status = x => H.isStaple(x.ing, S.profile) ? '🧂' : (rv.idx.get(x.ing) || 0) >= x.g * 0.8 ? '✅' : (rv.idx.get(x.ing) || 0) > 0 ? '◐' : '○';
    return {
      html: H.shell(`<div class="hero-wrap"><div class="hero-art" style="background:linear-gradient(135deg,${r.gradient[0]},${r.gradient[1]});position:relative;overflow:hidden">${r.emoji}${H.imgTag(r)}</div>
        <a class="iconbtn" style="left:12px" href="javascript:history.back()" aria-label="Zurück">‹</a><button class="iconbtn" style="right:12px" data-a="fav" data-id="${r.id}" aria-label="Favorit" aria-pressed="${fav}">${fav ? '♥' : '♡'}</button></div>
        <h1>${esc(r.title)}</h1><p>${esc(r.subtitle)}</p>
        <div class="chips"><span class="chip">⏱ ${r.prep_min + r.cook_min} Min${r.rest_min ? ` + ${r.rest_min >= 60 ? nf(r.rest_min / 60) + ' Std' : r.rest_min + ' Min'} Ruhezeit` : ''}</span><span class="chip">📊 ${{ easy: 'Einfach', medium: 'Mittel', hard: 'Anspruchsvoll' }[r.difficulty]}</span>${r.spice ? `<span class="chip">${'🌶️'.repeat(r.spice)}</span>` : ''}<span class="chip">💶 ${{ low: 'Günstig', medium: 'Normal', high: 'Teurer' }[r.cost]}</span><span class="chip">${H.CUISINE_LABEL[r.cuisine]}</span></div>
        ${sug && sug.reasons.length ? `<div class="chips" style="margin-top:12px">${sug.reasons.map(x => `<span class="chip goodc">${esc(x)}</span>`).join('')}</div>` : ''}
        ${swapTxt.length ? `<div class="note" style="margin-top:14px">🔁 Für dich angepasst: ${swapTxt.join(' · ')}</div>` : ''}
        ${bad.length ? `<div class="note" style="margin-top:14px;background:var(--danger-50)">⚠️ Enthält Zutaten, die nicht zu deinem Profil passen: ${esc(bad.join(', '))}</div>` : ''}
        <section class="section grid g2">
          <div class="card"><div class="row between wrap"><h2 style="margin:0">Zutaten</h2><span class="stepper"><button data-a="serv" data-d="-0.5" aria-label="Weniger Portionen">−</button><b>${nf(sv)} ${sv === 1 ? 'Portion' : 'Portionen'}</b><button data-a="serv" data-d="0.5" aria-label="Mehr Portionen">+</button></span></div>
            <div style="margin-top:10px">${rv.ings.map(x => `<div class="ing ${done[x.ing] ? 'done' : ''}" data-a="ing-done" data-id="${x.ing}"><span class="st" title="Status">${status(x)}</span><span class="nm">${esc(H.ing(x.ing).name)}${x.optional ? ' <span class="muted small">(optional)</span>' : ''}</span><span class="qt">${H.fmtQty(x.ing, x.g)}</span></div>`).join('')}</div>
            <p class="small muted" style="margin-top:8px">✅ da · ◐ teilweise · ○ fehlt · 🧂 Grundvorrat</p>
            <button class="btn btn-soft btn-block" data-a="shop-missing" ${missing ? '' : 'disabled'}>🛒 Fehlende Zutaten auf die Liste (${missing})</button></div>
          <div class="card"><div class="row between"><h2 style="margin:0">Nährwerte</h2><div class="seg" style="width:190px"><button class="${S.ui.nutriTab !== 'total' ? 'on' : ''}" data-a="ntab" data-v="per">Pro Portion</button><button class="${S.ui.nutriTab === 'total' ? 'on' : ''}" data-a="ntab" data-v="total">Gesamt</button></div></div>
            <div class="bignum" style="margin:10px 0 2px">${r0(shown.kcal)} <small>kcal</small></div>
            ${pctRow('Protein', shown.protein, t.protein_g * f, 'protein', 'g', 'protein')}${pctRow('Kohlenhydrate', shown.carbs, t.carbs_g * f, 'carbs', 'g', 'carbs')}${pctRow('Fett', shown.fat, t.fat_g * f, 'fat', 'g', 'fat')}${pctRow('Ballaststoffe', shown.fiber, t.fiber_g * f, 'fiber', 'g', 'fiber')}${pctRow('Zucker', shown.sugar, t.sugar_max_g * f, 'warn', 'g', 'sugar')}${pctRow('Salz', shown.salt, t.salt_max_g * f, 'warn', 'g', 'salt')}
            <details><summary class="link" style="cursor:pointer">Vitamine & Mineralstoffe</summary>${Object.keys(t.micros).map(k => `<div class="macro" style="margin:8px 0"><div class="row"><span>${H.MICRO_LABEL[k]}</span><b style="margin-left:auto">${nf(shown[k])} ${['vit_d', 'vit_b12', 'folate', 'vit_a'].includes(k) ? 'µg' : 'mg'} <span class="muted small">(${r0((per[k] / t.micros[k]) * 100)} %)</span></b></div>${H.bar(per[k] / t.micros[k], '')}</div>`).join('')}</details>
            <div class="chips" style="margin-top:12px">${info.allergens.length ? `<span class="chip warnc">Enthält: ${info.allergens.map(a => ALG[a] || a).join(', ')}</span>` : ''}${info.vegan ? '<span class="chip goodc">🌿 vegan</span>' : info.vegetarian ? '<span class="chip goodc">🥕 vegetarisch</span>' : info.pescetarian ? '<span class="chip goodc">🐟 pescetarisch</span>' : ''}${info.gluten_free ? '<span class="chip goodc">glutenfrei</span>' : ''}${info.lactose_free ? '<span class="chip goodc">laktosefrei</span>' : ''}</div>
            <p class="small muted" style="margin-top:8px">Allergene und Diät-Eignung beziehen sich auf das Originalrezept, bevor Ersatzzutaten greifen.</p></div></section>
        <section class="section"><h2>Zubereitung</h2><div class="card">${r.steps.map((s, i) => `<div class="step"><span class="n">${i + 1}</span><div><div>${esc(s.text)}</div>${s.timer_min ? `<span class="chip" style="margin-top:6px">⏱ ${s.timer_min} Min</span>` : ''}</div></div>`).join('')}</div>
          ${r.tip || r.storage ? `<div class="note info" style="margin-top:12px">${r.tip ? '💡 ' + esc(r.tip) : ''}${r.tip && r.storage ? '<br>' : ''}${r.storage ? '🧊 ' + esc(r.storage) : ''}</div>` : ''}</section>
        <div class="row wrap" style="margin-bottom:20px"><button class="btn btn-primary" style="flex:1" data-a="cook-start" data-id="${r.id}">👨‍🍳 Kochen starten</button><button class="btn" data-a="plan-add" data-id="${r.id}">📅 In den Plan</button><button class="btn" data-a="cooked" data-id="${r.id}">✓ Gekocht</button></div>
        <div class="card"><div class="row between wrap"><div><b>Deine Bewertung</b><div class="stars" role="group" aria-label="Bewertung">${[1, 2, 3, 4, 5].map(i => `<button class="${(S.ratings[r.id] || 0) >= i ? 'on' : ''}" data-a="rate" data-id="${r.id}" data-v="${i}" aria-label="${i} Sterne">★</button>`).join('')}</div></div>
          <div class="row wrap"><button class="btn btn-sm" data-a="share" data-id="${r.id}">Teilen</button><button class="btn btn-sm btn-danger" data-a="block" data-id="${r.id}">${S.blocked.includes(r.id) ? 'Wieder vorschlagen' : 'Nicht mehr vorschlagen'}</button></div></div></div>`, 'discover'),
      after: root => H.animate(root)
    };
  };
  A.serv = el => {
    const id = location.hash.split('/')[2].split('?')[0], v = Math.max(0.5, Math.min(12, (S.ui.recServ[id] || 1) + +el.dataset.d));
    S.ui.recServ[id] = v; curQuery = new URLSearchParams(); H.rerender();
  };
  A['ing-done'] = el => { const d = S.ui.ingDone || (S.ui.ingDone = {}); d[el.dataset.id] = !d[el.dataset.id]; el.classList.toggle('done', d[el.dataset.id]); };
  A.ntab = el => { S.ui.nutriTab = el.dataset.v; H.rerender(); };
  const curRecipe = () => H.recipeById(location.hash.split('/')[2].split('?')[0]);
  A['shop-missing'] = async () => {
    const r = curRecipe(), sv = S.ui.recServ[r.id], snap = JSON.parse(JSON.stringify(S.shopping));
    const miss = H.missingForRecipe(r, sv, S.pantry, S.profile);
    if (!miss.length) { toast('Du hast schon alles da.'); return; }
    try {
      const ups = H.mergeShopping(S.shopping, miss);
      for (const u of ups) await H.api.upsertShoppingItem(u);
      S.shopping = await H.api.listShopping();
      toast(`${miss.length} Zutaten auf der Liste`, { undo: async () => {
        for (const u of ups) { const old = snap.find(s => s.id === u.id); if (old) await H.api.upsertShoppingItem(old); else await H.api.deleteShoppingItem(u.id); }
        S.shopping = await H.api.listShopping(); H.rerender();
      } });
      H.haptic('success'); H.rerender();
    } catch (e) { fail(e); }
  };
  A.rate = async el => {
    const r = H.recipeById(el.dataset.id), v = +el.dataset.v;
    try {
      await H.api.rateRecipe(r.id, v); S.ratings[r.id] = v;
      H.setProf({ taste_affinity: H.updateAffinity(S.profile, r, v) }, false);
      toast('Danke für deine Bewertung!');
      if (v === 1) { H.confirmSheet('Nie wieder vorschlagen?', `Sollen wir „${r.title}“ ausblenden?`, 'Ja, ausblenden', async () => { await H.api.toggleBlocked(r.id); S.blocked = await H.api.listBlocked(); toast('Ausgeblendet'); H.rerender(); }); }
      H.rerender();
    } catch (e) { fail(e); }
  };
  A.block = async el => {
    try { const on = await H.api.toggleBlocked(el.dataset.id); S.blocked = await H.api.listBlocked(); toast(on ? 'Wird nicht mehr vorgeschlagen' : 'Wird wieder vorgeschlagen'); H.rerender(); } catch (e) { fail(e); }
  };
  A.share = async el => {
    const r = H.recipeById(el.dataset.id), text = `${r.title} – gefunden bei Healthly`;
    try { if (navigator.share) await navigator.share({ title: r.title, text, url: location.href }); else { await navigator.clipboard.writeText(text + ' ' + location.href); toast('Link kopiert'); } } catch (e) { /* abgebrochen */ }
  };

  /* Plan-Sheet */
  A['plan-add'] = el => {
    const r = H.recipeById(el.dataset.id), today = H.todayISO(), days = Array.from({ length: 14 }, (_, i) => H.addDays(today, i));
    const sug = ['breakfast', 'lunch', 'dinner', 'snack'].find(m => r.meal_types.includes(m)) || (r.meal_types.some(m => ['dessert', 'drink'].includes(m)) ? 'snack' : 'dinner');
    H.openSheet(`<div class="sheet-head"><h2>In den Plan</h2><button class="iconbtn" data-a="close-sheet" aria-label="Schließen">✕</button></div>
      <div class="form"><label class="label">Tag<select class="field" id="pa-date">${days.map(d => `<option value="${d}">${H.fmtDate(d)}</option>`).join('')}</select></label>
      <label class="label">Mahlzeit<select class="field" id="pa-meal">${['breakfast', 'lunch', 'dinner', 'snack'].map(m => `<option value="${m}" ${m === sug ? 'selected' : ''}>${MEAL[m][0]}</option>`).join('')}</select></label>
      <button class="btn btn-primary" data-a="plan-add-go" data-id="${r.id}">Hinzufügen</button></div>`);
  };
  A['plan-add-go'] = async el => {
    const date = H.$('#pa-date').value, meal = H.$('#pa-meal').value, wk = H.mondayISO(date);
    try {
      const e = await H.api.upsertMealPlanEntry({ date, meal_type: meal, slot: 0, recipe_id: el.dataset.id, servings: S.ui.recServ[el.dataset.id] || S.profile.household_size || 1, is_leftover: false, locked: false });
      S.planByWeek[wk] = await H.api.listMealPlan(wk); H.closeSheet(); toast('Zum Plan hinzugefügt ✓'); void e;
    } catch (er) { fail(er); }
  };

  /* Gekocht-Sheet */
  A.cooked = el => {
    const r = H.recipeById(el.dataset.id), cooked = S.ui.recServ[r.id] || r.servings;
    const meal = ['breakfast', 'lunch', 'dinner', 'snack'].find(m => r.meal_types.includes(m)) || 'snack';
    S.ui.cookedSheet = { id: r.id, cooked, eaten: Math.min(1, cooked) };
    openCooked(meal);
  };
  function openCooked(meal) {
    const c = S.ui.cookedSheet, r = H.recipeById(c.id), rest = Math.max(0, c.cooked - c.eaten);
    H.openSheet(`<div class="sheet-head"><h2>Gekocht ✓</h2><button class="iconbtn" data-a="close-sheet" aria-label="Schließen">✕</button></div>
      <p>${esc(r.title)}</p>
      <div class="form"><div class="row between card"><b>Portionen gekocht</b><span class="stepper"><button data-a="ck-cooked" data-d="-0.5" aria-label="Weniger">−</button><b id="ck-c">${nf(c.cooked)}</b><button data-a="ck-cooked" data-d="0.5" aria-label="Mehr">+</button></span></div>
      <div class="row between card"><b>Davon gegessen</b><span class="stepper"><button data-a="ck-eaten" data-d="-0.5" aria-label="Weniger">−</button><b id="ck-e">${nf(c.eaten)}</b><button data-a="ck-eaten" data-d="0.5" aria-label="Mehr">+</button></span></div>
      <label class="label">Mahlzeit<select class="field" id="ck-meal">${['breakfast', 'lunch', 'dinner', 'snack'].map(m => `<option value="${m}" ${m === meal ? 'selected' : ''}>${MEAL[m][0]}</option>`).join('')}</select></label>
      <label class="row card"><span class="switch"><input type="checkbox" id="ck-deduct" checked><span></span></span><span>Zutaten vom Vorrat abziehen</span></label>
      <p class="note info" id="ck-rest">${rest > 0 ? `🍱 ${nf(rest)} ${rest === 1 ? 'Portion' : 'Portionen'} bleiben übrig und landen als Rest im Kühlschrank.` : 'Es bleibt nichts übrig.'}</p>
      <button class="btn btn-primary btn-block" data-a="ck-save">Eintragen</button></div>`);
  }
  A['ck-cooked'] = el => {
    const c = S.ui.cookedSheet; c.cooked = Math.max(0.5, Math.min(24, c.cooked + +el.dataset.d)); c.eaten = Math.min(c.eaten, c.cooked);
    H.$('#ck-c').textContent = nf(c.cooked); H.$('#ck-e').textContent = nf(c.eaten); const rest = Math.max(0, c.cooked - c.eaten);
    H.$('#ck-rest').textContent = rest > 0 ? `🍱 ${nf(rest)} ${rest === 1 ? 'Portion' : 'Portionen'} bleiben übrig und landen als Rest im Kühlschrank.` : 'Es bleibt nichts übrig.';
  };
  A['ck-eaten'] = el => {
    const c = S.ui.cookedSheet; c.eaten = Math.max(0.5, Math.min(c.cooked, c.eaten + +el.dataset.d));
    H.$('#ck-e').textContent = nf(c.eaten); const rest = Math.max(0, c.cooked - c.eaten);
    H.$('#ck-rest').textContent = rest > 0 ? `🍱 ${nf(rest)} ${rest === 1 ? 'Portion' : 'Portionen'} bleiben übrig und landen als Rest im Kühlschrank.` : 'Es bleibt nichts übrig.';
  };
  A['ck-save'] = async () => {
    const c = S.ui.cookedSheet, r = H.recipeById(c.id), meal = H.$('#ck-meal').value, deduct = H.$('#ck-deduct').checked, today = H.todayISO();
    try {
      const per = H.recipeView(r, S.profile, c.cooked, S.pantry).nutrition.per;
      await H.api.logFood({ date: today, meal_type: meal, recipe_id: r.id, title: r.title, servings: c.eaten, source: 'recipe', nutrition: H.scaleN(per, c.eaten) });
      if (deduct) { const d = H.deductPantry(S.pantry, r, c.cooked, S.profile); for (const u of d.updates) await H.api.upsertPantryItem(u); for (const id of d.deletions) await H.api.deletePantryItem(id); }
      const rest = c.cooked - c.eaten;
      if (rest > 0.01) await H.api.upsertPantryItem(H.makeLeftover(r, rest, today));
      S.pantry = await H.api.listPantry(); await H.reloadLog(); H.closeSheet(); H.confetti(); H.haptic('success');
      toast('Guten Appetit! Mahlzeit eingetragen ✓');
      if (!S.ratings[r.id]) askRating(r);
      else H.rerender();
    } catch (e) { fail(e); }
  };
  function askRating(r) {
    H.openSheet(`<div class="sheet-head"><h2>Wie war ${esc(r.title)}?</h2></div><div class="stars" style="justify-content:center;margin:10px 0 18px">${[1, 2, 3, 4, 5].map(i => `<button data-a="rate-sheet" data-id="${r.id}" data-v="${i}" aria-label="${i} Sterne">★</button>`).join('')}</div><button class="btn btn-block" data-a="close-sheet">Später</button>`);
  }
  A['rate-sheet'] = async el => { H.closeSheet(); await A.rate(el); };

  /* ---------- Kochmodus ---------- */
  let tickId = null, wake = null, speechOn = false;
  function gong() {
    try {
      const ac = H.ac || (H.ac = new (window.AudioContext || window.webkitAudioContext)()); if (ac.state === 'suspended') ac.resume();
      [523.25, 659.25, 783.99, 1046.5].forEach((fr, i) => { const o = ac.createOscillator(), g = ac.createGain(), t = ac.currentTime + i * 0.28; o.type = 'sine'; o.frequency.value = fr; g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.3, t + 0.03); g.gain.exponentialRampToValueAtTime(0.0001, t + 1.5); o.connect(g); g.connect(ac.destination); o.start(t); o.stop(t + 1.6); });
    } catch (e) { /* kein Ton möglich */ }
  }
  async function lockScreen() { try { if ('wakeLock' in navigator) wake = await navigator.wakeLock.request('screen'); } catch (e) { /* egal */ } }
  const onVis = () => { if (document.visibilityState === 'visible' && S.cook) lockScreen(); };
  function stopCook() {
    clearInterval(tickId); tickId = null; S.cook = null;
    try { if (wake) wake.release(); } catch (e) { /* egal */ } wake = null;
    document.removeEventListener('visibilitychange', onVis);
    try { speechSynthesis.cancel(); } catch (e) { /* egal */ }
  }
  const mmss = s => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  function drawTimers() {
    const box = H.$('#timers'); if (!box || !S.cook) return;
    const now = Date.now();
    box.innerHTML = S.cook.timers.map(t => {
      const left = Math.max(0, Math.round((t.end - now) / 1000));
      return `<div class="tpill ${t.done ? 'done' : ''}">⏱ Schritt ${t.step} · ${t.done ? 'fertig!' : mmss(left)}<button class="btn btn-sm" style="min-height:28px;padding:0 10px;background:rgba(255,255,255,.2);color:inherit" data-a="timer-x" data-id="${t.id}">✕</button></div>`;
    }).join('');
  }
  function tick() {
    if (!S.cook) return;
    S.cook.timers.forEach(t => { if (!t.done && Date.now() >= t.end) { t.done = true; gong(); H.haptic('success'); try { navigator.vibrate && navigator.vibrate([300, 150, 300, 150, 300]); } catch (e) { /* egal */ } toast(`Timer für Schritt ${t.step} ist fertig!`); } });
    drawTimers();
  }
  H.screens.cook = (params, query) => {
    const r = H.recipeById(params[0]);
    if (!r) { location.replace('#/discover'); return ''; }
    if (!S.cook || S.cook.id !== r.id) {
      S.cook = { id: r.id, step: 0, servings: +query.get('servings') || S.ui.recServ[r.id] || S.profile.household_size || 1, timers: [], back: false };
      lockScreen(); document.addEventListener('visibilitychange', onVis); tickId = setInterval(tick, 500);
      const key = e => { if (!S.cook || e.target.matches('input,select,textarea')) return; if (e.key === 'ArrowRight') A['cook-next'](); if (e.key === 'ArrowLeft') A['cook-prev'](); };
      document.addEventListener('keydown', key);
      H.cleanups.push(stopCook, () => document.removeEventListener('keydown', key));
    }
    const c = S.cook, n = r.steps.length, rv = H.recipeView(r, S.profile, c.servings, S.pantry), back = c.back; c.back = false;
    let body;
    if (c.step === 0) body = `<p class="muted">Mise en place</p><div class="cook-text">Alles bereit? Hake deine Zutaten ab.</div>${rv.ings.map(x => `<label class="card row" style="margin-bottom:8px;cursor:pointer" data-a="mise" data-id="${x.ing}"><span class="check ${(c.mise || {})[x.ing] ? 'on' : ''}">${H.checkSvg}</span><span style="flex:1">${esc(H.ing(x.ing).name)}</span><b>${H.fmtQty(x.ing, x.g)}</b></label>`).join('')}`;
    else if (c.step <= n) { const s = r.steps[c.step - 1]; body = `<p class="muted">Schritt ${c.step} von ${n}</p><div class="cook-text">${esc(s.text)}</div>${s.timer_min ? `<button class="btn btn-primary bigtimer" data-a="timer-go" data-min="${s.timer_min}" data-step="${c.step}">⏱ Timer ${s.timer_min} Min starten</button>` : ''}`; }
    else body = `<div class="empty"><span class="em">🎉</span><h1>Fertig!</h1><p>Guten Appetit. Trag die Mahlzeit ein, dann stimmen deine Tagesbilanz und dein Vorrat.</p><button class="btn btn-primary" data-a="cooked" data-id="${r.id}">✓ Gekocht eintragen</button></div>`;
    return {
      html: `<div class="cook"><div class="cook-in"><div class="row between"><button class="iconbtn" data-a="cook-exit" aria-label="Schließen">✕</button><b style="text-align:center;flex:1">${esc(r.title)}</b><button class="iconbtn" data-a="speak" aria-label="Vorlesen">🔊</button></div>
        <div class="segs">${Array.from({ length: n + 2 }, (_, i) => `<i class="${i <= c.step ? 'on' : ''}"></i>`).join('')}</div>
        <div class="cook-body ${back ? 'back' : ''}" id="cookbody">${body}</div>
        <div class="row" style="margin-top:20px"><button class="btn" style="flex:1" data-a="cook-prev" ${c.step === 0 ? 'disabled' : ''}>‹ Zurück</button><button class="btn btn-primary" style="flex:2" data-a="cook-next" ${c.step > n ? 'disabled' : ''}>${c.step === n ? 'Fertig' : 'Weiter ›'}</button></div></div>
        <div class="timers" id="timers"></div></div>`,
      after: root => {
        drawTimers(); H.animate(root);
        let x0 = null; const el = H.$('.cook');
        const ts = e => { x0 = e.touches[0].clientX; }, te = e => { if (x0 == null) return; const dx = e.changedTouches[0].clientX - x0; x0 = null; if (Math.abs(dx) > 70) (dx < 0 ? A['cook-next'] : A['cook-prev'])(); };
        el.addEventListener('touchstart', ts, { passive: true }); el.addEventListener('touchend', te);
      }
    };
  };
  A['cook-next'] = () => { const r = H.recipeById(S.cook.id); if (S.cook.step <= r.steps.length) { S.cook.step++; if (S.cook.step > r.steps.length) H.confetti(); H.rerender(); } };
  A['cook-prev'] = () => { if (S.cook.step > 0) { S.cook.step--; S.cook.back = true; H.rerender(); } };
  A.mise = el => { S.cook.mise = S.cook.mise || {}; S.cook.mise[el.dataset.id] = !S.cook.mise[el.dataset.id]; el.querySelector('.check').classList.toggle('on', S.cook.mise[el.dataset.id]); };
  A['cook-exit'] = () => {
    if (S.cook && S.cook.step > 0 && S.cook.step <= H.recipeById(S.cook.id).steps.length) H.confirmSheet('Kochen beenden?', 'Deine Timer werden dann gestoppt.', 'Beenden', () => { const id = S.cook.id; stopCook(); location.hash = '#/recipe/' + id; });
    else { const id = S.cook.id; stopCook(); location.hash = '#/recipe/' + id; }
  };
  A['cook-start'] = el => { S.cook = null; location.hash = `#/cook/${el.dataset.id}?servings=${S.ui.recServ[el.dataset.id] || S.profile.household_size || 1}`; };
  A['timer-go'] = el => {
    try { const ac = H.ac || (H.ac = new (window.AudioContext || window.webkitAudioContext)()); if (ac.state === 'suspended') ac.resume(); } catch (e) { /* egal */ }
    S.cook.timers.push({ id: H.uid(), step: +el.dataset.step, end: Date.now() + +el.dataset.min * 60000, done: false });
    el.textContent = '✓ Timer läuft'; el.disabled = true; drawTimers(); H.haptic('light');
  };
  A['timer-x'] = el => { S.cook.timers = S.cook.timers.filter(t => t.id !== el.dataset.id); drawTimers(); };
  A.speak = () => {
    if (!('speechSynthesis' in window)) { toast('Vorlesen wird hier nicht unterstützt.'); return; }
    if (speechOn) { speechSynthesis.cancel(); speechOn = false; return; }
    const t = (H.$('.cook-text') || {}).textContent || ''; const u = new SpeechSynthesisUtterance(t); u.lang = 'de-DE'; u.onend = () => { speechOn = false; }; speechOn = true; speechSynthesis.speak(u);
  };
})();
