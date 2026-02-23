"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { TurnstileField } from "@/components/TurnstileField";

type Mode = "login" | "signup";

export function AuthForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const modeParam = searchParams.get("mode");
  const nextParam = searchParams.get("next");
  const initialMode: Mode = modeParam === "signup" ? "signup" : "login";

  const [mode, setMode] = useState<Mode>(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    setMode(modeParam === "signup" ? "signup" : "login");
    setCaptchaToken(null);
  }, [modeParam]);

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

    if (mode === "login") {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          captchaToken,
        }),
      });

      const payload = (await response.json()) as { error?: string };
      if (!response.ok) {
        setError(payload.error || "Anmeldung fehlgeschlagen.");
        setIsLoading(false);
        return;
      }

      setSuccess("Anmeldung erfolgreich. Du wirst weitergeleitet.");
      router.push(nextParam || "/konto");
      router.refresh();
      return;
    }

    const signupResponse = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        password,
        captchaToken,
        emailRedirectTo:
          typeof window !== "undefined" ? `${window.location.origin}/auth?mode=login` : undefined,
      }),
    });

    const signupPayload = (await signupResponse.json()) as {
      error?: string;
      needsEmailConfirmation?: boolean;
    };
    if (!signupResponse.ok) {
      setError(signupPayload.error || "Registrierung fehlgeschlagen.");
      setIsLoading(false);
      return;
    }

    if (signupPayload.needsEmailConfirmation) {
      setSuccess("Registrierung gestartet. Bitte bestätige deine E-Mail.");
    } else {
      setSuccess("Konto erstellt. Du wirst weitergeleitet.");
      router.push(nextParam || "/konto");
      router.refresh();
    }
    setIsLoading(false);
  };

  return (
    <section className="mx-auto max-w-md rounded-3xl border border-border bg-bg-card p-6 shadow-[0_8px_24px_rgba(44,36,24,0.08)] sm:p-8">
      <div className="mb-5 flex rounded-full bg-bg-secondary p-1">
        <button
          type="button"
          onClick={() => {
            setMode("login");
            setCaptchaToken(null);
          }}
          className={`flex-1 rounded-full px-3 py-2 text-sm font-semibold transition ${
            mode === "login"
              ? "bg-bg-card text-text-primary shadow"
              : "text-text-secondary hover:text-text-primary"
          }`}
        >
          Anmelden
        </button>
        <button
          type="button"
          onClick={() => {
            setMode("signup");
            setCaptchaToken(null);
          }}
          className={`flex-1 rounded-full px-3 py-2 text-sm font-semibold transition ${
            mode === "signup"
              ? "bg-bg-card text-text-primary shadow"
              : "text-text-secondary hover:text-text-primary"
          }`}
        >
          Registrieren
        </button>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
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

        <div>
          <label htmlFor="password" className="mb-1 block text-sm text-text-secondary">
            Passwort
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

        <TurnstileField onTokenChange={setCaptchaToken} />

        <button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-xl bg-accent-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isLoading
            ? "Bitte warten..."
            : mode === "login"
              ? "Anmelden"
              : "Konto erstellen"}
        </button>

        {mode === "login" ? (
          <div className="pt-1 text-center">
            <Link
              href="/auth/reset"
              className="text-sm font-medium text-accent-secondary hover:underline"
            >
              Passwort vergessen?
            </Link>
          </div>
        ) : null}
      </form>
    </section>
  );
}
