"use client";

import { useActionState } from "react";
import { registerProvider, type ProviderSignupResult } from "@/app/actions/provider-signup";

const initialState: ProviderSignupResult = { success: false, message: "" };

export function ProviderSignupForm() {
  const [state, formAction, isPending] = useActionState(registerProvider, initialState);

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

      <input
        type="text"
        name="city"
        placeholder="Deine Stadt (z.B. Hamburg, Kiel, Lübeck)"
        className="w-full rounded-xl border border-border bg-bg-card px-4 py-3 text-text-primary placeholder:text-text-muted focus:border-accent-primary focus:outline-none focus:ring-1 focus:ring-accent-primary"
      />

      {state.message && !state.success && (
        <p className="text-sm text-error-text">{state.message}</p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-xl bg-accent-primary px-6 py-3.5 text-base font-semibold text-white shadow-md transition hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-accent-primary focus:ring-offset-2 disabled:opacity-60 sm:w-auto"
      >
        {isPending ? "Wird registriert..." : "Jetzt registrieren"}
      </button>
    </form>
  );
}
