"use client";

import { useActionState } from "react";
import { submitHost } from "@/app/actions/submit-host";
import type { SubmitResult } from "@/app/actions/submit-event";

const initialState: SubmitResult = { success: false, message: "" };

const inputClass =
  "w-full rounded-xl border border-border bg-bg-card px-4 py-3 text-text-primary placeholder:text-text-muted focus:border-accent-primary focus:outline-none focus:ring-1 focus:ring-accent-primary";

const labelClass = "block text-sm font-medium text-text-secondary mb-1.5";

export function SubmitHostForm() {
  const [state, formAction, isPending] = useActionState(submitHost, initialState);

  if (state.success) {
    return (
      <div className="rounded-2xl border border-accent-sage/30 bg-accent-sage/10 p-8 text-center">
        <p className="text-lg font-medium text-text-primary">{state.message}</p>
        <p className="mt-3 text-sm text-text-secondary">
          Wir melden uns bei dir, sobald dein Profil online ist.
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-6">
      {/* Honeypot */}
      <div className="hidden" aria-hidden="true">
        <input type="text" name="website_url_confirm" tabIndex={-1} autoComplete="off" />
      </div>

      {/* Basis */}
      <fieldset className="space-y-4">
        <legend className="font-serif text-lg font-semibold text-text-primary">Über dich</legend>
        <div>
          <label htmlFor="name" className={labelClass}>Name *</label>
          <input id="name" type="text" name="name" required minLength={2} maxLength={100} placeholder="Dein Name oder der deiner Praxis" className={inputClass} />
        </div>
        <div>
          <label htmlFor="description" className={labelClass}>Beschreibung</label>
          <textarea id="description" name="description" rows={4} maxLength={1000} placeholder="Erzähl kurz über dich und dein Angebot..." className={inputClass} />
        </div>
      </fieldset>

      {/* Kontakt */}
      <fieldset className="space-y-4">
        <legend className="font-serif text-lg font-semibold text-text-primary">Kontakt</legend>
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="flex-1">
            <label htmlFor="email" className={labelClass}>E-Mail *</label>
            <input id="email" type="email" name="email" required placeholder="deine@email.de" className={inputClass} />
          </div>
          <div className="flex-1">
            <label htmlFor="website_url" className={labelClass}>Website</label>
            <input id="website_url" type="url" name="website_url" placeholder="https://..." className={inputClass} />
          </div>
        </div>
        <div>
          <label htmlFor="telegram_username" className={labelClass}>Telegram Username</label>
          <input id="telegram_username" type="text" name="telegram_username" placeholder="@deinname" className={inputClass} />
        </div>
      </fieldset>

      {/* Social */}
      <fieldset className="space-y-4">
        <legend className="font-serif text-lg font-semibold text-text-primary">Social Media</legend>
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="flex-1">
            <label htmlFor="instagram" className={labelClass}>Instagram</label>
            <input id="instagram" type="text" name="instagram" placeholder="@username" className={inputClass} />
          </div>
          <div className="flex-1">
            <label htmlFor="facebook" className={labelClass}>Facebook</label>
            <input id="facebook" type="text" name="facebook" placeholder="Profilname oder URL" className={inputClass} />
          </div>
        </div>
        <div className="sm:w-1/2">
          <label htmlFor="linkedin" className={labelClass}>LinkedIn</label>
          <input id="linkedin" type="text" name="linkedin" placeholder="Profilname oder URL" className={inputClass} />
        </div>
      </fieldset>

      {state.message && !state.success && (
        <p className="text-sm text-red-600">{state.message}</p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-xl bg-accent-primary px-6 py-3.5 text-base font-semibold text-white shadow-md transition hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-accent-primary focus:ring-offset-2 disabled:opacity-60 sm:w-auto"
      >
        {isPending ? "Wird eingereicht..." : "Profil einreichen"}
      </button>
    </form>
  );
}
