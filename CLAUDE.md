# CLAUDE.md — Das Portal

> Dieses File wird von Claude Code automatisch gelesen. Es enthält Projekt-Kontext, Regeln und Lessons Learned.

## ⚠️ SELBST-UPDATE-PFLICHT

**Wenn du einen Fehler machst und korrigiert wirst, oder selbst einen Fehler entdeckst und behebst:**
1. Trage den Fehler und die Lösung in den Abschnitt "Lessons Learned" unten ein
2. Falls eine neue Regel nötig ist, ergänze sie im passenden Regel-Abschnitt
3. Das gilt für JEDEN Fehler — egal ob groß oder klein

**Das ist keine optionale Empfehlung — tu es einfach jedes Mal.**

---

## Projekt

**Das Portal** — Plattform für ganzheitliche Anbieter (Coaches, Heiler:innen, Facilitators) im DACH-Raum. Ursprung in Schleswig-Holstein & Hamburg, jetzt überregional. Aktuell: Pre-Launch mit Landing Page + Warteliste + Event-Listing.

- **Domain:** das-portal.online (www.das-portal.online)
- **Repo:** lennertbewernick/portal
- **Hosting:** Vercel
- **DB/Auth:** Supabase (Projekt-ID: fjyaolxtipqtcvvclegl)

## Tech-Stack

- Next.js 16 (App Router)
- React 19
- TypeScript (strict)
- Tailwind CSS v4 (NICHT v3 — Syntax ist anders!)
- Supabase (DB + Auth + RLS)
- Sentry (Error Tracking)
- date-fns + date-fns-tz für Datums-Formatierung

## Tailwind v4 Regeln

⚠️ **Tailwind v4 nutzt eine andere Syntax als v3!**

- Kein `tailwind.config.js` — Konfiguration passiert in `globals.css` via `@theme inline {}`
- Design-Tokens sind als CSS Custom Properties definiert (siehe `globals.css`)
- Gradient-Syntax: `bg-linear-to-br` statt `bg-gradient-to-br`
- Farben referenzieren: `text-text-primary`, `bg-bg-card`, `border-border` etc.
- **Keine hardcodierten Farben** — immer die definierten Tokens nutzen

### Design-Tokens (definiert in globals.css)

```
bg-primary: #faf6f1      (Hintergrund)
bg-secondary: #f0e8de    (Sekundärer Hintergrund)
bg-card: #ffffff          (Karten)
text-primary: #2c2418     (Haupttext)
text-secondary: #6b5b4e   (Sekundärtext)
text-muted: #9a8b7a       (Gedämpfter Text)
accent-primary: #b5651d   (CTA, Buttons — warmes Gold/Braun)
accent-secondary: #7b6d4e (Sekundärer Akzent)
accent-sage: #8b9d77      (Grüner Akzent)
border: #e5ddd3           (Borders)
```

### Fonts

- Headings (h1–h3): `font-serif` (Baskerville/Georgia)
- Body: `font-sans` (system-ui)

## Projektstruktur

```
app/
├── page.tsx              # Landing Page (Hero + Warteliste)
├── events/
│   ├── page.tsx          # Event-Übersicht mit Filtern
│   └── [slug]/page.tsx   # Event-Detailseite
├── hosts/
│   └── [slug]/page.tsx   # Host-Profilseite
├── actions/
│   └── waitlist.ts       # Server Action: Warteliste-Eintrag
├── auth/                 # ⚠️ Existiert aber ist DEAKTIVIERT — nicht verlinken!
├── konto/                # ⚠️ Existiert aber ist DEAKTIVIERT — nicht verlinken!
├── impressum/            # TODO: Platzhalter-Daten ersetzen
├── datenschutz/          # TODO: Platzhalter-Daten ersetzen
├── kontakt/
├── layout.tsx
├── sitemap.ts
└── robots.ts
components/
├── Navbar.tsx
├── Footer.tsx
├── EventList.tsx
├── EventCard.tsx
├── EventFilters.tsx
├── WaitlistForm.tsx
└── ...
lib/
├── types.ts              # Event, Host, HostPreview Interfaces
├── supabase.ts           # Supabase Client Setup
└── event-utils.ts        # Helper (PAGE_SIZE, getCityFromAddress)
```

## Supabase DB-Schema

### events
- id, title, slug, description, start_at, end_at
- location_name, address, geo_lat, geo_lng
- cover_image_url, host_id, is_public, status, tags
- price_model, ticket_link, created_at
- source_type (default 'manual'), source_message_id

### hosts
- id, name, slug, description, website_url
- social_links, owner_id, created_at
- telegram_username, email, avatar_url

### waitlist
- id, email (unique), name, role, city, created_at
- RLS: anon kann insert, authenticated kann select

## Regeln

### Allgemein
- **Sprache:** Alle UI-Texte auf **Deutsch**
- **Branding:** Immer "Das Portal" (nicht "Portal", nicht "das Portal")
- **Region:** DACH-weit (Ursprung SH & Hamburg). SEO City Pages werden für alle Städte mit genug Events gebaut.
- **Keine Emojis in Code** — nur in UI-Texten wo sie bewusst eingesetzt werden

### Code-Stil
- Server Components als Default — `"use client"` nur wenn nötig (Interaktivität, Browser APIs)
- `useActionState` für Formulare (React 19 Pattern, nicht `useFormState`)
- Supabase Queries immer mit `.eq("is_public", true).eq("status", "published")` für öffentliche Events
- Immer RLS-Policies für neue Tabellen anlegen
- `next/image` für alle Bilder (nicht `<img>`)
- Dynamic imports mit `{ ssr: false }` für Client-only Libraries (z.B. Leaflet)

### Auth
- Auth ist aktuell **deaktiviert**. Keine Links zu /auth/* oder /konto in der UI.
- Auth-Code nicht löschen — wird später überarbeitet und wieder aktiviert
- Navbar zeigt: Logo | Veranstaltungen | Räume | Raumhalter | Eintragen (orange CTA)
- URL-Struktur ist Englisch: /events, /locations, /hosts, /einreichen
- /anbieter redirected 308 auf /hosts (Legacy-URL)

### SEO
- Jede Seite braucht `export const metadata: Metadata`
- Sitemap wird automatisch generiert (app/sitemap.ts)
- Strukturierte Daten (JSON-LD) für Events einbauen
- Canonical URLs nutzen
- **SEO Content Framework:** `SEO-CONTENT-FRAMEWORK.md` im Repo-Root — 6-Fragen-Matrix, Awareness-Stufen, Personas, Motive, Stil-Regeln. VOR jeder neuen City/Kategorie Page lesen.

### Performance
- `priority` auf LCP-Images (Hero)
- Lazy Loading für Below-the-fold Content
- Leaflet/Maps immer mit dynamic import (kein SSR)

## Lessons Learned

### Supabase SQL Editor Autocomplete
Wenn SQL manuell im Supabase SQL Editor eingegeben wird, ersetzt die Autocomplete `anon` durch `is_anonymous` und `authenticated` durch `authentication_method`. Workaround: Monaco Editor API nutzen (`window.monaco.editor.getModels()[last].setValue(sql)`) oder SQL als File kopieren.

### Tailwind v4 Gradients
`bg-gradient-to-br` funktioniert nicht in Tailwind v4. Richtig: `bg-linear-to-br`.

### Next.js 16 + React 19
- `searchParams` in Page-Komponenten ist ein Promise — muss mit `await` aufgelöst werden
- `useActionState` ersetzt das alte `useFormState` aus react-dom

### Build-Fehler
- SWC Binary Download kann in Sandboxes fehlschlagen (Netzwerk-Issue, kein Code-Problem)
- Immer `npm run build` nach Änderungen ausführen

### Supabase Service-Role Client
`createClient()` auf Modul-Ebene crasht den Build wenn `SUPABASE_SERVICE_ROLE_KEY` zur Build-Zeit nicht gesetzt ist. Lösung: Lazy initialization in einer Helper-Funktion (`lib/supabase-admin.ts` → `getSupabaseAdminClient()`). Client wird erst beim ersten API-Call erstellt.

### ⛔ KRITISCH: Niemals DELETE/DROP ohne explizite Bestätigung
Am 01.04.2026 wurden ALLE Events (656) und Hosts (297) durch ein unbestätigtes `DELETE FROM events WHERE source_type = 'telegram'` gelöscht. Free Plan hat keine Backups. Daten unwiederbringlich verloren.

**REGEL: Destruktive DB-Operationen (DELETE, DROP, TRUNCATE, UPDATE auf >10 Zeilen) NIEMALS ausführen ohne:**
1. Explizite Bestätigung vom User mit konkreter Nennung was gelöscht wird ("Soll ich jetzt 656 Events löschen? Ja/Nein")
2. Vorher ein Backup/Export der betroffenen Daten erstellen
3. Bei Unsicherheit: NICHT ausführen, nachfragen

"Ja aber..." ist KEINE Bestätigung. Nur ein klares "Ja, lösch das" oder "Ja, mach den Rollback" zählt.

### Robots.txt / Sitemap: Keine dynamischen URLs auf Modul-Ebene
`getSiteUrl()` auf Modul-Ebene in robots.ts/sitemap.ts kann fehlschlagen wenn Env-Vars zur Runtime nicht verfügbar sind. Lösung: URL hardcoden auf `https://das-portal.online`. Außerdem: Domain-Redirect muss korrekt konfiguriert sein (das-portal.online = Primary, www → 308 Redirect). Ein 307 Redirect auf der Root-Domain führt dazu, dass Google robots.txt als "nicht erreichbar" meldet und die Seite nicht indexiert.

### Navbar-Beschreibung aktuell
Navbar zeigt: Logo | Veranstaltungen | Räume | Raumhalter | Eintragen (orange Button). Auth ist deaktiviert.

---

## Kontext-Dateien

Für tieferen Business-Kontext und offene Aufgaben:
- `SEO-CONTENT-FRAMEWORK.md` — Awareness-Stufen, Personas, Motive, 6-Fragen-Matrix, Content-Regeln für City/Kategorie Pages
- `PORTAL-KONTEXT.md` — Vollständiger Business-Kontext, Vision, Roadmap, Wettbewerb, Unit Economics
- `CLAUDE-CODE-MAP-CLEANUP.md` — Aktuelle Aufgaben: Map-Feature, Auth-Cleanup, Telegram, City-Slugs
- `CLAUDE-CODE-LOGO.md` — Logo-Einbau (Navbar + Hero + Favicon)
- `CLAUDE-CODE-EVENT-INTAKE.md` — Event-Intake Pipeline: Telegram → n8n → Supabase

## Rollenverteilung

- **Cowork (Claude in Desktop App):** Product Manager — erstellt Specs, Prompts, reviewt, testet via Browser
- **Claude Code (Terminal):** Entwickler — setzt Prompts um, schreibt Code, führt Build aus
- **Lennert:** Founder, macht finale Entscheidungen, liefert Business-Input
