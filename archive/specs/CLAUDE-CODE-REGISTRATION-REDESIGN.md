# Registration Redesign: Auth-First + Anmelde-Button unter Beschreibung

> Das aktuelle Anmeldeformular sieht aus wie ein Kontaktformular aus 2010: 6 Felder, kein Login, "80" als nackter Preis ohne Kontext, und es steht VOR der Beschreibung statt danach. Kompletter Redesign nötig.

## Probleme (aktuell)

1. **Reihenfolge falsch:** `EventRegistrationForm` wird in `app/events/[slug]/page.tsx` Zeile 392-404 gerendert — VOR den Description Sections (Zeile 406+). User sieht Form bevor er weiß, worum es geht.
2. **priceAmount "80" ohne Kontext:** In `EventRegistrationForm.tsx` Zeile 98-106 wird `priceAmount` als nackte Zahl angezeigt, ohne Währung oder Label.
3. **Zu viele Felder:** Vorname, Nachname, E-Mail, Telefon, Nachricht, Datenschutz-Checkbox — Kontaktformular-UX statt moderner Event-Anmeldung.
4. **Kein Login-Flow:** Wiederkehrende Nutzer müssen jedes Mal alles neu eingeben.

## Lösung: Auth-First Registration

### Prinzip
"Anmelden" = Login-First. Wiederkehrende Nutzer loggen sich ein → One-Click-Registration. Neue Nutzer / Gäste bekommen einen reduzierten Fallback.

### Neues Layout auf Event-Detailseite

Reihenfolge in `app/events/[slug]/page.tsx`:

```
1. Cover Image
2. Title
3. Info-Grid (Datum, Ort, Preis, Anbieter)
4. Tags
5. CTA Button (ticket_link — externer Link, falls vorhanden)
6. Description Sections (what_to_expect, what_youll_experience, etc.)
7. Description (Markdown fallback)
8. ────── Anmelde-Section (NEU) ──────
9. Host-Info + Map
10. Ähnliche Events
```

**Konkret: Den `EventRegistrationForm`-Block (Zeile 392-404) NACH den Description-Sections verschieben (nach Zeile ~478).**

### Neues Registration Component

Ersetze `EventRegistrationForm.tsx` komplett durch `EventRegistration.tsx`:

#### Phase 1: Ohne Auth (jetzt umsetzbar)

```
┌─────────────────────────────────────┐
│  Jetzt anmelden                     │
│                                     │
│  Noch 42 Plätze frei  [███████░░░]  │
│  80 € · Spendenbasis               │
│                                     │
│  ┌─────────────────────────────────┐│
│  │ E-Mail *           [_________] ││
│  │ Name *             [_________] ││
│  └─────────────────────────────────┘│
│                                     │
│  [       Platz sichern            ] │
│                                     │
│  Mit der Anmeldung akzeptierst du   │
│  unsere Datenschutzerklärung.       │
└─────────────────────────────────────┘
```

- **Maximal 2 Felder:** E-Mail + Name (ein Feld, kein Vor-/Nachname-Split)
- **Kein Telefon, keine Nachricht, keine separate Checkbox**
- **Preis korrekt formatiert:** "80 €" statt "80", mit price_model Label
- **Datenschutz als Inline-Text** unter dem Button, kein Checkbox-Zwang
- **Honeypot bleibt** (hidden field, unsichtbar)

#### Phase 2: Mit Auth (nach Auth-Reaktivierung)

```
┌─────────────────────────────────────┐
│  Jetzt anmelden                     │
│                                     │
│  Noch 42 Plätze frei  [███████░░░]  │
│  80 € · Spendenbasis               │
│                                     │
│  [     Mit E-Mail einloggen       ] │
│                                     │
│  ── oder als Gast ──               │
│                                     │
│  E-Mail *  [_______________]        │
│  Name *    [_______________]        │
│                                     │
│  [       Platz sichern            ] │
└─────────────────────────────────────┘
```

- **Primär:** "Mit E-Mail einloggen" → Magic Link → nach Login One-Click-Registrierung (Name + E-Mail schon bekannt)
- **Sekundär:** "Als Gast anmelden" Fallback mit 2 Feldern
- Eingeloggte User sehen nur: "Platz sichern" Button — fertig.

## Code-Änderungen

### 1. `app/events/[slug]/page.tsx` — Reihenfolge fixen

Den gesamten Block Zeile 392-404:
```tsx
{/* Event Registration Form */}
{event.registration_enabled !== false && (
  <EventRegistrationForm ... />
)}
```

**Verschieben** nach Zeile ~478 (nach dem schließenden `</div>` der Description Sections und dem Description-Fallback-Block).

### 2. `components/EventRegistrationForm.tsx` — Komplett ersetzen

Neues Component `EventRegistration.tsx` (Phase 1):

```tsx
"use client";

import { useActionState } from "react";
import Link from "next/link";
import { registerForEvent, type RegisterResult } from "@/app/actions/register-event";

const initialState: RegisterResult = { success: false, message: "" };

interface Props {
  eventId: string;
  eventTitle: string;
  capacity: number | null;
  confirmedCount: number;
  waitlistEnabled: boolean;
  registrationEnabled: boolean;
  priceModel: string | null;
  priceAmount: string | null;
}

export function EventRegistration({
  eventId,
  eventTitle,
  capacity,
  confirmedCount,
  waitlistEnabled,
  registrationEnabled,
  priceModel,
  priceAmount,
}: Props) {
  const [state, formAction, isPending] = useActionState(registerForEvent, initialState);

  const isFull = capacity !== null && confirmedCount >= capacity;
  const spotsLeft = capacity !== null ? Math.max(0, capacity - confirmedCount) : null;

  if (!registrationEnabled) return null;

  if (state.success) {
    return (
      <div className={`rounded-2xl border p-6 text-center ${
        state.status === "waitlisted"
          ? "border-amber-300/30 bg-amber-50"
          : "border-accent-sage/30 bg-accent-sage/10"
      }`}>
        <p className="text-lg font-medium text-text-primary">{state.message}</p>
        {state.status === "waitlisted" && (
          <p className="mt-2 text-sm text-text-secondary">
            Wir melden uns per E-Mail, sobald ein Platz frei wird.
          </p>
        )}
      </div>
    );
  }

  // Preis formatieren
  const priceDisplay = (() => {
    if (!priceModel || priceModel === "free") return "Kostenlos";
    const amount = priceAmount || "";
    const hasEuro = amount.includes("€") || amount.includes("EUR");
    const formatted = hasEuro ? amount : `${amount} €`;
    const suffix = priceModel === "donation" ? " · Spendenbasis"
      : priceModel === "sliding_scale" ? " · Staffelpreis"
      : "";
    return `${formatted}${suffix}`;
  })();

  return (
    <div id="anmeldung" className="rounded-2xl border border-border bg-bg-card p-6 shadow-sm">
      <h2 className="font-serif text-xl font-semibold text-text-primary mb-3">
        {isFull && waitlistEnabled ? "Auf die Warteliste" : "Jetzt anmelden"}
      </h2>

      {/* Kapazität + Preis — eine Zeile */}
      <div className="flex items-center gap-3 mb-4 text-sm">
        {capacity !== null && (
          <div className="flex-1">
            {isFull ? (
              <span className="font-medium text-amber-600">Ausgebucht</span>
            ) : (
              <span className="text-text-secondary">
                {spotsLeft === 1 ? "Noch 1 Platz" : `Noch ${spotsLeft} Plätze`}
              </span>
            )}
            <div className="mt-1 h-1.5 rounded-full bg-bg-secondary overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  isFull ? "bg-red-400" : spotsLeft !== null && spotsLeft <= 3 ? "bg-amber-400" : "bg-accent-sage"
                }`}
                style={{ width: `${Math.min(100, (confirmedCount / capacity) * 100)}%` }}
              />
            </div>
          </div>
        )}
        <span className="font-medium text-text-primary whitespace-nowrap">{priceDisplay}</span>
      </div>

      {/* Wenn voll und keine Warteliste */}
      {isFull && !waitlistEnabled ? (
        <p className="text-center text-sm text-text-muted py-4">
          Leider keine Plätze mehr verfügbar.
        </p>
      ) : (
        <form action={formAction} className="space-y-3">
          {/* Honeypot */}
          <div className="hidden" aria-hidden="true">
            <input type="text" name="website_url_confirm" tabIndex={-1} autoComplete="off" />
          </div>
          <input type="hidden" name="event_id" value={eventId} />

          <input
            type="email"
            name="email"
            required
            placeholder="Deine E-Mail"
            autoComplete="email"
            className="w-full rounded-xl border border-border bg-bg-card px-4 py-3 text-text-primary placeholder:text-text-muted focus:border-accent-primary focus:outline-none focus:ring-1 focus:ring-accent-primary"
          />

          <input
            type="text"
            name="name"
            required
            minLength={2}
            placeholder="Dein Name"
            autoComplete="name"
            className="w-full rounded-xl border border-border bg-bg-card px-4 py-3 text-text-primary placeholder:text-text-muted focus:border-accent-primary focus:outline-none focus:ring-1 focus:ring-accent-primary"
          />

          {state.message && !state.success && (
            <p className="text-sm text-red-600">{state.message}</p>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="w-full rounded-xl bg-accent-primary px-6 py-3.5 text-base font-semibold text-white shadow-md transition hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-accent-primary focus:ring-offset-2 disabled:opacity-60"
          >
            {isPending
              ? "Wird angemeldet..."
              : isFull && waitlistEnabled
                ? "Auf die Warteliste setzen"
                : "Platz sichern"}
          </button>

          <p className="text-xs text-text-muted text-center">
            Mit der Anmeldung akzeptierst du unsere{" "}
            <Link href="/datenschutz" className="underline" target="_blank">
              Datenschutzerklärung
            </Link>.
          </p>
        </form>
      )}
    </div>
  );
}
```

### 3. `app/actions/register-event.ts` — Name-Feld anpassen

Aktuell erwartet die Action `first_name` + `last_name`. Ändern zu einem einzelnen `name`-Feld:

```typescript
// Alt:
const firstName = formData.get("first_name")?.toString().trim();
const lastName = formData.get("last_name")?.toString().trim();

// Neu:
const fullName = formData.get("name")?.toString().trim();
const [firstName, ...lastParts] = (fullName || "").split(" ");
const lastName = lastParts.join(" ") || null;
```

Falls die DB `first_name` + `last_name` als separate Spalten hat → Name splitten.
Falls die DB nur `name` hat → direkt übernehmen.

### 4. Sticky CTA im Header (optional, empfohlen)

Ergänze einen Anchor-Link oben auf der Seite der zum `#anmeldung` Section scrollt:

```tsx
{/* Unter dem Info-Grid, statt dem inline CTA */}
<a href="#anmeldung" className="inline-flex items-center gap-2 rounded-full bg-accent-primary px-8 py-3 text-lg font-semibold text-white transition hover:brightness-95">
  Jetzt anmelden <span aria-hidden="true">&rarr;</span>
</a>
```

So hat der User oben einen klickbaren Button der ihn zur Anmeldung scrollt, OHNE dass das ganze Formular vor der Beschreibung steht.

## Reihenfolge der Umsetzung

1. **EventRegistrationForm verschieben** (Zeile 392-404 nach ~478) — sofortiger Fix
2. **Neues `EventRegistration.tsx` Component** bauen
3. **Server Action anpassen** (name statt first_name/last_name)
4. **Preis-Bug fixen** (€-Zeichen, price_model Label)
5. **Anchor-Link oben** statt Inline-Formular
6. **Altes Component löschen** (`EventRegistrationForm.tsx`)
7. `npm run build` grün → commit

## Phase 2 Vorbereitung (Auth)

Wenn Auth reaktiviert wird:
- "Mit E-Mail einloggen" Button hinzufügen (Magic Link via Supabase Auth)
- Eingeloggte User: nur "Platz sichern" Button, kein Formular
- Gast-Fallback: aktuelles 2-Felder-Form bleibt als Alternative
- User-Profil speichert Name + E-Mail → nie wieder eingeben
