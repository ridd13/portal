# Portal V5 — Event-Darstellung, Bilder, Preise, API-Fixes

## Kontext

Die Event-Intake-Pipeline (Telegram → n8n → Portal API) läuft. Events werden importiert, aber die Darstellung auf der Website hat mehrere Probleme:
- Bilder werden nicht angezeigt (weder auf Karten noch auf Detailseiten)
- Preise zeigen nur "Paid"/"Donation" statt konkrete Beträge
- Der Details-Button auf EventCards ist nicht klickbar
- Die API speichert `price_amount` nicht

Abhängigkeit: V2 und V3 sollten bereits umgesetzt sein. Lies `CLAUDE.md` für Tech-Stack-Regeln (Tailwind v4, Design-Tokens etc.)

---

## Task 1: `price_amount` Feld in DB + API + UI (Prio 1)

### Problem
Die Datenbank hat nur `price_model` (string: "free", "paid", "donation"). Der konkrete Preis ("45€", "35-55€") wird vom Scraper mitgeliefert als `price_amount`, aber nirgends gespeichert oder angezeigt.

### Solution

**1a) Supabase Migration — neues Feld `price_amount`:**

```sql
ALTER TABLE events ADD COLUMN price_amount text DEFAULT NULL;
```

Führe das im Supabase SQL Editor aus oder erstelle eine Migration.

**1b) TypeScript Interface updaten:**

In `lib/types.ts` — Event Interface erweitern:

```typescript
price_amount: string | null;
```

**1c) Import API anpassen:**

In `app/api/events/import/route.ts` — `price_amount` aus dem Request Body lesen und beim Insert/Upsert mitgeben:

```typescript
// Im Request-Body destructuring:
const { title, description, start_at, end_at, location_name, address, city, tags, price_model, price_amount, ... } = body;

// Im Supabase upsert:
price_amount: price_amount || null,
```

**1d) EventCard.tsx — Preis-Anzeige verbessern:**

Aktuell (ca. Zeile 71):
```tsx
{event.price_model || "Preis auf Anfrage"}
```

Ersetzen durch:
```tsx
{event.price_amount
  ? event.price_amount
  : event.price_model === 'free'
    ? 'Kostenlos'
    : event.price_model === 'donation'
      ? 'Auf Spendenbasis'
      : event.price_model === 'paid'
        ? 'Kostenpflichtig'
        : 'Preis auf Anfrage'}
```

**1e) Event-Detailseite — gleiche Logik:**

In `app/events/[slug]/page.tsx` die Preis-Anzeige analog anpassen. Wenn `price_amount` vorhanden, diesen anzeigen. Sonst den formatierten `price_model`.

**Zeitaufwand:** 30 Min

---

## Task 2: Event-Bilder reparieren (Prio 1)

### Problem
Die `photo_url` vom Telegram-Scraper zeigt auf `http://localhost:5111/photos/...`. Die Portal API auf Vercel kann diese URL nicht erreichen → Bild-Upload nach Supabase schlägt fehl → `cover_image_url` bleibt leer oder bekommt einen Default-SVG.

### Solution

**2a) API Route: Fehlerhandling beim Bild-Upload verbessern:**

In `app/api/events/import/route.ts` gibt es eine `uploadPhotoToStorage` Funktion. Diese versucht die `photo_url` herunterzuladen. Das Problem: `localhost:5111` ist vom Vercel-Server nicht erreichbar.

**Lösung: Der Bild-Upload muss von n8n aus passieren (n8n läuft auf dem gleichen Server wie der Scraper).** Die Portal API sollte stattdessen eine bereits hochgeladene Supabase Storage URL akzeptieren.

Ändere die Logik:

```typescript
// Wenn cover_image_url bereits eine Supabase URL ist → direkt nutzen
// Wenn photo_url vorhanden und NICHT localhost → versuche Upload
// Wenn photo_url localhost → logge Warning, nutze Default

let finalCoverUrl = cover_image_url;

if (!finalCoverUrl && photo_url) {
  if (photo_url.startsWith('http://localhost') || photo_url.startsWith('http://127.0.0.1')) {
    console.warn(`Skipping localhost photo_url: ${photo_url}`);
    // Nutze Default basierend auf Tags
    finalCoverUrl = getDefaultCover(tags);
  } else {
    // Versuche Upload zu Supabase Storage
    finalCoverUrl = await uploadPhotoToStorage(photo_url, slug);
  }
}
```

**2b) Default-Cover Bilder nach Tags:**

Erstelle eine Helper-Funktion die basierend auf Event-Tags ein passendes Default-Cover zurückgibt:

```typescript
function getDefaultCover(tags: string[]): string {
  // Nutze die vorhandenen DEFAULT_COVERS aus route.ts
  // Prüfe ob ein Tag matcht, sonst generisches Default
  const tagMap: Record<string, string> = {
    'Meditation': '/images/defaults/meditation.svg',
    'Yoga': '/images/defaults/yoga.svg',
    'Workshop': '/images/defaults/workshop.svg',
    'Retreat': '/images/defaults/retreat.svg',
    // ... weitere Tags
  };

  for (const tag of tags) {
    if (tagMap[tag]) return tagMap[tag];
  }
  return '/images/defaults/event-default.svg';
}
```

**Hinweis:** Die eigentliche Lösung für echte Telegram-Fotos kommt über n8n (separater Upload-Step in n8n der das Bild direkt nach Supabase Storage hochlädt und die public URL an die Portal API schickt). Das ist ein n8n-Workflow-Upgrade, kein Website-Fix.

**Zeitaufwand:** 30 Min

---

## Task 3: Details-Button klickbar machen (Prio 2)

### Problem
In `components/EventCard.tsx` ist der "Details"-Button ein `<span>` ohne eigene Click-Funktionalität. Der unsichtbare Link mit `z-0` liegt unter dem gesamten Card-Content.

### Solution

Die gesamte Karte ist bereits durch den unsichtbaren Link klickbar. Das Problem ist, dass der Host-Link (`relative z-10`) den Click auf sich zieht. Der Details-Button sieht klickbar aus, reagiert aber nicht separat.

**Fix:** Den unsichtbaren Link auf `z-10` setzen und den Host-Link auf `z-20`:

```tsx
{/* Unsichtbarer Link über die gesamte Karte */}
<Link
  href={`/events/${event.slug}`}
  className="absolute inset-0 z-10"
  aria-label={`${event.title} — Details anzeigen`}
/>

{/* Host-Link muss darüber liegen */}
<Link
  href={`/hosts/${event.host?.slug}`}
  className="relative z-20 hover:underline"
>
  {event.host?.name}
</Link>
```

Teste danach:
- Klick auf Karte → Event-Detailseite ✅
- Klick auf Host-Name → Host-Seite ✅
- Klick auf Details-Button → Event-Detailseite ✅

**Zeitaufwand:** 10 Min

---

## Task 4: Preis auf Detailseite prominent anzeigen (Prio 2)

### Problem
Auf der Event-Detailseite wird der Preis nur als kleiner Text angezeigt. Der konkrete Betrag fehlt komplett.

### Solution

In `app/events/[slug]/page.tsx` einen Preis-Block einbauen (z.B. neben oder unter dem Datum):

```tsx
{/* Preis-Anzeige */}
<div className="flex items-center gap-2 text-text-secondary">
  <span className="text-lg">💰</span>
  <span className="text-lg font-medium text-text-primary">
    {event.price_amount
      ? event.price_amount
      : event.price_model === 'free'
        ? 'Kostenlos'
        : event.price_model === 'donation'
          ? 'Auf Spendenbasis'
          : event.price_model === 'paid'
            ? 'Kostenpflichtig'
            : 'Preis auf Anfrage'}
  </span>
</div>
```

Packe das in den Info-Block zusammen mit Datum, Ort und Tags.

**Zeitaufwand:** 15 Min

---

## Task 5: Supabase Query für `price_amount` updaten (Prio 1)

### Problem
Selbst wenn `price_amount` in der DB existiert, wird es möglicherweise nicht in den Supabase Queries selektiert.

### Solution

Suche in allen Dateien nach `.select(` Queries die Events laden und stelle sicher, dass `price_amount` mit selektiert wird. Relevante Dateien:

- `app/events/page.tsx` — Event-Übersicht
- `app/events/[slug]/page.tsx` — Event-Detail
- `app/page.tsx` — Landing Page (falls Events dort angezeigt werden)
- `components/EventList.tsx` — falls dort Queries sind

Wenn die Queries `select('*')` nutzen, ist `price_amount` automatisch mit drin. Wenn sie spezifische Felder listen, ergänze `price_amount`.

**Zeitaufwand:** 10 Min

---

## Prioritäts-Reihenfolge

1. **Task 1** (price_amount Feld) — 30 Min — Grundlage für korrekte Preisanzeige
2. **Task 5** (Queries updaten) — 10 Min — direkt nach Task 1
3. **Task 3** (Details-Button) — 10 Min — Quick Fix
4. **Task 4** (Preis auf Detailseite) — 15 Min
5. **Task 2** (Bilder) — 30 Min — teilweise n8n-Abhängigkeit

**Gesamt: ca. 1,5 Stunden**

---

## Hinweis zu Bildern (n8n-Seite)

Die nachhaltige Lösung für Event-Bilder erfordert einen zusätzlichen Step im n8n Workflow:
- Nach dem Scraper-Call: Bild von `localhost:5111/photos/...` herunterladen
- Direkt nach Supabase Storage hochladen (n8n HTTP Request an Supabase Storage API)
- Die public URL an die Portal API übergeben als `cover_image_url`

Das ist ein separates n8n-Upgrade und wird in einem anderen Prompt behandelt.

---

## Task 6: Event-Detailseite aufwerten (Prio 2)

### Problem
Die Event-Detailseite zeigt nur den kurzen AI-generierten Snippet (2-4 Sätze). Das wirkt dünn und unprofessionell. Es fehlt Struktur und Einladungscharakter.

### Solution

**6a) Description-Bereich strukturieren:**

Die `description` aus der DB als Markdown rendern (mit `react-markdown` oder einfachem HTML). Falls die Description Absätze enthält (getrennt durch `\n\n`), diese als separate Paragraphen darstellen.

```tsx
{/* Description mit Absätzen */}
<div className="prose prose-warm max-w-none text-text-primary">
  {event.description?.split('\n\n').map((paragraph, i) => (
    <p key={i} className="mb-4 leading-relaxed">{paragraph}</p>
  ))}
</div>
```

**6b) Info-Grid auf der Detailseite:**

Baue einen strukturierten Info-Block mit allen relevanten Daten:

```tsx
<div className="grid grid-cols-1 gap-4 rounded-xl border border-border bg-bg-card p-6 sm:grid-cols-2">
  {/* Datum */}
  <div className="flex items-start gap-3">
    <span className="text-xl">📅</span>
    <div>
      <p className="text-sm font-medium text-text-muted">Wann</p>
      <p className="text-text-primary">{formattedDate}</p>
      {event.end_at && <p className="text-sm text-text-secondary">bis {formattedEndDate}</p>}
    </div>
  </div>

  {/* Ort */}
  <div className="flex items-start gap-3">
    <span className="text-xl">📍</span>
    <div>
      <p className="text-sm font-medium text-text-muted">Wo</p>
      <p className="text-text-primary">{event.location_name || event.address || 'Ort wird noch bekannt gegeben'}</p>
      {event.address && event.location_name && <p className="text-sm text-text-secondary">{event.address}</p>}
    </div>
  </div>

  {/* Preis */}
  <div className="flex items-start gap-3">
    <span className="text-xl">💰</span>
    <div>
      <p className="text-sm font-medium text-text-muted">Preis</p>
      <p className="text-text-primary">{priceDisplay}</p>
    </div>
  </div>

  {/* Anbieter */}
  {event.host && (
    <div className="flex items-start gap-3">
      <span className="text-xl">🙋</span>
      <div>
        <p className="text-sm font-medium text-text-muted">Anbieter:in</p>
        <Link href={`/hosts/${event.host.slug}`} className="text-accent-primary hover:underline">
          {event.host.name}
        </Link>
      </div>
    </div>
  )}
</div>
```

**6c) CTA-Button für Anmeldung:**

Wenn `ticket_link` vorhanden, einen prominenten Button anzeigen:

```tsx
{event.ticket_link && (
  <a
    href={event.ticket_link}
    target="_blank"
    rel="noopener noreferrer"
    className="inline-flex items-center gap-2 rounded-full bg-accent-primary px-8 py-3 text-lg font-semibold text-white transition hover:brightness-95"
  >
    Jetzt anmelden
    <span>→</span>
  </a>
)}
```

**6d) Tags als klickbare Chips:**

```tsx
<div className="flex flex-wrap gap-2">
  {event.tags?.map(tag => (
    <Link
      key={tag}
      href={`/events?tag=${encodeURIComponent(tag)}`}
      className="rounded-full bg-bg-secondary px-3 py-1 text-sm text-text-secondary transition hover:bg-accent-sage hover:text-white"
    >
      {tag}
    </Link>
  ))}
</div>
```

**Zeitaufwand:** 45 Min

---

## Task 7: EventCard Design aufwerten (Prio 2)

### Problem
Die Event-Karten in der Übersicht zeigen zu wenig auf einen Blick. Tags fehlen, der Preis ist unklar, die Karte lädt nicht zum Klicken ein.

### Solution

Jede EventCard sollte zeigen:
1. **Bild** (oder farbigen Gradient-Placeholder mit Tag-Icon)
2. **Datum** (kompakt: "Sa, 22. Mär")
3. **Titel** (max 2 Zeilen, dann truncate)
4. **Ort** (Stadt oder Location-Name)
5. **Preis** (konkret oder formatiert)
6. **1-2 Tags** als kleine Chips
7. **Details-Button**

Kompakte Tag-Anzeige auf der Karte (max 2 Tags, Rest als "+3"):

```tsx
<div className="flex flex-wrap gap-1">
  {event.tags?.slice(0, 2).map(tag => (
    <span key={tag} className="rounded-full bg-bg-secondary px-2 py-0.5 text-xs text-text-muted">
      {tag}
    </span>
  ))}
  {event.tags && event.tags.length > 2 && (
    <span className="rounded-full bg-bg-secondary px-2 py-0.5 text-xs text-text-muted">
      +{event.tags.length - 2}
    </span>
  )}
</div>
```

**Zeitaufwand:** 30 Min

---

## Task 8: Landing Page — Value Proposition schärfen (Prio 3)

### Problem
Die Landing Page muss sofort kommunizieren was Das Portal ist und warum man sich Events ansehen sollte.

### Solution

**Hero-Section Text verbessern:**

Headline: "Entdecke ganzheitliche Events in Schleswig-Holstein & Hamburg"
Subline: "Workshops, Retreats, Meditationen und mehr — von lokalen Anbieter:innen für deine persönliche Entwicklung."

**Social Proof einfügen (dynamisch aus DB):**

```tsx
// Supabase Query für Statistiken
const { count: eventCount } = await supabase
  .from('events')
  .select('*', { count: 'exact', head: true })
  .eq('is_public', true)
  .eq('status', 'published')
  .gte('start_at', new Date().toISOString());

const { count: hostCount } = await supabase
  .from('hosts')
  .select('*', { count: 'exact', head: true });
```

Anzeige:
```tsx
<div className="flex gap-8 text-center">
  <div>
    <p className="text-3xl font-bold text-accent-primary">{eventCount}+</p>
    <p className="text-sm text-text-muted">Kommende Events</p>
  </div>
  <div>
    <p className="text-3xl font-bold text-accent-primary">{hostCount}+</p>
    <p className="text-sm text-text-muted">Anbieter:innen</p>
  </div>
</div>
```

**Zeitaufwand:** 30 Min

---

## Task 9: Host-Handling verbessern (Prio 1)

### Problem
Hosts werden beim Import automatisch erstellt, aber nur mit minimalem Daten (Name aus `sender_name`). Es fehlt: Telegram-Username als Link, Website/Ticket-Link als Referenz, vernünftiger Slug. Außerdem werden Hosts doppelt angelegt wenn der gleiche Anbieter unterschiedliche Display-Names nutzt.

### Solution

**9a) Import API: Host-Erstellung erweitern:**

In `app/api/events/import/route.ts` — die `findOrCreateHost` Logik verbessern:

```typescript
// Host finden: erst per telegram_username, dann per name
async function findOrCreateHost(data: {
  host_name?: string | null;
  sender_name?: string | null;
  host_telegram_username?: string | null;
  ticket_link?: string | null;
}) {
  const supabase = getSupabaseAdminClient();
  const name = data.host_name || data.sender_name;
  if (!name) return null;

  // 1. Erst per Telegram Username suchen (eindeutiger)
  if (data.host_telegram_username) {
    const cleanUsername = data.host_telegram_username.replace('@', '');
    const { data: existing } = await supabase
      .from('hosts')
      .select('id, slug')
      .eq('telegram_username', cleanUsername)
      .single();

    if (existing) return existing;
  }

  // 2. Per Name suchen
  const { data: existingByName } = await supabase
    .from('hosts')
    .select('id, slug')
    .eq('name', name)
    .single();

  if (existingByName) return existingByName;

  // 3. Neu erstellen
  const slug = name.toLowerCase()
    .replace(/[^a-z0-9äöüß\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss');

  const { data: newHost } = await supabase
    .from('hosts')
    .insert({
      name,
      slug,
      telegram_username: data.host_telegram_username?.replace('@', '') || null,
      website_url: data.ticket_link || null,
    })
    .select('id, slug')
    .single();

  return newHost;
}
```

**9b) Hosts-Tabelle: Felder prüfen und ergänzen:**

Stelle sicher dass die `hosts` Tabelle diese Felder hat:
- `telegram_username` (text, nullable)
- `website_url` (text, nullable)
- `email` (text, nullable)
- `avatar_url` (text, nullable)
- `description` (text, nullable)

Falls `telegram_username` fehlt:
```sql
ALTER TABLE hosts ADD COLUMN IF NOT EXISTS telegram_username text DEFAULT NULL;
```

**9c) Host-Deduplizierung:**

Die Suche priorisiert `telegram_username` über `name`. So wird "Janna Celina" und "Janna" als gleicher Host erkannt wenn der Telegram-Username identisch ist.

**9d) Host-Profilseite: Telegram-Link anzeigen:**

In `app/hosts/[slug]/page.tsx` — wenn `telegram_username` vorhanden:

```tsx
{host.telegram_username && (
  <a
    href={`https://t.me/${host.telegram_username}`}
    target="_blank"
    rel="noopener noreferrer"
    className="inline-flex items-center gap-2 text-accent-primary hover:underline"
  >
    @{host.telegram_username} auf Telegram
  </a>
)}
```

**Zeitaufwand:** 30 Min

---

## Aktualisierte Prioritäts-Reihenfolge

1. **Task 1** (price_amount Feld) — 30 Min
2. **Task 9** (Host-Handling) — 30 Min
3. **Task 5** (Queries updaten) — 10 Min
4. **Task 3** (Details-Button) — 10 Min
5. **Task 4** (Preis auf Detailseite) — 15 Min
6. **Task 6** (Detailseite aufwerten) — 45 Min
7. **Task 7** (EventCard Design) — 30 Min
8. **Task 2** (Bilder) — 30 Min
9. **Task 8** (Landing Page) — 30 Min

**Gesamt: ca. 4 Stunden**

---

## Hinweis zu Bildern (n8n-Seite)

Die nachhaltige Lösung für Event-Bilder erfordert einen zusätzlichen Step im n8n Workflow:
- Nach dem Scraper-Call: Bild von `localhost:5111/photos/...` herunterladen
- Direkt nach Supabase Storage hochladen (n8n HTTP Request an Supabase Storage API)
- Die public URL an die Portal API übergeben als `cover_image_url`

Das ist ein separates n8n-Upgrade und wird in einem anderen Prompt behandelt.

---

## Nach Abschluss

- `npm run build` ausführen und Fehler beheben
- Auf Vercel deployen
- Prüfen ob Events mit Preisen, Tags, Info-Grid und CTA korrekt angezeigt werden
