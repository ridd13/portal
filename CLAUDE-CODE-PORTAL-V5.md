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

## Nach Abschluss

- `npm run build` ausführen und Fehler beheben
- Auf Vercel deployen
- Prüfen ob Events mit Preisen korrekt angezeigt werden
