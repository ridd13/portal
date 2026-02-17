"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { TurnstileField } from "@/components/TurnstileField";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);
    if (!captchaToken) {
      setError("Bitte bestätige das Captcha.");
      setIsLoading(false);
      return;
    }

    const redirectTo =
      typeof window !== "undefined"
        ? `${window.location.origin}/auth/update-password`
        : undefined;

    const response = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        captchaToken,
        redirectTo,
      }),
    });

    const payload = (await response.json()) as { error?: string };
    if (!response.ok) {
      setError(payload.error || "Reset fehlgeschlagen.");
      setIsLoading(false);
      return;
    }

    setSuccess("Wir haben dir einen Link zum Zurücksetzen geschickt.");
    setIsLoading(false);
  };

  return (
    <section className="mx-auto max-w-md rounded-3xl border border-border bg-bg-card p-6 shadow-[0_8px_24px_rgba(44,36,24,0.08)] sm:p-8">
      <h1 className="text-2xl font-semibold text-text-primary">Passwort vergessen</h1>
      <p className="mt-2 text-sm text-text-secondary">
        Gib deine E-Mail-Adresse ein, um einen Reset-Link zu erhalten.
      </p>

      <form onSubmit={onSubmit} className="mt-5 space-y-4">
        <div>
          <label htmlFor="email" className="mb-1 block text-sm text-text-secondary">
            E-Mail
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full rounded-xl border border-border bg-bg-primary px-3 py-2.5 text-sm text-text-primary outline-none focus:border-accent-sage"
          />
        </div>

        {error ? (
          <p className="rounded-xl border border-[#e4b6a8] bg-[#f7e8e2] px-3 py-2 text-sm text-[#7a3f2c]">
            {error}
          </p>
        ) : null}

        {success ? (
          <p className="rounded-xl border border-[#bfd1b0] bg-[#edf5e6] px-3 py-2 text-sm text-[#4b6841]">
            {success}
          </p>
        ) : null}

        <TurnstileField onTokenChange={setCaptchaToken} />

        <button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-xl bg-accent-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isLoading ? "Bitte warten..." : "Reset-Link senden"}
        </button>
      </form>

      <Link
        href="/auth?mode=login"
        className="mt-4 inline-block text-sm font-medium text-accent-secondary hover:underline"
      >
        Zurück zur Anmeldung
      </Link>
    </section>
  );
}
