"use client";

import { Suspense, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { createBrowserClient } from "@/lib/supabase";

function CallbackHandler() {
  const searchParams = useSearchParams();
  const handled = useRef(false);

  useEffect(() => {
    if (handled.current) return;
    handled.current = true;

    async function handle() {
      const code = searchParams.get("code");
      const claimToken = searchParams.get("claim_token");
      const hostSlug = searchParams.get("host");

      const supabase = createBrowserClient();
      let session = null;

      if (code) {
        // PKCE flow: server-issued code in query param
        const { data, error } = await supabase.auth.exchangeCodeForSession(code);
        if (error || !data.session) {
          window.location.replace("/auth?error=invalid_code");
          return;
        }
        session = data.session;
      } else {
        // Implicit flow: supabase-js parses hash fragment (#access_token=…) automatically
        // when detectSessionInUrl is true (default for browser clients)
        const { data } = await supabase.auth.getSession();
        if (!data.session) {
          window.location.replace("/auth?error=no_session");
          return;
        }
        session = data.session;
      }

      // Sync tokens to server-side httpOnly cookies so middleware/SSR can read them
      const syncRes = await fetch("/api/auth/session-sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          access_token: session.access_token,
          refresh_token: session.refresh_token,
          expires_in: session.expires_in,
        }),
      });

      if (!syncRes.ok) {
        window.location.replace("/auth?error=session_error");
        return;
      }

      // Handle claim token (auto-claim path from claim/[token] flow)
      if (claimToken) {
        const user = session.user;
        if (!user.email) {
          window.location.replace("/konto?claim_error=missing_email");
          return;
        }

        const claimRes = await fetch("/api/auth/apply-claim-token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            claimToken,
            userId: user.id,
            userEmail: user.email,
          }),
        });
        const claimData = await claimRes.json();

        if (claimData.kind === "claimed") {
          window.location.replace(
            claimData.type === "host"
              ? "/konto/profil?claimed=1"
              : `/konto?claimed=${claimData.type}`
          );
        } else if (claimData.kind === "email_mismatch") {
          window.location.replace("/konto?claim_error=email_mismatch");
        } else {
          window.location.replace("/konto?claim_error=invalid_token");
        }
        return;
      }

      // Handle host slug (plain magic-link claim confirmation path)
      if (hostSlug) {
        window.location.replace(`/auth?mode=claim-confirm&host=${encodeURIComponent(hostSlug)}`);
        return;
      }

      // Full page navigation so middleware re-runs with the freshly-set cookies
      window.location.replace("/konto");
    }

    handle();
  }, [searchParams]);

  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <p className="text-text-secondary">Anmeldung wird verarbeitet…</p>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[40vh] items-center justify-center">
          <p className="text-text-secondary">Laden…</p>
        </div>
      }
    >
      <CallbackHandler />
    </Suspense>
  );
}
