# HEALTHLY – Vollständige Bauanleitung für das Frontend

> Dieses Dokument ist die einzige Quelle der Wahrheit. Lies es komplett, bevor du Code schreibst.
> Der konkrete Arbeitsauftrag steht ganz am Ende (Abschnitt 22).

---

## 0. Deine Rolle und Arbeitsweise

Du bist ein Senior-Frontend-Entwickler mit Produkt- und Designgespür. Du baust das **komplette Frontend** der Web-App „Healthly“ in Vanilla-JavaScript (ES-Module), HTML und CSS.
Backend, echte Accounts, Datenbank und Hosting baut später ein anderer Entwickler mit **Supabase** und **Netlify**. Deine Aufgabe ist, dass er dafür **nur eine einzige Datei** austauschen muss (`js/api.js`).

So arbeitest du:

1. **Vollständigkeit vor Kürze.** Jede Datei, die du ausgibst, ist vollständig und lauffähig. Es gibt **niemals** Auslassungen wie `// ...`, `// rest bleibt gleich`, `// weitere Rezepte hier`, `/* TODO: implement */` (außer bei den erlaubten Backend-Markern, siehe 2.3) oder „der Rest folgt analog“.
2. **Genau nach Spezifikation.** Datei-, Funktions-, Feld- und Routennamen aus diesem Dokument sind ein Vertrag. Du benennst nichts um, erfindest keine zusätzlichen Pflichtfelder und lässt keine weg.
3. **Keine Erfindungen außerhalb deines Auftrags.** Keine API-Keys, keine Backend-URLs, keine Bild-URLs, keine npm-Pakete.
4. **Du lieferst in Phasen** (Abschnitt 21). Pro Antwort nur die Dateien der aktuellen Phase. Wenn eine Datei nicht mehr in die Antwort passt, hörst du **am Ende einer vollständigen Datei** auf und schreibst `⏸ FORTSETZUNG FOLGT – schreibe "weiter"`. Du brichst **nie** mitten in einer Datei ab.
5. **Kein Geschwafel.** Pro Phase höchstens 5 Sätze Erklärung. Der Code spricht für sich. Kommentare im Code sind kurz und nur da, wo die Logik nicht offensichtlich ist.
6. **Konsistenz über Phasen hinweg.** Vor jeder neuen Phase prüfst du still, dass du Namen und Imports aus den früheren Phasen exakt so weiterverwendest.
7. **Sprache:** Code-Bezeichner auf Englisch, alle sichtbaren Texte auf Deutsch (du-Form, freundlich, knapp).

---

## 1. Produktüberblick

Healthly ist ein persönlicher Koch- und Ernährungsassistent:

- Er **schlägt Rezepte vor** für Frühstück, Mittag, Abendessen, Snacks, Desserts und Drinks, basierend auf
  - dem, was man **zu Hause hat** (Vorrat),
  - dem **persönlichen Ziel** (abnehmen, zunehmen, Muskeln aufbauen, halten, gesünder essen, mehr Energie),
  - **Kalorien-, Makro- und Mikronährstoffzielen**,
  - **Allergien, Unverträglichkeiten und Ernährungsform**,
  - **Vorlieben und Abneigungen** (Zutaten, Küchen, Schärfe),
  - **Zeit** (Kochdauer) und **Küchengeräten**,
  - dem, was **bald abläuft** oder **übrig ist** (Resteverwertung).
- Man kann **Portionen skalieren**, im **Kochmodus** Schritt für Schritt mit Timern kochen, einen **Wochenplan** automatisch erstellen lassen, und fehlende Zutaten landen auf der **Einkaufsliste**.
- Alles hängt an einem **Account**. Beim ersten Login wird man in einem schönen **Onboarding-Fragebogen** nach Ziel, Körperdaten, Vorlieben usw. gefragt.

Zielgruppe: Menschen ab 16, Smartphone-first, aber auch am Desktop schön.

---

## 2. Harte Regeln (nicht verhandelbar)

### 2.1 Technik
- Nur **HTML, CSS, Vanilla-JavaScript mit ES-Modulen** (`<script type="module">`). Kein React, Vue, Svelte, jQuery, Tailwind, Bootstrap, TypeScript und kein Build-Schritt.
- Einzige erlaubte externe Ressource: **Google Fonts** (Plus Jakarta Sans). Keine weiteren CDNs.
- **Keine Bilder aus dem Internet.** Rezepte bekommen ein Emoji plus einen zweifarbigen Verlauf als „Bild“. Icons sind Inline-SVG (eigene, einfache Linien-Icons, 24×24, `stroke="currentColor"`, `stroke-width="2"`, runde Enden).
- Muss auf einem **statischen Host** laufen (Netlify). Deshalb **Hash-Routing** (`#/home`).
- Moderne Browser (aktuelle Versionen von Safari iOS, Chrome, Firefox, Edge). Optionale APIs (View Transitions, Wake Lock, Vibration, Web Share, Speech Synthesis) werden immer per Feature-Check benutzt und haben einen Fallback.

### 2.2 Daten und Sicherheit
- **Jeder** Zugriff auf gespeicherte Nutzerdaten und Accounts läuft über `js/api.js`. Kein anderes Modul greift auf `localStorage` zu. Einzige Ausnahme: `js/core/theme.js` speichert dort die Darstellungs-Einstellungen (Theme, Animationen reduzieren) unter `healthly:ui`.
- Nutzereingaben werden **immer escaped**, bevor sie ins DOM kommen (siehe `html`-Helfer in 4.3). Kein `innerHTML` mit unescapten Nutzerdaten.
- Kein `eval`, kein `new Function`, keine Inline-Event-Handler (`onclick="..."`) im HTML. Events werden per `addEventListener` bzw. Event-Delegation gebunden.

### 2.3 Platzhalter-Marker
Nur an folgenden Stellen sind Platzhalter erlaubt, und sie müssen genau so markiert werden:
- `// TODO SUPABASE: <was hier später passiert>` → in `js/api.js`
- `// TODO NETLIFY: <was hier später passiert>` → nur in `js/api.js` bei `getAiSuggestions`
- Die Mock-Implementierung darunter muss trotzdem **voll funktionieren** (mit `localStorage`), damit die App komplett testbar ist.

Lege **keine** `netlify.toml`, `.env`, `package.json`, Serverfunktionen, SQL-Dateien oder Supabase-Clients an.

### 2.4 Gesundheit und Verantwortung
- Keine medizinischen Versprechen. Im Onboarding-Zusammenfassungsscreen und in den Einstellungen steht dezent: „Richtwerte nach DGE bzw. gängigen Formeln, keine medizinische Beratung.“
- Sicherheitsgrenzen aus Abschnitt 9.6 sind Pflicht (z. B. kein Kaloriendefizit für Minderjährige, Schwangere und bei Untergewicht).

---

## 3. Architektur und Dateistruktur

Genau diese Dateien, keine weiteren:

```
/index.html
/manifest.json
/icons/icon.svg                      → einfaches rundes Logo (grünes Blatt + Löffel), als SVG

/css/tokens.css                      → Design-Tokens (Farben, Radien, Schatten, Abstände, Typo, Easing) Light + Dark
/css/base.css                        → Reset, Grundtypo, Layout-Shell, Hintergrund-Blobs, Utilities
/css/components.css                  → alle wiederverwendbaren Komponenten
/css/screens.css                     → screen-spezifische Styles
/css/animations.css                  → Keyframes, Stagger, Transitions, reduced motion

/js/app.js                           → Einstieg: Theme, Auth-Check, Router starten, Shell rendern
/js/core/router.js                   → Hash-Router mit Guards
/js/core/store.js                    → globaler State (subscribe/set)
/js/core/dom.js                      → html``-Helfer, esc(), qs/qsa, delegate(), mount()
/js/core/ui.js                       → toast, sheet/modal, confirm, confetti, flyTo, ripple, skeleton, haptic
/js/core/icons.js                    → Inline-SVG-Icons als Funktionen: icon('home')
/js/core/format.js                   → Zahlen, Datum, Mengen, Zeit, relative Tage auf Deutsch
/js/core/theme.js                    → Light/Dark/System
/js/i18n/de.js                       → STRINGS-Objekt mit allen UI-Texten

/js/data/ingredients.js              → Zutatendatenbank (Nährwerte pro 100 g)
/js/data/recipes-1.js                → Rezepte Teil 1 (Frühstück, Snacks, Desserts, Drinks)
/js/data/recipes-2.js                → Rezepte Teil 2 (Mittag, Abendessen)
/js/data/recipes.js                  → führt beide zusammen, exportiert RECIPES und getRecipe(id)
/js/data/reference.js                → Referenzwerte, Allergene, Diäten, Geräte, Küchen, Kategorien

/js/logic/units.js                   → Mengen → Gramm, Anzeige-Einheiten, Rundung
/js/logic/nutrition.js               → Rezept-Nährwerte, Ziele (kcal/Makro/Mikro), Tagesbilanz
/js/logic/diet.js                    → Diät-/Allergie-Kompatibilität, Austausch-Zutaten
/js/logic/engine.js                  → Vorschlags-Algorithmus
/js/logic/planner.js                 → Wochenplan-Generator
/js/logic/shopping.js                → Einkaufsliste aggregieren, Vorrat abziehen
/js/logic/leftovers.js               → Resteverwertung, Ablauf-Logik
/js/logic/taste.js                   → lernt Vorlieben aus Bewertungen

/js/api.js                           → EINZIGE Daten-/Auth-Schicht (Mock mit localStorage)

/js/screens/welcome.js
/js/screens/auth.js                  → Login + Registrierung
/js/screens/onboarding.js
/js/screens/home.js
/js/screens/discover.js
/js/screens/recipe.js
/js/screens/cook.js
/js/screens/pantry.js
/js/screens/shopping.js
/js/screens/plan.js
/js/screens/progress.js
/js/screens/profile.js

/js/dev/selftest.js                  → Datenvalidierung + Logiktests (läuft nur mit ?dev=1)
```

Abhängigkeitsrichtung (niemals umgekehrt):
`screens → logic → data`, `screens → core`, `screens → api`, `logic` importiert **nie** `api` oder `screens`. Logik-Module sind **pure functions** ohne DOM und ohne Speicherzugriff, damit sie testbar sind.

---

## 4. Code-Konventionen

### 4.1 Allgemein
- `const` bevorzugt, kein `var`. Kleine Funktionen (≤ 40 Zeilen, wo sinnvoll). Named Exports, keine Default-Exports.
- JSDoc-`@typedef` für alle Datenmodelle aus Abschnitt 6 in `js/api.js`.
- Keine globalen Variablen. Einzige Ausnahme: `window.healthly = { store, api }` nur wenn `?dev=1`.
- Alle Datumswerte als ISO-String `YYYY-MM-DD` (lokales Datum, **nicht** UTC, Helfer `todayISO()` in `format.js`).
- Alle Mengen intern in **Gramm** (Flüssigkeiten: ml ≈ g, Ausnahme Öl: 1 ml = 0,92 g).

### 4.2 Screen-Vertrag
Jede Datei in `js/screens/` exportiert genau:

```js
export async function render(root, params) {
  // root = <main id="view">, params = Routenparameter
  // 1. Skeleton rendern, 2. Daten laden (über api / store), 3. echtes UI rendern, 4. Events binden
  return () => { /* cleanup: Timer, Listener, Subscriptions entfernen */ };
}
```

### 4.3 DOM-Helfer (`js/core/dom.js`)
```js
export function esc(value)                     // escaped & < > " ' ; null/undefined → ''
export function html(strings, ...values)       // Tagged Template: escaped automatisch alle Werte,
                                               // außer Werte, die mit raw() markiert sind oder Arrays von html-Ergebnissen
export function raw(str)                       // markiert bereits sicheres HTML (z. B. Icons)
export function qs(sel, el = document) / qsa(sel, el = document)
export function delegate(root, event, selector, handler)   // Event-Delegation, gibt Unsubscribe zurück
export function mount(root, htmlResult)        // setzt Inhalt, triggert Stagger-Animationen
```

### 4.4 Store (`js/core/store.js`)
```js
export const store = { get(), set(patch), subscribe(fn) /* → unsubscribe */ };
// State-Form:
{ user, profile, pantry, shopping, favorites, ratings, blocked, foodLogToday, planWeek, ui: { theme } }
```
Nach dem Login lädt `app.js` alles einmal über `api` in den Store. Screens schreiben über `api` und aktualisieren danach den Store (optimistisches Update: erst Store, dann `api`, bei Fehler zurückrollen und Toast zeigen).

### 4.5 Router (`js/core/router.js`)
Routen (exakt):

| Route | Screen | Guard |
|---|---|---|
| `#/welcome` | welcome | nur ausgeloggt |
| `#/login`, `#/register` | auth | nur ausgeloggt |
| `#/onboarding/:step` (1–12) | onboarding | eingeloggt, Onboarding offen |
| `#/home` | home | eingeloggt + Onboarding fertig |
| `#/discover` | discover | ″ |
| `#/recipe/:id` | recipe | ″ |
| `#/cook/:id` | cook (ohne Tab-Bar) | ″ |
| `#/pantry` | pantry | ″ |
| `#/shopping` | shopping | ″ |
| `#/plan` | plan | ″ |
| `#/progress` | progress | ″ |
| `#/profile` und `#/profile/:section` | profile | ″ |

- Unbekannte Route → `#/home` (bzw. `#/welcome`).
- Query-Parameter in der Route werden unterstützt: `#/discover?meal=breakfast&leftovers=1`, `#/recipe/abc?servings=3`.
- Screenwechsel über `document.startViewTransition`, wenn vorhanden, sonst CSS-Fade/Slide.
- Scrollposition: neuer Screen startet oben, Zurück-Navigation stellt die Position wieder her.

### 4.6 Fehlerbehandlung
- Jeder `api`-Aufruf in Screens ist in `try/catch`. Fehler → Toast (rot, mit Text aus `STRINGS.errors`).
- Leere Zustände haben immer ein eigenes, freundliches Empty-State-UI (großes Emoji, Satz, Aktionsbutton).

---

## 5. `js/api.js` – der Vertrag

Alle Funktionen sind `async`. Die Mock-Implementierung
- speichert pro Nutzer unter `healthly:<userId>:<collection>` in `localStorage`,
- simuliert 120–250 ms Latenz (damit Skeletons sichtbar sind),
- setzt bei jedem Datensatz `id` (via `crypto.randomUUID()`), `user_id`, `created_at`, `updated_at` (ISO-Zeitstempel),
- speichert Passwörter im Mock **nur als SHA-256-Hash** (`crypto.subtle`), mit Kommentar, dass dies nur ein Mock ist.

Über **jeder** Funktion steht ein Kommentar `// TODO SUPABASE: ...`, der beschreibt, welche Tabelle bzw. welcher Auth-Aufruf es später wird.

```js
// ---------- Auth ----------
signUp(email, password)                 → { user }            // user = { id, email }
signIn(email, password)                 → { user }            // falsches Passwort → Error('invalid_credentials')
signOut()                               → void
getCurrentUser()                        → user | null
onAuthChange(callback)                  → unsubscribe()      // callback(user|null)
requestPasswordReset(email)             → void                // Mock: tut nichts, gibt ok zurück
deleteAccount()                         → void                // Mock: löscht alle Daten des Nutzers

// ---------- Profil ----------
getProfile()                            → Profile | null
saveProfile(profile)                    → Profile

// ---------- Vorrat (inkl. Reste) ----------
listPantry()                            → PantryItem[]
upsertPantryItem(item)                  → PantryItem
upsertPantryItems(items)                → PantryItem[]
deletePantryItem(id)                    → void

// ---------- Einkaufsliste ----------
listShopping()                          → ShoppingItem[]
upsertShoppingItem(item)                → ShoppingItem
upsertShoppingItems(items)              → ShoppingItem[]
deleteShoppingItem(id)                  → void
clearCheckedShopping()                  → void

// ---------- Favoriten / Bewertungen / Gesperrt ----------
listFavorites()                         → string[]            // recipe_ids
toggleFavorite(recipeId)                → boolean             // neuer Zustand
listRatings()                           → { [recipeId]: 1..5 }
rateRecipe(recipeId, stars)             → void
listBlocked()                           → string[]
toggleBlocked(recipeId)                 → boolean

// ---------- Ernährungstagebuch ----------
logFood(entry)                          → FoodLogEntry
deleteFoodLog(id)                       → void
listFoodLog(fromISO, toISO)             → FoodLogEntry[]

// ---------- Gewicht ----------
logWeight(dateISO, kg)                  → WeightEntry         // ein Eintrag pro Tag, überschreibt
listWeight(fromISO, toISO)              → WeightEntry[]

// ---------- Wochenplan ----------
listMealPlan(weekStartISO)              → MealPlanEntry[]     // weekStart = Montag
upsertMealPlanEntry(entry)              → MealPlanEntry
deleteMealPlanEntry(id)                 → void
replaceMealPlanWeek(weekStartISO, entries) → MealPlanEntry[]  // ersetzt alle NICHT gesperrten Einträge der Woche

// ---------- KI ----------
getAiSuggestions(context)               → null
// TODO NETLIFY: später POST /.netlify/functions/suggest mit context; bis dahin IMMER null zurückgeben.
```

Exportiere zusätzlich `export const api = { ...alle Funktionen }`.

---

## 6. Datenmodelle (exakte Feldnamen, snake_case)

```js
/** @typedef {Object} Profile */
{
  display_name: string,
  goal: 'lose' | 'gain' | 'muscle' | 'maintain' | 'healthy' | 'energy',
  pace_kg_week: 0.25 | 0.5 | 0.75 | null,         // nur bei lose/gain
  sex: 'male' | 'female' | 'diverse',
  birth_year: number,
  height_cm: number,
  weight_kg: number,
  target_weight_kg: number | null,
  activity_level: 'sedentary' | 'light' | 'moderate' | 'high' | 'athlete',
  pregnant_or_breastfeeding: boolean,

  diet_base: 'omnivore' | 'flexitarian' | 'pescetarian' | 'vegetarian' | 'vegan',
  diet_modifiers: Array<'keto' | 'low_carb' | 'high_protein' | 'halal'>,
  allergies: string[],                            // Codes aus reference.js ALLERGENS
  intolerances: Array<'lactose' | 'fructose' | 'histamine'>,

  liked_cuisines: string[],                       // Codes aus CUISINES
  liked_ingredients: string[],                    // ingredient ids
  disliked_ingredients: Array<{ id: string, level: 'hate' | 'meh' }>,
  spice_level: 0 | 1 | 2 | 3,                     // 0 = gar nicht scharf

  utensils: string[],                             // Codes aus UTENSILS
  staples: string[],                              // ingredient ids, die immer da sind (Salz, Pfeffer, Öl …)
  time_weekday_min: 10 | 15 | 20 | 30 | 45 | 60 | 90,
  time_weekend_min: 10 | 15 | 20 | 30 | 45 | 60 | 90,
  skill_level: 'beginner' | 'intermediate' | 'pro',
  household_size: 1..8,
  budget: 'low' | 'medium' | 'high',
  meal_pattern: { breakfast: boolean, lunch: boolean, dinner: boolean, snacks: 0 | 1 | 2 },

  targets: Targets,                               // berechnet, siehe 9
  targets_override: Partial<Targets> | null,      // manuelle Anpassung durch Nutzer
  taste_affinity: { cuisine: { [code]: number }, ingredient: { [id]: number } },  // -1..1
  onboarding_done: boolean
}

/** @typedef {Object} Targets */
{ kcal, protein_g, carbs_g, fat_g, fiber_g, sugar_max_g, sat_fat_max_g, salt_max_g,
  micros: { vit_c, vit_d, vit_b12, folate, vit_a, vit_e, iron, calcium, magnesium, zinc, potassium } }

/** @typedef {Object} PantryItem */
{ id, ingredient_id: string | null, name: string, category: string,
  quantity: number | null, unit: string | null,   // null = „ist da, Menge egal“
  expires_on: string | null,
  kind: 'item' | 'leftover',
  recipe_id: string | null, servings: number | null }   // nur bei kind = 'leftover'

/** @typedef {Object} ShoppingItem */
{ id, ingredient_id: string | null, name, quantity: number | null, unit: string | null,
  category, checked: boolean, source: 'manual' | 'recipe' | 'plan', recipe_ids: string[] }

/** @typedef {Object} FoodLogEntry */
{ id, date, meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack',
  recipe_id: string | null, title: string, servings: number,
  source: 'recipe' | 'leftover' | 'quick',
  nutrition: Nutrients }                           // Snapshot der GESAMTEN gegessenen Menge

/** @typedef {Object} WeightEntry */      { id, date, kg }
/** @typedef {Object} MealPlanEntry */    { id, date, meal_type, recipe_id, servings, is_leftover: boolean, locked: boolean }

/** @typedef {Object} Nutrients */
{ kcal, protein, carbs, fat, fiber, sugar, sat_fat, salt,
  vit_c, vit_d, vit_b12, folate, vit_a, vit_e, iron, calcium, magnesium, zinc, potassium }
```

Einheiten der Nährstoffe: kcal; protein/carbs/fat/fiber/sugar/sat_fat/salt in **g**; vit_c, vit_e, iron, calcium, magnesium, zinc, potassium in **mg**; vit_d, vit_b12, folate, vit_a in **µg**.

---

## 7. Zutatendatenbank (`js/data/ingredients.js`)

### 7.1 Prinzip
Rezepte speichern **keine** eigenen Nährwerte. Sie verweisen auf Zutaten mit Gramm-Mengen, und die Nährwerte werden berechnet. Dadurch stimmen Portionsregler, Allergene, Diät-Tags und Einkaufsliste automatisch.

### 7.2 Format (ein Objekt pro Zeile, kompakt)
```js
export const INGREDIENTS = [
  { id: 'oats', name: 'Haferflocken', plural: 'Haferflocken', cat: 'staples',
    animal: 'none', allergens: ['gluten'], flags: [],
    units: { EL: 10, Tasse: 90 }, pack_g: 500, shelf_days: 180,
    aliases: ['hafer', 'porridge'],
    n: { kcal: 370, protein: 13.5, carbs: 58.7, fat: 7.0, fiber: 10.0, sugar: 1.2, sat_fat: 1.3, salt: 0.01,
         vit_c: 0, vit_d: 0, vit_b12: 0, folate: 33, vit_a: 0, vit_e: 0.8,
         iron: 4.4, calcium: 50, magnesium: 130, zinc: 3.6, potassium: 360 } },
  { id: 'egg', name: 'Ei', plural: 'Eier', cat: 'dairy_eggs',
    animal: 'egg', allergens: ['eggs'], flags: ['histamine'],
    units: { Stück: 60 }, pack_g: 600, shelf_days: 21, aliases: ['eier', 'hühnerei'],
    n: { kcal: 137, protein: 12.6, carbs: 0.7, fat: 9.5, fiber: 0, sugar: 0.4, sat_fat: 3.1, salt: 0.35,
         vit_c: 0, vit_d: 2.0, vit_b12: 0.9, folate: 47, vit_a: 160, vit_e: 1.1,
         iron: 1.8, calcium: 56, magnesium: 12, zinc: 1.3, potassium: 138 } },
  // ...
];
export const INGREDIENT_MAP = new Map(INGREDIENTS.map(i => [i.id, i]));
export function getIngredient(id) { ... }
export function searchIngredients(query, limit = 8) { ... }  // Name, Plural, Aliases; unscharf (Umlaute normalisieren, Anfang > Teilstring)
```

Feldbedeutung:
- `n` = Nährwerte **pro 100 g essbarem Anteil**, roh/unzubereitet, orientiert an **BLS (Bundeslebensmittelschlüssel) bzw. USDA FoodData Central**, sinnvoll gerundet. Fehlende Mikrowerte = realistische Schätzung, nie „leer lassen“.
- `animal`: `'none' | 'honey' | 'dairy' | 'egg' | 'fish' | 'seafood' | 'poultry' | 'meat' | 'pork' | 'gelatin'`
- `allergens`: EU-14-Codes aus 8.1.
- `flags`: `'lactose'` (enthält Laktose), `'fructose'` (fruktosereich), `'histamine'` (histaminreich), `'alcohol'`, `'staple'` (typischer Grundvorrat, z. B. Salz, Pfeffer, Öl, Wasser, Essig, Zucker, Mehl, Brühe), `'spicy'`.
- `units`: Umrechnung von Anzeige-Einheiten in Gramm (`Stück`, `EL`, `TL`, `Prise`, `Bund`, `Scheibe`, `Dose`, `Zehe`, `Handvoll`, `Tasse`, `Becher`, `Packung`). `g` und `ml` sind immer implizit erlaubt.
- `pack_g`: typische Packungsgröße im Supermarkt (für Einkaufsliste), `shelf_days`: typische Haltbarkeit nach Kauf (für Vorschlag des Ablaufdatums).
- `cat`: Supermarkt-Kategorie aus 8.6.

### 7.3 Umfang
- **Mindestens 180 Zutaten**, und **jede** in Rezepten benutzte Zutat muss existieren.
- Muss abdecken: Getreide, Brot & Backwaren, Nudeln, Reis, Kartoffeln, Hülsenfrüchte (auch aus der Dose), Tofu/Tempeh/Seitan, Milchprodukte + pflanzliche Alternativen (Hafer-, Soja-, Mandeldrink, Sojajoghurt, veganer Käse), Käse (mind. 8 Sorten), Eier, Fleisch (Huhn, Pute, Rind, Hack, Schwein, Schinken), Fisch (Lachs, Thunfisch Dose, Kabeljau, Garnelen), Gemüse (mind. 35), Obst (mind. 20), TK-Beeren, TK-Gemüse, Nüsse & Samen (mind. 10), Öle & Fette, Gewürze & Kräuter (mind. 20), Saucen & Würzmittel (Sojasauce, Senf, Tomatenmark, passierte Tomaten, Kokosmilch, Pesto, Currypaste, Ketchup …), Süßes & Backzutaten, Proteinpulver (Whey + vegan), Getränke-Basics.
- **Plausibilitätsregel für jede Zutat:** `|kcal − (4·protein + 4·(carbs) + 9·fat + 2·fiber)| ≤ max(15 % von kcal, 20)`. Bei Öl: Fett ≈ 100 g. Diese Regel wird im Selbsttest geprüft (Abschnitt 20), also halte sie ein.

---

## 8. Referenzdaten (`js/data/reference.js`)

### 8.1 Allergene (EU-14)
`gluten` Gluten · `crustaceans` Krebstiere · `eggs` Eier · `fish` Fisch · `peanuts` Erdnüsse · `soy` Soja · `milk` Milch · `nuts` Schalenfrüchte · `celery` Sellerie · `mustard` Senf · `sesame` Sesam · `sulphites` Sulfite · `lupin` Lupinen · `molluscs` Weichtiere
Jedes mit `{ code, label, emoji }`.

### 8.2 Unverträglichkeiten
`lactose` Laktose · `fructose` Fruktose · `histamine` Histamin

### 8.3 Ernährungsformen
Basis (genau eine): `omnivore` Alles · `flexitarian` Flexitarisch · `pescetarian` Pescetarisch · `vegetarian` Vegetarisch · `vegan` Vegan
Zusätze (beliebig viele): `keto` Keto · `low_carb` Low Carb · `high_protein` High Protein · `halal` Halal

### 8.4 Küchengeräte (`UTENSILS`)
`stove` Herd 🔥 · `oven` Backofen ♨️ · `microwave` Mikrowelle 📡 · `airfryer` Heißluftfritteuse 🌪️ · `blender` Standmixer 🥤 · `hand_blender` Pürierstab 🪄 · `pan` Pfanne 🍳 · `pot` Topf 🍲 · `wok` Wok 🥢 · `grill` Grill 🍖 · `toaster` Toaster 🍞 · `sandwich_maker` Sandwichmaker 🥪 · `rice_cooker` Reiskocher 🍚 · `slow_cooker` Slow Cooker ⏲️ · `food_processor` Küchenmaschine ⚙️ · `kettle` Wasserkocher 🫖 · `baking_tray` Backblech 🟫 · `bowl` Schüssel 🥣 (immer vorhanden, nicht abwählbar)

### 8.5 Küchen (`CUISINES`)
`german` Deutsch · `italian` Italienisch · `mediterranean` Mediterran · `greek` Griechisch · `turkish` Türkisch · `middle_eastern` Orientalisch · `indian` Indisch · `thai` Thai · `vietnamese` Vietnamesisch · `chinese` Chinesisch · `japanese` Japanisch · `korean` Koreanisch · `mexican` Mexikanisch · `american` Amerikanisch · `french` Französisch · `spanish` Spanisch
Jeweils mit Flaggen-Emoji bzw. passendem Emoji.

### 8.6 Supermarkt-Kategorien (in dieser Reihenfolge = Reihenfolge auf der Einkaufsliste)
`produce` Obst & Gemüse 🥦 · `bakery` Brot & Backwaren 🥖 · `dairy_eggs` Milchprodukte & Eier 🥛 · `meat_fish` Fleisch & Fisch 🥩 · `plant_protein` Tofu & Co. 🌱 · `frozen` Tiefkühl 🧊 · `staples` Nudeln, Reis & Getreide 🌾 · `canned` Konserven & Gläser 🥫 · `spices` Gewürze, Öle & Saucen 🧂 · `nuts_seeds` Nüsse & Samen 🥜 · `sweets` Süßes & Backen 🍫 · `drinks` Getränke 🧃 · `other` Sonstiges 🛒

### 8.7 Mahlzeiten
`breakfast` Frühstück 🌅 · `lunch` Mittagessen ☀️ · `dinner` Abendessen 🌙 · `snack` Snack 🍎 · `dessert` Dessert 🍰 · `drink` Drinks & Shakes 🥤
Für Planung und Tagebuch zählen `dessert` und `drink` als `snack`.

### 8.8 Mikronährstoff-Referenzwerte (Erwachsene, nach DGE, gerundet)

| Code | Name | Einheit | männlich | weiblich | divers |
|---|---|---|---|---|---|
| vit_c | Vitamin C | mg | 110 | 95 | 110 |
| vit_d | Vitamin D | µg | 20 | 20 | 20 |
| vit_b12 | Vitamin B12 | µg | 4 | 4 | 4 |
| folate | Folat | µg | 300 | 300 | 300 |
| vit_a | Vitamin A | µg | 850 | 700 | 850 |
| vit_e | Vitamin E | mg | 14 | 12 | 14 |
| iron | Eisen | mg | 11 | 16 (ab 51 J.: 14) | 16 |
| calcium | Calcium | mg | 1000 | 1000 | 1000 |
| magnesium | Magnesium | mg | 350 | 300 | 350 |
| zinc | Zink | mg | 14 | 8 | 14 |
| potassium | Kalium | mg | 4000 | 4000 | 4000 |

Bei `pregnant_or_breastfeeding`: Folat 550, Eisen 27 (schwanger) — wir unterscheiden nicht zwischen Schwangerschaft und Stillzeit, nimm diese Werte und zeige den Hinweis „Bitte mit Ärztin/Arzt oder Hebamme abstimmen.“
Hinweis für Vitamin D in der UI: „Wird größtenteils über Sonnenlicht gebildet, über Essen allein kaum erreichbar.“ Vitamin D zählt deshalb **nicht** in den Mikro-Score der Engine.

---

## 9. Ernährungsziele (`js/logic/nutrition.js`)

### 9.1 Funktionen (exakt)
```js
export function ingredientNutrients(ingredientId, grams)          → Nutrients
export function recipeNutrients(recipe, servings = recipe.servings, swaps = {}) → { total: Nutrients, perServing: Nutrients }
export function sumNutrients(list)                                 → Nutrients
export function scaleNutrients(n, factor)                          → Nutrients
export function calcAge(birthYear)                                 → number
export function calcBMI(weightKg, heightCm)                        → number
export function calcBMR(profile)                                   → number
export function calcTDEE(profile)                                  → number
export function calcTargets(profile)                               → Targets
export function effectiveTargets(profile)                          → Targets   // targets + targets_override
export function mealShare(profile)                                 → { breakfast, lunch, dinner, snack }  // Anteile, Summe = 1
export function dayBalance(foodLogEntries, targets)                → { consumed: Nutrients, remaining: Nutrients, percent: {...} }
export function weeklyMicroStatus(foodLog7Days, targets)           → { [microCode]: percentOfTarget (Ø pro Tag) }
export function safetyFlags(profile)                               → { noDeficit: boolean, reasons: string[] }
```

### 9.2 Kalorien
1. **Grundumsatz (Mifflin-St Jeor):** `10·kg + 6,25·cm − 5·Alter + s`, mit `s = +5` (männlich), `−161` (weiblich), `−78` (divers).
2. **Gesamtumsatz:** `TDEE = BMR · PAL` mit `sedentary 1,2 · light 1,375 · moderate 1,55 · high 1,725 · athlete 1,9`.
3. **Zielanpassung:**
   - `lose`: Defizit = `pace_kg_week · 7700 / 7` (0,25 → 275, 0,5 → 550, 0,75 → 825 kcal), aber höchstens 25 % des TDEE.
   - `gain`: Überschuss = `pace_kg_week · 7700 / 7`, höchstens 20 % des TDEE.
   - `muscle`: +250 kcal; wenn BMI ≥ 27: 0 kcal (Rekomposition) und Hinweis in der Zusammenfassung.
   - `maintain`, `healthy`, `energy`: ±0.
4. **Untergrenze:** Ergebnis nie unter `max(BMR, 1500 männlich / 1200 weiblich / 1350 divers)`.
5. Auf 10 kcal runden.

### 9.3 Makros
- **Referenzgewicht** für Protein und Fett: bei BMI > 30 das Gewicht bei BMI 25 (`25 · (cm/100)²`), sonst das aktuelle Gewicht.
- **Protein (g/kg Referenzgewicht):** lose 1,8 · muscle 2,0 · gain 1,6 · maintain 1,2 · healthy 1,2 · energy 1,3. Modifier `high_protein`: mindestens 1,8. Ab 65 Jahren mindestens 1,0. Obergrenze: 35 % der kcal.
- **Fett:** 30 % der kcal, mindestens 0,8 g/kg Referenzgewicht.
- **Kohlenhydrate:** Rest `(kcal − 4·P − 9·F) / 4`, mindestens 50 g.
- **Modifier `keto`:** Kohlenhydrate fix 30 g, Protein wie oben, Fett = Rest.
- **Modifier `low_carb`:** Kohlenhydrate 20 % der kcal, Fett = Rest.
- **Ballaststoffe:** `max(30, 14 · kcal / 1000)`, höchstens 45 g.
- **Zucker (frei, Obergrenze):** 10 % der kcal / 4. **Gesättigte Fette (Obergrenze):** 10 % der kcal / 9. **Salz (Obergrenze):** 6 g.
- Alle Werte auf ganze Gramm runden.

### 9.4 Mikros
Aus Tabelle 8.8 nach Geschlecht, Alter und Schwangerschaft.

### 9.5 Mahlzeitenverteilung
Basis: Frühstück 25 %, Mittag 35 %, Abend 30 %, Snacks zusammen 10 %.
Anpassung an `meal_pattern`: Anteile ausgelassener Mahlzeiten werden proportional auf die übrigen verteilt. Bei 2 Snacks: Snacks zusammen 15 %, die Hauptmahlzeiten werden proportional gekürzt.

### 9.6 Sicherheitsgrenzen (`safetyFlags`)
`noDeficit = true`, wenn **eines** zutrifft: Alter < 18 · BMI < 18,5 · `pregnant_or_breastfeeding`.
Dann: Ziel `lose` ist im Onboarding deaktiviert (mit freundlicher Erklärung), bzw. wird bei nachträglicher Änderung auf `healthy` gesetzt, und es gibt kein Defizit.
Ist `target_weight_kg` bei `lose` so gewählt, dass der Ziel-BMI < 18,5 wäre, zeigt der Slider eine Warnung und erlaubt diesen Wert nicht.

---

## 10. Rezeptdatenbank (`js/data/recipes-1.js`, `recipes-2.js`)

### 10.1 Format
```js
{
  id: 'overnight-oats-beeren',                  // kebab-case, eindeutig
  title: 'Overnight Oats mit Beeren',
  subtitle: 'Cremig, fruchtig, fertig über Nacht',
  emoji: '🫐',
  gradient: ['#C9E8D5', '#8FD1A8'],             // weiche, zueinander passende Pastelltöne
  cuisine: 'american',
  meal_types: ['breakfast'],
  prep_min: 5, cook_min: 0, rest_min: 480,      // rest_min = passive Wartezeit (zählt NICHT zur Kochzeit-Filterung, wird aber angezeigt)
  difficulty: 'easy',                           // easy | medium | hard
  servings: 1,                                  // Basisportionen
  utensils: ['bowl'],
  tags: ['no_cook', 'meal_prep', 'budget'],     // no_cook, meal_prep, one_pot, budget, kid_friendly, leftover_friendly, freezer, quick, high_protein, low_calorie, comfort
  spice: 0,                                     // 0–3
  cost: 'low',                                  // low | medium | high
  ingredients: [
    { ing: 'oats', qty: 50, unit: 'g' },
    { ing: 'skyr', qty: 150, unit: 'g' },
    { ing: 'milk', qty: 100, unit: 'ml' },
    { ing: 'blueberries_frozen', qty: 1, unit: 'Handvoll' },
    { ing: 'chia_seeds', qty: 1, unit: 'EL' },
    { ing: 'honey', qty: 1, unit: 'TL', optional: true, note: 'zum Süßen' }
  ],
  steps: [
    { text: 'Haferflocken, Chiasamen, Skyr und Milch in einem Glas verrühren.', ings: ['oats', 'chia_seeds', 'skyr', 'milk'] },
    { text: 'Abgedeckt über Nacht (mind. 4 Stunden) in den Kühlschrank stellen.', timer_min: null },
    { text: 'Morgens mit Beeren toppen und nach Wunsch mit Honig süßen.', ings: ['blueberries_frozen', 'honey'] }
  ],
  swaps: [                                      // mögliche Austausche für Diät/Allergie/Abneigung
    { from: 'skyr', to: 'soy_yogurt', reason: 'vegan' },
    { from: 'milk', to: 'oat_milk', reason: 'vegan' },
    { from: 'honey', to: 'maple_syrup', reason: 'vegan' }
  ],
  storage: 'Im Kühlschrank bis zu 2 Tage haltbar.',
  tip: 'Mit Proteinpulver wird es zum High-Protein-Frühstück.'
}
```
Allergene, Diät-Eignung und Nährwerte **stehen nicht im Rezept**, sondern werden aus den Zutaten berechnet.

### 10.2 Umfang (Pflicht: exakt diese Mindestanzahlen)
- **recipes-1.js:** 14 Frühstück (süß und herzhaft, mind. 4 unter 10 Minuten, mind. 3 vegan, mind. 3 mit ≥ 30 g Protein) · 12 Snacks (mind. 4 ohne Kochen, mind. 3 unter 150 kcal, mind. 3 proteinreich) · 6 Desserts (mind. 2 „gesund“ unter 250 kcal) · 8 Drinks & Shakes (Smoothies, Proteinshakes, Gainer-Shake für Zunehmen)
- **recipes-2.js:** 16 Mittagessen (Bowls, Salate, Wraps, Suppen, Meal-Prep) · 18 Abendessen (Pfanne, Ofen, Pasta, Curry, Airfryer, One-Pot)
- **Insgesamt mindestens 74 Rezepte.**

Verteilung über alle Rezepte:
- mind. 20 vegetarisch, davon mind. 12 vegan
- mind. 8 pescetarisch (mit Fisch/Meeresfrüchten)
- mind. 8 keto-geeignet (≤ 10 g Kohlenhydrate pro Portion abzüglich Ballaststoffe)
- mind. 10 glutenfrei, mind. 10 laktosefrei
- mind. 10 „ohne Herd“ (nur Mikrowelle, Airfryer, Mixer, Toaster oder ganz ohne Kochen)
- Zeiten gemischt: mind. 15 Rezepte ≤ 15 Min., mind. 20 zwischen 16 und 30 Min., Rest bis 90 Min.
- Mind. 10 Küchen aus 8.5 vertreten.
- Mind. 10 mit `leftover_friendly` (Reste schmecken am nächsten Tag noch gut).
- Mind. 15 Rezepte mit sinnvollen `swaps`.
- Jede Portion zwischen 80 und 1100 kcal (Gainer-Shake darf bis 1100).
- 3–9 Schritte pro Rezept, konkret und anfängerfreundlich (Temperaturen, Zeiten, woran man erkennt, dass etwas fertig ist). Schritte mit Wartezeit bekommen `timer_min`.
- Nur echte, leckere, realistisch kochbare Rezepte, typische deutsche Supermarkt-Zutaten.

### 10.3 `recipes.js`
```js
export const RECIPES = [...RECIPES_1, ...RECIPES_2];
export const RECIPE_MAP = new Map(...);
export function getRecipe(id) { ... }
export function totalTime(recipe) { return recipe.prep_min + recipe.cook_min; }
```

---

## 11. Diät- und Allergie-Logik (`js/logic/diet.js`)

```js
export function recipeAllergens(recipe, swaps = {})            → string[]   // nur Pflichtzutaten zählen
export function recipeFlags(recipe, swaps = {})                → string[]   // lactose, histamine, fructose, alcohol, spicy
export function recipeDietInfo(recipe, swaps = {})             → { vegan, vegetarian, pescetarian, halal, keto, low_carb, high_protein, gluten_free, lactose_free }
export function checkRecipe(recipe, profile)                   → { ok: boolean, swaps: { [fromId]: toId }, dropped: string[], blockers: string[] }
```

`checkRecipe` ist das Herz der harten Filterung:
1. Für jede **Pflicht**zutat prüfen: Allergene des Nutzers, Unverträglichkeiten (über `flags`), Diät-Basis (über `animal`), `halal` (kein `pork`, kein `gelatin`, kein `alcohol`), `disliked_ingredients` mit Level `hate`.
2. Ist eine Zutat problematisch, suche im Rezept `swaps` einen Ersatz, der selbst unproblematisch ist → in `swaps` aufnehmen.
3. **Optionale** Zutaten, die problematisch sind, landen in `dropped` (werden im Rezept als „weggelassen“ angezeigt).
4. Bleibt eine Pflichtzutat ohne gültigen Ersatz → `ok = false`, Grund in `blockers` (für Debug/Dev-Anzeige).
5. `keto`/`low_carb`: nach Swaps die Netto-Kohlenhydrate pro Portion berechnen (keto ≤ 10 g, low_carb ≤ 25 g), sonst `ok = false`.

Diät-Hierarchie über `animal`:
- vegan: nur `none`
- vegetarian: `none`, `honey`, `dairy`, `egg`
- pescetarian: zusätzlich `fish`, `seafood`
- omnivore / flexitarian: alles (flexitarian bekommt in der Engine einen Bonus für vegetarische Rezepte)

---

## 12. Vorschlags-Engine (`js/logic/engine.js`)

### 12.1 Signatur
```js
export function suggest({
  recipes, profile, pantry, favorites, ratings, blocked,
  foodLogToday, foodLog7Days, cookedLast7Days,          // cookedLast7Days: [{ recipe_id, date }]
  filters                                               // siehe 12.2
}) → Array<{
  recipe, score, match_percent, missing: Array<{ ing, qty_g }>,
  swaps, dropped, expiring_used: string[], reasons: string[]   // max. 3 Gründe, deutsch, für „Warum dieser Vorschlag?“
}>
```

### 12.2 Filter
```js
{
  meal_type: 'breakfast' | ... | null,       // null = alle
  max_time: number | null,                   // Minuten (prep + cook)
  utensils: string[],                        // verfügbare Geräte (Standard: profile.utensils)
  pantry_mode: 'any' | 'max_missing_2' | 'only_pantry',
  difficulty: 'easy' | 'medium' | 'hard' | null,   // max. Schwierigkeit
  query: string,                             // Textsuche in Titel, Untertitel, Zutatennamen
  use_up: string[],                          // ingredient_ids, die verbraucht werden sollen (Resteverwertung)
  tags: string[],                            // z. B. ['meal_prep']
  cuisine: string | null,
  limit: number                              // Standard 30
}
```

### 12.3 Harte Filter (Ausschluss)
`blocked` · `checkRecipe(...).ok === false` · benötigte Geräte ⊄ `filters.utensils` (`bowl` ist immer vorhanden) · Gesamtzeit > `max_time` · falscher `meal_type` · schwieriger als erlaubt (Anfänger sehen standardmäßig kein `hard`) · `pantry_mode` nicht erfüllt · Schärfe > `profile.spice_level + 1` · `query` passt nicht.

### 12.4 Vorrats-Abgleich
- Zu prüfen sind nur **Pflichtzutaten** (nach Swaps), die **nicht** in `profile.staples` stehen und nicht das Flag `staple` haben.
- Vorhanden, wenn ein `PantryItem` mit gleicher `ingredient_id` existiert (Reste zählen nicht als Zutat). Hat das Item eine Menge, muss sie ≥ 80 % der benötigten Gramm sein, sonst zählt es als „teilweise“ (0,5).
- `match_percent = round(100 · vorhanden / benötigt)`. `missing` = fehlende Zutaten mit Gramm.

### 12.5 Score (0–100), Gewichte exakt
| Komponente | Gewicht | Berechnung (jeweils 0..1) |
|---|---|---|
| Vorrat | 28 | `match_percent / 100` |
| Zielpassung | 20 | `0,5·kcalFit + 0,3·proteinFit + 0,2·fiberFit`. kcalFit = `max(0, 1 − |kcal − Mahlzeitziel| / Mahlzeitziel)`, Mahlzeitziel = `targets.kcal · mealShare[meal]`. proteinFit = `min(1, Protein-kcal-Anteil / Soll-Anteil)`, Soll-Anteil = `4·protein_g / kcal` aus Targets. fiberFit = `min(1, fiber / (fiber_g · mealShare))`. Bei `gain` wird kcalFit über dem Ziel nicht bestraft. |
| Resttag | 8 | Passt die Portion in die heute noch **verbleibenden** kcal (± 15 %) → 1, sonst linear abfallend. Ohne Log heute → 0,5. |
| Resteverwertung | 14 | Summe über genutzte Vorratszutaten: läuft in ≤ 1 Tag ab → 1,5, in ≤ 3 Tagen → 1, in `use_up` → 1,5; Ergebnis `min(1, Summe / 2)`. |
| Vorlieben | 16 | Mittelwert aus: Lieblingsküche (1/0), Anteil Lieblingszutaten, `taste_affinity` (−1..1 → 0..1), Bewertung (5★ → 1, 1★ → 0, keine → 0,5), Favorit (+0,3, gekappt bei 1). Abneigung `meh` je Zutat −0,15. Flexitarisch + vegetarisches Rezept +0,2. |
| Mikro-Lücken | 6 | Nährstoffe, deren 7-Tage-Ø < 70 % des Ziels liegt (ohne Vitamin D): Anteil, zu dem dieses Rezept pro Portion ≥ 20 % des Tagesziels liefert. Ohne Logdaten → 0,5. |
| Abwechslung | 8 | Heute gekocht → 0, in den letzten 3 Tagen → 0,3, in den letzten 7 Tagen → 0,7, sonst 1. |

Danach **Diversifizierung**: In den Top 8 höchstens 2 Rezepte mit derselben Haupt-Proteinquelle (die Zutat mit dem meisten Protein im Rezept) und höchstens 3 aus derselben Küche. Überzählige rutschen nach unten.

### 12.6 Gründe (`reasons`)
Maximal 3, aus den stärksten Komponenten, z. B.:
„Du hast 6 von 7 Zutaten da“ · „Verbraucht deinen Spinat, der morgen abläuft“ · „34 g Protein, passt zu deinem Muskelaufbau-Ziel“ · „Reich an Eisen, davon hattest du diese Woche wenig“ · „Du hast es mit 5 ★ bewertet“ · „Angepasst: Hafermilch statt Milch“.

### 12.7 KI-Hook
`screens/discover.js` ruft zuerst `api.getAiSuggestions(context)` auf. Kommt `null` zurück (immer, im Moment), wird `suggest(...)` benutzt. Das UI darf keinen Unterschied machen.

---

## 13. Resteverwertung (`js/logic/leftovers.js`)

```js
export function expiryStatus(item, todayISO)          → 'expired' | 'today' | 'soon' | 'ok' | 'none'   // soon = ≤ 3 Tage
export function expiringItems(pantry, todayISO, days = 3) → PantryItem[] (sortiert nach Datum)
export function makeLeftover(recipe, servings, todayISO) → PantryItem   // kind: 'leftover', expires_on = heute + 3 Tage (Fisch: + 1 Tag)
export function deductPantry(pantry, recipe, servings, swaps) → { updates: PantryItem[], deletions: string[] }
export function suggestExpiry(ingredientId, todayISO) → ISO | null      // heute + shelf_days
```

Features:
1. **Ablaufdaten:** Beim Hinzufügen zum Vorrat wird das Ablaufdatum aus `shelf_days` vorgeschlagen (änderbar, löschbar).
2. **„Bald ablaufend“-Karte** auf Home mit Button „Rezepte dafür finden“ → `#/discover?use_up=id1,id2`.
3. **Reste-Modus** in Entdecken: Nutzer wählt Zutaten aus dem Vorrat, die weg müssen (Chips) → Filter `use_up`.
4. **Gekochte Reste:** Nach „Gekocht ✓“ fragt ein Sheet: „Wie viele Portionen habt ihr gegessen?“ Bleiben Portionen übrig → Rest als `PantryItem` mit `kind: 'leftover'`. Reste erscheinen oben im Vorrat („Reste im Kühlschrank“) und auf Home. Button „Rest gegessen“ → Tagebuch-Eintrag mit den Nährwerten des Rezepts, Portionen vom Rest abziehen.
5. **Vorrat abziehen:** Im selben Sheet Schalter „Zutaten vom Vorrat abziehen“ (Standard an). Nur Items mit Menge werden reduziert. Items ohne Menge bleiben, Items, die auf 0 fallen, werden gelöscht. Staples werden nie abgezogen.

---

## 14. Wochenplaner (`js/logic/planner.js`)

```js
export function planWeek({ recipes, profile, pantry, ratings, favorites, blocked, existingEntries, weekStartISO, seed })
  → MealPlanEntry[]   // ohne id; gesperrte (locked) bestehende Einträge bleiben unverändert erhalten
```

Algorithmus:
1. Slots pro Tag aus `meal_pattern` (Frühstück, Mittag, Abend, 0–2 Snacks). Zeitlimit Mo–Fr `time_weekday_min`, Sa–So `time_weekend_min`.
2. Für jeden Slot Kandidaten über `suggest(...)` mit passendem `meal_type` holen (Vorrat wird **virtuell** verbraucht, damit dieselbe Zutat nicht 5× eingeplant wird).
3. Auswahl greedy mit zusätzlichen Regeln:
   - kein Rezept zweimal am selben Tag, höchstens 2× pro Woche, gleiche Hauptmahlzeit nicht an zwei aufeinanderfolgenden Tagen;
   - **Zutaten-Überschneidung** +10 % Score, wenn das Rezept eine Zutat nutzt, die in dieser Woche schon gekauft werden muss und deren Packung sonst nicht aufgebraucht wird (weniger Verschwendung);
   - Tagessumme soll im Bereich **±10 %** der Ziel-kcal und **≥ 90 %** des Protein-Ziels liegen. Nach dem Befüllen eines Tages: ist er außerhalb, wird der Snack getauscht (größerer/kleinerer), danach die Portionsgröße der Hauptmahlzeit in 0,25er-Schritten zwischen 0,75 und 1,5 angepasst.
4. **Reste einplanen:** Hat ein Abendessen `leftover_friendly` und ist am nächsten Tag Mittag frei, wird dort `is_leftover: true` mit demselben Rezept eingetragen, und das Abendessen wird für `household_size · 2` Portionen gekocht.
5. `servings` = `household_size` (bei Resten entsprechend mehr).
6. Deterministisch über `seed` (einfacher seeded RNG, z. B. mulberry32) für leichte Zufälligkeit bei Gleichstand; „Neu mischen“ erhöht den Seed.

---

## 15. Einkaufsliste (`js/logic/shopping.js`)

```js
export function missingForRecipe(recipe, servings, pantry, profile, swaps)   → ShoppingItem[] (ohne id)
export function listFromPlan(entries, recipes, pantry, profile)               → ShoppingItem[] (ohne id)
export function mergeShopping(existing, incoming)                            → { upserts: ShoppingItem[] }
export function displayQuantity(ingredientId, grams)                         → { qty, unit, label }   // „2 Stück“, „250 g“, „1 Packung (500 g)“
export function groupByCategory(items)                                       → Array<{ category, items }>
```

Regeln:
- Mengen pro `ingredient_id` in Gramm summieren (alle Rezepte, Portionen skaliert, `is_leftover`-Einträge zählen nicht), Vorratsmengen abziehen, Staples ignorieren.
- Anzeige in der natürlichsten Einheit: Stück, wenn `units.Stück` existiert (aufrunden auf 0,5), sonst g/ml auf 10er gerundet; zusätzlich Hinweis auf Packungsgröße (`pack_g`).
- Gleiche Zutaten werden zusammengeführt, `recipe_ids` vereinigt. Manuelle Einträge (Freitext) werden per normalisiertem Namen zusammengeführt.
- Abgehakte Items: „In Vorrat übernehmen“ legt sie als `PantryItem` mit vorgeschlagenem Ablaufdatum an und löscht sie aus der Liste.

---

## 16. Geschmack lernen (`js/logic/taste.js`)

```js
export function updateAffinity(profile, recipe, stars) → taste_affinity
```
- 5★: Küche +0,15, die 3 Zutaten mit den meisten Gramm (keine Staples) je +0,1
- 4★: Küche +0,08, Zutaten je +0,05
- 3★: keine Änderung
- 2★: Küche −0,1, Zutaten je −0,08
- 1★: Küche −0,2, Zutaten je −0,15 und Sheet-Frage: „Soll ich dir das nie wieder vorschlagen?“
- Alle Werte auf −1..1 begrenzen.

---

## 17. Screens im Detail

Allgemein für alle Screens: großer Titel oben (28–32 px, fett), darunter Inhalt in Karten. Mobile: 16 px seitlicher Rand. Desktop (≥ 960 px): Sidebar links (240 px), Inhalt max. 1100 px zentriert, Rezeptgrids mit 3–4 Spalten.

### 17.1 Welcome (`#/welcome`)
- Vollbild, animierter Hintergrund (weiche grüne Blobs, die langsam wabern), in der Mitte animiertes Logo (Blatt „wächst“ per SVG-Stroke-Animation), Headline „Iss gut. Ohne Stress.“, Subline „Rezepte aus dem, was du hast, passend zu deinem Ziel.“
- 3 kleine Feature-Pills, die nacheinander einfliegen: „🥕 Aus deinem Vorrat“, „🎯 Passend zu deinem Ziel“, „🛒 Einkaufsliste automatisch“.
- Buttons: „Los geht's“ (primär → Registrieren), „Ich habe schon einen Account“ (Ghost → Login).

### 17.2 Auth (`#/login`, `#/register`)
- Karte mit Segment-Umschalter Login/Registrieren (animierter Indikator).
- Felder: E-Mail, Passwort (mit Anzeigen-Auge), bei Registrierung Passwort wiederholen.
- Validierung live: E-Mail-Format, Passwort ≥ 8 Zeichen, Stärkebalken (schwach/ok/stark).
- Fehler inline unter dem Feld mit Shake-Animation.
- „Passwort vergessen?“ → Sheet mit E-Mail-Feld → `api.requestPasswordReset` → Erfolgstoast.
- Nach Registrierung → `#/onboarding/1`, nach Login → Home oder Onboarding (falls nicht fertig).

### 17.3 Onboarding (`#/onboarding/:step`, 12 Schritte)
Layout: Fortschrittsbalken oben (animiert), „Zurück“-Pfeil, „Überspringen“ nur bei optionalen Schritten, großer Frage-Titel, kurzer Untertitel, Inhalt, unten fixierter „Weiter“-Button (deaktiviert, bis gültig). Übergänge: aktueller Schritt gleitet nach links raus, neuer von rechts rein (zurück umgekehrt). Antworten werden nach **jedem** Schritt als Entwurf gespeichert (`saveProfile` mit `onboarding_done: false`), damit ein Reload nichts verliert.

1. **Name:** „Wie dürfen wir dich nennen?“ Textfeld, Autofokus.
2. **Ziel:** „Was möchtest du erreichen?“ 6 große Karten (2 Spalten) mit Emoji, Titel, Einzeiler: 🔥 Abnehmen · 💪 Muskeln aufbauen · 📈 Zunehmen · ⚖️ Gewicht halten · 🥗 Gesünder essen · ⚡ Mehr Energie. Auswahl: Karte hebt sich, Rand grün, Häkchen ploppt ein (Spring).
3. **Körperdaten:** Geschlecht (Segment: männlich/weiblich/divers), Geburtsjahr (Picker), Größe (Slider 140–210 cm mit großer Zahl), Gewicht (Slider 40–200 kg, 0,5er Schritte, zusätzlich −/+ Buttons), Schalter „Ich bin schwanger oder stille“ (nur bei weiblich/divers sichtbar).
4. **Tempo & Zielgewicht** (nur bei lose/gain, sonst überspringen): Zielgewicht-Slider, Tempo als 3 Karten (🐢 entspannt 0,25 kg/Woche · 🚶 normal 0,5 · 🏃 ambitioniert 0,75, bei gain nur 0,25 und 0,5), darunter live: „Voraussichtlich erreicht: ca. März 2027“.
5. **Aktivität:** 5 Karten mit Beschreibung (z. B. „Bürojob, kaum Sport“ … „Leistungssport / körperliche Arbeit + Training“).
6. **Ernährungsform:** Basis als 5 Karten, darunter Zusätze als Toggle-Chips (Keto, Low Carb, High Protein, Halal).
7. **Allergien & Unverträglichkeiten** (optional): 14 Allergene + 3 Unverträglichkeiten als Chips mit Emoji. Hinweis: „Wir filtern streng. Prüfe trotzdem immer die Verpackung.“
8. **Vorlieben:** Küchen (Chips, Mehrfachauswahl), Schärfe-Regler mit 4 Stufen (🙂 🌶️ 🌶️🌶️ 🔥), „Was isst du besonders gern?“ (Zutaten-Suche mit Autocomplete → Chips).
9. **Abneigungen:** „Was magst du gar nicht?“ Zutaten-Suche → Chip; Tippen auf Chip wechselt zwischen „😖 nie“ (hate) und „😕 lieber nicht“ (meh). Vorschläge für häufige Abneigungen als Schnellchips: Koriander, Pilze, Oliven, Rosinen, Fisch, Zwiebeln, Tofu, Rote Bete, Kapern, Blauschimmelkäse.
10. **Küche:** „Was hast du in deiner Küche?“ Grid mit Geräte-Kacheln (Emoji + Name, Toggle mit Bounce). Standard vorausgewählt: Herd, Topf, Pfanne, Backofen, Schüssel. Darunter „Grundvorrat, den du immer da hast“ als Chips (vorausgewählt: Salz, Pfeffer, Olivenöl, Rapsöl, Zucker, Mehl, Gemüsebrühe, Essig).
11. **Alltag:** Zeit unter der Woche und am Wochenende (je Chip-Reihe 10/15/20/30/45/60/90 Min.), Kochlevel (3 Karten), Haushaltsgröße (Stepper 1–8), Budget (3 Karten 💶 / 💶💶 / 💶💶💶), Mahlzeiten (Toggles Frühstück/Mittag/Abend, Snacks 0/1/2).
12. **Zusammenfassung:** Großer animierter Kalorienring, der sich füllt und hochzählt (Count-up), darunter 3 Makro-Ringe (Protein, Kohlenhydrate, Fett) und eine aufklappbare Liste der Mikro-Ziele. Text: „Dein Tagesziel: 2.150 kcal“ + Satz, wie es berechnet wurde („Grundumsatz 1.720 kcal × Aktivität 1,55 − 500 kcal für ca. 0,5 kg/Woche“). Hinweis-Box bei Sicherheitsgrenzen. „Ziele anpassen“ öffnet Sheet mit manuellen Feldern (→ `targets_override`). Button „Los geht's 🎉“ → Konfetti → `onboarding_done: true` → Home.

### 17.4 Home (`#/home`)
Von oben nach unten:
1. **Header:** „Guten Morgen, Noah 👋“ (je nach Uhrzeit Morgen/Tag/Abend), Datum, rechts Avatar-Kreis mit Initial → Profil.
2. **Tagesbilanz-Karte:** großer kcal-Ring (gegessen / Ziel, Rest in der Mitte „noch 850 kcal“), rechts daneben 3 Makro-Balken, darunter aufklappbar „Mikronährstoffe heute“ (kleine Balken, farbig nach Erfüllung). Button „+ Mahlzeit eintragen“ (Sheet: aus Rezept, Rest oder schnell: Name + kcal + Protein).
3. **„Jetzt passend“:** horizontales Karussell (Scroll-Snap) mit 6 Vorschlägen für die aktuelle Mahlzeit (5–10 Uhr Frühstück, 10–14 Mittag, 14–17 Snack, 17–22 Abend, sonst Snack) und Link „Mehr“.
4. **Reste & bald ablaufend:** nur wenn vorhanden. Reste-Items mit „Gegessen“-Button, ablaufende Zutaten als Chips mit Farbe + „Rezepte dafür finden“.
5. **Heute im Plan:** Einträge des Wochenplans für heute (falls vorhanden) mit „Kochen“-Button, sonst Karte „Woche planen lassen“.
6. **Wochen-Mikro-Tipp:** falls ein Mikronährstoff im 7-Tage-Ø < 70 %: „Diese Woche wenig Eisen – probier mal Linsen-Dal“ mit Rezeptlink.
7. **Einkaufsliste-Teaser:** „5 Dinge auf deiner Liste“ → Liste.

### 17.5 Entdecken (`#/discover`)
- Oben Suchfeld (sticky, Glas-Effekt), darunter horizontale Chip-Reihe für Mahlzeit (Alle, 🌅, ☀️, 🌙, 🍎, 🍰, 🥤).
- Button „Filter“ mit Zähler aktiver Filter → Bottom-Sheet mit:
  Dauer (Chips ≤ 10 / 15 / 20 / 30 / 45 / 60 / egal) · Vorrat (Segment: Egal / Max. 2 fehlen / Nur was ich habe) · Geräte (Toggle-Grid, vorausgewählt aus Profil, „auf Profil zurücksetzen“) · Schwierigkeit · Küche · Tags (Meal Prep, One Pot, ohne Kochen, Budget, High Protein, Low Calorie) · Reste-Modus (Chips aller Vorratszutaten, ablaufende zuerst).
  Unten „X Rezepte anzeigen“ (Zahl live aktualisiert).
- Ergebnisliste: Rezeptkarten (siehe 18.4) im Grid, gestaffeltes Einblenden, Infinite Scroll in 12er-Schritten.
- Empty State: „Nichts gefunden 🤔 – lockere die Filter“ mit Buttons, die gezielt den restriktivsten Filter lösen.
- Filter bleiben in der URL (`?meal=…&time=…`), damit Zurück-Navigation den Zustand behält.

### 17.6 Rezept-Detail (`#/recipe/:id`)
- **Hero:** Verlauf aus `gradient` über volle Breite (rund unten, 32 px), großes Emoji (96 px) mit sanftem Schwebe-Loop, Zurück-Button (Glas), Herz (Favorit, Pop-Animation) und Teilen-Button.
- Titel, Untertitel, Info-Pills: ⏱ Zeit (plus Wartezeit separat), 📊 Schwierigkeit, 🌶 Schärfe, 💶 Kosten, Küche.
- **Warum für dich:** die `reasons` als kleine grüne Pills.
- **Anpassungen:** Wenn Swaps oder Dropped: gelbe Info-Box „Für dich angepasst: Hafermilch statt Milch · ohne Honig“.
- **Portionsregler:** großer Stepper (− 2 Portionen +), 0,5 bis 12 in 0,5er-Schritten. Alle Mengen und Nährwerte zählen animiert um.
- **Nährwerte:** Tabs „Pro Portion“ / „Gesamt“. kcal groß, Makro-Donut (Protein/KH/Fett-Verteilung), Balken „% deines Tagesziels“ für kcal, Protein, Ballaststoffe, Zucker, Salz; aufklappbar alle Mikros mit % vom Tagesziel.
- **Allergene & Eignung:** Chips (z. B. „Enthält: Gluten, Milch“, „✓ vegetarisch“, „✓ laktosefrei“).
- **Zutaten:** Liste mit Menge (natürliche Einheit), Name, Status-Icon (✓ im Vorrat, ◐ teilweise, ○ fehlt, 🧂 Grundvorrat), optionale Zutaten grau mit „optional“. Tippen auf eine Zeile hakt sie ab (beim Kochen). Button **„Fehlende Zutaten auf die Liste (3)“** → Fly-to-Tab-Animation + Toast mit „Rückgängig“.
- **Zubereitung:** nummerierte Schritte (Nummer im grünen Kreis), Timer-Schritte mit ⏱-Pill.
- **Tipps & Aufbewahrung**.
- **Sticky Bottom-Bar:** „In den Plan“ (Sheet: Tag + Mahlzeit wählen) · primär „Kochen starten“ → `#/cook/:id?servings=X`.
- Unten: „Gekocht ✓“-Button → Sheet (Portionen gegessen, Vorrat abziehen, Mahlzeit-Typ) → Tagebuch-Eintrag, ggf. Rest anlegen, Konfetti, danach Bewertungs-Sterne (1–5) → `rateRecipe` + `updateAffinity`.
- Menü (⋯): „Nicht mehr vorschlagen“ (`toggleBlocked`).

### 17.7 Kochmodus (`#/cook/:id`)
- Vollbild, keine Tab-Bar, dunkler oder heller Hintergrund je Theme, sehr große Schrift (24–28 px für den Schritt).
- Oben: Schließen (mit Bestätigung, wenn mitten im Kochen), Fortschritt als Segment-Balken (ein Segment pro Schritt).
- Schritt 0 = **„Mise en place“**: alle Zutaten mit skalierten Mengen zum Abhaken.
- Pro Schritt: Text, darunter die für diesen Schritt benötigten Zutaten mit Mengen (aus `ings`), bei `timer_min` ein großer runder Timer-Button.
- **Timer:** mehrere parallel möglich, schweben als Pills am unteren Rand (Name = Schrittnummer, Restzeit), laufen weiter beim Blättern. Bei Ablauf: Ton (per Web Audio API erzeugter sanfter Gong, keine Audiodatei), Vibration, Pill pulsiert rot, Toast.
- Navigation: Wischen links/rechts, Pfeiltasten, große Buttons „Zurück“/„Weiter“. Schrittwechsel mit Slide-Animation.
- **Vorlesen:** Lautsprecher-Button liest den Schritt vor (`speechSynthesis`, deutsche Stimme, wenn verfügbar).
- **Bildschirm bleibt an:** Wake Lock API (bei `visibilitychange` erneut anfordern).
- Letzter Schritt: „Fertig! 🎉“ → Konfetti → dasselbe „Gekocht“-Sheet wie im Rezept.

### 17.8 Vorrat (`#/pantry`)
- Oben: Suchfeld mit Autocomplete aus `searchIngredients` → Zutat antippen → Mini-Sheet: Menge (optional, mit Einheit aus `units` oder g), Ablaufdatum (vorgeschlagen, änderbar, „kein Datum“). Freitext möglich, wenn nicht gefunden („‚X‘ als eigene Zutat hinzufügen“).
- Schnell-Hinzufügen-Chips: häufige Zutaten (Eier, Milch, Tomaten, Zwiebeln, Nudeln, Reis, Hähnchen, Käse, Paprika, Bananen).
- Abschnitt **„Reste im Kühlschrank 🍱“** (falls vorhanden) mit Portionen, Ablauf, „Gegessen“ / „Wegwerfen“.
- Abschnitt **„Läuft bald ab ⏰“**.
- Danach alle Items gruppiert nach Kategorie (einklappbar), jede Zeile: Name, Menge, Ablauf-Badge (rot: abgelaufen/heute, orange: ≤ 3 Tage, grau: ok), Wischen nach links zum Löschen (mit Rückgängig), Tippen zum Bearbeiten.
- Abschnitt **„Grundvorrat“**: Staples als Chips, an/aus.
- Großer Button unten: „Was kann ich kochen? 🍳“ → `#/discover?pantry=max_missing_2`.
- Empty State: „Dein Vorrat ist leer – füg ein paar Sachen hinzu, dann zaubere ich was draus.“

### 17.9 Einkaufsliste (`#/shopping`)
- Eingabefeld „Artikel hinzufügen“ mit Autocomplete.
- Gruppiert nach Kategorie (Reihenfolge 8.6), Kategorie-Header mit Emoji und Zähler.
- Zeile: runde Checkbox (Haken zeichnet sich per SVG-Animation), Name, Menge, darunter klein „für: Chili sin Carne, Bowl“. Abhaken → Durchstreichen-Animation, Zeile wandert nach 600 ms ans Ende der Gruppe.
- Header-Aktionen: „Teilen“ (Web Share / Kopieren als Text mit Kategorien) · „Erledigte in Vorrat übernehmen“ · „Erledigte löschen“.
- „Aus Wochenplan erstellen“ → `listFromPlan` → Vorschau-Sheet mit allen Items zum Ab-/Anwählen → hinzufügen.
- Fortschrittsbalken oben: „7 von 12 erledigt“. Alles erledigt → kleine Konfetti-Animation.

### 17.10 Wochenplan (`#/plan`)
- Wochenwähler oben (‹ KW 40 ›), darunter horizontale Tages-Pills (Mo–So, heute hervorgehoben). Mobile: ein Tag sichtbar, wischbar. Desktop: 7 Spalten.
- Pro Tag: Slots (Frühstück, Mittag, Abend, Snacks) als Karten mit Rezept (Emoji, Titel, Zeit, kcal) oder leerem Slot „+ Rezept wählen“ (öffnet Sheet mit Suche und Top-Vorschlägen für diesen Slot).
- Reste-Einträge mit 🍱-Badge „Rest von gestern“.
- Pro Tag Summenzeile: kcal / Ziel und Protein / Ziel mit Mini-Balken (grün im Zielbereich, orange außerhalb).
- Karten-Aktionen: 🔒 Sperren, 🔄 Tauschen (nächstbester Vorschlag), 🗑 Entfernen, Portionen ändern, Drag & Drop zwischen Slots (Pointer Events, auch Touch).
- Buttons: „✨ Woche automatisch planen“ (füllt alle nicht gesperrten Slots, Karten fliegen gestaffelt ein) · „🔀 Neu mischen“ · „🛒 Einkaufsliste erstellen“.

### 17.11 Fortschritt (`#/progress`)
- Gewicht: Eingabe „Heute wiegen“ + Liniendiagramm (eigenes SVG, keine Library) der letzten 30/90 Tage mit Ziellinie, Trend (gleitender 7-Tage-Durchschnitt).
- Kalorien und Protein der letzten 7 Tage als Balkendiagramm mit Ziellinie.
- Mikronährstoffe: 7-Tage-Ø in % vom Ziel als horizontale Balken, sortiert von niedrig nach hoch, mit Tipp-Rezept für den niedrigsten Wert.
- Streak: „🔥 5 Tage in Folge eingetragen“.

### 17.12 Profil (`#/profile`, `#/profile/:section`)
- Kopf: Avatar (Initial im Verlaufskreis), Name, E-Mail, Ziel-Badge.
- Abschnitte (Listenzeilen mit Chevron, öffnen `#/profile/<section>` mit denselben Komponenten wie im Onboarding): `goal` Ziel & Körperdaten · `targets` Nährwertziele (berechnet, Override möglich, „Zurücksetzen“) · `diet` Ernährung & Allergien · `taste` Vorlieben & Abneigungen · `kitchen` Küche & Grundvorrat · `routine` Alltag · `favorites` Favoriten · `blocked` Ausgeblendete Rezepte · `appearance` Darstellung (Hell/Dunkel/System, Animationen reduzieren).
- Änderungen an Körperdaten oder Ziel → `calcTargets` neu → Toast „Deine Ziele wurden aktualisiert“.
- Unten: „Abmelden“, „Account löschen“ (Bestätigung durch Eintippen von „LÖSCHEN“), Disclaimer-Text, App-Version.

### 17.13 App-Shell & Navigation
- **Mobile (< 960 px):** Bottom-Tab-Bar (schwebend, 12 px vom Rand, Radius 28 px, Glas-Effekt) mit 5 Tabs: 🏠 Home · 🔍 Entdecken · 📅 Plan · 🥕 Vorrat · 🛒 Liste (Badge mit Anzahl offener Items). Aktiver Tab: Icon gefüllt, Hintergrund-Pill gleitet animiert zum aktiven Tab. Fortschritt ist über Home und Profil erreichbar.
- **Floating Action Button** (nur Home, Vorrat, Liste): runder grüner Button rechts unten über der Tab-Bar → Sheet mit Schnellaktionen: Zutat in Vorrat · Artikel auf Liste · Mahlzeit eintragen · Gewicht eintragen.
- **Desktop:** Sidebar mit Logo, denselben Einträgen + Fortschritt + Profil, aktiver Eintrag mit grüner Pill.
- Safe-Area-Insets (`env(safe-area-inset-*)`) für iPhone.

---

## 18. Design-System

### 18.1 Grundidee
Modern, ruhig, frisch, sehr rund. Viel Weißraum, weiche Schatten, grüne Akzente, verspielt-präzise Animationen. Stimmung: „Apple Health trifft Headspace“. Nichts wirkt kantig oder überladen.

### 18.2 Tokens (`css/tokens.css`) – exakt diese Variablen

```css
:root {
  /* Farben – Light */
  --bg: #F4F8F5;            --bg-elev: #FFFFFF;        --surface-2: #EEF4F0;     --surface-3: #E3ECE6;
  --text: #10231A;          --text-2: #4A6356;         --text-3: #7D9488;        --border: rgba(16,35,26,.08);
  --primary: #2F9E62;       --primary-600: #23804E;    --primary-700: #1B6340;
  --primary-50: #E9F6EE;    --primary-100: #D2EEDD;    --on-primary: #FFFFFF;
  --primary-grad: linear-gradient(135deg, #43C27F 0%, #2A9A5E 100%);
  --accent: #FF9F6E;        --accent-50: #FFF1E8;
  --warning: #F2A93B;       --warning-50: #FFF6E5;
  --danger: #E5534B;        --danger-50: #FDECEB;
  --info: #4C9BE8;
  --c-kcal: #2F9E62;  --c-protein: #4C9BE8;  --c-carbs: #F2B84B;  --c-fat: #EE8A6A;  --c-fiber: #8BC34A;
  --glass: rgba(255,255,255,.72);
  --overlay: rgba(10,25,18,.38);

  /* Form */
  --r-xs: 8px; --r-sm: 12px; --r-md: 18px; --r-lg: 24px; --r-xl: 32px; --r-pill: 999px;
  --sh-1: 0 1px 2px rgba(16,35,26,.04), 0 2px 8px rgba(16,35,26,.04);
  --sh-2: 0 4px 12px rgba(16,35,26,.06), 0 12px 32px rgba(16,35,26,.06);
  --sh-3: 0 8px 24px rgba(16,35,26,.08), 0 24px 64px rgba(16,35,26,.10);
  --sh-primary: 0 8px 24px rgba(47,158,98,.35);

  /* Abstände (4er-Raster) */
  --s-1: 4px; --s-2: 8px; --s-3: 12px; --s-4: 16px; --s-5: 20px; --s-6: 24px; --s-7: 32px; --s-8: 48px; --s-9: 64px;

  /* Typo */
  --font: 'Plus Jakarta Sans', system-ui, -apple-system, 'Segoe UI', sans-serif;
  --fs-xs: 12px; --fs-sm: 14px; --fs-md: 16px; --fs-lg: 18px; --fs-xl: 22px; --fs-2xl: 28px; --fs-3xl: 36px; --fs-hero: 44px;

  /* Bewegung */
  --ease-out: cubic-bezier(.22, 1, .36, 1);
  --ease-spring: cubic-bezier(.34, 1.56, .64, 1);
  --ease-in-out: cubic-bezier(.65, 0, .35, 1);
  --d-fast: 140ms; --d-base: 240ms; --d-slow: 420ms; --d-slower: 700ms;

  color-scheme: light;
}
```
Dark-Mode-Werte gelten unter `@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) { … } }` **und** unter `:root[data-theme="dark"] { … }`:
```css
--bg: #0B1410; --bg-elev: #13201A; --surface-2: #1A2A22; --surface-3: #22352B;
--text: #E7F2EB; --text-2: #A8BFB2; --text-3: #6F877A; --border: rgba(231,242,235,.08);
--primary: #4CCB86; --primary-600: #3DB374; --primary-700: #2E9660;
--primary-50: rgba(76,203,134,.12); --primary-100: rgba(76,203,134,.22); --on-primary: #06140D;
--primary-grad: linear-gradient(135deg, #5AD894 0%, #34A96A 100%);
--accent-50: rgba(255,159,110,.14); --warning-50: rgba(242,169,59,.14); --danger-50: rgba(229,83,75,.14);
--glass: rgba(19,32,26,.72); --overlay: rgba(0,0,0,.55);
--sh-1: 0 1px 2px rgba(0,0,0,.3); --sh-2: 0 8px 24px rgba(0,0,0,.35); --sh-3: 0 16px 48px rgba(0,0,0,.45);
--sh-primary: 0 8px 24px rgba(76,203,134,.25);
color-scheme: dark;
```
Nirgends im Code harte Farbwerte außer in `tokens.css` und in den Rezept-`gradient`s (im Dark Mode werden diese per `filter: saturate(.85) brightness(.75)` abgedunkelt).

### 18.3 Typografie
Plus Jakarta Sans 400/500/600/700/800. Überschriften 700–800, `letter-spacing: -0.02em`. Zahlen in Ringen/Statistiken `font-variant-numeric: tabular-nums`. Fließtext 16 px, Zeilenhöhe 1.5.

### 18.4 Komponenten (`css/components.css`)
- **Button** `.btn`: Höhe 52 px (klein 40 px), Radius pill, Schrift 600. Varianten: `.btn-primary` (Verlauf `--primary-grad`, `--sh-primary`, Hover hebt 1 px, Press `scale(.96)`), `.btn-secondary` (`--primary-50`, Text `--primary-700`), `.btn-ghost`, `.btn-danger`, `.btn-icon` (44×44 rund). Ripple-Effekt beim Klick. Ladezustand: Text wird zu drehendem Spinner, Breite bleibt gleich.
- **Karte** `.card`: `--bg-elev`, Radius `--r-lg`, Padding 20 px, `--sh-1`; `.card-interactive` hebt sich bei Hover (`--sh-2`, `translateY(-2px)`), Press `scale(.98)`.
- **Rezeptkarte** `.recipe-card`: oben 140 px Verlaufsfläche mit großem Emoji (64 px, leicht gedreht, beim Hover `rotate(0) scale(1.1)` mit Spring), rechts oben Herz-Button, links oben Match-Badge („92 % da“, grün ≥ 80, gelb ≥ 50, grau sonst). Darunter Titel (2 Zeilen max.), Pills: ⏱ 15 Min · 🔥 420 kcal · 💪 32 g. Wenn Zutaten fehlen: kleine Zeile „fehlt: Feta, Gurke“.
- **Chip** `.chip`: Höhe 36 px, Radius pill, `--surface-2`; `.chip.is-active`: `--primary`, Text `--on-primary`, kurzer Bounce.
- **Auswahlkarte** `.choice-card`: große Onboarding-Karte, Emoji 36 px, Titel, Beschreibung. Aktiv: Rand 2 px `--primary`, `--primary-50` Hintergrund, Häkchen oben rechts ploppt ein.
- **Toggle-Kachel** `.tile`: quadratisch, Emoji + Label, aktiv mit Bounce und grünem Rand.
- **Input** `.field`: Höhe 52 px, Radius `--r-md`, `--surface-2`, kein Rand; Fokus: 2 px Ring `--primary-100` + Rand `--primary`. Floating Label.
- **Slider**: eigene Optik (Track 8 px rund, gefüllter Teil grün, Thumb 28 px weiß mit Schatten, beim Ziehen `scale(1.15)`), große Wertanzeige darüber.
- **Stepper**: − Wert + in einer Pill.
- **Segmented Control**: Pill-Hintergrund, aktiver Indikator gleitet mit `--ease-spring`.
- **Switch**: 52×32, Knopf gleitet mit Spring.
- **Bottom-Sheet** `.sheet`: von unten, Radius oben 28 px, Griff-Balken, Overlay mit Blur, per Wischen nach unten schließbar, Fokus-Falle, ESC schließt. Desktop ≥ 960 px: zentriertes Modal (max. 560 px).
- **Toast**: oben mittig (Mobile) bzw. unten rechts (Desktop), Pill, Icon + Text + optional „Rückgängig“, gleitet rein, verschwindet nach 3,5 s.
- **Ring** `.ring`: SVG-Kreis, Stroke 12 px, runde Enden, animiert über `stroke-dashoffset`. Überschreitung > 100 % wird als zweite Runde in `--warning` dargestellt.
- **Progress-Bar**: 8 px, rund, Füllung animiert.
- **Skeleton**: `--surface-2` mit Shimmer-Verlauf.
- **Empty State**: 72 px Emoji mit sanftem Schweben, Titel, Text, Button.
- **Badge**: kleine Pill (12 px Schrift) in Farbvarianten.
- **Tab-Bar / Sidebar**: siehe 17.13.

### 18.5 Hintergrund
Hinter allen Screens 2–3 große, stark geblurte (`filter: blur(60px)`) Farbkreise in `--primary-100` und `--accent-50`, die sich sehr langsam bewegen (40–60 s Loop). Dezent, nie ablenkend. Bei `prefers-reduced-motion` stehen sie still.

---

## 19. Animationen (`css/animations.css` + `core/ui.js`)

- **Screenwechsel:** View Transitions API (`::view-transition-old/new(root)` mit Fade + 12 px Slide, 280 ms, `--ease-out`). Fallback: Klasse `.view-enter` mit gleichem Effekt.
- **Stagger:** Elemente mit `[data-stagger]` bekommen per `mount()` eine CSS-Variable `--i` (0, 1, 2 …) und blenden mit `animation-delay: calc(var(--i) * 45ms)` ein (Fade + 8 px nach oben + leichte Skalierung von .98). Maximal 12 Elemente gestaffelt, danach ohne Verzögerung.
- **Press-Feedback:** alle interaktiven Elemente `:active { transform: scale(.96) }` mit `--d-fast`.
- **Ripple:** `ui.ripple(event)` erzeugt einen Kreis ab Klickposition, der sich ausbreitet und verblasst.
- **Zahlen hochzählen:** `ui.countUp(el, from, to, duration)` mit `requestAnimationFrame` und Ease-out.
- **Ringe:** zeichnen sich beim ersten Anzeigen von 0 bis Wert (900 ms, `--ease-out`).
- **Fly-to:** `ui.flyTo(sourceEl, targetEl, emoji)` (Web Animations API) lässt ein Emoji in einer Bogenkurve zum Tab „Liste“ fliegen, der Tab-Badge macht danach einen Bounce.
- **Checkbox-Haken:** SVG-Pfad zeichnet sich (`stroke-dasharray`).
- **Konfetti:** `ui.confetti()` eigene Canvas-Implementierung (ca. 120 Partikel in Grün, Mint, Pfirsich, Gelb, runde und eckige Formen, Schwerkraft, 2,5 s), ohne Library.
- **Sheet:** gleitet mit `--ease-spring` rein, Overlay blendet ein.
- **Shake** bei Formularfehlern (300 ms).
- **Haptik:** `ui.haptic('light' | 'success' | 'error')` über `navigator.vibrate`, wenn vorhanden.
- **Reduced Motion:** Bei `prefers-reduced-motion: reduce` **oder** Einstellung „Animationen reduzieren“ (Klasse `.reduce-motion` am `<html>`) werden alle Bewegungen auf simple Fades ≤ 150 ms reduziert, Konfetti und Blobs sind aus.

---

## 20. Qualität, Barrierefreiheit und Selbsttest

### 20.1 Barrierefreiheit
- Semantisches HTML (`button` für Aktionen, `a` für Navigation, `label` für Felder, `fieldset/legend` für Gruppen).
- Alle Icon-Buttons haben `aria-label`. Chips/Kacheln sind `button` mit `aria-pressed`. Tabs mit `role="tablist"`.
- Sichtbarer Fokusring (`:focus-visible`, 3 px `--primary-100` + `--primary`).
- Kontrast mindestens 4,5:1 für Text.
- Touch-Ziele mindestens 44×44 px.
- Toasts in einer `aria-live="polite"`-Region.

### 20.2 Performance
- Keine Layout-Animationen auf `width/height/top/left`, nur `transform` und `opacity` (Ausnahme: Progress-Bars dürfen `transform: scaleX` nutzen).
- Engine-Berechnung für 74 Rezepte muss < 30 ms dauern. Nährwerte pro Rezept+Portion werden per `Map` gecacht.
- Suchfelder mit 150 ms Debounce.

### 20.3 PWA
`manifest.json` mit `name: "Healthly"`, `short_name: "Healthly"`, `display: "standalone"`, `theme_color: "#2F9E62"`, `background_color: "#F4F8F5"`, Icon `icons/icon.svg` (`sizes: "any"`, `purpose: "any maskable"`). In `index.html`: `theme-color`-Meta für Light und Dark, `apple-mobile-web-app-capable`, `viewport-fit=cover`. **Kein** Service Worker (macht der Backend-Entwickler später).

### 20.4 Selbsttest (`js/dev/selftest.js`)
Wird in `app.js` nur bei `?dev=1` dynamisch importiert. Gibt Ergebnisse per `console.group`/`console.table` aus und zeigt ein kleines Badge „Selbsttest: 0 Fehler“ bzw. „Selbsttest: 3 Fehler“ unten links.

Prüft:
1. Alle Zutat-IDs eindeutig, alle Pflichtfelder vorhanden, Plausibilitätsregel aus 7.3 für jede Zutat.
2. Alle Rezept-IDs eindeutig, jede `ing` existiert, jede `unit` ist `g`, `ml` oder in `units` der Zutat vorhanden, jede `swaps.from` ist im Rezept, jede `swaps.to` existiert, jedes `ings` in Schritten existiert im Rezept.
3. Jede Portion zwischen 80 und 1100 kcal.
4. Die Mindestanzahlen aus 10.2 (pro Mahlzeit, vegetarisch, vegan, keto, glutenfrei usw.) sind erfüllt.
5. Engine: Vegan-Profil bekommt nie ein Rezept mit tierischen Pflichtzutaten (nach Swaps). Gluten-Allergie bekommt nie Gluten. `max_time: 15` liefert nur Rezepte ≤ 15 Min. `only_pantry` liefert nur 100 % Match. Abneigung `hate` taucht nie auf.
6. Planer: Beispielprofil (männlich, 30 J., 180 cm, 80 kg, moderate, lose 0,5) → 7 Tage gefüllt, jeder Tag innerhalb ±15 % der Ziel-kcal.
7. `calcTargets` für das Beispielprofil liefert ca. 2.210 kcal (BMR 1780 · 1,55 = 2759 − 550 = 2209 → gerundet 2210; Toleranz ±30).

---

## 21. Lieferplan in Phasen

Du lieferst in **9 Phasen**. Jede Phase ist eine eigene Antwort. Am Ende jeder Phase schreibst du genau:
`✅ PHASE X FERTIG – Dateien: <Liste>. Schreibe "weiter" für Phase X+1.`
Wenn innerhalb einer Phase der Platz nicht reicht: nach einer **vollständigen** Datei aufhören und `⏸ FORTSETZUNG FOLGT – schreibe "weiter"` schreiben. Danach machst du genau an dieser Stelle weiter.

Jede Datei als eigener Codeblock, darüber eine Zeile mit dem Pfad: `### /js/core/dom.js`

| Phase | Dateien |
|---|---|
| 1 | `index.html`, `manifest.json`, `icons/icon.svg`, `css/tokens.css`, `css/base.css`, `css/animations.css` |
| 2 | `css/components.css`, `css/screens.css` |
| 3 | `js/core/dom.js`, `store.js`, `router.js`, `ui.js`, `icons.js`, `format.js`, `theme.js`, `js/i18n/de.js` |
| 4 | `js/data/reference.js`, `js/data/ingredients.js` (alle ≥ 180 Zutaten) |
| 5 | `js/data/recipes-1.js` (40 Rezepte), `js/data/recipes.js` |
| 6 | `js/data/recipes-2.js` (34 Rezepte) |
| 7 | `js/logic/units.js`, `nutrition.js`, `diet.js`, `engine.js`, `planner.js`, `shopping.js`, `leftovers.js`, `taste.js`, `js/api.js` |
| 8 | `js/app.js`, `js/screens/welcome.js`, `auth.js`, `onboarding.js`, `home.js`, `discover.js`, `recipe.js` |
| 9 | `js/screens/cook.js`, `pantry.js`, `shopping.js`, `plan.js`, `progress.js`, `profile.js`, `js/dev/selftest.js` |

Nach Phase 9 lieferst du zusätzlich einen **Abschlussbericht**:
1. Liste aller `TODO SUPABASE`/`TODO NETLIFY`-Stellen (Datei + Funktion + 1 Satz).
2. Tabelle mit den tatsächlichen Rezeptzahlen je Kategorie aus 10.2 (selbst gezählt).
3. Bekannte Einschränkungen (ehrlich, max. 5 Punkte).

---

## 22. AUFTRAG

Auf Basis aller Informationen oben:

1. Bestätige in **maximal 5 Sätzen**, dass du die Spezifikation verstanden hast, und nenne die 3 Punkte, die du für am schwierigsten hältst und wie du sie löst.
2. Beginne **direkt in derselben Antwort** mit **Phase 1**.
3. Halte dich an die Regeln aus Abschnitt 0 und 2: vollständige Dateien, keine Auslassungen, keine Frameworks, keine erfundenen Backends, exakte Namen.
