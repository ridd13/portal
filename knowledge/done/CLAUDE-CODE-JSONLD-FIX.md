# Fix: JSON-LD strukturierte Daten für Events

> Google Search Console meldet 5 fehlende Felder in den Event-strukturierten Daten.
> Betrifft: `app/events/[slug]/page.tsx`, Zeile 145-173

## Probleme und Fixes

### 1. `performer` fehlt
Google erwartet einen Performer. Für uns = der Host.

```typescript
// HINZUFÜGEN nach organizer:
performer: hostPreview ? {
  "@type": "Person",
  name: hostPreview.name,
  url: hostPreview.slug ? `${siteUrl}/hosts/${hostPreview.slug}` : undefined,
} : undefined,
```

### 2. `price` fehlt in offers
Aktuell: `price` ist nur bei "free" gesetzt, sonst `undefined`.
Fix: `price_amount` nutzen wenn vorhanden, sonst "0" für free, weglassen wenn unbekannt.

```typescript
offers: {
  "@type": "Offer",
  price: event.price_model === "free" 
    ? "0" 
    : event.price_amount 
      ? String(event.price_amount) 
      : undefined,
  priceCurrency: "EUR",
  url: event.ticket_link || `${siteUrl}/events/${event.slug}`,
  availability: "https://schema.org/InStock",
  validFrom: event.created_at || undefined,
},
```

### 3. `validFrom` fehlt in offers
Wann das Angebot gültig ist. Nehmen wir `created_at` vom Event.
→ Siehe Code oben: `validFrom: event.created_at || undefined`

### 4. `offers` fehlt komplett
Aktuell nur gesetzt wenn `price_model || price_amount` vorhanden.
Fix: IMMER offers ausgeben — Google will es sehen, auch wenn kein Preis bekannt.

```typescript
// offers IMMER setzen, nicht conditional
offers: {
  "@type": "Offer",
  price: event.price_model === "free" 
    ? "0" 
    : event.price_amount 
      ? String(event.price_amount) 
      : undefined,
  priceCurrency: "EUR",
  url: event.ticket_link || `${siteUrl}/events/${event.slug}`,
  availability: "https://schema.org/InStock",
  validFrom: event.created_at || undefined,
},
```

### 5. `address` fehlt in location
Aktuell: `address` ist ein einfacher String. Google erwartet ein PostalAddress-Objekt.

```typescript
location: (event.location_name || event.address) ? {
  "@type": "Place",
  name: event.location_name || event.address || "Ort wird noch bekannt gegeben",
  address: event.address ? {
    "@type": "PostalAddress",
    streetAddress: event.address,
    addressLocality: event.address ? getCityFromAddress(event.address) : undefined,
    addressCountry: "DE",
  } : undefined,
} : {
  "@type": "Place",
  name: "Ort wird noch bekannt gegeben",
},
```

Hinweis: `getCityFromAddress` existiert bereits in `lib/event-utils.ts`.
Import prüfen: `import { getCityFromAddress } from "@/lib/event-utils";`

## Vollständiger JSON-LD Block (zum Ersetzen)

```typescript
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Event",
  name: event.title,
  description: event.description || undefined,
  startDate: event.start_at,
  endDate: event.end_at || undefined,
  eventStatus: "https://schema.org/EventScheduled",
  eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
  url: `${siteUrl}/events/${event.slug}`,
  image: event.cover_image_url || undefined,
  location: (event.location_name || event.address) ? {
    "@type": "Place",
    name: event.location_name || event.address || "Ort folgt",
    address: event.address ? {
      "@type": "PostalAddress",
      streetAddress: event.address,
      addressLocality: getCityFromAddress(event.address),
      addressCountry: "DE",
    } : undefined,
  } : {
    "@type": "Place",
    name: "Ort wird noch bekannt gegeben",
  },
  organizer: hostPreview ? {
    "@type": "Organization",
    name: hostPreview.name,
    url: hostPreview.slug ? `${siteUrl}/hosts/${hostPreview.slug}` : undefined,
  } : undefined,
  performer: hostPreview ? {
    "@type": "Person",
    name: hostPreview.name,
    url: hostPreview.slug ? `${siteUrl}/hosts/${hostPreview.slug}` : undefined,
  } : undefined,
  offers: {
    "@type": "Offer",
    price: event.price_model === "free" 
      ? "0" 
      : event.price_amount 
        ? String(event.price_amount) 
        : undefined,
    priceCurrency: "EUR",
    url: event.ticket_link || `${siteUrl}/events/${event.slug}`,
    availability: "https://schema.org/InStock",
    validFrom: event.created_at || undefined,
  },
};
```

## Zusätzlich prüfen

- `created_at` muss im Event-Select mit geladen werden (Zeile ~100)
- `getCityFromAddress` Import vorhanden
- `npm run build` muss durchlaufen
