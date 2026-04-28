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
- **Admin-E-Mail (Lennert):** `lennert.bewernick@gmail.com` — wird für Admin-Gates im Code und Benachrichtigungs-E-Mails genutzt. `lb@justclose.de` gehört NICHT in diesen Scope (justclose.de ist eine private Domain außerhalb von Das Portal)
- **Kontakt-E-Mail für Nutzer:** `hallo@das-portal.online`
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

### Git-Workflow (Pflicht nach jeder Implementierung)
Nach dem Abschluss jeder Code-Task **muss** der Feature-Branch in `main` gemergt und gepusht werden, bevor das Issue auf `done` gesetzt wird:
```bash
git checkout main && git pull origin main
git merge --no-ff feat/<branch> -m "chore: merge feat/<branch> → main"
git push origin main
```
Vercel deployt automatisch bei jedem Push auf `main`. Den Merge-Commit im Issue-Kommentar erwähnen. Begründung: [LBV-195] — Fixes ohne Merge auf main landen nie in Production.

### Code-Stil
- Server Components als Default — `"use client"` nur wenn nötig (Interaktivität, Browser APIs)
- `useActionState` für Formulare (React 19 Pattern, nicht `useFormState`)
- Supabase Queries immer mit `.eq("is_public", true).eq("status", "published")` für öffentliche Events
- Immer RLS-Policies für neue Tabellen anlegen
- `next/image` für alle Bilder (nicht `<img>`)
- Dynamic imports mit `{ ssr: false }` für Client-only Libraries (z.B. Leaflet)

### Auth
- Auth ist via Supabase Magic-Link **aktiv**, aber **nicht öffentlich beworben**: kein Anmelde-Link in der Navbar.
- Eintrittspunkte sind nur:
  1. "Profil beanspruchen"-CTA auf `/hosts/[slug]` (für unclaimed Profile) → `/auth?mode=claim&host=<slug>`
  2. Claim-Token-E-Mails für Drittparty-Submits → `/claim/[token]`
- `/konto/*` und `/auth/*` sind erreichbar, werden aber nicht in der Navbar verlinkt
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

### Layout darf kein `alternates.canonical` setzen
`app/layout.tsx` darf **kein** `alternates: { canonical: "..." }` setzen. In Next.js App Router erben alle Child-Pages, die kein eigenes `alternates` definieren, den Wert vom Layout — das bedeutet alle Seiten ohne explizites Canonical bekommen die Homepage-URL. Regel: Jede öffentlich indexierbare Page-Datei setzt ihr eigenes `alternates: { canonical: "https://das-portal.online/..." }`. Neue Seiten ohne Canonical werden Google als Duplikate der Homepage gemeldet.

### Robots.txt / Sitemap / Layout: Keine dynamischen URLs auf Modul-Ebene
`getSiteUrl()` auf Modul-Ebene in robots.ts/sitemap.ts/layout.tsx kann fehlschlagen wenn Env-Vars zur Runtime nicht verfügbar sind. Fallback ist `https://example.com` — das führt zu falschen Canonical-URLs in GSC und verhindert Indexierung. Lösung: URL **immer** hardcoden auf `https://das-portal.online`.

**Betroffene Dateien:** `app/robots.ts`, `app/sitemap.ts`, `app/layout.tsx`, `app/events/[slug]/page.tsx`, `app/hosts/[slug]/page.tsx`, `app/locations/[slug]/page.tsx` — alle nutzen jetzt absolute, hardkodierte URLs.

Außerdem: Domain-Redirect muss korrekt konfiguriert sein (das-portal.online = Primary, www → 308 Redirect). Ein 307 Redirect auf der Root-Domain führt dazu, dass Google robots.txt als "nicht erreichbar" meldet und die Seite nicht indexiert.

### GSC: Eingereichte Sitemap-URL muss canonical sein (LBV-215)
*Live-Sitemap-Content sauber* ≠ *eingereichte Sitemap-URL sauber*. Wir hatten 1.403 saubere non-www-URLs in `https://das-portal.online/sitemap.xml`, aber in der GSC-Property war die Sitemap unter `https://www.das-portal.online/sitemap.xml` eingereicht. Folge: GSC führte 165 URLs als „Gefunden – zurzeit nicht indexiert" unter dem WWW-Host, obwohl der Inhalt der Sitemap selbst sauber war. Der 308-Redirect auf das non-www-Pendant reicht nicht — GSC kategorisiert nach der **submit-URL**, nicht nach dem Endziel der Redirect-Chain.

Regel: Wenn das Indexing-Problem nach Code-Audit weiterhin besteht, immer in **GSC → Sitemaps** prüfen, welche URLs als Sitemap eingereicht sind, und ob diese URL selbst canonical ist. Beim Audit nicht nur den Live-Output von `/sitemap.xml` checken.

### Navbar-Beschreibung aktuell
Navbar zeigt: Logo | Veranstaltungen | Räume | Raumhalter | Eintragen (orange Button). Auth ist nicht in der Navbar verlinkt — Eintrittspunkte siehe Regel-Abschnitt "Auth".

### Event-Duplikate aus Telegram-Import: Titel-Normalisierung nötig
Telegram-Events werden teilweise mehrfach importiert mit minimal abweichenden Titeln (Emoji-Varianten wie "TANTRA REBIRTH" vs "TANTRA REBIRTH 🌱", Satzzeichen-Unterschiede). Die `deduplicateEvents()`-Funktion in `lib/event-utils.ts` normalisiert deshalb Titel vor dem Key-Vergleich: Emoji stripping via `\p{Extended_Pictographic}`, Dash-Vereinheitlichung, Lowercase. Nie inline-Dedup-Logik schreiben — immer `deduplicateEvents()` aus `event-utils.ts` nutzen.

### locations.event_count ist ein stale-Cache-Feld
Das `event_count`-Feld auf der `locations`-Tabelle wird nicht automatisch aktualisiert und ist ggf. veraltet. Für Live-Counts immer direkt `events` abfragen. Feld in der UI nicht als verlässliche Quelle nutzen.

### 56% der Hamburg-Events ohne location_id
Events werden aus Telegram mit `address`-Feld importiert, aber ohne `location_id`-Zuweisung. Venue-Pages (`/locations/[slug]`) zeigen nur Events mit passendem `location_id` → viele echte Venue-Events fehlen. Für Location-Count-Anzeigen daher ggf. nach `address ILIKE '%venue_name%'` zusätzlich filtern oder `location_name` matchen.

### React Purity Rule: Kein `Date.now()` im Render-Pfad
Mit Next.js 16 + React 19 schlägt ESLint (`react-hooks/purity`) fehl, wenn `Date.now()` direkt in Komponenten-Renderpfaden verwendet wird (z. B. `app/claim/[token]/page.tsx`). Für Zeitvergleiche im Renderpfad stattdessen `new Date().getTime()` oder noch besser request-/datengetriebene Werte nutzen.

### Claim Auto-Path: `claim_email` muss explizit selektiert werden
Im Token-Claim-Flow (`app/claim/[token]/actions.ts`) darf `claim_email` nicht im `select(...)` fehlen. Wenn das Feld nicht geladen wird, bleibt `storedClaimEmail` immer `null` und der Magic-Link-Auto-Path wird stillschweigend übersprungen.

### Events-List-Query: Fallback-Pattern wenn DB-Migration aussteht
Wenn Code deployed wird, der eine neue Spalte in `hosts(...)` oder `events(...)` selektiert (z.B. `is_featured`), aber die DB-Migration (ALTER TABLE) noch nicht auf Production angewendet wurde, schlägt die PostgREST-Query fehl und zeigt die Error-Banner "Events konnten gerade nicht geladen werden". Die Error-Variable ist truthy, die Events-Liste bleibt leer.
Lösung: `buildQuery(hostsSelect)`-Helper mit Fallback: erst `hosts(name, slug, is_featured)` versuchen; bei Fehler `console.error` mit Code+Message loggen und ohne `is_featured` wiederholen. Featured-Sorting entfällt im Fallback, aber Events sind sichtbar. Immer `migration_featured_listing.sql` in Supabase SQL Editor ausführen, bevor Code der `is_featured` benötigt deployed wird.

### AuthForm Mode-Sync: Kein `setState` im Render oder Sync-Effect
In `components/AuthForm.tsx` führen Mode-Syncs via `setState` im Renderpfad (und auch naive Sync-Effects) zu instabilen Zuständen und ESLint-Fehlern (`react-hooks/set-state-in-effect`). Für Claim/Auth-Modi stattdessen URL-forcierte Modus-Ableitung + separaten lokalen Tab-State nutzen.

### Auth: Niemals `signInWithOtp()` für Magic Links nutzen — immer `admin.generateLink()` + Resend
`supabase.auth.signInWithOtp()` lässt Supabase eine eigene E-Mail schicken (englisch, ungebrandtet, "Confirm Your Signup"). Stattdessen: `getSupabaseAdminClient().auth.admin.generateLink({ type: "magiclink", email, options: { redirectTo } })` → gibt `data.properties.action_link` zurück → diesen Link per Resend in branded E-Mail verschicken (`sendMagicLinkEmail` bzw. `sendClaimMagicLinkEmail` aus `lib/email.ts`). So bleibt volle Kontrolle über Inhalt, Sprache und Absender.

### Auth-Callback: `@supabase/ssr` + `admin.generateLink()` = Implicit-Flow-Konflikt
`createBrowserClient()` aus `@supabase/ssr` initialisiert mit `flowType: 'pkce'`. Wenn `_initialize()` einen Implicit-Flow-Hash (`#access_token=…`) erkennt, wirft es intern `AuthPKCEGrantCodeExchangeError` und speichert die Session NICHT. `getSession()` gibt anschließend null zurück → Login-Loop mit `?error=no_session`.

`admin.generateLink({ type: "magiclink" })` produziert aber genau dieses Implicit-Flow-Format.

Lösung in `app/auth/callback/page.tsx`: Vor `getSession()` den Hash-Fragment manuell prüfen — wenn `access_token` enthalten, `supabase.auth.setSession({ access_token, refresh_token })` direkt aufrufen. Erst wenn kein Hash vorhanden ist, zu `getSession()` fallen.

### Resend-Client: Kein Top-Level `new Resend(...)` — lazy initialisieren
`const resend = new Resend(process.env.RESEND_API_KEY)` auf Modul-Ebene in `lib/email.ts` crasht den Build, wenn `RESEND_API_KEY` zur Build-Zeit nicht gesetzt ist. Lösung: lazy getter `getResend()` — identisches Muster wie `getSupabaseAdminClient()` in `lib/supabase-admin.ts`.

### Auth-Middleware: `createBrowserClient` muss `@supabase/ssr` nutzen — nicht vanilla `supabase-js`
Vanilla `createClient()` aus `@supabase/supabase-js` speichert die Session in **localStorage**. Die Middleware liest aber Cookies. Der manuelle `session-sync`-Cookie läuft nach `expiresIn` (~1h) ab; Supabase-Auto-Refresh erneuert nur localStorage, nicht den Cookie. Folge: Nach ~1h werden alle `/konto/*`-Zugriffe blockiert, obwohl die Session noch gültig ist.
Lösung (in `lib/supabase.ts`): `createBrowserClient` auf `createBrowserClient` aus `@supabase/ssr` umstellen — dieser speichert die Session automatisch in Cookies und hält sie bei Auto-Refresh aktuell. In `middleware.ts`: `createServerClient` aus `@supabase/ssr` mit Cookie-Adapter + `supabase.auth.getUser()` nutzen statt einen manuellen Cookie zu lesen.

### Supabase `admin.generateLink()` ignoriert `redirectTo` wenn URL nicht in Allowlist
Supabase fällt beim `redirectTo`-Argument in `admin.generateLink()` stillschweigend auf die hinterlegte **Site URL** zurück, wenn der übergebene Wert nicht in den **Redirect URLs** des Projekts steht. In Development-Projekten ist die Site URL oft `localhost:3000` — dann enthält jeder generierte Magic-Link einen `localhost`-Link.
- **Kurzfristig:** `patchActionLinkRedirect()` in `lib/supabase-admin.ts` patcht `localhost` im `redirect_to`-Parameter der `action_link`-URL vor dem Versand.
- **Dauerhaft:** Supabase Dashboard → Authentication → URL Configuration: **Site URL** = `https://das-portal.online`, **Redirect URLs** = `https://das-portal.online/auth/callback` + `https://das-portal.online/auth/callback?*`.

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

### Auth-Middleware: `createBrowserClient` muss `@supabase/ssr` nutzen — nicht vanilla `supabase-js`
`createBrowserClient()` aus `@supabase/ssr` initialisiert mit `flowType: 'pkce'` und speichert Session in Cookies. Die Middleware liest `sb-<ref>-auth-token` Cookie für `getUser()`. Wenn der Browser-Client diese Cookies nicht setzt (z.B. weil `setSession()` fehlschlägt), redirectet die Middleware immer auf `/auth`.

**Lösung:** `session-sync` API Route setzt BEIDE Cookie-Typen server-seitig:
1. `@supabase/ssr` Format-Cookies (`sb-<ref>-auth-token`) via `createServerClient` + `setSession()` → collected via `setAll` callback → auf den NextResponse gesetzt
2. `portal-access-token` custom cookie via `setAuthSessionCookies()`

Der Browser-Callback übergibt nur die Raw-Tokens — keine `createBrowserClient().setSession()` mehr für den Implicit-Flow. Alles läuft durch einen Server-API-Call.
