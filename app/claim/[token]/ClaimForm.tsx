"use client";

import { useActionState } from "react";
import { requestClaim, type ClaimResult } from "./actions";

const initialState: ClaimResult = { success: false, message: "" };

const inputClass =
  "w-full rounded-xl border border-border bg-bg-card px-4 py-3 text-text-primary placeholder:text-text-muted focus:border-accent-primary focus:outline-none focus:ring-1 focus:ring-accent-primary";
const labelClass = "block text-sm font-medium text-text-secondary mb-1.5";

export function ClaimForm({
  token,
  entityType,
  prefilledEmail,
}: {
  token: string;
  entityType: "event" | "host" | "location";
  prefilledEmail: string;
}) {
  const [state, formAction, isPending] = useActionState(requestClaim, initialState);

  if (state.success) {
    return (
      <div className="rounded-2xl border border-accent-sage/30 bg-accent-sage/10 p-8 text-center">
        <p className="text-lg font-medium text-text-primary">
          Danke! Wir prüfen deine Anfrage.
        </p>
        <p className="mt-3 text-sm text-text-secondary">
          Wir melden uns innerhalb von 48 Stunden per E-Mail bei dir.
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="token" value={token} />
      <input type="hidden" name="entity_type" value={entityType} />

      <div>
        <label htmlFor="claimer_name" className={labelClass}>Dein Name *</label>
        <input
          id="claimer_name"
          name="claimer_name"
          type="text"
          required
          minLength={2}
          maxLength={120}
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="claimer_email" className={labelClass}>Deine E-Mail *</label>
        <input
          id="claimer_email"
          name="claimer_email"
          type="email"
          required
          defaultValue={prefilledEmail}
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="message" className={labelClass}>Kurze Nachricht (optional)</label>
        <textarea
          id="message"
          name="message"
          rows={4}
          maxLength={1000}
          placeholder="Warum bist du die:der Owner? Hilft uns bei der Prüfung."
          className={inputClass}
        />
      </div>

      {state.message && !state.success && (
        <p className="text-sm text-red-600">{state.message}</p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-xl bg-accent-primary px-6 py-3.5 text-base font-semibold text-white shadow-md transition hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-accent-primary focus:ring-offset-2 disabled:opacity-60 sm:w-auto"
      >
        {isPending ? "Wird gesendet..." : "Eintrag übernehmen"}
      </button>
    </form>
  );
}
