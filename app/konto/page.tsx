import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ACCESS_COOKIE } from "@/lib/auth-cookies";
import { getUserFromAccessToken } from "@/lib/auth-server";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";

const CLAIM_ERROR_COPY: Record<string, { heading: string; body: string }> = {
  email_mismatch: {
    heading: "E-Mail-Adresse passt nicht zum Eintrag",
    body: "Der Magic-Link wurde an eine andere E-Mail-Adresse als die im Eintrag hinterlegte gesendet. Melde dich bitte unter lb@justclose.de, wenn du der/die rechtmäßige Inhaber:in bist.",
  },
  invalid_token: {
    heading: "Übernahme nicht möglich",
    body: "Der Übernahme-Link ist nicht mehr gültig. Bitte fordere einen neuen an oder kontaktiere uns unter lb@justclose.de.",
  },
  missing_email: {
    heading: "Übernahme nicht möglich",
    body: "Wir konnten deine E-Mail-Adresse nicht aus dem Login auslesen. Versuche es erneut oder kontaktiere uns.",
  },
};

const CLAIMED_COPY: Record<string, string> = {
  event: "Du hast den Event-Eintrag erfolgreich übernommen. Wir melden uns mit den nächsten Schritten.",
  location: "Du hast den Raum-Eintrag erfolgreich übernommen. Wir melden uns mit den nächsten Schritten.",
};

export default async function KontoPage({
  searchParams,
}: {
  searchParams: Promise<{ claimed?: string; claim_error?: string }>;
}) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_COOKIE)?.value;
  if (!accessToken) redirect("/auth?next=/konto");

  const { user } = await getUserFromAccessToken(accessToken);
  if (!user) redirect("/auth?next=/konto");

  const supabase = getSupabaseAdminClient();
  const params = await searchParams;
  const claimError = params.claim_error ? CLAIM_ERROR_COPY[params.claim_error] : null;
  const claimedCopy = params.claimed ? CLAIMED_COPY[params.claimed] : null;

  // Host profile
  const { data: host } = await supabase
    .from("hosts")
    .select("id, name, slug, description")
    .eq("owner_id", user.id)
    .maybeSingle();

  // Stats
  let eventCount = 0;
  let registrationCount = 0;

  if (host) {
    const { count: ec } = await supabase
      .from("events")
      .select("*", { count: "exact", head: true })
      .eq("host_id", host.id);
    eventCount = ec || 0;

    const { count: rc } = await supabase
      .from("event_registrations")
      .select("*, events!inner(host_id)", { count: "exact", head: true })
      .eq("events.host_id", host.id);
    registrationCount = rc || 0;
  }

  // Pending claims
  const { data: pendingClaims } = await supabase
    .from("claim_requests")
    .select("id")
    .eq("user_id", user.id)
    .eq("status", "pending");

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <section className="rounded-2xl border border-border bg-bg-card p-6">
        <p className="text-text-secondary">Eingeloggt als</p>
        <p className="text-lg font-medium text-text-primary">{user.email}</p>
      </section>

      {claimedCopy ? (
        <section className="rounded-2xl border border-success-border bg-success-bg p-5">
          <p className="font-medium text-success-text">Übernahme erfolgreich</p>
          <p className="mt-1 text-sm text-success-text">{claimedCopy}</p>
        </section>
      ) : null}

      {claimError ? (
        <section className="rounded-2xl border border-error-border bg-error-bg p-5">
          <p className="font-medium text-error-text">{claimError.heading}</p>
          <p className="mt-1 text-sm text-error-text">{claimError.body}</p>
        </section>
      ) : null}

      {/* Pending Claims */}
      {pendingClaims && pendingClaims.length > 0 ? (
        <section className="rounded-2xl border border-accent-sage/30 bg-accent-sage/5 p-5">
          <p className="font-medium text-text-primary">Offene Profil-Anfrage</p>
          <p className="mt-1 text-sm text-text-secondary">
            Deine Anfrage wird geprüft. Wir melden uns in Kürze bei dir.
          </p>
        </section>
      ) : null}

      {/* Quick Stats */}
      {host ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Link href={`/hosts/${host.slug}`} className="rounded-2xl border border-border bg-bg-card p-5 transition hover:shadow-md">
            <p className="text-sm text-text-muted">Profil</p>
            <p className="mt-1 text-lg font-semibold text-text-primary">{host.name}</p>
            <p className="mt-1 text-xs text-accent-secondary">Profil ansehen &rarr;</p>
          </Link>
          <Link href="/konto/anmeldungen" className="rounded-2xl border border-border bg-bg-card p-5 transition hover:shadow-md">
            <p className="text-sm text-text-muted">Anmeldungen</p>
            <p className="mt-1 text-3xl font-bold text-accent-primary">{registrationCount}</p>
          </Link>
          <div className="rounded-2xl border border-border bg-bg-card p-5">
            <p className="text-sm text-text-muted">Events</p>
            <p className="mt-1 text-3xl font-bold text-accent-primary">{eventCount}</p>
          </div>
        </div>
      ) : (
        <section className="rounded-2xl border border-border bg-bg-secondary p-6">
          <p className="font-medium text-text-primary">Noch kein Raumhalter:innen-Profil</p>
          <p className="mt-2 text-sm text-text-secondary">
            Wenn du bereits als Raumhalter:in auf Das Portal gelistet bist, kannst du dein Profil auf deiner Profilseite beanspruchen.
          </p>
          <Link
            href="/hosts"
            className="mt-3 inline-block rounded-full border border-accent-secondary px-4 py-2 text-sm font-semibold text-accent-secondary transition hover:bg-bg-primary"
          >
            Raumhalter:innen durchsuchen
          </Link>
        </section>
      )}
    </div>
  );
}
