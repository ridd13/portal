# Event-Intake Pipeline — Telegram → n8n → Supabase

## Kontext
Events sollen über Telegram eingepflegt werden: Nachrichten werden an einen Bot weitergeleitet, per AI normalisiert und in Supabase importiert. Der Bot prüft ob der Originalverfasser als Host registriert ist.

**Dieses File beschreibt die Supabase- und Next.js-seitigen Änderungen.** Die n8n-Workflow-Konfiguration ist separat dokumentiert (wird in n8n direkt gebaut).

---

## Architektur-Übersicht

```
Telegram-Nachricht (Event-Ankündigung)
    ↓ (weiterleiten an Bot)
Telegram Bot empfängt Nachricht
    ↓ (Webhook)
n8n Workflow:
    1. Nachricht + Original-Absender extrahieren
    2. Absender-Check: telegram_username in hosts-Tabelle?
       → JA: Weiter zu Schritt 3
       → NEIN: Outreach-Nachricht an Absender senden (Registrierungs-Einladung)
    3. AI-Parsing: Event-Daten aus Nachricht extrahieren
       (Titel, Datum, Uhrzeit, Ort, Beschreibung, Preis, Tags)
    4. Supabase Insert: Event anlegen mit host_id + status "draft"
    5. Bestätigung an Bot-Chat senden (mit Preview der Daten)
    6. Optional: Admin-Freigabe via Telegram-Buttons → status auf "published" setzen
```

---

## Aufgaben (Supabase + Next.js Seite)

### 1. Hosts-Tabelle erweitern: telegram_username

**SQL-Migration:** `supabase/hosts-telegram.sql`

```sql
-- Telegram-Username für Host-Erkennung bei Event-Intake
-- ⚠️  Diese SQL muss manuell im Supabase SQL Editor ausgeführt werden!

-- Telegram-Username Feld (ohne @, lowercase)
alter table public.hosts
  add column if not exists telegram_username text;

-- Unique Index für schnellen Lookup
create unique index if not exists idx_hosts_telegram
  on public.hosts(telegram_username)
  where telegram_username is not null;

-- E-Mail Feld für Hosts (für Kommunikation außerhalb Telegram)
alter table public.hosts
  add column if not exists email text;

-- Profilbild-URL
alter table public.hosts
  add column if not exists avatar_url text;
```

### 2. Host Interface updaten

**Datei:** `lib/types.ts`

Zum bestehenden `Host` Interface hinzufügen:
```typescript
telegram_username: string | null;
email: string | null;
avatar_url: string | null;
```

Auch `HostPreview` prüfen — falls dort Felder fehlen, ebenfalls ergänzen.

### 3. Events-Tabelle: source_info Feld

**SQL-Migration:** In `supabase/hosts-telegram.sql` ergänzen:

```sql
-- Quell-Information für importierte Events
alter table public.events
  add column if not exists source_type text default 'manual';
  -- Werte: 'manual', 'telegram', 'form'

alter table public.events
  add column if not exists source_message_id text;
  -- Telegram Message-ID für Deduplizierung

-- Index für Deduplizierung
create unique index if not exists idx_events_source_msg
  on public.events(source_message_id)
  where source_message_id is not null;
```

### 4. Event Interface updaten

**Datei:** `lib/types.ts`

Zum bestehenden `Event` Interface hinzufügen:
```typescript
source_type: 'manual' | 'telegram' | 'form' | null;
source_message_id: string | null;
```

### 5. API-Endpoint für Event-Import (von n8n aufgerufen)

**Neue Datei:** `app/api/events/import/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Service-Role Client für API-Zugriff (umgeht RLS)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Einfacher API-Key Check
function validateApiKey(request: NextRequest): boolean {
  const authHeader = request.headers.get("authorization");
  const apiKey = authHeader?.replace("Bearer ", "");
  return apiKey === process.env.EVENT_IMPORT_API_KEY;
}

export async function POST(request: NextRequest) {
  if (!validateApiKey(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();

  // Pflichtfelder prüfen
  const { title, start_at, host_telegram_username } = body;
  if (!title || !start_at || !host_telegram_username) {
    return NextResponse.json(
      { error: "Missing required fields: title, start_at, host_telegram_username" },
      { status: 400 }
    );
  }

  // Host über Telegram-Username finden
  const { data: host, error: hostError } = await supabase
    .from("hosts")
    .select("id, name")
    .eq("telegram_username", host_telegram_username.toLowerCase().replace("@", ""))
    .single();

  if (hostError || !host) {
    return NextResponse.json(
      { error: "Host not found", telegram_username: host_telegram_username },
      { status: 404 }
    );
  }

  // Deduplizierung: Prüfen ob source_message_id schon existiert
  if (body.source_message_id) {
    const { data: existing } = await supabase
      .from("events")
      .select("id")
      .eq("source_message_id", body.source_message_id)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: "Event already imported", event_id: existing.id },
        { status: 409 }
      );
    }
  }

  // Slug generieren
  const slug = title
    .toLowerCase()
    .replace(/[äÄ]/g, "ae").replace(/[öÖ]/g, "oe").replace(/[üÜ]/g, "ue").replace(/ß/g, "ss")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    + "-" + Date.now().toString(36);

  // Event anlegen
  const { data: event, error: insertError } = await supabase
    .from("events")
    .insert({
      title: body.title,
      slug,
      description: body.description || null,
      start_at: body.start_at,
      end_at: body.end_at || null,
      location_name: body.location_name || null,
      address: body.address || null,
      geo_lat: body.geo_lat || null,
      geo_lng: body.geo_lng || null,
      host_id: host.id,
      is_public: true,
      status: body.auto_publish ? "published" : "draft",
      tags: body.tags || [],
      price_model: body.price_model || null,
      ticket_link: body.ticket_link || null,
      source_type: "telegram",
      source_message_id: body.source_message_id || null,
    })
    .select("id, slug, status")
    .single();

  if (insertError) {
    console.error("Event import error:", insertError);
    return NextResponse.json({ error: "Insert failed" }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    event_id: event.id,
    slug: event.slug,
    status: event.status,
    host_name: host.name,
    url: `https://www.das-portal.online/events/${event.slug}`,
  });
}
```

### 6. API-Endpoint: Host-Lookup (von n8n aufgerufen)

**Neue Datei:** `app/api/hosts/lookup/route.ts`

n8n ruft diesen Endpoint auf um zu prüfen ob ein Telegram-User als Host registriert ist.

```typescript
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function validateApiKey(request: NextRequest): boolean {
  const authHeader = request.headers.get("authorization");
  const apiKey = authHeader?.replace("Bearer ", "");
  return apiKey === process.env.EVENT_IMPORT_API_KEY;
}

export async function GET(request: NextRequest) {
  if (!validateApiKey(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const username = request.nextUrl.searchParams.get("telegram_username");
  if (!username) {
    return NextResponse.json({ error: "Missing telegram_username" }, { status: 400 });
  }

  const { data: host } = await supabase
    .from("hosts")
    .select("id, name, slug")
    .eq("telegram_username", username.toLowerCase().replace("@", ""))
    .single();

  if (!host) {
    return NextResponse.json({ found: false });
  }

  return NextResponse.json({ found: true, host });
}
```

### 7. Environment Variables

Neue Variablen in `.env.local` und auf Vercel:

```
# Supabase Service Role Key (für API-Endpoints die RLS umgehen müssen)
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# API-Key für den Event-Import (n8n sendet diesen im Authorization Header)
EVENT_IMPORT_API_KEY=portal-import-<zufälliger-string>
```

⚠️ `SUPABASE_SERVICE_ROLE_KEY` findest du im Supabase Dashboard → Settings → API → service_role key.
⚠️ `EVENT_IMPORT_API_KEY` frei wählen — ein langer zufälliger String. Wird in n8n als Auth-Header konfiguriert.

Beide in `env.local.example` als Platzhalter eintragen.

---

## n8n Workflow (separat einzurichten)

### Trigger
- **Telegram Trigger Node:** Webhook, empfängt alle Nachrichten an den Bot

### Flow

```
1. [Telegram Trigger]
   → Nachricht empfangen
   → Prüfen: ist es eine weitergeleitete Nachricht? (forward_from / forward_sender_name)

2. [IF: Weitergeleitete Nachricht?]
   → NEIN: Antwort "Bitte leite eine Event-Nachricht weiter"
   → JA: Weiter

3. [HTTP Request: Host-Lookup]
   → GET /api/hosts/lookup?telegram_username={{forward_from.username}}
   → Authorization: Bearer {{EVENT_IMPORT_API_KEY}}

4. [IF: Host gefunden?]
   → NEIN: Telegram-Nachricht an Absender:
     "Hey! Jemand wollte ein Event von dir auf Das Portal veröffentlichen.
      Du bist noch nicht als Anbieter registriert.
      Melde dich bei uns: https://t.me/dasgrosseportal"
   → JA: Weiter

5. [AI Agent / OpenAI Node]
   → System Prompt: "Extrahiere Event-Daten aus dieser Nachricht.
     Antworte als JSON: {title, description, start_at (ISO), end_at (ISO),
     location_name, address, tags[], price_model, ticket_link}.
     Fehlende Felder als null. Datum immer mit Timezone Europe/Berlin."
   → Input: Nachrichtentext

6. [HTTP Request: Event Import]
   → POST /api/events/import
   → Authorization: Bearer {{EVENT_IMPORT_API_KEY}}
   → Body: AI-Output + {host_telegram_username, source_message_id}

7. [Telegram: Bestätigung]
   → Antwort im Bot-Chat:
     "✅ Event importiert: {{title}}
      Host: {{host_name}}
      Datum: {{start_at}}
      Status: Draft — prüfe auf das-portal.online/events/{{slug}}"
```

### Geocoding (optional, Phase 2)
- Zwischen Schritt 5 und 6: Nominatim API (kostenlos) aufrufen um aus der Adresse geo_lat/geo_lng zu bekommen
- `https://nominatim.openstreetmap.org/search?q={{address}}&format=json&limit=1`

---

## Reihenfolge der Umsetzung

**Phase 1 — Backend (Claude Code):**
1. SQL-Migration erstellen (`supabase/hosts-telegram.sql`)
2. TypeScript Interfaces updaten (`lib/types.ts`)
3. API Route: `/api/hosts/lookup` erstellen
4. API Route: `/api/events/import` erstellen
5. `env.local.example` updaten
6. `npm run build` — muss kompilieren

**Phase 2 — Setup (Lennert manuell):**
7. SQL im Supabase SQL Editor ausführen
8. `SUPABASE_SERVICE_ROLE_KEY` auf Vercel setzen
9. `EVENT_IMPORT_API_KEY` generieren und auf Vercel setzen
10. Test-Host in Supabase anlegen (Name + telegram_username)
11. n8n Workflow bauen (siehe n8n-Sektion oben)

**Phase 3 — n8n testen:**
12. Event-Nachricht an Bot weiterleiten
13. Prüfen: Host-Lookup → AI-Parsing → Supabase-Insert → Bestätigung
14. Event auf der Website prüfen (nach publish)

---

## Test-Daten für ersten Host

Zum Testen einen Host-Eintrag in Supabase anlegen:

```sql
insert into public.hosts (name, slug, telegram_username, description)
values (
  'Lennert Bewernick',
  'lennert-bewernick',
  'lbewernick',  -- Telegram-Username ohne @, lowercase
  'Gründer von Das Portal'
);
```

---

## Sicherheitshinweise
- `EVENT_IMPORT_API_KEY` ist der einzige Schutz der API-Endpoints — lang und zufällig wählen
- `SUPABASE_SERVICE_ROLE_KEY` NIEMALS als `NEXT_PUBLIC_` prefixen — der darf nur serverseitig genutzt werden
- Events werden als "draft" importiert — Publish nur nach Prüfung (oder `auto_publish: true` im Request)
- Deduplizierung über `source_message_id` verhindert doppelte Imports
