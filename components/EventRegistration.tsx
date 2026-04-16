"use client";

import { useActionState, useState, useEffect } from "react";
import Link from "next/link";
import { registerForEvent, type RegisterResult } from "@/app/actions/register-event";
import { createBrowserClient } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

const initialState: RegisterResult = { success: false, message: "" };

const inputClass =
  "w-full rounded-xl border border-border bg-bg-card px-4 py-3 text-text-primary placeholder:text-text-muted focus:border-accent-primary focus:outline-none focus:ring-1 focus:ring-accent-primary";

interface Props {
  eventId: string;
  eventTitle: string;
  eventSlug: string;
  capacity: number | null;
  confirmedCount: number;
  waitlistEnabled: boolean;
  registrationEnabled: boolean;
  priceModel: string | null;
  priceAmount: string | null;
}

export function EventRegistration({
  eventId,
  eventTitle,
  eventSlug,
  capacity,
  confirmedCount,
  waitlistEnabled,
  registrationEnabled,
  priceModel,
  priceAmount,
}: Props) {
  const [state, formAction, isPending] = useActionState(registerForEvent, initialState);

  // Auth state
  const [user, setUser] = useState<User | null>(null);
  const [showLogin, setShowLogin] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [isSendingLink, setIsSendingLink] = useState(false);
  const [linkSent, setLinkSent] = useState(false);
  const [loginError, setLoginError] = useState("");

  useEffect(() => {
    const supabase = createBrowserClient();
    supabase.auth.getUser().then(({ data }) => setUser(data.user ?? null));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleMagicLink = async () => {
    if (!loginEmail || !loginEmail.includes("@")) {
      setLoginError("Bitte gib eine gültige E-Mail-Adresse ein.");
      return;
    }
    setIsSendingLink(true);
    setLoginError("");
    const supabase = createBrowserClient();
    const { error } = await supabase.auth.signInWithOtp({
      email: loginEmail,
      options: {
        emailRedirectTo: `${window.location.origin}/events/${eventSlug}#anmeldung`,
      },
    });
    if (error) {
      setLoginError("Fehler beim Senden. Bitte versuche es erneut.");
    } else {
      setLinkSent(true);
    }
    setIsSendingLink(false);
  };

  const isFull = capacity !== null && confirmedCount >= capacity;
  const spotsLeft = capacity !== null ? Math.max(0, capacity - confirmedCount) : null;

  if (!registrationEnabled) return null;

  if (state.success) {
    return (
      <div className={`rounded-2xl border p-6 text-center ${
        state.status === "waitlisted"
          ? "border-amber-300/30 bg-amber-50"
          : "border-accent-sage/30 bg-accent-sage/10"
      }`}>
        <p className="text-lg font-medium text-text-primary">{state.message}</p>
        {state.status === "waitlisted" && (
          <p className="mt-2 text-sm text-text-secondary">
            Wir melden uns per E-Mail, sobald ein Platz frei wird.
          </p>
        )}
      </div>
    );
  }

  // Preis formatieren
  const priceDisplay = (() => {
    if (!priceModel || priceModel === "free") return "Kostenlos";
    const amount = priceAmount || "";
    const hasEuro = amount.includes("€") || amount.includes("EUR");
    const formatted = hasEuro ? amount : `${amount} €`;
    const suffix = priceModel === "donation" ? " · Spendenbasis"
      : priceModel === "sliding_scale" ? " · Staffelpreis"
      : "";
    return `${formatted}${suffix}`;
  })();

  return (
    <div id="anmeldung" className="rounded-2xl border border-border bg-bg-card p-6 shadow-sm">
      <h2 className="font-serif text-xl font-semibold text-text-primary mb-3">
        {isFull && waitlistEnabled ? "Auf die Warteliste" : "Jetzt anmelden"}
      </h2>

      {/* Kapazität + Preis */}
      <div className="flex items-center gap-3 mb-4 text-sm">
        {capacity !== null && (
          <div className="flex-1">
            {isFull ? (
              <span className="font-medium text-amber-600">Ausgebucht</span>
            ) : (
              <span className="text-text-secondary">
                {spotsLeft === 1 ? "Noch 1 Platz" : `Noch ${spotsLeft} Plätze`}
              </span>
            )}
            <div className="mt-1 h-1.5 rounded-full bg-bg-secondary overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  isFull ? "bg-red-400" : spotsLeft !== null && spotsLeft <= 3 ? "bg-amber-400" : "bg-accent-sage"
                }`}
                style={{ width: `${Math.min(100, (confirmedCount / capacity) * 100)}%` }}
              />
            </div>
          </div>
        )}
        <span className="font-medium text-text-primary whitespace-nowrap">{priceDisplay}</span>
      </div>

      {/* Wenn voll und keine Warteliste */}
      {isFull && !waitlistEnabled ? (
        <p className="text-center text-sm text-text-muted py-4">
          Leider keine Plätze mehr verfügbar.
        </p>
      ) : user ? (
        /* Eingeloggt — One-Click Registration */
        <div className="space-y-3">
          <p className="text-sm text-text-secondary">
            Angemeldet als <strong>{user.email}</strong>
          </p>
          <form action={formAction}>
            <input type="hidden" name="event_id" value={eventId} />
            <input type="hidden" name="email" value={user.email || ""} />
            <input type="hidden" name="name" value={user.user_metadata?.name || user.email?.split("@")[0] || ""} />
            <div className="hidden" aria-hidden="true">
              <input type="text" name="website_url_confirm" tabIndex={-1} autoComplete="off" />
            </div>

            {state.message && !state.success && (
              <p className="mb-3 text-sm text-red-600">{state.message}</p>
            )}

            <button
              type="submit"
              disabled={isPending}
              className="w-full rounded-xl bg-accent-primary px-6 py-3.5 text-base font-semibold text-white shadow-md transition hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-accent-primary focus:ring-offset-2 disabled:opacity-60"
            >
              {isPending
                ? "Wird angemeldet..."
                : isFull && waitlistEnabled
                  ? "Auf die Warteliste setzen"
                  : "Platz sichern"}
            </button>
          </form>
        </div>
      ) : (
        /* Nicht eingeloggt — Login-Button + Gast-Form */
        <>
          {/* Login Block */}
          <div className="space-y-3 mb-4">
            {linkSent ? (
              <div className="rounded-xl bg-accent-sage/10 p-4 text-center">
                <p className="text-sm font-medium text-accent-sage">
                  Login-Link wurde gesendet!
                </p>
                <p className="mt-1 text-xs text-text-secondary">
                  Prüfe dein E-Mail-Postfach und klicke auf den Link.
                </p>
              </div>
            ) : showLogin ? (
              <div className="space-y-3 rounded-xl bg-bg-secondary p-4">
                <input
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="Deine E-Mail"
                  autoComplete="email"
                  className={inputClass}
                  onKeyDown={(e) => e.key === "Enter" && handleMagicLink()}
                />
                {loginError && (
                  <p className="text-sm text-red-600">{loginError}</p>
                )}
                <button
                  type="button"
                  onClick={handleMagicLink}
                  disabled={isSendingLink}
                  className="w-full rounded-xl bg-accent-primary px-6 py-3 text-base font-semibold text-white transition hover:brightness-110 disabled:opacity-60"
                >
                  {isSendingLink ? "Link wird gesendet..." : "Magic Link senden"}
                </button>
                <p className="text-xs text-text-muted text-center">
                  Du bekommst einen Login-Link per E-Mail.
                </p>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowLogin(true)}
                className="w-full rounded-xl border-2 border-accent-primary bg-transparent px-6 py-3 text-base font-semibold text-accent-primary transition hover:bg-accent-primary hover:text-white"
              >
                Mit E-Mail einloggen
              </button>
            )}

            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-border" />
              <span className="text-xs text-text-muted">oder als Gast</span>
              <div className="h-px flex-1 bg-border" />
            </div>
          </div>

          {/* Gast-Form */}
          <form action={formAction} className="space-y-3">
            <div className="hidden" aria-hidden="true">
              <input type="text" name="website_url_confirm" tabIndex={-1} autoComplete="off" />
            </div>
            <input type="hidden" name="event_id" value={eventId} />

            <input
              type="email"
              name="email"
              required
              placeholder="Deine E-Mail"
              autoComplete="email"
              className={inputClass}
            />

            <input
              type="text"
              name="name"
              required
              minLength={2}
              placeholder="Dein Name"
              autoComplete="name"
              className={inputClass}
            />

            {state.message && !state.success && (
              <p className="text-sm text-red-600">{state.message}</p>
            )}

            <button
              type="submit"
              disabled={isPending}
              className="w-full rounded-xl bg-accent-primary px-6 py-3.5 text-base font-semibold text-white shadow-md transition hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-accent-primary focus:ring-offset-2 disabled:opacity-60"
            >
              {isPending
                ? "Wird angemeldet..."
                : isFull && waitlistEnabled
                  ? "Auf die Warteliste setzen"
                  : "Platz sichern"}
            </button>

            <p className="text-xs text-text-muted text-center">
              Mit der Anmeldung akzeptierst du unsere{" "}
              <Link href="/datenschutz" className="underline" target="_blank">
                Datenschutzerklärung
              </Link>.
            </p>
          </form>
        </>
      )}
    </div>
  );
}
