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
    const hasEuro = amount.includes("\u20ac") || amount.includes("EUR");
    const formatted = hasEuro ? amount : `${amount} \u20ac`;
    const suffix = priceModel === "donation" ? " \u00b7 Spendenbasis"
      : priceModel === "sliding_scale" ? " \u00b7 Staffelpreis"
      : "";
    return `${formatted}${suffix}`;
  })();

  return (
    <div id="anmeldung" className="rounded-2xl border border-border bg-bg-card p-6 shadow-sm">
      <h2 className="font-serif text-xl font-semibold text-text-primary mb-3">
        {isFull && waitlistEnabled ? "Auf die Warteliste" : "Jetzt anmelden"}
      </h2>

      {/* Kapazität + Preis */}
      <div className="flex items-center gap-3 mb-4 text-sm">
        {capacity !== null && (
          <div className="flex-1">
            {isFull ? (
              <span className="font-medium text-amber-600">Ausgebucht</span>
            ) : (
              <span className="text-text-secondary">
                {spotsLeft === 1 ? "Noch 1 Platz" : `Noch ${spotsLeft} Pl\u00e4tze`}
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
          Leider keine Pl\u00e4tze mehr verf\u00fcgbar.
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
              Datenschutzerkl\u00e4rung
            </Link>.
          </p>
        </form>
      )}
    </div>
  );
}
