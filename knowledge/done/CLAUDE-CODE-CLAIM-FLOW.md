# Claim-Flow: Einträge für Dritte + Profil-Claim

> Erweitert alle Intake-Formulare um ein Feld "Ist das dein eigener Eintrag?". Wenn Nein → optionales E-Mail-Feld. Der tatsächliche Owner bekommt eine Einladung, den Eintrag zu claimen.

Betrifft:
- `components/SubmitEventForm.tsx`
- `components/SubmitHostForm.tsx`
- `components/SubmitLocationForm.tsx`
- `app/actions/submit-event.ts`
- `app/actions/submit-host.ts`
- `app/actions/submit-location.ts`
- `lib/email.ts`
- Neu: `app/claim/[token]/page.tsx` + Server Action

## UX

Am Ende jedes Intake-Formulars (vor dem Submit-Button):

**Radio-Gruppe (Pflicht, keine Pre-Selection):**
- ⚪ Das ist mein eigener Eintrag
- ⚪ Ich trage das für jemand anderen ein

Validierung: Form-Submit blockieren bis eine Option gewählt ist.

Wenn "für jemand anderen" gewählt → Conditional Feld:
- **E-Mail des Anbieters/Hosts/Location-Betreibers** _(optional)_
  - Helper: "Wir laden die Person per E-Mail ein, den Eintrag zu übernehmen. Wir prüfen jede Anfrage manuell, bevor wir das Profil übertragen."

## DB-Schema

Neue Spalten auf `events`, `hosts`, `locations`:

```sql
ALTER TABLE events ADD COLUMN submitted_by_third_party boolean DEFAULT false;
ALTER TABLE events ADD COLUMN claim_email text;
ALTER TABLE events ADD COLUMN claim_token text UNIQUE;
ALTER TABLE events ADD COLUMN claim_sent_at timestamptz;
ALTER TABLE events ADD COLUMN claim_requested_at timestamptz;  -- Owner hat auf Link geklickt
ALTER TABLE events ADD COLUMN claim_status text DEFAULT 'none'; -- none | invited | requested | approved | rejected
ALTER TABLE events ADD COLUMN claimed_at timestamptz;           -- Von Lennert approved
ALTER TABLE events ADD COLUMN claimed_by_user_id uuid REFERENCES auth.users(id);

-- Gleiches für hosts und locations (inkl. claim_requested_at + claim_status)
ALTER TABLE hosts ADD COLUMN submitted_by_third_party boolean DEFAULT false;
ALTER TABLE hosts ADD COLUMN claim_email text;
ALTER TABLE hosts ADD COLUMN claim_token text UNIQUE;
ALTER TABLE hosts ADD COLUMN claim_sent_at timestamptz;
ALTER TABLE hosts ADD COLUMN claimed_at timestamptz;
ALTER TABLE hosts ADD COLUMN claimed_by_user_id uuid REFERENCES auth.users(id);

ALTER TABLE locations ADD COLUMN submitted_by_third_party boolean DEFAULT false;
ALTER TABLE locations ADD COLUMN claim_email text;
ALTER TABLE locations ADD COLUMN claim_token text UNIQUE;
ALTER TABLE locations ADD COLUMN claim_sent_at timestamptz;
ALTER TABLE locations ADD COLUMN claimed_at timestamptz;
ALTER TABLE locations ADD COLUMN claimed_by_user_id uuid REFERENCES auth.users(id);

CREATE INDEX idx_events_claim_token ON events(claim_token) WHERE claim_token IS NOT NULL;
CREATE INDEX idx_hosts_claim_token ON hosts(claim_token) WHERE claim_token IS NOT NULL;
CREATE INDEX idx_locations_claim_token ON locations(claim_token) WHERE claim_token IS NOT NULL;
```

## Form-Komponente (wiederverwendbar)

`components/OwnershipField.tsx`:

```tsx
"use client";

import { useState } from "react";

export function OwnershipField({ entityLabel }: { entityLabel: "Event" | "Raum" | "Profil" }) {
  const [isOwn, setIsOwn] = useState<"" | "yes" | "no">("");

  return (
    <fieldset className="space-y-3 border border-border rounded-lg p-4">
      <legend className="text-sm font-medium px-2">Ist das dein eigenes {entityLabel}?</legend>
      <label className="flex items-center gap-2 cursor-pointer">
        <input type="radio" name="is_own_entry" value="yes" required
          checked={isOwn === "yes"} onChange={() => setIsOwn("yes")} />
        <span>Ja, das {entityLabel.toLowerCase() === "profil" ? "bin ich" : "ist meins"}</span>
      </label>
      <label className="flex items-center gap-2 cursor-pointer">
        <input type="radio" name="is_own_entry" value="no" required
          checked={isOwn === "no"} onChange={() => setIsOwn("no")} />
        <span>Nein, ich trage das für jemand anderen ein</span>
      </label>

      {isOwn === "no" && (
        <div className="pt-2">
          <label htmlFor="claim_email" className="block text-sm mb-1">
            E-Mail {entityLabel === "Profil" ? "der Person" : "des Anbieters"} (optional)
          </label>
          <input
            type="email"
            id="claim_email"
            name="claim_email"
            className="w-full rounded border border-border px-3 py-2"
            placeholder="max@mustermann.de"
          />
          <p className="text-xs text-text-muted mt-1">
            Wir laden sie per E-Mail ein, den Eintrag zu übernehmen.
          </p>
        </div>
      )}
    </fieldset>
  );
}
```

In allen drei Submit-Formularen einbinden (vor dem Submit-Button). `entityLabel` anpassen: "Event" / "Raum" / "Profil".

## Server Actions

In `submit-event.ts`, `submit-host.ts`, `submit-location.ts`:

```typescript
import { randomUUID } from "crypto";
import { sendClaimInvitation } from "@/lib/email";

// In der Action:
const isOwnEntry = formData.get("is_own_entry") === "yes";
const claimEmail = formData.get("claim_email")?.toString().trim() || null;

const submitted_by_third_party = !isOwnEntry;
const claim_token = !isOwnEntry && claimEmail ? randomUUID() : null;

// Beim Insert:
.insert({
  ...existingFields,
  submitted_by_third_party,
  claim_email: claimEmail,
  claim_token,
})

// Nach erfolgreichem Insert:
if (claim_token && claimEmail) {
  await sendClaimInvitation({
    email: claimEmail,
    entityType: "event", // oder "host" / "location"
    entityTitle: event.title, // name / title je nach Entity
    claimToken: claim_token,
  });
  // claim_sent_at setzen
}
```

## lib/email.ts — neue Funktion

```typescript
export async function sendClaimInvitation({
  email,
  entityType,
  entityTitle,
  claimToken,
}: {
  email: string;
  entityType: "event" | "host" | "location";
  entityTitle: string;
  claimToken: string;
}) {
  const labels = {
    event: { noun: "Event", verb: "das Event" },
    host: { noun: "Profil", verb: "dein Anbieter-Profil" },
    location: { noun: "Raum", verb: "den Raum" },
  };
  const { noun, verb } = labels[entityType];
  const claimUrl = `https://das-portal.online/claim/${claimToken}`;

  const subject = `${noun} auf Das Portal für dich eingetragen`;
  const body = `
    <p>Hey,</p>
    <p>jemand hat ${verb} <strong>${entityTitle}</strong> auf Das Portal eingetragen — 
    wir würden den Eintrag gerne dir übergeben, damit du ihn selbst verwalten kannst.</p>
    <p><a href="${claimUrl}">Eintrag übernehmen</a></p>
    <p>Der Link läuft nach 30 Tagen ab. Falls du keinen Eintrag haben möchtest, 
    kannst du diese E-Mail ignorieren oder uns antworten.</p>
  `;

  // Via portalEmailLayout + resend
}
```

## Claim-Flow (mit manuellem Review)

**Wichtig:** Der Claim wird NICHT automatisch übertragen. Lennert reviewt jede Anfrage manuell.

Ablauf:

1. **Intake:** Dritter trägt ein, gibt optional E-Mail des echten Owners an → `claim_status = 'invited'`, Token wird generiert, E-Mail geht raus.
2. **Owner bekommt personalisierte E-Mail** mit Link `das-portal.online/claim/[token]`.
3. **Claim-Seite** (`app/claim/[token]/page.tsx`):
   - Zeigt: "Du übernimmst: [Titel]" + Vorschau der Daten
   - Formular mit: Name, Kontakt-E-Mail (vorausgefüllt), optional kurze Nachricht ("Warum bist du der Owner?")
   - Submit → `claim_status = 'requested'`, `claim_requested_at = now()`
   - Bestätigungsseite: "Danke, wir prüfen deine Anfrage und melden uns innerhalb von 48h."
4. **Benachrichtigung an Lennert** (E-Mail an lb@justclose.de): "Neuer Claim-Request für [Titel] von [E-Mail]. Nachricht: [...]. Admin-Link: ..."
5. **Manueller Review** durch Lennert:
   - Approved → `claim_status = 'approved'`, `claimed_at = now()`. Owner bekommt Bestätigungs-Mail + (später) Magic-Link zum Login.
   - Rejected → `claim_status = 'rejected'`. Owner bekommt höfliche Ablehnung.

**Token-Lebensdauer:** 30 Tage ab `claim_sent_at`. Danach ist der Link abgelaufen — Seite zeigt "Link abgelaufen, bitte kontaktiere uns".

**Auth-Status:** Aktuell deaktiviert. Phase 1 speichert nur Claim-Requests in DB + benachrichtigt Lennert. Echte Ownership-Übertragung (`claimed_by_user_id`, `owner_id` umbiegen) kommt mit Auth-Reaktivierung. Bis dahin reicht `claim_status = 'approved'` als Signal.

## Admin-Übersicht

Query für offene Claim-Requests (zu reviewen):
```sql
SELECT id, title, claim_email, claim_requested_at FROM events 
WHERE claim_status = 'requested' ORDER BY claim_requested_at ASC;
-- Gleiches für hosts, locations
```

Query für alle Drittparty-Einträge ohne Claim:
```sql
SELECT * FROM events 
WHERE submitted_by_third_party = true AND claim_status IN ('none', 'invited')
ORDER BY created_at DESC;
```

MVP: Einfach per SQL-Editor in Supabase reviewen. Später: Admin-UI.

## Reihenfolge

1. Migration laufen lassen (Columns)
2. `OwnershipField` Component bauen
3. In drei Forms einbauen
4. Server Actions anpassen
5. `sendClaimInvitation` in `lib/email.ts`
6. Token-Generierung + E-Mail-Versand testen
7. Claim-Seite (Phase 1: Info-Seite, Phase 2: mit Auth)
8. `npm run build` grün, dann commit

## Edge Cases

- Kein E-Mail angegeben bei "nicht mein Eintrag" → einfach `submitted_by_third_party = true`, kein Token, kein Versand. Admin kann manuell claimen.
- Doppelte E-Mail für verschiedene Einträge → erlaubt, jede bekommt eigenen Token.
- Already-claimed → Seite zeigt "Dieser Eintrag wurde bereits übernommen."
