# Claude Code Prompt — Portal V7 (Pre-Launch Fixes)

> Lies zuerst CLAUDE.md, dann dieses File. Führe `npm run build` nach jeder Task aus.

## Kontext

V6 wurde vollständig umgesetzt. Cowork hat bereits folgende Änderungen gemacht (NICHT überschreiben):
- `components/Navbar.tsx` — Desktop-Nav mit `hidden sm:flex`, Mobile via `<MobileNav />`
- `components/MobileNav.tsx` — NEU: Client Component mit Hamburger-Menü für Mobile
- `components/Footer.tsx` — Kontakt-Link entfernt
- `components/LocationInput.tsx` — "Mein Standort"-Button hinzugefügt

Diese Dateien sind bereits geändert. Bitte NICHT anfassen, außer es gibt einen Build-Fehler.

---

## Task 1: Host-Profil Dedup

**Datei:** `app/hosts/[slug]/page.tsx`

Auf der Host-Profilseite können doppelte Events erscheinen (gleicher Titel + gleiches Datum, aber verschiedene DB-Einträge durch mehrfachen Telegram-Post).

**Umsetzung:** Nach dem Supabase-Query (Zeile 72-80) Dedup-Logik einbauen:

```typescript
// Nach: const events = (eventsData || []) as Event[];
// Dedup: gleicher Titel + gleiches Startdatum → nur neuestes behalten
const seen = new Map<string, Event>();
for (const event of events) {
  const key = `${event.title}::${event.start_at}`;
  const existing = seen.get(key);
  if (!existing || new Date(event.created_at) > new Date(existing.created_at)) {
    seen.set(key, event);
  }
}
const dedupedEvents = Array.from(seen.values());
```

Dann `dedupedEvents` statt `events` im JSX nutzen (Zeilen 195, 208, 214, 216).

---

## Task 2: Vergangene Events auf Host-Profil zeigen

**Datei:** `app/hosts/[slug]/page.tsx`

Aktuell werden auf der Host-Profilseite nur zukünftige Events angezeigt (`.gte("start_at", ...)`). Anbieter:innen sollen aber auch ihre vergangenen Events zeigen können — das baut Vertrauen auf.

**Umsetzung:**

1. **Zwei Queries:** Einen für kommende Events (wie bisher, `.gte("start_at", now)`), einen für vergangene (`.lt("start_at", now)`, `.order("start_at", { ascending: false })`, `limit(6)`).

2. **Zwei Sektionen im JSX:**
   - "Kommende Events von {name}" — wie bisher
   - "Vergangene Events" — nur anzeigen wenn es welche gibt, etwas dezenter gestaltet (z.B. `text-text-muted` für die Section-Headline, eventuell leicht reduzierte Opacity auf den Cards)

3. **Beide Queries dedupen** (wie in Task 1 beschrieben).

---

## Task 3: Vergangene Events über Datumsfilter auf Events-Seite findbar machen

**Datei:** `app/events/page.tsx`

Aktuell filtert die Events-Seite vergangene Events komplett raus. Wenn ein User aber im Datumsfilter ein **vergangenes "Von"-Datum** eingibt, sollen vergangene Events angezeigt werden.

**Umsetzung:**

- Wenn der User ein "Von"-Datum setzt das in der Vergangenheit liegt → `startFrom` auf dieses Datum setzen (statt `new Date().toISOString()`)
- Wenn der User KEIN "Von"-Datum setzt → weiterhin nur zukünftige Events (Default wie bisher)
- Das betrifft die Variable `startFrom` in der Query-Logik. Prüfe ob das bereits so funktioniert, und falls nicht, passe es an.

---

## Task 4: Konto-Seite Dedup

**Datei:** `app/konto/page.tsx`

Gleiche Dedup-Logik wie Task 1 für die Events auf der Konto-Seite (Zeile 36-47). Nach dem Query dedupen.

---

## Task 5: Build verifizieren

`npm run build` ausführen. Sicherstellen:
- Keine TypeScript-Fehler
- Navbar importiert MobileNav korrekt
- Alle Seiten bauen erfolgreich

---

## REGELN

- Alle UI-Texte auf Deutsch
- KEINE Referenzen zu JustClose — Das Portal ist ein eigenständiges Projekt
- "Anbieter:in" als Bezeichnung (nicht "Host", nicht "Facilitator")
- `next/image` für Bilder, `"use client"` nur wenn nötig
- Design-Tokens aus globals.css nutzen (keine hardcodierten Farben)
