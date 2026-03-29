"use client";

import { useActionState } from "react";
import { suggestGroup, type SuggestGroupResult } from "@/app/actions/suggest-group";

const initialState: SuggestGroupResult = { success: false, message: "" };

const regions = [
  { value: "", label: "Region (optional)" },
  { value: "Hamburg", label: "Hamburg" },
  { value: "Schleswig-Holstein", label: "Schleswig-Holstein" },
  { value: "Niedersachsen", label: "Niedersachsen" },
  { value: "Bremen", label: "Bremen" },
  { value: "Mecklenburg-Vorpommern", label: "Mecklenburg-Vorpommern" },
  { value: "Andere", label: "Andere Region" },
];

export function SuggestGroupForm() {
  const [state, formAction, isPending] = useActionState(suggestGroup, initialState);

  if (state.success) {
    return (
      <div className="rounded-2xl border border-accent-sage/30 bg-[#f0f5eb] p-6 text-center">
        <p className="text-lg font-medium text-text-primary">{state.message}</p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row">
        <input
          type="text"
          name="group_link"
          required
          placeholder="Telegram-Link oder @gruppenname *"
          className="flex-1 rounded-xl border border-border bg-bg-card px-4 py-3 text-text-primary placeholder:text-text-muted focus:border-accent-primary focus:outline-none focus:ring-1 focus:ring-accent-primary"
        />
        <input
          type="text"
          name="group_name"
          placeholder="Name der Gruppe (optional)"
          className="flex-1 rounded-xl border border-border bg-bg-card px-4 py-3 text-text-primary placeholder:text-text-muted focus:border-accent-primary focus:outline-none focus:ring-1 focus:ring-accent-primary"
        />
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <select
          name="region"
          className="flex-1 rounded-xl border border-border bg-bg-card px-4 py-3 text-text-primary focus:border-accent-primary focus:outline-none focus:ring-1 focus:ring-accent-primary"
        >
          {regions.map((r) => (
            <option key={r.value} value={r.value}>
              {r.label}
            </option>
          ))}
        </select>

        <button
          type="submit"
          disabled={isPending}
          className="rounded-xl bg-accent-primary px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-accent-primary focus:ring-offset-2 disabled:opacity-60"
        >
          {isPending ? "Wird gesendet..." : "Gruppe vorschlagen"}
        </button>
      </div>

      {state.message && !state.success && (
        <p className="text-sm text-red-600">{state.message}</p>
      )}
    </form>
  );
}
