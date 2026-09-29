/* Healthly – Screens 1: Shell, Welcome, Auth, Onboarding, Profil-Formulare, Home */
(function () {
  const H = window.HD, S = H.S, A = H.actions, I = H.inputs;
  const { esc, nf, r0, toast, fail } = H;
  H.screens = {};
  S.planByWeek = {};

  /* ---------- Shell ---------- */
  const TABS = [['home', '🏠', 'Home'], ['discover', '🔍', 'Entdecken'], ['plan', '📅', 'Plan'], ['pantry', '🥕', 'Vorrat'], ['shopping', '🛒', 'Liste']];
  H.shell = (content, active, o) => {
    o = o || {};
    const open = S.shopping.filter(x => !x.checked).length;
    const ini = ((S.profile && S.profile.display_name) || 'H')[0].toUpperCase();
    return `<aside class="sidebar"><a class="brand" href="#/home"><span class="logo">🌿</span>Healthly</a>
      ${TABS.map(t => `<a class="${active === t[0] ? 'active' : ''}" href="#/${t[0]}">${t[1]} ${t[2]}</a>`).join('')}
      <a class="${active === 'progress' ? 'active' : ''}" href="#/progress">📈 Fortschritt</a><a class="${active === 'profile' ? 'active' : ''}" href="#/profile">👤 Profil</a></aside>
    <div class="app"><header class="topbar"><a class="brand" href="#/home"><span class="logo">🌿</span><span>Healthly</span></a>
      <div class="actions"><button class="iconbtn" type="button" data-a="theme" aria-label="Darstellung wechseln">◐</button><a class="iconbtn" href="#/progress" aria-label="Fortschritt">📈</a><a class="iconbtn" href="#/profile" aria-label="Profil" style="font-weight:800">${esc(ini)}</a></div></header>
      <main id="view">${content}</main></div>
    <nav class="tabbar" aria-label="Hauptnavigation">${TABS.map(t => `<a class="tab ${active === t[0] ? 'active' : ''}" href="#/${t[0]}"><b>${t[1]}</b>${t[2]}${t[0] === 'shopping' && open ? `<span class="badge">${open}</span>` : ''}</a>`).join('')}</nav>
    ${o.fab ? '<button class="fab" type="button" data-a="quick" aria-label="Schnell hinzufügen">+</button>' : ''}`;
  };
  H.back = (href, label) => `<a class="btn btn-ghost btn-sm" href="${href}" style="margin-left:-12px;margin-bottom:6px">‹ ${esc(label || 'Zurück')}</a>`;

  /* ---------- Welcome ---------- */
  H.screens.welcome = () => `<div class="app"><div class="center-wrap"><div class="wel">
    <svg class="leaf" width="96" height="96" viewBox="0 0 96 96" fill="none" stroke="var(--primary)" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M48 84C20 72 12 48 22 26c24 2 42 14 44 38"/><path d="M48 84V44"/></svg>
    <h1>Iss gut. Ohne Stress.</h1><p style="font-size:18px">Rezepte aus dem, was du hast – passend zu deinem Ziel, deiner Zeit und deiner Küche.</p>
    <div class="chips" style="justify-content:center;margin:18px 0 28px"><span class="chip" data-stagger>🥕 Aus deinem Vorrat</span><span class="chip" data-stagger>🎯 Passend zu deinem Ziel</span><span class="chip" data-stagger>🛒 Einkaufsliste automatisch</span></div>
    <div class="row wrap" style="justify-content:center"><a class="btn btn-primary" href="#/register">Los geht's</a><a class="btn btn-ghost" href="#/login">Ich habe schon einen Account</a></div></div></div></div>`;

  /* ---------- Auth ---------- */
  function authHtml(mode) {
    const reg = mode === 'register';
    return `<div class="app"><div class="center-wrap"><div class="card authbox">
      <div class="brand" style="margin-bottom:14px"><span class="logo">🌿</span>Healthly</div>
      <div class="seg" style="margin-bottom:18px"><button type="button" class="${reg ? '' : 'on'}" data-a="go" data-to="#/login">Anmelden</button><button type="button" class="${reg ? 'on' : ''}" data-a="go" data-to="#/register">Registrieren</button></div>
      <h1 style="font-size:28px">${reg ? 'Dein Healthly starten' : 'Willkommen zurück'}</h1>
      <form class="form" id="authform" novalidate data-mode="${mode}">
        <label class="label">E-Mail<input class="field" type="email" name="email" autocomplete="email" inputmode="email" required></label>
        <div class="errtxt" data-err="email"></div>
        <label class="label">Passwort<span class="row" style="gap:8px"><input class="field" type="password" name="password" autocomplete="${reg ? 'new-password' : 'current-password'}" required data-f="pwstrength"><button class="iconbtn" type="button" data-a="pwshow" aria-label="Passwort anzeigen">👁</button></span></label>
        ${reg ? '<div class="bar" id="pwbar"><i></i></div><div class="small muted" id="pwtxt">Mindestens 8 Zeichen</div>' : ''}
        <div class="errtxt" data-err="password"></div>
        ${reg ? '<label class="label">Passwort wiederholen<input class="field" type="password" name="repeat" autocomplete="new-password"></label><div class="errtxt" data-err="repeat"></div>' : ''}
        <button class="btn btn-primary btn-block" type="submit">${reg ? 'Account erstellen' : 'Anmelden'}</button>
      </form>
      ${reg ? '' : '<p class="center" style="margin-top:14px"><button class="btn btn-ghost btn-sm" data-a="pwreset">Passwort vergessen?</button></p>'}
      <p class="small muted center">${reg ? 'Mit der Registrierung stimmst du zu, dass deine Daten für die App gespeichert werden.' : ''}</p></div></div></div>`;
  }
  H.screens.login = () => authHtml('login');
  H.screens.register = () => authHtml('register');
  A.pwshow = el => { const i = el.parentElement.querySelector('input'); i.type = i.type === 'password' ? 'text' : 'password'; };
  I.pwstrength = el => {
    const bar = H.$('#pwbar i'); if (!bar) return;
    const v = el.value; let s = 0;
    if (v.length >= 8) s++; if (v.length >= 12) s++; if (/[A-Z]/.test(v) && /[a-z]/.test(v)) s++; if (/\d/.test(v) && /[^A-Za-z0-9]/.test(v)) s++;
    bar.style.transform = `scaleX(${s / 4})`; bar.style.background = s < 2 ? 'var(--danger)' : s < 3 ? 'var(--warning)' : 'var(--primary)';
    H.$('#pwtxt').textContent = !v ? 'Mindestens 8 Zeichen' : s < 2 ? 'Schwach' : s < 3 ? 'Okay' : 'Stark';
  };
  A.pwreset = () => {
    H.openSheet(`<div class="sheet-head"><h2>Passwort zurücksetzen</h2></div><p>Wir schicken dir einen Link, sobald das Backend angebunden ist.</p><label class="label">E-Mail<input class="field" id="rstmail" type="email"></label><button class="btn btn-primary btn-block" style="margin-top:14px" data-a="pwreset-go">Link senden</button>`);
  };
  A['pwreset-go'] = async () => { try { await H.api.requestPasswordReset(H.$('#rstmail').value); H.closeSheet(); toast('Wenn die E-Mail existiert, ist der Link unterwegs.'); } catch (e) { fail(e); } };
  H.submitAuth = async form => {
    const mode = form.dataset.mode, f = new FormData(form), email = String(f.get('email')).trim(), pw = String(f.get('password'));
    const err = (k, t) => { const e = form.querySelector(`[data-err=${k}]`); if (e) e.textContent = t; const i = form.querySelector(`[name=${k}]`); if (i && t) { i.classList.remove('err'); void i.offsetWidth; i.classList.add('err'); } };
    ['email', 'password', 'repeat'].forEach(k => err(k, ''));
    let bad = false;
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) { err('email', 'Bitte gib eine gültige E-Mail ein.'); bad = true; }
    if (pw.length < 8) { err('password', 'Mindestens 8 Zeichen.'); bad = true; }
    if (mode === 'register' && pw !== f.get('repeat')) { err('repeat', 'Die Passwörter stimmen nicht überein.'); bad = true; }
    if (bad) { H.haptic('error'); return; }
    const btn = form.querySelector('button[type=submit]'); btn.disabled = true;
    try {
      if (mode === 'register') {
        const { user } = await H.api.signUp(email, pw); S.user = user;
        S.profile = H.newProfile(); S.profile.targets = H.calcTargets(S.profile);
        await H.api.saveProfile(S.profile); await H.loadAll(); location.hash = '#/onboarding/1';
      } else {
        const { user } = await H.api.signIn(email, pw); S.user = user; await H.loadAll();
        location.hash = S.profile && S.profile.onboarding_done ? '#/home' : '#/onboarding/1';
      }
    } catch (e) {
      const m = e.message;
      if (m === 'email_exists') err('email', 'Diese E-Mail ist schon registriert.');
      else if (m === 'invalid_credentials') err('password', 'E-Mail oder Passwort stimmt nicht.');
      else fail(e);
      H.haptic('error');
    } finally { btn.disabled = false; }
  };

  H.newProfile = () => ({
    display_name: '', goal: null, pace_kg_week: 0.5, sex: null, birth_year: 1995, height_cm: 172, weight_kg: 70, target_weight_kg: null,
    activity_level: 'light', pregnant_or_breastfeeding: false, diet_base: 'omnivore', diet_modifiers: [], allergies: [], intolerances: [],
    liked_cuisines: [], liked_ingredients: [], disliked_ingredients: [], spice_level: 1,
    utensils: ['stove', 'oven', 'pot', 'pan', 'baking_tray', 'kettle'], staples: ['salt', 'pepper', 'olive_oil', 'rapeseed_oil', 'sugar', 'vegetable_stock'],
    time_weekday_min: 30, time_weekend_min: 60, skill_level: 'beginner', household_size: 1, budget: 'medium',
    meal_pattern: { breakfast: true, lunch: true, dinner: true, snacks: 1 }, targets: null, targets_override: null,
    taste_affinity: { cuisine: {}, ingredient: {} }, onboarding_done: false
  });

  /* ---------- Formular-Bausteine (Onboarding + Profil) ---------- */
  const has = (p, k, v) => Array.isArray(p[k]) ? p[k].includes(v) : p[k] === v;
  const choices = (list, p, k, multi, o) => `<div class="grid ${(o && o.cols) === 1 ? '' : 'g2 keep'}" role="group">${list.map(x => {
    const on = has(p, k, x[0]);
    return `<button type="button" class="choice ${on ? 'on' : ''} ${x[4] ? 'off' : ''}" data-a="pick" data-k="${k}" data-v="${esc(x[0])}" data-multi="${multi ? 1 : 0}" data-t="${typeof x[0] === 'number' ? 'n' : 's'}" aria-pressed="${on}"><span class="em">${x[1]}</span><h3>${esc(x[2])}</h3>${x[3] ? `<p>${esc(x[3])}</p>` : ''}</button>`;
  }).join('')}</div>`;
  const chipsOf = (list, p, k, multi) => `<div class="chips">${list.map(x => `<button type="button" class="chip ${has(p, k, x[0]) ? 'on' : ''}" data-a="pick" data-k="${k}" data-v="${esc(x[0])}" data-multi="${multi ? 1 : 0}" data-t="${typeof x[0] === 'number' ? 'n' : 's'}" aria-pressed="${has(p, k, x[0])}">${x[1] ? x[1] + ' ' : ''}${esc(x[2])}</button>`).join('')}</div>`;
  const slider = (label, k, min, max, step, val, unit) => `<div class="card"><div class="row between"><b>${label}</b><span class="bignum"><span data-out="${k}">${nf(val)}</span> <small>${unit}</small></span></div><input class="range" type="range" min="${min}" max="${max}" step="${step}" value="${val}" data-f="num" data-k="${k}" aria-label="${label}"></div>`;
  const ALLERGENS = [['gluten', '🌾', 'Gluten'], ['crustaceans', '🦐', 'Krebstiere'], ['eggs', '🥚', 'Eier'], ['fish', '🐟', 'Fisch'], ['peanuts', '🥜', 'Erdnüsse'], ['soy', '🫘', 'Soja'], ['milk', '🥛', 'Milch'], ['nuts', '🌰', 'Schalenfrüchte'], ['celery', '🥬', 'Sellerie'], ['mustard', '🟡', 'Senf'], ['sesame', '⚪', 'Sesam'], ['sulphites', '🍷', 'Sulfite'], ['lupin', '🌼', 'Lupinen'], ['molluscs', '🐚', 'Weichtiere']];
  const CUISINES = [['german', '🥨', 'Deutsch'], ['italian', '🍝', 'Italienisch'], ['mediterranean', '🫒', 'Mediterran'], ['greek', '🥙', 'Griechisch'], ['middle_eastern', '🧆', 'Orientalisch'], ['indian', '🍛', 'Indisch'], ['thai', '🍜', 'Thai'], ['chinese', '🥢', 'Chinesisch'], ['japanese', '🍣', 'Japanisch'], ['mexican', '🌮', 'Mexikanisch'], ['american', '🍔', 'Amerikanisch'], ['french', '🥐', 'Französisch']];
  const UTENSILS = [['stove', '🔥', 'Herd'], ['oven', '♨️', 'Backofen'], ['baking_tray', '🟫', 'Backblech'], ['pot', '🍲', 'Topf'], ['pan', '🍳', 'Pfanne'], ['wok', '🥢', 'Wok'], ['microwave', '📡', 'Mikrowelle'], ['airfryer', '🌪️', 'Heißluftfritteuse'], ['blender', '🥤', 'Standmixer'], ['hand_blender', '🪄', 'Pürierstab'], ['food_processor', '⚙️', 'Küchenmaschine'], ['toaster', '🍞', 'Toaster'], ['sandwich_maker', '🥪', 'Sandwichmaker'], ['rice_cooker', '🍚', 'Reiskocher'], ['slow_cooker', '⏲️', 'Slow Cooker'], ['grill', '🍖', 'Grill'], ['kettle', '🫖', 'Wasserkocher']];
  H.UTENSILS = UTENSILS;
  H.STAPLES = null;
  const STAPLES = ['salt', 'pepper', 'olive_oil', 'rapeseed_oil', 'sugar', 'flour', 'vegetable_stock', 'balsamic', 'butter', 'paprika_powder', 'cumin', 'curry_powder', 'cinnamon', 'oregano', 'chili_flakes', 'garlic', 'onion'];
  H.STAPLES = STAPLES;
  const GOALS = [['lose', '🔥', 'Abnehmen', 'Sanftes Defizit'], ['muscle', '💪', 'Muskeln aufbauen', 'Viel Protein'], ['gain', '📈', 'Zunehmen', 'Kalorienüberschuss'], ['maintain', '⚖️', 'Gewicht halten', 'Ausgewogen'], ['healthy', '🥗', 'Gesünder essen', 'Mehr Vielfalt'], ['energy', '⚡', 'Mehr Energie', 'Stabil durch den Tag']];

  function paceInfo(p) {
    if (!['lose', 'gain'].includes(p.goal) || !p.target_weight_kg) return '';
    const diff = Math.abs(p.weight_kg - p.target_weight_kg), pace = p.pace_kg_week || 0.5;
    if (diff < 0.1) return 'Du bist schon am Ziel.';
    const d = new Date(); d.setDate(d.getDate() + Math.round((diff / pace) * 7));
    return `Noch ${nf(diff)} kg. Voraussichtlich erreicht: ${new Intl.DateTimeFormat('de-DE', { month: 'long', year: 'numeric' }).format(d)}`;
  }
  const dislikeChip = (p, d) => `<button type="button" class="chip ${d.level === 'hate' ? 'badc' : 'warnc'}" data-a="dislike-cycle" data-id="${esc(d.id)}">${d.level === 'hate' ? '😖' : '😕'} ${esc(H.ing(d.id).name)}</button>`;

  const BODY = {
    name: p => `<label class="label">Dein Vorname<input class="field" data-f="text" data-k="display_name" value="${esc(p.display_name)}" maxlength="30" autocomplete="given-name" autofocus></label>`,
    goal: p => choices(GOALS, p, 'goal', false),
    body: p => {
      const years = []; for (let y = new Date().getFullYear() - 14; y >= 1935; y--) years.push(y);
      return `<div class="form"><div><div class="label" style="margin-bottom:6px">Geschlecht</div><div class="seg" role="group">${[['male', 'männlich'], ['female', 'weiblich'], ['diverse', 'divers']].map(x => `<button type="button" class="${p.sex === x[0] ? 'on' : ''}" data-a="pick" data-k="sex" data-v="${x[0]}" data-t="s" data-multi="0">${x[1]}</button>`).join('')}</div></div>
      <label class="label">Geburtsjahr<select class="field" data-f="num" data-k="birth_year">${years.map(y => `<option ${p.birth_year === y ? 'selected' : ''}>${y}</option>`).join('')}</select></label>
      ${slider('Größe', 'height_cm', 140, 210, 1, p.height_cm, 'cm')}${slider('Gewicht', 'weight_kg', 40, 200, 0.5, p.weight_kg, 'kg')}
      <label class="row card" ${p.sex === 'male' ? 'style="display:none"' : ''}><span class="switch"><input type="checkbox" data-f="bool" data-k="pregnant_or_breastfeeding" ${p.pregnant_or_breastfeeding ? 'checked' : ''}><span></span></span><span>Ich bin schwanger oder stille</span></label></div>`;
    },
    pace: p => `<p>${p.goal === 'lose' ? 'Wie viel möchtest du abnehmen und wie schnell?' : 'Wie viel möchtest du zunehmen und wie schnell?'}</p>
      ${slider('Zielgewicht', 'target_weight_kg', 40, 200, 0.5, p.target_weight_kg || p.weight_kg, 'kg')}
      <div style="height:14px"></div>${choices([[0.25, '🐢', 'Entspannt', '0,25 kg pro Woche'], [0.5, '🚶', 'Normal', '0,5 kg pro Woche'], [0.75, '🏃', 'Ambitioniert', '0,75 kg pro Woche', p.goal === 'gain']], p, 'pace_kg_week', false, { cols: 1 })}
      <p id="pace-est" class="note info" style="margin-top:14px">${esc(paceInfo({ ...p, target_weight_kg: p.target_weight_kg || p.weight_kg }))}</p>`,
    activity: p => choices([['sedentary', '🪑', 'Wenig aktiv', 'Bürojob, kaum Sport'], ['light', '🚶', 'Leicht aktiv', '1 bis 2 Mal Sport pro Woche'], ['moderate', '🏃', 'Moderat aktiv', '3 bis 4 Mal Sport pro Woche'], ['high', '🏋️', 'Sehr aktiv', 'Fast täglich Training'], ['athlete', '🏅', 'Leistungssport', 'Training plus körperliche Arbeit']], p, 'activity_level', false, { cols: 1 }),
    diet: p => `${choices([['omnivore', '🍽️', 'Alles'], ['flexitarian', '🌱', 'Flexitarisch'], ['pescetarian', '🐟', 'Pescetarisch'], ['vegetarian', '🥕', 'Vegetarisch'], ['vegan', '🌿', 'Vegan']], p, 'diet_base', false)}<h3 style="margin-top:22px">Zusätzlich</h3>${chipsOf([['keto', '🥑', 'Keto'], ['low_carb', '🥦', 'Low Carb'], ['high_protein', '💪', 'High Protein'], ['halal', '☪️', 'Halal']], p, 'diet_modifiers', true)}`,
    allergy: p => `<h3>Allergien</h3>${chipsOf(ALLERGENS, p, 'allergies', true)}<h3 style="margin-top:22px">Unverträglichkeiten</h3>${chipsOf([['lactose', '🥛', 'Laktose'], ['fructose', '🍎', 'Fruktose'], ['histamine', '🧀', 'Histamin']], p, 'intolerances', true)}<p class="small muted" style="margin-top:14px">Wir filtern streng. Prüfe trotzdem immer die Verpackung.</p>`,
    likes: p => `<h3>Lieblingsküchen</h3>${chipsOf(CUISINES, p, 'liked_cuisines', true)}<h3 style="margin-top:22px">Schärfe</h3><div class="seg">${[[0, '🙂 mild'], [1, '🌶️'], [2, '🌶️🌶️'], [3, '🔥 scharf']].map(x => `<button type="button" class="${p.spice_level === x[0] ? 'on' : ''}" data-a="pick" data-k="spice_level" data-v="${x[0]}" data-t="n" data-multi="0">${x[1]}</button>`).join('')}</div>
      <h3 style="margin-top:22px">Was isst du besonders gern?</h3><div style="position:relative"><input class="field" data-f="ac" data-ac="like" placeholder="Zutat suchen …" autocomplete="off"><div class="ac hidden" data-acbox></div></div><div class="chips" id="likechips" style="margin-top:10px">${(p.liked_ingredients || []).map(id => `<button type="button" class="chip goodc" data-a="like-rm" data-id="${esc(id)}">${esc(H.ing(id).name)} ✕</button>`).join('')}</div>`,
    dislikes: p => `<p>Tippe auf eine Zutat, dann ist sie „nie“. Ein weiteres Tippen macht daraus „lieber nicht“, ein drittes entfernt sie.</p>
      <div style="position:relative"><input class="field" data-f="ac" data-ac="dislike" placeholder="Zutat suchen …" autocomplete="off"><div class="ac hidden" data-acbox></div></div>
      <div class="chips" id="dischips" style="margin:12px 0">${(p.disliked_ingredients || []).map(d => dislikeChip(p, d)).join('')}</div>
      <div class="small muted" style="margin-bottom:8px">Häufig</div><div class="chips">${[['cilantro', 'Koriander'], ['mushroom', 'Pilze'], ['olives', 'Oliven'], ['tofu', 'Tofu'], ['beetroot', 'Rote Bete'], ['onion', 'Zwiebeln'], ['celery', 'Sellerie'], ['salmon', 'Lachs']].map(x => `<button type="button" class="chip" data-a="dislike-add" data-id="${x[0]}">${x[1]}</button>`).join('')}</div>`,
    kitchen: p => `<h3>Deine Geräte</h3><div class="grid" style="grid-template-columns:repeat(auto-fill,minmax(96px,1fr))">${UTENSILS.map(u => `<button type="button" class="tile ${p.utensils.includes(u[0]) ? 'on' : ''}" data-a="pick" data-k="utensils" data-v="${u[0]}" data-t="s" data-multi="1" aria-pressed="${p.utensils.includes(u[0])}"><span class="em">${u[1]}</span>${u[2]}</button>`).join('')}</div><p class="small muted" style="margin-top:8px">Eine Schüssel hast du immer.</p>
      <h3 style="margin-top:22px">Grundvorrat, den du immer da hast</h3>${chipsOf(STAPLES.map(id => [id, '', H.ing(id).name]), p, 'staples', true)}`,
    routine: p => {
      const T = [10, 15, 20, 30, 45, 60, 90].map(x => [x, '', x + ' Min']);
      return `<div class="form"><div><div class="label" style="margin-bottom:8px">Zeit unter der Woche</div>${chipsOf(T, p, 'time_weekday_min', false)}</div><div><div class="label" style="margin-bottom:8px">Zeit am Wochenende</div>${chipsOf(T, p, 'time_weekend_min', false)}</div>
      <div><div class="label" style="margin-bottom:8px">Kochlevel</div>${choices([['beginner', '🌱', 'Anfänger'], ['intermediate', '🍳', 'Fortgeschritten'], ['pro', '👨‍🍳', 'Profi']], p, 'skill_level', false)}</div>
      <div class="row between card"><b>Personen im Haushalt</b><span class="stepper"><button type="button" data-a="hh" data-d="-1" aria-label="weniger">−</button><b id="hhv">${p.household_size}</b><button type="button" data-a="hh" data-d="1" aria-label="mehr">+</button></span></div>
      <div><div class="label" style="margin-bottom:8px">Budget</div>${choices([['low', '💶', 'Sparsam'], ['medium', '💶💶', 'Normal'], ['high', '💶💶💶', 'Großzügig']], p, 'budget', false)}</div>
      <div class="card"><div class="label" style="margin-bottom:8px">Welche Mahlzeiten planst du?</div>${['breakfast|Frühstück', 'lunch|Mittagessen', 'dinner|Abendessen'].map(x => { const [k, l] = x.split('|'); return `<label class="row" style="padding:6px 0"><span class="switch"><input type="checkbox" data-f="meal" data-k="${k}" ${p.meal_pattern[k] ? 'checked' : ''}><span></span></span>${l}</label>`; }).join('')}
      <div class="label" style="margin:10px 0 6px">Snacks pro Tag</div><div class="seg">${[0, 1, 2].map(n => `<button type="button" class="${p.meal_pattern.snacks === n ? 'on' : ''}" data-a="snacks" data-v="${n}">${n}</button>`).join('')}</div></div></div>`;
    },
    summary: p => {
      const t = H.effectiveTargets(p), i = t.info || {};
      return `<div class="row wrap" style="gap:18px;justify-content:center">${H.ring(t.kcal, t.kcal, `<span data-count="${t.kcal}">0</span>`, 'kcal pro Tag')}
        <div class="col" style="flex:1;min-width:200px">${[['Protein', t.protein_g, 'protein'], ['Kohlenhydrate', t.carbs_g, 'carbs'], ['Fett', t.fat_g, 'fat'], ['Ballaststoffe', t.fiber_g, 'fiber']].map(m => `<div class="macro"><div class="row"><span>${m[0]}</span><b style="margin-left:auto">${m[1]} g</b></div>${H.bar(1, m[2])}</div>`).join('')}</div></div>
        <div class="card" style="margin-top:18px"><h3>So haben wir gerechnet</h3><p>Grundumsatz ${i.bmr} kcal × Aktivität ${nf(i.pal)}${i.adj ? ` ${i.adj > 0 ? '+' : '−'} ${Math.abs(i.adj)} kcal (${esc(i.note)})` : ''} = ${t.kcal} kcal.</p>
        ${i.noDeficit ? `<p class="note">🛡️ Kein Kaloriendefizit: ${esc((i.reasons || []).join(' '))}</p>` : ''}${i.note && p.goal === 'muscle' ? '' : ''}
        <details><summary class="link" style="cursor:pointer">Mikronährstoff-Ziele</summary><div class="grid g2 keep" style="margin-top:10px">${Object.keys(t.micros).map(k => `<div class="small"><b>${H.MICRO_LABEL[k]}</b><br>${nf(t.micros[k])} ${['vit_d', 'vit_b12', 'folate', 'vit_a'].includes(k) ? 'µg' : 'mg'}</div>`).join('')}</div></details>
        <p class="small muted" style="margin-top:10px">Richtwerte nach DGE bzw. gängigen Formeln, keine medizinische Beratung. Bei Erkrankungen, Schwangerschaft oder Essstörungen sprich bitte mit einer Ärztin oder einem Arzt.</p>
        <button class="btn btn-soft btn-sm" type="button" data-a="targets-edit">Ziele anpassen</button></div>`;
    }
  };
  H.BODY = BODY;

  /* ---------- Onboarding ---------- */
  const STEPS = [
    ['name', 'Wie dürfen wir dich nennen?', 'Damit wir dich richtig begrüßen.'], ['goal', 'Was möchtest du erreichen?', 'Daran richten wir deine Vorschläge aus.'],
    ['body', 'Ein paar Körperdaten', 'Damit berechnen wir deinen Bedarf. Die Daten bleiben bei dir.'], ['pace', 'Tempo und Zielgewicht', 'Langsam und stetig klappt am besten.'],
    ['activity', 'Wie aktiv bist du?', 'Ehrlich schätzen, das macht die Ziele genauer.'], ['diet', 'Wie ernährst du dich?', 'Wir filtern alle Rezepte danach.'],
    ['allergy', 'Allergien und Unverträglichkeiten', 'Optional, aber wichtig.'], ['likes', 'Was magst du?', 'Optional. Je mehr wir wissen, desto besser die Treffer.'],
    ['dislikes', 'Was magst du gar nicht?', 'Optional. Diese Zutaten sehen wir nicht mehr.'], ['kitchen', 'Was hast du in deiner Küche?', 'So schlagen wir nur Rezepte vor, die du kochen kannst.'],
    ['routine', 'Dein Alltag', 'Zeit, Kochlevel und Haushalt.'], ['summary', 'Deine persönlichen Richtwerte', 'Du kannst alles später ändern.']
  ];
  const skip4 = p => !['lose', 'gain'].includes(p.goal);
  const nextStep = (n, p) => { n++; if (n === 4 && skip4(p)) n++; return n; };
  const prevStep = (n, p) => { n--; if (n === 4 && skip4(p)) n--; return n; };
  function validate(n, p) {
    const k = STEPS[n - 1][0];
    if (k === 'name') return p.display_name.trim() ? null : 'Bitte gib deinen Namen ein.';
    if (k === 'goal') return p.goal ? null : 'Bitte wähle ein Ziel.';
    if (k === 'body') return p.sex ? null : 'Bitte wähle dein Geschlecht.';
    if (k === 'pace') {
      const t = p.target_weight_kg || p.weight_kg;
      if (p.goal === 'lose' && t >= p.weight_kg) return 'Dein Zielgewicht muss unter deinem aktuellen Gewicht liegen.';
      if (p.goal === 'gain' && t <= p.weight_kg) return 'Dein Zielgewicht muss über deinem aktuellen Gewicht liegen.';
      if (p.goal === 'lose' && H.calcBMI(t, p.height_cm) < 18.5) return 'Bei diesem Zielgewicht wärst du untergewichtig. Bitte wähle einen höheren Wert.';
    }
    return null;
  }
  H.screens.onboarding = (params) => {
    const n = Math.min(12, Math.max(1, +params[0] || 1)), p = S.profile, [key, title, sub] = STEPS[n - 1];
    if (key === 'pace' && skip4(p)) { location.replace('#/onboarding/5'); return ''; }
    const back = S.ui.back; S.ui.back = false;
    const err = validate(n, p);
    return {
      html: `<div class="app"><div class="onb"><div class="row between" style="margin-bottom:8px">${n > 1 ? '<button class="iconbtn" data-a="onb-back" aria-label="Zurück">‹</button>' : '<span></span>'}<span class="small muted">Schritt ${n} von 12</span></div>
      <div class="onb-bar"><i style="width:${(n / 12) * 100}%"></i></div>
      <div class="onb-body ${back ? 'back' : ''}"><h1 style="margin-top:18px">${title}</h1><p>${sub}</p>${BODY[key](p)}</div></div>
      <div class="onb-nav"><div class="in"><button class="btn btn-primary" data-a="onb-next" data-n="${n}" ${err ? 'disabled' : ''}>${n === 12 ? 'Los geht\'s 🎉' : 'Weiter'}</button></div></div></div>`,
      after: root => { H.animate(root); if (key === 'name' && !matchMedia('(pointer:coarse)').matches) { const i = H.$('[data-k=display_name]'); i && i.focus(); } }
    };
  };
  const curStep = () => +(location.hash.split('/')[2] || 1);
  function refreshNext() {
    const b = H.$('[data-a=onb-next]'); if (!b) return;
    b.disabled = !!validate(curStep(), S.profile);
    const est = H.$('#pace-est'); if (est) est.textContent = paceInfo({ ...S.profile, target_weight_kg: S.profile.target_weight_kg || S.profile.weight_kg });
  }
  A['onb-back'] = () => { S.ui.back = true; location.hash = '#/onboarding/' + prevStep(curStep(), S.profile); };
  A['onb-next'] = async () => {
    const n = curStep(), p = S.profile;
    if (validate(n, p)) return;
    if (n === 3 && p.goal === 'lose') {
      const s = H.safety(p);
      if (s.noDeficit) { H.setProf({ goal: 'healthy' }); toast('Ein Abnehmziel passt gerade nicht zu dir. Wir starten mit „Gesünder essen“.'); }
    }
    if (n === 4 && !p.target_weight_kg) H.setProf({ target_weight_kg: p.weight_kg });
    if (n === 12) {
      H.setProf({ onboarding_done: true }); H.clearCaches();
      try { await H.api.saveProfile(S.profile); H.confetti(); H.haptic('success'); location.hash = '#/home'; } catch (e) { fail(e); }
      return;
    }
    await H.api.saveProfile(S.profile);
    location.hash = '#/onboarding/' + nextStep(n, S.profile);
  };

  /* ---------- Eingaben ---------- */
  const inOnb = () => location.hash.startsWith('#/onboarding');
  A.pick = el => {
    const k = el.dataset.k, multi = el.dataset.multi === '1', num = el.dataset.t === 'n', v = num ? +el.dataset.v : el.dataset.v, p = S.profile;
    if (multi) {
      const cur = p[k] || [], on = !cur.includes(v);
      H.setProf({ [k]: on ? [...cur, v] : cur.filter(x => x !== v) });
      el.classList.toggle('on', on); el.setAttribute('aria-pressed', on);
    } else {
      if (k === 'goal' && v === 'lose' && H.safety({ ...p }).noDeficit) { toast('Ein Kaloriendefizit ist für dich gerade nicht sinnvoll.', { err: true }); return; }
      H.setProf({ [k]: v });
      const scope = el.closest('.grid,.seg,.chips') || el.parentElement;
      scope.querySelectorAll(`[data-k="${k}"]`).forEach(b => { b.classList.toggle('on', b === el); b.setAttribute('aria-pressed', b === el); });
      if (k === 'sex') { const pr = H.$('[data-k=pregnant_or_breastfeeding]'); if (pr) pr.closest('label').style.display = v === 'male' ? 'none' : ''; if (v === 'male') H.setProf({ pregnant_or_breastfeeding: false }); }
    }
    H.haptic('light'); if (inOnb()) refreshNext();
  };
  A.hh = el => { const v = Math.max(1, Math.min(8, S.profile.household_size + +el.dataset.d)); H.setProf({ household_size: v }); H.$('#hhv').textContent = v; };
  A.snacks = el => { H.setProf({ meal_pattern: { ...S.profile.meal_pattern, snacks: +el.dataset.v } }); el.parentElement.querySelectorAll('button').forEach(b => b.classList.toggle('on', b === el)); };
  I.text = el => { H.setProf({ [el.dataset.k]: el.value }, false); if (inOnb()) refreshNext(); };
  I.num = el => {
    const k = el.dataset.k, v = +el.value;
    H.setProf({ [k]: v });
    const o = H.$(`[data-out=${k}]`); if (o) o.textContent = nf(v);
    if (inOnb()) refreshNext();
  };
  I.bool = el => H.setProf({ [el.dataset.k]: el.checked });
  I.meal = el => H.setProf({ meal_pattern: { ...S.profile.meal_pattern, [el.dataset.k]: el.checked } });

  /* Zutaten-Autocomplete */
  H.acPick = {};
  I.ac = el => {
    const box = el.parentElement.querySelector('[data-acbox]'), res = H.searchIng(el.value);
    box.classList.toggle('hidden', !res.length && !H.acFree);
    box.innerHTML = res.map(i => `<button type="button" data-a="ac-pick" data-ac="${el.dataset.ac}" data-id="${i.id}">${esc(i.name)}</button>`).join('') +
      (H.acFree && el.value.trim() && !res.some(r => r.name.toLowerCase() === el.value.trim().toLowerCase()) ? `<button type="button" data-a="ac-free" data-ac="${el.dataset.ac}" data-name="${esc(el.value.trim())}">„${esc(el.value.trim())}“ als eigenen Artikel hinzufügen</button>` : '');
  };
  A['ac-pick'] = el => { const fn = H.acPick[el.dataset.ac]; if (fn) fn(el.dataset.id); const i = el.closest('div[style*=relative]'); if (i) { const f = i.querySelector('input'); f.value = ''; el.parentElement.classList.add('hidden'); } };
  const redrawChips = () => {
    const l = H.$('#likechips'); if (l) l.innerHTML = (S.profile.liked_ingredients || []).map(id => `<button type="button" class="chip goodc" data-a="like-rm" data-id="${esc(id)}">${esc(H.ing(id).name)} ✕</button>`).join('');
    const d = H.$('#dischips'); if (d) d.innerHTML = (S.profile.disliked_ingredients || []).map(x => dislikeChip(S.profile, x)).join('');
  };
  H.acPick.like = id => { const p = S.profile; if (!(p.liked_ingredients || []).includes(id)) H.setProf({ liked_ingredients: [...(p.liked_ingredients || []), id], disliked_ingredients: (p.disliked_ingredients || []).filter(d => d.id !== id) }); redrawChips(); };
  A['like-rm'] = el => { H.setProf({ liked_ingredients: S.profile.liked_ingredients.filter(x => x !== el.dataset.id) }); redrawChips(); };
  const addDis = id => { const p = S.profile; if (!(p.disliked_ingredients || []).some(d => d.id === id)) H.setProf({ disliked_ingredients: [...(p.disliked_ingredients || []), { id, level: 'hate' }], liked_ingredients: (p.liked_ingredients || []).filter(x => x !== id) }); redrawChips(); };
  H.acPick.dislike = addDis;
  A['dislike-add'] = el => addDis(el.dataset.id);
  A['dislike-cycle'] = el => {
    const id = el.dataset.id, list = S.profile.disliked_ingredients, d = list.find(x => x.id === id);
    if (!d) return;
    H.setProf({ disliked_ingredients: d.level === 'hate' ? list.map(x => (x.id === id ? { ...x, level: 'meh' } : x)) : list.filter(x => x.id !== id) });
    redrawChips();
  };
  A['targets-edit'] = () => {
    const t = H.effectiveTargets(S.profile);
    H.openSheet(`<div class="sheet-head"><h2>Ziele anpassen</h2></div><div class="form">
      ${[['kcal', 'Kalorien', 'kcal'], ['protein_g', 'Protein', 'g'], ['carbs_g', 'Kohlenhydrate', 'g'], ['fat_g', 'Fett', 'g'], ['fiber_g', 'Ballaststoffe', 'g']].map(x => `<label class="label">${x[1]} (${x[2]})<input class="field" type="number" min="0" data-tk="${x[0]}" value="${t[x[0]]}"></label>`).join('')}
      <div class="row wrap"><button class="btn btn-primary" data-a="targets-save">Speichern</button><button class="btn" data-a="targets-reset">Zurücksetzen</button></div></div>`);
  };
  A['targets-save'] = () => {
    const o = {}; H.$$('[data-tk]').forEach(i => { const v = +i.value; if (v > 0) o[i.dataset.tk] = v; });
    H.setProf({ targets_override: o }); H.closeSheet(); toast('Ziele gespeichert'); H.rerender();
  };
  A['targets-reset'] = () => { H.setProf({ targets_override: null }); H.closeSheet(); toast('Ziele zurückgesetzt'); H.rerender(); };

  /* ---------- Home ---------- */
  const mealNow = () => { const h = new Date().getHours(); return h >= 5 && h < 10 ? 'breakfast' : h < 14 ? 'lunch' : h < 17 ? 'snack' : h < 22 ? 'dinner' : 'snack'; };
  const MEAL = { breakfast: ['Frühstück', '🌅'], lunch: ['Mittagessen', '☀️'], dinner: ['Abendessen', '🌙'], snack: ['Snack', '🍎'], dessert: ['Dessert', '🍰'], drink: ['Drinks', '🥤'] };
  H.MEAL = MEAL;
  const micUnit = k => (['vit_d', 'vit_b12', 'folate', 'vit_a'].includes(k) ? 'µg' : 'mg');
  H.microRows = (vals, t) => Object.keys(t.micros).map(k => { const pct = vals[k] / t.micros[k]; return `<div class="macro" style="margin:8px 0"><div class="row"><span>${H.MICRO_LABEL[k]}</span><b style="margin-left:auto">${r0(pct * 100)} %</b></div>${H.bar(pct, pct < 0.7 ? 'low' : pct > 1.3 ? 'warn' : '')}</div>`; }).join('');
  H.screens.home = () => {
    const p = S.profile, t = H.targets(), log = H.todayLog(), cons = H.sumLog(log), h = new Date().getHours();
    const greet = h < 11 ? 'Guten Morgen' : h < 17 ? 'Hallo' : 'Guten Abend';
    const meal = mealNow(), sugs = H.suggest(H.ctx({ meal_type: meal, limit: 6 }));
    const today = H.todayISO(), exp = S.pantry.filter(x => x.kind !== 'leftover' && ['expired', 'today', 'soon'].includes(H.expiryStatus(x, today)));
    const left = S.pantry.filter(x => x.kind === 'leftover');
    const planToday = (S.planByWeek[H.mondayISO()] || []).filter(e => e.date === today);
    const micro = H.weeklyMicroStatus(S.foodLog.filter(e => H.daysBetween(e.date, today) < 7), t);
    let tip = '';
    if (micro) {
      const k = Object.keys(micro).filter(x => x !== 'vit_d').sort((a, b) => micro[a] - micro[b])[0];
      if (micro[k] < 70) {
        const best = H.suggest(H.ctx({ limit: 60 })).sort((a, b) => H.nutrientsOf(b.ings, b.recipe.servings).per[k] / t.micros[k] - H.nutrientsOf(a.ings, a.recipe.servings).per[k] / t.micros[k])[0];
        tip = `<a class="card card-i" href="#/recipe/${best ? best.recipe.id : ''}"><h3>🌈 Diese Woche wenig ${H.MICRO_LABEL[k]}</h3><p>Im Schnitt ${micro[k]} % deines Ziels.${best ? ` Probier mal ${esc(best.recipe.title)}.` : ''}</p></a>`;
      }
    }
    const open = S.shopping.filter(x => !x.checked).length;
    return {
      html: H.shell(`<section class="hero" data-stagger><p class="muted" style="margin:0">${esc(H.fmtLong(today))}</p><h1>${greet}, ${esc(p.display_name)} 👋</h1>
        <div class="row wrap" style="gap:22px;align-items:center">${H.ring(cons.kcal, t.kcal, `<span data-count="${r0(cons.kcal)}">0</span>`, cons.kcal > t.kcal ? 'über dem Ziel' : `noch ${r0(Math.max(0, t.kcal - cons.kcal))} kcal`)}
        <div class="col" style="flex:1;min-width:190px">${[['Protein', 'protein', cons.protein, t.protein_g], ['Kohlenhydrate', 'carbs', cons.carbs, t.carbs_g], ['Fett', 'fat', cons.fat, t.fat_g]].map(m => `<div class="macro"><div class="row"><span>${m[0]}</span><b style="margin-left:auto">${r0(m[2])} / ${m[3]} g</b></div>${H.bar(m[2] / m[3], m[1])}</div>`).join('')}</div></div>
        <details style="margin-top:14px"><summary class="link" style="cursor:pointer">Mikronährstoffe heute</summary>${H.microRows(cons, t)}</details>
        <div class="row wrap" style="margin-top:14px"><button class="btn btn-primary btn-sm" data-a="log-quick">+ Mahlzeit eintragen</button><a class="btn btn-sm" href="#/discover">Was koche ich?</a></div></section>
      <section class="section"><div class="section-head"><h2>${MEAL[meal][1]} Jetzt passend: ${MEAL[meal][0]}</h2><a class="link" href="#/discover?meal=${meal}">Mehr</a></div>
        ${sugs.length ? `<div class="carousel">${sugs.map(H.recipeCard).join('')}</div>` : H.empty('🤔', 'Noch nichts gefunden', 'Ergänze deine Küche oder lockere deine Filter.', '<a class="btn btn-soft" href="#/profile/kitchen">Küche anpassen</a>')}</section>
      ${left.length || exp.length ? `<section class="section card" data-stagger><h2>Reste & bald ablaufend</h2>
        ${left.map(x => `<div class="row between" style="padding:8px 0"><span>🍱 <b>${esc(x.name)}</b> <span class="muted small">${nf(x.servings || 1)} Portion${x.expires_on ? ' · bis ' + H.fmtDate(x.expires_on) : ''}</span></span><button class="btn btn-sm btn-soft" data-a="eat-left" data-id="${x.id}">Gegessen</button></div>`).join('')}
        ${exp.length ? `<div class="chips" style="margin:10px 0">${exp.map(x => `<span class="chip ${H.expiryStatus(x, today) === 'soon' ? 'warnc' : 'badc'}">${esc(x.name)} · ${H.fmtDate(x.expires_on)}</span>`).join('')}</div><a class="btn btn-soft btn-sm" href="#/discover?use_up=${exp.filter(x => x.ingredient_id).map(x => x.ingredient_id).join(',')}">Rezepte dafür finden</a>` : ''}</section>` : ''}
      <section class="section"><div class="section-head"><h2>Heute im Plan</h2><a class="link" href="#/plan">Wochenplan</a></div>
        ${planToday.length ? `<div class="grid g3">${planToday.map(e => { const r = H.recipeById(e.recipe_id); return r ? `<a class="card card-i" href="#/recipe/${r.id}?servings=${e.servings}" data-stagger><span class="small muted">${MEAL[e.meal_type][0]}${e.is_leftover ? ' · Rest 🍱' : ''}</span><h3 style="margin:4px 0">${r.emoji} ${esc(r.title)}</h3><span class="small muted">⏱ ${r.prep_min + r.cook_min} Min</span></a>` : ''; }).join('')}</div>` : `<div class="card"><p>Für heute ist nichts geplant.</p><a class="btn btn-soft" href="#/plan">Woche planen lassen ✨</a></div>`}</section>
      <section class="section grid g2">${tip}<a class="card card-i" href="#/shopping"><h3>🛒 Einkaufsliste</h3><p>${open ? `${open} Artikel offen` : 'Alles besorgt'}</p></a></section>`, 'home', { fab: true }),
      after: root => H.animate(root)
    };
  };

  /* Mahlzeit eintragen */
  A['log-quick'] = () => {
    const left = S.pantry.filter(x => x.kind === 'leftover');
    H.openSheet(`<div class="sheet-head"><h2>Mahlzeit eintragen</h2><button class="iconbtn" data-a="close-sheet" aria-label="Schließen">✕</button></div>
      <div class="form"><label class="label">Was hast du gegessen?<input class="field" id="lq-name" placeholder="z. B. Brötchen mit Käse"></label>
      <div class="grid g2 keep"><label class="label">Kalorien<input class="field" id="lq-kcal" type="number" min="0" inputmode="numeric"></label><label class="label">Protein (g)<input class="field" id="lq-p" type="number" min="0" inputmode="numeric"></label>
      <label class="label">Kohlenhydrate (g)<input class="field" id="lq-c" type="number" min="0" inputmode="numeric"></label><label class="label">Fett (g)<input class="field" id="lq-f" type="number" min="0" inputmode="numeric"></label></div>
      <label class="label">Mahlzeit<select class="field" id="lq-meal">${['breakfast', 'lunch', 'dinner', 'snack'].map(m => `<option value="${m}" ${m === mealNow() ? 'selected' : ''}>${MEAL[m][0]}</option>`).join('')}</select></label>
      <button class="btn btn-primary btn-block" data-a="lq-save">Eintragen</button>
      ${left.length ? `<h3>Oder ein Rest</h3>${left.map(x => `<button class="btn btn-soft btn-block" style="justify-content:flex-start;margin-bottom:6px" data-a="eat-left" data-id="${x.id}">🍱 ${esc(x.name)}</button>`).join('')}` : ''}</div>`);
  };
  A['lq-save'] = async () => {
    const name = H.$('#lq-name').value.trim(), kcal = +H.$('#lq-kcal').value;
    if (!name || !(kcal > 0)) { toast('Bitte Name und Kalorien angeben.', { err: true }); return; }
    const n = H.zero(); n.kcal = kcal; n.protein = +H.$('#lq-p').value || 0; n.carbs = +H.$('#lq-c').value || 0; n.fat = +H.$('#lq-f').value || 0;
    try { await H.api.logFood({ date: H.todayISO(), meal_type: H.$('#lq-meal').value, recipe_id: null, title: name, servings: 1, source: 'quick', nutrition: n }); await H.reloadLog(); H.closeSheet(); toast('Eingetragen ✓'); H.rerender(); } catch (e) { fail(e); }
  };
  A['eat-left'] = async el => {
    const x = S.pantry.find(q => q.id === el.dataset.id), r = x && H.recipeById(x.recipe_id);
    if (!x) return;
    try {
      if (r) {
        const per = H.recipeView(r, S.profile, r.servings, S.pantry).nutrition.per;
        await H.api.logFood({ date: H.todayISO(), meal_type: r.meal_types.includes('dinner') ? 'dinner' : 'lunch', recipe_id: r.id, title: r.title, servings: 1, source: 'leftover', nutrition: H.scaleN(per, 1) });
      }
      const rest = (x.servings || 1) - 1;
      if (rest > 0.01) await H.api.upsertPantryItem({ ...x, servings: rest }); else await H.api.deletePantryItem(x.id);
      S.pantry = await H.api.listPantry(); await H.reloadLog(); H.closeSheet(); toast('Rest eingetragen ✓'); H.rerender();
    } catch (e) { fail(e); }
  };
})();
