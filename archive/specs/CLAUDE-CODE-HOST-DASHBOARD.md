# Host-Dashboard & Auth-Reaktivierung

## Kontext

Das Auth-System existiert bereits vollständig (Magic Link + Password via Supabase Auth), wurde aber deaktiviert. Es muss reaktiviert und um ein Host-Dashboard erweitert werden, in dem Hosts ihre Anmeldungen, Profile, Events und Locations verwalten können.

**Referenz-Flow:** nils-liebt-dich.de — dort können Veranstalter ihre Events + Anmeldungen verwalten. Unser System soll ähnlich funktionieren, aber besser (passwordless first, Kapazität + Warteliste, Zahlung vorbereitet).

---

## Phase 1: Auth reaktivieren

### 1.1 Navbar Auth-Links wieder einbauen

**Datei:** `components/Navbar.tsx` + `components/MobileNav.tsx`

Aktuell: 4 Items (Veranstaltungen, Räume, Raumhalter, Eintragen)

Ziel: Eintragen-Button bleibt orange. Rechts davon ein **Text-Link "Anmelden"** (nicht als Button, dezent). Wenn eingeloggt: **"Mein Bereich"** statt "Anmelden" (Link auf /konto).

- Nutze den vorhandenen `AuthNav` Component oder bau es direkt ein
- Check: `ACCESS_COOKIE` aus `lib/auth-cookies.ts` im Server Component lesen
- MobileNav: Gleiche Logik, "Anmelden" bzw "Mein Bereich" als letztes Item

### 1.2 Auth-Seite (/auth) prüfen und aufräumen

Die Auth-Seite existiert unter `app/auth/page.tsx` mit `components/AuthForm.tsx`.

- **Magic Link als Default-Modus** — Tabs: "Magic Link" (default) | "Login" | "Registrieren"
- Turnstile Captcha: Falls `TURNSTILE_SECRET_KEY` nicht gesetzt → Captcha-Check überspringen (graceful degradation)
- Claim-Flow (`mode=claim`) beibehalten
- Texte auf Deutsch prüfen — alles muss Deutsch sein
- Design: Muss zum Portal-Design passen (bg-bg-primary, accent-primary, rounded-2xl etc.)

### 1.3 Konto-Seite (/konto) als Dashboard-Shell

`app/konto/page.tsx` existiert bereits. Umbauen zu einer **Tab-Navigation**:

```
/konto                → Dashboard-Übersicht (Willkommen + Quick Stats)
/konto/anmeldungen    → Event-Anmeldungen verwalten
/konto/profil         → Eigenes Profil bearbeiten
/konto/events         → Eigene Events verwalten
/konto/locations      → Eigene Locations verwalten
```

**Layout:** `app/konto/layout.tsx` mit:
- Auth-Guard (redirect zu /auth wenn nicht eingeloggt)
- Sidebar-Navigation (Desktop) / Tab-Bar (Mobile)
- Links: Übersicht | Anmeldungen | Profil | Events | Locations

---

## Phase 2: Anmeldungen verwalten

### 2.1 Seite: `/konto/anmeldungen`

**Datei:** `app/konto/anmeldungen/page.tsx`

Server Component, zeigt alle Events des Hosts mit ihren Anmeldungen.

**Layout:**
1. Dropdown/Select: Event auswählen (nur eigene Events, sortiert nach Datum)
2. Für das ausgewählte Event:
   - **Stats-Leiste:** X bestätigt | Y auf Warteliste | Z storniert | Kapazität: X/MAX
   - **Tabelle/Liste** mit Anmeldungen:
     - Vorname, Nachname, E-Mail, Telefon, Nachricht, Status, Datum
     - **Aktions-Buttons:** Bestätigen / Auf Warteliste / Stornieren
   - **Export-Button:** CSV-Download der Teilnehmerliste

**Daten-Query:**
```sql
-- Events des Hosts
SELECT e.id, e.title, e.start_at, e.capacity
FROM events e
WHERE e.host_id = (SELECT id FROM hosts WHERE owner_id = :user_id)
ORDER BY e.start_at DESC;

-- Anmeldungen für ein Event
SELECT * FROM event_registrations
WHERE event_id = :event_id
ORDER BY created_at ASC;
```

**Server Actions:** `app/actions/manage-registration.ts`
- `updateRegistrationStatus(registrationId, newStatus)` — nur wenn der eingeloggte User der Host des Events ist
- Sicherheits-Check: User muss owner_id des Hosts sein, Host muss host_id des Events sein

### 2.2 Host-Benachrichtigung per E-Mail

Aktuell loggt `register-event.ts` nur in die Console. Ersetze den Console-Log durch echten E-Mail-Versand.

**Option A (bevorzugt):** Supabase Edge Function mit Resend
**Option B (einfacher):** Direkt `fetch()` zu Resend API aus der Server Action

Resend API Key: Muss als `RESEND_API_KEY` Env-Var existieren. Wenn nicht gesetzt → graceful skip (Console-Log beibehalten als Fallback).

**E-Mail-Template:**
```
Betreff: Neue Anmeldung: {event.title}

Hallo {host.name},

{firstName} {lastName} ({email}) hat sich für dein Event angemeldet.

Event: {event.title}
Datum: {startDate}
Status: Bestätigt / Warteliste
Nachricht: {message}

Aktuelle Anmeldungen: {count}/{capacity}

→ Anmeldungen verwalten: https://das-portal.online/konto/anmeldungen

Viele Grüße,
Das Portal
```

---

## Phase 3: Profil bearbeiten

### 3.1 Seite: `/konto/profil`

**Datei:** `app/konto/profil/page.tsx`

Es gibt bereits einen `ProfileEditor` Component. Erweitern um:

**Editierbare Felder:**
- Name
- Stadt / Region (neu hinzugefügt)
- Beschreibung (Textarea)
- Avatar/Profilbild (File Upload → Supabase Storage `covers/hosts/{slug}`)
- Website URL
- E-Mail (Kontakt-E-Mail, nicht Login-E-Mail)
- Telegram Username
- Social Links (Instagram, Facebook, LinkedIn)

**Server Action:** `app/actions/update-profile.ts`
- Nur eigenes Profil editierbar (owner_id Check)
- Bild-Upload via `lib/upload-image.ts` (bereits vorhanden)
- Slug nicht änderbar

---

## Phase 4: Events verwalten

### 4.1 Seite: `/konto/events`

**Datei:** `app/konto/events/page.tsx`

**Liste eigener Events:**
- Titel, Datum, Status (published/draft/cancelled), Anmeldungen-Count, Kapazität
- Quick-Actions: Event bearbeiten | Anmeldungen anzeigen | Event deaktivieren
- Button: "Neues Event erstellen" → Link zu /einreichen (vorausgefüllt als eigener Host)

### 4.2 Event bearbeiten: `/konto/events/[id]/edit`

**Formular mit vorausgefüllten Feldern:**
- Titel, Beschreibung, Datum Start/Ende
- Ort (location_name, address)
- Preismodell + Betrag
- Kapazität + Warteliste an/aus
- Anmeldung aktiviert ja/nein
- Tags
- Titelbild (Upload/Ändern)
- Ticket-Link

**Server Action:** `app/actions/update-event.ts`
- Nur eigene Events editierbar (host_id → owner_id Check)

---

## Phase 5: Locations verwalten

### 5.1 Seite: `/konto/locations`

**Datei:** `app/konto/locations/page.tsx`

**Liste eigener Locations:**
- Name, Typ, Stadt, Foto vorhanden ja/nein
- Quick-Actions: Bearbeiten | Foto hochladen

### 5.2 Location bearbeiten: `/konto/locations/[id]/edit`

**Editierbare Felder:**
- Name, Typ, Beschreibung
- Adresse, PLZ, Stadt
- Kapazität, Ausstattung
- Foto (Upload → Supabase Storage `covers/locations/{slug}`)
- Kontakt (E-Mail, Telefon, Website)

**Server Action:** `app/actions/update-location.ts`
- Locations haben ein `host_id` Feld — nur der zugewiesene Host kann bearbeiten

---

## Phase 6: Einladungslinks

### 6.1 Admin-Tool für Host-Einladungen

**Seite:** `app/api/admin/invite-host` (API-Route, nur mit Admin-Key aufrufbar)

**Flow:**
1. Admin ruft API auf: `POST /api/admin/invite-host { hostId, email }`
2. System erstellt einen `invite_token` in der `hosts` Tabelle
3. Sendet E-Mail an Host mit Link: `https://das-portal.online/auth?mode=claim&host={slug}&token={invite_token}`
4. Host klickt Link → Magic Link Login → Profil wird automatisch mit owner_id verknüpft

**DB-Migration:**
```sql
ALTER TABLE hosts
  ADD COLUMN IF NOT EXISTS invite_token UUID,
  ADD COLUMN IF NOT EXISTS invited_at TIMESTAMPTZ;
```

---

## Technische Hinweise

### Auth-Flow Zusammenfassung
1. Host besucht /auth → gibt E-Mail ein → bekommt Magic Link
2. Klickt Link → /auth/callback → Cookies gesetzt → Redirect zu /konto
3. Wenn Host noch kein owner_id hat: Claim-Flow (verknüpft Supabase User mit Host-Profil)
4. Dashboard zeigt nur Daten die dem Host gehören (owner_id Check überall)

### Vorhandener Code der genutzt werden soll
- `lib/auth-session.ts` → `getUserFromAccessToken()`, `setAuthCookies()`, `clearAuthCookies()`
- `lib/auth-cookies.ts` → `ACCESS_COOKIE`, `REFRESH_COOKIE`
- `app/api/auth/magic-link/route.ts` → Magic Link senden
- `app/api/auth/callback/route.ts` → Session austauschen
- `app/api/auth/claim/route.ts` → Host-Profil claimen
- `components/AuthForm.tsx` → Multi-Mode Auth-Formular
- `components/ProfileEditor.tsx` → Profil bearbeiten (erweitern)
- `lib/upload-image.ts` → Bild-Upload nach Supabase Storage

### Regeln
- **Sprache:** Alle UI-Texte Deutsch
- **Design:** Portal Design-Tokens nutzen (bg-bg-primary, accent-primary, rounded-2xl etc.)
- **Server Components** als Default, `"use client"` nur wenn nötig
- **Sicherheit:** Jeder DB-Zugriff muss prüfen dass der User berechtigt ist (owner_id)
- **Keine Passwörter in der API** — Magic Link first, Password als Fallback
- **Zahlung:** Bereits in event_registrations vorbereitet (payment_status, payment_amount_cents), aber noch KEINE Implementierung. Nur Felder in der DB.

### Reihenfolge der Implementierung
1. Auth reaktivieren (Navbar + /auth prüfen)
2. /konto Layout mit Tab-Navigation
3. /konto/anmeldungen (wichtigstes Feature)
4. /konto/profil
5. /konto/events
6. /konto/locations
7. Einladungslinks
8. E-Mail-Versand (Resend)

Nach jedem Schritt: `npx tsc --noEmit` ausführen, Fehler fixen.
