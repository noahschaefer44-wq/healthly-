# Healthly

Persönlicher Koch- und Ernährungsassistent als statische Web-App (HTML, CSS, JavaScript, kein Build-Schritt).

## Starten
Lokal: `python3 -m http.server 8000` im Ordner starten und `http://localhost:8000` öffnen.
Auf Netlify: Repo verbinden, Publish-Ordner `.`, kein Build-Befehl (siehe `netlify.toml`).
Mit `?dev=1` läuft ein Selbsttest (Daten und Logik), das Ergebnis erscheint unten links.

## Aufbau
- `js/data-ingredients.js`, `js/data-recipes.js`: 126 Zutaten mit Nährwerten und 94 Rezepte
- `js/logic.js`: Ziele, Nährwerte, Diät-Filter, Vorschläge, Wochenplan, Einkauf, Reste
- `js/api.js`: **einzige** Datenschicht (aktuell localStorage). Später gegen Supabase tauschen (`TODO SUPABASE`) und KI-Vorschläge über Netlify Functions (`TODO NETLIFY`)
- `js/ui.js`, `js/screens1-3.js`, `js/app.js`: Oberfläche und Router

Richtwerte nach DGE bzw. gängigen Formeln, keine medizinische Beratung.
