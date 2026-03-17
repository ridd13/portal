# CLAUDE-CODE-PORTAL-V6: Host-Profil Upgrade + UX Fixes

Lies zuerst CLAUDE.md und PORTAL-KONTEXT.md für den vollen Kontext.

WICHTIG: "Das Portal" ist ein eigenständiges Projekt. Es hat NICHTS mit JustClose zu tun. Keine JustClose-E-Mails, keine JustClose-Domains, keine JustClose-Referenzen irgendwo im Code oder in der UI.

---

## Task 1: Radius-Filter NICHT automatisch aktivieren (Prio 1)

**Problem:** Die Events-Seite fragt automatisch nach dem Browser-Standort und aktiviert dann einen 25km-Radius-Filter. Erstbesucher sehen so nur Events in ihrer Nähe, nicht alle.

**Lösung:**
- In `components/LocationInput.tsx`: Die Funktion `shouldRequestGeo()` soll IMMER `false` zurückgeben. Der Standort-Filter soll NUR aktiv werden, wenn der User explizit eine PLZ eingibt oder auf "Standort verwenden" klickt.
- Die `getInitialLocation()` Funktion soll KEINEN gespeicherten Standort aus localStorage laden. Beim Seitenaufruf soll KEIN Standort voreingestellt sein.
- Der Radius-Slider und die Standort-Eingabe bleiben weiterhin verfügbar — sie werden nur nicht automatisch aktiviert.
- `saveUserLocation()` darf weiterhin speichern, aber `loadUserLocation()` soll NICHT beim initialen Laden der Events-Seite aufgerufen werden.

**Ziel:** Wenn man /events aufruft, sieht man ALLE Events ohne Standort-Filter. Erst wenn man aktiv eine PLZ eingibt, wird gefiltert.

---

## Task 2: Anbieter-Profil Upgrade (Prio 1)

**Problem:** Die Host-Profilseite (`app/hosts/[slug]/page.tsx`) zeigt "Beschreibung folgt" wenn kein Beschreibungstext vorhanden ist. Das wirkt unprofessionell.

### 2a: Naming ändern — "Anbieter:in" statt "Host"

Überall in der UI (NICHT in Code/DB) das Wort "Host" durch "Anbieter:in" ersetzen:
- EventCard.tsx: "Unbekannter Host" → "Unbekannte:r Anbieter:in"
- Host-Profilseite: Seitenüberschrift soll den Namen zeigen, nicht "Host"
- Navbar: "Für Facilitators" → "Für Anbieter:innen" (Link bleibt gleich)
- Alle anderen UI-Texte wo "Host" steht

**NICHT ändern:** DB-Tabellen (hosts), Code-Variablen, URL-Slugs (/hosts/...)

### 2b: Unclaimed-Profil-Platzhalter

Auf der Host-Profilseite, wenn `description` NULL oder leer ist, zeige statt "Beschreibung folgt" diesen Block:

```
[Name] ist auf Das Portal als Anbieter:in gelistet.
Dieses Profil wurde noch nicht persönlich beansprucht —
sobald [Name] das Profil übernimmt, findest du hier mehr Informationen
über Angebote, Hintergrund und Spezialisierungen.
```

Darunter: Ein CTA-Button "Du bist [Name]? Profil beanspruchen" der auf `/auth?mode=claim&host=[host-slug]` verlinkt. Dort durchläuft der/die Anbieter:in den Magic-Link-Flow (siehe Task 6).

Styling: Der Platzhalter-Text in einem sanften Info-Kasten mit `bg-bg-secondary` Border, nicht als Fehlermeldung. Der Button im Stil eines Secondary-Buttons (nicht zu aufdringlich, kein Hard-Sell).

### 2c: Profil-Seite aufwerten

Die Host-Profilseite soll folgende Struktur haben:

1. **Header:** Name groß (font-serif), darunter ein kurzer Subtitle (wenn vorhanden)
2. **Avatar:** Wenn `avatar_url` vorhanden, als rundes Bild links neben dem Namen. Wenn nicht, ein schöner Platzhalter-Buchstabe (erste Buchstabe des Namens) in einem Kreis mit `bg-accent-sage` und `text-white`.
3. **Info-Bereich:** Website-Link (wenn vorhanden), Social Links, E-Mail (wenn vorhanden)
4. **Beschreibung:** Oder der Unclaimed-Platzhalter (2b)
5. **"Bald verfügbar"-Hinweis:** Unter der Beschreibung (egal ob claimed oder unclaimed) ein dezenter Hinweis: "Bald können Anbieter:innen hier ihr Profil mit Bildern, Spezialisierungen und mehr ergänzen." — Kein Premium-Wording, keine Preise, keine Badges. Einfach ein Ausblick dass mehr kommt.
6. **Events von [Name]:** Die Event-Liste wie bisher

---

## Task 3: EventCard — Datum-Anzeige verbessern (Prio 2)

**Problem:** Events zeigen Uhrzeiten wie "01:00" oder "02:00" die offensichtlich falsch sind (Parsing-Fehler aus der Pipeline).

**Lösung:** In der `formatEventDate()`-Funktion in `lib/event-utils.ts`:
- Wenn die Uhrzeit genau `00:00`, `01:00` oder `02:00` ist, zeige NUR das Datum ohne Uhrzeit
- Wenn die Uhrzeit `12:00` ist, zeige auch nur das Datum (das ist der Platzhalter für "keine Uhrzeit gefunden")
- Ansonsten: Datum + Uhrzeit wie bisher

Beispiel:
- `2026-03-28T15:00:00` → "SA. 28.03.2026 15:00"
- `2026-03-28T00:00:00` → "SA. 28.03.2026"
- `2026-03-28T12:00:00` → "SA. 28.03.2026"
- `2026-03-28T02:00:00` → "SA. 28.03.2026"

---

## Task 4: Duplikat-Schutz in der UI (Prio 3)

Prüfe ob es Events mit gleichem `title` UND `start_at` gibt. Wenn ja, zeige nur das neueste. Das ist eine Quick-Fix-Ebene — langfristig wird das in der Pipeline gelöst.

In der Events-Query in `app/events/page.tsx`: Nach dem Fetch, dedupliziere Events mit gleichem title+start_at (behalte das mit der neueren `created_at`).

---

## Task 5: Datenschutzerklärung aktualisieren (Prio 2)

Die Datenschutzerklärung unter `app/datenschutz/page.tsx` muss um folgende Punkte ergänzt werden.

WICHTIG: Alle Kontaktdaten beziehen sich auf Das Portal, NICHT auf JustClose oder andere Projekte.

### 5a: Automatische Event-Erfassung
Ergänze einen Abschnitt der erklärt:
- Events werden teilweise automatisiert aus öffentlichen Telegram-Gruppen erfasst
- Es werden nur öffentlich geteilte Event-Informationen übernommen (Titel, Datum, Ort, Beschreibung)
- Der Name des Absenders wird als Anbieter:in-Profil angelegt
- Anbieter:innen können jederzeit die Löschung ihres Profils und ihrer Events beantragen — Kontakt per Telegram: @lennertbewernick

### 5b: Profil-Beanspruchung (Vorbereitung)
Ergänze einen Abschnitt:
- Anbieter:innen können ihr automatisch erstelltes Profil beanspruchen
- Dafür wird die E-Mail-Adresse verarbeitet (Rechtsgrundlage: Einwilligung, Art. 6 Abs. 1 lit. a DSGVO)
- Die Registrierung erfolgt über Supabase Auth (Magic Link)

### 5c: Kontaktdaten
Stelle sicher dass die Kontaktdaten korrekt sind:
- Verantwortlich: Lennert Bewernick
- Kontakt: https://t.me/lennertbewernick
- Wenn aktuell Platzhalter-Daten oder falsche E-Mail-Adressen drin stehen, ersetze sie durch den Telegram-Link
- KEINE JustClose-E-Mails oder JustClose-Referenzen verwenden

---

## Task 6: Auth reaktivieren + Magic Link Claim-Flow (Prio 1)

**Kontext:** Auth-System existiert bereits (`app/auth/`, `app/konto/`, `components/AuthForm.tsx`, `app/api/auth/`), ist aber deaktiviert (keine Links in der UI). Das bestehende System ist Passwort-basiert mit Turnstile-Captcha. Wir erweitern es um Magic Link und bauen den Claim-Flow.

### 6a: Magic Link Auth hinzufügen

Erweitere die `AuthForm.tsx` um einen dritten Mode: `"magic-link"`.

**Flow:**
1. User gibt E-Mail ein
2. Klick auf "Magic Link senden"
3. API ruft `supabase.auth.signInWithOtp({ email })` auf
4. User bekommt E-Mail mit Login-Link
5. Link führt zurück zur App → User ist eingeloggt

**Neuer API-Endpoint:** `app/api/auth/magic-link/route.ts`
```typescript
// Nutze supabase.auth.signInWithOtp({ email, options: { emailRedirectTo } })
// Turnstile-Captcha Validierung beibehalten
// Kein Passwort nötig
```

Die bestehende Passwort-Auth bleibt funktional, wird aber in der UI nicht mehr als Standard gezeigt. Magic Link ist der Default-Mode. Optional kann der User auf "Mit Passwort anmelden" wechseln.

### 6b: Claim-Flow mit manueller Freigabe

Der Claim wird NICHT sofort durchgeführt, sondern als Anfrage gespeichert und manuell freigegeben. Das verhindert, dass jemand fremde Profile beansprucht.

**Neue DB-Tabelle:** `claim_requests`
```sql
CREATE TABLE claim_requests (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  host_id uuid REFERENCES hosts(id) NOT NULL,
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  user_email text NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at timestamptz DEFAULT now(),
  reviewed_at timestamptz
);

ALTER TABLE claim_requests ENABLE ROW LEVEL SECURITY;

-- User kann eigene Requests sehen
CREATE POLICY "User sieht eigene Claim-Requests"
ON claim_requests FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Insert nur für authentifizierte User
CREATE POLICY "Authentifizierte User können Claims erstellen"
ON claim_requests FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());
```

**Flow wenn Auth-Seite mit `?mode=claim&host=[host-slug]` aufgerufen wird:**

1. Zeige angepasste UI: "Beanspruche dein Profil als [Host-Name] auf Das Portal"
2. Magic Link als einzige Auth-Option (kein Passwort-Mode beim Claim)
3. Nach erfolgreicher Authentifizierung:
   - Erstelle einen Eintrag in `claim_requests` mit status `pending`
   - Zeige dem User: "Deine Anfrage wurde eingereicht! Wir prüfen sie und melden uns in Kürze."
   - Redirect zu `/konto`
4. **Schutz:** Wenn der Host bereits einen `owner_id` hat, zeige: "Dieses Profil wurde bereits beansprucht. Falls du der/die Inhaber:in bist, melde dich an."
5. **Schutz 2:** Wenn bereits ein `pending`-Request für diesen Host existiert, zeige: "Für dieses Profil liegt bereits eine Anfrage vor."

**Neuer API-Endpoint:** `app/api/auth/claim/route.ts`
- Authentifizierter User kann einen Claim-Request erstellen
- Prüft ob `hosts.owner_id IS NULL` für diesen Slug
- Prüft ob kein pending Request für diesen Host existiert
- Erstellt den Request in `claim_requests`
- Gibt Success oder Error zurück

**Admin-Freigabe (einfache Lösung):** Freigabe passiert vorerst direkt in Supabase Table Editor:
- `claim_requests` öffnen → `status` auf `approved` setzen
- Dann manuell `hosts.owner_id` und `hosts.email` setzen
- Später kann ein Admin-Dashboard gebaut werden

### 6c: Konto-Seite erweitern

Die bestehende `/konto`-Seite (`app/konto/page.tsx`) erweitern:

1. **Profil-Bearbeitung** wenn der User ein Host-Profil hat (owner_id matched):
   - Name bearbeiten
   - Beschreibung bearbeiten (Textarea, max 2000 Zeichen)
   - Website-URL bearbeiten
   - Social Links bearbeiten
2. **Meine Events** (read-only): Liste der Events die diesem Host zugeordnet sind
3. **Kein Profil?** Wenn der User angemeldet ist aber kein Host-Profil hat, zeige: "Du hast noch kein Anbieter:innen-Profil. Wenn du auf Das Portal als Anbieter:in gelistet bist, kannst du dein Profil auf deiner Profilseite beanspruchen."

**API-Endpoint für Profil-Update:** `app/api/hosts/update/route.ts`
- Authentifizierter User kann NUR seinen eigenen Host updaten (owner_id = auth.user.id)
- Erlaubte Felder: name, description, website_url, social_links
- RLS-Policy in Supabase: `UPDATE ON hosts USING (owner_id = auth.uid())`

### 6d: Auth-Links in der Navbar

Aktiviere Auth in der Navbar (`components/Navbar.tsx`):
- Wenn NICHT eingeloggt: Zeige "Anmelden" Button (Link auf `/auth`)
- Wenn eingeloggt: Zeige "Mein Konto" Button (Link auf `/konto`)
- Den bestehenden "Auf die Warteliste"-Button in der Navbar BEHALTEN — wird nicht ersetzt

### 6e: Supabase RLS-Policy für Host-Updates

Erstelle oder prüfe diese Policy:
```sql
CREATE POLICY "Hosts können von ihrem Owner bearbeitet werden"
ON hosts FOR UPDATE
TO authenticated
USING (owner_id = auth.uid())
WITH CHECK (owner_id = auth.uid());
```

### 6f: Auth Callback Route

Stelle sicher dass es eine Auth-Callback-Route gibt für den Magic Link Redirect:
`app/auth/callback/route.ts` — Diese Route tauscht den Code aus der URL gegen eine Session. Wenn ein `host`-Parameter vorhanden ist, führe nach der Session-Erstellung den Claim durch.

---

## Generelle Regeln

- Tailwind v4 Syntax (siehe CLAUDE.md)
- Deutsche UI-Texte
- Keine Emojis im Code
- `npm run build` muss erfolgreich sein
- Teste auf Mobile-Ansicht
- KEINE Referenzen zu JustClose — Das Portal ist ein eigenständiges Projekt
