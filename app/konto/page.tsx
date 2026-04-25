import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ACCESS_COOKIE } from "@/lib/auth-cookies";
import { getUserFromAccessToken } from "@/lib/auth-server";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";

export default async function KontoPage() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_COOKIE)?.value;
  if (!accessToken) redirect("/auth?next=/konto");

  const { user } = await getUserFromAccessToken(accessToken);
  if (!user) redirect("/auth?next=/konto");

  const supabase = getSupabaseAdminClient();

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
