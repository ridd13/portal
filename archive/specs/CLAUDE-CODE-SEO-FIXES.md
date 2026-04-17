# Claude Code Prompt: SEO Technical Fixes (www-Bug + JSON-LD)

> Dieser Prompt ist für Claude Code (Terminal). Bitte komplett umsetzen, dann `npm run build` zur Verifikation.

## Aufgabe

Zwei technische SEO-Bugs in allen City/Region Pages fixen:

### Fix 1: www-Bug in Canonical + OG URLs

In 20 Seiten steht `https://www.das-portal.online/` — korrekt ist `https://das-portal.online/` (ohne www).

**Betroffene Dateien (alle page.tsx in diesen Ordnern):**
- `app/hamburg/` (page.tsx + alle Unterordner: breathwork, ecstatic-dance, frauenkreis, ganzheitliche-events, kakaozeremonie, meditation, retreat, soundhealing, spirituelle-events, tantra, yoga)
- `app/kiel/` (page.tsx + breathwork)
- `app/bremen/page.tsx`
- `app/rostock/page.tsx`
- `app/schleswig-holstein/` (page.tsx + ganzheitliche-events)
- `app/mecklenburg-vorpommern/page.tsx`
- `app/niedersachsen/page.tsx`
- `app/kategorie/[slug]/page.tsx`

**Außerdem in globalen Seiten prüfen:**
- `app/page.tsx` (Landing Page)
- `app/events/page.tsx`
- `app/hosts/page.tsx`
- `app/locations/page.tsx`
- `app/hosts-page-tmp/page.tsx`

**Was tun:**
Such-und-Ersetzen in allen betroffenen `page.tsx`:
```
https://www.das-portal.online/ → https://das-portal.online/
```

Das betrifft:
- `alternates.canonical`
- `openGraph.url`
- JSON-LD `url`-Felder

**NICHT ändern:** Die 5 neuen Pages (freiburg, muenchen, berlin, schwarzwald, stuttgart) — die sind bereits korrekt.

### Fix 2: JSON-LD Schema von CollectionPage → ItemList

In 9 Seiten ist das JSON-LD Schema `CollectionPage` statt `ItemList`. Google versteht `ItemList` mit `itemListElement` besser für Event-Listings.

**Betroffene Dateien:**
- `app/hamburg/page.tsx`
- `app/kiel/page.tsx`
- `app/kiel/ganzheitliche-events/page.tsx`
- `app/bremen/page.tsx`
- `app/rostock/page.tsx`
- `app/schleswig-holstein/page.tsx`
- `app/mecklenburg-vorpommern/page.tsx`
- `app/niedersachsen/page.tsx`
- `app/kategorie/[slug]/page.tsx`

**Was tun:**
Ersetze das JSON-LD in jeder betroffenen Datei. Das alte Pattern sieht ungefähr so aus:
```json
{
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "name": "...",
  "description": "...",
  "url": "..."
}
```

Ersetze durch das ItemList-Pattern (analog zu den funktionierenden Pages wie `hamburg/ganzheitliche-events/page.tsx`):
```typescript
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "...",  // bestehenden Namen behalten
  description: "...",  // bestehende Beschreibung behalten
  url: "https://das-portal.online/...",  // URL ohne www!
  itemListElement: events.slice(0, 5).map((event, index) => ({
    "@type": "ListItem",
    position: index + 1,
    item: {
      "@type": "Event",
      name: event.title,
      startDate: event.start_at,
      location: {
        "@type": "Place",
        name: event.location_name || "[Stadtname]",
        address: event.address || "[Stadtname]",
      },
      url: `https://das-portal.online/events/${event.slug}`,
    },
  })),
};
```

**Wichtig:** Stelle sicher, dass die `events`-Variable in jeder Datei verfügbar ist (Supabase Query). Falls eine Seite keine Events lädt (z.B. reine Text-Seiten), lass das JSON-LD als einfaches `ItemList` ohne `itemListElement`.

## Verifikation

Nach allen Änderungen:
1. `grep -r "www.das-portal.online" app/ --include="*.tsx"` → sollte 0 Treffer ergeben
2. `grep -r "CollectionPage" app/ --include="*.tsx"` → sollte 0 Treffer ergeben
3. `npm run build` → muss durchlaufen
