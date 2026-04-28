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

      let syncPayload: { access_token: string; refresh_token: string; expires_in?: number } | null = null;

      if (code) {
        // PKCE flow: exchange code for session via @supabase/ssr browser client
        const supabase = createBrowserClient();
        const { data, error } = await supabase.auth.exchangeCodeForSession(code);
        if (error || !data.session) {
          window.location.replace("/auth?error=invalid_code");
          return;
        }
        syncPayload = {
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
          expires_in: data.session.expires_in,
        };
      } else {
        // Implicit flow: admin.generateLink() sends #access_token=… in the URL hash.
        // We do NOT use createBrowserClient() here because @supabase/ssr's PKCE mode
        // rejects implicit-flow hash fragments internally — session never gets saved.
        // Instead, pass the raw tokens to session-sync which validates server-side
        // and sets both @supabase/ssr and portal-access-token cookies in one response.
        const hash = window.location.hash;
        if (hash.includes("access_token")) {
          const hashParams = new URLSearchParams(hash.substring(1));
          const access_token = hashParams.get("access_token");
          const refresh_token = hashParams.get("refresh_token");
          if (!access_token || !refresh_token) {
            window.location.replace("/auth?error=no_session");
            return;
          }
          syncPayload = { access_token, refresh_token };
        } else {
          window.location.replace("/auth?error=no_session");
          return;
        }
      }

      // Sync tokens to server-side cookies (sets both portal-access-token AND @supabase/ssr cookies)
      const syncRes = await fetch("/api/auth/session-sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(syncPayload),
      });

      if (!syncRes.ok) {
        window.location.replace("/auth?error=session_error");
        return;
      }

      const syncData = await syncRes.json();
      const user = syncData.user as { id: string; email: string } | undefined;

      // Handle claim token (auto-claim path from claim/[token] flow)
      if (claimToken) {
        if (!user?.email) {
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
