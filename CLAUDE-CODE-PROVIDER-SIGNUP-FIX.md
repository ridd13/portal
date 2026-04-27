# CLAUDE-CODE-PROVIDER-SIGNUP-FIX

> Fix für `provider_signups` Server Action: Email-Benachrichtigung an Lennert + Redirect auf deaktivierter Auth-Page ersetzen durch Inline-Success-State.

## Kontext

- Tabelle `provider_signups` existiert (`supabase/provider-signups.sql`) und sammelt seit April Einträge.
- Server Action: `app/actions/provider-signup.ts` → macht Insert, redirected dann auf `/auth?mode=magic-link&email=…`.
- **Problem 1:** Keine Email-Notifikation an Lennert → Signups blieben unbemerkt.
- **Problem 2:** `/auth` ist laut `CLAUDE.md` **deaktiviert**. User landet nach Eintrag auf kaputter/deaktivierter Seite → denkt "hat nicht geklappt" → trägt sich mehrfach ein (aktuell 3× dieselbe Person mit derselben Email).
- Form-Component `components/ProviderSignupForm.tsx` ist aktuell **verwaist** (wird in keiner Page importiert). Das ist out-of-scope für diesen Fix — separater Task.

## Aufgabe

### 1. Email-Benachrichtigung in `lib/email.ts` hinzufügen

Neue Funktion `sendProviderSignupNotification` nach dem Muster von `sendClaimRequestNotification`. Versendet an `lb@justclose.de`.

```ts
export async function sendProviderSignupNotification({
  email,
  name,
  city,
}: {
  email: string;
  name: string | null;
  city: string | null;
}) {
  if (!process.env.RESEND_API_KEY) {
    console.log("[EMAIL SKIP] RESEND_API_KEY not set — skipping provider signup notification");
    return;
  }

  const subject = `Neuer Anbieter-Signup: ${name ?? email}`;

  const html = portalEmailLayout(`
    <h1 style="color: #2c2418; font-size: 24px;">Neuer Anbieter-Signup</h1>
    <div style="background-color: #ffffff; border: 1px solid #e5ddd3; border-radius: 12px; padding: 20px; margin: 20px 0;">
      <p style="color: #6b5b4e; font-size: 15px; margin: 4px 0;"><strong>Name:</strong> ${name ?? "—"}</p>
      <p style="color: #6b5b4e; font-size: 15px; margin: 4px 0;"><strong>E-Mail:</strong> ${email}</p>
      <p style="color: #6b5b4e; font-size: 15px; margin: 4px 0;"><strong>Stadt:</strong> ${city ?? "—"}</p>
    </div>
    <p style="color: #9a8b7a; font-size: 14px; line-height: 1.5;">
      Eingang auf <code>provider_signups</code>. Zum Prüfen:
      <code>SELECT * FROM provider_signups WHERE email='${email}' ORDER BY created_at DESC;</code>
    </p>
  `);

  try {
    await resend.emails.send({
      from: FROM_ADDRESS,
      to: "lb@justclose.de",
      subject,
      html,
    });
  } catch (error) {
    console.error("[EMAIL ERROR] Provider signup notification failed:", error);
  }
}
```

### 2. `app/actions/provider-signup.ts` umbauen

- Redirect auf `/auth` **entfernen** (Auth ist deaktiviert).
- Nach erfolgreichem Insert: Email-Benachrichtigung feuern (non-blocking, Fehler nur loggen).
- Return `{ success: true, message: "..." }` statt Redirect, damit das Form einen Inline-Success-State rendern kann.
- Duplicate (`23505`) auch als Success behandeln, aber keine Email versenden.

```ts
"use server";

import { getSupabaseServerClient } from "@/lib/supabase";
import { sendProviderSignupNotification } from "@/lib/email";

export type ProviderSignupResult = {
  success: boolean;
  message: string;
};

export async function registerProvider(
  _prev: ProviderSignupResult,
  formData: FormData
): Promise<ProviderSignupResult> {
  const email = formData.get("email")?.toString().trim().toLowerCase();
  const name = formData.get("name")?.toString().trim() || null;
  const city = formData.get("city")?.toString().trim() || null;

  if (!email || !email.includes("@")) {
    return { success: false, message: "Bitte gib eine gültige E-Mail-Adresse ein." };
  }

  const supabase = getSupabaseServerClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from("provider_signups") as any).insert({
    email,
    name,
    city,
  });

  if (error) {
    if (error.code === "23505") {
      // Schon eingetragen — trotzdem Success, aber keine Email
      return {
        success: true,
        message: "Du bist bereits eingetragen. Wir melden uns, sobald es losgeht.",
      };
    }
    console.error("Provider signup insert error:", error);
    return { success: false, message: "Etwas ist schiefgelaufen. Bitte versuche es erneut." };
  }

  // Email fire-and-forget — soll nicht blockieren wenn Resend mal hängt
  sendProviderSignupNotification({ email, name, city }).catch((err) => {
    console.error("Provider signup notification dispatch failed:", err);
  });

  return {
    success: true,
    message: "Danke! Wir melden uns, sobald Das Portal live geht.",
  };
}
```

### 3. `components/ProviderSignupForm.tsx` anpassen

- Inline Success-State rendern wenn `state.success === true` (analog zu Waitlist-Pattern).
- Bei Success: Formular ausblenden, stattdessen grüne Danke-Box zeigen.
- Fehlermeldung weiterhin unter dem Formular anzeigen (existiert schon).

```tsx
"use client";

import { useActionState } from "react";
import { registerProvider, type ProviderSignupResult } from "@/app/actions/provider-signup";

const initialState: ProviderSignupResult = { success: false, message: "" };

export function ProviderSignupForm() {
  const [state, formAction, isPending] = useActionState(registerProvider, initialState);

  if (state.success) {
    return (
      <div className="rounded-xl border border-accent-sage bg-[#ecfdf5] px-6 py-5 text-center">
        <p className="text-base font-medium text-text-primary">{state.message}</p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      {/* ...bestehender Form-Code bleibt 1:1... */}
    </form>
  );
}
```

## Nicht in Scope

- Form wieder in eine Page einbauen (verwaist) — separater Task; Lennert entscheidet, ob auf `/einreichen/host` oder eine eigene Landing-Section.
- Auth-Flow reaktivieren — separater Task laut CLAUDE.md.

## Akzeptanzkriterien

- [ ] Neuer Signup → Lennert bekommt Email an `lb@justclose.de` mit Name/Email/Stadt.
- [ ] User sieht nach Submit eine grüne Danke-Box, kein Redirect auf `/auth` mehr.
- [ ] Duplicate (gleiche Email) zeigt Success-State mit Hinweis "schon eingetragen", keine Doppel-Email.
- [ ] `npm run build` läuft durch.
- [ ] Keine Änderung am DB-Schema nötig.

## Test-Rezept

1. `npm run dev` lokal.
2. Form testweise in `/einreichen/host/page.tsx` importieren (für Test, danach revert).
3. Mit Test-Email submitten → Resend-Log prüfen + Supabase-Eintrag prüfen.
4. Nochmal mit derselben Email submitten → Duplicate-Pfad prüfen (Success ohne 2. Email).
