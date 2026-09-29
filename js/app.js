/* Healthly – Start, Router, globale Events */
(function () {
  const H = window.HD, S = H.S, A = H.actions;
  const { $, $$ } = H;

  H.resetState = () => {
    Object.assign(S, { user: null, profile: null, pantry: [], shopping: [], favorites: [], ratings: {}, blocked: [], foodLog: [], weights: [], planByWeek: {}, weekStart: H.mondayISO(), cook: null });
    S.ui = { filters: {}, shown: 12, recServ: {}, nutriTab: 'per', seed: 1, planDay: null };
    H.clearCaches();
  };
  H.reloadLog = async () => { S.foodLog = await H.api.listFoodLog(H.addDays(H.todayISO(), -60), H.todayISO()); };
  H.loadAll = async () => {
    S.user = await H.api.getCurrentUser();
    if (!S.user) return;
    const t = H.todayISO();
    const [profile, pantry, shopping, favorites, ratings, blocked, foodLog, weights, plan] = await Promise.all([
      H.api.getProfile(), H.api.listPantry(), H.api.listShopping(), H.api.listFavorites(), H.api.listRatings(), H.api.listBlocked(),
      H.api.listFoodLog(H.addDays(t, -60), t), H.api.listWeight(H.addDays(t, -400), t), H.api.listMealPlan(H.mondayISO())
    ]);
    if (profile && !profile.targets) profile.targets = H.calcTargets(profile);
    Object.assign(S, { profile, pantry, shopping, favorites, ratings, blocked, foodLog, weights });
    S.planByWeek[H.mondayISO()] = plan;
    if (!profile) { S.profile = H.newProfile(); await H.api.saveProfile(S.profile); }
  };

  /* ---------- Router ---------- */
  const PUBLIC = ['welcome', 'login', 'register'];
  const parse = () => {
    const [path, qs] = (location.hash || '').slice(1).split('?');
    const parts = path.split('/').filter(Boolean);
    return { route: parts[0] || '', params: parts.slice(1), query: new URLSearchParams(qs || '') };
  };
  let lastRoute = null;
  function guard(route) {
    if (!S.user) return PUBLIC.includes(route) ? null : '#/welcome';
    const done = S.profile && S.profile.onboarding_done;
    if (!done) return route === 'onboarding' ? null : '#/onboarding/1';
    if (PUBLIC.includes(route) || route === 'onboarding' || !route) return '#/home';
    return null;
  }
  function render(keep) {
    const { route, params, query } = parse();
    const redir = guard(route);
    if (redir) { location.replace(redir); return; }
    if (!keep) H.cleanups.splice(0).forEach(fn => { try { fn(); } catch (e) { /* egal */ } });
    H.acFree = false;
    const screen = H.screens[route];
    if (!screen) { location.replace(S.user ? '#/home' : '#/welcome'); return; }
    let out;
    try { out = screen(params, query); } catch (e) { console.error(e); out = { html: `<div class="app"><div class="card"><h2>Ups</h2><p>Diese Seite konnte nicht geladen werden.</p><a class="btn btn-primary" href="#/home">Zur Startseite</a></div></div>` }; }
    if (out === '' || out == null) return;
    if (typeof out === 'string') out = { html: out };
    const y = keep ? window.scrollY : 0;
    const draw = () => {
      const app = $('#app'); app.innerHTML = out.html;
      if (out.after) { try { const r = out.after(app); if (r && r.catch) r.catch(H.fail); } catch (e) { console.error(e); } }
      if (!keep) H.$$('[data-stagger]', app).forEach((e, i) => e.style.setProperty('--i', Math.min(i, 12)));
      window.scrollTo(0, y);
    };
    const changed = route !== lastRoute; lastRoute = route;
    if (keep) { document.body.classList.add('no-anim'); draw(); setTimeout(() => document.body.classList.remove('no-anim'), 80); }
    else if (changed && document.startViewTransition && !matchMedia('(prefers-reduced-motion:reduce)').matches) document.startViewTransition(draw);
    else draw();
  }
  H.render = render;
  H.rerender = () => render(true);

  /* ---------- Events ---------- */
  document.addEventListener('click', e => {
    const b = e.target.closest('.btn'); if (b && !b.disabled) {
      const r = b.getBoundingClientRect(), d = Math.max(r.width, r.height), s = document.createElement('span');
      s.className = 'ripple'; s.style.cssText = `width:${d}px;height:${d}px;left:${e.clientX - r.left - d / 2}px;top:${e.clientY - r.top - d / 2}px`;
      b.append(s); setTimeout(() => s.remove(), 600);
    }
    if (!e.target.closest('[data-acbox]') && !e.target.closest('[data-f=ac]')) $$('[data-acbox]').forEach(x => x.classList.add('hidden'));
    const el = e.target.closest('[data-a]');
    if (!el || el.disabled) return;
    const fn = A[el.dataset.a];
    if (!fn) return;
    if (el.tagName === 'A') e.preventDefault();
    try { const r = fn(el, e); if (r && r.catch) r.catch(H.fail); } catch (err) { H.fail(err); }
  });
  const onInput = e => { const el = e.target.closest('[data-f]'); if (el && H.inputs[el.dataset.f]) { try { H.inputs[el.dataset.f](el, e); } catch (err) { console.error(err); } } };
  document.addEventListener('input', onInput);
  document.addEventListener('change', onInput);
  document.addEventListener('submit', e => { const f = e.target.closest('#authform'); if (f) { e.preventDefault(); H.submitAuth(f); } });
  document.addEventListener('keydown', e => {
    if (e.key === 'Enter' && e.target.matches && e.target.matches('[data-f=ac]')) {
      e.preventDefault();
      const first = e.target.parentElement.querySelector('[data-acbox] button');
      if (first) first.click(); else if (e.target.dataset.ac === 'shop') H.submitShop();
    }
    if ((e.key === 'Enter' || e.key === ' ') && e.target.matches && e.target.matches('.shop[data-a]')) { e.preventDefault(); e.target.click(); }
  });
  A.go = el => { H.closeSheet(); location.hash = el.dataset.to; };
  A['close-sheet'] = () => H.closeSheet();
  A.theme = () => { const cur = H.uiPrefs().theme || 'system', next = cur === 'system' ? 'dark' : cur === 'dark' ? 'light' : 'system'; H.setTheme(next); H.toast('Darstellung: ' + { system: 'System', dark: 'Dunkel', light: 'Hell' }[next]); };
  addEventListener('hashchange', () => render());

  /* ---------- Start ---------- */
  (async function boot() {
    H.applyPrefs();
    try { await H.loadAll(); } catch (e) { console.error(e); }
    if (!location.hash) location.replace(S.user ? (S.profile && S.profile.onboarding_done ? '#/home' : '#/onboarding/1') : '#/welcome');
    render();
    if (new URLSearchParams(location.search).get('dev') === '1') { window.healthly = H; const s = document.createElement('script'); s.src = 'js/selftest.js'; document.body.append(s); }
  })();
})();
