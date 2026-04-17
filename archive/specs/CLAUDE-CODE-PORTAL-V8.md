# Claude Code Prompt — Portal V8 (Anbieter:innen-Registrierung)

> Lies zuerst CLAUDE.md, dann dieses File. Führe `npm run build` nach jeder Task aus.

## Kontext

Die "Für Anbieter:innen"-Seite (`app/fuer-facilitators/page.tsx`) hat aktuell ein Warteliste-Formular, das in eine `waitlist`-Tabelle schreibt und eine Bestätigungs-E-Mail über Resend sendet. Das soll umgebaut werden: Statt Warteliste → direkter Einstieg in den Auth-Flow (Magic Link via Supabase Auth).

Die Auth-Infrastruktur (Magic Link, Claim-Flow, `/auth`, `/konto`) ist bereits implementiert und funktioniert.

---

## Task 1: Warteliste-Formular auf Registrierung umbauen

**Datei:** `app/fuer-facilitators/page.tsx`

**Aktuell:** WaitlistForm mit E-Mail, Name, Rolle, Stadt → Resend Double-Opt-In
**Neu:** Registrierungsformular mit E-Mail, Name, Stadt → Daten in Supabase speichern → Weiterleitung auf `/auth`

**Umsetzung:**

1. **Formular-Felder ändern:**
   - E-Mail (Pflicht)
   - Name (Optional)
   - Stadt (Optional, Dropdown oder Freitext) — das ist wichtig für Marktanalyse!
   - "Rolle" rausnehmen (ist klar, dass es Anbieter:innen sind)
   - Button-Text: "Jetzt registrieren" statt "Auf die Warteliste"

2. **Server Action ändern oder neue erstellen:**
   - Daten in eine neue Tabelle `provider_signups` speichern (NICHT mehr `waitlist`):
     - `id` (uuid, default gen_random_uuid())
     - `email` (text, not null)
     - `name` (text, nullable)
     - `city` (text, nullable)
     - `created_at` (timestamptz, default now())
   - Kein Resend, kein Double-Opt-In nötig — das macht Supabase Auth
   - Nach erfolgreichem Insert: Redirect auf `/auth?mode=signup&email={email}`

3. **Auth-Seite anpassen (`app/auth/page.tsx` / `components/AuthForm.tsx`):**
   - Wenn `?email=...` als Query-Parameter kommt: E-Mail-Feld vorausfüllen
   - User muss nur noch auf "Magic Link senden" klicken
   - Alles andere (Magic Link, Callback, Session) funktioniert bereits

4. **SQL für neue Tabelle:**

```sql
CREATE TABLE provider_signups (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  email text NOT NULL,
  name text,
  city text,
  created_at timestamptz DEFAULT now()
);

-- RLS: Nur Insert für anon, Select für authenticated
ALTER TABLE provider_signups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anon kann Signups erstellen"
  ON provider_signups FOR INSERT TO anon
  WITH CHECK (true);

CREATE POLICY "Authenticated kann Signups lesen"
  ON provider_signups FOR SELECT TO authenticated
  USING (true);
```

---

## Task 2: Text auf der Seite anpassen

**Datei:** `app/fuer-facilitators/page.tsx`

Die Seite soll klar kommunizieren:
- "Registriere dich und beanspruche dein Profil"
- "Deine Events werden automatisch aus den Community-Gruppen importiert"
- "Ergänze dein Profil mit deiner Beschreibung und Website"
- KEINE Warteliste-Sprache mehr ("Coming soon", "Wir melden uns" etc.)
- KEINE Premium/Bezahl-Hinweise

Behalte die bestehende Seitenstruktur und das Design bei — nur Text + Formular anpassen.

---

## Task 3: WaitlistForm und alte Email-Logik aufräumen

- `components/WaitlistForm.tsx` — umbenennen oder ersetzen durch neues Formular
- `app/actions/waitlist.ts` — kann bestehen bleiben für Bestandsdaten, aber das Formular auf der Facilitator-Seite soll die neue Action nutzen
- `lib/email.ts` — NICHT löschen, wird eventuell später noch gebraucht

---

## Task 4: Build verifizieren

`npm run build` ausführen. Sicherstellen dass alles baut.

---

## REGELN

- Alle UI-Texte auf Deutsch
- KEINE Referenzen zu JustClose — Das Portal ist ein eigenständiges Projekt
- "Anbieter:in" als Bezeichnung (nicht "Host", nicht "Facilitator")
- `next/image` für Bilder, `"use client"` nur wenn nötig
- Design-Tokens aus globals.css nutzen (keine hardcodierten Farben)
- SQL in diesem Prompt muss vom Entwickler in Supabase SQL Editor ausgeführt werden (nicht automatisch)
