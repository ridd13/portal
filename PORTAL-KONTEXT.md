# Portal – Projekt-Kontext & Gap-Analyse

> Erstellt: 23.02.2026 | Quelle: ChatGPT-Projekt "Portal" (alle Chats + Business Proposal V3 + why-how-what.md)
> Zweck: Zentrales Referenzdokument für alle AI-Agenten und Entwickler, die am Portal arbeiten

---

## 0. Gründer – Why / How / What

**WHY:** Lennert glaubt an eine Welt, in der Menschen nicht nur träumen, sondern gestalten. Er will Menschen das Vertrauen in ihre eigene Gestaltungskraft zurückgeben und eine Welt schaffen, die für seine Kinder und andere besser und freier ist.

**HOW:** Er verbindet strukturelles Denken mit innerer Klärung – übersetzt zwischen Experten und Realität, denkt kritisch jenseits von Standards, löst innere Blockaden (Coaching, Meditation, Hypnose, Breathwork) und begleitet bis zur echten Umsetzung.

**WHAT:**
- Technisch: Prozessdesign, Automatisierungen, Workflow-Systeme, Marketing- & Sales-Strukturen
- Strategisch: Angebote in Kundensprache übersetzen, Positionierung schärfen, Lücken & Potenziale identifizieren
- Menschlich: Coaching, Mentoring, Blockadenlösung, Begleitung in Umsetzung

→ Das Portal ist die **Produktifizierung** dieses Ansatzes: Eine Plattform, die genau das für viele Anbieter gleichzeitig leistet – Sichtbarkeit, Struktur und Umsetzung.

---

## 1. Vision & Geschäftsmodell

### Was ist das Portal?

Eine zweiseitige Plattform (Anbieter ↔ Endkunden) für **Facilitators, Coaches und Schaman:innen** im DACH-Raum. Startmarkt: Schleswig-Holstein & Hamburg.

### Kernzielgruppe (ICP)

Selbständige im spirituellen/ganzheitlichen Bereich mit <5k €/Monat Umsatz. Fachlich stark, aber schwach in Marketing, Sichtbarkeit und Kundenakquise.

### Geschäftsmodell (Stufenmodell)

| Stufe | Produkt | Preis | Phase |
|-------|---------|-------|-------|
| 1 | **Free Directory** – Basis-Eintrag als Lead-Magnet | Kostenlos | MVP / Launch |
| 2 | **Premium Listing** – Sichtbarkeit, Event-Funktion, Profil-Features | 29 €/Monat (später 19–49 €) | Launch |
| 3 | **Community** – Gruppen-Calls, Challenges, Buddy-System | 29 €/Monat | Post-Launch |
| 4 | **Event-Fees** – 10% Ticketumsatz | 10% Commission | Ab 2027 |
| 5 | **Business-Mentoring** – 1:1 Betreuung | 300–1.000 €/Monat | Ab 2027 |
| 6 | **Done-for-You Services** – Funnel, Website, Setup | 1.500–5.000 € | Ab 2027 |

### Vertriebsmodell

- **Lead-Quelle:** Automatisches Anlegen von Anbietern (Scraping Google Maps, öffentliche Quellen)
- **Invite-to-Claim:** DSGVO-konforme Mail an Anbieter → "Dein Eintrag existiert, claim ihn"
- **Sales-Prozess:** Unclaimed → Claimed Free → Premium Upsell via Mail/WhatsApp
- **Phase 1:** Calls für Proof-of-Concept & Feedback
- **Phase 2:** Automatisierung via Mail/WhatsApp-Flows
- **Phase 3:** Network Effects, Referral, Inbound

### Unit Economics (Premium Listing)

- ARPU: 29 €/Monat
- Marge: ~80%
- LTV bei 12 Monaten: 278 € | 24 Monate: 557 € | 48 Monate: 1.114 €
- Conversion: 100 Kontakte → 30 Claim → 10 Premium (10%)

### Growth Story

| Jahr | Markt | Kunden (Premium) | MRR | ARR |
|------|-------|-----------------|-----|-----|
| 2026 | SH + Hamburg | 120–200 | 3.5k–5.8k € | 42–70k € |
| 2027 | Deutschland | 500–800 | 14.5k–23.2k € | 174–278k € |
| 2028 | DACH | 900–1.250 | 26k–36k € | 312–432k € |

---

## 2. Wettbewerb & Differenzierung

### Hauptwettbewerber: mcspirit.de

Differenzierung gegenüber mcspirit.de durch:

- **Lokale Tiefe** statt Breite: Stadt-Hubs, Kalender-Widgets, Map, wöchentlicher Digest
- **Messbare Outcomes:** Mini-Assessments nach Events, Anbieter-Scores und Badges
- **Performance-Transparenz:** Dashboard mit Impressionen, Klicks, RSVPs, Buchungen, NPS
- **Community vor Conversion:** Willkommens-Event pro Stadt/Monat, Buddy-System, Challenges

### USPs

- Nischen-Fokus DACH spirituell
- Directory + Event-Kalender/Booking + Community (Kombination)
- Invite-to-Claim-System (DSGVO-sauber)
- Soft-Kuratierung: Badges, Rezensionen, Empfehlungen
- Daten-Asset: Anbieter, Events, Teilnehmer → Netzwerkeffekte

---

## 3. Feature-Roadmap (aus ChatGPT-Chats extrahiert)

### Phase 1: MVP / Launch (aktueller Build-Scope)

- [x] Event-Listing mit Karten-Layout
- [x] Filter nach Stadt, Kategorie/Tag, Suchbegriff
- [x] Event-Detailseite mit Host-Info
- [x] Host-Profilseite mit deren Events
- [x] Auth (Login/Signup) mit Supabase
- [x] Konto-Bereich (geschützt)
- [x] SEO: Sitemap, robots.txt, generateMetadata
- [x] Schema.org Event Structured Data
- [x] ICS-Kalender-Download
- [x] Social Links für Hosts
- [x] Responsive Design (Mobile-first)

### Phase 2: Directory & Anbieter-Onboarding (FEHLT KOMPLETT)

- [ ] **Anbieter-Directory** – öffentliche durchsuchbare Liste aller Coaches/Heiler
- [ ] **Anbieter-Profil (public)** – ausführliches Profil mit Credentials, Spezialisierungen, Rezensionen
- [ ] **Invite-to-Claim Flow** – Unclaimed Profile → Claim via E-Mail → Verifizierung
- [ ] **Anbieter-Dashboard** – eigene Events verwalten, Insights sehen (Impressionen, Klicks, RSVPs)
- [ ] **Event-Submit-Formular** – Anbieter können Events selbst eintragen (Frontend-Submission)
- [ ] **Moderation-Backend** – Events und Profile prüfen/freischalten
- [ ] **Trust-Score / Badges** – verifizierte Identität, NPS, Qualitäts-Badges
- [ ] **Premium-Listing Paywall** – Stripe/Payment-Integration für 29€/Monat Abo

### Phase 3: Event-Engine Ausbau

- [ ] **Stadt-Hubs** – z.B. /events/hamburg, /events/kiel mit lokalen Filtern
- [ ] **Map-Ansicht** – Events auf Karte mit Clustering
- [ ] **RSVP-System** – Light-Anmeldung mit Kalenderexport & 24h-Reminder
- [ ] **Warteliste** – bei vollen Events, automatische Nachrücker-Mail
- [ ] **Programmatic SEO** – /events/[stadt]/[kw-jjjj], /events/[stadt]/[kategorie]
- [ ] **Wöchentlicher Stadt-Newsletter** – Top 5 Events per Stadt
- [ ] **Post-Event Feedback** – Mini-Survey, Bewertung fürs Anbieterprofil
- [ ] **Import-Pipeline** – ICS-Import, URL-Scraper für wiederkehrende Quellen
- [ ] **Dedupe-Logik** – Titel+Zeit+Ort Fuzzy-Match, Merge von Dubletten

### Phase 4: Community & Monetarisierung

- [ ] **Community-Membership** – 29€/Monat, Gruppen-Calls, Challenges
- [ ] **Credit/Barter-System** – Credits für Content/Events statt Geld
- [ ] **Anbieter-Blogs** – Co-Authored Content mit Redaktionsbrief-Vorlagen
- [ ] **Ticketing** – 10% Event-Fee (ab 2027)
- [ ] **Business-Mentoring Booking** – Terminbuchung für Premium-Coaching
- [ ] **Done-for-You Marketplace** – Service-Pakete buchen

### Phase 5: Endkunden-Plattform

- [ ] **Endkunden-Buchung** – direkte Buchungsfunktion für Events
- [ ] **Ticketing-Stack** – eigenes Ticketing integriert
- [ ] **Endkunden-Accounts** – Profil, Favoriten, Buchungshistorie
- [ ] **Empfehlungslogik** – nach Interessen personalisierte Event-Vorschläge

---

## 4. Gap-Analyse: Business-Vision vs. aktueller Build

### Was der Build KANN (Status Quo)

Der aktuelle Next.js/Supabase-Build ist ein **reines Event-Listing-Portal** mit:
- Öffentliche Event-Übersicht mit Filtern
- Event-Detailseiten mit Host-Info
- Host-Profilseiten
- Auth-System (Login/Signup)
- Geschützter Konto-Bereich
- SEO-Basics (Sitemap, Metadata, Schema.org)

### Was FEHLT für den Launch (Prio 1)

1. **Anbieter-Directory** – Das Kernprodukt des Geschäftsmodells (Free Listing als Lead-Magnet) existiert nicht. Der Build zeigt nur Events, nicht Anbieter als durchsuchbare Einträge.

2. **Event-Submit-Flow** – Anbieter können keine Events selbst eintragen. Aktuell müssen Events direkt in Supabase angelegt werden. Mindestens ein einfaches Formular unter /konto ist nötig.

3. **Claim-Flow** – Das Invite-to-Claim-System (Kernvertrieb) hat keine Frontend-Unterstützung. Es gibt keine "Claim this profile"-Seite.

4. **Payment/Subscription** – Keine Stripe-Integration, kein Abo-Management. Ohne Payment kein Revenue.

5. **Anbieter-Dashboard** – Eingeloggte Anbieter sehen unter /konto nichts Nützliches. Sie brauchen: eigene Events verwalten, Profil bearbeiten, Stats sehen.

### Was FEHLT aber warten kann (Prio 2)

- Map-Ansicht für Events
- RSVP / Warteliste
- Newsletter-Integration
- Trust-Scores / Badges
- Programmatic SEO (Stadt-Seiten)
- Import-Pipeline (ICS/Scraper)
- Post-Event Feedback

### Was erst ab 2027 relevant ist (Prio 3)

- Community-Membership
- Ticketing (10% Fee)
- Business-Mentoring Booking
- Done-for-You Marketplace
- Endkunden-Accounts & Buchung
- Credit/Barter-System

---

## 5. Technischer Stack

| Bereich | Technologie |
|---------|-------------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 (CSS-based config) |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth + HttpOnly Cookies |
| Captcha | Cloudflare Turnstile |
| Hosting | Vercel |
| Monitoring | Sentry (installiert, Wrapper fehlt teilweise) |
| Fonts | Playfair Display (Headline) + Inter (Body) |
| Markdown | react-markdown |
| Dates | date-fns |

### DB-Schema (Supabase – aus portal-bauplan.md)

**events:** id, title, slug, description, start_at, end_at, location_name, address, cover_image_url, tags[], price_model, ticket_link, host_id, is_public, status, created_at

**hosts:** id, name, slug, description, website_url, social_links (jsonb), created_at

**profiles:** id (= auth.users.id), email, display_name, role, created_at

### Design-System (CSS Custom Properties)

```
--color-bg-primary: #faf6f1      (warmes Off-White)
--color-bg-secondary: #f0e8de    (Sand)
--color-bg-card: #ffffff          (Karten)
--color-text-primary: #2c2418    (Dunkelbraun)
--color-text-secondary: #6b5b4e  (Mittelbraun)
--color-accent-primary: #b5651d  (Warmes Orange)
--color-accent-secondary: #7b6d4e (Olivbraun)
--color-accent-sage: #8b9d77     (Salbeigrün)
--color-border: #e5ddd3          (Heller Rand)
```

---

## 6. Bestehende Automatisierungen (Backend)

### n8n: Telegram Bot Intake

- Telegram-Bot nimmt Event-Submissions entgegen
- Verarbeitung über n8n-Workflow
- Schreibt direkt in Supabase

### Geplant (aus Chats)

- Google Maps Scraping → automatisches Anlegen von Anbieter-Profilen
- Invite-to-Claim Mail-Automation
- WhatsApp-Flows für Upselling
- Wöchentlicher Stadt-Newsletter (automatisiert)

---

## 7. Rechtliche Rahmenbedingungen

- **DSGVO:** Daten nur aus öffentlichen Quellen (Impressum/Branchenverzeichnisse)
- **UWG:** Erste Mail = sachlicher Hinweis auf Eintrag, inkl. Quelle, Zweck, Opt-out
- **Telefonkontakt:** Nur nach Claim/Opt-in
- **Do-Not-Contact-Listen:** Pflicht
- **Löschkonzept:** Erforderlich
- **Events:** Haftungsausschluss, Stornobedingungen, Barrierefreiheits-Tags

---

## 8. KPIs & Erfolgskennzahlen (90-Tage-Ziele)

- 3 Pilotstädte live
- Je Stadt: 100 gelistete Events, 25 wöchentlich aktiv
- 35% Eventseiten über SEO
- CTR zu Anbieterprofil: 12%
- RSVP zu Teilnahme: 60%
- 60 aktive Anbieter je Stadt
- 40% davon mit Barter-Deals
- NPS der Teilnehmer: 55+

---

## 9. Investor-Kontext

- **Rechtsform:** UG (geplant)
- **Gründer:** Lennert Bewernick
- **Investment-Angebot (FFF):** 5.000 € = 5% Equity (Pre-Money 100k €)
- **Put-Option:** Nach 24 Monaten Rückgabe möglich (Einsatz + 5% p.a.)
- **Fixkosten (6 Monate):** ~5.800 €
- **Break-even:** Base-Case nach 6–9 Monaten

---

## 10. Empfehlung: Nächste Schritte für Launch

### Sofort (diese Woche)

1. CLAUDE-CODE-FIXES.md abarbeiten lassen (technische Qualität)
2. Build verifizieren: `npm run build` + `npm run lint`
3. Vercel-Deployment testen mit echten Supabase-Keys

### Kurzfristig (vor Launch)

4. Einfaches Event-Submit-Formular unter /konto
5. Anbieter-Profilseite erweitern (Specializations, Kontaktinfo)
6. Basis-Directory-Seite (/directory oder /anbieter)
7. Impressum + Datenschutzerklärung

### Mittelfristig (nach Launch, vor Revenue)

8. Stripe-Integration für Premium-Listings
9. Claim-Flow für ungelistete Anbieter
10. Anbieter-Dashboard mit Basic-Stats
11. Stadt-Hubs mit Programmatic SEO

---

*Dieses Dokument wird bei jeder größeren Änderung am Projekt aktualisiert.*
