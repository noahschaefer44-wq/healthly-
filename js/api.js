/* Healthly – EINZIGE Daten- und Auth-Schicht.
   Aktuell Mock mit localStorage, damit die App komplett ohne Backend läuft.
   Später wird nur diese Datei gegen Supabase getauscht (siehe TODO SUPABASE). */
(function () {
  const H = window.HD;
  const ACC = 'healthly:accounts', SES = 'healthly:session';
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const latency = () => sleep(40 + Math.random() * 60);
  const read = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch (e) { return d; } };
  const write = (k, v) => localStorage.setItem(k, JSON.stringify(v));
  const me = () => read(SES, null);
  const key = c => `healthly:${(me() || {}).id}:${c}`;
  const authListeners = new Set();
  const emit = u => authListeners.forEach(f => f(u));
  const stamp = x => ({ ...x, id: x.id || H.uid(), user_id: (me() || {}).id, created_at: x.created_at || new Date().toISOString(), updated_at: new Date().toISOString() });
  const need = () => { if (!me()) throw new Error('not_signed_in'); };
  // MOCK: Passwort-Hash nur für die lokale Demo. Supabase Auth übernimmt das später.
  async function hash(s) {
    const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode('healthly:' + s));
    return [...new Uint8Array(b)].map(x => x.toString(16).padStart(2, '0')).join('');
  }
  function upsert(coll, item) {
    need();
    const a = read(key(coll), []), v = stamp(item), i = a.findIndex(q => q.id === v.id);
    if (i < 0) a.push(v); else a[i] = { ...a[i], ...v, created_at: a[i].created_at };
    write(key(coll), a); return v;
  }
  const remove = (coll, id) => { need(); write(key(coll), read(key(coll), []).filter(x => x.id !== id)); };
  const weekOf = iso => H.mondayISO(iso);

  const api = {
    /* ---- Auth ---- */
    // TODO SUPABASE: supabase.auth.signUp({ email, password })
    async signUp(email, password) {
      await latency(); email = String(email).trim().toLowerCase();
      const a = read(ACC, []);
      if (a.some(x => x.email === email)) throw new Error('email_exists');
      const u = { id: H.uid(), email };
      a.push({ ...u, password_hash: await hash(password) }); write(ACC, a); write(SES, u); emit(u);
      return { user: u };
    },
    // TODO SUPABASE: supabase.auth.signInWithPassword({ email, password })
    async signIn(email, password) {
      await latency(); email = String(email).trim().toLowerCase();
      const rec = read(ACC, []).find(x => x.email === email);
      if (!rec || rec.password_hash !== await hash(password)) throw new Error('invalid_credentials');
      const u = { id: rec.id, email: rec.email }; write(SES, u); emit(u);
      return { user: u };
    },
    // TODO SUPABASE: supabase.auth.signOut()
    async signOut() { localStorage.removeItem(SES); emit(null); },
    // TODO SUPABASE: supabase.auth.getUser()
    async getCurrentUser() { return me(); },
    // TODO SUPABASE: supabase.auth.onAuthStateChange
    onAuthChange(cb) { authListeners.add(cb); return () => authListeners.delete(cb); },
    // TODO SUPABASE: supabase.auth.resetPasswordForEmail(email)
    async requestPasswordReset() { await latency(); },
    // TODO SUPABASE: Edge Function mit service role, die den Auth-User und alle Zeilen löscht
    async deleteAccount() {
      const u = me(); if (!u) return;
      write(ACC, read(ACC, []).filter(x => x.id !== u.id));
      Object.keys(localStorage).filter(k => k.startsWith(`healthly:${u.id}:`)).forEach(k => localStorage.removeItem(k));
      localStorage.removeItem(SES); emit(null);
    },

    /* ---- Profil ---- */
    // TODO SUPABASE: Tabelle profiles (eine Zeile pro user_id, Rest als jsonb)
    async getProfile() { need(); await latency(); return read(key('profile'), null); },
    async saveProfile(p) { need(); const v = { ...p, user_id: me().id, updated_at: new Date().toISOString() }; write(key('profile'), v); return v; },

    /* ---- Vorrat ---- */
    // TODO SUPABASE: Tabelle pantry_items
    async listPantry() { need(); return read(key('pantry'), []); },
    async upsertPantryItem(x) { return upsert('pantry', x); },
    async upsertPantryItems(xs) { return xs.map(x => upsert('pantry', x)); },
    async deletePantryItem(id) { remove('pantry', id); },

    /* ---- Einkaufsliste ---- */
    // TODO SUPABASE: Tabelle shopping_items
    async listShopping() { need(); return read(key('shopping'), []); },
    async upsertShoppingItem(x) { return upsert('shopping', x); },
    async upsertShoppingItems(xs) { return xs.map(x => upsert('shopping', x)); },
    async deleteShoppingItem(id) { remove('shopping', id); },
    async clearCheckedShopping() { need(); write(key('shopping'), read(key('shopping'), []).filter(x => !x.checked)); },

    /* ---- Favoriten / Bewertungen / Ausgeblendet ---- */
    // TODO SUPABASE: Tabellen favorites, ratings, blocked_recipes
    async listFavorites() { need(); return read(key('favorites'), []); },
    async toggleFavorite(id) { need(); let a = read(key('favorites'), []); const on = !a.includes(id); a = on ? [...a, id] : a.filter(x => x !== id); write(key('favorites'), a); return on; },
    async listRatings() { need(); return read(key('ratings'), {}); },
    async rateRecipe(id, stars) { need(); const x = read(key('ratings'), {}); x[id] = stars; write(key('ratings'), x); },
    async listBlocked() { need(); return read(key('blocked'), []); },
    async toggleBlocked(id) { need(); let a = read(key('blocked'), []); const on = !a.includes(id); a = on ? [...a, id] : a.filter(x => x !== id); write(key('blocked'), a); return on; },

    /* ---- Tagebuch ---- */
    // TODO SUPABASE: Tabelle food_log
    async logFood(x) { return upsert('food', x); },
    async deleteFoodLog(id) { remove('food', id); },
    async listFoodLog(from, to) { need(); return read(key('food'), []).filter(x => x.date >= from && x.date <= to); },

    /* ---- Gewicht ---- */
    // TODO SUPABASE: Tabelle weight_log (unique user_id + date)
    async logWeight(date, kg) {
      need(); const a = read(key('weight'), []), i = a.findIndex(x => x.date === date);
      const v = stamp({ ...(i >= 0 ? a[i] : {}), date, kg });
      if (i < 0) a.push(v); else a[i] = v;
      write(key('weight'), a); return v;
    },
    async listWeight(from, to) { need(); return read(key('weight'), []).filter(x => x.date >= from && x.date <= to); },

    /* ---- Wochenplan ---- */
    // TODO SUPABASE: Tabelle meal_plan
    async listMealPlan(week) { need(); return read(key('plan'), []).filter(x => weekOf(x.date) === week); },
    async upsertMealPlanEntry(x) { return upsert('plan', x); },
    async deleteMealPlanEntry(id) { remove('plan', id); },
    async replaceMealPlanWeek(week, entries) {
      need();
      const all = read(key('plan'), []);
      const kept = all.filter(x => weekOf(x.date) !== week || x.locked);
      entries.forEach(e => kept.push(stamp(e)));
      write(key('plan'), kept);
      return kept.filter(x => weekOf(x.date) === week);
    },

    /* ---- KI ---- */
    // TODO NETLIFY: später POST /.netlify/functions/suggest mit dem Kontext; bis dahin immer null
    async getAiSuggestions() { return null; }
  };
  H.api = api;
})();
