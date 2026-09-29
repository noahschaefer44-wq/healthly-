/* Selbsttest, läuft nur mit ?dev=1 – prüft Daten und Kernlogik */
(function () {
  const H = window.HD, errs = [];
  const e = m => errs.push(m);
  const ids = new Set();
  H.INGREDIENTS.forEach(i => {
    if (ids.has(i.id)) e('Doppelte Zutat ' + i.id); ids.add(i.id);
    const n = i.n, k = 4 * n.protein + 4 * n.carbs + 9 * n.fat + 2 * n.fiber;
    if (i.cat !== 'spices' && n.fiber < 25 && Math.abs(n.kcal - k) > Math.max(0.2 * n.kcal, 20)) e(`Nährwerte unplausibel: ${i.id} (${n.kcal} vs ${Math.round(k)})`);
  });
  const rids = new Set();
  H.RECIPES.forEach(r => {
    if (rids.has(r.id)) e('Doppeltes Rezept ' + r.id); rids.add(r.id);
    r.ingredients.forEach(x => { if (!H.ING.get(x.ing)) e(`${r.id}: Zutat fehlt ${x.ing}`); });
    const kcal = H.nutrientsOf(r.ingredients.map(x => ({ ing: x.ing, g: x.g })), r.servings).per.kcal;
    if (kcal < 80 || kcal > 1100) e(`${r.id}: ${Math.round(kcal)} kcal pro Portion`);
    if (r.steps.length < 2) e(`${r.id}: zu wenige Schritte`);
  });
  const base = { diet_base: 'omnivore', diet_modifiers: [], allergies: [], intolerances: [], disliked_ingredients: [], utensils: ['stove', 'pot', 'pan', 'oven', 'baking_tray', 'blender', 'hand_blender', 'toaster', 'food_processor', 'wok'], staples: [], spice_level: 3, skill_level: 'pro', meal_pattern: { breakfast: true, lunch: true, dinner: true, snacks: 1 }, household_size: 1, time_weekday_min: 90, time_weekend_min: 90, sex: 'male', birth_year: 1996, height_cm: 180, weight_kg: 80, activity_level: 'moderate', goal: 'lose', pace_kg_week: 0.5 };
  base.targets = H.calcTargets(base);
  const sg = (o, f) => H.suggest({ profile: { ...base, ...o }, pantry: [], foodLog: [], filters: { limit: 300, ...(f || {}) } });
  sg({ diet_base: 'vegan' }).forEach(x => x.ings.forEach(i => { if (H.ING.get(i.ing).animal !== 'none') e('Vegan-Fehler: ' + x.recipe.id); }));
  sg({ allergies: ['gluten'] }).forEach(x => x.ings.forEach(i => { if (H.ING.get(i.ing).allergens.includes('gluten')) e('Gluten-Fehler: ' + x.recipe.id); }));
  sg({ intolerances: ['lactose'] }).forEach(x => x.ings.forEach(i => { if (H.ING.get(i.ing).flags.includes('lactose')) e('Laktose-Fehler: ' + x.recipe.id); }));
  sg({}, { max_time: 15 }).forEach(x => { if (x.recipe.prep_min + x.recipe.cook_min > 15) e('Zeitfilter: ' + x.recipe.id); });
  sg({ disliked_ingredients: [{ id: 'onion', level: 'hate' }] }).forEach(x => { if (x.ings.some(i => i.ing === 'onion')) e('Abneigung ignoriert: ' + x.recipe.id); });
  const t = base.targets;
  if (Math.abs(t.kcal - 2200) > 60) e('Zielkalorien Beispielprofil: ' + t.kcal);
  const plan = H.planWeek({ profile: base, pantry: [], foodLog: [], weekStart: H.mondayISO(), seed: 1, filters: {} });
  for (let d = 0; d < 7; d++) { const k = H.dayKcal(plan, H.addDays(H.mondayISO(), d), base); if (Math.abs(k - t.kcal) > t.kcal * 0.18) e(`Plan Tag ${d + 1}: ${Math.round(k)} kcal`); }
  console.group('Healthly Selbsttest'); console.table({ Zutaten: H.INGREDIENTS.length, Rezepte: H.RECIPES.length, Fehler: errs.length }); console.log(errs.length ? errs : '0 Fehler'); console.groupEnd();
  const b = document.createElement('div'); b.textContent = `Selbsttest: ${errs.length} Fehler`;
  b.style.cssText = 'position:fixed;left:12px;bottom:12px;z-index:100;background:#10231A;color:#fff;padding:6px 12px;border-radius:99px;font:700 12px sans-serif'; document.body.append(b);
  window.healthlySelftest = errs;
})();
