"use client";

import { useActionState } from "react";
import { submitEvent, type SubmitResult } from "@/app/actions/submit-event";
import { OwnershipField } from "./OwnershipField";

const initialState: SubmitResult = { success: false, message: "" };

const inputClass =
  "w-full rounded-xl border border-border bg-bg-card px-4 py-3 text-text-primary placeholder:text-text-muted focus:border-accent-primary focus:outline-none focus:ring-1 focus:ring-accent-primary";

const labelClass = "block text-sm font-medium text-text-secondary mb-1.5";

export function SubmitEventForm() {
  const [state, formAction, isPending] = useActionState(submitEvent, initialState);

  if (state.success) {
    return (
      <div className="rounded-2xl border border-accent-sage/30 bg-accent-sage/10 p-8 text-center">
        <p className="text-lg font-medium text-text-primary">{state.message}</p>
        <p className="mt-3 text-sm text-text-secondary">
          Wir melden uns bei dir, sobald das Event freigeschaltet ist.
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

      {/* Grundinfo */}
      <fieldset className="space-y-4">
        <legend className="font-serif text-lg font-semibold text-text-primary">Grundinfos</legend>
        <div>
          <label htmlFor="title" className={labelClass}>Titel *</label>
          <input id="title" type="text" name="title" required minLength={3} maxLength={200} placeholder="z.B. Kakaozeremonie im Vollmond" className={inputClass} />
        </div>
        <div>
          <label htmlFor="description" className={labelClass}>Beschreibung</label>
          <textarea id="description" name="description" rows={4} maxLength={2000} placeholder="Was erwartet die Teilnehmer?" className={inputClass} />
        </div>
      </fieldset>

      {/* Datum */}
      <fieldset className="space-y-4">
        <legend className="font-serif text-lg font-semibold text-text-primary">Datum & Zeit</legend>
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="flex-1">
            <label htmlFor="start_at" className={labelClass}>Beginn *</label>
            <input id="start_at" type="datetime-local" name="start_at" required className={inputClass} />
          </div>
          <div className="flex-1">
            <label htmlFor="end_at" className={labelClass}>Ende</label>
            <input id="end_at" type="datetime-local" name="end_at" className={inputClass} />
          </div>
        </div>
      </fieldset>

      {/* Ort */}
      <fieldset className="space-y-4">
        <legend className="font-serif text-lg font-semibold text-text-primary">Ort</legend>
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="flex-1">
            <label htmlFor="location_name" className={labelClass}>Name des Ortes</label>
            <input id="location_name" type="text" name="location_name" placeholder="z.B. Yoga Studio am Hafen" className={inputClass} />
          </div>
          <div className="flex-1">
            <label htmlFor="address" className={labelClass}>Adresse</label>
            <input id="address" type="text" name="address" placeholder="Straße, PLZ, Stadt" className={inputClass} />
          </div>
        </div>
      </fieldset>

      {/* Details */}
      <fieldset className="space-y-4">
        <legend className="font-serif text-lg font-semibold text-text-primary">Details</legend>
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="flex-1">
            <label htmlFor="price_model" className={labelClass}>Preismodell</label>
            <select id="price_model" name="price_model" className={inputClass}>
              <option value="">Bitte wählen</option>
              <option value="free">Kostenlos</option>
              <option value="paid">Bezahlt</option>
              <option value="donation">Auf Spendenbasis</option>
              <option value="sliding_scale">Staffelpreis</option>
            </select>
          </div>
          <div className="flex-1">
            <label htmlFor="price_amount" className={labelClass}>Preis</label>
            <input id="price_amount" type="text" name="price_amount" placeholder="z.B. 25€, 40-60€, ab 15€" className={inputClass} />
          </div>
        </div>
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="flex-1">
            <label htmlFor="tags" className={labelClass}>Tags</label>
            <input id="tags" type="text" name="tags" placeholder="z.B. Yoga, Meditation, Breathwork" className={inputClass} />
          </div>
          <div className="w-32">
            <label htmlFor="capacity" className={labelClass}>Max. Teilnehmer</label>
            <input id="capacity" type="number" name="capacity" min={1} placeholder="z.B. 20" className={inputClass} />
          </div>
        </div>
        <div>
          <label htmlFor="ticket_link" className={labelClass}>Link zur Anmeldung</label>
          <input id="ticket_link" type="url" name="ticket_link" placeholder="https://..." className={inputClass} />
        </div>
        <div>
          <label htmlFor="photo" className={labelClass}>Foto / Titelbild</label>
          <input id="photo" type="file" name="photo" accept="image/jpeg,image/png,image/webp" className="w-full text-sm text-text-secondary file:mr-3 file:rounded-lg file:border-0 file:bg-bg-secondary file:px-4 file:py-2 file:text-sm file:font-medium file:text-text-primary hover:file:bg-border" />
          <p className="mt-1 text-xs text-text-muted">JPG, PNG oder WebP, max. 5 MB</p>
        </div>
      </fieldset>

      {/* Kontakt */}
      <fieldset className="space-y-4">
        <legend className="font-serif text-lg font-semibold text-text-primary">Kontakt</legend>
        <div>
          <label htmlFor="contact_email" className={labelClass}>Deine E-Mail *</label>
          <input id="contact_email" type="email" name="contact_email" required placeholder="Damit wir dich erreichen können" className={inputClass} />
        </div>
      </fieldset>

      <OwnershipField entityLabel="Event" />

      {state.message && !state.success && (
        <p className="text-sm text-red-600">{state.message}</p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-xl bg-accent-primary px-6 py-3.5 text-base font-semibold text-white shadow-md transition hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-accent-primary focus:ring-offset-2 disabled:opacity-60 sm:w-auto"
      >
        {isPending ? "Wird eingereicht..." : "Event einreichen"}
      </button>
    </form>
  );
}
