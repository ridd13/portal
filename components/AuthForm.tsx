"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { TurnstileField } from "@/components/TurnstileField";

type Mode = "magic-link" | "login" | "signup" | "claim" | "claim-confirm";

export function AuthForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const modeParam = searchParams.get("mode");
  const nextParam = searchParams.get("next");
  const hostSlug = searchParams.get("host");

  const derivedMode: Mode = useMemo(() => {
    if (modeParam === "claim" && hostSlug) return "claim";
    if (modeParam === "claim-confirm" && hostSlug) return "claim-confirm";
    if (modeParam === "signup") return "signup";
    if (modeParam === "login") return "login";
    return "magic-link";
  }, [modeParam, hostSlug]);

  const [mode, setMode] = useState<Mode>(derivedMode);
  const emailParam = searchParams.get("email");
  const [email, setEmail] = useState(emailParam || "");
  const [password, setPassword] = useState("");
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [hostName, setHostName] = useState<string | null>(null);

  // Sync mode when URL changes
  if (mode !== derivedMode) {
    setMode(derivedMode);
    setCaptchaToken(null);
    setError(null);
    setSuccess(null);
  }

  // Fetch host name for claim mode
  useEffect(() => {
    if (!hostSlug || (derivedMode !== "claim" && derivedMode !== "claim-confirm")) return;
    let cancelled = false;

    fetch(`/api/hosts/lookup?slug=${encodeURIComponent(hostSlug)}`)
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled && data.name) setHostName(data.name);
      })
      .catch(() => {
        // ignore
      });

    return () => {
      cancelled = true;
    };
  }, [hostSlug, derivedMode]);

  // Auto-submit claim after callback redirect
  useEffect(() => {
    if (derivedMode !== "claim-confirm" || !hostSlug) return;
    let cancelled = false;

    const submitClaim = async () => {
      setIsLoading(true);
      const res = await fetch("/api/auth/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hostSlug }),
      });
      const data = await res.json();
      if (cancelled) return;

      if (!res.ok) {
        setError(data.error || "Claim-Anfrage fehlgeschlagen.");
      } else if (data.alreadyOwner) {
        setSuccess("Du bist bereits Inhaber:in dieses Profils. Du kannst es jetzt bearbeiten.");
      } else if (data.alreadyPending) {
        setSuccess("Wir prüfen deine Anfrage bereits und melden uns in Kürze. Du kannst dein Konto schon einsehen.");
      } else {
        setSuccess(
          "Deine Anfrage wurde eingereicht! Wir prüfen sie und melden uns in Kürze."
        );
      }
      setIsLoading(false);
    };

    submitClaim();
    return () => {
      cancelled = true;
    };
  }, [derivedMode, hostSlug]);

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

    // Magic Link mode (default + claim)
    if (mode === "magic-link" || mode === "claim") {
      const res = await fetch("/api/auth/magic-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          captchaToken,
          hostSlug: mode === "claim" ? hostSlug : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Magic Link konnte nicht gesendet werden.");
        setIsLoading(false);
        return;
      }

      setSuccess("Magic Link wurde gesendet! Prüfe dein E-Mail-Postfach.");
      setIsLoading(false);
      return;
    }

    // Password login
    if (mode === "login") {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, captchaToken }),
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

    // Signup
    const signupResponse = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        password,
        captchaToken,
        emailRedirectTo:
          typeof window !== "undefined"
            ? `${window.location.origin}/auth?mode=login`
            : undefined,
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

  // Claim-confirm mode — just show status
  if (mode === "claim-confirm") {
    return (
      <section className="mx-auto max-w-md rounded-3xl border border-border bg-bg-card p-6 shadow-[0_8px_24px_rgba(44,36,24,0.08)] sm:p-8">
        <h2 className="text-xl font-semibold text-text-primary">
          Profil beanspruchen{hostName ? `: ${hostName}` : ""}
        </h2>
        {isLoading ? (
          <p className="mt-4 text-text-secondary">Anfrage wird gesendet...</p>
        ) : null}
        {error ? (
          <div className="mt-4 space-y-3">
            <p className="rounded-xl border border-error-border bg-error-bg px-3 py-2 text-sm text-error-text">
              {error}
            </p>
            <Link
              href="/konto"
              className="inline-block rounded-full border border-border px-5 py-2 text-sm font-semibold text-text-secondary transition hover:bg-bg-secondary"
            >
              Zu Mein Konto
            </Link>
          </div>
        ) : null}
        {success ? (
          <div className="mt-4 space-y-3">
            <p className="rounded-xl border border-success-border bg-success-bg px-3 py-2 text-sm text-success-text">
              {success}
            </p>
            <Link
              href="/konto"
              className="inline-block rounded-full bg-accent-primary px-5 py-2 text-sm font-semibold text-white transition hover:brightness-95"
            >
              Zu Mein Konto
            </Link>
          </div>
        ) : null}
      </section>
    );
  }

  const isMagicOrClaim = mode === "magic-link" || mode === "claim";

  return (
    <section className="mx-auto max-w-md rounded-3xl border border-border bg-bg-card p-6 shadow-[0_8px_24px_rgba(44,36,24,0.08)] sm:p-8">
      {/* Claim header */}
      {mode === "claim" && hostName ? (
        <div className="mb-5">
          <h2 className="text-xl font-semibold text-text-primary">
            Beanspruche dein Profil als {hostName}
          </h2>
          <p className="mt-1 text-sm text-text-secondary">
            Wir senden dir einen Magic Link per E-Mail. Damit bestätigst du deine Identität.
          </p>
        </div>
      ) : null}

      {/* Mode tabs (not shown in claim mode) */}
      {mode !== "claim" ? (
        <div className="mb-5 flex rounded-full bg-bg-secondary p-1">
          <button
            type="button"
            onClick={() => {
              setMode("magic-link");
              setCaptchaToken(null);
              setError(null);
              setSuccess(null);
            }}
            className={`flex-1 rounded-full px-3 py-2 text-sm font-semibold transition ${
              mode === "magic-link"
                ? "bg-bg-card text-text-primary shadow"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            Magic Link
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("login");
              setCaptchaToken(null);
              setError(null);
              setSuccess(null);
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
              setError(null);
              setSuccess(null);
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
      ) : null}

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
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-border bg-bg-primary px-3 py-2.5 text-sm text-text-primary outline-none focus:border-accent-sage"
          />
        </div>

        {/* Password field only for login/signup */}
        {!isMagicOrClaim ? (
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
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-border bg-bg-primary px-3 py-2.5 text-sm text-text-primary outline-none focus:border-accent-sage"
            />
          </div>
        ) : null}

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
            : isMagicOrClaim
              ? "Magic Link senden"
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
