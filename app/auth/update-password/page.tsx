"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@/lib/supabase";

export default function UpdatePasswordPage() {
  const router = useRouter();
  const supabase = useMemo(() => createBrowserClient(), []);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (password.length < 8) {
      setError("Passwort muss mindestens 8 Zeichen lang sein.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwörter stimmen nicht überein.");
      return;
    }

    setIsLoading(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    if (updateError) {
      setError(updateError.message);
      setIsLoading(false);
      return;
    }

    await fetch("/api/auth/logout", { method: "POST" });

    setSuccess("Passwort aktualisiert. Du wirst zur Anmeldung weitergeleitet.");
    setIsLoading(false);
    setTimeout(() => router.push("/auth?mode=login"), 900);
  };

  return (
    <section className="mx-auto max-w-md rounded-3xl border border-border bg-bg-card p-6 shadow-[0_8px_24px_rgba(44,36,24,0.08)] sm:p-8">
      <h1 className="text-2xl font-semibold text-text-primary">Neues Passwort</h1>
      <p className="mt-2 text-sm text-text-secondary">
        Setze ein neues Passwort für dein Konto.
      </p>

      <form onSubmit={onSubmit} className="mt-5 space-y-4">
        <div>
          <label htmlFor="password" className="mb-1 block text-sm text-text-secondary">
            Neues Passwort
          </label>
          <input
            id="password"
            type="password"
            minLength={8}
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full rounded-xl border border-border bg-bg-primary px-3 py-2.5 text-sm text-text-primary outline-none focus:border-accent-sage"
          />
        </div>

        <div>
          <label
            htmlFor="confirmPassword"
            className="mb-1 block text-sm text-text-secondary"
          >
            Passwort bestätigen
          </label>
          <input
            id="confirmPassword"
            type="password"
            minLength={8}
            required
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            className="w-full rounded-xl border border-border bg-bg-primary px-3 py-2.5 text-sm text-text-primary outline-none focus:border-accent-sage"
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
          className="w-full rounded-xl bg-accent-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isLoading ? "Bitte warten..." : "Passwort speichern"}
        </button>
      </form>
    </section>
  );
}
