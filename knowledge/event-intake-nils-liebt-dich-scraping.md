---
type: knowledge
category: event-intake
source: perplexity-research
date: 2026-04-13
owner: lennert
tags: [scraping, n8n, event-intake, nils-liebt-dich, portal-api]
---

# Event-Intake: nils-liebt-dich.de Scraping

Research-Notiz aus Perplexity-Session zur Frage, wie Events von [nils-liebt-dich.de](https://nils-liebt-dich.de/) in das Portal importiert werden können. Relevant für den n8n Event-Intake Workflow.

## Kern-Erkenntnisse

### Technische Struktur der Quelle
- **Frontend-Typ:** Client-seitiges SPA mit Hash-Routes (`#/Register`, `#/imprint`, `#/events`), RequireJS-basiert
- **Interne API:** Seite nutzt einen Webservice unter `/WebService/api/`
- **Detail-Endpoint:** Frontend ruft `EventDetailsByID(event)` für Einzelansichten auf
- **Weitere API-Funktionen:** `event/registerToEvent`, `event/registerExternalClick`, `event/duplicateEvent`
- **Bedeutung:** Eventdaten existieren strukturiert als JSON hinter der API, nicht nur als HTML-Listing

### Was im HTML-Listing schon verfügbar ist
Auf der Startseite bereits sichtbar pro Event: Datum/Uhrzeit, Kategorien, Titel, Veranstalter, Ort, Teaser, Status (z.B. "Noch Plätze verfügbar" / "Ausverkauft / Warteliste"), teilweise E-Mail.

### Scraping-Strategie (zwei Ebenen)
1. **Listing-Scrape:** HTML der Startseite parsen für Event-Basisdaten + IDs extrahieren
2. **Detail-API:** Pro ID den `EventDetailsByID` Endpoint nachladen für volle Daten (description, cover_image, ticket_link, price_amount, etc.)

Reines HTML-Parsing reicht für Basis-Felder, API-Call ist nötig für komplettes Portal-Schema.

## Architektur-Learning: API-First statt Direct-Insert

### Das Problem
Erster Versuch: n8n → direkter Supabase-Insert. Fehlschlag mit `null value in column "slug" of relation "events" violates not-null constraint`.

### Die Lesson
**Niemals direkt in die DB schreiben, immer über die Portal-API** (`POST https://www.das-portal.online/api/events/import`).

**Warum:**
- Slug-Generierung, Validierung, Defaults, Dedup-Logik und Bildverarbeitung gehören in die API
- Direkter DB-Insert umgeht Business-Logik und scheitert an Constraints
- n8n wird zum reinen Importer/Enricher: NILS abrufen → mappen → Geocode → POST an API

**Merksatz:** API first, DB second.

## Portal-Schema vs. Rohdaten (Feld-Mapping)

| Portal-Feld | Quelle / Logik |
|---|---|
| `title` | Direkt aus Detail-API |
| `description` | Volltext aus Detail, nicht Teaser |
| `description_html` | HTML-Version aus Detail |
| `start_at` / `end_at` | Aus Detaildaten |
| `location_name` / `address` | Aus Detail oder Listing |
| `geo_lat` / `geo_lng` | Nachträglich per Geocoder (Nominatim) |
| `cover_image_url` | Bildfeld aus Detail |
| `tags` | Kategorien aus Listing + Detail |
| `price_model` | Heuristik aus Preistext (`free`, `paid`, `donation`, `external`) |
| `price_amount` | Freitext (`35 €`, `ab 120 €`, `Spende`) |
| `ticket_link` | Externer/interner Anmeldelink |
| `event_format` | Heuristik: `retreat`, `festival`, `workshop`, `kurs`, `kreis`, `event` |
| `is_online` | Heuristik auf "online/Zoom" in Beschreibung |
| `source_type` | `'nils_liebt_dich'` (hardcoded im n8n-Node) |
| `source_event_id` | Event-ID aus API → **kritisch für Dedup/Upsert** |

## n8n HTTP-Request Node: Best Practices

### Body-Format (Expression-Fehler vermeiden)
Bei "Using JSON" in n8n **kein `JSON.stringify(...)`** verwenden — n8n erwartet ein Objekt-Expression, sonst landet ein String im Body.

Richtig:
```javascript
{{ ({
  source_type: 'nils_liebt_dich',
  source_event_id: $json.source_event_id || null,
  title: $json.title || null,
  // ...
}) }}
```

### Pflicht-Felder für Intake
Immer mitschicken:
- `source_type` (für Routing/Provenance)
- `source_event_id` (für Dedup-Logik in der API)
- `description` + `description_html` (falls Quelle beides liefert)

## Offene Punkte für den Workflow

- [ ] NILS-API konkret auflösen: exakte URL + Request-Format für `EventDetailsByID`
- [ ] City-Extractor in n8n Map-to-Schema (bisher nicht sauber extrahiert)
- [ ] Prüfen ob `/api/events/import` auf Portal-Seite alle diese Felder bereits akzeptiert
- [ ] Geocoding-Fallback wenn NILS keine Koordinaten liefert
- [ ] Duplicate-Detection: `source_type + source_event_id` als Unique-Key

## Rechtliches
Vor produktivem Scraping prüfen: `robots.txt`, Nutzungsbedingungen, Abruffrequenz. Read-only Scraper auf öffentlich sichtbares Listing ist technisch machbar, juristisch klären.

## Siehe auch
- [[CLAUDE-CODE-EVENT-INTAKE]] — Portal API Event-Intake Pipeline
- Telegram Scraper Pipeline (analoger Flow für Telegram-Events)
