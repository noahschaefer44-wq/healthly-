# So benutzt du die Gemini-Anleitung

## Einrichten
1. Öffne **Google AI Studio** (aistudio.google.com). Das ist besser als die Gemini-App, weil Canvas dort gerne alles in eine einzige Datei packt und Dateien neu schreibt.
2. Wähle das neueste **Gemini Pro**-Modell. Stelle „Thinking“ auf hoch und „Max output tokens“ auf das Maximum. Temperatur bleibt auf dem Standardwert.
3. Kopiere den **kompletten** Inhalt von `docs/gemini-prompt.md` als erste Nachricht hinein und schicke ihn ab.

## Ablauf
- Gemini bestätigt kurz und liefert **Phase 1**.
- Danach schickst du jedes Mal den Inhalt von `docs/gemini-weiter.md` (beginnt mit „weiter“). Die Regeln stehen absichtlich jedes Mal mit dabei, weil Gemini sie in langen Chats sonst langsam vergisst.
- Insgesamt sind es 9 Phasen, eventuell mit ein paar zusätzlichen „weiter“, wenn eine Phase zu lang ist.

## Wenn etwas schiefgeht
- **Gemini kürzt ab** („// weitere Rezepte…“): antworte mit
  `Die Datei <Pfad> ist unvollständig. Gib sie komplett neu aus, ohne Auslassungen.`
- **Gemini benennt etwas um** oder importiert etwas, das es nicht gibt: antworte mit
  `In <Datei> nutzt du <Name>, laut Spezifikation heißt es <Name>. Gib die Datei korrigiert komplett neu aus.`
- **Chat wird sehr lang und Gemini wird ungenau:** neuen Chat starten, wieder den kompletten Prompt schicken und dazu schreiben:
  `Phase 1 bis X sind fertig. Hier sind die bisherigen Dateien: <einfügen>. Mach mit Phase X+1 weiter.`

## Dateien speichern
Leg jede Datei genau unter dem Pfad ab, den Gemini darüber schreibt (z. B. `js/core/dom.js`), und zwar im Hauptordner dieses Repos. Wenn alles da ist, sag Claude Bescheid. Claude testet dann alles (inklusive Selbsttest mit `?dev=1`), repariert Fehler und baut Supabase und Netlify an.

**Hinweis:** Die App nutzt ES-Module und startet deshalb **nicht** per Doppelklick auf `index.html`. Zum Testen brauchst du einen kleinen lokalen Server oder Netlify Drop. Das richtet Claude danach ein.
