"use client";

import { FormEvent, useState } from "react";
import type { Host } from "@/lib/types";

interface ProfileEditorProps {
  host: Host;
}

export function ProfileEditor({ host }: ProfileEditorProps) {
  const [name, setName] = useState(host.name);
  const [description, setDescription] = useState(host.description || "");
  const [websiteUrl, setWebsiteUrl] = useState(host.website_url || "");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    const res = await fetch("/api/hosts/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: name.trim(),
        description: description.trim() || null,
        website_url: websiteUrl.trim() || null,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Aktualisierung fehlgeschlagen.");
    } else {
      setSuccess("Profil wurde aktualisiert.");
    }
    setIsLoading(false);
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label htmlFor="host-name" className="mb-1 block text-sm text-text-secondary">
          Name
        </label>
        <input
          id="host-name"
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-xl border border-border bg-bg-primary px-3 py-2.5 text-sm text-text-primary outline-none focus:border-accent-sage"
        />
      </div>

      <div>
        <label htmlFor="host-description" className="mb-1 block text-sm text-text-secondary">
          Beschreibung
        </label>
        <textarea
          id="host-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={2000}
          rows={5}
          className="w-full rounded-xl border border-border bg-bg-primary px-3 py-2.5 text-sm text-text-primary outline-none focus:border-accent-sage"
          placeholder="Erzähle etwas über dich und dein Angebot..."
        />
        <p className="mt-1 text-xs text-text-muted">{description.length}/2000 Zeichen</p>
      </div>

      <div>
        <label htmlFor="host-website" className="mb-1 block text-sm text-text-secondary">
          Website
        </label>
        <input
          id="host-website"
          type="url"
          value={websiteUrl}
          onChange={(e) => setWebsiteUrl(e.target.value)}
          className="w-full rounded-xl border border-border bg-bg-primary px-3 py-2.5 text-sm text-text-primary outline-none focus:border-accent-sage"
          placeholder="https://..."
        />
      </div>

      {error ? (
        <p className="rounded-xl border border-error-border bg-error-bg px-3 py-2 text-sm text-error-text">
          {error}
        </p>
      ) : null}

      {success ? (
        <p className="rounded-xl border border-success-border bg-success-bg px-3 py-2 text-sm text-success-text">
          {success}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isLoading}
        className="rounded-xl bg-accent-primary px-6 py-2.5 text-sm font-semibold text-white transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isLoading ? "Speichern..." : "Profil speichern"}
      </button>
    </form>
  );
}
