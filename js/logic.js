/* Healthly – Logik (rein, ohne DOM): Einheiten, Nährwerte, Diät, Vorschläge, Wochenplan, Einkauf, Reste */
(function () {
  const H = window.HD;
  const KEYS = H.NUTRIENT_KEYS;
  const ING = H.ING;
  const RECIPES = H.RECIPES;
  const ing = id => ING.get(id);

  /* ---------- Datum ---------- */
  const z2 = n => String(n).padStart(2, '0');
  const localISO = d => `${d.getFullYear()}-${z2(d.getMonth() + 1)}-${z2(d.getDate())}`;
  const todayISO = () => localISO(new Date());
  const parseISO = iso => new Date(iso + 'T12:00:00');
  const addDays = (iso, n) => { const d = parseISO(iso); d.setDate(d.getDate() + n); return localISO(d); };
  const mondayISO = (iso) => { const d = iso ? parseISO(iso) : new Date(); const day = d.getDay() || 7; d.setDate(d.getDate() - day + 1); return localISO(d); };
  const daysBetween = (a, b) => Math.round((parseISO(b) - parseISO(a)) / 86400000);
  const isWeekend = iso => { const d = parseISO(iso).getDay(); return d === 0 || d === 6; };
  const uid = () => (crypto.randomUUID ? crypto.randomUUID() : 'id' + Math.random().toString(36).slice(2) + Date.now());

  /* ---------- Einheiten ---------- */
  const isLiquid = id => { const i = ing(id); return !!(i && i.flags.includes('liquid')); };
  function toGrams(id, qty, unit) {
    if (!unit || unit === 'g' || unit === 'ml') return qty;
    const i = ing(id);
    if (!i) return qty;
    if (i.units[unit]) return qty * i.units[unit];
    if (unit === 'Packung') return qty * i.pack_g;
    return qty;
  }
  function unitOptions(id) {
    const i = ing(id);
    if (!i) return ['g'];
    return [isLiquid(id) ? 'ml' : 'g', ...Object.keys(i.units), ...(i.units.Packung ? [] : ['Packung'])];
  }
  const fmtNum = n => (Math.round(n * 10) / 10).toString().replace('.', ',');
  function fmtQty(id, g) {
    const i = ing(id);
    if (!i) return `${fmtNum(g)} g`;
    const base = isLiquid(id) ? 'ml' : 'g';
    const un = i.units;
    const main = Object.keys(un).find(u => !['TL', 'EL', 'Prise'].includes(u));
    if (main && g >= un[main] * 0.4) {
      const n = Math.round((g / un[main]) * 2) / 2;
      if (n % 1 === 0 || n < 3) return `${fmtNum(n)} ${main}`;
    }
    if (g <= 40 && (un.TL || un.EL || un.Prise)) {
      if (un.Prise && g <= 1.2) return `${Math.max(1, Math.round(g / un.Prise))} Prise${g / un.Prise > 1.5 ? 'n' : ''}`;
      if (un.TL && (!un.EL || g < un.EL * 0.8)) return `${fmtNum(Math.max(0.5, Math.round((g / un.TL) * 2) / 2))} TL`;
      if (un.EL) return `${fmtNum(Math.max(0.5, Math.round((g / un.EL) * 2) / 2))} EL`;
    }
    const r = g < 3 ? Math.round(g * 10) / 10 : g < 100 ? Math.round(g / 5) * 5 || 5 : Math.round(g / 10) * 10;
    return `${fmtNum(r)} ${base}`;
  }

  /* ---------- Nährwerte ---------- */
  const zero = () => { const o = {}; KEYS.forEach(k => { o[k] = 0; }); return o; };
  const sumN = list => { const o = zero(); list.forEach(n => KEYS.forEach(k => { o[k] += n[k] || 0; })); return o; };
  const scaleN = (n, f) => { const o = {}; KEYS.forEach(k => { o[k] = (n[k] || 0) * f; }); return o; };
  function ingN(id, g) { const i = ing(id); return i ? scaleN(i.n, g / 100) : zero(); }
  function nutrientsOf(ings, servings) {
    const total = sumN(ings.map(x => ingN(x.ing, x.g)));
    return { total, per: scaleN(total, 1 / servings) };
  }

  /* ---------- Ernährung / Allergene ---------- */
  const ANIMAL_OK = {
    vegan: ['none'], vegetarian: ['none', 'honey', 'dairy', 'egg'], pescetarian: ['none', 'honey', 'dairy', 'egg', 'fish', 'seafood']
  };
  const SUBS = {
    milk: ['oat_milk', 'soy_milk'], yogurt: ['soy_yogurt'], skyr: ['soy_yogurt'], quark: ['soy_yogurt'],
    cream: ['coconut_milk'], cream_cheese: ['soy_yogurt'], butter: ['olive_oil'], honey: ['maple_syrup'],
    whey: ['vegan_protein'], pasta: ['rice_noodles'], couscous: ['quinoa'], mozzarella: ['tofu'], feta: ['tofu'],
    chicken: ['tofu', 'tempeh'], turkey: ['tofu'], tuna: ['chickpeas'], beef_mince: [['lentils', 0.5]]
  };
  function problem(i, p) {
    if (!i || !p) return false;
    if ((p.allergies || []).some(a => i.allergens.includes(a))) return true;
    const it = p.intolerances || [];
    if (it.includes('lactose') && i.flags.includes('lactose')) return true;
    if (it.includes('fructose') && i.flags.includes('fructose')) return true;
    if (it.includes('histamine') && i.flags.includes('histamine')) return true;
    const ok = ANIMAL_OK[p.diet_base];
    if (ok && !ok.includes(i.animal)) return true;
    if ((p.diet_modifiers || []).includes('halal') && (i.animal === 'pork' || i.flags.includes('alcohol'))) return true;
    if ((p.disliked_ingredients || []).some(d => d.level === 'hate' && d.id === i.id)) return true;
    return false;
  }
  const isStaple = (id, p) => { const i = ing(id); return !!(i && i.flags.includes('staple')) || !!(p && (p.staples || []).includes(id)); };

  const resolveCache = new Map();
  function profileKey(p) {
    return p ? [p.diet_base, (p.diet_modifiers || []).join(), (p.allergies || []).join(), (p.intolerances || []).join(),
      (p.disliked_ingredients || []).filter(d => d.level === 'hate').map(d => d.id).join()].join('|') : '';
  }
  /* Prüft ein Rezept gegen das Profil. Liefert Ersatzzutaten, weggelassene Zutaten und die finale Zutatenliste. */
  function checkRecipe(r, p) {
    const key = r.id + '#' + profileKey(p);
    if (resolveCache.has(key)) return resolveCache.get(key);
    const swaps = {}, dropped = [], ings = [];
    let ok = true;
    for (const x of r.ingredients) {
      const i = ing(x.ing);
      if (!problem(i, p)) { ings.push({ ing: x.ing, g: x.g, optional: x.optional }); continue; }
      let sub = null;
      for (const c of SUBS[x.ing] || []) {
        const id = Array.isArray(c) ? c[0] : c, f = Array.isArray(c) ? c[1] : 1;
        if (!problem(ing(id), p)) { sub = { id, f }; break; }
      }
      if (sub) { swaps[x.ing] = sub.id; ings.push({ ing: sub.id, g: x.g * sub.f, optional: x.optional, from: x.ing }); }
      else if (x.optional) dropped.push(x.ing);
      else ok = false;
    }
    let res = { ok, swaps, dropped, ings };
    if (ok && p) {
      const mods = p.diet_modifiers || [];
      if (mods.includes('keto') || mods.includes('low_carb')) {
        const n = nutrientsOf(ings, r.servings).per;
        const share = ((n.carbs - n.fiber) * 4) / Math.max(1, n.kcal);
        if (mods.includes('keto') ? share > 0.15 : share > 0.3) res = { ...res, ok: false };
      }
    }
    resolveCache.set(key, res);
    return res;
  }
  const infoCache = new Map();
  function recipeInfo(r) {
    if (infoCache.has(r.id)) return infoCache.get(r.id);
    const list = r.ingredients.map(x => ing(x.ing));
    const animals = list.map(i => i.animal);
    const allergens = [...new Set(list.flatMap(i => i.allergens))];
    const n = nutrientsOf(r.ingredients.map(x => ({ ing: x.ing, g: x.g })), r.servings).per;
    const netShare = ((n.carbs - n.fiber) * 4) / Math.max(1, n.kcal);
    const info = {
      allergens,
      vegan: animals.every(a => a === 'none'),
      vegetarian: animals.every(a => ANIMAL_OK.vegetarian.includes(a)),
      pescetarian: animals.every(a => ANIMAL_OK.pescetarian.includes(a)),
      gluten_free: !allergens.includes('gluten'),
      lactose_free: !list.some(i => i.flags.includes('lactose')),
      keto: netShare <= 0.15, low_carb: netShare <= 0.3,
      high_protein: (n.protein * 4) / Math.max(1, n.kcal) >= 0.25
    };
    infoCache.set(r.id, info);
    return info;
  }

  /* ---------- Ziele ---------- */
  const calcAge = by => new Date().getFullYear() - by;
  const calcBMI = (w, h) => w / ((h / 100) ** 2);
  function safety(p) {
    const age = calcAge(p.birth_year || 1995), bmi = calcBMI(+p.weight_kg || 70, +p.height_cm || 175);
    const reasons = [];
    if (age < 18) reasons.push('Du bist unter 18.');
    if (bmi < 18.5) reasons.push('Dein BMI liegt unter 18,5.');
    if (p.pregnant_or_breastfeeding) reasons.push('Schwangerschaft oder Stillzeit.');
    return { noDeficit: reasons.length > 0, reasons, bmi, age };
  }
  const PAL = { sedentary: 1.2, light: 1.375, moderate: 1.55, high: 1.725, athlete: 1.9 };
  function calcBMR(p) {
    const w = +p.weight_kg || 70, h = +p.height_cm || 175, age = calcAge(p.birth_year || 1995);
    return 10 * w + 6.25 * h - 5 * age + (p.sex === 'male' ? 5 : p.sex === 'female' ? -161 : -78);
  }
  function microTargets(p) {
    const male = p.sex === 'male', fem = p.sex === 'female', age = calcAge(p.birth_year || 1995);
    const preg = !!p.pregnant_or_breastfeeding;
    return {
      vit_c: fem ? 95 : 110, vit_d: 20, vit_b12: 4, folate: preg ? 550 : 300, vit_a: fem ? 700 : 850,
      vit_e: fem ? 12 : 14, iron: preg ? 27 : male ? 11 : fem ? (age > 50 ? 14 : 16) : 16, calcium: 1000,
      magnesium: fem ? 300 : 350, zinc: fem ? 8 : 14, potassium: 4000
    };
  }
  function calcTargets(p) {
    const w = +p.weight_kg || 70, h = +p.height_cm || 175;
    const bmr = calcBMR(p), tdee = bmr * (PAL[p.activity_level] || 1.55);
    const s = safety(p);
    const pace = p.pace_kg_week || 0.5;
    let adj = 0, note = '';
    if (p.goal === 'lose' && !s.noDeficit) { adj = -Math.min((pace * 7700) / 7, tdee * 0.25); note = `Defizit für ca. ${fmtNum(pace)} kg pro Woche`; }
    else if (p.goal === 'gain') { adj = Math.min((pace * 7700) / 7, tdee * 0.2); note = `Überschuss für ca. ${fmtNum(pace)} kg pro Woche`; }
    else if (p.goal === 'muscle') { adj = s.bmi >= 27 ? 0 : 250; note = adj ? 'leichter Überschuss für Muskelaufbau' : 'Rekomposition bei erhöhtem BMI'; }
    const floor = Math.max(bmr, p.sex === 'male' ? 1500 : p.sex === 'female' ? 1200 : 1350);
    const kcal = Math.round(Math.max(floor, tdee + adj) / 10) * 10;
    const ref = s.bmi > 30 ? 25 * (h / 100) ** 2 : w;
    let pk = { lose: 1.8, muscle: 2.0, gain: 1.6, maintain: 1.2, healthy: 1.2, energy: 1.3 }[p.goal] || 1.2;
    const mods = p.diet_modifiers || [];
    if (mods.includes('high_protein')) pk = Math.max(pk, 1.8);
    if (s.age >= 65) pk = Math.max(pk, 1.0);
    let protein = Math.min(pk * ref, (kcal * 0.35) / 4);
    let fat = Math.max((kcal * 0.3) / 9, 0.8 * ref);
    let carbs = Math.max(50, (kcal - protein * 4 - fat * 9) / 4);
    if (mods.includes('keto')) { carbs = 30; fat = (kcal - protein * 4 - carbs * 4) / 9; }
    else if (mods.includes('low_carb')) { carbs = (kcal * 0.2) / 4; fat = (kcal - protein * 4 - carbs * 4) / 9; }
    return {
      kcal, protein_g: Math.round(protein), carbs_g: Math.round(carbs), fat_g: Math.round(fat),
      fiber_g: Math.round(Math.min(45, Math.max(30, (14 * kcal) / 1000))),
      sugar_max_g: Math.round((kcal * 0.1) / 4), sat_fat_max_g: Math.round((kcal * 0.1) / 9), salt_max_g: 6,
      micros: microTargets(p),
      info: { bmr: Math.round(bmr), pal: PAL[p.activity_level] || 1.55, adj: Math.round(adj), note, noDeficit: s.noDeficit, reasons: s.reasons }
    };
  }
  function effectiveTargets(p) {
    const base = p.targets || calcTargets(p), o = p.targets_override || {};
    return { ...base, ...o, micros: { ...base.micros, ...(o.micros || {}) } };
  }
  function mealShare(p) {
    const mp = p.meal_pattern || { breakfast: true, lunch: true, dinner: true, snacks: 1 };
    const sn = mp.snacks || 0;
    const w = { breakfast: mp.breakfast ? 0.25 : 0, lunch: mp.lunch ? 0.35 : 0, dinner: mp.dinner ? 0.3 : 0, snack: sn === 0 ? 0 : sn === 1 ? 0.1 : 0.15 };
    const t = w.breakfast + w.lunch + w.dinner + w.snack || 1;
    Object.keys(w).forEach(k => { w[k] /= t; });
    if (!w.snack) w.snack = 0.1 * (1 - 0);
    return w;
  }
  const mealKey = m => (m === 'dessert' || m === 'drink' ? 'snack' : m);

  function sumLog(entries) { return sumN(entries.map(e => e.nutrition || zero())); }
  function weeklyMicroStatus(log, targets) {
    const days = new Set(log.map(e => e.date));
    if (!days.size) return null;
    const tot = sumLog(log), out = {};
    Object.keys(targets.micros).forEach(k => { out[k] = Math.round((tot[k] / days.size / targets.micros[k]) * 100); });
    return out;
  }

  /* ---------- Vorrat ---------- */
  function pantryIndex(pantry) {
    const m = new Map();
    pantry.forEach(it => {
      if (it.kind === 'leftover' || !it.ingredient_id) return;
      const g = it.quantity == null ? Infinity : toGrams(it.ingredient_id, it.quantity, it.unit);
      m.set(it.ingredient_id, (m.get(it.ingredient_id) || 0) + g);
    });
    return m;
  }
  function matchRecipe(res, servings, idx, p) {
    const f = servings ? servings / 1 : 1;
    const need = res.ings.filter(x => !x.optional && !isStaple(x.ing, p));
    if (!need.length) return { pct: 100, missing: [], have: [] };
    let score = 0; const missing = [], have = [];
    need.forEach(x => {
      const g = x.g * f, h = idx.get(x.ing) || 0;
      const cover = h >= g * 0.8 ? 1 : h > 0 ? 0.5 : 0;
      score += cover;
      if (cover < 1) missing.push({ ing: x.ing, g: Math.max(0, g - (h === Infinity ? 0 : h)) }); else have.push(x.ing);
    });
    return { pct: Math.round((score / need.length) * 100), missing, have };
  }

  /* ---------- Vorschläge ---------- */
  const CUISINE_LABEL = {
    german: 'Deutsch', italian: 'Italienisch', mediterranean: 'Mediterran', greek: 'Griechisch', middle_eastern: 'Orientalisch',
    indian: 'Indisch', thai: 'Thai', chinese: 'Chinesisch', japanese: 'Japanisch', mexican: 'Mexikanisch', american: 'Amerikanisch', french: 'Französisch'
  };
  function mainProtein(res) {
    let best = null, bg = -1;
    res.ings.forEach(x => { if (isStaple(x.ing)) return; const g = (ing(x.ing).n.protein * x.g) / 100; if (g > bg) { bg = g; best = x.ing; } });
    return best;
  }
  function suggest(ctx) {
    const { profile: p, pantry = [], favorites = [], ratings = {}, blocked = [], foodLog = [], filters: f = {} } = ctx;
    const today = ctx.today || todayISO();
    const targets = effectiveTargets(p), share = mealShare(p), idx = pantryIndex(pantry);
    const utensils = new Set([...(f.utensils || p.utensils || []), 'bowl']);
    const q = (f.query || '').trim().toLowerCase();
    const cookedAgo = {};
    foodLog.forEach(e => { if (e.recipe_id) { const d = daysBetween(e.date, today); if (cookedAgo[e.recipe_id] == null || d < cookedAgo[e.recipe_id]) cookedAgo[e.recipe_id] = d; } });
    const todayLog = foodLog.filter(e => e.date === today), consumed = sumLog(todayLog).kcal;
    const log7 = foodLog.filter(e => daysBetween(e.date, today) < 7);
    const micro = weeklyMicroStatus(log7, targets);
    const gaps = micro ? Object.keys(micro).filter(k => k !== 'vit_d' && micro[k] < 70) : [];
    const expiry = {};
    pantry.forEach(it => { if (it.ingredient_id && it.expires_on && it.kind !== 'leftover') { const d = daysBetween(today, it.expires_on); if (expiry[it.ingredient_id] == null || d < expiry[it.ingredient_id]) expiry[it.ingredient_id] = d; } });
    const out = [];
    for (const r of RECIPES) {
      if (blocked.includes(r.id)) continue;
      if (f.meal_type && !r.meal_types.includes(f.meal_type)) continue;
      if (f.max_time && r.prep_min + r.cook_min > f.max_time) continue;
      if (!r.utensils.every(u => utensils.has(u))) continue;
      const diffRank = { easy: 1, medium: 2, hard: 3 };
      const maxDiff = f.difficulty || (p.skill_level === 'beginner' ? 'medium' : 'hard');
      if (diffRank[r.difficulty] > diffRank[maxDiff]) continue;
      if (r.spice > (p.spice_level || 0) + 1) continue;
      if (f.cuisine && r.cuisine !== f.cuisine) continue;
      if (f.tags && f.tags.length && !f.tags.every(t => r.tags.includes(t))) continue;
      const res = checkRecipe(r, p);
      if (!res.ok) continue;
      if (q) {
        const hay = [r.title, r.subtitle, CUISINE_LABEL[r.cuisine] || '', ...res.ings.map(x => ing(x.ing).name)].join(' ').toLowerCase();
        if (!q.split(/\s+/).every(w => hay.includes(w))) continue;
      }
      const m = matchRecipe(res, 1, idx, p);
      if (f.pantry_mode === 'only_pantry' && m.pct < 100) continue;
      if (f.pantry_mode === 'max_missing_2' && m.missing.length > 2) continue;
      const n = nutrientsOf(res.ings, r.servings).per;
      const meal = mealKey(f.meal_type || r.meal_types[0]);
      const mt = Math.max(150, targets.kcal * (share[meal] || 0.25));
      let kcalFit = Math.max(0, 1 - Math.abs(n.kcal - mt) / mt);
      if (p.goal === 'gain' && n.kcal > mt) kcalFit = Math.min(1, 1 - Math.max(0, n.kcal - mt * 1.4) / mt);
      const protFit = Math.min(1, n.protein / Math.max(1, targets.protein_g * (share[meal] || 0.25)));
      const fiberFit = Math.min(1, n.fiber / Math.max(1, targets.fiber_g * (share[meal] || 0.25)));
      const goalFit = 0.5 * kcalFit + 0.3 * protFit + 0.2 * fiberFit;
      const remaining = targets.kcal - consumed;
      const dayFit = consumed === 0 ? 0.5 : n.kcal <= remaining * 1.15 ? 1 : Math.max(0, 1 - (n.kcal - remaining * 1.15) / Math.max(200, remaining));
      let useUp = 0; const used = [];
      res.ings.forEach(x => {
        if (x.optional || isStaple(x.ing, p) || !idx.has(x.ing)) return;
        const d = expiry[x.ing]; let v = 0;
        if (d != null && d <= 1) v = 1.5; else if (d != null && d <= 3) v = 1;
        if ((f.use_up || []).includes(x.ing)) v = 1.5;
        if (v) { useUp += v; used.push(x.ing); }
      });
      useUp = Math.min(1, useUp / 2);
      const parts = [];
      if ((p.liked_cuisines || []).length) parts.push((p.liked_cuisines || []).includes(r.cuisine) ? 1 : 0.35);
      const liked = p.liked_ingredients || [];
      if (liked.length) parts.push(Math.min(1, res.ings.filter(x => liked.includes(x.ing)).length / 2));
      const aff = p.taste_affinity || { cuisine: {}, ingredient: {} };
      const ai = res.ings.map(x => (aff.ingredient || {})[x.ing] || 0);
      const aval = ((aff.cuisine || {})[r.cuisine] || 0) * 0.5 + (ai.reduce((a, b) => a + b, 0) / Math.max(1, ai.length)) * 0.5;
      parts.push((aval + 1) / 2);
      parts.push(ratings[r.id] ? (ratings[r.id] - 1) / 4 : 0.5);
      let prefs = parts.reduce((a, b) => a + b, 0) / parts.length;
      if (favorites.includes(r.id)) prefs += 0.3;
      const meh = new Set((p.disliked_ingredients || []).filter(d => d.level === 'meh').map(d => d.id));
      prefs -= 0.15 * res.ings.filter(x => meh.has(x.ing)).length;
      if (p.diet_base === 'flexitarian' && recipeInfo(r).vegetarian) prefs += 0.2;
      prefs = Math.max(0, Math.min(1, prefs));
      let mg = 0.5;
      if (micro && gaps.length) mg = gaps.filter(k => n[k] >= 0.2 * targets.micros[k]).length / gaps.length;
      const ago = cookedAgo[r.id];
      const variety = ago == null || ago > 7 ? 1 : ago === 0 ? 0 : ago <= 3 ? 0.3 : 0.7;
      const swapPenalty = Math.min(12, 4 * Object.keys(res.swaps).length);
      const score = -swapPenalty + 28 * (m.pct / 100) + 20 * goalFit + 8 * dayFit + 14 * useUp + 16 * prefs + 6 * mg + 8 * variety;
      const reasons = [];
      if (used.length) reasons.push(`Verbraucht ${used.slice(0, 2).map(i => ing(i).name).join(' und ')}, das bald abläuft`);
      if (m.pct >= 80 && idx.size) reasons.push(m.missing.length ? `Fast alles da, es fehlt nur ${m.missing.map(x => ing(x.ing).name).slice(0, 2).join(', ')}` : 'Du hast alles da');
      if (protFit >= 0.9 && ['muscle', 'lose', 'gain'].includes(p.goal)) reasons.push(`${Math.round(n.protein)} g Protein, passt zu deinem Ziel`);
      if (mg > 0.5 && gaps.length) { const k = gaps.find(g => n[g] >= 0.2 * targets.micros[g]); if (k) reasons.push(`Liefert ${MICRO_LABEL[k]}, davon hattest du diese Woche wenig`); }
      if (ratings[r.id] >= 4) reasons.push(`Du hast es mit ${ratings[r.id]} ★ bewertet`);
      if (kcalFit > 0.8) reasons.push('Passt gut zu deinem Kalorienziel');
      if (Object.keys(res.swaps).length) reasons.push('Angepasst an deine Ernährung');
      out.push({ recipe: r, score, match_percent: m.pct, missing: m.missing, have: m.have, swaps: res.swaps, dropped: res.dropped, ings: res.ings, kcal: n.kcal, protein: n.protein, reasons: reasons.slice(0, 3), used });
    }
    out.sort((a, b) => b.score - a.score);
    const lim = f.limit || 30;
    // Vielfalt in den Top 8
    const top = [], rest = [], prot = {}, cui = {};
    out.forEach(x => {
      const pr = mainProtein({ ings: x.ings }), cu = x.recipe.cuisine;
      if (top.length < 8 && (prot[pr] || 0) < 2 && (cui[cu] || 0) < 3) { top.push(x); prot[pr] = (prot[pr] || 0) + 1; cui[cu] = (cui[cu] || 0) + 1; }
      else rest.push(x);
    });
    return [...top, ...rest].slice(0, lim);
  }
  const MICRO_LABEL = { vit_c: 'Vitamin C', vit_d: 'Vitamin D', vit_b12: 'Vitamin B12', folate: 'Folat', vit_a: 'Vitamin A', vit_e: 'Vitamin E', iron: 'Eisen', calcium: 'Calcium', magnesium: 'Magnesium', zinc: 'Zink', potassium: 'Kalium' };

  /* ---------- Rezept-Ansicht (Zutaten skaliert) ---------- */
  function recipeView(r, p, servings, pantry) {
    const res = checkRecipe(r, p);
    const f = servings / r.servings;
    const ings = res.ings.map(x => ({ ...x, g: x.g * f }));
    const idx = pantryIndex(pantry || []);
    const m = matchRecipe({ ings: res.ings }, f, idx, p);
    const n = nutrientsOf(res.ings, r.servings);
    return { res, ings, match: m, nutrition: n, idx };
  }

  /* ---------- Einkauf ---------- */
  function needs(entries, p) {
    // entries: [{recipe, servings}]
    const map = new Map();
    entries.forEach(e => {
      const res = checkRecipe(e.recipe, p), f = e.servings / e.recipe.servings;
      res.ings.forEach(x => {
        if (isStaple(x.ing, p) || x.optional) return;
        const o = map.get(x.ing) || { g: 0, recipes: new Set() };
        o.g += x.g * f; o.recipes.add(e.recipe.id); map.set(x.ing, o);
      });
    });
    return map;
  }
  function shortfall(map, pantry) {
    const idx = pantryIndex(pantry), out = [];
    map.forEach((o, id) => {
      const have = idx.get(id) || 0;
      const g = have === Infinity ? 0 : o.g - have;
      if (g > 0.5) out.push({ ingredient_id: id, name: ing(id).name, quantity: Math.round(g), unit: isLiquid(id) ? 'ml' : 'g', category: ing(id).cat, checked: false, recipe_ids: [...o.recipes] });
    });
    return out;
  }
  function missingForRecipe(r, servings, pantry, p) {
    return shortfall(needs([{ recipe: r, servings }], p), pantry).map(x => ({ ...x, source: 'recipe' }));
  }
  function listFromPlan(entries, pantry, p, recipeById) {
    const bySource = {};
    entries.filter(e => e.is_leftover && e.source_id).forEach(e => { bySource[e.source_id] = (bySource[e.source_id] || 0) + e.servings; });
    const list = entries.filter(e => !e.is_leftover && recipeById(e.recipe_id)).map(e => ({ recipe: recipeById(e.recipe_id), servings: e.servings + (bySource[e.id] || 0) }));
    return shortfall(needs(list, p), pantry).map(x => ({ ...x, source: 'plan' }));
  }
  function mergeShopping(existing, incoming) {
    const upserts = [];
    incoming.forEach(inc => {
      const ex = existing.find(e => !e.checked && inc.ingredient_id && e.ingredient_id === inc.ingredient_id);
      const same = ex && inc.recipe_ids && inc.recipe_ids.length && inc.recipe_ids.every(id => (ex.recipe_ids || []).includes(id));
      if (same) return;
      if (ex) {
        const merged = { ...ex, quantity: (ex.quantity || 0) + (inc.quantity || 0), recipe_ids: [...new Set([...(ex.recipe_ids || []), ...(inc.recipe_ids || [])])] };
        const i = existing.indexOf(ex); existing[i] = merged;
        const u = upserts.findIndex(x => x.id === merged.id);
        if (u >= 0) upserts[u] = merged; else upserts.push(merged);
      } else {
        const n = { ...inc, id: uid() };
        existing.push(n); upserts.push(n);
      }
    });
    return upserts;
  }
  function deductPantry(pantry, r, servings, p) {
    const res = checkRecipe(r, p), f = servings / r.servings, updates = [], deletions = [];
    res.ings.forEach(x => {
      if (isStaple(x.ing, p)) return;
      let need = x.g * f;
      pantry.filter(it => it.ingredient_id === x.ing && it.kind !== 'leftover' && it.quantity != null).forEach(it => {
        if (need <= 0) return;
        const have = toGrams(x.ing, it.quantity, it.unit), take = Math.min(have, need);
        need -= take;
        const left = have - take;
        if (left <= 0.5) deletions.push(it.id);
        else updates.push({ ...it, quantity: Math.round(left), unit: isLiquid(x.ing) ? 'ml' : 'g' });
      });
    });
    return { updates, deletions };
  }
  function makeLeftover(r, servings, today) {
    const fish = r.ingredients.some(x => ['fish', 'seafood'].includes(ing(x.ing).animal));
    return { ingredient_id: null, name: r.title, category: 'Reste', quantity: null, unit: null, expires_on: addDays(today, fish ? 1 : 3), kind: 'leftover', recipe_id: r.id, servings };
  }
  function suggestExpiry(id, today) { const i = ing(id); return i ? addDays(today, Math.min(i.shelf_days, 365)) : null; }
  const expiryStatus = (it, today) => {
    if (!it.expires_on) return 'none';
    const d = daysBetween(today, it.expires_on);
    return d < 0 ? 'expired' : d === 0 ? 'today' : d <= 3 ? 'soon' : 'ok';
  };

  /* ---------- Geschmack lernen ---------- */
  function updateAffinity(p, r, stars) {
    const a = JSON.parse(JSON.stringify(p.taste_affinity || { cuisine: {}, ingredient: {} }));
    a.cuisine = a.cuisine || {}; a.ingredient = a.ingredient || {};
    const t = { 5: [0.15, 0.1], 4: [0.08, 0.05], 3: [0, 0], 2: [-0.1, -0.08], 1: [-0.2, -0.15] }[stars] || [0, 0];
    const cl = v => Math.max(-1, Math.min(1, v));
    a.cuisine[r.cuisine] = cl((a.cuisine[r.cuisine] || 0) + t[0]);
    r.ingredients.filter(x => !isStaple(x.ing)).sort((x, y) => y.g - x.g).slice(0, 3).forEach(x => { a.ingredient[x.ing] = cl((a.ingredient[x.ing] || 0) + t[1]); });
    return a;
  }

  /* ---------- Wochenplan ---------- */
  function rng(seed) { let a = seed >>> 0; return () => { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  function planWeek(ctx) {
    const { profile: p, weekStart, seed = 1 } = ctx;
    const rand = rng(seed * 7919 + 13);
    const targets = effectiveTargets(p), mp = p.meal_pattern || { breakfast: true, lunch: true, dinner: true, snacks: 1 };
    const hh = p.household_size || 1;
    const locked = (ctx.existing || []).filter(e => e.locked);
    const slotsPerDay = [];
    if (mp.breakfast) slotsPerDay.push('breakfast');
    if (mp.lunch) slotsPerDay.push('lunch');
    if (mp.dinner) slotsPerDay.push('dinner');
    for (let i = 0; i < (mp.snacks || 0); i++) slotsPerDay.push('snack');
    let pantry = JSON.parse(JSON.stringify(ctx.pantry || []));
    const used = {}, entries = [], byId = id => RECIPES.find(r => r.id === id);
    const taken = e => locked.some(l => l.date === e.date && l.meal_type === e.meal_type && (l.meal_type !== 'snack' || l.slot === e.slot));
    locked.forEach(l => { used[l.recipe_id] = (used[l.recipe_id] || 0) + 1; });
    const prevDay = {};
    const days = [];
    for (let d = 0; d < 7; d++) {
      const date = addDays(weekStart, d), dayEntries = [];
      const todays = new Set(locked.filter(l => l.date === date).map(l => l.recipe_id));
      const fixedLeftover = entries.filter(e => e.date === date && e.is_leftover);
      slotsPerDay.forEach((meal, si) => {
        const slot = meal === 'snack' ? si : 0;
        const stub = { date, meal_type: meal, slot };
        if (taken(stub)) return;
        if (fixedLeftover.some(e => e.meal_type === meal)) return;
        const maxT = isWeekend(date) ? p.time_weekend_min : p.time_weekday_min;
        let cands = suggest({ ...ctx, pantry, filters: { meal_type: meal === 'snack' ? null : meal, max_time: maxT, limit: 40 } });
        if (meal === 'snack') cands = cands.filter(c => c.recipe.meal_types.some(m => ['snack', 'dessert', 'drink'].includes(m)));
        else cands = cands.filter(c => !c.recipe.meal_types.every(m => ['dessert', 'drink'].includes(m)));
        cands = cands.filter(c => (used[c.recipe.id] || 0) < 2 && !todays.has(c.recipe.id) && !dayEntries.some(e => e.recipe_id === c.recipe.id) && prevDay[meal + slot] !== c.recipe.id);
        if (!cands.length) return;
        const chosenIngs = new Set(entries.flatMap(en => (byId(en.recipe_id) || { ingredients: [] }).ingredients.map(x => x.ing)));
        const adj = c => { const core = c.ings.filter(x => !x.optional && !isStaple(x.ing, p)); return c.score * (1 + 0.25 * (core.filter(x => chosenIngs.has(x.ing)).length / Math.max(1, core.length))); };
        const top = cands.slice(0, 12).sort((a, b) => adj(b) - adj(a)).slice(0, 5), pick = top[Math.floor(rand() * top.length)];
        const e = { id: uid(), date, meal_type: meal, slot, recipe_id: pick.recipe.id, servings: hh, is_leftover: false, locked: false };
        dayEntries.push(e); entries.push(e);
        used[pick.recipe.id] = (used[pick.recipe.id] || 0) + 1;
        // Vorrat virtuell verbrauchen
        const dd = deductPantry(pantry, pick.recipe, hh, p);
        pantry = pantry.filter(x => !dd.deletions.includes(x.id)).map(x => dd.updates.find(u => u.id === x.id) || x);
        // Reste
        if (meal === 'dinner' && mp.lunch && d < 6 && pick.recipe.tags.includes('leftover_friendly')) {
          const nd = addDays(date, 1), lockedNext = locked.some(l => l.date === nd && l.meal_type === 'lunch');
          if (!lockedNext) entries.push({ id: uid(), date: nd, meal_type: 'lunch', slot: 0, recipe_id: pick.recipe.id, servings: hh, is_leftover: true, source_id: e.id, locked: false });
        }
      });
      days.push(date);
      dayEntries.forEach(e => { prevDay[e.meal_type + (e.slot || 0)] = e.recipe_id; });
    }
    // Portionen je Tag an Kalorienziel anpassen
    days.forEach(date => {
      const de = entries.filter(e => e.date === date), lk = locked.filter(l => l.date === date);
      const kc = e => { const r = byId(e.recipe_id), res = checkRecipe(r, p); return nutrientsOf(res.ings, r.servings).per.kcal * (e.servings / hh); };
      const total = de.reduce((a, e) => a + kc(e), 0) + lk.reduce((a, e) => a + kc(e), 0);
      if (!de.length || total <= 0) return;
      const ratio = targets.kcal / total;
      if (ratio > 1.1 || ratio < 0.9) {
        de.forEach(e => {
          const portion = Math.max(0.75, Math.min(1.5, Math.round((e.servings / hh) * ratio * 4) / 4));
          e.servings = Math.round(hh * portion * 100) / 100;
        });
      }
    });
    // Leftover-Portionen an Quelle koppeln
    entries.filter(e => e.is_leftover).forEach(l => { const s = entries.find(e => e.id === l.source_id); if (s) l.servings = s.servings; });
    return entries;
  }
  function dayKcal(entries, date, p) {
    const hh = p.household_size || 1;
    return entries.filter(e => e.date === date).reduce((a, e) => {
      const r = RECIPES.find(x => x.id === e.recipe_id); if (!r) return a;
      return a + nutrientsOf(checkRecipe(r, p).ings, r.servings).per.kcal * (e.servings / hh);
    }, 0);
  }

  Object.assign(H, {
    localISO, todayISO, parseISO, addDays, mondayISO, daysBetween, isWeekend, uid,
    toGrams, unitOptions, fmtQty, fmtNum, isLiquid,
    zero, sumN, scaleN, ingN, nutrientsOf, sumLog, weeklyMicroStatus,
    checkRecipe, recipeInfo, problem, isStaple, SUBS,
    calcAge, calcBMI, calcBMR, calcTargets, effectiveTargets, mealShare, mealKey, safety, microTargets, MICRO_LABEL,
    pantryIndex, matchRecipe, suggest, recipeView, CUISINE_LABEL,
    missingForRecipe, listFromPlan, mergeShopping, deductPantry, makeLeftover, suggestExpiry, expiryStatus,
    updateAffinity, planWeek, dayKcal, clearCaches: () => { resolveCache.clear(); }
  });
})();
