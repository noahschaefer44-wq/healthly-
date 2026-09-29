/* Healthly – EINZIGE Daten- und Auth-Schicht (Supabase).
   Alle Nutzerdaten liegen als Dokumente in der Tabelle hl_docs (Row Level Security: jeder sieht nur seine Zeilen).
   Ohne Supabase-Bibliothek oder mit ?local=1 nutzt die App die lokale Variante (api-local.js). */
(function () {
  const H = window.HD, cfg = H.config;
  const useLocal = new URLSearchParams(location.search).get('local') === '1' || !window.supabase;
  if (useLocal) { H.api = H.apiLocal; H.backend = 'local'; return; }
  H.backend = 'supabase';
  const sb = window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseKey, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } });
  H.sb = sb;
  const ok = ({ data, error }) => { if (error) { const e = new Error(error.message || 'db_error'); e.code = error.code; throw e; } return data; };
  let cachedUser;
  async function user() {
    if (cachedUser !== undefined) return cachedUser;
    const { data } = await sb.auth.getSession();
    cachedUser = data.session ? { id: data.session.user.id, email: data.session.user.email } : null;
    return cachedUser;
  }
  sb.auth.onAuthStateChange((ev, session) => { cachedUser = session ? { id: session.user.id, email: session.user.email } : null; });
  const me = async () => { const u = await user(); if (!u) throw new Error('not_signed_in'); return u; };
  const stamp = (x, extra) => ({ ...x, id: x.id || H.uid(), created_at: x.created_at || new Date().toISOString(), updated_at: new Date().toISOString(), ...(extra || {}) });

  async function list(coll) { const u = await me(); return ok(await sb.from('hl_docs').select('data').eq('user_id', u.id).eq('coll', coll).order('created_at')).map(r => r.data); }
  async function listRange(coll, from, to) { const u = await me(); return ok(await sb.from('hl_docs').select('data').eq('user_id', u.id).eq('coll', coll).gte('d', from).lte('d', to).order('d')).map(r => r.data); }
  async function put(coll, item, id) {
    const u = await me(), v = stamp(item);
    ok(await sb.from('hl_docs').upsert({ user_id: u.id, coll, id: id || v.id, d: v.date || null, data: v, updated_at: v.updated_at }, { onConflict: 'user_id,coll,id' }));
    return v;
  }
  async function del(coll, id) { const u = await me(); ok(await sb.from('hl_docs').delete().eq('user_id', u.id).eq('coll', coll).eq('id', id)); }
  async function toggle(coll, id) {
    const u = await me(), r = ok(await sb.from('hl_docs').select('id').eq('user_id', u.id).eq('coll', coll).eq('id', id));
    if (r.length) { await del(coll, id); return false; }
    await put(coll, { id }, id); return true;
  }
  const errMap = m => /invalid login/i.test(m) ? 'invalid_credentials' : /not confirmed/i.test(m) ? 'email_not_confirmed' : /already registered/i.test(m) ? 'email_exists' : /rate limit/i.test(m) ? 'rate_limit' : m;

  H.api = {
    /* Auth (Supabase Auth) */
    async signUp(email, password) {
      email = String(email).trim().toLowerCase();
      const { data, error } = await sb.auth.signUp({ email, password });
      if (error) throw new Error(errMap(error.message));
      if (data.user && data.user.identities && data.user.identities.length === 0) throw new Error('email_exists');
      if (!data.session) throw new Error('confirm_email');
      cachedUser = { id: data.session.user.id, email: data.session.user.email };
      return { user: cachedUser };
    },
    async signIn(email, password) {
      const { data, error } = await sb.auth.signInWithPassword({ email: String(email).trim().toLowerCase(), password });
      if (error) throw new Error(errMap(error.message));
      cachedUser = { id: data.session.user.id, email: data.session.user.email };
      return { user: cachedUser };
    },
    async signOut() { await sb.auth.signOut(); cachedUser = null; },
    async getCurrentUser() { return user(); },
    onAuthChange(cb) { const { data } = sb.auth.onAuthStateChange((ev, s) => cb(s ? { id: s.user.id, email: s.user.email } : null)); return () => data.subscription.unsubscribe(); },
    async requestPasswordReset(email) { ok(await sb.auth.resetPasswordForEmail(String(email).trim(), { redirectTo: location.origin + location.pathname })); },
    // Löscht alle Healthly-Daten. Das Auth-Konto bleibt bestehen, weil das Supabase-Projekt mit einer anderen App geteilt wird.
    async deleteAccount() { const u = await me(); ok(await sb.from('hl_docs').delete().eq('user_id', u.id)); await sb.auth.signOut(); cachedUser = null; },

    /* Profil */
    async getProfile() { const u = await me(); const r = ok(await sb.from('hl_docs').select('data').eq('user_id', u.id).eq('coll', 'profile').eq('id', 'me')); return r.length ? r[0].data : null; },
    async saveProfile(p) { const u = await me(); const v = { ...p, user_id: u.id, updated_at: new Date().toISOString() }; ok(await sb.from('hl_docs').upsert({ user_id: u.id, coll: 'profile', id: 'me', d: null, data: v, updated_at: v.updated_at }, { onConflict: 'user_id,coll,id' })); return v; },

    /* Vorrat, Einkauf */
    listPantry: () => list('pantry'), upsertPantryItem: x => put('pantry', x), async upsertPantryItems(xs) { const o = []; for (const x of xs) o.push(await put('pantry', x)); return o; }, deletePantryItem: id => del('pantry', id),
    listShopping: () => list('shopping'), upsertShoppingItem: x => put('shopping', x), async upsertShoppingItems(xs) { const o = []; for (const x of xs) o.push(await put('shopping', x)); return o; }, deleteShoppingItem: id => del('shopping', id),
    async clearCheckedShopping() { const u = await me(); ok(await sb.from('hl_docs').delete().eq('user_id', u.id).eq('coll', 'shopping').eq('data->>checked', 'true')); },

    /* Favoriten, Bewertungen, Ausgeblendet */
    async listFavorites() { return (await list('favorites')).map(x => x.id); }, toggleFavorite: id => toggle('favorites', id),
    async listRatings() { const o = {}; (await list('ratings')).forEach(x => { o[x.id] = x.stars; }); return o; }, async rateRecipe(id, stars) { await put('ratings', { id, stars }, id); },
    async listBlocked() { return (await list('blocked')).map(x => x.id); }, toggleBlocked: id => toggle('blocked', id),

    /* Tagebuch, Gewicht */
    logFood: x => put('food', x), deleteFoodLog: id => del('food', id), listFoodLog: (a, b) => listRange('food', a, b),
    async logWeight(date, kg) { return put('weight', { id: date, date, kg }, date); }, listWeight: (a, b) => listRange('weight', a, b),

    /* Wochenplan */
    listMealPlan: week => listRange('plan', week, H.addDays(week, 6)), upsertMealPlanEntry: x => put('plan', x), deleteMealPlanEntry: id => del('plan', id),
    async replaceMealPlanWeek(week, entries) {
      const old = await listRange('plan', week, H.addDays(week, 6)), u = await me();
      const drop = old.filter(x => !x.locked).map(x => x.id);
      if (drop.length) ok(await sb.from('hl_docs').delete().eq('user_id', u.id).eq('coll', 'plan').in('id', drop));
      for (const e of entries) await put('plan', e);
      return listRange('plan', week, H.addDays(week, 6));
    },

    // TODO NETLIFY: später POST /.netlify/functions/suggest mit dem Kontext; bis dahin immer null
    async getAiSuggestions() { return null; }
  };
})();
