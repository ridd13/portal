"use client";

import { useActionState } from "react";
import { submitLocation } from "@/app/actions/submit-location";
import type { SubmitResult } from "@/app/actions/submit-event";

const initialState: SubmitResult = { success: false, message: "" };

const inputClass =
  "w-full rounded-xl border border-border bg-bg-card px-4 py-3 text-text-primary placeholder:text-text-muted focus:border-accent-primary focus:outline-none focus:ring-1 focus:ring-accent-primary";

const labelClass = "block text-sm font-medium text-text-secondary mb-1.5";

const locationTypes = [
  { value: "", label: "Bitte wählen *" },
  { value: "venue", label: "Studio / Seminarraum" },
  { value: "retreat_center", label: "Retreat-Zentrum" },
  { value: "outdoor", label: "Outdoor / Natur" },
  { value: "coworking", label: "Coworking" },
  { value: "online", label: "Online" },
  { value: "private", label: "Privater Raum" },
  { value: "other", label: "Sonstiges" },
];

export function SubmitLocationForm() {
  const [state, formAction, isPending] = useActionState(submitLocation, initialState);

  if (state.success) {
    return (
      <div className="rounded-2xl border border-accent-sage/30 bg-accent-sage/10 p-8 text-center">
        <p className="text-lg font-medium text-text-primary">{state.message}</p>
        <p className="mt-3 text-sm text-text-secondary">
          Wir prüfen den Ort und nehmen ihn auf.
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
        <legend className="font-serif text-lg font-semibold text-text-primary">Grundinfos</legend>
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="flex-1">
            <label htmlFor="name" className={labelClass}>Name *</label>
            <input id="name" type="text" name="name" required minLength={2} maxLength={100} placeholder="z.B. Yoga Studio Kiellinie" className={inputClass} />
          </div>
          <div className="flex-1">
            <label htmlFor="type" className={labelClass}>Typ *</label>
            <select id="type" name="type" required className={inputClass}>
              {locationTypes.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label htmlFor="description" className={labelClass}>Beschreibung</label>
          <textarea id="description" name="description" rows={3} maxLength={1000} placeholder="Was macht diesen Ort besonders?" className={inputClass} />
        </div>
      </fieldset>

      {/* Adresse */}
      <fieldset className="space-y-4">
        <legend className="font-serif text-lg font-semibold text-text-primary">Adresse</legend>
        <div>
          <label htmlFor="address" className={labelClass}>Straße & Hausnummer</label>
          <input id="address" type="text" name="address" placeholder="Musterstraße 12" className={inputClass} />
        </div>
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="w-32">
            <label htmlFor="postal_code" className={labelClass}>PLZ</label>
            <input id="postal_code" type="text" name="postal_code" maxLength={10} placeholder="24103" className={inputClass} />
          </div>
          <div className="flex-1">
            <label htmlFor="city" className={labelClass}>Stadt</label>
            <input id="city" type="text" name="city" placeholder="Kiel" className={inputClass} />
          </div>
        </div>
      </fieldset>

      {/* Details */}
      <fieldset className="space-y-4">
        <legend className="font-serif text-lg font-semibold text-text-primary">Details</legend>
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="flex-1">
            <label htmlFor="capacity" className={labelClass}>Kapazität (Personen)</label>
            <input id="capacity" type="number" name="capacity" min={1} placeholder="z.B. 30" className={inputClass} />
          </div>
          <div className="flex-1">
            <label htmlFor="amenities" className={labelClass}>Ausstattung</label>
            <input id="amenities" type="text" name="amenities" placeholder="z.B. Matten, Küche, Parkplatz" className={inputClass} />
          </div>
        </div>
        <div className="flex gap-6">
          <label className="flex items-center gap-2 text-sm text-text-secondary">
            <input type="checkbox" name="overnight_possible" className="rounded border-border text-accent-primary focus:ring-accent-primary" />
            Übernachtung möglich
          </label>
          <label className="flex items-center gap-2 text-sm text-text-secondary">
            <input type="checkbox" name="wheelchair_accessible" className="rounded border-border text-accent-primary focus:ring-accent-primary" />
            Barrierefrei
          </label>
        </div>
      </fieldset>

      {/* Kontakt */}
      <fieldset className="space-y-4">
        <legend className="font-serif text-lg font-semibold text-text-primary">Kontakt</legend>
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="flex-1">
            <label htmlFor="contact_email" className={labelClass}>E-Mail</label>
            <input id="contact_email" type="email" name="contact_email" placeholder="kontakt@ort.de" className={inputClass} />
          </div>
          <div className="flex-1">
            <label htmlFor="phone" className={labelClass}>Telefon</label>
            <input id="phone" type="tel" name="phone" placeholder="+49 ..." className={inputClass} />
          </div>
        </div>
        <div>
          <label htmlFor="website_url" className={labelClass}>Website</label>
          <input id="website_url" type="url" name="website_url" placeholder="https://..." className={inputClass} />
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
        {isPending ? "Wird eingereicht..." : "Ort einreichen"}
      </button>
    </form>
  );
}
