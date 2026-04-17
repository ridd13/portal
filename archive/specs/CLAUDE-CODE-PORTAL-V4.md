# Portal V4 — Kombinierte Filter: Radius + Tags + Datumsbereich

## Kontext

Die Event-Pipeline funktioniert, Radius-Filter (V3, Aufgabe 7) ist implementiert. Aber die Filter-Kombination ist noch unvollstaendig:

- Radius-Filter existiert, filtert aber NICHT in der Event-Liste (nur visuell auf der Karte)
- Tag-Filter (Dropdown) existiert, aber kombiniert sich nicht mit Radius/Datum
- Datum-Filter existiert NICHT — Nutzer koennen keine Events nach Zeitraum filtern
- Alle Filter arbeiten isoliert, nicht zusammen

Diese Aufgabe macht alle Filter KOMBINIERBAR mit AND-Logik:
1. Wenn ich einen Tag auswaehle UND einen Radius stelle, sehe ich nur Events mit dem Tag IN diesem Radius
2. Wenn ich zusaetzlich noch ein Datumsbereich auswaehle, wird nochmal eingegrenzt
3. Die Map zeigt nur gefilterte Events
4. Die Liste zeigt nur gefilterte Events
5. Alle Filter sind in der URL reflektiert (shareable)

Voraussetzung: V3 (Radius-Filter, Suche, Impressum/Datenschutz) muss abgeschlossen sein.

---

## Aufgabe 10: Kombinierte Filter — Radius + Tags + Datumsbereich

### Problem

1. **Radius filtert nur visual (Map-Circle), nicht die Liste**
   - Events ausserhalb des Radius sollten aus der Liste verschwinden
   - Derzeit werden ALLE Events angezeigt

2. **Keine Datumsbereich-Filter**
   - Nutzer: "Zeige Events nur zwischen Samstag und Mittwoch"
   - Aktuell: Nur "Zukunft" ist gefiltert, kein Custom-Datumsbereich moeglich

3. **Filter kombinieren sich nicht**
   - Tag-Filter: funktioniert isoliert
   - Radius-Filter: funktioniert isoliert
   - Beide zusammen: Unvorhersehbar
   - Datumsbereich: Nicht vorhanden

4. **Keine Filter-Rueckmeldung**
   - Nutzer sieht nicht, welche Filter aktiv sind
   - Kein "X Events gefunden" mit der gefilterten Anzahl
   - Kein Weg, einen Filter schnell zu entfernen

### Loesung

#### 10a. Date Range Filter in EventFilters.tsx

Neuer Abschnitt unter dem bestehenden Tag-Filter:

```tsx
// In EventFilters.tsx (neue Inputs)
<div className="space-y-2">
  <label className="text-sm font-serif font-semibold text-text-primary">
    Datumsbereich
  </label>
  
  <div className="grid grid-cols-2 gap-3">
    {/* Von-Datum */}
    <div>
      <label className="block text-xs text-text-secondary mb-1">Von</label>
      <input
        type="date"
        value={fromDate}
        onChange={(e) => setFromDate(e.target.value)}
        className="w-full px-3 py-2 border border-border rounded text-sm font-sans text-text-primary bg-bg-card focus:outline-none focus:border-accent-primary"
      />
    </div>
    
    {/* Bis-Datum */}
    <div>
      <label className="block text-xs text-text-secondary mb-1">Bis</label>
      <input
        type="date"
        value={toDate}
        onChange={(e) => setToDate(e.target.value)}
        className="w-full px-3 py-2 border border-border rounded text-sm font-sans text-text-primary bg-bg-card focus:outline-none focus:border-accent-primary"
      />
    </div>
  </div>
  
  {/* Quick-Select Buttons */}
  <div className="flex flex-wrap gap-2 mt-3">
    <button
      onClick={() => {
        const today = new Date().toISOString().split("T")[0];
        setFromDate(today);
        setToDate("");
      }}
      className="text-xs px-2 py-1 border border-border rounded text-text-secondary hover:bg-bg-secondary transition"
    >
      Heute
    </button>
    <button
      onClick={() => {
        const today = new Date();
        const saturday = new Date(today);
        saturday.setDate(today.getDate() + (6 - today.getDay()));
        const sunday = new Date(saturday);
        sunday.setDate(saturday.getDate() + 1);
        setFromDate(saturday.toISOString().split("T")[0]);
        setToDate(sunday.toISOString().split("T")[0]);
      }}
      className="text-xs px-2 py-1 border border-border rounded text-text-secondary hover:bg-bg-secondary transition"
    >
      Dieses Wochenende
    </button>
    <button
      onClick={() => {
        const today = new Date();
        const dayOfWeek = today.getDay();
        const monday = new Date(today);
        monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
        const sunday = new Date(monday);
        sunday.setDate(monday.getDate() + 6);
        setFromDate(monday.toISOString().split("T")[0]);
        setToDate(sunday.toISOString().split("T")[0]);
      }}
      className="text-xs px-2 py-1 border border-border rounded text-text-secondary hover:bg-bg-secondary transition"
    >
      Diese Woche
    </button>
    <button
      onClick={() => {
        const today = new Date().toISOString().split("T")[0];
        const in30 = new Date();
        in30.setDate(in30.getDate() + 30);
        setFromDate(today);
        setToDate(in30.toISOString().split("T")[0]);
      }}
      className="text-xs px-2 py-1 border border-border rounded text-text-secondary hover:bg-bg-secondary transition"
    >
      Naechste 30 Tage
    </button>
    <button
      onClick={() => {
        setFromDate("");
        setToDate("");
      }}
      className="text-xs px-2 py-1 border border-border rounded text-text-secondary hover:bg-bg-secondary transition"
    >
      Alle
    </button>
  </div>
</div>
```

Default-Werte:
- `fromDate` = Heute (automatisch gesetzt beim Mount)
- `toDate` = Leer (= zeige alles in der Zukunft)

Diese Werte muessen als URL-Parameter reflektiert werden: `?from=2026-03-20&to=2026-03-25`

#### 10b. Datums-Parameter in app/events/page.tsx

Die Server-Action muss die Date-Range auf die Supabase-Query anwenden:

```typescript
// In app/events/page.tsx
const fromDate = searchParams.from ? new Date(searchParams.from).toISOString() : new Date().toISOString();
const toDate = searchParams.to ? new Date(searchParams.to).toISOString() : null;

let query = supabase
  .from("events")
  .select("*, hosts(name, slug)")
  .eq("is_public", true)
  .eq("status", "published")
  .gte("start_at", fromDate);  // Startdatum: ab fromDate

if (toDate) {
  query = query.lte("start_at", toDate);  // Enddatum: bis toDate
}

// Weitere Filter (Tag, Suchtext) wie zuvor...
```

Wichtig: Der `start_at` Vergleich ist RICHTIG (nicht `end_at`), da Nutzer Events nach STARTDATUM filtern moechte.

#### 10c. Radius-Filter in die Event-Liste integrieren

Der Radius-Filter existiert bereits (V3), aber es gibt zwei Probleme:
1. Die gefilterte Event-Liste wird nicht angezeigt
2. Der Radius-Parameter wird nicht immer benutzt

**Fix:**

In `components/EventList.tsx` oder einer neuen Wrapper-Komponente (`EventListFiltered.tsx`):

```typescript
import { haversineKm } from "@/lib/geo";

export function filterByRadius(
  events: Event[],
  userLat: number | null,
  userLng: number | null,
  radiusKm: number
): Event[] {
  // Wenn kein Standort gesetzt, gib alle Events
  if (!userLat || !userLng) {
    return events;
  }

  const withDistance = events.map(event => ({
    ...event,
    _distance: event.geo_lat && event.geo_lng
      ? haversineKm(userLat, userLng, event.geo_lat, event.geo_lng)
      : null
  }));

  // Events im Radius: nach Entfernung sortiert
  const inRadius = withDistance
    .filter(e => e._distance !== null && e._distance <= radiusKm)
    .sort((a, b) => (a._distance! - b._distance!));

  // Events ohne Geo-Daten: am Ende
  const noGeo = withDistance.filter(e => e._distance === null);

  return [...inRadius, ...noGeo];
}

// In der Komponente:
const filteredByRadius = filterByRadius(events, userLat, userLng, radius);

// Render
return (
  <div>
    <p className="text-sm text-text-secondary mb-4">
      {filteredByRadius.length} Events gefunden
    </p>
    {filteredByRadius.map(event => (
      <EventCard key={event.id} event={event} />
    ))}
  </div>
);
```

#### 10d. Alle Filter kombinieren (Single Source of Truth)

Die Event-Filterung muss EINEN Platz haben, wo alle Filter (Radius + Tag + Datum + Suchtext) kombiniert werden:

**Empfohlene Struktur:**

```
app/events/page.tsx (Server)
  → Liest searchParams: ?tag=breathwork&q=kakao&from=2026-03-20&to=2026-03-25&radius=25&plz=22145
  → Ladet Events von Supabase (mit Tag-, Datumsbereich-, Suchtext-Filtern)
  → Uebergibt filteredEvents + userLat/userLng/radius an Client-Komponenten

<EventMapWrapper> (Client)
  → Appliziert clientseitig Radius-Filter auf Events (haversine)
  → Teilt die gefilterten Events mit <EventMap> und <EventList>
  → Zeigt Filterzusammenfassung (Chips)

<EventMap>
  → Zeigt Marker NUR fuer gefilterte Events
  → Circle zeigt aktuellen Radius

<EventList>
  → Zeigt gefilterte Events, sortiert nach Entfernung
  → "X Events gefunden" counter reflektiert gefilterte Anzahl
```

#### 10e. Filter-Summary-Chips

Oberhalb der Event-Liste: Aktive Filter als Chips mit Loeschen-Button

```tsx
// In EventMapWrapper.tsx oder app/events/page.tsx

<div className="mb-6 flex flex-wrap gap-2 items-center">
  {/* Tag-Chip */}
  {selectedTag && (
    <div className="inline-flex items-center gap-2 px-3 py-1 bg-bg-secondary border border-border rounded text-text-primary text-sm">
      <span>{selectedTag}</span>
      <button
        onClick={() => /* Navigiere ohne Tag-Param */}
        className="ml-1 font-bold text-text-secondary hover:text-text-primary"
      >
        ×
      </button>
    </div>
  )}
  
  {/* Radius-Chip */}
  {userLat && userLng && (
    <div className="inline-flex items-center gap-2 px-3 py-1 bg-bg-secondary border border-border rounded text-text-primary text-sm">
      <span>{radius} km um {plz}</span>
      <button
        onClick={() => /* Navigiere ohne Standort-Param */}
        className="ml-1 font-bold text-text-secondary hover:text-text-primary"
      >
        ×
      </button>
    </div>
  )}
  
  {/* Datumsbereich-Chip */}
  {(fromDate || toDate) && (
    <div className="inline-flex items-center gap-2 px-3 py-1 bg-bg-secondary border border-border rounded text-text-primary text-sm">
      <span>
        {fromDate ? new Date(fromDate).toLocaleDateString("de-DE", { month: "short", day: "numeric" }) : ""}
        {toDate ? " – " + new Date(toDate).toLocaleDateString("de-DE", { month: "short", day: "numeric" }) : ""}
      </span>
      <button
        onClick={() => /* Navigiere ohne Datumsbereich */}
        className="ml-1 font-bold text-text-secondary hover:text-text-primary"
      >
        ×
      </button>
    </div>
  )}
  
  {/* "Alles Clear"-Button falls Filter aktiv */}
  {(selectedTag || userLat || fromDate) && (
    <button
      onClick={() => /* Navigiere ohne alle Filter */}
      className="text-xs underline text-text-secondary hover:text-text-primary"
    >
      Filter loeschen
    </button>
  )}
</div>
```

#### 10f. URL-State Management

Alle Filter muessen in den URL-Parametern stehen. Helper-Funktion fuer URL-Updates:

```typescript
// lib/filter-utils.ts

export function buildFilterUrl(params: {
  tag?: string;
  q?: string;
  from?: string;
  to?: string;
  plz?: string;
  radius?: number;
}): string {
  const searchParams = new URLSearchParams();
  
  if (params.tag) searchParams.set("tag", params.tag);
  if (params.q) searchParams.set("q", params.q);
  if (params.from) searchParams.set("from", params.from);
  if (params.to) searchParams.set("to", params.to);
  if (params.plz) searchParams.set("plz", params.plz);
  if (params.radius) searchParams.set("radius", params.radius.toString());
  
  return `/events?${searchParams.toString()}`;
}

// Benutzung:
const url = buildFilterUrl({
  tag: "breathwork",
  from: "2026-03-20",
  to: "2026-03-25",
  radius: 25,
  plz: "22145"
});
// → "/events?tag=breathwork&from=2026-03-20&to=2026-03-25&radius=25&plz=22145"
```

### Dateien die geaendert/erstellt werden:

- `components/EventFilters.tsx` — Date-Range Inputs + Quick-Select Buttons, Update URL onchange
- `app/events/page.tsx` — Liest from/to Params, appliziert auf Supabase Query, dokumentiert die Logik
- `components/EventMapWrapper.tsx` — Appliziert Radius-Filter client-seitig (haversineKm), zeigt Filter-Chips, teilt gefilterte Events mit Map + List
- `components/EventList.tsx` — Empfaengt gefilterte Events, zeigt "X Events gefunden"
- `components/EventMap.tsx` — Empfaengt gefilterte Events, zeigt nur diese Marker
- `lib/filter-utils.ts` (neu) — Helper fuer URL-Konstruktion

### Design-Tokens (Tailwind v4)

Nutze IMMER diese vordefinierten Tokens, KEINE hardcodierten Hex-Codes:

- `bg-primary: #faf6f1` — Seiten-Hintergrund
- `bg-secondary: #f0e8de` — Hover/Secondary Background
- `bg-card: #ffffff` — Karten
- `text-primary: #2c2418` — Haupttext
- `text-secondary: #6b5b4e` — Sekundaertext
- `text-muted: #9a8b7a` — Sehr heller Text
- `accent-primary: #b5651d` — Buttons, aktive Filter, CTA
- `accent-secondary: #7b6d4e` — Sekundaerer Akzent
- `accent-sage: #8b9d77` — Gruen (falls noetig)
- `border: #e5ddd3` — Linien, Borders

**Tailwind v4 Syntax:**
- Gradient: `bg-linear-to-br` NICHT `bg-gradient-to-br`
- Farben: `text-text-primary`, `bg-bg-card`, `border-border` (mit Praefix!)
- Keine hardcodierten Farben im Code

### Ueberpruefung vor Abschluss

```bash
npm run build
```

Sicherstellen dass:
- Keine TypeScript Fehler
- Keine Tailwind Warnings
- Build abgeschlossen erfolgreich

### Reihenfolge (empfohlen)

1. **10a:** Date Range Filter UI in EventFilters.tsx (15 Min)
2. **10b:** Date Range Query in app/events/page.tsx (10 Min)
3. **10c:** Radius-Filter in EventList.tsx applizieren (15 Min)
4. **10d:** Alle Filter kombinieren in EventMapWrapper (15 Min)
5. **10e:** Filter-Chips UI (10 Min)
6. **10f:** URL-State Management (10 Min)
7. **Build & Test:** `npm run build` (5 Min)

**Gesamt: ~80 Min**

---

## Abhaengigkeiten

- V3 (Radius-Filter, Suche, Impressum/Datenschutz) muss fertig sein
- `lib/geo.ts` mit `haversineKm` Funktion muss existieren
- Supabase Events-Tabelle muss `start_at`, `end_at`, `geo_lat`, `geo_lng` Felder haben
- Tailwind v4 muss richtig konfiguriert sein (siehe CLAUDE.md)

---

## Lessons Learned

### Radius-Filter von V3

Bekannte Issues:
- Radius-Filter in V3 war nur visuell (Circle auf Map), filterte nicht die Liste
- Diese Aufgabe behebt das (10c)

### Datum-Filterung

- `start_at` wird verglichen, NICHT `end_at` (Nutzer filtert nach Starttag)
- Default "fromDate" = heute
- Default "toDate" = leer (= unendlich in die Zukunft)

### Kombinierte Filter

Das ist die Komplexitaet: Wenn 4 Filter aktiv sind, muessen ALLE 4 kombiniert werden mit AND-Logik. Das ist nicht automatisch — musste bewusst koordiniert werden.

Loesung: Single Source of Truth (EventMapWrapper oder events/page.tsx) appliziert alle Filter und uebergibt nur die gefilterte Event-Liste an alle Subkomponenten.
