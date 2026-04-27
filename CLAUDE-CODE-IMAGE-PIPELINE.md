# CLAUDE-CODE-IMAGE-PIPELINE

> Event-Cover-Bilder beim Intake in 3 Größen als WebP pre-generieren. Vercel Image Optimization für Event-Cover abschalten. Ziel: 5.000/Monat Transformations-Limit des Vercel Free Plans umgehen.

## Kontext

- **Problem:** Vercel Free Plan hat 5.000 Image Transformations/Monat aufgebraucht (Notification von notifications@vercel.com am 24.04.2026). Neue Bilder werfen Fehler, alte gecachte laufen weiter.
- **Ursache:** Jedes Event-Cover (aktuell via Telegram Scraper gescraped) wird durch `next/image` optimiert → frisst Transformations.
- **Lösung:** Bilder werden im Telegram Scraper in 3 Größen (400 / 800 / 1600px) als WebP gerendert und in Supabase Storage abgelegt. Portal liefert sie direkt mit `unoptimized` aus Supabase aus. Kein Vercel Transform mehr.

## Scope

- ✅ Nur **Event-Cover** (`events.cover_image_url`)
- ✅ Nur **neue Events** ab Deployment. **Kein Backfill** — bestehende Cover bleiben wie sie sind und funktionieren über den Fallback-Pfad weiter.
- ❌ Host-Avatare (`hosts.avatar_url`) → **nicht** in Scope. Aktuell keine produktiven Avatare vorhanden.
- ❌ Location-Images, OG-Images, andere Bildflächen → out-of-scope für diesen Task.

## Architektur

### Bild-Naming in Supabase Storage

Bucket: `event-covers` (public).

Pro Event drei Varianten:
```
event-covers/
  {event-id}_400.webp    # Card View
  {event-id}_800.webp    # Detail View (Default/Fallback)
  {event-id}_1600.webp   # Hero / OG-Image
```

WebP Quality: **82** (gute Balance zwischen Größe und Quality).
Resize-Logik: Aspect Ratio beibehalten, Resize auf `longest side`.

### DB-Feld `events.cover_image_url`

- **Neue Events (mit Varianten):** Volle URL zur **800er-Variante**, z.B.
  `https://fjyaolxtipqtcvvclegl.supabase.co/storage/v1/object/public/event-covers/abc123_800.webp`
- **Alte Events (ohne Varianten):** Existing URL bleibt unverändert.

Warum 800er als "Base": Ist die häufigste Detail-View-Größe. Varianten werden beim Rendern durch String-Replace konstruiert (`_800` → `_400` / `_1600`).

## Teil 1: Telegram Scraper (Python, separates Repo)

> Der Scraper liegt auf dem Hetzner VPS (`46.224.62.143`) und in einem separaten Git-Repo. Code-Änderungen erfolgen dort.

### Was ändern

Im Scraper gibt es eine Upload-Funktion, die aktuell ein einzelnes Bild nach Supabase Storage hochlädt. Diese Funktion wird erweitert:

1. **Nach dem Download** des Originalbilds (aus Telegram):
   - 3 WebP-Varianten generieren (400, 800, 1600px longest side, Quality 82)
   - Originalbild **nicht** hochladen
2. **Alle 3 Varianten** nach `event-covers/` in Supabase Storage hochladen mit Naming `{event-id}_{size}.webp`
3. **`events.cover_image_url` setzen** auf die `_800.webp` URL
4. **Fehlerbehandlung:**
   - Wenn Resize fehlschlägt → Fallback: Original als einzige Variante hochladen (kein WebP, bestehendes Verhalten)
   - Wenn Upload einer Variante fehlschlägt → bestehende Varianten löschen, Retry einmal, dann abbrechen

### Tech-Stack

- **Pillow** (PIL Fork) für Resize + WebP-Encode
  - `from PIL import Image`
  - `img.thumbnail((longest, longest), Image.Resampling.LANCZOS)`
  - `img.save(buffer, format='WEBP', quality=82, method=6)`
- Supabase Storage Python Client (bereits im Scraper vorhanden)

### Pseudocode

```python
from PIL import Image
from io import BytesIO

SIZES = [400, 800, 1600]
WEBP_QUALITY = 82

def process_and_upload_cover(event_id: str, original_bytes: bytes) -> str:
    """Resize original to 3 WebP variants and upload to Supabase.
    Returns URL to _800.webp variant (used as cover_image_url)."""

    img = Image.open(BytesIO(original_bytes))
    # Convert to RGB if needed (WebP doesn't like palette mode)
    if img.mode not in ('RGB', 'RGBA'):
        img = img.convert('RGB')

    uploaded_urls = {}
    for size in SIZES:
        variant = img.copy()
        variant.thumbnail((size, size), Image.Resampling.LANCZOS)

        buffer = BytesIO()
        variant.save(buffer, format='WEBP', quality=WEBP_QUALITY, method=6)
        buffer.seek(0)

        path = f"{event_id}_{size}.webp"
        url = upload_to_storage(
            bucket="event-covers",
            path=path,
            data=buffer.read(),
            content_type="image/webp",
        )
        uploaded_urls[size] = url

    return uploaded_urls[800]  # 800er als Base-URL für cover_image_url
```

### Supabase Storage Bucket

- **Bucket `event-covers`** muss existieren und **public readable** sein (`SELECT` policy für `anon`).
- **Write**: Nur Service-Role-Key darf schreiben (Scraper nutzt Service Key).

SQL für Bucket (falls nicht vorhanden):
```sql
INSERT INTO storage.buckets (id, name, public) VALUES ('event-covers', 'event-covers', true);
-- Policy für Public Read
CREATE POLICY "Public read event-covers" ON storage.objects
  FOR SELECT TO anon USING (bucket_id = 'event-covers');
```

## Teil 2: Portal Next.js (dieses Repo)

### Helper: `lib/image-variants.ts` (neu)

Utility, das aus einer `cover_image_url` ein `srcSet` konstruiert — aber nur wenn die URL dem neuen `_800.webp` Pattern folgt.

```ts
// lib/image-variants.ts
export function buildEventCoverSrcSet(url: string | null): {
  src: string;
  srcSet: string | undefined;
  isOptimized: boolean;
} {
  if (!url) return { src: "", srcSet: undefined, isOptimized: false };

  // Detection: URL endet mit _800.webp → hat Varianten
  const hasVariants = /_800\.webp$/.test(url);
  if (!hasVariants) {
    return { src: url, srcSet: undefined, isOptimized: false };
  }

  const src400 = url.replace(/_800\.webp$/, "_400.webp");
  const src800 = url;
  const src1600 = url.replace(/_800\.webp$/, "_1600.webp");

  return {
    src: src800,
    srcSet: `${src400} 400w, ${src800} 800w, ${src1600} 1600w`,
    isOptimized: true,
  };
}
```

### Komponenten anpassen

Alle Komponenten, die `event.cover_image_url` rendern:

1. **`components/EventCard.tsx`** (Card-View)
   - `<Image unoptimized>` mit `src` + manuellem `srcSet` + `sizes="(min-width: 768px) 400px, 100vw"`
2. **`app/events/[slug]/page.tsx`** (Detail-View)
   - `<Image unoptimized>` mit `src` + `srcSet` + `sizes="(min-width: 1024px) 800px, 100vw"`
3. **`app/kiel/ganzheitliche-events/page.tsx`** und **`app/hamburg/tantra/page.tsx`** (City Pages)
   - Nutzen `EventCard` → automatisch mitgenommen, kein separater Fix nötig
4. **OG-Image / Metadata** in Event-Detail → `src1600` nutzen falls Variants vorhanden

### Beispiel-Pattern für `EventCard.tsx`

```tsx
import { buildEventCoverSrcSet } from "@/lib/image-variants";

// ...
const { src, srcSet, isOptimized } = buildEventCoverSrcSet(event.cover_image_url);

{src && (
  <Image
    src={src}
    srcSet={srcSet}                      // nur bei neuen Events gesetzt
    sizes="(min-width: 768px) 400px, 100vw"
    alt={event.title}
    width={400}
    height={300}
    unoptimized={isOptimized}            // alte Events → Vercel Optimization (wie bisher)
                                         // neue Events → direkt aus Supabase
    className="..."
  />
)}
```

**Wichtig:** `unoptimized` nur `true` für neue Events mit Varianten — alte Events nutzen weiterhin Vercel Optimization (lassen sich schlecht vermeiden, aber gehen ins Limit). Da gecachte Transformations nicht doppelt zählen, sollte das funktionieren.

**Alternative falls Limit auch für alte Events problematisch:** `unoptimized={true}` für **alle** Event-Cover → maximal sicher, dafür schlechtere Performance bei alten Events.

→ **Entscheidung treffen beim Umbau.** Default: Pattern oben (Optimization nur für alte Events).

### `next.config.ts` — remotePatterns prüfen

Supabase-Domain muss in `images.remotePatterns` stehen (falls `unoptimized={false}` gerendert wird):

```ts
images: {
  remotePatterns: [
    {
      protocol: "https",
      hostname: "fjyaolxtipqtcvvclegl.supabase.co",
      pathname: "/storage/v1/object/public/**",
    },
  ],
}
```

Das ist vermutlich schon konfiguriert — vor Umbau verifizieren.

## Testing

### Scraper (Teil 1)

- [ ] Ein Test-Event manuell durch den Scraper laufen lassen
- [ ] Supabase Storage checken: 3 Dateien (`{id}_400.webp`, `_800.webp`, `_1600.webp`) im `event-covers` Bucket
- [ ] Dateigrößen prüfen: 400er sollte ~20-50KB sein, 1600er ~100-250KB
- [ ] `events.cover_image_url` zeigt auf `_800.webp`
- [ ] Bild in Browser laden → WebP-Format, keine Fehler

### Portal (Teil 2)

- [ ] Event-Card auf `/events`: Network-Tab zeigt Request an `supabase.co/storage/...` (nicht `_next/image`)
- [ ] Event-Detail: passende Größe je nach Viewport (DevTools Responsive Mode)
- [ ] **Alter Event** (ohne Varianten): rendert wie bisher, kein Fehler
- [ ] OG-Image zeigt 1600er Variante
- [ ] Lighthouse Performance-Score ≥ aktuell (kein Regress)

### Vercel Dashboard

- [ ] Nach 48h: Image Optimization Usage sollte stagnieren (nur alte Cover werden noch optimiert, neue nicht mehr)

## Rollout-Reihenfolge

1. **Scraper-Änderung deployen + einzelnes Test-Event laufen lassen.** Storage-Inhalt manuell verifizieren.
2. **Portal-Änderung deployen.** Neues Event rendert mit srcSet, alte ohne.
3. **Monitoring:** Vercel Usage Dashboard + Supabase Storage Size (Free Plan hat 1GB → reicht für tausende Events).

## Offene Punkte / Risiken

- **Supabase Storage Free Plan:** 1GB Limit. Bei ~200KB pro Event-Cover (3 Varianten zusammen) passen ~5.000 Events rein. Für Pre-Launch mehr als ausreichend.
- **Supabase Bandwidth Free Plan:** 5GB/Monat egress. Bei viel Traffic könnte das zum neuen Flaschenhals werden. → Monitoring.
- **Host-Avatare:** Wenn später Avatare aktiviert werden, separate Pipeline nötig (nicht in diesem Scope).

## Out-of-Scope (für Follow-up-Tickets)

- Backfill existierender Event-Cover
- Avatar-Pipeline für Hosts
- Location-Cover-Pipeline
- Migration auf Cloudinary / externe CDN bei Wachstum
