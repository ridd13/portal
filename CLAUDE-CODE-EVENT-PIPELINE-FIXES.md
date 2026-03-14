# Event-Pipeline Verbesserungen

## Kontext
Die n8n Telegram Event Pipeline ist live und importiert Events aus Telegram-Gruppen via API nach Supabase. Aktuell fehlen bei importierten Events: Geodaten, Adressen und Bilder. Dadurch werden Events nicht auf der Karte angezeigt und haben kein Cover-Bild.

## Aufgabe 1: Geocoding bei Event-Import

### Problem
Events werden ohne `geo_lat`, `geo_lng` und oft ohne vollständige `address` importiert. Die Telegram-Nachrichten enthalten meist nur einen Location-Namen (z.B. "Heilzentrum Bergedorf" oder "Soma Space Hamburg"), aber keine GPS-Koordinaten.

### Lösung
In `app/api/events/import/route.ts` Geocoding einbauen:

1. Wenn `geo_lat`/`geo_lng` NICHT im Request-Body sind, aber `location_name` oder `address` vorhanden:
   - Geocoding-API aufrufen (OpenStreetMap Nominatim — kostenlos, kein API-Key nötig)
   - URL: `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`
   - Suchquery: `address` wenn vorhanden, sonst `location_name + " Hamburg"` (Region-Fallback)
   - `lat` und `lon` aus der Response in `geo_lat`/`geo_lng` speichern
   - WICHTIG: User-Agent Header setzen (Nominatim Pflicht): `User-Agent: DasPortal/1.0`

2. Wenn Geocoding eine Adresse zurückgibt und `address` im Body leer war:
   - `display_name` aus Nominatim als `address` speichern

3. Rate-Limiting beachten: Nominatim erlaubt max 1 Request/Sekunde — bei Batch-Imports ggf. throttlen

### Beispiel-Code
```typescript
async function geocode(query: string): Promise<{ lat: number; lng: number; address?: string } | null> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`,
      { headers: { "User-Agent": "DasPortal/1.0" } }
    );
    const data = await res.json();
    if (data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon),
        address: data[0].display_name,
      };
    }
  } catch (e) {
    console.error("Geocoding failed:", e);
  }
  return null;
}
```

### Einbauen in route.ts
Nach der Host-Auflösung, vor dem Event-Insert:
```typescript
let geoLat = body.geo_lat || null;
let geoLng = body.geo_lng || null;
let address = body.address || null;

if (!geoLat && (body.location_name || body.address)) {
  const query = body.address || `${body.location_name} Hamburg Schleswig-Holstein`;
  const geo = await geocode(query);
  if (geo) {
    geoLat = geo.lat;
    geoLng = geo.lng;
    if (!address) address = geo.address;
  }
}
```

## Aufgabe 2: Cover-Bilder für importierte Events

### Problem
Importierte Events haben kein `cover_image_url`. Die Event-Karten auf der Übersichtsseite zeigen leere Platzhalter.

### Optionen (in Reihenfolge der Priorität)

**Option A: Default-Bilder pro Tag-Kategorie**
Einfachste Lösung. Für die häufigsten Tags (breathwork, yoga, sound-healing, kakao-zeremonie, tantra, community, meditation) jeweils ein schönes Stockfoto in `/public/images/defaults/` ablegen. Bei Import: wenn kein `cover_image_url`, das passende Default-Bild basierend auf dem ersten Tag zuweisen.

Taggen → Bild Mapping in einer Config-Datei oder direkt in der Route:
```typescript
const DEFAULT_COVERS: Record<string, string> = {
  "breathwork": "/images/defaults/breathwork.jpg",
  "yoga": "/images/defaults/yoga.jpg",
  "sound-healing": "/images/defaults/sound-healing.jpg",
  "kakao-zeremonie": "/images/defaults/kakao-zeremonie.jpg",
  "tantra": "/images/defaults/tantra.jpg",
  "meditation": "/images/defaults/meditation.jpg",
  "community": "/images/defaults/community.jpg",
  "workshop": "/images/defaults/workshop.jpg",
};

const coverUrl = body.cover_image_url
  || DEFAULT_COVERS[body.tags?.[0]]
  || "/images/defaults/event-default.jpg";
```

**Option B: AI-generierte Bilder (später)**
Für später: Über die OpenAI DALL-E API oder ähnlich ein Bild basierend auf Titel + Tags generieren. Teurer und langsamer, aber individueller.

### Umsetzung Option A
1. 8-9 hochwertige, stimmungsvolle Stockfotos besorgen (Unsplash, lizenzfrei)
   - Style: warm, natürlich, erdige Töne passend zum Portal-Design
   - Format: 16:9, min. 1200x675px
2. In `/public/images/defaults/` ablegen
3. In `route.ts` das Mapping einbauen
4. Auf der Event-Karte: Fallback-Bild anzeigen wenn `cover_image_url` null

## Aufgabe 3: Event-Detailseite strukturierter

### Problem
Die Event-Detailseite (`app/events/[slug]/page.tsx`) sollte die importierten Daten übersichtlich darstellen.

### Gewünschte Darstellung
- Datum/Uhrzeit prominent
- Location mit Google Maps Embed oder Link
- Preis-Info (wenn vorhanden)
- Host/Anbieter mit Link zur Host-Seite
- Tags als Badges
- Beschreibungstext (der schöne, lange Text)
- Ticket/Anmelde-Button
- Wenn `source_type === "telegram"`: Hinweis "Dieses Event wurde automatisch aus einer Telegram-Gruppe importiert"

## Reihenfolge
1. Geocoding (höchster Impact — Events erscheinen auf der Karte)
2. Default-Bilder (visueller Impact auf der Übersichtsseite)
3. Event-Detailseite (Nice-to-have, kann iterativ verbessert werden)

## Dateien
- `app/api/events/import/route.ts` — Geocoding + Default-Bilder einbauen
- `app/events/[slug]/page.tsx` — Detailseite verbessern
- `app/events/page.tsx` — Fallback-Bild wenn cover_image_url null
- `components/EventCard.tsx` — Fallback-Bild
- `/public/images/defaults/` — Default-Bilder anlegen
