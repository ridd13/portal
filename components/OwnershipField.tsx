"use client";

import { useState } from "react";

type EntityLabel = "Event" | "Raum" | "Profil";

export function OwnershipField({ entityLabel }: { entityLabel: EntityLabel }) {
  const [isOwn, setIsOwn] = useState<"" | "yes" | "no">("");

  const ownLabel =
    entityLabel === "Profil"
      ? "Ja, das bin ich"
      : entityLabel === "Raum"
      ? "Ja, der Raum ist meiner"
      : "Ja, das Event ist meins";

  const emailLabel =
    entityLabel === "Profil"
      ? "E-Mail der Person"
      : entityLabel === "Raum"
      ? "E-Mail des Raumhalters"
      : "E-Mail des Anbieters";

  return (
    <fieldset className="space-y-3 rounded-xl border border-border bg-bg-card p-4">
      <legend className="px-2 font-serif text-lg font-semibold text-text-primary">
        Ist das dein eigenes {entityLabel}? *
      </legend>
      <label className="flex cursor-pointer items-center gap-3 text-text-primary">
        <input
          type="radio"
          name="is_own_entry"
          value="yes"
          required
          checked={isOwn === "yes"}
          onChange={() => setIsOwn("yes")}
          className="h-4 w-4 accent-accent-primary"
        />
        <span>{ownLabel}</span>
      </label>
      <label className="flex cursor-pointer items-center gap-3 text-text-primary">
        <input
          type="radio"
          name="is_own_entry"
          value="no"
          required
          checked={isOwn === "no"}
          onChange={() => setIsOwn("no")}
          className="h-4 w-4 accent-accent-primary"
        />
        <span>Nein, ich trage das für jemand anderen ein</span>
      </label>

      {isOwn === "no" && (
        <div className="pt-2">
          <label htmlFor="claim_email" className="mb-1.5 block text-sm font-medium text-text-secondary">
            {emailLabel} <span className="text-text-muted">(optional)</span>
          </label>
          <input
            type="email"
            id="claim_email"
            name="claim_email"
            placeholder="max@mustermann.de"
            className="w-full rounded-xl border border-border bg-bg-card px-4 py-3 text-text-primary placeholder:text-text-muted focus:border-accent-primary focus:outline-none focus:ring-1 focus:ring-accent-primary"
          />
          <p className="mt-1.5 text-xs text-text-muted">
            Wir laden die Person per E-Mail ein, den Eintrag zu übernehmen. Wir prüfen jede Anfrage manuell, bevor wir das Profil übertragen.
          </p>
        </div>
      )}
    </fieldset>
  );
}
