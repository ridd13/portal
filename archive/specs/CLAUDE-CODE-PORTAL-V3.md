# Portal V3 — Radius-Filter, Suche erweitern, Impressum/Datenschutz

## Kontext

Die Event-Pipeline laeuft, Events werden importiert. Jetzt UX-Fixes fuer die Event-Uebersicht und rechtliche Pflichtseiten.

Vorherige Aufgaben (V2) bitte ZUERST erledigen, falls noch nicht geschehen: CLAUDE-CODE-PORTAL-V2.md

---

## Aufgabe 7: Radius-Filter — Events nach Entfernung filtern

### Problem
Wenn ein User seinen Standort eingibt (PLZ oder Browser-Geolocation), wird ein 25km-Kreis auf der Karte angezeigt — aber:
1. Der Radius ist fest auf 25km, nicht verstellbar
2. Die Event-LISTE wird NICHT nach Entfernung gefiltert — es werden weiterhin ALLE Events angezeigt
3. Events ausserhalb des Radius sollten ausgeblendet oder ans Ende sortiert werden

### Loesung

#### 7a. Radius-Slider in LocationInput.tsx oder EventMapWrapper.tsx

Neuer Slider-Input unter dem Standort-Eingabefeld:

```tsx
// Radius-Auswahl (in km)
<div className="flex items-center gap-3 mt-2">
  <label className="text-sm text-text-secondary whitespace-nowrap">Umkreis:</label>
  <input
    type="range"
    min="5"
    max="100"
    step="5"
    value={radius}
    onChange={(e) => setRadius(Number(e.target.value))}
    className="flex-1"
  />
  <span className="text-sm text-text-primary font-medium w-16 text-right">{radius} km</span>
</div>
```

Default-Radius: 25 km. Moegliche Werte: 5, 10, 15, 20, 25, 50, 75, 100 km.

Der Radius-Wert muss:
- In der URL als `?radius=25` Parameter gespeichert werden
- Den Kreis auf der Karte dynamisch aendern (EventMap.tsx → Circle radius)
- Die Event-Liste filtern (siehe 7b)
- Nur angezeigt werden, wenn ein Standort gesetzt ist

#### 7b. Event-Liste nach Entfernung filtern

Die Filterung muss CLIENT-SEITIG passieren (Supabase hat keine native Geo-Queries). Es gibt zwei Ansaetze:

**Ansatz A (empfohlen): Server laedt alle Events, Client filtert**

In `app/events/page.tsx`:
- Server laedt ALLE published future Events (ohne Geo-Filter)
- Uebergibt `userLat`, `userLng`, `radius` an die Client-Komponente

In `components/EventList.tsx` oder einer neuen Wrapper-Komponente:
- Wenn User-Standort gesetzt: Filtere Events per `haversineKm()` aus `lib/geo.ts`
- Events ohne geo_lat/geo_lng: IMMER anzeigen (am Ende, mit "Entfernung unbekannt")
- Events innerhalb Radius: Sortiert nach Entfernung anzeigen
- Events ausserhalb Radius: Ausblenden

```typescript
import { haversineKm } from "@/lib/geo";

function filterByRadius(
  events: Event[],
  userLat: number,
  userLng: number,
  radiusKm: number
) {
  const withDistance = events.map(event => {
    if (!event.geo_lat || !event.geo_lng) {
      return { ...event, _distance: null };
    }
    return {
      ...event,
      _distance: haversineKm(userLat, userLng, event.geo_lat, event.geo_lng)
    };
  });

  const inRadius = withDistance
    .filter(e => e._distance !== null && e._distance <= radiusKm)
    .sort((a, b) => (a._distance! - b._distance!));

  const noGeo = withDistance.filter(e => e._distance === null);

  return [...inRadius, ...noGeo];
}
```

#### 7c. Karten-Kreis dynamisch machen

In `EventMap.tsx`: Der bestehende `<Circle>` hat aktuell `radius={25000}`. Aendern zu:

```tsx
<Circle
  center={[userLat, userLng]}
  radius={radiusKm * 1000}  // km → meter
  pathOptions={{ color: "#b5651d", fillColor: "#b5651d", fillOpacity: 0.08 }}
/>
```

#### 7d. UX-Hinweis wenn keine Events im Radius

Wenn nach Filterung 0 Events im Radius sind:

```tsx
<div className="text-center py-8">
  <p className="text-text-secondary">
    Keine Events im Umkreis von {radius} km gefunden.
  </p>
  <button onClick={() => setRadius(100)} className="text-accent-primary underline mt-2">
    Auf 100 km erweitern
  </button>
</div>
```

### Dateien die geaendert werden muessen:
- `components/EventMapWrapper.tsx` — Radius State + Prop-Drilling
- `components/EventMap.tsx` — Dynamischer Circle-Radius
- `components/LocationInput.tsx` — Radius-Slider UI
- `components/EventList.tsx` — Distanz-Filterung + Sortierung
- `app/events/page.tsx` — Radius URL-Param lesen, an Komponenten weiterreichen

---

## Aufgabe 8: Suche auf Tags erweitern + Placeholder aendern

### Problem 1: Falscher Placeholder
Das Suchfeld zeigt "Suche nach Titel" — aber die Suche durchsucht bereits Titel, Beschreibung, Location und Adresse. Der Placeholder ist irrefuehrend.

**Fix:** In `components/EventFilters.tsx` den Placeholder aendern:
```tsx
// ALT:
placeholder="Suche nach Titel"
// NEU:
placeholder="Suche nach Events..."
```

### Problem 2: Tags nicht durchsucht
Die Textsuche durchsucht bereits title, description, location_name und address. Aber NICHT die Tags. Wenn jemand "Kakaozeremonie" sucht und das Event den Tag "kakao-zeremonie" hat, wird es nicht gefunden.

### Loesung

In `app/events/page.tsx` und `components/EventList.tsx`, den `.or()` Filter erweitern:

**Problem:** Supabase `.or()` unterstuetzt kein `contains` fuer Arrays in Kombination mit `ilike`.

**Workaround:** Zwei Queries oder Post-Filter:

```typescript
// Option 1: Separater Tag-Check nach der Hauptquery
if (searchQuery) {
  // Bestehende Textsuche
  query = query.or(
    `title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%,location_name.ilike.%${searchQuery}%,address.ilike.%${searchQuery}%`
  );
}

// ZUSAETZLICH: Events die den Suchbegriff als Tag haben
// Normalisiere Suchbegriff zu Tag-Format: "Kakaozeremonie" → "kakao-zeremonie"
const tagSearch = searchQuery
  .toLowerCase()
  .replace(/[äÄ]/g, "ae").replace(/[öÖ]/g, "oe")
  .replace(/[üÜ]/g, "ue").replace(/ß/g, "ss")
  .replace(/\s+/g, "-");

// Zweite Query: Events mit passendem Tag
const { data: tagEvents } = await supabase
  .from("events")
  .select("*, hosts(name, slug)")
  .eq("is_public", true)
  .eq("status", "published")
  .gte("start_at", new Date().toISOString())
  .contains("tags", [tagSearch])
  .order("start_at", { ascending: true });

// Merge + Deduplizieren
const allEvents = [...(textEvents || []), ...(tagEvents || [])];
const uniqueEvents = allEvents.filter(
  (event, index, self) => index === self.findIndex(e => e.id === event.id)
);
```

**Option 2 (einfacher):** Supabase `textSearch` nutzen (falls Full-Text-Search aktiviert ist) oder einfach die Tags als kommaseparierten String in einem extra Feld speichern.

**Option 3 (am einfachsten, empfohlen fuer jetzt):** Tags clientseitig durchsuchen. Die Events werden ja schon geladen — dann einfach im Client nochmal filtern:

```typescript
// In EventList.tsx oder events/page.tsx nach dem Fetch:
const filtered = events.filter(event => {
  if (!searchQuery) return true;
  const q = searchQuery.toLowerCase();
  const inText = event.title?.toLowerCase().includes(q)
    || event.description?.toLowerCase().includes(q)
    || event.location_name?.toLowerCase().includes(q)
    || event.address?.toLowerCase().includes(q);
  const inTags = event.tags?.some(tag =>
    tag.toLowerCase().includes(q) || tag.toLowerCase().replace(/-/g, "").includes(q.replace(/[\s-]/g, ""))
  );
  return inText || inTags;
});
```

Das ist am pragmatischsten — bei der aktuellen Event-Anzahl (< 50) kein Performance-Problem.

---

## Aufgabe 9: Impressum & Datenschutzerklaerung

### Problem
Die Seiten `/impressum` und `/datenschutz` existieren, haben aber Platzhalter-Daten.

### Impressum (§5 TMG)

Datei: `app/impressum/page.tsx`

Pflichtangaben:
```
Lennert Bewernick
Lindenallee 10
23843 Ruempel

E-Mail: lennert.bewernick@gmail.com
Telefon: 0176 62348657
```

Zusaetzlich:
- Privatperson, keine USt-IdNr noetig
- Haftungsausschluss fuer Links
- Urheberrechtshinweis

### Datenschutzerklaerung (DSGVO)

Datei: `app/datenschutz/page.tsx`

Die Erklaerung muss ALLE tatsaechlich genutzten Dienste und Datenverarbeitungen abdecken:

**1. Verantwortlicher**
- Lennert Bewernick, Lindenallee 10, 23843 Ruempel
- E-Mail: lennert.bewernick@gmail.com

**2. Erhobene Daten — Warteliste**
- E-Mail, Name, Rolle (Besucher/Facilitator), Stadt
- Rechtsgrundlage: Art. 6 Abs. 1 lit. a DSGVO (Einwilligung)
- Speicherort: Supabase (Server: AWS eu-central-1, Frankfurt)
- Loeschung: Auf Anfrage jederzeit

**3. Hosting**
- Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723, USA
- Vercel Edge Network (CDN), Server auch in EU
- Vercel speichert automatisch: IP-Adresse, Browsertyp, Zeitstempel (Server-Logs)
- Rechtsgrundlage: Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse)
- Datenschutzerklaerung Vercel: https://vercel.com/legal/privacy-policy

**4. Datenbank**
- Supabase Inc.
- Projekt-Region: EU (Frankfurt, eu-central-1)
- Speichert: Wartelisten-Daten, Event-Daten, Host-Daten
- Datenschutzerklaerung: https://supabase.com/privacy

**5. Standortdaten**
- Browser-Geolocation: Nur nach expliziter Zustimmung des Nutzers
- Manuelle PLZ-Eingabe: Wird an Nominatim (OpenStreetMap) zur Geocodierung gesendet
- Nominatim: Betrieben von OpenStreetMap Foundation, keine Registrierung, IP wird temporaer geloggt
- Standort wird nur im localStorage des Browsers gespeichert, NICHT auf unseren Servern
- Rechtsgrundlage: Art. 6 Abs. 1 lit. a DSGVO (Einwilligung via Browser-Dialog)

**6. Karten**
- OpenStreetMap Tiles (via Leaflet)
- Betrieben von OpenStreetMap Foundation
- Laedt Kartenkacheln von tile.openstreetmap.org
- IP-Adresse wird dabei an OSM-Server uebermittelt
- Datenschutz: https://wiki.osmfoundation.org/wiki/Privacy_Policy

**7. Error Tracking**
- Sentry (Functional Software Inc.)
- Erfasst: Fehlermeldungen, Stack Traces, Browser-Info, anonymisierte IP
- Rechtsgrundlage: Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an Fehlerbehebung)
- Datenschutz: https://sentry.io/privacy/

**8. Cookies & Local Storage**
- Keine Tracking-Cookies
- localStorage: Nur fuer gespeicherten Standort (Nutzer kann loeschen)
- Kein Google Analytics, kein Facebook Pixel, keine Werbetracker

**9. Telegram-Kanal**
- Link auf der Website zu t.me/dasgrosseportal
- Beim Klick gelten die Datenschutzbestimmungen von Telegram
- Wir erhalten keine personenbezogenen Daten von Telegram-Nutzern

**10. Rechte der betroffenen Person**
- Auskunft (Art. 15 DSGVO)
- Berichtigung (Art. 16 DSGVO)
- Loeschung (Art. 17 DSGVO)
- Einschraenkung (Art. 18 DSGVO)
- Datenportabilitaet (Art. 20 DSGVO)
- Widerspruch (Art. 21 DSGVO)
- Beschwerde bei Aufsichtsbehoerde (ULD Schleswig-Holstein: https://www.datenschutzzentrum.de/)

### Design
- Gleiches Layout wie restliche Seiten (bg-primary, font-serif fuer Headlines)
- Kein spezielles Styling noetig — einfach gut lesbar, strukturiert mit Zwischenueberschriften
- Tailwind-Tokens nutzen, keine hardcodierten Farben

### Build
Nach Aenderungen: `npm run build` ausfuehren und sicherstellen dass keine Fehler auftreten.

---

## Reihenfolge

7. Radius-Filter (30-45 Min) — Hoechste Prioritaet, direkt spuerbarer UX-Gewinn
8. Suche auf Tags erweitern (15 Min)
9. Impressum & Datenschutz (20 Min)

Vorher V2-Aufgaben erledigen falls noch offen (1-6).
