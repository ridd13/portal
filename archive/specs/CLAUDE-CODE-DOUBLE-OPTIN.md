# Double Opt-In für Warteliste — Das Portal

## Kontext
Die Warteliste auf der Landing Page sammelt E-Mail-Adressen. Für DSGVO-Konformität brauchen wir Double Opt-In: User muss seine E-Mail per Klick bestätigen, bevor er als "confirmed" gilt.

## Tech-Entscheidung
**Resend** als E-Mail-Dienst. Kostenlos bis 3.000 Mails/Monat, native Next.js-Integration.

---

## Aufgaben

### 1. Resend installieren & konfigurieren

```bash
npm install resend
```

**Environment Variable hinzufügen:**
- `RESEND_API_KEY` — in `.env.local` und auf Vercel
- In `env.local.example` als Platzhalter eintragen

**Absender-Adresse:**
- Für den Start: `onboarding@resend.dev` (Resend Test-Adresse, funktioniert sofort)
- Kommentar im Code: `// TODO: Eigene Domain verifizieren und Absender ändern auf z.B. hallo@das-portal.online`

### 2. Supabase Schema erweitern

**SQL-Migration erstellen:** `supabase/waitlist-doi.sql`

```sql
-- Double Opt-In Felder hinzufügen
alter table public.waitlist
  add column if not exists confirmed boolean default false,
  add column if not exists confirmation_token uuid default gen_random_uuid(),
  add column if not exists confirmed_at timestamptz;

-- Index für Token-Lookup
create index if not exists idx_waitlist_token on public.waitlist(confirmation_token);
```

⚠️ **Diese SQL muss manuell im Supabase SQL Editor ausgeführt werden** (wie beim ersten Mal). Füge einen Kommentar oben ein der das sagt.

### 3. Bestätigungs-E-Mail senden

**Datei: `lib/email.ts`** (neu)

```typescript
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendConfirmationEmail(email: string, name: string | null, token: string) {
  const confirmUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/api/confirm?token=${token}`;

  await resend.emails.send({
    from: 'Das Portal <onboarding@resend.dev>', // TODO: Eigene Domain verifizieren
    to: email,
    subject: 'Bitte bestätige deine Anmeldung – Das Portal',
    html: `
      <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <h1 style="color: #2c2418; font-size: 24px;">Willkommen bei Das Portal!</h1>
        <p style="color: #6b5b4e; font-size: 16px; line-height: 1.6;">
          Hallo${name ? ` ${name}` : ''},<br><br>
          schön, dass du dabei sein willst! Bitte bestätige deine E-Mail-Adresse mit einem Klick:
        </p>
        <a href="${confirmUrl}"
           style="display: inline-block; background-color: #b5651d; color: white; padding: 14px 28px;
                  border-radius: 12px; text-decoration: none; font-weight: 600; font-size: 16px; margin: 20px 0;">
          E-Mail bestätigen
        </a>
        <p style="color: #9a8b7a; font-size: 14px; line-height: 1.5; margin-top: 30px;">
          Falls du dich nicht angemeldet hast, kannst du diese E-Mail ignorieren.<br>
          Kein Spam. Nur Updates zum Launch.
        </p>
        <hr style="border: none; border-top: 1px solid #e5ddd3; margin: 30px 0;" />
        <p style="color: #9a8b7a; font-size: 12px;">
          Das Portal — Sichtbarkeit für Coaches, Heiler:innen & Facilitators<br>
          Schleswig-Holstein & Hamburg
        </p>
      </div>
    `,
  });
}
```

### 4. Server Action anpassen

**Datei: `app/actions/waitlist.ts`**

Aktueller Flow: Insert → Erfolg
Neuer Flow: Insert (mit `confirmed: false`) → E-Mail senden → "Bitte bestätigen"

```typescript
"use server";

import { getSupabaseServerClient } from "@/lib/supabase";
import { sendConfirmationEmail } from "@/lib/email";

export type WaitlistResult = {
  success: boolean;
  message: string;
};

export async function joinWaitlist(
  _prev: WaitlistResult,
  formData: FormData
): Promise<WaitlistResult> {
  const email = formData.get("email")?.toString().trim().toLowerCase();
  const name = formData.get("name")?.toString().trim() || null;
  const role = formData.get("role")?.toString().trim() || null;
  const city = formData.get("city")?.toString().trim() || null;

  if (!email || !email.includes("@")) {
    return { success: false, message: "Bitte gib eine gültige E-Mail-Adresse ein." };
  }

  const supabase = getSupabaseServerClient();

  const { data, error } = await (supabase.from("waitlist") as any)
    .insert({ email, name, role, city, confirmed: false })
    .select("confirmation_token")
    .single();

  if (error) {
    if (error.code === "23505") {
      // Bereits registriert — prüfen ob schon confirmed
      const { data: existing } = await (supabase.from("waitlist") as any)
        .select("confirmed, confirmation_token")
        .eq("email", email)
        .single();

      if (existing?.confirmed) {
        return { success: true, message: "Du bist bereits auf der Warteliste und bestätigt!" };
      }

      // Nicht bestätigt → E-Mail erneut senden
      if (existing?.confirmation_token) {
        try {
          await sendConfirmationEmail(email, name, existing.confirmation_token);
        } catch (e) {
          console.error("Resend error:", e);
        }
        return { success: true, message: "Wir haben dir erneut eine Bestätigungs-E-Mail geschickt. Bitte check dein Postfach!" };
      }

      return { success: true, message: "Du bist bereits auf der Warteliste!" };
    }
    console.error("Waitlist insert error:", error);
    return { success: false, message: "Etwas ist schiefgelaufen. Bitte versuche es erneut." };
  }

  // E-Mail senden
  try {
    await sendConfirmationEmail(email, name, data.confirmation_token);
  } catch (e) {
    console.error("Resend error:", e);
    // Insert hat geklappt, nur E-Mail nicht — trotzdem Erfolg zeigen
  }

  return { success: true, message: "Fast geschafft! Bitte bestätige deine E-Mail-Adresse — check dein Postfach." };
}
```

### 5. Bestätigungs-Endpoint

**Neue Datei: `app/api/confirm/route.ts`** (API Route)

```typescript
import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");

  if (!token) {
    return NextResponse.redirect(new URL("/?confirmed=invalid", request.url));
  }

  const supabase = getSupabaseServerClient();

  // Token suchen und bestätigen
  const { data, error } = await (supabase.from("waitlist") as any)
    .update({ confirmed: true, confirmed_at: new Date().toISOString() })
    .eq("confirmation_token", token)
    .eq("confirmed", false)
    .select("email")
    .single();

  if (error || !data) {
    // Token ungültig oder bereits bestätigt
    return NextResponse.redirect(new URL("/?confirmed=already", request.url));
  }

  // Erfolg → Redirect zur Landing Page mit Bestätigung
  return NextResponse.redirect(new URL("/?confirmed=success", request.url));
}
```

### 6. Bestätigungs-Feedback auf der Landing Page

**Datei: `app/page.tsx`**

Wenn die URL `?confirmed=success` enthält, zeige eine Erfolgsmeldung:

```tsx
// searchParams auslesen (ist ein Promise in Next.js 16!)
const params = await searchParams;

// Bestätigungs-Banner
{params.confirmed === "success" && (
  <div className="rounded-2xl border border-success-border bg-success-bg p-4 text-center text-success-text">
    Deine E-Mail ist bestätigt — du bist offiziell auf der Warteliste!
  </div>
)}
{params.confirmed === "already" && (
  <div className="rounded-2xl border border-border bg-bg-card p-4 text-center text-text-secondary">
    Deine E-Mail wurde bereits bestätigt.
  </div>
)}
```

Dafür muss `page.tsx` die `searchParams` als Prop annehmen (wie in `/events`).

### 7. WaitlistForm Feedback anpassen

**Datei: `components/WaitlistForm.tsx`**

Die Erfolgsmeldung sollte klarer auf den E-Mail-Check hinweisen:
- Aktuell: "Du bist dabei! Wir melden uns bald bei dir."
- Neu (kommt aus der Server Action): "Fast geschafft! Bitte bestätige deine E-Mail-Adresse — check dein Postfach."

### 8. Environment Variable

**`NEXT_PUBLIC_SITE_URL`** muss gesetzt sein:
- Lokal: `http://localhost:3000`
- Vercel: `https://www.das-portal.online`

Prüfen ob die Variable bereits existiert. Falls nicht, in `env.local.example` eintragen.

---

## Supabase RLS Update

Die bestehende anon-Insert-Policy muss auch die neuen Felder erlauben. Da wir `with check (true)` nutzen, passt das bereits.

Aber: Für den Confirm-Endpoint brauchen wir eine **Update-Policy** für den Server (service_role key oder anon mit Update-Berechtigung).

Prüfe ob der Supabase-Client mit dem `service_role` key arbeitet (Server-seitig). Falls ja, umgeht er RLS automatisch. Falls nicht, brauchen wir:

```sql
-- Anon darf eigenen Eintrag über Token updaten
create policy "Confirm via token"
  on public.waitlist
  for update
  to anon
  using (true)
  with check (confirmed = true);
```

---

## Reihenfolge
1. `npm install resend`
2. SQL-Migration erstellen (nicht ausführen — das macht Lennert manuell)
3. `lib/email.ts` erstellen
4. `app/actions/waitlist.ts` anpassen
5. `app/api/confirm/route.ts` erstellen
6. `app/page.tsx` — searchParams + Bestätigungs-Banner
7. `env.local.example` updaten
8. `npm run build` — muss kompilieren
9. Hinweis ausgeben: "SQL muss noch im Supabase SQL Editor ausgeführt werden" + "RESEND_API_KEY muss auf Vercel gesetzt werden"

## Nach der Umsetzung
- Testen: Form ausfüllen → E-Mail kommt → Link klicken → Redirect mit Bestätigung
- In Supabase prüfen: `confirmed = true` und `confirmed_at` gesetzt
