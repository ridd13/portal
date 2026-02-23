"use client";

import { useActionState } from "react";
import { joinWaitlist, type WaitlistResult } from "@/app/actions/waitlist";

const initialState: WaitlistResult = { success: false, message: "" };

const roles = [
  { value: "", label: "Was beschreibt dich am besten?" },
  { value: "coach", label: "Coach" },
  { value: "heiler", label: "Heiler:in" },
  { value: "therapeut", label: "Therapeut:in" },
  { value: "schamane", label: "Schamane / Schamanin" },
  { value: "facilitator", label: "Facilitator / Workshop-Leiter:in" },
  { value: "yogalehrer", label: "Yogalehrer:in" },
  { value: "meditationslehrer", label: "Meditationslehrer:in" },
  { value: "sonstige", label: "Sonstiges" },
];

export function WaitlistForm() {
  const [state, formAction, isPending] = useActionState(joinWaitlist, initialState);

  if (state.success) {
    return (
      <div className="rounded-2xl border border-success-border bg-success-bg p-6 text-center">
        <p className="text-lg font-medium text-success-text">{state.message}</p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row">
        <input
          type="text"
          name="name"
          placeholder="Dein Name"
          className="flex-1 rounded-xl border border-border bg-bg-card px-4 py-3 text-text-primary placeholder:text-text-muted focus:border-accent-primary focus:outline-none focus:ring-1 focus:ring-accent-primary"
        />
        <input
          type="email"
          name="email"
          required
          placeholder="Deine E-Mail *"
          className="flex-1 rounded-xl border border-border bg-bg-card px-4 py-3 text-text-primary placeholder:text-text-muted focus:border-accent-primary focus:outline-none focus:ring-1 focus:ring-accent-primary"
        />
      </div>

      <div className="flex flex-col gap-4 sm:flex-row">
        <select
          name="role"
          className="flex-1 rounded-xl border border-border bg-bg-card px-4 py-3 text-text-primary focus:border-accent-primary focus:outline-none focus:ring-1 focus:ring-accent-primary"
        >
          {roles.map((r) => (
            <option key={r.value} value={r.value}>
              {r.label}
            </option>
          ))}
        </select>
        <input
          type="text"
          name="city"
          placeholder="Deine Stadt"
          className="flex-1 rounded-xl border border-border bg-bg-card px-4 py-3 text-text-primary placeholder:text-text-muted focus:border-accent-primary focus:outline-none focus:ring-1 focus:ring-accent-primary"
        />
      </div>

      {state.message && !state.success && (
        <p className="text-sm text-error-text">{state.message}</p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-xl bg-accent-primary px-6 py-3.5 text-base font-semibold text-white shadow-md transition hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-accent-primary focus:ring-offset-2 disabled:opacity-60 sm:w-auto"
      >
        {isPending ? "Wird eingetragen..." : "Auf die Warteliste"}
      </button>
    </form>
  );
}
