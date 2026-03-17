# Portal V2 — Website-Verbesserungen

## Kontext
Die n8n Event Pipeline ist live. Events werden aus Telegram importiert, Geocoding und Default-Bilder funktionieren. Jetzt geht es um UX-Verbesserungen auf der Website.

Referenz für den vollständigen Backlog: Obsidian Vault → 05-Knowledge/Das-Portal/Portal-Backlog.md

---

## Aufgabe 1: Event-Karten klickbar machen

### Problem
Auf der Event-Übersicht (`/events`) sind die Event-Karten nicht klickbar. Nur der "Details"-Button funktioniert.

### Lösung
In `components/EventCard.tsx`: Die gesamte Karte in einen `<Link>` wrappen oder `onClick` mit `router.push()` auf die Event-Detailseite. Der "Details"-Button kann bleiben, aber die ganze Karte soll auch klickbar sein.

```tsx
<Link href={`/events/${event.slug}`} className="block group">
  <div className="... cursor-pointer group-hover:shadow-lg transition-shadow">
    {/* bestehender Karten-Inhalt */}
  </div>
</Link>
```

Optional: Hover-Effekt (leichter Schatten oder Scale).

---

## Aufgabe 2: Sortierung — Upcoming als Standard

### Problem
Events sind unsortiert/chaotisch. Standard sollte "Upcoming" sein (nächstes Event zuerst).

### Lösung
In `app/events/page.tsx` bzw. der Supabase Query:

1. **Standard-Sortierung**: `.order('start_at', { ascending: true })`
2. **Vergangene Events ausblenden**: `.gte('start_at', new Date().toISOString())`
3. **Sortier-Dropdown** (optional, kann auch später kommen):
   - Datum (Standard)
   - Entfernung (wenn Browser-Standort verfügbar)
   - Neu gelistet

```typescript
// Basis-Query
const { data: events } = await supabase
  .from('events')
  .select('*, hosts(name, slug, avatar_url)')
  .eq('is_public', true)
  .eq('status', 'published')
  .gte('start_at', new Date().toISOString())
  .order('start_at', { ascending: true });
```

---

## Aufgabe 3: Veranstalter auf Event-Karten anzeigen

### Problem
Alle Events zeigen "Unbekannter Veranstalter" — obwohl Hosts in der DB angelegt sind.

### Lösung
Die Supabase Query muss den Host mit-joinen (siehe oben: `hosts(name, slug, avatar_url)`). In `EventCard.tsx` den Host-Namen anzeigen:

```tsx
<p className="text-text-secondary text-sm">
  {event.hosts?.name || "Unbekannter Veranstalter"}
</p>
```

---

## Aufgabe 4: Event-Detailseite verbessern

### Datei: `app/events/[slug]/page.tsx`

### Gewünschte Struktur (von oben nach unten):

1. **Hero-Bild**: Event-Cover groß oben (Telegram-Bild oder Default)
2. **Event-Titel** (h1)
3. **Quick-Info-Box** (strukturiert):
   - 📅 Datum + Uhrzeit (Start bis Ende)
   - 📍 Ort + Adresse (mit Google Maps Link)
   - 💰 Preis
   - 🏷 Tags als Badges
4. **CTA-Button**: "Jetzt anmelden" → ticket_link (wenn vorhanden)
5. **Beschreibungstext** (der ausführliche, schöne Text)
6. **Facilitator-Box**:
   - Wenn Host zugeordnet UND Host ist nicht "Unbekannt": Avatar, Name, kurze Bio, Link zur Host-Seite
   - Wenn kein Host oder "Unbekannt": CTA-Box "Ist das dein Event? Registriere dich als Facilitator und verwalte dein Listing."
7. **Karte** (Leaflet Map wie auf Übersichtsseite, aber nur dieses eine Event)
8. **Kalender-Buttons**:
   - "Zu Google Calendar hinzufügen" (als Link: `https://calendar.google.com/calendar/render?action=TEMPLATE&text=...&dates=...&location=...`)
   - "Zu Apple Calendar hinzufügen" (ICS Download, das bleibt)
   - Beide nebeneinander als Buttons

### Google Calendar Link Format:
```
https://calendar.google.com/calendar/render?action=TEMPLATE&text={title}&dates={startISO}/{endISO}&location={location}&details={description}
```
Datum-Format für Google: `20260315T170000Z` (ohne Bindestriche)

---

## Aufgabe 5: Geocoding verbessern

### Problem
Nur 2 von 9 Events haben Geodaten. Nominatim findet die Locations nicht.

### Lösungsansätze
1. **Query-Strategie verbessern**: Erst `location_name + Stadt`, dann nur `location_name`, dann nur `Stadt`
2. **Stadt aus Gruppen-Name ableiten**: `ConsciousCommunityHamburg` → Fallback-Stadt "Hamburg"
3. **Stadt als separates Feld im AI-Extraction mitgeben**: Der OpenAI-Node sollte auch eine `city` extrahieren
4. **Geocoding-Query in route.ts anpassen**:

```typescript
// Mehrere Versuche
const queries = [
  body.address,                                          // Volle Adresse
  `${body.location_name} ${body.city || ''}`.trim(),     // Location + Stadt
  body.location_name,                                     // Nur Location
  body.city || 'Hamburg',                                 // Nur Stadt als Fallback
].filter(Boolean);

let geo = null;
for (const query of queries) {
  geo = await geocode(query);
  if (geo) break;
}
```

---

## Aufgabe 6: Landing Page Strategie-Pivot

### Problem
Die Landing Page richtet sich aktuell an Facilitators (Warteliste, "Dein Event listen"). Die Plattform hat jetzt aber öffentliche Events — die Startseite sollte sich an EVENT-BESUCHER richten.

### Neue Struktur Startseite:

**Above the fold:**
- Headline: "Entdecke ganzheitliche Events in deiner Nähe" (o.ä.)
- Subline: "Breathwork, Yoga, Sound Healing, Kakao-Zeremonien und mehr — in Hamburg & Schleswig-Holstein"
- CTA Primary: "Events entdecken" → /events
- CTA Secondary: "Du bist Facilitator?" → /fuer-facilitators
- Optional: Telegram-CTA "Tägliche Event-Updates auf Telegram" → t.me/dasgrosseportal

**Below the fold (optional):**
- 3-4 nächste Events als Preview-Karten
- Kategorie-Übersicht (Breathwork, Yoga, Sound Healing etc. als klickbare Kacheln)
- Social Proof / Community-Zahlen ("X Events diesen Monat")

### Facilitator-Unterseite (`/fuer-facilitators`):
- Bisheriger Wartelisten-Content hierhin verschieben
- Erklärt: Warum Events hier listen, wie es funktioniert, Warteliste/Registrierung
- Header-Link: "Für Facilitators" oder "Event einstellen"

### Navbar anpassen:
- Events | Für Facilitators | Telegram → @dasgrosseportal

### Warteliste:
- Auf Startseite entfernen oder reduzieren
- Haupt-CTA wird Telegram-Kanal
- Warteliste nur noch auf /fuer-facilitators für Facilitator-Registrierung

---

## Reihenfolge

1. Event-Karten klickbar (5 Min Fix)
2. Sortierung Upcoming (10 Min Fix)
3. Veranstalter-Name auf Karten (10 Min Fix)
4. Event-Detailseite (30-60 Min)
5. Geocoding verbessern (20 Min)
6. Landing Page Pivot (60-90 Min, eigene Session)
