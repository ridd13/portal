# Map-Feature, Auth-Cleanup & Telegram — Das Portal

## Übersicht
Dieser Prompt umfasst 5 Aufgaben:
1. Karten-Ansicht auf `/events` mit Leaflet
2. Standort-Erkennung + PLZ-Eingabe
3. City-Slugs für SEO (`/events/hamburg`, `/events/22041`)
4. Auth-Links entfernen (Registrierung/Anmeldung deaktivieren)
5. Telegram-Links prominent einbauen

---

## 1. Karten-Ansicht auf `/events`

### Layout-Konzept
Die Karte soll das **primäre Element** auf `/events` sein — direkt unter den Filtern, noch ÜBER der Event-Liste.

```
[Header / Navbar]
[Hero-Banner "Finde dein nächstes Event"]
[Filter: Kategorie | Stadt | Suche]
[========= KARTE (ca. 50-60vh) =========]
[Event-Liste (Cards, scrollbar)]
```

### Technologie
- **Leaflet** + **react-leaflet** (kostenlos, Open Source, DSGVO-freundlich)
- **OpenStreetMap** Tiles (kein API Key nötig)
- Pakete installieren: `npm install leaflet react-leaflet @types/leaflet`

### Implementierung

**Neue Datei: `components/EventMap.tsx`** (Client Component)
- `"use client"` — Leaflet braucht `window`
- Props: `events: Event[]` (gefilterte Events mit `geo_lat` + `geo_lng`)
- Nur Events mit vorhandenen Koordinaten anzeigen (null-Check!)
- Marker pro Event mit Popup: Titel, Datum, Ort, Link zur Detailseite
- Default-Center: Hamburg (53.55, 10.0) — Hauptzielgebiet SH & Hamburg
- Default-Zoom: 9 (zeigt SH + Hamburg gut)
- Karte soll responsive sein: `h-[50vh] md:h-[60vh] w-full rounded-2xl`

**Wichtig — Leaflet CSS:**
- Leaflet CSS muss importiert werden: `import 'leaflet/dist/leaflet.css'`
- Leaflet Default-Marker-Icons haben einen bekannten Bug mit Webpack/Next.js — Custom-Icon nutzen oder Fix anwenden:
```tsx
import L from 'leaflet';
// Fix für default marker icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});
```

**Marker-Farbe:** Passend zum Portal-Design — goldener/warmer Marker wäre ideal. Entweder Custom SVG-Icon oder ein farbiger `L.divIcon`.

**In `app/events/page.tsx` einbauen:**
- EventMap zwischen den Filtern und der EventList rendern
- Events mit `geo_lat` und `geo_lng` an die Map übergeben
- Lazy-laden mit `dynamic(() => import(...), { ssr: false })` da Leaflet kein SSR kann

**Select auf Events erweitern:**
- Im Supabase-Query `geo_lat` und `geo_lng` mitselecten (sollte schon über `*` passieren, aber verifizieren)

### Interaktion Map ↔ Filter
- Wenn ein City-Filter gesetzt wird → Map zoomt auf diese Stadt
- Wenn ein Marker geklickt wird → Popup mit Event-Info + Link
- Optional: Wenn Events gefiltert werden, nur deren Marker zeigen

---

## 2. Standort-Erkennung + PLZ-Eingabe

### Beim ersten Besuch auf `/events`:
1. Browser fragt nach Geolocation (`navigator.geolocation.getCurrentPosition`)
2. **Wenn erlaubt:** Karte zentriert sich auf User-Position, Events sortiert nach Entfernung
3. **Wenn abgelehnt oder ignoriert:** Fallback-UI zeigen

### Fallback: PLZ / Ort-Eingabe
- Über dem Map ein kleines Eingabefeld: "Deine PLZ oder Stadt eingeben"
- Bei Eingabe: Geocoding über Nominatim API (kostenlos, OpenStreetMap):
  `https://nominatim.openstreetmap.org/search?q=22041+Germany&format=json&limit=1`
- Karte zentriert sich auf die zurückgegebenen Koordinaten
- User-Preference in `localStorage` merken für nächsten Besuch

### Entfernung berechnen
- Client-seitig: Haversine-Formel für Distanz zwischen User-Position und Event-Koordinaten
- Events nach Entfernung sortierbar machen (zusätzlich zu Datum)
- Optional: Badge "X km entfernt" auf EventCards

---

## 3. City-Slugs für SEO

### URL-Struktur
```
/events              → Alle Events (mit Karte)
/events/hamburg      → Events in Hamburg
/events/kiel         → Events in Kiel
/events/22041        → Events nahe PLZ 22041
```

### Implementierung

**Neue Route: `app/events/[location]/page.tsx`**
- Dynamic route parameter `location`
- Prüfen ob `location` eine PLZ ist (Regex: `/^\d{5}$/`) oder ein Stadt-Slug
- Bei PLZ: Geocoding → Umkreis-Suche (z.B. 25km Radius)
- Bei Stadt: Filter wie bisher über `address ILIKE '%hamburg%'`

**Metadata pro Stadt generieren:**
```tsx
export async function generateMetadata({ params }) {
  return {
    title: `Events in ${cityName} | Das Portal`,
    description: `Entdecke ganzheitliche Events, Workshops und Retreats in ${cityName}.`,
  };
}
```

**`generateStaticParams`:**
- Die häufigsten Städte (Hamburg, Kiel, Lübeck, Flensburg, Neumünster) als statische Params
- PLZ-Routen werden on-demand generiert

**Canonical URLs:**
- `/events?city=Hamburg` → Redirect 301 zu `/events/hamburg`
- Alte Query-Parameter weiterhin als Fallback unterstützen

**Interne Verlinkung:**
- In der Karte und den Filtern Links zu `/events/hamburg` statt Query-Params nutzen

---

## 4. Auth-Links entfernen

### Problem
"Anmelden" und "Registrieren" Links in der Navbar führen zu "Nicht gefunden" (404). Die Auth-Seiten existieren nicht / sind buggy. Registrierung soll später in vernünftig nachgereicht werden.

### Aufgabe
**Datei: `components/Navbar.tsx`**
- "Anmelden" Link **komplett entfernen**
- "Registrieren" Button **komplett entfernen**
- Stattdessen: **"Auf die Warteliste"** Button (Link zu `/#warteliste` — Anchor zum Warteliste-Formular auf der Landing Page)
- Styling: Gleicher CTA-Style wie der bisherige Registrieren-Button (border, rounded, accent color)

**Datei: `app/page.tsx`**
- Dem Warteliste-Abschnitt eine `id="warteliste"` geben, damit der Navbar-Link dahin scrollt

**Auth-Routen:**
- Falls `app/auth/` oder `app/konto/` Ordner existieren → nicht löschen, aber prüfen ob sie von irgendwo verlinkt sind und Links entfernen
- Keine Auth-bezogenen Supabase-Funktionen entfernen (brauchen wir später), nur die UI-Links

---

## 5. Telegram-Links einbauen

### Kontext
Die Community ist auf Telegram aktiv. Es gibt einen Telegram-Channel und eine Telegram-Gruppe die prominent verlinkt werden sollen.

### Platzierung

**A) Navbar:**
- Telegram-Icon (kleines Paper-Plane Icon) rechts neben "Events" Link
- Verlinkt zum Telegram-Channel
- Nur Icon, kein Text (spart Platz)

**B) Landing Page (`app/page.tsx`):**
- Im "Sei von Anfang an dabei"-Abschnitt (wo das Warteliste-Formular ist)
- Unter dem Formular oder daneben: "Tritt unserer Community bei" mit Telegram-Button
- Alternativ: Eigene kleine Section zwischen den bestehenden Sektionen

**C) Footer:**
- Telegram-Link neben Impressum / Datenschutz / Kontakt

### Telegram URLs
- **Nur den Kanal verlinken:** `https://t.me/dasgrosseportal` (Handle: @dasgrosseportal)
- Gruppe kommt später, erstmal NICHT einbauen

### Icon
- SVG Paper-Plane Icon inline oder von Lucide/Heroicons
- Farbe: Portal-Gold (#b8860b oder accent-primary)

---

## 6. Nebenbefunde von der Live-Seite (Nice-to-fix)

Diese Punkte sind beim Review aufgefallen — nicht blockierend, aber wenn Zeit ist:

- **Impressum:** Enthält Platzhalter ("Portal GmbH", "Max Mustermann", "kontakt@deine-domain.de") — TODO-Kommentar hinzufügen
- **Datenschutz:** Ebenfalls Platzhalter — TODO-Kommentar hinzufügen
- **Layout Metadata:** `app/layout.tsx` hat noch "Spirituelle Events" im Title-Template — sollte neutraler sein, z.B. "Ganzheitliche Events"
- **Konto-Seite:** `/konto` existiert evtl. noch — Links dahin entfernen falls vorhanden

---

## Reihenfolge der Umsetzung
1. **Auth-Links entfernen** (schnell, räumt kaputte UX auf)
2. **Telegram-Links** (schnell, wichtig für Community-Building)
3. **Map-Feature** (Hauptaufwand)
4. **Standort-Erkennung** (baut auf Map auf)
5. **City-Slugs** (baut auf Map + Standort auf)

## Nach der Umsetzung
- `npm run build` — alles muss kompilieren
- Prüfen ob Leaflet korrekt lazy-loaded wird (kein SSR-Error)
- Prüfen ob Navbar sauber aussieht ohne Auth-Links
