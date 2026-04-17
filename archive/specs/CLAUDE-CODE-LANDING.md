# Landing Page + Warteliste – Prompt für Claude Code

Lies als Erstes `PORTAL-KONTEXT.md` im Projekt-Root. Dort steht der gesamte Business-Kontext (Geschäftsmodell, Zielgruppe, Wettbewerb, Roadmap).

Es existieren bereits Vorlage-Dateien für die Landing Page und Warteliste. Deine Aufgabe: **prüfe, verbessere und vervollständige** diese Dateien. Teste nach jedem Abschnitt mit `npm run build`.

---

## 0. Kontext lesen & Rebranding "Portal" → "Das Portal"

Lies `PORTAL-KONTEXT.md` und `portal-bauplan.md` um das Projekt zu verstehen.

### WICHTIG: Rebranding auf "Das Portal"

Der Markenname ist ab sofort **"Das Portal"** (nicht nur "Portal"). Ändere das überall im Projekt:

| Datei | Was ändern |
|-------|-----------|
| `components/Navbar.tsx` | Logo-Text: `Portal` → `Das Portal` |
| `app/layout.tsx` | `metadata.title.default`: `"Das Portal \| Spirituelle Events"` |
| `app/layout.tsx` | `metadata.title.template`: `"%s \| Das Portal"` |
| `app/layout.tsx` | `metadata.openGraph.siteName`: `"Das Portal"` |
| `app/layout.tsx` | `metadata.openGraph.title` + `metadata.twitter.title`: anpassen |
| `app/page.tsx` | `metadata.title`: `"Das Portal \| Sichtbarkeit für Coaches, Heiler & Facilitators"` |
| `app/page.tsx` | Landing Page Texte: alle Erwähnungen von "Portal" → "Das Portal" (z.B. "Portal ist die Plattform..." → "Das Portal ist die Plattform...") |
| `app/page.tsx` | Hero-Subline: "Bald verfügbar" Zeile anpassen |
| `app/page.tsx` | Sektion "Für wen ist Das Portal?" |
| `app/page.tsx` | Sektion "So funktioniert es" Texte prüfen |
| `app/sitemap.ts` | Falls siteName referenziert wird |
| `components/Footer.tsx` | Falls "Portal" erwähnt wird |

**Regel:** Wo der Name als Marke steht, immer "Das Portal". In fließenden Sätzen wo es grammatisch passt, auch "das Portal" (klein "das") erlaubt, z.B. "Trag dich ins Portal ein."

---

## 1. Supabase waitlist-Tabelle

Die Datei `supabase/waitlist.sql` enthält das SQL für die Tabelle. Prüfe ob die Tabelle bereits existiert (falls nicht, weise den User darauf hin dass er das SQL im Supabase Dashboard ausführen muss).

Die Tabelle hat: `id`, `email` (unique), `name`, `role`, `city`, `created_at` + RLS Policies (anon insert, authenticated select).

---

## 2. Event-Listing unter /events

Die bisherige Startseite (`app/page.tsx`) wurde nach `app/events/page.tsx` verschoben. Prüfe:

- Metadata ist gesetzt (`title: "Events"`)
- Funktion heißt `EventsPage` (nicht `Home`)
- Alles andere (Filter, Pagination, Supabase-Queries) bleibt unverändert
- Keine Regressions im Build

---

## 3. Landing Page (app/page.tsx) – Prüfen & Verbessern

Die neue Startseite existiert bereits als Vorlage. **Prüfe und verbessere** folgende Aspekte:

### Struktur der Seite (in dieser Reihenfolge)

1. **Hero** — "Deine Arbeit verdient Sichtbarkeit." + Subline + 2 CTAs (Warteliste, Events ansehen)
2. **Pain Points** — 3 Karten: Unsichtbarkeit, Marketing-Stress, Isolation
3. **Features** — 4 Karten: Profil, Events, Community, Reichweite/Daten
4. **Zielgruppen-Tags** — Coaches, Heiler:innen, Schamanen, Therapeut:innen etc.
5. **3-Schritte-Prozess** — Eintragen → Profil erstellen → Gefunden werden
6. **Wartelisten-Formular** — mit `WaitlistForm` Komponente

### Design-Prüfung

- **Keine hardcoded Farben** — nutze ausschließlich die Design Tokens aus `globals.css` (`text-primary`, `bg-card`, `accent-primary`, `border` etc.)
- Wenn aktuell hardcoded Hex-Werte wie `#f5ece1` im Gradient stehen: Das ist OK für den Gradient-Effekt, aber alle anderen Farben müssen Design Tokens sein
- **Responsive** — mobile-first, sieht auf 375px genauso gut aus wie auf 1440px
- **Typografie** — Headlines nutzen `font-serif` (Playfair Display), Body nutzt `font-sans` (Inter)
- **Consistency** — gleiches Karten-Styling wie im Rest der App (rounded-2xl, border-border, bg-bg-card)
- Emoji als Icons ist OK für MVP, aber prüfe ob sie auf allen Plattformen gut aussehen

### Inhaltliche Prüfung

- Spricht die Seite konsequent **Anbieter** an (du-Form, ihre Pain Points)?
- Passt die Sprache zum spirituell/ganzheitlichen Kontext? Kein Marketing-Sprech.
- Ist der CTA klar? "Jetzt auf die Warteliste" sollte zum Formular-Abschnitt scrollen (Anchor `#warteliste`)

---

## 4. WaitlistForm (components/WaitlistForm.tsx) – Prüfen

Die Komponente existiert bereits. Prüfe:

- Nutzt `useActionState` (React 19 pattern) — korrekt
- Felder: Name, E-Mail (required), Rolle (Dropdown), Stadt
- Success-State zeigt grüne Bestätigung
- Error-State zeigt Fehlermeldung
- Pending-State disabelt Button
- **Styling** nutzt Design Tokens (keine hardcoded Farben)
- Select-Placeholder: "Was beschreibt dich am besten?"
- Rollen: Coach, Heiler:in, Therapeut:in, Schamane/Schamanin, Facilitator, Yogalehrer:in, Meditationslehrer:in, Sonstiges

---

## 5. Server Action (app/actions/waitlist.ts) – Prüfen

Die Action existiert. Prüfe:

- Validierung: E-Mail muss @ enthalten
- Duplicate-Handling: Postgres unique constraint (error.code 23505) wird abgefangen und zeigt "Du bist bereits auf der Warteliste"
- Supabase Insert mit `getSupabaseServerClient()`
- Der `as any` Cast ist ein Workaround weil `waitlist` nicht im generierten Supabase-Type ist — das ist für jetzt akzeptabel

---

## 6. Navbar (components/Navbar.tsx) – Prüfen

- "Events" Link zeigt auf `/events` (nicht `/`)
- "Portal" Logo-Link zeigt auf `/`
- AuthNav bleibt wie es ist

---

## 7. SEO für Landing Page

Prüfe dass `app/page.tsx` hat:

- `metadata.title` — "Das Portal | Sichtbarkeit für Coaches, Heiler & Facilitators"
- `metadata.description` — spricht Anbieter an, nutzt "Das Portal" als Markennamen
- Open Graph Tags (werden vom Layout-Template geerbt, aber prüfe ob title/description passen)
- Title Template in `layout.tsx` ist: `"%s | Das Portal"`

---

## 8. Sitemap aktualisieren

Prüfe `app/sitemap.ts` — die neue `/events` Route muss enthalten sein:

```ts
{ url: `${siteUrl}/events`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 }
```

---

## 9. Final Checks

- `npm run build` — muss fehlerfrei durchlaufen
- `npm run lint` — keine Errors
- Prüfe dass `/events/[slug]` (Event-Detailseiten) weiterhin funktionieren
- Prüfe dass `/hosts/[slug]` weiterhin funktioniert
- Prüfe dass Auth-Flow (Login/Signup unter /auth) weiterhin funktioniert

---

## Zusammenfassung der Dateien

| Datei | Status | Aktion |
|-------|--------|--------|
| `app/page.tsx` | Vorlage existiert | Prüfen & verbessern |
| `app/events/page.tsx` | Vorlage existiert | Prüfen |
| `app/actions/waitlist.ts` | Vorlage existiert | Prüfen |
| `components/WaitlistForm.tsx` | Vorlage existiert | Prüfen |
| `components/Navbar.tsx` | Bereits geändert | Prüfen |
| `supabase/waitlist.sql` | Existiert | Nur prüfen (User führt manuell aus) |
| `app/sitemap.ts` | Besteht | /events Route hinzufügen |
| `PORTAL-KONTEXT.md` | Referenz | Nur lesen |
