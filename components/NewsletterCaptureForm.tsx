"use client";

import { useActionState, useEffect } from "react";
import {
  subscribeToNewsletter,
  type NewsletterResult,
} from "@/app/actions/newsletter-subscribe";

declare global {
  interface Window {
    plausible?: (event: string, options?: { props?: Record<string, string> }) => void;
  }
}

interface NewsletterCaptureFormProps {
  variant: "compact" | "inline";
  source: "footer" | "events-page" | "event-detail";
}

const initialState: NewsletterResult = { ok: false, error: null };

const inputClasses =
  "flex-1 rounded-xl border border-border bg-bg-card px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:border-accent-primary focus:outline-none focus:ring-1 focus:ring-accent-primary";

const buttonClasses =
  "whitespace-nowrap rounded-xl bg-accent-primary px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-accent-primary focus:ring-offset-2 disabled:opacity-60";

function FormFields({
  source,
  isPending,
  error,
}: {
  source: string;
  isPending: boolean;
  error: string | null;
}) {
  return (
    <>
      {/* Honeypot — bots fill this, humans don't */}
      <input
        type="text"
        name="website"
        className="hidden"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
      />
      <input type="hidden" name="source" value={source} />
      <input type="hidden" name="city" value="Hamburg" />

      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          type="email"
          name="email"
          required
          placeholder="Deine E-Mail-Adresse"
          className={inputClasses}
        />
        <button type="submit" disabled={isPending} className={buttonClasses}>
          {isPending ? "..." : "Anmelden"}
        </button>
      </div>

      <label className="flex cursor-pointer items-start gap-2">
        <input
          type="checkbox"
          name="consent_dsgvo"
          required
          className="mt-0.5 h-4 w-4 shrink-0"
          style={{ accentColor: "var(--color-accent-primary)" }}
        />
        <span className="text-xs leading-relaxed text-text-secondary">
          Ja, ich möchte den wöchentlichen „Hamburg diese Woche"-Newsletter von
          Das Portal erhalten. Ich kann mich jederzeit über den Abmelde-Link in
          jeder E-Mail austragen.{" "}
          <a href="/datenschutz" className="underline hover:text-accent-primary">
            Datenschutz
          </a>
        </span>
      </label>

      {error && <p className="text-xs text-error-text">{error}</p>}
    </>
  );
}

export function NewsletterCaptureForm({
  variant,
  source,
}: NewsletterCaptureFormProps) {
  const [state, formAction, isPending] = useActionState(
    subscribeToNewsletter,
    initialState
  );

  useEffect(() => {
    if (state.ok) {
      window.plausible?.("newsletter_subscribe", { props: { source } });
    }
  }, [state.ok, source]);

  if (variant === "inline") {
    return (
      <div className="rounded-2xl border border-border bg-bg-card p-6 shadow-[0_4px_16px_rgba(44,36,24,0.06)]">
        <h2 className="font-serif text-xl text-text-primary">
          Hamburg diese Woche — direkt in dein Postfach.
        </h2>
        <p className="mt-1 text-sm text-text-secondary">
          Wöchentlich Donnerstag, kuratiert. Kostenlos.
        </p>
        {state.ok ? (
          <p className="mt-4 text-sm text-text-secondary">
            Bitte bestätige deine Anmeldung in deinem Postfach. Du erhältst
            gleich eine E-Mail von uns.
          </p>
        ) : (
          <form action={formAction} className="mt-4 space-y-3">
            <FormFields
              source={source}
              isPending={isPending}
              error={state.error}
            />
          </form>
        )}
      </div>
    );
  }

  // compact variant (footer)
  if (state.ok) {
    return (
      <p className="text-sm text-text-secondary">
        Bitte bestätige deine Anmeldung in deinem Postfach. Du erhältst gleich
        eine E-Mail von uns.
      </p>
    );
  }

  return (
    <form action={formAction} className="space-y-3">
      <FormFields
        source={source}
        isPending={isPending}
        error={state.error}
      />
    </form>
  );
}
