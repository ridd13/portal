"use client";

import { useActionState } from "react";
import { updateRegistrationStatus } from "@/app/actions/manage-registration";

interface RegistrationActionsProps {
  registrationId: string;
  currentStatus: string;
}

export function RegistrationActions({ registrationId, currentStatus }: RegistrationActionsProps) {
  const initialState: { error: string | null; success: string | null } = { error: null, success: null };
  const [state, formAction, isPending] = useActionState(updateRegistrationStatus, initialState);

  return (
    <form action={formAction} className="flex flex-wrap gap-1">
      <input type="hidden" name="registrationId" value={registrationId} />
      {currentStatus !== "confirmed" ? (
        <button
          type="submit"
          name="status"
          value="confirmed"
          disabled={isPending}
          className="rounded-lg bg-accent-sage/15 px-2 py-1 text-xs font-medium text-accent-sage transition hover:bg-accent-sage/25 disabled:opacity-50"
        >
          Bestätigen
        </button>
      ) : null}
      {currentStatus !== "waitlisted" ? (
        <button
          type="submit"
          name="status"
          value="waitlisted"
          disabled={isPending}
          className="rounded-lg bg-accent-primary/15 px-2 py-1 text-xs font-medium text-accent-primary transition hover:bg-accent-primary/25 disabled:opacity-50"
        >
          Warteliste
        </button>
      ) : null}
      {currentStatus !== "cancelled" ? (
        <button
          type="submit"
          name="status"
          value="cancelled"
          disabled={isPending}
          className="rounded-lg bg-bg-secondary px-2 py-1 text-xs font-medium text-text-muted transition hover:bg-border disabled:opacity-50"
        >
          Stornieren
        </button>
      ) : null}
      {state?.error ? (
        <span className="text-xs text-error-text">{state.error}</span>
      ) : null}
    </form>
  );
}
