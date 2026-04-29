"use client";

import { useActionState, useState } from "react";
import type { Host, HostOffering } from "@/lib/types";
import { updateProfile } from "@/app/actions/update-profile";

interface ProfileEditorFullProps {
  host: Host;
}

export function ProfileEditorFull({ host }: ProfileEditorFullProps) {
  const initialState: { error: string | null; success: string | null } = { error: null, success: null };
  const [state, formAction, isPending] = useActionState(updateProfile, initialState);

  const [avatarPreview, setAvatarPreview] = useState<string | null>(host.avatar_url);
  const [bannerPreview, setBannerPreview] = useState<string | null>(host.banner_url);
  const [tagline, setTagline] = useState(host.tagline || "");
  const [offerings, setOfferings] = useState<HostOffering[]>(host.offerings ?? []);

  const socialLinks = (host.social_links || {}) as Record<string, string>;

  const addOffering = () => {
    if (offerings.length >= 6) return;
    setOfferings([...offerings, { title: "", description: "", price: "" }]);
  };

  const removeOffering = (index: number) => {
    setOfferings(offerings.filter((_, i) => i !== index));
  };

  const updateOffering = (index: number, field: keyof HostOffering, value: string) => {
    const updated = [...offerings];
    updated[index] = { ...updated[index], [field]: value };
    setOfferings(updated);
  };

  return (
    <form action={formAction} className="space-y-8">
      {/* Banner */}
      <div>
        <p className="mb-2 text-sm font-medium text-text-secondary">Banner-Bild</p>
        <div className="group relative overflow-hidden rounded-2xl">
          {bannerPreview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={bannerPreview} alt="" className="h-36 w-full object-cover" />
          ) : (
            <div className="h-36 w-full bg-linear-to-br from-[#E9DACA] via-[#DDD5C8] to-[#C8D5C0]" />
          )}
          <label
            htmlFor="banner-input"
            className="absolute inset-0 flex cursor-pointer items-center justify-center bg-black/25 opacity-0 transition group-hover:opacity-100"
          >
            <span className="rounded-full bg-white/90 px-4 py-2 text-sm font-semibold text-text-primary shadow">
              Banner ändern
            </span>
          </label>
          <input
            id="banner-input"
            type="file"
            name="banner"
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) setBannerPreview(URL.createObjectURL(file));
            }}
          />
        </div>
        <p className="mt-1 text-xs text-text-muted">JPEG, PNG oder WebP · max. 5 MB · Empfohlen: 1200 × 400 px</p>
      </div>

      {/* Avatar */}
      <div>
        <p className="mb-2 text-sm font-medium text-text-secondary">Profilbild</p>
        <div className="flex items-center gap-4">
          {avatarPreview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatarPreview} alt="" className="h-20 w-20 rounded-2xl object-cover shadow-sm" />
          ) : (
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-accent-sage/20 text-2xl font-bold text-accent-sage">
              {host.name.charAt(0)}
            </div>
          )}
          <div>
            <label
              htmlFor="avatar-input"
              className="cursor-pointer rounded-xl border border-border px-4 py-2 text-sm font-medium text-text-secondary transition hover:bg-bg-secondary"
            >
              Bild auswählen
            </label>
            <input
              id="avatar-input"
              type="file"
              name="avatar"
              accept="image/jpeg,image/png,image/webp"
              className="sr-only"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) setAvatarPreview(URL.createObjectURL(file));
              }}
            />
            <p className="mt-1 text-xs text-text-muted">JPEG, PNG oder WebP · max. 5 MB</p>
          </div>
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

      {/* Tagline */}
      <div>
        <label htmlFor="tagline" className="mb-1 block text-sm text-text-secondary">Tagline</label>
        <input
          id="tagline"
          name="tagline"
          type="text"
          maxLength={150}
          value={tagline}
          onChange={(e) => setTagline(e.target.value)}
          className="w-full rounded-xl border border-border bg-bg-primary px-3 py-2.5 text-sm text-text-primary outline-none focus:border-accent-sage"
          placeholder="Ein kurzer Satz, der dich und deine Arbeit beschreibt."
        />
        <p className="mt-1 text-xs text-text-muted">{tagline.length}/150 Zeichen</p>
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

      {/* Angebote */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-text-secondary">
              Angebote <span className="font-normal text-text-muted">({offerings.length}/6)</span>
            </p>
            <p className="text-xs text-text-muted">Werden auf deinem öffentlichen Profil angezeigt.</p>
          </div>
          {offerings.length < 6 ? (
            <button
              type="button"
              onClick={addOffering}
              className="rounded-lg border border-accent-sage px-3 py-1.5 text-xs font-semibold text-accent-sage transition hover:bg-accent-sage/10"
            >
              + Angebot hinzufügen
            </button>
          ) : null}
        </div>

        <div className="space-y-3">
          {offerings.map((offering, i) => (
            <div key={i} className="rounded-xl border border-border bg-bg-secondary p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wide text-text-muted">Angebot {i + 1}</span>
                <button
                  type="button"
                  onClick={() => removeOffering(i)}
                  className="text-xs text-text-muted transition hover:text-text-primary"
                >
                  Entfernen
                </button>
              </div>
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Titel *"
                  value={offering.title}
                  onChange={(e) => updateOffering(i, "title", e.target.value)}
                  maxLength={100}
                  className="w-full rounded-lg border border-border bg-bg-card px-3 py-2 text-sm text-text-primary outline-none focus:border-accent-sage"
                />
                <textarea
                  placeholder="Kurze Beschreibung *"
                  value={offering.description}
                  onChange={(e) => updateOffering(i, "description", e.target.value)}
                  maxLength={300}
                  rows={2}
                  className="w-full rounded-lg border border-border bg-bg-card px-3 py-2 text-sm text-text-primary outline-none focus:border-accent-sage"
                />
                <input
                  type="text"
                  placeholder="Preis (optional, z.B. ab 80 €)"
                  value={offering.price || ""}
                  onChange={(e) => updateOffering(i, "price", e.target.value)}
                  maxLength={50}
                  className="w-full rounded-lg border border-border bg-bg-card px-3 py-2 text-sm text-text-primary outline-none focus:border-accent-sage"
                />
              </div>
            </div>
          ))}

          {offerings.length === 0 ? (
            <p className="rounded-xl border border-dashed border-border p-4 text-center text-sm text-text-muted">
              Noch keine Angebote. Füge bis zu 6 hinzu.
            </p>
          ) : null}
        </div>

        <input type="hidden" name="offerings" value={JSON.stringify(offerings)} />
      </div>

      {/* Contact */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
        </div>
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
        <legend className="mb-3 text-sm font-medium text-text-secondary">Social Links</legend>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {(["instagram", "facebook", "linkedin", "youtube"] as const).map((platform) => (
            <div key={platform}>
              <label htmlFor={`social_${platform}`} className="mb-1 block text-xs capitalize text-text-muted">
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

      {/* Status */}
      {state?.error ? (
        <p className="rounded-xl border border-error-border bg-error-bg px-4 py-3 text-sm text-error-text">
          {state.error}
        </p>
      ) : null}
      {state?.success ? (
        <p className="rounded-xl border border-success-border bg-success-bg px-4 py-3 text-sm text-success-text">
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
