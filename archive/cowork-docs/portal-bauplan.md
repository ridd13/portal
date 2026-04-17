# Portal MVP — Bauplan für Claude Code

## Projektübersicht

Event-Plattform für spirituelle, ganzheitliche und Wellness-Events (Tanz, Tantra, Meditation, Coaching etc.) in deutschen Städten. Ähnlich wie [nils-liebt-dich.de](https://nils-liebt-dich.de), aber mit eigenem Design und API-first Ansatz.

**Stack:** Next.js (App Router) + Supabase + Vercel
**Design:** Erdig, warm, spirituell (NICHT dark theme) — Naturfarben, warme Töne

---

## 1. Supabase-Setup (bereits vorhanden)

Projekt-ID: `fjyaolxtipqtcvvclegl`

### Tabelle: events
| Spalte | Typ | Pflicht | Beschreibung |
|--------|-----|---------|--------------|
| id | uuid | PK | Primary Key |
| title | text | NOT NULL | Event-Titel |
| slug | text | NOT NULL | URL-Slug |
| description | text | - | Beschreibungstext |
| start_at | timestamptz | NOT NULL | Startdatum/-zeit |
| end_at | timestamptz | - | Enddatum/-zeit |
| location_name | text | - | Name des Veranstaltungsorts |
| address | text | - | Adresse (Straße, Stadt etc.) |
| geo_lat | double precision | - | Breitengrad |
| geo_lng | double precision | - | Längengrad |
| cover_image_url | text | - | Bild-URL |
| host_id | uuid | FK → hosts | Veranstalter |
| is_public | boolean | - | Öffentlich sichtbar? |
| status | enum | - | Status (draft, published, etc.) |
| tags | text[] | - | Kategorien/Tags als Array |
| price_model | text | - | Preismodell (kostenlos, Spende, fest) |
| ticket_link | text | - | Externer Ticket-Link |
| created_at | timestamptz | - | Erstellt am |

### Tabelle: hosts
| Spalte | Typ | Pflicht | Beschreibung |
|--------|-----|---------|--------------|
| id | uuid | PK | Primary Key |
| name | text | NOT NULL | Anbieter-Name |
| slug | text | - | URL-Slug |
| description | text | - | Beschreibung |
| website_url | text | - | Website |
| social_links | jsonb | - | Social Media Links |
| owner_id | uuid | FK → profiles | Besitzer |
| created_at | timestamptz | - | Erstellt am |

### Tabelle: profiles
| Spalte | Typ | Pflicht | Beschreibung |
|--------|-----|---------|--------------|
| id | uuid | PK | Primary Key |
| username | text | - | Benutzername |
| full_name | text | - | Vollständiger Name |
| avatar_url | text | - | Profilbild |
| is_admin | boolean | - | Admin-Rechte |
| created_at | timestamptz | - | Erstellt am |

### Tabelle: event_intake (Backend/n8n — nicht im Frontend)
Rohdaten aus Telegram-Bot-Intake-Prozess. Wird im Frontend NICHT angezeigt.

---

## 2. Supabase-Konfiguration

### RLS (Row Level Security) für öffentliche Lesezugriffe

```sql
-- Events: Öffentlich lesbar wenn is_public = true UND status = 'published'
CREATE POLICY "Events sind öffentlich lesbar"
ON events FOR SELECT
USING (is_public = true AND status = 'published');

-- Hosts: Öffentlich lesbar
CREATE POLICY "Hosts sind öffentlich lesbar"
ON hosts FOR SELECT
USING (true);
```

### Supabase Anonymous Key
Für den Frontend-Zugriff wird nur der `anon` Key benötigt (öffentlich, read-only durch RLS).

---

## 3. Next.js App-Struktur

```
portal/
├── app/
│   ├── layout.tsx          # Root Layout mit Fonts, Meta, Navigation
│   ├── page.tsx            # Startseite = Event-Übersicht
│   ├── events/
│   │   └── [slug]/
│   │       └── page.tsx    # Event-Detailseite
│   └── hosts/
│       └── [slug]/
│           └── page.tsx    # Host-Profilseite (optional für MVP)
├── components/
│   ├── EventCard.tsx       # Event-Karte für die Übersicht
│   ├── EventList.tsx       # Grid/Liste mit Pagination
│   ├── EventFilters.tsx    # Filter-Leiste (Tags, Stadt, Datum)
│   ├── Navbar.tsx          # Navigation oben
│   └── Footer.tsx          # Footer mit Impressum etc.
├── lib/
│   ├── supabase.ts         # Supabase Client Setup
│   └── types.ts            # TypeScript Types aus dem DB-Schema
├── public/
│   └── ...                 # Statische Assets
├── .env.local              # Supabase URL + Anon Key
├── tailwind.config.ts
├── next.config.ts
└── package.json
```

---

## 4. Design-System

### Farbpalette (erdig, spirituell, warm)

```css
:root {
  --bg-primary: #FAF6F1;        /* Warmes Creme/Sand */
  --bg-secondary: #F0E8DE;      /* Helles Beige */
  --bg-card: #FFFFFF;            /* Weiße Karten */
  --text-primary: #2C2418;       /* Dunkles Braun */
  --text-secondary: #6B5B4E;    /* Mittleres Braun */
  --text-muted: #9A8B7A;        /* Helles Braun */
  --accent-primary: #B5651D;     /* Warmes Terracotta/Orange */
  --accent-secondary: #7B6D4E;  /* Olivgrün-Braun */
  --accent-sage: #8B9D77;       /* Salbeigrün */
  --border: #E5DDD3;            /* Sanfter Rahmen */
}
```

### Typografie
- Headlines: Serif-Font (z.B. `Playfair Display` oder `Cormorant Garamond`)
- Body: Sans-Serif (z.B. `Inter` oder `DM Sans`)
- Beide über Google Fonts / `next/font`

### Tailwind-Config erweitern
Die Farben oben als Custom Colors in `tailwind.config.ts` definieren.

---

## 5. Seiten & Komponenten im Detail

### 5.1 Startseite (Event-Übersicht)

**Layout (angelehnt an nils-liebt-dich.de, aber heller/erdiger):**

```
┌─────────────────────────────────────────────┐
│  🌿 Portal        Events     [Registrieren] │  ← Navbar
├─────────────────────────────────────────────┤
│  [Kategorie ▼] [Region ▼]     [Suchen]     │  ← Filter-Leiste
├─────────────────────────────────────────────┤
│  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐   │
│  │ Card │  │ Card │  │ Card │  │ Card │   │  ← Event-Grid
│  │      │  │      │  │      │  │      │   │    4 Spalten Desktop
│  │      │  │      │  │      │  │      │   │    2 Spalten Tablet
│  └──────┘  └──────┘  └──────┘  └──────┘   │    1 Spalte Mobil
│                                             │
│            [Mehr laden]                     │  ← Pagination
├─────────────────────────────────────────────┤
│  Impressum  Datenschutz  Kontakt            │  ← Footer
└─────────────────────────────────────────────┘
```

**Daten laden:**
```typescript
// Server Component — Daten direkt auf dem Server laden
const { data: events } = await supabase
  .from('events')
  .select('*, hosts(name, slug)')
  .eq('is_public', true)
  .eq('status', 'published')
  .gte('start_at', new Date().toISOString())  // Nur zukünftige Events
  .order('start_at', { ascending: true })
  .range(0, 11);  // Erste 12 Events
```

**Filter-Logik:**
- Tags/Kategorien: URL-Parameter `?tag=tanz` → Supabase `.contains('tags', ['tanz'])`
- Region/Stadt: URL-Parameter `?city=hamburg` → Supabase `.eq('city', 'hamburg')`
- Freitext-Suche: URL-Parameter `?q=meditation` → Supabase `.ilike('title', '%meditation%')`

### 5.2 EventCard Komponente

Jede Karte zeigt:
- **Header:** Datum + Uhrzeit (formatiert: "Di 17.02.2026 19:00")
- **Tags:** Als Badges/Chips (z.B. "Tanz/Bewegung", "Meditation")
- **Bild:** cover_image_url (Fallback: Platzhalter-Bild mit sanftem Gradient)
- **Titel:** Event-Titel
- **Host:** Name des Anbieters (verlinkt auf Host-Profil)
- **Ort:** location_name + Stadt
- **Beschreibung:** Gekürzt auf ~100 Zeichen mit "Mehr..."
- **CTA-Button:** "Details" oder "Anmelden" (verlinkt auf ticket_link oder Detailseite)
- **Footer:** Preis-Info (kostenlos/Spende/Preis)

### 5.3 Event-Detailseite (`/events/[slug]`)

```typescript
// Daten laden über Slug
const { data: event } = await supabase
  .from('events')
  .select('*, hosts(name, slug, description, website_url, social_links)')
  .eq('slug', params.slug)
  .eq('is_public', true)
  .single();
```

**Inhalte:**
- Großes Cover-Bild
- Titel + Datum/Uhrzeit (formatiert)
- Tags als Badges
- Volle Beschreibung (Markdown-fähig mit `react-markdown`)
- Ort mit Name + Adresse (optional: Google Maps Embed)
- Host-Info-Box (Name, Beschreibung, Website, Social Links)
- CTA: "Zur Anmeldung" → ticket_link (extern) oder "Kostenlos teilnehmen"
- Preis-Info
- "Zum Kalender hinzufügen" Button (ICS-Download generieren)

### 5.4 "Mehr laden" (Pagination)

Client Component mit State:
```typescript
const [events, setEvents] = useState(initialEvents);
const [page, setPage] = useState(1);
const PAGE_SIZE = 12;

const loadMore = async () => {
  const from = page * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;
  const { data } = await supabase
    .from('events')
    .select('*, hosts(name, slug)')
    .eq('is_public', true)
    .eq('status', 'published')
    .gte('start_at', new Date().toISOString())
    .order('start_at', { ascending: true })
    .range(from, to);
  setEvents(prev => [...prev, ...data]);
  setPage(prev => prev + 1);
};
```

---

## 6. Supabase Client Setup

```typescript
// lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

// Server-seitig (für Server Components)
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Client-seitig (für "Mehr laden" etc.)
export const createBrowserClient = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
```

### .env.local
```
NEXT_PUBLIC_SUPABASE_URL=https://fjyaolxtipqtcvvclegl.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<SUPABASE_ANON_OR_PUBLISHABLE_KEY>
```

---

## 7. Dependencies

```json
{
  "dependencies": {
    "next": "^15",
    "react": "^19",
    "react-dom": "^19",
    "@supabase/supabase-js": "^2",
    "react-markdown": "^9",
    "date-fns": "^3",
    "date-fns-tz": "^3"
  },
  "devDependencies": {
    "typescript": "^5",
    "@types/react": "^19",
    "@types/node": "^22",
    "tailwindcss": "^4",
    "@tailwindcss/postcss": "^4",
    "postcss": "^8"
  }
}
```

---

## 8. Referenz-Design: nils-liebt-dich.de

Die Referenz-Seite verwendet:
- **Card Grid:** 4 Spalten (Desktop), Bootstrap-basiert
- **Karten-Aufbau:** Datum-Header → Kategorie-Badges → Cover-Bild → Titel → Host → Ort → Beschreibung → CTA-Button → Verfügbarkeit
- **Fixed Navbar** oben
- **Filter:** Kategorie erweitern + Region-Dropdown + Suchen-Button
- **"Mehr laden"-Button** am Ende
- **Footer:** Impressum, Datenschutz, Hilfe

Wir übernehmen das gleiche Layout-Prinzip, aber mit:
- Hellem, erdigen Farbschema statt Dark Theme
- Tailwind CSS statt Bootstrap
- Serif-Headlines für spirituellen Touch
- Weichere Ecken (rounded-xl) und subtile Schatten

---

## 9. Deployment auf Vercel

1. GitHub-Repository erstellen
2. Vercel mit GitHub verbinden
3. Environment Variables setzen (Supabase URL + Key)
4. Custom Domain konfigurieren (wenn vorhanden)

---

## 10. Spätere Erweiterungen (NICHT im MVP)

- Auth (Registrierung/Login) über Supabase Auth
- RSVP-System
- Host-Dashboard (eigene Events verwalten)
- Map-Ansicht mit Clustering
- Kalender-Widget pro Stadt
- Newsletter-Signup
- Credits/Barter-System
- Mehrsprachigkeit (DE/EN)
- SEO: Schema.org Event-Markup, Programmatic Pages (/events/hamburg/kw-08)

---

## Prompt für Claude Code

Wenn du das Projekt in Claude Code startest, gib folgenden initialen Prompt:

> Erstelle eine Next.js 15 App (App Router, TypeScript, Tailwind CSS v4) für eine Event-Plattform. Die App zeigt Events aus einer Supabase-Datenbank an. Verwende die Datei `portal-bauplan.md` als detaillierte Spezifikation für Schema, Design, Komponenten und Seitenstruktur. Starte mit der Grundstruktur: Layout, Navbar, Event-Übersichtsseite mit Card-Grid, Filter und Pagination, sowie Event-Detailseite. Design: Erdige, warme Farben (Sand, Terracotta, Salbeigrün), Serif-Headlines, sanfte Schatten.
