"use client";

import { useActionState } from "react";
import { useState } from "react";
import type { Host } from "@/lib/types";
import { updateProfile } from "@/app/actions/update-profile";

interface ProfileEditorFullProps {
  host: Host;
}

export function ProfileEditorFull({ host }: ProfileEditorFullProps) {
  const initialState: { error: string | null; success: string | null } = { error: null, success: null };
  const [state, formAction, isPending] = useActionState(updateProfile, initialState);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(host.avatar_url);

  const socialLinks = (host.social_links || {}) as Record<string, string>;

  return (
    <form action={formAction} className="space-y-6">
      {/* Avatar */}
      <div>
        <label className="mb-2 block text-sm font-medium text-text-secondary">Profilbild</label>
        <div className="flex items-center gap-4">
          {avatarPreview ? (
            <img src={avatarPreview} alt="" className="h-20 w-20 rounded-full object-cover" />
          ) : (
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-accent-sage/20 text-2xl font-bold text-accent-sage">
              {host.name.charAt(0)}
            </div>
          )}
          <input
            type="file"
            name="avatar"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) setAvatarPreview(URL.createObjectURL(file));
            }}
            className="text-sm text-text-secondary file:mr-3 file:rounded-lg file:border-0 file:bg-bg-secondary file:px-3 file:py-2 file:text-sm file:font-medium file:text-text-primary hover:file:bg-border"
          />
        </div>
      </div>

      {/* Name */}
      <div>
        <label htmlFor="name" className="mb-1 block text-sm text-text-secondary">Name</label>
        <input
          id="name"
          name="name"
          type="text"
          required
          defaultValue={host.name}
          className="w-full rounded-xl border border-border bg-bg-primary px-3 py-2.5 text-sm text-text-primary outline-none focus:border-accent-sage"
        />
      </div>

      {/* City / Region */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="city" className="mb-1 block text-sm text-text-secondary">Stadt</label>
          <input
            id="city"
            name="city"
            type="text"
            defaultValue={host.city || ""}
            className="w-full rounded-xl border border-border bg-bg-primary px-3 py-2.5 text-sm text-text-primary outline-none focus:border-accent-sage"
            placeholder="z.B. Hamburg"
          />
        </div>
        <div>
          <label htmlFor="region" className="mb-1 block text-sm text-text-secondary">Region</label>
          <input
            id="region"
            name="region"
            type="text"
            defaultValue={host.region || ""}
            className="w-full rounded-xl border border-border bg-bg-primary px-3 py-2.5 text-sm text-text-primary outline-none focus:border-accent-sage"
            placeholder="z.B. Schleswig-Holstein"
          />
        </div>
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="mb-1 block text-sm text-text-secondary">Beschreibung</label>
        <textarea
          id="description"
          name="description"
          maxLength={2000}
          rows={6}
          defaultValue={host.description || ""}
          className="w-full rounded-xl border border-border bg-bg-primary px-3 py-2.5 text-sm text-text-primary outline-none focus:border-accent-sage"
          placeholder="Erzähle etwas über dich und deine Arbeit..."
        />
      </div>

      {/* Website */}
      <div>
        <label htmlFor="website_url" className="mb-1 block text-sm text-text-secondary">Website</label>
        <input
          id="website_url"
          name="website_url"
          type="url"
          defaultValue={host.website_url || ""}
          className="w-full rounded-xl border border-border bg-bg-primary px-3 py-2.5 text-sm text-text-primary outline-none focus:border-accent-sage"
          placeholder="https://..."
        />
      </div>

      {/* Contact Email */}
      <div>
        <label htmlFor="email" className="mb-1 block text-sm text-text-secondary">Kontakt-E-Mail</label>
        <input
          id="email"
          name="email"
          type="email"
          defaultValue={host.email || ""}
          className="w-full rounded-xl border border-border bg-bg-primary px-3 py-2.5 text-sm text-text-primary outline-none focus:border-accent-sage"
          placeholder="kontakt@example.com"
        />
        <p className="mt-1 text-xs text-text-muted">Wird auf deinem Profil angezeigt (nicht deine Login-E-Mail).</p>
      </div>

      {/* Telegram */}
      <div>
        <label htmlFor="telegram_username" className="mb-1 block text-sm text-text-secondary">Telegram Username</label>
        <input
          id="telegram_username"
          name="telegram_username"
          type="text"
          defaultValue={host.telegram_username || ""}
          className="w-full rounded-xl border border-border bg-bg-primary px-3 py-2.5 text-sm text-text-primary outline-none focus:border-accent-sage"
          placeholder="@username"
        />
      </div>

      {/* Social Links */}
      <fieldset>
        <legend className="mb-2 text-sm font-medium text-text-secondary">Social Links</legend>
        <div className="space-y-3">
          {(["instagram", "facebook", "linkedin", "youtube"] as const).map((platform) => (
            <div key={platform}>
              <label htmlFor={`social_${platform}`} className="mb-1 block text-xs text-text-muted capitalize">
                {platform}
              </label>
              <input
                id={`social_${platform}`}
                name={`social_${platform}`}
                type="url"
                defaultValue={socialLinks[platform] || ""}
                className="w-full rounded-xl border border-border bg-bg-primary px-3 py-2.5 text-sm text-text-primary outline-none focus:border-accent-sage"
                placeholder={`https://${platform}.com/...`}
              />
            </div>
          ))}
        </div>
      </fieldset>

      {/* Status Messages */}
      {state?.error ? (
        <p className="rounded-xl border border-error-border bg-error-bg px-3 py-2 text-sm text-error-text">
          {state.error}
        </p>
      ) : null}
      {state?.success ? (
        <p className="rounded-xl border border-success-border bg-success-bg px-3 py-2 text-sm text-success-text">
          {state.success}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isPending}
        className="rounded-xl bg-accent-primary px-6 py-2.5 text-sm font-semibold text-white transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isPending ? "Speichern..." : "Profil speichern"}
      </button>
    </form>
  );
}
