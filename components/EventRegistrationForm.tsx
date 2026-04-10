"use client";

import { useActionState } from "react";
import Link from "next/link";
import { registerForEvent, type RegisterResult } from "@/app/actions/register-event";

const initialState: RegisterResult = { success: false, message: "" };

const inputClass =
  "w-full rounded-xl border border-border bg-bg-card px-4 py-3 text-text-primary placeholder:text-text-muted focus:border-accent-primary focus:outline-none focus:ring-1 focus:ring-accent-primary";

const labelClass = "block text-sm font-medium text-text-secondary mb-1.5";

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

export function EventRegistrationForm({
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

  // Kapazitäts-Info
  const isFull = capacity !== null && confirmedCount >= capacity;
  const spotsLeft = capacity !== null ? Math.max(0, capacity - confirmedCount) : null;

  if (!registrationEnabled) {
    return (
      <div className="rounded-2xl border border-border bg-bg-secondary p-6 text-center">
        <p className="text-sm text-text-muted">Anmeldung nicht verfügbar</p>
      </div>
    );
  }

  if (state.success) {
    return (
      <div className={`rounded-2xl border p-6 text-center ${
        state.status === "waitlisted"
          ? "border-amber-300/30 bg-amber-50"
          : "border-accent-sage/30 bg-accent-sage/10"
      }`}>
        <div className="text-2xl mb-2">{state.status === "waitlisted" ? "\u23f3" : "\u2705"}</div>
        <p className="text-lg font-medium text-text-primary">{state.message}</p>
        {state.status === "waitlisted" && (
          <p className="mt-2 text-sm text-text-secondary">
            Deine Position auf der Warteliste wird per E-Mail bestätigt.
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-bg-card p-6 shadow-sm">
      <h3 className="font-serif text-xl font-semibold text-text-primary mb-1">Anmelden</h3>

      {/* Kapazitäts-Anzeige */}
      {capacity !== null && (
        <div className="mb-4">
          {isFull ? (
            waitlistEnabled ? (
              <p className="text-sm font-medium text-amber-600">Ausgebucht — Warteliste möglich</p>
            ) : (
              <p className="text-sm font-medium text-red-600">Ausgebucht</p>
            )
          ) : (
            <p className="text-sm text-text-secondary">
              {spotsLeft === 1 ? "Noch 1 Platz frei" : `Noch ${spotsLeft} Plätze frei`}
            </p>
          )}
          {/* Progress bar */}
          <div className="mt-2 h-1.5 rounded-full bg-bg-secondary overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                isFull ? "bg-red-400" : spotsLeft !== null && spotsLeft <= 3 ? "bg-amber-400" : "bg-accent-sage"
              }`}
              style={{ width: `${Math.min(100, (confirmedCount / capacity) * 100)}%` }}
            />
          </div>
        </div>
      )}

      {/* Preis-Info */}
      {priceModel && priceModel !== "free" && priceAmount && (
        <div className="mb-4 rounded-xl bg-bg-secondary px-4 py-2.5">
          <p className="text-sm text-text-secondary">
            <span className="font-semibold text-text-primary">{priceAmount}</span>
            {priceModel === "donation" && " (Spendenbasis)"}
            {priceModel === "sliding_scale" && " (Staffelpreis)"}
          </p>
        </div>
      )}
      {priceModel === "free" && (
        <div className="mb-4 rounded-xl bg-accent-sage/10 px-4 py-2.5">
          <p className="text-sm font-medium text-accent-sage">Kostenlos</p>
        </div>
      )}

      {/* Wenn voll und keine Warteliste */}
      {isFull && !waitlistEnabled ? (
        <p className="text-center text-sm text-text-muted py-4">
          Leider sind keine Plätze mehr verfügbar.
        </p>
      ) : (
        <form action={formAction} className="space-y-4">
          {/* Honeypot */}
          <div className="hidden" aria-hidden="true">
            <input type="text" name="website_url_confirm" tabIndex={-1} autoComplete="off" />
          </div>

          <input type="hidden" name="event_id" value={eventId} />

          <div className="flex gap-3">
            <div className="flex-1">
              <label htmlFor="first_name" className={labelClass}>Vorname *</label>
              <input id="first_name" type="text" name="first_name" required minLength={2} placeholder="Vorname" className={inputClass} />
            </div>
            <div className="flex-1">
              <label htmlFor="last_name" className={labelClass}>Nachname *</label>
              <input id="last_name" type="text" name="last_name" required minLength={2} placeholder="Nachname" className={inputClass} />
            </div>
          </div>

          <div>
            <label htmlFor="reg_email" className={labelClass}>E-Mail *</label>
            <input id="reg_email" type="email" name="email" required placeholder="deine@email.de" className={inputClass} />
          </div>

          <div>
            <label htmlFor="reg_phone" className={labelClass}>Telefon</label>
            <input id="reg_phone" type="tel" name="phone" placeholder="+49 ..." className={inputClass} />
          </div>

          <div>
            <label htmlFor="reg_message" className={labelClass}>Nachricht an den Veranstalter</label>
            <textarea id="reg_message" name="message" rows={3} maxLength={500} placeholder="Fragen, Allergien, besondere Wünsche..." className={inputClass} />
          </div>

          {/* Privacy */}
          <label className="flex items-start gap-2.5 text-sm text-text-secondary cursor-pointer">
            <input
              type="checkbox"
              name="privacy"
              required
              className="mt-0.5 rounded border-border text-accent-primary focus:ring-accent-primary"
            />
            <span>
              Ich habe die{" "}
              <Link href="/datenschutz" className="text-accent-primary underline" target="_blank">
                Datenschutzerklärung
              </Link>{" "}
              gelesen und stimme der Verarbeitung meiner Daten zu.
            </span>
          </label>

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
                ? "Auf die Warteliste"
                : "Jetzt anmelden"}
          </button>
        </form>
      )}
    </div>
  );
}
