# Landing Page Redesign — Das Portal

> **Rolle:** Du bist Senior Frontend-Entwickler + UX-Copywriter mit tiefem Verständnis für die spirituelle/ganzheitliche Szene in Deutschland.
> **Kontext:** Lies CLAUDE.md, PORTAL-KONTEXT.md und die Competitive Analysis unten.
> **Wichtig:** Tailwind v4 Syntax! Keine hardcodierten Farben — nur Design-Tokens aus globals.css.

## Bereits umgesetzte Änderungen (NICHT reverten!)

Folgende Änderungen wurden bereits gemacht und sind im Code. Bitte NICHT rückgängig machen:

- **app/page.tsx** — Hero, How-it-works, Social Proof (3 Zahlen), Facilitator-Spotlight Query bereits eingebaut
- **app/events/page.tsx** — Quick-Links entregionalisiert, Wording aktualisiert ("Bewusste Events entdecken")
- **app/fuer-facilitators/page.tsx** — Region-Referenz entfernt, Social Proof, Vergleichstabelle, FAQ hinzugefügt
- **components/Navbar.tsx** — "Raumhalter:innen" Link auf /anbieter bereits eingefügt

**Was noch fehlt und gebaut werden muss:**
1. **app/anbieter/page.tsx** — Neue Seite (Host-Übersicht mit Suche/Filter)
2. **components/HostCard.tsx** — Host-Card Komponente
3. **components/HostFilters.tsx** — Filter (Client Component)
4. **components/MobileNav.tsx** — "Raumhalter:innen" Link hinzufügen
5. **Startseite: Raumhalter:innen-Wording** — "Anbieter:innen" → "Raumhalter:innen" auf der Startseite durchziehen
6. **Trust-Sektion + Kategorie-Kacheln + Städte-Links** — prüfen ob vollständig umgesetzt

---

## Strategischer Kontext

Das Portal positioniert sich NEU: Weg von "Events in SH & Hamburg" → hin zu **"Bewusste Events in ganz Deutschland"**.

### USPs gegenüber Wettbewerbern (aus Competitive Analysis)

| Wir | Tribehaus | Lumaya | MiteinanderSein | Eventbrite |
|-----|-----------|--------|-----------------|------------|
| Komplett kostenlos | Spendenmodell | Unklar | Ab 39€/Jahr | Commission |
| Eigene Host-Profilseiten | Keine | Keine | Verzeichnis-Einträge | Keine |
| SEO-optimierte Detailseiten | Schwach | Schwach | Schwach | Stark |
| Automatisierte Pipeline | Manuell | Manuell | Manuell | Manuell |
| Community + Discovery | Community | Transaktional | Netzwerk | Marketplace |

### Zielgruppen-Shift: "Conscious Explorer" statt "Conscious Native"
- Nicht die Leute ansprechen, die schon 10 Jahre meditieren
- Sondern: Menschen, die ihr erstes Breathwork, ihre erste Kakao-Zeremonie suchen
- Messaging: einladend, neugierig, warm — nicht esoterisch oder gatekeeping

### Branding: "Raumhalter:in" als Plattform-Begriff

**"Raumhalter:in"** ist der offizielle Begriff für Hosts/Facilitators/Anbieter:innen auf Das Portal.
Bedeutung: Jemand der "einen Raum hält" — im übertragenen Sinne. Raum für Transformation, für Erfahrung, für Wachstum.

- Überall wo bisher "Anbieter:in" oder "Facilitator" steht → **"Raumhalter:in"** verwenden
- Ausnahme: Die B2B-Seite /fuer-facilitators darf weiterhin "Anbieter:in" als Fallback nutzen (weil Suchende diesen Begriff kennen)
- In der Navbar heißt der Link bereits "Raumhalter:innen" (→ /anbieter)
- Auf der Startseite, Host-Übersicht und Trust-Sektion konsequent "Raumhalter:in" verwenden
- Der Begriff ist ein Differenzierungsmerkmal — kein Wettbewerber hat einen eigenen Plattform-Begriff

### Zukünftig: Nutzer-Profile / Member-Konzept (NICHT in diesem Sprint)

Wichtige Erkenntnis aus dem Tribehaus Deep-Dive: **Members können auch einfach Endnutzer sein** — nicht nur Anbieter:innen/Raumhalter:innen. Bei Tribehaus haben auch Teilnehmer:innen Profile.

Für Das Portal bedeutet das:
- Phase 1 (jetzt): /anbieter zeigt nur Hosts/Raumhalter:innen
- Phase 2+: Eigene Profile für Teilnehmer:innen → "Mein Profil", Favoriten, besuchte Events
- Das Datenmodell sollte darauf vorbereitet sein: `users`-Tabelle (Supabase Auth) ≠ `hosts`-Tabelle
- Ein User kann SOWOHL Teilnehmer:in ALS AUCH Raumhalter:in sein
- Langfristig: Community-Features (Teilnehmer:innen vernetzen sich, sehen wer noch zum Event geht)

→ Jetzt nicht bauen, aber im Kopf behalten bei der /anbieter-Architektur.

### Zukünftig: Locations/Räume + 1:1 Angebote (NICHT in diesem Sprint)

Idee für Phase 2+: Locations als eigene Entität (Yoga-Studios, Seminarräume, Retreat-Häuser).
Raumhalter:innen KÖNNEN auch Locations anbieten, müssen aber nicht.
Ein Yogastudio-Besitzer könnte beides sein: Raumhalter:in (bietet Kurse) + Location-Anbieter:in (vermietet Räume).
→ Jetzt nicht bauen, aber im Datenmodell berücksichtigen (z.B. hosts.type oder separate locations-Tabelle).

### Tribehaus Deep-Dive: Features die wir übernehmen/adaptieren

Tribehaus (tribehaus.org) ist der engste Wettbewerber. Deep-Dive am 04.04.2026 durchgeführt.
Sie haben 4 Entitäten: Events, 1:1 Angebote, Locations, Members. 188 Members, 1.119 Einträge, 39 Städte.

#### JETZT übernehmen (in diesem Sprint für /anbieter + Host-Profile):

1. **"In der Nähe"-Logik mit km-Angabe**
   - Tribehaus zeigt bei jedem Profil "Members in der Nähe" mit Entfernung (z.B. "11.9 km")
   - Für Das Portal: Auf der /anbieter Seite "Raumhalter:innen in deiner Nähe" Button
   - Auf Host-Profilseiten: "Weitere Raumhalter:innen in der Nähe" Sidebar/Sektion
   - Technisch: Geolocation API + Haversine-Distanz aus geo_lat/geo_lng der Events

2. **Sortier-Optionen auf /anbieter**
   - Tribehaus: Standard, Bewertungen, Neueste, Entfernung
   - Für Das Portal: "Meiste Events" (default), "Alphabetisch", "Neueste", "In deiner Nähe"
   - "In deiner Nähe" = Geolocation-basiert, zeigt Entfernung an

3. **Karten- und Listenansicht umschaltbar**
   - Tribehaus hat Toggle: Karte | Liste
   - Für Das Portal: Gleiches Pattern auf /anbieter (wir haben Leaflet bereits)
   - Host-Pins auf der Karte basierend auf häufigster Event-Location

4. **Beruf/Beschäftigung Feld**
   - Tribehaus zeigt pro Member: "Körperorientiertes Beziehungscoaching" o.ä.
   - Für Das Portal: `hosts.tagline` oder `hosts.profession` Feld (neues DB-Feld)
   - Wird auf HostCard und Host-Profilseite prominent angezeigt

5. **Foto-Galerie auf Profilen**
   - Tribehaus hat 4-6 Fotos pro Member mit Galerie-Viewer
   - Für Das Portal: `hosts.gallery_urls` (jsonb Array) — optional, aber wertvoll
   - Für jetzt: Mindestens Avatar prominent + Platzhalter "Bald mit Galerie"

6. **Programmatic SEO City-Pages (Startseite Footer)**
   - Tribehaus hat: Top 5 Länder, Bundesländer, Regionen pro Entität
   - Für Das Portal: Am unteren Ende der Startseite und /anbieter Seite:
     "Beliebte Regionen: Hamburg | Berlin | Köln | München | Kiel | Flensburg"
   - Links auf `/anbieter?city=Hamburg`, `/events?city=Hamburg`
   - Später: Statische City-Pages `/anbieter/hamburg` für SEO

7. **Kontaktformular / Anfrage senden**
   - Tribehaus: "Unverbindliche Anfrage senden" auf jedem Profil
   - Für Das Portal: Einfacher "Nachricht senden" Button auf Host-Profilseiten
   - Phase 1: Mailto-Link an Host-Email oder Link zum Kontaktformular
   - Phase 2: Eingebautes Kontaktformular mit E-Mail-Weiterleitung

#### SPÄTER übernehmen (Phase 2+):

8. **Bewertungssystem**
   - Tribehaus: Gesamteindruck (1-5 Sterne), Bewertungstexte, Anzahl Bewertungen
   - Für Das Portal: Eigene Tabelle `reviews` (host_id, reviewer_name, rating, text, created_at)
   - Dimensionen: Kommunikation, Professionalität, Leistung, Empathie (wie Tribehaus)
   - Sortierung nach Bewertung auf /anbieter
   - **Nicht in diesem Sprint** — braucht Moderation + Spam-Schutz

9. **1:1 Angebote als eigene Entität**
   - Tribehaus: Separate Seite /angebote mit Filtern nach Kategorie + Format
   - Formate: Beratung/Coaching, Massage, Behandlung, Session...
   - Für Das Portal: `offerings` Tabelle (host_id, title, description, format, price, categories)
   - Eigene Seite /angebote + Verknüpfung mit Host-Profil
   - **Nicht in diesem Sprint** — erst nach Launch

10. **Locations als eigene Entität**
    - Tribehaus: Art des Orts, Räumlichkeiten (Toilette, Seminarraum, Küche...), Fläche, Übernachtung, Miet-Details
    - Für Das Portal: `locations` Tabelle (name, address, type, facilities, area_sqm, overnight, rentable, host_id)
    - Eigene Seite /locations + Karte + Filter
    - **Nicht in diesem Sprint** — erst nach 1:1 Angebote

11. **Premium/Promoted Listings**
    - Tribehaus: PREMIUM-Events/Members/Locations werden bevorzugt in "in der Nähe" und "Beliebte" angezeigt
    - Für Das Portal: hosts.is_premium Boolean + promoted Sortierung
    - Monetarisierung: Premium-Raumhalter:innen zahlen für bevorzugte Sichtbarkeit
    - **Nicht in diesem Sprint** — erst mit Stripe-Integration

12. **Claim-Flow "Das ist mein Eintrag"**
    - Tribehaus: "Eintrag verbessern" → "Das ist mein Eintrag → Zum Login" ODER "Ich bin Besucher → Formular"
    - Das Portal hat bereits einen Claim-Link auf Host-Profilen → Auth muss erst reaktiviert werden

---

## Phase 1: Startseite (/) — Komplett-Überarbeitung

### Aktueller Zustand (app/page.tsx)
- Hero + 4 Event-Previews + Kategorie-Kacheln + Telegram CTA
- Zu dünn, kein Trust, kein Storytelling, keine Facilitator-Sichtbarkeit

### Neue Sektionen (von oben nach unten)

#### 1.1 Hero — Überarbeitet

```
Headline: "Entdecke bewusste Events in deiner Nähe"
Subline: "Breathwork, Yoga, Sound Healing, Kakao-Zeremonien und mehr —
          finde Facilitators und Erlebnisse, denen du vertrauen kannst."

CTA 1: "Events entdecken" → /events (bg-accent-primary)
CTA 2: "Raumhalter:innen entdecken" → /anbieter (border style, NEU)

Social Proof (3 Zahlen):
- [X]+ Events
- [X]+ Raumhalter:innen
- [X]+ Städte (NEU — Count distinct cities from events)
```

**Hinweise:**
- "in ganz Deutschland" nicht als Fließtext, sondern durch die Städte-Zahl impliziert
- Behalte das aktuelle Hero-Styling (rounded-3xl, gradient bg)
- Städte-Count: `SELECT COUNT(DISTINCT city_extracted) FROM events` — city muss aus `address` extrahiert werden (getCityFromAddress existiert in lib/event-utils.ts)

#### 1.2 "So funktioniert Das Portal" — NEU

Für Besucher:innen (NICHT Anbieter), 3 Schritte:

```
1. Stöbere    → "Finde Events und Anbieter:innen nach Ort, Kategorie oder Datum"
2. Entdecke   → "Lerne Facilitators kennen — ihre Arbeit, ihr Hintergrund, ihre Angebote"
3. Erlebe     → "Nimm teil an transformativen Erfahrungen in deiner Nähe"
```

**Design:** 3-Spalten-Grid (sm:grid-cols-3), nummerierte Kreise wie auf /fuer-facilitators "So funktioniert es", Farben: accent-sage, accent-primary, accent-secondary

#### 1.3 Nächste Events — Leicht angepasst

- 4 Event-Cards bleiben (bestehende Query + EventCard Komponente)
- NEU: Unter den Cards ein zusätzlicher Link:
  "Oder entdecke Raumhalter:innen in deiner Nähe →" → /anbieter
- Text-Style: text-sm text-accent-secondary hover:underline

#### 1.4 Kategorie-Kacheln — Überarbeitet

Bestehende Kategorien bleiben, aber visueller gestalten:

- Jede Kachel bekommt ein dezentes Icon/Symbol davor (Unicode oder Lucide)
- Zweite Reihe NEU: **Top-Städte** (dynamisch aus DB oder hardcoded Start)
  - Hamburg, Berlin, Köln, München, Kiel, Flensburg, Lübeck
  - Verlinkt auf: `/events?city=Hamburg` etc.
  - Style: ähnlich wie Kategorie-Kacheln aber in bg-bg-secondary statt bg-bg-card

#### 1.5 Raumhalter:innen-Spotlight — NEU

```
Headline: "Lerne unsere Raumhalter:innen kennen"
Subline: "Coaches, Heiler:innen und Facilitators — mit eigenen Profilen auf Das Portal."
```

- Zeige 4 Hosts mit: Avatar (oder Initial-Fallback), Name, Bio-Snippet (max 100 chars), Anzahl kommender Events
- Query: SELECT hosts mit JOIN auf events (count upcoming), ORDER BY event_count DESC, LIMIT 4
- Nur Hosts mit description anzeigen (claimed/vollständige Profile bevorzugen)
- Link-Button: "Alle Raumhalter:innen entdecken →" → /anbieter
- Card-Design: Ähnlich wie EventCard aber mit Avatar prominent, border border-border bg-bg-card rounded-2xl p-5

#### 1.6 Trust-Sektion — NEU

```
Headline: "Warum Das Portal?"
```

3 Punkte im Grid (sm:grid-cols-3):

1. **Kostenlos für Raumhalter:innen**
   "Kein Abo, keine Provision — jede:r kann Events und ein Profil kostenlos einstellen."

2. **Raumhalter:innen-Profile, die Vertrauen schaffen**
   "Keine anonymen Listings. Lerne die Menschen hinter den Events kennen."

3. **Community statt Marketplace**
   "Wir sind kein Ticketshop. Wir verbinden Menschen mit transformativen Erfahrungen."

Design: bg-bg-secondary rounded-3xl px-6 py-10 — ähnlich wie die aktuelle Telegram-Sektion

#### 1.7 Telegram CTA — Leicht angepasst

- Text wärmer machen:
  - Headline: "Bleib verbunden"
  - Subline: "Erhalte Event-Highlights direkt auf dein Handy — in unserem Telegram-Kanal."
- Bleibt sonst gleich

#### 1.8 Beliebte Regionen Footer — NEU (SEO, inspiriert von Tribehaus)

Tribehaus hat "Top 5 Länder, Bundesländer, Regionen" für jede Entität — starkes SEO-Pattern.

Für die Startseite am Ende (vor dem Footer):
```
Beliebte Regionen für Events: Hamburg | Berlin | Köln | München | Kiel | Flensburg | Lübeck | Hannover
Beliebte Kategorien: Yoga | Meditation | Breathwork | Tanz | Sound Healing | Kakao-Zeremonie | Schamanismus
```

Links: `/events?city=Hamburg`, `/events?kategorie=yoga` etc.
Style: Kompakt, text-sm text-text-muted, Links in text-text-secondary hover:text-accent-primary
Ähnlich wie eine Sitemap-Sektion — dezent, aber SEO-wirksam.

---

## Phase 2: Host-Übersicht (/anbieter) — NEUE SEITE

### Datei: app/anbieter/page.tsx (Server Component)

#### Hero
```
Überschrift: "Finde Raumhalter:innen in deiner Nähe"
Subline: "Coaches, Heiler:innen, Yogalehrer:innen und Facilitators —
          entdecke, wer in deiner Region bewusste Erlebnisse anbietet."
```

Design: Gleicher Hero-Style wie /events (rounded-3xl gradient)

#### Filter/Suche (Client Component: components/HostFilters.tsx)

Inspiriert von Tribehaus Members-Seite (Filtern, Karte, Liste, Sortieren):

- Freitextsuche (Name, Beschreibung) — Input-Feld
- Stadt-Filter (Dropdown, basierend auf häufigsten Städten aus Events der Hosts)
- Kategorie-Filter (basierend auf Event-Kategorien der Hosts)
- Sortierung: "Meiste Events" (default), "Alphabetisch", "Neueste", "In deiner Nähe"
- **View-Toggle: Liste | Karte** (wie Tribehaus — Leaflet-Map mit Host-Pins)
- **"In deiner Nähe" Button** — nutzt Browser Geolocation API
- URL-Params: ?q=, ?city=, ?sort=, ?view=map

#### Karten-Ansicht (wenn view=map)

- Leaflet-Map (dynamic import, kein SSR — wie bei Events)
- Pins für jeden Host basierend auf häufigster Event-Location (geo_lat/geo_lng)
- Popup bei Klick: Avatar, Name, Anzahl Events, Link zum Profil
- Clustering bei Zoom-Out

#### Host-Cards (components/HostCard.tsx)

Für jeden Host anzeigen (inspiriert von Tribehaus Member-Cards):
- Avatar (oder Initial-Fallback wie auf Host-Profilseite)
- Name (font-serif text-xl)
- **Tagline/Beruf** (z.B. "Körperorientiertes Beziehungscoaching") — aus hosts.description erste Zeile oder neues Feld
- Bio-Snippet (max 120 chars, text-text-secondary)
- Anzahl kommende Events (Badge: "3 kommende Events")
- Top-Kategorien als kleine Tag-Pills (aus Event-Tags, max 3)
- Häufigste Stadt + **km-Entfernung wenn Geolocation aktiv**
- Link: → /hosts/[slug]

Layout: grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6

#### "Raumhalter:innen in der Nähe" Sektion (unterhalb der Ergebnisse)

Wie Tribehaus "Members in der Nähe" — zeigt 4-6 weitere Hosts mit Entfernungsangabe.
Nur sichtbar wenn Geolocation aktiv oder Stadt-Filter gesetzt.

#### Beliebte Regionen Footer (SEO)

Am Ende der Seite (inspiriert von Tribehaus "Top 5 Bundesländer/Regionen"):
```
Beliebte Regionen: Hamburg | Berlin | Köln | München | Kiel | Flensburg | Lübeck
```
Links auf `/anbieter?city=Hamburg` etc. — später statische City-Pages für SEO.

#### Datenabfrage

```sql
-- Hosts mit Event-Count und häufigster Stadt
SELECT
  h.*,
  COUNT(e.id) FILTER (WHERE e.start_at >= NOW() AND e.is_public AND e.status = 'published') as upcoming_count,
  -- Stadt aus Events ableiten (häufigste)
  MODE() WITHIN GROUP (ORDER BY split_part(e.address, ',', -1)) as primary_city
FROM hosts h
LEFT JOIN events e ON e.host_id = h.id
GROUP BY h.id
ORDER BY upcoming_count DESC
```

In Supabase-Client-Syntax umsetzen. Alternativ: Hosts laden + für jeden Host einen Count-Query.
Pragmatischer Ansatz: Alle Hosts laden, Events per host_id gruppiert laden, im Server Component zusammenführen.

#### SEO

```typescript
export const metadata: Metadata = {
  title: "Anbieter:innen | Das Portal",
  description: "Finde Coaches, Heiler:innen und Facilitators in deiner Nähe. Entdecke Profile, Angebote und bewusste Events auf Das Portal.",
  alternates: { canonical: "/anbieter" },
};
```

Wenn city-Param gesetzt: `title: "Anbieter:innen in ${city} | Das Portal"`

#### "Kein Ergebnis" State

Wenn keine Hosts gefunden:
"Noch keine Anbieter:innen in dieser Stadt? Werde die erste:r!"
CTA → /fuer-facilitators#registrierung

---

## Phase 3: Anbieter-Seite (/fuer-facilitators) — Überarbeitung

### Änderungen (keine Neuschreibung, nur gezielte Edits):

1. **"Für wen" Sektion (Zeile ~146):**
   ALT: "Wenn du ganzheitlich arbeitest und in Schleswig-Holstein oder Hamburg aktiv bist, ist Das Portal für dich gemacht."
   NEU: "Wenn du ganzheitlich arbeitest, ist Das Portal für dich gemacht — egal wo in Deutschland."

2. **Social Proof hinzufügen** — nach der Hero-Sektion:
   ```
   [X]+ Anbieter:innen | [X]+ Events | [X]+ Städte
   ```
   Gleiche Counts wie auf der Startseite.

3. **NEU: Vergleichstabelle** — nach "Was Das Portal für dich tut":
   ```
   Headline: "Wie Das Portal sich unterscheidet"

   | | Das Portal | Eventbrite | Meetup | Lumaya |
   |---|---|---|---|---|
   | Kosten | Kostenlos | Commission | Ab 168€/Jahr | Unklar |
   | Eigenes Profil | Ja | Nein | Gruppen-Seite | Nein |
   | Zielgruppe | Bewusste Events | Alles | Hobbys | Retreats |
   | SEO-Profil | Ja | - | - | Nein |
   ```

   Als styled HTML-Tabelle, nicht als Markdown. Responsive: auf Mobile als Cards statt Tabelle.

4. **NEU: FAQ-Sektion** — vor dem Registrierungs-CTA:
   - "Kostet Das Portal etwas?" → Nein, komplett kostenlos.
   - "Wie werden Events importiert?" → Automatisch aus Community-Gruppen oder manuell.
   - "Kann ich mein Profil bearbeiten?" → Ja, nach Registrierung über dein Dashboard.
   - "Muss ich in einer bestimmten Region sein?" → Nein, Das Portal ist deutschlandweit offen.

   Design: Accordion oder einfache dl/dt/dd Liste. Kein JS nötig — `<details>/<summary>` reicht.

---

## Phase 4: Event-Sektion (/events) — Feinschliff

### Änderungen:

1. **Quick-Links überarbeiten (Zeile ~264-307):**
   Aktuell hardcoded Hamburg-lastig. Ersetzen durch breitere, nicht-regionale Links:
   ```
   Retreats | Workshops | Yoga | Meditation | Breathwork | Tanz | Sound Healing
   ```
   Keine Stadt mehr in den Quick-Links — dafür gibt's den City-Filter.

2. **Hero-Subline (Zeile ~243):**
   ALT: "Tanz, Meditation, Coaching und spirituelle Formate in deiner Nähe."
   NEU: "Bewusste Events, Workshops und Retreats — finde dein nächstes transformatives Erlebnis."

3. **Kategorie-Label (Zeile ~236):**
   ALT: "Ganzheitliche Event-Plattform"
   NEU: "Bewusste Events entdecken"

---

## Phase 5: Navbar-Update

### Änderung in components/Navbar.tsx:

Neuer Link zwischen "Events" und "Für Anbieter:innen":

```tsx
<Link
  href="/anbieter"
  className="rounded-full px-3 py-2 transition hover:bg-bg-secondary hover:text-text-primary"
>
  Anbieter:innen
</Link>
```

Reihenfolge: Logo | Events | **Raumhalter:innen** | Für Anbieter:innen | Telegram | Anmelden

Hinweis: Der Link "Raumhalter:innen" wurde bereits in der Navbar gesetzt (components/Navbar.tsx). Nur noch MobileNav.tsx anpassen.

Auch in MobileNav.tsx den Link hinzufügen.

---

## Umsetzungsreihenfolge

1. **Startseite (/)** — Phase 1 komplett umsetzen
2. **Host-Übersicht (/anbieter)** — neue Seite + HostCard + HostFilters
3. **Navbar** — neuen Link hinzufügen (+ MobileNav)
4. **Facilitator-Seite** — 4 gezielte Edits
5. **Event-Sektion** — 3 gezielte Edits
6. `npm run build` — sicherstellen dass alles kompiliert
7. Manueller Review im Browser

---

## Wording-Guidelines (für alle Seiten)

- **"bewusst/transformativ"** statt "spirituell/ganzheitlich" (inklusiver, weniger esoterisch)
- **"Facilitator" / "Anbieter:in"** statt "Coach" allein (breiter)
- **"Erlebnis/Erfahrung"** statt "Veranstaltung" (emotionaler)
- **"in deiner Nähe"** statt "in SH & Hamburg" oder "in ganz Deutschland" (persönlicher)
- **Keine Superlative** — kein "die beste Plattform", kein "einzigartig"
- **Du-Ansprache** durchgängig, warm aber nicht kumpelhaft
- Ton: Neugierig, einladend, vertrauensvoll — wie eine Empfehlung von einer Freundin

---

## Dateien die erstellt/geändert werden

### Neu:
- `app/anbieter/page.tsx` — Host-Übersichtsseite
- `components/HostCard.tsx` — Host-Card Komponente
- `components/HostFilters.tsx` — Filter-Komponente (Client Component)

### Geändert:
- `app/page.tsx` — Startseite komplett überarbeiten
- `app/fuer-facilitators/page.tsx` — 4 gezielte Edits
- `app/events/page.tsx` — 3 gezielte Edits
- `components/Navbar.tsx` — neuer Link
- `components/MobileNav.tsx` — neuer Link

### Referenz-Dateien (lesen, nicht ändern):
- `CLAUDE.md` — Projekt-Regeln, Design-Tokens, Tailwind v4
- `PORTAL-KONTEXT.md` — Business-Kontext
- `components/EventCard.tsx` — als Referenz für HostCard Design-Sprache
- `lib/types.ts` — Host + Event Interfaces
- `lib/event-utils.ts` — getCityFromAddress Helper
- `app/globals.css` — Design-Tokens
